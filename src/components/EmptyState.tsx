import React from 'react';
import { Bot, Lightbulb, Image as ImageIcon, FileText, Music, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    icon: ImageIcon,
    title: 'Analyze images',
    prompt: 'Can you describe what is in this image, identify objects, and explain the context?',
  },
  {
    icon: FileText,
    title: 'Summarize documents',
    prompt: 'Please summarize the key takeaways and actionable points from this attached document.',
  },
  {
    icon: Music,
    title: 'Transcribe & understand audio',
    prompt: 'Can you listen to this audio clip, transcribe what is said, and summarize the key points?',
  },
  {
    icon: Lightbulb,
    title: 'General questions',
    prompt: 'How do multimodal AI models process text, vision, and audio simultaneously?',
  },
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 px-4 text-center max-w-2xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
        <Bot className="w-7 h-7" />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
        How can I help you today?
      </h2>
      <p className="text-sm text-slate-500 max-w-md mt-1.5 mb-2">
        Ask anything, or click <span className="font-semibold text-indigo-600">(+)</span> to attach images, documents, or audio clips.
      </p>

      {/* Multimodal feature badges */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
          <ImageIcon className="w-3.5 h-3.5" />
          Photos & Images
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
          <FileText className="w-3.5 h-3.5" />
          PDF, Word, Text
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/60">
          <Music className="w-3.5 h-3.5" />
          MP3, WAV, M4A
        </span>
      </div>

      {/* Suggested prompts grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group p-3.5 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all shadow-xs text-left cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-1.5 text-slate-700 group-hover:text-indigo-600">
                <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-xs font-semibold">{item.title}</span>
              </div>
              <p className="text-xs text-slate-500 group-hover:text-slate-700 line-clamp-2">
                "{item.prompt}"
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
