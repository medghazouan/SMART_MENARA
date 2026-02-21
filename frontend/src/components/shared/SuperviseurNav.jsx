import React from 'react'
import menaraLogo from '../../assets/menaralogo.png';
import NotificationBell from '../../components/shared/NotificationBell';

const SuperviseurNav = ({ data }) => {
  const { user, logout } = data;
    
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-16 flex items-center justify-between">
    
                {/* ── Brand ── */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <img
                    src={menaraLogo}
                    alt="Menara Préfa"
                    className="h-8 sm:h-10 w-auto"
                  />
                  <div className="w-px h-7 bg-gray-200" />
                  <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-teal-600 leading-tight">
                      SMART MENARA
                    </p>
                    <p className="hidden sm:block text-[10px] text-gray-400 tracking-wider">
                      GESTION DES PANNES
                    </p>
                  </div>
                </div>
    
                {/* ── Right Section ── */}
                <div className="flex items-center gap-3 sm:gap-5">
                  <NotificationBell />
    
                  {/* Divider — hidden on mobile */}
                  <div className="hidden sm:block w-px h-6 bg-gray-200" />
    
                  {/* User info — hidden on mobile */}
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.nom}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Superviseur
                    </p>
                  </div>
    
                  {/* Logout — icon-only on mobile, full button on sm+ */}
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-2.5 sm:px-5 py-2 text-xs font-bold
                      tracking-wider uppercase text-gray-600 bg-white border border-gray-300
                      rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all
                      duration-200 active:scale-95"
                    title="Déconnexion"
                  >
                    {/* Logout icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 
                          01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {/* Text hidden on mobile */}
                    <span className="hidden sm:inline">Déconnexion</span>
                  </button>
                </div>
    
              </div>
            </div>
          </nav>
  )
}

export default SuperviseurNav