export default function Timeline({ log }) {
  const events = [
    { label: 'Queued', time: log.createdAt, active: true },
    { label: 'Sent', time: log.deliveryDetails?.deliveredAt, active: log.status !== 'queued' && log.status !== 'failed' },
    { label: 'Delivered', time: log.deliveryDetails?.deliveredAt, active: ['delivered', 'opened', 'clicked'].includes(log.status) },
    { label: 'Opened', time: log.tracking?.openedAt, active: log.tracking?.opened },
    { label: 'Clicked', time: log.tracking?.clickedAt, active: log.tracking?.clicked },
  ];

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h4>
      <div className="space-y-2">
        {events.map((e, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className={`h-2.5 w-2.5 rounded-full ${e.active ? 'bg-indigo-600' : 'bg-gray-300'}`} />
            <span className={`text-sm ${e.active ? 'text-gray-900' : 'text-gray-400'}`}>{e.label}</span>
            {e.time && <span className="text-xs text-gray-400">{new Date(e.time).toLocaleString()}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}