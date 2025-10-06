import { useState, useEffect } from 'react';
import { firebaseAuthService } from '../services/firebaseAuth';
import { authService } from '../services/authService';
import type { User } from '../types/user';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Écouter les changements d'état d'authentification Firebase
    const unsubscribe = firebaseAuthService.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      setError(null);

      try {
        if (firebaseUser) {
          // Utilisateur connecté - valider avec notre backend
          const isValid = await authService.validateToken();
          if (isValid) {
            setUser(authService.getCurrentUser());
          } else {
            setUser(null);
          }
        } else {
          // Utilisateur déconnecté
          setUser(null);
        }
      } catch (err) {
        console.error('Erreur validation Firebase:', err);
        setError('Erreur de validation');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Nettoyage
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await authService.login({ email, password });
      setUser(user);
      return user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await authService.register({ name, email, password });
      setUser(user);
      return user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
};
