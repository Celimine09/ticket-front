"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    case "accepted":
      return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    case "resolved":
      return "bg-green-500/20 text-green-400 border-green-500/50";
    case "rejected":
      return "bg-red-500/20 text-red-400 border-red-500/50";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  }
};

const TicketCard = ({ ticket, onClick }) => {
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
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
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
};

const TicketList = ({ tickets, loading }) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-primary">Loading tickets...</div>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-12 bg-secondary/30 rounded-lg">
        <h3 className="text-xl font-medium mb-2">No tickets found</h3>
        <p className="text-muted-foreground mb-4">
          Create your first support ticket to get started
        </p>
        <button
          className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => router.push("/tickets/new")}
        >
          Create Ticket
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket._id}
          ticket={ticket}
          onClick={() => router.push(`/tickets/${ticket._id}`)}
        />
      ))}
    </div>
  );
};

export default TicketList;