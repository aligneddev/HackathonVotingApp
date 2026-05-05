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

export const presentationApi = {
  getPresentations: async (): Promise<Presentation[]> => {
    const res = await fetch('/presentations');
    if (!res.ok) throw new Error('Failed to fetch presentations');
    return res.json();
  },

  createPresentation: async (request: CreatePresentationRequest): Promise<Presentation> => {
    const res = await fetch('/presentations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('Failed to create presentation');
    return res.json();
  },

  deletePresentation: async (id: string): Promise<void> => {
    const res = await fetch(`/presentations/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete presentation');
  },
};
