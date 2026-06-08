import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import PublicRoutes from './routes/PublicRoutes';
// import AppRoutes from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppProvider>
            <Toaster position="top-right" />
            <PublicRoutes />
            {/* <AppRoutes /> */}
          </AppProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}