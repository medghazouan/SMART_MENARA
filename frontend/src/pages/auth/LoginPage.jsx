import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import menaraLogo from '../../assets/menaralogo.png';
import background2 from '../../assets/background2.jpeg';

const TEAL = '#2D9F93';

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
      navigate('/superviseur');
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* ───── Left sidebar ───── */}
      <aside style={styles.sidebar}>
        <div>
          <img src={menaraLogo} alt="Menara Préfa" style={styles.logo} />

          <div style={styles.sidebarDivider} />

          <p style={styles.sidebarLabel}>SYSTÈME</p>
          <p style={styles.sidebarValue}>Gestion des Pannes — Carrière</p>
        </div>

        <div>
          <p style={styles.sidebarLabel}>VERSION</p>
          <p style={styles.sidebarValue}>v1.0.0 </p>

          <p style={{ ...styles.sidebarLabel, marginTop: 16 }}>ENVIRONNEMENT</p>
          <p style={styles.sidebarValue}>Production</p>
        </div>
      </aside>

      {/* ───── Main area ───── */}
      <main style={styles.main}>
        {/* Background image with opacity */}
        <div style={{
          ...styles.bgOverlay,
          backgroundImage: `url(${background2})`,
        }} />
        <div style={styles.formWrapper}>
          {/* Role label — Superviseur only */}
          <div style={styles.roleLabel}>
            SUPERVISEUR
          </div>

          {/* Form title */}
          <p style={styles.formTitle}>CONNEXION SUPERVISEUR</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div style={styles.errorBox}>{error}</div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" style={styles.label}>EMAIL</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre.email@menara.ma"
                style={styles.input}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={styles.label}>MOT DE PASSE</label>
              <div style={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••"
                  style={{ ...styles.input, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.toggleBtn}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    /* Eye-off icon */
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    /* Eye icon */
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
              style={{
                ...styles.submitBtn,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'CONNEXION...' : 'ACCÉDER AU SYSTÈME'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

/* ────────────────────────── Inline styles ────────────────────────── */

const styles = {
  /* Page layout */
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily:
      "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    color: '#333',
    background: '#fff',
  },

  /* ── Sidebar ── */
  sidebar: {
    width: 280,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '40px 32px',
    borderRight: '1px solid #eee',
    background: '#fcfcfc',
  },
  logo: {
    height: 52,
    width: 'auto',
    marginBottom: 28,
  },
  sidebarDivider: {
    width: 40,
    height: 3,
    background: '#c0392b',
    marginBottom: 20,
  },
  sidebarLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#999',
    margin: '0 0 4px',
  },
  sidebarValue: {
    fontSize: 13,
    color: '#555',
    margin: 0,
    lineHeight: 1.5,
  },

  /* ── Main content ── */
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    background: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  bgOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: 0.2,
    pointerEvents: 'none',
  },
  formWrapper: {
    width: '100%',
    maxWidth: 440,
    position: 'relative',
    zIndex: 1,
    background: '#fff',
    padding: '40px 36px',
    borderRadius: 8,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  },

  /* Role label */
  roleLabel: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: TEAL,
    borderBottom: `2px solid ${TEAL}`,
    paddingBottom: 10,
    marginBottom: 32,
  },

  /* Form title */
  formTitle: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: 24,
  },

  /* Form */
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },

  /* Labels */
  label: {
    display: 'block',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#777',
    marginBottom: 8,
  },

  /* Inputs */
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: 14,
    color: '#333',
    background: '#f2f2f2',
    border: '1px solid transparent',
    borderRadius: 4,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },

  /* Password wrapper */
  passwordWrapper: {
    position: 'relative',
  },
  toggleBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color: '#999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Error */
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: 4,
    fontSize: 13,
  },

  /* Submit button */
  submitBtn: {
    width: '100%',
    padding: '15px 0',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#fff',
    background: TEAL,
    border: 'none',
    borderRadius: 4,
    marginTop: 8,
    transition: 'opacity 0.2s',
  },
};