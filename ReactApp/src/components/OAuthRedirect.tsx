import { Container, Spinner, Button, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";

export function OAuthRedirect() {
  const { authManager } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    void authManager.handleRedirect().then(
      () => {
        console.error("No redirect occurred");
        setError(new Error("An unknown error occurred"));
      },
      (err: unknown) => {
        console.error("Failure in handleRedirect", err);
        setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      },
    );
  }, [authManager]);

  const handleRetry = () => {
    void authManager.login("/");
  };

  if (error) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger" className="mb-4">
          Failed to complete sign in: {error.message || "An unknown error occurred"}
        </Alert>
        <Button variant="primary" onClick={handleRetry}>
          Try Signing In Again
        </Button>
      </Container>
    );
  }

  return (
    <Container className="text-center mt-5">
      <Spinner animation="border" />
      <p className="mt-3">Completing sign in...</p>
    </Container>
  );
}
