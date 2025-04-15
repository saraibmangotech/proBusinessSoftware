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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
  {/* ========== Full-Width Header ========== */}
  <Header status={true} />

  {/* ========== Main Content ========== */}
  <Box sx={{ px: 2, py: 2, flexGrow: 1 ,overflow:'auto' }}>
    <Suspense fallback={<CircleLoading />}>
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    </Suspense>
  </Box>

  {/* ========== Footer ========== */}
  <Box sx={{ bgcolor: '#121f35', padding: '5px 18px', textAlign: 'center' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Box>
        <p style={{ fontSize: '14px', color: '#ffffff' }}>
        Alpha PRO ERP
        </p>
      </Box>
      <Box>
        <p style={{ fontSize: '14px', color: '#ffffff' }}>
        Powered by <a href='https://MangoTechDevs.ae' target='blank' style={{cursor:"pointer" , color:"#ffffff"}}> MangoTechDevs.ae </a>        </p>
      </Box>
    </Box>
  </Box>
</Box>

  );
}

export default DashboardLayout;
