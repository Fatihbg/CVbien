/**
 * CVbien - Système de traduction multilingue
 * Traductions françaises et anglaises
 */

export interface Translations {
  // Header
  header: {
    title: string;
    disconnected: string;
    credits: string;
    profile: string;
    logout: string;
  };
  
  // Main content
    main: {
      title: string;
      subtitle: string;
      uploadTitle: string;
      uploadSubtitle: string;
      dragDrop: string;
      or: string;
      selectFile: string;
      jobDescriptionTitle: string;
      jobDescriptionPlaceholder: string;
      generateButton: string;
      creditInfo: string;
      downloadPDF: string;
      editCV: string;
      previewTitle: string;
      atsScore: string;
      initialATSScore: string;
      optimizedATSScore: string;
      improvements: string;
      advice: string;
      improvementsExplanation: string;
      downloadProgress: string;
      waitingForGeneration: string;
      uploadInstructions: string;
      improvementItems: {
        structure: string;
        keywords: string;
        content: string;
        metrics: string;
        style: string;
        preserved: string;
        training: string;
      };
    };
  
  // Auth modal
  auth: {
    login: string;
    register: string;
    email: string;
    password: string;
    confirmPassword: string;
    loginButton: string;
    registerButton: string;
    switchToRegister: string;
    switchToLogin: string;
    forgotPassword: string;
    loginSuccess: string;
    registerSuccess: string;
    loginError: string;
    registerError: string;
    emailRequired: string;
    passwordRequired: string;
    passwordMinLength: string;
    passwordsMatch: string;
    emailInvalid: string;
    emailExists: string;
  };
  
  // Payment modal
  payment: {
    title: string;
    buyCredits: string;
    creditPack: string;
    price: string;
    buyButton: string;
    cancel: string;
    success: string;
    error: string;
  };
  
  // User profile
  profile: {
    title: string;
    email: string;
    credits: string;
    subscription: string;
    save: string;
    cancel: string;
    success: string;
    error: string;
  };
  
  // Mobile recommendation
  mobile: {
    title: string;
    message: string;
    understand: string;
  };
  
  // Help modal
  help: {
    title: string;
    close: string;
    content: string;
  };
  
  // User menu
  userMenu: {
    profile: string;
    credits: string;
    logout: string;
  };
  
  // Mobile menu
  mobileMenu: {
    credits: string;
    addCredits: string;
    profile: string;
    logout: string;
    language: string;
  };
  
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    close: string;
    save: string;
    cancel: string;
    retry: string;
  };
}

