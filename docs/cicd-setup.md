# CI/CD Setup Guide

This guide walks you through setting up continuous integration and deployment for your application using GitHub Actions and Azure.

## Overview

The CI/CD pipeline includes:

- **Pull Request Builds**: Automatic building and testing on pull requests
- **Development Deployment**: Automatic deployment to development environment on merge to `master`
- **Production Deployment**: Deployment to production on release

## Setup Steps

Follow these guides in order to set up your CI/CD pipeline:

1. [Azure Database Setup](azure-database-setup.md) - Create and configure the Azure SQL Database
2. [Application Authentication Setup](azure-authentication-setup.md) - Create and configure Azure AD app registration
3. [Azure Web App Setup](azure-webapp-setup.md) - Create and configure the Azure Web App for hosting
4. [GitHub Actions Configuration](github-actions-setup.md) - Configure GitHub Actions workflows and secrets
5. [Azure Key Vault Setup](azure-keyvault-setup.md) (Optional) - Set up Key Vault for secrets management

## Quick Reference

If you've already completed setup and need to reference specific information:

- **Adding a new environment**: See [GitHub Actions Configuration](github-actions-setup.md#adding-environments)
- **Updating secrets**: See [Azure Key Vault Setup](azure-keyvault-setup.md#managing-secrets)
- **Troubleshooting deployments**: See [GitHub Actions Configuration](github-actions-setup.md#troubleshooting)

## Environment Setup

You'll need to complete these steps for **both development and production** environments. The guides will indicate when environment-specific configuration is needed.
