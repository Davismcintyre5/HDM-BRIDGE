import { useState } from 'react';
import ConfirmDialog from '@components/app/ui/ConfirmDialog';
import { useAuth } from '@context/AuthContext';

export default function DangerZone() {
  const [showConfirm, setShowConfirm] = useState(false);
  const { logout } = useAuth();

  return (
    <>
      <div className="card border-red-200">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all data.</p>
        <button onClick={() => setShowConfirm(true)} className="btn-danger">Delete Account</button>
      </div>
      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={() => { setShowConfirm(false); logout(); }} title="Delete Account" message="This action is irreversible." confirmText="Delete Forever" danger />
    </>
  );
}