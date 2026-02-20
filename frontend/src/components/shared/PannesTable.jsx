import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PannesTable({
  pannes = [],
  isLoading = false,
  onRowClick = null,
  selectedPanneId = null,
  onResolve = null,
}) {
  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('en_cours') || statusLower.includes('en cours') || statusLower.includes('actif')) {
      return 'bg-orange-100 text-orange-800';
    }
    if (statusLower.includes('resolue') || statusLower.includes('résolue') || statusLower.includes('ok')) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (value) => {
    if (!value) return '—';
    const valueLower = value.toLowerCase();
    if (valueLower.includes('en_cours') || valueLower.includes('en cours') || valueLower.includes('actif')) return 'ACTIF';
    if (valueLower.includes('resolue') || valueLower.includes('résolue') || valueLower.includes('ok')) return 'OK';
    return value.toUpperCase();
  };

  const formatDuration = (startDate, endDate = null) => {
    if (!startDate) return '—';
    try {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date();
      const diffMs = end - start;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours > 0) {
        return `${diffHours}h ${diffMins}m`;
      }
      return `${diffMins}m`;
    } catch {
      return '—';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch {
      return '—';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="inline-block animate-spin">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>
    );
  }

  if (!pannes || pannes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        Aucune panne trouvée
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <h3 className="font-semibold text-gray-900">PANNES EN TEMPS RÉEL</h3>
        <p className="text-sm text-gray-600 mt-1">{pannes.length} enregistrement(s)</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Zone</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Équipement</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Début</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">MTTR</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Responsable</th>
            </tr>
          </thead>
          <tbody>
            {pannes.map((panne, idx) => (
              <tr
                key={panne.id}
                onClick={() => onRowClick?.(panne)}
                className={`border-b cursor-pointer transition-colors ${
                  selectedPanneId === panne.id
                    ? 'bg-blue-50'
                    : idx % 2 === 0
                    ? 'bg-white hover:bg-gray-50'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <td className="px-6 py-4 text-gray-900 font-medium">{panne.id}</td>
                <td className="px-6 py-4 text-gray-700">{panne.zone || '—'}</td>
                <td className="px-6 py-4 text-gray-700">{panne.materiel?.nom || '—'}</td>
                <td className="px-6 py-4 text-gray-700">{panne.type || '—'}</td>
                <td className="px-6 py-4 text-gray-700">{formatDate(panne.date_panne || panne.date_debut)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(panne.status || panne.statut)}`}>
                    {getStatusLabel(panne.status || panne.statut)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{formatDuration(panne.date_panne || panne.date_debut, panne.date_fin)}</td>
                <td className="px-6 py-4 text-gray-700">
                  <div className="truncate max-w-xs" title={panne.pointeur?.nom || '—'}>
                    {panne.pointeur?.nom || '—'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
