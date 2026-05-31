import { useEffect, useState } from 'react';
import { Brain, Star, TrendingUp, ShieldAlert } from 'lucide-react';

export default function FantasyAssistant() {
  const [fantasyData, setFantasyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/fantasy')
      .then(res => res.json())
      .then(data => {
        setFantasyData(data.fantasy);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading || !fantasyData) return <div className="flex h-full items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Fantasy Assistant</h2>
          <p className="text-gray-400">AI-powered recommendations for your fantasy team</p>
        </div>
        <div className="flex items-center gap-2 text-purple-400 bg-purple-900/30 px-3 py-1.5 rounded-full text-sm font-medium border border-purple-500/30">
          <Brain size={16} />
          <span>Powered by Gemini</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Captain Pick */}
        <div className="bg-gradient-to-br from-yellow-900/40 to-cricket-card p-6 rounded-xl border border-yellow-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-yellow-500">
            <Star size={64} fill="currentColor" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
              <Star size={24} fill="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-white">Top Captain</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-4">{fantasyData.top_captain.name}</p>
          <div className="bg-black/20 p-4 rounded-lg">
            <p className="text-sm text-gray-300 leading-relaxed">
              <span className="font-semibold text-yellow-400 block mb-1">AI Reasoning:</span>
              {fantasyData.top_captain.reasoning}
            </p>
          </div>
        </div>

        {/* Top Vice Captain Pick */}
        <div className="bg-gradient-to-br from-blue-900/40 to-cricket-card p-6 rounded-xl border border-blue-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-blue-500">
            <TrendingUp size={64} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Vice Captain</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-4">{fantasyData.top_vice_captain.name}</p>
          <div className="bg-black/20 p-4 rounded-lg">
            <p className="text-sm text-gray-300 leading-relaxed">
              <span className="font-semibold text-blue-400 block mb-1">AI Reasoning:</span>
              {fantasyData.top_vice_captain.reasoning}
            </p>
          </div>
        </div>

        {/* Differential Pick */}
        <div className="bg-gradient-to-br from-green-900/40 to-cricket-card p-6 rounded-xl border border-green-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-green-500">
            <ShieldAlert size={64} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Differential</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-4">{fantasyData.differential.name}</p>
          <div className="bg-black/20 p-4 rounded-lg">
            <p className="text-sm text-gray-300 leading-relaxed">
              <span className="font-semibold text-green-400 block mb-1">AI Reasoning:</span>
              {fantasyData.differential.reasoning}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
