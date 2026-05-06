import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { presentationApi, Presentation } from '../api/presentationApi';
import VotingButton from '../components/VotingButton';

export default function VotingPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    presentationApi.getPresentations()
      .then(data => {
        setPresentations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-bold text-indigo-400 mb-6">Vote for a Presentation</h1>

        {loading ? (
          <p className="text-gray-400">Loading presentations...</p>
        ) : presentations.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No presentations to vote on yet.</p>
        ) : (
          <ul className="space-y-4">
            {presentations.map(p => (
              <li
                key={p.id}
                className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-100">{p.title}</h2>
                  <p className="text-sm text-indigo-300 mt-1">{p.presenterName}</p>
                  {p.description && (
                    <p className="text-sm text-gray-400 mt-2">{p.description}</p>
                  )}
                </div>
                <div className="shrink-0">
                  <VotingButton presentationId={p.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
