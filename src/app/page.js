"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from './components/Layout';
import TicketList from './components/TicketList';
import { Clock, AlertCircle, Check, XCircle } from 'lucide-react';

// API service
const API_URL = 'http://localhost:5003/api';

export default function Dashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    accepted: 0,
    resolved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tickets`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      const data = await response.json();
      setTickets(data);
      
      // Calculate status counts
      const counts = {
        pending: data.filter(t => t.status === 'pending').length,
        accepted: data.filter(t => t.status === 'accepted').length,
        resolved: data.filter(t => t.status === 'resolved').length,
        rejected: data.filter(t => t.status === 'rejected').length,
        total: data.length
      };
      setStatusCounts(counts);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Ticket Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor support ticket activities
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-700 px-4 py-3 rounded-md">
            Error: {error}. Please try again.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card animate-fade-in bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-4">
            <div className="pb-2">
              <h2 className="text-lg flex items-center">
                <Clock className="mr-2 text-yellow-400" size={18} />
                Pending
              </h2>
              <p className="text-muted-foreground text-sm">Awaiting response</p>
            </div>
            <p className="text-3xl font-bold">{statusCounts.pending}</p>
          </div>

          <div 
            className="glass-card animate-fade-in bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-4"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="pb-2">
              <h2 className="text-lg flex items-center">
                <AlertCircle className="mr-2 text-blue-400" size={18} />
                Accepted
              </h2>
              <p className="text-muted-foreground text-sm">In progress</p>
            </div>
            <p className="text-3xl font-bold">{statusCounts.accepted}</p>
          </div>

          <div 
            className="glass-card animate-fade-in bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-4"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="pb-2">
              <h2 className="text-lg flex items-center">
                <Check className="mr-2 text-green-400" size={18} />
                Resolved
              </h2>
              <p className="text-muted-foreground text-sm">Successfully closed</p>
            </div>
            <p className="text-3xl font-bold">{statusCounts.resolved}</p>
          </div>

          <div 
            className="glass-card animate-fade-in bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-4"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="pb-2">
              <h2 className="text-lg flex items-center">
                <XCircle className="mr-2 text-red-400" size={18} />
                Rejected
              </h2>
              <p className="text-muted-foreground text-sm">Cannot be processed</p>
            </div>
            <p className="text-3xl font-bold">{statusCounts.rejected}</p>
          </div>
        </div>

        <div className="glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Recent Tickets</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Overview of the latest support requests
            </p>
          </div>
          <div className="px-6 pb-6">
            <TicketList tickets={tickets.slice(0, 6)} loading={loading} />
            {tickets.length > 6 && (
              <div className="text-center mt-4">
                <button 
                  className="text-primary hover:underline"
                  onClick={() => router.push('/tickets')}
                >
                  View All Tickets
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}