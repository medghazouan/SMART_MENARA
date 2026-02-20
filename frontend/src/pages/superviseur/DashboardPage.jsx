// SuperviseurDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, pannesAPI } from '../../api/pannes.api';
import { carrieresAPI } from '../../api/carrieres.api';
import NotificationBell from '../../components/shared/NotificationBell';
import menaraLogo from '../../assets/menaralogo.png';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ── Constants ──────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#2D9F93',
  primaryLight: '#E8F6F5',
  danger: '#c0392b',
  warning: '#F59E0B',
  success: '#059669',
  purple: '#8B5CF6',
  slate: '#64748B',
};

// ── Helper Functions ───────────────────────────────────────────────────────
const isActive = (status = '') => {
  const v = status.toLowerCase();
  return v.includes('actif') || v.includes('en_cours');
};

// ── Sub-components ─────────────────────────────────────────────────────────

/** Enhanced KPI card with hover effect */
function KPI({ label, value, unit = '', subtext, accentColor = COLORS.primary }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Accent bar */}
      <div 
        className="absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-1.5"
        style={{ backgroundColor: accentColor }}
      />
      
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-1">
        {label}
      </p>
      
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-gray-900 leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-gray-400">
            {unit}
          </span>
        )}
      </div>
      
      <p className="text-xs text-gray-400 mt-1">
        {subtext}
      </p>
    </div>
  );
}

/** Section title with accent */
function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-4 bg-teal-600 rounded-sm flex-shrink-0" />
      <h3 className="text-sm font-bold tracking-wider uppercase text-gray-700">
        {children}
      </h3>
    </div>
  );
}

