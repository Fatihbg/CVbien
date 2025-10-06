import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

interface PaymentModalProps {
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ onClose }) => {
  const { buyCredits } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState<number | null>(null);

  const creditPacks = [
    { amount: 5, price: 1, popular: false },
    { amount: 100, price: 5, popular: true }
  ];

  const handleBuyCredits = async (amount: number, price: number) => {
    setIsLoading(true);
    try {
      console.log(`🚀 Création session Stripe Checkout pour ${amount} crédits (${price}€)`);
      
      // Utiliser le nouveau système d'achat de crédits
      await buyCredits(price, 'stripe');
      
    } catch (error) {
      console.error('❌ Erreur achat crédits:', error);
      alert('❌ Erreur lors de l\'achat de crédits:\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      overflow: 'hidden',
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh'
    }} onClick={onClose}>
      
      {/* Arrière-plan animé comme la page principale */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)
        `,
        animation: 'backgroundShift 20s ease-in-out infinite',
        zIndex: -1
      }} />

      {/* Particules flottantes */}
      <div className="floating-particles">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Overlay sombre léger pour le contraste */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(4px)',
        zIndex: 1
      }} />
      
      <div 
        className="glass-card fade-in"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '500px',
          width: '90%',
          padding: '32px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(30px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'visible'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#374151',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
            💳
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 8px 0'
          }}>
            Acheter des crédits
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0
          }}>
            Choisissez votre pack de crédits
          </p>
        </div>

        {/* Options de crédits */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {creditPacks.map((pack) => (
            <button
              key={pack.amount}
              onClick={() => setSelectedPack(pack.amount)}
              disabled={isLoading}
              className="zoom-hover"
              style={{
                padding: '24px 20px',
                borderRadius: '16px',
                border: selectedPack === pack.amount 
                  ? '2px solid #667eea' 
                  : pack.popular 
                    ? '2px solid #667eea' 
                    : '1px solid #d1d5db',
                background: selectedPack === pack.amount
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
                  : pack.popular 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)' 
                    : 'rgba(255, 255, 255, 0.8)',
                position: 'relative',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                boxShadow: selectedPack === pack.amount
                  ? '0 12px 30px rgba(102, 126, 234, 0.4)'
                  : pack.popular 
                    ? '0 8px 25px rgba(102, 126, 234, 0.3)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
            >
              {pack.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '600',
                  padding: '4px 12px',
                  borderRadius: '12px'
                }}>
                  POPULAIRE
                </div>
              )}
              
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                color: '#667eea',
                marginBottom: '8px'
              }}>
                {pack.amount}
              </div>
              
              <div style={{ 
                fontSize: '16px', 
                color: '#6b7280',
                marginBottom: '12px'
              }}>
                crédits
              </div>
              
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#667eea'
              }}>
                {pack.price}€
              </div>
            </button>
          ))}
        </div>

        {/* Bouton d'achat */}
        {selectedPack && (
          <button
            onClick={() => {
              const pack = creditPacks.find(p => p.amount === selectedPack);
              if (pack) {
                handleBuyCredits(pack.amount, pack.price);
              }
            }}
            disabled={isLoading}
            className="btn-primary zoom-hover"
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '700',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
            }}
          >
            {isLoading ? 'Traitement...' : `Acheter ${selectedPack} crédits`}
          </button>
        )}

        {/* Message d'aide */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          💡 Les crédits sont ajoutés instantanément à votre compte
        </div>
      </div>
    </div>
  );
};
