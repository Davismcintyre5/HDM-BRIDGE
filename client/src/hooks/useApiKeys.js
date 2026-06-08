import { useState } from 'react';
import { apiKeysAPI } from '../api/apiKeys';

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const { data } = await apiKeysAPI.getAll();
      setApiKeys(data.apiKeys);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async (payload) => {
    const { data } = await apiKeysAPI.create(payload);
    return data;
  };

  const revokeApiKey = async (id) => {
    await apiKeysAPI.revoke(id);
    setApiKeys(apiKeys.filter(k => k._id !== id));
  };

  return { apiKeys, loading, error, fetchApiKeys, createApiKey, revokeApiKey };
};