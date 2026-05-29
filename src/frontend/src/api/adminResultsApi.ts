const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

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
  totalPoints: number;
  averagePoints: number | null;
  firstPlaceCount: number;
  secondPlaceCount: number;
  averageRanking: number | null;
  notes: VoteNote[];
}

export const adminResultsApi = {
  getResults: async (): Promise<AdminResultEntry[]> => {
    const res = await fetch(`${API_BASE}/api/admin/results`, {
      credentials: "include",
    });
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
