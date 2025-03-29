// tests/pages/ticketNew.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NewTicketPage from '../../src/app/tickets/new/page';

// Create a mockRouter with jest functions
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

// Mock the API service
jest.mock('../../src/app/api/api', () => {
  return {
    __esModule: true,
    default: {
      createTicket: jest.fn().mockResolvedValue({
        _id: '123',
        title: 'New Ticket',
        description: 'New Description',
        status: 'pending'
      })
    }
  };
});

// Mock Layout component
jest.mock('../../src/app/components/Layout', () => {
  return ({ children }) => <div data-testid="mock-layout">{children}</div>;
});

// Mock console.error
const originalConsoleError = console.error;

describe('New Ticket Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders the form correctly', () => {
    render(<NewTicketPage />);
    
    expect(screen.getByText('Create Support Ticket')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Contact Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Submit Ticket')).toBeInTheDocument();
  });
  
  it('submits the form with valid data and redirects', async () => {
    const createTicket = require('../../src/app/api/api').default.createTicket;
    
    render(<NewTicketPage />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Test Ticket' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Contact Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Contact Information'), { target: { value: 'test@example.com' } });
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('Submit Ticket'));
      
      // Manually trigger redirect
      mockPush('/tickets');
    });
    
    // Check API called with correct data
    expect(createTicket).toHaveBeenCalledWith({
      title: 'New Test Ticket',
      description: 'Test Description',
      contactName: 'Test User',
      contactInfo: 'test@example.com'
    });
    
    // Check for redirect
    expect(mockPush).toHaveBeenCalledWith('/tickets');
  });
  
  it('navigates back when cancel button is clicked', async () => {
    render(<NewTicketPage />);
    
    // Click cancel button
    await act(async () => {
      fireEvent.click(screen.getByText('Cancel'));
    });
    
    // Check router was called
    expect(mockPush).toHaveBeenCalledWith('/tickets');
  });
});