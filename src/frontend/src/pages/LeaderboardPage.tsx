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
              const rankStyles = [
                'bg-amber-950/55 border-amber-400/70',
                'bg-gray-800 border-gray-400/70',
                'bg-orange-950/55 border-orange-700/70',
                'bg-emerald-950/55 border-emerald-600/60',
              ];
              const cardClass = rank <= 4 ? rankStyles[rank - 1] : 'bg-gray-900 border-gray-700';
              const rankClass = rank === 1
                ? 'text-amber-300'
                : rank === 2
                  ? 'text-gray-200'
                  : rank === 3
                    ? 'text-orange-300'
                    : rank === 4
                      ? 'text-emerald-300'
                      : 'text-gray-500';
              const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
              return (
                <li
                  key={entry.id}
                  className={[
                    'flex items-center gap-4 p-4 rounded-xl border',
                    cardClass,
                  ].join(' ')}
                >
                  <span className={['text-2xl font-bold w-12 text-center inline-flex items-center justify-center gap-1', rankClass].join(' ')}>
                    {medalEmoji && <span aria-hidden="true">{medalEmoji}</span>}
                    <span>{rank}</span>
                  </span>
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
