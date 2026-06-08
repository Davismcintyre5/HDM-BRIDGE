export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }) {
  return (
    <div className="flex items-center space-x-2">
      <input type="date" value={startDate} onChange={(e) => onStartChange(e.target.value)} className="input text-sm" />
      <span className="text-gray-400">to</span>
      <input type="date" value={endDate} onChange={(e) => onEndChange(e.target.value)} className="input text-sm" />
    </div>
  );
}