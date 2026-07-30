import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { Editor } from './components/Editor';
import { CommandPalette } from './components/CommandPalette';
import { AIModal } from './components/AIModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { Note, SearchResult, AppSettings, AIActionType } from './types';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>('Inbox');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiModalInitialAction, setAiModalInitialAction] = useState<AIActionType>('rewrite');
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // App Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedTheme = localStorage.getItem('nexus_theme') as 'light' | 'dark' | 'sepia' | null;
    return {
      theme: savedTheme || 'light',
      aiProvider: 'gemini',
      autoSaveIntervalMs: 1000,
      defaultFolder: 'Inbox'
    };
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    localStorage.setItem('nexus_theme', settings.theme);
  }, [settings.theme]);

  // Cycle through themes: light -> dark -> sepia -> light
  const handleCycleTheme = () => {
    setSettings((prev) => {
      const nextTheme =
        prev.theme === 'light' ? 'dark' : prev.theme === 'dark' ? 'sepia' : 'light';
      return { ...prev, theme: nextTheme };
    });
  };

  // Fetch initial notes from backend API
  const fetchNotes = async () => {
    try {
      let url = '/api/notes?state=active';
      if (activeFolder === 'Archive') {
        url = '/api/notes?state=archived';
      } else if (activeFolder === 'Trash') {
        url = '/api/notes?state=trash';
      } else if (activeFolder === 'Favorites') {
        url = '/api/notes?state=active&isFavorite=true';
      } else if (activeFolder !== 'All Notes') {
        url = `/api/notes?state=active&folder=${encodeURIComponent(activeFolder)}`;
      }

      if (selectedTag) {
        url += `&tag=${encodeURIComponent(selectedTag)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data: Note[] = await res.json();
        setNotes(data);
        if (data.length > 0 && !selectedNoteId) {
          setSelectedNoteId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [activeFolder, selectedTag]);

  // Execute FTS5 search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        );
        if (res.ok) {
          const results: SearchResult[] = await res.json();
          setSearchResults(results);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Global Keyboard Shortcuts (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;

  // Create Note
  const handleCreateNote = async () => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: 'Start typing your thoughts here...',
          folder: activeFolder === 'Archive' || activeFolder === 'Trash' || activeFolder === 'Favorites' ? 'Inbox' : activeFolder,
          tags: ['draft'],
          category: 'Technical Specification'
        })
      });

      if (res.ok) {
        const newNote: Note = await res.json();
        setNotes((prev) => [newNote, ...prev]);
        setSelectedNoteId(newNote.id);
      }
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  // Update Note (Auto-save)
  const handleUpdateNote = async (updatedFields: Partial<Note>) => {
    if (!selectedNoteId) return;

    // Optimistic UI update
    setNotes((prev) =>
      prev.map((n) => (n.id === selectedNoteId ? { ...n, ...updatedFields } : n))
    );

    try {
      await fetch(`/api/notes/${selectedNoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const newFav = !note.isFavorite;
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: newFav } : n))
    );

    await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavorite: newFav })
    });
  };

  // Toggle Pin
  const handleTogglePin = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const newPin = !note.isPinned;
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: newPin } : n))
    );

    await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: newPin })
    });
  };

  // Archive Note
  const handleArchiveNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: 'archived' })
    });
  };

  // Soft Delete / Move to Trash
  const handleTrashNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: 'trash' })
    });
  };

  // Restore Note
  const handleRestoreNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: 'active' })
    });
  };

  // Delete Permanently
  const handleDeletePermanently = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
  };

  // Restore Version
  const handleRestoreVersion = async (versionId: string) => {
    if (!selectedNoteId) return;

    try {
      const res = await fetch(
        `/api/notes/${selectedNoteId}/versions/${versionId}/restore`,
        { method: 'POST' }
      );
      if (res.ok) {
        const restored: Note = await res.json();
        setNotes((prev) => prev.map((n) => (n.id === restored.id ? restored : n)));
      }
    } catch (err) {
      console.error('Failed to restore version:', err);
    }
  };

  // Export Backup
  const handleExportBackup = () => {
    window.open('/api/backup/export', '_blank');
  };

  return (
    <div className="flex h-screen w-screen bg-[#F9FAFB] font-sans text-slate-900 overflow-hidden select-none">
      {/* 1. Global Sidebar */}
      <Sidebar
        activeFolder={activeFolder}
        setActiveFolder={setActiveFolder}
        notes={notes}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentTheme={settings.theme}
        onCycleTheme={handleCycleTheme}
      />

      {/* 2. Note List Column */}
      <NoteList
        activeFolder={activeFolder}
        selectedTag={selectedTag}
        notes={notes}
        selectedNoteId={selectedNoteId}
        setSelectedNoteId={setSelectedNoteId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateNote={handleCreateNote}
        onToggleFavorite={handleToggleFavorite}
        onTogglePin={handleTogglePin}
      />

      {/* 3. Main Editor Area */}
      <Editor
        note={selectedNote}
        onUpdateNote={handleUpdateNote}
        onOpenAIModal={(actionType) => {
          if (actionType) setAiModalInitialAction(actionType as AIActionType);
          setIsAIModalOpen(true);
        }}
        onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
        onArchiveNote={handleArchiveNote}
        onTrashNote={handleTrashNote}
        onRestoreNote={handleRestoreNote}
        onDeletePermanently={handleDeletePermanently}
      />

      {/* 4. Signature Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        onSelectNote={(id) => setSelectedNoteId(id)}
        onTriggerAIAction={(actionType) => {
          setAiModalInitialAction(actionType as AIActionType);
          setIsAIModalOpen(true);
        }}
      />

      {/* 5. AI Assistant Modal */}
      <AIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        note={selectedNote}
        initialAction={aiModalInitialAction}
        onApplyResult={(res) => {
          if (res.content) handleUpdateNote({ content: res.content });
          if (res.title) handleUpdateNote({ title: res.title });
          if (res.tags) handleUpdateNote({ tags: res.tags });
          if (res.folder) handleUpdateNote({ folder: res.folder });
        }}
      />

      {/* 6. Version History Drawer / Modal */}
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        note={selectedNote}
        onRestoreVersion={handleRestoreVersion}
      />

      {/* 7. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
        onExportBackup={handleExportBackup}
      />
    </div>
  );
}
