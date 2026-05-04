param location string
param environmentName string
param appName string

var serverName = '${appName}-${environmentName}-sql'
var databaseName = '${appName}-db'

resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: serverName
  location: location
  properties: {
    administratorLogin: 'sqladmin'
    administratorLoginPassword: '' // Set via Key Vault in Slice 3
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: databaseName
  location: location
  sku: {
    name: 'GP_S_Gen5_1'  // Serverless — free tier eligible
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 1
  }
  properties: {
    autoPauseDelay: 60  // Auto-pause after 1 hour idle (cost saving)
    minCapacity: json('0.5')
  }
}

output serverFqdn string = sqlServer.properties.fullyQualifiedDomainName
output databaseName string = sqlDatabase.name
