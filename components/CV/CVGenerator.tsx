import React, { useState } from 'react';
import { useCVStore } from '../../store/cvStore';
import { useAuthStore } from '../../store/authStore';
// import { cvGenerationService } from '../../services/cvGeneration';
// import { apiService } from '../../services/api';
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export const CVGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { 
    originalCV, 
    jobDescription, 
    setGeneratedCV, 
    setATSScores, 
    // setGenerating 
  } = useCVStore();

  const { user } = useAuthStore();

  const handleGenerate = async () => {
    if (!originalCV || !jobDescription || !user) return;

    if (user.credits < 1) {
      setError('Vous n\'avez plus de crédits. Veuillez en acheter pour continuer.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess(false);

    try {
      // En mode démo, on génère un CV optimisé simulé
      const generatedCV = {
        ...originalCV,
        summary: `Développeur Full-Stack expert avec 5 ans d'expérience spécialisé dans ${jobDescription.title.toLowerCase()}. Expertise approfondie en React, TypeScript, et Node.js avec une forte expérience en ${jobDescription.requirements.join(', ').toLowerCase()}. Passionné par l'innovation technologique et les architectures cloud modernes.`,
        experience: originalCV.experience.map(exp => ({
          ...exp,
          description: `${exp.description} ${jobDescription.requirements.some(req => 
            exp.description.toLowerCase().includes(req.toLowerCase())
          ) ? 'Expertise confirmée en ' + jobDescription.requirements.join(', ') + '.' : ''}`
        })),
        skills: [...originalCV.skills, ...jobDescription.requirements.filter(req => 
          !originalCV.skills.some(skill => 
            skill.toLowerCase().includes(req.toLowerCase())
          )
        )]
      };
      
      // Calculer les scores ATS simulés
      const originalScore = 65; // Score simulé
      const generatedScore = 92; // Score optimisé simulé

      // Sauvegarder les résultats
      setGeneratedCV(generatedCV);
      setATSScores(originalScore, generatedScore);

      // Décrémenter les crédits (simulation - dans un vrai projet, ceci serait fait côté serveur)
      // updateCredits(user.credits - 1); // TODO: Implémenter la déduction de crédits

      setSuccess(true);
    } catch (err) {
      setError('Erreur lors de la génération du CV. Veuillez réessayer.');
      console.error('Erreur de génération:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = originalCV && jobDescription && user && user.credits > 0;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">3. Génération du CV optimisé</h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">IA de génération</span>
          </div>
          <p className="text-sm text-blue-700">
            Notre IA va analyser votre CV et la description du poste pour générer 
            un CV parfaitement adapté avec un score ATS optimisé.
          </p>
        </div>

        {user && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Crédits disponibles :</span>
              <span className="text-lg font-bold text-primary-600">{user.credits}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Coût : 1 crédit par génération
            </p>
          </div>
        )}

        {!canGenerate && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-700">
                {!originalCV && 'Veuillez d\'abord télécharger votre CV. '}
                {!jobDescription && 'Veuillez d\'abord saisir la description du poste. '}
                {user && user.credits === 0 && 'Vous n\'avez plus de crédits disponibles.'}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-green-700">
                CV généré avec succès ! Vous pouvez maintenant le prévisualiser et le télécharger.
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            canGenerate && !isGenerating
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Génération en cours...
            </div>
          ) : (
            'Générer le CV optimisé'
          )}
        </button>
      </div>
    </div>
  );
};
