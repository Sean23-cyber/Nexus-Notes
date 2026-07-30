export type NoteLifecycleState = 'active' | 'archived' | 'trash';

export interface NoteVersion {
  id: string;
  noteId: string;
  content: string;
  title: string;
  savedAt: string;
  changeSummary?: string;
}

export interface Attachment {
  id: string;
  noteId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  preview: string;
  folder: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  state: NoteLifecycleState;
  category: string;
  createdAt: string;
  updatedAt: string;
  versions?: NoteVersion[];
  attachments?: Attachment[];
}

export interface SearchFilter {
  query: string;
  folder?: string;
  tag?: string;
  state?: NoteLifecycleState;
  isFavorite?: boolean;
}

export interface SearchResult {
  note: Note;
  score: number;
  matchedSnippet: string;
  highlights: string[];
}

export type AIActionType =
  | 'rewrite'
  | 'summarize'
  | 'expand'
  | 'continue'
  | 'fix_grammar'
  | 'translate'
  | 'generate_title'
  | 'generate_tags'
  | 'suggest_folder';

export interface AIActionRequest {
  action: AIActionType;
  content: string;
  instruction?: string;
  targetLanguage?: string;
}

export interface AIActionResponse {
  result: string;
  title?: string;
  tags?: string[];
  suggestedFolder?: string;
  modelUsed: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'sepia';
  aiProvider: 'groq' | 'openrouter' | 'ollama';
  groqModel?: string;
  openRouterModel?: string;
  ollamaEndpoint?: string;
  autoSaveIntervalMs: number;
  defaultFolder: string;
}
