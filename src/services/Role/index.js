import { post, get, patch, deleted } from 'services';
import routes from './routes';

const RoleServices = {
  createRole: async (obj) => {
    const data = await post(routes.createRole, obj);
    return data;
  },
  getRoles: async (params) => {
    const data = await get(routes.getRoles, params);
    return data;
  },
   getUserRolesPermissions: async (params) => {
    const data = await get(routes.getUserRolesPermissions, params);
    return data;
  },
  updateRole: async (obj) => {
    const data = await patch(routes.updateRole, obj);
    return data;
  },
  deleteRole: async (params) => {
    const data = await deleted(routes.deleteRole, params);
    return data;
  },
  getRolesPermissions: async (params) => {
    const data = await get(routes.getRolesPermissions, params);
    return data;
  },
  getSubRolesPermissions: async (params) => {
    const data = await get(routes.getSubRolesPermissions, params);
    return data;
  },
  updateRolesPermissions: async (obj) => {
    const data = await post(routes.updateRolesPermissions, obj);
    return data;
  },
   updateUserRolesPermissions: async (obj) => {
    const data = await post(routes.updateUserRolesPermissions, obj);
    return data;
  },
}

export default RoleServices