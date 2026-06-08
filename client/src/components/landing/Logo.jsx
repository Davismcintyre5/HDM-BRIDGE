import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">H</span>
      </div>
      <span className="text-xl font-bold text-gray-900">HDM BRIDGE</span>
    </Link>
  );
}