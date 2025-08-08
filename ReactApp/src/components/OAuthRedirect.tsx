import { Container, Spinner, Button, Alert } from "react-bootstrap";
import useEffectOnce from "../hooks/useEffectOnce";
import { useState } from "react";
import useAuth from "../hooks/useAuth";

export function OAuthRedirect() {
  const auth = useAuth();
  const [error, setError] = useState<Error | null>(null);

  useEffectOnce(async () => {
    try {
      await auth.authManager.handleRedirect();
      // this code should not execute (or should have no effect)
      console.error("No redirect occurred");
      setError(new Error("An unknown error occurred"));
    } catch (err) {
      console.error("Failure in handleRedirect", err);
      setError(err as Error);
    }
  });

  const handleRetry = () => {
    auth.authManager.login("/");
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
