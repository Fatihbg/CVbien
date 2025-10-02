# 💳 CONFIGURATION STRIPE - CVBIEN

## 🎯 ÉTAPES POUR ACTIVER LES VRAIS PAIEMENTS

### 1. **Créer un compte Stripe** (si pas encore fait)
- Aller sur https://stripe.com
- S'inscrire / Se connecter
- Vérifier l'identité (requis pour les paiements réels)

### 2. **Récupérer les clés API**

#### Mode Test (pour développement)
```
Publishable key: pk_test_...
Secret key: sk_test_...
```

#### Mode Live (pour production)
```
Publishable key: pk_live_...
Secret key: sk_live_...
```

### 3. **Configurer dans l'application**

#### Variables d'environnement à ajouter :
```bash
# Mode test
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Mode production
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
```

### 4. **Backend - Clés secrètes** (pour plus tard)
```bash
# Ne JAMAIS mettre dans le frontend !
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

---

## 🛠️ CONFIGURATION PRODUITS

### Produits actuels configurés :
```javascript
{
  credits_10: {
    price: 100,     // 1€ en centimes
    credits: 10,
    name: '10 Crédits'
  },
  credits_100: {
    price: 500,     // 5€ en centimes  
    credits: 100,
    name: '100 Crédits'
  }
}
```

### À faire dans Stripe Dashboard :
1. Créer les produits correspondants
2. Configurer les prix
3. Configurer les webhooks (optionnel)

---

## 🔄 WORKFLOW DE PAIEMENT

### Actuel (simulation)
1. Utilisateur clique "Acheter crédits"
2. Modal s'ouvre avec les options
3. **Simulation** du paiement
4. Crédits ajoutés automatiquement

### Avec Stripe réel
1. Utilisateur clique "Acheter crédits"  
2. Modal s'ouvre avec les options
3. **Redirection vers Stripe Checkout**
4. Paiement réel avec carte bancaire
5. Retour sur l'app avec crédits ajoutés

---

## 💡 RECOMMANDATION

### **POUR COMMENCER (MODE TEST)**
```bash
# Variables à ajouter
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
- Paiements simulés
- Pas de vraie facturation
- Parfait pour tester

### **POUR LA PRODUCTION**
```bash
# Variables à changer
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```
- Vrais paiements
- Commission Stripe : 2.9% + 0.25€
- Revenus réels !

---

## 🚀 STATUT ACTUEL

- ✅ **Code Stripe** : Intégré et prêt
- ✅ **Interface** : Fonctionnelle
- ⏳ **Clés API** : À configurer
- ⏳ **Mode live** : À activer

**Veux-tu qu'on configure tes clés Stripe maintenant ?**