import AccountSetting from 'pages/Dashboard/AccountSetting';
import React, { lazy } from 'react';

const Login = lazy(() => import('pages/Auth/Login'));
const Register = lazy(() => import('pages/Auth/Register'));
const VerifyOtp = lazy(() => import('pages/Auth/VerifyOtp'));
const ForgetPassword = lazy(() => import('pages/Auth/ForgetPassword'));
const NewPassword = lazy(() => import('pages/Auth/NewPassword'));
const Invoice = lazy(() => import('../container/Invoice'));
const Gatepass = lazy(() => import('../container/Gatepass'));

const AuthRoutes = [
  {
    path: "/login",
    component: <Login />,
  },
  {
    path: "/register",
    component: <Register />,
  },
  {
    path: "/verify-otp",
    component: <VerifyOtp />,
  },
  {
    path: "/forget-password",
    component: <ForgetPassword />,
  },
  {
    path: "/new-password",
    component: <NewPassword />,
  },
  {
    path: "/invoice",
    component: <Invoice />,
  },
  {
    path: "/gatepass",
    component: <Gatepass />,
  },

]

export default AuthRoutes
