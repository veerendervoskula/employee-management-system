/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Select from './Select';

describe('Select Component', () => {
  const options = ['Option1', 'Option2'];

  it('renders label and select', () => {
    render(<Select name="test" label="Test Label" options={options} />);
    expect(screen.getByLabelText(/Test Label/i)).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select name="test" label="Test Label" options={options} />);
    options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('displays error message', () => {
    render(<Select name="test" label="Test Label" options={options} error="Error message" />);
    expect(screen.getByText(/Error message/i)).toBeInTheDocument();
  });
});