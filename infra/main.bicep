targetScope = 'resourceGroup'

param location string = resourceGroup().location
param environmentName string = 'dev'
param appName string = 'hackathon-voting'

module sql './sql.bicep' = {
  name: 'sql'
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
