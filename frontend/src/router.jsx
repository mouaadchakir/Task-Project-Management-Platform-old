import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import TasksPage from './pages/TasksPage';
import SettingsPage from './pages/SettingsPage';
import GuestLayout from './components/GuestLayout';
import DashboardLayout from './components/DashboardLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/projects',
        element: <ProjectsPage />,
      },
      {
        path: '/projects/:id',
        element: <ProjectDetailsPage />,
      },
      {
        path: '/tasks',
        element: <TasksPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '/',
    element: <GuestLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
]);

export default router;
