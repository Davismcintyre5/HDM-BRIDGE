import { useState, useEffect } from 'react';
import Modal from '@components/app/ui/Modal';
import { templatesAPI } from '@api/templates';

export default function TemplateEditorModal({ isOpen, onClose, template, onSaved }) {
  const [form, setForm] = useState({ name: '', subject: '', htmlContent: '', category: 'other' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) setForm({ name: template.name || '', subject: template.subject || '', htmlContent: template.htmlContent || '', category: template.category || 'other' });
    else setForm({ name: '', subject: '', htmlContent: '', category: 'other' });
  }, [template, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { if (template?._id) await templatesAPI.update(template._id, form); else await templatesAPI.create(form); onSaved(); onClose(); } catch {}
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={template ? 'Edit Template' : 'Create Template'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="label">Name</label><input type="text" name="name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div><label className="label">Subject</label><input type="text" name="subject" className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></div>
        <div><label className="label">Category</label><select name="category" className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="marketing">Marketing</option><option value="transactional">Transactional</option><option value="notification">Notification</option><option value="newsletter">Newsletter</option><option value="other">Other</option></select></div>
        <div><label className="label">HTML</label><textarea name="htmlContent" className="input font-mono text-sm" rows={10} value={form.htmlContent} onChange={(e) => setForm({ ...form, htmlContent: e.target.value })} required /></div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saving...' : template ? 'Update' : 'Create'}</button>
      </form>
    </Modal>
  );
}