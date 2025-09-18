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
  Menu,
} from "lucide-react";
import { useSendWhatsappMessage } from "@/hooks/whatsapp/useSendWhatsappMessage";
import { IContact } from "@/types/contact";
import { IMessage } from "@/types/message";

export default function MessagesPage() {
  const [activeContact, setActiveContact] = useState<IContact | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: IMessage[] }>({});
  const { sendMessage } = useSendWhatsappMessage();

  // 🔹 Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      const res = await fetch("/api/contacts?hasChat=true");
      const data = await res.json();
      if (data.success) setContacts(data.data as IContact[]);
    };
    fetchContacts();
  }, []);

  // 🔹 Fetch messages when activeContact changes
  useEffect(() => {
    if (!activeContact) return;
    const fetchMessages = async () => {
      const res = await fetch(
        `/api/facebook/messages?contactId=${activeContact._id}&limit=20`
      );
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => ({
          ...prev,
          [activeContact._id]: data.data as IMessage[],
        }));
      }
    };
    fetchMessages();
  }, [activeContact]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeContact) return;

    const tempMessage: IMessage = {
      _id: Date.now().toString(),
      userId: "local-user" as any, // placeholder for UI only
      contactId: activeContact._id as any,
      to: activeContact.phones[0],
      from: "me", // ✅ frontend marker (replace with actual WA number if you have it)
      message: messageInput,
      status: "sent" as any,
      type: "text" as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    setMessages((prev) => ({
      ...prev,
      [activeContact._id]: [...(prev[activeContact._id] || []), tempMessage],
    }));

    setMessageInput("");
    await sendMessage(activeContact.phones[0], messageInput.trim());
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const filteredContacts = contacts.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phones.some((p) => p.includes(searchTerm))
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto flex h-screen">
        {/* Contacts Sidebar */}
        <div className="w-1/3 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-550 flex items-center justify-center font-bold mr-3">
                ME
              </div>
              <h1 className="text-xl font-semibold">Chats</h1>
            </div>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search contacts..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((c) => (
              <div
                key={c._id}
                className={`p-4 border-b cursor-pointer flex items-center ${
                  activeContact?._id === c._id
                    ? "bg-green-50 dark:bg-gray-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => setActiveContact(c)}
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold mr-3">
                  {c.name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {c.name || c.phones[0]}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {c.lastMessage || "No messages yet"}
                  </p>
                </div>
                <div className="text-xs text-gray-500 ml-2">
                  {c.lastMessageAt && formatTime(c.lastMessageAt)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col">
          {!activeContact ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-green-50 dark:bg-gray-900 p-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Your Messages
              </h2>
              <p className="text-gray-500">Select a contact to start chatting</p>
            </div>
          ) : (
            <>
              <div className="p-4 flex items-center justify-between bg-white dark:bg-gray-900">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden mr-4"
                    onClick={() => setActiveContact(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold mr-3">
                    {activeContact.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {activeContact.name || activeContact.phones[0]}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  <Video className="h-5 w-5" />
                  <MoreVertical className="h-5 w-5" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-green-50 dark:bg-gray-800">
                <div className="space-y-3">
                  {messages[activeContact._id]?.map((m) => {
                    const isMine = m.from === "me" || m.from === "810369052154744"; // replace with your WA number
                    return (
                      <div
                        key={m._id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                            isMine
                              ? "bg-green-500 text-white rounded-br-none"
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
