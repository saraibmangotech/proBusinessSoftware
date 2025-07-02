import { post, get, patch } from 'services';
import routes from './routes';

const UserServices = {
  CreateSubUser: async (obj) => {
    const data = await post(routes.CreateSubUser, obj);
    return data;
  },
   CreateSalary: async (obj) => {
    const data = await post(routes.CreateSalary, obj);
    return data;
  },
  CreateEmployee: async (obj) => {
    const data = await post(routes.CreateEmployee, obj);
    return data;
  },
  CreateUser: async (obj) => {
    const data = await post(routes.CreateUser, obj);
    return data;
  },
  UpdateEmployee: async (obj) => {
    const data = await patch(routes.UpdateEmployee, obj);
    return data;
  },
   UpdateSalary: async (obj) => {
    const data = await patch(routes.UpdateSalary, obj);
    return data;
  },
  getUsers: async (params) => {
    const data = await get(routes.getUsers, params);
    return data;
  },
  getSubUsers: async (params) => {
    const data = await get(routes.getSubUsers, params);
    return data;
  },
  getProfile: async (params) => {
    const data = await get(routes.getProfile, params);
    return data;
  },
  updateUser: async (obj) => {
    const data = await patch(routes.updateUser, obj);
    return data;
  },
  updateUserStatus: async (obj) => {
    const data = await post(routes.updateUserStatus, obj);
    return data;
  },
  UpdatePassword: async (obj) => {
    const data = await post(routes.UpdatePassword, obj);
    return data;
  },
  getUserPermissions: async (params) => {
    const data = await get(routes.getUserPermissions, params);
    return data;
  },
  getUserDetail: async (params) => {
    const data = await get(routes.getUserDetail, params);
    return data;
  },
}

export default UserServices