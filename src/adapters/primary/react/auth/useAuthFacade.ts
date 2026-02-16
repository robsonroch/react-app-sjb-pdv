import { useContext } from "react";
import { AuthFacadeContext } from "./authContexts";
import type { AuthFacade } from "./authContexts";

export const useAuthFacade = (): AuthFacade => {
  const context = useContext(AuthFacadeContext);

  if (!context) {
    throw new Error("useAuthFacade must be used within AuthProvider");
  }

  return context;
};
