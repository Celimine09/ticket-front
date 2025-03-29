// tests/api/api.comprehensive.test.js
import ticketService, { ticketUtils } from '../../src/app/api/api';

// Mock fetch API
global.fetch = jest.fn();

describe('API Service Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('apiCall function', () => {
    it('calls fetch with correct parameters', async () => {
      // This tests the internal apiCall function indirectly through getAllTickets
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce([])
      });

      await ticketService.getAllTickets();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/tickets',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('throws an error when the response is not ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce({ message: 'Server error' })
      });

      await expect(ticketService.getAllTickets()).rejects.toThrow('Server error');
    });

    it('handles network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(ticketService.getAllTickets()).rejects.toThrow('Network failure');
    });

    it('handles JSON parsing errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON'))
      });

      await expect(ticketService.getAllTickets()).rejects.toThrow('Invalid JSON');
    });
  });

  describe('getAllTickets', () => {
    it('fetches tickets with no filters by default', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce([{ _id: '1', title: 'Test' }])
      });

      const result = await ticketService.getAllTickets();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/tickets',
        expect.any(Object)
      );
      expect(result).toEqual([{ _id: '1', title: 'Test' }]);
    });

    it('applies status filter when provided', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce([{ _id: '1', title: 'Test', status: 'pending' }])
      });

      await ticketService.getAllTickets({ status: 'pending' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/tickets?status=pending',
        expect.any(Object)
      );
    });

    it('applies sort filter when provided', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce([{ _id: '1', title: 'Test' }])
      });

      await ticketService.getAllTickets({ sort: 'latest' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/tickets?sort=latest',
        expect.any(Object)
      );
    });

    it('combines multiple filters when provided', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce([{ _id: '1', title: 'Test', status: 'pending' }])
      });

      await ticketService.getAllTickets({ status: 'pending', sort: 'latest' });

      // URL could be in either order depending on how URLSearchParams works
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/status=pending/),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/sort=latest/),
        expect.any(Object)
      );
    });
  });

  describe('getTicketById', () => {
    it('fetches a single ticket with the correct ID', async () => {
      const mockTicket = { _id: '123', title: 'Test Ticket' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTicket)
      });

      const result = await ticketService.getTicketById('123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/tickets/123',
        expect.any(Object)
      );
      expect(result).toEqual(mockTicket);
    });

    it('handles errors correctly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValueOnce({ message: 'Ticket not found' })
      });

      await expect(ticketService.getTicketById('999')).rejects.toThrow('Ticket not found');
    });
  });

  describe('createTicket', () => {
    it('creates a ticket with correct data', async () => {
      const newTicket = {
        title: 'New Ticket',
        description: 'Test description',
        contactName: 'Test User',
        contactInfo: 'test@example.com'
      };

      const mockResponse = {
        _id: '123',
        title: 'New Ticket',
        description: 'Test description',
        contact: {
          name: 'Test User',
          info: 'test@example.com'
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });

      const result = await ticketService.createTicket(newTicket);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/tickets',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTicket)
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles validation errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValueOnce({ message: 'Title is required' })
      });

      await expect(ticketService.createTicket({ description: 'Test' })).rejects.toThrow('Title is required');
    });
  });

  describe('updateTicket', () => {
    it('updates a ticket with correct parameters', async () => {
      const updates = { 
        title: 'Updated Title',
        status: 'resolved'
      };

      const mockResponse = {
        _id: '123',
        title: 'Updated Title',
        description: 'Original description',
        status: 'resolved'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });

      const result = await ticketService.updateTicket('123', updates);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/tickets/123',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles 404 errors correctly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValueOnce({ message: 'Ticket not found' })
      });

      await expect(ticketService.updateTicket('999', { status: 'resolved' })).rejects.toThrow('Ticket not found');
    });
  });

  describe('searchTickets', () => {
    const mockTickets = [
      {
        _id: '1',
        title: 'Frontend Bug',
        description: 'Browser compatibility issue',
        contact: { name: 'John', info: 'john@example.com' },
        status: 'pending'
      },
      {
        _id: '2',
        title: 'API Issue',
        description: 'Backend error in login process',
        contact: { name: 'Jane', info: 'jane@example.com' },
        status: 'resolved'
      },
      {
        _id: '3',
        title: 'Database Connection',
        description: 'MongoDB connection timeout',
        contact: { name: 'Bob', info: 'bob@example.com' },
        status: 'accepted'
      }
    ];

    beforeEach(() => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTickets)
      });
    });

    it('returns all tickets when no query is provided', async () => {
      const result = await ticketService.searchTickets({});
      expect(result.length).toBe(3);
    });

    it('filters by title', async () => {
      const result = await ticketService.searchTickets({ query: 'frontend' });
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Frontend Bug');
    });

    it('filters by description', async () => {
      const result = await ticketService.searchTickets({ query: 'mongodb' });
      expect(result.length).toBe(1);
      expect(result[0].description).toContain('MongoDB');
    });

    it('filters by contact name', async () => {
      const result = await ticketService.searchTickets({ query: 'jane' });
      expect(result.length).toBe(1);
      expect(result[0].contact.name).toBe('Jane');
    });

    it('filters by contact info', async () => {
      const result = await ticketService.searchTickets({ query: 'bob@example' });
      expect(result.length).toBe(1);
      expect(result[0].contact.info).toBe('bob@example.com');
    });

    it('returns empty array when no matches found', async () => {
      const result = await ticketService.searchTickets({ query: 'nonexistent' });
      expect(result.length).toBe(0);
    });

    it('is case insensitive', async () => {
      const result = await ticketService.searchTickets({ query: 'FRONTEND' });
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Frontend Bug');
    });
  });

  describe('ticketUtils', () => {
    describe('getStatusColor', () => {
      it('returns correct color class for pending status', () => {
        const color = ticketUtils.getStatusColor('pending');
        expect(color).toContain('yellow');
      });

      it('returns correct color class for accepted status', () => {
        const color = ticketUtils.getStatusColor('accepted');
        expect(color).toContain('blue');
      });

      it('returns correct color class for resolved status', () => {
        const color = ticketUtils.getStatusColor('resolved');
        expect(color).toContain('green');
      });

      it('returns correct color class for rejected status', () => {
        const color = ticketUtils.getStatusColor('rejected');
        expect(color).toContain('red');
      });

      it('returns default color for unknown status', () => {
        const color = ticketUtils.getStatusColor('unknown-status');
        expect(color).toContain('gray');
      });
    });

    describe('formatStatus', () => {
      it('capitalizes the first letter of the status', () => {
        expect(ticketUtils.formatStatus('pending')).toBe('Pending');
        expect(ticketUtils.formatStatus('accepted')).toBe('Accepted');
        expect(ticketUtils.formatStatus('resolved')).toBe('Resolved');
        expect(ticketUtils.formatStatus('rejected')).toBe('Rejected');
      });

      it('handles empty string', () => {
        expect(ticketUtils.formatStatus('')).toBe('');
      });
    });
  });
});