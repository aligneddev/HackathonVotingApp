import { useEffect, useState } from 'react';
import { presentationApi, Presentation } from '../api/presentationApi';
import { votingApi } from '../api/votingApi';
import RankedVotingList, { RankedVotingListItem } from '../components/RankedVotingList';
import { adminVotingApi } from '../api/adminVotingApi';

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
  const [isVotingOpen, setIsVotingOpen] = useState(true);
  const [voterName, setVoterName] = useState('');

  const requiredRankCount = Math.min(5, rankedItems.length);

  useEffect(() => {
    Promise.all([presentationApi.getPresentations(), adminVotingApi.getVotingState()])
      .then(([data, state]) => {
        if (localStorage.getItem(getSessionKey(data))) {
          setSubmitted(true);
        }
        setRankedItems(data.map(p => ({ presentation: p, notes: '' })));
        setIsVotingOpen(state.isOpen);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!isVotingOpen) {
      setError('Voting is currently closed by admin.');
      return;
    }

    if (!voterName.trim()) {
      setError('Please enter your name before submitting.');
      return;
    }

    if (submitting || submitted) return;
    setSubmitting(true);
    setError(null);

    try {
      const entries = rankedItems.slice(0, requiredRankCount).map((item, index) => ({
        presentationId: item.presentation.id,
        ranking: index + 1,
        notes: item.notes || undefined,
      }));

      await votingApi.castBallot(voterName.trim(), entries);
      localStorage.setItem(getSessionKey(rankedItems.map(r => r.presentation)), 'true');
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('409')) {
        setError('You have already voted in this session.');
        setSubmitted(true);
      } else if (msg.includes('403')) {
        setError('Voting is currently closed by admin.');
        setIsVotingOpen(false);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-indigo-400">Rank the Presentations</h1>
          {!loading && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isVotingOpen
                  ? 'bg-green-900/60 border border-green-700 text-green-300'
                  : 'bg-gray-800 border border-gray-600 text-gray-400'
              }`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isVotingOpen ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                }`}
                aria-hidden="true"
              />
              {isVotingOpen ? 'Voting open' : 'Voting closed'}
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Drag or use the arrows to rank in order of preference.
          {rankedItems.length > 5
            ? ' Your top 5 are submitted when you vote.'
            : ' You must rank all available presentations.'}
          {' '}Add optional notes for each.
        </p>
        <p className="text-amber-300 text-sm mb-4">
          Please use your real name and only vote once.
        </p>

        {loading ? (
          <p className="text-gray-400">Loading presentations...</p>
        ) : !isVotingOpen ? (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-10 text-center space-y-3">
            <div className="text-4xl" aria-hidden="true">🔒</div>
            <p className="text-lg font-semibold text-gray-200">Voting hasn't started yet</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Hang tight — the organiser will open voting shortly. Rankings will appear here once voting is live.
            </p>
          </div>
        ) : rankedItems.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No presentations to vote on yet.</p>
        ) : submitted ? (
          <div className="bg-gray-900 border border-green-700 rounded-xl p-6 text-center">
            <p className="text-green-400 font-semibold text-lg">✓ Rankings submitted!</p>
            <p className="text-gray-400 mt-2 text-sm">Thank you for voting.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="voter-name" className="block text-sm font-medium text-gray-200 mb-1">
                Your name
              </label>
              <input
                id="voter-name"
                type="text"
                value={voterName}
                onChange={e => setVoterName(e.target.value)}
                maxLength={120}
                disabled={submitting}
                placeholder="Enter your real name"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

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
