import { config } from '../config/environment';

const API_BASE_URL = config.API_BASE_URL;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  credits: number;
  createdAt: string;
}

export interface CVGenerationRequest {
  originalCV: string;
  jobDescription: string;
}

export interface CVGenerationResponse {
  generatedCV: string;
  originalATSScore: number;
  generatedATSScore: number;
}

export interface PaymentRequest {
  credits: number;
  amount: number;
}

class ApiService {
  private isDemoMode = config.DEMO_MODE; // Mode démo configurable

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Mode démo - simulation des réponses
    if (this.isDemoMode) {
      return this.handleDemoRequest<T>(endpoint, options);
    }

    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      };
    }
  }

  private async handleDemoRequest<T>(endpoint: string, _options: RequestInit): Promise<ApiResponse<T>> {
    // Simulation des réponses API pour le mode démo
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler la latence

    switch (endpoint) {
      case '/auth/login':
        return {
          success: true,
          data: {
            user: {
              id: 'demo-user-1',
              email: 'demo@example.com',
              credits: 2,
              createdAt: new Date().toISOString(),
            },
            token: 'demo-token-123'
          } as T
        };

      case '/auth/register':
        return {
          success: true,
          data: {
            user: {
              id: 'demo-user-1',
              email: 'demo@example.com',
              credits: 2,
              createdAt: new Date().toISOString(),
            },
            token: 'demo-token-123'
          } as T
        };

      case '/auth/profile':
        return {
          success: true,
          data: {
            id: 'demo-user-1',
            email: 'demo@example.com',
            credits: 2,
            createdAt: new Date().toISOString(),
          } as T
        };

      case '/cv/generate':
        return {
          success: true,
          data: {
            generatedCV: 'CV généré avec succès en mode démo',
            originalATSScore: 65,
            generatedATSScore: 92
          } as T
        };

      case '/payment/create-intent':
        return {
          success: true,
          data: {
            clientSecret: 'demo-payment-intent-123'
          } as T
        };

      case '/payment/confirm':
        return {
          success: true,
          data: {
            credits: 10
          } as T
        };

      default:
        return {
          success: false,
          error: 'Endpoint non trouvé en mode démo'
        };
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request('/auth/profile');
  }

  // CV Generation
  async generateCV(request: CVGenerationRequest): Promise<ApiResponse<CVGenerationResponse>> {
    return this.request('/cv/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Payment
  async createPaymentIntent(request: PaymentRequest): Promise<ApiResponse<{ clientSecret: string }>> {
    return this.request('/payment/create-intent', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async confirmPayment(paymentIntentId: string): Promise<ApiResponse<{ credits: number }>> {
    return this.request('/payment/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }
}

export const apiService = new ApiService();
