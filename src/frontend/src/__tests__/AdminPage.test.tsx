import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';
import * as presentationApiModule from '../api/presentationApi';

vi.mock('../api/presentationApi', () => ({
  presentationApi: {
    getPresentations: vi.fn(),
    createPresentation: vi.fn(),
    deletePresentation: vi.fn(),
  },
}));

const mockApi = presentationApiModule.presentationApi as {
  getPresentations: ReturnType<typeof vi.fn>;
  createPresentation: ReturnType<typeof vi.fn>;
  deletePresentation: ReturnType<typeof vi.fn>;
};

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders_presentations_heading', () => {
    mockApi.getPresentations.mockResolvedValueOnce([]);
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    const heading = screen.getByRole('heading', { name: /presentations/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders_add_presentation_button', () => {
    mockApi.getPresentations.mockResolvedValueOnce([]);
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
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
});
