import React, { Fragment, useEffect, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { ExpandLess, ExpandMore, PowerSettingsNew } from "@mui/icons-material";
import Navigation from "./Navigation";
import Colors from "assets/Style/Colors";
import { FontFamily, IdCardIcon, Images, SvgIcon } from "assets";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { PrimaryButton } from "components/Buttons";
import SimpleDialog from "components/Dialog/SimpleDialog";
import ClientServices from "services/Client";
import { ErrorToaster } from "components/Toaster";
import SelectField from "components/Select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/UseContext";
import InputField from "components/Input";
import SystemServices from "services/System";
import MenuIcon from "@mui/icons-material/Menu";
import AuthServices from "services/Auth";
import WestIcon from "@mui/icons-material/West";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import Avatar from "@mui/material/Avatar";
import { Badge } from "@mui/base";
import LogoutIcon from "@mui/icons-material/Logout";

function Sidebar({ onClick }) {
  const navigate = useNavigate();
  const { user, userLogout } = useAuth();
  const { pathname } = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
  } = useForm();

  const { navigation } = useSelector((state) => state.navigationReducer);
  console.log(navigation);

  const [expand, setExpand] = useState([]);

  // *For Vin Dialog
  const [vinDialog, setVinDialog] = useState(false);

  // *For Vin and Lot
  const [vin, setVin] = useState([]);
  const [selectedVin, setSelectedVin] = useState(null);
  const [lot, setLot] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);


  const [anchorEl, setAnchorEl] = React.useState(null);

  // *For Dialog Box
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async (formData) => {
    let obj = {
      fcm_token: localStorage.getItem("fcmToken"),
    };
    try {
      const { message } = await AuthServices.handleLogout(obj);
      navigate('/')
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const myNavigation = [
    {
      name: "dashboard",
      icon: "home",
      route: "/dashboard",
      userType: "",
      childRoute: [""],
      children: [
        // {
        //   name: "Galaxy Operations",
        //   route: "/galaxy-operations",
        // },
        {
          name: "Finance",
          route: "/finance",
        },
        {
          name: "Global Search",
          route: "/global-search",
        },
        // {
        //   name: "Operations",
        //   route: "/operations",
        // },

        {
          name: "Search Vin/Lot",
          route: "",
        },
        {
          name: "Galaxy CustomerWise VCC Reports",
          route: "/customerwise-vcc-reports",
        },
        // {
        //   name: "Customer Service",
        //   route: "/customer-service",
        // },
      ],
    },
  ];

  const subCustomer = [
    {
      name: "My Customers",
      route: "/my-customers",
      icon: "customer",
      userType: "",
      childRoute: [""],
      children: [],
    },
    {
      name: "My Vehicles",
      route: "/my-vehicles",
      icon: "vehicle",
      userType: "",
      childRoute: [""],
      children: [],
    },
  ];

  const handleClick = () => {
    setVinDialog(true);
  };

  // *For Vin
  const getVin = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search,
      };
      const { data } = await ClientServices.getTTVin(params);

      let arrayOfObjects = data?.details?.vins.map((item) => {
        return { id: item.vin, name: item.vin, ...item };
      });

      let arrayOfObjects1 = data?.details?.lots.map((item) => {
        return { id: item.lot, name: item.lot, ...item };
      });

      setVin(arrayOfObjects);
      setLot(arrayOfObjects1);

      setVin([...arrayOfObjects, ...arrayOfObjects1]);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Apply Filters
  const applyFilter = async (data) => {
    try {
      let data = {
        search: getValues("search"),
      };
      getVehicleTT(1, "", data);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For TTs
  const getVehicleTT = async (page, search, filter) => {
    const Filter = { ...filter };

    try {
      let params = {
        page: 1,
        limit: 15,
      };
      params = { ...params, ...Filter };
      const { data } = await ClientServices.getVehicleTT(params);
      if (data?.details) {
        navigate(`/vehicle-booking-detail/${data?.details?.id}`);
        setVinDialog(false);
      } else {
        ErrorToaster("No Vehicle Found");
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const handleCollapse = (value) => {
    const isExpanded = expand.includes(value);
    let newExpand;

    if (isExpanded) {
      // If clicked item is already expanded, collapse it
      newExpand = expand.filter((item) => item !== value);
    } else {
      // If clicked item is not expanded, collapse all others and expand it
      newExpand = [value];
    }

    setExpand(newExpand);
  };

  // *For Sub Child Active
  const handleSubChildActive = (item) => {
    return (
      item.childRoute?.indexOf(pathname) !== -1 &&
      item.childRoute?.indexOf(pathname)
    );
  };
  // Helper function to check if any sub-child is active
  const isAnySubChildActive = (parentItem) => {
    // Recursively check all children and sub-children for active state
    if (!parentItem?.children) return false;

    return parentItem.children.some((child) => {
      if (child.route === pathname || handleSubChildActive(child) || handleSubChildActive(child) === 0) {
        return true;
      }
      return isAnySubChildActive(child); // Recursive call for sub-children
    });
  };
  return (
    <>

      {/* ========== Confirmation Dialog ========== */}
      <ConfirmationDialog
        open={confirmationDialog}
        onClose={() => setConfirmationDialog(false)}
        message={"Are you sure you want to logout?"}
        action={() => {
          setConfirmationDialog(false);
          userLogout();
          handleLogout();
        }}
      />
      {/* Vin Lot Modal */}
      <SimpleDialog
        open={vinDialog}
        onClose={() => setVinDialog(false)}
        title={"Search By Vin/Lot"}
      >
        <Box component="form" onSubmit={handleSubmit(applyFilter)}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <InputField
                size={"small"}
                label={"Search"}
                placeholder={"Search"}
                register={register("search")}
              />
            </Grid>

            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "center" }}>
              <PrimaryButton title="Submit" type="submit" />
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
      <Box component={'div'} className="sidebar" sx={{
        height: '80vh',
        overflowY: "auto", // Ensures the scrollbar appears when content overflows
        '&::-webkit-scrollbar': {
          width: '8px', // Customize the scrollbar width
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent', // Customize the scrollbar track color
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'white', // Customize the scrollbar thumb color
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555', // Color on hover
        }
      }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            component={"img"}
            src={Images.sidebarLogo}
            sx={{ width: "130px" }}
          />


        </Box>

        <List>



          {[...navigation]?.sort((a, b) => a.order_by - b.order_by)?.map((item, index) => (
            <Fragment key={index}>
              <ListItemButton
                key={index}
                component={item.route ? Link : "div"}
                to={item.route ?? ""}
                aria-label={item?.name}
                onClick={() => {
                  if (item.childRoute.length > 0) {
                    item.childRoute && handleCollapse(item.name);
                    localStorage.setItem("currentRoute", item.name);
                  } else {
                    localStorage.setItem("currentRoute", item.name);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  px: 1,
                  py: 0,
                  mt: 1.5,
                  "&:hover": {
                    bgcolor: Colors.primary,

                    ".MuiListItemIcon-root": {
                      bgcolor: "transparent",
                    },
                  },
                }}
              >
                <ListItemIcon
                  dangerouslySetInnerHTML={{ __html: SvgIcon[item.icon] }}
                  sx={{
                    minWidth: "auto",
                    mr: 1,
                    borderRadius: "6px",
                    p: "10px",
                    svg: {
                      height: "20px",
                      width: "20px",
                      path: {
                        fill:
                          item.route === pathname ||
                            handleSubChildActive(item) ||
                            handleSubChildActive(item) === 0
                            ? "#0076BF"
                            : "",
                      },
                    },
                  }}
                ></ListItemIcon>

                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        textTransform: "capitalize",
                        fontFamily: "Public Sans",
                        color:
                          item.route === pathname ||
                            handleSubChildActive(item) ||
                            handleSubChildActive(item) === 0
                            ? "#0076BF"
                            : Colors.white,
                        fontWeight:
                          item.route === pathname ||
                            handleSubChildActive(item) ||
                            handleSubChildActive(item) === 0
                            ? 700
                            : "",
                      }}
                    >
                      {item.sidebarName ? item.sidebarName : item?.name}
                    </Typography>
                  }
                />
                {item?.children?.length > 0 &&
                  (expand.indexOf(item.name) !== -1 ||
                    item.childRoute?.indexOf(pathname) !== -1 ||
                    isAnySubChildActive(item) ? ( // Include this condition
                    <ExpandLess
                      size="small"
                      sx={{
                        color:
                          item.route === pathname ||
                            handleSubChildActive(item) ||
                            handleSubChildActive(item) === 0
                            ? Colors.primary
                            : Colors.white,
                      }}
                    />
                  ) : (
                    <ExpandMore size="small" sx={{ color: Colors.white }} />
                  ))}
              </ListItemButton>
              {item?.children?.length > 0 && (
                <Collapse
                  in={
                    expand.indexOf(item.name) !== -1 ||
                      item.childRoute?.indexOf(pathname) !== -1 ||
                      isAnySubChildActive(item) // Include this condition
                      ? true
                      : false
                  }
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.children.map((child, i) => (
                      <ListItemButton
                        key={i}
                        component={child.route ? Link : "div"}
                        to={child.route ?? ""}
                        aria-label={child?.name}
                        onClick={() => {
                          child.route && handleCollapse(child.name);
                          localStorage.setItem("currentRoute", child.name);
                        }}
                        sx={{
                          borderRadius: 2,
                          px: 1,
                          py: 0.5,
                          mt: 0.5,
                          ml: child.name == "Active Visa List" ? "10px" : "48px",
                          "&:hover": {
                            // ".MuiTypography-root": {
                            //   color: Colors.primary,
                            // },
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                textTransform: "capitalize",
                                fontFamily: "Public Sans",
                                color:
                                  child.route === pathname ||
                                    handleSubChildActive(child) ||
                                    handleSubChildActive(child) === 0
                                    ? "#0076BF"
                                    : Colors.white,
                                fontWeight:
                                  child.route === pathname ||
                                    handleSubChildActive(child) ||
                                    handleSubChildActive(child) === 0
                                    ? 700
                                    : "",
                              }}
                            >
                              {child.sidebarName
                                ? child.sidebarName
                                : child.name}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    ))}
                    <List component="div" disablePadding>
                      {item?.children?.map((subChild, i) => subChild.children?.length >
                        0 && (
                          <>
                            <Collapse
                              in={
                                expand.indexOf(subChild.name) !== -1 ||
                                  subChild.childRoute?.indexOf(pathname) !== -1
                                  ? true
                                  : false
                              }
                              timeout="auto"
                              unmountOnExit
                            >
                              <List component="div" disablePadding>
                                {subChild.children.map((child, i) => (
                                  <ListItemButton
                                    key={i}
                                    component={child.route ? Link : "div"}
                                    to={child.route ?? ""}
                                    aria-label={child?.name}
                                    onClick={() => {
                                      child.route && handleCollapse(child.name);
                                      localStorage.setItem(
                                        "currentRoute",
                                        child.name
                                      );
                                    }}
                                    sx={{
                                      borderRadius: 2,
                                      px: 1,
                                      py: 0.5,
                                      mt: 0.5,
                                      ml: "48px",
                                      "&:hover": {
                                        // ".MuiTypography-root": {
                                        //   color: Colors.primary,
                                        // },
                                      },
                                    }}
                                  >
                                    <ListItemText
                                      primary={
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            textTransform: "capitalize",
                                            fontFamily: "Public Sans",
                                            color:
                                              child.route === pathname ||
                                                handleSubChildActive(child) ||
                                                handleSubChildActive(child) === 0
                                                ? "#0076BF"
                                                : Colors.white,
                                            fontWeight:
                                              child.route === pathname ||
                                                handleSubChildActive(child) ||
                                                handleSubChildActive(child) === 0
                                                ? 700
                                                : "",
                                          }}
                                        >
                                          {child.sidebarName
                                            ? child.sidebarName
                                            : child.name}
                                        </Typography>
                                      }
                                    />
                                  </ListItemButton>
                                ))}
                              </List>
                            </Collapse>
                          </>
                        ))}
                    </List>
                  </List>
                </Collapse>
              )}
            </Fragment>
          ))}



        </List>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 2,
          ":hover": { color: Colors.white },
          position: "absolute",
          bottom: "10px",
          left: "50px",
        }}
      >
        <Button
          className="logout_Box"
          variant="contained"
          onClick={() => setConfirmationDialog(true)}
          sx={{
            color: Colors.white,
            textTransform: "none",
            borderRadius: "12px",
            p: "9px 17px 7px 17px",
            ":hover": { color: Colors.white },
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <LogoutIcon
              className="logout_Icon"
              sx={{ color: Colors.white, fontSize: "20px" }}
            />
            <Box>Logout</Box>
          </Box>
        </Button>
      </Box>
    </>
  );
}

export default Sidebar;