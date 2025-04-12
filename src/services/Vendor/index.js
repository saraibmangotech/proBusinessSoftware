import { get, post, patch } from 'services';
import routes from './routes';

const VendorServices = {
  createVendor: async (obj) => {
    const data = await post(routes.createVendor, obj);
    return data;
  },
  getVendorCenter: async () => {
    const data = await get(routes.getVendorCenter);
    return data;
  },
  getVendorDropdown: async (params) => {
    const data = await get(routes.getVendorDropdown, params);
    return data;
  },
  getShippingRates: async (params) => {
    const data = await get(routes.getShippingRates, params);
    return data;
  },
  getShippingRatesComparison: async (params) => {
    const data = await get(routes.getShippingRatesComparison, params);
    return data;
  },
  updateShippingRate: async (obj) => {
    const data = await patch(routes.updateShippingRate, obj);
    return data;
  },
  UpdateTT: async (obj) => {
    const data = await patch(routes.UpdateTT, obj);
    return data;
  },
  uploadShippingRate: async (obj) => {
    const data = await post(routes.uploadShippingRate, obj);
    return data;
  },
  getTowingRates: async (params) => {
    const data = await get(routes.getTowingRates, params);
    return data;
  },
  getTowingRatesComparison: async (params) => {
    const data = await get(routes.getTowingRatesComparison, params);
    return data;
  },
  updateTowingRate: async (obj) => {
    const data = await patch(routes.updateTowingRate, obj);
    return data;
  },
  uploadTowingRate: async (obj) => {
    const data = await post(routes.uploadTowingRate, obj);
    return data;
  },
  getClearanceRates: async (params) => {
    const data = await get(routes.getClearanceRates, params);
    return data;
  },
  getDamages: async (params) => {
    const data = await get(routes.getDamages, params);
    return data;
  },
  getClearanceRatesComparison: async (params) => {
    const data = await get(routes.getClearanceRatesComparison, params);
    return data;
  },
  updateClearanceRate: async (obj) => {
    const data = await patch(routes.updateClearanceRate, obj);
    return data;
  },
  uploadClearanceRate: async (obj) => {
    const data = await post(routes.uploadClearanceRate, obj);
    return data;
  },
  getVendorCosting: async (params) => {
    const data = await get(routes.getVendorCosting, params);
    return data;
  },
  updateVendorCosting: async (obj) => {
    const data = await patch(routes.updateVendorCosting, obj);
    return data;
  },
  createTT: async (obj) => {
    const data = await post(routes.createTT, obj);
    return data;
  },
  getTT: async (params) => {
    const data = await get(routes.getTT, params);
    return data;
  },
  getTTDetail: async (params) => {
    const data = await get(routes.getTTDetail, params);
    return data;
  },
  getTTPreview: async (params) => {
    const data = await get(routes.getTTPreview, params);
    return data;
  },
  applyFund: async (obj) => {
    const data = await post(routes.applyFund, obj);
    return data;
  },
  CreateDamage: async (obj) => {
    const data = await post(routes.CreateDamage, obj);
    return data;
  },
  getVendorFundApproval: async (params) => {
    const data = await get(routes.getVendorFundApproval, params);
    return data;
  },
  approveRejectStatus: async (obj) => {
    const data = await post(routes.approveRejectStatus, obj);
    return data;
  },
  getVendorAppliedFunds: async (params) => {
    const data = await get(routes.getVendorAppliedFunds, params);
    return data;
  },
  getVendorAppliedFundsDetail: async (params) => {
    const data = await get(routes.getVendorAppliedFundsDetail, params);
    return data;
  },
  getDamageDetail: async (params) => {
    const data = await get(routes.getDamageDetail, params);
    return data;
  },
  getDamagePreview: async (params) => {
    const data = await get(routes.getDamagePreview, params);
    return data;
  },
}

export default VendorServices