"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import { Loader2 } from 'lucide-react';
import ticketService from '../../api/api';

export default function CreateTicket() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contactName: '',
    contactInfo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.contactName.trim() ||
      !formData.contactInfo.trim()
    ) {
      setError('All fields are required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Log the data being sent (for debugging)
      console.log('Submitting ticket:', formData);
      
      // เปลี่ยนจากการใช้ fetch โดยตรงเป็นใช้ ticketService
      const data = await ticketService.createTicket({
        title: formData.title,
        description: formData.description,
        contactName: formData.contactName,
        contactInfo: formData.contactInfo,
      });
      
      // Successfully created - redirect to tickets list
      router.push('/tickets');
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError(error.message || 'Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-6">Create Support Ticket</h1>

        <div className="w-full max-w-2xl mx-auto glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg animate-fade-in">
          <div className="p-6">
            <h2 className="text-2xl gradient-text font-semibold">New Ticket</h2>
            <p className="text-muted-foreground mt-1 mb-6">
              Fill out the form below to submit a new support request
            </p>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block font-medium">Title</label>
                  <input
                    id="title"
                    name="title"
                    placeholder="Brief description of your issue"
                    value={formData.title}
                    onChange={handleChange}
                    className="bg-secondary/40 border-border/50 w-full p-2 rounded-md border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block font-medium">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Please provide details about your issue"
                    value={formData.description}
                    onChange={handleChange}
                    className="bg-secondary/40 border-border/50 w-full p-2 rounded-md border min-h-32"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactName" className="block font-medium">Contact Name</label>
                  <input
                    id="contactName"
                    name="contactName"
                    placeholder="Your name or organization name"
                    value={formData.contactName}
                    onChange={handleChange}
                    className="bg-secondary/40 border-border/50 w-full p-2 rounded-md border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactInfo" className="block font-medium">Contact Information</label>
                  <input
                    id="contactInfo"
                    name="contactInfo"
                    placeholder="Email or phone number"
                    value={formData.contactInfo}
                    onChange={handleChange}
                    className="bg-secondary/40 border-border/50 w-full p-2 rounded-md border"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => router.push('/tickets')}
                  className="border border-border/50 bg-secondary/50 px-4 py-2 rounded-md hover:bg-secondary/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md inline-flex items-center disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}