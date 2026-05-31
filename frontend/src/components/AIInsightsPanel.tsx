import { useState } from 'react';
import { Brain, MessageSquare, Loader2, Sparkles } from 'lucide-react';

export default function AIInsightsPanel() {
  const [prompt, setPrompt] = useState("");
  const [insights, setInsights] = useState<{ query: string; response: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const currentPrompt = prompt;
    setPrompt("");
    setLoading(true);

    try {
      // In a real app, we would pass the current match context
      // Here we pass a generic context about the match
      const context = "India vs Australia, Wankhede Stadium. India batting first, currently 240/6 in 20 overs. Virat Kohli batting on 24(12), Hardik Pandya on 20(13). Australia is chasing 241.";
      
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: context,
          prompt: currentPrompt
        })
      });
      const data = await res.json();
      
      setInsights(prev => [{ query: currentPrompt, response: data.insight }, ...prev]);
    } catch (e) {
      console.error(e);
      setInsights(prev => [{ query: currentPrompt, response: "Error: Failed to connect to AI engine." }, ...prev]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">AI Insights Panel</h2>
          <p className="text-gray-400">Ask anything about the match, players, or historical trends.</p>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4 custom-scrollbar">
        {insights.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Brain size={64} className="mb-4 opacity-50" />
            <p className="text-lg">No insights generated yet.</p>
            <p className="text-sm">Try asking: "Who is the most impactful player right now?"</p>
          </div>
        )}

        {loading && (
          <div className="bg-cricket-card border border-purple-500/30 rounded-xl p-6 shadow-lg animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="animate-spin text-purple-400" size={24} />
              <p className="text-gray-300 font-medium">Generating insight...</p>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        )}

        {insights.map((insight, idx) => (
          <div key={idx} className="bg-cricket-card border border-gray-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gray-800/50 p-4 border-b border-gray-800 flex items-start gap-3 text-gray-300">
              <MessageSquare size={20} className="mt-1 shrink-0" />
              <p className="font-medium">{insight.query}</p>
            </div>
            <div className="p-6 flex items-start gap-4 bg-gradient-to-br from-purple-900/10 to-blue-900/10">
              <Sparkles className="text-purple-400 shrink-0 mt-1" size={24} />
              <div className="prose prose-invert max-w-none text-gray-200" dangerouslySetInnerHTML={{ __html: insight.response.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleAskAI} className="relative">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Crictellect AI about the match..."
          className="w-full bg-cricket-card border border-gray-700 text-white rounded-xl py-4 pl-6 pr-32 focus:outline-none focus:border-purple-500 transition-colors shadow-lg"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="absolute right-2 top-2 bottom-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Brain size={18} />}
          Ask
        </button>
      </form>
    </div>
  );
}
