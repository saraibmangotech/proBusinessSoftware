import { post, get, patch } from 'services';
import routes from './routes';

const ShippingServices = {
  getVinDetails: async (params) => {
    const data = await get(routes.getVinDetails, params);
    return data;
  },
  createShipping: async (obj) => {
    const data = await post(routes.createShipping, obj);
    return data;
  },
  updateShippingVehicle: async (obj) => {
    const data = await patch(routes.updateShippingVehicle, obj);
    return data;
  },
  updateShipping: async (obj) => {
    const data = await patch(routes.updateShipping, obj);
    return data;
  },
  getShipping: async (params) => {
    const data = await get(routes.getShipping, params);
    return data;
  },
  getExportShippingTracking: async (params) => {
    const data = await get(routes.getExportShippingTracking, params);
    return data;
  },
  getShippingVin: async (params) => {
    const data = await get(routes.getShippingVin, params);
    return data;
  },
  getShippingInfo: async (params) => {
    const data = await get(routes.getShippingInfo, params);
    return data;
  },
  getShippingTracking: async (params) => {
    const data = await get(routes.getShippingTracking, params);
    return data;
  },
}

export default ShippingServices