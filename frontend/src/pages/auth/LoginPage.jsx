import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import menaraLogo from '../../assets/menaralogo.png';
import background2 from '../../assets/background2.jpeg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      const role = localStorage.getItem('userRole');
      navigate(role === 'superviseur' ? '/superviseur' : '/pointeur');
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-['Inter',system-ui,sans-serif] text-gray-700 bg-white">
      {/* ── Left sidebar ── */}
      <aside className="w-[280px] shrink-0 flex flex-col justify-between p-10 border-r border-gray-100 bg-[#fcfcfc]">
        <div>
          <img src={menaraLogo} alt="Menara Préfa" className="h-[52px] w-auto mb-7" />
          <div className="w-10 h-[3px] bg-[#c0392b] mb-5" />
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-1">SYSTÈME</p>
          <p className="text-[13px] text-gray-500">Gestion des Pannes — Carrière</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-1">VERSION</p>
          <p className="text-[13px] text-gray-500">v1.0.0</p>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-1 mt-4">ENVIRONNEMENT</p>
          <p className="text-[13px] text-gray-500">Production</p>
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex-1 flex items-center justify-center p-10 relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${background2})` }}
        />

        {/* Login card */}
        <div className="w-full max-w-[440px] relative z-10 bg-white rounded-lg shadow-[0_2px_16px_rgba(0,0,0,0.08)] p-10">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-6">
            CONNEXION AU SYSTÈME
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded text-[13px]">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-500 mb-2">
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre.email@menara.ma"
                className="w-full px-4 py-3.5 text-sm text-gray-700 bg-gray-100 border border-transparent rounded outline-none focus:border-[#2D9F93] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-500 mb-2">
                MOT DE PASSE
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••"
                  className="w-full px-4 py-3.5 pr-11 text-sm text-gray-700 bg-gray-100 border border-transparent rounded outline-none focus:border-[#2D9F93] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 text-[13px] font-bold tracking-[0.12em] uppercase text-white bg-[#2D9F93] rounded cursor-pointer transition-opacity disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
            >
              {isLoading ? 'CONNEXION...' : 'ACCÉDER AU SYSTÈME'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}