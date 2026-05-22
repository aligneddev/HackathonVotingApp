export interface LeaderboardEntry {
  id: string;
  title: string;
  presenterName: string;
  voteCount: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const leaderboardApi = {
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const res = await fetch(`${API_BASE}/api/leaderboard`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
