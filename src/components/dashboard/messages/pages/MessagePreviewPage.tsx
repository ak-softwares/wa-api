"use client";

import MessageBubble from "@/components/dashboard/messages/common/MessageBubble";
import { Message } from "@/types/Message";

interface MessagePreviewPageProps {
  messages: Message[];   // ✅ plural
}

export default function MessagePreviewPage({ messages }: MessagePreviewPageProps) {
  return (
    <div className="flex justify-center items-center mx-h-[800px] w-[300px] bg-gray-200 dark:bg-[#1F1F1F] border border-[#E5DED6] dark:border-[#2C2C2C] rounded-3xl p-1">
      {/* Mobile phone container */}
      <div className="w-[300px] h-[500px] rounded-3xl shadow-lg flex flex-col overflow-hidden bg-white dark:bg-[#1F1F1F]">
        
        {/* Header */}
        <div className="h-14 flex items-center px-4 bg-gray-100 dark:bg-[#1F1F1F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-600">
                <img
                    src={"/assets/icons/user.svg"}
                    alt={"Unknown"}
                    className={"rounded-full object-cover dark:invert"}
                />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 dark:text-white">John Doe</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 flex flex-col-reverse bg-[#FAF7F4] dark:bg-[#161717]"
          style={{
            backgroundImage: "url('/assets/whatsapp/message-bg.png')",
            // backgroundRepeat: "repeat",
            backgroundSize: "contain",
            backgroundAttachment: "fixed",
            backgroundPosition: "top",
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="space-y-3 space-y-reverse flex flex-col-reverse">
            {messages.map((message) => (
              <MessageBubble
                key={message._id?.toString()}
                message={message}
                isPreviewMode={true}
              />
            ))}
          </div>
        </div>

        {/* Input Placeholder */}
        <div className="h-16 bg-gray-100 dark:bg-[#1F1F1F] flex items-center px-4 rounded-b-3xl">
          <div className="flex-1 h-10 bg-white dark:bg-[#2E2F2F] rounded-full px-4 flex items-center text-gray-400 dark:text-gray-300">
            Type a message...
          </div>
          <button className="ml-2 w-10 h-10 flex items-center justify-center bg-green-500 rounded-full text-white">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
