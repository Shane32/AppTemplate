# Full Stack Application Template

This repository provides a production-ready template for building full-stack applications using .NET, React, and GraphQL.

## 📁 Project Structure

- **AppServer**: Main ASP.NET Core web server application
- **AppDb**: Entity Framework Core database context and models
- **AppGraphQL**: GraphQL API implementation using GraphQL.NET
- **AppServices**: Shared business logic and services
- **ReactApp**: React frontend application with TypeScript and Vite
- **TestDb**: Database seeding and test data
- **Tests**: Integration and unit tests

## 🛠️ Technologies & Requirements

### Backend Stack

- [.NET 10.0](https://dotnet.microsoft.com/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [AutoMapper](https://automapper.org/)
- [GraphQL.NET](https://graphql-dotnet.github.io/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server)

### Frontend Stack

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)
- [@shane32/graphql](https://www.github.com/shane32/graphql) (GraphQL client)
- [@shane32/msoauth](https://www.github.com/shane32/msoauth) (Microsoft OAuth)
- [GraphiQL](https://github.com/graphql/graphiql) (lazy-loaded development tool)

### Development Environment

- [Visual Studio 2026](https://visualstudio.microsoft.com/) (for backend)
- [VS Code](https://code.visualstudio.com/) (for frontend)
- [Node.js 22](https://nodejs.org/)
- [npm 10](https://www.npmjs.com/)

See the [Design Choices](docs/design-choices.md) document for detailed rationale behind these technology selections.

## 🎯 Design Principles / Who It's For

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

## 🚀 Getting Started

### Creating a New Project from Template

1. Click the "Use this template" button in GitHub to create a new repository from this template

2. Clone your new repository and open the solution in Visual Studio

   - Rename the solution file to your desired name
   - Note: The individual project names (**AppDb**, **AppServer**, etc.) can be left as-is to simplify the setup process

3. Install frontend dependencies:

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

1. **Configure Azure App Registration**:

   - Add `http://localhost:5173/oauth/callback` as a redirect URI in your Azure App Registration
   - See [Application Authentication Setup](docs/azure-authentication-setup.md) for details

2. **Configure CORS on Production Server**:

   - Add `http://localhost:5173` to the allowed origins in your production server's CORS policy
   - This is typically configured in `AppServer/Startup.cs` or via Azure Web App configuration

3. Create a `.env.development.local` file in the ReactApp directory with the production backend URLs:

   ```env
   VITE_GRAPHQL_URL=https://your_production_api_url
   VITE_GRAPHQL_WEBSOCKET_URL=wss://your_production_api_url
   ```

4. Start the frontend development server as usual
   - The application will be available at http://localhost:5173
   - The `.env.development.local` file will be ignored when committing to GitHub

## 📚 Design Choices

The [Design Choices](docs/design-choices.md) document explains the technology stack selections for this template, including:

- **Frontend Stack**: React, Vite, TypeScript, GraphQL Code Generation, and why @shane32/graphql was chosen over Apollo Client and @shane32/msoauth over MSAL.js
- **Backend Stack**: ASP.NET Core, Entity Framework Core, AutoMapper, GraphQL.NET, and the Shane32 NuGet packages
- **Architecture Decisions**: Why we use client-side rendering instead of SSR, and other key architectural choices

**Review this document to understand the rationale behind the technology selections** and when you might want to make different choices for your specific use case.

## ⚙️ Operational Principles

This template includes several important operational behaviors that affect how the application functions. For example:

- **Database migrations run automatically on startup** - Schema changes deploy with your code without manual intervention
- **Single Deployment Artifact** - Backend and frontend deploy together as one cohesive application
- **Users are auto-provisioned on first login** - No separate registration flow is needed

These and other operational principles are documented in detail in the [Operational Principles](docs/operational-principles.md) guide. **Review this document before working with the template** to understand how the application behaves and what alternatives are available if you need different behavior.

## 🚀 Production Configuration

This section covers the Azure resources and configuration required for production deployments. All production deployments use passwordless authentication via managed identities.

### Setup Order

For first-time production setup, follow these guides in order:

1. **[Azure Key Vault Setup](docs/azure-keyvault-setup.md)** (Optional) - Create Key Vault for storing secrets
2. **[Azure Database Setup](docs/azure-database-setup.md)** - Create the SQL database and server
3. **[Azure Web App Setup](docs/azure-webapp-setup.md)** - Create the web app, enable its managed identity, and grant it access to the database and Key Vault
4. **[Application Authentication Setup](docs/azure-authentication-setup.md)** - Configure Microsoft Entra ID app registration for user authentication
5. **[GitHub Actions Configuration](docs/github-actions-setup.md)** - Set up CI/CD pipelines for automated deployment

Each guide builds on the previous steps, so following this order ensures all dependencies are in place.

### Azure Key Vault (optional)

Azure Key Vault provides secure storage for application secrets, connection strings, and other sensitive configuration values. The template is configured to automatically load secrets from Key Vault in both development and production environments.

Key Vault setup is optional but recommended for production deployments. When configured, secrets stored in Key Vault will override values in appsettings.json, allowing you to keep sensitive information out of your codebase.

For Key Vault configuration instructions, see the [Azure Key Vault Setup](docs/azure-keyvault-setup.md) guide.

### Database

The template uses **SQL Server LocalDB** for local development (automatically installed with Visual Studio) and **SQLite** for testing. The database is automatically created on first run using Entity Framework migrations.

For production deployments, the template is designed for **Azure SQL Database** with passwordless authentication using managed identities. This eliminates the need to store database passwords in configuration - your Azure credentials are used in development, and the web app's managed identity is used in production.

For production database configuration, see the [Azure Database Setup](docs/azure-database-setup.md) guide.

Alternatively, the template is compatible with any Entity Framework Core-supported database provider. To use a different provider, install the appropriate NuGet package, update the connection string, update the EF setup in Startup.cs, and recreate the migrations. Note that if your connection string contains a password, consider storing it in Azure Key Vault, which will be automatically picked up by the appropriate environment.

### Azure Web App

Azure Web App hosts your application in the cloud. The template is designed for deployment to Azure App Service on Linux with .NET 10.

Create the Azure Web App, enable its system-assigned managed identity, and grant it permissions to access your database and Key Vault. The managed identity eliminates the need to store passwords or connection strings in configuration.

For complete web app setup instructions, see the [Azure Web App Setup](docs/azure-webapp-setup.md) guide.

### Application Authentication

The template includes a pre-configured Azure AD client ID that **only works with localhost** (`https://localhost:44323/oauth/callback`). This is for local development convenience only and **cannot be used in any deployed environment**.

Before deploying to development, staging, or production, you must create your own Azure App Registration with redirect URIs configured for your deployment URLs. Each environment should have its own app registration (or at minimum, its own redirect URI in a shared registration).

For complete authentication setup instructions, see the [Application Authentication Setup](docs/azure-authentication-setup.md) guide.

### GitHub Actions (CI/CD)

This template includes pre-configured GitHub Actions workflows for automated building, testing, and deployment. Deployment uses passwordless authentication via managed identities - no passwords or connection strings need to be stored in GitHub secrets.

**How It Works**:

- **Pull Requests**: Automatically builds and tests code when a pull request is opened
- **Development Environment**: Automatically deploys to the development environment when changes are merged to the `master` branch
- **Production Environment**: Manually deploys to production when you create a GitHub release

Each environment requires its own Azure Web App and GitHub configuration. You can configure one or both environments as needed.

For complete CI/CD setup instructions, see the [GitHub Actions Configuration](docs/github-actions-setup.md) guide.

## 🔒 Security Considerations

- All sensitive information should be stored in Azure Key Vault
- Use managed identities for Azure resources
- Implement proper CORS policies
- Follow least privilege principle for Azure AD roles
- Regular security updates and dependency scanning

## 🧪 Testing

The test suite includes:

- Integration tests for GraphQL endpoints
- Unit tests for business logic
- Database interaction tests
- Authentication flow tests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

### Third-Party Package Licensing

This application uses various third-party packages and libraries, some of which may require separate licensing. Notable packages that may require licensing include:

- **AutoMapper** - Visit [automapper.io](https://automapper.io/) for licensing information
- **GraphQL.Linq** - See the [GraphQL.Linq repository](https://github.com/graphql-linq/GraphQL.Linq) for licensing details

It is your responsibility to review and comply with the licensing requirements of all third-party packages used in your project.

## 🙏 Credits

Glory to Jehovah, Lord of Lords and King of Kings, creator of Heaven and Earth, who through his Son Jesus Christ, has redeemed me to become a child of God. -[Shane32](https://github.com/Shane32)
