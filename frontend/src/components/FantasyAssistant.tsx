import { useEffect, useState } from 'react';
import { Brain, Star, TrendingUp, ShieldAlert } from 'lucide-react';
import type { FantasyData, FantasyPick } from '../types';

interface PickCardProps {
  pick: FantasyPick;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  borderClass: string;
  iconBgClass: string;
  accentClass: string;
}

const PickCard = ({
  pick, label, icon, colorClass, borderClass, iconBgClass, accentClass
}: PickCardProps) => (
  <article
    className={`bg-gradient-to-br ${colorClass} to-cricket-card p-6 rounded-xl border ${borderClass} shadow-lg relative overflow-hidden`}
    aria-label={`${label}: ${pick.name}`}
  >
    <header className="flex items-center gap-3 mb-4">
      <div className={`p-2 ${iconBgClass} rounded-lg`} aria-hidden="true">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-white">{label}</h2>
    </header>
    <p className="text-3xl font-bold text-white mb-4">{pick.name}</p>
    <div className="bg-black/20 p-4 rounded-lg">
      <h3 className={`font-semibold ${accentClass} text-sm block mb-1`}>AI Reasoning</h3>
      <p className="text-sm text-gray-300 leading-relaxed">{pick.reasoning}</p>
    </div>
  </article>
);

export default function FantasyAssistant() {
  const [fantasyData, setFantasyData] = useState<FantasyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/fantasy')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load fantasy data');
        return res.json();
      })
      .then(data => {
        setFantasyData(data.fantasy as FantasyData);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex h-full items-center justify-center gap-3 text-gray-400">
        <span className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" aria-hidden="true" />
        <span>Loading fantasy picks…</span>
      </div>
    );
  }

  if (error || !fantasyData) {
    return <div role="alert" className="text-red-400 p-6">{error ?? 'Could not load fantasy data.'}</div>;
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Fantasy Assistant</h1>
          <p className="text-gray-400">AI-powered recommendations for your fantasy team</p>
        </div>
        <div
          className="flex items-center gap-2 text-purple-400 bg-purple-900/30 px-3 py-1.5 rounded-full text-sm font-medium border border-purple-500/30"
          aria-label="Powered by Gemini AI"
        >
          <Brain size={16} aria-hidden="true" />
          <span>Powered by Gemini</span>
        </div>
      </header>

      <section aria-label="Fantasy team recommendations" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PickCard
          pick={fantasyData.top_captain}
          label="Top Captain"
          icon={<Star size={24} className="text-yellow-400" fill="currentColor" />}
          colorClass="from-yellow-900/40"
          borderClass="border-yellow-500/30"
          iconBgClass="bg-yellow-500/20"
          accentClass="text-yellow-400"
        />
        <PickCard
          pick={fantasyData.top_vice_captain}
          label="Vice Captain"
          icon={<TrendingUp size={24} className="text-blue-400" />}
          colorClass="from-blue-900/40"
          borderClass="border-blue-500/30"
          iconBgClass="bg-blue-500/20"
          accentClass="text-blue-400"
        />
        <PickCard
          pick={fantasyData.differential}
          label="Differential"
          icon={<ShieldAlert size={24} className="text-green-400" />}
          colorClass="from-green-900/40"
          borderClass="border-green-500/30"
          iconBgClass="bg-green-500/20"
          accentClass="text-green-400"
        />
      </section>
    </main>
  );
}
