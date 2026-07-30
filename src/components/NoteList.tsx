import React from 'react';
import { PenSquare, Search, Pin, Star, Archive, Trash2 } from 'lucide-react';
import { Note } from '../types';

interface NoteListProps {
  activeFolder: string;
  selectedTag: string | null;
  notes: Note[];
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateNote: () => void;
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  activeFolder,
  selectedTag,
  notes,
  selectedNoteId,
  setSelectedNoteId,
  searchQuery,
  setSearchQuery,
  onCreateNote,
  onToggleFavorite,
  onTogglePin
}) => {
  // Format date concisely
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <section className="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full select-none">
      {/* Header with New Note Button */}
      <div className="h-14 border-b border-slate-100 flex items-center px-4 justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-sm text-slate-900">
            {selectedTag ? `#${selectedTag}` : activeFolder}
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>
        <button
          onClick={onCreateNote}
          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <PenSquare className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes (FTS5)..."
            className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Note List Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No notes found. Create a new note to start.
          </div>
        ) : (
          notes.map((note) => {
            const isSelected = note.id === selectedNoteId;
            return (
              <div
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`p-4 cursor-pointer transition-colors relative group ${
                  isSelected
                    ? 'bg-indigo-50/40 border-l-2 border-indigo-600'
                    : 'hover:bg-slate-50 border-l-2 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5">
                    {note.isPinned && (
                      <Pin className="w-3 h-3 text-amber-500 fill-amber-500 rotate-45" />
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-tight ${
                        isSelected ? 'text-indigo-600' : 'text-slate-400 font-mono'
                      }`}
                    >
                      {note.category || note.folder}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDate(note.updatedAt)}
                  </span>
                </div>

                <h3
                  className={`text-sm mb-1 line-clamp-1 ${
                    isSelected ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'
                  }`}
                >
                  {note.title || 'Untitled Note'}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                  {note.preview || 'Empty note content...'}
                </p>

                {/* Tags & Action Icons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-wrap">
                    {note.tags &&
                      note.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.2 bg-slate-100 border border-slate-200 text-slate-500 rounded text-[10px] font-mono"
                        >
                          #{t}
                        </span>
                      ))}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(note.id);
                      }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700"
                      title={note.isPinned ? 'Unpin' : 'Pin note'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(note.id);
                      }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-amber-500"
                      title={note.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                    >
                      <Star
                        className={`w-3 h-3 ${
                          note.isFavorite ? 'text-amber-500 fill-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
