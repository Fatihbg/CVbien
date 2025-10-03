import React, { useState } from 'react';
import { HelpCircle, X, FileText, Briefcase } from 'lucide-react';

export const HelpPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-50"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Guide d'utilisation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-600" />
              1. Télécharger votre CV
            </h3>
            <p className="text-gray-600 mb-2">
              Téléchargez votre CV au format PDF, DOCX ou TXT. L'application extraira automatiquement :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Informations personnelles (nom, email, téléphone)</li>
              <li>Résumé professionnel</li>
              <li>Expérience professionnelle</li>
              <li>Formation</li>
              <li>Compétences</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-primary-600" />
              2. Description du poste
            </h3>
            <p className="text-gray-600 mb-2">
              Collez la description complète du poste que vous visez. Incluez :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Titre du poste</li>
              <li>Nom de l'entreprise</li>
              <li>Description des responsabilités</li>
              <li>Compétences et exigences requises</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 text-primary-600">
              3. Génération du CV optimisé
            </h3>
            <p className="text-gray-600 mb-2">
              L'IA analysera votre CV et la description du poste pour générer un CV optimisé qui :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Adapte votre résumé au poste visé</li>
              <li>Met en avant les compétences pertinentes</li>
              <li>Optimise le score ATS (Applicant Tracking System)</li>
              <li>Conserve toutes vos informations authentiques</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 text-primary-600">
              4. Aperçu et téléchargement
            </h3>
            <p className="text-gray-600 mb-2">
              Vous pouvez :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Prévisualiser le CV généré</li>
              <li>Modifier le texte en cliquant dessus</li>
              <li>Comparer les scores ATS (original vs optimisé)</li>
              <li>Télécharger le CV en PDF</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Conseils</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Plus la description du poste est détaillée, meilleure sera l'optimisation</li>
              <li>• Vérifiez toujours le CV généré avant de l'envoyer</li>
              <li>• Les scores ATS vous donnent une indication de la compatibilité</li>
              <li>• Vous avez 3 crédits gratuits pour commencer</li>
            </ul>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={() => setIsOpen(false)}
            className="btn-primary w-full"
          >
            Compris, merci !
          </button>
        </div>
      </div>
    </div>
  );
};
