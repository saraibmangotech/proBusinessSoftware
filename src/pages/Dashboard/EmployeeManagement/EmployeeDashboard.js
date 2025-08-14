"use client"

import { Fragment, useEffect, useState } from "react"
import { Box, Card, CardContent, Grid, Typography, Paper, Avatar, Chip, Button, Stack } from "@mui/material"
import styled from "@emotion/styled"
import { makeStyles } from "@mui/styles"
import { useNavigate } from "react-router-dom"
import { BuyerRegistrationIcon, Images, ReceivedBuyerIdIcon, RequestBuyerIdIcon } from "assets"
import Colors from "assets/Style/Colors"
import { useAuth } from "context/UseContext"
import Storage from "utils/Storage"
import EventIcon from "@mui/icons-material/Event"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import HourglassTopIcon from "@mui/icons-material/HourglassTop"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Sector,
} from "recharts"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import SystemServices from "services/System"
import { showErrorToast } from "components/NewToaster"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import DescriptionIcon from "@mui/icons-material/Description"
import SendIcon from "@mui/icons-material/Send"
import TaskAltIcon from "@mui/icons-material/TaskAlt"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import NetworkWifiIcon from "@mui/icons-material/NetworkWifi";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import {
  EmailOutlined,
  PhoneOutlined,
  CalendarTodayOutlined,
  AttachMoneyOutlined,
  CheckCircleOutline,
  WarningAmberOutlined,
  CancelOutlined,
  DescriptionOutlined,
  LocationOnOutlined,
  PersonOutline,
  CreditCardOutlined,
  WorkOutline,
  HourglassEmptyOutlined,
  EventNoteOutlined,
  ScheduleOutlined,
} from "@mui/icons-material"

import { VisibilityOutlined } from "@mui/icons-material"
import CustomerServices from "services/Customer"
import moment from "moment"
// Navy blue theme colors
const THEME = {
  primary: "#001f3f", // Dark navy blue (primary color)
  secondary: "#0077cc", // Medium blue
  accent1: "#00a8cc", // Teal/cyan
  accent2: "#ffc107", // Gold/yellow for contrast
  light: "#f5f7fa", // Light gray for backgrounds
  mediumGray: "#8d99ae", // Medium gray for secondary text
  darkGray: "#2b2d42", // Dark gray for text
  success: "#00b894", // Green for positive trends
  error: "#ff7675", // Red for negative trends
  cardBg: "#0a2744", // Slightly lighter navy for cards
  chartColors: ["#0077cc", "#00a8cc", "#ffc107", "#ff7675", "#00b894"],
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  boxShadow: "none",
  borderRadius: 0,
}))

