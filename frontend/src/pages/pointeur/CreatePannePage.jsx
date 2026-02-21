// src/pages/pointeur/CreatePannePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pannesAPI } from '../../api/pannes.api';
import { materielsAPI } from '../../api/materiels.api';
import { AlertCircle, LogOut, CheckCircle2, LayoutDashboard, FilePlus, Menu } from 'lucide-react'; // 🆕 Menu
import menaraLogo from '../../assets/menaralogo.png';

const TEAL = '#2D9F93';

export default function CreatePannePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [materiels, setMateriels] = useState([]);
  const [isLoadingMateriels, setIsLoadingMateriels] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // 🆕

  const now = new Date();
  const localDate = now.toISOString().slice(0, 10);
  const localTime = now.toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    zone: '',
    type: '',
    materiel_id: '',
    heures_compteur: '',
    date_panne: localDate,
    heure_panne: localTime,
    plan_action: '',
  });

  useEffect(() => { loadMateriels(); }, []);

  const loadMateriels = async () => {
    try {
      setIsLoadingMateriels(true);
      const response = await materielsAPI.getAll({ carriere_id: user?.carriere_id });
      setMateriels(response.data || response);
    } catch (error) {
      console.error('Error loading materiels:', error);
      setError('Erreur lors du chargement des matériels');
    } finally {
      setIsLoadingMateriels(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { date_panne, heure_panne, ...rest } = formData;
      await pannesAPI.create({
        ...rest,
        pointeur_id: user.matricule,
        carriere_id: user.carriere_id,
        date_panne: `${date_panne}T${heure_panne}:00`,
        materiel_id: parseInt(formData.materiel_id),
        heures_compteur: formData.heures_compteur ? parseInt(formData.heures_compteur) : null,
      });
      setSuccess(true);
      setTimeout(() => { navigate('/pointeur'); }, 2000);
    } catch (error) {
      console.error('Error creating panne:', error);
      setError(error.response?.data?.message || 'Erreur lors de la création de la panne');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen font-[Inter,system-ui,sans-serif] text-gray-700 bg-[#f5f6f8]">
        <aside className="hidden lg:flex w-65 shrink-0 flex-col justify-between bg-white border-r border-gray-100 shadow-sm">
          <div className="px-6 pt-7 pb-5 border-b border-gray-100">
            <img src={menaraLogo} alt="Menara" className="h-10 w-auto mb-4" />
          </div>
        </aside>
        <main className="flex-1 flex items-center justify-center overflow-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-md mx-4 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `${TEAL}20` }}>
              <CheckCircle2 size={32} style={{ color: TEAL }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Panne déclarée !</h2>
            <p className="text-gray-600">Redirection vers le tableau de bord...</p>
          </div>
        </main>
      </div>
    );
  }

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
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white"
              style={{ background: TEAL }}
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
              <h1 className="text-xl font-bold text-gray-900">Déclarer une Panne</h1>
              <p className="text-sm text-gray-400 mt-0.5 hidden sm:block">Créez une nouvelle déclaration de panne</p>
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
        <div className="px-4 sm:px-8 py-6"> {/* 🆕 px-4 sm:px-8 */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"> {/* 🆕 p-6 sm:p-8 */}

              {error && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Zone */}
                <div>
                  <label htmlFor="zone" className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">
                    Zone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" id="zone" name="zone" value={formData.zone}
                    onChange={handleChange} required placeholder="Ex: Station de concassage"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none transition-all"
                    style={{ '--tw-ring-color': `${TEAL}30` }}
                  />
                </div>

                {/* Type de Panne */}
                <div>
                  <label htmlFor="type" className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">
                    Type de Panne <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" id="type" name="type" value={formData.type}
                    onChange={handleChange} required placeholder="Ex: Coupure du bande TR200"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none transition-all"
                    style={{ '--tw-ring-color': `${TEAL}30` }}
                  />
                </div>

                {/* Date & Heure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* 🆕 grid-cols-1 sm:grid-cols-2 */}
                  <div>
                    <label htmlFor="date_panne" className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date" id="date_panne" name="date_panne" value={formData.date_panne}
                      onChange={handleChange} required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none transition-all"
                      style={{ '--tw-ring-color': `${TEAL}30` }}
                    />
                  </div>
                  <div>
                    <label htmlFor="heure_panne" className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">
                      Heure <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time" id="heure_panne" name="heure_panne" value={formData.heure_panne}
                      onChange={handleChange} required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none transition-all"
                      style={{ '--tw-ring-color': `${TEAL}30` }}
                    />
                  </div>
                </div>

                {/* Matériel */}
                <div>
                  <label htmlFor="materiel_id" className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">
                    Matériel Concerné <span className="text-red-500">*</span>
                  </label>
                  {isLoadingMateriels ? (
                    <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
                      Chargement des matériels...
                    </div>
                  ) : (
                    <select
                      id="materiel_id" name="materiel_id" value={formData.materiel_id}
                      onChange={handleChange} required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none transition-all"
                      style={{ '--tw-ring-color': `${TEAL}30` }}
                    >
                      <option value="">Sélectionner un matériel</option>
                      {materiels.map(materiel => (
                        <option key={materiel.matricule} value={materiel.matricule}>
                          {materiel.nom} - {materiel.categorie}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Compteur Horaire */}
                {(() => {
                  const selectedMat = materiels.find(m => String(m.matricule) === formData.materiel_id);
                  const initValue = selectedMat?.compteur_init;
                  return (
                    <div>
                      <label htmlFor="heures_compteur" className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">
                        Compteur horaire (h)
                      </label>
                      <input
                        type="number" id="heures_compteur" name="heures_compteur"
                        value={formData.heures_compteur} onChange={handleChange}
                        min={initValue || 0}
                        placeholder={initValue ? `Compteur init: ${initValue}h` : 'Sélectionnez un matériel d\'abord'}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none transition-all"
                        style={{ '--tw-ring-color': `${TEAL}30` }}
                      />
                      <p className="mt-1.5 text-xs text-gray-500">
                        {initValue
                          ? `Relevez le compteur actuel (doit être ≥ ${initValue}h)`
                          : 'Optionnel — Relevez le compteur horaire du matériel si disponible'}
                      </p>
                    </div>
                  );
                })()}

                {/* Plan d'Action */}
                <div>
                  <label htmlFor="plan_action" className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">
                    Plan d'Action
                  </label>
                  <textarea
                    id="plan_action" name="plan_action" value={formData.plan_action}
                    onChange={handleChange} rows={4}
                    placeholder="Décrivez les actions à entreprendre pour résoudre la panne..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent focus:outline-none transition-all resize-none"
                    style={{ '--tw-ring-color': `${TEAL}30` }}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Optionnel - Ajoutez des détails sur les actions correctives prévues</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6"> {/* 🆕 flex-col sm:flex-row */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoadingMateriels}
                    className="flex-1 px-6 py-2.5 text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
                    style={{ background: TEAL, '--tw-ring-color': TEAL }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Enregistrement...
                      </span>
                    ) : 'Déclarer la Panne'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/pointeur')}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 font-semibold transition-all"
                  >
                    Annuler
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
