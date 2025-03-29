import React from 'react';
import { render, screen } from '@testing-library/react';
import TicketAnalytics from '../../src/app/components/TicketAnalytics';

// Mock Chart.js to prevent errors
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn()
  },
  ArcElement: jest.fn(),
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn()
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>
}));

describe('TicketAnalytics Component', () => {
  const mockTickets = [
    {
      _id: '123',
      title: 'Pending Ticket',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '456',
      title: 'Resolved Ticket',
      status: 'resolved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '789',
      title: 'Rejected Ticket',
      status: 'rejected',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    // แก้ไขการทดสอบโดยเพิ่ม data-testid ให้คอมโพเนนต์
    // สามารถเพิ่มใน ChartContainer หรือในที่ทดสอบ
    jest.spyOn(React, 'createElement').mockImplementation((type, props, ...children) => {
      if (props && typeof props === 'object' && props.className && props.className.includes('text-3xl font-bold mt-2')) {
        // เพิ่ม data-testid ให้กับข้อความจำนวน
        return React.createElement(type, {
          ...props,
          'data-testid': `count-${props.children}`
        }, ...children);
      }
      return React.createElement(type, props, ...children);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders summary cards with correct counts', () => {
    const { container } = render(<TicketAnalytics tickets={mockTickets} />);
    
    // ตรวจสอบคาร์ดสรุป โดยใช้ queryByText เพื่อหาข้อความที่อยู่ใกล้กับหัวข้อ
    expect(screen.getByText('Total Tickets')).toBeInTheDocument();
    const totalTicketsCard = screen.getByText('Total Tickets').closest('.glass-card');
    expect(totalTicketsCard.textContent).toContain('3');
    
    expect(screen.getByText('Resolution Rate')).toBeInTheDocument();
    const resolutionRateCard = screen.getByText('Resolution Rate').closest('.glass-card');
    expect(resolutionRateCard.textContent).toContain('33');
    expect(resolutionRateCard.textContent).toContain('%');
    
    expect(screen.getByText('Resolved Tickets')).toBeInTheDocument();
    const resolvedTicketsCard = screen.getByText('Resolved Tickets').closest('.glass-card');
    expect(resolvedTicketsCard.textContent).toContain('1');
  });
  
  it('renders charts', () => {
    render(<TicketAnalytics tickets={mockTickets} />);
    
    // ตรวจสอบว่ามีการเรนเดอร์กราฟ
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
  
  it('displays key insights', () => {
    render(<TicketAnalytics tickets={mockTickets} />);
    
    expect(screen.getByText('Key Insights')).toBeInTheDocument();
    expect(screen.getByText(/Resolution Rate:/)).toBeInTheDocument();
    expect(screen.getByText(/Open Issues:/)).toBeInTheDocument();
    expect(screen.getByText(/Rejection Rate:/)).toBeInTheDocument();
  });
  
  it('handles empty ticket data gracefully', () => {
    const { container } = render(<TicketAnalytics tickets={[]} />);
    
    // ตรวจสอบว่าแสดงผลศูนย์ถูกต้อง
    expect(screen.getByText('Total Tickets')).toBeInTheDocument();
    const totalTicketsCard = screen.getByText('Total Tickets').closest('.glass-card');
    expect(totalTicketsCard.textContent).toContain('0');
  });
});