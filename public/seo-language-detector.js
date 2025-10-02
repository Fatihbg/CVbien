/**
 * CVbien - Détecteur de langue pour SEO multilingue
 * Détecte la langue du navigateur et adapte le contenu SEO
 */

(function() {
    'use strict';
    
    // Détection de la langue
    function detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const lang = browserLang.split('-')[0].toLowerCase();
        
        // Langues supportées
        const supportedLangs = ['fr', 'en'];
        
        // Retourner la langue détectée ou français par défaut
        return supportedLangs.includes(lang) ? lang : 'fr';
    }
    
    // Mise à jour des meta tags selon la langue
    function updateMetaTags(lang) {
        const isEnglish = lang === 'en';
        
        // Mise à jour du titre
        const title = isEnglish 
            ? 'CVbien - AI Resume Generator | ATS Score & PDF'
            : 'CVbien - Générateur de CV | Score ATS & PDF';
        document.title = title;
        
        // Mise à jour de la description
        const description = isEnglish
            ? '🚀 Free AI Resume Generator - Create professional ATS-optimized CVs in minutes. Analyze your resume, get ATS score and download your optimized CV as PDF.'
            : '🚀 Générateur de CV gratuit avec IA - Créez un CV professionnel optimisé ATS en quelques clics. Analysez votre CV, obtenez un score ATS et téléchargez votre CV optimisé au format PDF.';
        
        updateMetaContent('description', description);
        
        // Mise à jour des mots-clés
        const keywords = isEnglish
            ? 'resume generator, cv maker online, ATS resume, professional cv, AI cv builder, resume builder free, cv template, resume optimization, job application, career tools, resume writing, cv creator, professional resume, ATS friendly resume, resume maker, cv generator, resume builder, cv template free, professional cv maker, AI resume builder, resume optimizer, cv writing service, resume help, career development, job search tools, resume assistance, cv optimization, ATS score, resume checker, cv review, professional resume builder, resume maker online, cv creator free, resume template, cv design, job application tools, career builder, resume writing service, cv assistance, professional cv template, resume generator free, cv maker app, resume builder app, cv creator app, professional resume maker, AI cv generator, resume optimization tool, cv writing tool, job search assistance, career tools online, resume help online, cv help online, professional resume service, cv writing service, resume writing help, cv writing help, job application help, career guidance, resume tips, cv tips, professional development, job search tools, career advancement, resume improvement, cv improvement, ATS optimization, resume ATS, cv ATS, job application optimization, career success, professional growth, resume success, cv success, job search success, career success tools, professional success, resume success tips, cv success tips, job application success, career advancement tools, professional development tools, resume development, cv development, career development tools, professional growth tools, resume growth, cv growth, job search growth, career growth, professional advancement, resume advancement, cv advancement, job application advancement'
            : 'générateur cv gratuit, créer cv en ligne, cv IA, optimisation cv ATS, score ATS, cv professionnel, générateur cv intelligence artificielle, créer cv pdf, cv maker, cv builder, resume generator, cv maker online, ATS resume, professional cv, AI cv builder, resume builder free, cv template, resume optimization, job application, career tools, resume writing, cv creator, professional resume, ATS friendly resume, resume maker, cv generator, resume builder, cv template free, professional cv maker, AI resume builder, resume optimizer, cv writing service, resume help, career development, job search tools, resume assistance, cv optimization, ATS score, resume checker, cv review, professional resume builder, resume maker online, cv creator free, resume template, cv design, job application tools, career builder, resume writing service, cv assistance, professional cv template, resume generator free, cv maker app, resume builder app, cv creator app, professional resume maker, AI cv generator, resume optimization tool, cv writing tool, job search assistance, career tools online, resume help online, cv help online, professional resume service, cv writing service, resume writing help, cv writing help, job application help, career guidance, resume tips, cv tips, professional development, job search tools, career advancement, resume improvement, cv improvement, ATS optimization, resume ATS, cv ATS, job application optimization, career success, professional growth, resume success, cv success, job search success, career success tools, professional success, resume success tips, cv success tips, job application success, career advancement tools, professional development tools, resume development, cv development, career development tools, professional growth tools, resume growth, cv growth, job search growth, career growth, professional advancement, resume advancement, cv advancement, job application advancement';
        
        updateMetaContent('keywords', keywords);
        
        // Mise à jour des balises Open Graph
        const ogTitle = isEnglish
            ? 'CVbien - AI Resume Generator | Professional CV Maker'
            : 'CVbien - Générateur de CV | Créateur de CV Professionnel';
        
        const ogDescription = isEnglish
            ? 'Create professional ATS-optimized CVs in minutes with AI. Analyze your resume, get ATS score and download your optimized CV as PDF.'
            : 'Créez un CV professionnel optimisé ATS en quelques clics. Analysez votre CV, obtenez un score ATS et téléchargez votre CV optimisé au format PDF.';
        
        updateMetaProperty('og:title', ogTitle);
        updateMetaProperty('og:description', ogDescription);
        updateMetaProperty('og:locale', isEnglish ? 'en_US' : 'fr_FR');
        
        // Mise à jour des balises Twitter
        updateMetaProperty('twitter:title', ogTitle);
        updateMetaProperty('twitter:description', ogDescription);
        
        // Mise à jour de l'attribut lang du HTML
        document.documentElement.lang = lang;
        document.documentElement.setAttribute('data-lang', lang);
    }
    
    // Fonction utilitaire pour mettre à jour le contenu des meta tags
    function updateMetaContent(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }
    
    // Fonction utilitaire pour mettre à jour les propriétés des meta tags
    function updateMetaProperty(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.content = content;
    }
    
    // Initialisation
    function init() {
        const detectedLang = detectLanguage();
        updateMetaTags(detectedLang);
        
        // Stocker la langue détectée pour l'application
        window.cvbienLang = detectedLang;
        
        // Émettre un événement personnalisé
        window.dispatchEvent(new CustomEvent('cvbien:langDetected', {
            detail: { language: detectedLang }
        }));
    }
    
    // Exécuter au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Exposer la fonction de détection pour l'application
    window.cvbienDetectLanguage = detectLanguage;
    window.cvbienUpdateMetaTags = updateMetaTags;
    
})();
