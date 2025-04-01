import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = Cookies.get('token');

  // Using environment variable for API base URL
  const API_BASE_URL = import.meta.env.API_KEY;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const [stats, setStats] = useState({
    users: {},
    appointmentsByStatus: {},
    totalUsers: 0,
    totalBorns: 0,
    totalBabies: 0,
    totalHealthCenters: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // In your fetchStats function:
      try {
        const response = await axios.get(`${API_BASE_URL}/users/statistics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats({
          users: response.data?.users || {},
          appointmentsByStatus: response.data?.appointmentsByStatus || {},
          totalUsers: response.data?.totalUsers || 0,
          totalBorns: response.data?.totalBorns || 0,
          totalBabies: response.data?.totalBabies || 0,
          totalHealthCenters: response.data?.totalHealthCenters || 0,
        });
      } catch (err) {
        setError(err.message);
        setStats((prev) => ({ ...prev })); // Maintain existing data
      }
    };

    fetchStats();
  }, [token, API_BASE_URL]);

  if (loading) return <div className="text-center py-8">Loading dashboard...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!stats) return <div className="text-center py-8">No data available</div>;

  // Prepare data for charts
  const userRolesData = {
    labels: Object.keys(stats.users),
    datasets: [
      {
        data: Object.values(stats.users),
        backgroundColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  const appointmentStatusData = {
    labels: Object.keys(stats.appointmentsByStatus),
    datasets: [
      {
        label: 'Appointments',
        data: Object.values(stats.appointmentsByStatus),
        backgroundColor: '#8884d8',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Total Born Records" value={stats.totalBorns} />
        <StatCard title="Total Babies" value={stats.totalBabies} />
        <StatCard title="Health Centers" value={stats.totalHealthCenters} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer title="User Roles Distribution">
          <Pie
            data={userRolesData}
            options={{
              plugins: {
                legend: {
                  position: 'right',
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = Math.round((value / total) * 100);
                      return `${label}: ${value} (${percentage}%)`;
                    },
                  },
                },
              },
            }}
          />
        </ChartContainer>

        <ChartContainer title="Appointment Status">
          <Bar
            data={appointmentStatusData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </ChartContainer>
      </div>

      {/* Detailed Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsList title="User Roles Breakdown" data={stats.users} />
        <StatsList title="Appointment Status" data={stats.appointmentsByStatus} />
      </div>
    </div>
  );
};

// Reusable components remain the same
const StatCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-gray-500">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const ChartContainer = ({ title, children }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="h-64 flex justify-center">{children}</div>
  </div>
);

const StatsList = ({ title, data }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <ul>
      {Object.entries(data).map(([key, value]) => (
        <li key={key} className="flex justify-between py-2 border-b">
          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
          <span className="font-medium">{value}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default Dashboard;
