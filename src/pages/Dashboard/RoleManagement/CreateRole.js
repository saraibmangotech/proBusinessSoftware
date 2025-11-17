import React, { useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import RoleServices from "services/Role";
import { showErrorToast, showPromiseToast } from "components/NewToaster";

function CreateRole() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Create Role
  const createRole = async (formData) => {
    setLoading(true);
    console.log(formData);
    let obj = {
      name: formData?.roleName,
      is_typist: formData?.is_typist,
      is_receptionist: formData?.is_receptionist,
      is_manager: formData?.is_manager,
    };

    console.log(obj);
    try {
      
      const promise = RoleServices.createRole(obj);

      showPromiseToast(
        promise,
        "Saving ...",
        "Success",
        "Something Went Wrong"
      );
      const response = await promise;
      if (response?.responseCode === 200) {
        navigate("/role-list");
      }
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit(createRole)}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            alignItems: "flex-end",
          }}
        >
          <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
            CREATE ROLE
          </Typography>
          <Box sx={{ display: "flex", gap: "10px" }}>
            <PrimaryButton bgcolor={"#001f3f"} title="Create" type={"submit"} />
          </Box>
        </Box>
        <Grid container spacing={2} p={3}>
          <Grid item xs={12} sm={6}>
            <InputField
              label={"Role Name :*"}
              size={"small"}
              placeholder={"Role Name"}
              error={errors?.roleName?.message}
              register={register("roleName", {
                required: "Please enter your role name.",
              })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputLabel sx={{ fontWeight: "bold" }}>Is Typist?</InputLabel>
            <FormControlLabel
              control={
                <Checkbox {...register("is_typist")} defaultChecked={false} />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputLabel sx={{ fontWeight: "bold" }}>
              Is Receptionist?
            </InputLabel>
            <FormControlLabel
              control={
                <Checkbox
                  {...register("is_receptionist")}
                  defaultChecked={false}
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputLabel sx={{ fontWeight: "bold" }}>Is Manager?</InputLabel>
            <FormControlLabel
              control={
                <Checkbox {...register("is_manager")} defaultChecked={false} />
              }
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default CreateRole;
