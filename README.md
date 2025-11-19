# Full Stack Application Template

This repository provides a production-ready template for building full-stack applications using .NET, React, and GraphQL.

## Project Structure

- **AppServer**: Main ASP.NET Core web server application
- **AppDb**: Entity Framework Core database context and models
- **AppGraphQL**: GraphQL API implementation using GraphQL.NET
- **AppServices**: Shared business logic and services
- **ReactApp**: React frontend application with TypeScript and Vite
- **TestDb**: Database seeding and test data
- **Tests**: Integration and unit tests

## Technologies

### Backend

- .NET 10.0
- Entity Framework Core
- GraphQL.NET
- SQL Server

### Frontend

- React 18
- TypeScript
- Vite
- GraphQL Code Generator
- Azure AD Authentication

## Design Principles / Who It's For

This template is designed for **medium-sized applications** that require a balance between architectural separation and deployment simplicity. It enables **rapid deployment of new applications** by providing a production-ready foundation with authentication, database integration, GraphQL API, and modern SPA architecture already configured and working together. It's ideal for teams that want:

### Architecture & Organization

- **Clear separation of concerns** with distinct projects for database (`AppDb`), GraphQL API (`AppGraphQL`), business services (`AppServices`), and the SPA (`ReactApp`)
- **Monorepo design** that keeps all code together while maintaining logical boundaries
- **Single deployment artifact** - despite the separation, everything publishes as one cohesive application

### Developer Experience & Productivity

- **Fast, type-safe development** - C# methods automatically appear as GraphQL mutations, which integrate directly into TypeScript autocomplete when writing GraphQL queries in the SPA
- **End-to-end type validation** - from database models through GraphQL to React components, with compile-time type checking throughout
- **AI-friendly codebase** - code is structured to work seamlessly with AI coding agents for rapid feature development and maintenance
- **React + TypeScript** - leverages modern tooling for rapid, type-safe frontend development
- **Preconfigured test project** - includes integration tests, unit tests, and GraphQL endpoint testing with approval testing support
- **Automated CI/CD workflows** - GitHub Actions pipelines for building, testing on pull requests, and deploying to development and production environments

### Authentication & Security

- **Microsoft OAuth integration** (easily adaptable to Google Auth) eliminates password management complexity
- **Flexible deployment** - works as both public applications and private intranet applications
- **Query whitelisting** - only GraphQL queries used by the SPA are allowed on the server, protecting against arbitrary queries
- **Hash-based query distribution** - only operation hashes are sent to clients, with operation names included in hashes for easy production debugging

### Performance & Scalability

- **Direct GraphQL-to-SQL conversion** - GraphQL queries are translated directly to SQL, allowing database indexing optimizations to be fully utilized
- **Reduced server burden** - efficient query translation minimizes CPU requirements and web transport overhead
- **Optimized data fetching** - database indexes designed for SPA query patterns ensure fast response times

### Best For

This template is an excellent fit for:

- **Rapid application deployment** - start new medium-sized projects in hours instead of weeks
- **Internal business applications** with 10-1000 users
- **Customer-facing applications** requiring authentication and role-based access
- **Data-driven applications** where query performance matters
- **Teams using AI coding assistants** for accelerated development
- **Projects requiring rapid iteration** with strong type safety
- **Applications needing clear architecture** without microservice complexity
- **Projects requiring robust testing infrastructure** with automated CI/CD pipelines
- **Organizations building multiple similar applications** - reuse the proven template structure

### Not Ideal For

This template may be overkill for:

- Simple CRUD applications with minimal business logic
- Prototypes or proof-of-concept projects
- Applications with fewer than 5-10 database tables
- Projects requiring microservice architecture or independent service scaling

## Development Requirements

- Visual Studio 2026
- Node.js 22
- npm 10

## Getting Started

### Creating a New Project from Template

1. Click the "Use this template" button in GitHub to create a new repository from this template

2. Suggested respository settings:

   - Settings > General > Pull Requests:
     - [ ] Disable "Allow merge commits"
     - [x] Enable "Allow squash merging"
       - Set "Default commit message" to "Pull request title"
     - [ ] Disable "Allow rebase merging"
     - [x] Enable "Automatically delete head branches"

3. Clone your new repository

4. Add Code Owners, if applicable:

   - Add `.github/CODEOWNERS` file to specify appropriate code owners for the repository

5. Open the solution in Visual Studio and rename the solution file to your desired name

   - Note: The individual project names (**AppDb**, **AppServer**, etc.) can be left as-is to simplify the setup process

6. Update database configuration:

   - Open `AppServer/appsettings.json`
   - Modify the connection string as appropriate (see deployment steps below)
   - Set `AppDbContext.Schema` in `AppDb/AppDbContext.cs` if it is not desired to use the default 'dbo' schema

7. Set up Entity Framework migrations:

   - Delete the Migrations folder in **AppDb** project using Visual Studio
   - In Visual Studio, set **AppServer** as the startup project
   - Open Package Manager Console
   - Select **AppDb** as the Default Project in Package Manager Console
   - Run: `Add-Migration Initial`
   - Note: The database will be automatically initialized on first application run

