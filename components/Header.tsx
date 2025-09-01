"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FiMessageSquare } from "react-icons/fi";

const Header = () => {
  return (
    <header className="sticky top-0 z-[99] py-4 max-md:px-4 border-b border-white/10 backdrop-blur-sm">
      <div className="max-w-screen-lg mx-auto flex items-center justify-between">
        <Link
          href="https://www.mojasim.com"
          target="_blank"
          className="flex items-center gap-2"
        >
          <Image
            src="/JasimImg.png"
            alt="Mo-Jasim"
            width={300}
            height={200}
            className="w-8 h-8 rounded-full object-cover"
          />

          <div className="text-[18px] font-[600] text-white cursor-pointer max-sm:text-[16px]">
            Mo~Jasim
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-105 cursor-pointer"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("reset-chat"));
              }
            }}
            title="Start a new chat"
          >
            <FiMessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-xs md:text-sm font-medium hidden sm:inline">
              New Chat
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
