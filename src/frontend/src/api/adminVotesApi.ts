const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export interface AdminVoterBallotEntry {
  presentationId: string;
  presentationTitle: string;
  presenterName: string;
  ranking: number;
  notes: string | null;
  createdAt: string;
}

export interface AdminVoterBallot {
  voterAliasToken: string;
  entries: AdminVoterBallotEntry[];
}

export const adminVotesApi = {
  getVotes: async (): Promise<AdminVoterBallot[]> => {
    const res = await fetch(`${API_BASE}/api/admin/votes`, {
      credentials: "include",
    });
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
