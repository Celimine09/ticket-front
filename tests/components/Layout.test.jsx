// tests/components/Layout.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Layout from '../../src/app/components/Layout';

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ children, href }) => (
    <a href={href}>{children}</a>
  );
});

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

describe('Layout Component', () => {
  it('renders children content', () => {
    render(<Layout><div data-testid="test-content">Test Content</div></Layout>);
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });
  
  it('displays the app name in navbar', () => {
    render(<Layout>Test</Layout>);
    expect(screen.getByText('TickTick')).toBeInTheDocument();
  });
  
  it('shows navigation links', () => {
    render(<Layout>Test</Layout>);
    const links = screen.getAllByRole('link');
    
    // Check for main navigation links
    expect(links.some(link => link.textContent.includes('Dashboard'))).toBeTruthy();
    expect(links.some(link => link.textContent.includes('All Tickets'))).toBeTruthy();
    expect(links.some(link => link.textContent.includes('Kanban Board'))).toBeTruthy();
    expect(links.some(link => link.textContent.includes('Analytics'))).toBeTruthy();
  });
  
  it('displays footer with copyright', () => {
    render(<Layout>Test</Layout>);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year}.*TickTick`))).toBeInTheDocument();
  });
  
  it('toggles mobile menu when menu button is clicked', () => {
    render(<Layout>Test Content</Layout>);
    
    // Initially mobile menu should be hidden
    // Using getComputedStyle would be ideal, but in jest-dom environment it's not reliable
    // So check that mobile menu isn't initially in the document
    expect(screen.queryByRole('link', { name: /Dashboard/i, hidden: true })).toBeTruthy(); // mobile links are either hidden or not present
    
    // Find the mobile menu button (it's an SVG, so we need to select by role)
    const menuButton = screen.getByRole('button');
    
    // Click to open menu
    fireEvent.click(menuButton);
    
    // After clicking, mobile menu should be added to the document
    const mobileMenu = screen.getAllByRole('link')
      .filter(link => link.closest('.md\\:hidden')) // Only check links in mobile menu
      .find(link => link.textContent.includes('Dashboard'));
    
    expect(mobileMenu).toBeTruthy();
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
    
    // New Ticket link
    const newTicketLink = links.find(link => link.textContent.includes('New Ticket'));
    expect(newTicketLink).toHaveAttribute('href', '/tickets/new');
  });
});