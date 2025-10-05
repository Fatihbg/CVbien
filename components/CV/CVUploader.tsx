import React, { useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
// import { cvExtractionService } from '../../services/cvExtraction';
import { useCVStore } from '../../store/cvStore';

export const CVUploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setOriginalCV } = useCVStore();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Format de fichier non supporté. Utilisez PDF, TXT ou DOCX.');
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier est trop volumineux. Taille maximale : 10MB');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // En mode démo, on utilise des données d'exemple
      const demoCVData = {
        personalInfo: {
          name: 'Jean Dupont',
          email: 'jean.dupont@email.com',
          phone: '06 12 34 56 78',
          location: 'Paris, France',
          linkedin: 'linkedin.com/in/jeandupont',
          website: 'jeandupont.dev'
        },
        summary: 'Développeur Full-Stack avec 5 ans d\'expérience dans le développement d\'applications web modernes. Passionné par les technologies React, Node.js et les architectures cloud.',
        experience: [
          {
            title: 'Développeur Senior',
            company: 'TechCorp',
            location: 'Paris, France',
            startDate: '2021',
            endDate: '2024',
            current: false,
            description: 'Développement d\'applications web avec React et Node.js. Gestion d\'équipe de 3 développeurs et architecture de solutions cloud.'
          },
          {
            title: 'Développeur Full-Stack',
            company: 'StartupXYZ',
            location: 'Lyon, France',
            startDate: '2019',
            endDate: '2021',
            current: false,
            description: 'Développement de fonctionnalités frontend et backend. Intégration d\'APIs et optimisation des performances.'
          }
        ],
        education: [
          {
            degree: 'Master en Informatique',
            school: 'Université de Paris',
            location: 'Paris, France',
            graduationDate: '2019',
            gpa: 'Mention Bien'
          }
        ],
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Git', 'Agile'],
        certifications: [
          {
            name: 'AWS Certified Developer',
            issuer: 'Amazon Web Services',
            date: '2023'
          }
        ]
      };

      // Simuler le délai d'extraction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOriginalCV(demoCVData);
    } catch (err) {
      setError('Erreur lors de l\'extraction des données');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">1. Téléchargez votre CV</h3>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
            <p className="text-gray-600">Extraction des données en cours...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Glissez-déposez votre CV ici
            </p>
            <p className="text-sm text-gray-500 mb-4">
              ou cliquez pour sélectionner un fichier
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Sélectionner un fichier
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Formats supportés : PDF, TXT, DOCX (max 10MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};
