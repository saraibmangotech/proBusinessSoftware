"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  IconButton,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  Button,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  Container,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  CardMedia,
} from "@mui/material"
import {
  Logout,

  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  KeyboardArrowDown,
  Dashboard,
  People,
  AccountBalance,
  Receipt,
  ReceiptLong,
  BarChart,
  Balance,
  Calculate,
  ShowChart,
  Assessment,
  Person,
  Security,
  Language,
} from "@mui/icons-material"
import { useAuth } from "context/UseContext"
import { useLocation, useNavigate } from "react-router-dom"
import ConfirmationDialog from "components/Dialog/ConfirmationDialog"
import Avatar from "@mui/material/Avatar"
import AuthServices from "services/Auth"
import { ErrorToaster } from "components/Toaster"
import { Images } from "assets"
import { agencyType, getDetailWithType } from "utils"
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReportIcon from "@mui/icons-material/Assessment";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';




function DropDown({ anchorEl, openDropdown, handleClose }) {
  const [confirmationDialog, setConfirmationDialog] = useState(false)
  const { userLogout } = useAuth()
  const { user } = useAuth()
  const navigate = useNavigate()
  console.log(user);


  const handleLogout = async () => {
    const obj = {
      fcm_token: localStorage.getItem("fcmToken"),
    }
    try {
      await AuthServices.handleLogout(obj)
      navigate("/")
    } catch (error) {
      ErrorToaster(error)
    }
  }

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={openDropdown}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 0,
          sx: {
            width: 200,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.12))",
            mt: 1.5,
            borderRadius: "8px",
            ".MuiSvgIcon-root": {
              width: 20,
              height: 20,
              ml: 0.5,
              mr: 0.5,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem onClick={() => navigate("/account-setting")}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <Typography variant="body2">Account setting</Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => setConfirmationDialog(true)}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
      <ConfirmationDialog
        open={confirmationDialog}
        onClose={() => setConfirmationDialog(false)}
        message={"Are you sure you want to logout?"}
        action={() => {
          setConfirmationDialog(false)
          userLogout()
          handleLogout()
        }}
      />
    </>
  )
}

