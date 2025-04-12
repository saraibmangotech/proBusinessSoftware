import { get, patch } from 'services';
import routes from './routes';

const CurrencyServices = {
  getCurrencies: async (params) => {
    const data = await get(routes.getCurrencies, params);
    return data;
  },
  updateCurrencyRate: async (obj) => {
    const data = await patch(routes.updateCurrencyRate, obj);
    return data;
  },
  getCurrenciesLogs: async (params) => {
    const data = await get(routes.getCurrenciesLogs, params);
    return data;
  },
}

export default CurrencyServices