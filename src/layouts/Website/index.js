import React, { Suspense, useEffect } from 'react';
import { Box } from "@mui/material";
import { Outlet } from 'react-router-dom';
import { PreLoading } from 'components/Loaders';
import Header from './Header';
import Footer from './Footer';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import SystemServices from 'services/System';
import { ErrorToaster } from 'components/Toaster';
import Storage from 'utils/Storage';
import Cookies from 'js-cookie';
import { app } from 'config/firebase.config';
import { getMessaging, getToken } from '@firebase/messaging';
import SocialLinks from 'components/SocialLink';

const LazyLoading = () => {
  return (
    <Box sx={{ display: 'block', position: 'relative', justifyContent: 'center', alignItems: 'center', minHeight: 380, height: '100vh' }}>
      <PreLoading />
    </Box>
  )
}

function WebsiteLayout() {

  const { setStorageItem } = Storage();
  // const messaging = getMessaging(app);

  // *For Get Session ID
  const generateSessionId = async () => {
    try {
      const { data } = await SystemServices.generateSessionID()
      setStorageItem('sessionId', data.sessionid)
      const savedSecSession = Cookies.get('secsession');
      Cookies.set('testCookie', savedSecSession);
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // const generateToken = async () => {
  //   getToken(messaging, { vapidKey: 'BClgiPeWLUu2Q_oz822G-rRo_HDzjuh3aKanrZlMHWPDeEnjg4-1FLU65E0WD2L283FzL7R9hxjdM8XZRUrFcrE' }).then((currentToken) => {
  //     if (currentToken) {
  //       localStorage.setItem('fcmToken', currentToken)
  //     } else {
  //       // Show permission request UI
  //       console.log('No registration token ava0ilable. Request permission to generate one.');
  //       // ...
  //     }
  //   }).catch((err) => {
  //     console.log('An error occurred while retrieving token. ', err);
  //     // ...
  //   });
  // }

  useEffect(() => {
    generateSessionId()
    // generateToken()
  }, []);

  return (
    <Box>
      <Suspense fallback={<LazyLoading />}>

        {/* ========== Social Links ========== */}
        {/* <SocialLinks /> */}

        {/* ========== Header ========== */}
        {/* <Header /> */}

        {/* ========== Main ========== */}
        <Box component="main" sx={{ overflow: 'hidden' }}>
          {/* <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}> */}
            <Outlet />
          {/* </GoogleReCaptchaProvider> */}
        </Box>

        {/* ========== Footer ========== */}
        {/* <Footer /> */}
         
      </Suspense>
    </Box>
  )
}

export default WebsiteLayout