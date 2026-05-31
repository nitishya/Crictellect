import { memo, useEffect, useState } from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { MatchData, MomentumPoint } from '../types';

// Memoized chart components to prevent unnecessary re-renders (Efficiency)
const MomentumChart = memo(({ data }: { data: MomentumPoint[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorMomentum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis dataKey="over" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />
      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
      <Area type="monotone" dataKey="momentum" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMomentum)" />
    </AreaChart>
  </ResponsiveContainer>
));
MomentumChart.displayName = 'MomentumChart';

const WinProbChart = memo(({ data, teamA, teamB }: { data: MomentumPoint[]; teamA: string; teamB: string }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis dataKey="over" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />
      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
      <Legend />
      <Line type="monotone" dataKey="win_prob_a" name={teamA} stroke="#10b981" strokeWidth={3} dot={false} />
      <Line type="monotone" dataKey="win_prob_b" name={teamB} stroke="#f59e0b" strokeWidth={3} dot={false} />
    </LineChart>
  </ResponsiveContainer>
));
WinProbChart.displayName = 'WinProbChart';

export default function Dashboard() {
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [momentumData, setMomentumData] = useState<MomentumPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/match').then(res => {
        if (!res.ok) throw new Error('Failed to load match data');
        return res.json();
      }),
      fetch('/api/momentum').then(res => {
        if (!res.ok) throw new Error('Failed to load momentum data');
        return res.json();
      })
    ]).then(([match, momentum]) => {
      setMatchData(match as MatchData);
      setMomentumData((momentum as { momentum: MomentumPoint[] }).momentum);
      setLoading(false);
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex h-full items-center justify-center gap-3 text-gray-400">
        <span className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" aria-hidden="true" />
        <span>Loading match data…</span>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div role="alert" className="flex h-full items-center justify-center text-red-400">
        Failed to load match data. Please try again.
      </div>
    );
  }

  const { match_info, live_score, partnership } = matchData;

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">
          {match_info.team_a} vs {match_info.team_b}
        </h1>
        <p className="text-gray-400" aria-label="Match status and venue">
          {match_info.status} • {match_info.venue}
        </p>
      </header>

      {/* Score Cards */}
      <section aria-label="Live Scorecard" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article
          className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg"
          aria-label={`${match_info.team_a} score`}
        >
          <h2 className="text-lg text-gray-400 mb-1">{match_info.team_a}</h2>
          <p className="text-4xl font-bold text-white">
            {live_score.team_a_total}/{live_score.team_a_wickets}
            <span className="text-sm font-normal text-gray-400 ml-2">({live_score.team_a_overs} ov)</span>
          </p>
        </article>

        <article
          className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg"
          aria-label={`${match_info.team_b} score`}
        >
          <h2 className="text-lg text-gray-400 mb-1">{match_info.team_b}</h2>
          <p className="text-4xl font-bold text-white">
            {live_score.team_b_total}/{live_score.team_b_wickets}
            <span className="text-sm font-normal text-gray-400 ml-2">({live_score.team_b_overs} ov)</span>
          </p>
        </article>

        <article
          className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg"
          aria-label="Run rates"
        >
          <dl className="space-y-2">
            <div className="flex justify-between items-center">
              <dt className="text-gray-400">CRR</dt>
              <dd className="text-xl font-semibold text-green-400">{live_score.current_run_rate}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-gray-400">RRR</dt>
              <dd className="text-xl font-semibold text-red-400">{live_score.required_run_rate}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-gray-400">Target</dt>
              <dd className="text-xl font-semibold text-white">{live_score.target}</dd>
            </div>
          </dl>
        </article>
      </section>

      {/* Charts */}
      <section aria-label="Match Charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full" aria-hidden="true" />
            Match Momentum
          </h2>
          <div className="h-64" role="img" aria-label="Match momentum area chart">
            <MomentumChart data={momentumData} />
          </div>
        </article>

        <article className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-purple-500 rounded-full" aria-hidden="true" />
            Win Probability Trend
          </h2>
          <div className="h-64" role="img" aria-label="Win probability trend chart">
            <WinProbChart data={momentumData} teamA={match_info.team_a} teamB={match_info.team_b} />
          </div>
        </article>
      </section>

      {/* Partnership & Milestones */}
      <section aria-label="Partnership and Milestones" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Current Partnership</h2>
          <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
            <div className="text-center">
              <p className="font-semibold text-lg">{partnership.player1.name}</p>
              <p className="text-gray-400">{partnership.player1.runs} ({partnership.player1.balls})</p>
            </div>
            <div className="text-center flex-1 mx-4">
              <p className="text-3xl font-bold text-cricket-green" aria-label={`Partnership: ${partnership.runs} runs off ${partnership.balls} balls`}>
                {partnership.runs}
              </p>
              <p className="text-sm text-gray-400">runs off {partnership.balls} balls</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">{partnership.player2.name}</p>
              <p className="text-gray-400">{partnership.player2.runs} ({partnership.player2.balls})</p>
            </div>
          </div>
        </article>

        <article className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Milestone Tracker</h2>
          <ul className="space-y-3" aria-label="Active milestones">
            <li className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border-l-4 border-yellow-500">
              <span aria-hidden="true" className="text-2xl">🔥</span>
              <div>
                <p className="font-medium">Half-century chance approaching</p>
                <p className="text-sm text-gray-400">Watch the next 10 overs</p>
              </div>
            </li>
            <li className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border-l-4 border-blue-500">
              <span aria-hidden="true" className="text-2xl">⚡</span>
              <div>
                <p className="font-medium">Record Partnership potential</p>
                <p className="text-sm text-gray-400">Highest this season at this venue</p>
              </div>
            </li>
          </ul>
        </article>
      </section>
    </main>
  );
}
