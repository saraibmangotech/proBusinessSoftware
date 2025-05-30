const routes = {
  reCaptchaVerify: 'system/recaptcha',
  uploadDocuments: 'system/uploadDocuments',
  uploadCVS: 'visas/upload',
  generateSessionID: 'system/generateSessionID',
  getBankDetails: 'system/bankDetails',
  getBusinessRegions: 'system/businessRegions',
  getCurrencies: 'system/currencies',
  getCountries: 'system/countries',
  getStates: 'system/states',
  getCities: 'system/cities',
  getMakes: 'system/makes',
  createMake: 'system/makes/add',
  getModels: 'system/models',
  createModel: 'system/models/add',
  getColors: 'system/colors',
  createColor: 'system/colors/add',
  getShippingLines: 'system/shippingLines',
  createShippingLine: 'system/shippingLines/add',
  getShippingVendors: 'system/shippingVendors',
  createShippingVendor: 'system/shippingVendors/add',
  getGalaxyYards: 'system/galaxyYards',
  createGalaxyYard: 'system/galaxyYards/add',
  getClearers: 'system/clearers',
  createClearer: 'system/clearers/add',
  getVehicleTowers: 'system/vehTowers',
  createVehicleTower: 'system/vehTowers/add',
  getContainerSizes: 'system/containerSizes',
  createContainerSize: 'system/containerSizes/add',
  getServiceProviders: 'system/serviceProvider',
  createServiceProvider: 'system/serviceProvider/add',
  getDestinations: 'system/destinations',
  createDestination: 'system/destinations/add',
  getBusinessCountries: 'system/business/countries',
  getBusinessLocation: 'system/business/locations',
  getLoadingPorts: 'system/loadingPorts',
  getEmployeeDepartments: 'system/employeeDepartments',
  createEmployeeDepartment: 'system/employeeDepartments/add',
  handleExternalData:'vehicleBookings/fetch',
  getWarehouses:'system/warehouses',
  getNotifications:'system/notifications',
  getNotificationsCount:'system/notifications/count',
  getBranches:'system/branches',
  getSettings:'system/settings',
  createBranch:'system/branches/add',
  getWebTokens:'system/generateMetabaseTokens',
  getFinalDestinations:'system/exportFinalDestinations',
  createFinalDestination:'system/exportFinalDestination/add',
  notificationSeen:'users/notifications/read',
  getSubCustomerPermissions:'users/subCustomers/permissions',
  ApplyPermissions:'users/subCustomers/updatePermissions',
  getPickupLocations:'system/pickupLocations',
  createPickupLocation:'system/pickupLocations/add',
  downloadDocuments:'/download-media',
  UpdateCost:'/system/updateCharges',
  UpdateSettings:'/system/updateSettings',
  getRates:'/system/charges',
  getBanks:'/system/banks',
  getRoles:'/roles',
  deleteRole:'/roles/delete',
  UpdateRole:'/roles/update',
  uploadCVSDraft:"visas/processing/upload",
  getStats:'system/stats',
  getSettings:'/system/settings',
  getAttendance:'users/attendance/logs'
  
};

export default routes