import useAuth from "../hooks/useAuth";
import { Role } from "../gql/graphql";

const WelcomeName = () => {
  const auth = useAuth();
  const info = auth.user;
  const name = (info && (info.firstName || (info.name && info.name.split(" ")[0]))) || null;
  const isAdmin = auth.can(Role.Admin);

  if (name) {
    return (
      <div className="text-light">
        Welcome, {name}
        {isAdmin && <span className="badge bg-warning text-dark ms-2">Admin</span>}
      </div>
    );
  } else {
    return null;
  }
};

export default WelcomeName;
