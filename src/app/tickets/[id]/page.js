"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../components/Layout';
import { Calendar, Clock, ArrowLeft, Mail, User, Edit2, X, Save, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import ticketService, { ticketUtils } from '../../api/api';

// Format time function
const formatTime = (dateString) => {
  return format(new Date(dateString), 'PPpp');
};

export default function TicketDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Edit mode state - initialize with empty values to prevent controlled/uncontrolled warning
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState({
    title: '',
    description: '',
    contactName: '',
    contactInfo: ''
  });
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      console.log(`Fetching ticket with ID: ${id}`);
      const data = await ticketService.getTicketById(id);
      console.log('Fetched ticket data:', data);
      setTicket(data);
      
      // Initialize editedTicket with the current ticket data - handle possible undefined values
      setEditedTicket({
        title: data.title || '',
        description: data.description || '',
        contactName: data.contact?.name || '',
        contactInfo: data.contact?.info || ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!ticket || !id) return;

    setUpdating(true);
    try {
      const updatedTicket = await ticketService.updateTicket(id, { status: newStatus });
      setTicket(updatedTicket);
      setUpdating(false);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setError(error.message);
      setUpdating(false);
    }
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedTicket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save edited ticket
  const saveEditedTicket = async () => {
    if (!ticket || !id) return;

    setUpdating(true);
    setEditError('');
    
    try {
      // Validate fields
      if (!editedTicket.title.trim()) {
        throw new Error('Title cannot be empty');
      }
      if (!editedTicket.description.trim()) {
        throw new Error('Description cannot be empty');
      }
      if (!editedTicket.contactName.trim()) {
        throw new Error('Contact name cannot be empty');
      }
      if (!editedTicket.contactInfo.trim()) {
        throw new Error('Contact information cannot be empty');
      }
      
      console.log('Saving edited ticket:', editedTicket);
      
      const updatedTicket = await ticketService.updateTicket(id, {
        title: editedTicket.title,
        description: editedTicket.description,
        contactName: editedTicket.contactName,
        contactInfo: editedTicket.contactInfo
      });
      
      setTicket(updatedTicket);
      setIsEditing(false);
      setUpdating(false);
    } catch (error) {
      console.error('Error updating ticket:', error);
      setEditError(error.message);
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-primary">
            Loading ticket details...
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-500/20 border border-red-500/50 text-red-700 px-4 py-3 rounded-md">
          Error: {error}
          <button
            onClick={() => router.push('/tickets')}
            className="text-red-700 underline ml-2"
          >
            Back to tickets
          </button>
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Ticket Not Found</h2>
          <button
            onClick={() => router.push('/tickets')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md"
          >
            Back to Tickets
          </button>
        </div>
      </Layout>
    );
  }

  // Get status color
  const statusColor = ticketUtils.getStatusColor(ticket.status);

  // Get history events sorted by timestamp
  const historyEvents = ticket.history ? 
    [...ticket.history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : 
    [];

  return (
    <Layout>
      <div className="animate-fade-in">
        <button
          className="flex items-center text-muted-foreground hover:text-foreground mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </button>

        <div className="glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg">
          <div className="p-6 pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{ticket.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                  <Calendar size={14} />
                  <span>Created {format(new Date(ticket.createdAt), 'PPP')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full border inline-flex ${statusColor}`}>
                  {ticket.status.toUpperCase()}
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                    title="Edit ticket"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 pt-4">
            <div className="border-b border-border/40 mb-6">
              <div className="flex">
                <button
                  className={`px-4 py-2 ${
                    activeTab === 'details'
                      ? 'border-b-2 border-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === 'updates'
                      ? 'border-b-2 border-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setActiveTab('updates')}
                >
                  Updates
                </button>
              </div>
            </div>

            {activeTab === 'details' ? (
              <div className="space-y-6">
                {isEditing ? (
                  // Edit mode form - with safeguards against undefined values
                  <div className="space-y-4">
                    {editError && (
                      <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-md mb-4">
                        <AlertCircle size={16} />
                        <span>{editError}</span>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label htmlFor="title" className="font-medium">Title</label>
                      <input
                        id="title"
                        name="title"
                        value={editedTicket.title || ''}
                        onChange={handleEditChange}
                        className="w-full p-2 bg-secondary/40 border border-border/50 rounded-md"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="description" className="font-medium">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={editedTicket.description || ''}
                        onChange={handleEditChange}
                        className="w-full p-2 bg-secondary/40 border border-border/50 rounded-md min-h-[120px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="contactName" className="font-medium">Contact Name</label>
                      <input
                        id="contactName"
                        name="contactName"
                        value={editedTicket.contactName || ''}
                        onChange={handleEditChange}
                        className="w-full p-2 bg-secondary/40 border border-border/50 rounded-md"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="contactInfo" className="font-medium">Contact Information</label>
                      <input
                        id="contactInfo"
                        name="contactInfo"
                        value={editedTicket.contactInfo || ''}
                        onChange={handleEditChange}
                        className="w-full p-2 bg-secondary/40 border border-border/50 rounded-md"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-1 px-3 py-2 border border-border/50 rounded-md hover:bg-secondary/80"
                        disabled={updating}
                      >
                        <X size={16} />
                        Cancel
                      </button>
                      <button
                        onClick={saveEditedTicket}
                        className="flex items-center gap-1 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
                        disabled={updating}
                      >
                        {updating ? (
                          <>
                            <span className="animate-spin mr-1">⟳</span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Description</h3>
                      <p className="text-foreground/80 whitespace-pre-line">
                        {ticket.description || 'No description provided'}
                      </p>
                    </div>

                    <hr className="border-border/40" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Contact Information</h3>
                      
                      {/* Contact name - with safeguard against undefined */}
                      <div className="flex items-center gap-2 text-foreground/80">
                        <User size={16} />
                        <span>{ticket.contact?.name || 'No name provided'}</span>
                      </div>
                      
                      {/* Contact info - with safeguard against undefined */}
                      <div className="flex items-center gap-2 text-foreground/80">
                        <Mail size={16} />
                        <span>{ticket.contact?.info || 'No contact information provided'}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Status History</h3>
                  </div>

                  <div className="space-y-3">
                    {/* Default entries for backwards compatibility */}
                    {!historyEvents.length && (
                      <>
                        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-md">
                          <div className="bg-primary/20 p-2 rounded-full">
                            <User size={16} className="text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">Ticket Created</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock size={12} />
                              <span>{formatTime(ticket.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-md">
                          <div className="bg-accent/20 p-2 rounded-full">
                            <User size={16} className="text-accent" />
                          </div>
                          <div>
                            <div className="font-medium">Status Updated to {ticket.status}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock size={12} />
                              <span>{formatTime(ticket.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Display detailed history if available */}
                    {historyEvents.map((event, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-md">
                        <div className={`p-2 rounded-full ${
                          event.action === 'created' ? 'bg-primary/20' : 
                          event.action === 'status_updated' ? 'bg-accent/20' :
                          'bg-green-500/20'
                        }`}>
                          <User size={16} className={
                            event.action === 'created' ? 'text-primary' : 
                            event.action === 'status_updated' ? 'text-accent' :
                            'text-green-400'
                          } />
                        </div>
                        <div>
                          <div className="font-medium">
                            {event.action === 'created' && 'Ticket Created'}
                            {event.action === 'status_updated' && `Status Updated from ${event.oldValue?.status || 'pending'} to ${event.newValue?.status || 'unknown'}`}
                            {event.action === 'information_updated' && 'Ticket Information Updated'}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock size={12} />
                            <span>{formatTime(event.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 flex-col md:flex-row gap-4 flex justify-end">
            {!isEditing && (
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {ticket.status !== "pending" && (
                  <button
                    className="flex-1 md:flex-none px-3 py-1 rounded border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    onClick={() => handleStatusUpdate("pending")}
                    disabled={updating}
                  >
                    Pending
                  </button>
                )}
                
                {ticket.status !== "accepted" && (
                  <button
                    className="flex-1 md:flex-none px-3 py-1 rounded border border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    onClick={() => handleStatusUpdate("accepted")}
                    disabled={updating}
                  >
                    Accept
                  </button>
                )}

                {ticket.status !== "resolved" && (
                  <button
                    className="flex-1 md:flex-none px-3 py-1 rounded border border-green-500/30 text-green-400 hover:bg-green-500/10"
                    onClick={() => handleStatusUpdate("resolved")}
                    disabled={updating || ticket.status === "rejected"}
                  >
                    Resolve
                  </button>
                )}

                {ticket.status !== "rejected" && (
                  <button
                    className="flex-1 md:flex-none px-3 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={updating || ticket.status === "resolved"}
                  >
                    Reject
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}