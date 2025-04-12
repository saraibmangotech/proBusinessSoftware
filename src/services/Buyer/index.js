import { post, get, patch, deleted } from 'services';
import routes from './routes';

const BuyerServices = {
  getBuyerIds: async (params) => {
    const data = await get(routes.getBuyerIds, params);
    return data;
  },
  getBuyerIdHistoryLogs: async (params) => {
    const data = await get(routes.getBuyerIdHistoryLogs, params);
    return data;
  },
  createBuyerId: async (obj) => {
    const data = await post(routes.createBuyerId, obj);
    return data;
  },
  createBusinessLocation: async (obj) => {
    const data = await post(routes.createBusinessLocation, obj);
    return data;
  },
  updateBuyerId: async (obj) => {
    const data = await patch(routes.updateBuyerId, obj);
    return data;
  },
  updateBusinessLocation: async (obj) => {
    const data = await patch(routes.updateBusinessLocation, obj);
    return data;
  },
  deleteBuyerId: async (params) => {
    const data = await deleted(routes.deleteBuyerId, params);
    return data;
  },
}

export default BuyerServices