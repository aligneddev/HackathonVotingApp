import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leaderboardApi, LeaderboardEntry } from '../api/leaderboardApi';

const PRIZES = [
  { medal: '🥇', label: '1st Place' },
  { medal: '🥈', label: '2nd Place' },
  { medal: '🥉', label: '3rd Place' },
];

export default function ResultsPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    leaderboardApi.getLeaderboard()
      .then(data => setEntries(data))
      .catch(() => setEntries([]));
  }, []);

  if (entries === null) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <p className="text-gray-400">Loading results…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
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

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-bold text-indigo-400 mb-6">Results</h1>

        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No results yet.</p>
        ) : (
          <ol className="space-y-4">
            {entries.map((entry, index) => {
              const prize = PRIZES[index];
              return (
                <li
                  key={entry.id}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex items-start gap-4"
                >
                  {prize && (
                    <span className="text-xl font-bold shrink-0 text-yellow-300">
                      {prize.medal} {prize.label}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-100">{entry.title}</h2>
                    <p className="text-sm text-indigo-300 mt-1">{entry.presenterName}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}
