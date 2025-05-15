import { post, get ,patch,deleted} from 'services';
import routes from './routes';

const SystemServices = {
  reCaptchaVerify: async (obj) => {
    const data = await post(routes.reCaptchaVerify, obj);
    return data;
  },
  uploadDocuments: async (obj) => {
    const data = await post(routes.uploadDocuments, obj);
    return data;
  },
  
  generateSessionID: async () => {
    const data = await post(routes.generateSessionID,{withCredentials:true});
    return data;
  },
  getBankDetails: async () => {
    const data = await get(routes.getBankDetails);
    return data;
  },
  getRoles: async (params) => {
    const data = await get(routes.getRoles,params);
    return data;
  },
  getStats: async () => {
    const data = await get(routes.getStats);
    return data;
  },
  getAttendance: async (params) => {
    const data = await get(routes.getAttendance,params);
    return data;
  },
  getBanks: async () => {
    const data = await get(routes.getBanks);
    return data;
  },
  getRates: async (params) => {
    const data = await get(routes.getRates,params);
    return data;
  },
  getSubCustomerPermissions: async (params) => {
    const data = await get(routes.getSubCustomerPermissions,params);
    return data;
  },
  getPickupLocations: async (params) => {
    const data = await get(routes.getPickupLocations,params);
    return data;
  },
  getWebTokens: async () => {
    const data = await post(routes.getWebTokens);
    return data;
  },
  UpdateRole: async (obj) => {
    const data = await patch(routes.UpdateRole,obj);
    return data;
  },
  createPickupLocation: async (obj) => {
    const data = await post(routes.createPickupLocation,obj);
    return data;
  },
  deleteRole: async (obj) => {
    const data = await deleted(routes.deleteRole,obj);
    return data;
  },
  createFinalDestination: async (obj) => {
    const data = await post(routes.createFinalDestination,obj);
    return data;
  },
  ApplyPermissions: async (obj) => {
    const data = await patch(routes.ApplyPermissions,obj);
    return data;
  },
  UpdateCost: async (obj) => {
    const data = await patch(routes.UpdateCost,obj);
    return data;
  },
  getBranches: async () => {
    const data = await get(routes.getBranches);
    return data;
  },
  getNotifications: async (params) => {
    const data = await get(routes.getNotifications,params);
    return data;
  },
  getNotificationsCount: async () => {
    const data = await get(routes.getNotificationsCount);
    return data;
  },
  getBusinessRegions: async (params) => {
    const data = await get(routes.getBusinessRegions, params);
    return data;
  },
  getFinalDestinations: async (params) => {
    const data = await get(routes.getFinalDestinations, params);
    return data;
  },
  handleExternalData: async (params) => {
    const data = await get(routes.handleExternalData, params);
    return data;
  },
  getCurrencies: async (params) => {
    const data = await get(routes.getCurrencies, params);
    return data;
  },
  getWarehouses: async (params) => {
    const data = await get(routes.getWarehouses, params);
    return data;
  },
  getCountries: async () => {
    let params = { page: 1, limit: 1000 }
    const data = await get(routes.getCountries, params);
    return data;
  },
  getStates: async (countryId) => {
    let params = { page: 1, limit: 1000, country_id: countryId }
    const data = await get(routes.getStates, params);
    return data;
  },
  getCities: async (stateId) => {
    let params = { page: 1, limit: 1000, state_id: stateId }
    const data = await get(routes.getCities, params);
    return data;
  },
  getMakes: async (params) => {
    const data = await get(routes.getMakes, params);
    return data;
  },
  createMake: async (obj) => {
    const data = await post(routes.createMake, obj);
    return data;
  },
  getModels: async (params) => {
    const data = await get(routes.getModels, params);
    return data;
  },
  createModel: async (obj) => {
    const data = await post(routes.createModel, obj);
    return data;
  },
  createBranch: async (obj) => {
    const data = await post(routes.createBranch, obj);
    return data;
  },
  getColors: async (params) => {
    const data = await get(routes.getColors, params);
    return data;
  },
  createColor: async (obj) => {
    const data = await post(routes.createColor, obj);
    return data;
  },
  getShippingLines: async (params) => {
    const data = await get(routes.getShippingLines, params);
    return data;
  },
  createShippingLine: async (obj) => {
    const data = await post(routes.createShippingLine, obj);
    return data;
  },
  getShippingVendors: async (params) => {
    const data = await get(routes.getShippingVendors, params);
    return data;
  },
  createShippingVendor: async (obj) => {
    const data = await post(routes.createShippingVendor, obj);
    return data;
  },
  getGalaxyYards: async (params) => {
    const data = await get(routes.getGalaxyYards, params);
    return data;
  },
  createGalaxyYard: async (obj) => {
    const data = await post(routes.createGalaxyYard, obj);
    return data;
  },
  getClearers: async (params) => {
    const data = await get(routes.getClearers, params);
    return data;
  },
  createClearer: async (obj) => {
    const data = await post(routes.createClearer, obj);
    return data;
  },
  getVehicleTowers: async (params) => {
    const data = await get(routes.getVehicleTowers, params);
    return data;
  },
  createVehicleTower: async (obj) => {
    const data = await post(routes.createVehicleTower, obj);
    return data;
  },
  getContainerSizes: async (params) => {
    const data = await get(routes.getContainerSizes, params);
    return data;
  },
  createContainerSize: async (obj) => {
    const data = await post(routes.createContainerSize, obj);
    return data;
  },
  getServiceProviders: async (params) => {
    const data = await get(routes.getServiceProviders, params);
    return data;
  },
  getSettings: async (params) => {
    const data = await get(routes.getSettings, params);
    return data;
  },
  createServiceProvider: async (obj) => {
    const data = await post(routes.createServiceProvider, obj);
    return data;
  },
  getDestinations: async (params) => {
    const data = await get(routes.getDestinations, params);
    return data;
  },
  createDestination: async (obj) => {
    const data = await post(routes.createDestination, obj);
    return data;
  },
  getBusinessCountries: async (params) => {
    const data = await get(routes.getBusinessCountries, params);
    return data;
  },
  getBusinessLocation: async (countryId) => {
    let params = { page: 1, limit: 1000, country_id: countryId }
    const data = await get(routes.getBusinessLocation, params);
    return data;
  },
  getBusinessLocationList: async (params) => {
    
    const data = await get(routes.getBusinessLocation, params);
    return data;
  },
  getLoadingPorts: async () => {
    const data = await get(routes.getLoadingPorts);
    return data;
  },
  getEmployeeDepartments: async () => {
    const data = await get(routes.getEmployeeDepartments);
    return data;
  },
  downloadDocuments: async (params) => {
    const data = await get(routes.downloadDocuments,params);
    return data;
  },
  createEmployeeDepartment: async (obj) => {
    const data = await post(routes.createEmployeeDepartment, obj);
    return data;
  },
  notificationSeen: async (obj) => {
    const data = await patch(routes.notificationSeen, obj);
    return data;
  },
}

export default SystemServices