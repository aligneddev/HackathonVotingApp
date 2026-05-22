import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminResultsPage from '../pages/AdminResultsPage';
import * as adminResultsApiModule from '../api/adminResultsApi';

vi.mock('../api/adminResultsApi', () => ({
  adminResultsApi: {
    getResults: vi.fn(),
  },
}));

const mockApi = adminResultsApiModule.adminResultsApi as {
  getResults: ReturnType<typeof vi.fn>;
};

describe('AdminResultsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders_vote_count_and_average_ranking', async () => {
    mockApi.getResults.mockResolvedValueOnce([
      {
        id: 'p-1',
        title: 'API Architecture',
        presenterName: 'Leia',
        voteCount: 3,
        totalPoints: 16,
        averagePoints: 5.33,
        firstPlaceCount: 1,
        secondPlaceCount: 1,
        averageRanking: 1.67,
        notes: [{ notes: 'Great story', ranking: 1, createdAt: new Date().toISOString() }],
      },
    ]);

    render(<AdminResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('API Architecture')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('16')).toBeInTheDocument();
      expect(screen.getByText('5.33')).toBeInTheDocument();
    });
  });

  it('opens_scrollable_notes_dialog_from_icon_button', async () => {
    const user = userEvent.setup();

    mockApi.getResults.mockResolvedValueOnce([
      {
        id: 'p-1',
        title: 'Frontend Craftsmanship',
        presenterName: 'Padme',
        voteCount: 2,
        totalPoints: 13,
        averagePoints: 6.5,
        firstPlaceCount: 1,
        secondPlaceCount: 1,
        averageRanking: 2,
        notes: [
          { notes: 'Loved the transitions', ranking: 1, createdAt: new Date().toISOString() },
          { notes: 'Very clear UX', ranking: 3, createdAt: new Date().toISOString() },
        ],
      },
    ]);

    render(<AdminResultsPage />);

    const openButton = await screen.findByRole('button', {
      name: /view notes for frontend craftsmanship/i,
    });
    await user.click(openButton);

    expect(screen.getByRole('dialog', { name: /vote notes for frontend craftsmanship/i })).toBeInTheDocument();
    expect(screen.getByText('Loved the transitions')).toBeInTheDocument();
    expect(screen.getByText('Very clear UX')).toBeInTheDocument();
  });
});
