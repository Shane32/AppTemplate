import { Container } from "react-bootstrap";
import { useQuery } from "@shane32/graphql";
import * as Queries from "./Home.queries.g";
import { graphql } from "../../gql/gql";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState } from "react";

void graphql;

interface MSGraphUser {
  id: string;
  displayName: string;
  userPrincipalName: string;
}

function Home() {
  const auth = useAuth();
  const info = auth.user;
  const [users, setUsers] = useState<MSGraphUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  console.log("doc", Queries.TestQuery1Document);
  const documentId = Queries.TestQuery1Document.__meta__?.hash;
  if (documentId) console.log("hash", documentId.match(/^[0-9a-f]{64}$/) ? "sha256:" + documentId : documentId);
  const { data: meData } = useQuery(Queries.TestQuery1Document);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get MS Graph access token
        const token = await auth.authManager.getAccessToken("ms");

        // Fetch current user profile from MS Graph API
        const response = await fetch("https://graph.microsoft.com/v1.0/me", {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: `Bearer ${token}`,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setUsers([data]); // Wrap single user in array for consistent display
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [auth]);

  return (
    <Container>
      <h2>Current User Info (from GraphQL)</h2>
      <p>Id: {info?.id ?? ""}</p>
      <p>Name: {info?.name ?? ""}</p>
      <p>First Name: {info?.firstName ?? ""}</p>
      <p>Last Name: {info?.lastName ?? ""}</p>
      <p>Roles: {info?.roles ?? ""}</p>

      <h2>Me (GraphQL demo)</h2>
      <p>Id: {meData?.me.id}</p>
      <p>Name: {meData?.me.name}</p>
      <p>Email: {meData?.me.email}</p>

      <h2 className="mt-4">User Profile (MS Graph API Demo)</h2>
      {error ? (
        <div className="alert alert-danger">
          {error}
          <div className="mt-2">
            <small>Note: This demo requires User.Read scope in Azure AD app registration</small>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Display Name</th>
                <th>Email</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.displayName}</td>
                  <td>{user.userPrincipalName}</td>
                  <td>{user.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}

export default Home;
