// tests/components/KanbanBoard.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import KanbanBoard from '../../src/app/components/KanbanBoard';

// Mock the API utility
jest.mock('../../src/app/api/api', () => ({
  ticketUtils: {
    getStatusColor: jest.fn().mockReturnValue('bg-yellow-500/20 text-yellow-400 border-yellow-500/50')
  }
}));

// Mock the useRouter hook
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

describe('KanbanBoard Component', () => {
  // Sample ticket data
  const mockTickets = [
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
  ];

  const mockUpdateTicket = jest.fn().mockResolvedValue(true);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders kanban columns', () => {
    render(
      <KanbanBoard 
        tickets={mockTickets} 
        updateTicket={mockUpdateTicket} 
      />
    );
    
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });
  
  it('displays tickets in the correct columns', () => {
    render(
      <KanbanBoard 
        tickets={mockTickets} 
        updateTicket={mockUpdateTicket} 
      />
    );
    
    // Check that pending ticket is in the pending column
    const pendingTicket = screen.getByText('Pending Ticket');
    expect(pendingTicket).toBeInTheDocument();
    
    // Check that resolved ticket is in the resolved column
    const resolvedTicket = screen.getByText('Resolved Ticket');
    expect(resolvedTicket).toBeInTheDocument();
  });
  
  it('shows empty state message for columns with no tickets', () => {
    render(
      <KanbanBoard 
        tickets={[mockTickets[0]]} // Only the pending ticket
        updateTicket={mockUpdateTicket} 
      />
    );
    
    // Find empty state messages (should be 3 of them)
    const emptyStateMessages = screen.getAllByText('No tickets in this column');
    expect(emptyStateMessages.length).toBe(3);
  });
  
  it('navigates to ticket detail when a ticket is clicked', () => {
    render(
      <KanbanBoard 
        tickets={mockTickets} 
        updateTicket={mockUpdateTicket} 
      />
    );
    
    // Click the pending ticket
    fireEvent.click(screen.getByText('Pending Ticket'));
    
    // Check router.push was called with the correct path
    expect(mockPush).toHaveBeenCalledWith('/tickets/123');
  });
  
  it('handles drag and drop functionality', () => {
    // This test is simplified as browser drag & drop is hard to test
    // We'll mock these events and check if the right functions are called
    
    render(
      <KanbanBoard 
        tickets={mockTickets} 
        updateTicket={mockUpdateTicket} 
      />
    );
    
    // Find a ticket element
    const pendingTicket = screen.getByText('Pending Ticket').closest('div');
    
    // Mock the drag & drop event data
    const dataTransfer = { 
      setData: jest.fn(),
      getData: jest.fn().mockReturnValue('123') // Return the pendingTicket ID
    };
    
    // Simulate dragStart
    fireEvent.dragStart(pendingTicket, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith('ticketId', '123');
    
    // Find a target column (resolved)
    const resolvedColumn = screen.getByText('Resolved').closest('div');
    
    // Simulate drop
    fireEvent.drop(resolvedColumn, { dataTransfer });
    
    // Check that updateTicket was called with the right parameters
    expect(mockUpdateTicket).toHaveBeenCalledWith('123', { status: 'resolved' });
  });
});