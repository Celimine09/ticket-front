"use client";

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import KanbanBoard from '../components/KanbanBoard';
import ticketService from '../api/api';

export default function KanbanPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAllTickets();
      setTickets(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const updateTicket = async (id, updates) => {
    try {
      await ticketService.updateTicket(id, updates);
      // Refresh tickets after update
      fetchTickets();
      return true;
    } catch (error) {
      console.error('Error updating ticket:', error);
      setError(error.message);
      return false;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Kanban Board</h1>
          <p className="text-muted-foreground mt-1">
            Visualize and manage ticket workflow
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-700 px-4 py-3 rounded-md">
            Error: {error}. Please try again.
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-pulse text-primary">
              Loading Kanban board...
            </div>
          </div>
        ) : (
          <KanbanBoard tickets={tickets} updateTicket={updateTicket} />
        )}
      </div>
    </Layout>
  );
}