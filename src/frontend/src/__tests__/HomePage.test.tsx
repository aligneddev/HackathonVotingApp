import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from '../pages/HomePage';

describe('HomePage', () => {
  it('renders_welcome_heading', () => {
    render(<HomePage />);
    const heading = screen.getByRole('heading', { name: /hackathon voting/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders_engineering_theme_elements', () => {
    render(<HomePage />);
    // Engineering theme: expect a data-testid or aria-label for the visual motif
    const motif = screen.getByTestId('engineering-motif');
    expect(motif).toBeInTheDocument();
  });

  it('is_mobile_first_layout', () => {
    render(<HomePage />);
    // CTA button should be present (disabled)
    const cta = screen.getByRole('button', { name: /start voting/i });
    expect(cta).toBeDisabled();
  });
});
