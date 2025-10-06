import React, { useEffect } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useAuthStore } from '../store/authStore';

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const { user, loading, error } = useFirebaseAuth();
  const { setLoading, setError } = useAuthStore();

  useEffect(() => {
    // Synchroniser l'état Firebase avec le store Zustand
    setLoading(loading);
    if (error) {
      setError(error);
    }
  }, [loading, error, setLoading, setError]);

  // Afficher un loader pendant l'initialisation
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h3>Initialisation Firebase...</h3>
          <p>Veuillez patienter</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
