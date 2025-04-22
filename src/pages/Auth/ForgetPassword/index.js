import React, { Fragment, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Colors from 'assets/Style/Colors';
import { Images } from 'assets';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { emailRegex } from 'utils/index';
import AuthServices from 'services/Auth';
import { ErrorToaster } from 'components/Toaster';

const useStyle = makeStyles({
  wrapper: {
    borderRadius: '16px',
    boxShadow: ' 0px 8px 32px 0px #00000040',
    display: 'flex',
    alignItems: 'center',
    width: '40%',
    margin: '80px auto',
    padding:'40px'
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

function ForgetPassword() {

  const classes = useStyle();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Send Otp on Email
  const sendOtp = async (formData) => {
    setLoading(true);
    try {
      let obj = {
        email: formData.email,
      }
      const { data } = await AuthServices.forgetPassword(obj)
      const otpField = {
        emailField: data?.email,
        phoneField: data?.phone,
      }
      navigate('/verify-otp', { state: { ...obj, ...otpField } })
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false);
    }
  }

  return (
    <Fragment >

      <Box >
        <Grid container justifyContent={'center'} className={classes.wrapper}>
      
        <Grid item xs={11}>
        <Box  >
          <Box sx={{display:'flex',justifyContent:'center',flexDirection:'column',alignItems:'center',mb:2}}>
          <Box component={'img'} sx={{textAlign:'center'}} src={Images.mainLogo} width={'200px'}></Box>
          </Box>
          <Typography variant="h3" sx={{ color: "rgb(189 155 74)", textAlign: 'center' }}>
            Forget Password
          </Typography>
          <Box component="form" onSubmit={handleSubmit(sendOtp)} sx={{ mt: 2 }}>
            <Grid container spacing={1} alignItems={"center"}>
              <Grid item xs={12} sm={12}>
                <InputField
                  size={"small"}
                  label={'Email'}
                  type={'email'}
                  placeholder={'Email Address'}
                  error={errors?.email?.message}
                  register={register("email", {
                    required: 'Please enter your email.',
                    pattern: {
                      value: emailRegex,
                      message: 'Please enter a valid email.',
                    }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'center' }}>
                <PrimaryButton
                  fullWidth
                  title="send OTP"
                  type='submit'
                  loading={loading}
                  bgcolor={'rgb(189 155 74)'}

                />
              </Grid>
            </Grid>
          </Box>
        </Box>
        </Grid>
        </Grid>
      </Box>

    </Fragment>
  );
}

export default ForgetPassword;