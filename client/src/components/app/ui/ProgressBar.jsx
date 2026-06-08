export default function ProgressBar({ value, max, label, showPercentage = true }) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const getColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-indigo-600';
  };

  return (
    <div>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">{label}</span>
          {showPercentage && <span className="text-sm font-medium text-gray-900">{percentage}%</span>}
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${getColor()}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}