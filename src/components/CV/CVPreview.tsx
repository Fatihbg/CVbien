import React, { useState } from 'react';
import { useCVStore } from '../../store/cvStore';
import { Download, Edit3, Save, X } from 'lucide-react';
import { PDFGenerator } from '../../services/pdfGenerator';
import { useTranslation } from '../../hooks/useTranslation';

export const CVPreview: React.FC = () => {
  const { generatedCV, originalATSScore, generatedATSScore } = useCVStore();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { t } = useTranslation();
  // const [isEditing, setIsEditing] = useState(false);

  if (!generatedCV) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">4. Aperçu du CV</h3>
        <div className="text-center py-8 text-gray-500">
          Aucun CV généré à prévisualiser
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
    if (!generatedCV) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      // Simulation de progression
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      await PDFGenerator.generateCVPDF(JSON.stringify(generatedCV));
      
      // Finaliser la progression
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      // Réinitialiser après un délai
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 500);
      
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
        <h3 className="text-lg font-semibold">4. Aperçu du CV</h3>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            <span>
              {isDownloading ? `${t.main.downloadProgress} ${downloadProgress}%` : t.main.downloadPDF}
            </span>
          </button>
          
          {/* Barre de progression */}
          {isDownloading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Score ATS */}
      <div className="mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-1">{t.main.atsScore}</h4>
          <div className="text-2xl font-bold text-green-600">
            {generatedATSScore || 0}/100
          </div>
        </div>
      </div>

      {/* CV Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {renderEditableField('name', generatedCV.personalInfo.name, 'text-3xl font-bold text-gray-900')}
          <div className="mt-2 space-y-1">
            {renderEditableField('email', generatedCV.personalInfo.email, 'text-gray-600')}
            {renderEditableField('phone', generatedCV.personalInfo.phone, 'text-gray-600')}
            {renderEditableField('location', generatedCV.personalInfo.location, 'text-gray-600')}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Profil</h2>
          {renderEditableField('summary', generatedCV.summary, 'text-gray-700 leading-relaxed')}
        </div>

        {/* Experience */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Expérience professionnelle</h2>
          <div className="space-y-4">
            {generatedCV.experience.map((exp, index) => (
              <div key={index} className="border-l-4 border-primary-500 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    {renderEditableField(`exp-title-${index}`, exp.title, 'font-semibold text-gray-900')}
                    <div className="text-primary-600 font-medium">{exp.company}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                  </div>
                </div>
                {renderEditableField(`exp-desc-${index}`, exp.description, 'text-gray-700 text-sm')}
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Formation</h2>
          <div className="space-y-2">
            {generatedCV.education.map((edu, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  {renderEditableField(`edu-degree-${index}`, edu.degree, 'font-medium text-gray-900')}
                  <div className="text-gray-600">{edu.school}</div>
                </div>
                <div className="text-sm text-gray-500">{edu.graduationDate}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Compétences</h2>
          <div className="flex flex-wrap gap-2">
            {generatedCV.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
