import { useState } from 'react';
import { useAuth as useAuthContext } from '../context/AuthContext';
import { authAPI } from '../api/auth';

export const useAuthActions = () => {
  const { login: contextLogin, register: contextRegister, logout: contextLogout, updateUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await contextLogin(email, password);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await contextRegister(userData);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(profileData);
      updateUser(data.user);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
    } catch (err) {
      setError(err.response?.data?.error || 'Password change failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, login, register, logout: contextLogout, updateProfile, changePassword };
};