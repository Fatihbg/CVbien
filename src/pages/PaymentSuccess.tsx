import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { config } from '../config/environment';

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        const credits = searchParams.get('credits');
        const userId = searchParams.get('user_id');

        if (!sessionId) {
          setMessage('❌ Session de paiement introuvable');
          setIsLoading(false);
          return;
        }

        // Confirmer le paiement avec le backend
        const response = await fetch(`${config.API_BASE_URL}/api/payments/confirm-payment-stripe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          setMessage(`✅ Paiement réussi ! ${data.credits} crédits ont été ajoutés à votre compte.`);
        } else {
          setMessage('❌ Erreur lors de la confirmation du paiement');
        }
      } catch (error) {
        console.error('Erreur confirmation paiement:', error);
        setMessage('❌ Erreur lors de la confirmation du paiement');
      } finally {
        setIsLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams]);

  const handleReturn = () => {
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(30px)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: isLoading 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          margin: '0 auto 20px auto',
          animation: isLoading ? 'pulse 2s infinite' : 'none'
        }}>
          {isLoading ? '⏳' : '✅'}
        </div>

        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          {isLoading ? 'Confirmation du paiement...' : 'Paiement réussi !'}
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '32px',
          lineHeight: '1.5'
        }}>
          {message}
        </p>

        {!isLoading && (
          <button
            onClick={handleReturn}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
            }}
          >
            Retour à l'accueil
          </button>
        )}
      </div>
    </div>
  );
};
