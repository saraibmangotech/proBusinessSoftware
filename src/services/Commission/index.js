import { post, get, patch,deleted } from 'services';
import routes from './routes';

const CommissionServices = {

  getAgents: async (params) => {
    const data = await get(routes.getAgents, params);
    return data;
  },
  getAgentDetail: async (params) => {
    const data = await get(routes.getAgentDetail, params);
    return data;
  },
  CreateAgent: async (obj) => {
    const data = await post(routes.CreateAgent, obj);
    return data;
  },

  UpdateAgent: async (obj) => {
    const data = await patch(routes.UpdateAgent, obj);
    return data;
  },
  


}

export default CommissionServices