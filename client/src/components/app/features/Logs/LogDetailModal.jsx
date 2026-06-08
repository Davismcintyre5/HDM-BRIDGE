import Modal from '../../ui/Modal';
import StatusBadge from '../../ui/StatusBadge';
import EmailInfo from './EmailInfo';
import Timeline from './Timeline';
import TrackingStats from './TrackingStats';
import ContentPreview from './ContentPreview';

export default function LogDetailModal({ isOpen, onClose, log }) {
  if (!log) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Email Details" size="lg">
      <div className="space-y-6">
        <EmailInfo log={log} />
        <Timeline log={log} />
        <TrackingStats log={log} />
        <ContentPreview log={log} />
      </div>
    </Modal>
  );
}