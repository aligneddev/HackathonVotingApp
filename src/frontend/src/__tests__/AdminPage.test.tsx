import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';
import * as presentationApiModule from '../api/presentationApi';
import * as adminVotingApiModule from '../api/adminVotingApi';

vi.mock('../api/presentationApi', () => ({
  presentationApi: {
    getPresentations: vi.fn(),
    createPresentation: vi.fn(),
    deletePresentation: vi.fn(),
  },
}));

vi.mock('../api/adminVotingApi', () => ({
  adminVotingApi: {
    getVotingState: vi.fn(),
    startVoting: vi.fn(),
    endVoting: vi.fn(),
  },
}));

const mockApi = presentationApiModule.presentationApi as {
  getPresentations: ReturnType<typeof vi.fn>;
  createPresentation: ReturnType<typeof vi.fn>;
  deletePresentation: ReturnType<typeof vi.fn>;
};

const mockVotingApi = adminVotingApiModule.adminVotingApi as {
  getVotingState: ReturnType<typeof vi.fn>;
  startVoting: ReturnType<typeof vi.fn>;
  endVoting: ReturnType<typeof vi.fn>;
};

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVotingApi.getVotingState.mockResolvedValue({ isOpen: true, updatedAt: new Date().toISOString() });
  });

  it('renders_presentations_heading', async () => {
    mockApi.getPresentations.mockResolvedValueOnce([]);
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    await screen.findByText(/no presentations yet/i);
    const heading = screen.getByRole('heading', { name: /presentations/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders_add_presentation_button', async () => {
    mockApi.getPresentations.mockResolvedValueOnce([]);
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    await screen.findByText(/no presentations yet/i);
    const button = screen.getByRole('button', { name: /add presentation/i });
    expect(button).toBeInTheDocument();
  });

  it('renders_presentation_list_after_fetch', async () => {
    const mockPresentations = [
      { id: '1', title: 'Amazing Demo', presenterName: 'Jane Dev', description: '', createdAt: new Date().toISOString() },
    ];
    mockApi.getPresentations.mockResolvedValueOnce(mockPresentations);
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    await waitFor(() => { expect(screen.getByText('Amazing Demo')).toBeInTheDocument(); });
  });

  it('renders_voting_controls', async () => {
    mockApi.getPresentations.mockResolvedValueOnce([]);
    render(<MemoryRouter><AdminPage /></MemoryRouter>);

    expect(await screen.findByRole('button', { name: /start voting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /end voting/i })).toBeInTheDocument();
  });

  it('clicking_end_voting_calls_end_endpoint', async () => {
    const user = userEvent.setup();
    mockApi.getPresentations.mockResolvedValueOnce([]);
    mockVotingApi.endVoting.mockResolvedValueOnce({ isOpen: false, updatedAt: new Date().toISOString() });

    render(<MemoryRouter><AdminPage /></MemoryRouter>);

    const endButton = await screen.findByRole('button', { name: /end voting/i });
    await user.click(endButton);

    expect(mockVotingApi.endVoting).toHaveBeenCalledTimes(1);
  });
});
