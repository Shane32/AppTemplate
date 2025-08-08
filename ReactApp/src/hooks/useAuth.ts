import { useContext } from "react";
import { UserAuthContext } from "../contexts/UserAuthContext";

function useAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a UserAuthProvider");
  }
  return context;
}

export default useAuth;
