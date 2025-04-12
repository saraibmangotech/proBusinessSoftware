import { post, get, patch, deleted } from 'services';
import routes from './routes';

const InvoiceServices = {
    CreateMonthlyInvoice: async (obj) => {
    const data = await post(routes.CreateMonthlyInvoice, obj);
    return data;
  },
  updatePaymentStatus: async (obj) => {
    const data = await post(routes.updatePaymentStatus, obj);
    return data;
  },
  getCanidateList: async (params) => {
    const data = await get(routes.getCanidateList, params);
    return data;
  },
  getVisaSales: async (params) => {
    const data = await get(routes.getVisaSales, params);
    return data;
  },
  getMonthlyBillings: async (params) => {
    const data = await get(routes.getMonthlyBillings, params);
    return data;
  },
  getInvoices: async (params) => {
    const data = await get(routes.getInvoices, params);
    return data;
  },
  getPaymentDetail: async (params) => {
    const data = await get(routes.getPaymentDetail, params);
    return data;
  },
  getPayments: async (params) => {
    const data = await get(routes.getPayments, params);
    return data;
  },
  getInvoiceDetail: async (params) => {
    const data = await get(routes.getInvoiceDetail, params);
    return data;
  },
  getMonthlyServiceInvoices: async (params) => {
    const data = await get(routes.getMonthlyServiceInvoices, params);
    return data;
  },
}

export default InvoiceServices