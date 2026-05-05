import { describe, it, expect, vi, beforeEach } from 'vitest';
import { votingApi } from '../api/votingApi';

describe('votingApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('castVote_calls_POST_votes_with_presentationId', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(
      new Response(null, { status: 201 })
    );
    vi.stubGlobal('fetch', mockFetch);

    await votingApi.castVote('abc-123');

    expect(mockFetch).toHaveBeenCalledWith(
      '/votes/abc-123',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('getVoteCount_calls_GET_votes_count_and_returns_number', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ count: 5 }), { status: 200 })
    );
    vi.stubGlobal('fetch', mockFetch);

    const count = await votingApi.getVoteCount('abc-123');

    expect(mockFetch).toHaveBeenCalledWith(
      '/votes/abc-123/count',
      expect.anything()
    );
    expect(count).toBe(5);
  });
});
