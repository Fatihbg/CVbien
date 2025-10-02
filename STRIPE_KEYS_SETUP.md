# 🔐 CONFIGURATION CLÉS STRIPE - CVbien

## 📁 FICHIERS À CRÉER

### **1. Frontend (.env.local)**
```bash
# Dans le dossier racine du projet
touch .env.local
```

**Contenu du fichier .env.local :**
```env
# Stripe - Clé publique (commence par pk_)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_ou_pk_live_ta_cle_ici

# API URLs
VITE_API_URL=http://localhost:8002
VITE_AUTH_API_URL=http://localhost:8001

# Mode démo désactivé pour utiliser Stripe réel
VITE_DEMO_MODE=false
```

### **2. Backend (.env)**
```bash
# Dans le dossier backend/
cd backend
touch .env
```

**Contenu du fichier backend/.env :**
```env
# Stripe - Clé secrète (commence par sk_)
STRIPE_SECRET_KEY=sk_test_ou_sk_live_ta_cle_secrete_ici

# OpenAI (déjà dans le code mais au cas où)
OPENAI_API_KEY=sk-proj-ton_api_key_openai

# Configuration serveur
PORT=8002
DEBUG=true
```

---

## 🎯 OÙ TROUVER TES CLÉS STRIPE

### **Dashboard Stripe :**
1. **Aller sur** : https://dashboard.stripe.com/apikeys
2. **Copier** :
   - **Clé publique** : `pk_test_...` (pour le frontend)
   - **Clé secrète** : `sk_test_...` (pour le backend)

### **Mode Test vs Production :**
```bash
# Mode Test (gratuit, pour développement)
pk_test_51ABC123...  # Frontend
sk_test_51ABC123...  # Backend

# Mode Production (vrais paiements)
pk_live_51ABC123...  # Frontend  
sk_live_51ABC123...  # Backend
```

---

## ✅ VÉRIFICATION

### **1. Frontend**
```bash
# Vérifier que la clé est chargée
npm run dev
# Ouvrir la console → Aucune erreur Stripe
```

### **2. Backend**
```bash
cd backend
source venv/bin/activate
python main_simple.py
# Voir : "🚀 API démarrée sur http://localhost:8002"
```

### **3. Test paiement**
- Ouvrir l'app → Acheter crédits
- Carte test : `4242 4242 4242 4242`
- Date : `12/25`, CVC : `123`

---

## 🔒 SÉCURITÉ

- ✅ **Clé publique** : Peut être visible (pk_...)
- ⚠️ **Clé secrète** : JAMAIS dans le frontend (sk_...)
- 🚫 **Fichiers .env** : Ignorés par git automatiquement

---

## 🚀 STATUT ACTUEL

- ✅ **Code Stripe** : Intégré
- ✅ **Backend** : Prêt avec endpoints
- ✅ **Frontend** : Configuré pour Stripe réel
- 🔧 **Clés** : À ajouter dans les fichiers .env

**Une fois les clés ajoutées → Stripe réel opérationnel ! 💳**
