import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';

export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const { logout } = useAuth();

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-lg">
        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xs font-semibold text-indigo-600">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <Link to="/settings" onClick={() => setOpen(false)} className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <FiSettings size={16} /> <span>Settings</span>
          </Link>
          <button onClick={logout} className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            <FiLogOut size={16} /> <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}