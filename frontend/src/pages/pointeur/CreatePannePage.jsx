// src/pages/pointeur/CreatePannePage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pannesAPI } from '../../api/pannes.api';
import { materielsAPI } from '../../api/materiels.api';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function CreatePannePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [materiels, setMateriels] = useState([]);
  const [isLoadingMateriels, setIsLoadingMateriels] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const now = new Date();
  const localDate = now.toISOString().slice(0, 10);
  const localTime = now.toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    zone: '',
    type: '',
    materiel_id: '',
    heures_compteur: '',
    date_panne: localDate,
    heure_panne: localTime,
    plan_action: '',
  });

  useEffect(() => {
    loadMateriels();
  }, []);

  const loadMateriels = async () => {
    try {
      setIsLoadingMateriels(true);
      const response = await materielsAPI.getAll({ 
        carriere_id: user?.carriere_id 
      });
      setMateriels(response.data || response);
    } catch (error) {
      console.error('Error loading materiels:', error);
      setError('Erreur lors du chargement des matériels');
    } finally {
      setIsLoadingMateriels(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { date_panne, heure_panne, ...rest } = formData;
      await pannesAPI.create({
        ...rest,
        pointeur_id: user.matricule,
        carriere_id: user.carriere_id,
        date_panne: `${date_panne}T${heure_panne}:00`,
        materiel_id: parseInt(formData.materiel_id),
        heures_compteur: formData.heures_compteur ? parseInt(formData.heures_compteur) : null,
      });
      
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/pointeur');
      }, 2000);
    } catch (error) {
      console.error('Error creating panne:', error);
      setError(error.response?.data?.message || 'Erreur lors de la création de la panne');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Panne déclarée!</h2>
          <p className="text-gray-600">Redirection vers le tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/pointeur')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            <h1 className="text-xl font-bold text-gray-900">Déclarer une Panne</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Zone */}
            <div>
              <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-2">
                Zone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="zone"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                required
                placeholder="Ex: Station de concassage"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Indiquez la zone où la panne est survenue
              </p>
            </div>

            {/* Type de Panne */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type de Panne <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                placeholder="Ex: Coupure du bande TR200"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Décrivez brièvement le type de panne
              </p>
            </div>

            {/* Date & Heure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date_panne" className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date_panne"
                  name="date_panne"
                  value={formData.date_panne}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="heure_panne" className="block text-sm font-medium text-gray-700 mb-2">
                  Heure <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="heure_panne"
                  name="heure_panne"
                  value={formData.heure_panne}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Matériel */}
            <div>
              <label htmlFor="materiel_id" className="block text-sm font-medium text-gray-700 mb-2">
                Matériel Concerné <span className="text-red-500">*</span>
              </label>
              {isLoadingMateriels ? (
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Chargement des matériels...
                </div>
              ) : (
                <select
                  id="materiel_id"
                  name="materiel_id"
                  value={formData.materiel_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un matériel</option>
                  {materiels.map((materiel) => (
                    <option key={materiel.matricule} value={materiel.matricule}>
                      {materiel.nom} - {materiel.categorie}
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Sélectionnez le matériel affecté par la panne
              </p>
            </div>

            {/* Compteur Horaire */}
            {(() => {
              const selectedMat = materiels.find(m => String(m.matricule) === formData.materiel_id);
              const initValue = selectedMat?.compteur_init;
              return (
                <div>
                  <label htmlFor="heures_compteur" className="block text-sm font-medium text-gray-700 mb-2">
                    Compteur horaire (h)
                  </label>
                  <input
                    type="number"
                    id="heures_compteur"
                    name="heures_compteur"
                    value={formData.heures_compteur}
                    onChange={handleChange}
                    min={initValue || 0}
                    placeholder={initValue ? `Compteur init: ${initValue}h` : 'Sélectionnez un matériel d\'abord'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {initValue
                      ? `Relevez le compteur actuel (doit être ≥ ${initValue}h)`
                      : 'Optionnel — Relevez le compteur horaire du matériel si disponible'}
                  </p>
                </div>
              );
            })()}

            {/* Plan d'Action */}
            <div>
              <label htmlFor="plan_action" className="block text-sm font-medium text-gray-700 mb-2">
                Plan d'Action
              </label>
              <textarea
                id="plan_action"
                name="plan_action"
                value={formData.plan_action}
                onChange={handleChange}
                rows={4}
                placeholder="Décrivez les actions à entreprendre pour résoudre la panne..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                Optionnel - Ajoutez des détails sur les actions correctives prévues
              </p>
            </div>

           

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingMateriels}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enregistrement...
                  </span>
                ) : (
                  'Déclarer la Panne'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/pointeur')}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}