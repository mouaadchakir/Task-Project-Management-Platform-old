import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import Input from '../components/Input';

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [profileMessage, setProfileMessage] = useState({ type: '', content: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', content: '' });
  const [profileErrors, setProfileErrors] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsProfileSaving(true);
    setProfileMessage({ type: '', content: '' });
    setProfileErrors(null);
    try {
      const response = await apiClient.put('/user/profile', profileData);
      setProfileMessage({ type: 'success', content: response.data.message });
      const updatedUser = { ...user, ...response.data.user };
      setUser(updatedUser);
      localStorage.setItem('USER', JSON.stringify(updatedUser));
    } catch (error) {
      if (error.response?.status === 422) {
        setProfileErrors(error.response.data.errors);
        setProfileMessage({ type: 'error', content: 'Please check the form for errors.' });
      } else {
        setProfileMessage({ type: 'error', content: 'An unexpected error occurred.' });
      }
    }
    setIsProfileSaving(false);
  };

  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsPasswordSaving(true);
    setPasswordMessage({ type: '', content: '' });
    setPasswordErrors(null);
    try {
      const response = await apiClient.put('/user/password', passwordData);
      setPasswordMessage({ type: 'success', content: response.data.message });
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (error) {
      if (error.response?.status === 422) {
        setPasswordErrors(error.response.data.errors);
        setPasswordMessage({ type: 'error', content: 'Please check the form for errors.' });
      } else {
        setPasswordMessage({ type: 'error', content: 'An unexpected error occurred.' });
      }
    }
    setIsPasswordSaving(false);
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profile_picture', file);
    try {
      const response = await apiClient.post('/user/profile-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfileMessage({ type: 'success', content: response.data.message });
      const updatedUser = { ...user, profile_picture_path: response.data.path };
      setUser(updatedUser);
      localStorage.setItem('USER', JSON.stringify(updatedUser));
    } catch (error) {
      setProfileMessage({ type: 'error', content: 'Failed to upload picture. Please try again.' });
    }
  };

  const handleRemovePicture = async () => {
    setProfileMessage({ type: '', content: '' });
    try {
      await apiClient.delete('/user/profile-picture');
      setProfileMessage({ type: 'success', content: 'Profile picture removed successfully.' });
      const updatedUser = { ...user, profile_picture_path: null };
      setUser(updatedUser);
      localStorage.setItem('USER', JSON.stringify(updatedUser));
    } catch (error) {
      setProfileMessage({ type: 'error', content: 'Failed to remove picture. Please try again.' });
    }
  };

  const Message = ({ type, content }) => {
    if (!content) return null;
    const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
    const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
    return (
      <div className={`p-3 rounded-md ${bgColor} ${textColor} text-sm mt-4`}>
        {content}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
        <div className="p-6 bg-white rounded-lg shadow-md">
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
            <div className="ml-4 flex flex-col">
              <div className="flex">
                <button type="button" onClick={() => document.getElementById('profile_picture_input').click()} className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Change</button>
                {user?.profile_picture_path && (
                  <button type="button" onClick={handleRemovePicture} className="ml-2 bg-red-100 text-red-700 py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-red-200">Remove</button>
                )}
              </div>
            </div>
          </div>
          <form className="mt-6 space-y-6" onSubmit={handleProfileSubmit}>
            <Message type={profileMessage.type} content={profileMessage.content} />
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <Input type="text" name="name" id="name" value={profileData.name} onChange={handleProfileChange} required />
              {profileErrors?.name && <p className="mt-2 text-sm text-red-600">{profileErrors.name[0]}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <Input type="email" name="email" id="email" value={profileData.email} onChange={handleProfileChange} required />
              {profileErrors?.email && <p className="mt-2 text-sm text-red-600">{profileErrors.email[0]}</p>}
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isProfileSaving} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                {isProfileSaving && <Spinner />} {isProfileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
        <div className="mt-8 lg:mt-0 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-medium text-gray-900">Change Password</h2>
          <form className="mt-6 space-y-6" onSubmit={handlePasswordSubmit}>
            <Message type={passwordMessage.type} content={passwordMessage.content} />
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">Current Password</label>
              <Input type="password" name="current_password" id="current_password" value={passwordData.current_password} onChange={handlePasswordChange} required />
              {passwordErrors?.current_password && <p className="mt-2 text-sm text-red-600">{passwordErrors.current_password[0]}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
              <Input type="password" name="password" id="password" value={passwordData.password} onChange={handlePasswordChange} required />
              {passwordErrors?.password && <p className="mt-2 text-sm text-red-600">{passwordErrors.password[0]}</p>}
            </div>
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <Input type="password" name="password_confirmation" id="password_confirmation" value={passwordData.password_confirmation} onChange={handlePasswordChange} required />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isPasswordSaving} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                {isPasswordSaving && <Spinner />} {isPasswordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
