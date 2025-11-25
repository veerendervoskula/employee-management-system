/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportCSV from './ExportCSV';

describe('ExportCSV Component', () => {
  it('renders Export to CSV button', () => {
    render(<ExportCSV onExport={() => {}} />);
    expect(screen.getByText(/Export to CSV/i)).toBeInTheDocument();
  });

  it('calls onExport when button is clicked', () => {
    const mockExport = jest.fn();
    render(<ExportCSV onExport={mockExport} />);
    fireEvent.click(screen.getByText(/Export to CSV/i));
    expect(mockExport).toHaveBeenCalled();
  });
});