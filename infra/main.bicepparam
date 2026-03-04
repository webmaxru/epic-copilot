using './main.bicep'

param environmentName = readEnvironmentVariable('AZURE_ENV_NAME', 'epic-copilot-dev')
param location = readEnvironmentVariable('AZURE_LOCATION', 'eastus2')
