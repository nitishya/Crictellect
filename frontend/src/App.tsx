import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Activity, Users, Trophy, Brain, BarChart2 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PlayerIntelligence from './components/PlayerIntelligence';
import TeamIntelligence from './components/TeamIntelligence';
import FantasyAssistant from './components/FantasyAssistant';
import AIInsightsPanel from './components/AIInsightsPanel';

const navItems = [
  { to: '/', label: 'Match Dashboard', icon: <BarChart2 size={20} className="text-blue-400" aria-hidden="true" /> },
  { to: '/players', label: 'Player Intel', icon: <Users size={20} className="text-purple-400" aria-hidden="true" /> },
  { to: '/teams', label: 'Team Intel', icon: <Trophy size={20} className="text-yellow-400" aria-hidden="true" /> },
  { to: '/fantasy', label: 'Fantasy Assistant', icon: <Activity size={20} className="text-green-400" aria-hidden="true" /> },
  { to: '/insights', label: 'AI Insights', icon: <Brain size={20} className="text-pink-400" aria-hidden="true" /> },
];

function App() {
  return (
    <Router>
      {/* Skip to main content – keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-cricket-green focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      <div className="flex h-screen bg-cricket-dark text-white overflow-hidden">
        {/* Sidebar / Primary Navigation */}
        <aside className="w-64 bg-cricket-card border-r border-gray-800 flex flex-col" aria-label="Primary navigation">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1" aria-label="Crictellect home">
              <Activity className="text-cricket-green" aria-hidden="true" />
              <span className="text-2xl font-bold text-cricket-green">Crictellect</span>
            </div>
            <p className="text-xs text-gray-400">Turn Every Ball into Intelligence</p>
          </div>

          <nav aria-label="Site sections" className="flex-1 px-4 space-y-1 mt-4">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-cricket-green',
                    isActive
                      ? 'bg-gray-800 text-white font-semibold'
                      : 'text-gray-300 hover:bg-gray-800/70 hover:text-white',
                  ].join(' ')
                }
                aria-current={({ isActive }: { isActive: boolean }) => (isActive ? 'page' : undefined) as 'page' | undefined}
              >
                {icon}
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <footer className="px-6 py-4 border-t border-gray-800">
            <p className="text-xs text-gray-600">IPL 2026 Final · Live</p>
          </footer>
        </aside>

        {/* Main Content */}
        <div
          id="main-content"
          className="flex-1 overflow-y-auto bg-cricket-dark p-8"
          tabIndex={-1}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/players" element={<PlayerIntelligence />} />
            <Route path="/teams" element={<TeamIntelligence />} />
            <Route path="/fantasy" element={<FantasyAssistant />} />
            <Route path="/insights" element={<AIInsightsPanel />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
