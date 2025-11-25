/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Employees from './Employees';
import { fetchWithRateLimit } from '../utils/api';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../utils/api', () => ({
  fetchWithRateLimit: jest.fn(),
}));

jest.mock('../utils/autoDismiss', () => ({
  autoDismiss: jest.fn(),
}));

describe('Employees Component', () => {
  const mockEmployees = {
    employees: [
      { id: 1, name: 'John Doe', assigned: 1 },
      { id: 2, name: 'Jane Smith', assigned: 0 },
    ],
    pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
  };

  beforeEach(() => {
    fetchWithRateLimit.mockClear();
  });

  it('renders and fetches employees on mount', async () => {
    fetchWithRateLimit.mockResolvedValue(mockEmployees);

    render(
      <MemoryRouter>
        <Employees />
      </MemoryRouter>
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchWithRateLimit).toHaveBeenCalledTimes(1);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('handles delete with confirmation', async () => {
    fetchWithRateLimit.mockResolvedValue(mockEmployees);

    render(
      <MemoryRouter>
        <Employees />
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText('John Doe'));

    window.confirm = jest.fn(() => true);
    fetchWithRateLimit.mockResolvedValueOnce({ message: 'Deleted successfully' });

    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(fetchWithRateLimit).toHaveBeenCalledWith(
        expect.stringContaining('/employees/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('shows error alert on fetch failure', async () => {
    fetchWithRateLimit.mockRejectedValue(new Error('API Error'));

    render(
      <MemoryRouter>
        <Employees />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText(/API Error/i)).not.toBeNull();
    });
  });

  it('handles pagination change', async () => {
    const mockEmployees = {
      employees: [
        { id: 1, name: 'John Doe', assigned: 1 },
        { id: 2, name: 'Jane Smith', assigned: 0 },
      ],
      pagination: { total: 20, page: 1, limit: 10, totalPages: 2 },
    };
    fetchWithRateLimit.mockResolvedValue(mockEmployees);

    render(
      <MemoryRouter>
        <Employees />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('John Doe'));
    const nextPageButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(fetchWithRateLimit).toHaveBeenCalledTimes(2);
    });
  });
});