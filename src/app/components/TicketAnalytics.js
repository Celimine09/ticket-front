"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title,
  Tooltip, 
  Legend 
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// Register chart components once
ChartJS.register(
  ArcElement, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip, 
  Legend
);

// Helper function to group tickets by date
const groupTicketsByDate = (tickets) => {
  const groups = {};
  
  tickets.forEach(ticket => {
    const dateKey = new Date(ticket.createdAt).toISOString().split('T')[0];
    groups[dateKey] = (groups[dateKey] || 0) + 1;
  });
  
  return groups;
};

// Custom hook for chart data
const useChartData = (tickets) => {
  // Status distribution
  const statusData = useMemo(() => {
    const counts = {
      pending: tickets.filter(ticket => ticket.status === 'pending').length,
      accepted: tickets.filter(ticket => ticket.status === 'accepted').length,
      resolved: tickets.filter(ticket => ticket.status === 'resolved').length,
      rejected: tickets.filter(ticket => ticket.status === 'rejected').length
    };

    return {
      labels: ['Pending', 'Accepted', 'Resolved', 'Rejected'],
      datasets: [
        {
          label: 'Tickets by Status',
          data: [counts.pending, counts.accepted, counts.resolved, counts.rejected],
          backgroundColor: [
            'rgba(255, 206, 86, 0.6)', // yellow for pending
            'rgba(54, 162, 235, 0.6)', // blue for accepted
            'rgba(75, 192, 192, 0.6)', // green for resolved
            'rgba(255, 99, 132, 0.6)', // red for rejected
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [tickets]);

  // Ticket creation trend
  const trendData = useMemo(() => {
    const ticketsByDate = groupTicketsByDate(tickets);
    const sortedDates = Object.keys(ticketsByDate).sort();
    
    return {
      labels: sortedDates.map(date => {
        const [year, month, day] = date.split('-');
        return `${day}/${month}`;
      }),
      datasets: [
        {
          label: 'New Tickets',
          data: sortedDates.map(date => ticketsByDate[date]),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1
        }
      ]
    };
  }, [tickets]);

  // Resolution time distribution
  const resolutionData = useMemo(() => {
    // Filter resolved tickets
    const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved');
    
    // Calculate resolution times (in hours)
    const resolutionTimes = resolvedTickets.map(ticket => {
      const createdAt = new Date(ticket.createdAt);
      const updatedAt = new Date(ticket.updatedAt);
      const diffTime = Math.abs(updatedAt - createdAt);
      return Math.ceil(diffTime / (1000 * 60 * 60)); // Convert to hours
    });

    // Default empty data if no resolved tickets
    if (resolutionTimes.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Resolution Time (hours)',
          data: [],
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        }]
      };
    }

    // Group by time ranges
    const timeRanges = ['0-6h', '6-12h', '12-24h', '24-48h', '48h+'];
    const timeRangeCounts = [0, 0, 0, 0, 0];

    resolutionTimes.forEach(time => {
      if (time <= 6) timeRangeCounts[0]++;
      else if (time <= 12) timeRangeCounts[1]++;
      else if (time <= 24) timeRangeCounts[2]++;
      else if (time <= 48) timeRangeCounts[3]++;
      else timeRangeCounts[4]++;
    });

    return {
      labels: timeRanges,
      datasets: [{
        label: 'Number of Tickets',
        data: timeRangeCounts,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      }]
    };
  }, [tickets]);

  return { statusData, trendData, resolutionData };
};

// Reusable chart container
const ChartContainer = ({ title, children }) => (
  <div className="glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
    <h3 className="text-lg font-medium mb-4">{title}</h3>
    {children}
  </div>
);

const TicketAnalytics = ({ tickets }) => {
  const [chartWidth, setChartWidth] = useState(0);
  const { statusData, trendData, resolutionData } = useChartData(tickets);

  // Handle responsive charts
  useEffect(() => {
    const updateWidth = () => {
      setChartWidth(window.innerWidth);
    };

    window.addEventListener('resize', updateWidth);
    updateWidth(); // Initial call

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgb(255, 255, 255)'
        }
      },
      title: {
        display: true,
        text: 'Ticket Status Distribution',
        color: 'rgb(255, 255, 255)'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(255, 255, 255)'
        }
      },
      title: {
        display: true,
        text: 'Ticket Creation Trend',
        color: 'rgb(255, 255, 255)'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgb(255, 255, 255)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'rgb(255, 255, 255)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(255, 255, 255)'
        }
      },
      title: {
        display: true,
        text: 'Resolution Time Distribution',
        color: 'rgb(255, 255, 255)'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgb(255, 255, 255)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'rgb(255, 255, 255)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  // Summary statistics
  const stats = useMemo(() => {
    const totalTickets = tickets.length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    const resolutionRate = totalTickets ? Math.round((resolvedTickets / totalTickets) * 100) : 0;
    
    return {
      totalTickets,
      resolvedTickets,
      resolutionRate,
      pendingTickets: tickets.filter(t => t.status === 'pending').length,
      acceptedTickets: tickets.filter(t => t.status === 'accepted').length,
      rejectedTickets: tickets.filter(t => t.status === 'rejected').length
    };
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-4">
          <h3 className="text-lg font-medium">Total Tickets</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalTickets}</p>
        </div>
        
        <div className="glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-4">
          <h3 className="text-lg font-medium">Resolution Rate</h3>
          <p className="text-3xl font-bold mt-2">{stats.resolutionRate}%</p>
        </div>
        
        <div className="glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-4">
          <h3 className="text-lg font-medium">Open Tickets</h3>
          <p className="text-3xl font-bold mt-2">{stats.pendingTickets + stats.acceptedTickets}</p>
        </div>
        
        <div className="glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-4">
          <h3 className="text-lg font-medium">Resolved Tickets</h3>
          <p className="text-3xl font-bold mt-2">{stats.resolvedTickets}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartContainer title="Status Distribution">
          <Pie data={statusData} options={pieOptions} />
        </ChartContainer>
        
        <ChartContainer title="Ticket Creation Trend">
          <Line data={trendData} options={lineOptions} />
        </ChartContainer>
      </div>
      
      <ChartContainer title="Resolution Time">
        <Bar data={resolutionData} options={barOptions} />
      </ChartContainer>
      
      {/* Additional insights */}
      {tickets.length > 0 && (
        <div className="glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium mb-4">Key Insights</h3>
          <ul className="space-y-2">
            <li>
              <span className="font-medium">Resolution Rate:</span> {stats.resolutionRate}% of tickets are resolved.
            </li>
            <li>
              <span className="font-medium">Open Issues:</span> Currently {stats.pendingTickets + stats.acceptedTickets} ticket(s) require attention.
            </li>
            <li>
              <span className="font-medium">Rejection Rate:</span> {Math.round((stats.rejectedTickets / stats.totalTickets) * 100) || 0}% of tickets are rejected.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TicketAnalytics;