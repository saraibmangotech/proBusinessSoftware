import React, { useEffect, useState } from "react";
import { Box, Grid, InputAdornment, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import RoleServices from "services/Role";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import SystemServices from "services/System";
import { useAuth } from "context/UseContext";

function UpdateRole() {

  const navigate = useNavigate();
  const { state } = useLocation()
  const { user, userLogout } = useAuth();
  console.log(state);
  const { register, handleSubmit, setValue, formState: { errors }, control } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Create Role
  const UpdateRole = async (formData) => {
    setLoading(true)
    console.log(formData);
    try {
      let obj = {
        name: user?.ref_id + "-" + formData?.roleName,
        role_id: state?.id
      }


      console.log(obj);
      const promise = SystemServices.UpdateRole(obj);

      showPromiseToast(
        promise,
        'Saving ...',
        'Success',
        'Something Went Wrong'
      );
      const response = await promise;
      if (response?.responseCode === 200) {
        navigate('/sub-role-list')
      }


    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    let ref = user.ref_id + "-";
    let regex = new RegExp(ref, "g"); // Create a dynamic regex
   let newText = state.name.replace(regex, ''); // Replace occurrences
    setValue('roleName', newText)

  }, [])


  return (
    <Box sx={{ p: 2, borderRadius: 3, }}>

      <Box component="form" onSubmit={handleSubmit(UpdateRole)} >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
          <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >UPDATE SUB ROLE</Typography>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <PrimaryButton
             bgcolor={'#001f3f'}
              title="Update"
              type={'submit'}


            />

          </Box>
        </Box>
        <Grid container spacing={0} p={3} >

          <Grid container spacing={1} item xs={12} sm={6}>

            <InputField
              label={"Role Name :*"}
              size="small"
              placeholder="Role Name"
              error={errors?.roleName?.message}
              register={register("roleName", {
                required: "Please enter your role name."
              })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">{user?.ref_id}-</InputAdornment>
                )
              }}
            />


          </Grid>
        </Grid>
      </Box>

    </Box>
  );
}

export default UpdateRole;