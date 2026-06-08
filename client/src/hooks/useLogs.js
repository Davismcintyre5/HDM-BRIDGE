import { useState } from 'react';
import { logsAPI } from '../api/logs';

export const useLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await logsAPI.getAll(params);
      setLogs(data.data);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const getLog = async (id) => {
    const { data } = await logsAPI.getById(id);
    return data.log;
  };

  const getStats = async (params) => {
    const { data } = await logsAPI.getStats(params);
    return data.stats;
  };

  return { logs, total, loading, error, fetchLogs, getLog, getStats };
};