import { useEffect, useState } from 'react';
import apiClient from '../services/api';

export default function Invitations() {
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await apiClient.get('/invitations');
      setInvitations(response.data);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    }
  };

  const handleAccept = async (id) => {
    try {
      await apiClient.post(`/invitations/${id}/accept`);
      window.location.reload(); // Reload the page to refresh all dashboard data
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  };

  const handleDecline = async (id) => {
    try {
      await apiClient.post(`/invitations/${id}/decline`);
      fetchInvitations(); // Refresh the list
    } catch (error) {
      console.error('Failed to decline invitation:', error);
    }
  };

  if (invitations.length === 0) {
    return null; // Don't render anything if there are no invitations
  }

  return (
    <div className="p-6 my-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Project Invitations</h2>
      <div className="space-y-4">
        {invitations.map(invitation => (
          <div key={invitation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-700">You have been invited to join the project:</p>
              <p className="text-lg font-bold text-indigo-600">{invitation.project.title}</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleAccept(invitation.id)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700">Accept</button>
              <button onClick={() => handleDecline(invitation.id)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700">Decline</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
