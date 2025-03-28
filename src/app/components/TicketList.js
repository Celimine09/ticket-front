"use client";

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ticketUtils } from '../api/api';

// Memoized TicketCard component to prevent unnecessary re-renders
const TicketCard = React.memo(({ ticket, onClick }) => {
  // Get the proper status color using the utility function
  const statusColor = ticketUtils.getStatusColor(ticket.status);
  
  return (
    <div
      className="animate-fade-in ticket-card cursor-pointer hover:border-primary/50 group bg-card backdrop-blur-sm border border-border/50 rounded-lg p-4 mb-3 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="line-clamp-1 group-hover:text-primary transition-colors font-semibold">
            {ticket.title}
          </h3>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
            {ticket.status}
          </span>
        </div>
      </div>
      <div className="pb-2">
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {ticket.description}
        </p>
      </div>
      <div className="flex justify-between pt-0 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>
            {formatDistanceToNow(new Date(ticket.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>
            Updated{" "}
            {formatDistanceToNow(new Date(ticket.updatedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </div>
  );
});

// Make sure to set displayName for React memo components (useful for debugging)
TicketCard.displayName = 'TicketCard';

// Error component for reusability
const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center py-8">
    <p className="text-red-400 mb-2">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="text-primary hover:underline"
      >
        Try again
      </button>
    )}
  </div>
);

// Loading component for consistent loading states
const LoadingState = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-pulse text-primary">Loading tickets...</div>
  </div>
);

// Empty state component
const EmptyState = ({ onCreateTicket }) => (
  <div className="text-center py-12 bg-secondary/30 rounded-lg animate-fade-in">
    <h3 className="text-xl font-medium mb-2">No tickets found</h3>
    <p className="text-muted-foreground mb-4">
      Create your first support ticket to get started
    </p>
    <button
      className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
      onClick={onCreateTicket}
    >
      Create Ticket
    </button>
  </div>
);

const TicketList = ({ tickets, loading, error, onRetry }) => {
  const router = useRouter();
  
  // Memoize the handler to prevent recreation on each render
  const handleCreateTicket = useCallback(() => {
    router.push("/tickets/new");
  }, [router]);
  
  // Memoize the navigate handler
  const handleNavigateToTicket = useCallback((id) => {
    router.push(`/tickets/${id}`);
  }, [router]);
  
  // Show loading state
  if (loading) {
    return <LoadingState />;
  }
  
  // Show error state if there's an error
  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  // Show empty state if no tickets
  if (!tickets || tickets.length === 0) {
    return <EmptyState onCreateTicket={handleCreateTicket} />;
  }

  // Render the ticket grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket._id}
          ticket={ticket}
          onClick={() => handleNavigateToTicket(ticket._id)}
        />
      ))}
    </div>
  );
};

export default TicketList;