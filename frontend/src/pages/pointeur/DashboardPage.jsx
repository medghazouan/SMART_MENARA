import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pannesAPI } from '../../api/pannes.api';
import PannesTable from '../../components/shared/PannesTable';
import { format } from 'date-fns';
import menaraLogo from '../../assets/menaralogo.png';
import {
  Plus, LogOut, AlertTriangle, CheckCircle2, Clock, BarChart3,
  LayoutDashboard, FilePlus, User, MapPin, Wrench, Calendar, Eye, X,
} from 'lucide-react';

const TEAL = '#2D9F93';

export default function PointeurDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pannes, setPannes] = useState([]);
  const [selectedPanne, setSelectedPanne] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadPannes(); }, []);

  const loadPannes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await pannesAPI.getMyPannes({});
      const data = Array.isArray(response) ? response : response?.data || [];
      setPannes(data);
    } catch (err) {
      console.error('Error loading pannes:', err);
      setError('Erreur lors du chargement des pannes');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = (() => {
    const en_cours = pannes.filter(p => (p.status || '').toLowerCase().includes('en_cours')).length;
    const resolues = pannes.filter(p => (p.status || '').toLowerCase().includes('resolue')).length;
    const avg = pannes.length > 0
      ? (pannes.reduce((acc, p) => {
        if (!p.date_panne) return acc;
        const end = p.date_fin ? new Date(p.date_fin) : new Date();
        return acc + (end - new Date(p.date_panne));
      }, 0) / pannes.length / 3_600_000).toFixed(1)
      : 0;
    return { total: pannes.length, en_cours, resolues, avg };
  })();

  const isActive = (status) => (status || '').toLowerCase().includes('en_cours');

  return (
    <div className="flex min-h-screen font-['Inter',system-ui,sans-serif] text-gray-700 bg-[#f5f6f8]">
      {/* ── Sidebar ── */}
      <aside className="w-65 shrink-0 flex flex-col justify-between bg-white border-r border-gray-100 shadow-sm">
        {/* Top */}
        <div>
          {/* Logo */}
          <div className="px-6 pt-7 pb-5 border-b border-gray-100">
            <img src={menaraLogo} alt="Menara" className="h-10 w-auto mb-4" />
            <div className="w-8 h-0.75 bg-[#c0392b] mb-3" />
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400">Espace Pointeur</p>
          </div>

          {/* Nav */}
          <nav className="px-3 pt-4 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: TEAL }}>
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

        {/* User + Logout */}
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
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-sm text-gray-400 mt-0.5">Suivi et gestion de vos pannes</p>
          </div>
          <button
            onClick={() => navigate('/pointeur/pannes/create')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity"
            style={{ background: TEAL }}
          >
            <Plus size={18} /> Déclarer une panne
          </button>
        </header>

        <div className="px-8 py-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KPI icon={<BarChart3 size={22} />} label="Total pannes" value={stats.total} accent="bg-blue-50 text-blue-600" />
            <KPI icon={<AlertTriangle size={22} />} label="En cours" value={stats.en_cours} accent="bg-orange-50 text-orange-600" />
            <KPI icon={<CheckCircle2 size={22} />} label="Résolues" value={stats.resolues} accent="bg-emerald-50 text-emerald-600" />
            <KPI icon={<Clock size={22} />} label="Durée moy." value={`${stats.avg}h`} accent="bg-purple-50 text-purple-600" />
          </div>

          {/* Table */}
          <PannesTable
            pannes={pannes}
            isLoading={isLoading}
            onRowClick={setSelectedPanne}
            selectedPanneId={selectedPanne?.id}
          />

          {/* ── Modal detail ── */}
          {selectedPanne && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedPanne(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-md mx-4 animate-[fadeUp_0.25s_ease-out]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-gray-800 tracking-wide uppercase">Panne #{selectedPanne.id}</h3>
                  <button onClick={() => setSelectedPanne(null)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <DetailRow icon={<MapPin size={15} />} label="Zone" value={selectedPanne.zone} />
                  <DetailRow icon={<Wrench size={15} />} label="Type" value={selectedPanne.type} />
                  <DetailRow icon={<Wrench size={15} />} label="Équipement" value={selectedPanne.materiel?.nom} />
                  <DetailRow
                    icon={<Calendar size={15} />}
                    label="Début"
                    value={
                      (selectedPanne.date_panne || selectedPanne.date_debut)
                        ? format(new Date(selectedPanne.date_panne || selectedPanne.date_debut), 'dd/MM/yyyy HH:mm')
                        : null
                    }
                  />

                  {/* Status badge */}
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">Statut</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isActive(selectedPanne.status) ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                      {isActive(selectedPanne.status)
                        ? <><AlertTriangle size={12} /> ACTIF</>
                        : <><CheckCircle2 size={12} /> RÉSOLU</>
                      }
                    </span>
                  </div>

                  {selectedPanne.plan_action && (
                    <DetailRow icon={<Eye size={15} />} label="Plan d'action" value={selectedPanne.plan_action} />
                  )}
                </div>

                <div className="pt-5 mt-5 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/pointeur/pannes/${selectedPanne.id}`)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ background: TEAL }}
                  >
                    <Eye size={16} /> Voir les détails
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Small sub-components ── */

function KPI({ icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-wide uppercase text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
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