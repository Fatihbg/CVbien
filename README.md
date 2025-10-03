# 🚀 CVbien - Générateur de CV avec IA

> **Générateur de CV professionnel optimisé ATS avec intelligence artificielle**

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel)](https://vercel.com)
[![Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=flat&logo=railway)](https://railway.app)
[![OpenAI](https://img.shields.io/badge/Powered%20by-OpenAI-412991?style=flat&logo=openai)](https://openai.com)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?style=flat&logo=stripe)](https://stripe.com)

## ✨ Fonctionnalités

- 🤖 **Optimisation IA** : Utilise GPT-4o pour optimiser votre CV
- 📊 **Score ATS** : Calcul automatique du score de compatibilité ATS
- 📄 **Génération PDF** : Export professionnel au format PDF
- 💳 **Paiements Stripe** : Système de crédits intégré
- 🌍 **Multilingue** : Support français et anglais
- 📱 **Responsive** : Interface adaptée mobile et desktop
- 🔍 **SEO Optimisé** : Référencement naturel optimisé

## 🚀 Déploiement Rapide

### Frontend (Vercel)
```bash
# 1. Connecter le repository GitHub
# 2. Configurer les variables d'environnement
VITE_API_BASE_URL=https://votre-backend.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_OPENAI_API_KEY=sk-...
```

### Backend (Railway)
```bash
# 1. Connecter le repository GitHub
# 2. Sélectionner le dossier backend/
# 3. Configurer les variables d'environnement
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
CORS_ORIGINS=https://votre-frontend.vercel.app
```

## 🛠️ Développement Local

### Prérequis
- Node.js 18+
- Python 3.9+
- Clés API OpenAI et Stripe

### Installation
```bash
# Cloner le repository
git clone https://github.com/Fatihbg/CVbien.git
cd CVbien

# Frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn main_simple:app --reload --port 8003
```

### Variables d'environnement
```bash
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:8003
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_OPENAI_API_KEY=sk-...

# Backend (backend/.env)
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
CORS_ORIGINS=http://localhost:5173
```

## 📁 Structure du Projet

```
CVbien/
├── 📁 src/                    # Frontend React
│   ├── 📁 components/         # Composants réutilisables
│   ├── 📁 pages/             # Pages principales
│   ├── 📁 services/          # Services API
│   ├── 📁 store/             # État global (Zustand)
│   └── 📁 i18n/              # Traductions
├── 📁 backend/               # Backend FastAPI
│   ├── main_simple.py        # API principale
│   ├── requirements.txt      # Dépendances Python
│   └── railway.json         # Configuration Railway
├── 📁 public/                # Assets statiques
├── vercel.json              # Configuration Vercel
├── DEPLOYMENT.md            # Guide de déploiement
└── README.md               # Ce fichier
```

## 🔧 Technologies Utilisées

### Frontend
- **React 18** - Interface utilisateur
- **TypeScript** - Typage statique
- **Vite** - Build tool moderne
- **Tailwind CSS** - Framework CSS
- **Zustand** - Gestion d'état
- **React Query** - Gestion des données

### Backend
- **FastAPI** - Framework Python moderne
- **OpenAI GPT-4o** - Intelligence artificielle
- **Stripe** - Paiements en ligne
- **ReportLab** - Génération PDF
- **Uvicorn** - Serveur ASGI

### Déploiement
- **Vercel** - Frontend (gratuit)
- **Railway** - Backend (gratuit)
- **GitHub** - Version control

## 📊 API Endpoints

### Backend
- `GET /` - Health check
- `POST /optimize-cv` - Optimisation CV avec IA
- `POST /extract-pdf` - Extraction texte PDF

### Frontend
- Interface utilisateur complète
- Upload de fichiers
- Génération de CV
- Téléchargement PDF

## 🔐 Sécurité

- ✅ Variables d'environnement pour les clés API
- ✅ Validation des données côté serveur
- ✅ CORS configuré
- ✅ Headers de sécurité
- ✅ Pas de clés hardcodées

## 📈 Performance

- ⚡ Build optimisé avec Vite
- 🚀 Lazy loading des composants
- 📱 PWA ready
- 🔍 SEO optimisé
- 💾 Cache intelligent

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- 📧 Email: support@cvbien.app
- 🐛 Issues: [GitHub Issues](https://github.com/Fatihbg/CVbien/issues)
- 📖 Documentation: [DEPLOYMENT.md](DEPLOYMENT.md)

## 🎯 Roadmap

- [ ] Support de plus de formats de CV
- [ ] Templates de CV personnalisables
- [ ] Analytics avancées
- [ ] API publique
- [ ] Application mobile

---

**🚀 Déployé avec ❤️ par [Fatih](https://github.com/Fatihbg)**# CVbien
# Force Vercel redeploy - Fri Oct  3 18:33:02 CEST 2025
# Force Vercel redeploy - Fix all localhost URLs - Fri Oct  3 18:39:30 CEST 2025
# Force Vercel redeploy - Fix admin.ts API URL - Fri Oct  3 18:55:16 CEST 2025
# Force Vercel redeploy - Fix environment variables - Fri Oct  3 19:14:38 CEST 2025
# Force Vercel redeploy - Fix API URL protocol - Fri Oct  3 19:20:21 CEST 2025
