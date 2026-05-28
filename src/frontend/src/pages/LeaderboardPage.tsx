import { useState, useEffect } from 'react';
import { leaderboardApi, LeaderboardEntry } from '../api/leaderboardApi';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    leaderboardApi.getLeaderboard().then(setEntries);
  }, []);

  if (entries === null) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <p className="text-gray-400">Loading leaderboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-indigo-400 mb-6">Leaderboard</h1>

        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No leaderboard data yet.</p>
        ) : (
          <ol className="space-y-3">
            {entries.map((entry, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              return (
                <li
                  key={entry.id}
                  className={[
                    'flex items-center gap-4 p-4 rounded-xl border',
                    isTopThree
                      ? 'bg-amber-900/20 border-amber-700/70'
                      : 'bg-gray-900 border-gray-700',
                  ].join(' ')}
                >
                  <span className={[
                    'text-2xl font-bold w-8 text-center',
                    isTopThree ? 'text-amber-300' : 'text-gray-500',
                  ].join(' ')}>{rank}</span>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-100">{entry.title}</span>
                    <p className="text-sm text-gray-400">{entry.presenterName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-indigo-300">{entry.totalPoints}</p>
                    <p className="text-xs text-gray-500">points</p>
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
