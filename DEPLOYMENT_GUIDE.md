# 🚀 GUIDE DE DÉPLOIEMENT - CVBIEN

## 📋 PRÉREQUIS

### 1. Comptes nécessaires
- [x] Compte GitHub
- [ ] Compte Vercel OU Netlify
- [ ] Compte OpenAI (pour l'API)
- [ ] Compte Stripe (pour les paiements)
- [ ] Compte Railway/Heroku (pour le backend)

### 2. Clés API à obtenir
- [ ] **OpenAI API Key** : https://platform.openai.com/api-keys
- [ ] **Stripe Publishable Key** : https://dashboard.stripe.com/apikeys
- [ ] **Stripe Secret Key** : https://dashboard.stripe.com/apikeys

---

## 🎯 OPTION 1 : DÉPLOIEMENT RAPIDE (FRONTEND SEULEMENT)

### Déploiement sur Vercel

1. **Push sur GitHub**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Connecter à Vercel**
   - Aller sur [vercel.com](https://vercel.com)
   - Import project from GitHub
   - Sélectionner le repo `cv-generator-pwa`

3. **Configurer les variables d'environnement**
   Dans les settings Vercel :
   ```
   VITE_NODE_ENV=production
   VITE_API_BASE_URL=https://api.cvbien.app
   VITE_AUTH_API_URL=https://auth.cvbien.app
   VITE_APP_URL=https://cvbien.app
   VITE_DEMO_MODE=false
   VITE_OPENAI_API_KEY=sk-...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

4. **Deploy !**
   - Vercel va automatiquement builder et déployer
   - URL : `https://cv-generator-pwa.vercel.app`

### Déploiement sur Netlify

1. **Push sur GitHub** (même étape)

2. **Connecter à Netlify**
   - Aller sur [netlify.com](https://netlify.com)
   - New site from Git
   - Sélectionner le repo

3. **Configurer les variables d'environnement**
   Dans Site settings > Environment variables :
   ```
   VITE_NODE_ENV=production
   VITE_DEMO_MODE=false
   VITE_OPENAI_API_KEY=sk-...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

---

## 🏗️ OPTION 2 : DÉPLOIEMENT COMPLET (FRONTEND + BACKEND)

### Backend sur Railway

1. **Créer un projet sur Railway**
   ```bash
   # Installer Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Deploy backend
   cd backend
   railway init
   railway up
   ```

2. **Variables d'environnement backend**
   ```
   OPENAI_API_KEY=sk-...
   STRIPE_SECRET_KEY=sk_live_...
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-here
   ```

3. **Mettre à jour les URLs frontend**
   ```
   VITE_API_BASE_URL=https://your-railway-app.railway.app
   VITE_AUTH_API_URL=https://your-railway-app.railway.app
   ```

---

## 🔧 CONFIGURATION POST-DÉPLOIEMENT

### 1. Configurer le domaine personnalisé
- Acheter un domaine (ex: cvbien.app)
- Configurer les DNS :
  ```
  cvbien.app → CNAME → your-vercel-app.vercel.app
  api.cvbien.app → CNAME → your-railway-app.railway.app
  ```

### 2. Configurer HTTPS
- Vercel/Netlify : Automatique
- Railway : Automatique
- Certificats SSL gratuits inclus

### 3. Configurer Stripe
- Passer en mode Live
- Configurer les webhooks
- Mettre à jour les clés API

### 4. Tests de production
- [ ] Inscription/connexion
- [ ] Upload de CV
- [ ] Génération de CV
- [ ] Paiement Stripe
- [ ] Download PDF

---

## 🐛 DÉPANNAGE

### Erreurs communes

1. **Build fail - TypeScript errors**
   ```bash
   npm run build
   # Corriger les erreurs TypeScript
   ```

2. **Variables d'environnement manquantes**
   - Vérifier que toutes les `VITE_*` variables sont définies
   - Redéployer après modification

3. **CORS errors**
   - Vérifier que le backend autorise le domaine frontend
   - Mettre à jour les configurations CORS

4. **OpenAI API errors**
   - Vérifier que la clé API est valide
   - Vérifier les quotas/billing OpenAI

---

## 📊 MONITORING

### Métriques à surveiller
- [ ] Uptime (99.9%+)
- [ ] Load time (<3s)
- [ ] Error rate (<1%)
- [ ] OpenAI API usage
- [ ] Stripe transactions

### Outils recommandés
- **Vercel Analytics** : Inclus
- **Sentry** : Error tracking
- **LogRocket** : User sessions
- **Google Analytics** : Trafic

---

## 🔄 MISES À JOUR

### Process de déploiement continu
1. Développement local
2. Push vers GitHub
3. Auto-deploy sur Vercel/Netlify
4. Tests en production
5. Rollback si nécessaire

### Commandes utiles
```bash
# Build local
npm run build

# Preview du build
npm run preview

# Deploy manuel
vercel --prod
# ou
netlify deploy --prod
```

---

## 🆘 SUPPORT

En cas de problème :
1. Vérifier les logs Vercel/Netlify
2. Vérifier les variables d'environnement
3. Tester en local avec `npm run preview`
4. Vérifier les APIs externes (OpenAI, Stripe)

🎉 **Votre application CVbien est maintenant prête pour la production !**
