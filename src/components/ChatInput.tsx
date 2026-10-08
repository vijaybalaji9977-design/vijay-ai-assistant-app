import React, { useRef, useEffect } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { AttachmentMenu } from './AttachmentMenu';
import { AttachmentPreviews } from './AttachmentPreviews';
import { FileAttachment } from '../types';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  attachments: FileAttachment[];
  onAddAttachments: (attachments: FileAttachment[]) => void;
  onRemoveAttachment: (id: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSendMessage,
  isLoading,
  attachments,
  onAddAttachments,
  onRemoveAttachment,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea according to content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap max height to ~160px
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [input]);

  const canSend = !isLoading && (input.trim().length > 0 || attachments.length > 0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        onSendMessage();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSend) {
      onSendMessage();
    }
  };

  return (
    <div className="sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-2 pb-4 sm:pb-6 px-4">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col bg-white rounded-2xl border border-slate-300/80 shadow-md focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all p-2.5"
        >
          {/* Previews of attached files before sending */}
          <AttachmentPreviews
            attachments={attachments}
            onRemove={onRemoveAttachment}
            disabled={isLoading}
          />

          <div className="flex items-end gap-2">
            {/* Attachment (+) Button with Menu */}
            <AttachmentMenu
              onAddAttachments={onAddAttachments}
              disabled={isLoading}
            />

            {/* Message Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                attachments.length > 0
                  ? 'Add a message or press Enter to analyze files...'
                  : 'Type a message... (Press Enter to send)'
              }
              disabled={isLoading}
              className="flex-1 max-h-40 min-h-[44px] py-2.5 px-2 text-[15px] text-slate-800 placeholder-slate-400 bg-transparent resize-none focus:outline-none disabled:opacity-50"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!canSend}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs active:scale-95"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              ) : (
                <SendHorizontal className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>

        <p className="text-[11px] text-center text-slate-400 mt-2 select-none">
          Press <kbd className="font-mono bg-slate-200/80 px-1 py-0.5 rounded text-[10px] text-slate-600">Enter</kbd> to send, <kbd className="font-mono bg-slate-200/80 px-1 py-0.5 rounded text-[10px] text-slate-600">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
};
