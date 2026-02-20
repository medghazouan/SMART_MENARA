import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, pannesAPI } from '../../api/pannes.api';
import { carrieresAPI } from '../../api/carrieres.api';
import KPICard from '../../components/shared/KPICard';
import PannesTable from '../../components/shared/PannesTable';
import FilterBar from '../../components/shared/FilterBar';
import NotificationBell from '../../components/shared/NotificationBell';

export default function SuperviseurDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pannes, setPannes] = useState([]);
  const [carrieres, setCarrieres] = useState([]);
  const [selectedCarriereId, setSelectedCarriereId] = useState('');
  const [selectedPanne, setSelectedPanne] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingPannes, setIsLoadingPannes] = useState(false);
  const [filters, setFilters] = useState({});
  const [zones, setZones] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    loadCarrieres();
  }, []);

  useEffect(() => {
    loadStats();
    loadPannes();
  }, [selectedCarriereId, filters]);

  const loadCarrieres = async () => {
    try {
      const data = await carrieresAPI.getAll({
        superviseur_id: user?.matricule,
      });
      const list = Array.isArray(data) ? data : data?.data || [];
      setCarrieres(list);
    } catch (error) {
      console.error('Error loading carrieres:', error);
    }
  };

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const statsFilters = { ...filters };
      if (selectedCarriereId) {
        statsFilters.carriere_id = selectedCarriereId;
      }
      const statsData = await dashboardAPI.getStats(statsFilters);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadPannes = async () => {
    setIsLoadingPannes(true);
    try {
      const panneFilters = { ...filters };
      if (selectedCarriereId) {
        panneFilters.carriere_id = selectedCarriereId;
      }
      const response = await pannesAPI.getAll(panneFilters);
      const pannesArray = Array.isArray(response) ? response : response?.data || [];
      setPannes(pannesArray);

      const uniqueZones = [...new Set(pannesArray.map((p) => p.zone).filter(Boolean))];
      setZones(uniqueZones);
    } catch (error) {
      console.error('Error loading pannes:', error);
    } finally {
      setIsLoadingPannes(false);
    }
  };

  const handleCarriereChange = (carriereId) => {
    setSelectedCarriereId(carriereId);
    setSelectedPanne(null);
    setFilters({});
  };

  const handleRowClick = (panne) => {
    setSelectedPanne(panne);
    navigate(`/superviseur/pannes/${panne.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">SMART MENARA - Superviseur</h1>
            </div>
            <div className="flex items-center space-x-6">
              <NotificationBell onNotificationChange={setUnreadNotifications} />
              <div className="text-sm text-gray-700 border-r pr-6">{user?.nom}</div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title + Carriere Selector */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord</h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedCarriereId
                ? `Carrière : ${carrieres.find((c) => String(c.id) === String(selectedCarriereId))?.nom || '—'}`
                : 'Vue globale — Toutes vos carrières'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Carrière</label>
            <select
              value={selectedCarriereId}
              onChange={(e) => handleCarriereChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[200px]"
            >
              <option value="">Toutes les carrières</option>
              {carrieres.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        {isLoadingStats ? (
          <div className="text-center py-12 text-gray-500">Chargement des métriques...</div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              {/* MTBF */}
              <KPICard
                label="MTBF"
                value={(stats?.mtbf_hours || 0).toFixed(1)}
                unit="h"
                color="text-blue-600"
                bgColor="bg-blue-50"
                subtext="Moy. entre pannes"
              />

              {/* MTTR */}
              <KPICard
                label="MTTR"
                value={(stats?.mttr_hours || 0).toFixed(1)}
                unit="h"
                color="text-green-600"
                bgColor="bg-green-50"
                subtext="Temps moyen réparation"
              />

              {/* En Cours */}
              <KPICard
                label="En Cours"
                value={stats?.pannes_en_cours || 0}
                color="text-orange-600"
                bgColor="bg-orange-50"
                subtext="Pannes actives"
              />

              {/* Aujourd'hui */}
              <KPICard
                label="Aujourd'hui"
                value={stats?.pannes_today || 0}
                color="text-purple-600"
                bgColor="bg-purple-50"
                subtext="Déclarées aujourd'hui"
              />

              {/* Indisponibilité */}
              <KPICard
                label="Indisponibilité"
                value={stats?.indisponibilite_percent || 0}
                unit="%"
                color="text-red-600"
                bgColor="bg-red-50"
                subtext="Cette semaine"
              />

              {/* Total Pannes */}
              <KPICard
                label="Total"
                value={stats?.total_pannes || 0}
                color="text-gray-700"
                bgColor="bg-gray-50"
                subtext="Tous les temps"
              />
            </div>

            {/* Filters */}
            <FilterBar
              filters={filters}
              zones={zones}
              onFilterChange={(newFilters) => setFilters(newFilters)}
            />


            {/* Pannes Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PannesTable
                  pannes={pannes}
                  isLoading={isLoadingPannes}
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
                      className="text-gray-400 hover:text-gray-600"
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
                          ? new Date(selectedPanne.date_panne || selectedPanne.date_debut).toLocaleString('fr-FR')
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
                            : 'OK'}
                        </span>
                      </p>
                    </div>

                    {/* Responsable */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Responsable</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedPanne.pointeur?.nom || '—'}</p>
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
                        onClick={() => navigate(`/superviseur/pannes/${selectedPanne.id}`)}
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
        )}
      </div>
    </div>
  );
}