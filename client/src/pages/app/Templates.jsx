import { useEffect, useState } from 'react';
import PageHeader from '../../components/app/ui/PageHeader';
import TemplateGrid from '../../components/app/features/Templates/TemplateGrid';
import TemplateEditorModal from '../../components/app/features/Templates/TemplateEditorModal';
import ConfirmDialog from '../../components/app/ui/ConfirmDialog';
import { useTemplates } from '../../hooks/useTemplates';
import { FiPlus } from 'react-icons/fi';

export default function Templates() {
  const { templates, loading, fetchTemplates, deleteTemplate, duplicateTemplate } = useTemplates();
  const [showEditor, setShowEditor] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchTemplates(); }, []);

  const handleEdit = (template) => { setEditTemplate(template); setShowEditor(true); };
  const handleCreate = () => { setEditTemplate(null); setShowEditor(true); };
  const handleDuplicate = (template) => { duplicateTemplate(template._id).then(() => fetchTemplates()); };

  return (
    <>
      <PageHeader title="Templates" description="Manage your email templates" action={
        <button onClick={handleCreate} className="btn-primary btn-sm"><FiPlus size={16} className="mr-1" /> New Template</button>
      } />
      <TemplateGrid
        templates={templates}
        loading={loading}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={(t) => setDeleteId(t._id)}
      />
      <TemplateEditorModal
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        template={editTemplate}
        onSaved={() => fetchTemplates()}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteTemplate(deleteId); setDeleteId(null); }}
        title="Delete Template"
        message="This template will be permanently deleted."
        confirmText="Delete"
        danger
      />
    </>
  );
}