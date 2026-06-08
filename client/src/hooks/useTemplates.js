import { useState } from 'react';
import { templatesAPI } from '../api/templates';

export const useTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const { data } = await templatesAPI.getAll(page, limit);
      setTemplates(data.data);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (payload) => {
    const { data } = await templatesAPI.create(payload);
    setTemplates([data.template, ...templates]);
    return data;
  };

  const updateTemplate = async (id, payload) => {
    const { data } = await templatesAPI.update(id, payload);
    setTemplates(templates.map(t => t._id === id ? data.template : t));
    return data;
  };

  const deleteTemplate = async (id) => {
    await templatesAPI.delete(id);
    setTemplates(templates.filter(t => t._id !== id));
  };

  const duplicateTemplate = async (id) => {
    const { data } = await templatesAPI.duplicate(id);
    setTemplates([data.template, ...templates]);
    return data;
  };

  return { templates, total, loading, error, fetchTemplates, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate };
};