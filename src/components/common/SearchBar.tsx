"use client";

import { useDebounce } from "@/hooks/common/useDebounce";
import Image from "next/image";
import { useState, useEffect } from "react";

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  delay?: number;
}

export const normalizePhoneForSearch = (value: string) => {
  if (!value) return "";

  // keep only digits
  let digits = value.replace(/\D/g, "");

  // If user enters Indian number with country code (91xxxxxxxxxx)
  // convert it to last 12 digits if your DB stores 12-digit format
  // Example: +91 8265 849298 -> 918265849298
  if (digits.length === 10) {
    // user typed only 10 digits, add country code
    digits = "91" + digits;
  }

  return digits;
};

export default function SearchBar({
  value,
  placeholder = "Search...",
  onSearch,
  className = "",
  delay = 500,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isActive, setIsActive] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  // ✅ Debounced search effect
  useEffect(() => {
    if (value) {
      setSearchTerm(value);
    }
  }, [value]); // ✅ only depend on debouncedSearchTerm

  // ✅ Debounced search effect
  useEffect(() => {
    if (!onSearch) return;

    const q = debouncedSearchTerm.trim();

    const normalizedPhone = normalizePhoneForSearch(q);

    // send both: raw query + normalized phone
    const finalQuery = normalizedPhone || q;
    onSearch(finalQuery);
  }, [debouncedSearchTerm]);


  // ✅ Clear input
  const handleClearSearch = () => {
    setSearchTerm("");
    onSearch?.("");
  };

  return (
    <div className={`px-5 py-3 transition-all duration-200 ${className}`}>
      <div
        className={`relative flex items-center bg-gray-200 dark:bg-[#2E2F2F] rounded-full transition-all duration-200 ${
          isActive
            ? "border-2 border-white translate-y-[2px]"
            : "border-2 border-transparent"
        }`}
      >
        {/* 🔍 Search Icon */}
        <div className="absolute left-3">
          <Image
            src="/assets/icons/search.svg"
            alt="Search"
            width={18}
            height={18}
            className="opacity-90 dark:invert"
          />
        </div>

        {/* 📝 Input Field */}
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
          className="
            w-full py-2 pl-10 pr-8 rounded-full
            bg-transparent outline-none
            text-gray-800 dark:text-white
            placeholder:text-gray-400
            transition-all duration-200
          "
        />

        {/* ✕ Clear Button */}
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 p-1 hover:opacity-80 transition"
          >
            <Image
              src="/assets/icons/close.svg"
              alt="Clear"
              width={16}
              height={16}
              className="dark:invert"
            />
          </button>
        )}
      </div>
    </div>
  );
}
