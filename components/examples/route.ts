import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { tavily as createTavilyClient } from "@tavily/core";
import NodeCache from "node-cache";

// Use the Node runtime (node-cache, env access, etc.)
export const runtime = "nodejs";

// Clients read API keys from env
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});
const tavily = createTavilyClient({ apiKey: process.env.TAVILY_API_KEY || "" });
const GEMINI_MODEL =
  process.env.GEMINI_MODEL || process.env.GROQ_MODEL || "gemini-2.0-flash";

// Cache chat history for 24 hours
const conversationCache = new NodeCache({ stdTTL: 60 * 60 * 24 });

// Tool: web search via Tavily
async function webSearch({ query }: { query: string }) {
  console.log("Tool Called: webSearch with query:", query);
  try {
    // Core SDK accepts a plain query string
    const response = await tavily.search(query);

    // Flatten results so the model can read them easily
    const finalResult = response.results
      .map((result) => `Title: ${result.title}\nContent: ${result.content}`)
      .join("\n\n");

    return finalResult;
  } catch (error) {
    console.error("Error in webSearch tool:", error);
    return "Error occurred while searching the web.";
  }
}

// POST /api/chat — handles user message, optional tool calls, and returns the reply
export async function POST(req: NextRequest) {
  try {
    // Sanity check: Gemini key must be present
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: GEMINI_API_KEY is missing." },
        { status: 500 }
      );
    }

    // Tavily is optional (only needed when the model decides to search)
    const tavilyConfigured = Boolean(process.env.TAVILY_API_KEY);

    const { message, threadId } = await req.json();

    if (!message || !threadId) {
      return NextResponse.json(
        { error: "Message and threadId are required" },
        { status: 400 }
      );
    }

    // System prompt and tool definition
    const systemPrompt = `
      You are a smart personal assistant. who can answer regarding anything intelligently, professionally and in wiser and devious manner. You always have to act like a human. To Feel the other person that they're talking with human not ai.
      If you know the answer to a question, answer it directly in plain English.
      If the answer requires real-time, local, or up-to-date information, or if you don’t know the answer, use the available tools to find it.
      You have access to the following tool:
      webSearch(query: string): Use this to search the internet for current or unknown information.
      Decide when to use your own knowledge and when to use the tool.
      Do not mention the tool unless needed.

      Examples:
      Q: What is the capital of France?
      A: The capital of France is Paris.

      Q: What’s the weather in Bihar right now?
      A: (use the search tool to find the latest weather)

      Q: Tell me the latest IT news.
      A: (use the search tool to get the latest news)

      Note: One more thing you will have to keep it in mind like whatever I ask even though it is a single word, or single character you will have to Answer that.
      Example: hi, oh, ok yep

      current date and time: ${new Date().toUTCString()}
    `;

    const tools = [
      {
        type: "function" as const,
        function: {
          name: "webSearch",
          description:
            "Search the internet for the latest information and real-time data.",
          parameters: {
            type: "object" as const,
            properties: {
              query: {
                type: "string",
                description: "The search query to perform.",
              },
            },
            required: ["query"],
          },
        },
      },
    ];

    // Restore history from cache or start fresh
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      conversationCache.get(threadId) || [
        { role: "system", content: systemPrompt },
      ];

    messages.push({ role: "user", content: message });

    // Let the model call tools; cap steps to avoid loops
    const MAX_TOOL_STEPS = 5;
    let steps = 0;
    while (steps < MAX_TOOL_STEPS) {
      steps += 1;
      let completion;
      try {
        completion = await openai.chat.completions.create({
          model: GEMINI_MODEL,
          messages: messages,
          tools: tools,
          tool_choice: "auto",
          temperature: 0,
        });
      } catch (err: any) {
        const code = err?.error?.code || err?.code;
        if (code === "tool_use_failed") {
          // Giving the model one more chance with explicit guidance
          messages.push({
            role: "system",
            content:
              'Your last tool call failed due to invalid JSON. Try again and ensure arguments strictly match { "query": string } with no extra characters.',
          });
          completion = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: messages,
            tools: tools,
            tool_choice: "auto",
            temperature: 0,
          });
        } else {
          throw err;
        }
      }

      const assistantMessage = completion.choices[0].message;
      messages.push(assistantMessage);

      // No tool calls? We’re done for this turn
      if (!assistantMessage.tool_calls) {
        // Save history and return the answer
        conversationCache.set(threadId, messages);
        return NextResponse.json({ message: assistantMessage.content });
      }

      // Process tool calls
      const toolCalls = assistantMessage.tool_calls || [];
      for (const toolCall of toolCalls) {
        if (
          toolCall.type !== "function" ||
          !("function" in toolCall) ||
          !toolCall.function
        )
          continue;
        const functionName = toolCall.function.name;

        if (functionName === "webSearch") {
          let functionArgs: { query?: string } = {};
          try {
            functionArgs = JSON.parse(toolCall.function.arguments);
          } catch (_e) {
            const raw = toolCall.function.arguments || "";
            const m = raw.match(/"query"\s*:\s*"([^"]+)"/);
            if (m) functionArgs.query = m[1];
          }
          if (!functionArgs.query) {
            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              content:
                "Error: webSearch was called without a valid { query: string } argument.",
            });
            continue;
          }
          // If Tavily isn't configured, return a helpful note
          const toolResult = tavilyConfigured
            ? await webSearch(functionArgs as { query: string })
            : "Web search isn't available because TAVILY_API_KEY is not configured on the server.";

          // Add tool result to the transcript
          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: toolResult,
          });
        }
      }
      // Loop continues with the new tool outputs
    }

    // Safety net: too many steps
    conversationCache.set(threadId, messages);
    return NextResponse.json({
      message:
        "I couldn't complete the request with the available tools. Please try again or rephrase your question.",
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
