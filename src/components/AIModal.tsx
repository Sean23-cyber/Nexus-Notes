import React, { useState } from 'react';
import { Sparkles, Check, RefreshCw, X, ArrowRight, Wand2 } from 'lucide-react';
import { AIActionType, AIActionResponse, Note, AppSettings } from '../types';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  initialAction?: AIActionType;
  settings?: AppSettings;
  onApplyResult: (result: { content?: string; title?: string; tags?: string[]; folder?: string }) => void;
}

export const AIModal: React.FC<AIModalProps> = ({
  isOpen,
  onClose,
  note,
  initialAction = 'rewrite',
  settings,
  onApplyResult
}) => {
  const [selectedAction, setSelectedAction] = useState<AIActionType>(initialAction);
  const [customInstruction, setCustomInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIActionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !note) return null;

  const handleRunAI = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: selectedAction,
          content: note.content,
          instruction: customInstruction,
          provider: settings?.aiProvider || 'openrouter',
          openRouterModel: settings?.openRouterModel || 'openrouter/free'
        })
      });

      if (!res.ok) {
        throw new Error('AI request failed with status ' + res.status);
      }

      const data: AIActionResponse = await res.json();
      setAiResponse(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to AI assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!aiResponse) return;

    if (selectedAction === 'generate_title') {
      onApplyResult({ title: aiResponse.result.trim() });
    } else if (selectedAction === 'generate_tags') {
      onApplyResult({ tags: aiResponse.tags });
    } else if (selectedAction === 'suggest_folder') {
      onApplyResult({ folder: aiResponse.suggestedFolder || aiResponse.result.trim() });
    } else {
      onApplyResult({ content: aiResponse.result });
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">AI Writing Assistant</h3>
              <p className="text-[11px] text-slate-400">Contextual writing, polishing & organization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Selection Tabs */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Select Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rewrite', label: 'Rewrite & Polish' },
                { id: 'summarize', label: 'Summarize Key Points' },
                { id: 'expand', label: 'Expand Thoughts' },
                { id: 'fix_grammar', label: 'Fix Grammar' },
                { id: 'generate_title', label: 'Generate Title' },
                { id: 'generate_tags', label: 'Auto-Generate Tags' }
              ].map((act) => (
                <button
                  key={act.id}
                  onClick={() => setSelectedAction(act.id as AIActionType)}
                  className={`px-3 py-2 border rounded-lg text-xs font-medium transition-colors text-left ${
                    selectedAction === act.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>

          {selectedAction === 'rewrite' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Custom Instruction (Optional)
              </label>
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="e.g. Make it more concise, formal, or structured..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            onClick={handleRunAI}
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing with Gemini...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Run AI Action</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* AI Result Box */}
          {aiResponse && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  AI Output Preview
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {aiResponse.modelUsed}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-800 font-normal leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {aiResponse.result}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Discard
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply to Note</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
