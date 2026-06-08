import { useState } from 'react';
import { domainsAPI } from '../api/domains';

export const useDomains = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const { data } = await domainsAPI.getAll();
      setDomains(data.domains);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch domains');
    } finally {
      setLoading(false);
    }
  };

  const addDomain = async (domain) => {
    const { data } = await domainsAPI.add(domain);
    setDomains([...domains, data.domain]);
    return data;
  };

  const verifyDomain = async (id) => {
    const { data } = await domainsAPI.verify(id);
    setDomains(domains.map(d => d._id === id ? data.domain : d));
    return data;
  };

  const deleteDomain = async (id) => {
    await domainsAPI.delete(id);
    setDomains(domains.filter(d => d._id !== id));
  };

  return { domains, loading, error, fetchDomains, addDomain, verifyDomain, deleteDomain };
};