# Azure Web App Setup

This guide covers creating and configuring an Azure Web App for hosting your application.

## Prerequisites

- Azure subscription
- Resource group created (or permission to create one)

## Create Azure Web App

1. Navigate to the [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** > **Web App**
3. Configure the web app:
   - **Subscription**: Select your subscription
   - **Resource Group**: Select or create a resource group
   - **Name**: Enter a unique instance name (e.g., `myapp-dev` or `myapp-prod`)
   - **Publish**: Code
   - **Runtime Stack**: .NET 10
   - **Operating System**: Linux
   - **Region**: East US 2 (or your preferred region)
   - **Pricing Plan**: Select appropriate plan for your needs
   - **Secure default hostname**: Off
4. Click **Review + create**, then **Create**

## Configure Web App Settings

After the web app is created:

1. Navigate to your web app in the Azure Portal
2. Go to **Configuration**:
   - Set **HTTP version** to **2.0**
3. Go to **Identity**:
   - Under **System assigned**, toggle to **On**
   - Click **Save**

## Grant Database Access to Web App

The web app's managed identity needs permission to access the database. See [Azure Database Setup](azure-database-setup.md) for creating the database.

1. Navigate to your SQL Database in Azure Portal
2. Click **Query editor** and authenticate using Microsoft Entra authentication
3. Execute the following SQL, replacing `myapp-dev` with your web app name:

```sql
CREATE USER [myapp-dev] FROM EXTERNAL PROVIDER;
ALTER ROLE db_owner ADD MEMBER [myapp-dev];
```

The `db_owner` role is required to allow automatic migration of the database at application startup.

## Grant Key Vault Access to Web App (Optional)

If using Azure Key Vault, grant the web app access to read secrets. See [Azure Key Vault Setup](azure-keyvault-setup.md) for creating the key vault.

1. Navigate to your key vault in Azure Portal
2. Go to **Access control (IAM)** > **Add** > **Add role assignment**
3. Select **Key Vault Secrets Officer** role
4. Assign to **Managed identity** > **App Service** > select your web app
5. Click **Review + assign**

## Configure Application Settings and Secrets

Configure environment-specific settings and secrets for your web app. You can store these in Azure Key Vault (recommended) or directly as application settings.

### Using Key Vault (Recommended)

If you're using Azure Key Vault and your production key vault differs from development:

1. Navigate to your web app in Azure Portal
2. Go to **Configuration** > **Application settings**
3. Click **New application setting**
4. Add the key vault name:
   - **Name**: `KeyVaultName`
   - **Value**: `myapp-prod` (just the name, not the full URI)
5. Click **OK**, then **Save**

Once configured, store all environment-specific secrets in the key vault:

- Connection strings (e.g., `ConnectionStrings--AppDbContext`)
- API keys
- Authentication settings
- Any other sensitive configuration

See [Azure Key Vault Setup](azure-keyvault-setup.md) for details on adding secrets to the key vault.

### Without Key Vault

If you're not using Key Vault, configure any settings that differ from the development environment directly in the web app:

1. Navigate to your web app in Azure Portal
2. Go to **Configuration** > **Application settings**
3. Click **New application setting**
4. Add each setting using double underscores (`__`) to represent configuration hierarchy, such as:
   - **Name**: `ConnectionStrings__AppDbContext`
   - **Value**: `Server=tcp:your-server.database.windows.net,1433;Database=your-database;Authentication=Active Directory Default;`
5. Click **OK**, then **Save**

**Note:** Only configure settings that differ from your development environment (configured in `appsettings.json`).

## Important Notes

- The web app's system-assigned managed identity must be enabled before granting database or Key Vault permissions
- Only configure application settings that differ from your development environment
- Key Vault is recommended for storing sensitive configuration in production
