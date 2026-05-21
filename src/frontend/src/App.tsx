import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AdminResultsPage from './pages/AdminResultsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import VotingPage from './pages/VotingPage';
import ResultsPage from './pages/ResultsPage';

function Layout() {
  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex gap-6">
          <Link to="/" className="text-gray-400 hover:text-indigo-400 text-sm font-medium transition-colors">
            Home
          </Link>
          <Link to="/leaderboard" className="text-gray-400 hover:text-indigo-400 text-sm font-medium transition-colors">
            Leaderboard
          </Link>
        </div>
      </nav>
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/results" element={<AdminResultsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/vote" element={<VotingPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
