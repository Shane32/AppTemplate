import { Route, Routes } from "react-router-dom";
import { PageLayout } from "./components/PageLayout";
import { Suspense, lazy } from "react";
import NotFound from "./pages/NotFound";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import Home from "./pages/home/Home";
import useAuth from "./hooks/useAuth";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@shane32/msoauth";

const GraphiQL = lazy(() => import("./pages/graphiql/GraphiQL"));

export const appName = "App.Template";

function App() {
  const auth = useAuth();

  function onLogin() {
    auth.authManager.login().catch((e) => {
      // only occurs if obtaining the openid connect configuration fails
      console.error("Error logging in", e);
      alert(e.message);
    });
  }

  return (
    <>
      <AuthenticatedTemplate>
        <PageLayout>
          <Suspense
            fallback={
              <Container className="text-center">
                <Spinner animation="border" />
              </Container>
            }
          >
            <Pages />
          </Suspense>
        </PageLayout>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Container className="mt-5">
          <Row className="justify-content-center text-center">
            <Col xs={12} md={6}>
              <h2 className="mb-4">Welcome to {appName}</h2>
              <p className="mb-4">Please log in to continue</p>
              <Button variant="primary" size="lg" onClick={onLogin}>
                Log In
              </Button>
            </Col>
          </Row>
        </Container>
      </UnauthenticatedTemplate>
    </>
  );
}

function Pages() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="graphiql" element={<GraphiQL />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
