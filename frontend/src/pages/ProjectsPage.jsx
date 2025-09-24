import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import ProjectModal from '../components/ProjectModal';

const ProjectCard = ({ project }) => (
  <Link to={`/projects/${project.id}`} className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-start">
      <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
      <div className="flex -space-x-2 overflow-hidden">
        {project.members && project.members.map(member => (
          <img key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={member.profile_picture_path ? `http://127.0.0.1:8000/storage/${member.profile_picture_path}` : `https://ui-avatars.com/api/?name=${member.name}&background=random`} alt={member.name} />
        ))}
      </div>
    </div>
    <p className="mt-2 text-sm text-gray-600">{project.description}</p>
    <p className="mt-4 text-xs text-gray-500">Deadline: {project.deadline}</p>
  </Link>
);

export default function ProjectsPage() {
  const [ownedProjects, setOwnedProjects] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get('/projects');
      setOwnedProjects(response.data.owned || []);
      setSharedProjects(response.data.shared || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
    setLoading(false);
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await apiClient.post('/projects', projectData);
      setOwnedProjects([...ownedProjects, response.data]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          New Project
        </button>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800">My Projects</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ownedProjects.length > 0 ? (
            ownedProjects.map((project) => <ProjectCard key={project.id} project={project} />)
          ) : (
            <p className="text-gray-500">You haven't created any projects yet.</p>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800">Shared With Me</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sharedProjects.length > 0 ? (
            sharedProjects.map((project) => <ProjectCard key={project.id} project={project} />)
          ) : (
            <p className="text-gray-500">No projects have been shared with you yet.</p>
          )}
        </div>
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
