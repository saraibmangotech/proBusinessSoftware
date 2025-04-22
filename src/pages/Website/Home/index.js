import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  CardMedia,
  Checkbox,
  Grid,
  IconButton,
  InputAdornment,
  SvgIcon,
  Typography,
} from "@mui/material";
import { Images, SvgIcon as SvgIconss } from "assets";
import Colors from "assets/Style/Colors";
import { PrimaryButton } from "components/Buttons";
import InputField from "components/Input";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import { ErrorToaster } from "components/Toaster";
import { useAuth } from "context/UseContext";
import Cookies from "js-cookie";
import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import AuthServices from "services/Auth";
import SystemServices from "services/System";
import { emailRegex, encryptData } from "utils";
import Storage from "utils/Storage";

function EmailIcon(props) {
  return (
    <SvgIcon {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="19"
        viewBox="0 0 23 19"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.06855 1.80291L8.82246 8.55974C10.2955 10.03 12.7034 10.0312 14.1777 8.55974L20.9316 1.80291C20.9996 1.73489 20.9897 1.62288 20.9108 1.56785C20.2219 1.08743 19.3838 0.802612 18.481 0.802612H4.51924C3.61636 0.802612 2.77822 1.08748 2.08936 1.56785C2.01045 1.62288 2.00054 1.73489 2.06855 1.80291ZM0.263672 5.05813C0.263672 4.34817 0.439697 3.67737 0.749756 3.08777C0.798242 2.99553 0.921143 2.97688 0.994824 3.05056L7.66323 9.71897C9.7749 11.8337 13.224 11.8349 15.337 9.71897L22.0054 3.05056C22.0791 2.97688 22.202 2.99553 22.2504 3.08777C22.5604 3.67737 22.7365 4.34822 22.7365 5.05813V13.9418C22.7365 16.2901 20.8263 18.1973 18.481 18.1973H4.51924C2.17393 18.1973 0.263672 16.2901 0.263672 13.9418V5.05813Z"
          fill="#B6B6B6"
        />
      </svg>
    </SvgIcon>
  );
}
function PasswordIcon(props) {
  return (
    <SvgIcon className="saraib" {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="25"
        viewBox="0 0 25 25"
        fill="none"
      >
        <path
          d="M16.1163 8.29886C16.9177 8.63783 17.6589 9.08308 18.3311 9.62599V5.78823C18.3311 2.59681 15.7343 0 12.5429 0H12.4538C9.26526 0 6.66846 2.59681 6.66846 5.78823V9.62599C7.34064 9.0831 8.08176 8.63786 8.88321 8.29886C9.09865 8.20694 9.31984 8.12364 9.54103 8.04895V5.78823C9.54103 4.17959 10.8481 2.87257 12.4567 2.87257H12.5457C14.1544 2.87257 15.4614 4.17959 15.4614 5.78823V8.05182C15.6797 8.12364 15.9009 8.20694 16.1163 8.29886Z"
          fill="#B6B6B6"
        />
        <path
          d="M4.35889 16.8591C4.35889 21.3547 8.00418 24.9999 12.4998 24.9999C16.9953 24.9999 20.6407 21.3575 20.6407 16.8591C20.6407 14.6501 19.7587 12.645 18.3311 11.1771C17.5268 10.3527 16.5501 9.69772 15.4585 9.26974C14.5422 8.91067 13.5425 8.71533 12.4998 8.71533C11.457 8.71533 10.4574 8.91067 9.54104 9.26974C8.44946 9.69488 7.47278 10.3498 6.66846 11.1771C5.23789 12.645 4.35889 14.6501 4.35889 16.8591ZM10.4028 15.216C10.4315 14.1043 11.3363 13.1994 12.448 13.1735C13.6286 13.1448 14.5967 14.0957 14.5967 15.2705C14.5967 15.3941 14.5852 15.5147 14.5651 15.6296C14.4616 16.2242 14.1084 16.7355 13.6142 17.0458C13.4103 17.1751 13.3069 17.4163 13.3586 17.649L13.982 20.6049C14.0194 20.783 13.8843 20.9525 13.7005 20.9525H11.299C11.1152 20.9525 10.9801 20.7859 11.0175 20.6049L11.6408 17.649C11.6897 17.4135 11.5891 17.1722 11.3852 17.0429C10.8911 16.7327 10.5378 16.2242 10.4343 15.6267C10.4114 15.4946 10.3999 15.3567 10.4028 15.216Z"
          fill="#B6B6B6"
        />
      </svg>
    </SvgIcon>
  );
}
function Home() {
  const navigate = useNavigate();
  console.log(SvgIcon.email);
  const { userLogin } = useAuth();
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  console.log(watch());

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [inputError, setInputError] = useState(false);
  const { setStorageItem } = Storage();
  // *For Login
  const login = async (formData) => {
    setLoading(true);

    try {
      let obj = {
        email: formData.email,
        password: encryptData(formData.password),
      };
      const promise = AuthServices.login(obj);

      showPromiseToast(
        promise,
        "Logging in, please wait...",
        "Success",
        "Failed to Loged in"
      );

      const result = await promise;

      console.log(result);
      if (result.responseCode == 200) {
        navigate("/dashboard");
        userLogin(result?.data);
      }
    } catch (error) {
      setInputError(true);
    } finally {
      setLoading(false);
    }
  };

  // *For Get Session ID
  const generateSessionId = async () => {
    const promise = SystemServices.generateSessionID();

    // showPromiseToast(
    //   promise,
    //   'Generating session ID...',
    //   'Session ID generated successfully!',
    //   'Failed to generate session ID'
    // );

    try {
      const { data } = await promise;
      setStorageItem("sessionId", data.sessionid);

      const savedSecSession = Cookies.get("secsession");
      Cookies.set("testCookie", savedSecSession);
    } catch (error) {
      showErrorToast(error);
    }
  };
  useEffect(() => {
    generateSessionId();
  }, []);

  return (
    <Fragment>
		<Box sx={{ backgroundColor: "#f2f6f8" ,display:"flex" ,justifyContent:"center",alignItems:'center',height:"100vh" }}>

      <Grid
        container
        justifyContent={"center"}
        // alignItems={"center"}
		borderRadius={"15px"}
		// sx={{boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px"}}
        // sx={{backgroundColor: "white", }}
      >
        <Grid
          item
          lg={3.5}
          md={5}
          sm={10}
          xs={10}
          sx={{
            textAlign: "center",
            p: "35px",
			borderTopLeftRadius: "15px",
            borderBottomLeftRadius: "15px",
			backgroundColor: "white",
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px"
            
          }}
        >
          {/* <Box component={'img'} src={Images?.logoDark} width={'130px'} >

					</Box> */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CardMedia
              image={Images.mainLogo}
              sx={{ width: "200px", height: "100px" }}
            />
          </Box>
          <Box component="form" onSubmit={handleSubmit(login)} sx={{ mt: 1 }}>
            <Grid
              container
              spacing={1}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Grid item xs={12} sm={12}>
                <InputField
                  type={"text"}
                  placeholder={"Email Address/Employee ID"}
                  error={errors?.email?.message || inputError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="end">
                        <Box className="input-icon">
                          <EmailIcon />
                        </Box>{" "}
                        &nbsp;&nbsp;&nbsp;
                      </InputAdornment>
                    ),
                  }}
                  inputStyle={{
                    ".MuiOutlinedInput-root": {
                      borderRadius: "10px", // Ensure the border radius is applied to the input wrapper
                      "&.Mui-focused": {
                        "& fieldset": {
                          border: `2px solid #03091A !important`,
                        },
                        svg: {
                          path: {
                            fill: "#0076bf",
                          },
                        },
                      },
                    },
                  }}
                  register={register("email", {
                    required: "Please enter your email.",
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <InputField
                  type={showPassword ? "text" : "password"}
                  placeholder={"Enter Your Password"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="end">
                        <Box className="input-icon">
                          <PasswordIcon />
                        </Box>{" "}
                        &nbsp;&nbsp;&nbsp;
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <Visibility sx={{ color: "rgb(189 155 74)" }} />
                          ) : (
                            <VisibilityOff sx={{ color: "rgb(189 155 74)" }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  inputStyle={{
                    ".MuiOutlinedInput-root": {
                      borderRadius: "10px", // Ensure the border radius is applied to the input wrapper
                      "&.Mui-focused": {
                        "& fieldset": {
                          border: `2px solid #03091A !important`,
                        },
                        svg: {
                          path: {
                            fill: "#0076bf",
                          },
                        },
                      },
                    },
                  }}
                  error={
                    errors?.password?.message
                      ? errors?.password?.message
                      : inputError &&
                        "You have entered an invalid email or password."
                  }
                  register={register("password", {
                    required: "Please enter the password.",
                  })}
                />
              </Grid>
              <Grid item xs={6} sm={6} sx={{ textAlign: "left" }}>
                <Checkbox
                  sx={{
                    color: "rgb(189 155 74)",
                    "& .MuiCheckbox-colorPrimary": {
                      color: "rgb(189 155 74) !important",
                    },
                  }}
                />
                <Typography
                  component={"span"}
                  variant="body2"
                  sx={{ color: Colors.black }}
                >
                  Remember me
                </Typography>
              </Grid>
              <Grid item xs={6} sm={6} sx={{ textAlign: "right" }}>
                <Typography
                  component={Link}
                  to="/forget-password"
                  variant="body2"
                  sx={{ color: Colors.black }}
                >
                  Forget Password?
                </Typography>
              </Grid>

              <Grid
                item
                xs={12}
                sm={12}
                display={"flex"}
                justifyContent={"center"}
                sx={{ mt: "40px", textAlign: "center", mb: "5px" }}
              >
                <PrimaryButton
                  fullWidth
                  title="Login"
                  type="submit"
                  bgcolor={"rgb(189 155 74)"}
                  loading={loading}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
		<Grid
          item
          lg={3.5}
          md={5}
          sm={10}
          xs={10}
          sx={{
            textAlign: "center",
            p: "30px",
            borderTopRightRadius: "15px",
            borderBottomRightRadius: "15px",
            // backgroundColor: "white",
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
			display: { xs: "none", sm: "none",md:"flex" },
			backgroundColor: "white"
          }}
        >
			 <CardMedia
    component="img"
    src={Images.loginSide} 
    alt="Login side image"
  />
		</Grid>
      </Grid>
		</Box>
    </Fragment>
  );
}

export default Home;
