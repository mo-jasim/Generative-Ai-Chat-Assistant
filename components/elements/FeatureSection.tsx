import React from "react";
import { FiSearch, FiDatabase, FiZap } from "react-icons/fi";

const FeatureSection = () => {
  return (
    <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-md:hidden">
      <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
        <div className="w-15 h-15 rounded-full bg-white flex items-center justify-center mb-4 group-hover:scale-125 transition-all duration-300 shadow-lg">
          <FiSearch className="w-10 h-10 text-blue-500" />
        </div>

        <h3 className="text-xl md:text-xl font-semibold mb-2 text-white group-hover:text-blue-100 transition-colors duration-300">
          AI Web Search
        </h3>

        <p className="text-gray-400 text-md leading-relaxed mb-4 group-hover:text-gray-300 transition-colors duration-300">
          Get instant answers from the web with AI-powered search. Ask anything
          and receive accurate, up-to-date information from across the internet.
        </p>
      </div>

      <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
        <div className="w-15 h-15 rounded-full bg-white flex items-center justify-center mb-4 group-hover:scale-125 transition-all duration-300 shadow-lg">
          <FiDatabase className="w-10 h-10 text-green-500" />
        </div>

        <h3 className="text-xl md:text-xl font-semibold mb-2 text-white group-hover:text-green-100 transition-colors duration-300">
          Company Knowledge Base
        </h3>

        <p className="text-gray-400 text-md leading-relaxed mb-4 group-hover:text-gray-300 transition-colors duration-300">
          Access Coders Gyan's internal documentation, policies, guidelines, and
          procedures. Get instant answers about company rules and benefits.
        </p>
      </div>

      <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
        <div className="w-15 h-15 rounded-full bg-white flex items-center justify-center mb-4 group-hover:scale-125 transition-all duration-300 shadow-lg">
          <FiZap className="w-10 h-10w-10 h-10 text-purple-500" />
        </div>

        <h3 className="text-xl md:text-xl font-semibold mb-2 text-white group-hover:text-purple-100 transition-colors duration-300">
          Smart AI Assistant
        </h3>

        <p className="text-gray-400 text-md leading-relaxed mb-4 group-hover:text-gray-300 transition-colors duration-300">
          Intelligent responses powered by advanced AI. Combines web search,
          company knowledge, and AI reasoning for comprehensive answers.
        </p>
      </div>
    </div>
  );
};

export default FeatureSection;
