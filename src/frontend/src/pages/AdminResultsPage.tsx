import { useEffect, useState } from 'react';
import { adminResultsApi, AdminResultEntry } from '../api/adminResultsApi';

function formatAverage(value: number | null): string {
  if (value === null) {
    return 'N/A';
  }

  return value.toFixed(2);
}

export default function AdminResultsPage() {
  const [entries, setEntries] = useState<AdminResultEntry[] | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AdminResultEntry | null>(null);

  useEffect(() => {
    adminResultsApi
      .getResults()
      .then(data => setEntries(data))
      .catch(() => setEntries([]));
  }, []);

  if (entries === null) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <p className="text-gray-400">Loading admin results...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-indigo-400">Admin Vote Results</h1>
          <p className="text-sm text-gray-400 mt-2">
            Ranked by average ranking ascending. Lower average means better result.
          </p>
        </div>

        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No vote data yet.</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <section
                key={entry.id}
                className="bg-gray-900 border border-gray-700 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Rank #{index + 1}</p>
                    <h2 className="text-lg font-semibold text-gray-100 mt-1">{entry.title}</h2>
                    <p className="text-sm text-indigo-300 mt-1">{entry.presenterName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEntry(entry)}
                    className="inline-flex items-center gap-2 bg-gray-800 border border-gray-600 hover:border-indigo-500 hover:text-indigo-300 px-3 py-2 rounded-lg text-sm transition-colors"
                    aria-label={`View notes for ${entry.title}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Notes ({entry.notes.length})
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-gray-800/70 rounded-lg p-3">
                    <p className="text-xs uppercase text-gray-500">Vote Count</p>
                    <p className="text-xl font-bold text-gray-100 mt-1">{entry.voteCount}</p>
                  </div>
                  <div className="bg-gray-800/70 rounded-lg p-3">
                    <p className="text-xs uppercase text-gray-500">Average Ranking</p>
                    <p className="text-xl font-bold text-gray-100 mt-1">{formatAverage(entry.averageRanking)}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Vote notes for ${selectedEntry.title}`}
        >
          <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-indigo-300">Vote Notes</h2>
                <p className="text-sm text-gray-400 mt-1">{selectedEntry.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-gray-200"
              >
                Close
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto pr-1 space-y-3">
              {selectedEntry.notes.length === 0 ? (
                <p className="text-sm text-gray-500">No notes submitted for this presentation.</p>
              ) : (
                selectedEntry.notes.map((note, index) => (
                  <article
                    key={`${selectedEntry.id}-note-${index}`}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-3"
                  >
                    <p className="text-xs uppercase text-gray-500">Ranking {note.ranking}</p>
                    <p className="text-sm text-gray-200 mt-1 whitespace-pre-wrap">{note.notes}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
