import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VotingPage from "../pages/VotingPage";
import * as presentationApiModule from "../api/presentationApi";
import * as adminVotingApiModule from "../api/adminVotingApi";
import * as votingApiModule from "../api/votingApi";

vi.mock("../api/presentationApi", () => ({
  presentationApi: {
    getPresentations: vi.fn(),
  },
}));

vi.mock("../api/adminVotingApi", () => ({
  adminVotingApi: {
    getVotingState: vi.fn(),
    startVoting: vi.fn(),
    endVoting: vi.fn(),
  },
}));

vi.mock("../api/votingApi", () => ({
  votingApi: {
    castBallot: vi.fn(),
  },
}));

const mockGetPresentations = vi.mocked(
  presentationApiModule.presentationApi.getPresentations,
);
const mockGetVotingState = vi.mocked(
  adminVotingApiModule.adminVotingApi.getVotingState,
);
const mockCastBallot = vi.mocked(votingApiModule.votingApi.castBallot);

describe("VotingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows_closed_message_when_voting_is_not_open", async () => {
    mockGetPresentations.mockResolvedValueOnce([
      {
        id: "p-1",
        title: "Demo",
        presenterName: "Han",
        description: "",
        createdAt: new Date().toISOString(),
      },
    ]);
    mockGetVotingState.mockResolvedValueOnce({
      isOpen: false,
      updatedAt: new Date().toISOString(),
    });

    render(<VotingPage />);

    expect(
      await screen.findByText(/voting hasn't started yet/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /submit rankings/i }),
    ).not.toBeInTheDocument();
  });

  it("submits_rankings_as_single_ballot", async () => {
    const user = userEvent.setup();
    const voterAlias = "Team Rocket";
    mockGetPresentations.mockResolvedValueOnce([
      {
        id: "p-1",
        title: "Demo 1",
        presenterName: "Han",
        description: "",
        createdAt: new Date().toISOString(),
      },
      {
        id: "p-2",
        title: "Demo 2",
        presenterName: "Leia",
        description: "",
        createdAt: new Date().toISOString(),
      },
    ]);
    mockGetVotingState.mockResolvedValueOnce({
      isOpen: true,
      updatedAt: new Date().toISOString(),
    });
    mockCastBallot.mockResolvedValueOnce(undefined);

    render(<VotingPage />);

    const nameInput = await screen.findByLabelText(/voter alias/i);
    await user.type(nameInput, voterAlias);
    await user.click(screen.getByRole("button", { name: /submit rankings/i }));

    await waitFor(() => {
      expect(mockCastBallot).toHaveBeenCalledWith(voterAlias, [
        { presentationId: "p-1", ranking: 1, notes: undefined },
        { presentationId: "p-2", ranking: 2, notes: undefined },
      ]);
    });
  });
});
