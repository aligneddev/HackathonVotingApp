export interface Presentation {
  id: string;
  title: string;
  presenterName: string;
  description: string;
  createdAt: string;
}

export interface CreatePresentationRequest {
  title: string;
  presenterName: string;
  description: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const presentationApi = {
  getPresentations: async (): Promise<Presentation[]> => {
    const res = await fetch(`${API_BASE}/api/presentations`);
    if (!res.ok) throw new Error('Failed to fetch presentations');
    return res.json();
  },

  createPresentation: async (request: CreatePresentationRequest): Promise<Presentation> => {
    const res = await fetch(`${API_BASE}/api/presentations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('Failed to create presentation');
    return res.json();
  },

  deletePresentation: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/presentations/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete presentation');
  },
};
