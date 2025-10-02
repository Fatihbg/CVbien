# 🚀 Guide de Déploiement - CVbien

## 📋 Prérequis

- **Node.js** (v18+)
- **Python** (v3.9+)
- **Compte Stripe** (clés live)
- **Serveur VPS** (Ubuntu/CentOS)

## 🔧 Configuration

### 1. Clés Stripe Live

1. Connectez-vous à votre [dashboard Stripe](https://dashboard.stripe.com)
2. Passez en mode **Live** (bouton en haut à droite)
3. Récupérez vos clés live :
   - **Clé publique** : `pk_live_...`
   - **Clé secrète** : `sk_live_...`

### 2. Configuration Backend

```bash
cd backend
cp .env.production .env
nano .env
```

Remplacez les valeurs :
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_votre_vraie_cle_publique
STRIPE_SECRET_KEY=sk_live_votre_vraie_cle_secrete
SECRET_KEY=votre_secret_key_super_securise
```

### 3. Configuration Frontend

```bash
nano .env
```

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_votre_vraie_cle_publique
```

## 🚀 Déploiement

### Option 1: Script automatique
```bash
./deploy.sh
```

### Option 2: Manuel

1. **Frontend** :
```bash
npm install
npm run build
```

2. **Backend** :
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python init_db.py
```

## 🌐 Serveur de Production

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    # Frontend
    location / {
        root /path/to/cv-generator-pwa/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### PM2 pour le backend
```bash
npm install -g pm2
cd backend
pm2 start main_auth.py --name "cvbien-backend" --interpreter python
pm2 start main_simple.py --name "cvbien-cv" --interpreter python
pm2 save
pm2 startup
```

## 🔒 Sécurité

- ✅ **HTTPS** obligatoire
- ✅ **Clés Stripe live** sécurisées
- ✅ **SECRET_KEY** fort et unique
- ✅ **Firewall** configuré
- ✅ **Backup** base de données

## 📊 Monitoring

```bash
# Vérifier les logs
pm2 logs cvbien-backend
pm2 logs cvbien-cv

# Status des services
pm2 status
```

## 🎯 URLs de Production

- **Frontend** : `https://votre-domaine.com`
- **API Auth** : `https://votre-domaine.com/api/auth/`
- **API CV** : `https://votre-domaine.com/api/cv/`

## 💰 Coûts Estimés

- **VPS** : 5-10€/mois
- **Domaine** : 10-15€/an
- **Stripe** : 1.4% + 0.25€ par transaction
- **Total** : ~15-20€/mois

