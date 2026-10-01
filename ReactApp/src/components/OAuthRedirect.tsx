import { Container, Spinner, Button, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { AuthManager } from "@shane32/msoauth";
import useAuth from "../hooks/useAuth";

// Redeeming an authorization code consumes its state and verifier. Keep the
// operation outside the component so remounts share the same token exchange.
const redirectRequests = new WeakMap<AuthManager, { url: string; promise: Promise<void> }>();

export function OAuthRedirect() {
  const { authManager } = useAuth();
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const callbackUrl = pathname + search + hash;
  const [failure, setFailure] = useState<{ url: string; error: Error } | null>(null);
  const error = failure?.url === callbackUrl ? failure.error : null;

  useEffect(() => {
    let active = true;
    let request = redirectRequests.get(authManager);
    if (!request || request.url !== callbackUrl) {
      request = {
        url: callbackUrl,
        promise: Promise.resolve().then(() => authManager.handleRedirect()),
      };
      redirectRequests.set(authManager, request);
    }

    const isCurrentCallback = () => active && window.location.pathname + window.location.search + window.location.hash === callbackUrl;

    void request.promise.then(
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

  const handleRetry = () => {
    void authManager.login("/").catch((err: unknown) => {
      setFailure({
        url: callbackUrl,
        error: err instanceof Error ? err : new Error("Unable to start sign in"),
      });
    });
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
