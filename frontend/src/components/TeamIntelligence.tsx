import { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Brain } from 'lucide-react';

export default function TeamIntelligence() {
  const [teamsData, setTeamsData] = useState<any>({});
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => {
        setTeamsData(data.teams);
        setLoading(false);
        generateInsight(data.teams);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const generateInsight = async (teams: any) => {
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: JSON.stringify(teams),
          prompt: "Compare these two teams and identify one key area where Team A dominates Team B."
        })
      });
      const data = await res.json();
      setAiInsight(data.insight);
    } catch (e) {
      setAiInsight("Failed to generate AI insight.");
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center">Loading...</div>;

  const teamNames = Object.keys(teamsData);
  const teamA = teamsData[teamNames[0]];
  const teamB = teamsData[teamNames[1]];

  const chartData = [
    {
      subject: 'Win %',
      [teamNames[0]]: teamA.win_percentage,
      [teamNames[1]]: teamB.win_percentage,
      fullMark: 100,
    },
    {
      subject: 'Powerplay SR',
      [teamNames[0]]: teamA.powerplay_sr / 2, // normalized for radar chart
      [teamNames[1]]: teamB.powerplay_sr / 2,
      fullMark: 100,
    },
    {
      subject: 'Death Over SR',
      [teamNames[0]]: teamA.death_over_sr / 2.5,
      [teamNames[1]]: teamB.death_over_sr / 2.5,
      fullMark: 100,
    },
    {
      subject: 'Chase Success',
      [teamNames[0]]: teamA.chase_success,
      [teamNames[1]]: teamB.chase_success,
      fullMark: 100,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Team Intelligence</h2>

      {/* AI Summary Card */}
      <div className="bg-gradient-to-r from-blue-900/50 to-green-900/50 border border-blue-500/30 p-6 rounded-xl shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Brain className="text-blue-400" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Strategic Observation</h3>
            {aiInsight ? (
              <p className="text-gray-200 text-lg leading-relaxed">{aiInsight}</p>
            ) : (
              <p className="text-gray-400 animate-pulse">Generating insights...</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4 w-full text-left">Performance Radar</h3>
          <div className="h-80 w-full max-w-md">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name={teamNames[0]} dataKey={teamNames[0]} stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                <Radar name={teamNames[1]} dataKey={teamNames[1]} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Legend />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Head to Head Stats */}
        <div className="bg-cricket-card p-6 rounded-xl border border-gray-800 shadow-lg space-y-6">
          <h3 className="text-xl font-bold">Key Metrics</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-400 font-medium">{teamNames[0]}</span>
                <span className="text-gray-400">Win Percentage</span>
                <span className="text-blue-400 font-medium">{teamNames[1]}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-800">
                <div style={{ width: `${(teamA.win_percentage / (teamA.win_percentage + teamB.win_percentage)) * 100}%` }} className="bg-green-500"></div>
                <div style={{ width: `${(teamB.win_percentage / (teamA.win_percentage + teamB.win_percentage)) * 100}%` }} className="bg-blue-500"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-400 font-medium">{teamNames[0]}</span>
                <span className="text-gray-400">Powerplay Strike Rate</span>
                <span className="text-blue-400 font-medium">{teamNames[1]}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-800">
                <div style={{ width: `${(teamA.powerplay_sr / (teamA.powerplay_sr + teamB.powerplay_sr)) * 100}%` }} className="bg-green-500"></div>
                <div style={{ width: `${(teamB.powerplay_sr / (teamA.powerplay_sr + teamB.powerplay_sr)) * 100}%` }} className="bg-blue-500"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-400 font-medium">{teamNames[0]}</span>
                <span className="text-gray-400">Death Over Strike Rate</span>
                <span className="text-blue-400 font-medium">{teamNames[1]}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-800">
                <div style={{ width: `${(teamA.death_over_sr / (teamA.death_over_sr + teamB.death_over_sr)) * 100}%` }} className="bg-green-500"></div>
                <div style={{ width: `${(teamB.death_over_sr / (teamA.death_over_sr + teamB.death_over_sr)) * 100}%` }} className="bg-blue-500"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-400 font-medium">{teamNames[0]}</span>
                <span className="text-gray-400">Chase Success</span>
                <span className="text-blue-400 font-medium">{teamNames[1]}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-800">
                <div style={{ width: `${(teamA.chase_success / (teamA.chase_success + teamB.chase_success)) * 100}%` }} className="bg-green-500"></div>
                <div style={{ width: `${(teamB.chase_success / (teamA.chase_success + teamB.chase_success)) * 100}%` }} className="bg-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
