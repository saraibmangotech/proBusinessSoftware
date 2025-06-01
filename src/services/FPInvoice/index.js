import { post, get, patch, deleted } from 'services';
import routes from './routes';

const FPInvoiceServices = {

  createFPInvoice: async (obj) => {
    const data = await post(routes.createFPInvoice, obj);
    return data;
  },
  getFPInvoiceDetails: async (params) => {
    const data = await get(routes.getFPInvoiceDetails, params);
    return data;
  },
  getFPInvoiceList: async (params) => {
    const data = await get(routes.getFPInvoiceList, params);
    return data;
  },
  updateFPInvoice: async (obj) => {
    const data = await patch(routes.updateFPInvoice, obj);
    return data;
  },
  deleteFPInvoice: async (params) => {
    const data = await deleted(routes.deleteFPInvoice, params);
    return data;
  },
  addFPInvoicePayments: async (obj) => {
    const data = await post(routes.addFPInvoicePayments, obj);
    return data;
  },
  getFPInvoicePayments: async (params) => {
    const data = await get(routes.getFPInvoicePaymentsList, params);
    return data;
  },
  getFPInvoicePaymentHistory: async (params) => {
    const data = await get(routes.getSpecificFPInvoicePayments, params);
    return data;
  },
};

export default FPInvoiceServices