// tests/components/Layout.comprehensive.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Layout from '../../src/app/components/Layout';

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ children, href }) => (
    <a href={href}>{children}</a>
  );
});

// Mock the useRouter hook
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

describe('Layout Component - Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window dimensions for desktop
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
  });

  it('renders the component with all essential parts', () => {
    render(<Layout><div data-testid="test-content">Test Content</div></Layout>);
    
    // Check for header/navbar
    expect(screen.getByText('TickTick')).toBeInTheDocument();
    
    // Check for main navigation links
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('All Tickets')).toBeInTheDocument();
    expect(screen.getByText('Kanban Board')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('New Ticket')).toBeInTheDocument();
    
    // Check for the children content
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    
    // Check for footer
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year}.*TickTick`))).toBeInTheDocument();
  });

  it('contains links with correct href attributes', () => {
    render(<Layout>Test Content</Layout>);
    
    // Get all links and check their href attributes
    const links = screen.getAllByRole('link');
    
    // Dashboard link
    const dashboardLink = links.find(link => link.textContent.includes('Dashboard'));
    expect(dashboardLink).toHaveAttribute('href', '/');
    
    // All Tickets link
    const ticketsLink = links.find(link => link.textContent.includes('All Tickets'));
    expect(ticketsLink).toHaveAttribute('href', '/tickets');
    
    // Kanban Board link
    const kanbanLink = links.find(link => link.textContent.includes('Kanban Board'));
    expect(kanbanLink).toHaveAttribute('href', '/kanban');
    
    // Analytics link
    const analyticsLink = links.find(link => link.textContent.includes('Analytics'));
    expect(analyticsLink).toHaveAttribute('href', '/analytics');
    
    // New Ticket link
    const newTicketLink = links.find(link => link.textContent.includes('New Ticket'));
    expect(newTicketLink).toHaveAttribute('href', '/tickets/new');
  });

  it('renders footer with current year', () => {
    render(<Layout>Test Content</Layout>);
    
    const year = new Date().getFullYear();
    const footerText = screen.getByText(new RegExp(`${year}.*TickTick`));
    
    expect(footerText).toBeInTheDocument();
    expect(footerText.closest('footer')).toBeInTheDocument();
  });
});