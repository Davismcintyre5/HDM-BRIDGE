import { useState } from 'react';
import { FiPaperclip, FiX, FiFile } from 'react-icons/fi';

export default function AttachmentUpload({ attachments, onChange, maxSizeMB = 10 }) {
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    setError('');

    const newAttachments = [];

    for (const file of files) {
      // Check size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File ${file.name} exceeds ${maxSizeMB}MB limit`);
        continue;
      }

      // Convert to base64
      const base64 = await fileToBase64(file);

      newAttachments.push({
        filename: file.name,
        content: base64.split(',')[1], // Remove data:... prefix
        type: file.type,
        size: file.size,
      });
    }

    onChange([...attachments, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    onChange(attachments.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <label className="label">Attachments (max {maxSizeMB}MB each)</label>

      {/* File List */}
      {attachments.length > 0 && (
        <div className="space-y-2 mb-3">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <FiFile size={16} className="text-gray-400" />
                <span className="text-gray-700">{att.filename}</span>
                <span className="text-xs text-gray-400">({formatSize(att.size)})</span>
              </div>
              <button onClick={() => removeAttachment(i)} className="text-gray-400 hover:text-red-500">
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors">
        <FiPaperclip size={16} className="text-gray-400" />
        <span className="text-sm text-gray-500">Attach files</span>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.csv,.txt"
        />
      </label>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      <p className="text-xs text-gray-400 mt-1">
        PDF, Images, Documents, Spreadsheets, Text files
      </p>
    </div>
  );
}