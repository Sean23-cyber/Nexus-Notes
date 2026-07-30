import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Share2,
  Clock,
  Archive,
  Trash2,
  RotateCcw,
  Tag,
  Folder,
  Check,
  Plus,
  Paperclip,
  FileText,
  Star,
  BookOpen
} from 'lucide-react';
import { Note } from '../types';

interface EditorProps {
  note: Note | null;
  onUpdateNote: (updated: Partial<Note>) => void;
  onOpenAIModal: (actionType?: string) => void;
  onOpenVersionHistory: () => void;
  onArchiveNote: (id: string) => void;
  onTrashNote: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onDeletePermanently: (id: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
  note,
  onUpdateNote,
  onOpenAIModal,
  onOpenVersionHistory,
  onArchiveNote,
  onTrashNote,
  onRestoreNote,
  onDeletePermanently
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  if (!note) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[#F9FAFB] text-slate-400 text-sm">
        Select a note or click "New" to start writing.
      </main>
    );
  }

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().toLowerCase().replace(/^#/, '');
    if (!note.tags.includes(cleanTag)) {
      onUpdateNote({ tags: [...note.tags, cleanTag] });
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateNote({ tags: note.tags.filter((t) => t !== tagToRemove) });
  };

  return (
    <main className="flex-1 flex flex-col relative bg-[#F9FAFB] h-full overflow-hidden">
      {/* Editor Top Bar */}
      <header className="h-14 border-b border-slate-200/80 bg-white/70 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0 select-none">
        <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
          <span className="hover:text-slate-900 cursor-pointer transition-colors">File</span>
          <span className="hover:text-slate-900 cursor-pointer transition-colors">Edit</span>
          <span className="hover:text-slate-900 cursor-pointer transition-colors">Insert</span>
          <span className="hover:text-slate-900 cursor-pointer transition-colors">Format</span>
        </div>

        <div className="flex items-center gap-2">
          {note.state === 'active' && (
            <>
              <button
                onClick={onOpenVersionHistory}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors flex items-center gap-1.5"
                title="Version History"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>History</span>
              </button>

              <button
                onClick={() => onArchiveNote(note.id)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                title="Archive Note"
              >
                <Archive className="w-4 h-4" />
              </button>

              <button
                onClick={() => onTrashNote(note.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                title="Move to Trash"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAIModal()}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 border border-indigo-200/60"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Assistant</span>
                <kbd className="text-[10px] bg-white text-indigo-500 px-1 py-0.5 rounded border border-indigo-200 font-mono ml-0.5">
                  ⌘K
                </kbd>
              </button>
            </>
          )}

          {note.state === 'archived' && (
            <button
              onClick={() => onRestoreNote(note.id)}
              className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Note</span>
            </button>
          )}

          {note.state === 'trash' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRestoreNote(note.id)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore</span>
              </button>
              <button
                onClick={() => onDeletePermanently(note.id)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Canvas / Editor Scroll Area */}
      <article className="flex-1 overflow-y-auto p-10 max-w-3xl mx-auto w-full select-text">
        {/* Metadata Banner */}
        <div className="text-xs font-mono text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2 flex-wrap">
          <span>
            Created {new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span>•</span>

          {/* Category Selector */}
          <select
            value={note.category || 'Technical Specification'}
            onChange={(e) => onUpdateNote({ category: e.target.value })}
            className="bg-transparent font-semibold text-indigo-600 cursor-pointer focus:outline-none border-b border-transparent hover:border-indigo-200 uppercase tracking-wider"
          >
            <option value="Technical Specification">Technical Specification</option>
            <option value="Architecture">Architecture</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="General">General</option>
          </select>

          <span>•</span>

          {/* Folder Selector */}
          <select
            value={note.folder || 'Inbox'}
            onChange={(e) => onUpdateNote({ folder: e.target.value })}
            className="bg-transparent font-semibold text-slate-600 cursor-pointer focus:outline-none border-b border-transparent hover:border-slate-300"
          >
            <option value="Inbox">Folder: Inbox</option>
            <option value="Projects">Folder: Projects</option>
            <option value="Research">Folder: Research</option>
            <option value="Personal">Folder: Personal</option>
          </select>
        </div>

        {/* Note Title Input */}
        <input
          type="text"
          value={note.title}
          onChange={(e) => onUpdateNote({ title: e.target.value })}
          placeholder="Note Title..."
          className="w-full text-4xl font-bold text-slate-900 mb-4 tracking-tight bg-transparent focus:outline-none border-b border-transparent focus:border-slate-200 pb-1"
        />

        {/* Tags Bar */}
        <div className="flex items-center gap-1.5 flex-wrap mb-8">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          {note.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-xs font-mono flex items-center gap-1 group"
            >
              #{t}
              <button
                onClick={() => handleRemoveTag(t)}
                className="text-slate-300 group-hover:text-rose-500 font-bold ml-0.5"
              >
                ×
              </button>
            </span>
          ))}

          {isAddingTag ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="tag name..."
                className="px-2 py-0.5 bg-white border border-indigo-300 rounded text-xs font-mono outline-none w-24 text-slate-800"
              />
              <button
                onClick={handleAddTag}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingTag(true)}
              className="px-2 py-0.5 border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 rounded text-xs font-mono flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Tag
            </button>
          )}
        </div>

        {/* Note Content Textarea / Live Editor */}
        <textarea
          value={note.content}
          onChange={(e) => onUpdateNote({ content: e.target.value })}
          placeholder="Start typing your thoughts using markdown... (# Header, - List, ``` code)"
          className="w-full h-[500px] bg-transparent text-slate-800 text-base leading-relaxed font-normal resize-none focus:outline-none"
        />
      </article>

      {/* Floating AI Helper Pill */}
      <div className="absolute bottom-6 right-6 z-10 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg rounded-full px-4 py-2 flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 border-r border-slate-200 pr-4">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>AI Ready</span>
          </div>
          <button
            onClick={() => onOpenAIModal()}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-medium"
          >
            <kbd className="font-mono bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
              ⌘ K
            </kbd>
            <span>Command Palette</span>
          </button>
        </div>
      </div>
    </main>
  );
};
