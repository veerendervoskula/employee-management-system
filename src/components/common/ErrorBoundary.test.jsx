/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

const ProblemChild = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary Component', () => {
  it('renders children when no error', async() => {
    render(<MemoryRouter><ErrorBoundary><div>Safe Content</div></ErrorBoundary></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Safe Content/i)).toBeInTheDocument();
    });
  });

  it('shows fallback UI when error occurs', async () => {
    render(<MemoryRouter><ErrorBoundary><ProblemChild /></ErrorBoundary></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });

  it('shows error details when showDetails is true', async () => {
    render(<MemoryRouter><ErrorBoundary showDetails><ProblemChild /></ErrorBoundary></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Error Details/i)).toBeInTheDocument();
    });

  });

  it('calls onReset when Try Again clicked', () => {
    const onReset = jest.fn();
    render(<MemoryRouter><ErrorBoundary onReset={onReset}><ProblemChild /></ErrorBoundary></MemoryRouter>);
    fireEvent.click(screen.getByText(/Try Again/i));
    expect(onReset).toHaveBeenCalled();
  });
});