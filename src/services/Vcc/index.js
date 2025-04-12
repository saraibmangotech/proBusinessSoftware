import { get, post, patch, Statementget } from 'services';
import routes from './routes';

const VccServices = {
  getVccVehicles: async (params) => {
    const data = await get(routes.getVccVehicles, params);
    return data;
  },
  getCustomDue: async (params) => {
    const data = await get(routes.getCustomDue, params);
    return data;
  },
  getCustomDueStatement: async (params) => {
    const data = await Statementget(routes.getCustomDue, params);
    return data;
  },
  getCustomUnDue: async (params) => {
    const data = await get(routes.getCustomUnDue, params);
    return data;
  },
  getCustomUnDueStatement: async (params) => {
    const data = await Statementget(routes.getCustomUnDue, params);
    return data;
  },
  getVatUnDue: async (params) => {
    const data = await get(routes.getVatUnDue, params);
    return data;
  },
  getVatUnDueStatement: async (params) => {
    const data = await Statementget(routes.getVatUnDue, params);
    return data;
  },
  getVccList: async (params) => {
    const data = await get(routes.getVccList, params);
    return data;
  },
  getVatDue: async (params) => {
    const data = await get(routes.getVatDue, params);
    return data;
  },
  getVatDueStatement: async (params) => {
    const data = await Statementget(routes.getVatDue, params);
    return data;
  },
  getVccDownloadedList: async (params) => {
    const data = await get(routes.getVccDownloadedList, params);
    return data;
  },
  getAuctionHouseDue: async (params) => {
    const data = await get(routes.getAuctionHouseDue, params);
    return data;
  },
  declareVcc: async (obj) => {
    const data = await post(routes.declareVcc, obj);
    return data;
  },
  reverseMobaya: async (obj) => {
    const data = await post(routes.reverseMobaya, obj);
    return data;
  },
  customVatCharges: async (obj) => {
    const data = await post(routes.customVatCharges, obj);
    return data;
  },
  getVinsLots: async (params) => {
    const data = await get(routes.getVinsLots, params);
    return data;
  },
  sendApproval: async (obj) => {
    const data = await post(routes.sendApproval, obj);
    return data;
  },
  issueBulkVcc: async (obj) => {
    const data = await post(routes.issueBulkVcc, obj);
    return data;
  },
  depositVcc: async (obj) => {
    const data = await post(routes.depositVcc, obj);
    return data;
  },
  approveVcc: async (obj) => {
    const data = await patch(routes.approveVcc, obj);
    return data;
  },
  updateDeclaration: async (obj) => {
    const data = await patch(routes.updateDeclaration, obj);
    return data;
  },
  purposeVcc: async (obj) => {
    const data = await patch(routes.purposeVcc, obj);
    return data;
  },
  issueVcc: async (obj) => {
    const data = await patch(routes.issueVcc, obj);
    return data;
  },
  getVccRefundedList: async (params) => {
    const data = await get(routes.getVccRefundedList, params);
    return data;
  },
  getVccRefundedDetail: async (params) => {
    const data = await get(routes.getVccRefundedDetail, params);
    return data;
  },
  getVccDepositedDetail: async (params) => {
    const data = await get(routes.getVccDepositedDetail, params);
    return data;
  },
  getVccRefundedPreview: async (params) => {
    const data = await get(routes.getVccRefundedPreview, params);
    return data;
  },
  getVccDepositedPreview: async (params) => {
    const data = await get(routes.getVccDepositedPreview, params);
    return data;
  },
  getVccDepositedList: async (params) => {
    const data = await get(routes.getVccDepositedList, params);
    return data;
  },
  getExitPaperReceiving: async (params) => {
    const data = await get(routes.getExitPaperReceiving, params);
    return data;
  },
  getMakasa: async (params) => {
    const data = await get(routes.getMakasa, params);
    return data;
  },
  getMobaya: async (params) => {
    const data = await get(routes.getMobaya, params);
    return data;
  },
  getMobayaReversals: async (params) => {
    const data = await get(routes.getMobayaReversals, params);
    return data;
  },
  receiveExitPaper: async (obj) => {
    const data = await post(routes.receiveExitPaper, obj);
    return data;
  },
  refundExitPaper: async (obj) => {
    const data = await post(routes.refundExitPaper, obj);
    return data;
  },
  receiveMakasa: async (obj) => {
    const data = await post(routes.receiveMakasa, obj);
    return data;
  },
}

export default VccServices