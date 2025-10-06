#!/bin/bash

# Script pour pousser vers GitHub avec authentification
echo "🚀 Push vers GitHub..."

# Configuration Git
git config --global user.name "Fatih"
git config --global user.email "fatih@cvbien.app"

# Vérifier le statut
echo "📊 Statut du repository:"
git status

# Ajouter tous les fichiers
echo "📦 Ajout des fichiers..."
git add .

# Commit
echo "💾 Commit..."
git commit -m "🚀 CVbien v1.0.0 - Production Ready

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
- Production-ready configuration

📚 Documentation:
- Complete deployment guide
- Vercel and Railway configuration
- Testing scripts
- Comprehensive README"

# Configuration du remote
echo "🔗 Configuration du remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Fatihbg/CVbien.git

# Push avec force (pour écraser l'historique)
echo "⬆️ Push vers GitHub..."
git push -u origin main --force

echo "✅ Push terminé !"
echo "🌐 Repository: https://github.com/Fatihbg/CVbien"
echo ""
echo "📋 Prochaines étapes:"
echo "1. 🌐 Aller sur https://vercel.com"
echo "2. 🔗 Importer le repository GitHub"
echo "3. ⚙️ Configurer les variables d'environnement"
echo "4. 🚀 Déployer le frontend"
echo "5. 🔧 Déployer le backend sur Railway"
echo ""
echo "📖 Suivez le guide DEPLOYMENT.md pour plus de détails"


