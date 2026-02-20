import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pannesAPI } from '../../api/pannes.api';
import { actionsAPI } from '../../api/actions.api';
import { format } from 'date-fns';

export default function SuperviseurPanneDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [panne, setPanne] = useState(null);
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPanneDetails();
  }, [id]);

  const loadPanneDetails = async () => {
    try {
      setIsLoading(true);
      const panneData = await pannesAPI.getById(id);
      setPanne(panneData);

      // Load actions for this panne
      const actionsData = await actionsAPI.getByPanne(id);
      setActions(Array.isArray(actionsData) ? actionsData : actionsData?.data || []);
    } catch (error) {
      console.error('Error loading panne details:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = () => {
    if (!panne?.date_panne && !panne?.date_debut) return '—';
    const start = new Date(panne.date_panne || panne.date_debut);
    const end = panne.date_fin ? new Date(panne.date_fin) : new Date();
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMins}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="mt-4 text-gray-600">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!panne) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Panne non trouvée</p>
          <button
            onClick={() => navigate('/superviseur')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const isResolved = panne.status?.toLowerCase().includes('resolue') || 
                    panne.status?.toLowerCase().includes('ok') ||
                    panne.statut?.toUpperCase().includes('RÉSOLU') || 
                    panne.statut?.toUpperCase().includes('OK');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">PANNE #{panne.id}</h1>
              <p className="text-xs text-gray-500 mt-0.5">Détails et historique</p>
            </div>
            <div>
              <button
                onClick={() => navigate('/superviseur')}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Informations de la panne</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Zone */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Zone</label>
                  <p className="text-sm text-gray-900 mt-2">{panne.zone || '—'}</p>
                </div>

                {/* Type */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                  <p className="text-sm text-gray-900 mt-2">{panne.type || '—'}</p>
                </div>

                {/* Équipement */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Équipement</label>
                  <p className="text-sm text-gray-900 mt-2">{panne.materiel?.nom || '—'}</p>
                </div>

                {/* Carrière */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Carrière</label>
                  <p className="text-sm text-gray-900 mt-2">{panne.carriere?.nom || '—'}</p>
                </div>

                {/* Début */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Début</label>
                  <p className="text-sm text-gray-900 mt-2">
                    {panne.date_panne || panne.date_debut ? format(new Date(panne.date_panne || panne.date_debut), 'dd/MM/yyyy HH:mm') : '—'}
                  </p>
                </div>

                {/* Fin */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Fin</label>
                  <p className="text-sm text-gray-900 mt-2">
                    {panne.date_fin ? format(new Date(panne.date_fin), 'dd/MM/yyyy HH:mm') : '—'}
                  </p>
                </div>

                {/* Durée */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Durée</label>
                  <p className="text-sm text-gray-900 mt-2">{formatDuration()}</p>
                </div>

                {/* Statut */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Statut</label>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      isResolved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {isResolved ? 'RÉSOLUE' : 'ACTIVE'}
                    </span>
                  </div>
                </div>

                {/* Pointeur/Responsable */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Pointeur</label>
                  <p className="text-sm text-gray-900 mt-2">{panne.pointeur?.nom || '—'}</p>
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                  <p className="text-sm text-gray-900 mt-2">{panne.description || '—'}</p>
                </div>
              </div>
            </div>

            {/* Plan d'action */}
            {panne.plan_action && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Plan d'action initial</h3>
                <p className="text-sm text-gray-700">{panne.plan_action}</p>
              </div>
            )}

            {/* Actions/Interventions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Actions ({actions.length})</h3>
              </div>

              {actions.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune action enregistrée</p>
              ) : (
                <div className="space-y-3">
                  {actions.map((action, idx) => (
                    <div key={action.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 mb-1">
                            {action.type || 'Corrective'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {action.date ? format(new Date(action.date), 'dd/MM/yyyy') : '—'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{action.intervention}</p>
                      {action.temps_estime && (
                        <p className="text-xs text-gray-500 mt-2">Estimation: {action.temps_estime}h</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Résumé</h3>
              <div className="space-y-4">
                {/* Status Badge */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Statut</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isResolved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {isResolved ? 'RÉSOLUE' : 'ACTIVE'}
                  </span>
                </div>

                {/* Duration */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Durée</p>
                  <p className="text-lg font-bold text-gray-900">{formatDuration()}</p>
                </div>

                {/* Equipment */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Équipement</p>
                  <p className="text-sm text-gray-900">{panne.materiel?.nom || '—'}</p>
                </div>

                {/* Zone */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Zone</p>
                  <p className="text-sm text-gray-900">{panne.zone || '—'}</p>
                </div>

                {/* Pointeur */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Responsable</p>
                  <p className="text-sm text-gray-900">{panne.pointeur?.nom || '—'}</p>
                </div>

                {/* Actions Count */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Actions</p>
                  <p className="text-lg font-bold text-gray-900">{actions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
