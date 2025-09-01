import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiSearch, FiUser, FiCpu, FiArrowLeft } from "react-icons/fi";
import { ShineBorder } from "../magicui/shine-border";
import ShinyText from "./ShinyText";
import Link from "next/link";

interface ChatMessage {
  id: number;
  content: string;
  isUser: boolean;
}

interface ChatInputProps {
  onMessagesChange?: (hasMessages: boolean) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onMessagesChange }) => {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  const [threadId, setThreadId] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inflightTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const newThreadId =
      Date.now().toString(36) + Math.random().toString(36).substring(2);
    setThreadId(newThreadId);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    onMessagesChange?.(chatMessages.length > 0);
  }, [chatMessages.length, onMessagesChange]);

  const callChatAPI = async (userMessage: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage, threadId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return `Error: ${errorData.error || "Something went wrong"}`;
      }

      const result = await response.json();
      return result.message;
    } catch (error) {
      console.error("Failed to fetch chat response:", error);
      return "Error: Could not connect to the server.";
    }
  };

  const resetChat = () => {
    inflightTokenRef.current = null;
    setChatMessages([]);
    setMessage("");
    setIsLoading(false);
    setShowBackButton(false);
    const newThreadId =
      Date.now().toString(36) + Math.random().toString(36).substring(2);
    setThreadId(newThreadId);
    onMessagesChange?.(false);
  };

  // Listen for global reset events (dispatched by Header Share button)
  useEffect(() => {
    const handler = () => resetChat();
    if (typeof window !== "undefined") {
      window.addEventListener("reset-chat", handler as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("reset-chat", handler as EventListener);
      }
    };
  }, []);

  // Submit a message (used by form submit and example buttons)
  const submitMessage = async (userMessageContent: string) => {
    const trimmed = userMessageContent.trim();
    if (!trimmed || isLoading) return;

    // Append the user's message
    const newUserMessage: ChatMessage = {
      id: Date.now(),
      content: trimmed,
      isUser: true,
    };
    setChatMessages((prev) => [...prev, newUserMessage]);
    setMessage("");
    setIsLoading(true);
    setShowBackButton(true);

    // Call the API and keep a token so we can ignore stale responses
    const token =
      Date.now().toString(36) + Math.random().toString(36).substring(2);
    inflightTokenRef.current = token;
    const aiResponseContent = await callChatAPI(trimmed);

    // Append the AI response if this request is still current
    if (inflightTokenRef.current === token) {
      const aiResponseMessage: ChatMessage = {
        id: Date.now() + 1,
        content: aiResponseContent,
        isUser: false,
      };
      setChatMessages((prev) => [...prev, aiResponseMessage]);
      setIsLoading(false);
      inflightTokenRef.current = null;
    }
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMessage(message);
  };

  // example question
  const handleExampleClick = (question: string) => {
    setMessage(question);
    submitMessage(question);
  };

  const exampleQuestions = [
    "What is current weather?",
    "Which LLM you're?",
    "Explain rag?",
    "who are you?",
    "who mohammad jasim?",
    "what is AI?",
    "who is Elon Musk?",
    "what is next js?",
    "What is tool calling?",
  ];

  const hasMessages = chatMessages.length > 0;

  return (
    <>
      {hasMessages && (
        <div className="flex-1 h-full overflow-y-auto scrollbar-hide mb-20">
          {/* Back button */}
          {showBackButton && (
            <div className="max-w-screen-lg mx-auto mb-3 px-2 max-md:pl-6">
              <button
                type="button"
                onClick={resetChat}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          )}

          {/* Ai & User tag */}
          <div className="max-w-screen-lg mx-auto space-y-6 max-md:px-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.isUser ? "justify-end" : "justify-start"
                }`}
              >
                {/* {!msg.isUser && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                    <FiCpu className="w-4 h-4 text-white" />
                  </div>
                )} */}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    msg.isUser
                      ? "bg-white/10 text-white shadow-lg border border-white/20"
                      : "px-0"
                  }`}
                >
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                </div>
                {/* {msg.isUser && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                    <FiUser className="w-4 h-4 text-white" />
                  </div>
                )} */}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <div className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shadow-lg">
                  <FiCpu className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 shadow-lg">
                  <ShinyText
                    text="Thinking..."
                    disabled={false}
                    speed={3}
                    className="custom-class text-[16px] font-medium text-center"
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Chat input */}
      <div className="w-full">
        <form
          onSubmit={handleSubmit}
          className="max-w-screen-lg mx-auto fixed bottom-0 max-md:bottom-6 left-0 right-0 flex flex-col max-md:px-4 bg-[#0A0A0A]"
        >
          <div className="flex items-center gap-2 md:gap-3 py-3 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl hover:bg-white/15 hover:border-white/30 transition-all duration-300 relative">
            <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
            <button
              type="button"
              className="shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={isLoading}
            >
              <FiSearch className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                hasMessages
                  ? "Continue the conversation..."
                  : "Write a message here..."
              }
              className="flex-1 bg-transparent text-white placeholder-gray-400 border-0 outline-0 px-2 py-2 text-sm md:text-base focus:placeholder-gray-500 transition-colors duration-200"
              autoFocus
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="shrink-0 p-2 md:p-3 rounded-full bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:hover:scale-100 hover:shadow-lg hover:shadow-white/20"
            >
              <FiSend className="w-4 h-4 md:w-5 md:h-5 text-black" />
            </button>
          </div>

          <Link
            href="https://www.mojasim.com"
            target="_blank"
            className="block text-center text-sm text-white/50 hover:text-white max-md:hidden py-3"
          >
            Developed by www.mojasim.com
          </Link>
        </form>

        {/* Example Questions */}
        {!hasMessages && (
          <div className="max-w-screen-lg mx-auto lg:mt-4 max-md:px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:py-2">
              {exampleQuestions.map((question, index) => (
                <button
                  key={question}
                  onClick={() => handleExampleClick(question)}
                  disabled={isLoading}
                  className="group py-3 px-6 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-left"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationDuration: "600ms",
                    animationFillMode: "forwards",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm md:text-base text-gray-300 group-hover:text-white transition-colors duration-300">
                      {question}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatInput;