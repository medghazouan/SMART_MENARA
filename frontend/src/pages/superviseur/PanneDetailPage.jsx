// SuperviseurPanneDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pannesAPI } from '../../api/pannes.api';
import { actionsAPI } from '../../api/actions.api';
import { format } from 'date-fns';
import menaraLogo from '../../assets/menaralogo.png';
import NotificationBell from '../../components/shared/NotificationBell';

// ── Constants ──────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#2D9F93',
  primaryLight: '#E8F6F5',
  danger: '#c0392b',
  warning: '#F59E0B',
  success: '#059669',
  purple: '#8B5CF6',
};

// ── Helper Functions ───────────────────────────────────────────────────────
const isActive = (status = '') => {
  const v = status.toLowerCase();
  return !(v.includes('resolue') || v.includes('résolu') || v.includes('ok'));
};

// ── Sub-components ─────────────────────────────────────────────────────────

/** Info Field Display */
function InfoField({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-2">
        {label}
      </p>
      <p className="text-sm text-gray-700 font-medium leading-relaxed">
        {value || '—'}
      </p>
    </div>
  );
}

/** Status Badge */
function StatusBadge({ status, size = 'md' }) {
  const active = isActive(status);
  const sizeClasses = size === 'lg' 
    ? 'px-4 py-2 text-sm' 
    : 'px-3 py-1 text-[10px]';
  
  return (
    <span className={`
      inline-flex items-center rounded-full font-bold tracking-wider uppercase
      ${sizeClasses}
      ${active 
        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      }
    `}>
      {active ? 'ACTIF' : 'RÉSOLU'}
    </span>
  );
}

/** Action Type Badge */
function ActionTypeBadge({ type }) {
  const typeMap = {
    'corrective': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'preventive': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'diagnostic': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  };
  
  const style = typeMap[type?.toLowerCase()] || typeMap.corrective;
  
  return (
    <span className={`
      inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold 
      tracking-wider uppercase border ${style.bg} ${style.text} ${style.border}
    `}>
      {type || 'Corrective'}
    </span>
  );
}

