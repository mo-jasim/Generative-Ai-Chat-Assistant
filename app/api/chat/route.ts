import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { tavily as createTavilyClient } from "@tavily/core";
import NodeCache from "node-cache";
import { searchSimilarDocuments } from "@/lib/vectorStore";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});
const tavily = createTavilyClient({ apiKey: process.env.TAVILY_API_KEY || "" });
const GEMINI_MODEL =
  process.env.GEMINI_MODEL || process.env.GROQ_MODEL || "gemini-2.0-flash";

// Cache chat history for 24 hours
const conversationCache = new NodeCache({ stdTTL: 60 * 60 * 24 });

// web search via Tavily
async function webSearch({ query }: { query: string }) {
  console.log("Tool Called: webSearch with query:", query);
  try {
    const response = await tavily.search(query);

    const finalResult = response.results
      .map((result) => `Title: ${result.title}\nContent: ${result.content}`)
      .join("\n\n");

    return finalResult;
  } catch (error) {
    console.error("Error in webSearch tool:", error);
    return "Error occurred while searching the web.";
  }
}

// search documents in vector store (RAG)
async function searchDocuments({ query }: { query: string }) {
  console.log("Tool Called: searchDocuments with query:", query);
  try {
    const results = await searchSimilarDocuments(query, 4);

    if (results.length === 0) {
      return "No relevant documents found in the knowledge base.";
    }

    const formattedResults = results
      .map((doc, index) => {
        const title =
          doc.metadata.title ||
          doc.metadata.fileName ||
          `Document ${index + 1}`;
        return `Title: ${title}\nContent: ${doc.pageContent}\n---`;
      })
      .join("\n\n");

    return `Found ${results.length} relevant documents:\n\n${formattedResults}`;
  } catch (error) {
    console.error("Error in searchDocuments tool:", error);
    return "Error occurred while searching the knowledge base.";
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: GEMINI_API_KEY is missing." },
        { status: 500 }
      );
    }

    const tavilyConfigured = Boolean(process.env.TAVILY_API_KEY);

    const { message, threadId } = await req.json();

    if (!message || !threadId) {
      return NextResponse.json(
        { error: "Message and threadId are required" },
        { status: 400 }
      );
    }

    const systemPrompt = `
      You are Coder's Gyan Assistant, a smart AI assistant built by Mohammad Jasim specifically for Coder's Gyan Company and it's employees and students. You are designed to be helpful, professional, and human-like in your interactions. And if someone asks Who built you, and which llm you're or Who is your creator, always say that Mohammad Jasim is your creator. Also you will have to say something like I'm primarily built to assist with Coder's Gyan related queries but I can also help with general questions. And you are not required to say that I am a large language model Built by Google. Instead of you can say that I am an AI assistant built by Mohammad Jasim.

      PRIMARY ROLE: 
      You are primarily a Coder's Gyan company assistant. Your main expertise is answering questions about:

      COMPANY KNOWLEDGE (Priority 1):
      - Company policies, procedures, and guidelines
      - HR policies, leave management, and employee benefits  
      - Course development lifecycle and content creation standards
      - YouTube content guidelines and branding requirements
      - Remote work policies and security protocols
      - Team structure, leadership, and reporting hierarchy
      - Student support processes and community rules
      - Technical workflows, code review processes, and QA standards
      - Training programs, referral schemes, and internal events
      - Emergency contacts and escalation procedures

      COMPANY CONTEXT:
      Coder's Gyan is a leading Indian EdTech company founded in 2021, specializing in practical web development education. We have:
      - 30,000+ trained students
      - 100K+ YouTube subscribers  
      - 20+ flagship courses
      - 50+ industry mentors
      - Leadership: CEO Rakesh Kohali, CTO Aditi Sinha, COO Deepak Menon

      SECONDARY ROLE (Priority 2):
      For non-company questions, you can provide general assistance on topics like:
      - Web development and programming concepts
      - Technology trends and industry insights
      - General knowledge and information
      - Current events and real-time information (using web search when needed)

      RESPONSE GUIDELINES:
      1. For Company Questions: Answer confidently using your internal knowledge
      2. For General Questions: Provide helpful responses but acknowledge when you need to search for current information
      3. Communication Style: 
        - Be friendly, professional, and human-like
        - Use simple, clear language
        - Respond to single words/characters naturally (hi, ok, yes, etc.)
        - Never mention you're an AI unless directly asked
        - Act conversational and engaging

      TOOL USAGE:
      You have access to webSearch(query: string) for:
      - Real-time information (weather, current news, stock prices)
      - Recent developments you might not know about
      - Specific factual queries requiring up-to-date data

      EXAMPLES:

      Company Query:
      Q: What's our leave policy?
      A: At Coder's Gyan, we have several types of leave: 12 casual leaves per year (accumulates up to 24), 6 sick leaves (requires medical certificate if more than 3 days), 6 privilege leaves, plus maternity (26 weeks), paternity (7 days), and bereavement leave (5 days). All applications go through the Zoho HR portal...

      General Query:
      Q: What's the weather in Delhi today?
      A: (use webSearch to get current weather information)

      Simple Response:
      Q: Hi
      A: Hey there! Its Coder's Gyan Assistant How can I help you today?

      IMPORTANT NOTES:
      - Always prioritize Coder's Gyan related queries with detailed, accurate responses
      - For general questions, be helpful but concise unless more detail is requested  
      - Use web search only when you genuinely need current/real-time information
      - Maintain confidentiality - never share sensitive company information inappropriately
      - Remember you're representing Coder's Gyan's helpful, student-first culture

      Note: If a question is asked that you don't know the answer to, admit it honestly rather than making something up. And whatever user ask question related to Coder's Gyan, answer them in detail By checking it from the PDF and if answer does not belongs to Tulip then you can answer From the outer Internet. But make sure you are checking the PDF first that answer is related to the Coder's Gyan or not if it is not then you can answer from the outer internet. And do not produce answers with symbols like(*, ^, #, **Example Data**, asterisk Instead of use bullet points when it is required because you are never ever required to use asterisk). 

      Current date and time: ${new Date().toUTCString()}
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
      {
        type: "function" as const,
        function: {
          name: "searchDocuments",
          description:
            "Search through uploaded documents and knowledge base for relevant information. Use this for questions about company policies, manuals, uploaded documents, or any content that might be in the knowledge base.",
          parameters: {
            type: "object" as const,
            properties: {
              query: {
                type: "string",
                description: "The search query to find relevant documents.",
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
        const message = err?.error?.message || err?.message || "";
        if (
          code === "tool_use_failed" ||
          message.includes("Failed to call a function")
        ) {
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
        } else if (
          err?.status === 400 ||
          String(message).toLowerCase().includes("invalid")
        ) {
          messages.push({
            role: "system",
            content:
              "Tool calling appears to be unavailable. Answer the user directly without calling any tools. If unsure, say so and mention that real-time info may be outdated.",
          });
          completion = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: messages,
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
        conversationCache.set(threadId, messages);
        return NextResponse.json({ message: assistantMessage.content });
      }

      const toolCalls = assistantMessage.tool_calls || [];
      for (const toolCall of toolCalls) {
        if (
          toolCall.type !== "function" ||
          !("function" in toolCall) ||
          !toolCall.function
        ) {
          continue;
        }
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
          const toolResult = tavilyConfigured
            ? await webSearch(functionArgs as { query: string })
            : "Web search isn't available because TAVILY_API_KEY is not configured on the server.";

          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: toolResult,
          });
        } else if (functionName === "searchDocuments") {
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
                "Error: searchDocuments was called without a valid { query: string } argument.",
            });
            continue;
          }
          const toolResult = await searchDocuments(
            functionArgs as { query: string }
          );

          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: toolResult,
          });
        }
      }
    }

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
