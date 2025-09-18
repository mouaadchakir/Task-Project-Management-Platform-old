import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api';
import TaskModal from '../components/TaskModal';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const projectResponse = await apiClient.get(`/projects/${id}`);
      setProject(projectResponse.data);

      const tasksResponse = await apiClient.get(`/projects/${id}/tasks`);
      setTasks(tasksResponse.data);
    } catch (error) {
      console.error('Failed to fetch project details:', error);
    }
    setLoading(false);
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await apiClient.post(`/projects/${id}/tasks`, taskData);
      setTasks([...tasks, response.data]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const response = await apiClient.put(`/tasks/${selectedTask.id}`, taskData);
      setTasks(tasks.map((task) => (task.id === selectedTask.id ? response.data : task)));
      setIsModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiClient.delete(`/tasks/${taskId}`);
        setTasks(tasks.filter((task) => task.id !== taskId));
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
      <p className="mt-2 text-lg text-gray-600">{project.description}</p>
      <p className="mt-4 text-sm text-gray-500">Deadline: {project.deadline}</p>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Task
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="font-medium text-gray-900">{task.title}</h3>
              <p className="text-sm text-gray-600">{task.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                  {task.priority}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setIsModalOpen(true);
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-sm text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        task={selectedTask}
      />
    </div>
  );
}
