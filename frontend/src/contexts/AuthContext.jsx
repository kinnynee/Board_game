import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    api.getMe()
      .then((nextUser) => setUser(nextUser))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
=======

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Đã có logic tự động lấy lại thông tin user
      api.getMe().then(nextUser => setUser(nextUser)).catch(() => localStorage.removeItem('token'));
    }
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
  }, []);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
<<<<<<< HEAD
    return data.user;
=======
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
<<<<<<< HEAD
    return data.user;
=======
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

<<<<<<< HEAD
  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
=======
  // Vẫn chưa có updateUser để đồng bộ Profile
  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
      {children}
    </AuthContext.Provider>
  );
}

<<<<<<< HEAD
export function useAuth() {
  return useContext(AuthContext);
}
=======
export function useAuth() { return useContext(AuthContext); }
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
