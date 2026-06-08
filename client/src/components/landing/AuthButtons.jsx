import { Link } from 'react-router-dom';

export default function AuthButtons() {
  return (
    <div className="flex items-center space-x-3">
      <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
        Log in
      </Link>
      <Link
        to="/register"
        className="btn-primary btn-sm rounded-lg"
      >
        Sign up
      </Link>
    </div>
  );
}