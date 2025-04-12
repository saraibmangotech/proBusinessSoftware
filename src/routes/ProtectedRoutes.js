import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
	const { pathname } = useLocation();
	const { permission } = useSelector((state) => state.navigationReducer);
	console.log(permission);
	const location = useLocation();
	let currentPath = localStorage.getItem('currentUrl')

	console.log(currentPath,'currentPath');

	console.log(!permission?.includes(pathname.replace(/\/(\d+)$/, "")));

	if (
		pathname !== "/dashboard" &&
		pathname !== "/404" && 
		pathname == "/account-setting" &&
		pathname == "/notifcations" &&
		!currentPath.includes(location.pathname)  && 
		!permission?.includes(pathname.replace(/\/(\d+)$/, ""))
	) {

		return <Navigate to="/404" />
	}

	return children;
}

export default ProtectedRoute;
