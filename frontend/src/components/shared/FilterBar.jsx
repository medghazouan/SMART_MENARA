// FilterBar.jsx
import { useEffect, useState } from 'react';
import { materielsAPI } from '../../api/materiels.api';

// ── Constants ──────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#2D9F93',
  danger: '#c0392b',
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function FilterBar({ 
  onFilterChange = null, 
  filters = {},
  zones = [],
}) {
  const [materiels, setMateriels] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMateriels();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const loadMateriels = async () => {
    try {
      setIsLoading(true);
      const data = await materielsAPI.getAll();
      setMateriels(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('Error loading materiels:', error);
    } finally {
      setIsLoading(false);
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

  const hasActiveFilters = Object.values(localFilters).some(val => val !== '' && val !== null && val !== undefined);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
      <div className="flex flex-wrap items-end gap-4">
        
        {/* Filter Label */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-1 h-5 bg-teal-600 rounded-sm flex-shrink-0" />
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400">
            Filtres
          </span>
        </div>

        {/* Zone Filter */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-2">
            Zone
          </label>
          <select
            value={localFilters.zone || ''}
            onChange={(e) => handleFilterChange('zone', e.target.value)}
            className="w-full px-4 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 
              rounded-lg outline-none cursor-pointer hover:border-gray-300 
              focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
          >
            <option value="">Toutes les zones</option>
            {zones.map((zone, index) => (
              <option key={zone || index} value={zone}>{zone}</option>
            ))}
          </select>
        </div>

        {/* Équipement Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-2">
            Équipement
          </label>
          <select
            value={localFilters.materiel_id || ''}
            onChange={(e) => handleFilterChange('materiel_id', e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 
              rounded-lg outline-none cursor-pointer hover:border-gray-300 
              focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Tous les équipements</option>
            {materiels.map((mat, index) => (
              <option key={mat.matricule ?? mat.id ?? index} value={mat.matricule ?? mat.id}>
                {mat.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Statut Filter */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-2">
            Statut
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-4 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 
              rounded-lg outline-none cursor-pointer hover:border-gray-300 
              focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
          >
            <option value="">Tous les statuts</option>
            <option value="en_cours">En cours</option>
            <option value="actif">Actif</option>
            <option value="resolue">Résolues</option>
            <option value="resolu">Résolu</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wider 
              uppercase text-red-600 bg-red-50 border border-red-200 rounded-lg 
              hover:bg-red-100 hover:border-red-300 transition-all duration-200 
              active:scale-95 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Réinitialiser
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Filtres actifs:</span>
            
            {localFilters.zone && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 
                rounded-full text-xs font-semibold border border-teal-200">
                <span className="text-teal-400">Zone:</span>
                {localFilters.zone}
                <button
                  onClick={() => handleFilterChange('zone', '')}
                  className="ml-1 hover:text-teal-900 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}

            {localFilters.materiel_id && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 
                rounded-full text-xs font-semibold border border-purple-200">
                <span className="text-purple-400">Équipement:</span>
                {materiels.find(m => String(m.matricule ?? m.id) === String(localFilters.materiel_id))?.nom || localFilters.materiel_id}
                <button
                  onClick={() => handleFilterChange('materiel_id', '')}
                  className="ml-1 hover:text-purple-900 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}

            {localFilters.status && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 
                rounded-full text-xs font-semibold border border-amber-200">
                <span className="text-amber-400">Statut:</span>
                {localFilters.status === 'en_cours' ? 'En cours' : 
                 localFilters.status === 'actif' ? 'Actif' :
                 localFilters.status === 'resolue' ? 'Résolues' :
                 localFilters.status === 'resolu' ? 'Résolu' : localFilters.status}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1 hover:text-amber-900 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}