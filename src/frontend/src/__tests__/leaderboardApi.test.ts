import { describe, it, expect, vi, beforeEach } from "vitest";
import { leaderboardApi } from "../api/leaderboardApi";

describe("leaderboardApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("getLeaderboard_callsCorrectEndpoint", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal("fetch", mockFetch);

    await leaderboardApi.getLeaderboard();

    expect(mockFetch).toHaveBeenCalledWith("/leaderboard");
  });

  it("getLeaderboard_returnsRankedList", async () => {
    const mockData = [
      {
        id: "id-1",
        title: "Top Talk",
        presenterName: "Luke Skywalker",
        voteCount: 5,
      },
      {
        id: "id-2",
        title: "Second Talk",
        presenterName: "Leia Organa",
        voteCount: 3,
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      }),
    );

    const result = await leaderboardApi.getLeaderboard();

    expect(result).toEqual(mockData);
  });
});
