import { loadStripe } from '@stripe/stripe-js';
import { config } from './environment';

// Clés Stripe configurables
const STRIPE_PUBLISHABLE_KEY = config.STRIPE_PUBLISHABLE_KEY;

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const STRIPE_CONFIG = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  // Configuration des produits
  products: {
    credits_10: {
      price: 100, // 1€ en centimes
      credits: 10,
      name: '10 Crédits'
    },
    credits_100: {
      price: 500, // 5€ en centimes
      credits: 100,
      name: '100 Crédits'
    }
  }
};
