// src/pages/pointeur/DashboardPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pannesAPI } from '../../api/pannes.api';
import KPICard from '../../components/shared/KPICard';
import PannesTable from '../../components/shared/PannesTable';
import { format } from 'date-fns';
import { Plus, LogOut } from 'lucide-react';

export default function PointeurDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pannes, setPannes] = useState([]);
  const [selectedPanne, setSelectedPanne] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPannes();
  }, []);

  const loadPannes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await pannesAPI.getMyPannes({});
      // Handle paginated response { data: [...], ... }
      const data = Array.isArray(response) ? response : response?.data || [];
      setPannes(data);
    } catch (error) {
      console.error('Error loading pannes:', error);
      setError('Erreur lors du chargement des pannes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (panne) => {
    setSelectedPanne(panne);
  };

  const calculateStats = () => {
    return {
      total: pannes.length,
      en_cours: pannes.filter(p => {
        const status = p.status || p.statut || '';
        return status.toLowerCase().includes('en_cours') || status.toLowerCase().includes('actif');
      }).length,
      resolues: pannes.filter(p => {
        const status = p.status || p.statut || '';
        return status.toLowerCase().includes('resolue') || status.toLowerCase().includes('ok');
      }).length,
      durée_moyenne: pannes.length > 0 
        ? (pannes.reduce((acc, p) => {
            const startDate = p.date_panne || p.date_debut;
            if (!startDate) return acc;
            const start = new Date(startDate);
            const end = p.date_fin ? new Date(p.date_fin) : new Date();
            return acc + (end - start);
          }, 0) / pannes.length / (1000 * 60 * 60)).toFixed(1)
        : 0,
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">SMART MENARA - Pointeur</h1>
              <p className="text-xs text-gray-500 mt-0.5">Gestion des pannes</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right border-r pr-6">
                <p className="text-sm font-medium text-gray-900">{user?.nom}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes Pannes</h2>
            <p className="text-sm text-gray-500 mt-1">Suivi et gestion des pannes déclarées</p>
          </div>
          <button
            onClick={() => navigate('/pointeur/pannes/create')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Déclarer une Panne
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            label="Total"
            value={stats.total}
            color="text-blue-600"
            bgColor="bg-blue-50"
            subtext="Pannes déclarées"
          />
          <KPICard
            label="En Cours"
            value={stats.en_cours}
            color="text-orange-600"
            bgColor="bg-orange-50"
            subtext="Pannes actives"
          />
          <KPICard
            label="Résolues"
            value={stats.resolues}
            color="text-green-600"
            bgColor="bg-green-50"
            subtext="Pannes fermées"
          />
          <KPICard
            label="Durée moy."
            value={stats.durée_moyenne}
            unit="h"
            color="text-purple-600"
            bgColor="bg-purple-50"
            subtext="Par panne"
          />
        </div>

        {/* Pannes Table and Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PannesTable
              pannes={pannes}
              isLoading={isLoading}
              onRowClick={handleRowClick}
              selectedPanneId={selectedPanne?.id}
            />
          </div>

          {/* Detail Panel */}
          {selectedPanne && (
            <div className="bg-white rounded-lg shadow p-6 h-fit">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-900">PANNE #{selectedPanne.id}</h3>
                <button
                  onClick={() => setSelectedPanne(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Zone */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Zone</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedPanne.zone || '—'}</p>
                </div>

                {/* Type */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedPanne.type || '—'}</p>
                </div>

                {/* Équipement */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Équipement</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedPanne.materiel?.nom || '—'}</p>
                </div>

                {/* Début */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Début</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedPanne.date_panne || selectedPanne.date_debut
                      ? format(new Date(selectedPanne.date_panne || selectedPanne.date_debut), 'dd/MM/yyyy HH:mm')
                      : '—'}
                  </p>
                </div>

                {/* Statut */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Statut</label>
                  <p className="text-sm mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        (selectedPanne.status || selectedPanne.statut || '').toLowerCase().includes('actif') ||
                        (selectedPanne.status || selectedPanne.statut || '').toLowerCase().includes('en_cours')
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {(selectedPanne.status || selectedPanne.statut || '').toLowerCase().includes('actif') ||
                       (selectedPanne.status || selectedPanne.statut || '').toLowerCase().includes('en_cours')
                        ? 'ACTIF' 
                        : 'RÉSOLU'}
                    </span>
                  </p>
                </div>

                {/* Plan d'action */}
                {selectedPanne.plan_action && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Plan d'action</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPanne.plan_action}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <button
                    onClick={() => navigate(`/pointeur/pannes/${selectedPanne.id}`)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                  >
                    Voir les détails
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}