export const translations: Record<string, Translations> = {
  fr: {
    header: {
      title: "CVbien",
      disconnected: "Déconnecté",
      credits: "crédits",
      profile: "Profil",
      logout: "Déconnexion"
    },
    main: {
      title: "Générateur de CV avec IA",
      subtitle: "Créez un CV professionnel optimisé ATS en quelques clics",
      uploadTitle: "1. Téléchargez votre CV",
      uploadSubtitle: "PDF, DOCX ou TXT",
      dragDrop: "Glissez-déposez votre fichier ici",
      or: "ou",
      selectFile: "Sélectionner un fichier",
      jobDescriptionTitle: "2. Collez l'offre d'emploi",
      jobDescriptionPlaceholder: "Copiez-collez ici l'offre d'emploi pour laquelle vous postulez...",
      generateButton: "Générer monn CV optimisé",
      creditInfo: "1 crédit",
      downloadPDF: "Télécharger le PDF",
      editCV: "Modifier le CV",
      previewTitle: "Aperçu de votre CV optimisé",
      atsScore: "Score ATS",
      initialATSScore: "Score ATS Initial",
      optimizedATSScore: "Score ATS Optimisé",
      improvements: "Améliorations apportées",
      advice: "💡 Conseil : Plus il y a de chiffres (%, €, années), de liens (LinkedIn, portfolio) et de mots-clés de l'offre, plus le score ATS est élevé !",
      improvementsExplanation: "L'objectif de ce nouveau CV n'est pas d'être le plus beau/esthétique possible, mais d'être optimisé au maximum dans une structure professionnelle et claire.",
      downloadProgress: "Téléchargement...",
      waitingForGeneration: "En attente de génération",
      uploadInstructions: "Uploadez votre CV et saisissez la description du poste pour commencer",
      improvementItems: {
        structure: "CV optimisé avec une structure professionnelle",
        keywords: "Mots-clés ATS intégrés",
        content: "Contenu adapté au poste recherché",
        metrics: "Métriques et chiffres ajoutés",
        style: "Style professionnel appliqué",
        preserved: "Toutes les informations originales conservées",
        training: "Formations enrichies avec liens au poste"
      }
    },
    auth: {
      login: "Connexion",
      register: "Inscription",
      email: "Adresse e-mail",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      loginButton: "Se connecter",
      registerButton: "S'inscrire",
      switchToRegister: "Pas de compte ? S'inscrire",
      switchToLogin: "Déjà un compte ? Se connecter",
      forgotPassword: "Mot de passe oublié ?",
      loginSuccess: "Connexion réussie !",
      registerSuccess: "Inscription réussie !",
      loginError: "Erreur de connexion",
      registerError: "Erreur d'inscription",
      emailRequired: "L'e-mail est requis",
      passwordRequired: "Le mot de passe est requis",
      passwordMinLength: "Le mot de passe doit contenir au moins 6 caractères",
      passwordsMatch: "Les mots de passe ne correspondent pas",
      emailInvalid: "Adresse e-mail invalide",
      emailExists: "Cette adresse e-mail existe déjà"
    },
    payment: {
      title: "Acheter des crédits",
      buyCredits: "Acheter des crédits",
      creditPack: "Pack de 10 crédits",
      price: "9,99 €",
      buyButton: "Acheter maintenant",
      cancel: "Annuler",
      success: "Paiement réussi !",
      error: "Erreur de paiement"
    },
    profile: {
      title: "Mon Profil",
      email: "E-mail",
      credits: "Crédits",
      subscription: "Abonnement",
      save: "Sauvegarder",
      cancel: "Annuler",
      success: "Profil mis à jour !",
      error: "Erreur de mise à jour"
    },
    mobile: {
      title: "Recommandation",
      message: "Pour une meilleure expérience, nous recommandons d'utiliser CVbien sur un ordinateur.",
      understand: "J'ai compris"
    },
    help: {
      title: "Aide",
      close: "Fermer",
      content: "CVbien est un générateur de CV intelligent qui utilise l'IA pour optimiser votre CV selon les offres d'emploi. Uploadez votre CV, collez une offre d'emploi, et obtenez un CV optimisé avec un score ATS."
    },
    userMenu: {
      profile: "Profil",
      credits: "Crédits",
      logout: "Déconnexion"
    },
    mobileMenu: {
      credits: "Crédits",
      addCredits: "Ajouter des crédits",
      profile: "Profil",
      logout: "Déconnexion",
      language: "Langue"
    },
    common: {
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      close: "Fermer",
      save: "Sauvegarder",
      cancel: "Annuler",
      retry: "Réessayer"
    }
  },
  
  en: {
    header: {
      title: "CVbien",
      disconnected: "Disconnected",
      credits: "credits",
      profile: "Profile",
      logout: "Logout"
    },
    main: {
      title: "AI Resume Generator",
      subtitle: "Create professional ATS-optimized CVs in minutes",
      uploadTitle: "1. Upload your resume",
      uploadSubtitle: "PDF, DOCX or TXT",
      dragDrop: "Drag and drop your file here",
      or: "or",
      selectFile: "Select a file",
      jobDescriptionTitle: "2. Paste the job offer",
      jobDescriptionPlaceholder: "Copy and paste the job offer you're applying for here...",
      generateButton: "Generate my optimized resume",
      creditInfo: "1 credit",
      downloadPDF: "Download PDF",
      editCV: "Edit resume",
      previewTitle: "Resume Preview",
      atsScore: "ATS Score",
      initialATSScore: "Initial ATS Score",
      optimizedATSScore: "Optimized ATS Score",
      improvements: "Improvements made",
      advice: "💡 Tip: More numbers (%, $, years), links (LinkedIn, portfolio) and job offer keywords lead to a higher ATS score!",
      improvementsExplanation: "The goal of this new resume is not to be the most beautiful/aesthetic possible, but to be optimized to the maximum in a professional and clear structure.",
      downloadProgress: "Downloading...",
      waitingForGeneration: "Waiting for generation",
      uploadInstructions: "Upload your resume and enter the job description to start",
      improvementItems: {
        structure: "Professionally structured optimized resume",
        keywords: "Integrated ATS keywords",
        content: "Content adapted to the desired position",
        metrics: "Added metrics and figures",
        style: "Applied professional style",
        preserved: "All original information preserved",
        training: "Enriched training with links to the position"
      }
    },
    auth: {
      login: "Login",
      register: "Register",
      email: "Email address",
      password: "Password",
      confirmPassword: "Confirm password",
      loginButton: "Sign in",
      registerButton: "Sign up",
      switchToRegister: "No account? Sign up",
      switchToLogin: "Already have an account? Sign in",
      forgotPassword: "Forgot password?",
      loginSuccess: "Login successful!",
      registerSuccess: "Registration successful!",
      loginError: "Login error",
      registerError: "Registration error",
      emailRequired: "Email is required",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 6 characters",
      passwordsMatch: "Passwords don't match",
      emailInvalid: "Invalid email address",
      emailExists: "This email address already exists"
    },
    payment: {
      title: "Buy credits",
      buyCredits: "Buy credits",
      creditPack: "10 credits pack",
      price: "$9.99",
      buyButton: "Buy now",
      cancel: "Cancel",
      success: "Payment successful!",
      error: "Payment error"
    },
    profile: {
      title: "My Profile",
      email: "Email",
      credits: "Credits",
      subscription: "Subscription",
      save: "Save",
      cancel: "Cancel",
      success: "Profile updated!",
      error: "Update error"
    },
    mobile: {
      title: "Recommendation",
      message: "For a better experience, we recommend using CVbien on a computer.",
      understand: "I understand"
    },
    help: {
      title: "Help",
      close: "Close",
      content: "CVbien is an intelligent resume generator that uses AI to optimize your resume according to job offers. Upload your resume, paste a job offer, and get an optimized resume with an ATS score."
    },
    userMenu: {
      profile: "Profile",
      credits: "Credits",
      logout: "Logout"
    },
    mobileMenu: {
      credits: "Credits",
      addCredits: "Add credits",
      profile: "Profile",
      logout: "Logout",
      language: "Language"
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      close: "Close",
      save: "Save",
      cancel: "Cancel",
      retry: "Retry"
    }
  }
};
