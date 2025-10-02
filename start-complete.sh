#!/bin/bash

echo "🚀 Démarrage de l'application CV Optimizer complète"
echo "   - Backend Python avec LlamaIndex"
echo "   - Frontend React avec design Apple-style"
echo ""

# Fonction pour vérifier si un port est utilisé
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 déjà utilisé"
        return 1
    else
        echo "✅ Port $1 libre"
        return 0
    fi
}

# Vérifier les ports
echo "🔍 Vérification des ports..."
check_port 8001 || { echo "❌ Port 8001 occupé. Arrêtez le processus et relancez."; exit 1; }
check_port 5175 || { echo "❌ Port 5175 occupé. Arrêtez le processus et relancez."; exit 1; }

# Démarrer le backend Python
echo ""
echo "🐍 Démarrage du backend Python..."
cd backend
source venv/bin/activate
python main_simple.py &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
echo "⏳ Attente du démarrage du backend..."
sleep 5

# Vérifier que le backend fonctionne
if curl -s http://localhost:8001 > /dev/null; then
    echo "✅ Backend Python démarré avec succès"
else
    echo "❌ Erreur: Backend Python non accessible"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Démarrer le frontend React
echo ""
echo "⚛️  Démarrage du frontend React..."
npm run dev &
FRONTEND_PID=$!

# Attendre que le frontend soit prêt
echo "⏳ Attente du démarrage du frontend..."
sleep 5

# Vérifier que le frontend fonctionne
if curl -s http://localhost:5175 > /dev/null; then
    echo "✅ Frontend React démarré avec succès"
else
    echo "❌ Erreur: Frontend React non accessible"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Application CV Optimizer démarrée avec succès !"
echo ""
echo "📱 Frontend: http://localhost:5175"
echo "🔧 Backend:  http://localhost:8001"
echo ""
echo "💡 Pour arrêter l'application, appuyez sur Ctrl+C"
echo ""

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt de l'application..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Application arrêtée"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Attendre indéfiniment
while true; do
    sleep 1
done

