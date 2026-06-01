const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export interface PublicVotingState {
  isOpen: boolean;
  currentPresentationId: string | null;
  currentPresentationTitle: string | null;
  presentationStartedAt: string | null;
  durationMinutes: number;
}

export const publicVotingApi = {
  getVotingState: async (): Promise<PublicVotingState> => {
    const res = await fetch(`${API_BASE}/api/voting-state`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
