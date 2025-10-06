import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { HomePage } from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentCancel } from './pages/PaymentCancel';

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated, validateToken } = useAuthStore();

  // Valider le token au chargement de l'app
  useEffect(() => {
    validateToken();
  }, [validateToken]);

  // Vérifier la route actuelle
  const currentPath = window.location.pathname;
  const isAdminPage = currentPath === '/admin';
  const isPaymentSuccess = currentPath === '/payment-success';
  const isPaymentCancel = currentPath === '/payment-cancel';

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        {isAdminPage ? (
          <AdminPage />
        ) : isPaymentSuccess ? (
          <PaymentSuccess />
        ) : isPaymentCancel ? (
          <PaymentCancel />
        ) : (
          <HomePage />
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
// Complete rebuild Fri Oct  3 17:59:58 CEST 2025
