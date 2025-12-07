"use client";

import React, { useState, useRef, useEffect } from "react";
import IconButton from "@/components/common/IconButton";

export default function AttachButton({
  onImage,
  onVideo,
  onAudio,
  onDocument,
  onTemplate
}: {
  onImage?: () => void;
  onVideo?: () => void;
  onAudio?: () => void;
  onDocument?: () => void;
  onTemplate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* Attachment Button */}
      <IconButton
        label="Attach"
        IconSrc="/assets/icons/plus.svg"
        onClick={() => setOpen(!open)}
      />

      {/* Popup Menu */}
      {open && (
        <div
          ref={menuRef}
          className="
            absolute left-0 bottom-12 z-50
            bg-white dark:bg-neutral-800
            shadow-lg rounded-xl p-2
            flex flex-col gap-1 w-40
          "
        >
          <button
            onClick={() => {
              onImage?.();
              setOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <img src="/assets/icons/camera.svg" alt="Image Icon" className="w-6 h-6" />
            Image
          </button>
          <button
            onClick={() => {
              onVideo?.();
              setOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <img src="/assets/icons/image.svg" alt="Video Icon" className="w-6 h-6" />
            Video
          </button>
          <button
            onClick={() => {
              onAudio?.();
              setOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <img src="/assets/icons/audio.svg" alt="Audio Icon" className="w-6 h-6" />
            Audio
          </button>

          <button
            onClick={() => {
              onDocument?.();
              setOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <img src="/assets/icons/document-icon.svg" alt="Document Icon" className="w-6 h-6" />
            Document
          </button>

          <button
            onClick={() => {
              onTemplate?.();
              setOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <img src="/assets/icons/template-icon.svg" alt="Template Icon" className="w-6 h-6" />
            Template
          </button>
        </div>
      )}
    </div>
  );
}
