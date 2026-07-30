import React from 'react';
import {
  Inbox,
  FileText,
  Star,
  Folder,
  Archive,
  Trash2,
  Tag,
  Settings,
  HardDrive,
  Sun,
  Moon,
  Coffee
} from 'lucide-react';
import { Note } from '../types';

interface SidebarProps {
  activeFolder: string;
  setActiveFolder: (folder: string) => void;
  notes: Note[];
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  onOpenSettings: () => void;
  currentTheme?: 'light' | 'dark' | 'sepia';
  onCycleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeFolder,
  setActiveFolder,
  notes,
  selectedTag,
  setSelectedTag,
  onOpenSettings,
  currentTheme = 'light',
  onCycleTheme
}) => {
  const activeNotesCount = notes.filter((n) => n.state === 'active');
  const inboxCount = activeNotesCount.filter((n) => n.folder === 'Inbox').length;
  const projectsCount = activeNotesCount.filter((n) => n.folder === 'Projects').length;
  const favoritesCount = activeNotesCount.filter((n) => n.isFavorite).length;
  const archivedCount = notes.filter((n) => n.state === 'archived').length;
  const trashCount = notes.filter((n) => n.state === 'trash').length;

  // Extract all unique tags
  const allTags = Array.from(
    new Set(activeNotesCount.flatMap((n) => n.tags || []))
  );

  return (
    <aside className="w-64 flex-shrink-0 bg-[#F3F4F6] border-r border-slate-200 flex flex-col justify-between h-full select-none">
      <div className="overflow-y-auto flex-1">
        {/* App Logo & Branding */}
        <div className="p-4 flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
              N
            </div>
            <div>
              <span className="font-semibold tracking-tight text-slate-800 text-sm block">
                Nexus Notes
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                Local-First • FTS5
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Theme Switcher */}
            {onCycleTheme && (
              <button
                onClick={onCycleTheme}
                title={`Current Theme: ${currentTheme.toUpperCase()} (Click to change)`}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
              >
                {currentTheme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
                {currentTheme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
                {currentTheme === 'sepia' && <Coffee className="w-4 h-4 text-amber-700" />}
              </button>
            )}

            <button
              onClick={onOpenSettings}
              title="Settings"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Library Navigation */}
        <nav className="px-3 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2.5 my-2">
            Library
          </div>

          <button
            onClick={() => {
              setActiveFolder('Inbox');
              setSelectedTag(null);
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeFolder === 'Inbox' && !selectedTag
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Inbox className="w-4 h-4 opacity-70" />
            <span>Inbox</span>
            <span className="ml-auto text-xs opacity-50 font-mono">{inboxCount}</span>
          </button>

          <button
            onClick={() => {
              setActiveFolder('All Notes');
              setSelectedTag(null);
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeFolder === 'All Notes' && !selectedTag
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4 opacity-70" />
            <span>All Notes</span>
            <span className="ml-auto text-xs opacity-50 font-mono">
              {activeNotesCount.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveFolder('Favorites');
              setSelectedTag(null);
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeFolder === 'Favorites' && !selectedTag
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Star className="w-4 h-4 opacity-70 text-amber-500 fill-amber-500/20" />
            <span>Favorites</span>
            <span className="ml-auto text-xs opacity-50 font-mono">
              {favoritesCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveFolder('Projects');
              setSelectedTag(null);
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeFolder === 'Projects' && !selectedTag
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Folder className="w-4 h-4 opacity-70" />
            <span>Projects</span>
            <span className="ml-auto text-xs opacity-50 font-mono">{projectsCount}</span>
          </button>

          <button
            onClick={() => {
              setActiveFolder('Archive');
              setSelectedTag(null);
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeFolder === 'Archive' && !selectedTag
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Archive className="w-4 h-4 opacity-70" />
            <span>Archive</span>
            <span className="ml-auto text-xs opacity-50 font-mono">{archivedCount}</span>
          </button>

          <button
            onClick={() => {
              setActiveFolder('Trash');
              setSelectedTag(null);
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeFolder === 'Trash' && !selectedTag
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Trash2 className="w-4 h-4 opacity-70 text-rose-500" />
            <span>Trash</span>
            <span className="ml-auto text-xs opacity-50 font-mono">{trashCount}</span>
          </button>

          {/* Tags Section */}
          <div className="pt-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2.5 mb-2">
            Tags
          </div>
          <div className="flex flex-wrap gap-1.5 px-2">
            {allTags.length === 0 ? (
              <span className="text-xs text-slate-400 italic px-1">No tags yet</span>
            ) : (
              allTags.map((t) => {
                const isSelected = selectedTag === t;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTag(null);
                      } else {
                        setSelectedTag(t);
                      }
                    }}
                    className={`px-2 py-0.5 border rounded text-xs font-mono transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    #{t}
                  </button>
                );
              })
            )}
          </div>
        </nav>
      </div>

      {/* Footer Status */}
      <div className="p-4 border-t border-slate-200 bg-[#EFEFEF]/50">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Local-first Sync Active</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
          SQLite WAL Mode • Zero Lock-In
        </div>
      </div>
    </aside>
  );
};
