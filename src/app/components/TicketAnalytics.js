"use client";

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// ลงทะเบียนคอมโพเนนต์
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

const TicketAnalytics = ({ tickets }) => {
  // กราฟสัดส่วนของตั๋ว
  const statusCounts = {
    pending: tickets.filter(ticket => ticket.status === 'pending').length,
    accepted: tickets.filter(ticket => ticket.status === 'accepted').length,
    resolved: tickets.filter(ticket => ticket.status === 'resolved').length,
    rejected: tickets.filter(ticket => ticket.status === 'rejected').length
  };

  const statusChartData = {
    labels: ['Pending', 'Accepted', 'Resolved', 'Rejected'],
    datasets: [
      {
        label: 'Tickets by Status',
        data: [statusCounts.pending, statusCounts.accepted, statusCounts.resolved, statusCounts.rejected],
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

  // กราฟแสดงการสร้างตั๋วตามวันที่
  const generateTicketTrend = () => {
    // จัดกลุ่มตั๋วตามวันที่สร้าง
    const ticketsByDate = tickets.reduce((acc, ticket) => {
      // YYYY-MM-DD
      const dateKey = new Date(ticket.createdAt).toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += 1;
      return acc;
    }, {});

    // เรียงลำดับวันที่
    const sortedDates = Object.keys(ticketsByDate).sort();
    
    // สร้างข้อมูลสำหรับกราฟ
    return {
      labels: sortedDates.map(date => {
        // แปลงรูปแบบวันที่ให้อ่านง่ายขึ้น
        const [year, month, day] = date.split('-');
        return `${day}/${month}`;
      }),
      datasets: [
        {
          label: 'New Tickets',
          data: sortedDates.map(date => ticketsByDate[date]),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  // กราฟแสดงระยะเวลาในการแก้ไขตั๋วงาน (เฉพาะตั๋วที่ resolved)
  const generateResolutionTimeData = () => {
    // กรองเฉพาะตั๋ว resolved
    const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved');
    
    // คำนวณเวลาที่ใช้ในการแก้ไขแต่ละตั๋ว (หน่วยเป็นชั่วโมง)
    const resolutionTimes = resolvedTickets.map(ticket => {
      const createdAt = new Date(ticket.createdAt);
      const updatedAt = new Date(ticket.updatedAt);
      const diffTime = Math.abs(updatedAt - createdAt);
      return Math.ceil(diffTime / (1000 * 60 * 60)); // แปลงเป็นชั่วโมง
    });

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

    // จัดกลุ่มระยะเวลาการแก้ไข
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
  };

  // ตั้งค่าสำหรับกราฟวงกลม
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Ticket Status Distribution'
      }
    }
  };

  // ตั้งค่าสำหรับกราฟเส้น
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ticket Creation Trend'
      }
    }
  };

  // ตั้งค่าสำหรับกราฟแท่ง
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Resolution Time Distribution'
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
          <Pie data={statusChartData} options={pieOptions} />
        </div>
        <div className="glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
          <Line data={generateTicketTrend()} options={lineOptions} />
        </div>
      </div>
      <div className="glass-card bg-secondary/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
        <Bar data={generateResolutionTimeData()} options={barOptions} />
      </div>
    </div>
  );
};

export default TicketAnalytics;