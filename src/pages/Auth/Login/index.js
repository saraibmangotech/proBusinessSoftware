import React, { useCallback, useState } from 'react';
import { Box, Grid, IconButton, InputAdornment, Typography, Checkbox } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useForm } from 'react-hook-form';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import Colors from 'assets/Style/Colors';
import { Images } from 'assets';
import { useAuth } from 'context/UseContext';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { addChildRoutes, emailRegex, getPermissionsRoutes } from 'utils/index';
import AuthServices from 'services/Auth';
import Storage from 'utils/Storage';
import { useDispatch } from 'react-redux';
import { addNavigation } from 'redux/slices/navigationDataSlice';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import SystemServices from 'services/System';
import ThankyouDialog from 'components/Dialog/ThankyouDialog';
import { Fragment } from 'react';
import { encryptData } from 'utils/index';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const useStyle = makeStyles({
  wrapper: {
    borderRadius: '16px',
    boxShadow: ' 0px 8px 32px 0px #00000040',
    display: 'flex',
    alignItems: 'center',
    width: '900px',
    margin: '60px auto'
  },
  box: {
    background: 'linear-gradient(to bottom, #0c6135, #147836, #268e32, #3fa528, #5bbc0f)',
    borderTopLeftRadius: '16px',
    borderBottomLeftRadius: '16px',
  },
  otpBox: {
    paddingLeft: 30,
    paddingRight: 30,
    borderTopRightRadius: '16px',
    borderBottomRightRadius: '16px',
  },
})

