import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { presentationApi, Presentation } from '../api/presentationApi';
import { votingApi } from '../api/votingApi';
import RankedVotingList, { RankedVotingListItem } from '../components/RankedVotingList';

function getSessionKey(presentations: Presentation[]): string {
  const ids = [...presentations].map(p => p.id).sort().join('-');
  return `voted-session-${ids}`;
}

export default function VotingPage() {
  const [loading, setLoading] = useState(true);
  const [rankedItems, setRankedItems] = useState<RankedVotingListItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    presentationApi.getPresentations()
      .then(data => {
        if (localStorage.getItem(getSessionKey(data))) {
          setSubmitted(true);
        }
        setRankedItems(data.map(p => ({ presentation: p, notes: '' })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    setError(null);

    try {
      for (let i = 0; i < rankedItems.length; i++) {
        const item = rankedItems[i];
        await votingApi.castVote(item.presentation.id, i + 1, item.notes || undefined);
      }
      localStorage.setItem(getSessionKey(rankedItems.map(r => r.presentation)), 'true');
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('409')) {
        setError('You have already voted in this session.');
        setSubmitted(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-indigo-400 mb-2">Rank the Presentations</h1>
        <p className="text-gray-400 text-sm mb-6">
          Drag or use the arrows to rank from best (1) to last. Add optional notes for each.
        </p>

        {loading ? (
          <p className="text-gray-400">Loading presentations...</p>
        ) : rankedItems.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No presentations to vote on yet.</p>
        ) : submitted ? (
          <div className="bg-gray-900 border border-green-700 rounded-xl p-6 text-center">
            <p className="text-green-400 font-semibold text-lg">✓ Rankings submitted!</p>
            <p className="text-gray-400 mt-2 text-sm">Thank you for voting.</p>
          </div>
        ) : (
          <>
            <RankedVotingList
              items={rankedItems}
              onChange={setRankedItems}
              disabled={submitting}
            />

            {error && (
              <p className="text-red-400 text-sm mt-4">{error}</p>
            )}

            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Rankings'}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