8. Configure frontend:

   ```bash
   cd ReactApp
   npm install
   ```

### Running the Application

1. Start the frontend development server:

   ```bash
   cd ReactApp
   npm run dev
   ```

2. Start the backend:

   - Set **AppServer** as the startup project in Visual Studio
   - Change the launch profile to **IIS Express**
   - Press F5 or click the Run button

3. Access the application:
   - The application will be available at https://localhost:44323
   - This URL will proxy the SPA through Vite which runs at http://localhost:5173
   - Changes to the frontend will be automatically reloaded

### Working with Production Backend

To work on the frontend using a production backend:

1. Create a `.env.development.local` file in the ReactApp directory
2. Set the required environment variables:
   ```
   VITE_GRAPHQL_URL=https://your_production_api_url
   VITE_GRAPHQL_WEBSOCKET_URL=wss://your_production_api_url
   ```
3. Start the frontend development server as usual
   - The application will be available at http://localhost:5173
   - The `.env.development.local` file will be ignored when committing to GitHub

### Configuring Azure CI/CD Setup

Perform all of the below steps for both development and production environments.

#### Website Deployment (both front and back end)

1. Create Azure Web App

   - Select applicable subscription and resource group
   - Enter an instance name
   - Secure default hostname: Off
   - Publish: Code
   - Runtime Stack: .NET 10
   - Operating System: Linux
   - Region: East US 2
   - Select applicable plan

2. Configure Azure Web App

   - Configuration > HTTP version = 2.0
   - Identity > System assigned > On

3. Create User Assigned Managed Identity

   - Select same subscription, resource group and region as the web app
   - Select the same name as the web app with `-identity` appended - e.g. `myapp-identity`
   - Settings > Federated credentials > Add credential
     - Scenario: GitHub Actions
     - Organization: (select the GitHub organization or username)
     - Repository: (enter the repository name)
     - Entity: `Environment`
     - Environment: `Production` or `Development` as appropriate
     - Name: same as the managed identity name with `-cred` appended - e.g. `myapp-identity-cred`
   - You will need the Subscription ID and Client ID from the Overview page

4. Obtain the Tenant ID

   - Within Azure, go to Microsoft Entra ID
   - The Tenant ID is displayed on the Overview page

5. Configure the GitHub Action workflow secrets

   - Within the repository, navigate to Settings > Environments
   - Add an environment named either `Production` or `Development` as appropriate
   - Add the following "Environment secrets":
     - AZURE_TENANT_ID = (Azure Tenant ID obtained above)
     - AZURE_SUBSCRIPTION_ID = (Azure Subscription ID obtained above)
     - AZURE_CLIENT_ID = (Azure Client ID obtained above)
     - AZURE_WEBAPP_NAME = (Azure Web App name)

6. Assign deployment permissions to the managed identity
   - Go to the Azure Web App > Access control (IAM) > Add role assignment
   - Role: Website Contributor
   - Assign access to: Managed identity
   - Members: Click 'Select members'
   - Subscription: Select the subscription where the managed identity was created
   - Managed identity: User-assigned managed identity
   - Select the managed identity created above

Note: The managed identity must be located within the same subscription as the web app in order for deployment to succeed.
So it is required to create a separate managed identity for the development and production environments assuming that
they are located within different subscriptions.

#### Database

1. Create Azure SQL Database

   - Subscription: same as the web app
   - Resource Group: same as the web app
   - Database name: same as the name of the web app
   - Server: (select or create appropriate server)
   - Want to use SQL elastic pool: No
   - Workload environment: Production
   - Compute + storage: DTU-based purchasing model > Basic (5 DTUs, 2 GB)
   - Backup storage redundancy: Geo-redundant backup storage

2. Assign SQL Permissions

   - Execute the following SQL, substituting `myapp` for the name of the Web App:

     ```sql
     CREATE USER [myapp] FROM EXTERNAL PROVIDER;
     ALTER ROLE db_owner ADD MEMBER [myapp];
     ```

   - Add other users as needed; use role `db_datareader` for read-only access

#### Key Vault (optional)

1. Create Azure Key Vault

   - Subscription: same as the web app
   - Resource Group: same as the web app
   - Key vault name: same as the name of the web app
   - Region: East US 2
   - Pricing tier: Standard

2. Assign access policies

   - Go to Access control (IAM)
   - Add Role assignment
     - Job function roles: Key Vault Secrets Officer
     - Assign access to: Managed identity
     - Subscription: same as the web app
     - Managed identity: App Service
     - Select the Web App created above

3. Configure `appsettings.json` and/or app secrets to include the dev key vault name

4. Configure the key vault with some secrets

   - Typically the key vault will contain connection strings, API keys, and other sensitive information
   - Use the Azure portal to add or remove secrets.

5. Configure the dev and production Azure Web App's environment variables to override the key vault name

#### Application Authentication

This application uses Azure AD (Microsoft Entra ID) for authentication. Follow these steps to create and configure an app registration:

##### 1. Create Azure App Registration

