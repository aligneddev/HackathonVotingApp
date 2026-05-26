const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export interface BallotEntry {
  presentationId: string;
  ranking: number;
  notes?: string;
}

export const votingApi = {
  castBallot: async (voterAliasToken: string, entries: BallotEntry[]): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/votes/ballots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterAliasToken, entries }),
    });

    if (!res.ok) throw new Error(`Failed to submit ballot: ${res.status}`);
  },
};
