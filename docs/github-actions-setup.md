# GitHub Actions Configuration

This guide covers configuring GitHub Actions workflows and secrets for automated CI/CD.

## Prerequisites

- GitHub repository created from template
- Azure Web App created (see [Azure Web App Setup](azure-webapp-setup.md))

## Create User Assigned Managed Identity

The user-assigned managed identity is used for GitHub Actions to authenticate and deploy to Azure.

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
   - **Environment name**: `Development` or `Production` (must match GitHub environment name exactly)
   - **Name**: Use the identity name with `-cred` appended (e.g., `myapp-dev-identity-cred`)
5. Click **Add**

**Note:** You'll need to create separate managed identities and federated credentials for each environment (Development and Production).

### Note Important IDs

From the managed identity **Overview** page, note the following values (you'll need them for GitHub variables):

- **Client ID** - needed for `AZURE_CLIENT_ID` variable
- **Subscription ID** - needed for `AZURE_SUBSCRIPTION_ID` variable

You'll also need your **Tenant ID**, which can be found:

1. Go to **Microsoft Entra ID** in Azure Portal
2. The **Tenant ID** is shown on the Overview page - needed for `AZURE_TENANT_ID` variable

### Assign Deployment Permissions

The managed identity needs permission to deploy to the web app.

1. Navigate to your web app in Azure Portal
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

## Configure GitHub Environments

GitHub environments allow you to configure environment-specific secrets and protection rules.

### Create Environments

1. Navigate to your repository on GitHub
2. Go to **Settings** > **Environments**
3. Click **New environment**
4. Create two environments:
   - `Development` - for automatic deployments from master branch
   - `Production` - for release deployments

## Configure Environment Variables

You need to configure variables for each environment (Development and Production).

### Required Variables

For each environment, add the following variables:

1. Navigate to **Settings** > **Environments**
2. Click on the environment name (Development or Production)
3. Under **Environment variables**, click **Add variable**
4. Add each of the following variables:

| Variable Name           | Description                | Where to Find                 |
| ----------------------- | -------------------------- | ----------------------------- |
| `AZURE_TENANT_ID`       | Your Azure tenant ID       | Microsoft Entra ID > Overview |
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID | Managed Identity > Overview   |
| `AZURE_CLIENT_ID`       | Managed identity client ID | Managed Identity > Overview   |
| `AZURE_WEBAPP_NAME`     | Your web app name          | Web App > Overview            |

### Example Values

```env
AZURE_TENANT_ID=12345678-1234-1234-1234-123456789abc
AZURE_SUBSCRIPTION_ID=87654321-4321-4321-4321-cba987654321
AZURE_CLIENT_ID=abcdef12-3456-7890-abcd-ef1234567890
AZURE_WEBAPP_NAME=myapp-dev
```

### Additional Variables

Any additional environment variables you add will automatically be passed to the SPA build process. For example, if you add a variable `VITE_API_URL`, it will be available during the Vite build and can be accessed in your React application using `import.meta.env.VITE_API_URL`.

**Note:** Vite requires environment variables to be prefixed with `VITE_` to be exposed to the client-side code.

## Verify Workflow Files

The template includes pre-configured GitHub Actions workflows in `.github/workflows/`:

- **`build_check.yml`** - Runs on pull requests to build and test
- **`push_master.yml`** - Deploys to development on merge to master
- **`publish_release.yml`** - Deploys to production on release

These workflows use reusable workflows from [Shane32/SharedWorkflows](https://github.com/Shane32/SharedWorkflows) for standardized build and deployment processes.

## Test Your Setup

### Test Pull Request Build

1. Create a new branch
2. Make a small change
3. Open a pull request
4. Verify the build workflow runs successfully

### Test Development Deployment

1. Merge a pull request to master
2. Go to **Actions** tab in GitHub
3. Verify the deployment workflow runs
4. Check your development web app to confirm deployment

### Test Production Deployment

1. Go to **Releases** in your repository
2. Click **Draft a new release**
3. Create a new tag in `x.x.x` format (e.g., `1.0.0`, `2025.1.15`, or `2025.1.42`)
   - Common formats: `major.minor.revision`, `year.month.day`, or `year.month.buildnum`
4. Click **Publish release**
5. Go to **Actions** tab
6. Verify the production deployment workflow runs
7. Check your production web app to confirm deployment

**Note:** The tag must be in `x.x.x` format (three numbers separated by dots) for the production deployment workflow to trigger.

## Important Notes

- The user-assigned managed identity must be in the same subscription as the web app for deployment to succeed
- Create separate managed identities for development and production environments
- The federated credential environment name must exactly match the GitHub environment name (case-sensitive)
