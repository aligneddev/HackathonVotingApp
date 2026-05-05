export const votingApi = {
  castVote: async (presentationId: string): Promise<void> => {
    const res = await fetch(`/votes/${presentationId}`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to cast vote: ${res.status}`);
  },

  getVoteCount: async (presentationId: string): Promise<number> => {
    const res = await fetch(`/votes/${presentationId}/count`, { method: 'GET' });
    if (!res.ok) throw new Error(`Failed to get vote count: ${res.status}`);
    const data = await res.json();
    return data.count;
  },
};
