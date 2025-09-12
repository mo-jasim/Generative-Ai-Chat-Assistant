"use client";
import { useState } from "react";
import Welcome from "../elements/Welcome";
import FeatureSection from "../elements/FeatureSection";
import ChatInput from "../elements/ChatInput";

const ChatBotUI = () => {
  const [hasMessages, setHasMessages] = useState(false);

  const handleMessagesChange = (hasMessages: boolean) => {
    setHasMessages(hasMessages);
  };

  return (
    <div className="flex flex-col py-6">
      <div className="flex-1 overflow-hidden">
        {!hasMessages ? (
          <div className="max-w-screen-xl mx-auto flex flex-col gap-6 text-white max-md:px-6 justify-center max-md:items-center max-md:justify-start mb-10">
            <Welcome />
            <FeatureSection />
          </div>
        ) : null}

        <div className="max-w-screen-xl mx-auto">
          <ChatInput onMessagesChange={handleMessagesChange} />
        </div>
      </div>
    </div>
  );
};

export default ChatBotUI;
