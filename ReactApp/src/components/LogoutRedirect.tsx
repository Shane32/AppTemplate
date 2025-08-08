import { Container, Spinner } from "react-bootstrap";
import useEffectOnce from "../hooks/useEffectOnce";
import useAuth from "../hooks/useAuth";

export function LogoutRedirect() {
  const auth = useAuth();

  useEffectOnce(() => {
    auth.authManager.handleLogoutRedirect();
  });

  return (
    <Container className="text-center mt-5">
      <Spinner animation="border" />
      <p className="mt-3">Completing sign out...</p>
    </Container>
  );
}
