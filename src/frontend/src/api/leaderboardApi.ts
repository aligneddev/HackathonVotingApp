export interface LeaderboardEntry {
  id: string;
  title: string;
  presenterName: string;
  voteCount: number;
}

export const leaderboardApi = {
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const res = await fetch("/leaderboard");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
