export default function ScopeBadges({ scopes }) {
  if (!scopes || scopes.length === 0) return null;

  const colors = { send: 'bg-blue-100 text-blue-700', read: 'bg-green-100 text-green-700', write: 'bg-yellow-100 text-yellow-700', admin: 'bg-red-100 text-red-700' };

  return (
    <div className="flex flex-wrap gap-1">
      {scopes.map((scope) => (
        <span key={scope} className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${colors[scope] || 'bg-gray-100 text-gray-700'}`}>
          {scope}
        </span>
      ))}
    </div>
  );
}