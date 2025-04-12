import React, { useRef, useState } from 'react';
import { Box, Grid, IconButton, InputAdornment, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Colors from 'assets/Style/Colors';
import { Images } from 'assets';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { encryptData, passwordRegex } from 'utils/index';
import AuthServices from 'services/Auth';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Storage from 'utils/Storage';
import { Fragment } from 'react';

const useStyle = makeStyles({
  wrapper: {
    borderRadius: '16px',
    boxShadow: ' 0px 8px 32px 0px #00000040',
    display: 'flex',
    alignItems: 'center',
    width: '40%',
    margin: '70px auto',
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

function NewPassword() {

  const classes = useStyle();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { setStorageItem } = Storage();
  const [searchParams] = useSearchParams();
  const otp_token = searchParams.get('otp_token');

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const password = useRef({});
  password.current = watch("password", "");

  const [loading, setLoading] = useState(false);

  // *For Password Show/Hide Toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // *For Set New password
  const newPassword = async (formData) => {
    setLoading(true);
    try {
      let obj = {
        password: encryptData(formData.password),
      }
      let result
      if (state?.token) {
        let token = {
          token: state?.token
        }
        setStorageItem('user', token)
        result = await AuthServices.changePassword(obj)
      } else {
        obj.email = state?.email
        obj.otp_token = otp_token
        result = await AuthServices.forgetPassword(obj)
      }
      SuccessToaster(result?.message)
      navigate('/')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false);
    }
  }

  return (
    <Fragment>

      <Box className={classes.wrapper}>
       
        <Box  >
          <Typography variant="h3" sx={{ color: Colors.primary, textAlign: 'center' }}>
            New Password
          </Typography>
          <Box component="form" onSubmit={handleSubmit(newPassword)} sx={{ mt: 2 }}>
            <Grid container spacing={1} alignItems={"center"}>
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
                          {showPassword ? <Visibility sx={{ color: Colors.smokeyGrey }} /> : <VisibilityOff sx={{ color: Colors.smokeyGrey }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={errors?.password?.message}
                  register={register("password", {
                    required: 'Please enter the password.',
                    pattern: {
                      value: passwordRegex,
                      message: 'Password contain minimum 8 characters, at least uppercase/lowercase letter, number and special character',
                    }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <InputField
                  size={"small"}
                  label={'Confirm Password'}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={'Confirm Password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" onClick={() => setShowConfirmPassword(!showConfirmPassword)}                            >
                          {showConfirmPassword ? <Visibility sx={{ color: Colors.smokeyGrey }} /> : <VisibilityOff sx={{ color: Colors.smokeyGrey }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={errors?.confirmPassword?.message}
                  register={register("confirmPassword", {
                    required: 'Please enter the confirm password.',
                    validate: value => value === password.current || "Confirm password does not match."
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'center' }}>
                <PrimaryButton
                  fullWidth
                  title="Submit"
                  type='submit'
                  loading={loading}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>

    </Fragment>
  );
}

export default NewPassword;