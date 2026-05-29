import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminVotesPage from "../pages/AdminVotesPage";
import * as adminVotesApiModule from "../api/adminVotesApi";

vi.mock("../api/adminVotesApi", () => ({
  adminVotesApi: {
    getVotes: vi.fn(),
  },
}));

const mockApi = adminVotesApiModule.adminVotesApi as {
  getVotes: ReturnType<typeof vi.fn>;
};

describe("AdminVotesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders_voter_id_and_votes_in_rank_order", async () => {
    mockApi.getVotes.mockResolvedValueOnce([
      {
        voterAliasToken: "ALPHA-01",
        entries: [
          {
            presentationId: "p-2",
            presentationTitle: "Platform Scale",
            presenterName: "Linus",
            ranking: 2,
            notes: "Second choice",
            createdAt: new Date().toISOString(),
          },
          {
            presentationId: "p-1",
            presentationTitle: "Model Safety",
            presenterName: "Ada",
            ranking: 1,
            notes: null,
            createdAt: new Date().toISOString(),
          },
        ],
      },
    ]);

    render(<AdminVotesPage />);

    await waitFor(() => {
      expect(screen.getByText("ALPHA-01")).toBeInTheDocument();
      expect(screen.getByText("Model Safety")).toBeInTheDocument();
      expect(screen.getByText("Platform Scale")).toBeInTheDocument();
    });

    const rankingCells = screen
      .getAllByText(/#\d/)
      .map((node) => node.textContent);
    expect(rankingCells).toEqual(["#1", "#2"]);
  });
});
