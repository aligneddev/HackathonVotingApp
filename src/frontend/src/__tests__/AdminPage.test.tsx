import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminPage from '../pages/AdminPage';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AdminPage', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders_presentations_heading', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<AdminPage />);
    const heading = screen.getByRole('heading', { name: /presentations/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders_add_presentation_button', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<AdminPage />);
    const button = screen.getByRole('button', { name: /add presentation/i });
    expect(button).toBeInTheDocument();
  });

  it('renders_presentation_list_after_fetch', async () => {
    const mockPresentations = [
      { id: '1', title: 'Amazing Demo', presenterName: 'Jane Dev', description: '', createdAt: new Date().toISOString() },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPresentations,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Amazing Demo')).toBeInTheDocument();
    });
  });
});
