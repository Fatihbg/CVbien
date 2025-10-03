// Configuration pour l'accès à l'administration
export const ADMIN_CONFIG = {
  // URL de base pour l'administration en production
  ADMIN_URL: import.meta.env.MODE === 'production' 
    ? 'https://votre-domaine.com/admin' 
    : 'http://localhost:5173/admin',
  
  // Mot de passe d'administration
  ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD || 'Cvbien2001fatih',
  
  // Indique si l'administration est activée
  ADMIN_ENABLED: true,
  
  // URL de l'API backend
  API_BASE_URL: import.meta.env.MODE === 'production'
    ? 'https://votre-domaine.com/api'
    : 'http://localhost:8001',
};

// Instructions pour l'accès en production
export const PRODUCTION_ACCESS_INFO = {
  title: "🔐 Accès à l'Administration en Production",
  instructions: [
    "1. Déployez votre application sur un serveur (VPS, Heroku, Vercel, etc.)",
    "2. Configurez votre domaine (ex: cvbien.com)",
    "3. Accédez à l'administration via: https://votre-domaine.com/admin",
    "4. L'administration sera accessible publiquement (sans authentification)",
    "5. Pour sécuriser, ajoutez une authentification admin si nécessaire"
  ],
  security: [
    "⚠️ IMPORTANT: L'administration est actuellement accessible sans mot de passe",
    "🔒 Recommandation: Ajoutez une authentification admin en production",
    "🛡️ Considérez l'ajout d'un système de login admin séparé",
    "📊 Les données sont sensibles - protégez l'accès"
  ]
};
