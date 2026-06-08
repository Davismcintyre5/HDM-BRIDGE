import { Routes, Route } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import Landing from '../pages/landing/Landing';
import Login from '../pages/landing/Login';
import Register from '../pages/landing/Register';

export default function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    </Routes>
  );
}