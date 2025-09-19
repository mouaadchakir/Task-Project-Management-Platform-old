import { useEffect, useState } from 'react';
import apiClient from '../services/api';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
      <div className="mt-8">
        {tasks.length > 0 ? (
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className="p-4 mb-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{task.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tasks found.</p>
        )}
      </div>
    </div>
  );
}
