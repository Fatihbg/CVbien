FROM python:3.11-slim

WORKDIR /app

# Copier requirements.txt d'abord pour le cache Docker
COPY backend/requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code backend
COPY backend/ .

# Exposer le port
EXPOSE 8000

# Commande de démarrage
CMD ["uvicorn", "main_auth:app", "--host", "0.0.0.0", "--port", "8000"]