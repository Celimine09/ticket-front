// tests/pages/kanban.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import KanbanPage from '../../src/app/kanban/page';

// Mock the API service
jest.mock('../../src/app/api/api', () => {
  return {
    __esModule: true,
    default: {
      getAllTickets: jest.fn().mockResolvedValue([
        {
          _id: '123',
          title: 'Pending Ticket',
          description: 'Test description',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '456',
          title: 'Resolved Ticket',
          description: 'Test description',
          status: 'resolved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]),
      updateTicket: jest.fn().mockResolvedValue({
        _id: '123',
        title: 'Updated Ticket',
        status: 'resolved'
      })
    }
  };
});

// Mock the Layout component
jest.mock('../../src/app/components/Layout', () => {
  return ({ children }) => <div data-testid="mock-layout">{children}</div>;
});

// Mock the KanbanBoard component
jest.mock('../../src/app/components/KanbanBoard', () => {
  return function MockKanbanBoard({ tickets, updateTicket }) {
    return (
      <div data-testid="mock-kanban-board">
        <div>Total tickets: {tickets.length}</div>
        <button 
          data-testid="update-button" 
          onClick={() => updateTicket('123', { status: 'resolved' })}
        >
          Update Ticket
        </button>
      </div>
    );
  };
});

describe('Kanban Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title and description', async () => {
    await act(async () => {
      render(<KanbanPage />);
    });

    expect(screen.getByText('Kanban Board')).toBeInTheDocument();
    expect(screen.getByText(/Visualize and manage ticket workflow/i)).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<KanbanPage />);
    expect(screen.getByText(/Loading Kanban board/i)).toBeInTheDocument();
  });

  it('fetches and displays tickets in kanban board', async () => {
    const api = require('../../src/app/api/api').default;

    await act(async () => {
      render(<KanbanPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-kanban-board')).toBeInTheDocument();
    });

    expect(screen.getByText('Total tickets: 2')).toBeInTheDocument();
    expect(api.getAllTickets).toHaveBeenCalledTimes(1);
  });

  it('updates tickets when updateTicket is called', async () => {
    const api = require('../../src/app/api/api').default;

    await act(async () => {
      render(<KanbanPage />);
    });

    // Wait for kanban board to render
    await waitFor(() => {
      expect(screen.getByTestId('mock-kanban-board')).toBeInTheDocument();
    });

    // Click update button in mock component
    await act(async () => {
      fireEvent.click(screen.getByTestId('update-button'));
    });

    // Check that updateTicket was called with right params
    expect(api.updateTicket).toHaveBeenCalledWith('123', { status: 'resolved' });
  });

  it('handles API error gracefully', async () => {
    const api = require('../../src/app/api/api').default;
    api.getAllTickets.mockRejectedValueOnce(new Error('Failed to fetch tickets'));

    await act(async () => {
      render(<KanbanPage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Failed to fetch tickets/i)).toBeInTheDocument();
  });
});