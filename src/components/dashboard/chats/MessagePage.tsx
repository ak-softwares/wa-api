"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Search,
  Phone,
  Video,
  Menu as MenuIcon,
} from "lucide-react";
import { Menu, MenuItem, MenuButton } from "@headlessui/react"; // optional, or use your own dropdown
import { useSendWhatsappMessage } from "@/hooks/whatsapp/useSendWhatsappMessage";
import { IMessage } from "@/types/message";
import { IChat, ChatParticipant } from "@/types/chat";
import { MessageStatus } from "@/types/messageStatus";
import { useSearchParams } from "next/navigation";
import DeleteChatDialog from "@/components/dashboard/chats/DeleteChats";
import Pusher from "pusher-js";
import { toast } from "sonner";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const phoneQuery = searchParams.get("phone"); // 📌 Get phone from URL

  const [activeChat, setActiveChat] = useState<IChat | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState<IChat[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: IMessage[] }>({});
  const { sendMessage } = useSendWhatsappMessage();

  
  // ✅ Listen for real-time new messages
  useEffect(() => {
    if (!activeChat?._id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`chat-${activeChat._id}`);
    channel.bind("new-message", (data: any) => {
      toast.success("📨 New message received:", data.message);
      setMessages((prev) => {
        const chatMessages = prev[activeChat._id] || [];
        return {
          ...prev,
          [activeChat._id]: [...chatMessages, data.message],
        };
      });
    });

    return () => {
      pusher.unsubscribe(`chat-${activeChat._id}`);
      pusher.disconnect();
    };
  }, [activeChat?._id]); // ✅ re-subscribe if chat changes

  // 🔹 Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const url = phoneQuery
          ? `/api/whatsapp/chats?phone=${phoneQuery}`
          : "/api/whatsapp/chats";

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          let chatsList: IChat[] = data.data.chats as IChat[];

          // 🔹 Set the first chat as active if phoneQuery exists
          if (phoneQuery && chatsList.length > 0) {
            setActiveChat(chatsList[0]);
          }

          setChats(chatsList);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [phoneQuery]);



  // 🔹 Fetch messages when activeChat changes
  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      const res = await fetch(
        `/api/whatsapp/messages?chatId=${activeChat._id}&limit=20`
      );
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => ({
          ...prev,
          [activeChat._id]: (data.data as IMessage[]).slice().reverse(),
        }));
      }
    };
    fetchMessages();
  }, [activeChat]);

  // Helper: chat partner is always the only participant
  const getChatPartner = (chat: IChat): ChatParticipant => {
    return chat.participants[0]; // already a ChatParticipant
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChat) return;

    const partner = getChatPartner(activeChat);
    const tempId = Date.now().toString();

    const tempMessage: IMessage = {
      _id: tempId,
      userId: "local-user" as any,
      chatId: activeChat._id as any,
      to: partner.id, // ✅ send to partner
      from: "me", // ✅ mark sender as me
      message: messageInput,
      status: MessageStatus.Sent,
      type: "text" as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    setMessages((prev) => ({
      ...prev,
      [activeChat._id]: [...(prev[activeChat._id] || []), tempMessage],
    }));

    setMessageInput("");
    await sendMessage(
      partner.id, // ✅ send to partner
      messageInput.trim(),
      () => {
        // ✅ On success
        setMessages((prev) => {
          const updated: IMessage[] = (prev[activeChat._id] || []).map((msg) =>
            msg._id === tempId ? { ...msg, status: MessageStatus.Sent } : msg
          );
          return { ...prev, [activeChat._id]: updated };
        });
      },
      () => {
        // ❌ On error
        setMessages((prev) => {
          const updated: IMessage[] = (prev[activeChat._id] || []).map((msg) =>
            msg._id === tempId ? { ...msg, status: MessageStatus.Failed } : msg
          );
          return { ...prev, [activeChat._id]: updated };
        });
      }
    );
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert 0 → 12 for 12-hour clock
    return `${hours}:${minutes} ${ampm}`;
  };

  const filteredChats = chats.filter((c) => {
    const partner = getChatPartner(c);
    return (
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.id.includes(searchTerm) ||
      (c.lastMessage &&
        c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto flex h-screen">
        {/* Chats Sidebar */}
        <div className="w-1/3 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Chats</h1>
            </div>
            <Button variant="ghost" size="icon">
              <MenuIcon />
            </Button>
          </div>

          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search chats..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((c) => {
              const partner = getChatPartner(c);
              return (
                <div
                  key={c._id}
                  className={`p-4 border-b cursor-pointer flex items-center ${
                    activeChat?._id === c._id
                      ? "bg-green-50 dark:bg-gray-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setActiveChat(c)}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold mr-3">
                    {partner.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{partner.name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {c.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {c.lastMessageAt && formatTime(c.lastMessageAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col">
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-green-50 dark:bg-gray-900 p-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Your Messages
              </h2>
              <p className="text-gray-500">Select a chat to start messaging</p>
            </div>
          ) : (
            <>
              <div className="p-4 flex items-center justify-between bg-white dark:bg-gray-900">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-4"
                    onClick={() => setActiveChat(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold mr-3">
                    {getChatPartner(activeChat).name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {getChatPartner(activeChat).name}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  <Video className="h-5 w-5" />
                  <Menu as="div" className="relative inline-block text-center">
                    <MenuButton>
                      <MoreVertical className="h-5 w-5 cursor-pointer" />
                    </MenuButton>

                    <Menu.Items className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-900 z-50">
                      <MenuItem >
                        {({ active }) => (
                          <button
                            className={`w-full text-center px-4 py-2 text-sm ${active ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                            // onClick={() => onClearMessages(chatId)}
                          >
                            Clear Messages
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <DeleteChatDialog
                            chatId={activeChat._id}
                            chatName={activeChat.participants[0].name} 
                          />
                        )}
                      </MenuItem>

                    </Menu.Items>
                    </Menu>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-green-50 dark:bg-gray-800">
                <div className="space-y-3">
                  {messages[activeChat._id]?.map((m) => {
                    // ✅ If "from" matches chat participant, it's theirs. Otherwise mine.
                    const isMine = !activeChat.participants.some(
                        (p) => p.id === m.from
                    );
                    return (
                      <div
                        key={m._id}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                            isMine
                              ? "bg-green-100 dark:bg-green-900/40 rounded-br-none"
                              : "bg-white dark:bg-gray-900 rounded-bl-none"
                          }`}
                        >
                          <p>{m.message}</p>
                          <p className="text-xs mt-1 text-right opacity-70">
                            {formatTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 border-t">
                <div className="flex items-center">
                  <Input
                    placeholder="Type a message"
                    className="flex-1 mr-2"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
