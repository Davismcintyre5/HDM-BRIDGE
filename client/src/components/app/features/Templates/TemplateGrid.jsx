import TemplateCard from './TemplateCard';
import EmptyState from '../../ui/EmptyState';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { FiFileText } from 'react-icons/fi';

export default function TemplateGrid({ templates, loading, onEdit, onDuplicate, onDelete }) {
  if (loading) return <LoadingSpinner />;

  if (templates.length === 0) {
    return <EmptyState icon={FiFileText} title="No templates" description="Create your first email template" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((t) => (
        <TemplateCard key={t._id} template={t} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
      ))}
    </div>
  );
}