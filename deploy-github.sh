#!/bin/bash

# Script de déploiement GitHub pour CVbien
echo "🚀 Déploiement de CVbien sur GitHub..."

# Vérifier si on est dans un repo git
if [ ! -d ".git" ]; then
    echo "❌ Pas de repository Git trouvé. Initialisation..."
    git init
    git add .
    git commit -m "🚀 CVbien v1.0.0 - Initial commit"
fi

# Ajouter tous les fichiers
echo "📦 Ajout des fichiers..."
git add .

# Commit des changements
echo "💾 Commit des changements..."
git commit -m "🚀 CVbien v1.0.0 - Production ready

✨ Features:
- AI-powered CV optimization with GPT-4o
- Real-time ATS score calculation  
- Professional PDF generation
- Stripe payment integration
- Multilingual support (FR/EN)
- Mobile-responsive design
- SEO optimized

🔐 Security:
- Environment variables for API keys
- No hardcoded secrets
- Production-ready configuration"

# Configuration du remote
echo "🔗 Configuration du remote GitHub..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Fatihbg/CVbien.git

# Push vers GitHub
echo "⬆️ Push vers GitHub..."
git push -u origin main --force

echo "✅ Déploiement terminé !"
echo "🌐 Repository: https://github.com/Fatihbg/CVbien"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Configurer les variables d'environnement sur Vercel"
echo "2. Déployer le backend sur Railway"
echo "3. Tester l'application en production"


