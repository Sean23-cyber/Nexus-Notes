import React, { useState } from 'react';
import { Clock, RotateCcw, X, Check, FileText } from 'lucide-react';
import { Note, NoteVersion } from '../types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onRestoreVersion: (versionId: string) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  note,
  onRestoreVersion
}) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  if (!isOpen || !note) return null;

  const versions = note.versions || [];
  const selectedVersion =
    versions.find((v) => v.id === selectedVersionId) || versions[0];

  return (
    <div
      className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[550px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Version History</h3>
              <p className="text-[11px] text-slate-400">
                Inspect and restore prior snapshots of "{note.title}"
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

        {/* Modal Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Version Timeline List */}
          <div className="w-64 border-r border-slate-200 overflow-y-auto bg-slate-50/50 divide-y divide-slate-100">
            {versions.length === 0 ? (
              <div className="p-4 text-xs text-slate-400 text-center">
                No prior version snapshots recorded yet.
              </div>
            ) : (
              versions.map((ver, idx) => {
                const isSelected = selectedVersion?.id === ver.id;
                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVersionId(ver.id)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 border-l-2 border-indigo-600'
                        : 'hover:bg-slate-100 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">
                        {idx === 0 ? 'Latest Snapshot' : `Version ${versions.length - idx}`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ver.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 line-clamp-1 mb-1">
                      {ver.title}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {ver.changeSummary || 'Auto-saved'}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Version Preview Area */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
            {selectedVersion ? (
              <>
                <div>
                  <div className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">
                    Snapshot Saved At: {new Date(selectedVersion.savedAt).toLocaleString()}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-4">
                    {selectedVersion.title}
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {selectedVersion.content}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      onRestoreVersion(selectedVersion.id);
                      onClose();
                    }}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore This Version</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1 text-xs text-slate-400">
                Select a version snapshot to preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
