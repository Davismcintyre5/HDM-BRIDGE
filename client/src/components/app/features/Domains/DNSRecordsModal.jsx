import Modal from '../../ui/Modal';
import CopyButton from '../../ui/CopyButton';

export default function DNSRecordsModal({ isOpen, onClose, records }) {
  if (!records) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="DNS Records" size="lg">
      <p className="text-sm text-gray-500 mb-4">Add these records to your domain's DNS settings to verify ownership.</p>
      <div className="space-y-4">
        {records.map((rec, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">{rec.type} Record</span>
              <CopyButton text={rec.value} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Host:</span> <code className="text-gray-900">{rec.host}</code></div>
              <div><span className="text-gray-500">Value:</span> <code className="text-gray-900 break-all">{rec.value}</code></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{rec.reason}</p>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="btn-primary w-full mt-4">Done</button>
    </Modal>
  );
}