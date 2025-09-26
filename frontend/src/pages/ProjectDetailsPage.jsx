import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api';
import TaskModal from '../components/TaskModal';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const initialColumns = {
  'todo': { id: 'todo', name: 'To Do', items: [] },
  'in-progress': { id: 'in-progress', name: 'In Progress', items: [] },
  'done': { id: 'done', name: 'Done', items: [] },
};

function SortableTask({ task, onEdit, onDelete, currentUser, projectOwnerId }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-4 mb-4 bg-white rounded-lg shadow-md flex flex-col">
      <div {...attributes} {...listeners} className="flex-grow cursor-grab">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center">
          <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
            {task.priority}
          </span>
          {task.assignee && (
            <img className="ml-2 h-6 w-6 rounded-full ring-2 ring-white" src={task.assignee.profile_picture_path ? `http://127.0.0.1:8000/storage/${task.assignee.profile_picture_path}` : `https://ui-avatars.com/api/?name=${task.assignee.name}&background=random`} alt={task.assignee.name} title={`Assigned to ${task.assignee.name}`} />
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => onEdit(task)} className="text-sm text-indigo-600 hover:text-indigo-900">Edit</button>
          {currentUser && currentUser.id === projectOwnerId && (
            <button onClick={() => onDelete(task.id)} className="text-sm text-red-600 hover:text-red-900">Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [columns, setColumns] = useState(initialColumns);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('todo');

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const projectResponse = await apiClient.get(`/projects/${id}`);
      setProject(projectResponse.data);

      const tasksResponse = await apiClient.get(`/projects/${id}/tasks`);
      const tasks = tasksResponse.data;
      
      setColumns(prev => ({
        ...initialColumns,
        todo: { ...initialColumns.todo, items: tasks.filter(t => t.status === 'todo') },
        'in-progress': { ...initialColumns['in-progress'], items: tasks.filter(t => t.status === 'in-progress') },
        done: { ...initialColumns.done, items: tasks.filter(t => t.status === 'done') },
      }));

    } catch (error) {
      console.error('Failed to fetch project details:', error);
    }
    setLoading(false);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = active.data.current.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;

    if (activeContainer !== overContainer) {
      let activeItems, overItems;
      const newColumns = { ...columns };

      const activeIndex = columns[activeContainer].items.findIndex(item => item.id === activeId);
      const [movedItem] = newColumns[activeContainer].items.splice(activeIndex, 1);
      movedItem.status = overContainer;
      
      const overIndex = columns[overContainer].items.findIndex(item => item.id === overId);
      if(overIndex > -1) {
        newColumns[overContainer].items.splice(overIndex, 0, movedItem);
      } else {
        newColumns[overContainer].items.push(movedItem);
      }

      setColumns(newColumns);
      
      apiClient.put(`/projects/${id}/tasks/${activeId}`, { status: overContainer }).catch(err => {
        console.error("Failed to update task status", err);
        fetchProjectDetails(); // Revert on failure
      });
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await apiClient.post(`/projects/${id}/tasks`, taskData);
      fetchProjectDetails();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await apiClient.put(`/projects/${id}/tasks/${selectedTask.id}`, taskData);
      fetchProjectDetails();
      setIsModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiClient.delete(`/projects/${id}/tasks/${taskId}`);
        fetchProjectDetails();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found.</div>;

  const handleInviteMember = async (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    try {
      const response = await apiClient.post(`/projects/${id}/invite`, { email });
      alert('Invitation sent successfully!');
      e.target.reset();
    } catch (error) {
      console.error('Failed to invite member:', error);
      alert(error.response?.data?.message || 'Failed to invite member.');
    }
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setSelectedStatus(task.status);
    setIsModalOpen(true);
  };

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found.</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">{project.title}</h1>
        {user && project && user.id === project.user_id && (
          <button
            onClick={() => { setSelectedTask(null); setIsModalOpen(true); setSelectedStatus('todo'); }}
            className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
          >
            New Task
          </button>
        )}
      </div>

      {/* Project Info & Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">About the project</h2>
          <p className="text-gray-600">{project.description}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Members</h2>
          <div className="flex items-center mb-4">
            <div className="flex -space-x-3 overflow-hidden">
              {project.members && project.members.map(member => (
                <img key={member.id} className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src={member.profile_picture_path ? `http://127.0.0.1:8000/storage/${member.profile_picture_path}` : `https://ui-avatars.com/api/?name=${member.name}&background=random`} alt={member.name} title={member.name} />
              ))}
            </div>
          </div>
          {user && project && user.id === project.user_id && (
            <form onSubmit={handleInviteMember}>
              <div className="flex items-center space-x-2">
                <input type="email" name="email" required placeholder="Invite by email" className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-md shadow-sm hover:bg-gray-900">Invite</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(columns).map((column) => (
            <div key={column.id} className="p-4 rounded-lg bg-white shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-700">{column.name}</h2>
                <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{column.items.length}</span>
              </div>
              <SortableContext items={column.items.map(item => item.id)}>
                <div className="min-h-[200px]">
                  {column.items.map(task => (
                    <SortableTask key={task.id} task={task} onEdit={openEditModal} onDelete={handleDeleteTask} currentUser={user} projectOwnerId={project.user_id} />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
          onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
          task={selectedTask}
          projectMembers={project.members || []}
          status={selectedStatus}
        />
      )}
    </div>
  );
}
