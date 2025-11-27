import { ReactNode } from "react";
import { useQuery } from "@shane32/graphql";
import { useAuth } from "@shane32/msoauth";
import { MeDocument } from "./UserAuthProvider.queries.g";
import { Role } from "../gql/graphql";
import { UserAuthContext, UserAuthContextType } from "./UserAuthContext";

interface UserAuthProviderProps {
  children: ReactNode;
}

export function UserAuthProvider({ children }: UserAuthProviderProps) {
  const authManager = useAuth();

  if (!authManager) {
    throw new Error("UserAuthProvider must be used within an AuthProvider");
  }

  const isAuthenticated = authManager.isAuthenticated();
  const { data, loading, refetch, error } = useQuery(MeDocument, {
    skip: !isAuthenticated,
  });

  // Note that main.tsx calls resetStore if the auth state changes, so this query
  // will be re-run automatically on login/logout.

  const contextValue: UserAuthContextType = {
    user: (isAuthenticated && data?.me) || null,
    logout: (path) => authManager.logout(path),
    authManager,
    isAuthenticated,
    refresh: () => {
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

  return <UserAuthContext.Provider value={contextValue}>{children}</UserAuthContext.Provider>;
}
