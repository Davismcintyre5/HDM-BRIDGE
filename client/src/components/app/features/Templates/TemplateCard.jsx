import { FiCopy, FiEdit, FiTrash2 } from 'react-icons/fi';
import CategoryBadge from '../../ui/CategoryBadge';

export default function TemplateCard({ template, onEdit, onDuplicate, onDelete }) {
  return (
    <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => onEdit(template)}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 truncate">{template.name}</h4>
        <CategoryBadge category={template.category || 'other'} />
      </div>
      <p className="text-sm text-gray-500 mb-3 truncate">{template.subject}</p>
      <div className="flex items-center space-x-1 border-t pt-3">
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(template); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-400" title="Duplicate">
          <FiCopy size={14} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onEdit(template); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-400" title="Edit">
          <FiEdit size={14} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(template); }} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500" title="Delete">
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
}