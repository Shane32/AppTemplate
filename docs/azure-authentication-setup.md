# Application Authentication Setup

This guide covers configuring Microsoft Entra ID (formerly Azure AD) authentication for your application.

## Prerequisites

Before starting this guide, ensure you have:

- An Azure subscription
- Application deployed or ready to deploy
- Application URLs for your environments (development and/or production)

## Create Azure App Registration

1. Navigate to the [Azure Portal](https://portal.azure.com)
2. Go to **Microsoft Entra ID**
3. Select **App registrations** from the left menu
4. Click **New registration**

### Configure Registration

1. **Name**: Enter a descriptive name (e.g., `MyApp`)

2. **Supported account types**: Choose based on your needs

   - **Single tenant**: "Accounts in this organizational directory only"
     - Use for internal applications
     - Most secure option
   - **Multi-tenant**: "Accounts in any organizational directory"
     - Use for applications serving multiple organizations
     - Requires additional configuration

3. **Redirect URI**:

   - Platform: **Single-page application (SPA)**
   - URI: `https://localhost:44323/oauth/callback` (development login callback)
   - The Azure development and production callbacks will be added under the **Web** platform later.

4. Click **Register**

## Configure App Registration

After creating the registration, configure additional settings:

### 1. Note the Application (Client) ID

From the **Overview** page, copy the **Application (client) ID**. You'll need this for configuration.

### 2. Configure Token Claims

1. Go to **Token configuration** in the left menu
2. Click **Add optional claim**
3. Select **ID** token type
4. Add the following claims:
   - ✅ `family_name` - User's last name
   - ✅ `given_name` - User's first name
   - ✅ `email` - User's email address
5. Click **Add**
6. If prompted about Microsoft Graph permissions, click **Yes, add the required Graph permission**

### 3. Add Additional Redirect URIs

1. Go to **Authentication**.
2. Under **Single-page application**, add the local logout URI: `https://localhost:44323/oauth/logout`.
3. If developers run the frontend directly on Vite, also add `http://localhost:5173/oauth/callback` and `http://localhost:5173/oauth/logout` under **Single-page application**.
4. Add a **Web** platform and register the Azure development site's `/oauth/callback` and `/oauth/logout` URIs, for example `https://your-dev-app.azurewebsites.net/oauth/callback` and `https://your-dev-app.azurewebsites.net/oauth/logout`.
5. Under **Web**, register the equivalent URIs for the Azure production site, for example `https://your-prod-app.azurewebsites.net/oauth/callback` and `https://your-prod-app.azurewebsites.net/oauth/logout`. Replace these example hosts with your actual deployment hosts.
6. Click **Save**.

### 4. Configure Federated Credential

Use the existing user-assigned runtime identity created and attached in [Azure Web App Setup](azure-webapp-setup.md#create-runtime-managed-identity). This identity handles database, Key Vault, and OAuth access; GitHub Actions uses the separate deployment identity. The runtime identity and app registration must belong to the same Microsoft Entra tenant.

1. From the runtime identity's **Overview** page, note its **Client ID** and **Object (principal) ID**.
2. On the app registration, go to **Certificates & secrets** > **Federated credentials** > **Add credential**.
3. Select the **Managed Identity** scenario, then select the existing runtime identity (e.g., `myapp-dev-runtime-identity`).
4. Verify the values below, enter a credential name (e.g., `myapp-dev-runtime-identity-cred`), and click **Add**.

The federated credential must use these values:

| Field | Value |
| ----- | ----- |
| Issuer | `https://login.microsoftonline.com/<tenant-guid>/v2.0` using the identity's actual tenant GUID, including when the application uses `common` |
| Subject | Runtime identity's **Object (principal) ID** |
| Audience | `api://AzureADTokenExchange` |

Repeat for each environment's runtime identity. A shared app registration needs a federated credential for each runtime identity. See [Microsoft's managed-identity federation guide](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-config-app-trust-managed-identity).

## Configure Application Settings

Update your application configuration with the app registration details.

### Backend Configuration

Update `AppServer/appsettings.json` with one of the following configurations:

**Multi-tenant configuration** (allows account types selected in the app registration):

```json
{
  "Authentication": {
    "DefaultScheme": "Bearer",
    "Schemes": {
      "Bearer": {
        "ValidAudience": "your-client-id-here",
        "Authority": "https://login.microsoftonline.com/common/v2.0",
        "ValidateIssuer": false
      }
    }
  }
}
```

**Single-tenant configuration** (allows only accounts from your organization):

```json
{
  "Authentication": {
    "DefaultScheme": "Bearer",
    "Schemes": {
      "Bearer": {
        "ValidAudience": "your-client-id-here",
        "Authority": "https://login.microsoftonline.com/your-tenant-id-here/v2.0",
        "ValidateIssuer": true
      }
    }
  }
}
```

**Important**: Replace `your-client-id-here` with your Application (client) ID. For single-tenant, also replace `your-tenant-id-here` with your Directory (tenant) ID.

### Frontend Configuration

Update `ReactApp/.env`:

```env
VITE_AZURE_CLIENT_ID=your-client-id-here
VITE_AZURE_TENANT_ID=common
VITE_AZURE_SCOPES=openid profile offline_access email
```

**Important**:

- Replace `your-client-id-here` with your Application (client) ID
- For multi-tenant apps, use `common` as the tenant ID
- For single-tenant apps, replace `common` with your Directory (tenant) ID

## Multi-Environment Setup

You can use a single app registration across all environments, with **SPA** redirect URIs for local development, **Web** redirect URIs for Azure deployments, and a federated credential for each runtime managed identity.

If you use separate app registrations, configure each environment's frontend and backend with the matching client and tenant IDs.

## Security Considerations

### Authentication Flow

This template uses the **Authorization Code Flow with PKCE** (Proof Key for Code Exchange) for authentication, implemented via the [@shane32/msoauth](https://github.com/Shane32/msoauth) library. When a user logs in, they are redirected to Microsoft's login page, and upon successful authentication, redirected back to the application with an authorization code. The application then exchanges this code for ID, access, and refresh tokens using a secure fetch request.

In local development, token exchanges and refreshes go directly to Microsoft. Azure deployments use the backend `/api/oauth/token` proxy with managed identity authentication to obtain longer-lived refresh tokens. The browser still receives and stores the Microsoft tokens.

**Key characteristics of this flow:**

- **No iframes or hidden windows**: Interactive authentication happens through full-page redirects, avoiding reliance on hidden authentication windows
- **Refresh token storage**: Refresh tokens are stored in browser local storage and used to obtain new tokens when they expire, reducing the need for repeated user logins
- **Refresh token lifetime**: Defaults to 24 hours for local development (SPA) and 90 days for Azure deployments (Web), subject to tenant policies and revocation
- **PKCE protection**: The authorization code exchange is protected by PKCE, preventing redemption of an intercepted code without the code verifier

**Security implications:**

Storing refresh tokens in local storage provides a balance between security and user experience. Local storage is accessible to JavaScript, including any cross-site scripting (XSS) vulnerabilities, so script injection defenses remain essential. PKCE protects the authorization code exchange but does not protect tokens stolen from browser storage. This approach:

- Eliminates the need for silent authentication flows using hidden iframes, which have been increasingly restricted by browsers
- Provides a seamless user experience with automatic token refresh
- Works without third-party cookie dependencies
- Keeps the server as a completely stateless REST API, supporting microservice-type architectures where the API can be independently scaled or deployed; the proxy does not persist user tokens
- Enables response compression for improved performance without introducing session cookies; a future cookie-based authentication design would need to account for compression side-channel attacks such as BREACH

**Important compatibility note:** The production token proxy is specific to Microsoft Entra ID. Supporting another identity provider, such as Google, requires provider-specific token exchange and refresh-token configuration.

### Industry Best Practices vs. This Template

Current industry best practices recommend using a **Backend-for-Frontend (BFF) pattern** where authentication tokens are stored in secure, HTTP-only cookies managed by a backend service, rather than in browser local storage. This approach provides stronger security by:

- Keeping tokens inaccessible to JavaScript, eliminating XSS-based token theft
- Using HTTP-only, secure, SameSite cookies that browsers handle automatically
- Moving token refresh logic to the backend where it can be more securely managed
- Providing better protection against common web vulnerabilities

**To implement the BFF pattern in this template**, you would need to:

1. Create backend API endpoints for login, logout, and token refresh operations
2. Move the OAuth callback and token lifecycle fully to the backend
3. Store tokens in server-side session storage (e.g., Redis, database) with session IDs in HTTP-only cookies
4. Change the frontend to rely on backend sessions instead of storing Microsoft tokens
5. Update the GraphQL client to rely on cookies for authentication rather than Authorization headers
6. Implement CSRF protection for state-changing operations

While the BFF pattern provides enhanced security, this template prioritizes simplicity and rapid deployment for medium-sized applications where the development team can implement appropriate XSS protections (Content Security Policy, input sanitization, etc.). For applications with higher security requirements or regulatory compliance needs, implementing the BFF pattern is strongly recommended.

## Additional Resources

- [@shane32/msoauth Library](https://github.com/Shane32/msoauth) - The OAuth library used in this template
- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Azure AD App Registration Best Practices](https://docs.microsoft.com/en-us/azure/active-directory/develop/security-best-practices-for-app-registration)
