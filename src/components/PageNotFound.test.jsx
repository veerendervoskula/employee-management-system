/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PageNotFound from './PageNotFound';

describe('PageNotFiund Component', () => {
  it('renders Page not found text', async () => {
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText(/Page not found/i)).not.toBeNull();
    });
  });
});