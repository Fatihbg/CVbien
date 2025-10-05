export interface AdminUser {
  id: string;
  email: string;
  credits: number;
  created_at: string;
  last_login: string | null;
}

export interface AdminTransaction {
  user_id: string;
  amount: number;
  credits_added: number;
  created_at: string;
  type: string;
}

export interface AdminGeneratedCV {
  user_id: string;
  created_at: string;
  job_description: string;
}

export interface AdminStatistics {
  total_users: number;
  total_credits_sold: number;
  total_revenue: number;
  total_cvs_generated: number;
}

export interface AdminData {
  users: AdminUser[];
  transactions: AdminTransaction[];
  generated_cvs: AdminGeneratedCV[];
  statistics: AdminStatistics;
}

export class AdminService {
  private static API_BASE_URL = 'https://cvbien-production.up.railway.app';

  static async getAdminData(): Promise<AdminData> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données admin');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur admin service:', error);
      throw error;
    }
  }
}

