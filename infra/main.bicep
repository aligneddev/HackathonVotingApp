targetScope = 'resourceGroup'

param location string = resourceGroup().location
@allowed([
  'dev'
  'prod'
])
param environmentName string = 'dev'
param appName string = 'kl-hackathon-voting'

@description('SQL server administrator login used for initial bootstrap access.')
param sqlAdminLogin string = 'sqladmin'

@secure()
param sqlAdminPassword string

module sql './sql.bicep' = {
  name: 'sql'
  params: {
    location: location
    environmentName: environmentName
    appName: appName
    sqlAdminLogin: sqlAdminLogin
    sqlAdminPassword: sqlAdminPassword
  }
}

module staticWebApp './staticwebapp.bicep' = {
  name: 'staticWebApp'
  params: {
    location: location
    environmentName: environmentName
    appName: appName
  }
}

module appService './appservice.bicep' = {
  name: 'appService'
  params: {
    location: location
    environmentName: environmentName
    appName: appName
    sqlConnectionString: 'Server=tcp:${sql.outputs.serverFqdn},1433;Initial Catalog=${sql.outputs.databaseName};Persist Security Info=False;User ID=${sql.outputs.sqlAdminLogin};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
    corsOrigin: 'https://${staticWebApp.outputs.staticWebAppDefaultHostName}'
  }
}

output apiUrl string = 'https://${appService.outputs.webAppDefaultHostName}'
output frontendUrl string = 'https://${staticWebApp.outputs.staticWebAppDefaultHostName}'
output webAppName string = appService.outputs.webAppName
output staticWebAppName string = staticWebApp.outputs.staticWebAppName
