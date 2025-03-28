"use client";

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TicketAnalytics from '../components/TicketAnalytics';
import ticketService from '../api/api';

export default function AnalyticsPage() {
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
    } catch (error) {
      setError(error.message || 'Failed to load ticket data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Ticket Analytics</h1>
          <p className="text-muted-foreground mt-1">
            View statistics and trends for support tickets
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-700 px-4 py-3 rounded-md">
            Error: {error}. <button onClick={fetchTickets} className="underline">Try again</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-pulse text-primary">Loading analytics data...</div>
          </div>
        ) : (
          <TicketAnalytics tickets={tickets} />
        )}
      </div>
    </Layout>
  );
}