import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../pages/app/Dashboard';
import Compose from '../pages/app/Compose';
import ApiKeys from '../pages/app/ApiKeys';
import Domains from '../pages/app/Domains';
import Senders from '../pages/app/Senders';
import Templates from '../pages/app/Templates';
import EmailLogs from '../pages/app/EmailLogs';
import Billing from '../pages/app/Billing';
import Team from '../pages/app/Team';
import Settings from '../pages/app/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/compose" element={<ProtectedRoute><Compose /></ProtectedRoute>} />
      <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
      <Route path="/domains" element={<ProtectedRoute><Domains /></ProtectedRoute>} />
      <Route path="/senders" element={<ProtectedRoute><Senders /></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute><EmailLogs /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  );
}