"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MoreVertical, Search, Phone, Video, Menu } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "contact";
  timestamp: Date;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastSeen?: string;
  avatar?: string;
}

export default function MessagesPage() {
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [contacts] = useState<Contact[]>([
    { id: "1", name: "Akash Sharma", phone: "9876543210", lastSeen: "2:45 PM", avatar: "AS" },
    { id: "2", name: "John Doe", phone: "1234567890", lastSeen: "10:30 AM", avatar: "JD" },
    { id: "3", name: "Sarah Johnson", phone: "5551234567", lastSeen: "Just now", avatar: "SJ" },
    { id: "4", name: "Michael Chen", phone: "4449876543", lastSeen: "Yesterday", avatar: "MC" },
    { id: "5", name: "Emily Wilson", phone: "7775551234", lastSeen: "Online", avatar: "EW" },
    { id: "6", name: "David Brown", phone: "8884445678", lastSeen: "5:20 PM", avatar: "DB" },
  ]);

  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({
    "1": [
      { id: "1", text: "Hey there! How are you?", sender: "contact", timestamp: new Date(Date.now() - 3600000) },
      { id: "2", text: "I'm doing great! Just working on some projects.", sender: "user", timestamp: new Date(Date.now() - 3500000) },
      { id: "3", text: "That's awesome! What kind of projects?", sender: "contact", timestamp: new Date(Date.now() - 3400000) },
      { id: "4", text: "Mostly web development with Next.js and React.", sender: "user", timestamp: new Date(Date.now() - 3300000) },
      { id: "5", text: "Sounds interesting. We should collaborate sometime!", sender: "contact", timestamp: new Date(Date.now() - 3200000) },
    ],
    "2": [
      { id: "1", text: "Hi John, did you review the proposal?", sender: "user", timestamp: new Date(Date.now() - 86400000) },
      { id: "2", text: "Yes, I did. It looks good overall.", sender: "contact", timestamp: new Date(Date.now() - 86000000) },
      { id: "3", text: "Great! Any specific feedback?", sender: "user", timestamp: new Date(Date.now() - 85800000) },
    ],
    "3": [
      { id: "1", text: "Meeting tomorrow at 10 AM.", sender: "contact", timestamp: new Date(Date.now() - 172800000) },
      { id: "2", text: "Got it. I'll prepare the presentation.", sender: "user", timestamp: new Date(Date.now() - 171800000) },
    ],
    "4": [
      { id: "1", text: "Thanks for your help with the project!", sender: "contact", timestamp: new Date(Date.now() - 259200000) },
      { id: "2", text: "Happy to help! Let me know if you need anything else.", sender: "user", timestamp: new Date(Date.now() - 258900000) },
    ],
  });

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
  );

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeContact) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageInput,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMessage]
    }));
    setMessageInput("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto flex h-screen">
        {/* Contacts Sidebar */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-550 flex items-center justify-center text-white font-bold mr-3">
                ME
              </div>
              <h1 className="text-xl font-semibold text-gray-800">Chats</h1>
            </div>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
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

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No contacts found</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors flex items-center ${
                    activeContact?.id === contact.id ? "bg-green-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveContact(contact)}
                >
                  <div className="w-12 h-12 rounded-full bg-green-550 flex items-center justify-center text-white font-bold mr-3">
                    {contact.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{contact.name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {messages[contact.id]?.[messages[contact.id]?.length - 1]?.text || "No messages yet"}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {contact.lastSeen}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col">
          {!activeContact ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-green-50 p-8">
              <div className="w-24 h-24 rounded-full bg-green-550 flex items-center justify-center text-white mb-6">
                <Message className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your Messages</h2>
              <p className="text-gray-500 text-center max-w-md">
                Select a contact from the sidebar to start a conversation or search for someone to message.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-green-550 text-white p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white md:hidden mr-4"
                    onClick={() => setActiveContact(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mr-3">
                    {activeContact.avatar}
                  </div>
                  <div>
                    <h2 className="font-semibold">{activeContact.name}</h2>
                    <p className="text-xs text-green-100">Last seen {activeContact.lastSeen}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="text-white">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-green-50">
                <div className="space-y-3">
                  {messages[activeContact.id]?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                          message.sender === "user"
                            ? "bg-green-500 text-white rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p>{message.text}</p>
                        <p
                          className={`text-xs mt-1 text-right ${
                            message.sender === "user" ? "text-green-100" : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="bg-white p-4 border-t">
                <div className="flex items-center">
                  <Input
                    placeholder="Type a message"
                    className="flex-1 mr-2"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                  />
                  <Button 
                    className="bg-green-550 hover:bg-green-600"
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

// Helper component for the message icon
function Message({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}