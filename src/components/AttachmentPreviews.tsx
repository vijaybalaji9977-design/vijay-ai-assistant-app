import React from 'react';
import { X, FileText, Music, Image as ImageIcon } from 'lucide-react';
import { FileAttachment } from '../types';
import { formatFileSize } from '../utils/fileHelpers';

interface AttachmentPreviewsProps {
  attachments: FileAttachment[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const AttachmentPreviews: React.FC<AttachmentPreviewsProps> = ({
  attachments,
  onRemove,
  disabled = false,
}) => {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2.5 p-2.5 mb-2 bg-slate-50/80 rounded-xl border border-slate-200/70 max-h-56 overflow-y-auto custom-scrollbar">
      {attachments.map((att) => {
        const ext = att.name.split('.').pop()?.toUpperCase() || 'FILE';

        if (att.category === 'image') {
          return (
            <div
              key={att.id}
              className="relative group flex items-center gap-2.5 p-1.5 pr-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all max-w-[220px]"
            >
              {/* Image thumbnail preview */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                <img
                  src={att.dataUrl}
                  alt={att.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-medium text-slate-800 truncate" title={att.name}>
                  {att.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1 rounded">
                    {ext}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatFileSize(att.size)}
                  </span>
                </div>
              </div>

              {/* Remove button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemove(att.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-800 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  title="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        }

        if (att.category === 'audio') {
          return (
            <div
              key={att.id}
              className="relative group flex flex-col gap-1.5 p-2 bg-white rounded-xl border border-purple-200/80 shadow-2xs hover:border-purple-300 transition-all w-full sm:w-auto sm:min-w-[280px]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate max-w-[180px]" title={att.name}>
                      {att.name}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {ext} • {formatFileSize(att.size)}
                    </span>
                  </div>
                </div>

                {/* Remove button */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onRemove(att.id)}
                    className="w-5 h-5 bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-600 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove audio"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Audio player preview */}
              <audio
                controls
                src={att.dataUrl}
                className="w-full h-8 mt-1 scale-95 origin-left"
              />
            </div>
          );
        }

        // Documents: PDF, DOC, DOCX, TXT
        return (
          <div
            key={att.id}
            className="relative group flex items-center gap-2.5 p-2 pr-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all max-w-[240px]"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <p className="text-xs font-medium text-slate-800 truncate" title={att.name}>
                {att.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded">
                  {ext}
                </span>
                <span className="text-[10px] text-slate-400">
                  {formatFileSize(att.size)}
                </span>
              </div>
            </div>

            {/* Remove button */}
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemove(att.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-800 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                title="Remove document"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
