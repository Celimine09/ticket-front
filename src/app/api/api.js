/**
 * API service for backend communication
 */

const API_URL = 'http://localhost:5003/api';

// Generic API call function to reduce code duplication
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    ...(data && { body: JSON.stringify(data) })
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API call failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

export const ticketService = {
  // Get all tickets with optional filtering
  getAllTickets: async (filter = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add any filters to the query params
    if (filter.status) queryParams.append('status', filter.status);
    if (filter.sort) queryParams.append('sort', filter.sort);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiCall(`/tickets${queryString}`);
  },
  
  // Get ticket by ID
  getTicketById: async (id) => {
    return apiCall(`/tickets/${id}`);
  },
  
  // Create a new ticket
  createTicket: async (ticketData) => {
    return apiCall('/tickets', 'POST', ticketData);
  },
  
  // Update a ticket - can update status, contact info, or any other fields
  updateTicket: async (id, updates) => {
    return apiCall(`/tickets/${id}`, 'PUT', updates);
  },
  
  // Search tickets with multiple parameters
  searchTickets: async (searchParams) => {
    const tickets = await ticketService.getAllTickets();
    
    // Client-side filtering if the API doesn't support search directly
    if (searchParams.query) {
      const query = searchParams.query.toLowerCase();
      return tickets.filter(ticket => 
        ticket.title.toLowerCase().includes(query) || 
        ticket.description.toLowerCase().includes(query) ||
        (ticket.contact?.name && ticket.contact.name.toLowerCase().includes(query)) ||
        (ticket.contact?.info && ticket.contact.info.toLowerCase().includes(query))
      );
    }
    
    return tickets;
  }
};

// Additional utility functions for use with tickets
export const ticketUtils = {
  // Get color classes based on ticket status
  getStatusColor: (status) => {
    const statusColors = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      accepted: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      resolved: "bg-green-500/20 text-green-400 border-green-500/50",
      rejected: "bg-red-500/20 text-red-400 border-red-500/50"
    };
    return statusColors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/50";
  },
  
  // Format the ticket status for display
  formatStatus: (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export default ticketService;