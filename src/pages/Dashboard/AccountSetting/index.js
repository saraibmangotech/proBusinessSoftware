import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  IconButton,
  Avatar,
} from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Colors from "assets/Style/Colors";
import UploadIcon from "@mui/icons-material/Upload";
import { useAuth } from "context/UseContext";

import instance from "config/axios";
import routes from "services/System/routes";
import { ErrorHandler } from "config/ErrorHandler";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import UserServices from "services/User";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import AuthServices from "services/Auth";
import { useNavigate } from "react-router-dom";
import { encryptData } from "utils";

export default function AccountSetting() {
  const [hovered, setHovered] = useState(false);
  const [userDetail, setUserDetail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [imageURL, setImageURL] = useState("");
 

  const { user, userLogout } = useAuth();


  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
    setValue,
  } = useForm();

  const oldPassword = watch("old_password");
  const newPassword = watch("new_password");
  const confirm_password = watch("confirm_password");

  const baseUrl = process.env.REACT_APP_IMAGE_BASE_URL;

  useEffect(() => {
    if (newPassword && newPassword === oldPassword) {
      setError("new_password", {
        type: "manual",
        message: "Old Password and New Password cannot be the same",
      });
    } else {
      clearErrors("new_password");
    }

    if (confirm_password && newPassword !== confirm_password) {
      setError("confirm_password", {
        type: "manual",
        message: "New Password and Confirm Password must be the same",
      });
    } else {
      clearErrors("confirm_password");
    }
  }, [newPassword, oldPassword, confirm_password, setError, clearErrors]);

  const submitForm =async (formData) => {
    
    try {
      let obj = {
        old_password: encryptData(formData.old_password),
        new_password: encryptData(formData.new_password),
        email:user?.email
      }
      console.log("Form submitted", obj);
      let result
        result = await AuthServices.changePassword(obj)
  
      SuccessToaster(result?.message)
      setValue('old_password','')
      setValue('new_password','')
      setValue('confirm_password','')
    
    } catch (error) {
      ErrorToaster(error)
    } finally {
      
    }
  }
  const fileInputRef = useRef(null);
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    try {
      const formData = new FormData();
      formData.append("document", e.target.files[0]);
      const response = await instance.post(routes.uploadDocuments, formData);
      setImageURL(response?.data?.data?.path);
      updateUser(response?.data?.data?.path);
      console.log(response.data?.data?.path);
      getProfile()
    } catch (error) {
      ErrorHandler(error);
      ErrorToaster(error?.message || "Failed to upload image");
    }
  };

  const updateUser = async (imagelink) => {
    const obj = {
      id: user?.id,
      name: user?.name,
      ref_id: user?.ref_id,
      phone: user?.phone,
      email: user?.email,
      picture: imagelink,
      user_type_id: user?.user_type_id,
      role_id: user?.role_id,
      is_active: true,
    };
    console.log(obj);
    try {
      const { data, responseCode, message } = await UserServices.updateUser(
        obj
      );
      console.log(data);
    } catch (error) {
      ErrorHandler(error);
      ErrorToaster(error?.message);
    }
  };

  const getProfile = async (imagelink) => {
   
    try {
      const { data } = await UserServices.getProfile( );
      console.log(data);
      setUserDetail(data?.user)
      let oldData=localStorage.getItem('user')
      if(oldData){
        oldData = JSON.parse(oldData)
        oldData.picture=data?.user?.picture
        oldData = JSON.stringify(oldData)
        localStorage.setItem('user',oldData)
      }
    } catch (error) {
      ErrorHandler(error);
      ErrorToaster(error?.message);
    }
  };
  useEffect(() => {
    getProfile()
  }, [])
  
  return (
    <>
      <Box sx={{ mt: 5, ml: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "600", fontSize: "20px", color: Colors.primary }}
        >
          Account Setting
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Grid container justifyContent={"space-between"}>
          <Grid item md={4} xs={12} sx={{ padding: { md: "12px", xs: "6px" } }}>
            <Box
              sx={{
                background: Colors.white,
                borderRadius: "10px",
                padding: "38px 15px",
                boxShadow: "rgba(0, 0, 0, 0.05) 0rem 1.25rem 1.6875rem 0rem",
                height: "100% ",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: 90,
                  height: 90,
                  margin: "0 auto",
                  mt: 2,
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: 90,
                    height: 90,
                    margin: "0 auto",
                    mt: 2,
                  }}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <Box
                    component="img"
                    src={userDetail?.picture ? baseUrl + userDetail?.picture : imageURL}
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      cursor: "pointer",
                      objectFit: "contain",
                      border: "1px solid grey",
                    }}
                    onClick={(e) => {
                      handleImageClick(e);
                    }}
                  />
                  {hovered && (
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        padding: "5px 15px",
                        transform: "translate(-50%, -50%)",
                        color: "white",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        borderRadius: "50%",
                        display: "block",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                        },
                      }}
                      onClick={(e) => {
                        handleImageClick(e);
                      }}
                    >
                      <UploadIcon />
                      <Box sx={{ fontSize: "12px" }}>Upload Image</Box>
                    </IconButton>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <Box component={"span"} sx={{ fontWeight: "600" }}>
                  Name:{" "}
                </Box>
                <Box component={"span"} sx={{ fontWeight: "400" }}>
                  {userDetail?.name}
                </Box>
              </Box>
              <Box
                sx={{
                  mt: 3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <Box component={"span"} sx={{ fontWeight: "600" }}>
                  Email:{" "}
                </Box>
                <Box component={"span"} sx={{ fontWeight: "400" }}>
                  {userDetail?.email}
                </Box>
               
              </Box>
              <Box
                sx={{
                  mt: 3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
              <Box component={"span"} sx={{ fontWeight: "600" }}>
                  Role :{" "}
                </Box>
                <Box component={"span"} sx={{ fontWeight: "400" }}>
                  {userDetail?.user_type_id == 'O' ? 'Admin' : userDetail?.user_type_id == 'S' ?  'Staff' :  userDetail?.user_type_id == 'C' ? 'Customer' : userDetail?.user_type_id == 'A' ? "Agent" : ''}
                </Box>
               
              </Box>
              <Box
                sx={{
                  mt: 3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                
              </Box>
            </Box>
          </Grid>

          <Grid item md={8} xs={12} sx={{ padding: { md: "12px", xs: "6px" } }}>
            <Box
              sx={{
                background: Colors.white,
                borderRadius: "10px",
                padding: "38px 15px",
                boxShadow: "rgba(0, 0, 0, 0.05) 0rem 1.25rem 1.6875rem 0rem",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "600", color: Colors.primary }}
              >
                Change Password
              </Typography>
              <form onSubmit={handleSubmit(submitForm)}>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item md={6} sx={{ width: "100%" }}>
                    <Box sx={{ fontWeight: "500", fontSize: "14px", mb: 1 }}>
                      Old Password
                    </Box>
                    <TextField
                      type={showPassword ? "text" : "password"}
                      {...register("old_password", {
                        required: "Please enter old password",
                      })}
                      error={Boolean(errors.old_password)}
                      InputProps={{
                        style: { padding: "5px" },
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        ),
                      }}
                      helperText={errors.old_password?.message}
                      fullWidth
                      size={"small"}
                      placeholder={"Old Password"}
                    />
                  </Grid>
                  <Grid item md={6} sx={{ width: "100%" }}>
                    <Box sx={{ fontWeight: "500", fontSize: "14px", mb: 1 }}>
                      New Password
                    </Box>
                    <TextField
                      type={showPassword1 ? "text" : "password"}
                      {...register("new_password", {
                        required: "Please enter new password",
                      })}
                      error={Boolean(errors.new_password)}
                      InputProps={{
                        style: { padding: "5px" },
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword1(!showPassword1)}
                          >
                            {showPassword1 ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        ),
                      }}
                      helperText={errors.new_password?.message}
                      fullWidth
                      size={"small"}
                      placeholder={"New Password"}
                    />
                  </Grid>
                  <Grid item md={6} sx={{ width: "100%" }}>
                    <Box sx={{ fontWeight: "500", fontSize: "14px", mb: 1 }}>
                      Confirm Password
                    </Box>
                    <TextField
                      type={showPassword2 ? "text" : "password"}
                      {...register("confirm_password", {
                        required: "Please enter Confirm password",
                        validate: (value) =>
                          value === newPassword ||
                          "New Password and Confirm Password must be the same",
                      })}
                      error={Boolean(errors.confirm_password)}
                      InputProps={{
                        style: { padding: "5px" },
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword2(!showPassword2)}
                          >
                            {showPassword2 ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        ),
                      }}
                      helperText={errors.confirm_password?.message}
                      fullWidth
                      size={"small"}
                      placeholder={"Confirm Password"}
                    />
                  </Grid>

                  <Grid item md={12}>
                    <Button
                      type="submit"
                      sx={{
                        fontWeight: "500",
                        textAlign: "center",
                        borderRadius: "5px",
                        padding: "6px 30px",
                        cursor: "pointer",
                        fontSize: "14px",
                        mb: 1,
                        background: Colors.primary,
                        color: Colors.white,
                        "&:hover": {
                          background: Colors.primary,
                        },
                      }}
                    >
                      Save
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Box>
     
    </>
  );
}
