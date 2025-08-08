import { createContext } from "react";
import { MeQuery, Role } from "../gql/graphql";
import { AuthManager } from "@shane32/msoauth";
import { GraphQLError } from "@shane32/graphql";

interface UserAuthContextType {
  user: MeQuery["me"] | null;
  logout: (path?: string) => Promise<void>;
  authManager: AuthManager;
  isAuthenticated: boolean;
  refresh: () => void;
  loading: boolean;
  can: (role: Role | Role[]) => boolean;
  error?: GraphQLError;
}

export const UserAuthContext = createContext<UserAuthContextType | null>(null);
export type { UserAuthContextType };
