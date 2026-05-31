import { memo, useCallback, useEffect, useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip
} from 'recharts';
import { Brain } from 'lucide-react';
import type { TeamStats } from '../types';

type TeamsMap = Record<string, TeamStats>;

// Memoized radar chart (Efficiency)
const TeamRadar = memo(({ chartData, teams }: { chartData: object[]; teams: string[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
      <PolarGrid stroke="#334155" />
      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
      <Radar name={teams[0]} dataKey={teams[0]} stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
      <Radar name={teams[1]} dataKey={teams[1]} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
      <Legend />
      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
    </RadarChart>
  </ResponsiveContainer>
));
TeamRadar.displayName = 'TeamRadar';

export default function TeamIntelligence() {
  const [teamsData, setTeamsData] = useState<TeamsMap>({});
  const [aiInsight, setAiInsight] = useState<string>('');
  const [insightLoading, setInsightLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateInsight = useCallback(async (teams: TeamsMap) => {
    setInsightLoading(true);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: JSON.stringify(teams),
          prompt: 'Compare teams, identify one key strength of each team.'
        })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAiInsight(data.insight ?? 'No insight generated.');
    } catch {
      setAiInsight('AI insight unavailable. Check your Gemini API key.');
    }
    setInsightLoading(false);
  }, []);

  useEffect(() => {
    fetch('/api/teams')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load team data');
        return res.json();
      })
      .then(data => {
        setTeamsData(data.teams as TeamsMap);
        setLoading(false);
        generateInsight(data.teams);
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
        <span>Loading team data…</span>
      </div>
    );
  }

  if (error) return <div role="alert" className="text-red-400 p-6">{error}</div>;

  const teamNames = Object.keys(teamsData);
  if (teamNames.length < 2) return <div className="text-gray-400 p-6">Not enough team data.</div>;

  const teamA = teamsData[teamNames[0]];
  const teamB = teamsData[teamNames[1]];

  const chartData = [
    { subject: 'Win %', [teamNames[0]]: teamA.win_percentage, [teamNames[1]]: teamB.win_percentage, fullMark: 100 },
    { subject: 'Powerplay SR', [teamNames[0]]: teamA.powerplay_sr / 2, [teamNames[1]]: teamB.powerplay_sr / 2, fullMark: 100 },
    { subject: 'Death SR', [teamNames[0]]: teamA.death_over_sr / 2.5, [teamNames[1]]: teamB.death_over_sr / 2.5, fullMark: 100 },
    { subject: 'Chase %', [teamNames[0]]: teamA.chase_success, [teamNames[1]]: teamB.chase_success, fullMark: 100 },
  ];

  const metrics: { label: string; keyA: keyof TeamStats; keyB: keyof TeamStats }[] = [
    { label: 'Win Percentage', keyA: 'win_percentage', keyB: 'win_percentage' },
    { label: 'Powerplay Strike Rate', keyA: 'powerplay_sr', keyB: 'powerplay_sr' },
    { label: 'Death Over Strike Rate', keyA: 'death_over_sr', keyB: 'death_over_sr' },
    { label: 'Chase Success %', keyA: 'chase_success', keyB: 'chase_success' },
  ];

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Team Intelligence</h1>

      {/* AI Insight */}
      <section
        aria-label="AI Strategic Observation"
        className="bg-gradient-to-r from-blue-900/50 to-green-900/50 border border-blue-500/30 p-6 rounded-xl shadow-lg"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg" aria-hidden="true">
            <Brain className="text-blue-400" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">Strategic Observation</h2>
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

      <section aria-label="Team performance charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4 w-full text-left">Performance Radar</h2>
          <div className="h-80 w-full max-w-md" role="img" aria-label="Radar chart comparing team performance across key metrics">
            <TeamRadar chartData={chartData} teams={teamNames} />
          </div>
        </article>

        <article className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg space-y-6">
          <h2 className="text-xl font-bold">Key Metrics</h2>
          <dl className="space-y-5">
            {metrics.map(({ label, keyA, keyB }) => {
              const valA = teamA[keyA] as number;
              const valB = teamB[keyB] as number;
              const total = valA + valB;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-400 font-medium">{teamNames[0]}</span>
                    <dt className="text-gray-400">{label}</dt>
                    <span className="text-blue-400 font-medium">{teamNames[1]}</span>
                  </div>
                  <div
                    className="flex h-3 rounded-full overflow-hidden bg-gray-800"
                    role="meter"
                    aria-label={`${label}: ${teamNames[0]} ${valA} vs ${teamNames[1]} ${valB}`}
                    aria-valuenow={Math.round((valA / total) * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div style={{ width: `${(valA / total) * 100}%` }} className="bg-green-500 transition-all duration-500" />
                    <div style={{ width: `${(valB / total) * 100}%` }} className="bg-blue-500 transition-all duration-500" />
                  </div>
                </div>
              );
            })}
          </dl>
        </article>
      </section>
    </main>
  );
}
