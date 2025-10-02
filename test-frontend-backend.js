// Test direct frontend-backend
async function testFrontendBackend() {
    console.log('🧪 Test direct frontend-backend');
    
    const cvContent = `JEAN DUPONT
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
- Outils: VS Code, Git, Jira, Figma`;

    const jobDescription = `Développeur Full Stack Senior

Nous recherchons un développeur full stack senior pour rejoindre notre équipe.

Responsabilités:
- Développement d'applications web modernes
- Gestion d'équipe de développeurs
- Mise en place de solutions DevOps

Compétences requises:
- React, Node.js, TypeScript
- Docker, Kubernetes
- Bases de données (PostgreSQL, MongoDB)
- AWS, CI/CD

Expérience: 5+ ans`;

    try {
        console.log('📤 Envoi vers le backend Python...');
        
        const formData = new FormData();
        const cvBlob = new Blob([cvContent], { type: 'text/plain' });
        formData.append('cv_file', cvBlob, 'cv.txt');
        formData.append('job_offer', jobDescription);

        const response = await fetch('http://localhost:8001/optimize-cv', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erreur backend: ${response.status} ${response.statusText}`);
        }

        console.log('✅ Réponse reçue du backend Python');
        console.log('📄 Type de contenu:', response.headers.get('content-type'));
        
        const pdfBlob = await response.blob();
        console.log('📊 Taille du PDF:', pdfBlob.size, 'bytes');
        
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'test-cv-frontend-backend.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log('🎉 Test réussi ! PDF téléchargé');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

// Exécuter le test
testFrontendBackend();

