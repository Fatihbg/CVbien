import React, { useState, useEffect } from 'react';
import { AdminService } from '../services/adminService';
import type { AdminData, AdminUser, AdminTransaction, AdminStatistics } from '../services/adminService';
import { PRODUCTION_ACCESS_INFO, ADMIN_CONFIG } from '../config/admin';

// Fonction utilitaire pour formater les dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fonction utilitaire pour formater les montants
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const AdminPage: React.FC = () => {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'cvs' | 'stats' | 'info'>('stats');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié
    const adminAuth = localStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (password === ADMIN_CONFIG.ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      loadAdminData();
    } else {
      setPasswordError('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminData(null);
    setPassword('');
    setPasswordError('');
    localStorage.removeItem('admin_authenticated');
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des données admin...');
      const data = await AdminService.getAdminData();
      console.log('✅ Données admin reçues:', data);
      console.log('👥 Nombre d\'utilisateurs:', data.users?.length || 0);
      setAdminData(data);
    } catch (err) {
      console.error('❌ Erreur chargement admin:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };


  // Affichage du formulaire de connexion
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔐</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Administration</h1>
              <p className="text-gray-600">Accès sécurisé au tableau de bord</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe administrateur
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Entrez le mot de passe"
                  required
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
              >
                Se connecter
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Mot de passe par défaut : <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-xl">{error}</p>
          <button 
            onClick={loadAdminData}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!adminData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Administration</h1>
              <p className="text-gray-600">Tableau de bord de gestion des utilisateurs et statistiques</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <span>🚪</span>
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'stats', label: '📊 Statistiques', icon: '📊' },
              { id: 'users', label: '👥 Utilisateurs', icon: '👥' },
              { id: 'transactions', label: '💳 Transactions', icon: '💳' },
              { id: 'cvs', label: '📄 CV Générés', icon: '📄' },
              { id: 'info', label: 'ℹ️ Info Production', icon: 'ℹ️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-3 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === 'stats' && <StatsTab statistics={adminData.statistics} />}
          {activeTab === 'users' && <UsersTab users={adminData.users} />}
          {activeTab === 'transactions' && <TransactionsTab transactions={adminData.transactions} />}
          {activeTab === 'cvs' && <CVsTab cvs={adminData.generated_cvs} />}
          {activeTab === 'info' && <InfoTab />}
        </div>
      </div>
    </div>
  );
};

// Composant des statistiques
const StatsTab: React.FC<{ statistics: AdminStatistics }> = ({ statistics }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Statistiques Générales</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
        <div className="text-3xl font-bold">{statistics.total_users}</div>
        <div className="text-blue-100">Utilisateurs Total</div>
      </div>
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
        <div className="text-3xl font-bold">{statistics.total_credits_sold}</div>
        <div className="text-green-100">Crédits Vendus</div>
      </div>
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
        <div className="text-3xl font-bold">{statistics.total_revenue.toFixed(2)}€</div>
        <div className="text-purple-100">Revenus Total</div>
      </div>
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
        <div className="text-3xl font-bold">{statistics.total_cvs_generated}</div>
        <div className="text-orange-100">CV Générés</div>
      </div>
    </div>
  </div>
);

// Composant des utilisateurs
const UsersTab: React.FC<{ users: AdminUser[] }> = ({ users }) => {
  console.log('👥 UsersTab rendu avec', users?.length || 0, 'utilisateurs');
  console.log('👥 Données utilisateurs:', users);
  
  if (!users || users.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 Utilisateurs (0)</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun utilisateur trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 Utilisateurs ({users.length})</h2>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Crédits
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Inscription
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Dernière Connexion
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    user.credits > 50 
                      ? 'bg-green-100 text-green-800' 
                      : user.credits > 10 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {user.credits} crédits
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.last_login ? formatDate(user.last_login) : (
                    <span className="text-gray-400 italic">Jamais connecté</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    user.last_login 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.last_login ? 'Actif' : 'Inactif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

// Composant des transactions
const TransactionsTab: React.FC<{ transactions: AdminTransaction[] }> = ({ transactions }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">💳 Transactions ({transactions.length})</h2>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Crédits
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction, index) => (
              <tr key={index} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.user_id.substring(0, 8)}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(transaction.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    transaction.type === 'purchase' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {transaction.type === 'purchase' ? '+' : '-'}{transaction.credits_added}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    transaction.type === 'purchase' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.type === 'purchase' ? '🛒 Achat' : '⚡ Consommation'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(transaction.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Composant des CV générés
const CVsTab: React.FC<{ cvs: any[] }> = ({ cvs }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">📄 CV Générés ({cvs.length})</h2>
    <div className="space-y-4">
      {cvs.map((cv, index) => (
        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-gray-500">Utilisateur: {cv.user_id}</span>
            <span className="text-sm text-gray-500">{formatDate(cv.created_at)}</span>
          </div>
          <p className="text-gray-800">{cv.job_description}</p>
        </div>
      ))}
    </div>
  </div>
);

// Composant d'information sur la production
const InfoTab: React.FC = () => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">ℹ️ Accès en Production</h2>
    
    <div className="space-y-6">
      {/* Instructions d'accès */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">
          {PRODUCTION_ACCESS_INFO.title}
        </h3>
        <ul className="space-y-2">
          {PRODUCTION_ACCESS_INFO.instructions.map((instruction, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span className="text-blue-700">{instruction}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* URL d'accès */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4">🌐 URL d'Accès</h3>
        <div className="bg-white border border-green-300 rounded-lg p-4">
          <code className="text-green-800 font-mono text-lg">
            https://votre-domaine.com/admin
          </code>
        </div>
        <p className="text-green-700 mt-2 text-sm">
          Remplacez "votre-domaine.com" par votre domaine réel
        </p>
      </div>

      {/* Sécurité */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">🔒 Sécurité</h3>
        <ul className="space-y-2">
          {PRODUCTION_ACCESS_INFO.security.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span className="text-yellow-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Exemple de déploiement */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 Exemple de Déploiement</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Vercel (Recommandé)</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              <div>npm install -g vercel</div>
              <div>vercel --prod</div>
              <div># Puis accédez à: https://votre-app.vercel.app/admin</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">VPS/Serveur</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              <div># Déployez sur votre serveur</div>
              <div># Configurez votre domaine</div>
              <div># Accédez à: https://votre-domaine.com/admin</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AdminPage;
