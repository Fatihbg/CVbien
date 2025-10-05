import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

interface UserProfileProps {
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, profile, buyCredits, updateProfile, generatedCVs, loadGeneratedCVs } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  React.useEffect(() => {
    loadGeneratedCVs();
  }, []);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ name, email });
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCredits = async (amount: number) => {
    setIsLoading(true);
    try {
      // Calculer le prix basé sur le nombre de crédits
      const price = amount === 10 ? 1 : 5;
      await buyCredits(price, 'stripe'); // Simuler Stripe
      alert(`${amount} crédits ajoutés avec succès !`);
    } catch (error) {
      console.error('Erreur achat crédits:', error);
      alert('Erreur lors de l\'achat de crédits');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) return null;

  return (
    <div style={{
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
      overflow: 'hidden'
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
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          padding: '32px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(30px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'auto'
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
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: '700',
            color: 'white',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 8px 0'
          }}>
            Mon Profil
          </h2>
        </div>

        {/* Informations utilisateur */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            👤 Informations personnelles
          </h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Nom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '16px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    color: '#1f2937'
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  color: '#1f2937'
                }}>
                  {profile.name}
                </div>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '16px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    color: '#1f2937'
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  color: '#1f2937'
                }}>
                  {profile.email}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    borderRadius: '8px'
                  }}
                >
                  {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    borderRadius: '8px'
                  }}
                >
                  Annuler
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary"
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  borderRadius: '8px'
                }}
              >
                Modifier
              </button>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 Statistiques
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#667eea',
                marginBottom: '4px'
              }}>
                {profile.credits}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Crédits restants
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(79, 172, 254, 0.2)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#4facfe',
                marginBottom: '4px'
              }}>
                {profile.totalCVsGenerated}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                CV générés
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 82, 0.1) 100%)',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(255, 107, 107, 0.2)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ff6b6b',
                marginBottom: '4px'
              }}>
                {profile.subscriptionType.toUpperCase()}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Abonnement
              </div>
            </div>
          </div>
        </div>

        {/* Achat de crédits */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💳 Acheter des crédits
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            {[
              { amount: 10, price: '1€', popular: false },
              { amount: 100, price: '5€', popular: true }
            ].map((pack) => (
              <button
                key={pack.amount}
                onClick={() => handleBuyCredits(pack.amount)}
                disabled={isLoading}
                className="btn-secondary zoom-hover"
                style={{
                  padding: '20px 16px',
                  borderRadius: '16px',
                  border: pack.popular ? '2px solid #667eea' : '1px solid #d1d5db',
                  background: pack.popular 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)' 
                    : 'rgba(255, 255, 255, 0.8)',
                  position: 'relative',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  boxShadow: pack.popular 
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
                    padding: '2px 8px',
                    borderRadius: '8px'
                  }}>
                    POPULAIRE
                  </div>
                )}
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '800', 
                  color: pack.popular ? '#667eea' : '#1f2937',
                  marginBottom: '4px'
                }}>
                  {pack.amount}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  crédits
                </div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: pack.popular ? '#667eea' : '#1f2937',
                  background: pack.popular 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {pack.price}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Historique des CV */}
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📄 Mes CV générés
          </h3>
          
          {generatedCVs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Aucun CV généré pour le moment
            </div>
          ) : (
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {generatedCVs.slice(0, 5).map((cv) => (
                <div
                  key={cv.id}
                  style={{
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    {cv.originalFileName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Score ATS: {cv.atsScore}% • {new Date(cv.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
