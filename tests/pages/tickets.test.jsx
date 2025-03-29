// tests/pages/tickets.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TicketsPage from '../../src/app/tickets/page';

// Mock the TicketList component
jest.mock('../../src/app/components/TicketList', () => {
  return function MockTicketList({ error, onRetry }) {
    return (
      <div data-testid="mock-ticket-list">
        {error ? (
          <div>
            Error: {error}
            <button data-testid="retry-button" onClick={onRetry}>Retry</button>
          </div>
        ) : (
          "Tickets loaded successfully"
        )}
      </div>
    );
  };
});

// Mock Layout component
jest.mock('../../src/app/components/Layout', () => {
  return ({ children }) => <div data-testid="mock-layout">{children}</div>;
});

// Mock API service
jest.mock('../../src/app/api/api', () => {
  return {
    __esModule: true,
    default: {
      getAllTickets: jest.fn(),
      searchTickets: jest.fn()
    }
  };
});

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

describe('Tickets Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles API error gracefully', async () => {
    const ticketService = require('../../src/app/api/api').default;
    
    // Mock implementation for this test
    ticketService.getAllTickets.mockRejectedValueOnce(new Error('API error'));
    
    await act(async () => {
      render(<TicketsPage />);
    });
    
    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('mock-ticket-list')).toHaveTextContent('Error: API error');
    });
  });

  it('allows retrying when fetch fails', async () => {
    const ticketService = require('../../src/app/api/api').default;
    
    // Mock implementation
    ticketService.getAllTickets
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce([{ _id: '123', title: 'Test Ticket' }]);
    
    await act(async () => {
      render(<TicketsPage />);
    });
    
    // Wait for error
    await waitFor(() => {
      expect(screen.getByTestId('mock-ticket-list')).toHaveTextContent('Error: API error');
    });
    
    // Click retry button using test ID to avoid duplicate element issues
    const retryButton = screen.getByTestId('retry-button');
    await act(async () => {
      fireEvent.click(retryButton);
    });
    
    // Should fetch tickets again
    await waitFor(() => {
      expect(ticketService.getAllTickets).toHaveBeenCalledTimes(2);
    });
  });
  
  it('displays search input field', async () => {
    const ticketService = require('../../src/app/api/api').default;
    ticketService.getAllTickets.mockResolvedValueOnce([]);
    
    await act(async () => {
      render(<TicketsPage />);
    });
    
    expect(screen.getByPlaceholderText('Search tickets...')).toBeInTheDocument();
  });
  
  it('shows filter toggle button', async () => {
    const ticketService = require('../../src/app/api/api').default;
    ticketService.getAllTickets.mockResolvedValueOnce([]);
    
    await act(async () => {
      render(<TicketsPage />);
    });
    
    // The filter button is inside a span with "Filters" text inside a media query hidden class
    // So we need to find it by checking if any element has "Filters" text
    const filterButtons = screen.getAllByText('Filters');
    expect(filterButtons.length).toBeGreaterThan(0);
  });
});