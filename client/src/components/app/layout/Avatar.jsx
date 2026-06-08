export default function Avatar({ firstName, lastName, size = 'md' }) {
  const sizes = { sm: 'h-6 w-6 text-xs', md: 'h-8 w-8 text-sm', lg: 'h-12 w-12 text-lg' };
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className={`${sizes[size]} rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600`}>
      {initials}
    </div>
  );
}