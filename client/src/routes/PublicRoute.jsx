import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingLayout from '../components/landing/LandingLayout';

export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingLayout>{children}</LandingLayout>;
}