import React, { useState } from 'react';
import { useCVGenerationStore } from '../../store/cvGenerationStore';
import { Download, Edit3, Save, X } from 'lucide-react';
import { PDFGenerator } from '../../services/pdfGenerator';
import { useTranslation } from '../../hooks/useTranslation';
import { CVDisplay } from './CVDisplay';

export const CVPreview: React.FC = () => {
  const { generatedCV, atsScore, jobDescription } = useCVGenerationStore();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [parsedCVData, setParsedCVData] = useState<any>(null); // Stocker les données parsées
  const { t } = useTranslation();
  // const [isEditing, setIsEditing] = useState(false);

  if (!generatedCV) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">4. {t.main.previewTitle}</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-yellow-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-lg font-medium mb-2">{t.main.waitingForGeneration}</div>
          <div className="text-sm">{t.main.uploadInstructions}</div>
        </div>
      </div>
    );
  }

  const handleEditStart = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditingValue(currentValue);
      // setIsEditing(true);
  };

  const handleEditSave = () => {
    // Ici, on pourrait sauvegarder les modifications
    // Pour l'instant, on ferme juste l'édition
    setEditingField(null);
    setEditingValue('');
    // setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditingValue('');
    // setIsEditing(false);
  };

  const handleDownload = async () => {
    console.log('🚀 handleDownload appelé');
    console.log('📄 generatedCV:', generatedCV);
    console.log('📄 parsedCVData:', parsedCVData);
    
    if (!generatedCV || !parsedCVData) {
      console.log('❌ Aucun CV généré ou données parsées manquantes');
      return;
    }
    
    console.log('✅ Démarrage du téléchargement');
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      console.log('🔄 Démarrage de la progression');
      // Simulation de progression qui monte à 90%
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          console.log('📊 Progression:', prev + 15);
          if (prev >= 90) {
            clearInterval(progressInterval);
            console.log('📊 Progression arrêtée à 90%');
            return 90;
          }
          return prev + 15; // Plus rapide pour arriver à 90%
        });
      }, 150);
      
      // Attendre un peu à 90% pour simuler la génération PDF
      setTimeout(async () => {
        try {
          console.log('🎯 Génération PDF démarrée avec données parsées');
          // Utiliser les données parsées au lieu de l'IA
          await PDFGenerator.generateCVPDFFromParsedData(parsedCVData, jobDescription);
          console.log('✅ PDF généré avec succès');
          
          // Finaliser la progression
          setDownloadProgress(100);
          
          // Réinitialiser après un délai
          setTimeout(() => {
            setIsDownloading(false);
            setDownloadProgress(0);
          }, 800);
        } catch (error) {
          console.error('Erreur lors de la génération du PDF:', error);
          setIsDownloading(false);
          setDownloadProgress(0);
        }
      }, 1000); // Attendre 1 seconde à 90%
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const renderEditableField = (
    field: string,
    value: string,
    className: string = ''
  ) => {
    if (editingField === field) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-300 rounded"
            autoFocus
          />
          <button
            onClick={handleEditSave}
            className="p-1 text-green-600 hover:text-green-700"
          >
            <Save className="h-4 w-4" />
          </button>
          <button
            onClick={handleEditCancel}
            className="p-1 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="group flex items-center space-x-2">
        <span className={className}>{value}</span>
        <button
          onClick={() => handleEditStart(field, value)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600"
        >
          <Edit3 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">4. {t.main.previewTitle}</h3>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '700',
              background: isDownloading 
                ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              opacity: isDownloading ? 0.8 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            {isDownloading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span>{t.main.downloadProgress} {downloadProgress}%</span>
              </div>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>{t.main.downloadPDF}</span>
              </>
            )}
          </button>
          
        </div>
      </div>

      {/* Score ATS */}
      <div className="mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-1">{t.main.atsScore}</h4>
          <div className="text-2xl font-bold text-green-600">
            {atsScore || 0}/100
          </div>
        </div>
      </div>

      {/* CV Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-4xl mx-auto">
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '12px',
          minHeight: '400px'
        }}>
          <CVDisplay 
            cvText={generatedCV} 
            onDataParsed={setParsedCVData}
          />
        </div>
      </div>
    </div>
  );
};
