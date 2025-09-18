import { Navigate, Outlet } from 'react-router-dom';

export default function GuestLayout() {
  const token = localStorage.getItem('TOKEN');

  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
}
