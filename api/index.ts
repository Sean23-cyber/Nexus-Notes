import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const currentFilename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const currentDirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(currentFilename);

interface NoteRecord {
  id: string;
  title: string;
  content: string;
  preview: string;
  folder: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  state: 'active' | 'archived' | 'trash';
  category: string;
  createdAt: string;
  updatedAt: string;
  versions: Array<{
    id: string;
    noteId: string;
    content: string;
    title: string;
    savedAt: string;
    changeSummary?: string;
  }>;
}

const INITIAL_NOTES: NoteRecord[] = [
  {
    id: 'note-1',
    title: 'Architectural Design Patterns',
    content: `Apply Clean Architecture principles adapted pragmatically for a FastAPI + SQLAlchemy application. Our primary goal is high maintainability and testability.`,
    preview: 'Apply Clean Architecture principles adapted pragmatically for a FastAPI...',
    folder: 'Inbox',
    tags: ['arch', 'spec', 'v1'],
    isPinned: true,
    isFavorite: true,
    state: 'active',
    category: 'Technical Specification',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    versions: []
  }
];

let notesStore: NoteRecord[] = [...INITIAL_NOTES];

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/notes', (req, res) => {
    const { folder, tag, state = 'active', isFavorite } = req.query;
    let filtered = notesStore.filter((n) => n.state === state);
    if (folder && folder !== 'All Notes') filtered = filtered.filter((n) => n.folder === folder);
    if (tag) filtered = filtered.filter((n) => n.tags.includes(String(tag)));
    if (isFavorite === 'true') filtered = filtered.filter((n) => n.isFavorite);
    res.json(filtered);
  });

  app.post('/api/ai/action', async (req, res) => {
    const { action, content, instruction, targetLanguage, provider = 'openrouter', openRouterModel } = req.body;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const targetModel = openRouterModel || 'openrouter/free';

    if (openRouterKey) {
      try {
        const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': 'https://github.com/Sean23-cyber/Nexus-Notes',
            'X-Title': 'Nexus Notes',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              { role: 'system', content: 'You are an AI assistant in a local-first notes app.' },
              { role: 'user', content: `${action}: ${content}` }
            ]
          })
        });

        if (openRouterRes.ok) {
          const orJson: any = await openRouterRes.json();
          const textResult = orJson?.choices?.[0]?.message?.content || 'Done';
          return res.json({ result: textResult, modelUsed: `${targetModel} (OpenRouter)` });
        }
      } catch (err: any) {
        console.error('OpenRouter error:', err);
      }
    }

    return res.json({
      result: content ? `${content}\n\n[Refined Output]` : 'Done',
      modelUsed: 'Local Fallback'
    });
  });

  return app;
}

const app = createApp();
export default app;
