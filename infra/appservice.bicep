param location string
@allowed([
  'dev'
  'prod'
])
param environmentName string
param appName string

@secure()
param sqlConnectionString string

param corsOrigins string[] = []

var planName = '${appName}-${environmentName}-plan'
var webAppName = '${appName}-${environmentName}-api'
var corsOriginSettings = [for (origin, i) in corsOrigins: {
  name: 'Cors__AllowedOrigins__${i}'
  value: origin
}]

var skuName = environmentName == 'prod' ? 'B1' : 'F1'
var skuTier = environmentName == 'prod' ? 'Basic' : 'Free'

resource appServicePlan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: planName
  location: location
  sku: {
    name: skuName
    tier: skuTier
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2024-11-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|10.0'
      appSettings: concat(
        [
          {
            name: 'ASPNETCORE_ENVIRONMENT'
            value: environmentName == 'dev' ? 'Development' : 'Production'
          }
        ],
        corsOriginSettings
      )
      connectionStrings: [
        {
          name: 'DefaultConnection'
          connectionString: sqlConnectionString
          type: 'SQLAzure'
        }
      ]
    }
  }
}

output webAppName string = webApp.name
output webAppDefaultHostName string = webApp.properties.defaultHostName
