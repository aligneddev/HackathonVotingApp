import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LeaderboardPage from "../pages/LeaderboardPage";
import * as leaderboardApiModule from "../api/leaderboardApi";

vi.mock("../api/leaderboardApi", () => ({
  leaderboardApi: {
    getLeaderboard: vi.fn(),
  },
}));

const mockApi = leaderboardApiModule.leaderboardApi as {
  getLeaderboard: ReturnType<typeof vi.fn>;
};

const mockLeaderboard = [
  {
    id: "id-1",
    title: "Best Demo",
    presenterName: "Luke Skywalker",
    voteCount: 10,
  },
  {
    id: "id-2",
    title: "Second Demo",
    presenterName: "Leia Organa",
    voteCount: 7,
  },
  { id: "id-3", title: "Third Demo", presenterName: "Han Solo", voteCount: 3 },
];

describe("LeaderboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders_loading_state", () => {
    // Never-resolving promise simulates in-flight request
    mockApi.getLeaderboard.mockReturnValue(new Promise(() => {}));

    render(<LeaderboardPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders_leaderboard_entries", async () => {
    mockApi.getLeaderboard.mockResolvedValue(mockLeaderboard);

    render(<LeaderboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Best Demo")).toBeInTheDocument();
      expect(screen.getByText("Second Demo")).toBeInTheDocument();
      expect(screen.getByText("Third Demo")).toBeInTheDocument();
    });
  });

  it("shows_rank_numbers", async () => {
    mockApi.getLeaderboard.mockResolvedValue(mockLeaderboard);

    render(<LeaderboardPage />);

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("shows_vote_counts", async () => {
    mockApi.getLeaderboard.mockResolvedValue(mockLeaderboard);

    render(<LeaderboardPage />);

    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("7")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });
});
