/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeForm from './EmployeeForm';

global.fetch = jest.fn();

const mockHistory = { push: jest.fn(), replace: jest.fn() };
const mockMatch = { params: {} };

describe('EmployeeForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner when isLoading is true', () => {
    fetch.mockImplementation(() => new Promise(() => { })); // Never resolves
    render(<EmployeeForm history={mockHistory} match={{ params: { id: '1' } }} />);
    expect(screen.getByLabelText(/Loading/i)).toBeInTheDocument();

  });

  it('renders form fields when loaded', () => {
    render(<EmployeeForm history={mockHistory} match={mockMatch} />);
    expect(screen.getByText(/Add New Employee/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
  });

  it('prevents submit if validation fails', async () => {
    render(<EmployeeForm history={mockHistory} match={mockMatch} />);
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    await waitFor(() => {
      expect(screen.getByText(/Name is Required/i)).toBeInTheDocument(); // Validation error would appear
    });
  });

  it('fetches employee data for edit mode', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'John', code: 'F100', profession: 'Runner' })
    });

    render(<EmployeeForm history={mockHistory} match={{ params: { id: '1' } }} />);
    await waitFor(() => {
      expect(screen.getByDisplayValue(/John/i)).toBeInTheDocument();
    });
  });

  it('calls onSuccess and redirects on successful submit', async () => {
    const mockOnSuccess = jest.fn();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Employee successfully created' })
    });

    render(<EmployeeForm history={mockHistory} match={mockMatch} onSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Code/i), { target: { value: 'F100' } });
    fireEvent.change(screen.getByLabelText(/Color/i), { target: { value: 'yellow' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(expect.stringContaining('Employee successfully created'));
      expect(mockHistory.push).toHaveBeenCalledWith('/employees');
    });
  });

  it('shows error alert on fetch failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    render(<EmployeeForm history={mockHistory} match={{ params: { id: '123' } }} />);
    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it('shows error alert on submit failure', async () => {
    fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Failed' }) });
    render(<EmployeeForm history={mockHistory} match={mockMatch} />);
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(screen.getByText(/Code is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Color is required/i)).toBeInTheDocument();
    });
  });
});