import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../api/pannes.api';

export default function SuperviseurDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">SMART MENARA - Superviseur</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.nom}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Tableau de Bord</h2>

        {isLoading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Pannes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500 mb-2">Total Pannes</div>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.total_pannes || 0}
              </div>
            </div>

            {/* En Cours */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500 mb-2">En Cours</div>
              <div className="text-3xl font-bold text-orange-600">
                {stats?.pannes_en_cours || 0}
              </div>
            </div>

            {/* Résolues */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500 mb-2">Résolues</div>
              <div className="text-3xl font-bold text-green-600">
                {stats?.pannes_resolues || 0}
              </div>
            </div>

            {/* MTTR */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500 mb-2">MTTR Moyen</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats?.mttr_hours?.toFixed(1) || 0}
                <span className="text-lg ml-1">h</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}