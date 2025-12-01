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

## Create User Assigned Managed Identity

The managed identity is used for GitHub Actions to deploy to Azure.

1. In Azure Portal, search for **Managed Identities**
2. Click **Create**
3. Configure the identity:
   - **Subscription**: Same as the web app
   - **Resource Group**: Same as the web app
   - **Region**: Same as the web app
   - **Name**: Use the web app name with `-identity` appended (e.g., `myapp-dev-identity`)
4. Click **Review + create**, then **Create**

### Configure Federated Credentials

1. Navigate to the managed identity you just created
2. Go to **Settings** > **Federated credentials**
3. Click **Add credential**
4. Configure the credential:
   - **Federated credential scenario**: GitHub Actions deploying Azure resources
   - **Organization**: Your GitHub organization or username
   - **Repository**: Your repository name
   - **Entity type**: Environment
   - **Environment name**: `Development` or `Production` (must match GitHub environment name)
   - **Name**: Use the identity name with `-cred` appended (e.g., `myapp-dev-identity-cred`)
5. Click **Add**

### Note Important IDs

From the managed identity **Overview** page, note:

- **Client ID** - needed for GitHub Actions configuration
- **Subscription ID** - needed for GitHub Actions configuration

You'll also need your **Tenant ID**, which can be found:

1. Go to **Microsoft Entra ID** in Azure Portal
2. The **Tenant ID** is shown on the Overview page

## Assign Deployment Permissions

The managed identity needs permission to deploy to the web app.

1. Navigate to your web app
2. Go to **Access control (IAM)**
3. Click **Add** > **Add role assignment**
4. Configure the role:
   - **Role**: Website Contributor
   - **Assign access to**: Managed identity
   - Click **Select members**
   - **Subscription**: Select the subscription where the managed identity was created
   - **Managed identity**: User-assigned managed identity
   - Select the managed identity you created above
5. Click **Review + assign**

## Grant Database Access to Web App

The web app's managed identity needs permission to access the database for production deployment.

### Prerequisites

- Azure SQL Database created (see [Azure Database Setup](azure-database-setup.md))
- Web app created with system-assigned managed identity enabled (completed above)

### Grant Permissions

1. Navigate to your SQL Database in Azure Portal
2. Click **Query editor** (or use SQL Server Management Studio)
3. Authenticate using Microsoft Entra authentication
4. Execute the following SQL commands, replacing `myapp-dev` with your web app name:

```sql
-- Create user for the web app's managed identity
CREATE USER [myapp-dev] FROM EXTERNAL PROVIDER;

-- Grant db_owner role (full access)
ALTER ROLE db_owner ADD MEMBER [myapp-dev];
```

### Configure Connection String in Web App

1. Navigate to your web app in Azure Portal
2. Go to **Configuration** > **Application settings**
3. Add or update the connection string:
   - **Name**: `ConnectionStrings__DefaultConnection`
   - **Value**: `Server=tcp:your-server.database.windows.net,1433;Database=your-database;Authentication=Active Directory Default;`
   - **Type**: Custom
4. Click **Save**

**Note:** Replace `your-server` and `your-database` with your actual SQL Server and database names.

## Important Notes

- The managed identity must be in the same subscription as the web app for deployment to succeed
- Create separate managed identities for development and production if they're in different subscriptions
- Keep the Client ID, Subscription ID, and Tenant ID secure - you'll need them for GitHub Actions setup
- The web app's system-assigned managed identity must be enabled before granting database permissions

## Next Steps

Continue to [GitHub Actions Configuration](github-actions-setup.md) to set up automated deployments.
