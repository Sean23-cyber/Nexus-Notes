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
    content: `Apply Clean Architecture principles adapted pragmatically for a FastAPI + SQLAlchemy application. Our primary goal is high maintainability and testability.

## 1. Repository Pattern
All direct database access goes through repository classes. No raw SQLAlchemy queries should be scattered through route handlers or services.

\`\`\`python
class NoteRepository(BaseRepository):
    def get_by_id(id: UUID):
        # Repository implementation details here
        pass
\`\`\`

## 2. AI Assistant Layer
AI features must be context-aware but non-intrusive. We use local LLMs via Ollama or server-side OpenRouter to maintain privacy.`,
    preview: 'Apply Clean Architecture principles adapted pragmatically for a FastAPI + SQLAlchemy application...',
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

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 2. Get Notes
  app.get('/api/notes', (req, res) => {
    const { folder, state = 'active', tag, isFavorite } = req.query;
    let filtered = notesStore.filter((n) => n.state === state);

    if (folder && folder !== 'All Notes') {
      if (folder === 'Favorites') {
        filtered = filtered.filter((n) => n.isFavorite);
      } else {
        filtered = filtered.filter((n) => n.folder === folder);
      }
    }

    if (isFavorite === 'true') {
      filtered = filtered.filter((n) => n.isFavorite);
    }

    if (tag) {
      filtered = filtered.filter((n) => n.tags.includes(String(tag)));
    }

    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    res.json(filtered);
  });

  // 3. Create Note (Fix for New Button)
  app.post('/api/notes', (req, res) => {
    const { title = 'Untitled Note', content = '', folder = 'Inbox', tags = [], category = 'General' } = req.body;
    const now = new Date().toISOString();
    const preview = content.slice(0, 150).replace(/\n/g, ' ') || 'Empty note...';

    const newNote: NoteRecord = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      content,
      preview,
      folder,
      tags,
      isPinned: false,
      isFavorite: false,
      state: 'active',
      category,
      createdAt: now,
      updatedAt: now,
      versions: [
        {
          id: `ver-${Date.now()}`,
          noteId: '',
          title,
          content,
          savedAt: now,
          changeSummary: 'Created note'
        }
      ]
    };
    newNote.versions[0].noteId = newNote.id;

    notesStore.unshift(newNote);
    res.status(201).json(newNote);
  });

  // 4. Update Note (Auto-save)
  app.put('/api/notes/:id', (req, res) => {
    const noteIndex = notesStore.findIndex((n) => n.id === req.params.id);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const currentNote = notesStore[noteIndex];
    const { title, content, folder, tags, category, isPinned, isFavorite, state } = req.body;

    const now = new Date().toISOString();
    const updatedContent = content !== undefined ? content : currentNote.content;
    const updatedTitle = title !== undefined ? title : currentNote.title;
    const preview = updatedContent.slice(0, 150).replace(/\n/g, ' ') || 'Empty note...';

    const updatedNote: NoteRecord = {
      ...currentNote,
      title: updatedTitle,
      content: updatedContent,
      preview,
      folder: folder !== undefined ? folder : currentNote.folder,
      tags: tags !== undefined ? tags : currentNote.tags,
      category: category !== undefined ? category : currentNote.category,
      isPinned: isPinned !== undefined ? isPinned : currentNote.isPinned,
      isFavorite: isFavorite !== undefined ? isFavorite : currentNote.isFavorite,
      state: state !== undefined ? state : currentNote.state,
      updatedAt: now
    };

    notesStore[noteIndex] = updatedNote;
    res.json(updatedNote);
  });

  // 5. Toggle Pin / Favorite / State
  app.patch('/api/notes/:id', (req, res) => {
    const note = notesStore.find((n) => n.id === req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    const fields = ['isPinned', 'isFavorite', 'state', 'folder', 'category'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (note as any)[field] = req.body[field];
      }
    });
    note.updatedAt = new Date().toISOString();
    res.json(note);
  });

  // 6. Delete Note
  app.delete('/api/notes/:id', (req, res) => {
    notesStore = notesStore.filter((n) => n.id !== req.params.id);
    res.json({ message: 'Note deleted' });
  });

  // 7. Search
  app.get('/api/search', (req, res) => {
    const q = (req.query.q as string || '').trim().toLowerCase();
    if (!q) return res.json([]);

    const results = notesStore
      .filter((n) => n.state === 'active' && (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)))
      .map((note) => ({
        note,
        score: 1,
        matchedSnippet: note.preview,
        highlights: [q]
      }));

    res.json(results);
  });

  // 8. AI Action (Powered by Groq Cloud / OpenRouter / Local fallback)
  app.post('/api/ai/action', async (req, res) => {
    const { action, content, instruction, targetLanguage, provider = 'groq', groqModel, openRouterModel } = req.body;
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    let prompt = `${action}: ${content}`;
    if (instruction) prompt += `\nInstruction: ${instruction}`;

    // 1. Try Groq Cloud if selected and valid GROQ_API_KEY is configured
    if (provider === 'groq' && groqKey && groqKey !== 'YOUR_GROQ_API_KEY') {
      try {
        const modelToUse = groqModel || 'llama-3.3-70b-versatile';
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelToUse,
            messages: [
              { role: 'system', content: 'You are an AI assistant integrated into a local-first note taking app. Provide direct, helpful, concise responses without conversational fluff.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3
          })
        });

        if (groqRes.ok) {
          const groqJson: any = await groqRes.json();
          const textResult = groqJson?.choices?.[0]?.message?.content || 'AI complete';
          return res.json({ result: textResult, modelUsed: `${modelToUse} (Groq)` });
        }
      } catch (err: any) {
        console.error('Groq API error:', err);
      }
    }

    // 2. Try OpenRouter as fallback/provider
    if (openRouterKey) {
      try {
        const targetModel = openRouterModel || 'openrouter/free';
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
              { role: 'system', content: 'You are an AI assistant integrated into a local-first note taking app.' },
              { role: 'user', content: prompt }
            ]
          })
        });

        if (openRouterRes.ok) {
          const orJson: any = await openRouterRes.json();
          const textResult = orJson?.choices?.[0]?.message?.content || 'AI complete';
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
