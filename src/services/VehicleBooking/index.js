import { get, post, patch } from 'services';
import routes from './routes';

const VehicleBookingServices = {
  getVehicleBookingFilter: async () => {
    const data = await get(routes.getVehicleBookingFilter);
    return data;
  },
  getVehicleBookings: async (params) => {
    const data = await get(routes.getVehicleBookings, params);
    return data;
  },
  getVehicleBookingDetail: async (params) => {
    const data = await get(routes.getVehicleBookingDetail, params);
    return data;
  },
  createVehicleBooking: async (obj) => {
    const data = await post(routes.createVehicleBooking, obj);
    return data;
  },
  updateVehicleBooking: async (obj) => {
    const data = await patch(routes.updateVehicleBooking, obj);
    return data;
  },
  getMissingFields: async (params) => {
    const data = await get(routes.getMissingFields, params);
    return data;
  },
  updateMissingFieldVehicleBooking: async (obj) => {
    const data = await patch(routes.updateMissingFieldVehicleBooking, obj);
    return data;
  },
  getApprovalList: async (params) => {
    const data = await get(routes.getApprovalList, params);
    return data;
  },
  getApprovalDetail: async (params) => {
    const data = await get(routes.getApprovalDetail, params);
    return data;
  },
  reviewApproval: async (obj) => {
    const data = await post(routes.reviewApproval, obj);
    return data;
  },
  getBookingCustomers: async (params) => {
    const data = await get(routes.getBookingCustomers, params);
    return data;
  },
}

export default VehicleBookingServices