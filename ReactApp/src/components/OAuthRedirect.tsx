import { Container, Spinner, Button, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";

export function OAuthRedirect() {
  const { authManager } = useAuth();
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const callbackUrl = pathname + search + hash;
  const [failure, setFailure] = useState<{ url: string; error: Error } | null>(null);
  const error = failure?.url === callbackUrl ? failure.error : null;

  useEffect(() => {
    let active = true;
    const isCurrentCallback = () => active && window.location.pathname + window.location.search + window.location.hash === callbackUrl;

    void authManager.handleRedirect().then(
      () => {
        // The auth manager normally restores the original URL. If none was
        // stored, leave the callback page after a successful sign in.
        if (isCurrentCallback()) {
          void navigate("/", { replace: true });
        }
      },
      (err: unknown) => {
        if (isCurrentCallback()) {
          console.error("Failure in handleRedirect", err);
          setFailure({
            url: callbackUrl,
            error: err instanceof Error ? err : new Error("An unknown error occurred"),
          });
        }
      },
    );

    return () => {
      active = false;
    };
  }, [authManager, callbackUrl, navigate]);

  if (error) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger" className="mb-4">
          Failed to complete sign in: {error.message || "An unknown error occurred"}
        </Alert>
        <Button variant="primary" onClick={() => void navigate("/", { replace: true })}>
          Back to Login
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
