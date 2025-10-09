"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useContactSearch } from "@/hooks/constact/useContactSearch";
import { IContact as Contact } from "@/types/contact";

export default function ContactSearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const { results, loading, pagination } = useContactSearch(searchTerm);

  return (
    <Card className="p-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search contacts by name or phone..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading && <p className="mt-2 text-sm text-gray-500">Searching...</p>}

      {/* Results */}
      {!loading && results.length === 0 && searchTerm && (
        <p className="mt-2 text-sm text-gray-500">No contacts found</p>
      )}

      <ul className="mt-2">
        {results.map((contact: Contact) => (
          <li key={contact._id} className="py-1 border-b">
            <span className="font-medium">{contact.name || "Unnamed"}</span>{" "}
            <span className="text-gray-500">
              ({contact.phones?.[0] || "No phone"})
            </span>
          </li>
        ))}
      </ul>

      {/* Pagination Info */}
      {pagination && results.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Page {pagination.page} of {pagination.totalPages} • {pagination.total} total contacts
        </div>
      )}
    </Card>
  );
}
