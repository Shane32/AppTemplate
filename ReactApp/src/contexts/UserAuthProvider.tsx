import { useContext, ReactNode, useState, useEffect } from "react";
import { useQuery } from "@shane32/graphql";
import { AuthContext } from "@shane32/msoauth";
import { MeDocument } from "./UserAuthProvider.queries.g";
import { Role } from "../gql/graphql";
import { UserAuthContext, UserAuthContextType } from "./UserAuthContext";

interface UserAuthProviderProps {
  children: ReactNode;
}

export function UserAuthProvider({ children }: UserAuthProviderProps) {
  const authManager = useContext(AuthContext);
  const [, setRefresh] = useState({});

  if (!authManager) {
    throw new Error("UserAuthProvider must be used within an AuthProvider");
  }

  const isAuthenticated = authManager.isAuthenticated();
  const { data, loading, refetch, error } = useQuery(MeDocument, {
    skip: !isAuthenticated,
  });

  const contextValue: UserAuthContextType = {
    user: (isAuthenticated && data?.me) || null,
    logout: (path) => authManager.logout(path),
    authManager,
    isAuthenticated,
    refresh: () => {
      setRefresh({});
      refetch();
    },
    loading,
    error,
    can: (role: Role | Role[]) => {
      if (!isAuthenticated || !data?.me?.roles) return false;
      const requiredRoles = Array.isArray(role) ? role : [role];
      return requiredRoles.some((r) => data.me.roles.includes(r));
    },
  };

  useEffect(() => {
    const refresh = () => {
      setRefresh({});
      refetch();
    };

    authManager.addEventListener("login", refresh);
    authManager.addEventListener("logout", refresh);
    return () => {
      authManager.removeEventListener("login", refresh);
      authManager.removeEventListener("logout", refresh);
    };
  }, [authManager, refetch]);

  return <UserAuthContext.Provider value={contextValue}>{children}</UserAuthContext.Provider>;
}
