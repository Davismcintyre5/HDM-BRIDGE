export default function ContentPreview({ log }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Content Preview</h4>
      <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
        {log.htmlBody ? (
          <div className="text-sm" dangerouslySetInnerHTML={{ __html: log.htmlBody }} />
        ) : (
          <p className="text-sm text-gray-500">{log.textBody || 'No content'}</p>
        )}
      </div>
    </div>
  );
}