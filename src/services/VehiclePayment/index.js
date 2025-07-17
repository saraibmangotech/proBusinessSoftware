import { Statementget, get, post } from 'services';
import routes from './routes';

const VehiclePaymentServices = {
  getInvoiceList: async (params) => {
    const data = await get(routes.getInvoiceList, params);
    return data;
  },
  getInvoiceListStatement: async (params) => {
    const data = await Statementget(routes.getInvoiceList, params);
    return data;
  },
  getInvoiceDetails: async (params) => {
    const data = await get(routes.getInvoiceDetails, params);
    return data;
  },
  getInvoicePreview: async (params) => {
    const data = await get(routes.getInvoicePreview, params);
    return data;
  },
  createVehiclePayment: async (obj) => {
    const data = await post(routes.createVehiclePayment, obj);
    return data;
  },
  PayFpPayments: async (obj) => {
    const data = await post(routes.PayFpPayments, obj);
    return data;
  },
  CreatePaymentInvoice: async (obj) => {
    const data = await post(routes.CreatePaymentInvoice, obj);
    return data;
  },
  getVehiclePaymentHistory: async (params) => {
    const data = await get(routes.getVehiclePaymentHistory, params);
    return data;
  },
  addPaymentSlip: async (obj) => {
    const data = await post(routes.addPaymentSlip, obj);
    return data;
  },
  getPaymentList: async (params) => {
    const data = await get(routes.getPaymentList, params);
    return data;
  },
  getPaymentDetails: async (params) => {
    const data = await get(routes.getPaymentDetails, params);
    return data;
  },
  getPaymentPreview: async (params) => {
    const data = await get(routes.getPaymentPreview, params);
    return data;
  },
}

export default VehiclePaymentServices