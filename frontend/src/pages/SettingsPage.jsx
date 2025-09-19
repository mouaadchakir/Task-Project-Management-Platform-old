import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileErrors, setProfileErrors] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileErrors(null);
    try {
      const response = await apiClient.put('/user/profile', profileData);
      setProfileMessage(response.data.message);
      const updatedUser = { ...user, ...response.data.user };
      setUser(updatedUser);
      localStorage.setItem('USER', JSON.stringify(updatedUser));
    } catch (error) {
      if (error.response?.status === 422) setProfileErrors(error.response.data.errors);
      else setProfileMessage('An unexpected error occurred.');
    }
  };

  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordErrors(null);
    try {
      const response = await apiClient.put('/user/password', passwordData);
      setPasswordMessage(response.data.message);
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (error) {
      if (error.response?.status === 422) setPasswordErrors(error.response.data.errors);
      else setPasswordMessage('An unexpected error occurred.');
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const response = await apiClient.post('/user/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfileMessage(response.data.message);
      const updatedUser = { ...user, profile_picture_path: response.data.path };
      setUser(updatedUser);
      localStorage.setItem('USER', JSON.stringify(updatedUser));
    } catch (error) {
      setProfileMessage('Failed to upload picture. Please try again.');
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-medium text-gray-900">User Profile</h2>
        <div className="mt-6 flex items-center">
          <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
            {user?.profile_picture_path ? (
              <img className="h-full w-full object-cover" src={`http://127.0.0.1:8000/storage/${user.profile_picture_path}`} alt="Profile" />
            ) : (
              <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.993A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </span>
          <input type="file" id="profile_picture_input" hidden onChange={handlePictureChange} accept="image/*" />
          <button type="button" onClick={() => document.getElementById('profile_picture_input').click()} className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Change</button>
        </div>
        {profileMessage && <p className="mt-4 text-sm text-green-600">{profileMessage}</p>}
        <form className="mt-6 space-y-6" onSubmit={handleProfileSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="name" id="name" value={profileData.name} onChange={handleProfileChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            {profileErrors?.name && <p className="mt-2 text-sm text-red-600">{profileErrors.name[0]}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input type="email" name="email" id="email" value={profileData.email} onChange={handleProfileChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            {profileErrors?.email && <p className="mt-2 text-sm text-red-600">{profileErrors.email[0]}</p>}
          </div>
          <div className="flex justify-end">
            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Save Profile</button>
          </div>
        </form>
      </div>
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-medium text-gray-900">Change Password</h2>
        {passwordMessage && <p className="mt-4 text-sm text-green-600">{passwordMessage}</p>}
        <form className="mt-6 space-y-6" onSubmit={handlePasswordSubmit}>
          <div>
            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">Current Password</label>
            <input type="password" name="current_password" id="current_password" value={passwordData.current_password} onChange={handlePasswordChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            {passwordErrors?.current_password && <p className="mt-2 text-sm text-red-600">{passwordErrors.current_password[0]}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <input type="password" name="password" id="password" value={passwordData.password} onChange={handlePasswordChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            {passwordErrors?.password && <p className="mt-2 text-sm text-red-600">{passwordErrors.password[0]}</p>}
          </div>
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input type="password" name="password_confirmation" id="password_confirmation" value={passwordData.password_confirmation} onChange={handlePasswordChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
}
