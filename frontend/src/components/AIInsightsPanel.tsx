import { useState, useRef, useEffect, useCallback } from 'react';
import { Brain, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import type { InsightMessage } from '../types';

// Sanitise AI HTML output to prevent XSS – strips all tags except safe formatting ones.
function sanitizeHtml(raw: string): string {
  // Replace dangerous patterns and convert newlines to <br>
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  return escaped.replace(/\n/g, '<br/>');
}

const MATCH_CONTEXT =
  'IPL 2026 Final – Royal Challengers Bengaluru vs Gujarat Titans at Narendra Modi Stadium, Ahmedabad. ' +
  'Match is live. RCB batting second, chasing 186. Current score 102/3 in 12.4 overs. ' +
  'Virat Kohli on 58*(35), GT bowling tight in the death.';

export default function AIInsightsPanel() {
  const [prompt, setPrompt] = useState('');
  const [insights, setInsights] = useState<InsightMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest insight
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [insights]);

  const handleAskAI = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setPrompt('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: MATCH_CONTEXT, prompt: trimmed })
      });

      if (res.status === 422) {
        const body = await res.json();
        const detail = body?.detail?.[0]?.msg ?? 'Invalid prompt.';
        setError(detail);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Server error. Please try again.');

      const data = await res.json();
      setInsights(prev => [...prev, { query: trimmed, response: data.insight ?? '' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to AI engine.');
    }
    setLoading(false);
  }, [prompt]);

  return (
    <main className="flex flex-col h-full max-h-[85vh]">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">AI Insights Panel</h1>
        <p className="text-gray-400">Ask anything about the IPL 2026 Final – powered by Gemini.</p>
      </header>

      {/* Chat History */}
      <section
        aria-label="AI conversation history"
        aria-live="polite"
        aria-atomic="false"
        className="flex-1 overflow-y-auto space-y-6 mb-6 pr-1"
      >
        {insights.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500" aria-label="No insights yet">
            <Brain size={64} className="mb-4 opacity-50" aria-hidden="true" />
            <p className="text-lg">No insights yet.</p>
            <p className="text-sm mt-1">Try: <em>"Who is the most impactful player today?"</em></p>
          </div>
        )}

        {insights.map((insight, idx) => (
          <article key={idx} className="bg-cricket-card border border-gray-800 rounded-xl overflow-hidden shadow-lg">
            <header className="bg-gray-800/50 p-4 border-b border-gray-800 flex items-start gap-3 text-gray-300">
              <MessageSquare size={20} className="mt-1 shrink-0" aria-hidden="true" />
              <p className="font-medium">{insight.query}</p>
            </header>
            <div className="p-6 flex items-start gap-4 bg-gradient-to-br from-purple-900/10 to-blue-900/10">
              <Sparkles className="text-purple-400 shrink-0 mt-1" size={24} aria-hidden="true" />
              {/* Security: sanitized output via our custom function */}
              <div
                className="text-gray-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(insight.response) }}
              />
            </div>
          </article>
        ))}

        {loading && (
          <div role="status" aria-live="polite" className="bg-cricket-card border border-purple-500/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin text-purple-400" size={24} aria-hidden="true" />
              <p className="text-gray-300 font-medium">Generating insight…</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      {/* Error Banner */}
      {error && (
        <div role="alert" className="mb-3 px-4 py-3 bg-red-900/30 border border-red-500/50 text-red-300 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleAskAI} role="search" aria-label="Ask AI about the match">
        <div className="relative">
          <label htmlFor="ai-prompt" className="sr-only">Ask Crictellect AI about the match</label>
          <input
            id="ai-prompt"
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ask Crictellect AI about the match…"
            maxLength={500}
            className="w-full bg-cricket-card border border-gray-700 text-white rounded-xl py-4 pl-6 pr-36 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-lg"
            disabled={loading}
            aria-disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="absolute right-2 top-2 bottom-2 bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white font-medium rounded-lg px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            aria-label={loading ? 'Generating response…' : 'Ask AI'}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} aria-hidden="true" />
            ) : (
              <Brain size={18} aria-hidden="true" />
            )}
            {loading ? 'Thinking…' : 'Ask'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right" aria-live="polite">
          {prompt.length}/500 characters
        </p>
      </form>
    </main>
  );
}
