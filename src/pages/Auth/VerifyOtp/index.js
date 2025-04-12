import React, { Fragment, useEffect, useState } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import OTPInput from 'react-otp-input';
import { useLocation, useNavigate } from 'react-router-dom';
import Colors from 'assets/Style/Colors';
import { FontFamily, VerifyPasswordIcon } from 'assets';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { PrimaryButton } from 'components/Buttons';
import { useAuth } from 'context/UseContext';
import AuthServices from 'services/Auth';
import Storage from 'utils/Storage';
import { useDispatch } from 'react-redux';
import { addNavigation, setPermission } from 'redux/slices/navigationDataSlice';
import { addChildRoutes, encryptData, getPermissionsRoutes } from 'utils';
import ThankyouDialog from 'components/Dialog/ThankyouDialog';

const useStyle = makeStyles({
  otpBox: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingLeft: 40,
    paddingRight: 40,
    backgroundColor: Colors.white,
    borderRadius: '16px',
    boxShadow: ' 0px 8px 32px 0px #00000040'
  },
  subtitle: {
    marginTop: 8,
    color: Colors.smokeyGrey,
    fontFamily: FontFamily.NunitoRegular,
    textAlign: 'center'
  }
})

const OtpBox = ({ value, setValue }) => {
  return (
    <Box sx={{ my: 2 }}>
      <OTPInput
        value={value}
        numInputs={4}
        onChange={setValue}
        inputStyle={{
          width: "50px",
          height: "50px",
          fontSize: "26px",
          backgroundColor: '#eaeaea',
          color: Colors.textSecondary,
          border: "none",
          borderRadius: '8px',
          outline: "none",
        }}
        focusStyle={{
          width: "50px",
          height: "50px",
          fontSize: "26px",
          outline: "none",
          border: "none",
          borderRadius: '8px',
        }}
        containerStyle={{ display: "flex", justifyContent: "space-evenly" }}
        renderInput={(props) => <input {...props} />}
      />
    </Box>
  )
}

