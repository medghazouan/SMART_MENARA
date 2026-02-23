import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/auth.api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const storedRole = localStorage.getItem('userRole');

            if (storedToken && storedUser && storedRole) {
                try {
                    // Verify token validity with backend
                    const response = await authAPI.getCurrentUser();
                    setToken(storedToken);
                    setUser(response.user);
                    setUserRole(response.type);
                } catch (error) {
                    console.error('Initial auth failed:', error);
                    localStorage.clear();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        const response = await authAPI.login(credentials);

        setUser(response.user);
        setUserRole(response.type);
        setToken(response.token);

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('userRole', response.type);
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } finally {
            setUser(null);
            setUserRole(null);
            setToken(null);
            localStorage.clear();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userRole,
                token,
                isAuthenticated: !!token,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}