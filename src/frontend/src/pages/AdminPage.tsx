import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { presentationApi, Presentation } from "../api/presentationApi";
import { adminVotingApi, VotingState } from "../api/adminVotingApi";
export default function AdminPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    presenterName: "",
    description: "",
  });
  const [votingState, setVotingState] = useState<VotingState | null>(null);
  const [isUpdatingVotingState, setIsUpdatingVotingState] = useState(false);
  const [startingPresentationId, setStartingPresentationId] = useState<
    string | null
  >(null);
  const [activePresentationId, setActivePresentationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    Promise.all([
      presentationApi.getPresentations(),
      adminVotingApi.getVotingState(),
    ])
      .then(([presentationData, state]) => {
        setPresentations(presentationData);
        setVotingState(state);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSetVotingState = async (isOpen: boolean) => {
    if (isUpdatingVotingState) return;

    setIsUpdatingVotingState(true);
    try {
      const state = isOpen
        ? await adminVotingApi.startVoting()
        : await adminVotingApi.endVoting();
      setVotingState(state);
    } finally {
      setIsUpdatingVotingState(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await presentationApi.createPresentation(form);
      setPresentations((prev) => [...prev, created]);
      setForm({ title: "", presenterName: "", description: "" });
      setShowForm(false);
    } catch {
      // creation failed; leave form open
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await presentationApi.deletePresentation(id);
      setPresentations((prev) => prev.filter((p) => p.id !== id));
      if (activePresentationId === id) setActivePresentationId(null);
    } catch {
      // deletion failed; keep item in list
    }
  };

  const handleStartPresentation = async (id: string) => {
    if (startingPresentationId) return;
    setStartingPresentationId(id);
    try {
      await adminVotingApi.startPresentation(id);
      setActivePresentationId(id);
    } catch {
      // start failed; ignore
    } finally {
      setStartingPresentationId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6 gap-3">
          <h1 className="text-2xl font-bold text-indigo-400">Presentations</h1>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/results"
              className="bg-gray-800 border border-gray-600 hover:border-indigo-500 text-gray-100 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              View Vote Results
            </Link>
            <Link
              to="/admin/votes"
              className="bg-gray-800 border border-gray-600 hover:border-indigo-500 text-gray-100 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              View Individual Votes
            </Link>
            <button
              onClick={() => setShowForm((s) => !s)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Presentation
            </button>
          </div>
        </div>

        <section className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-100">
                Voting Session
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Status:{" "}
                <span
                  className={
                    votingState?.isOpen
                      ? "text-green-400 font-medium"
                      : "text-red-400 font-medium"
                  }
                >
                  {votingState?.isOpen ? "Open" : "Closed"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSetVotingState(true)}
                disabled={isUpdatingVotingState || votingState?.isOpen === true}
                className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start Voting
              </button>
              <button
                type="button"
                onClick={() => handleSetVotingState(false)}
                disabled={
                  isUpdatingVotingState || votingState?.isOpen === false
                }
                className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                End Voting
              </button>
            </div>
          </div>
        </section>

        {showForm && (
          <form
            onSubmit={handleAdd}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-gray-200">
              New Presentation
            </h2>
            <input
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500"
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
            <input
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500"
              placeholder="Presenter Name"
              value={form.presenterName}
              onChange={(e) =>
                setForm((f) => ({ ...f, presenterName: e.target.value }))
              }
              required
            />
            <textarea
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-400">Loading presentations...</p>
        ) : presentations.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No presentations yet. Add one to get started.
          </p>
        ) : (
          <ul className="space-y-4">
            {presentations.map((p) => (
              <li
                key={p.id}
                className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div>
                  <h2 className="font-semibold text-gray-100">{p.title}</h2>
                  <p className="text-sm text-indigo-300 mt-1">
                    {p.presenterName}
                  </p>
                  {p.description && (
                    <p className="text-sm text-gray-400 mt-2">
                      {p.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleStartPresentation(p.id)}
                    disabled={
                      !!startingPresentationId ||
                      activePresentationId === p.id
                    }
                    className="text-indigo-400 hover:text-indigo-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Start presentation ${p.title}`}
                  >
                    {activePresentationId === p.id ? "▶ Active" : "▶ Start"}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    aria-label={`Delete ${p.title}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
