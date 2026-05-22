const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export interface BallotEntry {
  presentationId: string;
  ranking: number;
  notes?: string;
}

export const votingApi = {
  castVote: async (
    presentationId: string,
    voterName: string,
    ranking?: number,
    notes?: string
  ): Promise<void> => {
    const body: Record<string, unknown> = {};
    body.voterName = voterName;
    if (ranking !== undefined) body.ranking = ranking;
    if (notes !== undefined) body.notes = notes;

    const res = await fetch(`${API_BASE}/api/votes/${presentationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Failed to cast vote: ${res.status}`);
  },

  castBallot: async (voterName: string, entries: BallotEntry[]): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/votes/ballots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterName, entries }),
    });

    if (!res.ok) throw new Error(`Failed to submit ballot: ${res.status}`);
  },

  getVoteCount: async (presentationId: string): Promise<number> => {
    const res = await fetch(`${API_BASE}/api/votes/${presentationId}/count`, { method: 'GET' });
    if (!res.ok) throw new Error(`Failed to get vote count: ${res.status}`);
    const data = await res.json();
    return data.count;
  },
};
