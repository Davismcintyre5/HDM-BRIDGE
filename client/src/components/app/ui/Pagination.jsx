import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ page, total, limit = 20, onChange }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-500">
        Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total}
      </p>
      <div className="flex items-center space-x-1">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50">
          <FiChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <button key={p} onClick={() => onChange(p)} className={`px-3 py-1 rounded-lg text-sm ${p === page ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>
              {p}
            </button>
          );
        })}
        <button onClick={() => onChange(page + 1)} disabled={page >= pages} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50">
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}