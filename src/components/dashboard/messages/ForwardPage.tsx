// "use client";

// import { useState, useMemo } from "react";
// import { X, Search } from "lucide-react";
// import ContactAvatar from "../contacts/ContactAvatar";
// import { Button } from "@/components/ui/button";
// import { useChats } from "@/hooks/chat/useChats";
// import { useContacts } from "@/hooks/contact/useContacts";

// interface ForwardPopupProps {
//   isOpen: boolean;
//   onClose: boolean;
//   onForward?: () => void; // new callback
// }

// export default function ForwardPopup({ isOpen, onClose, onForward }: ForwardPopupProps) {
//   if (!isOpen) return null;

//   const { chats, totalChats, setChats, loading, loadingMore, hasMore, searchChats } = useChats({ sidebarRef, phone });
//   const { contacts, setContacts, loading, loadingMore, hasMore, refreshContacts, searchContacts, totalContacts } = useContacts({ sidebarRef });

//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState<string[]>([]);

//   const toggleSelect = (id: string) => {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const filteredChats = useMemo(() => {
//     if (!search) return chats;
//     return chats.filter((c) =>
//       c.displayName?.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [search, chats]);

//   const filteredContacts = useMemo(() => {
//     if (!search) return contacts;
//     return contacts.filter((c) =>
//       c.displayName?.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [search, contacts]);

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
//       <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[88vh]">
        
//         {/* HEADER */}
//         <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
//           <h2 className="text-lg font-semibold">Forward messages to</h2>
//           <button onClick={onClose}>
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* SEARCH BAR */}
//         <div className="px-4 py-3">
//           <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-2">
//             <Search className="w-5 h-5 text-neutral-500" />
//             <input
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 searchChats(e.target.value);
//                 searchContacts(e.target.value);
//               }}
//               placeholder="Search name or number"
//               className="bg-transparent w-full outline-none text-sm"
//             />
//           </div>
//         </div>

//         {/* SCROLL AREA */}
//         <div className="flex-1 overflow-y-auto px-2 pr-3 space-y-2">
          
//           {/* Recent chats */}
//           {filteredChats.length > 0 && (
//             <div>
//               <p className="px-2 py-1 text-xs text-neutral-500">
//                 Recent chats
//               </p>
//               {filteredChats.map((chat) => (
//                 <div
//                   key={chat._id}
//                   className={`rounded-lg flex items-center gap-3 px-3 py-2 cursor-pointer 
//                   ${selected.includes(chat._id) ? "bg-green-100 dark:bg-green-900" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
//                   onClick={() => toggleSelect(chat._id)}
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selected.includes(chat._id)}
//                     readOnly
//                   />
//                   <ContactAvatar
//                     imageUrl={chat.displayImage}
//                     title={chat.displayName}
//                     subtitle={chat.lastMessage}
//                     size="lg"
//                   />
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Contacts */}
//           <div>
//             <p className="px-2 py-1 text-xs text-neutral-500">Contacts</p>
//             {filteredContacts.map((c) => (
//               <div
//                 key={c._id}
//                 className={`rounded-lg flex items-center gap-3 px-3 py-2 cursor-pointer 
//                 ${selected.includes(c._id) ? "bg-green-100 dark:bg-green-900" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
//                 onClick={() => toggleSelect(c._id)}
//               >
//                 <input type="checkbox" checked={selected.includes(c._id)} readOnly />
//                 <ContactAvatar
//                   imageUrl={c.displayImage}
//                   title={c.displayName}
//                   subtitle={c.phone}
//                   size="lg"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div className="p-3 border-t dark:border-neutral-700 flex justify-between">
//           <p className="text-sm text-neutral-600">
//             {selected.length} selected
//           </p>

//           <Button
//             className="bg-green-600 hover:bg-green-700"
//             onClick={() => onForward(selected)}
//             disabled={selected.length === 0}
//           >
//             Forward
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
