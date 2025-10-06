#!/bin/bash

# Script de vérification avant déploiement
echo "🔍 Vérification avant déploiement CVbien..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Compteurs
PASSED=0
FAILED=0

# Fonction de test
test_file() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $name${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $name manquant${NC}"
        ((FAILED++))
    fi
}

echo -e "${BLUE}📁 Vérification des fichiers essentiels...${NC}"

# Fichiers frontend
test_file "package.json" "package.json"
test_file "vite.config.ts" "Configuration Vite"
test_file "src/main.tsx" "Point d'entrée React"
test_file "src/App.tsx" "Composant principal"
test_file "src/pages/HomePage.tsx" "Page d'accueil"

# Fichiers backend
test_file "backend/main_simple.py" "API FastAPI"
test_file "backend/requirements.txt" "Dépendances Python"
test_file "backend/railway.json" "Configuration Railway"

# Fichiers de configuration
test_file "vercel.json" "Configuration Vercel"
test_file ".gitignore" "Git ignore"
test_file "DEPLOYMENT.md" "Guide de déploiement"
test_file "README.md" "Documentation"

# Fichiers de sécurité
test_file "env.production.example" "Exemple de variables d'env"

echo ""
echo -e "${BLUE}🔐 Vérification de la sécurité...${NC}"

# Vérifier qu'il n'y a pas de clés hardcodées
if grep -r "sk-" src/ --exclude-dir=node_modules 2>/dev/null | grep -v "sk-.*example" > /dev/null; then
    echo -e "${RED}❌ Clés API détectées dans le code source${NC}"
    ((FAILED++))
else
    echo -e "${GREEN}✅ Aucune clé API hardcodée${NC}"
    ((PASSED++))
fi

# Vérifier les variables d'environnement
if grep -r "process.env\|import.meta.env" src/ > /dev/null; then
    echo -e "${GREEN}✅ Variables d'environnement utilisées${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Variables d'environnement non utilisées${NC}"
    ((FAILED++))
fi

echo ""
echo -e "${BLUE}🧪 Test de build...${NC}"

# Test build frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build frontend réussi${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Build frontend échoué${NC}"
    ((FAILED++))
fi

# Test import Python
if python3 -c "import sys; sys.path.append('backend'); import main_simple" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Import Python réussi${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Import Python échoué${NC}"
    ((FAILED++))
fi

echo ""
echo -e "${BLUE}📊 Résumé des tests...${NC}"
echo -e "✅ Tests réussis: ${GREEN}$PASSED${NC}"
echo -e "❌ Tests échoués: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Tous les tests sont passés !${NC}"
    echo -e "${BLUE}🚀 Prêt pour le déploiement !${NC}"
    echo ""
    echo -e "${YELLOW}📋 Prochaines étapes:${NC}"
    echo "1. Exécuter: ./push-to-github.sh"
    echo "2. Aller sur https://vercel.com"
    echo "3. Importer le repository GitHub"
    echo "4. Configurer les variables d'environnement"
    echo "5. Déployer le frontend"
    echo "6. Déployer le backend sur Railway"
    echo ""
    echo -e "${BLUE}📖 Guide complet: DEPLOYMENT.md${NC}"
else
    echo ""
    echo -e "${RED}❌ Des tests ont échoué. Corrigez les erreurs avant le déploiement.${NC}"
    exit 1
fi