1. Navigate to the [Azure Portal](https://portal.azure.com)
2. Go to **Microsoft Entra ID** (formerly Azure Active Directory)
3. Select **App registrations** from the left menu
4. Click **New registration**
5. Configure the registration:
   - **Name**: Enter a descriptive name (e.g., "MyApp - Development" or "MyApp - Production")
   - **Supported account types**:
     - Choose "Accounts in this organizational directory only" for single tenant
     - Choose "Accounts in any organizational directory" for multi-tenant
   - **Redirect URI**:
     - Platform: Single-page application (SPA)
     - URI: `https://localhost:44323/oauth/callback` (for development) or your production URL
6. Click **Register**

##### 2. Configure App Registration

After creating the app registration:

1. **Note the Application (client) ID** from the Overview page - you'll need this for configuration

2. **Configure Authentication**:

   - Go to **Authentication** in the left menu
   - Under **Advanced settings**:
     - Enable **Access tokens** and **ID tokens**

3. **Configure Token Configuration**:

   - Go to **Token configuration** in the left menu
   - Click **Add optional claim**
   - Select **ID** token type
   - Add the following claims:
     - `family_name` - User's last name
     - `given_name` - User's first name
     - `email` - User's email address
   - Check the box for each claim and click **Add**
   - If prompted about Microsoft Graph permissions, click **Yes, add the required Graph permission**

##### 3. Configure Application Settings

Update your application configuration files with the app registration details:

1. **Backend Configuration** (`AppServer/appsettings.json`):

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

2. **Frontend Configuration**:

   For development (`ReactApp/.env.development`):

   ```env
   VITE_AZURE_CLIENT_ID=your-client-id-here
   VITE_AZURE_TENANT_ID=your-tenant-id-here
   VITE_AZURE_SCOPES=User.Read
   ```

   For production (`ReactApp/.env.production`):

   ```env
   VITE_AZURE_CLIENT_ID=your-client-id-here
   VITE_AZURE_TENANT_ID=your-tenant-id-here
   VITE_AZURE_SCOPES=User.Read
   ```

##### 4. Multi-Environment Setup

For development and production environments, you have two options:

**Option A: Single App Registration**

- Use the same app registration for both environments
- Add multiple redirect URIs for both development and production URLs
- Use environment-specific configuration files

**Option B: Separate App Registrations (Recommended)**

- Create separate app registrations for development and production
- Name them clearly (e.g., "MyApp - Dev", "MyApp - Prod")
- Configure each with environment-specific redirect URIs
- Use different client IDs in your environment configuration files

##### 5. Security Best Practices

- **Tenant Configuration**: Set `ValidateIssuer` to `true` in production and specify your tenant ID in the Authority URL for single-tenant applications
- **Scope Limitation**: Only request the minimum required scopes
- **Redirect URI Validation**: Ensure redirect URIs are exact matches (including trailing slashes)
- **Token Validation**: The backend validates tokens using the `ValidAudience` setting
- **HTTPS**: Always use HTTPS in production for redirect URIs

##### 6. Testing Authentication

1. Start your application (both backend and frontend)
2. Navigate to the application URL
3. Click the login button - you should be redirected to Microsoft's login page
4. After successful authentication, you should be redirected back to your application
5. Check the browser's developer tools to verify tokens are being received
6. Test API calls to ensure the backend accepts the tokens

##### 7. Troubleshooting Common Issues

- **CORS Errors**: Ensure your backend CORS policy allows your frontend domain
- **Invalid Redirect URI**: Verify redirect URIs match exactly in both the app registration and your application
- **Token Validation Errors**: Check that `ValidAudience` matches your client ID
- **Missing Claims**: Verify that optional claims (family_name, given_name, email) are configured in Token Configuration
- **Tenant Issues**: Verify tenant ID is correct if using single-tenant configuration

#### User Authentication & Roles

(todo)

### Continuous Integration

The template includes GitHub Actions workflows for:

- Building and testing on pull requests
- Deploying to development on merge to `master`
- Deploying to production on issue release

## Security Considerations

- All sensitive information should be stored in Azure Key Vault
- Use managed identities for Azure resources
- Implement proper CORS policies
- Follow least privilege principle for Azure AD roles
- Regular security updates and dependency scanning

## Testing

The test suite includes:

- Integration tests for GraphQL endpoints
- Unit tests for business logic
- Database interaction tests
- Authentication flow tests

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

### Third-Party Package Licensing

This application uses various third-party packages and libraries, some of which may require separate licensing. Notable packages that may require licensing include:

- **AutoMapper** - Visit [automapper.io](https://automapper.io/) for licensing information
- **GraphQL.Linq** - See the [GraphQL.Linq repository](https://github.com/graphql-linq/GraphQL.Linq) for licensing details

It is your responsibility to review and comply with the licensing requirements of all third-party packages used in your project.

## Credits

Glory to Jehovah, Lord of Lords and King of Kings, creator of Heaven and Earth, who through his Son Jesus Christ, has redeemed me to become a child of God. -[Shane32](https://github.com/Shane32)
