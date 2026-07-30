import React from 'react';
import { Settings, Download, ShieldCheck, Database, HardDrive, X, Sun, Moon, Coffee, Palette } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onExportBackup: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportBackup
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Application Settings</h3>
              <p className="text-[11px] text-slate-400">
                Themes, local storage, AI provider & backups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Appearance & Theme Switcher */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>Appearance & Theme</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`p-3 border rounded-lg text-left transition-colors flex flex-col items-center justify-center gap-1.5 ${
                  settings.theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-medium">Light</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`p-3 border rounded-lg text-left transition-colors flex flex-col items-center justify-center gap-1.5 ${
                  settings.theme === 'dark'
                    ? 'border-indigo-600 bg-slate-800 text-white font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-medium">Dark</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ theme: 'sepia' })}
                className={`p-3 border rounded-lg text-left transition-colors flex flex-col items-center justify-center gap-1.5 ${
                  settings.theme === 'sepia'
                    ? 'border-amber-700 bg-[#FAF3E0] text-amber-950 font-semibold shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Coffee className="w-5 h-5 text-amber-800" />
                <span className="text-xs font-medium">Sepia Warm</span>
              </button>
            </div>
          </div>

          {/* AI Provider Config */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              AI Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdateSettings({ aiProvider: 'gemini' })}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  settings.aiProvider === 'gemini'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold mb-0.5">Google Gemini</div>
                <div className="text-[10px] text-slate-500">
                  Cloud AI via process.env.GEMINI_API_KEY
                </div>
              </button>

              <button
                onClick={() => onUpdateSettings({ aiProvider: 'ollama' })}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  settings.aiProvider === 'ollama'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold mb-0.5">Ollama (Offline)</div>
                <div className="text-[10px] text-slate-500">
                  Fully local LLM execution on device
                </div>
              </button>
            </div>
          </div>

          {/* Database & Sync Guarantee */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Local-First Integrity Status</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All notes and search indices are stored in a WAL-enabled SQLite database with foreign key constraints. Your data never leaves your device unless AI actions are invoked.
            </p>
          </div>

          {/* Data Backup & Export */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Backup & Data Ownership
            </label>
            <button
              onClick={onExportBackup}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export Full Notes Backup (JSON)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Nexus Notes v1.0.0</span>
          <span>SQLite FTS5 Enabled</span>
        </div>
      </div>
    </div>
  );
};
