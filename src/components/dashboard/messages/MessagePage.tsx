"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { useMessages } from "@/hooks/message/useMessages";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import IconButton from "@/components/common/IconButton";
import { useChatStore } from "@/store/chatStore";
import ContactDetails from "@/components/dashboard/chats/ContactDetails";
import MessageBubble from "@/components/common/MessageBubble";
import { Message } from "@/types/Message";
import ForwardMessagePopup from "@/components/dashboard/messages/ForwardMessagePopup";
import EmojiPicker, { Theme } from "emoji-picker-react";
import AttachButton from "@/components/dashboard/messages/AttachButton";
import TemplatePopup from "@/components/dashboard/templates/SendTemplatePopup";
import { Template } from "@/types/Template";
import { useTemplates } from "@/hooks/template/useTemplate";
import DefaultMessagePage from "./DefaultMessagePage";
import MediaSendPage from "./MediaSendPage";
import { MediaType } from "@/utiles/enums/mediaTypes";
import MessagesHeader from "./MessageHeader";
import { MessagePaylaod } from "@/types/MessagePayload";
import { MessageType } from "@/types/MessageType";

export interface MediaSelection {
  type: MediaType;
  file?: File;
}

export default function MessagePage() {
  const { theme } = useTheme(); // or use your theme context
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const {activeChat, setActiveChat} = useChatStore();

  const chatId = activeChat?._id?.toString() ?? "";

  const [message, setMessage] = useState("");
  const [messageContext, setMessageContext] = useState<Message | null>(null);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const { messages, setMessages, onSend, loading, loadingMore, hasMore } = useMessages({ containerRef, chatId });
  const [isForwardMessageOpen, setIsForwardMessageOpen] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const { templates: fetchedTemplates, loading: templatesLoading } = useTemplates();
  // Update state to handle different media types
  const [mediaSelections, setMediaSelections] = useState<MediaSelection[]>([]);
  
  // Refs for different file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  // type user intended when clicking the button
  const [intendedType, setIntendedType] = useState<MediaType | null>(null);


  // Handle different media type selections
  const handleMediaSelection = (type: MediaType) => {
    setIntendedType(type);    // optional — you can remove this if not needed
    fileInputRef.current?.click();
  };


  // Generic file handler for different media types
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newSelections = Array.from(files).map(file => ({
      type: intendedType ?? MediaType.DOCUMENT,
      file
    }));

    setMediaSelections(prev => [...prev, ...newSelections]);

    // reset input
    e.target.value = "";
  };


  // Clean up file inputs after selection
  const resetFileInput = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      ref.current.value = '';
    }
  };

  // Function to close media send page and reset selection
  const handleCloseMediaSend = () => {
    setMediaSelections([]);
    resetFileInput(fileInputRef);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Insert emoji at cursor position
  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    const updatedText =
      message.slice(0, start) + emoji + message.slice(end);

    setMessage(updatedText);

    // Set cursor after emoji
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  // ✅ Reset unread count when chat is opened
  useEffect(() => {
    if (!chatId) return;

    fetch(`/api/whatsapp/chats/${chatId}/opened`, { method: "POST" });

    // ✅ When leaving the chat
    return () => {
      fetch(`/api/whatsapp/chats/${chatId}/closed`, { method: "POST" });
    };
  }, [chatId]);

  const messageSend = () => {
    if (message.trim()) {
      const messagePayload: MessagePaylaod = {
        participants: activeChat?.participants!,
        messageType: MessageType.TEXT,
        message
      };

      // Only add context if messageContext exists
      if (messageContext) {
        messagePayload.context = {
          id: messageContext.waMessageId!,
          from: messageContext.from,
          message: messageContext.message,
        };
      }

      onSend({messagePayload});
      setMessage("");
      setMessageContext(null);
    }
  };

  const onReply = (message: Message) => {
    setMessageContext(message);
  }

  useEffect(() => {
    // Whenever reply context changes → focus input after UI is updated
    inputRef.current?.focus();
  }, [messageContext]);

  const backFromChat = () => {
    setActiveChat(null);
    setMessageContext(null);
    setShowContactDetails(false);
  };

  const handleAvatarClick = () => {
    setShowContactDetails(true);
  };


  const handleDeleteMessage = (MessageId: string) => {
    setMessages((prev) => prev.filter(message => String(message._id) !== MessageId));
  };

  // Close contact details when active chat changes
  useEffect(() => {
    setShowContactDetails(false);
  }, [activeChat]);

  const handleOpenPopup = () => {
    if (templatesLoading) return; // optional safeguard

    setTemplates(fetchedTemplates || []);
    setIsPopupOpen(true);
  };

  if(!activeChat){
    return <DefaultMessagePage />
  }

  // If media is selected, show MediaSendPage
  if (mediaSelections.length > 0) {
    return (
      <MediaSendPage
        mediaList={mediaSelections}
        chatId={chatId}
        onClose={handleCloseMediaSend}
        onSendSuccess={() => handleCloseMediaSend()}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Hidden file inputs for different media types */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Main chat area with contact details */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className={`flex flex-col min-w-0 ${showContactDetails ? 'flex-1' : 'w-full'}`}>
          {/* Header */}
          <MessagesHeader onAvatarClick={handleAvatarClick} onBack={backFromChat} />
          <div
            className="flex flex-col flex-1 overflow-hidden bg-[#FAF7F4] dark:bg-[#161717]"
            style={{
              backgroundImage: "url('/assets/whatsapp/message-bg.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
              backgroundAttachment: "fixed",
              backgroundPosition: "top",
              // backgroundBlendMode: "overlay", // ✅ makes the image blend without changing div content opacity
              ...(theme === 'dark' 
                ? {
                    backgroundBlendMode: "overlay",
                  }
                : {
                    backgroundBlendMode: "difference", // or "soft-light" for light mode
                    backgroundColor: "rgba(250, 247, 244, 0.07)", // subtle white overlay
                  }
              )
            }}
          >
            {/* Messages list */}
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto p-4 px-10 flex flex-col-reverse"
            >
              <div className="space-y-3 space-y-reverse flex flex-col-reverse"
              >
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => {
                      const isMine = i % 2 === 0;
                      const messageLength = [3, 2, 4, 1, 3][i % 5];
                      
                      return (
                          <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} p-2 animate-pulse`}>
                          <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                              isMine 
                              ? "bg-green-100 dark:bg-[#144D37] rounded-tr-none w-3/6" 
                              : "bg-white dark:bg-[#2E2F2F] rounded-tl-none w-3/5"
                          }`}>
                              <div className="space-y-2">
                              {Array.from({ length: messageLength }).map((_, lineIndex) => (
                                  <Skeleton 
                                  key={lineIndex} 
                                  className={`h-3 rounded ${
                                      lineIndex === messageLength - 1 ? 'w-3/5' : 'w-full'
                                  }`} 
                                  />
                              ))}
                              </div>
                              <div className="flex justify-end mt-2">
                              <Skeleton className="w-12 h-2 rounded" />
                              </div>
                          </div>
                          </div>
                      );
                  })
                  : messages.map((message) => (
                      <MessageBubble 
                        key={message._id?.toString()}
                        message={message}
                        onDelete={handleDeleteMessage}
                        onReply={() => onReply(message)}
                        onForward={() => {
                          setForwardMessage(message);
                          setIsForwardMessageOpen(true);
                        }}
                      />
                    ))
                  }
              </div>

              {/* Loader when fetching more (scroll up) */}
              {hasMore && loadingMore && (
                <div >
                  {Array.from({ length: 2 }).map((_, i) => {
                      const isMine = i % 2 === 0;
                      const messageLength = [3, 2, 4, 1, 3][i % 5];
                      
                      return (
                          <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} py-2 animate-pulse`}>
                          <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                              isMine 
                              ? "bg-green-100 dark:bg-[#144D37] rounded-br-none w-3/6" 
                              : "bg-white dark:bg-[#2E2F2F] rounded-bl-none w-3/5"
                          }`}>
                              <div className="space-y-2">
                              {Array.from({ length: messageLength }).map((_, lineIndex) => (
                                  <Skeleton 
                                  key={lineIndex} 
                                  className={`h-3 rounded ${
                                      lineIndex === messageLength - 1 ? 'w-3/5' : 'w-full'
                                  }`} 
                                  />
                              ))}
                              </div>
                              <div className="flex justify-end mt-2">
                              <Skeleton className="w-12 h-2 rounded" />
                              </div>
                          </div>
                          </div>
                      );
                  })}
                </div>
              )}

            </div>
            {/* Input box */}
            <div className="bg-transparent p-4">
              {/* PREFIX buttons (left side inside input) */}
              {messageContext && (
                <div className="p-2 dark:bg-[#2E2F2F] bg-white rounded-t-xl">
                  <div className="px-4 py-2 bg-gray-100 dark:bg-[#1f1f1f] rounded-md border-l-4 dark:border-blue-400 border-blue-600 flex justify-between items-start">
                    <div>
                      <p className="dark:text-blue-300 text-blue-600 font-semibold text-sm">
                        {activeChat.participants[0]?.name ?? "User"}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-1">
                        {messageContext.message}
                      </p>
                    </div>

                    {/* Close button */}
                    <button
                      onClick={() => setMessageContext(null)}
                      className="dark:text-gray-400 text-gray-600 hover:text-black dark:hover:text-white text-2xl px-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              <div className="relative flex items-center">
                <div className="absolute left-1.5 flex gap-2 items-center">
                  <AttachButton
                    onImage={() => handleMediaSelection(MediaType.IMAGE)}
                    onVideo={() => handleMediaSelection(MediaType.VIDEO)}
                    onAudio={() => handleMediaSelection(MediaType.AUDIO)}
                    onDocument={() => handleMediaSelection(MediaType.DOCUMENT)}
                    onTemplate={handleOpenPopup}
                  />

                  <IconButton
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    label={"Emoji"}
                    IconSrc={"/assets/icons/emoji.svg"}
                  />
                  {/* Emoji Popup */}
                  {showEmojiPicker && (
                    <div ref={pickerRef} className="absolute bottom-12 left-0 z-50">
                      <EmojiPicker
                        theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                        onEmojiClick={(emoji) => {
                          insertEmoji(emoji.emoji);
                          setShowEmojiPicker(false);
                        }}
                      />
                    </div>
                  )}
                </div>
                <Input
                  ref={inputRef}   // 👈 attach ref
                  placeholder="Type a message"
                  className={`
                    flex-1
                    px-25
                    bg-white
                    ${messageContext ? "rounded-t-none rounded-b-3xl" : "rounded-full"}
                    dark:bg-[#2E2F2F]
                    h-12
                    border-none
                    !focus:ring-0 !focus-visible:ring-0 !ring-0
                    !focus:border-transparent 
                    !active:border-transparent !hover:border-transparent 
                    !outline-none !focus:outline-none
                    placeholder:text-base placeholder:text-gray-400
                    dark:text-white
                    !text-base
                  `}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      messageSend();
                    }
                  }}
                />
                {/* Send button inside the input */}
                {/* SUFFIX buttons (right side inside input) */}
                <div className="absolute right-3 flex gap-2 items-center">
                  {
                    message.trim() === "" 
                      ? (
                        <IconButton
                            // onClick={clearSelection}
                            label={"Voice message"}
                            IconSrc={"/assets/icons/mic-outlined.svg"}
                        />
                      )
                      : (
                        <IconButton
                            onClick={messageSend}
                            label={"Send"}
                            IconSrc={"/assets/icons/send-message.svg"}
                        />
                      )
                  }
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Contact Details Panel */}
        <ContactDetails
          isOpen={showContactDetails} 
          onClose={() => setShowContactDetails(false)} 
        />
      </div>
      {/* New Chat Popup */}
      <ForwardMessagePopup
        isOpen={isForwardMessageOpen}
        onClose={() => {
          setIsForwardMessageOpen(false);
          setForwardMessage(null);
        }}
        message={forwardMessage!}
      />
      <TemplatePopup
        isOpen={isPopupOpen}
        chatId={activeChat._id!}
        onClose={() => setIsPopupOpen(false)}
        // onSend={(templateId => console.log("Send template", templateId))}
        templates={templates}
      />
    </div>
  );
}