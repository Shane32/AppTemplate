import { Container, Spinner } from "react-bootstrap";
import { useEffect } from "react";
import useAuth from "../hooks/useAuth";

export function LogoutRedirect() {
  const { authManager } = useAuth();
  useEffect(() => {
    // Cleanup cancels StrictMode's discarded setup before it redirects.
    const timer = setTimeout(() => authManager.handleLogoutRedirect(), 0);
    return () => clearTimeout(timer);
  }, [authManager]);

  return (
    <Container className="text-center mt-5">
      <Spinner animation="border" />
      <p className="mt-3">Completing sign out...</p>
    </Container>
  );
}
