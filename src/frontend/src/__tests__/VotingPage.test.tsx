import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VotingPage from "../pages/VotingPage";
import * as presentationApiModule from "../api/presentationApi";
import * as publicVotingApiModule from "../api/publicVotingApi";
import * as votingApiModule from "../api/votingApi";

vi.mock("../api/presentationApi", () => ({
  presentationApi: {
    getPresentations: vi.fn(),
  },
}));

vi.mock("../api/publicVotingApi", () => ({
  publicVotingApi: {
    getVotingState: vi.fn(),
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
  publicVotingApiModule.publicVotingApi.getVotingState,
);
const mockCastBallot = vi.mocked(votingApiModule.votingApi.castBallot);

const defaultVotingState = {
  isOpen: true,
  currentPresentationId: null,
  currentPresentationTitle: null,
  presentationStartedAt: null,
  durationMinutes: 5,
};

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
    mockGetVotingState.mockResolvedValue({
      ...defaultVotingState,
      isOpen: false,
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
    const voterAlias = "Your Name";
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
    mockGetVotingState.mockResolvedValue(defaultVotingState);
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

  it("shows_current_presentation_banner_with_title", async () => {
    mockGetPresentations.mockResolvedValueOnce([
      {
        id: "p-1",
        title: "Demo",
        presenterName: "Han",
        description: "",
        createdAt: new Date().toISOString(),
      },
    ]);
    const startedAt = new Date(Date.now() - 30_000).toISOString();
    mockGetVotingState.mockResolvedValue({
      isOpen: true,
      currentPresentationId: "p-1",
      currentPresentationTitle: "Demo",
      presentationStartedAt: startedAt,
      durationMinutes: 5,
    });

    render(<VotingPage />);

    expect(await screen.findByText(/now presenting/i)).toBeInTheDocument();
    expect(
      screen.getAllByText("Demo").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("shows_countdown_timer_when_presentation_active", async () => {
    mockGetPresentations.mockResolvedValueOnce([
      {
        id: "p-1",
        title: "My Talk",
        presenterName: "Luke",
        description: "",
        createdAt: new Date().toISOString(),
      },
    ]);
    const startedAt = new Date(Date.now() - 60_000).toISOString();
    mockGetVotingState.mockResolvedValue({
      isOpen: true,
      currentPresentationId: "p-1",
      currentPresentationTitle: "My Talk",
      presentationStartedAt: startedAt,
      durationMinutes: 5,
    });

    render(<VotingPage />);

    await waitFor(() => {
      const timer = screen.getByLabelText(/remaining/i);
      expect(timer).toBeInTheDocument();
      expect(timer.textContent).toMatch(/^\d+:\d{2}$/);
    });
  });
});
