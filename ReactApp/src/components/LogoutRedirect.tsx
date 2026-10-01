import { Alert, Container, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import useAuth from "../hooks/useAuth";

export function LogoutRedirect() {
  const { authManager } = useAuth();
  const { pathname, search, hash } = useLocation();
  const callbackUrl = pathname + search + hash;
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    // Schedule navigation after setup so cleanup cancels a StrictMode replay
    // before it can consume the stored return URL.
    void Promise.resolve()
      .then(() => {
        if (active && window.location.pathname + window.location.search + window.location.hash === callbackUrl) {
          authManager.handleLogoutRedirect();
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err : new Error("An unknown error occurred"));
        }
      });

    return () => {
      active = false;
    };
  }, [authManager, callbackUrl]);

  if (error) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">Failed to complete sign out: {error.message}</Alert>
      </Container>
    );
  }

  return (
    <Container className="text-center mt-5">
      <Spinner animation="border" />
      <p className="mt-3">Completing sign out...</p>
    </Container>
  );
}