const useStyle = makeStyles({
  step: {
    flex: 1,
    display: "flex",
    gap: "20px",
    alignItem: "center",
    justifyContent: "space-between",
    "& .MuiStepLabel-label": {
      color: `${Colors.charcoalGrey} !important`,
      fontSize: { md: "16px" },
    },
  },
  customDivider: {
    background: `linear-gradient(to right, ${Colors.grey} 50%, ${Colors.yellow} 50%)`,
    height: 2,
  },
  dashboardCard: {
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 20px rgba(0,0,0,0.2) !important",
    },
  },
  welcomeSection: {
    background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.secondary} 100%)`,
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
    color: "white",
  },
  navyCard: {
    backgroundColor: THEME.cardBg,
    color: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    "& .recharts-cartesian-grid-horizontal line, & .recharts-cartesian-grid-vertical line": {
      stroke: "#e0e0e0",
    },
    "& .recharts-text": {
      fill: THEME.darkGray,
    },
  },
})

const StepIconRoot = styled("div")(({ theme, ownerState }) => ({
  backgroundColor: Colors.iron,
  zIndex: 1,
  color: Colors.charcoalGrey,
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  svg: {
    width: "auto",
    height: "25px",
    path: {
      fill: Colors.smokeyGrey,
    },
  },
}))

function CustomStepIcon(props) {
  const { active, completed } = props

  const icons = {
    1: <BuyerRegistrationIcon />,
    2: <RequestBuyerIdIcon />,
    3: <ReceivedBuyerIdIcon />,
  }

  return (
    <StepIconRoot ownerState={{ completed, active }} className={"icon-wrapper"}>
      {icons[String(props.icon)]}
    </StepIconRoot>
  )
}



// Sample data for charts
const salesData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 2000 },
  { name: "Apr", value: 2780 },
  { name: "May", value: 1890 },
  { name: "Jun", value: 2390 },
  { name: "Jul", value: 3490 },
  { name: "Aug", value: 4000 },
  { name: "Sep", value: 4500 },
  { name: "Oct", value: 5200 },
  { name: "Nov", value: 4800 },
  { name: "Dec", value: 6000 },
]

let categoryData = [

]

const employeeData = [
  { name: "Team A", value: 120 },
  { name: "Team B", value: 180 },
  { name: "Team C", value: 80 },
  { name: "Team D", value: 56 },
]

const revenueData = [
  { name: "Jan", sales: 4000, expenses: 2400 },
  { name: "Feb", sales: 3000, expenses: 1398 },
  { name: "Mar", sales: 2000, expenses: 9800 },
  { name: "Apr", sales: 2780, expenses: 3908 },
  { name: "May", sales: 1890, expenses: 4800 },
  { name: "Jun", sales: 2390, expenses: 3800 },
  { name: "Jul", sales: 3490, expenses: 4300 },

]
const revenueData2 = [
  { name: "Jan", sales: 4000, text: 2400 },
  { name: "Feb", sales: 3000, text: 1398 },
  { name: "Mar", sales: 2000, text: 9800 },
  { name: "Apr", sales: 2780, text: 3908 },
  { name: "May", sales: 1890, text: 4800 },
  { name: "Jun", sales: 2390, text: 3800 },
  { name: "Jul", sales: 3490, text: 4300 },

]
const revenueData3 = [
  { name: "Jan", credit: 5000, paid: 3200 },
  { name: "Feb", credit: 4200, paid: 3000 },
  { name: "Mar", credit: 6100, paid: 4500 },
  { name: "Apr", credit: 4800, paid: 3900 },
  { name: "May", credit: 5300, paid: 4700 },
  { name: "Jun", credit: 4600, paid: 4300 },
  { name: "Jul", credit: 5800, paid: 5500 },
];

function EmployeeDashboard() {
  const classes = useStyle()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getStorageItem } = Storage()
  const [employeeDetail, setEmployeeDetail] = useState(null)
    const [employeeDetail2, setEmployeeDetail2] = useState(null)
  const userJourney = getStorageItem("journey")
  const [renderState, setRenderState] = useState(false)
  const [stepperLabel, setStepperLabel] = useState([])
  const [statsDetail, setStatsDetail] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [catData, setCatData] = useState([])
  const [employeess, setEmployeess] = useState([])
  const [currentState, setCurrentState] = useState((user?.role_id == 1000 || user?.role_id == 3 || user?.role_id == 1001) ? 'Admin' : user?.role_id == 1004 ? 'Cashier' : user?.role_id == 1003 ? 'Typist' : '')
  const [shift, setShift] = useState(null)
  const [employeeAttendance, setEmployeeAttendance] = useState(null)
  const pdfContent = Images?.guidelinePDF

  const statsData = [
    {
      title: "Total Service Charges",
      value: parseFloat(statsDetail?.totalServiceCharges).toFixed(2),
      icon: <PeopleAltIcon />,
      color: THEME.accent1,
      bgColor: THEME.accent1,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Invoices",
      value: statsDetail?.detailedStats?.totalSalesReceipts,
      icon: <DescriptionIcon />,
      color: THEME.secondary,
      bgColor: THEME.secondary,
      trend: "+9%",
      trendUp: true,
    },
    {
      title: "Total Services Sold",
      value: statsDetail?.detailedStats?.totalServiceCount,
      icon: <SendIcon />,
      color: THEME.accent2,
      bgColor: THEME.accent2,
      trend: "",
      trendUp: true,
    },
    {
      title: "Total Collection",
      value: statsDetail?.overviewReport?.totalAmount?.toFixed(2),
      icon: <TaskAltIcon />,
      color: THEME.success,
      bgColor: THEME.success,
      trend: "-2%",
      trendUp: true,
    },
  ];

  const statsData2 = [
    {
      title: "Total Sales",
      value: parseFloat(statsDetail?.totalSalesAmount || 0).toFixed(2),
      icon: <PeopleAltIcon />,
      color: THEME.secondary,
      bgColor: THEME.secondary,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Today's Invoices",
      value: statsDetail?.todayInvoiceCount ?? 0, // assuming it's an integer
      icon: <DescriptionIcon />,
      color: THEME.secondary,
      bgColor: THEME.secondary,
      trend: "+6%",
      trendUp: true,
    },
    {
      title: "Monthly Sales",
      value: parseFloat(statsDetail?.monthlySalesAmount || 0).toFixed(2),
      icon: <SendIcon />,
      color: THEME.accent1,
      bgColor: THEME.accent1,
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Monthly Invoices",
      value: statsDetail?.monthlyInvoiceCount ?? 0,
      icon: <ReceiptLongIcon />,
      color: THEME.accent2,
      bgColor: THEME.accent2,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Monthly Commission",
      value: parseFloat(statsDetail?.monthlyCommissionAmount || 0).toFixed(2),
      icon: <TaskAltIcon />,
      color: THEME.success,
      bgColor: THEME.success,
      trend: "+3%",
      trendUp: true,
    },
  ];


  const statsData3 = [
    {
      title: "Card Payments Collected",
      value: parseFloat(statsDetail?.overviewReport?.totalCard || 0).toFixed(2),
      icon: <PaymentsIcon />,
      color: THEME.secondary,
      bgColor: THEME.secondary,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Cash Payments Collected",
      value: parseFloat(statsDetail?.overviewReport?.totalCash || 0).toFixed(2),
      icon: <AttachMoneyIcon />,
      color: THEME.secondary,
      bgColor: THEME.secondary,
      trend: "+6%",
      trendUp: true,
    },
    {
      title: "Network/Online Transfers",
      value: parseFloat(statsDetail?.overviewReport?.totalNetwork || 0).toFixed(2),
      icon: <NetworkWifiIcon />,
      color: THEME.accent1,
      bgColor: THEME.accent1,
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Total Collection (All Modes)",
      value: parseFloat(statsDetail?.overviewReport?.totalAmount || 0).toFixed(2),
      icon: <AccountBalanceWalletIcon />,
      color: THEME.accent2,
      bgColor: THEME.accent2,
      trend: "+8%",
      trendUp: true,
    },
  ];


  const handleDownload = () => {
    const a = document.createElement("a")
    a.href = ".." + pdfContent
    console.log(a.href)
    a.target = "blank"
    a.download = "guideline.pdf"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const getIconAndColor = (key) => {
    switch (key) {
      case "passport":
        return { icon: <DescriptionOutlined sx={{ mr: 1, color: "#4CAF50" }} />, color: "#e8f5e9", statusColor: "#4CAF50" };
      case "emirates_id":
        return { icon: <CreditCardOutlined sx={{ mr: 1, color: "#FF9800" }} />, color: "#fff3e0", statusColor: "#FF9800" };
      case "visa_copy":
        return { icon: <DescriptionOutlined sx={{ mr: 1, color: "#F44336" }} />, color: "#ffebee", statusColor: "#F44336" };
      case "labor":
        return { icon: <WorkOutline sx={{ mr: 1, color: "#4CAF50" }} />, color: "#e8f5e9", statusColor: "#4CAF50" };
      default:
        return { icon: <DescriptionOutlined sx={{ mr: 1 }} />, color: "#f0f0f0", statusColor: "#999" };
    }
  };

  const getStatus = (expiryDate) => {
    if (!expiryDate) return { label: "Not Set", color: "#999", icon: <WarningAmberOutlined sx={{ fontSize: 16 }} /> };

    const today = moment();
    const expiry = moment(expiryDate);
    const diff = expiry.diff(today, "days");

    if (diff >= 60) return { label: "Valid", color: "#4CAF50", icon: <CheckCircleOutline sx={{ fontSize: 16 }} /> };
    if (diff >= 0) return { label: "Expiring Soon", color: "#FF9800", icon: <WarningAmberOutlined sx={{ fontSize: 16 }} /> };
    return { label: "Expired", color: "#F44336", icon: <CancelOutlined sx={{ fontSize: 16 }} /> };
  };


  useEffect(() => {
    if (userJourney) {
      const { registration, request, received } = userJourney
      const journey = [
        { label: "Registration", status: registration?.status, color: registration?.color },
        { label: "Request For Buyer ID", status: request?.status, color: request?.color },
        { label: "Buyer ID Received", status: received?.status, color: received?.color },
      ]
      setStepperLabel(journey)
    }
    if (localStorage.getItem("operationsToken")) {
      setRenderState(localStorage.getItem("operationsToken"))
    }
  }, [])

  const getStats = async (search) => {
    try {
      const params = {
        page: 1,
        limit: 999999,
        search: search,
      }
      const { data } = await SystemServices.getStats(params)
      console.log(data?.detailedStats?.resultByCategory)
      const result = data?.detailedStats?.resultByCategory?.map(item => ({
        name: item.category_name,
        value: parseFloat(item.item_count)
      }));
      const result2 = data?.detailedStats?.resultByTypist?.map(item => ({
        name: item.creator_name,
        value: parseFloat(item.item_count)
      }));
      console.log(result);
      setEmployeess(result2)
      setCatData(result)

      console.log(result);
      setStatsDetail(data)

    } catch (error) {
      showErrorToast(error)
    }
  }

  const getStatusCheck = (record) => {
    if (record.isHoliday) return { label: "Holiday", color: "error" }
    if (record.isWeekend) return { label: "Weekend", color: "default" }
    if (record.present) return { label: "Present", color: "success" }
    if (record.absent) return { label: "Absent", color: "error" }
    if (record.onLeave) return { label: "On Leave", color: "info" }
    return { label: "No Record", color: "default" }
  }

  const getEmployeeAttendance = async (id) => {
    try {
      const params = {
        user_id: id,
        from_date: moment().subtract(6, 'days').format("MM-DD-YYYY"),
        to_date: moment().format("MM-DD-YYYY"),
      }
      const { data } = await SystemServices.getEmployeeAttendance(params);
      console.log(data);
      setEmployeeAttendance(data?.daily)


    } catch (error) {
      console.log(error)
    }
  }

  const getData = async () => {
    try {
      let params = { user_id: user?.id };
      const { data } = await CustomerServices.getEmployeeDetail(params);
      let data2 = data?.employee
      setEmployeeDetail(data2)
      getShiftDetail(data2?.shift_id)
      getEmployeeAttendance(user?.id)


    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };
  const getShiftDetail = async (id) => {


    try {

      let params = {
        page: 1,
        limit: 999999,

        id: id

      }

      const { data } = await SystemServices.getShiftDetail(params)
      setShift(data?.shifts)

    } catch (error) {
      showErrorToast(error)
    }
  }
  const getEmployeeDetail = async (id) => {


    try {
      let params = { user_id: user?.id}


      const { data } = await CustomerServices.getLeaveDetail(params)
      console.log(data);
      setEmployeeDetail2(data?.leaves)



    } catch (error) {
      showErrorToast(error)
    } finally {
      // setLoader(false)
    }
  }
  useEffect(() => {
    getStats()
    getData()
    getEmployeeDetail()
  }, [])

  const onPieEnter = (_, index) => {
    setActiveIndex(index)
  }

  return (
    <Box sx={{ p: 4, bgcolor: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header Section */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          background: "linear-gradient(to right, #6A0DAD, #4169E1)", // Purple to Royal Blue gradient
          color: "white",
          p: 4,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Grid container spacing={4} alignItems="center">
          {/* Profile Info */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: "rgba(255,255,255,0.2)" }}>
                <PersonOutline sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Welcome back, {employeeDetail?.user?.name}! 👋
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {employeeDetail?.designation}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Employee ID: {employeeDetail?.employee_code}
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: "flex", alignItems: "center", opacity: 0.9 }}>
                  <EmailOutlined sx={{ mr: 1, fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" display="block">
                      Email
                    </Typography>
                    <Typography variant="body2">{employeeDetail?.user?.email}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: "flex", alignItems: "center", opacity: 0.9 }}>
                  <PhoneOutlined sx={{ mr: 1, fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" display="block">
                      Mobile
                    </Typography>
                    <Typography variant="body2">{employeeDetail?.user?.phone}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: "flex", alignItems: "center", opacity: 0.9 }}>
                  <CalendarTodayOutlined sx={{ mr: 1, fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" display="block">
                      Joined
                    </Typography>
                    <Typography variant="body2">{moment(employeeDetail?.date_of_joining).format('DD-MM-YYYY')}</Typography>
                  </Box>
                </Box>
              </Grid>
              {/* <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: "flex", alignItems: "center", opacity: 0.9 }}>
                      <AttachMoneyOutlined sx={{ mr: 1, fontSize: 18 }} />
                      <Box>
                        <Typography variant="caption" display="block">
                          Salary
                        </Typography>
                        <Typography variant="body2">AED 4,500</Typography>
                      </Box>
                    </Box>
                  </Grid> */}
            </Grid>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Box sx={{ borderLeft: { md: "1px solid rgba(255,255,255,0.3)" }, pl: { md: 4 }, pt: { xs: 3, md: 0 } }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Quick Stats
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Hours
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: "right" }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    N/A
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Completed Shifts
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: "right" }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    N/A
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                   Annual Leave Balance
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: "right" }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {employeeDetail2?.annual_leave_balance}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Document Status & Expiry Tracking */}
      <Card sx={{ mb: 4, borderRadius: 3, p: 3, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <DescriptionOutlined sx={{ mr: 1, color: "#6A0DAD" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
            Document Status & Expiry Tracking
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Monitor your important document expiry dates
        </Typography>

        <Grid container spacing={2}>
          {employeeDetail?.documents?.map((doc, index) => {
            const { icon, color: bgColor, statusColor } = getIconAndColor(doc.key);
            const { label, color: chipColor, icon: chipIcon } = getStatus(doc.expiry_date);
            const daysLeft = doc.expiry_date
              ? moment(doc.expiry_date).diff(moment(), "days")
              : null;

            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ borderRadius: 2, p: 2, bgcolor: bgColor, boxShadow: "none" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {icon}
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                        {doc.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={label}
                      icon={chipIcon}
                      sx={{
                        bgcolor: chipColor,
                        color: "white",
                        height: 24,
                        "& .MuiChip-icon": { color: "white" },
                      }}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block">
                    Expires:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "medium", mb: 1 }}>
                    {doc.expiry_date ? moment(doc.expiry_date).format("YYYY-MM-DD") : "N/A"}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" display="block">
                    Days left:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color: chipColor,
                      mb: 2,
                    }}
                  >
                    {doc.expiry_date
                      ? daysLeft >= 0
                        ? `${daysLeft} days`
                        : `${Math.abs(daysLeft)} days ago`
                      : "N/A"}
                  </Typography>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityOutlined />}
                    sx={{
                      borderColor: chipColor,
                      color: chipColor,
                      "&:hover": { borderColor: chipColor, bgcolor: bgColor },
                      width: "100%",
                    }}
                    onClick={() => {
                      if (doc.path) window.open(`${process.env.REACT_APP_IMAGE_BASE_URL_NEW}${doc.path}`, "_blank");
                    }}
                    disabled={!doc.path}
                  >
                    View Document
                  </Button>
                </Card>
              </Grid>
            );
          })}
        </Grid>

      </Card>

      {/* Current Shift Status */}
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Card sx={{ borderRadius: 3, p: 3, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <HourglassEmptyOutlined sx={{ mr: 1, color: "#6A0DAD" }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                Current Shift Status
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your active shift details and progress
            </Typography>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <EventNoteOutlined sx={{ mr: 1, color: "#666" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                          {moment(shift?.created_at).format('DD-MM-YYYY')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ScheduleOutlined sx={{ mr: 1, color: "#666" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Time
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                          {moment().startOf("day").add(shift?.start_time, "minutes").format("hh:mm A")} - {moment().startOf("day").add(shift?.end_time, "minutes").format("hh:mm A")}


                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                </Grid>
              </Grid>


            </Grid>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ borderRadius: 3, p: 3, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <HourglassEmptyOutlined sx={{ mr: 1, color: "#6A0DAD" }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                Today Shift Status
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your today shift details and progress
            </Typography>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <EventNoteOutlined sx={{ mr: 1, color: "#666" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                          {moment(shift?.created_at).format('DD-MM-YYYY')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ScheduleOutlined sx={{ mr: 1, color: "#666" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Time
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                          {moment().startOf("day").add(shift?.start_time, "minutes").format("hh:mm A")} - {moment().startOf("day").add(shift?.end_time, "minutes").format("hh:mm A")}


                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                </Grid>
              </Grid>


            </Grid>
          </Card>
        </Grid>
      </Grid>
      <Box px={2} py={4}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Attendance Record
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Your recent attendance and working hours
        </Typography>

        <Stack spacing={2}>
          {employeeAttendance?.map((record, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid #E0E0E0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <CalendarTodayIcon color="primary" />
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {record.date}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {record.check_in && record.check_out
                      ? `${record.check_in} - ${record.check_out}`
                      : "No attendance"}
                  </Typography>
                </Box>
              </Box>

            <Box textAlign="right">
              <Typography variant="subtitle2">
                {record.worked_hours}h
              </Typography>
              {record.excess_hours > 0 && (
                <Typography variant="caption" color="orange">
                  +{record.excess_hours.toFixed(2)}h OT
                </Typography>
              )}
              {record.present ? (
                <Chip
                  label="Present"
                  size="small"
                  color="success"
                  icon={<CheckCircleIcon />}
                  sx={{ ml: 1 }}
                />
              ) : (
                <Chip
                  label="Absent"
                  size="small"
                  color="error"
                  icon={<CancelIcon />}
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
        </Box>
  )
}

export default EmployeeDashboard
