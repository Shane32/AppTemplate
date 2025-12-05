# Azure Key Vault Setup (Optional)

This guide covers setting up Azure Key Vault for managing application secrets and sensitive configuration. Azure Key Vault provides secure storage for connection strings, API keys, certificates, and other sensitive configuration values. Using Key Vault is optional but recommended for production environments.

## Prerequisites

Before starting this guide, ensure you have:

- An Azure subscription
- A resource group created

## Create Azure Key Vault

1. Navigate to the [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** > **Key Vault**
3. Configure the key vault:
   - **Subscription**: Select your subscription
   - **Resource Group**: Select or create a resource group
   - **Key vault name**: Choose a unique name (e.g., `myapp-dev` or `myapp-prod`). If you plan to use this with an Azure Web App, use the same name as your web app for consistency.
   - **Region**: East US 2 (or your preferred region)
   - **Pricing tier**: Standard
4. Click **Review + create**, then **Create**

## Configure Access Control

Access to the key vault is granted through Azure role-based access control (RBAC). Applications and users that need to read secrets should be assigned the **Key Vault Secrets Officer** role.

For instructions on granting your Azure Web App access to the key vault, see the [Azure Web App Setup Guide](azure-webapp-setup.md).

## Add Secrets

1. Navigate to your key vault
2. Go to **Objects** > **Secrets**
3. Click **Generate/Import**
4. Add each secret:
   - **Name**: Use a descriptive name (e.g., `ConnectionStrings--DefaultConnection`)
   - **Value**: The secret value
   - Click **Create**

### Common Secrets to Store

- `ConnectionStrings--AppDbContext` - Database connection string
- `Authentication--Schemes--Bearer--ValidAudience` - OAuth client ID
- `Authentication--Schemes--Bearer--Authority` - OAuth authority URL
- API keys for external services
- Third-party service credentials

### Secret Naming Convention

Use double dashes (`--`) to represent configuration hierarchy:

- `ConnectionStrings--AppDbContext` maps to `ConnectionStrings:AppDbContext`
- `Authentication--Schemes--Bearer--ValidAudience` maps to `Authentication:Schemes:Bearer:ValidAudience`

## Configure Application to Use Key Vault

The application is configured to use Key Vault through the `KeyVaultName` setting in [`AppServer/appsettings.json`](../AppServer/appsettings.json).

### Default Configuration

By default, `KeyVaultName` is set to an empty string, which means Key Vault is not used:

```json
{
  "KeyVaultName": ""
}
```

### Environment-Specific Configuration

If you have separate key vaults for different environments (e.g., development and production), configure the key vault name using environment variables:

1. Navigate to your web app in Azure Portal
2. Go to **Configuration** > **Application settings**
3. Add a new setting:
   - **Name**: `KeyVaultName`
   - **Value**: `myapp-prod` (just the name, not the full URI)
4. Click **Save**

The application will automatically construct the full URI as `https://{KeyVaultName}.vault.azure.net/`.

### Single Key Vault for All Environments

If you use the same key vault for all environments, you can set the `KeyVaultName` directly in [`appsettings.json`](../AppServer/appsettings.json):

```json
{
  "KeyVaultName": "myapp-keyvault"
}
```

In this case, no additional configuration is needed in Azure.

## Configure Local Development

For local development, you have several options for configuring Key Vault access:

### Option 1: Use User Secrets (Recommended)

Store the key vault name locally using .NET user secrets:

**Using Visual Studio:**

1. In Solution Explorer, right-click on the **AppServer** project
2. Select **Manage User Secrets**
3. Add the key vault name to the `secrets.json` file that opens:

   ```json
   {
     "KeyVaultName": "myapp-dev"
   }
   ```

4. Save the file

**Using Command Line:**

```bash
cd AppServer
dotnet user-secrets set "KeyVaultName" "myapp-dev"
```

Once configured, the application will automatically use your Azure credentials (Visual Studio or Azure CLI) to access the key vault.

### Option 2: Use appsettings.Local.json

Create an `appsettings.Local.json` file in the AppServer directory (this file is git-ignored):

```json
{
  "KeyVaultName": "myapp-dev"
}
```

### Option 3: Don't Use Key Vault Locally

If you prefer not to use Key Vault for local development, leave `KeyVaultName` empty and store secrets using user secrets:

**Using Visual Studio:**

1. Right-click on the **AppServer** project
2. Select **Manage User Secrets**
3. Add your secrets:

   ```json
   {
     "ConnectionStrings": {
       "AppDbContext": "Server=(localdb)\\mssqllocaldb;Database=MyApp;Trusted_Connection=True;"
     }
   }
   ```

**Using Command Line:**

```bash
cd AppServer
dotnet user-secrets set "ConnectionStrings:AppDbContext" "your-connection-string"
```

**Note**: Never commit sensitive values to source control. User secrets and `appsettings.Local.json` are automatically excluded from git.

## Manage Secrets

### Add a New Secret

1. Navigate to your key vault in Azure Portal
2. Go to **Secrets** > **Generate/Import**
3. Enter the secret name and value
4. Click **Create**
5. The application will automatically pick up the new secret (may require restart)

### Update a Secret

1. Navigate to the secret in Key Vault
2. Click **New Version**
3. Enter the new value
4. Click **Create**
5. Restart your web app to use the new version

### Delete a Secret

1. Navigate to the secret in Key Vault
2. Click **Delete**
3. Confirm deletion
4. Update your application code to remove references to the deleted secret

## Security Best Practices

- **Least Privilege**: Only grant Key Vault Secrets Officer role to identities that need it
- **Separate Key Vaults**: Use separate key vaults for development and production
- **Audit Logging**: Enable diagnostic logging for key vault access
- **Secret Rotation**: Regularly rotate sensitive secrets
- **Access Reviews**: Periodically review who has access to your key vault
