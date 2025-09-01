import React from "react";
import { FiSearch, FiGlobe, FiZap } from "react-icons/fi";

const FeatureSection = () => {
  return (
    <div className="max-w-screen-lg mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-md:hidden">
      <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 group-hover:scale-125 transition-all duration-300 shadow-lg">
          <FiSearch className="w-6 h-6 text-blue-500" />
        </div>

        <h3 className="text-lg md:text-xl font-semibold mb-2 text-white group-hover:text-blue-100 transition-colors duration-300">
          AI Web Search
        </h3>

        <p className="text-gray-400 text-sm leading-relaxed mb-4 group-hover:text-gray-300 transition-colors duration-300">
          Get instant answers from the web with AI-powered search. Ask anything
          and receive accurate, up-to-date information from across the internet.
        </p>
      </div>
      
      <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 group-hover:scale-125 transition-all duration-300 shadow-lg">
          <FiZap className="w-6 h-6 text-green-500" />
        </div>

        <h3 className="text-lg md:text-xl font-semibold mb-2 text-white group-hover:text-green-100 transition-colors duration-300">
          AI Knowledge Assistant
        </h3>

        <p className="text-gray-400 text-sm leading-relaxed mb-4 group-hover:text-gray-300 transition-colors duration-300">
          Leverage advanced AI to solve complex problems, analyze data, and
          provide intelligent insights for any topic or question you have.
        </p>
      </div>
      <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 group-hover:scale-125 transition-all duration-300 shadow-lg">
          <FiGlobe className="w-6 h-6 text-purple-500" />
        </div>

        <h3 className="text-lg md:text-xl font-semibold mb-2 text-white group-hover:text-purple-100 transition-colors duration-300">
          Real-time Information
        </h3>

        <p className="text-gray-400 text-sm leading-relaxed mb-4 group-hover:text-gray-300 transition-colors duration-300">
          Access the latest news, trends, and real-time data from around the
          world. Stay informed with current events and fresh information.
        </p>
      </div>
    </div>
  );
};

export default FeatureSection;
