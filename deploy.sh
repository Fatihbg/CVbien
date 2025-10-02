#!/bin/bash

# Script de déploiement pour CVbien
echo "🚀 Déploiement de CVbien..."

# 1. Installer les dépendances frontend
echo "📦 Installation des dépendances frontend..."
npm install

# 2. Build du frontend
echo "🏗️ Build du frontend..."
npm run build

# 3. Installer les dépendances backend
echo "🐍 Installation des dépendances backend..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Configuration de production
echo "⚙️ Configuration de production..."
cp .env.production .env

# 5. Initialisation de la base de données
echo "🗄️ Initialisation de la base de données..."
python init_db.py

echo "✅ Déploiement terminé !"
echo "🌐 Pour démarrer l'application :"
echo "   Frontend: npm run preview"
echo "   Backend: cd backend && source venv/bin/activate && python main_auth.py"

