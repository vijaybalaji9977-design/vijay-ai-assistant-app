export type FileCategory = 'image' | 'document' | 'audio';

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  dataUrl: string; // base64 Data URL (e.g. data:image/png;base64,...)
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: FileAttachment[];
}
