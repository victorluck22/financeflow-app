import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getFromLocal,
  removeFromLocal,
  saveToLocal,
} from "../lib/locaStorageHelper";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getFromLocal("finance-flow-user") ?? null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    getFromLocal("finance-flow-authenticated") ?? false,
  );
  const [token, setToken] = useState(
    getFromLocal("finance-flow-token") ?? "123",
  );

  useEffect(() => {
    const storedUser = getFromLocal("finance-flow-user");
    const storedToken = getFromLocal("finance-flow-token");
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (access_token, userData) => {
    logout();
    if (userData) {
      setToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);
      saveToLocal("finance-flow-authenticated", true);
      saveToLocal("finance-flow-user", userData);
      saveToLocal("finance-flow-token", access_token);
      return userData;
    }
    return null;
  };

  const logout = () => {
    removeFromLocal("finance-flow-user");
    removeFromLocal("finance-flow-token");
    removeFromLocal("finance-flow-authenticated");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const updateUser = (nextUserData) => {
    if (!nextUserData) {
      return;
    }

    setUser(nextUserData);
    saveToLocal("finance-flow-user", nextUserData);
  };

  const value = {
    user,
    isAuthenticated,
    token,
    login,
    logout,
    updateUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
