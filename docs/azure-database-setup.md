# Azure Database Setup

This guide covers creating and configuring an Azure SQL Database for your application.

## Prerequisites

- Azure subscription (same as your web app)
- Resource group created
- Web app created with system-assigned managed identity enabled

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

The web app needs permission to access the database using its managed identity.

### Connect to Database

1. Navigate to your SQL Database in Azure Portal
2. Click **Query editor** (or use SQL Server Management Studio)
3. Authenticate using Microsoft Entra authentication

### Grant Permissions

Execute the following SQL commands, replacing `myapp-dev` with your web app name:

```sql
-- Create user for the web app's managed identity
CREATE USER [myapp-dev] FROM EXTERNAL PROVIDER;

-- Grant db_owner role (full access)
ALTER ROLE db_owner ADD MEMBER [myapp-dev];
```

### Add Additional Users (Optional)

To grant other users access to the database:

```sql
-- For read-only access
CREATE USER [user@domain.com] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER [user@domain.com];

-- For read-write access
CREATE USER [user@domain.com] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datawriter ADD MEMBER [user@domain.com];
ALTER ROLE db_datareader ADD MEMBER [user@domain.com];
```

## Configure Connection String

The application will automatically use the managed identity to connect to the database. You'll need to configure the connection string in your application settings.

### Connection String Format

```
Server=tcp:your-server.database.windows.net,1433;Database=your-database;Authentication=Active Directory Default;
```

### Update Application Configuration

1. Navigate to your web app in Azure Portal
2. Go to **Configuration** > **Application settings**
3. Add or update the connection string:
   - **Name**: `ConnectionStrings__DefaultConnection`
   - **Value**: Your connection string (see format above)
   - **Type**: Custom
4. Click **Save**

Alternatively, update `AppServer/appsettings.json` in your repository:

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

- The web app's system-assigned managed identity must be enabled before granting database permissions
- Use Microsoft Entra authentication for enhanced security
- The connection string uses `Authentication=Active Directory Default` to use the managed identity
- Database schema is managed through Entity Framework migrations in the application

## Next Steps

Continue to [GitHub Actions Configuration](github-actions-setup.md) to set up automated deployments.
