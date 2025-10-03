import React, { useState } from 'react';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';
// import { useAuthStore } from '../store/authStore';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  // const { isAuthenticated } = useAuthStore();

  const handleAuthSuccess = () => {
    // La redirection sera gérée par le useEffect ci-dessous
    console.log('Connexion réussie, redirection en cours...');
  };

  // L'App.tsx gère maintenant la redirection automatique

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>

        {isLogin ? (
          <LoginForm 
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm 
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
};
