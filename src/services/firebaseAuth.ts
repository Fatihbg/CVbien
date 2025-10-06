import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

class FirebaseAuthService {
  // Inscription
  async register(email: string, password: string, name: string): Promise<FirebaseUser> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Mettre à jour le displayName
      // Note: updateProfile n'est pas disponible sur l'objet User retourné par createUserWithEmailAndPassword
      // Le displayName sera géré par notre backend
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      };
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Connexion
  async login(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      };
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Écouter les changements d'état d'authentification
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Obtenir le token ID Firebase
  async getIdToken(): Promise<string | null> {
    const user = this.getCurrentUser();
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Gestion des erreurs Firebase
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/operation-not-allowed':
        return 'Opération non autorisée';
      case 'auth/weak-password':
        return 'Mot de passe trop faible';
      case 'auth/user-disabled':
        return 'Compte utilisateur désactivé';
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cette adresse email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard';
      default:
        return 'Erreur d\'authentification';
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();
