# Azure Database Setup

This guide covers creating and configuring an Azure SQL Database for your application.

## Prerequisites

- Azure subscription
- Resource group created (or permission to create one)

## Create Azure SQL Database

1. Navigate to the [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** > **SQL Database**
3. Configure the database:
   - **Subscription**: Same as the web app
   - **Resource Group**: Same as the web app
   - **Database name**: Same as the web app name (e.g., `myapp-dev` or `myapp-prod`)
   - **Server**: Select existing or create new server
   - **Want to use SQL elastic pool**: No
   - **Workload environment**: Production
   - **Compute + storage**: Click **Configure database**
     - Select **DTU-based purchasing model**
     - Choose **Basic** (5 DTUs, 2 GB) for development or appropriate tier for production
   - **Backup storage redundancy**: Geo-redundant backup storage (or appropriate for your needs)
4. Click **Review + create**, then **Create**

## Create SQL Server (if needed)

If you need to create a new SQL Server:

1. During database creation, click **Create new** under Server
2. Configure the server:
   - **Server name**: Choose a unique name (e.g., `myapp-sql-server`)
   - **Location**: Same region as your web app
   - **Authentication method**: Use Microsoft Entra authentication only (recommended)
   - **Set Microsoft Entra admin**: Select yourself or appropriate admin
3. Click **OK**

## Configure Database Access

As the database creator, you automatically have full access to the database through Microsoft Entra authentication. This allows Visual Studio to authenticate using your Azure credentials during local development.

### Connect to Database

1. Navigate to your SQL Database in Azure Portal
2. Click **Query editor** (or use SQL Server Management Studio)
3. Authenticate using Microsoft Entra authentication with your account

### Add Additional Users (Optional)

To grant other users or developers access to the database for local development:

```sql
-- For read-only access
CREATE USER [user@domain.com] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER [user@domain.com];

-- For read-write access
CREATE USER [user@domain.com] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datawriter ADD MEMBER [user@domain.com];
ALTER ROLE db_datareader ADD MEMBER [user@domain.com];

-- For owner access (to migrate the database)
CREATE USER [user@domain.com] FROM EXTERNAL PROVIDER;
ALTER ROLE db_owner ADD MEMBER [user@domain.com];
```

## Configure Connection String

The application will automatically use the managed identity to connect to the database. You'll need to configure the connection string in your application settings.

### Connection String Format

```
Server=tcp:your-server.database.windows.net,1433;Database=your-database;Authentication=Active Directory Default;
```

### Update Local Configuration

Update `AppServer/appsettings.json` in your repository:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:your-server.database.windows.net,1433;Database=your-database;Authentication=Active Directory Default;"
  }
}
```

## Configure Firewall Rules (if needed)

If you need to access the database from specific IP addresses:

1. Navigate to your SQL Server in Azure Portal
2. Go to **Security** > **Networking**
3. Under **Firewall rules**, add rules for allowed IP addresses
4. Ensure **Allow Azure services and resources to access this server** is enabled

## Database Initialization

The database will be automatically initialized on first application run using Entity Framework migrations.

## Important Notes

- As the database creator, you automatically have db_owner permissions
- Additional developers need to be explicitly granted access (see above)
- Use Microsoft Entra authentication for enhanced security
- The connection string uses `Authentication=Active Directory Default` to use your Azure credentials locally
- Database schema is managed through Entity Framework migrations in the application
- For production deployment, the web app's managed identity will need database permissions (configured during [Azure Web App Setup](azure-webapp-setup.md))

## Next Steps

Continue to [Application Authentication Setup](azure-authentication-setup.md) to configure Azure AD authentication for your application.
