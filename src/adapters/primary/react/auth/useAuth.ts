import { useContext } from "react";
import { AuthContext } from "./authContexts";
import type { AuthContextValue } from "./authContexts";

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
