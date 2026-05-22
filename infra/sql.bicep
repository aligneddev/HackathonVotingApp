param location string
param environmentName string
param appName string

@description('SQL server administrator login used for initial bootstrap access.')
param sqlAdminLogin string = 'sqladmin'

@secure()
param sqlAdminPassword string

var nameSeed = toLower(replace(replace('${appName}${environmentName}', '-', ''), '_', ''))
var uniqueSuffix = take(uniqueString(resourceGroup().id, appName, environmentName), 6)
var serverName = take('${nameSeed}sql${uniqueSuffix}', 63)
var databaseName = '${appName}-db'

resource sqlServer 'Microsoft.Sql/servers@2023-08-01' = {
  name: serverName
  location: location
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

resource sqlFirewallAllowAzureServices 'Microsoft.Sql/servers/firewallRules@2023-08-01' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-08-01' = {
  parent: sqlServer
  name: databaseName
  location: location
  sku: {
    name: 'GP_S_Gen5_1' // Serverless — auto-pause when idle (lowest cost)
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 1
  }
  properties: {
    autoPauseDelay: 60 // Auto-pause after 1 hour idle
    minCapacity: json('0.5')
  }
}

output serverFqdn string = sqlServer.properties.fullyQualifiedDomainName
output databaseName string = sqlDatabase.name
output sqlAdminLogin string = sqlAdminLogin
