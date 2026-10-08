import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 justify-start max-w-3xl mr-auto animate-fade-in">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
        <Sparkles className="w-4 h-4 animate-pulse" />
      </div>

      <div className="flex flex-col gap-1 items-start">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-dot-1"></span>
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-dot-2"></span>
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-dot-3"></span>
          </div>
          <span className="text-xs text-slate-400 font-medium ml-1">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};
