import { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { Link } from 'react-router-dom';

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Fetch every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative text-gray-500 hover:text-gray-700 focus:outline-none">
        <BellIcon />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20">
          <div className="py-2 px-4 text-sm font-semibold text-gray-700 border-b">Notifications</div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification.id} className="p-4 hover:bg-gray-50">
                  <Link to={notification.link || '#'} onClick={() => handleMarkAsRead(notification.id)} className="block">
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(notification.created_at).toLocaleString()}</p>
                  </Link>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500">No new notifications.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
