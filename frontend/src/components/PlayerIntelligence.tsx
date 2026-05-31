import { memo, useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain } from 'lucide-react';
import type { Player } from '../types';

// Memoized chart to prevent re-renders when AI insight updates (Efficiency)
const ComparisonChart = memo(({ players }: { players: Player[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={players} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
      <XAxis type="number" stroke="#94a3b8" />
      <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} />
      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
      <Legend />
      <Bar dataKey="average" name="Average" fill="#10b981" radius={[0, 4, 4, 0]} />
      <Bar dataKey="strike_rate" name="Strike Rate" fill="#3b82f6" radius={[0, 4, 4, 0]} />
    </BarChart>
  </ResponsiveContainer>
));
ComparisonChart.displayName = 'ComparisonChart';

export default function PlayerIntelligence() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsight = useCallback(async (playerData: Player[]) => {
    setInsightLoading(true);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: JSON.stringify(playerData),
          prompt: 'Compare these players for a high-pressure T20 chase in 2 sentences.'
        })
      });
      if (!res.ok) throw new Error('AI service unavailable');
      const data = await res.json();
      setAiInsight(data.insight ?? 'No insight generated.');
    } catch {
      setAiInsight('AI insight unavailable. Check your Gemini API key.');
    }
    setInsightLoading(false);
  }, []);

  useEffect(() => {
    fetch('/api/players')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load players');
        return res.json();
      })
      .then(data => {
        setPlayers(data.players as Player[]);
        setLoading(false);
        generateInsight(data.players);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [generateInsight]);

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex h-full items-center justify-center gap-3 text-gray-400">
        <span className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" aria-hidden="true" />
        <span>Loading player data…</span>
      </div>
    );
  }

  if (error) {
    return <div role="alert" className="text-red-400 p-6">{error}</div>;
  }

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Player Intelligence</h1>

      {/* AI Summary */}
      <section
        aria-label="AI Player Comparison"
        className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 p-6 rounded-xl shadow-lg"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg" aria-hidden="true">
            <Brain className="text-purple-400" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">AI Player Comparison</h2>
            <div aria-live="polite" aria-busy={insightLoading}>
              {insightLoading ? (
                <p className="text-gray-400 animate-pulse">Generating insights…</p>
              ) : (
                <p className="text-gray-200 text-lg leading-relaxed">{aiInsight}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Player Cards */}
      <section aria-label="Player statistics" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {players.map(player => (
          <article
            key={player.id}
            className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg"
            aria-label={`${player.name} statistics`}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{player.name}</h2>
                <p className="text-gray-400">{player.team}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-cricket-green" aria-label={`Career average: ${player.average}`}>
                  {player.average}
                </p>
                <p className="text-sm text-gray-400">Career Average</p>
              </div>
            </div>

            <dl className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <dt className="text-xs text-gray-400">Runs</dt>
                <dd className="text-xl font-semibold text-white">{player.runs}</dd>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <dt className="text-xs text-gray-400">Strike Rate</dt>
                <dd className="text-xl font-semibold text-white">{player.strike_rate}</dd>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <dt className="text-xs text-gray-400">Boundaries</dt>
                <dd className="text-xl font-semibold text-white">{player.boundaries}</dd>
              </div>
            </dl>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Recent Form (Last 5 Innings)</h3>
              <ol className="flex gap-2" aria-label={`${player.name} recent scores`}>
                {player.recent_form.map((score, idx) => (
                  <li
                    key={idx}
                    className={`flex-1 py-2 text-center rounded text-sm font-medium ${score >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'}`}
                    aria-label={`Innings ${idx + 1}: ${score} runs${score >= 50 ? ' (fifty+)' : ''}`}
                  >
                    {score}
                  </li>
                ))}
              </ol>
            </div>
          </article>
        ))}
      </section>

      {/* Comparison Chart */}
      <article className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Head-to-Head Comparison</h2>
        <div className="h-80" role="img" aria-label="Side-by-side bar chart comparing player averages and strike rates">
          <ComparisonChart players={players} />
        </div>
      </article>
    </main>
  );
}
