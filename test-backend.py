#!/usr/bin/env python3
"""
Test du backend Python avec LlamaIndex
"""

import requests
import json

def test_backend():
    print("🧪 Test du backend Python avec LlamaIndex")
    
    # Test 1: Vérifier que l'API est accessible
    print("\n1. Test de l'API...")
    try:
        response = requests.get("http://localhost:8001/")
        if response.status_code == 200:
            print("✅ API accessible")
            print(f"   Réponse: {response.json()}")
        else:
            print(f"❌ Erreur API: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur connexion API: {e}")
        return False
    
    # Test 2: Test avec un CV simple
    print("\n2. Test de génération de CV...")
    
    cv_content = """JEAN DUPONT
Développeur Full Stack Senior
jean.dupont@email.com | +33 6 12 34 56 78
Paris, France

PROFESSIONAL SUMMARY
Développeur expérimenté avec 5 ans d'expérience dans le développement web full stack. Expertise en React, Node.js, et bases de données. Passionné par les technologies modernes et l'innovation.

EXPERIENCE PROFESSIONNELLE
Développeur Senior - TechCorp (2020-2024)
- Développement d'applications web avec React et Node.js
- Gestion d'équipe de 3 développeurs
- Mise en place de CI/CD avec Docker et Kubernetes
- Amélioration des performances de 40%

FORMATION
Master en Informatique - Université Paris-Saclay (2016-2018)
Licence en Informatique - Université Paris-Diderot (2014-2016)

COMPETENCES TECHNIQUES
- Langages: JavaScript, TypeScript, Python, Java
- Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
- Backend: Node.js, Express.js, Django, Spring Boot
- Bases de données: PostgreSQL, MongoDB, Redis
- DevOps: Docker, Kubernetes, AWS, Git, CI/CD
- Outils: VS Code, Git, Jira, Figma

LANGUES
- Français: Natif
- Anglais: Courant (TOEIC 950)
- Espagnol: Intermédiaire"""

    job_description = """Développeur Full Stack Senior

Nous recherchons un développeur full stack senior pour rejoindre notre équipe dynamique.

Responsabilités:
- Développement d'applications web modernes
- Gestion d'équipe de développeurs
- Mise en place de solutions DevOps
- Optimisation des performances

Compétences requises:
- React, Node.js, TypeScript
- Docker, Kubernetes
- Bases de données (PostgreSQL, MongoDB)
- AWS, CI/CD
- Leadership d'équipe

Expérience: 5+ ans"""

    try:
        # Créer les données pour l'API
        files = {
            'cv_file': ('cv.txt', cv_content, 'text/plain')
        }
        data = {
            'job_offer': job_description
        }
        
        print("   Envoi de la requête...")
        response = requests.post("http://localhost:8001/optimize-cv", files=files, data=data)
        
        if response.status_code == 200:
            print("✅ CV généré avec succès")
            print(f"   Taille du PDF: {len(response.content)} bytes")
            print(f"   Type de contenu: {response.headers.get('content-type')}")
            
            # Sauvegarder le PDF pour vérification
            with open('test-cv-generated.pdf', 'wb') as f:
                f.write(response.content)
            print("   PDF sauvegardé: test-cv-generated.pdf")
            
        else:
            print(f"❌ Erreur génération CV: {response.status_code}")
            print(f"   Réponse: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de la génération: {e}")
        return False
    
    print("\n🎉 Tous les tests sont passés avec succès !")
    print("   Le backend Python avec LlamaIndex fonctionne parfaitement.")
    return True

if __name__ == "__main__":
    test_backend()

