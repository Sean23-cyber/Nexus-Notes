import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, BookOpen, PenTool, Check, ArrowRight, Tag, Folder } from 'lucide-react';
import { Note, SearchResult } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  onSelectNote: (id: string) => void;
  onTriggerAIAction: (actionType: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  searchResults,
  onSelectNote,
  onTriggerAIAction
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalItems = searchResults.length + 3; // notes + 3 AI quick actions

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < searchResults.length) {
        onSelectNote(searchResults[selectedIndex].note.id);
        onClose();
      } else {
        const aiActionIndex = selectedIndex - searchResults.length;
        if (aiActionIndex === 0) onTriggerAIAction('rewrite');
        if (aiActionIndex === 1) onTriggerAIAction('summarize');
        if (aiActionIndex === 2) onTriggerAIAction('generate_tags');
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] flex items-start justify-center pt-20 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to search notes (FTS5) or run AI commands..."
            className="flex-1 outline-none text-sm font-medium text-slate-800 bg-transparent placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="text-[10px] font-bold bg-slate-200/80 text-slate-500 px-1.5 py-0.5 rounded hover:bg-slate-300 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-96 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5">
            Matching Notes (SQLite FTS5)
          </div>

          {searchResults.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-slate-400">
              No matching notes found for "{searchQuery}".
            </div>
          ) : (
            searchResults.map((res, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={res.note.id}
                  onClick={() => {
                    onSelectNote(res.note.id);
                    onClose();
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center text-xs font-mono flex-shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    #
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div
                      className={`text-sm font-medium truncate ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {res.note.title}
                    </div>
                    <div
                      className={`text-xs truncate ${
                        isSelected ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      {res.matchedSnippet}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono flex-shrink-0 ${
                      isSelected ? 'opacity-100 text-white' : 'opacity-0 text-slate-400'
                    }`}
                  >
                    ⏎ Enter
                  </span>
                </div>
              );
            })
          )}

          {/* AI Quick Actions */}
          <div className="mt-2 pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5">
              AI Assistant Commands
            </div>

            <div
              onClick={() => {
                onTriggerAIAction('rewrite');
                onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-xs font-medium ${
                selectedIndex === searchResults.length
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Rewrite & Polish Note Content</span>
              <span className="ml-auto text-[10px] font-mono opacity-70">⌘ R</span>
            </div>

            <div
              onClick={() => {
                onTriggerAIAction('summarize');
                onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-xs font-medium ${
                selectedIndex === searchResults.length + 1
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Summarize Key Insights</span>
              <span className="ml-auto text-[10px] font-mono opacity-70">⌘ S</span>
            </div>

            <div
              onClick={() => {
                onTriggerAIAction('generate_tags');
                onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-xs font-medium ${
                selectedIndex === searchResults.length + 2
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Tag className="w-4 h-4 text-indigo-500" />
              <span>Auto-Generate Tags</span>
              <span className="ml-auto text-[10px] font-mono opacity-70">⌘ T</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono">FTS5 Full-Text Engine • Sub-100ms</span>
          <div className="flex gap-3 italic">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
        </div>
      </div>
    </div>
  );
};
