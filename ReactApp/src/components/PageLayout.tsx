import { Container, Spinner } from "react-bootstrap";
import ErrorDisplay from "./errors/ErrorDisplay";
import NavBar, { EmptyNavBar } from "./NavBar";
import useAuth from "../hooks/useAuth";

interface IProps {
  children?: React.ReactNode;
}

export const PageLayout = ({ children }: IProps) => {
  const auth = useAuth();

  // If unable to successfully connect to GraphQL, prevent all other components from rendering
  if (auth.error) {
    return (
      <>
        <EmptyNavBar />
        <Container>
          <ErrorDisplay className="mt-3" onClick={auth.refresh}>
            <b>Unable to connect to the server</b>
            <br />
            {auth.error.message}
          </ErrorDisplay>
        </Container>
      </>
    );
  }

  if (auth.loading) {
    return (
      <>
        <EmptyNavBar />
        <Container>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 56px)" }}>
            <Spinner />
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar />
      {children}
    </>
  );
};
