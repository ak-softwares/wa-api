// MediaSendPage.tsx
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useChatStore } from "@/store/chatStore";
import { RotateCw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useMessages } from "@/hooks/message/useMessages";
import { MediaSelection } from "./MessagePage";
import { MediaType } from "@/utiles/enums/mediaTypes";
import MessagesHeader from "./MessageHeader";
import IconButton from "@/components/common/IconButton";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { useSendMedia } from "@/hooks/message/useSendMedia";
import { ChatType } from "@/types/Chat";

interface MediaSendPageProps {
  mediaList: MediaSelection[];
  chatId: string;
  onClose: () => void;
  onSendSuccess?: () => void;
}

export default function MediaSendPage({ mediaList, chatId, onClose, onSendSuccess }: MediaSendPageProps) {
  const { theme } = useTheme(); // or use your theme context
  const { activeChat } = useChatStore();
  const { onSend } = useMessages({ chatId });
  const [captions, setCaptions] = useState<string[]>(mediaList.map(() => ""));
  const [isSending, setIsSending] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [rotations, setRotations] = useState<number[]>(mediaList.map(() => 0));
  const [zooms, setZooms] = useState<number[]>(mediaList.map(() => 1));
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaListState, setMediaList] = useState(mediaList);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMedia, isSending: isSendingMedia } = useSendMedia();

  const detectMediaType = (file: File): MediaType => {
    if (file.type.startsWith("image/")) return MediaType.IMAGE;
    if (file.type.startsWith("video/")) return MediaType.VIDEO;
    if (file.type.startsWith("audio/")) return MediaType.AUDIO; // added audio
    return MediaType.DOCUMENT; // fallback
  };

  // Get current media
  const currentMedia = mediaListState[currentMediaIndex];
  const currentMediaType = currentMedia ? detectMediaType(currentMedia.file!) : null;

  const currentCaption = captions[currentMediaIndex] || "";

  const updateCaption = (value: string) => {
    setCaptions(prev => {
      const updated = [...prev];
      updated[currentMediaIndex] = value;
      return updated;
    });
  };


  // Insert emoji at cursor position
  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    const updatedText =
      currentCaption.slice(0, start) + emoji + currentCaption.slice(end);

    updateCaption(updatedText);

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };


  // Determine partner information for display
  const isBroadcast = activeChat?.type === ChatType.BROADCAST;
  const partner = activeChat?.participants?.[0];
  const displayName = isBroadcast
    ? activeChat?.chatName || ChatType.BROADCAST
    : partner?.name || partner?.number || "Unknown";

  // Create object URLs for image previews
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    // Create object URLs for all media files
    const urls = mediaListState.map(media => 
      media.file ? URL.createObjectURL(media.file) : ''
    );
    setPreviewUrls(urls);

    // Cleanup object URLs on unmount
    return () => {
      urls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [mediaListState]);

  const handleSend = async () => {
    if (mediaListState.length === 0) return;

    setIsSending(true);
    onClose();
    try {
      for (let i = 0; i < mediaListState.length; i++) {
        const media = mediaListState[i];
        if (!media.file) continue;

        await sendMedia({
          chatId,
          file: media.file,
          caption: captions[i] || "",
          mediaType: detectMediaType(media.file),
        });

        // Optional delay
        if (i < mediaListState.length - 1) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }

      onSendSuccess ? onSendSuccess() : onClose();
    } catch (error) {
    } finally {
      setIsSending(false);
    }
  };

  const handleRotate = () => {
    setRotations(prev => {
      const newRotations = [...prev];
      newRotations[currentMediaIndex] = (newRotations[currentMediaIndex] + 90) % 360;
      return newRotations;
    });
  };

  const handleZoomIn = () => {
    setZooms(prev => {
      const newZooms = [...prev];
      newZooms[currentMediaIndex] = Math.min(newZooms[currentMediaIndex] + 0.25, 3);
      return newZooms;
    });
  };

  const handleZoomOut = () => {
    setZooms(prev => {
      const newZooms = [...prev];
      newZooms[currentMediaIndex] = Math.max(newZooms[currentMediaIndex] - 0.25, 0.5);
      return newZooms;
    });
  };

  const handleReset = () => {
    setRotations(prev => {
      const newRotations = [...prev];
      newRotations[currentMediaIndex] = 0;
      return newRotations;
    });
    setZooms(prev => {
      const newZooms = [...prev];
      newZooms[currentMediaIndex] = 1;
      return newZooms;
    });
  };

  const nextMedia = () => {
    if (currentMediaIndex < mediaListState.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const removeMedia = (index: number) => {
    setCurrentMediaIndex(prev => {
      // If removing an earlier item, shift index left
      if (prev > index) return prev - 1;

      // If removing the currently displayed item:
      if (prev === index) return Math.max(0, prev - 1);

      // If removing after the current item: no change
      return prev;
    });

    // Remove item from list
    setMediaList(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };


  const handleAddMore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newItems = files.map(file => ({
      type: detectMediaType(file),
      file
    }));

    setMediaList(prev => [...prev, ...newItems]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  // Render different preview based on media type
  const renderPreview = () => {
    if (!currentMedia?.file) return null;

    switch (currentMediaType) {
      case MediaType.IMAGE:
        return (
          <div className="relative w-full h-68 flex items-center justify-center">
            <img
              src={URL.createObjectURL(currentMedia.file)}
              alt="Preview"
              className="max-w-[45%] max-h-full object-contain"
              style={{
                transform: `rotate(${rotations[currentMediaIndex]}deg) scale(${zooms[currentMediaIndex]})`,
                transition: 'transform 0.3s ease'
              }}
            />
            
            {/* Navigation arrows for multiple images */}
            {mediaListState.length > 1 && (
              <>
                {currentMediaIndex > 0 && (
                  <button
                    onClick={prevMedia}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {currentMediaIndex < mediaListState.length - 1 && (
                  <button
                    onClick={nextMedia}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}
            
            {/* Image controls */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/70 backdrop-blur-sm rounded-full px-3 py-2">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-white/20 rounded-full"
                disabled={zooms[currentMediaIndex] <= 0.5}
              >
                <ZoomOut className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleReset}
                className="p-1 hover:bg-white/20 rounded-full"
              >
                <RotateCw className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleRotate}
                className="p-1 hover:bg-white/20 rounded-full"
              >
                <RotateCw className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-white/20 rounded-full"
                disabled={zooms[currentMediaIndex] >= 3}
              >
                <ZoomIn className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        );

      case MediaType.AUDIO:
        return (
          <div className="relative w-full h-68 flex flex-col items-center justify-center">
            <audio
              controls
              src={URL.createObjectURL(currentMedia.file)}
              className="w-[45%] mt-2"
            >
              Your browser does not support the audio element.
            </audio>

            
            {/* Navigation arrows for multiple audio files */}
            {mediaListState.length > 1 && (
              <>
                {currentMediaIndex > 0 && (
                  <button
                    onClick={prevMedia}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {currentMediaIndex < mediaListState.length - 1 && (
                  <button
                    onClick={nextMedia}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}
          </div>
        );

      case MediaType.DOCUMENT:
        return (
          <div className="relative w-full h-68 flex flex-col items-center justify-center">
            {currentMedia.file.type === "application/pdf" ? (
              // PDF preview
              <iframe
                src={URL.createObjectURL(currentMedia.file) + "#toolbar=0&navpanes=0&scrollbar=0"}
                className="w-58 h-100 rounded-lg bg-transparent"
                style={{ border: "none" }}
              />
            ) : (
              // Unsupported formats
              <div className="text-black/60 dark:text-white/60 text-sm mt-2">
                Preview not available.
                <a
                  href={URL.createObjectURL(currentMedia.file)}
                  download={currentMedia.file.name}
                  className="underline text-blue-400"
                >
                  Download file
                </a>
              </div>
            )}
            
            {/* Navigation arrows for multiple documents */}
            {mediaListState.length > 1 && (
              <>
                {currentMediaIndex > 0 && (
                  <button
                    onClick={prevMedia}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {currentMediaIndex < mediaListState.length - 1 && (
                  <button
                    onClick={nextMedia}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}
          </div>
        );

      case MediaType.VIDEO:
        return (
          <div className="relative w-full h-68 flex items-center justify-center">
              <video
                src={URL.createObjectURL(currentMedia.file)}
                controls
                className="w-[45%] max-w-[500px] rounded-lg mt-3"
              />
            {/* Navigation arrows for multiple videos */}
            {mediaListState.length > 1 && (
              <>
                {currentMediaIndex > 0 && (
                  <button
                    onClick={prevMedia}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {currentMediaIndex < mediaListState.length - 1 && (
                  <button
                    onClick={nextMedia}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}
          </div>
        );

      default:
        return (
          <div className="relative w-full h-68 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-gray-500 dark:text-gray-400">
              Preview not available
            </div>
            {/* Navigation arrows for multiple items */}
            {mediaListState.length > 1 && (
              <>
                {currentMediaIndex > 0 && (
                  <button
                    onClick={prevMedia}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {currentMediaIndex < mediaListState.length - 1 && (
                  <button
                    onClick={nextMedia}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}
          </div>
        );
    }
  };

  const previewElement = useMemo(() => {
    return renderPreview();
  }, [currentMediaIndex, mediaListState, rotations, zooms, mediaList]);

  const renderThumbnails = () => {
    if (mediaListState.length < 1) return null;

    return (
      <div className="px-4 py-6 border-t dark:border-gray-800">

        {/* Wrapper: Thumbnails (center) + Send button (right) */}
        <div className="flex items-center justify-center relative">

          {/* Thumbnails Wrapper with scrollbar */}
          <div className="flex-1 overflow-x-auto ml-5 mr-20 w-max max-w-[50vw]">
            <div className="flex gap-3 items-center justify-center w-max mx-auto py-2 ">
              {mediaListState.map((media, index) => {
                const mediaType = detectMediaType(media.file!);

                return (
                  <div key={index} className="relative flex-shrink-0">
                    <button
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-4 ${
                        index === currentMediaIndex
                          ? "border-green-500"
                          : "border-transparent"
                      }`}
                    >
                      {mediaType === MediaType.IMAGE && previewUrls[index] ? (
                        <img
                          src={previewUrls[index]}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-xl">
                          {mediaType === MediaType.IMAGE && "🖼️"}
                          {mediaType === MediaType.AUDIO && "🎵"}
                          {mediaType === MediaType.DOCUMENT && "📄"}
                          {mediaType === MediaType.VIDEO && "📹"}
                        </div>
                      )}
                    </button>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shadow"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}

              {/* Add More Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-md border-2 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center text-2xl"
              >
                +
              </button>

              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleAddMore} />
            </div>
          </div>


          {/* Right-Aligned Send Button with Badge */}
          <div className="absolute right-0">
            <button
            onClick={handleSend}
            disabled={isSending}
            className={`w-14 h-14 flex items-center justify-center rounded-full transition shadow-lg
            ${isSending ? "bg-[#A8E5C3] cursor-not-allowed" : "bg-[#21C063]"}`}>
              {isSending ? (
                // Loader spinner
                <div className="w-6 h-6 border-4 border-black/60 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <img
                  src="/assets/icons/send-message.svg"
                  className="w-7 h-7 cursor-pointer"
                  alt="Send"
                />
              )}
            </button>

            {/* Badge */}
            <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {mediaListState.length}
            </span>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#161717]">
      {/* Header */}
      <MessagesHeader onBack={onClose} />
      <div className="p-4 flex items-center justify-between border-t dark:border-gray-800">

        {/* Left section */}
        <div className="flex items-center gap-3">
          <IconButton
            IconSrc="/assets/icons/close.svg"
            label="Close"
            onClick={onClose}
          />
        </div>

        {/* Centered filename */}
        <div className="flex-1 flex justify-center">
          <div className="font-medium text-sm truncate max-w-[60%] text-center">
            {currentMedia?.file?.name}
          </div>
        </div>

        {/* Right empty spacer to balance layout */}
        <div className="w-8" />
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto">
        {mediaListState.length > 0 ? previewElement : (
          <div className="w-full h-96 flex items-center justify-center">
            <div className="text-gray-500">No media selected</div>
          </div>
        )}
      </div>

      {/* Caption Input */}
      {currentMediaType !== MediaType.AUDIO && (
        <div className="flex px-5 py-4 transition-all duration-200 justify-center items-center">
          <div
            className={`w-[70%] relative flex items-center bg-gray-200 dark:bg-[#2E2F2F] rounded-md transition-all duration-200
              ${currentCaption ? "border-2 border-white translate-y-[2px]" : "border-2 border-transparent"}
            `}
          >

            {/* 📝 Input Field */}
            <input
              ref={inputRef}   // 👈 attach ref
              type="text"
              value={currentCaption}
              onChange={(e) => updateCaption(e.target.value)}
              placeholder="Add a caption..."
              onFocus={() => {}}
              onBlur={() => {}}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="
                w-full py-2.5 pl-4 pr-2 rounded-full
                bg-transparent outline-none
                text-gray-800 dark:text-white
                placeholder:text-gray-400
                transition-all duration-200
                text-md
              "
            />

            {currentCaption && (
              <IconButton
                onClick={() => updateCaption("")}
                label={"Close"}
                IconSrc={"/assets/icons/close.svg"}
              />
            )}
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
        </div>
      )}

      {/* Thumbnail navigation */}
      {renderThumbnails()}

    </div>
  );
}