export interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  createdAt: Date;
  lastLoginAt: Date;
  subscriptionType: 'free' | 'premium' | 'pro';
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  credits: number;
  subscriptionType: 'free' | 'premium' | 'pro';
  totalCVsGenerated: number;
  lastCVGeneratedAt: Date | null;
  createdAt: Date;
}

export interface GeneratedCV {
  id: string;
  userId: string;
  originalFileName: string;
  jobDescription: string;
  optimizedCV: string;
  atsScore: number;
  createdAt: Date;
  isDownloaded: boolean;
}

