import { stripePromise } from '../config/stripe';
import { config } from '../config/environment';

export interface PaymentIntent {
  client_secret: string;
  amount: number;
  credits: number;
}

export class StripeService {
  // Créer une session de paiement
  static async createPaymentSession(credits: number, price: number) {
    try {
      const apiUrl = `${config.API_BASE_URL}/api/payments/create-payment-intent`;
      console.log('🔗 URL API utilisée:', apiUrl);
      console.log('🔧 Config API_BASE_URL:', config.API_BASE_URL);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          credits,
          amount: price
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur Stripe:', error);
      throw error;
    }
  }

  // Confirmer le paiement
  static async confirmPayment(clientSecret: string) {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe non initialisé');
      }

      const { error } = await stripe.confirmCardPayment(clientSecret);
      
      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur confirmation paiement:', error);
      throw error;
    }
  }

  // Simuler un paiement (pour les tests)
  static async simulatePayment(credits: number, price: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          credits,
          amount: price
        });
      }, 2000); // Simuler un délai de 2 secondes
    });
  }
}

