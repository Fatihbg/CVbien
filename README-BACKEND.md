# CV Optimizer - Solution Complète avec Backend Python

## 🚀 Architecture

Cette solution utilise :
- **Frontend React** : Interface utilisateur moderne
- **Backend Python** : API FastAPI avec LlamaIndex pour l'extraction
- **OpenAI GPT-4o** : Génération de CV optimisés
- **ReportLab** : Génération de PDF professionnels

## 📋 Prérequis

- Python 3.8+
- Node.js 16+
- Clé API OpenAI

## 🛠️ Installation et Démarrage

### 1. Backend Python (avec LlamaIndex)

```bash
# Démarrer le backend Python
./start-backend.sh
```

Le backend sera disponible sur http://localhost:8001

### 2. Frontend React

```bash
# Dans un autre terminal
npm run dev
```

Le frontend sera disponible sur http://localhost:5175

## 🔧 Fonctionnalités

### Backend Python
- ✅ **LlamaIndex** : Extraction intelligente des données CV
- ✅ **FastAPI** : API REST performante
- ✅ **OpenAI GPT-4o** : Génération de CV optimisés
- ✅ **ReportLab** : PDF professionnels
- ✅ **CORS** : Compatible avec le frontend React

### Frontend React
- ✅ **Interface Apple-style** : Design minimaliste et professionnel
- ✅ **Drag & Drop** : Upload facile des fichiers
- ✅ **Barre de progression** : Suivi de la génération
- ✅ **PWA** : Application web progressive
- ✅ **3 cadres** : Upload CV, Description poste, Aperçu CV

## 📊 Utilisation

1. **Démarrez le backend** : `./start-backend.sh`
2. **Démarrez le frontend** : `npm run dev`
3. **Ouvrez** http://localhost:5175
4. **Uploadez** votre CV (PDF ou TXT)
5. **Ajoutez** une description de poste
6. **Générez** votre CV optimisé !

## 🎯 Avantages de cette Solution

- **LlamaIndex réel** : Extraction professionnelle des données
- **Code Python éprouvé** : Basé sur votre code qui fonctionne
- **PDF parfait** : Génération identique à votre version Python
- **Interface moderne** : React avec design Apple-style
- **Performance** : Backend Python + Frontend React optimisés

## 🔍 Debug

### Backend
```bash
cd backend
source venv/bin/activate
python main.py
```

### Frontend
```bash
npm run dev
```

### Logs
- Backend : Terminal où vous avez lancé `./start-backend.sh`
- Frontend : Console du navigateur (F12)

## 📁 Structure

```
cv-generator-pwa/
├── backend/                 # API Python avec LlamaIndex
│   ├── main.py             # Serveur FastAPI
│   ├── requirements.txt    # Dépendances Python
│   └── venv/              # Environnement virtuel
├── src/                    # Frontend React
│   ├── services/
│   │   └── openaiService.ts # Service OpenAI
│   └── ...
├── start-backend.sh        # Script de démarrage backend
└── README-BACKEND.md       # Ce fichier
```

## 🚨 Résolution de Problèmes

### Backend ne démarre pas
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Frontend ne se connecte pas au backend
- Vérifiez que le backend est sur http://localhost:8001
- Vérifiez les logs du backend
- Vérifiez la console du navigateur

### Erreur LlamaIndex
- Vérifiez que Python 3.8+ est installé
- Vérifiez que toutes les dépendances sont installées
- Vérifiez les logs du backend

## 🎉 Résultat

Vous obtenez :
- **CV optimisé** avec les vraies données de votre CV
- **PDF professionnel** généré avec ReportLab
- **Score ATS élevé** grâce à l'optimisation
- **Interface moderne** et intuitive
- **Performance maximale** avec LlamaIndex

