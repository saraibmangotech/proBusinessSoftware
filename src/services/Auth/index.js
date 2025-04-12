import { post, get } from 'services';
import routes from './routes';

const AuthServices = {
  login: async (obj) => {
    const data = await post(routes.login, obj);
    return data;
  },
  register: async (obj) => {
    const data = await post(routes.register, obj);
    return data;
  },
  Linking: async (obj) => {
    const data = await post(routes.Linking, obj);
    return data;
  },
  handleLogout: async (obj) => {
    const data = await post(routes.handleLogout, obj);
    return data;
  },
  forgetPassword: async (obj) => {
    const data = await post(routes.forgetPassword, obj);
    return data;
  },
  resetPassword: async (obj) => {
    const data = await post(routes.resetPassword, obj);
    return data;
  },
  getSideNavigation: async () => {
    const data = await get(routes.getSideNavigation);
    return data;
  },
  changePassword: async (obj) => {
    const data = await post(routes.changePassword, obj);
    return data;
  },
}

export default AuthServices