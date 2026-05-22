const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export interface VoteNote {
  notes: string;
  ranking: number;
  createdAt: string;
}

export interface AdminResultEntry {
  id: string;
  title: string;
  presenterName: string;
  voteCount: number;
  averageRanking: number | null;
  notes: VoteNote[];
}

export const adminResultsApi = {
  getResults: async (): Promise<AdminResultEntry[]> => {
    const res = await fetch(`${API_BASE}/api/admin/results`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
