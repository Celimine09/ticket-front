import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import Page from '../../src/app/page';

// Mock API service
jest.mock('../../src/app/api/api', () => ({
  default: {
    getAllTickets: jest.fn().mockResolvedValue([
      {
        _id: '123',
        title: 'Test Ticket',
        description: 'Test Description',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ])
  }
}));

// Mock components
jest.mock('../../src/app/components/Layout', () => {
  return ({ children }) => <div data-testid="mock-layout">{children}</div>;
});

jest.mock('../../src/app/components/TicketList', () => {
  return ({ tickets, loading }) => (
    <div data-testid="mock-ticket-list">
      {loading ? 'Loading...' : `Tickets: ${tickets.length}`}
    </div>
  );
});

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Mock global fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue([
    {
      _id: '123',
      title: 'Test Ticket',
      description: 'Test Description',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ])
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page with title and description', async () => {
    // ใช้ act() เพื่อรอให้การเปลี่ยนแปลงสถานะทั้งหมดเสร็จสิ้น
    await act(async () => {
      render(<Page />);
    });
    
    expect(screen.getByText('Ticket Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Manage and monitor support ticket activities/i)).toBeInTheDocument();
  });
  
  it('fetches and displays tickets', async () => {
    // ใช้ act() เพื่อรอให้การเปลี่ยนแปลงสถานะทั้งหมดเสร็จสิ้น
    await act(async () => {
      render(<Page />);
    });
    
    // รอให้ข้อมูลโหลดเสร็จ
    await waitFor(() => {
      expect(screen.getByTestId('mock-ticket-list')).toHaveTextContent('Tickets: 1');
    });
  });
  
  it('displays status summary cards', async () => {
    // ใช้ act() เพื่อรอให้การเปลี่ยนแปลงสถานะทั้งหมดเสร็จสิ้น
    await act(async () => {
      render(<Page />);
    });
    
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });
  
  it('handles API error gracefully', async () => {
    // เปลี่ยน mock ของ fetch ให้คืนค่า error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    // ใช้ act() เพื่อรอให้การเปลี่ยนแปลงสถานะทั้งหมดเสร็จสิ้น
    await act(async () => {
      render(<Page />);
    });
    
    // ตรวจสอบว่ามีการแสดงข้อความข้อผิดพลาด
    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});