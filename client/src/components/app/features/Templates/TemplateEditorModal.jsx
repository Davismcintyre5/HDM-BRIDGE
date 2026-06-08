import { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import { templatesAPI } from '../../../api/templates';

export default function TemplateEditorModal({ isOpen, onClose, template, onSaved }) {
  const [form, setForm] = useState({ name: '', subject: '', htmlContent: '', category: 'other' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) {
      setForm({ name: template.name || '', subject: template.subject || '', htmlContent: template.htmlContent || '', category: template.category || 'other' });
    } else {
      setForm({ name: '', subject: '', htmlContent: '', category: 'other' });
    }
  }, [template, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (template?._id) {
        await templatesAPI.update(template._id, form);
      } else {
        await templatesAPI.create(form);
      }
      onSaved();
      onClose();
    } catch {}
    setLoading(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={template ? 'Edit Template' : 'Create Template'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Template Name</label>
          <input type="text" name="name" className="input" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Subject</label>
          <input type="text" name="subject" className="input" value={form.subject} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Category</label>
          <select name="category" className="input" value={form.category} onChange={handleChange}>
            <option value="marketing">Marketing</option>
            <option value="transactional">Transactional</option>
            <option value="notification">Notification</option>
            <option value="newsletter">Newsletter</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">HTML Content</label>
          <textarea name="htmlContent" className="input font-mono text-sm" rows={10} value={form.htmlContent} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
        </button>
      </form>
    </Modal>
  );
}