function VerifyOtp() {

  const classes = useStyle();
  const { state } = useLocation();

  const navigate = useNavigate();
  if (!state) {
    navigate('/login')
  }
  const { userLogin } = useAuth();
  const { setStorageItem } = Storage();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // *For Dialog Box
  const [thankyouDialog, setThankyouDialog] = useState(false);

  // *For OTP Value
  const [numberOtp, setNumberOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [error, setError] = useState(false);

  // *For Resend OTP
  const [resendOtpTimer, setResendOtpTimer] = useState(true);
  const [mins, setMins] = useState();
  const [sec, setSec] = useState();

  // *For Otp Timer
  const otpTimer = () => {
    try {
      const duration = 60 * 2 // *Set OTP Time Duration
      var timer = duration, minutes, seconds;
      var timeInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        setMins(minutes)
        setSec(seconds)
        if (--timer < 0) {
          timer = duration;
          setResendOtpTimer(false)
          clearInterval(timeInterval)
        }
      }, 1000);
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Reset OTP Value
  const resetOtpValue = () => {
    setNumberOtp('')
    setEmailOtp('')
  }

  // *For Verify OTP
  const verifyOtp = async () => {
    setLoading(true)
    try {
      if (state?.screen === 'login') {
        let obj = {
          email: state?.email,
          password: state?.password,
          phone_otp: numberOtp,
          email_otp: emailOtp,
        }
        const { data } = await AuthServices.login(obj)
        let loginObj = {
          email: state?.email,
          password: state?.password,
          otp_token: data.otp_token
        }
        setTimeout(async () => {
          const result = await AuthServices.login(loginObj)
          if (result?.data?.password_change) {
            navigate('/new-password', { state: { token: data?.otp_token } })
            return
          }
          let obj = result?.data
          obj.token = encryptData('noToken')
          obj.fcm_token = localStorage.getItem('fcmToken')
          userLogin(obj)
          setStorageItem('journey', result?.data?.journey)
          dispatch(addNavigation(addChildRoutes(result?.data?.modules)))
          dispatch(setPermission(getPermissionsRoutes(result?.data?.modules)))
        }, 1000);
      }
      else if( state?.screen=='link'){
        let obj = {
          email: state?.email,
          uae_phone: state?.uae_phone,
          phone_otp: numberOtp,
          email_otp: emailOtp,
          business_region:state?.business_region
        }
        const { data,responseCode } = await AuthServices.Linking(obj)

        let linkObj = {
          ...state,
          otp_token: data.otp_token
        }
        const result = await AuthServices.Linking(linkObj)
        
        if(result?.responseCode==200){
          SuccessToaster(result?.message)
          navigate('/login')
        }
        else{
          ErrorToaster('Try Again Later')
          navigate('/login')
        }


      }
      else {
        let obj = {
          email: state?.email,
          uae_phone: state?.uae_phone,
          phone_otp: numberOtp,
          email_otp: emailOtp,
        }
        if (state?.uae_phone) {
          const { data } = await AuthServices.register(obj)
          let registerObj = {
            ...state,
            otp_token: data.otp_token
          }
          setTimeout(async () => {
            const result = await AuthServices.register(registerObj)
            if (result?.data?.customer_type === 'export') {
              setThankyouDialog(true)
            } else {
              let obj = result?.data
              obj.token = encryptData('noToken')
              obj.fcm_token = localStorage.getItem('fcmToken')
              userLogin(obj)
              setStorageItem('journey', result.data?.journey)
              dispatch(addNavigation(addChildRoutes(data?.modules)))
              dispatch(setPermission(getPermissionsRoutes(data?.modules)))
            }
          }, 2000);
        } else {
          const { data } = await AuthServices.forgetPassword(obj)
          navigate(`/new-password?otp_token=${data?.otp_token}`, { state: state })
        }
      }
    } catch (error) {
      setError(true)
      resetOtpValue()
    } finally {
      setLoading(false)
    }
  }

  // *For Resend OTP
  const resendOtp = async () => {
    try {
      let otpObj = {
        uae_phone: state?.uae_phone,
        email: state?.email
      }
      if (state?.uae_phone) {
        const { message } = await AuthServices.register(otpObj)
        SuccessToaster(message)
      } else {
        const { message } = await AuthServices.forgetPassword(otpObj)
        SuccessToaster(message)
      }
      otpTimer()
      setResendOtpTimer(true)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  useEffect(() => {
    otpTimer()
  }, []);

  useEffect(() => {
    console.log(emailOtp?.length );
    
    const inputPhoneLength = numberOtp?.length === 4 ? true : false
    const inputEmailLength = emailOtp?.length === 4 ? true : false
    // if (state?.emailField && inputEmailLength) {
    //   setShowButton(true)
    // } else {
    //   setShowButton(false)
    // }
    if (inputEmailLength) {
      setShowButton(true)
    } else {
      setShowButton(false)
    }
  }, [numberOtp, emailOtp]);



  return (
    <Fragment>

      {state && <Box sx={{ py: 9, bgcolor: Colors.primary }}>

        {/* ========== Thank You Dialog  ========== */}
        <ThankyouDialog
          open={thankyouDialog}
          onClose={() => { setThankyouDialog(false); navigate('/') }}
          message1={'Thank you for registration.'}
          message2={'Please proceed with Galaxy Customer Service to start the export procedure.'}
        />

        <Container>
          <Grid container spacing={1} justifyContent={'space-between'}>
            <Grid item md={7} sx={{ display: { xs: 'none', md: 'block' } }}>
              <VerifyPasswordIcon />
            </Grid>
            <Grid item xs={12} md={3.5}>
              <Box className={classes.otpBox} >
                <Typography variant="h4" sx={{ color: Colors.charcoalGrey, textAlign: 'center' }}>
                  OTP Verification
                </Typography>
                {state?.phoneField &&
                  <Fragment>
                    <Typography variant="body2" className={classes.subtitle}>
                      OTP has been sent to your
                      preferred mobile number
                    </Typography>
                    <OtpBox value={numberOtp} setValue={(val) => setNumberOtp(val)} />
                    <Box sx={{ mt: 3 }} />
                  </Fragment>
                }
                {state?.emailField &&
                  <Fragment>
                    <Typography variant="body2" className={classes.subtitle}>
                      OTP has been sent to your
                      preferred email
                    </Typography>
                    <OtpBox value={emailOtp} setValue={(val) => setEmailOtp(val)} />
                  </Fragment>
                }
                {error &&
                  <Typography color="error" sx={{ fontSize: 12, textAlign: 'center', my: 2 }} >You have entered invalid OTP code</Typography>
                }
                <Box sx={{ mt: 1.5, mb: 2 }}>
                  {resendOtpTimer ? (
                    <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.primary, fontFamily: FontFamily.NunitoRegular, textAlign: 'center' }}>
                      {mins}:{sec}
                    </Typography>
                  ) : (
                    <Fragment>
                      <Typography variant="body2" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular, textAlign: 'center' }}>
                        Don’t received OTP code?
                      </Typography>
                      <Typography variant="body2" onClick={() => resendOtp()} sx={{ cursor: 'pointer', color: Colors.primary, fontFamily: FontFamily.NunitoRegular, textAlign: 'center' }}>
                        Resend Code
                      </Typography>
                    </Fragment>
                  )}
                </Box>
                {showButton &&
                  <Box sx={{ textAlign: 'center' }}>
                    <PrimaryButton
                      title="Verify"
                      loading={loading}
                      style={{ fontSize: 14, borderRadius: 26, width: 160 }}
                      onClick={() => verifyOtp()}
                    />
                  </Box>
                }
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>}

    </Fragment>
  );
}

export default VerifyOtp;