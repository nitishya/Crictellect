import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Dashboard() {
  const [matchData, setMatchData] = useState<any>(null);
  const [momentumData, setMomentumData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be fetched from the backend API
    // For V1 MVP, we simulate fetching the mock data from the FastAPI backend
    Promise.all([
      fetch('/api/match').then(res => res.json()),
      fetch('/api/momentum').then(res => res.json())
    ]).then(([match, momentum]) => {
      setMatchData(match);
      setMomentumData(momentum.momentum);
      setLoading(false);
    }).catch(e => {
      console.error("Failed to load data", e);
      setLoading(false);
    });
  }, []);

  if (loading || !matchData) return <div className="flex h-full items-center justify-center">Loading...</div>;

  const { match_info, live_score, partnership } = matchData;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">{match_info.team_a} vs {match_info.team_b}</h2>
        <p className="text-gray-400">{match_info.status} • {match_info.venue}</p>
      </header>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h3 className="text-lg text-gray-400 mb-1">{match_info.team_a}</h3>
          <p className="text-4xl font-bold text-white">{live_score.team_a_total}/{live_score.team_a_wickets} <span className="text-sm font-normal text-gray-400">({live_score.team_a_overs} ov)</span></p>
        </div>
        
        <div className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden">
          <h3 className="text-lg text-gray-400 mb-1">{match_info.team_b}</h3>
          <p className="text-4xl font-bold text-white">{live_score.team_b_total}/{live_score.team_b_wickets} <span className="text-sm font-normal text-gray-400">({live_score.team_b_overs} ov)</span></p>
        </div>

        <div className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">CRR</span>
            <span className="text-xl font-semibold text-green-400">{live_score.current_run_rate}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">RRR</span>
            <span className="text-xl font-semibold text-red-400">{live_score.required_run_rate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Target</span>
            <span className="text-xl font-semibold text-white">{live_score.target}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Momentum Analysis */}
        <div className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Match Momentum
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={momentumData}>
                <defs>
                  <linearGradient id="colorMomentum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="over" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="momentum" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMomentum)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win Probability Engine */}
        <div className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
            Win Probability Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={momentumData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="over" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="win_prob_a" name={match_info.team_a} stroke="#10b981" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="win_prob_b" name={match_info.team_b} stroke="#f59e0b" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Partnership & Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Current Partnership</h3>
          <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
            <div className="text-center">
              <p className="font-semibold text-lg">{partnership.player1.name}</p>
              <p className="text-gray-400">{partnership.player1.runs} ({partnership.player1.balls})</p>
            </div>
            <div className="text-center flex-1 mx-4">
              <p className="text-3xl font-bold text-cricket-green">{partnership.runs}</p>
              <p className="text-sm text-gray-400">runs off {partnership.balls} balls</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">{partnership.player2.name}</p>
              <p className="text-gray-400">{partnership.player2.runs} ({partnership.player2.balls})</p>
            </div>
          </div>
        </div>
        
        <div className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Milestone Tracker</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border-l-4 border-yellow-500">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-medium">Virat Kohli approaches half-century</p>
                <p className="text-sm text-gray-400">Needs 26 runs in remaining overs</p>
              </div>
            </li>
            <li className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border-l-4 border-blue-500">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-medium">Record Partnership</p>
                <p className="text-sm text-gray-400">Highest 4th wicket partnership at this venue</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
