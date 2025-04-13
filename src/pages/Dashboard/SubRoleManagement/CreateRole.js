import React, { useEffect, useState } from "react";
import { Box, Grid, InputAdornment, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import RoleServices from "services/Role";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import { useAuth } from "context/UseContext";

function CreateRole() {

  const navigate = useNavigate();
  const { user, userLogout } = useAuth();

  const { register, handleSubmit, formState: { errors }, control } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Create Role
  const createRole = async (formData) => {
    setLoading(true)
    console.log(formData);
    try {
      let obj = {
        name: user?.ref_id+"-"+formData?.roleName,
        customer_id: user?.customer_id
      }


      console.log(obj);
      const promise = RoleServices.createRole(obj);

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
      console.log(error);

    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {


  }, [])


  return (
    <Box sx={{ p: 2, borderRadius: 3, }}>

      <Box component="form" onSubmit={handleSubmit(createRole)} >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
          <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >CREATE SUB ROLE</Typography>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <PrimaryButton
             bgcolor={'#bd9b4a'}
              title="Create"
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

export default CreateRole;