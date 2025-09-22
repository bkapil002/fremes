import { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login function
  const login = (userData, token) => {
    const tokenData = { ...userData, token };
    setIsAuthenticated(true);
    setUser(tokenData);
    localStorage.setItem('user', JSON.stringify(tokenData));

    // Auto logout when token expires
    const { exp } = jwtDecode(token);
    const timeout = exp * 1000 - Date.now();
    setTimeout(() => {
      logout();
    }, timeout);
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user');
  };

  // Check token on page load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const token = userData.token;

      if (!token) {
        logout();
      } else {
        const { exp } = jwtDecode(token);
        if (Date.now() >= exp * 1000) {
          // Token expired
          logout();
        } else {
          setUser(userData);
          setIsAuthenticated(true);

          // Auto logout after remaining time
          const timeout = exp * 1000 - Date.now();
          setTimeout(() => {
            logout();
          }, timeout);
        }
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
