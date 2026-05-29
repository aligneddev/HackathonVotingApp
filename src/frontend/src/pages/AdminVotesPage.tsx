import { useEffect, useState } from 'react';
import { adminVotesApi, AdminVoterBallot } from '../api/adminVotesApi';

export default function AdminVotesPage() {
  const [ballots, setBallots] = useState<AdminVoterBallot[] | null>(null);

  useEffect(() => {
    adminVotesApi
      .getVotes()
      .then(data => setBallots(data))
      .catch(() => setBallots([]));
  }, []);

  if (ballots === null) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <p className="text-gray-400">Loading individual votes...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-indigo-400">Individual Votes</h1>
          <p className="text-sm text-gray-400 mt-2">
            Each voter ballot is listed with ranked presentation choices.
          </p>
        </div>

        {ballots.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No individual votes submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {ballots.map(ballot => (
              <section
                key={ballot.voterAliasToken}
                className="bg-gray-900 border border-gray-700 rounded-xl p-5"
              >
                <header className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Voter</p>
                  <h2 className="text-base md:text-lg font-semibold text-indigo-300 mt-1 break-all">
                    {ballot.voterAliasToken}
                  </h2>
                </header>

                <div className="grid gap-2">
                  <div className="hidden md:grid grid-cols-[90px_1fr_200px_1fr] rounded-lg bg-gray-800/70 border border-gray-700 text-xs uppercase tracking-wide text-gray-400 px-3 py-2">
                    <span>Ranking</span>
                    <span>Presentation</span>
                    <span>Presenter</span>
                    <span>Notes</span>
                  </div>

                  {[...ballot.entries]
                    .sort((a, b) => a.ranking - b.ranking)
                    .map(entry => (
                    <article
                      key={`${ballot.voterAliasToken}-${entry.presentationId}`}
                      className="grid grid-cols-1 md:grid-cols-[90px_1fr_200px_1fr] gap-2 md:gap-3 bg-gray-800 border border-gray-700 rounded-lg px-3 py-3"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 md:hidden">Ranking</p>
                        <p className="font-semibold text-gray-100">#{entry.ranking}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 md:hidden">Presentation</p>
                        <p className="text-gray-100">{entry.presentationTitle}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 md:hidden">Presenter</p>
                        <p className="text-indigo-300">{entry.presenterName}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 md:hidden">Notes</p>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {entry.notes && entry.notes.trim() !== '' ? entry.notes : 'No notes'}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
