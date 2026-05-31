import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain } from 'lucide-react';

export default function PlayerIntelligence() {
  const [playersData, setPlayersData] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => {
        setPlayersData(data.players);
        setLoading(false);
        generateInsight(data.players);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const generateInsight = async (players: any[]) => {
    setInsightLoading(true);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: JSON.stringify(players),
          prompt: "Compare these players and provide a 2 sentence summary on who is better suited for a high-pressure chase."
        })
      });
      const data = await res.json();
      setAiInsight(data.insight);
    } catch (e) {
      console.error(e);
      setAiInsight("Failed to generate AI insight.");
    }
    setInsightLoading(false);
  };

  if (loading) return <div className="flex h-full items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Player Intelligence</h2>

      {/* AI Summary Card */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 p-6 rounded-xl shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Brain className="text-purple-400" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">AI Player Comparison</h3>
            {insightLoading ? (
              <p className="text-gray-400 animate-pulse">Generating insights...</p>
            ) : (
              <p className="text-gray-200 text-lg leading-relaxed">{aiInsight}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {playersData.map(player => (
          <div key={player.id} className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">{player.name}</h3>
                <p className="text-gray-400">{player.team}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-cricket-green">{player.average}</p>
                <p className="text-sm text-gray-400">Career Average</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xl font-semibold text-white">{player.runs}</p>
                <p className="text-xs text-gray-400">Runs</p>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xl font-semibold text-white">{player.strike_rate}</p>
                <p className="text-xs text-gray-400">Strike Rate</p>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xl font-semibold text-white">{player.boundaries}</p>
                <p className="text-xs text-gray-400">Boundaries</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Recent Form (Last 5 Innings)</h4>
              <div className="flex gap-2">
                {player.recent_form.map((score: number, idx: number) => (
                  <div key={idx} className={`flex-1 py-2 text-center rounded text-sm font-medium ${score > 50 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'}`}>
                    {score}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Visual Comparison Chart */}
      <div className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Head-to-Head Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={playersData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="average" name="Average" fill="#10b981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="strike_rate" name="Strike Rate" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
