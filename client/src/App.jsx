import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@context/AuthContext';
import { AppProvider } from '@context/AppContext';
import { Toaster } from 'react-hot-toast';
import PublicRoute from '@routes/PublicRoute';
import ProtectedRoute from '@routes/ProtectedRoute';
import Landing from '@pages/landing/Landing';
import Login from '@pages/landing/Login';
import Register from '@pages/landing/Register';
import VerifyEmail from '@pages/landing/VerifyEmail';
import Dashboard from '@pages/app/Dashboard';
import Compose from '@pages/app/Compose';
import ApiKeys from '@pages/app/ApiKeys';
import Domains from '@pages/app/Domains';
import Senders from '@pages/app/Senders';
import Templates from '@pages/app/Templates';
import EmailLogs from '@pages/app/EmailLogs';
import Billing from '@pages/app/Billing';
import Team from '@pages/app/Team';
import Settings from '@pages/app/Settings';
import Developers from '@pages/app/Developers';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

export default function App() {
  return (
    <BrowserRouter future={routerFuture}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppProvider>
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/verify-email/:token" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
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
              <Route path="/developers" element={<ProtectedRoute><Developers /></ProtectedRoute>} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}