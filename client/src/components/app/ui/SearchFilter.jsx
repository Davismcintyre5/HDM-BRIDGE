import { FiSearch } from 'react-icons/fi';

export default function SearchFilter({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <FiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-10"
      />
    </div>
  );
}