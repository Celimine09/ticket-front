"use client";

import React from 'react';
import Link from 'next/link';
import { TicketIcon, PlusCircle, Inbox, Settings } from 'lucide-react';

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TicketIcon size={24} className="text-primary" />
            <span className="font-bold text-xl gradient-text">TickTick</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-foreground/80 hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/tickets" className="text-foreground/80 hover:text-primary transition-colors">
              All Tickets
            </Link>
            <Link href="/kanban" className="text-foreground/80 hover:text-primary transition-colors">
              Kanban Board
            </Link>
            <Link href="/tickets/new" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2">
              <PlusCircle size={16} />
              <span>New Ticket</span>
            </Link>
          </div>

          {/* Mobile Navigation Toggle */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> : 
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            }
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border/40 py-4 animate-fade-in">
            <div className="container mx-auto flex flex-col space-y-4 px-6">
              <Link
                href="/"
                className="flex items-center gap-2 py-2 hover:bg-secondary/50 px-3 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <Inbox size={18} />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/tickets"
                className="flex items-center gap-2 py-2 hover:bg-secondary/50 px-3 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <TicketIcon size={18} />
                <span>All Tickets</span>
              </Link>
              <Link
                href="/kanban"
                className="flex items-center gap-2 py-2 hover:bg-secondary/50 px-3 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <Settings size={18} />
                <span>Kanban Board</span>
              </Link>
              <Link
                href="/tickets/new"
                className="flex items-center gap-2 py-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <PlusCircle size={18} />
                <span>New Ticket</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 px-6 text-center text-muted-foreground">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} TickTick - Helpdesk Ticket System</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;