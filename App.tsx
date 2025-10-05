import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { HomePage } from './pages/HomePage';
import AdminPage from './pages/AdminPage';

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated, validateToken } = useAuthStore();

  // Valider le token au chargement de l'app
  useEffect(() => {
    validateToken();
  }, [validateToken]);

  // Vérifier si on est sur la page admin
  const isAdminPage = window.location.pathname === '/admin';

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        {isAdminPage ? (
          <AdminPage />
        ) : (
          <HomePage />
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
