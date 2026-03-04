targetScope = 'subscription'

@description('Name of the environment (used as prefix for all resources)')
@minLength(1)
@maxLength(64)
param environmentName string

@description('Primary location for all resources')
param location string

@description('Container image tag')
param imageTag string = 'latest'

@description('Application Insights connection string')
param appInsightsConnectionString string = ''

var abbrs = loadJsonContent('abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = {
  'azd-env-name': environmentName
  project: 'epic-copilot'
}

// Resource Group
resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: '${abbrs.resourceGroup}${environmentName}'
  location: location
  tags: tags
}

// Core infrastructure
module monitoring 'modules/monitoring.bicep' = {
  name: 'monitoring'
  scope: rg
  params: {
    location: location
    logAnalyticsName: '${abbrs.logAnalytics}${resourceToken}'
    appInsightsName: '${abbrs.appInsights}${resourceToken}'
    tags: tags
  }
}

module containerRegistry 'modules/container-registry.bicep' = {
  name: 'container-registry'
  scope: rg
  params: {
    location: location
    name: '${abbrs.containerRegistry}${resourceToken}'
    tags: tags
  }
}

module containerApps 'modules/container-apps.bicep' = {
  name: 'container-apps'
  scope: rg
  params: {
    location: location
    environmentName: '${abbrs.containerAppsEnvironment}${resourceToken}'
    appName: '${abbrs.containerApp}${resourceToken}'
    containerRegistryName: containerRegistry.outputs.name
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
    appInsightsConnectionString: monitoring.outputs.appInsightsConnectionString
    imageTag: imageTag
    tags: tags
  }
}

// Outputs for azd
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerRegistry.outputs.loginServer
output AZURE_CONTAINER_REGISTRY_NAME string = containerRegistry.outputs.name
output AZURE_RESOURCE_GROUP string = rg.name
output SERVICE_WEB_ENDPOINTS array = [containerApps.outputs.fqdn]
output APPLICATIONINSIGHTS_CONNECTION_STRING string = monitoring.outputs.appInsightsConnectionString
