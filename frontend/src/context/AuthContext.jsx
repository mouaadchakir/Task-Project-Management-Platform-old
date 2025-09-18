import { createContext, useContext, useState } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('USER')) || null);
  const [token, setToken] = useState(localStorage.getItem('TOKEN') || null);

  const login = async (email, password) => {
    await apiClient.get('/sanctum/csrf-cookie', { baseURL: 'http://127.0.0.1:8000' });
    const response = await apiClient.post('/login', { email, password });
    const { access_token, user } = response.data;
    setUser(user);
    setToken(access_token);
    localStorage.setItem('USER', JSON.stringify(user));
    localStorage.setItem('TOKEN', access_token);
  };

  const register = async (name, email, password, password_confirmation) => {
    await apiClient.get('/sanctum/csrf-cookie', { baseURL: 'http://127.0.0.1:8000' });
    const response = await apiClient.post('/register', { name, email, password, password_confirmation });
    const { access_token, user } = response.data;
    setUser(user);
    setToken(access_token);
    localStorage.setItem('USER', JSON.stringify(user));
    localStorage.setItem('TOKEN', access_token);
  };

  const logout = async () => {
    await apiClient.post('/logout');
    setUser(null);
    setToken(null);
    localStorage.removeItem('USER');
    localStorage.removeItem('TOKEN');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
