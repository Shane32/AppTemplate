# GitHub Actions Configuration

This guide covers configuring GitHub Actions workflows and secrets for automated CI/CD.

## Prerequisites

- GitHub repository created from template
- Azure Web App created with managed identity configured
- Azure SQL Database created
- Client ID, Subscription ID, and Tenant ID from Azure setup

## Configure GitHub Environments

GitHub environments allow you to configure environment-specific secrets and protection rules.

### Create Environments

1. Navigate to your repository on GitHub
2. Go to **Settings** > **Environments**
3. Click **New environment**
4. Create two environments:
   - `Development` - for automatic deployments from master branch
   - `Production` - for release deployments

### Configure Environment Protection Rules (Optional)

For the Production environment, you may want to add protection rules:

1. Click on the **Production** environment
2. Under **Deployment protection rules**:
   - Enable **Required reviewers** and add reviewers
   - Enable **Wait timer** if you want a delay before deployment
3. Click **Save protection rules**

## Configure Environment Secrets

You need to configure secrets for each environment (Development and Production).

### Required Secrets

For each environment, add the following secrets:

1. Navigate to **Settings** > **Environments**
2. Click on the environment name (Development or Production)
3. Under **Environment secrets**, click **Add secret**
4. Add each of the following secrets:

| Secret Name             | Description                | Where to Find                 |
| ----------------------- | -------------------------- | ----------------------------- |
| `AZURE_TENANT_ID`       | Your Azure tenant ID       | Microsoft Entra ID > Overview |
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID | Managed Identity > Overview   |
| `AZURE_CLIENT_ID`       | Managed identity client ID | Managed Identity > Overview   |
| `AZURE_WEBAPP_NAME`     | Your web app name          | Web App > Overview            |

### Example Values

```
AZURE_TENANT_ID=12345678-1234-1234-1234-123456789abc
AZURE_SUBSCRIPTION_ID=87654321-4321-4321-4321-cba987654321
AZURE_CLIENT_ID=abcdef12-3456-7890-abcd-ef1234567890
AZURE_WEBAPP_NAME=myapp-dev
```

## Verify Workflow Files

The template includes pre-configured GitHub Actions workflows in `.github/workflows/`:

- **`build.yml`** - Runs on pull requests to build and test
- **`deploy_dev.yml`** - Deploys to development on merge to master
- **`publish_release.yml`** - Deploys to production on release

### Workflow Triggers

- **Pull Requests**: Automatically builds and tests code
- **Push to master**: Automatically deploys to Development environment
- **Release**: Manually deploy to Production environment

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
3. Create a new tag (e.g., `v1.0.0`)
4. Click **Publish release**
5. Go to **Actions** tab
6. Verify the production deployment workflow runs
7. Check your production web app to confirm deployment

## Adding Environments

To add a new environment (e.g., Staging):

1. Create the Azure resources (Web App, Database, Managed Identity)
2. Create a new GitHub environment with the name `Staging`
3. Add the four required secrets for the new environment
4. Create or modify a workflow file to deploy to the new environment
5. Update the workflow trigger as needed

## Troubleshooting

### Deployment Fails with Authentication Error

- Verify the managed identity has Website Contributor role on the web app
- Verify the federated credential is configured correctly with the right environment name
- Check that all four secrets are set correctly in the GitHub environment

### Build Fails

- Check the workflow logs in the Actions tab
- Verify all dependencies are correctly specified in project files
- Ensure tests are passing locally before pushing

### Database Connection Fails

- Verify the web app's managed identity has been granted database permissions
- Check the connection string is configured correctly
- Ensure the SQL Server firewall allows Azure services

### Workflow Doesn't Trigger

- Verify the workflow file is in `.github/workflows/` directory
- Check the trigger conditions match your action (push, pull_request, release)
- Ensure the branch name matches the workflow configuration

## Workflow Customization

You can customize the workflows by editing the YAML files in `.github/workflows/`:

- Modify build steps
- Add additional testing
- Change deployment conditions
- Add notifications
- Integrate with other services

Refer to [GitHub Actions documentation](https://docs.github.com/en/actions) for more details.

## Next Steps

- (Optional) Continue to [Azure Key Vault Setup](azure-keyvault-setup.md) for secrets management
- Your CI/CD pipeline is now configured! See the [CI/CD Setup Guide](cicd-setup.md) for an overview of all components.
