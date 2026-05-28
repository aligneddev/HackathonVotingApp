const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export interface BallotEntry {
  presentationId: string;
  ranking: number;
  notes?: string;
}

export class BallotError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'BallotError';
  }
}

export const votingApi = {
  castBallot: async (voterAliasToken: string, entries: BallotEntry[]): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/votes/ballots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterAliasToken, entries }),
    });

    if (!res.ok) {
      let code = 'Unknown';
      let message = `Failed to submit ballot: ${res.status}`;
      try {
        const body = await res.json();
        if (body?.error) code = body.error;
        if (body?.message) message = body.message;
      } catch {
        // ignore parse errors
      }
      throw new BallotError(code, message, res.status);
    }
  },
};
