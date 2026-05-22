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
          const isTopThree = rank <= 3;
          return (
            <li
              key={entry.id}
              className={[
                'flex items-center gap-4 p-4 rounded-lg shadow border',
                isTopThree
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-white border-gray-200',
              ].join(' ')}
            >
              <span className={[
                'text-2xl font-bold w-8 text-center',
                isTopThree ? 'text-amber-600' : 'text-gray-400',
              ].join(' ')}>{rank}</span>
              <div className="flex-1">
                <span className="font-semibold text-gray-900">{entry.title}</span>
                <p className="text-sm text-gray-500">{entry.presenterName}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-700">{entry.totalPoints}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
