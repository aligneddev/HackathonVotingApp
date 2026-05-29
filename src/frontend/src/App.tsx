import { BrowserRouter, Routes, Route, Outlet, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AdminResultsPage from './pages/AdminResultsPage';
import AdminVotesPage from './pages/AdminVotesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import VotingPage from './pages/VotingPage';
import ResultsPage from './pages/ResultsPage';

function linkClassName({ isActive }: { isActive: boolean }) {
  return [
    'text-sm font-medium transition-colors',
    isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-400',
  ].join(' ');
}

function PublicLayout() {
  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex gap-6">
          <NavLink to="/" className={linkClassName}>
            Home
          </NavLink>
          <NavLink to="/vote" className={linkClassName}>
            Vote
          </NavLink>
          <NavLink to="/leaderboard" className={linkClassName}>
            Leaderboard
          </NavLink>
        </div>
      </nav>
      <Outlet />
    </>
  );
}

function AdminLayout() {
  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex gap-6">
          <NavLink to="/admin" end className={linkClassName}>
            Presentations
          </NavLink>
          <NavLink to="/admin/results" className={linkClassName}>
            Vote Results
          </NavLink>
          <NavLink to="/admin/votes" className={linkClassName}>
            Individual Votes
          </NavLink>
          <NavLink to="/" className={linkClassName}>
            Public Site
          </NavLink>
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
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/vote" element={<VotingPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPage />} />
          <Route path="results" element={<AdminResultsPage />} />
          <Route path="votes" element={<AdminVotesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
