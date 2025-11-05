import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

export const useRealtimeCredits = (userId: string | null) => {
  const { updateCredits } = useAuthStore();

  useEffect(() => {
    if (!userId) {
      return;
    }

    console.log('🔄 Démarrage écoute temps réel pour user:', userId);
    
    const userRef = doc(db, 'users', userId);
    
    // ✅ Écoute en temps réel
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        const newCredits = userData.credits || 0;
        console.log('🔄 Crédits mis à jour en temps réel depuis Firestore:', newCredits);
        
        // Mettre à jour le store Zustand automatiquement
        updateCredits(newCredits);
      } else {
        console.log('❌ Utilisateur non trouvé dans Firestore');
        updateCredits(0);
      }
    }, (error) => {
      console.error('❌ Erreur écoute Firestore:', error);
    });

    // ✅ Nettoyage quand le composant se démonte
    return () => {
      console.log('🔄 Arrêt écoute temps réel');
      unsubscribe();
    };
  }, [userId, updateCredits]);
};

