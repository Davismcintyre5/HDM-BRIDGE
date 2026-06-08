export default function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex items-center justify-center py-16">
      <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizes[size]}`} />
    </div>
  );
}