import React, { useEffect, useState } from "react";
import { Box, Grid, IconButton, InputAdornment, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { Images, SvgIcon, SvgIcon as SvgIconss } from 'assets';
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import RoleServices from "services/Role";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import SelectField from "components/Select";
import UserServices from "services/User";
import SystemServices from "services/System";
import { useCallbackPrompt } from "hooks/useCallBackPrompt";


// function PasswordIcon(props) {
// 	return (
// 		<SvgIcon className='saraib' {...props}>
// 			<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
// 				<path d="M16.1163 8.29886C16.9177 8.63783 17.6589 9.08308 18.3311 9.62599V5.78823C18.3311 2.59681 15.7343 0 12.5429 0H12.4538C9.26526 0 6.66846 2.59681 6.66846 5.78823V9.62599C7.34064 9.0831 8.08176 8.63786 8.88321 8.29886C9.09865 8.20694 9.31984 8.12364 9.54103 8.04895V5.78823C9.54103 4.17959 10.8481 2.87257 12.4567 2.87257H12.5457C14.1544 2.87257 15.4614 4.17959 15.4614 5.78823V8.05182C15.6797 8.12364 15.9009 8.20694 16.1163 8.29886Z" fill="#B6B6B6" />
// 				<path d="M4.35889 16.8591C4.35889 21.3547 8.00418 24.9999 12.4998 24.9999C16.9953 24.9999 20.6407 21.3575 20.6407 16.8591C20.6407 14.6501 19.7587 12.645 18.3311 11.1771C17.5268 10.3527 16.5501 9.69772 15.4585 9.26974C14.5422 8.91067 13.5425 8.71533 12.4998 8.71533C11.457 8.71533 10.4574 8.91067 9.54104 9.26974C8.44946 9.69488 7.47278 10.3498 6.66846 11.1771C5.23789 12.645 4.35889 14.6501 4.35889 16.8591ZM10.4028 15.216C10.4315 14.1043 11.3363 13.1994 12.448 13.1735C13.6286 13.1448 14.5967 14.0957 14.5967 15.2705C14.5967 15.3941 14.5852 15.5147 14.5651 15.6296C14.4616 16.2242 14.1084 16.7355 13.6142 17.0458C13.4103 17.1751 13.3069 17.4163 13.3586 17.649L13.982 20.6049C14.0194 20.783 13.8843 20.9525 13.7005 20.9525H11.299C11.1152 20.9525 10.9801 20.7859 11.0175 20.6049L11.6408 17.649C11.6897 17.4135 11.5891 17.1722 11.3852 17.0429C10.8911 16.7327 10.5378 16.2242 10.4343 15.6267C10.4114 15.4946 10.3999 15.3567 10.4028 15.216Z" fill="#B6B6B6" />
// 			</svg>
// 		</SvgIcon>
// 	);
// }

function CreateUser() {
  const [handleBlockedNavigation] =
  useCallbackPrompt(false)
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, control, getValues, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [inputError, setInputError] = useState(false);
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [buttondisabled, setButtondisabled] = useState(false)
  // Watch both password and confirm password fields for changes
  const password = watch('password', '');
  const confirmPassword = watch('confirmpassword', '');

  const getRoles = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 1000,
        search: search,
      };
      const { data } = await SystemServices.getRoles(params);
      setRoles(data?.roles?.rows)
    } catch (error) {
      showErrorToast(error);
    }
  };


  // *For Create Role
  const CreateUser = async (formData) => {
    setLoading(true)
    setButtondisabled(true)
    console.log(formData);
    try {
      let obj = {
        name: getValues('name'),

        email: getValues('email'),
        phone: getValues('phone'),
        password: getValues('password'),
        role_id: selectedRole?.id
      }


      console.log(obj);
      const promise = UserServices.CreateUser(obj);

      showPromiseToast(
        promise,
        'Saving ...',
        'Success',
        'Something Went Wrong'
      );
      const response = await promise;
      if (response?.responseCode === 200) {
        navigate('/user-list')
      }


    } catch (error) {
      setButtondisabled(false)
      // showErrorToast(error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getRoles()
  }, [])

  return (
    <Box sx={{ p: 3, borderRadius: 3, }}>

      <Box component="form" onSubmit={handleSubmit(CreateUser)} >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
          <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >CREATE USER</Typography>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <PrimaryButton
              bgcolor={Colors.buttonBg}
              title="Save"
              type={'submit'}
              disabled={buttondisabled}

            />

          </Box>
        </Box>
        <Grid container spacing={0} mt={5} p={1} gap={'0px 20px'} >

          <Grid item xs={12} sm={5}>

            <InputField
              label={" Name :*"}
              size={'small'}
              placeholder={" Name"}
              error={errors?.name?.message}
              register={register("name", {
                required:
                  "Please enter name."

              })}
            />


          </Grid>
          <Grid item xs={12} sm={5}>

            <InputField
              label={"Email :*"}
              size={'small'}
              placeholder={"Email"}
              error={errors?.email?.message}
              register={register("email", {
                required: "Please enter your email.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address."
                }
              })}
            />


          </Grid>
          <Grid item xs={12} sm={5}>

            <InputField
              label={"Phone :*"}
              size={'small'}
              placeholder={"Phone "}
              type={'number'}
              error={errors?.phone?.message}
              register={register("phone", {
                required:
                  "Please enter phone.",
                pattern: {
                  value: /^05[0-9]{8}$/,
                  message: "Please enter a valid UAE phone number (starting with 05 and 8 digits)."
                }

              })}
            />


          </Grid>
          <Grid item xs={12} sm={5}>
            <SelectField
              size={'small'}
              label={'Select Role :*'}
              options={roles}
              selected={selectedRole}
              onSelect={(value) => setSelectedRole(value)}
              error={errors?.role?.message}
              register={register("role", {
                required: 'Please select role'
              })}
            />
          </Grid>

          <Grid item xs={12} sm={5}>
            <InputField
              size="small"
              label="Password :*"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Your Password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <Visibility color="primary" /> : <VisibilityOff color="primary" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={errors.password?.message || (inputError && 'You have entered an invalid email or password.')}
              register={register('password', {
                required: 'Please enter the password.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <InputField
              size="small"
              label="Confirm Password :*"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Enter Your Confirm Password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <Visibility color="primary" /> : <VisibilityOff color="primary" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={errors.confirmpassword?.message || (inputError && 'You have entered an invalid email or password.')}
              register={register('confirmpassword', {
                required: 'Please enter the confirm password.',
                validate: value => value === password || 'Passwords do not match.',
              })}
            />

          </Grid>

        </Grid>
      </Box>

    </Box>
  );
}

export default CreateUser;