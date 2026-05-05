import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VotingButton from '../components/VotingButton';
import * as votingApiModule from '../api/votingApi';

vi.mock('../api/votingApi', () => ({
  votingApi: {
    castVote: vi.fn(),
    getVoteCount: vi.fn(),
  },
}));

const mockApi = votingApiModule.votingApi as {
  castVote: ReturnType<typeof vi.fn>;
  getVoteCount: ReturnType<typeof vi.fn>;
};

describe('VotingButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders_vote_button_when_not_voted', () => {
    render(<VotingButton presentationId="abc-123" />);
    const button = screen.getByRole('button', { name: /^vote$/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders_voted_button_when_already_voted_in_localstorage', () => {
    localStorage.setItem('voted-abc-123', 'true');
    render(<VotingButton presentationId="abc-123" />);
    const button = screen.getByRole('button', { name: /voted!/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('clicking_vote_button_calls_castVote_with_correct_id', async () => {
    mockApi.castVote.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<VotingButton presentationId="abc-123" />);

    const button = screen.getByRole('button', { name: /^vote$/i });
    await user.click(button);

    expect(mockApi.castVote).toHaveBeenCalledWith('abc-123');
  });

  it('after_successful_vote_button_shows_voted_and_is_disabled', async () => {
    mockApi.castVote.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<VotingButton presentationId="abc-123" />);

    await user.click(screen.getByRole('button', { name: /^vote$/i }));

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /voted!/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });
});
