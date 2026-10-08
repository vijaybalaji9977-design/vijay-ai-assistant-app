/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { ChatMessage, FileAttachment } from './types';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessageItem } from './components/ChatMessageItem';
import { TypingIndicator } from './components/TypingIndicator';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';

const SESSION_STORAGE_KEY = 'my_ai_assistant_session_messages';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback if sessionStorage is disabled or corrupted
    }
    return [];
  });

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages with sessionStorage to keep session history intact
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage quota might be exceeded due to large base64 data URLs.
      // Store a lightweight version if needed so session doesn't fail.
      try {
        const lightweight = messages.map((m) => ({
          ...m,
          attachments: m.attachments?.map((a) => ({
            ...a,
            // Keep preview data URL if under 100KB, otherwise preserve metadata
            dataUrl: a.dataUrl.length > 100000 ? '' : a.dataUrl,
          })),
        }));
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(lightweight));
      } catch {
        // Safe fallback
      }
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive or loading state changes
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleAddAttachments = (newAttachments: FileAttachment[]) => {
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    const currentAttachments = [...attachments];

    // Must have at least text or 1 attachment
    if ((!text && currentAttachments.length === 0) || isLoading) return;

    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get a response from Gemini AI.');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: 'assistant',
        content: data.reply || 'No response received.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err?.message || 'Something went wrong. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setAttachments([]);
    setError(null);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMsg) {
        if (lastUserMsg.attachments && lastUserMsg.attachments.length > 0) {
          setAttachments(lastUserMsg.attachments);
        }
        handleSendMessage(lastUserMsg.content);
      }
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Header */}
      <ChatHeader onClearChat={handleClearChat} messageCount={messages.length} />

      {/* Main chat body */}
      <main className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
          {messages.length === 0 ? (
            <EmptyState onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
          ) : (
            <div className="space-y-6 flex-1">
              {messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}

              {/* Typing indicator when waiting for Gemini */}
              {isLoading && <TypingIndicator />}

              {/* Error banner */}
              {error && (
                <div className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm shadow-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-rose-100/70 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 transition-colors cursor-pointer shrink-0 ml-3"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Bottom input bar with multimodal attachment support */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSendMessage={() => handleSendMessage()}
        isLoading={isLoading}
        attachments={attachments}
        onAddAttachments={handleAddAttachments}
        onRemoveAttachment={handleRemoveAttachment}
      />
    </div>
  );
}
