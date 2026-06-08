export default function CategoryBadge({ category }) {
  const colors = {
    marketing: 'bg-purple-100 text-purple-700',
    transactional: 'bg-blue-100 text-blue-700',
    notification: 'bg-green-100 text-green-700',
    authentication: 'bg-orange-100 text-orange-700',
    newsletter: 'bg-teal-100 text-teal-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${colors[category] || colors.other}`}>
      {category}
    </span>
  );
}