import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VotingPage from '../pages/VotingPage';
import * as presentationApiModule from '../api/presentationApi';
import * as adminVotingApiModule from '../api/adminVotingApi';

vi.mock('../api/presentationApi', () => ({
  presentationApi: {
    getPresentations: vi.fn(),
  },
}));

vi.mock('../api/adminVotingApi', () => ({
  adminVotingApi: {
    getVotingState: vi.fn(),
    startVoting: vi.fn(),
    endVoting: vi.fn(),
  },
}));

const mockGetPresentations = vi.mocked(presentationApiModule.presentationApi.getPresentations);
const mockGetVotingState = vi.mocked(adminVotingApiModule.adminVotingApi.getVotingState);

describe('VotingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows_closed_message_when_voting_is_not_open', async () => {
    mockGetPresentations.mockResolvedValueOnce([
      {
        id: 'p-1',
        title: 'Demo',
        presenterName: 'Han',
        description: '',
        createdAt: new Date().toISOString(),
      },
    ]);
    mockGetVotingState.mockResolvedValueOnce({
      isOpen: false,
      updatedAt: new Date().toISOString(),
    });

    render(<VotingPage />);

    expect(await screen.findByText(/voting hasn't started yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /submit rankings/i })).not.toBeInTheDocument();
  });
});
