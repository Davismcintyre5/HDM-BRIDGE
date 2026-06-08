import { useEffect, useState } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import EmptyState from '@components/app/ui/EmptyState';
import LoadingSpinner from '@components/app/ui/LoadingSpinner';
import CreateApiKeyModal from '@components/app/features/ApiKeys/CreateApiKeyModal';
import ConfirmDialog from '@components/app/ui/ConfirmDialog';
import { apiKeysAPI } from '@api/apiKeys';
import { formatDate } from '@utils/helpers';
import { FiKey, FiPlus } from 'react-icons/fi';

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [revokeId, setRevokeId] = useState(null);

  useEffect(() => { fetchKeys(); }, []);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const { data } = await apiKeysAPI.getAll();
      setKeys(data.apiKeys || []);
    } catch {}
    setLoading(false);
  };

  const handleRevoke = async () => {
    if (revokeId) {
      await apiKeysAPI.revoke(revokeId);
      setKeys(keys.filter(k => k._id !== revokeId));
      setRevokeId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <PageHeader title="API Keys" description="Manage your API keys" action={
        <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm"><FiPlus size={16} className="mr-1" /> Create Key</button>
      } />
      {keys.length === 0 ? (
        <EmptyState icon={FiKey} title="No API keys" description="Create your first API key to start sending emails" action={
          <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm">Create Key</button>
        } />
      ) : (
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Key</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Scopes</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Last Used</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key._id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{key.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{key.prefix}... <span className="text-xs text-gray-400">(hidden)</span></td>
                  <td className="px-4 py-3"><span className="badge bg-blue-100 text-blue-700">{key.scopes?.join(', ') || 'send'}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{key.lastUsed ? formatDate(key.lastUsed) : 'Never'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(key.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setRevokeId(key._id)} className="text-xs text-red-600 hover:text-red-800">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <CreateApiKeyModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <ConfirmDialog isOpen={!!revokeId} onClose={() => setRevokeId(null)} onConfirm={handleRevoke} title="Revoke API Key" message="This key will no longer work. This action cannot be undone." confirmText="Revoke" danger />
    </>
  );
}