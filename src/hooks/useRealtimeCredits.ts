import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useRealtimeCredits = (userId: string | null) => {
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCredits(0);
      setIsLoading(false);
      return;
    }

    console.log('🔄 Démarrage écoute temps réel pour user:', userId);
    
    const userRef = doc(db, 'users', userId);
    
    // ✅ Écoute en temps réel
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        const newCredits = userData.credits || 0;
        console.log('🔄 Crédits mis à jour en temps réel:', newCredits);
        setCredits(newCredits);
        setIsLoading(false);
      } else {
        console.log('❌ Utilisateur non trouvé dans Firestore');
        setCredits(0);
        setIsLoading(false);
      }
    }, (error) => {
      console.error('❌ Erreur écoute Firestore:', error);
      setIsLoading(false);
    });

    // ✅ Nettoyage quand le composant se démonte
    return () => {
      console.log('🔄 Arrêt écoute temps réel');
      unsubscribe();
    };
  }, [userId]);

  return { credits, isLoading };
};
