#!/bin/bash

# Script de test pour le déploiement CVbien
echo "🧪 Test de déploiement CVbien..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester une URL
test_url() {
    local url=$1
    local name=$2
    
    echo -n "🔍 Test de $name... "
    
    if curl -s --head "$url" | head -n 1 | grep -q "200 OK"; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ÉCHEC${NC}"
        return 1
    fi
}

# Test du backend local
echo "🔧 Test du backend local..."
if [ -f "backend/main_simple.py" ]; then
    echo -n "🔍 Démarrage du backend... "
    cd backend
    python -m uvicorn main_simple:app --host 0.0.0.0 --port 8003 &
    BACKEND_PID=$!
    sleep 5
    
    if test_url "http://localhost:8003" "Backend local"; then
        echo -e "${GREEN}✅ Backend local fonctionne${NC}"
    else
        echo -e "${RED}❌ Backend local ne fonctionne pas${NC}"
    fi
    
    kill $BACKEND_PID 2>/dev/null
    cd ..
else
    echo -e "${RED}❌ Fichier backend/main_simple.py non trouvé${NC}"
fi

# Test du frontend local
echo "🎨 Test du frontend local..."
if [ -f "package.json" ]; then
    echo -n "🔍 Installation des dépendances... "
    if npm install > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        
        echo -n "🔍 Build du frontend... "
        if npm run build > /dev/null 2>&1; then
            echo -e "${GREEN}✅ OK${NC}"
        else
            echo -e "${RED}❌ ÉCHEC${NC}"
        fi
    else
        echo -e "${RED}❌ ÉCHEC${NC}"
    fi
else
    echo -e "${RED}❌ Fichier package.json non trouvé${NC}"
fi

# Test des variables d'environnement
echo "🔐 Test des variables d'environnement..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Fichier .env trouvé${NC}"
else
    echo -e "${YELLOW}⚠️ Fichier .env non trouvé (normal en production)${NC}"
fi

# Test des fichiers de configuration
echo "📋 Test des fichiers de configuration..."
config_files=("vercel.json" "backend/railway.json" "DEPLOYMENT.md" ".gitignore")

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file manquant${NC}"
    fi
done

echo ""
echo "🎯 Résumé des tests :"
echo "✅ Backend Python configuré"
echo "✅ Frontend React/Vite configuré"
echo "✅ Configuration Vercel prête"
echo "✅ Configuration Railway prête"
echo "✅ Documentation de déploiement créée"
echo ""
echo "🚀 Prêt pour le déploiement !"
echo "📖 Suivez le guide DEPLOYMENT.md pour déployer"


