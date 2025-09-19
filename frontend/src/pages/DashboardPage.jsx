import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_projects: 0, tasks_in_progress: 0, completed_tasks: 0, tasks_by_status: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
      <p className="mt-2 text-lg text-gray-600">Here's a quick overview of your projects.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Total Projects</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total_projects}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Tasks In Progress</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.tasks_in_progress}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Completed Tasks</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.completed_tasks}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Tasks by Status</h3>
          <div className="mt-4">
            <PieChart width={400} height={300}>
              <Pie
                data={stats.tasks_by_status}
                cx={200}
                cy={150}
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.tasks_by_status.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Task Progress</h3>
          <div className="mt-4">
            <BarChart
              width={500}
              height={300}
              data={stats.tasks_by_status}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  );
}
