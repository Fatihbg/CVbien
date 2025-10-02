# 🚀 Guide de Déploiement CVbien

## 📋 Prérequis

- Compte GitHub
- Compte Vercel (gratuit)
- Compte Railway (gratuit)
- Clés API OpenAI et Stripe

## 🔧 Configuration des Variables d'Environnement

### Frontend (Vercel)
```bash
VITE_API_BASE_URL=https://votre-backend.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_OPENAI_API_KEY=sk-...
```

### Backend (Railway)
```bash
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
CORS_ORIGINS=https://votre-frontend.vercel.app
```

## 🌐 Déploiement Frontend (Vercel)

1. **Connecter le repository**
   - Va sur [vercel.com](https://vercel.com)
   - Clique sur "New Project"
   - Importe le repository GitHub

2. **Configuration**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Variables d'environnement**
   - Va dans Settings → Environment Variables
   - Ajoute toutes les variables VITE_*

## 🔧 Déploiement Backend (Railway)

1. **Connecter le repository**
   - Va sur [railway.app](https://railway.app)
   - Clique sur "New Project"
   - Importe le repository GitHub
   - Sélectionne le dossier `backend/`

2. **Configuration**
   - Runtime: Python 3.9
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main_simple:app --host 0.0.0.0 --port $PORT`

3. **Variables d'environnement**
   - Va dans Variables
   - Ajoute toutes les variables OPENAI_* et STRIPE_*

## 🔗 Configuration des URLs

### Frontend
- Mettre à jour `VITE_API_BASE_URL` avec l'URL Railway
- Mettre à jour `CORS_ORIGINS` dans le backend

### Backend
- Mettre à jour `CORS_ORIGINS` avec l'URL Vercel

## ✅ Test de Déploiement

1. **Frontend**
   - Vérifier que l'app se charge
   - Tester l'upload de CV
   - Tester la génération

2. **Backend**
   - Vérifier les logs Railway
   - Tester l'endpoint `/`
   - Tester l'endpoint `/optimize-cv`

## 🚨 Dépannage

### Erreur CORS
- Vérifier `CORS_ORIGINS` dans le backend
- Ajouter l'URL Vercel exacte

### Erreur 500 Backend
- Vérifier les variables d'environnement
- Vérifier les logs Railway

### Erreur Frontend
- Vérifier les variables VITE_*
- Vérifier la console du navigateur

## 📊 Monitoring

- **Vercel**: Analytics et logs
- **Railway**: Logs et métriques
- **Stripe**: Dashboard des paiements

## 🔄 Mise à jour

1. Push sur GitHub
2. Vercel et Railway se mettent à jour automatiquement
3. Vérifier que tout fonctionne

---

**🎯 Ton app sera accessible sur :**
- Frontend: `https://cvbien.vercel.app`
- Backend: `https://cvbien-backend.railway.app`