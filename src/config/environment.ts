// ======================================
// CVBIEN - CONFIGURATION ENVIRONNEMENT
// ======================================

// Debug des variables d'environnement
console.log('🔧 Variables d\'environnement Vite:');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('VITE_STRIPE_PUBLISHABLE_KEY:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Définie' : 'Non définie');
console.log('VITE_DEMO_MODE:', import.meta.env.VITE_DEMO_MODE);

// FORCER LES URLs EN PRODUCTION
const isProduction = import.meta.env.MODE === 'production' || window.location.hostname !== 'localhost';
console.log('🔧 Mode production détecté:', isProduction);

export const config = {
  // Mode de l'application
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  IS_PRODUCTION: import.meta.env.VITE_NODE_ENV === 'production',
  IS_DEVELOPMENT: import.meta.env.VITE_NODE_ENV === 'development',

  // URLs de l'API - VERCEL BACKEND (UPDATED - 2025-11-05)
  API_BASE_URL: isProduction ? 'https://cvbien-backend-api.vercel.app' : 'http://localhost:8000',
  AUTH_API_URL: isProduction ? 'https://cvbien-backend-api.vercel.app' : 'http://localhost:8000',
  
  // Application
  APP_NAME: import.meta.env.VITE_APP_NAME || 'CVbien',
  APP_URL: isProduction ? 'https://cvbien.dev' : 'http://localhost:5173',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Mode démo
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true',

  // OpenAI
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || 'sk-proj-1X...', // TEMPORAIRE POUR TEST

  // Stripe - TEMPORAIREMENT HARDCODÉ
  STRIPE_PUBLISHABLE_KEY: 'pk_live_51SD8G7QZWzLgjmhb8kI9cdgxtUhJ3tnzDhaXgJmLRvYbUdy2NZD5RZOaZe7bm29zaK81dE89e9Qacr3mU3B7ReyY00yryXJTHS', // import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',

  // Limites
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'), // 10MB
  MAX_REQUESTS_PER_MINUTE: parseInt(import.meta.env.VITE_MAX_REQUESTS_PER_MINUTE || '60'),

  // Analytics
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',

  // Debugging
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
};

// Validation des variables critiques en production
if (config.IS_PRODUCTION) {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_AUTH_API_URL',
    'VITE_OPENAI_API_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('🚨 Variables d\'environnement manquantes en production:', missingVars);
  }
  
  // Logs de debugging pour les variables importantes
  console.log('🔧 Variables d\'environnement détectées:');
  console.log('🔑 VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? 'Présente' : 'Manquante');
  console.log('🌐 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'Non définie');
  console.log('🔐 VITE_AUTH_API_URL:', import.meta.env.VITE_AUTH_API_URL || 'Non définie');
  console.log('📊 Mode production:', isProduction);
}

export default config;

// Force frontend redeploy 2025-01-06-07:00 - CV improvements deployed
