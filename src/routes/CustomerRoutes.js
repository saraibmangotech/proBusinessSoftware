
import AccountSetting from "pages/Dashboard/AccountSetting";
import MyCustomers from "pages/Dashboard/Customers/MyCustomers";
import MyVehicles from "pages/Dashboard/Customers/MyVehicles";
import VehicleBookingDetail from "pages/Dashboard/VehicleBooking/VehicleBookingDetail";
import React, { lazy } from "react";

const Dashboard = lazy(() => import('pages/Dashboard/Dashboard'));
const RequestBuyerId = lazy(() => import('pages/Dashboard/BuyerId/RequestBuyerId'));


const CustomerRoutes = [
	{
		path: "/dashboard",
		component: <Dashboard />,
	},
	{
		path: "/request-buyer-id",
		component: <RequestBuyerId />,
	},
	{
		path: "/my-customers",
		component: <MyCustomers />,
	},
	{
		path: "/my-vehicles",
		component: <MyVehicles />,
	},
	{
		path: "/vehicle-booking-detail/:id",
		component: <VehicleBookingDetail />,
	  },
	  
];

export default CustomerRoutes;
