import { useState } from 'react';
import Modal from '../../ui/Modal';
import CopyButton from '../../ui/CopyButton';
import { apiKeysAPI } from '../../../api/apiKeys';

export default function CreateApiKeyModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState(['send']);
  const [newKey, setNewKey] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiKeysAPI.create({ name, scopes });
      setNewKey(data.apiKey);
      onCreated(data.apiKey);
    } catch {}
    setLoading(false);
  };

  const toggleScope = (scope) => {
    setScopes(scopes.includes(scope) ? scopes.filter(s => s !== scope) : [...scopes, scope]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create API Key">
      {newKey ? (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-2">Copy this key now. You won't see it again.</p>
            <div className="flex items-center space-x-2 bg-white p-3 rounded border">
              <code className="text-sm break-all flex-1">{newKey.key}</code>
              <CopyButton text={newKey.key} />
            </div>
          </div>
          <button onClick={onClose} className="btn-primary w-full">Done</button>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Key Name</label>
            <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Scopes</label>
            <div className="flex flex-wrap gap-2">
              {['send', 'read', 'write'].map(s => (
                <button key={s} type="button" onClick={() => toggleScope(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${scopes.includes(s) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating...' : 'Create Key'}
          </button>
        </form>
      )}
    </Modal>
  );
}