function Login() {

  const classes = useStyle();
  const { userLogin } = useAuth();
  const { setStorageItem } = Storage();
  const dispatch = useDispatch();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [permission, setPermission] = useState(false)

  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [inputError, setInputError] = useState(false);

  // *For Dialog Box
  const [thankyouDialog, setThankyouDialog] = useState(false);

  // *Create an event handler so you can call the verification on button click event or form submit
  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      console.log('Execute reCaptcha not yet available');
      return false
    }

    const token = await executeRecaptcha('login');
    let obj = {
      token: token
    }
    const { data } = await SystemServices.reCaptchaVerify(obj)
    if (data?.success) {
      return data?.success
    } else {
      ErrorToaster('Captcha verification failed!')
    }

  }, [executeRecaptcha]);

  const getPermission = () => {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        localStorage.setItem('Permission', true)
        setPermission(true)
      }
      else {
        localStorage.setItem('Permission', false)
        setPermission(false)
      }
    })
  }

  // *For getWebTokens
  const getWebTokens = async () => {


    try {


      const { data } = await SystemServices.getWebTokens();



      localStorage.setItem('financeToken', data?.financeToken)
      localStorage.setItem('vccToken', data?.vccToken)
      localStorage.setItem('operationsToken', data?.operationsToken)
      localStorage.setItem('searchToken', data?.searchToken)


    } catch (error) {
      ErrorToaster(error);
    }
  };


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

  // *For Login
  const login = async (formData) => {
    setLoading(true);
    try {
      let obj = {
        email: formData.email,
        password: encryptData(formData.password),
        fcm_token: localStorage.getItem('fcmToken')
      }
      if (localStorage.getItem('Permission') == 'true') {
        const response = await handleReCaptchaVerify()
        if (response) {
          const result = await AuthServices.login(obj)
          
          if (result?.responseCode === 200) {
            getWebTokens()
          }
          if (result?.responseCode === 206) {
            SuccessToaster(result?.message)

            const otpField = {
              emailField: result?.data?.email,
              phoneField: result?.data?.phone,
            }
            navigate('/verify-otp', { state: { ...obj, screen: 'login', ...otpField } })
          } else {
            if (result?.data?.password_change) {
              navigate('/new-password', { state: { token: 'abcd' } })
              return
            }
            if (result?.data?.customer_type === 'export') {
              setThankyouDialog(true)
            } else {
              let obj = result?.data
              obj.token = encryptData('noToken')
              obj.fcm_token = localStorage.getItem('fcmToken')

              userLogin(obj)

              setStorageItem('journey', result?.data?.journey)
              dispatch(addNavigation(addChildRoutes(result?.data?.modules)))
              dispatch(setPermission(getPermissionsRoutes(result?.data?.modules)))
            }
          }
        }
      }
      else {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            // Save the permission in localStorage
            localStorage.setItem('Permission', true);

            // Notifications are allowed, proceed with showing notifications

          }
          else {
            localStorage.setItem('Permission', false);
          }
        });
        ErrorToaster('Please Enable Notifications Permission')
      }
    } catch (error) {
      setInputError(true)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getPermission()
    generateSessionId()

  }, [])

  return (
    <Fragment>
      <Box >
        {/* ========== Thank You Dialog  ========== */}
        <ThankyouDialog
          open={thankyouDialog}
          onClose={() => { setThankyouDialog(false); navigate('/') }}
          message1={'Thank you'}
          message2={'Please proceed with Galaxy Customer Service to start the export procedure.'}
        />

        <Box className={classes.wrapper}>
          <Box className={classes.box} sx={{ py: 7, px: 5 }}>
            <Box
              component={'img'}
              src={Images.loginBanner}
              sx={{ height: '280px' }}
            />
            <Box sx={{ textAlign: 'center', mt: 3, mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                If you’re a Galaxy Customer, Download App from
              </Typography>
              <Link
                to="https://play.google.com/store/apps/details?id=com.galaxyworldwideshipping&pcampaignid=web_share"
                aria-label="play store"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Box
                  component="img"
                  loading="lazy"
                  src={Images.googlePlay}
                  alt={"play store"}
                  sx={{ width: "130px", mr: 1 }}
                />
              </Link>
              <Link
                to="https://apps.apple.com/gb/app/gww-shipping/id1592809842"
                aria-label="app store"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Box
                  component="img"
                  loading="lazy"
                  src={Images.appStore}
                  alt={"app store"}
                  sx={{ width: "130px" }}
                />
              </Link>
            </Box>
          </Box>
          <Box className={classes.otpBox} >
            <Typography variant="h4" sx={{ color: Colors.primary, textAlign: 'center' }}>
              Employee Login Portal
            </Typography>
            <Box component="form" onSubmit={handleSubmit(login)} sx={{ mt: 2 }}>
              <Grid container spacing={1} alignItems={"center"}>
                <Grid item xs={12} sm={12}>
                  <InputField
                    size={"small"}
                    label={'Email/Employee ID'}
                    type={'text'}
                    placeholder={'Email/Employee ID'}
                    error={errors?.email?.message || inputError}
                    register={register("email", {
                      required: 'Please enter your email/employee id.',
                    
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <InputField
                    size={"small"}
                    label={'Password'}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={'Password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}                            >
                            {showPassword ? <Visibility color="primary" /> : <VisibilityOff color="primary" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={errors?.password?.message ? errors?.password?.message : inputError && 'You have entered an invalid email or password.'}
                    register={register("password", {
                      required: 'Please enter the password.',
                    })}
                  />
                </Grid>
                <Grid item xs={6} sm={6}  sx={{ textAlign: 'left' }}>
                  <Checkbox />
                  <Typography
                    component={"span"}
                    variant="body2"
                    sx={{ color: Colors.black }}
                  >
                    Remember me
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={6} sx={{ textAlign: 'right' }}>
                  <Typography component={Link} to="/forget-password" variant="body2" sx={{ color: Colors.black }}>
                    Forget Password?
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'center' }}>
                  <PrimaryButton
                    fullWidth
                    title="Sign In"
                    type='submit'
                    loading={loading}
                  />
                  <Typography variant="body2" sx={{ mt: 2, color: Colors.black + '99' }}>
                    Don't have an account?&nbsp;
                    <Typography component={'span'} variant="body2" onClick={() => navigate('/register')} sx={{ color: Colors.black, textDecoration: 'underline', cursor: 'pointer' }}>
                      Sign Up
                    </Typography>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>

      </Box>
    </Fragment>
  );
}

export default Login;