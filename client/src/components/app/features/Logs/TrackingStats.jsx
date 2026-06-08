export default function TrackingStats({ log }) {
  const stats = [
    { label: 'Opens', value: log.tracking?.openCount || 0 },
    { label: 'Clicks', value: log.tracking?.clickCount || 0 },
    { label: 'Delivery Attempts', value: log.deliveryDetails?.attempts || 1 },
    { label: 'Bounce', value: log.bounce?.bounced ? log.bounce.bounceType : 'None' },
  ];

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Tracking Stats</h4>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-gray-50 p-3 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}