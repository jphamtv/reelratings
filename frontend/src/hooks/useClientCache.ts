import { useContext } from "react";
import {
  ClientCacheContext,
  ClientCacheContextType,
} from "../context/ClientCacheContext";

export const useClientCache = (): ClientCacheContextType => {
  const context = useContext(ClientCacheContext);
  if (context === undefined) {
    throw new Error("useClientCache must be used within a ClientCacheProvider");
  }
  return context;
};
