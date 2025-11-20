# Application Authentication Setup

This guide covers configuring Azure AD (Microsoft Entra ID) authentication for your application.

## Overview

This application uses Azure AD for user authentication, providing:

- Single sign-on with Microsoft accounts
- No password management required
- Integration with organizational identity
- Role-based access control

## Prerequisites

- Azure subscription
- Application deployed (or ready to deploy)
- Application URLs known (development and/or production)

## Create Azure App Registration

1. Navigate to the [Azure Portal](https://portal.azure.com)
2. Go to **Microsoft Entra ID** (formerly Azure Active Directory)
3. Select **App registrations** from the left menu
4. Click **New registration**

### Configure Registration

1. **Name**: Enter a descriptive name

   - For development: `MyApp - Development`
   - For production: `MyApp - Production`
   - Tip: Use separate registrations for each environment

2. **Supported account types**: Choose based on your needs

   - **Single tenant**: "Accounts in this organizational directory only"
     - Use for internal applications
     - Most secure option
   - **Multi-tenant**: "Accounts in any organizational directory"
     - Use for applications serving multiple organizations
     - Requires additional configuration

3. **Redirect URI**:

   - Platform: **Single-page application (SPA)**
   - URI: Enter your application URL with `/oauth/callback` path
     - Development: `https://localhost:44323/oauth/callback`
     - Production: `https://your-app.azurewebsites.net/oauth/callback`
   - You can add multiple redirect URIs later

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

### 4. Add Additional Redirect URIs (if needed)

1. Go to **Authentication**
2. Under **Single-page application**, click **Add URI**
3. Add any additional URLs (e.g., for different environments)
4. Click **Save**

**Note**: If developers need to work on the frontend locally while connecting to a production backend, add `http://localhost:5173/oauth/callback` as a redirect URI. See the "Working with Production Backend" section in the main README for details.

## Configure Application Settings

Update your application configuration with the app registration details.

### Backend Configuration

Update `AppServer/appsettings.json`:

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

**Important**: Replace `your-client-id-here` and `your-tenant-id-here` with actual values.

### Frontend Configuration

#### Development Environment

Update `ReactApp/.env.development`:

```env
VITE_AZURE_CLIENT_ID=your-client-id-here
VITE_AZURE_TENANT_ID=your-tenant-id-here
VITE_AZURE_SCOPES=User.Read
```

#### Production Environment

Update `ReactApp/.env.production`:

```env
VITE_AZURE_CLIENT_ID=your-client-id-here
VITE_AZURE_TENANT_ID=your-tenant-id-here
VITE_AZURE_SCOPES=User.Read
```

**Note**: Use different client IDs if you created separate app registrations for each environment.

## Multi-Environment Setup

You have two options for managing multiple environments:

### Option A: Single App Registration

- Use one app registration for all environments
- Add multiple redirect URIs for each environment
- Use the same client ID in all environment configurations
- **Pros**: Simpler to manage
- **Cons**: Less isolation between environments

### Option B: Separate App Registrations (Recommended)

- Create separate app registrations for each environment
- Name them clearly: "MyApp - Dev", "MyApp - Prod"
- Configure environment-specific redirect URIs
- Use different client IDs in each environment
- **Pros**: Better isolation, clearer audit trails
- **Cons**: More registrations to manage

## User Roles and Permissions

(To be implemented based on your application's needs)

### Assigning Roles

1. Navigate to your app registration
2. Go to **App roles**
3. Click **Create app role**
4. Define roles (e.g., Admin, User, ReadOnly)
5. Assign users to roles through Enterprise Applications

### Implementing Role-Based Access

Update your application code to check user roles:

```csharp
// Example: Check if user has admin role
if (User.IsInRole("Admin"))
{
    // Allow admin action
}
```

## Testing Authentication

1. Start your application (both backend and frontend)
2. Navigate to the application URL
3. Click the login button
4. You should be redirected to Microsoft's login page
5. Sign in with your Microsoft account
6. After authentication, you should be redirected back to your application
7. Verify you're logged in and can access protected resources

### Verify Token Claims

1. Open browser developer tools (F12)
2. Go to **Application** > **Local Storage**
3. Look for authentication tokens
4. Verify the token contains expected claims (name, email, etc.)

## Security Best Practices

### Tenant Configuration

- **Single-tenant apps**: Set `ValidateIssuer` to `true` and specify your tenant ID in the Authority URL
- **Multi-tenant apps**: Use `https://login.microsoftonline.com/common` as Authority

### Scope Limitation

- Only request minimum required scopes
- `User.Read` is typically sufficient for basic profile information
- Add additional scopes only when needed

### Redirect URI Validation

- Ensure redirect URIs are exact matches (including trailing slashes)
- Use HTTPS in production
- Don't use wildcards in redirect URIs

### Token Validation

- Backend validates tokens using `ValidAudience` setting
- Ensure audience matches your client ID
- Verify issuer matches your tenant

## Troubleshooting

### CORS Errors

- Verify backend CORS policy allows your frontend domain
- Check that the frontend URL is correctly configured

### Invalid Redirect URI

- Verify redirect URI in app registration matches exactly
- Check for trailing slashes
- Ensure protocol (http/https) matches

### Token Validation Errors

- Verify `ValidAudience` matches your client ID
- Check that Authority URL includes correct tenant ID
- Ensure `ValidateIssuer` is set appropriately

### Missing Claims

- Verify optional claims are configured in Token Configuration
- Check that Microsoft Graph permissions were granted
- Ensure user has the required profile information

### Tenant Issues

- For single-tenant apps, verify tenant ID is correct
- For multi-tenant apps, use `/common` endpoint
- Check that supported account types match your configuration

## Additional Resources

- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Azure AD App Registration Best Practices](https://docs.microsoft.com/en-us/azure/active-directory/develop/security-best-practices-for-app-registration)

## Next Steps

Your CI/CD setup is now complete! Review the [CI/CD Setup Guide](cicd-setup.md) for an overview of all components.
