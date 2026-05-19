targetScope = 'resourceGroup'

param location string = resourceGroup().location
param environmentName string = 'dev'
param appName string = 'hackathon-voting'

@secure()
param sqlAdminPassword string

module sql './sql.bicep' = {
  name: 'sql'
  params: {
    location: location
    environmentName: environmentName
    appName: appName
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
    sqlConnectionString: sql.outputs.connectionString
    corsOrigin: 'https://${staticWebApp.outputs.staticWebAppDefaultHostName}'
  }
}

output apiUrl string = 'https://${appService.outputs.webAppDefaultHostName}'
output frontendUrl string = 'https://${staticWebApp.outputs.staticWebAppDefaultHostName}'
output webAppName string = appService.outputs.webAppName
output staticWebAppName string = staticWebApp.outputs.staticWebAppName