import { describe, it, expect, vi, beforeEach } from 'vitest';
import { votingApi } from '../api/votingApi';

describe('votingApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('castBallot_calls_POST_votes_ballots', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(
      new Response(null, { status: 201 })
    );
    vi.stubGlobal('fetch', mockFetch);

    await votingApi.castBallot('Ada Lovelace', [
      { presentationId: 'p-1', ranking: 1 },
      { presentationId: 'p-2', ranking: 2 },
    ]);

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/votes/ballots',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterAliasToken: 'Ada Lovelace',
          entries: [
            { presentationId: 'p-1', ranking: 1 },
            { presentationId: 'p-2', ranking: 2 },
          ],
        }),
      })
    );
  });

  it('castBallot_throws_for_non_ok_response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(null, { status: 400 })));

    await expect(
      votingApi.castBallot('Ada Lovelace', [{ presentationId: 'p-1', ranking: 1 }])
    ).rejects.toThrow(/failed to submit ballot: 400/i);
  });
});
