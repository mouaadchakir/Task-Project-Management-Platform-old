import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import Invitations from '../components/Invitations';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

// Icon components
const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// StatCard component
const StatCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
      <div className={`p-3 rounded-full text-white ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-500">{title}</h3>
        <p className="mt-1 text-4xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

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
    return <Spinner />;
  }

  return (
    <div className="space-y-8">
      <Invitations />

      <div>
        <h1 className="text-4xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
        <p className="mt-2 text-lg text-gray-500">Here's your productivity snapshot for today.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link to="/projects" className="p-6 text-center bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:-translate-y-1">
          <h3 className="text-2xl font-bold">View All Projects</h3>
          <p className="mt-2">Manage your projects and teams.</p>
        </Link>
        <Link to="/tasks" className="p-6 text-center bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:-translate-y-1">
          <h3 className="text-2xl font-bold">See All Tasks</h3>
          <p className="mt-2">Get a complete overview of your tasks.</p>
        </Link>
        <Link to="/projects" className="p-6 text-center bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-900 transition-transform transform hover:-translate-y-1">
          <h3 className="text-2xl font-bold">Create New Project</h3>
          <p className="mt-2">Start a new project from scratch.</p>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<FolderIcon />} title="Total Projects" value={stats.total_projects} color="indigo" />
        <StatCard icon={<ClockIcon />} title="Tasks In Progress" value={stats.tasks_in_progress} color="yellow" />
        <StatCard icon={<CheckCircleIcon />} title="Completed Tasks" value={stats.completed_tasks} color="green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Task Progress</h3>
          <div className="-ml-6">
            <BarChart width={600} height={300} data={stats.tasks_by_status}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4F46E5" />
            </BarChart>
          </div>
        </div>
        <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Tasks by Status</h3>
          <div className="flex justify-center items-center h-full">
            <PieChart width={300} height={300}>
              <Pie data={stats.tasks_by_status} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value">
                {stats.tasks_by_status.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
}
