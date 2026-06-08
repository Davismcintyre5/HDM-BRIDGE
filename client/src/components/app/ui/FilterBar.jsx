export default function FilterBar({ children }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {children}
    </div>
  );
}