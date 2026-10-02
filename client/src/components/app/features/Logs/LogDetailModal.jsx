import Modal from '../../ui/Modal';
import StatusBadge from '../../ui/StatusBadge';
import EmailInfo from './EmailInfo';
import Timeline from './Timeline';
import TrackingStats from './TrackingStats';
import ContentPreview from './ContentPreview';

const SOURCE_LABELS = {
  api: 'API',
  dashboard: 'Dashboard',
  system: 'System',
  broadcast: 'Broadcast',
};

const SOURCE_STYLES = {
  api: 'bg-blue-100 text-blue-700',
  dashboard: 'bg-indigo-100 text-indigo-700',
  system: 'bg-purple-100 text-purple-700',
  broadcast: 'bg-pink-100 text-pink-700',
};

export default function LogDetailModal({ isOpen, onClose, log }) {
  if (!log) return null;

  const source = log.source || 'api';
  const sourceLabel = SOURCE_LABELS[source] || source;
  const sourceClass = SOURCE_STYLES[source] || SOURCE_STYLES.api;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Email Details" size="lg">
      <div className="space-y-6">
        <div className="rounded-lg bg-gray-50 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sourceClass}`}>
              {sourceLabel}
            </span>
            {log.apiKeyName && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                {log.apiKeyName}
              </span>
            )}
            {log.templateKey && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 font-mono">
                {log.templateKey}
              </span>
            )}
          </div>
          <StatusBadge status={log.status} />
        </div>

        <EmailInfo log={log} />
        <Timeline log={log} />
        <TrackingStats log={log} />
        <ContentPreview log={log} />
      </div>
    </Modal>
  );
}