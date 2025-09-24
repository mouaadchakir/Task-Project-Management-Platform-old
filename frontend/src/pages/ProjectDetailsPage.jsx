import { useEffect, useState } from 'react';
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

function SortableTask({ task, onEdit, onDelete }) {
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
          <button onClick={() => onDelete(task.id)} className="text-sm text-red-600 hover:text-red-900">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailsPage() {
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
      setProject(prev => ({ ...prev, members: [...prev.members, response.data.user] }));
      e.target.reset();
    } catch (error) {
      console.error('Failed to invite member:', error);
      alert(error.response?.data?.message || 'Failed to invite member.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <p className="mt-2 text-lg text-gray-600">{project.description}</p>
          <div className="mt-4 flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-500">Members:</h3>
            <div className="flex -space-x-2 overflow-hidden">
              {project.members && project.members.map(member => (
                <img key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={member.profile_picture_path ? `http://127.0.0.1:8000/storage/${member.profile_picture_path}` : `https://ui-avatars.com/api/?name=${member.name}&background=random`} alt={member.name} />
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => { setSelectedTask(null); setIsModalOpen(true); setSelectedStatus('todo'); }}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          New Task
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="mt-8">
          <form onSubmit={handleInviteMember} className="flex items-center space-x-2">
            <input type="email" name="email" required placeholder="Invite user by email" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md shadow-sm hover:bg-gray-700">Invite</button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {Object.values(columns).map((column) => (
            <div key={column.id} className="p-4 rounded-lg bg-gray-100">
              <h2 className="text-lg font-semibold mb-4">{column.name}</h2>
              <SortableContext items={column.items.map(item => item.id)}>
                {column.items.map(task => (
                  <SortableTask key={task.id} task={task} onEdit={(taskToEdit) => { setSelectedTask(taskToEdit); setIsModalOpen(true); }} onDelete={handleDeleteTask} />
                ))}
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        task={selectedTask}
        projectMembers={project.members || []}
        defaultStatus={selectedStatus}
      />
    </div>
  );
}
