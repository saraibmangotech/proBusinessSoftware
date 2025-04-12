import { post, get, patch, deleted } from 'services';
import routes from './routes';

const AuctionHouseServices = {
  getAuctionHouses: async (params) => {
    const data = await get(routes.getAuctionHouses, params);
    return data;
  },
  createAuctionHouse: async (obj) => {
    const data = await post(routes.createAuctionHouse, obj);
    return data;
  },
  updateAuctionHouse: async (obj) => {
    const data = await patch(routes.updateAuctionHouse, obj);
    return data;
  },
  deleteAuctionHouse: async (params) => {
    const data = await deleted(routes.deleteAuctionHouse, params);
    return data;
  },
}

export default AuctionHouseServices