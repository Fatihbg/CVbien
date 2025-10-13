# 🔐 Sécurité de l'Administration

## Configuration du mot de passe

### En développement
Le mot de passe par défaut est `admin123`. Vous pouvez le modifier en créant un fichier `.env` :

```bash
# Créer le fichier .env
echo "VITE_ADMIN_PASSWORD=votre_mot_de_passe_securise" > .env
```

### En production
**IMPORTANT** : Changez absolument le mot de passe par défaut !

1. **Via variable d'environnement** (recommandé) :
   ```bash
   export VITE_ADMIN_PASSWORD=votre_mot_de_passe_tres_securise
   ```

2. **Via fichier .env** :
   ```bash
   echo "VITE_ADMIN_PASSWORD=votre_mot_de_passe_tres_securise" > .env
   ```

3. **Via votre plateforme de déploiement** :
   - Vercel : Variables d'environnement dans le dashboard
   - Netlify : Variables d'environnement dans Site settings
   - VPS : Variables d'environnement du serveur

## Fonctionnalités de sécurité

### ✅ Implémentées
- **Authentification par mot de passe** : Accès protégé
- **Session persistante** : Connexion maintenue via localStorage
- **Déconnexion sécurisée** : Nettoyage des données sensibles
- **Interface de connexion** : Formulaire sécurisé avec validation

### 🔒 Recommandations de sécurité

1. **Mot de passe fort** :
   - Minimum 12 caractères
   - Mélange de lettres, chiffres et symboles
   - Exemple : `Adm1n@2024!Secure`

2. **Changement régulier** :
   - Changez le mot de passe tous les 3 mois
   - Utilisez un gestionnaire de mots de passe

3. **Accès limité** :
   - Ne partagez le mot de passe qu'avec les administrateurs autorisés
   - Surveillez les accès via les logs

4. **En production** :
   - Utilisez HTTPS obligatoire
   - Configurez un firewall
   - Surveillez les tentatives de connexion

## Accès à l'administration

### URL d'accès
- **Développement** : `http://localhost:5173/admin`
- **Production** : `https://votre-domaine.com/admin`

### Processus de connexion
1. Accédez à l'URL d'administration
2. Entrez le mot de passe administrateur
3. Cliquez sur "Se connecter"
4. Accédez au tableau de bord

### Déconnexion
- Cliquez sur le bouton "🚪 Se déconnecter" en haut à droite
- La session sera fermée et les données effacées

## Dépannage

### Mot de passe oublié
1. Modifiez la variable `VITE_ADMIN_PASSWORD` dans votre `.env`
2. Redémarrez l'application
3. Connectez-vous avec le nouveau mot de passe

### Problèmes de connexion
1. Vérifiez que le mot de passe est correct
2. Videz le cache du navigateur
3. Vérifiez les variables d'environnement
4. Consultez la console du navigateur pour les erreurs

## Logs et surveillance

L'application enregistre :
- Les tentatives de connexion (réussies et échouées)
- Les accès aux données administrateur
- Les erreurs d'authentification

Consultez les logs du backend pour surveiller l'activité.






