import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pannesAPI } from '../../api/pannes.api';
import { actionsAPI } from '../../api/actions.api';
import ActionForm from '../../components/forms/ActionForm';
import { format } from 'date-fns';
import menaraLogo from '../../assets/menaralogo.png';
import {
  LogOut, AlertTriangle, CheckCircle2, Eye, X, Plus, Trash2,
  MapPin, Wrench, Calendar, LayoutDashboard, FilePlus, Menu, // 🆕 Menu
} from 'lucide-react';

const TEAL = '#2D9F93';

export default function PointeurPanneDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [panne, setPanne] = useState(null);
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showActionForm, setShowActionForm] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // 🆕

  useEffect(() => { loadPanneDetails(); }, [id]);

  const loadPanneDetails = async () => {
    try {
      setIsLoading(true);
      const panneData = await pannesAPI.getById(id);
      setPanne(panneData);
      if (panneData.pointeur_id !== user?.matricule) {
        setError("Vous n'avez pas accès à cette panne");
        return;
      }
      const actionsData = await actionsAPI.getByPanne(id);
      setActions(Array.isArray(actionsData) ? actionsData : actionsData?.data || []);
    } catch (error) {
      console.error('Error loading panne details:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAction = async (formData) => {
    try {
      setIsSubmittingAction(true);
      await actionsAPI.create(id, formData);
      setShowActionForm(false);
      await loadPanneDetails();
    } catch (error) {
      console.error('Error adding action:', error);
      setError(error.message);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleDeleteAction = async (actionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) return;
    try {
      await actionsAPI.delete(actionId);
      await loadPanneDetails();
    } catch (error) {
      console.error('Error deleting action:', error);
      setError(error.message);
    }
  };

  const handleResolvePanne = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir résoudre cette panne ?')) return;
    try {
      const date_fin = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      await pannesAPI.resolve(id, date_fin);
      await loadPanneDetails();
    } catch (error) {
      console.error('Error resolving panne:', error);
      setError(error.message);
    }
  };

  const formatDuration = () => {
    if (!panne?.date_panne && !panne?.date_debut) return '—';
    const start = new Date(panne.date_panne || panne.date_debut);
    const end = panne.date_fin ? new Date(panne.date_fin) : new Date();
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / 1000 / 60 / 60);
    const diffMins = Math.floor((diffMs / 1000 / 60) % 60);
    return `${diffHours}h ${diffMins}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: TEAL }}>
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
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Panne non trouvée</p>
          <button onClick={() => navigate('/pointeur')} className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity" style={{ background: TEAL }}>
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const isResolved =
    panne.status?.toLowerCase().includes('resolue') ||
    panne.status?.toLowerCase().includes('ok') ||
    panne.statut?.toUpperCase().includes('RÉSOLUE') ||
    panne.statut?.toUpperCase().includes('OK');

  return (
    <div className="flex min-h-screen font-[Inter,system-ui,sans-serif] text-gray-700 bg-[#f5f6f8]">

      {/* 🆕 Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        flex flex-col justify-between bg-white border-r border-gray-100 shadow-sm
        fixed inset-y-0 left-0 z-50 w-65 transition-transform duration-300
        lg:static lg:inset-y-auto lg:left-auto lg:z-auto lg:shrink-0 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          <div className="px-6 pt-7 pb-5 border-b border-gray-100">
            <img src={menaraLogo} alt="Menara" className="h-10 w-auto mb-4" />
            <div className="w-8 h-0.75 bg-[#c0392b] mb-3" />
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400">Espace Pointeur</p>
          </div>
          <nav className="px-3 pt-4 space-y-1">
            <button
              onClick={() => navigate('/pointeur')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard size={18} /> Tableau de bord
            </button>
            <button
              onClick={() => navigate('/pointeur/pannes/create')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FilePlus size={18} /> Déclarer une panne
            </button>
          </nav>
        </div>
        <div className="px-4 pb-6">
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: TEAL }}>
                {user?.nom?.charAt(0) || 'P'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.nom}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => { LogOut(); navigate('/login'); }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-w-0"> {/* 🆕 min-w-0 */}

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* 🆕 Hamburger */}
            <button
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900">Panne #{panne.id}</h1>
              <p className="text-sm text-gray-400 mt-0.5 hidden sm:block">Détails et gestion des interventions</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/pointeur')}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shrink-0" 
          >
            Retour
          </button>
        </header>

        {/* Main Content */}
        <div className="px-4 sm:px-8 py-6 space-y-6"> {/* 🆕 px-4 sm:px-8 */}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">

              {/* Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-wide uppercase">Détails de la panne</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> {/* 🆕 grid-cols-1 sm:grid-cols-2 */}
                  <DetailRow icon={<MapPin size={15} />} label="Zone" value={panne.zone} />
                  <DetailRow icon={<Wrench size={15} />} label="Type" value={panne.type} />
                  <DetailRow icon={<Wrench size={15} />} label="Équipement" value={panne.materiel?.nom} />
                  <DetailRow icon={<Calendar size={15} />} label="Carrière" value={panne.carriere?.nom} />
                  <DetailRow
                    icon={<Calendar size={15} />}
                    label="Début"
                    value={panne.date_panne || panne.date_debut
                      ? format(new Date(panne.date_panne || panne.date_debut), 'dd/MM/yyyy HH:mm')
                      : null}
                  />
                  <DetailRow
                    icon={<Calendar size={15} />}
                    label="Fin"
                    value={panne.date_fin ? format(new Date(panne.date_fin), 'dd/MM/yyyy HH:mm') : null}
                  />
                  {/* Status Badge */}
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">Statut</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                      {isResolved ? <><CheckCircle2 size={12} /> RÉSOLUE</> : <><AlertTriangle size={12} /> ACTIVE</>}
                    </span>
                  </div>
                  {/* Description */}
                  {panne.description && (
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">Description</p>
                      <p className="text-sm text-gray-800">{panne.description}</p>
                    </div>
                  )}
                </div>

                {/* Resolve Button */}
                {!isResolved && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <button
                      onClick={handleResolvePanne}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ background: TEAL }}
                    >
                      <CheckCircle2 size={16} /> Résoudre la panne
                    </button>
                  </div>
                )}
              </div>

              {/* Plan d'action */}
              {panne.plan_action && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 tracking-wide uppercase">Plan d'action</h3>
                  <p className="text-sm text-gray-700">{panne.plan_action}</p>
                </div>
              )}

              {/* Interventions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-gray-900 tracking-wide uppercase">
                    Interventions ({actions.length})
                  </h3>
                  {!showActionForm && (
                    <button
                      onClick={() => setShowActionForm(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ background: TEAL }}
                    >
                      <Plus size={16} /> Ajouter
                    </button>
                  )}
                </div>

                {showActionForm && (
                  <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <h4 className="font-medium text-gray-900 mb-4">Nouvelle intervention</h4>
                    <ActionForm
                      onSubmit={handleAddAction}
                      isLoading={isSubmittingAction}
                      onCancel={() => setShowActionForm(false)}
                    />
                  </div>
                )}

                {actions.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucune intervention enregistrée</p>
                ) : (
                  <div className="space-y-3">
                    {actions.map(action => (
                      <div key={action.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-2 ${
                              action.type === 'Préventive' ? 'bg-blue-100 text-blue-700' :
                              action.type === 'Maintenance' ? 'bg-purple-100 text-purple-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {action.type || 'Corrective'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {action.date ? format(new Date(action.date), 'dd/MM/yyyy') : '—'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteAction(action.id)}
                            className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{action.intervention}</p>
                        {action.temps_estime && (
                          <p className="text-xs text-gray-500 mt-2">⏱ {action.temps_estime}h</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar — Summary */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6"> {/* 🆕 top-6 instead of top-24 */}
                <h3 className="text-base font-bold text-gray-900 mb-6 tracking-wide uppercase">Résumé</h3>
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">Statut</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                      {isResolved ? <><CheckCircle2 size={12} /> RÉSOLUE</> : <><AlertTriangle size={12} /> ACTIVE</>}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">Durée</p>
                    <p className="text-xl font-bold text-gray-900">{formatDuration()}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">Équipement</p>
                    <p className="text-sm text-gray-900">{panne.materiel?.nom || '—'}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">Zone</p>
                    <p className="text-sm text-gray-900">{panne.zone || '—'}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">Total interventions</p>
                    <p className="text-xl font-bold text-gray-900">{actions.length}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1 flex items-center gap-1.5">
        <span className="text-gray-300">{icon}</span> {label}
      </p>
      <p className="text-sm text-gray-800 pl-5.5">{value || '—'}</p>
    </div>
  );
}
