import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ResultsPage from "./ResultsPage";
import * as leaderboardApiModule from "../api/leaderboardApi";

vi.mock("../api/leaderboardApi", () => ({
  leaderboardApi: {
    getLeaderboard: vi.fn(),
  },
}));

const mockApi = leaderboardApiModule.leaderboardApi as {
  getLeaderboard: ReturnType<typeof vi.fn>;
};

const fiveEntries = [
  { id: "id-1", title: "Force Awakens App", presenterName: "Luke Skywalker", voteCount: 42 },
  { id: "id-2", title: "Rebel Alliance Dashboard", presenterName: "Leia Organa", voteCount: 35 },
  { id: "id-3", title: "Millennium Falcon Tracker", presenterName: "Han Solo", voteCount: 28 },
  { id: "id-4", title: "Droid Inventory", presenterName: "C-3PO", voteCount: 15 },
  { id: "id-5", title: "Jedi Archives Search", presenterName: "Obi-Wan Kenobi", voteCount: 9 },
];

const twoEntries = [
  { id: "id-1", title: "Force Awakens App", presenterName: "Luke Skywalker", voteCount: 42 },
  { id: "id-2", title: "Rebel Alliance Dashboard", presenterName: "Leia Organa", voteCount: 35 },
];

describe("ResultsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading indicator while the API call is in flight", () => {
    // Never-resolving promise simulates in-flight request
    mockApi.getLeaderboard.mockReturnValue(new Promise(() => {}));

    render(<MemoryRouter><ResultsPage /></MemoryRouter>);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders a Results heading", async () => {
    mockApi.getLeaderboard.mockResolvedValue(fiveEntries);

    render(<MemoryRouter><ResultsPage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /results/i })).toBeInTheDocument();
    });
  });

  it("renders prize labels only for top 3 when 5 entries returned", async () => {
    mockApi.getLeaderboard.mockResolvedValue(fiveEntries);

    render(<MemoryRouter><ResultsPage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/🥇/)).toBeInTheDocument();
      expect(screen.getByText(/🥈/)).toBeInTheDocument();
      expect(screen.getByText(/🥉/)).toBeInTheDocument();
      // Only one of each medal — entries 4 and 5 do not get extra medals
      expect(screen.getAllByText(/🥇/).length).toBe(1);
      expect(screen.getAllByText(/🥈/).length).toBe(1);
      expect(screen.getAllByText(/🥉/).length).toBe(1);
    });
  });

  it("renders the correct prize labels: 1st Place, 2nd Place, 3rd Place", async () => {
    mockApi.getLeaderboard.mockResolvedValue(fiveEntries);

    render(<MemoryRouter><ResultsPage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/1st place/i)).toBeInTheDocument();
      expect(screen.getByText(/2nd place/i)).toBeInTheDocument();
      expect(screen.getByText(/3rd place/i)).toBeInTheDocument();
    });
  });

  it("renders titles for ALL entries", async () => {
    mockApi.getLeaderboard.mockResolvedValue(fiveEntries);

    render(<MemoryRouter><ResultsPage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("Force Awakens App")).toBeInTheDocument();
      expect(screen.getByText("Rebel Alliance Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Millennium Falcon Tracker")).toBeInTheDocument();
      expect(screen.getByText("Droid Inventory")).toBeInTheDocument();
      expect(screen.getByText("Jedi Archives Search")).toBeInTheDocument();
    });
  });

  it("renders presenterName for ALL entries", async () => {
    mockApi.getLeaderboard.mockResolvedValue(fiveEntries);

    render(<MemoryRouter><ResultsPage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("Luke Skywalker")).toBeInTheDocument();
      expect(screen.getByText("Leia Organa")).toBeInTheDocument();
      expect(screen.getByText("Han Solo")).toBeInTheDocument();
      expect(screen.getByText("C-3PO")).toBeInTheDocument();
      expect(screen.getByText("Obi-Wan Kenobi")).toBeInTheDocument();
    });
  });

  it("renders entries 4 and 5 WITHOUT prize labels", async () => {
    mockApi.getLeaderboard.mockResolvedValue(fiveEntries);

    render(<MemoryRouter><ResultsPage /></MemoryRouter>);

    await waitFor(() => {
      // Entries 4 and 5 ARE rendered (not filtered out)
      expect(screen.getByText("Droid Inventory")).toBeInTheDocument();
      expect(screen.getByText("Jedi Archives Search")).toBeInTheDocument();
      expect(screen.getByText("C-3PO")).toBeInTheDocument();
      expect(screen.getByText("Obi-Wan Kenobi")).toBeInTheDocument();
      // No 4th or 5th prize labels
      expect(screen.queryByText(/4th place/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/5th place/i)).not.toBeInTheDocument();
    });
  });

  it("renders only 2 prize cards when fewer than 3 entries exist", async () => {
    mockApi.getLeaderboard.mockResolvedValue(twoEntries);

    render(<MemoryRouter><ResultsPage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/🥇/)).toBeInTheDocument();
      expect(screen.getByText(/🥈/)).toBeInTheDocument();
      expect(screen.queryByText(/🥉/)).not.toBeInTheDocument();
    });
  });

  it("renders no prize cards when the leaderboard is empty", async () => {
    mockApi.getLeaderboard.mockResolvedValue([]);

    render(<MemoryRouter><ResultsPage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.queryByText(/🥇/)).not.toBeInTheDocument();
      expect(screen.queryByText(/🥈/)).not.toBeInTheDocument();
      expect(screen.queryByText(/🥉/)).not.toBeInTheDocument();
    });
  });

  it("calls the leaderboard API exactly once on mount and never again", async () => {
    mockApi.getLeaderboard.mockResolvedValue(fiveEntries);

    render(<MemoryRouter><ResultsPage /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/1st place/i)).toBeInTheDocument();
    });

    expect(mockApi.getLeaderboard).toHaveBeenCalledTimes(1);
  });
});
