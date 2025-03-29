// tests/components/TicketList.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TicketList from '../../src/app/components/TicketList';

// Mock API service
jest.mock('../../src/app/api/api', () => ({
  ticketUtils: {
    getStatusColor: jest.fn().mockReturnValue('text-yellow-400 bg-yellow-500/20 border-yellow-500/50')
  }
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn().mockReturnValue('3 days ago')
}));

// Mock the useRouter hook
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

describe('TicketList Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Sample ticket data for tests
  const mockTickets = [
    {
      _id: '123456789abc',
      title: 'Test Ticket 1',
      description: 'Description for ticket 1',
      status: 'pending',
      contact: {
        name: 'John Doe',
        info: 'john@example.com'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  test('displays loading state when loading is true', () => {
    render(<TicketList tickets={[]} loading={true} />);
    expect(screen.getByText('Loading tickets...')).toBeInTheDocument();
  });

  test('displays empty state when no tickets are available', () => {
    render(<TicketList tickets={[]} loading={false} />);
    expect(screen.getByText('No tickets found')).toBeInTheDocument();
    expect(screen.getByText('Create your first support ticket to get started')).toBeInTheDocument();
  });

  test('displays error message when error is provided', () => {
    const errorMessage = 'Failed to fetch tickets';
    const mockRetry = jest.fn();
    
    render(
      <TicketList 
        tickets={[]} 
        loading={false} 
        error={errorMessage} 
        onRetry={mockRetry} 
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  test('renders tickets correctly when provided', () => {
    render(<TicketList tickets={mockTickets} loading={false} />);
    
    expect(screen.getByText('Test Ticket 1')).toBeInTheDocument();
    expect(screen.getByText('Description for ticket 1')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  test('navigates to ticket detail page when clicked', () => {
    render(<TicketList tickets={mockTickets} loading={false} />);
    
    // Find and click the ticket card
    fireEvent.click(screen.getByText('Test Ticket 1'));
    
    // Check that router.push was called with the correct path
    expect(mockPush).toHaveBeenCalledWith(`/tickets/${mockTickets[0]._id}`);
  });

  test('calls onCreateTicket when create button is clicked in empty state', () => {
    render(<TicketList tickets={[]} loading={false} />);
    
    const createButton = screen.getByText('Create Ticket');
    fireEvent.click(createButton);
    
    expect(mockPush).toHaveBeenCalledWith('/tickets/new');
  });
});