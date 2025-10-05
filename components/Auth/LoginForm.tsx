import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const { login, error, clearError, setError } = useAuthStore();

  // Fonction de validation d'email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Fonction pour vérifier si l'email existe vraiment
  const verifyEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Utiliser une API gratuite et fiable pour vérifier les emails
      const response = await fetch(`https://api.eva.pingutil.com/email?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error('API non disponible');
      }
      
      const data = await response.json();
      
      // L'API retourne différents statuts
      if (data.status === 'success') {
        // Vérifier si l'email est livrable
        return data.data.deliverable === true || data.data.deliverable === 'true';
      }
      
      // Si l'API principale échoue, fallback vers vérification DNS
      throw new Error('Vérification principale échouée');
      
    } catch (error) {
      console.error('Erreur API principale:', error);
      
      // Fallback : vérification DNS du domaine + validation stricte
      try {
        const domain = email.split('@')[1].toLowerCase();
        
        // Vérifier que le domaine a des enregistrements MX
        const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
        const dnsData = await dnsResponse.json();
        
        const hasMX = dnsData.Status === 0 && dnsData.Answer && dnsData.Answer.length > 0;
        
        if (!hasMX) {
          return false; // Pas d'enregistrement MX = pas d'email possible
        }
        
        // Vérifications supplémentaires pour les domaines suspects
        const suspiciousPatterns = [
          /temp/i, /fake/i, /test/i, /dummy/i, /example/i, /invalid/i,
          /noemail/i, /nomail/i, /mailinator/i, /10minutemail/i,
          /guerrillamail/i, /throwaway/i, /disposable/i
        ];
        
        const isSuspicious = suspiciousPatterns.some(pattern => 
          pattern.test(email) || pattern.test(domain)
        );
        
        if (isSuspicious) {
          return false; // Domaine suspect
        }
        
        // Si le domaine a des MX et n'est pas suspect, on accepte
        return true;
        
      } catch (fallbackError) {
        console.error('Erreur fallback DNS:', fallbackError);
        // En cas d'erreur totale, on refuse pour être strict
        return false;
      }
    }
  };

  // Validation en temps réel de l'email
  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (!newEmail) {
      setEmailError('');
      return;
    }
    
    if (!isValidEmail(newEmail)) {
      setEmailError('Format d\'email invalide');
      return;
    }
    
    // Vérifier si l'email existe vraiment
    setIsVerifyingEmail(true);
    setEmailError('Vérification en cours...');
    
    // Validation email temporairement désactivée (problème API)
    setTimeout(() => {
      setIsVerifyingEmail(false);
      setEmailError(''); // Pas de validation pour l'instant
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tentative de connexion avec:', { email, password });
    setIsLoading(true);
    clearError();

    // Validation de l'email
    if (!isValidEmail(email)) {
      setError('Veuillez entrer une adresse email valide');
      setIsLoading(false);
      return;
    }

    // Validation email temporairement désactivée (problème API)
    // const emailExists = await verifyEmailExists(email);
    // if (!emailExists) {
    //   setError('Cette adresse email n\'existe pas. Veuillez utiliser une adresse email valide.');
    //   setIsLoading(false);
    //   return;
    // }

    try {
      console.log('Appel de la fonction login...');
      await login({ email, password });
      console.log('Connexion réussie!');
      console.log('Redirection automatique via le store...');
      onSuccess?.();
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card fade-in" style={{
      maxWidth: '400px',
      width: '100%',
      padding: '32px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(30px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: '700',
          color: 'white',
          margin: '0 auto 16px auto',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
        }}>
          CV
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 8px 0'
        }}>
          Connexion
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0,
          lineHeight: '1.5'
        }}>
          Obtenez un CV aligné à la description du poste que vous ciblez, optimisé ATS et conçu pour maximiser vos chances de recrutement.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            className="input-field"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: emailError ? '1px solid #ef4444' : '1px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '16px',
              background: 'rgba(255, 255, 255, 0.8)',
              color: '#1f2937',
              transition: 'all 0.3s ease'
            }}
            placeholder="votre@email.com"
          />
          {(emailError || isVerifyingEmail) && (
            <p style={{
              color: isVerifyingEmail ? '#3b82f6' : '#ef4444',
              fontSize: '12px',
              marginTop: '4px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {isVerifyingEmail && (
                <span style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #3b82f6',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
              )}
              {emailError || (isVerifyingEmail ? 'Vérification en cours...' : '')}
            </p>
          )}
        </div>

        {/* Mot de passe */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '16px',
              background: 'rgba(255, 255, 255, 0.8)',
              color: '#1f2937',
              transition: 'all 0.3s ease'
            }}
            placeholder="••••••••"
          />
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Bouton de connexion */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary zoom-hover"
          style={{
            width: '100%',
            padding: '14px 24px',
            fontSize: '16px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            border: 'none',
            color: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Connexion...
            </div>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      {/* Lien vers inscription */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
          Pas encore de compte ?
        </p>
        <button
          onClick={onSwitchToRegister}
          style={{
            background: 'none',
            border: 'none',
            color: '#667eea',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Créer un compte
        </button>
      </div>
    </div>
  );
};