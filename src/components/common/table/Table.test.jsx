import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Table from './Table';
import { MemoryRouter } from 'react-router-dom';

describe('Table Component', () => {
  const employees = [{ id: 1, name: 'John', code: 'F100', city: 'Toronto', profession: 'Runner', branch: 'Abacus', assigned: true }];
  const pagination = { total: 1, page: 1, limit: 10, totalPages: 1 };

  it('renders table headers and rows', () => {
    render(<MemoryRouter><Table employees={employees} pagination={pagination} /></MemoryRouter>);
    expect(screen.getByText(/Name/i)).toBeInTheDocument();
    expect(screen.getByText(/John/i)).toBeInTheDocument();
  });

  it('shows loading spinner when loading is true', () => {
    render(<MemoryRouter><Table employees={employees} pagination={pagination} loading /></MemoryRouter>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows "Table is Empty" when no data', () => {
    render(<MemoryRouter><Table employees={[]} pagination={pagination} /></MemoryRouter>);
    expect(screen.getByText(/Table is Empty/i)).toBeInTheDocument();
  });

  it('handles search input', () => {
    render(<MemoryRouter><Table employees={employees} pagination={pagination} /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText(/Search/i), { target: { value: 'John' } });
    expect(screen.getByDisplayValue(/John/i)).toBeInTheDocument();
  });

  it('handles delete button click', () => {
    const handleDelete = jest.fn();
    render(<MemoryRouter><Table employees={employees} pagination={pagination} handleDelete={handleDelete} /></MemoryRouter>);
    fireEvent.click(screen.getByText(/Delete/i));
    expect(handleDelete).toHaveBeenCalledWith(1);
  });
});