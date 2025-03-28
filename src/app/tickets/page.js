"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import TicketList from '../components/TicketList';
import { PlusCircle, Search, Filter, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import ticketService from '../api/api';
import { debounce } from 'lodash'; 

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  // Create the fetch function
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching tickets from API');
      
      const data = await ticketService.getAllTickets();
      console.log(`Fetched ${data.length} tickets`);
      
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError(error.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate filtered tickets whenever dependencies change
  const filteredTickets = useMemo(() => {
    let result = [...tickets];
    
    // Apply status filter if not set to 'all'
    if (statusFilter !== 'all') {
      result = result.filter(ticket => ticket.status === statusFilter);
    }
    
    // Apply search filter if search query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ticket => 
        ticket.title.toLowerCase().includes(query) || 
        ticket.description.toLowerCase().includes(query) ||
        (ticket.contact?.name && ticket.contact.name.toLowerCase().includes(query)) ||
        (ticket.contact?.info && ticket.contact.info.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [tickets, searchQuery, statusFilter]);

  // Create debounced search handler to improve performance
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      setSearchQuery(value);
    }, 300),
    []
  );

  // Handle search input change
  const handleSearch = useCallback((e) => {
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  // Handle status filter change
  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status);
  }, []);

  // Toggle filters visibility
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  // Status filter buttons with consistent styling
  const StatusFilterButton = ({ status, label, colorClass }) => (
    <button
      onClick={() => handleStatusFilter(status)}
      className={`px-3 py-1 rounded-full text-xs font-medium border ${
        statusFilter === status 
          ? colorClass
          : 'border-border/50 text-muted-foreground hover:bg-secondary/80'
      }`}
    >
      {label}
    </button>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">All Tickets</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all support tickets
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-700 px-4 py-3 rounded-md">
            {error}
            <button onClick={fetchTickets} className="underline ml-2">
              Retry
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 flex-1">
            <Search size={18} className="text-muted-foreground mr-2" />
            <input
              type="text"
              placeholder="Search tickets..."
              onChange={handleSearch}
              className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <button
            onClick={toggleFilters}
            className="flex items-center justify-center gap-2 glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2"
          >
            <Filter size={18} />
            <span className="md:inline hidden">Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal size={16} className="text-primary" />
              <h3 className="font-medium">Status Filter</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <StatusFilterButton 
                status="all" 
                label="All" 
                colorClass="bg-primary/20 border-primary/50 text-primary" 
              />
              <StatusFilterButton 
                status="pending" 
                label="Pending" 
                colorClass="bg-yellow-500/20 border-yellow-500/50 text-yellow-400" 
              />
              <StatusFilterButton 
                status="accepted" 
                label="Accepted" 
                colorClass="bg-blue-500/20 border-blue-500/50 text-blue-400" 
              />
              <StatusFilterButton 
                status="resolved" 
                label="Resolved" 
                colorClass="bg-green-500/20 border-green-500/50 text-green-400" 
              />
              <StatusFilterButton 
                status="rejected" 
                label="Rejected" 
                colorClass="bg-red-500/20 border-red-500/50 text-red-400" 
              />
            </div>
          </div>
        )}

        <TicketList 
          tickets={filteredTickets} 
          loading={loading}
          error={error}
          onRetry={fetchTickets}
        />
      </div>
    </Layout>
  );
}