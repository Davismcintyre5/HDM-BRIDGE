import { useEffect, useState } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import EmptyState from '@components/app/ui/EmptyState';
import LoadingSpinner from '@components/app/ui/LoadingSpinner';
import CreateApiKeyModal from '@components/app/features/ApiKeys/CreateApiKeyModal';
import ConfirmDialog from '@components/app/ui/ConfirmDialog';
import { apiKeysAPI } from '@api/apiKeys';
import { formatDate } from '@utils/helpers';
import { FiKey, FiPlus, FiCopy, FiCheck } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [revokeId, setRevokeId] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

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

  const copyBaseUrl = async () => {
    await navigator.clipboard.writeText(API_BASE_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <PageHeader title="API Keys" description="Manage your API keys" action={
        <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm"><FiPlus size={16} className="mr-1" /> Create Key</button>
      } />

      {/* Base URL Card */}
      <div className="card mb-6 bg-indigo-50 border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-indigo-900 mb-1">📡 Your API Base URL</h3>
            <code className="text-indigo-700 text-sm font-mono">{API_BASE_URL}</code>
          </div>
          <button onClick={copyBaseUrl} className={`btn-sm rounded-lg flex items-center gap-2 ${copiedUrl ? 'bg-green-600 text-white' : 'btn-secondary'}`}>
            {copiedUrl ? <><FiCheck size={14} /> Copied</> : <><FiCopy size={14} /> Copy</>}
          </button>
        </div>
        <p className="text-xs text-indigo-600 mt-2">
          Send POST requests to <code className="bg-indigo-100 px-1 rounded">{API_BASE_URL}/emails/send</code> with your API key
        </p>
      </div>

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
      <ConfirmDialog isOpen={!!revokeId} onClose={() => setRevokeId(null)} onConfirm={handleRevoke} title="Revoke API Key" message="This key will no longer work." confirmText="Revoke" danger />
    </>
  );
}