function Header() {
  // Helper function to get icon for child items
  const getChildIcon = (name) => {
    if (name.toLowerCase().includes("journal")) return <ReceiptLong fontSize="small" />
    if (name.toLowerCase().includes("account")) return <AccountBalance fontSize="small" />
    if (name.toLowerCase().includes("ledger")) return <Assessment fontSize="small" />
    if (name.toLowerCase().includes("chart")) return <BarChart fontSize="small" />
    if (name.toLowerCase().includes("balance")) return <Balance fontSize="small" />
    if (name.toLowerCase().includes("trial")) return <Calculate fontSize="small" />
    if (name.toLowerCase().includes("profit") || name.toLowerCase().includes("pnl"))
      return <ShowChart fontSize="small" />
    return <Receipt fontSize="small" /> // Default icon
  }



  // Map of navigation items to their icons
  const navIcons = {
    dashboard: <DashboardIcon fontSize="small" />,
    receptions: <SupportAgentIcon fontSize="small" />,
    sales: <PointOfSaleIcon fontSize="small" />,
    invoice: <ReceiptLongIcon fontSize="small" />,
    payment: <RequestQuoteIcon fontSize="small" />,
    cashier: <AccountBalanceWalletIcon fontSize="small" />,
    vendor: <ShoppingCartIcon fontSize="small" />,
    product: <ShoppingCartIcon fontSize="small" />,
    reports: <ReportIcon fontSize="small" />,
    accounts: <AccountBalanceIcon fontSize="small" />,
    user: <PersonIcon fontSize="small" />,
    purchase: <ShoppingBagIcon fontSize="small" />,
    role: <SecurityIcon fontSize="small" />,
    settings: <SettingsIcon fontSize="small" />
  };

  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState(null)
  const openDropdown = Boolean(anchorEl)
  const [notificationCount, setNotificationCount] = useState(2)
  const [currentPage, setCurrentPage] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(null)
  const [dropdownAnchorEl, setDropdownAnchorEl] = useState(null)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const isMobile = useMediaQuery("(max-width:960px)")
  const [navigationData, setNavigationData] = useState([])

  const handleDropdownOpen = (event, id) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      setDropdownAnchorEl(null);
    } else {
      setDropdownAnchorEl(event.currentTarget);
      setOpenDropdownId(id);
    }
  };



  // Handle dropdown menu close
  const handleDropdownClose = () => {
    setDropdownAnchorEl(null)
    setOpenDropdownId(null)
  }

  // Handle mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleSubmenuToggle = (id) => {
    setOpenSubmenu((prev) => (prev === id ? null : id));
  };


  // Check if a route is active
  const isActive = (route) => {
    if (!route) return false
    return location.pathname === route
  }

  // Check if any child route is active
  const isChildActive = (childRoutes) => {
    if (!childRoutes || childRoutes.length === 0) return false
    return childRoutes.some((route) => location.pathname === route)
  }

  // Get current page name
  useEffect(() => {
    const getCurrentPageName = () => {
      // First check direct routes
      for (const item of navigationData) {
        if (item.route && location.pathname === item.route) {
          return item.name
        }

        // Then check child routes
        if (item.children) {
          for (const child of item.children) {
            if (child?.route && location?.pathname === child?.route) {
              return child.name
            }
          }
        }
      }

      // Default to Dashboard if no match
      return location.pathname === "/dashboard" ? "Dashboard" : ""
    }

    setCurrentPage(getCurrentPageName())
  }, [location.pathname])

  useEffect(() => {
    if (user?.role_id == 1005) {

      setNavigationData([{
        id: 2,
        name: "Receptions",
        icon: "customer",
        parent_id: null,
        api: "/api/roles",
        route: "/reception-list",
        identifier: null,
        navigation: true,

      },
      {
        id: 2,
        name: "Sales",
        icon: "customer",
        parent_id: null,
        api: "/api/customers",
        route: "",
        identifier: null,
        navigation: true,
        order_by: 2,
        children: [

          {
            id: 33,
            name: "Create  Sale Request",
            icon: "customer",
            parent_id: 12,
            api: null,
            route: "/sales-receipt",
            identifier: null,
            navigation: true,
            order_by: 33,
          },
          {
            id: 33,
            name: " Sale Request List",
            icon: "customer",
            parent_id: 12,
            api: null,
            route: "/pre-sales",
            identifier: null,
            navigation: true,
            order_by: 33,
          },



        ],
      },])
    }
    else if (user?.role_id == 1003) {
      setNavigationData([
        // {
        //   id: 2,
        //   name: "Receptions",
        //   icon: "customer",
        //   parent_id: null,
        //   api: "/api/roles",
        //   route: "/reception-list",
        //   identifier: null,
        //   navigation: true,

        // },

        {
          id: 2,
          name: "Sales",
          icon: "customer",
          parent_id: null,
          api: "/api/customers",
          route: "",
          identifier: null,
          navigation: true,
          order_by: 2,
          children: [

            {
              id: 33,
              name: "Create  Sale Request",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/sales-receipt",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Sale Request List",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/pre-sales",
              identifier: null,
              navigation: true,
              order_by: 33,
            },




          ],
        },
        {
          id: 9,
          name: "Reports",
          icon: "customer",
          parent_id: null,
          api: "/api/customers",
          route: "",
          identifier: null,
          navigation: true,
          order_by: 2,
          children: [

            {
              id: 33,
              name: " Employee Service Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/snapshot-employee-service-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Employee  Sales Summary Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/employee-sales-summary-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Employee Wise Sales Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/employee-wise-sales-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },






          ],
        },

        {
          id: 13,
          name: "Settings",
          icon: "settings",
          parent_id: null,
          api: "/api/users",
          route: "/user-list",
          identifier: null,
          navigation: true,
          order_by: 13,
          childRoute: [


            {
              id: 13,
              name: "User management",
              icon: "customer",
              parent_id: null,
              api: "/api/users",
              route: "/user-list",
              identifier: null,
              navigation: true,
              order_by: 13,
              childRoute: [],
            },
          ],
          children: [


            {
              id: 14,
              name: "Service Categories",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/category-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },
            {
              id: 14,
              name: "Service Items",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/service-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },

          ],
        },


      ])

    }
    else if (user?.role_id == 5) {
      setNavigationData([
        // {
        //   id: 2,
        //   name: "Receptions",
        //   icon: "customer",
        //   parent_id: null,
        //   api: "/api/roles",
        //   route: "/reception-list",
        //   identifier: null,
        //   navigation: true,

        // },

        {
          id: 2,
          name: "Sales",
          icon: "customer",
          parent_id: null,
          api: "/api/customers",
          route: "",
          identifier: null,
          navigation: true,
          order_by: 2,
          children: [

            {
              id: 33,
              name: "Create  Sale Request",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/sales-receipt",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Sale Request List",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/pre-sales",
              identifier: null,
              navigation: true,
              order_by: 33,
            },




          ],
        },
        {
          id: 9,
          name: "Reports",
          icon: "customer",
          parent_id: null,
          api: "/api/customers",
          route: "",
          identifier: null,
          navigation: true,
          order_by: 2,
          children: [
            {
              id: 33,
              name: "Service Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/service-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },

            {
              id: 33,
              name: " Employee Service Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/snapshot-employee-service-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Employee  Sales Summary Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/employee-sales-summary-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Employee Wise Sales Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/employee-wise-sales-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },






          ],
        },

        {
          id: 13,
          name: "Settings",
          icon: "settings",
          parent_id: null,
          api: "/api/users",
          route: "/user-list",
          identifier: null,
          navigation: true,
          order_by: 13,
          childRoute: [


            {
              id: 13,
              name: "User management",
              icon: "customer",
              parent_id: null,
              api: "/api/users",
              route: "/user-list",
              identifier: null,
              navigation: true,
              order_by: 13,
              childRoute: [],
            },
          ],
          children: [


            {
              id: 14,
              name: "Service Categories",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/category-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },
            {
              id: 14,
              name: "Service Items",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/service-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },

          ],
        },


      ])

    }
    else if (user?.role_id == 1004) {
      setNavigationData([
        {
          id: 2,
          name: "Cashier",
          icon: "customer",
          parent_id: null,
          api: "/api/customers",
          route: "",
          identifier: null,
          navigation: true,
          order_by: 2,
          children: [
            {
              id: 21,
              name: "Create Paid Receipt",
              icon: "customer",
              parent_id: 2,
              api: null,
              route: "/create-paid-receipt",
              identifier: null,
              navigation: true,
              order_by: 1,
            },
            {
              id: 22,
              name: "Paid Receipt List",
              icon: "customer",
              parent_id: 2,
              api: null,
              route: "/paid-receipts",
              identifier: null,
              navigation: true,
              order_by: 2,
            },
            {
              id: 33,
              name: "Payment Vouchers",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/payment-voucher-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Receipt Vouchers",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/payment-receipt-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "IFT Vouchers",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/fund-transfer-vouchers",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Customer Payments",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/customer-payment-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
          ],
        },
        {
          id: 3,
          name: "Sales",
          icon: "customer",
          parent_id: null,
          api: "/api/customers",
          route: "",
          identifier: null,
          navigation: true,
          order_by: 3,
          children: [
            {
              id: 31,
              name: " Sale Request List ",
              icon: "customer",
              parent_id: 3,
              api: null,
              route: "/pre-sales",
              identifier: null,
              navigation: true,
              order_by: 1,
            },
          ],
        },
        {
          id: 9,
          name: "Reports",
          icon: "customer",
          parent_id: null,
          api: "/api/customers",
          route: "",
          identifier: null,
          navigation: true,
          order_by: 2,
          children: [

            {
              id: 33,
              name: "Service Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/service-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Collection Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/collection-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Vat Output Register",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/vat-output-register",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Vat Input Register",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/vat-inout-register",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Detailed Collection Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/collection-detailed-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: " Overview Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/snapshot-overview-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },



          ],
        },
      ]);

    }
    else if(user?.role_id == 3){
      setNavigationData([

        {
          id: 2,
          name: "Receptions",
          icon: "customer",
          parent_id: null,
          api: "/api/roles",
          route: "/reception-list",
          identifier: null,
          navigation: true,

        },
        {
          id: 2,
          name: "Sales",
          icon: "customer",
          parent_id: null,
          api: "/api/customers",
          route: "",
          identifier: null,
          navigation: true,
          order_by: 2,
          children: [
            // {
            //   id: 33,
            //   name: "Create  Sale Invoice Payment",
            //   icon: "customer",
            //   parent_id: 12,
            //   api: null,
            //   route: "/create-sale-invoice-payment",
            //   identifier: null,
            //   navigation: true,
            //   order_by: 33,
            // },
            {
              id: 33,
              name: "Create  Sale Request",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/sales-receipt",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: " Sale Request List",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/pre-sales",
              identifier: null,
              navigation: true,
              order_by: 33,
            },



          ],
        },
        {
          id: 8,
          name: "Cashier",
          icon: "customer",
          parent_id: null,
          api: "/api/roles",
          route: "/create-paid-receipt",
          identifier: null,
          navigation: true,
          children: [

            {
              id: 33,
              name: "Create Paid Receipt",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/create-paid-receipt",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Paid Receipt List",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/paid-receipts",
              identifier: null,
              navigation: true,
              order_by: 33,
            },

            {
              id: 33,
              name: "Void Invoice List",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/void-invoices",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Void Receipt List",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/void-receipts",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Unsettled Receipt List",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/unsettled-receipts",
              identifier: null,
              navigation: true,
              order_by: 33,
            },

          ],

        },

        {
          id: 15,
          name: "Purchase",
          icon: "customer",
          parent_id: null,
          api: null,
          route: null,
          identifier: null,
          navigation: true,
          order_by: 15,
          children: [
          
            {
              id: 1501,
              name: "Vendor Management",
              icon: "customer",
              parent_id: 15,
              api: "/api/purchase/orders",
              route: "/vendor-list",
              identifier: null,
              navigation: true,
              order_by: 1,
            },

            {
              id: 1502,
              name: "Products Management",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/product-list",
              identifier: null,
              navigation: true,
              order_by: 2,
             

            },
            {
              id: 1502,
              name: "Product Category Management",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/product-category-list",
              identifier: null,
              navigation: true,
              order_by: 2,
            },
            {
              id: 1502,
              name: "Inventory List",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/inventory-list",
              identifier: null,
              navigation: true,
              order_by: 2,
              lineBreak:true,
            },
            
            {
              id: 1502,
              name: "Purchase  Invoices",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/purchase-invoices",
              identifier: null,
              navigation: true,
              order_by: 2,
            },
            {
              id: 1502,
              name: " Add Payment",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/create-payment-invoice",
              identifier: null,
              navigation: true,
              order_by: 2,
            },
            {
              id: 1502,
              name: "Invoice Payment History ",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/purchase-payment-invoice-list",
              identifier: null,
              navigation: true,
              order_by: 2,
            },
            {
              id: 1502,
              name: "  Payment Receipts",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/payment-invoice-list",
              identifier: null,
              navigation: true,
              order_by: 2,
              lineBreak:true,
            },
            {
              id: 1502,
              name: "Prepaid Expenses",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/prepaid-expenses",
              identifier: null,
              navigation: true,
              order_by: 2,
            },
            // {
            //   id: 1502,
            //   name: "Add PE Payment",
            //   icon: "customer",
            //   parent_id: 15,
            //   api: "/api/suppliers",
            //   route: "/create-prepaid-expense-payment",
            //   identifier: null,
            //   navigation: true,
            //   order_by: 2,
            // },
            // {
            //   id: 1502,
            //   name: "PE Payment Receipts",
            //   icon: "customer",
            //   parent_id: 15,
            //   api: "/api/suppliers",
            //   route: "/prepaid-expense-payments",
            //   identifier: null,
            //   navigation: true,
            //   order_by: 2,
            //   lineBreak: true

            // },

            {
              id: 1502,
              name: "Fixed Assets",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/fixed-assets",
              identifier: null,
              navigation: true,
              order_by: 2,
            },
            // {
            //   id: 1502,
            //   name: "Add FA Payment",
            //   icon: "customer",
            //   parent_id: 15,
            //   api: "/api/suppliers",
            //   route: "/create-fixed-asset-payment",
            //   identifier: null,
            //   navigation: true,
            //   order_by: 2,
            // },
            // {
            //   id: 1502,
            //   name: "FA Payment Receipts",
            //   icon: "customer",
            //   parent_id: 15,
            //   api: "/api/suppliers",
            //   route: "/fixed-asset-payments",
            //   identifier: null,
            //   navigation: true,
            //   order_by: 2,
              
            // },


          ],
          childRoute: [
            "/purchase-orders",
            "/supplier-list"
          ],
        },
        {
          id: 9,
          name: "Reports",
          icon: "customer",
          parent_id: null,
          api: "/api/customers",
          route: "",
          identifier: null,
          navigation: true,
          order_by: 2,
          children: [

            {
              id: 33,
              name: "Service Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/service-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Collection Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/collection-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Vat Output Register",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/vat-output-register",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Vat Input Register",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/vat-input-register",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Vat Register",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/vat-register",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Detailed Collection Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/collection-detailed-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: " Category Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/snapshot-category-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Employee  Sales Summary Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/employee-sales-summary-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Employee Wise Sales Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/employee-wise-sales-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: " Overview Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/snapshot-overview-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Complete Transaction Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/complete-transaction-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: " Employee Service Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/snapshot-employee-service-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
          ],
        },
        {
          id: 12,
          name: "Accounts",
          icon: "customer",
          parent_id: null,
          api: null,
          route: null,
          identifier: null,
          navigation: true,
          order_by: 12,
          children: [

            {
              id: 33,
              name: "Create Account",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/create-account",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Create journal voucher",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/create-journal-voucher",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Credit Notes",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/credit-note-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Debit Notes",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/debit-note-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Payment Vouchers",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/payment-voucher-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Receipt Vouchers",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/payment-receipt-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 34,
              name: "Journal vouchers",
              icon: "customer",
              parent_id: 12,
              api: "/api/accounts/journalVouchers",
              route: "/journal-voucher-list",
              identifier: null,
              navigation: true,
              order_by: 34,
            },
            {
              id: 33,
              name: "Customer Payments",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/customer-payment-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Supplier Payments",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/vendor-payment-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "IFT Vouchers",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/fund-transfer-vouchers",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 35,
              name: "Account list",
              icon: "customer",
              parent_id: 12,
              api: "/api/accounts",
              route: "/account-list",
              identifier: null,
              navigation: true,
              order_by: 35,
            },
            {
              id: 36,
              name: "Account ledger",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/general-ledger",
              identifier: null,
              navigation: true,
              order_by: 36,
            },
            {
              id: 36,
              name: "Customer ledger",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/customer-ledgers",
              identifier: null,
              navigation: true,
              order_by: 36,
            },
            {
              id: 36,
              name: "Supplier ledger",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/supplier-ledgers",
              identifier: null,
              navigation: true,
              order_by: 36,
            },
            {
              id: 360,
              name: "Consolidated Supplier Statement",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/supplier-consolidated-statement",
              identifier: null,
              navigation: true,
              order_by: 36,
            },
            {
              id: 362,
              name: "Consolidated PRO Statement",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/pro-consolidated-statement",
              identifier: null,
              navigation: true,
              order_by: 36,
            },
            {
              id: 362,
              name: "Account Consolidated Statement",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/account-consolidated-statement",
              identifier: null,
              navigation: true,
              order_by: 36,
            },
            {
              id: 37,
              name: "General journal ledger",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/general-journal-ledger",
              identifier: null,
              navigation: true,
              order_by: 37,
            },
            {
              id: 38,
              name: "Chart of accounts",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/chart-of-accounts",
              identifier: null,
              navigation: true,
              order_by: 38,
            },
            {
              id: 39,
              name: "Trial balance",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/trial-balance-detailed",
              identifier: null,
              navigation: true,
              order_by: 39,
            },
            {
              id: 40,
              name: "Profit loss statement",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/profit-loss-statement",
              identifier: null,
              navigation: true,
              order_by: 40,
            },

            {
              id: 41,
              name: "Balance sheet",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/balance-sheet",
              identifier: null,
              navigation: true,
              order_by: 41,
            },

          ],
          childRoute: [
            "/create-journal-voucher",
            "/journal-voucher-list",
            "/account-list",
            "/general-ledger",
            "/general-journal-ledger",
            "/chart-of-accounts",
            "/trial-balance",
            "/profit-loss-statement",
            "/profit-loss-customer-report",
            "/balance-sheet",
            "/profit-loss-visa-report",
          ],
        },
        {
          id: 22,
          name: "HRMS",
          icon: "customer",
          parent_id: null,
          api: "/api/customers",
          route: "",
          identifier: null,
          navigation: true,
          order_by: 2,
          children: [
            {
              id: 13,
              name: "Employee management",
              icon: "customer",
              parent_id: null,
              api: "/api/users",
              route: "/employee-list",
              identifier: null,
              navigation: true,
              order_by: 13,
              childRoute: [],
            },
              {
              id: 13,
              name: "Leave management",
              icon: "customer",
              parent_id: null,
              api: "/api/users",
              route: "/leave-list",
              identifier: null,
              navigation: true,
              order_by: 13,
              childRoute: [],
            },
              {
              id: 55,
              name: "Holidays Management",
              icon: "customer",
              parent_id: 22,
              api: null,
              route: "/holidays",
              identifier: null,
              navigation: true,
              order_by: 55,
            },
             {
              id: 55,
              name: "Salary Management",
              icon: "customer",
              parent_id: 22,
              api: null,
              route: "/salary-list",
              identifier: null,
              navigation: true,
              order_by: 55,
            },
            {
              id: 55,
              name: "Attendance Report",
              icon: "customer",
              parent_id: 22,
              api: null,
              route: "/attendance-report",
              identifier: null,
              navigation: true,
              order_by: 55,
            },




          ],
        },
        {
          id: 13,
          name: "Settings",
          icon: "settings",
          parent_id: null,
          api: "/api/users",
          route: "/user-list",
          identifier: null,
          navigation: true,
          order_by: 13,
          childRoute: [
            {
              id: 33,
              name: "Customer Management",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/customer-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },

            {
              id: 13,
              name: "User management",
              icon: "customer",
              parent_id: null,
              api: "/api/users",
              route: "/user-list",
              identifier: null,
              navigation: true,
              order_by: 13,
              childRoute: [],
            },
            {
              id: 14,
              name: "Role management",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/role-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },],
          children: [
            {
              id: 33,
              name: "Customer Management",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/customer-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },

            {
              id: 14,
              name: "Service Categories",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/category-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },
            {
              id: 14,
              name: "Service Items",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/service-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },
            {
              id: 14,
              name: "Banks",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/bank-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },
            {
              id: 14,
              name: "Cards",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/card-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },
            {
              id: 13,
              name: "User management",
              icon: "customer",
              parent_id: null,
              api: "/api/users",
              route: "/user-list",
              identifier: null,
              navigation: true,
              order_by: 13,
              childRoute: [],
            },
            {
              id: 14,
              name: "Role management",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/role-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },
            {
              id: 15,
              name: "System Settings",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/system-settings",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            }

          ],
        },


      ])
    }
    else {
      setNavigationData([

        {
          id: 2,
          name: "Receptions",
          icon: "customer",
          parent_id: null,
          api: "/api/roles",
          route: "/reception-list",
          identifier: null,
          navigation: true,

        },
        {
          id: 2,
          name: "Sales",
          icon: "customer",
          parent_id: null,
          api: "/api/customers",
          route: "",
          identifier: null,
          navigation: true,
          order_by: 2,
          children: [
            // {
            //   id: 33,
            //   name: "Create  Sale Invoice Payment",
            //   icon: "customer",
            //   parent_id: 12,
            //   api: null,
            //   route: "/create-sale-invoice-payment",
            //   identifier: null,
            //   navigation: true,
            //   order_by: 33,
            // },
            {
              id: 33,
              name: "Create  Sale Request",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/sales-receipt",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: " Sale Request List",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/pre-sales",
              identifier: null,
              navigation: true,
              order_by: 33,
            },



          ],
        },
        {
          id: 8,
          name: "Cashier",
          icon: "customer",
          parent_id: null,
          api: "/api/roles",
          route: "/create-paid-receipt",
          identifier: null,
          navigation: true,
          children: [

            {
              id: 33,
              name: "Create Paid Receipt",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/create-paid-receipt",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Paid Receipt List",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/paid-receipts",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
           {
              id: 33,
              name: "Void Invoice List",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/void-invoices",
              identifier: null,
              navigation: true,
              order_by: 33,
            },

            {
              id: 33,
              name: "Void Receipt List",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/void-receipts",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Unsettled Receipt List",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/unsettled-receipts",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
          ],

        },

        {
          id: 15,
          name: "Purchase",
          icon: "customer",
          parent_id: null,
          api: null,
          route: null,
          identifier: null,
          navigation: true,
          order_by: 15,
          children: [
          
            {
              id: 1501,
              name: "Vendor Management",
              icon: "customer",
              parent_id: 15,
              api: "/api/purchase/orders",
              route: "/vendor-list",
              identifier: null,
              navigation: true,
              order_by: 1,
            },

            {
              id: 1502,
              name: "Products Management",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/product-list",
              identifier: null,
              navigation: true,
              order_by: 2,
             

            },
            {
              id: 1502,
              name: "Product Category Management",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/product-category-list",
              identifier: null,
              navigation: true,
              order_by: 2,
            },
            {
              id: 1502,
              name: "Inventory List",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/inventory-list",
              identifier: null,
              navigation: true,
              order_by: 2,
              lineBreak:true,
            },
            
            {
              id: 1502,
              name: "Purchase  Invoices",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/purchase-invoices",
              identifier: null,
              navigation: true,
              order_by: 2,
            },
            {
              id: 1502,
              name: " Add Payment",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/create-payment-invoice",
              identifier: null,
              navigation: true,
              order_by: 2,
            },
            {
              id: 1502,
              name: "Invoice Payment History ",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/purchase-payment-invoice-list",
              identifier: null,
              navigation: true,
              order_by: 2,
            },
            {
              id: 1502,
              name: "  Payment Receipts",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/payment-invoice-list",
              identifier: null,
              navigation: true,
              order_by: 2,
              lineBreak:true,
            },
            {
              id: 1502,
              name: "Prepaid Expenses",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/prepaid-expenses",
              identifier: null,
              navigation: true,
              order_by: 2,
            },
            // {
            //   id: 1502,
            //   name: "Add PE Payment",
            //   icon: "customer",
            //   parent_id: 15,
            //   api: "/api/suppliers",
            //   route: "/create-prepaid-expense-payment",
            //   identifier: null,
            //   navigation: true,
            //   order_by: 2,
            // },
            // {
            //   id: 1502,
            //   name: "PE Payment Receipts",
            //   icon: "customer",
            //   parent_id: 15,
            //   api: "/api/suppliers",
            //   route: "/prepaid-expense-payments",
            //   identifier: null,
            //   navigation: true,
            //   order_by: 2,
            //   lineBreak: true

            // },

            {
              id: 1502,
              name: "Fixed Assets",
              icon: "customer",
              parent_id: 15,
              api: "/api/suppliers",
              route: "/fixed-assets",
              identifier: null,
              navigation: true,
              order_by: 2,
            },
            // {
            //   id: 1502,
            //   name: "Add FA Payment",
            //   icon: "customer",
            //   parent_id: 15,
            //   api: "/api/suppliers",
            //   route: "/create-fixed-asset-payment",
            //   identifier: null,
            //   navigation: true,
            //   order_by: 2,
            // },
            // {
            //   id: 1502,
            //   name: "FA Payment Receipts",
            //   icon: "customer",
            //   parent_id: 15,
            //   api: "/api/suppliers",
            //   route: "/fixed-asset-payments",
            //   identifier: null,
            //   navigation: true,
            //   order_by: 2,
              
            // },


          ],
          childRoute: [
            "/purchase-orders",
            "/supplier-list"
          ],
        },
        {
          id: 9,
          name: "Reports",
          icon: "customer",
          parent_id: null,
          api: "/api/customers",
          route: "",
          identifier: null,
          navigation: true,
          order_by: 2,
          children: [

            {
              id: 33,
              name: "Service Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/service-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Collection Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/collection-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Vat Output Register",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/vat-output-register",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Vat Input Register",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/vat-input-register",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Vat Register",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/vat-register",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Detailed Collection Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/collection-detailed-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: " Category Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/snapshot-category-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Employee  Sales Summary Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/employee-sales-summary-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Employee Wise Sales Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/employee-wise-sales-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: " Overview Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/snapshot-overview-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Complete Transaction Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/complete-transaction-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: " Employee Service Report",
              icon: "customer",
              parent_id: 9,
              api: null,
              route: "/snapshot-employee-service-report",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
          ],
        },
        {
          id: 12,
          name: "Accounts",
          icon: "customer",
          parent_id: null,
          api: null,
          route: null,
          identifier: null,
          navigation: true,
          order_by: 12,
          children: [

            {
              id: 33,
              name: "Create Account",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/create-account",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Create journal voucher",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/create-journal-voucher",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Credit Notes",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/credit-note-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Debit Notes",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/debit-note-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Payment Vouchers",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/payment-voucher-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Receipt Vouchers",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/payment-receipt-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 34,
              name: "Journal vouchers",
              icon: "customer",
              parent_id: 12,
              api: "/api/accounts/journalVouchers",
              route: "/journal-voucher-list",
              identifier: null,
              navigation: true,
              order_by: 34,
            },
            {
              id: 33,
              name: "Customer Payments",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/customer-payment-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 33,
              name: "Supplier Payments",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/vendor-payment-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },

            {
              id: 33,
              name: "IFT Vouchers",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/fund-transfer-vouchers",
              identifier: null,
              navigation: true,
              order_by: 33,
            },
            {
              id: 35,
              name: "Account list",
              icon: "customer",
              parent_id: 12,
              api: "/api/accounts",
              route: "/account-list",
              identifier: null,
              navigation: true,
              order_by: 35,
            },
            {
              id: 36,
              name: "Account ledger",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/general-ledger",
              identifier: null,
              navigation: true,
              order_by: 36,
            },
            {
              id: 36,
              name: "Customer ledger",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/customer-ledgers",
              identifier: null,
              navigation: true,
              order_by: 36,
            },
            {
              id: 36,
              name: "Supplier ledger",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/supplier-ledgers",
              identifier: null,
              navigation: true,
              order_by: 36,
            },
            {
              id: 360,
              name: "Consolidated Supplier Statement",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/supplier-consolidated-statement",
              identifier: null,
              navigation: true,
              order_by: 36,
            },
            {
              id: 362,
              name: "Consolidated PRO Statement",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/pro-consolidated-statement",
              identifier: null,
              navigation: true,
              order_by: 36,
            },
            {
              id: 362,
              name: "Account Consolidated Statement",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/account-consolidated-statement",
              identifier: null,
              navigation: true,
              order_by: 36,
            },
            {
              id: 37,
              name: "General journal ledger",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/general-journal-ledger",
              identifier: null,
              navigation: true,
              order_by: 37,
            },
            {
              id: 38,
              name: "Chart of accounts",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/chart-of-accounts",
              identifier: null,
              navigation: true,
              order_by: 38,
            },
            {
              id: 39,
              name: "Trial balance",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/trial-balance-detailed",
              identifier: null,
              navigation: true,
              order_by: 39,
            },
            {
              id: 40,
              name: "Profit loss statement",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/profit-loss-statement",
              identifier: null,
              navigation: true,
              order_by: 40,
            },

            {
              id: 41,
              name: "Balance sheet",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/balance-sheet",
              identifier: null,
              navigation: true,
              order_by: 41,
            },

          ],
          childRoute: [
            "/create-journal-voucher",
            "/journal-voucher-list",
            "/account-list",
            "/general-ledger",
            "/general-journal-ledger",
            "/chart-of-accounts",
            "/trial-balance",
            "/profit-loss-statement",
            "/profit-loss-customer-report",
            "/balance-sheet",
            "/profit-loss-visa-report",
          ],
        },
        {
          id: 22,
          name: "HRMS",
          icon: "customer",
          parent_id: null,
          api: "/api/customers",
          route: "",
          identifier: null,
          navigation: true,
          order_by: 2,
          children: [
            {
              id: 13,
              name: "Employee management",
              icon: "customer",
              parent_id: null,
              api: "/api/users",
              route: "/employee-list",
              identifier: null,
              navigation: true,
              order_by: 13,
              childRoute: [],
            },
             {
              id: 13,
              name: "Leave management",
              icon: "customer",
              parent_id: null,
              api: "/api/users",
              route: "/leave-list",
              identifier: null,
              navigation: true,
              order_by: 13,
              childRoute: [],
            },
            {
              id: 55,
              name: "Holidays Management",
              icon: "customer",
              parent_id: 22,
              api: null,
              route: "/holidays",
              identifier: null,
              navigation: true,
              order_by: 55,
            },
             {
              id: 55,
              name: "Salary Management",
              icon: "customer",
              parent_id: 22,
              api: null,
              route: "/salary-list",
              identifier: null,
              navigation: true,
              order_by: 55,
            },
            {
              id: 55,
              name: "Attendance Report",
              icon: "customer",
              parent_id: 22,
              api: null,
              route: "/attendance-report",
              identifier: null,
              navigation: true,
              order_by: 55,
            },




          ],
        },
        {
          id: 13,
          name: "Settings",
          icon: "settings",
          parent_id: null,
          api: "/api/users",
          route: "/user-list",
          identifier: null,
          navigation: true,
          order_by: 13,
          childRoute: [
            {
              id: 33,
              name: "Customer Management",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/customer-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },

            {
              id: 13,
              name: "User management",
              icon: "customer",
              parent_id: null,
              api: "/api/users",
              route: "/user-list",
              identifier: null,
              navigation: true,
              order_by: 13,
              childRoute: [],
            },
            {
              id: 14,
              name: "Role management",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/role-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },],
          children: [
            {
              id: 33,
              name: "Customer Management",
              icon: "customer",
              parent_id: 12,
              api: null,
              route: "/customer-list",
              identifier: null,
              navigation: true,
              order_by: 33,
            },

            {
              id: 14,
              name: "Service Categories",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/category-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },
            {
              id: 14,
              name: "Service Items",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/service-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },
            {
              id: 14,
              name: "Banks",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/bank-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },
            {
              id: 14,
              name: "Cards",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/card-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },
            {
              id: 13,
              name: "User management",
              icon: "customer",
              parent_id: null,
              api: "/api/users",
              route: "/user-list",
              identifier: null,
              navigation: true,
              order_by: 13,
              childRoute: [],
            },
            {
              id: 14,
              name: "Role management",
              icon: "customer",
              parent_id: null,
              api: "/api/roles",
              route: "/role-list",
              identifier: null,
              navigation: true,
              order_by: 14,
              children: [],
              childRoute: [],
            },
           

          ],
        },


      ])

    }

  }, [user])
  console.log("openDropdownId:", openDropdownId);
  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="h6" sx={{ color: "#2c3e50", fontWeight: "500" }}>
          Navigation
        </Typography>
      </Box>
      <Divider />

      <List>
        {/* Dashboard Link */}
        <ListItem
          button
          onClick={() => {
            navigate("/dashboard")
            setMobileOpen(false)
          }}
          selected={location.pathname === "/dashboard"}
          sx={{
            backgroundColor: location.pathname === "/dashboard" ? "rgba(52, 152, 219, 0.08)" : "transparent",
            "&.Mui-selected": {
              backgroundColor: "rgba(52, 152, 219, 0.08)",
              color: "#3498db",
              "&:hover": {
                backgroundColor: "rgba(52, 152, 219, 0.12)",
              },
            },
            "&:hover": {
              backgroundColor: "rgba(52, 152, 219, 0.04)",
            },
          }}
        >
          <ListItemIcon>{navIcons["dashboard"]}</ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ fontWeight: location.pathname === "/dashboard" ? 500 : 400 }}>
                Dashboard
              </Typography>
            }
          />
        </ListItem>

        {/* Navigation Items */}
        {navigationData.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && (
              <Divider orientation="vertical" flexItem sx={{ mx: 0, backgroundColor: "#5a6785" }} />
            )}

            {item.children ? (
                // Item with dropdown
                <Box>
                <Button
                  onClick={(e) => handleDropdownOpen(e, item.id)}
                  sx={{
                  color: isChildActive(item.childRoute) ? "#6092d5" : "white",
                  fontWeight: isChildActive(item.childRoute) ? "bold" : 400,
                  textTransform: "none",
                  fontSize: "14px",
                  px: 2,
                  py: 1.5,
                  borderRadius: 0,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                  }}
                  startIcon={navIcons[item.name.toLowerCase()] || <AccountBalance fontSize="small" />}
                  endIcon={<KeyboardArrowDown />}
                >
                  {item.name.toUpperCase()}
                </Button>

                <Popper
                  open={openDropdownId === item.id}
                  anchorEl={openDropdownId === item.id ? dropdownAnchorEl : null}
                  role={undefined}
                  placement="bottom-start"
                  transition
                  disablePortal={true}
                  style={{ zIndex: 111 }}
                >
                  {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    timeout={300}
                    style={{
                    transformOrigin: placement === "bottom-start" ? "left top" : "left bottom",
                    }}
                  >
                    <Paper
                    elevation={2}
                    sx={{
                      "&.MuiPaper-root": {
                      maxHeight: "350px !important",
                      overflowY: "scroll",
                      },
                      mt: 10,
                    }}
                    >
                    <MenuList autoFocusItem={openDropdownId === item.id}>
                      {item.children.map((child) => (
                      <React.Fragment key={child.id}>
                        <MenuItem
                        component="a"
                        href={child.route}
                        target="_self"
                        sx={{
                          backgroundColor: isActive(child.route)
                          ? "rgba(52, 152, 219, 0.08)"
                          : "transparent",
                          color: isActive(child.route) ? "#6092d5" : "#5d6778",
                          fontWeight: isActive(child.route) ? 500 : 400,
                          fontSize: "14px",
                          py: 1,
                          whiteSpace: "normal", // 👈 Allows wrapping
                          wordBreak: "break-word", // 👈 Prevents overflow
                          "&:hover": {
                          backgroundColor: "rgba(52, 152, 219, 0.04)",
                          },
                        }}
                        >
                        <ListItemIcon>{getChildIcon(child.name)}</ListItemIcon>
                        {child.name }
                        </MenuItem>
                      </React.Fragment>
                      ))}
                    </MenuList>
                    </Paper>
                  </Grow>
                  )}
                </Popper>
                </Box>
              ) : (
              // Single item
              <Button
                component="a"
                href={item.route}
                sx={{
                  color: isActive(item.route) ? "#6092d5" : "white",
                  fontWeight: isActive(item.route) ? "bold" : 400,
                  textTransform: "none",
                  fontSize: "14px",
                  px: 2,
                  py: 1.5,
                  borderRadius: 0,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
                startIcon={navIcons[item.name.toLowerCase()] || <People fontSize="small" />}
              >
                {item.name.toUpperCase()}
              </Button>
            )}
          </React.Fragment>
        ))}


      </List>
    </Box>
  )



  return (
    <>
      {/* Top Bar with Logo and User Info */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: "white",
          boxShadow: "none",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: "64px", justifyContent: "space-between" }}>
            {/* Logo */}
            <Box sx={{ width: "150px" }}>
              <CardMedia image={Images.mainLogo} sx={{ height: "100px" }} />
            </Box>
            <Box sx={{ width: "150px" }}>
              <CardMedia image={agencyType[process.env.REACT_APP_TYPE]?.imageUrl} sx={{ height: "90px" }} />
            </Box>
            {/* <Box sx={{ flexGrow: 1 }} /> */}

            {/* Right side - Language and User */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Language Selector */}
              <IconButton sx={{ p: 0 }}>
                <Language sx={{ color: "#666" }} />
              </IconButton>

              {/* User Avatar */}
              <Box
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  py: 1,
                  px: 1,
                  borderRadius: "6px",
                  "&:hover": {
                    backgroundColor: "rgba(52, 152, 219, 0.04)",
                  },
                }}
              >
                <Typography
                  sx={{
                    mr: 1,
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Hi, {user?.name || "Admin"}
                </Typography>
                <Avatar
                  className="avatar-image"
                  alt={user?.name}
                  sx={{
                    width: 36,
                    height: 36,
                    border: "2px solid #f0f0f0",
                  }}
                  src={process.env.REACT_APP_IMAGE_BASE_URL + user?.picture}
                />
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Navigation Bar */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#001f3f", // Exact Navy Blue
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
        }}

      >
        <ClickAwayListener onClickAway={handleDropdownClose}>


          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ minHeight: "48px" }}>
              {/* Mobile Menu Icon */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, color: "white" }}
                >
                  <MenuIcon />
                </IconButton>
              )}

              {/* Desktop Navigation */}
              {!isMobile && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  {/* Dashboard Button */}
                  <Button
                    onClick={() => navigate("/dashboard")}
                    sx={{
                      color: location.pathname === "/dashboard" ? "#6092d5" : "white",
                      fontWeight: location.pathname === "/dashboard" ? "bold" : 400,
                      textTransform: "none",
                      fontSize: "14px",
                      px: 2,
                      py: 1.5,
                      borderRadius: 0,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                    startIcon={navIcons["dashboard"]}
                  >
                    DASHBOARD
                  </Button>

                  <Divider orientation="vertical" flexItem sx={{ mx: 0, backgroundColor: "#5a6785" }} />

                  {navigationData.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {index > 0 && (
                        <Divider orientation="vertical" flexItem sx={{ mx: 0, backgroundColor: "#5a6785" }} />
                      )}

                      {item.children ? (
                        // Item with dropdown
                        <Box>
                          <Button
                          onClick={(e) => handleDropdownOpen(e, item.id)}
                          sx={{
                            color: isChildActive(item.childRoute) ? "#6092d5" : "white",
                            fontWeight: isChildActive(item.childRoute) ? "bold" : 400,
                            textTransform: "none",
                            fontSize: "14px",
                            px: 2,
                            py: 1.5,
                            borderRadius: 0,
                            "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                          startIcon={navIcons[item.name.toLowerCase()] || <AccountBalance fontSize="small" />}
                          endIcon={<KeyboardArrowDown />}
                          >
                          {item.name.toUpperCase()}
                          </Button>

                          <Popper
                          open={openDropdownId === item.id}
                          anchorEl={openDropdownId === item.id ? dropdownAnchorEl : null}
                          role={undefined}
                          placement="bottom-start"
                          transition
                          disablePortal={true}
                          style={{ zIndex: 111 }}
                          >
                          {({ TransitionProps, placement }) => (
                            <Grow
                            {...TransitionProps}
                            timeout={300}
                            style={{
                              transformOrigin: placement === "bottom-start" ? "left top" : "left bottom",
                            }}
                            >
                            <Paper
                              elevation={2}
                              sx={{
                              mt: 1,
                              width: "fit-content",
                              maxHeight: 350,
                              borderRadius: "8px",
                              overflow: "auto",
                              }}
                            >
                              <MenuList autoFocusItem={openDropdownId === item.id}>
                              {item.children.map((child) => (
                                <React.Fragment key={child.id}>
                                <MenuItem
                                  component="a"
                                  href={child.route}
                                  target="_self"
                                  sx={{
                                  backgroundColor: isActive(child.route)
                                    ? "rgba(52, 152, 219, 0.08)"
                                    : "transparent",
                                  color: isActive(child.route) ? "#6092d5" : "#5d6778",
                                  fontWeight: isActive(child.route) ? 500 : 400,
                                  fontSize: "14px",
                                  py: 1,
                                  whiteSpace: "nowrap",
                                  "&:hover": {
                                    backgroundColor: "rgba(52, 152, 219, 0.04)",
                                  },
                                  }}
                                >
                                  <ListItemIcon>{getChildIcon(child.name)}</ListItemIcon>
                                  {child.name}
                                </MenuItem>
                                {child.lineBreak && <hr style={{ margin: "8px 0", borderColor: "#e0e0e0" }} />}
                                </React.Fragment>
                              ))}
                              </MenuList>
                            </Paper>
                            </Grow>
                          )}
                          </Popper>
                        </Box>
                        ) : (
                        // Single item
                        <Button
                          component="a"
                          href={item.route}
                          sx={{
                            color: isActive(item.route) ? "#6092d5" : "white",
                            fontWeight: isActive(item.route) ? "bold" : 400,
                            textTransform: "none",
                            fontSize: "14px",
                            px: 2,
                            py: 1.5,
                            borderRadius: 0,
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                          startIcon={navIcons[item.name.toLowerCase()] || <People fontSize="small" />}
                        >
                          {item.name.toUpperCase()}
                        </Button>
                      )}
                    </React.Fragment>
                  ))}




                </Box>
              )}
            </Toolbar>
          </Container>
        </ClickAwayListener>
      </AppBar>


      {/* Mobile Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* User Dropdown Menu */}
      <DropDown anchorEl={anchorEl} openDropdown={openDropdown} handleClose={() => setAnchorEl(null)} />
    </>
  )
}

export default Header
