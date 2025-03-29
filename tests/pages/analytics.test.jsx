// tests/pages/analytics.test.jsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import AnalyticsPage from '../../src/app/analytics/page';

// Mock the API service
jest.mock('../../src/app/api/api', () => {
  return {
    __esModule: true,
    default: {
      getAllTickets: jest.fn().mockResolvedValue([
        {
          _id: '123',
          title: 'Test Ticket 1',
          description: 'Test Description 1',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '456',
          title: 'Test Ticket 2',
          description: 'Test Description 2',
          status: 'resolved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
    }
  };
});

// Mock the Layout component
jest.mock('../../src/app/components/Layout', () => {
  return ({ children }) => <div data-testid="mock-layout">{children}</div>;
});

// Mock TicketAnalytics component
jest.mock('../../src/app/components/TicketAnalytics', () => {
  return function MockTicketAnalytics({ tickets }) {
    return (
      <div data-testid="mock-analytics">
        Analyzed {tickets.length} tickets
      </div>
    );
  };
});

describe('Analytics Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title and description', async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });

    expect(screen.getByText('Ticket Analytics')).toBeInTheDocument();
    expect(screen.getByText(/View statistics and trends for support tickets/i)).toBeInTheDocument();
  });

  it('displays loading state initially', async () => {
    render(<AnalyticsPage />);
    expect(screen.getByText(/Loading analytics data/i)).toBeInTheDocument();
  });

  it('fetches and displays ticket analytics', async () => {
    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-analytics')).toBeInTheDocument();
    });

    expect(screen.getByText('Analyzed 2 tickets')).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    const ticketService = require('../../src/app/api/api').default;
    ticketService.getAllTickets.mockRejectedValueOnce(new Error('Failed to fetch tickets'));

    await act(async () => {
      render(<AnalyticsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Failed to fetch tickets/i)).toBeInTheDocument();
  });
});