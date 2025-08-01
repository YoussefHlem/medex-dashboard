# Azure App Service Deployment Configuration

This file contains deployment configurations for Azure App Service.

## Environment Variables Required

Set the following environment variables in your Azure App Service:

### Application Settings
- `NEXT_PUBLIC_API_BASE_URL`: Your backend API URL
- `NEXT_PUBLIC_APP_NAME`: Medex Dashboard
- `NEXT_PUBLIC_APP_VERSION`: 1.0.0
- `NODE_ENV`: production
- `WEBSITE_NODE_DEFAULT_VERSION`: 18-lts

### GitHub Secrets Required

Add the following secrets to your GitHub repository:

1. `AZURE_WEBAPP_PUBLISH_PROFILE`: 
   - Download the publish profile from Azure Portal
   - Go to your App Service → Overview → Get publish profile
   - Copy the entire content and add as a secret

2. `AZURE_WEBAPP_PUBLISH_PROFILE_STAGING` (Optional):
   - For staging deployment slot
   - Download from staging slot in Azure Portal

3. `NEXT_PUBLIC_API_BASE_URL`:
   - Your production backend API URL
   - Example: https://your-backend.azurewebsites.net/api

## Azure App Service Configuration

1. **Runtime Stack**: Node 18 LTS
2. **Operating System**: Linux (recommended) or Windows
3. **Startup Command**: `node server.js`
4. **Always On**: Enabled (for production)
5. **ARR Affinity**: Disabled (for better performance)

## Deployment Slots (Optional)

For production deployments, consider creating a staging slot:
1. Go to Azure Portal → Your App Service → Deployment slots
2. Add a new slot named "staging"
3. Configure the staging slot with the same settings
4. Use slot swapping for zero-downtime deployments

## Monitoring

Enable Application Insights for monitoring:
1. Go to Azure Portal → Your App Service → Application Insights
2. Enable Application Insights
3. Configure alerts and monitoring as needed
