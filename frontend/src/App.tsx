import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Activity, Users, Trophy, Brain, BarChart2 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PlayerIntelligence from './components/PlayerIntelligence';
import TeamIntelligence from './components/TeamIntelligence';
import FantasyAssistant from './components/FantasyAssistant';
import AIInsightsPanel from './components/AIInsightsPanel';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-cricket-dark text-white overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-cricket-card border-r border-gray-800 flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-cricket-green flex items-center gap-2">
              <Activity className="text-cricket-green" />
              Crictellect
            </h1>
            <p className="text-xs text-gray-400 mt-1">Turn Every Ball into Intelligence</p>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 mt-4">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <BarChart2 size={20} className="text-blue-400" />
              <span>Match Dashboard</span>
            </Link>
            <Link to="/players" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <Users size={20} className="text-purple-400" />
              <span>Player Intel</span>
            </Link>
            <Link to="/teams" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <Trophy size={20} className="text-yellow-400" />
              <span>Team Intel</span>
            </Link>
            <Link to="/fantasy" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <Activity size={20} className="text-green-400" />
              <span>Fantasy Assistant</span>
            </Link>
            <Link to="/insights" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <Brain size={20} className="text-pink-400" />
              <span>AI Insights</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-cricket-dark p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/players" element={<PlayerIntelligence />} />
            <Route path="/teams" element={<TeamIntelligence />} />
            <Route path="/fantasy" element={<FantasyAssistant />} />
            <Route path="/insights" element={<AIInsightsPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
