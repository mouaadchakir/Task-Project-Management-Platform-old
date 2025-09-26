import { useEffect, useState } from 'react';
import apiClient from '../services/api';
import Spinner from '../components/Spinner';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await apiClient.get('/tasks');
      if (Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        console.error('API did not return an array for tasks:', response.data);
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
    setLoading(false);
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800">All My Tasks</h1>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select id="status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
            <select id="priority" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">No tasks match the current filters.</p>
        )}
      </div>
    </div>
  );
}

const TaskCard = ({ task }) => {
  const priorityClasses = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const statusClasses = {
    todo: 'bg-gray-200 text-gray-800',
    'in-progress': 'bg-indigo-200 text-indigo-800',
    done: 'bg-green-200 text-green-800',
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[task.status]}`}>{task.status.replace('-', ' ')}</span>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityClasses[task.priority]}`}>{task.priority}</span>
      </div>
      <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
      <p className="text-gray-600">{task.description}</p>
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <p className="text-sm text-gray-500"><strong>Project:</strong> {task.project?.title || 'N/A'}</p>
        <p className="text-sm text-gray-500"><strong>Assignee:</strong> {task.assignee?.name || 'Unassigned'}</p>
        <p className="text-sm text-gray-500"><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
      </div>
    </div>
  );
};
