import { useState, useEffect } from 'react';
import { leaderboardApi, LeaderboardEntry } from '../api/leaderboardApi';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    leaderboardApi.getLeaderboard().then(setEntries);
  }, []);

  if (entries === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      <ol className="space-y-3">
        {entries.map((entry, index) => {
          const rank = index + 1;
          return (
            <li key={entry.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
              <span className="text-2xl font-bold text-gray-400 w-8 text-center">{rank}</span>
              <div className="flex-1">
                <span className="font-semibold text-gray-900">{entry.title}</span>
                <p className="text-sm text-gray-500">{entry.presenterName}</p>
              </div>
              {entry.voteCount !== rank && (
                <span className="text-xl font-bold text-blue-600">{entry.voteCount}</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
