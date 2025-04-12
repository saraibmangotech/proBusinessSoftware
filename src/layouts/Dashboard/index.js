import React, { Suspense, useEffect } from 'react';
import { Box } from "@mui/material";
import { Outlet } from 'react-router-dom';
import { CircleLoading } from 'components/Loaders';
import Header from './Header';
import { ErrorToaster } from 'components/Toaster';
import { addNavigation, setPermission } from 'redux/slices/navigationDataSlice';
import { useDispatch } from 'react-redux';
import AuthServices from 'services/Auth';
import { addChildRoutes, getPermissionsRoutes } from 'utils';
import ProtectedRoute from 'routes/ProtectedRoutes';
import { useAuth } from 'context/UseContext';

function DashboardLayout() {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const getSideNavigation = async () => {
    try {
      const { data } = await AuthServices.getSideNavigation();
      const updatedPermissions = data?.permissions.map((item) => {
        if (item.name === 'Customer Profile') {
          return {
            ...item,
            route: `${item.route}/${user.customer_id}`,
          };
        }
        return item;
      });

      dispatch(addNavigation(addChildRoutes(updatedPermissions)));
      dispatch(setPermission(getPermissionsRoutes(updatedPermissions)));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  useEffect(() => {
    getSideNavigation();
  }, []);

  return (
    <Box sx={{ bgcolor: '#FCFCFC', height: '100vh', overflow: 'auto' }}>
      {/* ========== Full-Width Header ========== */}
      <Header status={true} />

      {/* ========== Main Content ========== */}
      <Box sx={{ px: 2, py: 2 }}>
        <Suspense fallback={<CircleLoading />}>
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        </Suspense>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
