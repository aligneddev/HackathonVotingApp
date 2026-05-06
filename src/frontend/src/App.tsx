import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LeaderboardPage from './pages/LeaderboardPage';
import VotingPage from './pages/VotingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/vote" element={<VotingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
