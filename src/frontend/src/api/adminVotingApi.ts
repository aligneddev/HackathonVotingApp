const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export interface VotingState {
  isOpen: boolean;
  updatedAt: string;
}

export const adminVotingApi = {
  getVotingState: async (): Promise<VotingState> => {
    const res = await fetch(`${API_BASE}/api/admin/voting-state`, {
      credentials: "include",
    });
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  startVoting: async (): Promise<VotingState> => {
    const res = await fetch(`${API_BASE}/api/admin/voting/start`, {
      method: "POST",
      credentials: "include",
    });
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  endVoting: async (): Promise<VotingState> => {
    const res = await fetch(`${API_BASE}/api/admin/voting/end`, {
      method: "POST",
      credentials: "include",
    });
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