/** Card wrapper */
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/** Section Title */
function SectionTitle({ children, count }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-teal-600 rounded-sm flex-shrink-0" />
        <h3 className="text-base font-bold text-gray-800">
          {children}
        </h3>
        {count !== undefined && (
          <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function SuperviseurPanneDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
      setError(null);
      
      const panneData = await pannesAPI.getById(id);
      setPanne(panneData);

      // Load actions for this panne
      const actionsData = await actionsAPI.getByPanne(id);
      setActions(Array.isArray(actionsData) ? actionsData : actionsData?.data || []);
    } catch (error) {
      console.error('Error loading panne details:', error);
      setError('Impossible de charger les détails de la panne');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = () => {
    if (!panne?.date_panne && !panne?.date_debut) return '—';
    
    const start = new Date(panne.date_panne || panne.date_debut);
    const end = panne.date_fin ? new Date(panne.date_fin) : new Date();
    const diffMs = end - start;
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}j ${diffHours}h`;
    }
    return `${diffHours}h ${diffMins}m`;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm');
    } catch {
      return '—';
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <nav className="bg-white border-b border-gray-200 h-16" />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 4rem)' }}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-teal-600 mb-4" />
            <p className="text-gray-500 text-sm font-medium">Chargement des détails...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Not Found State ────────────────────────────────────────────────────
  if (!panne) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <nav className="bg-white border-b border-gray-200 h-16" />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 4rem)' }}>
          <div className="text-center">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 font-medium mb-6">Panne non trouvée</p>
            <button
              onClick={() => navigate('/superviseur')}
              className="px-6 py-3 bg-teal-600 text-white text-sm font-bold tracking-wider 
                uppercase rounded-lg hover:bg-teal-700 transition-all duration-200 
                active:scale-95 shadow-sm"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = panne.status || panne.statut || '';

  // ── Main Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* ── NAVIGATION ─────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="h-16 flex items-center justify-between">
            
            {/* Brand & Title */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <img 
                  src={menaraLogo} 
                  alt="Menara Préfa" 
                  className="h-10 w-auto"
                />
                <div className="w-px h-7 bg-gray-200" />
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-teal-600 leading-tight">
                    SMART MENARA
                  </p>
                  <p className="text-[10px] text-gray-400 tracking-wider">
                    GESTION DES PANNES
                  </p>
                </div>
              </div>
              
              <div className="w-px h-8 bg-gray-200" />
              
              <div>
                <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400">
                  Détail Panne
                </p>
                <h1 className="text-lg font-extrabold text-gray-900">
                  #{panne.id}
                </h1>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-5">
              <NotificationBell />
              
              <div className="w-px h-6 bg-gray-200" />
              
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.nom}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  Superviseur
                </p>
              </div>
              
              <button
                onClick={() => navigate('/superviseur')}
                className="px-5 py-2 text-xs font-bold tracking-wider uppercase
                  text-gray-600 bg-white border border-gray-300 rounded-lg
                  hover:bg-gray-50 hover:border-gray-400 transition-all duration-200
                  active:scale-95"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Page Header with Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <StatusBadge status={status} size="lg" />
            <div className="w-px h-8 bg-gray-300" />
            <div>
              <p className="text-sm text-gray-500">Durée totale</p>
              <p className="text-2xl font-extrabold text-gray-900">{formatDuration()}</p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ── LEFT COLUMN: Main Content ────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary Information Card */}
            <Card className="p-6">
              <SectionTitle>Informations Générales</SectionTitle>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <InfoField 
                  label="Zone" 
                  value={panne.zone} 
                />
                <InfoField 
                  label="Type de Panne" 
                  value={panne.type} 
                />
                <InfoField 
                  label="Équipement" 
                  value={panne.materiel?.nom} 
                />
                <InfoField 
                  label="Carrière" 
                  value={panne.carriere?.nom} 
                />
                <InfoField 
                  label="Date de Début" 
                  value={formatDate(panne.date_panne || panne.date_debut)} 
                />
                <InfoField 
                  label="Date de Fin" 
                  value={formatDate(panne.date_fin)} 
                />
                <InfoField 
                  label="Durée" 
                  value={formatDuration()} 
                />
                <InfoField 
                  label="Pointeur Responsable" 
                  value={panne.pointeur?.nom} 
                />
                
                {panne.description && (
                  <InfoField 
                    label="Description" 
                    value={panne.description}
                    fullWidth 
                  />
                )}
              </div>
            </Card>

            {/* Plan d'Action Card */}
            {panne.plan_action && (
              <Card className="p-6">
                <SectionTitle>Plan d'Action Initial</SectionTitle>
                <div className="bg-gradient-to-br from-teal-50 to-teal-50/30 rounded-lg p-5 border border-teal-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {panne.plan_action}
                  </p>
                </div>
              </Card>
            )}

            {/* Actions/Interventions Card */}
            <Card className="p-6">
              <SectionTitle count={actions.length}>
                Historique des Actions
              </SectionTitle>

              {actions.length === 0 ? (
                <div className="py-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm text-gray-500 font-medium">Aucune action enregistrée</p>
                  <p className="text-xs text-gray-400 mt-1">Les interventions apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {actions.map((action, idx) => (
                    <div 
                      key={action.id} 
                      className="group relative bg-gradient-to-br from-gray-50 to-white rounded-lg 
                        border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 
                        transition-all duration-200"
                    >
                      {/* Timeline indicator */}
                      {idx < actions.length - 1 && (
                        <div className="absolute left-6 top-[3.5rem] bottom-0 w-px bg-gray-200" />
                      )}
                      
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <ActionTypeBadge type={action.type} />
                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                              {formatDate(action.date)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-700 leading-relaxed mb-3">
                            {action.intervention || action.description || '—'}
                          </p>
                          
                          {action.temps_estime && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">
                                Temps estimé: {action.temps_estime}h
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* ── RIGHT COLUMN: Sidebar ─────────────────────────────────── */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <SectionTitle>Résumé Rapide</SectionTitle>

              <div className="space-y-5">
                {/* Status */}
                <div className="pb-5 border-b border-gray-100">
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-3">
                    Statut Actuel
                  </p>
                  <StatusBadge status={status} size="lg" />
                </div>

                {/* Duration Highlight */}
                <div className="pb-5 border-b border-gray-100">
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-2">
                    Durée Totale
                  </p>
                  <p className="text-3xl font-extrabold text-gray-900">
                    {formatDuration()}
                  </p>
                  {!panne.date_fin && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      ⏱ En cours
                    </p>
                  )}
                </div>

                {/* Key Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-2">
                      Équipement
                    </p>
                    <p className="text-sm text-gray-800 font-semibold">
                      {panne.materiel?.nom || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-2">
                      Zone
                    </p>
                    <p className="text-sm text-gray-800 font-semibold">
                      {panne.zone || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-2">
                      Type
                    </p>
                    <p className="text-sm text-gray-800 font-semibold">
                      {panne.type || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-2">
                      Responsable
                    </p>
                    <p className="text-sm text-gray-800 font-semibold">
                      {panne.pointeur?.nom || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-2">
                      Carrière
                    </p>
                    <p className="text-sm text-gray-800 font-semibold">
                      {panne.carriere?.nom || '—'}
                    </p>
                  </div>
                </div>

                {/* Actions Count */}
                <div className="pt-5 border-t border-gray-100">
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-2">
                    Actions Enregistrées
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {actions.length}
                    </span>
                    <span className="text-sm text-gray-500">
                      {actions.length === 1 ? 'intervention' : 'interventions'}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="pt-5 border-t border-gray-100">
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-3">
                    Chronologie
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-1.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-700">Début</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(panne.date_panne || panne.date_debut)}
                        </p>
                      </div>
                    </div>
                    
                    {panne.date_fin && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-emerald-600 rounded-full mt-1.5" />
                        <div>
                          <p className="text-xs font-semibold text-gray-700">Fin</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(panne.date_fin)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}