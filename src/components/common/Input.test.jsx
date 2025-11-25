/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Input from './Input';

describe('Input Component', () => {
  it('renders label and input', () => {
    render(<Input name="name" label="Name" />);
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Input name="name" label="Name" error="Name is required" />);
    expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
  });
});