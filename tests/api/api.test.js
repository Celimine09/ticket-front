// tests/api/api.test.js (เพิ่มเติม)

import ticketService, { ticketUtils } from '../../src/app/api/api';

// Mock fetch API
global.fetch = jest.fn();

describe('API Service Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    const newTicket = {
      title: 'New Test Ticket',
      description: 'This is a test ticket',
      contactName: 'Test User',
      contactInfo: 'test@example.com'
    };

    it('should create a new ticket successfully', async () => {
      const mockResponse = {
        _id: '12345',
        title: 'New Test Ticket',
        description: 'This is a test ticket',
        contact: {
          name: 'Test User',
          info: 'test@example.com'
        },
        status: 'pending'
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

    it('should handle API errors during ticket creation', async () => {
      const errorMessage = 'Validation failed';
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({ message: errorMessage })
      });

      await expect(ticketService.createTicket(newTicket)).rejects.toThrow(errorMessage);
    });

    it('should handle network errors during ticket creation', async () => {
      const errorMessage = 'Network error';
      global.fetch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(ticketService.createTicket(newTicket)).rejects.toThrow(errorMessage);
    });
  });

  describe('searchTickets', () => {
    const mockTickets = [
      { 
        _id: '123', 
        title: 'Frontend Bug', 
        description: 'There is a bug in frontend',
        contact: { name: 'John', info: 'john@example.com' },
        status: 'pending'
      },
      { 
        _id: '456', 
        title: 'Backend Issue', 
        description: 'There is an issue in backend',
        contact: { name: 'Jane', info: 'jane@example.com' },
        status: 'resolved'
      }
    ];

    it('should filter tickets by search query', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTickets)
      });

      const result = await ticketService.searchTickets({ query: 'frontend' });

      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Frontend Bug');
    });

    it('should search in contact name', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTickets)
      });

      const result = await ticketService.searchTickets({ query: 'jane' });

      expect(result.length).toBe(1);
      expect(result[0].contact.name).toBe('Jane');
    });

    it('should search in contact info', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTickets)
      });

      const result = await ticketService.searchTickets({ query: 'john@example' });

      expect(result.length).toBe(1);
      expect(result[0].contact.info).toBe('john@example.com');
    });

    it('should return all tickets if no query is provided', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTickets)
      });

      const result = await ticketService.searchTickets({});

      expect(result.length).toBe(2);
    });
  });
});