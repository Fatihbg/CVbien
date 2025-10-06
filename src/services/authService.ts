import type { User, LoginCredentials, RegisterCredentials, UserProfile, GeneratedCV } from '../types/user';
import { config } from '../config/environment';
import { firebaseAuthService } from './firebaseAuth';

class AuthService {
  private static token: string | null = localStorage.getItem('auth_token');
  private static user: User | null = null;
  private static API_BASE_URL = config.AUTH_API_URL;

  // Initialiser le token depuis le localStorage
  static initialize() {
    this.token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        console.error('Erreur parsing user from localStorage:', e);
        this.user = null;
      }
    }
  }

  // Vérifier si l'utilisateur est connecté
  static isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  // Obtenir l'utilisateur actuel
  static getCurrentUser(): User | null {
    return this.user;
  }

  // Obtenir le token
  static getToken(): string | null {
    return this.token;
  }

  // Connexion avec Firebase
  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('🔐 Tentative de connexion Firebase avec:', credentials.email);
      
      // Connexion Firebase
      const firebaseUser = await firebaseAuthService.login(credentials.email, credentials.password);
      if (!firebaseUser) {
        throw new Error('Erreur de connexion Firebase');
      }

      // Obtenir le token Firebase
      const firebaseToken = await firebaseAuthService.getIdToken();
      if (!firebaseToken) {
        throw new Error('Impossible d\'obtenir le token Firebase');
      }

      // Valider avec notre backend
      const response = await fetch(`${AuthService.API_BASE_URL}/api/auth/validate-firebase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: firebaseToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur de validation du token');
      }

      const data = await response.json();
      this.user = data.user;
      this.token = firebaseToken;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('✅ Connexion Firebase réussie:', this.user);
      return this.user;
    } catch (error) {
      console.error('Erreur de connexion Firebase:', error);
      throw error;
    }
  }

  // Inscription avec Firebase
  static async register(credentials: RegisterCredentials): Promise<User> {
    try {
      console.log('📝 Tentative d\'inscription Firebase avec:', credentials.email);
      
      // Inscription Firebase
      const firebaseUser = await firebaseAuthService.register(credentials.email, credentials.password, credentials.name);
      if (!firebaseUser) {
        throw new Error('Erreur d\'inscription Firebase');
      }

      // Obtenir le token Firebase
      const firebaseToken = await firebaseAuthService.getIdToken();
      if (!firebaseToken) {
        throw new Error('Impossible d\'obtenir le token Firebase');
      }

      // Valider avec notre backend
      const response = await fetch(`${AuthService.API_BASE_URL}/api/auth/validate-firebase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: firebaseToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur de validation du token');
      }

      const data = await response.json();
      this.user = data.user;
      this.token = firebaseToken;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('✅ Inscription Firebase réussie:', this.user);
      return this.user;
    } catch (error) {
      console.error('Erreur d\'inscription Firebase:', error);
      throw error;
    }
  }

  // Déconnexion
  static async logout(): Promise<void> {
    try {
      // Déconnexion Firebase
      await firebaseAuthService.logout();
      
      // Nettoyer l'état local
      this.token = null;
      this.user = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  }

  // Obtenir le profil utilisateur
  static async getUserProfile(): Promise<UserProfile> {
    if (!this.token) {
      throw new Error('Non authentifié');
    }

    try {
      // Pour l'utilisateur de test, retourner des données simulées
      if (this.user && this.user.id === 'real_test_user') {
        return {
          id: this.user.id,
          email: this.user.email,
          name: this.user.name,
          credits: this.user.credits,
          subscriptionType: this.user.subscriptionType,
          totalCVsGenerated: 0,
          lastCVGeneratedAt: null,
          createdAt: this.user.createdAt
        };
      }

      const response = await fetch(`${AuthService.API_BASE_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du profil');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur profil:', error);
      throw error;
    }
  }

  // Mettre à jour le profil
  static async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.token) {
      throw new Error('Non authentifié');
    }

    try {
      const response = await fetch(`${AuthService.API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      const updatedProfile = await response.json();
      this.user = { ...this.user, ...updatedProfile };
      return updatedProfile;
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      throw error;
    }
  }

  // Acheter des crédits
  static async buyCredits(amount: number, paymentMethod: string): Promise<{ credits: number; transactionId: string }> {
    if (!this.token) {
      throw new Error('Non authentifié');
    }

    try {
      console.log('🛒 Achat de crédits:', { amount, paymentMethod });
      
      const response = await fetch(`${AuthService.API_BASE_URL}/api/payments/test-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ amount }),
      });

      console.log('📡 Réponse backend:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur backend:', errorText);
        throw new Error('Erreur lors de l\'achat de crédits');
      }

      const data = await response.json();
      console.log('✅ Données reçues:', data);
      
      // Mettre à jour l'utilisateur local
      if (this.user) {
        this.user = { ...this.user, credits: data.credits };
        localStorage.setItem('user', JSON.stringify(this.user));
        console.log('✅ Utilisateur mis à jour dans localStorage');
      }
      
      // Afficher un message de succès
      alert(`✅ ${data.added} crédits ajoutés ! Total: ${data.credits} crédits`);
      
      return data;
    } catch (error) {
      console.error('Erreur achat crédits:', error);
      throw error;
    }
  }

  // Consommer des crédits
  static async consumeCredits(amount: number): Promise<{ credits: number }> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Non authentifié');
    }

    try {
      const response = await fetch(`${AuthService.API_BASE_URL}/api/user/consume-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur consommation crédits:', errorText);
        throw new Error('Erreur lors de la consommation de crédits');
      }

      const data = await response.json();
      console.log('✅ Crédits consommés:', data);
      
      // Mettre à jour l'utilisateur local et le localStorage
      if (this.user) {
        this.user = { ...this.user, credits: data.credits };
        localStorage.setItem('user', JSON.stringify(this.user));
        console.log('✅ Utilisateur mis à jour dans localStorage');
      }
      
      return data;
    } catch (error) {
      console.error('Erreur consommation crédits:', error);
      throw error;
    }
  }

  // Obtenir l'historique des CV générés
  static async getGeneratedCVs(): Promise<GeneratedCV[]> {
    if (!this.token) {
      throw new Error('Non authentifié');
    }

    try {
      const response = await fetch(`${AuthService.API_BASE_URL}/api/user/cvs`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des CV');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération CVs:', error);
      throw error;
    }
  }

  // Sauvegarder un CV généré
  static async saveGeneratedCV(cvData: Omit<GeneratedCV, 'id' | 'userId' | 'createdAt'>): Promise<GeneratedCV> {
    if (!this.token) {
      throw new Error('Non authentifié');
    }

    try {
      const response = await fetch(`${AuthService.API_BASE_URL}/api/user/cvs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(cvData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde du CV');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur sauvegarde CV:', error);
      throw error;
    }
  }

  // Vérifier la validité du token Firebase
  static async validateToken(): Promise<boolean> {
    try {
      // D'abord, essayer de récupérer l'utilisateur depuis localStorage
      if (this.token && this.user) {
        console.log('✅ Utilisateur trouvé dans localStorage, validation...');
        return true;
      }

      // Vérifier si l'utilisateur Firebase est connecté
      const currentUser = firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        console.log('❌ Aucun utilisateur Firebase connecté');
        this.logout();
        return false;
      }

      // Obtenir un nouveau token Firebase
      const firebaseToken = await firebaseAuthService.getIdToken();
      if (!firebaseToken) {
        console.log('❌ Impossible d\'obtenir le token Firebase');
        this.logout();
        return false;
      }

      // Valider avec notre backend
      const response = await fetch(`${AuthService.API_BASE_URL}/api/auth/validate-firebase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: firebaseToken }),
      });

      if (response.ok) {
        const userData = await response.json();
        this.user = userData.user;
        this.token = firebaseToken;
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        console.log('✅ Token validé et utilisateur chargé');
        return true;
      } else {
        console.log('❌ Échec validation token avec le backend');
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('Erreur validation token Firebase:', error);
      this.logout();
      return false;
    }
  }
}

// Export de l'instance avec les méthodes statiques
export const authService = {
  login: AuthService.login.bind(AuthService),
  register: AuthService.register.bind(AuthService),
  logout: AuthService.logout.bind(AuthService),
  validateToken: AuthService.validateToken.bind(AuthService),
  getUserProfile: AuthService.getUserProfile.bind(AuthService),
  updateProfile: AuthService.updateProfile.bind(AuthService),
  buyCredits: AuthService.buyCredits.bind(AuthService),
  consumeCredits: AuthService.consumeCredits.bind(AuthService),
  getGeneratedCVs: AuthService.getGeneratedCVs.bind(AuthService),
  saveGeneratedCV: AuthService.saveGeneratedCV.bind(AuthService),
  getCurrentUser: AuthService.getCurrentUser.bind(AuthService),
  initialize: AuthService.initialize.bind(AuthService)
};
