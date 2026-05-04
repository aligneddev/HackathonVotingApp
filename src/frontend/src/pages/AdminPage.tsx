import { useEffect, useState } from 'react';

interface Presentation {
  id: string;
  title: string;
  presenterName: string;
  description: string;
  createdAt: string;
}

interface CreatePresentationForm {
  title: string;
  presenterName: string;
  description: string;
}

export default function AdminPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreatePresentationForm>({
    title: '',
    presenterName: '',
    description: '',
  });

  useEffect(() => {
    fetch('/presentations')
      .then(res => res.json())
      .then(data => {
        setPresentations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/presentations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const created = await res.json();
      setPresentations(prev => [...prev, created]);
      setForm({ title: '', presenterName: '', description: '' });
      setShowForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/presentations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPresentations(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-indigo-400">Presentations</h1>
          <button
            onClick={() => setShowForm(s => !s)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Presentation
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAdd}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-gray-200">New Presentation</h2>
            <input
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500"
              placeholder="Title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <input
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500"
              placeholder="Presenter Name"
              value={form.presenterName}
              onChange={e => setForm(f => ({ ...f, presenterName: e.target.value }))}
              required
            />
            <textarea
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500"
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
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
            {presentations.map(p => (
              <li
                key={p.id}
                className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div>
                  <h2 className="font-semibold text-gray-100">{p.title}</h2>
                  <p className="text-sm text-indigo-300 mt-1">{p.presenterName}</p>
                  {p.description && (
                    <p className="text-sm text-gray-400 mt-2">{p.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-400 hover:text-red-300 text-sm shrink-0 transition-colors"
                  aria-label={`Delete ${p.title}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
