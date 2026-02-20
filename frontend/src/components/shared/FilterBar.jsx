import { useEffect, useState } from 'react';
import { materielsAPI } from '../../api/materiels.api';

export default function FilterBar({ 
  onFilterChange = null, 
  filters = {},
  zones = [],
}) {
  const [materiels, setMateriels] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    loadMateriels();
  }, []);

  const loadMateriels = async () => {
    try {
      const data = await materielsAPI.getAll();
      setMateriels(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('Error loading materiels:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onFilterChange?.({});
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-end">

        {/* Zone Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
          <select
            value={localFilters.zone || ''}
            onChange={(e) => handleFilterChange('zone', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg form-select bg-white text-sm text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Toutes les zones</option>
            {zones.map((zone, index) => (
              <option key={zone || index} value={zone}>{zone}</option>
            ))}
          </select>
        </div>

        {/* Équipement Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Équipement</label>
          <select
            value={localFilters.materiel_id || ''}
            onChange={(e) => handleFilterChange('materiel_id', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg form-select bg-white text-sm text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tous les équipements</option>
            {materiels.map((mat, index) => (
              <option key={mat.matricule ?? index} value={mat.matricule}>
                {mat.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Statut Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg form-select bg-white text-sm text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="en_cours">En cours</option>
            <option value="resolue">Résolues</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Réinitialiser
        </button>

      </div>
    </div>
  );
}
