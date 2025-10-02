#!/bin/bash

echo "🚀 Installation et démarrage du backend Python avec LlamaIndex..."

# Aller dans le dossier backend
cd backend

# Créer un environnement virtuel s'il n'existe pas
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel
echo "🔧 Activation de l'environnement virtuel..."
source venv/bin/activate

# Installer les dépendances
echo "📚 Installation des dépendances..."
pip install -r requirements.txt

# Démarrer le serveur
echo "🌐 Démarrage du serveur backend sur http://localhost:8001"
python main.py

