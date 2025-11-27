import WelcomeName from "./WelcomeName";
import { Link, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { Container, Navbar, NavDropdown } from "react-bootstrap";
import NavbarContext from "react-bootstrap/NavbarContext";
import { appName } from "../App";
import { PersonCircle } from "react-bootstrap-icons";
import useAuth from "../hooks/useAuth";
import { AuthenticatedTemplate } from "@shane32/msoauth";

const changePasswordUrl = "https://account.activedirectory.windowsazure.com/ChangePassword.aspx";

const NavBar = ({ hidePaths }: { hidePaths?: boolean }) => {
  const auth = useAuth();

  return (
    <Navbar expand="lg" variant="dark" bg="dark" className="mb-3">
      <NavbarAutoClose />
      <Container fluid>
        <Link className="navbar-brand" to="/">
          {appName}
        </Link>
        <Navbar.Toggle />
        <Navbar.Collapse id="basic-navbar-nav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <HeaderLink text="Home" path="/" />
            {!hidePaths && (
              <>
                <HeaderLink text="GraphiQL" path="/graphiql" />
                <HeaderLink text="Settings" path="/settings" />
                <HeaderLink text="About" path="/about" />
              </>
            )}
          </ul>

          <AuthenticatedTemplate>
            <div className="d-flex align-items-center">
              <div className="me-2">
                <WelcomeName />
              </div>
              <NavDropdown title={<PersonCircle size={24} color="white" />} id="user-nav-dropdown" align="end">
                {changePasswordUrl && (
                  <NavDropdown.Item href={changePasswordUrl} target="_blank" rel="noopener noreferrer">
                    Change Password
                  </NavDropdown.Item>
                )}
                <NavDropdown.Item
                  onClick={() => {
                    auth.logout();
                  }}
                >
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          </AuthenticatedTemplate>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

function NavbarAutoClose() {
  const context = useContext(NavbarContext);
  const { pathname } = useLocation();

  useEffect(() => {
    if (context?.expanded) context?.onToggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}

function HeaderLink(props: { text: string; path: string }) {
  const { pathname } = useLocation();
  const activeTab = props.path === "/" ? pathname === "/" : pathname.startsWith(props.path);

  return (
    <li className="nav-item position-relative me-3">
      <Link className={activeTab ? "nav-link active" : "nav-link"} to={props.path}>
        {props.text}
      </Link>
    </li>
  );
}

export default NavBar;

export const EmptyNavBar = () => <NavBar hidePaths={true} />;
