"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const KanbanBoard = ({ tickets, updateTicket }) => {
  const router = useRouter();
  const [draggingId, setDraggingId] = useState(null);

  // Group tickets by status
  const pendingTickets = tickets.filter(ticket => ticket.status === 'pending');
  const acceptedTickets = tickets.filter(ticket => ticket.status === 'accepted');
  const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved');
  const rejectedTickets = tickets.filter(ticket => ticket.status === 'rejected');

  // Handlers for drag and drop
  const handleDragStart = (e, ticketId) => {
    setDraggingId(ticketId);
    e.dataTransfer.setData('ticketId', ticketId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('ticketId') || draggingId;
    
    if (ticketId) {
      updateTicket(ticketId, { status });
      setDraggingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 border-yellow-500/30";
      case "accepted":
        return "bg-blue-500/10 border-blue-500/30";
      case "resolved":
        return "bg-green-500/10 border-green-500/30";
      case "rejected":
        return "bg-red-500/10 border-red-500/30";
      default:
        return "bg-gray-500/10 border-gray-500/30";
    }
  };

  const renderTicket = (ticket) => (
    <div
      key={ticket._id}
      className="bg-card border border-border/50 rounded-lg p-4 mb-3 cursor-move shadow-sm hover:shadow-md transition-all duration-200"
      draggable
      onDragStart={(e) => handleDragStart(e, ticket._id)}
      onClick={() => router.push(`/tickets/${ticket._id}`)}
    >
      <div className="font-medium mb-2 line-clamp-1">{ticket.title}</div>
      <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
        {ticket.description}
      </p>
      <div className="text-xs text-muted-foreground">
        ID: {ticket._id.substring(0, 8)}...
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        className={`kanban-column ${getStatusColor('pending')} border rounded-lg p-4`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'pending')}
      >
        <h3 className="font-bold text-yellow-500 mb-4 flex items-center justify-between">
          <span>Pending</span>
          <span className="bg-yellow-500/20 text-yellow-400 text-xs rounded-full px-2 py-1">
            {pendingTickets.length}
          </span>
        </h3>
        <div className="space-y-3">
          {pendingTickets.map(renderTicket)}
          {pendingTickets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No tickets in this column
            </div>
          )}
        </div>
      </div>

      <div
        className={`kanban-column ${getStatusColor('accepted')} border rounded-lg p-4`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'accepted')}
      >
        <h3 className="font-bold text-blue-500 mb-4 flex items-center justify-between">
          <span>Accepted</span>
          <span className="bg-blue-500/20 text-blue-400 text-xs rounded-full px-2 py-1">
            {acceptedTickets.length}
          </span>
        </h3>
        <div className="space-y-3">
          {acceptedTickets.map(renderTicket)}
          {acceptedTickets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No tickets in this column
            </div>
          )}
        </div>
      </div>

      <div
        className={`kanban-column ${getStatusColor('resolved')} border rounded-lg p-4`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'resolved')}
      >
        <h3 className="font-bold text-green-500 mb-4 flex items-center justify-between">
          <span>Resolved</span>
          <span className="bg-green-500/20 text-green-400 text-xs rounded-full px-2 py-1">
            {resolvedTickets.length}
          </span>
        </h3>
        <div className="space-y-3">
          {resolvedTickets.map(renderTicket)}
          {resolvedTickets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No tickets in this column
            </div>
          )}
        </div>
      </div>

      <div
        className={`kanban-column ${getStatusColor('rejected')} border rounded-lg p-4`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'rejected')}
      >
        <h3 className="font-bold text-red-500 mb-4 flex items-center justify-between">
          <span>Rejected</span>
          <span className="bg-red-500/20 text-red-400 text-xs rounded-full px-2 py-1">
            {rejectedTickets.length}
          </span>
        </h3>
        <div className="space-y-3">
          {rejectedTickets.map(renderTicket)}
          {rejectedTickets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No tickets in this column
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;