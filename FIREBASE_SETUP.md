# 🔥 Configuration Firebase

## 1. Obtenir les clés Firebase

1. Va dans la [Console Firebase](https://console.firebase.google.com/)
2. Sélectionne ton projet `cvbien-backend`
3. Va dans **Project Settings** (⚙️)
4. Dans l'onglet **General**, trouve la section **Your apps**
5. Clique sur **Web app** (🌐) si pas encore créé
6. Copie les clés de configuration

## 2. Mettre à jour la configuration

Modifie le fichier `src/config/firebase.ts` avec tes vraies clés :

```typescript
const firebaseConfig = {
  apiKey: "ta-vraie-clé-api",
  authDomain: "cvbien-backend.firebaseapp.com",
  projectId: "cvbien-backend",
  storageBucket: "cvbien-backend.appspot.com",
  messagingSenderId: "ton-sender-id",
  appId: "ton-app-id"
};
```

## 3. Activer Firebase Authentication

1. Dans la console Firebase, va dans **Authentication**
2. Clique sur **Get started**
3. Va dans l'onglet **Sign-in method**
4. Active **Email/Password**

## 4. Configurer Firestore

1. Va dans **Firestore Database**
2. Clique sur **Create database**
3. Choisis **Start in test mode** (pour commencer)
4. Sélectionne une région (Europe-west1 par exemple)

## 5. Règles Firestore (optionnel)

Pour la production, configure les règles dans **Firestore Database > Rules** :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre la lecture/écriture pour les utilisateurs authentifiés
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Permettre la lecture/écriture pour les transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 6. Variables d'environnement (optionnel)

Tu peux aussi utiliser des variables d'environnement dans `src/config/firebase.ts` :

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

Et ajouter ces variables dans Vercel :
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 7. Test

Une fois configuré, teste :
1. L'inscription d'un nouvel utilisateur
2. La connexion
3. Vérifie que l'utilisateur apparaît dans **Authentication** et **Firestore Database**

## 🚨 Important

- **Ne commite JAMAIS** tes vraies clés Firebase dans Git
- Utilise des variables d'environnement pour la production
- Configure les règles Firestore pour la sécurité
