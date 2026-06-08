import { useState } from 'react';
import Modal from '@components/app/ui/Modal';
import { apiKeysAPI } from '@api/apiKeys';
import { FiCheck, FiCopy, FiAlertCircle } from 'react-icons/fi';

export default function CreateApiKeyModal({ isOpen, onClose }) {
  const [step, setStep] = useState('form');
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState(['send']);
  const [newKey, setNewKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await apiKeysAPI.create({ name, scopes });
      setNewKey(data.apiKey);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create API key');
    }
    setLoading(false);
  };

  const toggleScope = (scope) => {
    setScopes(scopes.includes(scope) ? scopes.filter(s => s !== scope) : [...scopes, scope]);
  };

  const handleClose = () => {
    setStep('form');
    setNewKey(null);
    setName('');
    setScopes(['send']);
    setCopied(false);
    setError('');
    onClose();
  };

  const handleCopy = async () => {
    if (!newKey?.key) return;
    try { await navigator.clipboard.writeText(newKey.key); } catch {
      const ta = document.createElement('textarea'); ta.value = newKey.key;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <>
      {step === 'success' && newKey && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-auto overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center">
              <div className="text-5xl mb-3">🔑</div>
              <h2 className="text-2xl font-bold text-white mb-1">API Key Created</h2>
              <p className="text-indigo-200 text-sm">Save this key now. You won't see it again.</p>
            </div>
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                <FiAlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">This key will not be shown again after you close this window.</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-5 mb-4" style={{ minWidth: 0, width: '100%' }}>
                <p className="text-xs text-gray-400 mb-2 text-left uppercase tracking-wider font-medium">Your API Key</p>
                <p className="text-white font-mono text-sm leading-relaxed select-all text-left break-all" style={{ overflowWrap: 'anywhere' }}>
                  {newKey.key}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button onClick={handleCopy} className={`flex-1 btn-lg rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${copied ? 'bg-green-600 text-white' : 'btn-primary'}`}>
                  {copied ? <><FiCheck size={20} /> Copied</> : <><FiCopy size={20} /> Copy Key</>}
                </button>
                <button onClick={handleClose} className="flex-1 btn-secondary btn-lg rounded-xl font-medium">Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={isOpen && step === 'form'} onClose={handleClose} title="Create API Key">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <FiAlertCircle size={16} /> {error}
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Key Name</label>
            <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Production, Staging, Test" required />
          </div>
          <div>
            <label className="label">Scopes</label>
            <div className="flex flex-wrap gap-2">
              {['send', 'read', 'write'].map(s => (
                <button key={s} type="button" onClick={() => toggleScope(s)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${scopes.includes(s) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading || !name} className="btn-primary w-full py-3 text-base font-medium">
            {loading ? 'Creating...' : 'Create API Key'}
          </button>
        </form>
      </Modal>
    </>
  );
}