import { post, patch, get } from 'services';
import routes from './routes';

const BankServices = {
  createBank: async (obj) => {
    const data = await post(routes.createBank, obj);
    return data;
  },
  updateBank: async (obj) => {
    const data = await patch(routes.updateBank, obj);
    return data;
  },
  getBanks: async (params) => {
    const data = await get(routes.getBanks, params);
    return data;
  },
  getExportBanks: async (params) => {
    const data = await get(routes.getExportBanks, params);
    return data;
  },
  updateBankStatus: async (obj) => {
    const data = await post(routes.updateBankStatus, obj);
    return data;
  },
}

export default BankServices