import { post, get, patch } from 'services';
import routes from './routes';

const GatePassServices = {
  getGatePassPreview: async (params) => {
    const data = await get(routes.getGatePassPreview, params);
    return data;
  },
  getVehicleList: async (params) => {
    const data = await get(routes.getVehicleList, params);
    return data;
  },
  getGatePassList: async (params) => {
    const data = await get(routes.getGatePassList, params);
    return data;
  },
  getGatePassVehicleApprovals: async (params) => {
    const data = await get(routes.getGatePassVehicleApprovals, params);
    return data;
  },
  requestGatePass: async (obj) => {
    const data = await post(routes.requestGatePass, obj);
    return data;
  },
  approveStatus: async (obj) => {
    const data = await patch(routes.approveStatus, obj);
    return data;
  },
  getGatePassDetails: async (params) => {
    const data = await get(routes.getGatePassDetails, params);
    return data;
  },
  createGatePass: async (obj) => {
    const data = await post(routes.createGatePass, obj);
    return data;
  },
  payGatePass: async (obj) => {
    const data = await post(routes.payGatePass, obj);
    return data;
  },
  updateInOutStatus: async (obj) => {
    const data = await patch(routes.updateInOutStatus, obj);
    return data;
  },
  getMobaya: async (params) => {
    const data = await get(routes.getMobaya, params);
    return data;
  },
  issueMobaya: async (obj) => {
    const data = await post(routes.issueMobaya, obj);
    return data;
  },
}

export default GatePassServices