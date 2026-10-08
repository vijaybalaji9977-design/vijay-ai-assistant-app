import React, { useState } from 'react';
import { FileText, Music, Download, ExternalLink, X, Eye } from 'lucide-react';
import { FileAttachment } from '../types';
import { formatFileSize } from '../utils/fileHelpers';

interface MessageAttachmentsProps {
  attachments?: FileAttachment[];
}

export const MessageAttachments: React.FC<MessageAttachmentsProps> = ({ attachments }) => {
  const [selectedImage, setSelectedImage] = useState<FileAttachment | null>(null);

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="space-y-2 mb-2 w-full">
      {/* Lightbox Modal for Image Zoom */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.dataUrl}
              alt={selectedImage.name}
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white/80 text-xs mt-2 font-medium">
              {selectedImage.name} ({formatFileSize(selectedImage.size)})
            </p>
          </div>
        </div>
      )}

      {/* Grid or list of attachments */}
      <div className="flex flex-wrap gap-2">
        {attachments.map((att) => {
          const ext = att.name.split('.').pop()?.toUpperCase() || 'FILE';

          if (att.category === 'image') {
            return (
              <div
                key={att.id}
                className="relative group rounded-xl overflow-hidden border border-indigo-400/30 bg-slate-900/10 max-w-[240px]"
              >
                <img
                  src={att.dataUrl}
                  alt={att.name}
                  className="w-full h-36 object-cover cursor-pointer hover:scale-102 transition-transform duration-200"
                  onClick={() => setSelectedImage(att)}
                />
                <div
                  onClick={() => setSelectedImage(att)}
                  className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                >
                  <Eye className="w-5 h-5 drop-shadow" />
                </div>
                <div className="p-1.5 bg-slate-900/60 backdrop-blur-xs text-[11px] text-white flex items-center justify-between">
                  <span className="truncate max-w-[140px]" title={att.name}>
                    {att.name}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    {formatFileSize(att.size)}
                  </span>
                </div>
              </div>
            );
          }

          if (att.category === 'audio') {
            return (
              <div
                key={att.id}
                className="w-full sm:min-w-[280px] p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-300/30 text-white backdrop-blur-xs"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-md bg-purple-500/30 text-purple-200 flex items-center justify-center shrink-0">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate" title={att.name}>
                      {att.name}
                    </p>
                    <span className="text-[10px] text-indigo-200/80">
                      {ext} • {formatFileSize(att.size)}
                    </span>
                  </div>
                </div>

                <audio
                  controls
                  src={att.dataUrl}
                  className="w-full h-8 rounded-lg mt-1"
                />
              </div>
            );
          }

          // Document
          return (
            <div
              key={att.id}
              className="flex items-center gap-2.5 p-2 px-3 rounded-xl bg-indigo-950/20 border border-indigo-300/30 text-white backdrop-blur-xs max-w-[260px]"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-200 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" title={att.name}>
                  {att.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1 rounded">
                    {ext}
                  </span>
                  <span className="text-[10px] text-indigo-200/80">
                    {formatFileSize(att.size)}
                  </span>
                </div>
              </div>

              <a
                href={att.dataUrl}
                download={att.name}
                className="text-indigo-200 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};
