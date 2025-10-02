# CV Optimizer - PWA

Une application web progressive (PWA) qui utilise l'intelligence artificielle pour optimiser votre CV en fonction d'une description de poste, avec un système de scoring ATS.

## 🚀 Fonctionnalités

- **Extraction de données CV** : Support des formats PDF, DOCX, et TXT
- **Génération IA** : Utilise GPT-4o pour optimiser le CV selon la description du poste
- **Scoring ATS** : Calcule et affiche le score ATS du CV original et optimisé
- **Aperçu et édition** : Prévisualisation du CV avec possibilité d'édition en temps réel
- **Génération PDF** : Téléchargement du CV optimisé en PDF
- **Système de crédits** : Gestion des utilisateurs avec système de crédits
- **PWA** : Installation sur mobile et desktop

## 🛠️ Technologies utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build
- **Tailwind CSS** pour le styling
- **Zustand** pour la gestion d'état
- **React Query** pour les appels API
- **Lucide React** pour les icônes

### Services
- **OpenAI GPT-4o** pour la génération de CV
- **Mammoth.js** pour l'extraction de données DOCX
- **jsPDF** pour la génération PDF

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd cv-generator-pwa
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
Créer un fichier `.env` :
```env
VITE_API_URL=http://localhost:3001/api
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

## 🏗️ Architecture

### Structure des dossiers
```
src/
├── components/          # Composants React
│   ├── Auth/           # Composants d'authentification
│   ├── CV/             # Composants de génération CV
│   └── Layout/         # Composants de mise en page
├── pages/              # Pages de l'application
├── services/           # Services API et utilitaires
├── store/              # Stores Zustand
└── types/              # Types TypeScript
```

### Flux de données
1. **Upload CV** → Extraction des données avec LlamaIndex
2. **Description poste** → Saisie des informations du poste
3. **Génération IA** → Optimisation avec GPT-4o
4. **Scoring ATS** → Calcul des scores de compatibilité
5. **Aperçu/Édition** → Prévisualisation et modifications
6. **Téléchargement** → Export en PDF

## 🔧 Configuration

### Variables d'environnement
- `VITE_API_URL` : URL de l'API backend
- `VITE_OPENAI_API_KEY` : Clé API OpenAI

### Configuration PWA
Le fichier `public/manifest.json` contient la configuration PWA :
- Nom et description de l'app
- Icônes et thème
- Mode d'affichage (standalone)

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Déploiement sur Vercel/Netlify
1. Connecter le repository
2. Configurer les variables d'environnement
3. Déployer automatiquement

## 📱 Fonctionnalités PWA

- **Installation** : Ajout à l'écran d'accueil
- **Mode hors ligne** : Service worker pour la mise en cache
- **Responsive** : Adaptation mobile et desktop
- **Notifications** : Possibilité d'ajouter des notifications push

## 🔐 Sécurité

- Authentification JWT
- Validation des fichiers uploadés
- Sanitisation des données utilisateur
- Rate limiting sur l'API

## 📈 Roadmap

- [ ] Intégration Stripe pour les paiements
- [ ] Base de données utilisateurs
- [ ] Templates de CV personnalisables
- [ ] Analytics et métriques
- [ ] Support multilingue
- [ ] API de webhooks

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**Note** : Ce projet est en version de démonstration. Pour un usage en production, il est recommandé d'ajouter une authentification robuste, une base de données, et des tests automatisés.