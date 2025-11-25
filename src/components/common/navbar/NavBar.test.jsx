/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavBar from './NavBar';

describe('NavBar Component', () => {
  it('renders navigation bar with brand link', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );
    const linkElement = screen.getByText(/Plexxis Employees/i);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.closest('a')).toHaveAttribute('href', '/');
  });
});