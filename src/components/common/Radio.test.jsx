/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Radio from './Radio';

describe('Radio Component', () => {
  it('renders Yes and No options', () => {
    render(<Radio name="assigned" label="Assigned" />);
    expect(screen.getByRole(/assigned-yes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Not Assigned/i)).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const handleChange = jest.fn();
    render(<Radio name="assigned" label="Assigned" onChange={handleChange} />);
    fireEvent.click(screen.getByRole(/assigned-yes/i));
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Radio name="assigned" label="Assigned" error="Error message" />);
    expect(screen.getByText(/Error message/i)).toBeInTheDocument();
  });
});