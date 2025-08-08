import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GraphQLClient, GraphQLContext } from "@shane32/graphql";
import "bootstrap/dist/css/bootstrap.min.css";
import { OAuthRedirect } from "./components/OAuthRedirect";
import { LogoutRedirect } from "./components/LogoutRedirect";
import { AuthProvider, MsAuthManager } from "@shane32/msoauth";
import { UserAuthProvider } from "./contexts/UserAuthProvider.tsx";

// Initialize AuthManager with Azure AD configuration
const authManager = new MsAuthManager({
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
  authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}/v2.0`,
  scopes: import.meta.env.VITE_AZURE_SCOPES,
  redirectUri: "/oauth/callback",
  navigateCallback: (path: string) => {
    // A navigate function that uses the browser's history API
    window.history.replaceState({}, "", path);
    // Dispatch a popstate event to trigger react-router navigation
    window.dispatchEvent(new PopStateEvent("popstate"));
  },
  policies: {},
  logoutRedirectUri: "/oauth/logout",
});

const client = new GraphQLClient({
  url: import.meta.env.VITE_GRAPHQL_URL,
  webSocketUrl: import.meta.env.VITE_GRAPHQL_WEBSOCKET_URL,
  sendDocumentIdAsQuery: true,
  transformRequest: async (config) => {
    try {
      const token = await authManager.getAccessToken();
      return {
        ...config,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { ...config.headers, Authorization: `Bearer ${token}` },
      };
    } catch {
      return config;
    }
  },
  generatePayload: async () => {
    try {
      const token = await authManager.getAccessToken();
      return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${token}`,
      };
    } catch {
      return {};
    }
  },
  defaultFetchPolicy: "no-cache",
});

// Listen for auth events to reset GraphQL client store
authManager.addEventListener("login", () => client.resetStore());
authManager.addEventListener("logout", () => client.resetStore());

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <GraphQLContext.Provider value={{ client }}>
    <AuthProvider authManager={authManager}>
      <UserAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/oauth/callback" element={<OAuthRedirect />} />
            <Route path="/oauth/logout" element={<LogoutRedirect />} />
            <Route path="/*" element={<App />} />
          </Routes>
        </BrowserRouter>
      </UserAuthProvider>
    </AuthProvider>
  </GraphQLContext.Provider>,
);
