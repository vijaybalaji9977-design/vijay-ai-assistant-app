import React, { useState, useRef, useEffect } from 'react';
import { Plus, Image as ImageIcon, FileText, Music, X } from 'lucide-react';
import { processFileToAttachment } from '../utils/fileHelpers';
import { FileAttachment } from '../types';

interface AttachmentMenuProps {
  onAddAttachments: (attachments: FileAttachment[]) => void;
  disabled?: boolean;
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  onAddAttachments,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newAttachments: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const att = await processFileToAttachment(files[i]);
        newAttachments.push(att);
      }
      onAddAttachments(newAttachments);
    } catch (err) {
      console.error('Error processing files:', err);
    } finally {
      e.target.value = '';
      setIsOpen(false);
    }
  };

  return (
    <div className="relative shrink-0" ref={menuRef}>
      {/* Hidden file inputs for specific categories */}
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFiles}
        className="hidden"
      />
      <input
        ref={docInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={handleFiles}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        multiple
        accept=".mp3,.wav,.m4a,audio/mp3,audio/wav,audio/m4a,audio/mpeg,audio/x-m4a,audio/aac"
        onChange={handleFiles}
        className="hidden"
      />

      {/* The (+) Attachment Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          isOpen
            ? 'bg-indigo-100 text-indigo-700 rotate-45'
            : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100 bg-slate-50 border border-slate-200/80'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        title="Add attachment (Images, Documents, Audio)"
      >
        <Plus className="w-5 h-5 transition-transform" />
      </button>

      {/* Attachment Options Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-13 left-0 z-30 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 animate-fade-in divide-y divide-slate-100">
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Attach files
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-1 space-y-1">
            {/* 1. Images */}
            <button
              type="button"
              onClick={() => {
                imageInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50/70 text-left transition-colors cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-700">
                  Images
                </p>
                <p className="text-xs text-slate-400 truncate">
                  JPG, JPEG, PNG, WEBP
                </p>
              </div>
            </button>

            {/* 2. Documents */}
            <button
              type="button"
              onClick={() => {
                docInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50/70 text-left transition-colors cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-700">
                  Documents
                </p>
                <p className="text-xs text-slate-400 truncate">
                  PDF, DOC, DOCX, TXT
                </p>
              </div>
            </button>

            {/* 3. Audio */}
            <button
              type="button"
              onClick={() => {
                audioInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50/70 text-left transition-colors cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Music className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-700">
                  Audio
                </p>
                <p className="text-xs text-slate-400 truncate">
                  MP3, WAV, M4A
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
