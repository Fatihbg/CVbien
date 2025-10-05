import React, { useState } from 'react';
import { useCVStore } from '../../store/cvStore';
import type { JobDescription } from '../../store/cvStore';

export const JobDescriptionInput: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  
  const { setJobDescription } = useCVStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requirementsList = requirements
      .split('\n')
      .map(req => req.trim())
      .filter(req => req.length > 0);

    const jobData: JobDescription = {
      title: jobTitle,
      company,
      location,
      description,
      requirements: requirementsList,
    };

    setJobDescription(jobData);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">2. Description du poste</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Titre du poste *
            </label>
            <input
              type="text"
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="input-field"
              placeholder="Ex: Développeur React Senior"
              required
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Entreprise *
            </label>
            <input
              type="text"
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="input-field"
              placeholder="Ex: TechCorp"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Localisation
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-field"
            placeholder="Ex: Paris, France"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description du poste *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field min-h-[120px] resize-y"
            placeholder="Collez ici la description complète du poste..."
            required
          />
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
            Exigences et compétences requises
          </label>
          <textarea
            id="requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="input-field min-h-[100px] resize-y"
            placeholder="Listez les compétences requises (une par ligne)&#10;Ex:&#10;React&#10;TypeScript&#10;Node.js&#10;PostgreSQL"
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
        >
          Valider la description
        </button>
      </form>
    </div>
  );
};
