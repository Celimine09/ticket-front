"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ticketUtils } from '../api/api';

// Column component to reduce repetition
const KanbanColumn = ({ 
  title, 
  status, 
  tickets, 
  onDragOver, 
  onDrop, 
  renderTicket,
  onDragLeave,
  color
}) => (
  <div
    className={`kanban-column ${ticketUtils.getStatusColor(status)} border rounded-lg p-4`}
    onDragOver={onDragOver}
    onDrop={(e) => onDrop(e, status)}
    onDragLeave={onDragLeave}
    data-status={status} // Used for identifying the column during drag events
  >
    <h3 className={`font-bold ${color} mb-4 flex items-center justify-between`}>
      <span>{title}</span>
      <span className={`${color.replace('text-', 'bg-')}/20 ${color} text-xs rounded-full px-2 py-1`}>
        {tickets.length}
      </span>
    </h3>
    <div className="space-y-3 min-h-[100px]">
      {tickets.map(renderTicket)}
      {tickets.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No tickets in this column
        </div>
      )}
    </div>
  </div>
);

// Ticket card component
const TicketCard = React.memo(({ ticket, onDragStart, onDragEnd, onClick }) => (
  <div
    key={ticket._id}
    className="bg-card border border-border/50 rounded-lg p-4 mb-3 cursor-move shadow-sm hover:shadow-md transition-all duration-200"
    draggable
    onDragStart={(e) => onDragStart(e, ticket._id)}
    onDragEnd={onDragEnd}
    onClick={onClick}
    data-ticket-id={ticket._id} // Useful for identifying the ticket during events
  >
    <div className="font-medium mb-2 line-clamp-1">{ticket.title}</div>
    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
      {ticket.description}
    </p>
    <div className="text-xs text-muted-foreground">
      ID: {ticket._id.substring(0, 8)}...
    </div>
  </div>
));

TicketCard.displayName = 'TicketCard';

const KanbanBoard = ({ tickets, updateTicket }) => {
  const router = useRouter();
  const [draggingId, setDraggingId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Group tickets by status - memoize to prevent recalculation
  const groupedTickets = useMemo(() => {
    return {
      pending: tickets.filter(ticket => ticket.status === 'pending'),
      accepted: tickets.filter(ticket => ticket.status === 'accepted'),
      resolved: tickets.filter(ticket => ticket.status === 'resolved'),
      rejected: tickets.filter(ticket => ticket.status === 'rejected')
    };
  }, [tickets]);

  // Handlers for drag and drop - memoize to prevent recreation
  const handleDragStart = useCallback((e, ticketId) => {
    setDraggingId(ticketId);
    setIsDragging(true);
    e.dataTransfer.setData('ticketId', ticketId);
    
    // Make drag image more aesthetically pleasing
    if (e.target.classList) {
      e.target.classList.add('dragging');
    }
  }, []);

  const handleDragEnd = useCallback((e) => {
    setIsDragging(false);
    if (e.target.classList) {
      e.target.classList.remove('dragging');
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    // Add visual feedback for the drop target
    if (e.currentTarget.classList) {
      e.currentTarget.classList.add('drag-over');
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    // Remove visual feedback when dragging leaves the target
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('drag-over');
    }
  }, []);

  const handleDrop = useCallback((e, status) => {
    e.preventDefault();
    // Remove any visual feedback
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('drag-over');
    }
    
    const ticketId = e.dataTransfer.getData('ticketId') || draggingId;
    
    if (ticketId) {
      updateTicket(ticketId, { status });
      setDraggingId(null);
      setIsDragging(false);
    }
  }, [draggingId, updateTicket]);

  const handleTicketClick = useCallback((id) => {
    router.push(`/tickets/${id}`);
  }, [router]);

  // Create a ticket renderer function - memoize it
  const renderTicket = useCallback((ticket) => (
    <TicketCard
      key={ticket._id}
      ticket={ticket}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => handleTicketClick(ticket._id)}
    />
  ), [handleDragStart, handleDragEnd, handleTicketClick]);

  // Define the column configurations to avoid repetition
  const columns = [
    { 
      title: 'Pending', 
      status: 'pending', 
      tickets: groupedTickets.pending,
      color: 'text-yellow-500'
    },
    { 
      title: 'Accepted', 
      status: 'accepted', 
      tickets: groupedTickets.accepted,
      color: 'text-blue-500'
    },
    { 
      title: 'Resolved', 
      status: 'resolved', 
      tickets: groupedTickets.resolved,
      color: 'text-green-500'
    },
    { 
      title: 'Rejected', 
      status: 'rejected', 
      tickets: groupedTickets.rejected,
      color: 'text-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          tickets={column.tickets}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          renderTicket={renderTicket}
          color={column.color}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;