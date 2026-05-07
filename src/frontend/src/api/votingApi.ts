export const votingApi = {
  castVote: async (presentationId: string, ranking?: number, notes?: string): Promise<void> => {
    const body: Record<string, unknown> = {};
    if (ranking !== undefined) body.ranking = ranking;
    if (notes !== undefined) body.notes = notes;

    const res = await fetch(`/votes/${presentationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Failed to cast vote: ${res.status}`);
  },

  getVoteCount: async (presentationId: string): Promise<number> => {
    const res = await fetch(`/votes/${presentationId}/count`, { method: 'GET' });
    if (!res.ok) throw new Error(`Failed to get vote count: ${res.status}`);
    const data = await res.json();
    return data.count;
  },
};
