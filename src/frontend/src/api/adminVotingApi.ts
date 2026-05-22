const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export interface VotingState {
  isOpen: boolean;
  updatedAt: string;
}

export const adminVotingApi = {
  getVotingState: async (): Promise<VotingState> => {
    const res = await fetch(`${API_BASE}/api/admin/voting-state`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  startVoting: async (): Promise<VotingState> => {
    const res = await fetch(`${API_BASE}/api/admin/voting/start`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  endVoting: async (): Promise<VotingState> => {
    const res = await fetch(`${API_BASE}/api/admin/voting/end`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
