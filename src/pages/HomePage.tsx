import React, { useRef, useState, useEffect } from 'react';
import { useCVGenerationStore } from '../store/cvGenerationStore';
import { useAuthStore } from '../store/authStore';
import { PDFGenerator } from '../services/pdfGenerator';
import { CVDisplay } from '../components/CV/CVDisplay';
import { AuthModal } from '../components/Auth/AuthModal';
import { UserProfile } from '../components/User/UserProfile';
import { PaymentModal } from '../components/Payment/PaymentModal';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageSelector } from '../components/LanguageSelector';

export const HomePage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileRecommendation, setShowMobileRecommendation] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showDownloadImprovements, setShowDownloadImprovements] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  
  // Hook de traduction
  const { t, language, isEnglish } = useTranslation();
  
  // Hook pour gérer le redimensionnement
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hook pour gérer le retour de paiement Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const credits = urlParams.get('credits');

    if (paymentStatus === 'success' && credits) {
      // Paiement réussi
      const successMessage = isEnglish 
        ? `🎉 Payment successful!\n✅ ${credits} credits added to your account!`
        : `🎉 Paiement réussi !\n✅ ${credits} crédits ajoutés à votre compte !`;
      alert(successMessage);
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Recharger les crédits utilisateur (si connecté)
      // updateCredits(parseInt(credits));
    } else if (paymentStatus === 'cancelled') {
      // Paiement annulé
      const cancelMessage = isEnglish ? '❌ Payment cancelled' : '❌ Paiement annulé';
      alert(cancelMessage);
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Afficher le popup de recommandation mobile au chargement
  useEffect(() => {
    const hasSeenMobileRecommendation = localStorage.getItem('hasSeenMobileRecommendation');
    if (windowWidth <= 768 && !hasSeenMobileRecommendation) {
      setTimeout(() => {
        setShowMobileRecommendation(true);
      }, 1000); // Attendre 1 seconde après le chargement
    }
  }, [windowWidth]);

  const handleCloseMobileRecommendation = () => {
    setShowMobileRecommendation(false);
    localStorage.setItem('hasSeenMobileRecommendation', 'true');
  };

  
  const {
    uploadedFile,
    cvText,
    jobDescription,
    isExtracting,
    isGenerating,
    generatedCV,
    atsScore,
    improvements,
    progress,
    progressMessage,
    setUploadedFile,
    setJobDescription,
    extractCVText,
    generateOptimizedCV,
    updateGeneratedCV
  } = useCVGenerationStore();

  const {
    user,
    isAuthenticated,
    validateToken,
    consumeCredits,
    logout
  } = useAuthStore();

  // Initialiser l'authentification au chargement
  useEffect(() => {
    validateToken();
  }, []);

  // Fermer les menus quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (showUserMenu && !target.closest('[data-user-menu]')) {
        setShowUserMenu(false);
      }
      
      if (showMobileMenu && !target.closest('[data-mobile-menu]')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showMobileMenu]);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Sauvegarder le CV généré (temporairement désactivé)
  useEffect(() => {
    if (generatedCV && isAuthenticated && user) {
      console.log('CV généré - sauvegarde temporairement désactivée');
      // saveGeneratedCV({
      //   originalFileName: uploadedFile?.name || 'cv.txt',
      //   jobDescription,
      //   optimizedCV: generatedCV,
      //   atsScore,
      //   isDownloaded: false
      // });
    }
  }, [generatedCV, isAuthenticated, user]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🚀 handleFileUpload appelé');
    if (!isAuthenticated) {
      console.log('❌ Utilisateur non authentifié');
      setShowAuthModal(true);
      return;
    }
    const file = event.target.files?.[0];
    console.log('📁 Fichier reçu:', file);
    if (file) {
      console.log('📁 Fichier sélectionné:', file.name, file.type, file.size);
      setUploadedFile(file);
      console.log('✅ Fichier défini dans le state');
      // Déclencher l'extraction automatiquement
      console.log('🔄 Déclenchement de l\'extraction...');
      try {
        await extractCVText();
        console.log('✅ Extraction terminée');
      } catch (error) {
        console.error('❌ Erreur lors de l\'extraction:', error);
      }
    } else {
      console.log('❌ Aucun fichier sélectionné');
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    const file = event.dataTransfer.files[0];
    if (file) {
      console.log('📁 Fichier déposé:', file.name, file.type, file.size);
      setUploadedFile(file);
      // Déclencher l'extraction automatiquement
      console.log('🔄 Déclenchement de l\'extraction...');
      await extractCVText();
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleGenerate = async () => {
    // Pour le moment, permettre la génération sans authentification
    // TODO: Réactiver l'authentification plus tard
    
    // Vérifier les crédits seulement si l'utilisateur est authentifié
    if (isAuthenticated && user && user.credits < 1) {
      alert('Vous n\'avez plus de crédits. Veuillez en acheter pour continuer.');
      setShowUserProfile(true);
      return;
    }

    console.log('Génération démarrée...');
    console.log('Fichier uploadé:', uploadedFile);
    console.log('Texte CV:', cvText);
    console.log('Description job:', jobDescription);
    
    // Vérifications supplémentaires
    if (!cvText || cvText.trim().length === 0) {
      alert('Aucun texte de CV disponible. Veuillez d\'abord uploader un CV.');
      return;
    }
    
    if (!jobDescription || jobDescription.trim().length === 0) {
      alert('Veuillez saisir une description de poste.');
      return;
    }

    try {
      // D'abord extraire le texte du CV si nécessaire
      if (uploadedFile && !cvText) {
        console.log('Extraction du texte du CV...');
        await extractCVText();
        // Attendre un peu pour que le state se mette à jour
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Récupérer le texte extrait depuis le store
        const currentState = useCVGenerationStore.getState();
        if (!currentState.cvText) {
          alert('Erreur lors de l\'extraction du texte du CV');
          return;
        }
      }

      // Puis générer le CV optimisé
      if (jobDescription && cvText) {
        console.log('Génération du CV optimisé...');
        await generateOptimizedCV();
        
        // Consommer un crédit après génération réussie
        if (user && isAuthenticated) {
          try {
            await consumeCredits(1);
          } catch (error) {
            console.warn('Impossible de consommer des crédits, génération gratuite:', error);
          }
        }
      } else {
        alert('Veuillez saisir une description de poste');
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      alert('Erreur lors de la génération du CV');
    }
  };

  const handleDownloadPDF = async () => {
    // Le bouton peut fonctionner avec le CV brut ou le CV généré
    if (!uploadedFile || !cvText) return;
    
    console.log('🚀 handleDownloadPDF appelé');
    
    // Consommer 1 crédit IMMÉDIATEMENT au clic
    if (isAuthenticated && user) {
      try {
        console.log('💰 Consommation immédiate - Crédits avant:', user.credits);
        await consumeCredits(1);
        console.log('✅ Crédit consommé immédiatement');
        
        // Attendre un peu pour que le store se mette à jour
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('❌ Erreur lors de la consommation du crédit:', error);
        alert('Erreur lors de la consommation du crédit. Veuillez réessayer.');
        return; // Arrêter le processus si la consommation échoue
      }
    }
    
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadMessage('Analyse de votre CV...');
    setShowDownloadImprovements(false);
    
    try {
      // Messages de progression comme pour la génération
      const messages = [
        { progress: 10, message: 'Analyse de votre CV...' },
        { progress: 25, message: 'Formatage du document...' },
        { progress: 45, message: 'Génération du contenu...' },
        { progress: 65, message: 'Optimisation du PDF...' },
        { progress: 85, message: 'Finalisation...' }
      ];
      
      let messageIndex = 0;
      
      // Simulation de progression qui monte à 90%
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          const nextProgress = prev + 10;
          
          // Mettre à jour le message à chaque étape
          if (messageIndex < messages.length && nextProgress >= messages[messageIndex].progress) {
            setDownloadMessage(messages[messageIndex].message);
            messageIndex++;
          }
          
          console.log('📊 Progression:', nextProgress);
          if (nextProgress >= 90) {
            clearInterval(progressInterval);
            console.log('📊 Progression arrêtée à 90%');
            return 90;
          }
          return nextProgress;
        });
      }, 200);
      
      // Attendre un peu à 90% pour simuler la génération PDF
      setTimeout(async () => {
        try {
          console.log('🎯 Génération PDF démarrée');
          setDownloadMessage('Génération du PDF final...');
          
          // Générer le nom de fichier basé sur le fichier original
          const originalName = uploadedFile.name;
          const nameWithoutExt = originalName.replace(/\.[^/.]+$/, ""); // Enlever l'extension
          
          // Utiliser un compteur basé sur le localStorage pour chaque nom de fichier
          const storageKey = `cv_counter_${nameWithoutExt}`;
          const currentCounter = parseInt(localStorage.getItem(storageKey) || '0') + 1;
          localStorage.setItem(storageKey, currentCounter.toString());
          
          // Générer le nom de fichier avec le compteur - TOUJOURS en PDF
          const filename = `${nameWithoutExt}_${currentCounter}.pdf`;
          
          // Utiliser le CV généré s'il existe, sinon le CV brut
          const cvContent = generatedCV || cvText;
          
          console.log(`Téléchargement du CV: ${filename}`);
          await PDFGenerator.generateCVPDF(cvContent, jobDescription, filename);
          console.log('✅ PDF généré avec succès');
          
          // Finaliser la progression
          setDownloadProgress(100);
          
          // Réinitialiser après un délai
          setTimeout(() => {
            setIsDownloading(false);
            setDownloadProgress(0);
            setDownloadMessage('');
            setShowDownloadImprovements(true);
            console.log('✅ Download completed');
          }, 800);
          
        } catch (error) {
          console.error('Erreur lors de la génération du PDF:', error);
          alert('Erreur lors du téléchargement du PDF');
          setIsDownloading(false);
          setDownloadProgress(0);
        }
      }, 1000); // Attendre 1 seconde à 90%
      
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du PDF');
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Fonction pour calculer le score ATS initial (améliorée)
  const calculateInitialATSScore = (cvText: string, jobDescription: string): number => {
    if (!cvText || !jobDescription) return 0;
    
    // Extraire les mots-clés de la description du poste
    const jobKeywords = extractKeywords(jobDescription) || [];
    const cvKeywords = extractKeywords(cvText) || [];
    
    // Vérifier que les mots-clés sont valides
    if (!jobKeywords || jobKeywords.length === 0) return 0;
    if (!cvKeywords || cvKeywords.length === 0) return 0;
    
    // Calculer le pourcentage de correspondance avec pondération
    let matchScore = 0;
    let totalWeight = 0;
    
    jobKeywords.forEach((keyword, index) => {
      const weight = Math.max(1, jobKeywords.length - index); // Plus de poids aux premiers mots-clés
      totalWeight += weight;
      
      const isMatch = cvKeywords.some(cvKeyword => 
        cvKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(cvKeyword.toLowerCase())
      );
      
      if (isMatch) {
        matchScore += weight;
      }
    });
    
    const matchPercentage = totalWeight > 0 ? (matchScore / totalWeight) * 100 : 0;
    
    // Calculer des bonus/malus basés sur la structure du CV
    let structureScore = 0;
    
    // Bonus pour les sections essentielles (plus généreux)
    if (cvText.toLowerCase().includes('professional summary') || cvText.toLowerCase().includes('résumé')) structureScore += 15;
    if (cvText.toLowerCase().includes('experience') || cvText.toLowerCase().includes('expérience')) structureScore += 20;
    if (cvText.toLowerCase().includes('education') || cvText.toLowerCase().includes('formation')) structureScore += 15;
    if (cvText.toLowerCase().includes('skills') || cvText.toLowerCase().includes('compétences')) structureScore += 15;
    
    // Bonus pour les informations de contact
    if (cvText.includes('@')) structureScore += 8; // Email
    if (cvText.match(/\d{10,}/)) structureScore += 8; // Téléphone
    if (cvText.toLowerCase().includes('linkedin')) structureScore += 8;
    
    // Bonus pour les quantifications (chiffres, pourcentages)
    const quantifications = cvText.match(/\d+%|\d+\+|\d+[km]?€|\d+\s*(ans?|années?|mois)/gi);
    if (quantifications) {
      structureScore += Math.min(15, quantifications.length * 2);
    }
    
    // Malus pour les éléments négatifs (moins sévère)
    if (cvText && cvText.length < 500) structureScore -= 10; // CV trop court
    if (cvText && cvText.length > 3000) structureScore -= 5; // CV trop long
    
    // Calculer le score final avec une formule plus généreuse
    const keywordScore = Math.min(100, matchPercentage * 1.1); // Boost pour les mots-clés
    const structureBonus = Math.min(50, structureScore); // Bonus structure limité à 50
    const finalScore = Math.min(100, Math.max(0, keywordScore * 0.6 + structureBonus * 0.4));
    
    return Math.round(finalScore);
  };

  // Fonction pour extraire les mots-clés (simplifiée)
  const extractKeywords = (text: string): string[] => {
    if (!text || typeof text !== 'string') return [];
    
    const cleanText = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const stopWords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were',
      'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
      'notre', 'nos', 'votre', 'vos', 'leur', 'leurs', 'ce', 'cette', 'ces', 'cet', 'que', 'qui', 'quoi', 'où', 'quand', 'comment', 'pourquoi'
    ]);
    
    const words = cleanText.split(' ')
      .filter(word => word.length >= 3 && !stopWords.has(word));
    
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'visible' }}>
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

      {/* Barre de navigation responsive */}
      <nav className="glass-card fade-in" style={{
        margin: '12px',
        padding: '16px 24px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(30px)',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: '12px',
        zIndex: 100,
        overflow: 'visible'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo CVbien */}
          <div className="slide-in-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '700',
              color: 'white',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
            }}>
              CV
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: windowWidth <= 768 ? '20px' : '24px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                letterSpacing: '-0.5px',
                display: windowWidth <= 480 ? 'none' : 'block'
              }}>
                CVbien
              </h1>
              <div style={{
                fontSize: '10px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 8px rgba(79, 172, 254, 0.3)'
              }}>
                BETA 1.1
              </div>
            </div>
          </div>

          {/* Version Desktop - Éléments complets */}
          <div className="slide-in-right" style={{ 
            display: windowWidth <= 768 ? 'none' : 'flex', 
            alignItems: 'center', 
            gap: '16px' 
          }}>
            {/* Sélecteur de langue - Desktop seulement */}
            <LanguageSelector />

            {/* Bouton d'aide */}
            <button
              onClick={() => setShowHelpPopup(true)}
              className="glass-card zoom-hover"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                transition: 'all 0.3s ease'
              }}
            >
              ?
            </button>


            {isAuthenticated && user ? (
              <>
                {/* Crédits */}
                <div className="glass-card" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>{t.header.credits.toUpperCase()} :</span>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>{user.credits}</span>
                </div>

                {/* Bouton ajouter crédits */}
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="btn-primary zoom-hover" 
                  style={{ 
                    fontSize: '14px', 
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: '800' }}>+</span>
                  <span>{t.header.credits.toUpperCase()}</span>
                </button>

                {/* Compte connecté avec menu déroulant */}
                <div style={{ position: 'relative', overflow: 'visible' }} data-user-menu>
                  <div 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="glass-card zoom-hover" 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      minWidth: '120px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        animation: 'pulse 2s infinite'
                      }} />
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>{isEnglish ? 'Connected' : 'Connecté'}</span>
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-primary)', 
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {user.email}
                    </span>
                  </div>

                  {/* Menu déroulant */}
                  {showUserMenu && (
                    <div 
                      className="glass-card fade-in" 
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: '0',
                        marginTop: '8px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '16px',
                        padding: '8px 0',
                        minWidth: '160px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        zIndex: 10000
                      }}
                    >
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'transparent',
                          border: 'none',
                          color: '#ff6b6b',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#ff6b6b'
                        }} />
                        <span>{t.userMenu.logout}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Statut déconnecté */
              <div className="glass-card" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ff6b6b'
                }} />
                <span style={{ 
                  fontSize: '14px', 
                  color: 'var(--text-secondary)', 
                  fontWeight: '500' 
                }}>
                  {t.header.disconnected}
                </span>
              </div>
            )}
          </div>

          {/* Version Mobile - Menu Hamburger */}
          <div data-mobile-menu style={{ 
            display: windowWidth <= 768 ? 'flex' : 'none', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            {/* Crédits compacts pour mobile */}
            {isAuthenticated && user && (
              <div className="glass-card" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{user.credits}</span>
              </div>
            )}

            {/* Bouton Menu Hamburger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="glass-card zoom-hover"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                gap: '3px',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '18px',
                height: '2px',
                background: 'var(--text-primary)',
                borderRadius: '1px',
                transition: 'all 0.3s ease',
                transform: showMobileMenu ? 'rotate(45deg) translateY(5px)' : 'none'
              }} />
              <div style={{
                width: '18px',
                height: '2px',
                background: 'var(--text-primary)',
                borderRadius: '1px',
                transition: 'all 0.3s ease',
                opacity: showMobileMenu ? 0 : 1
              }} />
              <div style={{
                width: '18px',
                height: '2px',
                background: 'var(--text-primary)',
                borderRadius: '1px',
                transition: 'all 0.3s ease',
                transform: showMobileMenu ? 'rotate(-45deg) translateY(-5px)' : 'none'
              }} />
            </button>
          </div>
        </div>

        {/* Menu Mobile Popup */}
        {showMobileMenu && (
          <div 
            data-mobile-menu
            className="glass-card fade-in" 
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              marginTop: '8px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              zIndex: 10000
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Bouton d'aide */}
              <button
                onClick={() => {
                  setShowHelpPopup(true);
                  setShowMobileMenu(false);
                }}
                className="glass-card zoom-hover"
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '16px' }}>?</span>
                <span>{t.help.title}</span>
              </button>

              {/* Sélecteur de langue - Mobile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontSize: '12px', 
                  color: 'var(--text-secondary)', 
                  fontWeight: '500',
                  minWidth: '60px'
                }}>
                  {t.mobileMenu.language}:
                </span>
                <LanguageSelector compact={true} style={{ flex: 1 }} />
              </div>

              {isAuthenticated && user ? (
                <>
                  {/* Bouton ajouter crédits */}
                  <button 
                    onClick={() => {
                      setShowPaymentModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="btn-primary zoom-hover" 
                    style={{ 
                      fontSize: '14px', 
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '18px', fontWeight: '800' }}>+</span>
                    <span>{t.mobileMenu.addCredits.toUpperCase()}</span>
                  </button>

                  {/* Info utilisateur */}
                  <div className="glass-card" style={{
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        animation: 'pulse 2s infinite'
                      }} />
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>{isEnglish ? 'Connected' : 'Connecté'}</span>
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-primary)', 
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {user.email}
                    </span>
                  </div>

                  {/* Bouton déconnexion */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 107, 107, 0.1)',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                      borderRadius: '12px',
                      color: '#ff6b6b',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#ff6b6b'
                    }} />
                    <span>{t.userMenu.logout}</span>
                  </button>
                </>
              ) : (
                /* Bouton de connexion mobile */
                <div className="glass-card" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ff6b6b'
                  }} />
                  <span style={{ 
                    fontSize: '14px', 
                    color: 'var(--text-secondary)', 
                    fontWeight: '500' 
                  }}>
                    {t.header.disconnected}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Hero Section - SEO Optimized (Hidden for aesthetics) */}
      <div className="hero-section" style={{ 
        position: 'absolute',
        left: '-9999px',
        visibility: 'hidden'
      }}>
        <h1>🚀 CVbien - Générateur de CV Gratuit avec Intelligence Artificielle</h1>
        <h2>Créez un CV Professionnel Optimisé ATS en Quelques Clics</h2>
        <p>
          <strong>CVbien</strong> utilise l'intelligence artificielle pour analyser votre CV, 
          calculer votre <strong>score ATS</strong>, et générer un <strong>CV optimisé</strong> qui 
          maximise vos chances d'être recruté. Téléchargez votre <strong>CV professionnel au format PDF</strong> 
          en quelques minutes seulement.
        </p>
        <div>
          <span>✅ 100% Gratuit</span>
          <span>🤖 IA GPT-4</span>
          <span>📊 Score ATS</span>
          <span>📄 Export PDF</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ padding: '12px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Top Row - Responsive layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: windowWidth <= 768 ? '1fr' : '1fr 1fr',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* Left Frame - CV Upload */}
          <div className="card glass-card slide-in-left zoom-hover" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0
                  }}>
                    {t.main.uploadTitle.toUpperCase()}
                  </h3>
                </div>
            
            <div
              className="zoom-hover"
              style={{
                border: '2px dashed rgba(102, 126, 234, 0.3)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                background: uploadedFile 
                  ? 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                borderColor: uploadedFile ? 'rgba(79, 172, 254, 0.6)' : 'rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => {
                if (!isAuthenticated) {
                  setShowAuthModal(true);
                  return;
                }
                fileInputRef.current?.click();
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '12px',
                filter: 'drop-shadow(0 4px 20px rgba(102, 126, 234, 0.3))'
              }}>
                📄
              </div>
                  <p style={{ 
                    color: 'var(--text-primary)', 
                    margin: '0 0 6px 0', 
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {uploadedFile ? uploadedFile.name : t.main.dragDrop}
                  </p>
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    margin: 0, 
                    fontSize: '12px',
                    opacity: 0.8
                  }}>
                    {t.main.uploadSubtitle}
                  </p>
              {isExtracting && (
                <div style={{ 
                  marginTop: '12px', 
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(79, 172, 254, 0.3)',
                      borderTop: '2px solid #4facfe',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                        Extraction du texte...
                  </div>
                </div>
              )}
              
              {/* Bouton d'extraction manuelle si fichier uploadé mais pas de texte */}
              {uploadedFile && !cvText && !isExtracting && (
                <div style={{ marginTop: '12px' }}>
                  <button
                    onClick={async () => {
                      console.log('🔄 Extraction manuelle déclenchée');
                      await extractCVText();
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🔄 Extraire le texte du CV
                  </button>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

              {/* Right Frame - Job Description */}
              <div className="card glass-card slide-in-right zoom-hover" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    {t.main.jobDescriptionTitle.toUpperCase()}
                  </h3>
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    fontStyle: 'italic',
                    opacity: 0.8
                  }}>
                    💡 {isEnglish ? 'The generated resume will be in the language of this description (for now: French only, soon: English and others)' : 'Le CV généré sera dans la langue de cette description (pour l\'instant uniquement français, bientôt anglais et autres)'}
                  </p>
                </div>
                
                <div style={{ position: 'relative' }}>
                  <textarea
                    className="input-field"
                    rows={7}
                    value={jobDescription}
                    onChange={(e) => {
                      if (!isAuthenticated) {
                        setShowAuthModal(true);
                        return;
                      }
                      setJobDescription(e.target.value);
                    }}
                    style={{ 
                      resize: 'none', 
                      minHeight: '130px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '16px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      width: '100%',
                      padding: '24px'
                    }}
                  />
                  {!jobDescription && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      textAlign: 'center',
                      zIndex: 1
                    }}>
                      <div style={{ 
                        fontSize: '48px', 
                        marginBottom: '12px',
                        filter: 'drop-shadow(0 4px 20px rgba(102, 126, 234, 0.3))'
                      }}>
                        📋
                      </div>
                      <p style={{ 
                        color: 'var(--text-primary)', 
                        margin: '0 0 6px 0', 
                        fontSize: '14px',
                        fontWeight: '600',
                        fontFamily: 'inherit'
                      }}>
                        {t.main.jobDescriptionPlaceholder}
                      </p>
                      <p style={{ 
                        color: 'var(--text-secondary)', 
                        margin: 0, 
                        fontSize: '12px',
                        opacity: 0.8,
                        fontFamily: 'inherit'
                      }}>
                        Cliquez pour saisir votre texte
                      </p>
                    </div>
                  )}
                </div>
              </div>
        </div>

        {/* Generate Button Section - Hidden */}
        <div className="fade-in" style={{ display: 'none', textAlign: 'center', marginBottom: '20px' }}>
          <div className="glass-card" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '20px',
            margin: '0 auto',
            maxWidth: '500px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <button
              className="btn-primary zoom-hover"
              onClick={() => {
                if (!isAuthenticated) {
                  setShowAuthModal(true);
                  return;
                }
                handleGenerate();
              }}
              disabled={!uploadedFile || !jobDescription || isGenerating}
              style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                opacity: (!uploadedFile || !jobDescription || isGenerating) ? 0.5 : 1,
                cursor: (!uploadedFile || !jobDescription || isGenerating) ? 'not-allowed' : 'pointer',
                borderRadius: '16px',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isGenerating ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  {t.common.loading.toUpperCase()}
                </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span>{t.main.generateButton.toUpperCase()}</span>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        fontSize: '11px', 
                        fontWeight: '500',
                        color: 'rgba(255, 255, 255, 0.85)',
                        background: 'rgba(255, 255, 255, 0.15)',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        <span style={{ fontSize: '10px' }}>💎</span>
                        <span>{t.main.creditInfo}</span>
                      </div>
                    </div>
                  )}
            </button>

            {/* Progress Bar */}
            {(isGenerating || isExtracting) && (
              <div className="slide-up" style={{ 
                marginTop: '16px',
                maxWidth: '400px',
                margin: '16px auto 0 auto'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ 
                    fontSize: '14px', 
                    color: 'var(--text-primary)', 
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {progressMessage}
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    color: 'var(--text-secondary)',
                    fontWeight: '600'
                  }}>
                    {progress}%
                  </span>
                </div>
                <div className="progress-bar" style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div className="progress-fill" style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    borderRadius: '16px',
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }} />
                </div>
              </div>
            )}

            {/* Status Indicators */}
            <div style={{ 
              marginTop: '16px', 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: uploadedFile ? '#4facfe' : '#e5e5ea'
                }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      CV: {uploadedFile ? '✓' : '✗'}
                    </span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: jobDescription ? '#f093fb' : '#e5e5ea'
                }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Job: {jobDescription ? '✓' : '✗'}
                    </span>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button - Always visible */}
        <div className="slide-up fade-in" style={{ textAlign: 'center', marginTop: '20px', marginBottom: '30px' }}>
          <div className="glass-card" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '20px',
            margin: '0 auto',
            maxWidth: 'min(500px, calc(100vw - 24px))',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <button
              className="btn-primary zoom-hover"
              onClick={() => {
                if (!isAuthenticated) {
                  setShowAuthModal(true);
                  return;
                }
                handleDownloadPDF();
              }}
              disabled={!uploadedFile || !cvText || !jobDescription}
              style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                opacity: (!uploadedFile || !cvText || !jobDescription) ? 0.5 : 1,
                cursor: (!uploadedFile || !cvText || !jobDescription) ? 'not-allowed' : 'pointer',
                borderRadius: '16px',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                position: 'relative',
                overflow: 'hidden',
                width: '100%'
              }}
            >
              {isDownloading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  {t.common.loading.toUpperCase()}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span>{isEnglish ? 'GET YOUR CV' : 'OBTENEZ VOTRE CV'}</span>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    fontSize: '11px', 
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.85)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <span style={{ fontSize: '10px' }}>💎</span>
                    <span>{t.main.creditInfo}</span>
                  </div>
                </div>
              )}
            </button>

                {/* Progress Bar */}
                {isDownloading && (
                  <div className="slide-up" style={{ 
                    marginTop: '16px',
                    maxWidth: '400px',
                    margin: '16px auto 0 auto'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ 
                        fontSize: '14px', 
                        color: 'var(--text-primary)', 
                        fontWeight: '600',
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {downloadMessage || progressMessage || 'Génération du PDF...'}
                      </span>
                      <span style={{ 
                        fontSize: '14px', 
                        color: 'var(--text-secondary)',
                        fontWeight: '600'
                      }}>
                        {downloadProgress || progress}%
                      </span>
                    </div>
                    <div className="progress-bar" style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <div className="progress-fill" style={{
                        width: `${downloadProgress || progress}%`,
                        height: '100%',
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        borderRadius: '16px',
                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden'
                      }} />
                    </div>
                  </div>
                )}
            {/* Status Indicators */}
            <div style={{ 
              marginTop: '12px', 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: uploadedFile ? '#4facfe' : '#e5e5ea'
                }} />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>CV: {uploadedFile ? '✓' : '✗'}</span>
              </div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: jobDescription ? '#f093fb' : '#e5e5ea'
                }} />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Job: {jobDescription ? '✓' : '✗'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Frame - CV Preview */}
        <div className="card glass-card slide-up zoom-hover" style={{ display: 'none',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0
                  }}>
                    APERÇU DU CV
                  </h3>
                </div>
            {atsScore > 0 && (
              <div className="glass-card" style={{
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{t.main.atsScore}</div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {atsScore}%
                </div>
              </div>
            )}
          </div>

          {/* ATS Score Display */}
          {atsScore > 0 && (
            <div className="glass-card slide-up" style={{ display: 'none',
              gap: '16px',
              marginBottom: '20px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '500' }}>SCORE ATS INITIAL</div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {cvText && jobDescription ? calculateInitialATSScore(cvText, jobDescription) : 0}%
                </div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '500' }}>SCORE ATS OPTIMISÉ</div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  {atsScore}% ↑
                </div>
              </div>
            </div>
          )}

          {/* CV Content Preview */}
          <div className="glass-card" style={{ display: 'none', 
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            minHeight: '350px'
          }}>
            {generatedCV ? (
              <div style={{ display: 'flex', gap: '16px', height: '100%' }}>
                {/* CV Display */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: 'var(--text-secondary)', 
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                    }} />
                    APERÇU DU CV
                  </div>
                  <div style={{ 
                    flex: 1,
                    overflow: 'auto',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '12px',
                    minHeight: '400px'
                  }}>
                    <CVDisplay cvText={generatedCV} />
                  </div>
                </div>
                
                {/* Edit Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: 'var(--text-secondary)', 
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    }} />
                    ÉDITER LE CV
                  </div>
                  <textarea
                    value={generatedCV}
                    onChange={(e) => {
                      if (!isAuthenticated) {
                        setShowAuthModal(true);
                        return;
                      }
                      updateGeneratedCV(e.target.value);
                    }}
                    style={{
                      flex: 1,
                      width: '100%',
                      minHeight: '400px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      outline: 'none',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      lineHeight: '1.3',
                      resize: 'vertical',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="Modifiez votre CV ici..."
                  />
                </div>
              </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#000',
                    padding: '40px 20px'
                  }}>
                    <div style={{ 
                      fontSize: '60px', 
                      marginBottom: '16px',
                      filter: 'drop-shadow(0 4px 20px rgba(102, 126, 234, 0.3))'
                    }}>⚡</div>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      margin: '0 0 8px 0',
                      color: '#000'
                    }}>
                      En attente de génération
                    </h4>
                    <p style={{ fontSize: '14px', opacity: 0.8, margin: 0, color: '#000' }}>
                      Uploadez votre CV et saisissez la description du poste pour commencer
                    </p>
                  </div>
                )}
          </div>

          {/* Improvements List */}
          {improvements.length > 0 && (
            <div className="slide-up" style={{ marginTop: '16px' }}>
              <div className="glass-card" style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                  }} />
                  {t.main.improvements.toUpperCase()} :
                </h4>
                <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '16px', margin: '0 0 12px 0' }}>
                  {(improvements || []).map((improvement, index) => (
                    <li key={index} style={{ marginBottom: '6px', lineHeight: '1.4' }}>{improvement}</li>
                  ))}
                </ul>
                
                <div style={{
                  background: 'rgba(249, 115, 22, 0.1)',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(249, 115, 22, 0.2)',
                  marginTop: '8px'
                }}>
                  <p style={{
                    fontSize: '11px',
                    margin: 0,
                    color: '#ea580c',
                    fontWeight: '500',
                    textAlign: 'center'
                  }}>
                    {t.main.advice}
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Download Improvements Section */}
      {showDownloadImprovements && uploadedFile && jobDescription && (
        <div className="fade-in" style={{ marginTop: '24px' }}>
          <div className="glass-card" style={{
            background: 'rgba(79, 172, 254, 0.1)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(79, 172, 254, 0.2)',
            borderRadius: '20px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 16px 0',
              textAlign: 'center'
            }}>
              {isEnglish ? 'IMPROVEMENTS MADE' : 'AMÉLIORATIONS APPORTÉES'}
            </h2>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              lineHeight: '1.6',
              margin: '0 0 20px 0',
              fontWeight: '500',
              fontStyle: 'italic'
            }}>
              {isEnglish
                ? 'The goal of this new CV is not to be the most beautiful/aesthetic possible, but to be OPTIMIZED to the maximum in a professional and clear structure.'
                : 'L\'objectif de ce nouveau CV n\'est pas d\'être le plus beau/esthétique possible, mais d\'être OPTIMISÉ au maximum dans une structure professionnelle et claire.'}
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>💎</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
                  {isEnglish ? 'CV optimized with a professional structure' : 'CV optimisé avec une structure professionnelle'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>💎</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
                  {isEnglish ? 'ATS keywords integrated' : 'Mots-clés ATS intégrés'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>💎</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
                  {isEnglish ? 'Content adapted to the target position' : 'Contenu adapté au poste recherché'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>💎</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
                  {isEnglish ? 'Professional style applied' : 'Style professionnel appliqué'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>💎</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
                  {isEnglish ? 'Irrelevant information removed' : 'Informations non pertinentes retirées'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>💎</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
                  {isEnglish ? 'ATS score boosted' : 'Score ATS boosté'}
                </span>
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              marginTop: '16px'
            }}>
              <p style={{
                fontSize: '12px',
                margin: 0,
                color: '#ea580c',
                fontWeight: '500',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                lineHeight: '1.6'
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
                <span>
                  {isEnglish 
                    ? 'Tip: The more numbers (%, €, years), links (LinkedIn, portfolio) and keywords from the offer, the higher the ATS score!'
                    : 'Conseil : Plus il y a de chiffres (%, €, années), de liens (LinkedIn, portfolio) et de mots-clés de l\'offre, plus le score ATS est élevé !'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

        {/* How It Works - Always visible */}
        <div className="fade-in" style={{ marginTop: '24px' }}>
          <div className="glass-card" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              {isEnglish ? 'HOW IT WORKS?' : 'COMMENT ÇA MARCHE ?'}
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '24px'
            }}>
              {/* Step 1 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}>
                  1
                </div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  {isEnglish ? 'Upload your CV' : 'Uploadez votre CV'}
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5'
                }}>
                  {isEnglish ? 'Upload your current CV in PDF format' : 'Uploadez votre CV actuel au format PDF'}
                </p>
              </div>

              {/* Step 2 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}>
                  2
                </div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  {isEnglish ? 'Paste job offer' : 'Collez l\'offre d\'emploi'}
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5'
                }}>
                  {isEnglish ? 'Copy and paste the job description you\'re applying for' : 'Copiez-collez la description de l\'offre d\'emploi'}
                </p>
              </div>

              {/* Step 3 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '12px auto',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}>
                  3
                </div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  {isEnglish ? 'Generate CV' : 'Générez le CV'}
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5'
                }}>
                  {isEnglish ? 'Click the button and our AI will optimize your CV' : 'Cliquez sur le bouton et notre IA optimisera votre CV'}
                </p>
              </div>
            </div>

            {/* Step 4 - Results */}
            <div style={{
              background: 'rgba(79, 172, 254, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(79, 172, 254, 0.2)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)'
                }}>
                  <span style={{ fontSize: '28px' }}>💎</span>
                </div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '12px'
                }}>
                  {isEnglish ? 'Get your optimized CV' : 'Obtenez votre CV optimisé'}
                </h3>
              </div>

              <p style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                lineHeight: '1.6',
                margin: '0'
              }}>
                {isEnglish 
                  ? 'In a few seconds, get your perfectly optimized CV with matched keywords, enhanced content, ATS compliance and professional formatting.'
                  : 'En quelques secondes, obtenez votre CV parfaitement optimisé avec des mots-clés adaptés, un contenu enrichi, une conformité ATS et une mise en page professionnelle.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section Avantages */}
        <div className="glass-card fade-in" style={{
          margin: windowWidth <= 768 ? '12px' : '24px 12px',
          padding: windowWidth <= 768 ? '32px 24px' : '48px 32px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          marginTop: '48px'
        }}>
          <h2 style={{
            fontSize: windowWidth <= 768 ? '20px' : '28px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            textAlign: 'center',
            margin: '0 0 40px 0'
          }}>
            {isEnglish ? 'WHY CHOOSE CVBIEN?' : 'POURQUOI CHOISIR CVBIEN ?'}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
            gap: windowWidth <= 768 ? '20px' : '32px'
          }}>
            {/* Carte 1 */}
            <div style={{
              padding: windowWidth <= 768 ? '24px' : '32px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              transition: 'all 0.3s ease',
              cursor: 'default',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{
                fontSize: windowWidth <= 768 ? '18px' : '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '12px'
              }}>
                {isEnglish ? 'Significantly more interviews' : 'Augmentation significative de vos entretiens'}
              </h3>
              <p style={{
                fontSize: windowWidth <= 768 ? '13px' : '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                margin: 0
              }}>
                {isEnglish 
                  ? 'ATS-optimized CVs get you noticed by recruiters and increase your chances of getting interviews.' 
                  : 'CV optimisé ATS pour décrocher plus d\'entretiens et augmenter vos chances de recrutement.'}
              </p>
            </div>

            {/* Carte 2 - Featured */}
            <div style={{
              padding: windowWidth <= 768 ? '24px' : '32px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '2px solid transparent',
              transition: 'all 0.3s ease',
              cursor: 'default',
              boxShadow: '0 8px 30px rgba(102, 126, 234, 0.25)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                inset: '-2px',
                borderRadius: '16px',
                padding: '2px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                zIndex: -1
              }}></div>
              <h3 style={{
                fontSize: windowWidth <= 768 ? '18px' : '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '12px'
              }}>
                {isEnglish ? 'ATS no longer a concern' : 'Les robots de recrutement ne nous concernent plus'}
              </h3>
              <p style={{
                fontSize: windowWidth <= 768 ? '13px' : '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                margin: 0
              }}>
                {isEnglish 
                  ? 'Your CV passes automated screening filters and ATS systems with flying colors.' 
                  : 'Votre CV passe les filtres de sélection automatisés et les systèmes ATS sans problème.'}
              </p>
            </div>

            {/* Carte 3 */}
            <div style={{
              padding: windowWidth <= 768 ? '24px' : '32px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              transition: 'all 0.3s ease',
              cursor: 'default',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{
                fontSize: windowWidth <= 768 ? '18px' : '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '12px'
              }}>
                {isEnglish ? 'Perfect CV in just 8 seconds' : 'Un CV parfaitement adapté en à peine 8 secondes'}
              </h3>
              <p style={{
                fontSize: windowWidth <= 768 ? '13px' : '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                margin: 0
              }}>
                {isEnglish 
                  ? 'Lightning-fast optimization without losing time. Get your perfect CV ready in seconds.' 
                  : 'Optimisation ultra-rapide sans perdre de temps. Obtenez votre CV parfait en quelques secondes.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section FAQ */}
        <div className="glass-card fade-in" style={{
          margin: windowWidth <= 768 ? '12px' : '24px 12px',
          padding: windowWidth <= 768 ? '32px 24px' : '48px 32px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          marginTop: '48px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            margin: '0 0 32px 0'
          }}>
            {isEnglish ? 'FREQUENTLY ASKED QUESTIONS' : 'QUESTIONS FRÉQUENTES'}
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {[
              {
                question: isEnglish ? 'Are my data kept confidential?' : 'Mes données restent-elles confidentielles ?',
                answer: isEnglish 
                  ? 'Yes, absolutely. All your CV data and job descriptions are processed securely and are not stored permanently. Your privacy is our priority.'
                  : 'Oui, absolument. Toutes vos données de CV et descriptions de poste sont traitées de manière sécurisée et ne sont pas stockées de manière permanente. Votre confidentialité est notre priorité.'
              },
              {
                question: isEnglish ? 'Can I customize the design?' : 'Je peux personnaliser le design ?',
                answer: isEnglish
                  ? 'No, the goal is speed and efficiency. We provide you with the most effective CV format that works best. We want users to ask as few questions as possible and lose as little time as possible.'
                  : 'Non, le but c\'est d\'être le plus rapide et efficace possible. Nous on donne le type de CV le plus efficace qui fonctionne le mieux. On veut que l\'utilisateur se pose le moins de questions possible et qu\'il perde le moins de temps possible.'
              },
              {
                question: isEnglish ? 'How many credits does it cost?' : 'Combien ça coûte en crédits ?',
                answer: isEnglish
                  ? 'Each CV generation costs 1 credit. You can purchase credits in our pricing section.'
                  : 'Chaque génération de CV coûte 1 crédit. Vous pouvez acheter des crédits dans notre section tarifs.'
              },
              {
                question: isEnglish ? 'What languages are supported?' : 'Quelles langues sont supportées ?',
                answer: isEnglish
                  ? 'Currently, French is fully supported. English and other languages are coming soon.'
                  : 'Pour l\'instant uniquement le français, bientôt l\'anglais et d\'autres langues.'
              },
              {
                question: isEnglish ? 'What format should my CV be in?' : 'Dans quel format dois-je envoyer mon CV ?',
                answer: isEnglish
                  ? 'Your CV must be in PDF format only for optimal text extraction.'
                  : 'Votre CV doit être au format PDF uniquement pour une extraction optimale du texte.'
              },
              {
                question: isEnglish ? 'How long does it take to generate my CV?' : 'Combien de temps pour générer mon CV ?',
                answer: isEnglish
                  ? 'The entire process takes less than 10 seconds from upload to download of your optimized CV.'
                  : 'Tout le processus prend moins de 10 secondes du téléchargement au téléchargement de votre CV optimisé.'
              }
            ].map((faq, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                <button
                  onClick={() => setOpenFAQIndex(openFAQIndex === index ? null : index)}
                  style={{
                    width: '100%',
                    padding: '20px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    margin: 0,
                    textAlign: 'left'
                  }}>
                    {faq.question}
                  </h3>
                  <span style={{
                    fontSize: '20px',
                    color: '#667eea',
                    transition: 'transform 0.3s ease',
                    transform: openFAQIndex === index ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                  </span>
                </button>
                {openFAQIndex === index && (
                  <div style={{
                    padding: '0 20px 20px 20px',
                    animation: 'slideDown 0.3s ease'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      
          {/* Footer */}
          <footer className="glass-card fade-in" style={{
            margin: '12px',
            padding: '16px 24px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              fontWeight: '500'
            }}>
              © 2025 CVbien.
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              fontWeight: '400',
              marginTop: '4px',
              opacity: 0.8
            }}>
              Made by{' '}
              <a 
                href="https://dagence.be" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: '#8B5CF6',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#A855F7';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8B5CF6';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Dagence
              </a>
            </div>
          </footer>

          {/* Popup d'aide */}
          {showHelpPopup && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              backdropFilter: 'blur(10px)'
            }} onClick={() => setShowHelpPopup(false)}>
              <div 
                className="glass-card fade-in"
                style={{
                  maxWidth: '500px',
                  width: '90%',
                  padding: '32px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Bouton fermer */}
                <button
                  onClick={() => setShowHelpPopup(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'var(--text-primary)',
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

                {/* Contenu du popup */}
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '0 0 20px 0',
                    textAlign: 'center'
                  }}>
                    🚀 CVbien
                  </h2>

                  <div style={{ color: '#2d3748', lineHeight: '1.6' }}>
                    <p style={{ fontSize: '16px', marginBottom: '16px', fontWeight: '500' }}>
                      <strong>{isEnglish ? 'Transform your resume in a few clicks!' : 'Transformez votre CV en quelques clics !'}</strong>
                    </p>

                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#1a365d',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        🎯 <span>{isEnglish ? 'Perfect Matching' : 'Matching Parfait'}</span>
                      </h3>
                      <p style={{ fontSize: '14px', margin: 0 }}>
                        {isEnglish 
                          ? 'Our AI analyzes the job offer and adapts your resume to perfectly match the position. Each experience and skill is strategically repositioned.'
                          : 'Notre IA analyse l\'offre d\'emploi et adapte votre CV pour qu\'il corresponde parfaitement au poste recherché. Chaque expérience et compétence est repositionnée stratégiquement.'
                        }
                      </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#1a365d',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        🤖 <span>Score ATS Élevé</span>
                      </h3>
                      <p style={{ fontSize: '14px', margin: 0 }}>
                        Optimisation pour les systèmes de recrutement automatisés (ATS). 
                        Mots-clés stratégiques, formatage professionnel, et structure optimale pour passer les filtres robots.
                      </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#1a365d',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        ✨ <span>Intelligence Adaptative</span>
                      </h3>
                      <p style={{ fontSize: '14px', margin: 0 }}>
                        Ajout intelligent des soft skills demandés, reformulation des compétences techniques, 
                        et connexion stratégique entre vos expériences et les exigences du poste.
                      </p>
                    </div>

                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      marginBottom: '16px'
                    }}>
                      <p style={{ 
                        fontSize: '14px', 
                        margin: 0, 
                        fontWeight: '500',
                        textAlign: 'center',
                        color: '#1a365d'
                      }}>
                        <strong>💡 Résultat :</strong> Un CV professionnel, optimisé ATS, qui maximise vos chances d'être recruté !
                      </p>
                    </div>

                    <div style={{ 
                      background: 'rgba(34, 197, 94, 0.1)',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <p style={{ 
                        fontSize: '12px', 
                        margin: 0, 
                        textAlign: 'center',
                        color: '#166534',
                        fontWeight: '500'
                      }}>
                        🔒 <strong>Confidentialité :</strong> Aucune donnée personnelle n'est conservée. 
                        Vos informations sont traitées en temps réel et supprimées immédiatement après génération.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modales */}
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => {
              console.log('Utilisateur connecté avec succès');
            }}
          />

          {showUserProfile && (
            <UserProfile onClose={() => setShowUserProfile(false)} />
          )}

          {showPaymentModal && (
            <PaymentModal onClose={() => setShowPaymentModal(false)} />
          )}

          {/* Popup de recommandation mobile */}
          {showMobileRecommendation && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              backdropFilter: 'blur(10px)',
              padding: '20px'
            }} onClick={handleCloseMobileRecommendation}>
              <div 
                className="glass-card fade-in"
                style={{
                  maxWidth: '400px',
                  width: '100%',
                  padding: '24px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  textAlign: 'center'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💻</div>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  color: '#1f2937'
                }}>
                  {t.mobile.title}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginBottom: '20px',
                  lineHeight: '1.5'
                }}>
                  {t.mobile.message}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={handleCloseMobileRecommendation}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {t.mobile.understand}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
