import React, { useState } from 'react';
import { User, Sparkles, Copy, Check } from 'lucide-react';
import { ChatMessage } from '../types';
import { FormattedMessage } from './FormattedMessage';
import { MessageAttachments } from './MessageAttachments';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-2.5 max-w-2xl ml-auto group">
        <div className="flex flex-col items-end max-w-full">
          <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-xs break-words text-[15px] leading-relaxed max-w-full">
            {message.attachments && message.attachments.length > 0 && (
              <MessageAttachments attachments={message.attachments} />
            )}
            {message.content && (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 px-1">
            {formattedTime}
          </span>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // AI message (on the left)
  return (
    <div className="flex items-start justify-start gap-3 max-w-3xl mr-auto group">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex flex-col items-start max-w-full flex-1">
        <div className="relative bg-white text-slate-800 rounded-2xl rounded-tl-sm px-4 sm:px-5 py-3.5 border border-slate-200/80 shadow-xs max-w-full w-full">
          <FormattedMessage content={message.content} />

          <div className="flex items-center justify-between border-t border-slate-100 mt-3 pt-2">
            <span className="text-[11px] text-slate-400">
              {formattedTime}
            </span>

            <button
              onClick={handleCopyMessage}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
