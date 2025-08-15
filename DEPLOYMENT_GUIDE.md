# 🚀 Azure App Service Deployment Setup

This guide will help you deploy the Medex Dashboard to Azure App Service using GitHub Actions.

## 📋 Prerequisites

1. **Azure Account** with an active subscription
2. **GitHub Repository** with admin access
3. **Azure App Service** created and configured

## 🔧 Azure App Service Setup

### 1. Create Azure App Service

```bash
# Using Azure CLI
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name medex-dashboard --runtime "NODE:18-lts"
```

Or create through Azure Portal:
1. Go to Azure Portal → App Services → Create
2. Choose your subscription and resource group
3. **Instance Details**:
   - Name: `medex-dashboard` (or your preferred name)
   - Runtime stack: `Node 18 LTS`
   - Operating System: `Linux` (recommended)

### 2. Configure App Service Settings

In Azure Portal, go to your App Service → Configuration → Application settings:

```bash
# Required Environment Variables
NEXT_PUBLIC_API_BASE_URL=https://medex-backend-westus-b4hbd7eeg4d0bnbr.westus-01.azurewebsites.net/api
NEXT_PUBLIC_APP_NAME=Medex Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
WEBSITE_NODE_DEFAULT_VERSION=18-lts
```

### 3. Download Publish Profile

1. Go to your App Service in Azure Portal
2. Click **"Get publish profile"** in the Overview section
3. Download the `.PublishSettings` file
4. Copy its entire content

## 🔐 GitHub Secrets Setup

In your GitHub repository, go to Settings → Secrets and variables → Actions:

### Required Secrets:

1. **`AZURE_WEBAPP_PUBLISH_PROFILE`**
   - Value: Complete content from the downloaded publish profile
   - This is used for production deployments

2. **`AZURE_WEBAPP_PUBLISH_PROFILE_STAGING`** (Optional)
   - Value: Publish profile for staging slot
   - Only needed if you want staging deployments

### Optional Variables:

1. **`AZURE_WEBAPP_NAME`**
   - Value: Your Azure App Service name
   - Default: `medex-dashboard`

## 📁 Deployment Files

The following files are included for Azure deployment:

- **`.github/workflows/deploy-azure.yml`** - GitHub Actions workflow
- **`web.config`** - IIS configuration for Azure App Service
- **`.deployment`** - Azure deployment configuration
- **`deploy.sh`** - Custom deployment script
- **`server.js`** - Production server configuration

## 🚀 Deployment Process

### Automatic Deployment

1. **Production**: Push to `main` branch triggers deployment
2. **Staging**: Create PR to `main` branch triggers staging deployment

### Manual Deployment

1. Go to GitHub repository → Actions
2. Select "Deploy to Azure App Service" workflow
3. Click "Run workflow" → Choose branch → Run

## 📊 Workflow Details

### Build Process
- ✅ Checkout code
- ✅ Setup Node.js 18
- ✅ Install dependencies
- ✅ Run ESLint
- ✅ Build Next.js application
- ✅ Upload artifacts

### Deploy Process
- ✅ Download build artifacts
- ✅ Deploy to Azure App Service
- ✅ Configure environment variables

## 🔍 Monitoring & Troubleshooting

### Check Deployment Status

1. **GitHub Actions**: Repository → Actions tab
2. **Azure Portal**: App Service → Deployment Center
3. **Application Logs**: App Service → Log stream

### Common Issues

1. **Build Failures**
   - Check GitHub Actions logs
   - Verify all dependencies are in package.json
   - Ensure environment variables are set

2. **Deployment Failures**
   - Verify publish profile is correct
   - Check Azure App Service settings
   - Review deployment logs in Azure Portal

3. **Runtime Errors**
   - Check Application Insights (if enabled)
   - Review App Service logs
   - Verify environment variables

### Useful Commands

```bash
# Check App Service status
az webapp show --name medex-dashboard --resource-group myResourceGroup

# View deployment logs
az webapp log tail --name medex-dashboard --resource-group myResourceGroup

# Restart App Service
az webapp restart --name medex-dashboard --resource-group myResourceGroup
```

## 🔄 Deployment Slots (Optional)

For zero-downtime deployments, set up staging slots:

1. Go to Azure Portal → Your App Service → Deployment slots
2. Add slot → Name: "staging"
3. Configure staging slot settings
4. Add staging publish profile to GitHub secrets

## 📈 Performance Optimization

### Azure App Service Configuration

```bash
# Recommended settings
Always On: Enabled
ARR Affinity: Disabled
Platform: 64-bit
```

### Application Insights

Enable Application Insights for monitoring:
1. App Service → Application Insights → Enable
2. Configure custom telemetry as needed

## 🎯 Next Steps

1. **Custom Domain**: Configure custom domain and SSL
2. **CDN**: Set up Azure CDN for static assets
3. **Monitoring**: Configure alerts and monitoring
4. **Scaling**: Set up auto-scaling rules
5. **Security**: Configure authentication and authorization

## 📞 Support

For deployment issues:
1. Check GitHub Actions logs
2. Review Azure deployment logs
3. Verify all configuration settings
4. Test locally with production build
