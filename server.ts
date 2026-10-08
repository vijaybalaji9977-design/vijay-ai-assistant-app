import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Set 50MB limit to support base64 images, audio clips, and documents
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API endpoint for Gemini chat with multimodal attachments
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages list is required.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Transform messages into Gemini contents structure
      const contents = [];

      for (const msg of messages) {
        if (!msg) continue;
        const role = msg.role === 'assistant' ? 'model' : 'user';
        const parts: any[] = [];

        if (role === 'model') {
          if (msg.content && msg.content.trim()) {
            parts.push({ text: msg.content });
          }
        } else {
          // Process attachments if present
          if (msg.attachments && Array.isArray(msg.attachments)) {
            for (const att of msg.attachments) {
              if (!att || !att.dataUrl) continue;
              const base64Data = att.dataUrl.split(',')[1] || att.dataUrl;
              const lowerName = (att.name || '').toLowerCase();

              if (att.category === 'image') {
                let mimeType = att.type || 'image/jpeg';
                if (lowerName.endsWith('.png')) mimeType = 'image/png';
                else if (lowerName.endsWith('.webp')) mimeType = 'image/webp';
                else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) mimeType = 'image/jpeg';

                parts.push({
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                });
              } else if (att.category === 'audio') {
                let mimeType = 'audio/mp3';
                if (lowerName.endsWith('.wav') || att.type?.includes('wav')) {
                  mimeType = 'audio/wav';
                } else if (lowerName.endsWith('.m4a') || att.type?.includes('m4a') || att.type?.includes('aac')) {
                  mimeType = 'audio/m4a';
                } else if (lowerName.endsWith('.mp3') || att.type?.includes('mpeg') || att.type?.includes('mp3')) {
                  mimeType = 'audio/mp3';
                }

                parts.push({
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                });
              } else if (att.category === 'document') {
                if (lowerName.endsWith('.pdf') || att.type === 'application/pdf') {
                  parts.push({
                    inlineData: {
                      mimeType: 'application/pdf',
                      data: base64Data,
                    },
                  });
                } else if (lowerName.endsWith('.docx')) {
                  try {
                    const buf = Buffer.from(base64Data, 'base64');
                    const extracted = await mammoth.extractRawText({ buffer: buf });
                    parts.push({
                      text: `[Attached Word Document: ${att.name}]\nContent:\n${extracted.value}`,
                    });
                  } catch (docErr) {
                    console.warn('DOCX parse warning:', docErr);
                    parts.push({
                      text: `[Attached Document: ${att.name} (Word document attached)]`,
                    });
                  }
                } else if (lowerName.endsWith('.txt') || att.type === 'text/plain') {
                  const buf = Buffer.from(base64Data, 'base64');
                  const text = buf.toString('utf-8');
                  parts.push({
                    text: `[Attached Text File: ${att.name}]\nContent:\n${text}`,
                  });
                } else {
                  // Fallback for .doc or other text documents
                  try {
                    const buf = Buffer.from(base64Data, 'base64');
                    const cleanText = buf
                      .toString('utf-8')
                      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
                      .trim();
                    if (cleanText.length > 20) {
                      parts.push({
                        text: `[Attached Document: ${att.name}]\nContent preview:\n${cleanText.slice(0, 40000)}`,
                      });
                    } else {
                      parts.push({
                        text: `[Attached Document: ${att.name}]`,
                      });
                    }
                  } catch {
                    parts.push({
                      text: `[Attached Document: ${att.name}]`,
                    });
                  }
                }
              }
            }
          }

          // Append user text
          if (msg.content && msg.content.trim()) {
            parts.push({ text: msg.content.trim() });
          } else if (parts.length > 0) {
            // User sent attachments without specific text prompt
            parts.push({
              text: 'Please analyze and explain the attached file(s) in detail and highlight key insights.',
            });
          }
        }

        if (parts.length > 0) {
          contents.push({ role, parts });
        }
      }

      if (contents.length === 0) {
        return res.status(400).json({ error: 'No valid message content or attachments provided.' });
      }

      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let response;
      let lastError: any = null;

      for (const model of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
              systemInstruction:
                'You are "My AI Assistant", a friendly, knowledgeable, thoughtful, and articulate multimodal AI chatbot. ' +
                'You can thoroughly analyze uploaded images, documents (PDF, DOC, DOCX, TXT), and audio files (MP3, WAV, M4A). ' +
                'Provide helpful, clear, and well-structured answers using clean markdown formatting when appropriate. ' +
                'Keep replies engaging, polite, and to the point.',
            },
          });
          if (response && response.text) break;
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${model} warning:`, err?.message || err);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error('Unable to contact Gemini AI.');
      }

      return res.json({ reply: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      let errorMessage = 'Failed to generate response from Gemini AI.';
      if (error?.message) {
        try {
          const parsed = JSON.parse(error.message);
          if (parsed?.error?.message) {
            errorMessage = parsed.error.message;
          } else {
            errorMessage = error.message;
          }
        } catch {
          errorMessage = error.message;
        }
      }
      return res.status(500).json({ error: errorMessage });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