/** Card wrapper with enhanced styling */
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/** Status badge with refined styling */
function Badge({ status }) {
  const active = isActive(status);
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold 
      tracking-wider uppercase
      ${active 
        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      }
    `}>
      {active ? 'ACTIF' : 'RÉSOLU'}
    </span>
  );
}

/** Empty state for charts */
function EmptyChart({ height = 190 }) {
  return (
    <div 
      className="flex items-center justify-center text-gray-300 text-sm"
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p>Aucune donnée disponible</p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function SuperviseurDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State management
  const [stats, setStats] = useState(null);
  const [pannes, setPannes] = useState([]);
  const [carrieres, setCarrieres] = useState([]);
  const [selectedCarriereId, setSelectedCarriereId] = useState('');
  const [selectedPanne, setSelectedPanne] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingPannes, setIsLoadingPannes] = useState(false);
  const [filters, setFilters] = useState({});
  const [zones, setZones] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');

  // Effects
  useEffect(() => { loadCarrieres(); }, []);
  useEffect(() => { loadStats(); loadPannes(); }, [selectedCarriereId, filters]);

  // API calls
  const loadCarrieres = async () => {
    try {
      const data = await carrieresAPI.getAll({ superviseur_id: user?.matricule });
      setCarrieres(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      console.error('Error loading carrieres:', e);
    }
  };

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const f = { ...filters };
      if (selectedCarriereId) f.carriere_id = selectedCarriereId;
      const data = await dashboardAPI.getStats(f);
      setStats(data);
    } catch (e) {
      console.error('Error loading stats:', e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadPannes = async () => {
    setIsLoadingPannes(true);
    try {
      const f = { ...filters };
      if (selectedCarriereId) f.carriere_id = selectedCarriereId;
      const res = await pannesAPI.getAll(f);
      const arr = Array.isArray(res) ? res : res?.data || [];
      setPannes(arr);
      setZones([...new Set(arr.map(p => p.zone).filter(Boolean))]);
    } catch (e) {
      console.error('Error loading pannes:', e);
    } finally {
      setIsLoadingPannes(false);
    }
  };

  // ── Derived Data ───────────────────────────────────────────────────────

  /** Status distribution for donut chart */
  const statusData = useMemo(() => {
    const actif = pannes.filter(p => isActive(p.status || p.statut || '')).length;
    return [
      { name: 'ACTIF', value: actif, color: COLORS.warning },
      { name: 'RÉSOLU', value: pannes.length - actif, color: COLORS.primary },
    ];
  }, [pannes]);

  /** Pannes by zone for bar chart */
  const zoneData = useMemo(() => {
    const map = {};
    pannes.forEach(p => {
      if (p.zone) map[p.zone] = (map[p.zone] || 0) + 1;
    });
    return Object.entries(map)
      .map(([zone, total]) => ({ zone, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [pannes]);

  /** Trend data for line chart */
  const trendData = useMemo(() => {
    const map = {};
    pannes.forEach(p => {
      const raw = p.date_panne || p.date_debut;
      if (raw) {
        const key = new Date(raw).toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit' 
        });
        map[key] = (map[key] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .slice(-14);
  }, [pannes]);

  /** Filtered table data */
  const filteredPannes = useMemo(() => {
    return pannes.filter(p => {
      const active = isActive(p.status || p.statut || '');
      const okStatus =
        !statusFilter ||
        (statusFilter === 'actif' && active) ||
        (statusFilter === 'resolu' && !active);
      const okZone = !zoneFilter || p.zone === zoneFilter;
      return okStatus && okZone;
    });
  }, [pannes, statusFilter, zoneFilter]);

  // Helpers
  const carriereName = carrieres.find(c => String(c.id) === String(selectedCarriereId))?.nom;

  const handleRowClick = (panne) => {
    setSelectedPanne(panne);
    navigate(`/superviseur/pannes/${panne.id}`);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setZoneFilter('');
  };

  // Chart tooltip style
  const chartTooltipStyle = {
    contentStyle: { 
      fontSize: 12, 
      border: '1px solid #e5e7eb', 
      borderRadius: 8, 
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      backgroundColor: '#ffffff'
    },
    labelStyle: { 
      fontWeight: 700, 
      color: '#1f2937', 
      fontSize: 11,
      marginBottom: 4
    },
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* ── NAVIGATION ─────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="h-16 flex items-center justify-between">
            
            {/* Brand */}
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

            {/* Right section */}
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
                onClick={logout}
                className="px-5 py-2 text-xs font-bold tracking-wider uppercase
                  text-gray-600 bg-white border border-gray-300 rounded-lg
                  hover:bg-gray-50 hover:border-gray-400 transition-all duration-200
                  active:scale-95"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">

        {/* ── Header Section ─────────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-teal-600 mb-2">
              Tableau de Bord — Superviseur
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
              {carriereName ? `Carrière — ${carriereName}` : 'Vue Globale'}
            </h1>
            <p className="text-sm text-gray-500">
              {carriereName
                ? `Supervision de la carrière ${carriereName}`
                : 'Toutes vos carrières assignées'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400">
              Carrière
            </label>
            <select
              value={selectedCarriereId}
              onChange={e => {
                setSelectedCarriereId(e.target.value);
                setSelectedPanne(null);
                setFilters({});
              }}
              className="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 
                rounded-lg outline-none cursor-pointer hover:border-gray-400 
                focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all min-w-[200px]"
            >
              <option value="">Toutes les carrières</option>
              {carrieres.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Loading State ──────────────────────────────────────────── */}
        {isLoadingStats ? (
          <div className="text-center py-24">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-teal-600 mb-4" />
            <p className="text-gray-400 text-sm">Chargement des métriques...</p>
          </div>
        ) : (
          <>
            {/* ── KPI Cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <KPI
                label="MTBF"
                value={(stats?.mtbf_hours || 0).toFixed(1)}
                unit="h"
                subtext="Moy. entre pannes"
                accentColor={COLORS.primary}
              />
              <KPI
                label="MTTR"
                value={(stats?.mttr_hours || 0).toFixed(1)}
                unit="h"
                subtext="Temps moyen réparation"
                accentColor={COLORS.success}
              />
              <KPI
                label="En Cours"
                value={stats?.pannes_en_cours || 0}
                subtext="Pannes actives"
                accentColor={COLORS.warning}
              />
              <KPI
                label="Aujourd'hui"
                value={stats?.pannes_today || 0}
                subtext="Déclarées aujourd'hui"
                accentColor={COLORS.purple}
              />
              <KPI
                label="Indisponibilité"
                value={stats?.indisponibilite_percent || 0}
                unit="%"
                subtext="Cette semaine"
                accentColor={COLORS.danger}
              />
              <KPI
                label="Total Pannes"
                value={stats?.total_pannes || 0}
                subtext="Tous les temps"
                accentColor={COLORS.slate}
              />
            </div>

            {/* ── Charts Section ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_320px] gap-5 mb-6">
              
              {/* Line Chart - Trend */}
              <Card className="p-6">
                <SectionTitle>Évolution — 14 derniers jours</SectionTitle>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart 
                      data={trendData} 
                      margin={{ top: 10, right: 10, bottom: 10, left: -20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        allowDecimals={false}
                      />
                      <Tooltip {...chartTooltipStyle} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Pannes"
                        stroke={COLORS.primary}
                        strokeWidth={3}
                        dot={{ r: 4, fill: COLORS.primary, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: COLORS.primary }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart height={220} />
                )}
              </Card>

              {/* Bar Chart - By Zone */}
              <Card className="p-6">
                <SectionTitle>Pannes par Zone</SectionTitle>
                {zoneData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart 
                      data={zoneData} 
                      margin={{ top: 10, right: 10, bottom: 10, left: -20 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#f0f0f0" 
                        vertical={false} 
                      />
                      <XAxis 
                        dataKey="zone" 
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        allowDecimals={false}
                      />
                      <Tooltip {...chartTooltipStyle} />
                      <Bar 
                        dataKey="total" 
                        name="Pannes" 
                        fill={COLORS.primary}
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart height={220} />
                )}
              </Card>

              {/* Pie Chart - Status */}
              <Card className="p-6">
                <SectionTitle>Statut Global</SectionTitle>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="45%"
                      innerRadius={58}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltipStyle} />
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <span className="text-xs text-gray-700 font-semibold">
                          {value}
                        </span>
                      )}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* ── Filter Bar ─────────────────────────────────────────── */}
            <Card className="p-4 mb-5">
              <div className="flex items-center gap-5 flex-wrap">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400">
                  Filtres
                </span>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 
                    rounded-lg outline-none cursor-pointer hover:border-gray-300 
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all min-w-[180px]"
                >
                  <option value="">Tous les statuts</option>
                  <option value="actif">Actif</option>
                  <option value="resolu">Résolu</option>
                </select>

                <select
                  value={zoneFilter}
                  onChange={e => setZoneFilter(e.target.value)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 
                    rounded-lg outline-none cursor-pointer hover:border-gray-300 
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all min-w-[180px]"
                >
                  <option value="">Toutes les zones</option>
                  {zones.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>

                {(statusFilter || zoneFilter) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 
                      transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Réinitialiser
                  </button>
                )}

                <span className="ml-auto text-sm text-gray-400">
                  {filteredPannes.length} résultat{filteredPannes.length !== 1 ? 's' : ''}
                </span>
              </div>
            </Card>

            {/* ── Table + Detail Panel ───────────────────────────────── */}
            <div className={`grid gap-5 ${selectedPanne ? 'lg:grid-cols-[1fr_380px]' : 'grid-cols-1'}`}>
              
              {/* Table */}
              <Card className="overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <SectionTitle>Liste des Pannes</SectionTitle>
                </div>

                {isLoadingPannes ? (
                  <div className="py-16 text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-teal-600 mb-3" />
                    <p className="text-gray-400 text-sm">Chargement...</p>
                  </div>
                ) : filteredPannes.length === 0 ? (
                  <div className="py-20 text-center">
                    <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-400 text-sm">Aucune panne trouvée</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400">
                            ID
                          </th>
                          <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400">
                            Zone
                          </th>
                          <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400">
                            Type
                          </th>
                          <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400">
                            Équipement
                          </th>
                          <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400">
                            Début
                          </th>
                          <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400">
                            Statut
                          </th>
                          <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400">
                            Responsable
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPannes.map(p => {
                          const isSelected = selectedPanne?.id === p.id;
                          return (
                            <tr
                              key={p.id}
                              onClick={() => handleRowClick(p)}
                              className={`
                                border-b border-gray-50 cursor-pointer transition-all
                                ${isSelected 
                                  ? 'bg-teal-50 hover:bg-teal-50' 
                                  : 'hover:bg-gray-50'
                                }
                              `}
                            >
                              <td className="px-5 py-4 text-sm">
                                <span className="font-bold text-teal-600">
                                  #{p.id}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-600">
                                {p.zone || '—'}
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-600">
                                {p.type || '—'}
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-600">
                                {p.materiel?.nom || '—'}
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-600">
                                {(p.date_panne || p.date_debut)
                                  ? new Date(p.date_panne || p.date_debut).toLocaleDateString('fr-FR')
                                  : '—'}
                              </td>
                              <td className="px-5 py-4">
                                <Badge status={p.status || p.statut || ''} />
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-600">
                                {p.pointeur?.nom || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Detail Panel */}
              {selectedPanne && (
                <Card className="p-6 sticky top-20 h-fit">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-teal-600 mb-1">
                        Détail Panne
                      </p>
                      <p className="text-2xl font-extrabold text-gray-900">
                        #{selectedPanne.id}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPanne(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="border-t-2 border-teal-600 pt-5 space-y-4">
                    {[
                      { label: 'ZONE', value: selectedPanne.zone },
                      { label: 'TYPE', value: selectedPanne.type },
                      { label: 'ÉQUIPEMENT', value: selectedPanne.materiel?.nom },
                      { label: 'RESPONSABLE', value: selectedPanne.pointeur?.nom },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-1">
                          {label}
                        </p>
                        <p className="text-sm text-gray-700 font-medium">
                          {value || '—'}
                        </p>
                      </div>
                    ))}

                    <div>
                      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-1">
                        DÉBUT
                      </p>
                      <p className="text-sm text-gray-700">
                        {(selectedPanne.date_panne || selectedPanne.date_debut)
                          ? new Date(selectedPanne.date_panne || selectedPanne.date_debut).toLocaleString('fr-FR')
                          : '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-2">
                        STATUT
                      </p>
                      <Badge status={selectedPanne.status || selectedPanne.statut || ''} />
                    </div>

                    {selectedPanne.plan_action && (
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-1">
                          PLAN D'ACTION
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {selectedPanne.plan_action}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/superviseur/pannes/${selectedPanne.id}`)}
                      className="w-full mt-4 py-3.5 text-xs font-bold tracking-wider uppercase
                        text-white bg-teal-600 rounded-lg hover:bg-teal-700 
                        active:scale-95 transition-all duration-200 shadow-sm"
                    >
                      Voir les détails complets
                    </button>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}