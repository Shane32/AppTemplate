# Azure Key Vault Setup (Optional)

This guide covers setting up Azure Key Vault for managing application secrets and sensitive configuration.

## Overview

Azure Key Vault provides secure storage for:

- Connection strings
- API keys
- Certificates
- Other sensitive configuration values

Using Key Vault is optional but recommended for production environments.

## Prerequisites

- Azure subscription (same as your web app)
- Resource group created
- Web app created with system-assigned managed identity enabled

## Create Azure Key Vault

1. Navigate to the [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** > **Key Vault**
3. Configure the key vault:
   - **Subscription**: Same as the web app
   - **Resource Group**: Same as the web app
   - **Key vault name**: Same as your web app name (e.g., `myapp-dev` or `myapp-prod`)
   - **Region**: East US 2 (or same as your web app)
   - **Pricing tier**: Standard
4. Click **Review + create**, then **Create**

## Configure Access Policies

The web app needs permission to read secrets from the key vault.

1. Navigate to your key vault in Azure Portal
2. Go to **Access control (IAM)**
3. Click **Add** > **Add role assignment**
4. Configure the role:
   - **Role**: Key Vault Secrets Officer
   - **Assign access to**: Managed identity
   - Click **Select members**
   - **Subscription**: Same as the web app
   - **Managed identity**: App Service
   - Select your web app
5. Click **Review + assign**

## Add Secrets to Key Vault

1. Navigate to your key vault
2. Go to **Objects** > **Secrets**
3. Click **Generate/Import**
4. Add each secret:
   - **Name**: Use a descriptive name (e.g., `ConnectionStrings--DefaultConnection`)
   - **Value**: The secret value
   - Click **Create**

### Common Secrets to Store

- `ConnectionStrings--DefaultConnection` - Database connection string
- `Authentication--Schemes--Bearer--ValidAudience` - OAuth client ID
- `Authentication--Schemes--Bearer--Authority` - OAuth authority URL
- API keys for external services
- Third-party service credentials

### Secret Naming Convention

Use double dashes (`--`) to represent configuration hierarchy:

- `ConnectionStrings--DefaultConnection` maps to `ConnectionStrings:DefaultConnection`
- `Authentication--Schemes--Bearer--ValidAudience` maps to `Authentication:Schemes:Bearer:ValidAudience`

## Configure Application to Use Key Vault

### Update appsettings.json

Add the Key Vault configuration to your `AppServer/appsettings.json`:

```json
{
  "KeyVault": {
    "VaultUri": "https://myapp-dev.vault.azure.net/"
  }
}
```

### Environment-Specific Configuration

For different environments, override the Key Vault URI using environment variables:

1. Navigate to your web app in Azure Portal
2. Go to **Configuration** > **Application settings**
3. Add a new setting:
   - **Name**: `KeyVault__VaultUri`
   - **Value**: `https://myapp-prod.vault.azure.net/` (for production)
4. Click **Save**

This allows you to use the development key vault locally and production key vault in Azure.

## Local Development

For local development, you can:

### Option 1: Use User Secrets

Store secrets locally using .NET user secrets:

```bash
cd AppServer
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "your-connection-string"
```

### Option 2: Use Local Key Vault

If you have Azure CLI installed and are authenticated:

1. Ensure you have access to the development key vault
2. The application will automatically use your Azure credentials to access the key vault

### Option 3: Use appsettings.Development.json

For non-sensitive development values, use `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MyApp;Trusted_Connection=True;"
  }
}
```

**Note**: Never commit sensitive values to source control.

## Managing Secrets

### Adding a New Secret

1. Navigate to your key vault in Azure Portal
2. Go to **Secrets** > **Generate/Import**
3. Enter the secret name and value
4. Click **Create**
5. The application will automatically pick up the new secret (may require restart)

### Updating a Secret

1. Navigate to the secret in Key Vault
2. Click **New Version**
3. Enter the new value
4. Click **Create**
5. Restart your web app to use the new version

### Deleting a Secret

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

## Troubleshooting

### Application Can't Access Key Vault

- Verify the web app's managed identity has Key Vault Secrets Officer role
- Check the Key Vault URI is correct in configuration
- Ensure the key vault allows access from Azure services

### Secret Not Found

- Verify the secret name matches exactly (including casing)
- Check the secret exists in the correct key vault
- Ensure you're using the correct naming convention (double dashes)

### Local Development Issues

- Ensure you're authenticated with Azure CLI: `az login`
- Verify you have permission to access the key vault
- Check the Key Vault URI in your local configuration

## Next Steps

Your CI/CD setup is now complete! See the [CI/CD Setup Guide](cicd-setup.md) for an overview of all components.
