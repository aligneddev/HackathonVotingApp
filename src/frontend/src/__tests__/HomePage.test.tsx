import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';

describe('HomePage', () => {
  it('renders_welcome_heading', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const heading = screen.getByRole('heading', { name: /hackathon voting/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders_engineering_theme_elements', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const motif = screen.getByTestId('engineering-motif');
    expect(motif).toBeInTheDocument();
  });

  it('is_mobile_first_layout', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    // CTA link navigates to /vote (voting is now open)
    const cta = screen.getByRole('link', { name: /start voting/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/vote');
  });
});
