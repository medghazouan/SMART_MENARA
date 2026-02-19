// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import PointeurDashboard from './pages/pointeur/DashboardPage';
import CreatePannePage from './pages/pointeur/CreatePannePage';
import PointeurPanneDetailPage from './pages/pointeur/PanneDetailPage';
import SuperviseurDashboard from './pages/superviseur/DashboardPage';
import SuperviseurPanneDetailPage from './pages/superviseur/PanneDetailPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Pointeur Routes */}
          <Route
            path="/pointeur"
            element={
              <ProtectedRoute allowedRole="pointeur">
                <PointeurDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pointeur/pannes/create"
            element={
              <ProtectedRoute allowedRole="pointeur">
                <CreatePannePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pointeur/pannes/:id"
            element={
              <ProtectedRoute allowedRole="pointeur">
                <PointeurPanneDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Superviseur Routes */}
          <Route
            path="/superviseur"
            element={
              <ProtectedRoute allowedRole="superviseur">
                <SuperviseurDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superviseur/pannes/:id"
            element={
              <ProtectedRoute allowedRole="superviseur">
                <SuperviseurPanneDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Unauthorized page */}
          <Route 
            path="/unauthorized" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-2">Accès non autorisé</h1>
                  <p className="text-gray-600 mb-4">Vous n'avez pas la permission d'accéder à cette page.</p>
                  <a href="/login" className="text-blue-600 hover:text-blue-800">
                    Retour à la connexion
                  </a>
                </div>
              </div>
            } 
          />

          {/* 404 page */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                  <p className="text-gray-600 mb-4">Page non trouvée</p>
                  <a href="/login" className="text-blue-600 hover:text-blue-800">
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;