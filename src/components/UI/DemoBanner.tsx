import React from 'react';
import { Info } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-blue-900 mb-1">
            Mode Démonstration
          </h3>
          <p className="text-sm text-blue-700">
            Cette application fonctionne en mode démo. L'authentification, la génération de CV 
            et le système de crédits sont simulés. Pour une version complète, un backend 
            avec base de données et authentification réelle serait nécessaire.
          </p>
        </div>
      </div>
    </div>
  );
};
