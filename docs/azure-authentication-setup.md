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
   - Note: Additional redirect URIs (development logout callback, production URLs, etc.) will be added in a following step

4. Click **Register**

## Configure App Registration

After creating the registration, configure additional settings:

### 1. Note the Application (Client) ID

From the **Overview** page, copy the **Application (client) ID**. You'll need this for configuration.

### 2. Configure Authentication

1. Go to **Authentication** in the left menu
2. Under **Implicit grant and hybrid flows**:
   - ✅ Enable **Access tokens**
   - ✅ Enable **ID tokens**
3. Click **Save**

### 3. Configure Token Claims

1. Go to **Token configuration** in the left menu
2. Click **Add optional claim**
3. Select **ID** token type
4. Add the following claims:
   - ✅ `family_name` - User's last name
   - ✅ `given_name` - User's first name
   - ✅ `email` - User's email address
5. Click **Add**
6. If prompted about Microsoft Graph permissions, click **Yes, add the required Graph permission**

### 4. Add Additional Redirect URIs

1. Go to **Authentication**
2. Under **Single-page application**, click **Add URI**
3. Add the following redirect URIs:
   - Development logout: `https://localhost:44323/oauth/logout`
   - Production login: `https://your-app.azurewebsites.net/oauth/callback` (replace `your-app.azurewebsites.net` with your actual production URL)
   - Production logout: `https://your-app.azurewebsites.net/oauth/logout` (replace `your-app.azurewebsites.net` with your actual production URL)
   - (Optional) If developers need to work on the frontend locally while connecting to a production backend:
     - `http://localhost:5173/oauth/callback`
     - `http://localhost:5173/oauth/logout`
4. Click **Save**

## Configure Application Settings

Update your application configuration with the app registration details.

### Backend Configuration

Update `AppServer/appsettings.json` with one of the following configurations:

**Multi-tenant configuration** (allows any Microsoft account):

```json
{
  "Authentication": {
    "DefaultScheme": "Bearer",
    "Schemes": {
      "Bearer": {
        "ValidAudience": "your-client-id-here",
        "Authority": "https://login.microsoftonline.com/common",
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
        "Authority": "https://login.microsoftonline.com/your-tenant-id-here",
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

Add redirect URIs for all environments to your single app registration:

1. Go to **Authentication** in your app registration
2. Under **Single-page application**, add redirect URIs for each environment:
   - Development: `https://localhost:44323/oauth/callback` and `https://localhost:44323/oauth/logout`
   - Production: `https://your-app.azurewebsites.net/oauth/callback` and `https://your-app.azurewebsites.net/oauth/logout`
3. If developers need to work locally with a production backend, also add:
   - `http://localhost:5173/oauth/callback` and `http://localhost:5173/oauth/logout`
4. Click **Save**

This approach uses a single app registration for all environments, simplifying management while maintaining security.

## Security Considerations

### Authentication Flow

This template uses the **Authorization Code Flow with PKCE** (Proof Key for Code Exchange) for authentication, implemented via the [@shane32/msoauth](https://github.com/Shane32/msoauth) library. When a user logs in, they are redirected to Microsoft's login page, and upon successful authentication, redirected back to the application with an authorization code. The application then exchanges this code for access tokens and refresh tokens using a secure fetch request.

**Key characteristics of this flow:**

- **No iframes or hidden windows**: All authentication happens through full-page redirects, providing better security and user experience
- **Refresh token storage**: Refresh tokens are stored in browser local storage and used to obtain new access tokens when they expire, eliminating the need for repeated user logins
- **PKCE protection**: The authorization code exchange is protected by PKCE, preventing interception attacks even if the authorization code is compromised

**Security implications:**

Storing refresh tokens in local storage provides a balance between security and user experience. While local storage is accessible to JavaScript (including any XSS vulnerabilities), this approach:

- Eliminates the need for silent authentication flows using hidden iframes, which have been increasingly restricted by browsers
- Provides a seamless user experience with automatic token refresh
- Works reliably across all modern browsers without third-party cookie dependencies
- Keeps the server as a completely stateless REST API, supporting microservice-type architectures where the API can be independently scaled or deployed
- Enables response compression for improved performance (response compression is enabled in this template and should be disabled when using cookie-based authentication due to BREACH attack vulnerabilities)
- Is explicitly supported by Microsoft's authentication libraries and recommended for single-page applications

**Important compatibility note:** While Microsoft supports providing refresh tokens in this flow, **Google does not support refresh tokens for browser-based applications** using the Authorization Code Flow with PKCE. If you need to support Google authentication, you would need to implement a different authentication strategy or accept that users will need to re-authenticate more frequently.

### Industry Best Practices vs. This Template

Current industry best practices recommend using a **Backend-for-Frontend (BFF) pattern** where authentication tokens are stored in secure, HTTP-only cookies managed by a backend service, rather than in browser local storage. This approach provides stronger security by:

- Keeping tokens inaccessible to JavaScript, eliminating XSS-based token theft
- Using HTTP-only, secure, SameSite cookies that browsers handle automatically
- Moving token refresh logic to the backend where it can be more securely managed
- Providing better protection against common web vulnerabilities

**To implement the BFF pattern in this template**, you would need to:

1. Create backend API endpoints for login, logout, and token refresh operations
2. Configure the backend to handle OAuth redirects and token exchanges server-side
3. Store tokens in server-side session storage (e.g., Redis, database) with session IDs in HTTP-only cookies
4. Modify the frontend to call backend authentication endpoints instead of directly interacting with Microsoft's OAuth endpoints
5. Update the GraphQL client to rely on cookies for authentication rather than Authorization headers
6. Implement CSRF protection for state-changing operations

While the BFF pattern provides enhanced security, this template prioritizes simplicity and rapid deployment for medium-sized applications where the development team can implement appropriate XSS protections (Content Security Policy, input sanitization, etc.). For applications with higher security requirements or regulatory compliance needs, implementing the BFF pattern is strongly recommended.

## Additional Resources

- [@shane32/msoauth Library](https://github.com/Shane32/msoauth) - The OAuth library used in this template
- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Azure AD App Registration Best Practices](https://docs.microsoft.com/en-us/azure/active-directory/develop/security-best-practices-for-app-registration)
