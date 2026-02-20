import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, CheckCircle2, Clock, Search } from 'lucide-react';

const TEAL = '#2D9F93';

export default function PannesTable({
  pannes = [],
  isLoading = false,
  onRowClick = null,
  selectedPanneId = null,
}) {
  const getStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('en_cours') || s.includes('en cours') || s.includes('actif'))
      return { label: 'ACTIF', cls: 'bg-orange-100 text-orange-700', icon: <AlertTriangle size={12} /> };
    if (s.includes('resolue') || s.includes('résolue') || s.includes('ok'))
      return { label: 'RÉSOLU', cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={12} /> };
    return { label: status?.toUpperCase() || '—', cls: 'bg-gray-100 text-gray-600', icon: null };
  };

  const formatDuration = (start, end) => {
    if (!start) return '—';
    try {
      const ms = (end ? new Date(end) : new Date()) - new Date(start);
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    } catch { return '—'; }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: fr }); }
    catch { return '—'; }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="inline-block animate-spin text-[#2D9F93]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <p className="mt-3 text-sm text-gray-400">Chargement des pannes…</p>
      </div>
    );
  }

  if (!pannes || pannes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <Search size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-400">Aucune panne trouvée</p>
      </div>
    );
  }

  const TH = 'px-5 py-3 text-left text-[10px] font-semibold tracking-[0.1em] uppercase text-gray-400';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Pannes en temps réel</h3>
          <p className="text-xs text-gray-400 mt-0.5">{pannes.length} enregistrement{pannes.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock size={13} /> Mise à jour en direct
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-[#fafbfc]">
              <th className={TH}>ID</th>
              <th className={TH}>Zone</th>
              <th className={TH}>Équipement</th>
              <th className={TH}>Type</th>
              <th className={TH}>Début</th>
              <th className={TH}>Statut</th>
              <th className={TH}>MTTR</th>
            </tr>
          </thead>
          <tbody>
            {pannes.map((panne) => {
              const status = getStatus(panne.status || panne.statut);
              const isSelected = selectedPanneId === panne.id;
              return (
                <tr
                  key={panne.id}
                  onClick={() => onRowClick?.(panne)}
                  className={`border-b border-gray-50 cursor-pointer transition-colors ${isSelected
                      ? 'bg-[#2D9F93]/5 border-l-[3px]'
                      : 'hover:bg-gray-50/80'
                    }`}
                  style={isSelected ? { borderLeftColor: TEAL } : {}}
                >
                  <td className="px-5 py-3.5 font-semibold text-gray-800">#{panne.id}</td>
                  <td className="px-5 py-3.5 text-gray-600">{panne.zone || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{panne.materiel?.nom || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{panne.type || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{formatDate(panne.date_panne || panne.date_debut)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${status.cls}`}>
                      {status.icon} {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs font-mono">
                    {formatDuration(panne.date_panne || panne.date_debut, panne.date_fin)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
