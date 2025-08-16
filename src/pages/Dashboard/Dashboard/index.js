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
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
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
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import PaymentsIcon from "@mui/icons-material/Payments"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import NetworkWifiIcon from "@mui/icons-material/NetworkWifi"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import {
  EmailOutlined,
  PhoneOutlined,
  CalendarTodayOutlined,
  CheckCircleOutline,
  WarningAmberOutlined,
  CancelOutlined,
  DescriptionOutlined,
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
import CakeIcon from "@mui/icons-material/Cake"
import AssignmentIcon from "@mui/icons-material/Assignment"
import EventAvailableIcon from "@mui/icons-material/EventAvailable"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
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

const categoryData = []

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
]

function Dashboard() {
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
  const [currentState, setCurrentState] = useState(
    user?.role_id == 1000 || user?.role_id == 3 || user?.role_id == 1001
      ? "Admin"
      : user?.role_id == 1004
        ? "Cashier"
        : user?.role_id == 1003
          ? "Typist"
          : user?.role_id == 1006
            ? "Typist Reception"
            : user?.role_id == 6
              ? "HR"
              : "",
  )
  const [shift, setShift] = useState(null)
  const [employeeAttendance, setEmployeeAttendance] = useState(null)
  const [hrStats, setHrStats] = useState({
    birthdays: [],
    probations: [],
    anniversaries: [],
    leaveRequests: [],
    documentExpiries: [],
  })
  const pdfContent = Images?.guidelinePDF

  const statsData = [
    {
      title: "Total Service Charges",
      value: Number.parseFloat(statsDetail?.totalServiceCharges).toFixed(2),
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
  ]

  const statsData2 = [
    {
      title: "Total Sales",
      value: Number.parseFloat(statsDetail?.totalSalesAmount || 0).toFixed(2),
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
      value: Number.parseFloat(statsDetail?.monthlySalesAmount || 0).toFixed(2),
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
      value: Number.parseFloat(statsDetail?.monthlyCommissionAmount || 0).toFixed(2),
      icon: <TaskAltIcon />,
      color: THEME.success,
      bgColor: THEME.success,
      trend: "+3%",
      trendUp: true,
    },
  ]

  const statsData3 = [
    {
      title: "Card Payments Collected",
      value: Number.parseFloat(statsDetail?.overviewReport?.totalCard || 0).toFixed(2),
      icon: <PaymentsIcon />,
      color: THEME.secondary,
      bgColor: THEME.secondary,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Cash Payments Collected",
      value: Number.parseFloat(statsDetail?.overviewReport?.totalCash || 0).toFixed(2),
      icon: <AttachMoneyIcon />,
      color: THEME.secondary,
      bgColor: THEME.secondary,
      trend: "+6%",
      trendUp: true,
    },
    {
      title: "Network/Online Transfers",
      value: Number.parseFloat(statsDetail?.overviewReport?.totalNetwork || 0).toFixed(2),
      icon: <NetworkWifiIcon />,
      color: THEME.accent1,
      bgColor: THEME.accent1,
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Total Collection (All Modes)",
      value: Number.parseFloat(statsDetail?.overviewReport?.totalAmount || 0).toFixed(2),
      icon: <AccountBalanceWalletIcon />,
      color: THEME.accent2,
      bgColor: THEME.accent2,
      trend: "+8%",
      trendUp: true,
    },
  ]

  const hrStatsData = [
    {
      title: "Birthdays",
      value: hrStats.birthdays?.length || 0,
      icon: <CakeIcon />,
      color: "#9C27B0",
      bgColor: "#9C27B0",
    },
    {
      title: "Probations",
      value: hrStats.probations?.length || 0,
      icon: <AssignmentIcon />,
      color: "#FF9800",
      bgColor: "#FF9800",
    },
    {
      title: "Leave Requests",
      value: hrStats.leaveRequests?.length || 0,
      icon: <EventAvailableIcon />,
      color: "#2196F3",
      bgColor: "#2196F3",
    },
    {
      title: "Expiring Docs",
      value: hrStats.documentExpiries?.length || 0,
      icon: <DescriptionIcon />,
      color: "#F44336",
      bgColor: "#F44336",
    },
  ]

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
        return {
          icon: <DescriptionOutlined sx={{ mr: 1, color: "#4CAF50" }} />,
          color: "#e8f5e9",
          statusColor: "#4CAF50",
        }
      case "emirates_id":
        return {
          icon: <CreditCardOutlined sx={{ mr: 1, color: "#FF9800" }} />,
          color: "#fff3e0",
          statusColor: "#FF9800",
        }
      case "visa_copy":
        return {
          icon: <DescriptionOutlined sx={{ mr: 1, color: "#F44336" }} />,
          color: "#ffebee",
          statusColor: "#F44336",
        }
      case "labor":
        return { icon: <WorkOutline sx={{ mr: 1, color: "#4CAF50" }} />, color: "#e8f5e9", statusColor: "#4CAF50" }
      default:
        return { icon: <DescriptionOutlined sx={{ mr: 1 }} />, color: "#f0f0f0", statusColor: "#999" }
    }
  }

  const getStatus = (expiryDate) => {
    if (!expiryDate) return { label: "Not Set", color: "#999", icon: <WarningAmberOutlined sx={{ fontSize: 16 }} /> }

    const today = moment()
    const expiry = moment(expiryDate)
    const diff = expiry.diff(today, "days")

    if (diff >= 60) return { label: "Valid", color: "#4CAF50", icon: <CheckCircleOutline sx={{ fontSize: 16 }} /> }
    if (diff >= 0)
      return { label: "Expiring Soon", color: "#FF9800", icon: <WarningAmberOutlined sx={{ fontSize: 16 }} /> }
    return { label: "Expired", color: "#F44336", icon: <CancelOutlined sx={{ fontSize: 16 }} /> }
  }

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
      const result = data?.detailedStats?.resultByCategory?.map((item) => ({
        name: item.category_name,
        value: Number.parseFloat(item.item_count),
      }))
      const result2 = data?.detailedStats?.resultByTypist?.map((item) => ({
        name: item.creator_name,
        value: Number.parseFloat(item.item_count),
      }))
      console.log(result)
      setEmployeess(result2)
      setCatData(result)

      console.log(result)
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
        from_date: moment().subtract(6, "days").format("MM-DD-YYYY"),
        to_date: moment().format("MM-DD-YYYY"),
      }
      const { data } = await SystemServices.getEmployeeAttendance(params)
      console.log(data)
      setEmployeeAttendance(data?.daily)
    } catch (error) {
      console.log(error)
    }
  }

  const getData = async () => {
    try {
      const params = { user_id: user?.id }
      const { data } = await CustomerServices.getEmployeeDetail(params)
      const data2 = data?.employee
      setEmployeeDetail(data2)
      getShiftDetail(data2?.shift_id)
      getEmployeeAttendance(user?.id)
    } catch (error) {
      console.error("Error fetching employee data:", error)
    }
  }
  const getHRStats = async () => {
    try {
      const { data } = await CustomerServices.getHRStats()
      console.log(data)
      setHrStats(data)
    } catch (error) {
      console.error("Error fetching HR data:", error)
    }
  }
  const getShiftDetail = async (id) => {
    try {
      const params = {
        page: 1,
        limit: 999999,

        id: id,
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
    getHRStats()
    getStats()
    getData()
    getEmployeeDetail()
  }, [])

  const onPieEnter = (_, index) => {
    setActiveIndex(index)
  }

  return (
    <Fragment>
      {user?.role_id != 4 ? (
        <Box
          sx={{
            m: 2,
            position: "relative",
            backgroundColor: THEME.light,
            borderRadius: "20px",
            p: 3,
            minHeight: "100vh",
          }}
        >
          {user?.role_id == 6 && (
            <>
              {/* HR Welcome Header */}
              <Card
                sx={{
                  mb: 4,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)",
                  color: "white",
                  p: 4,
                  boxShadow: "0px 8px 32px rgba(156, 39, 176, 0.3)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Box sx={{ mr: 2, fontSize: "2rem" }}>☀️</Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                      Good Morning, HR Team!
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Welcome back to your dashboard. Here's what needs your attention today.
                    </Typography>
                  </Box>
                </Box>

                {/* HR Stats Cards */}
                <Grid container spacing={3}>
                  {hrStatsData.map((stat, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Card
                        sx={{
                          p: 2,
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: 2,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h3" sx={{ fontWeight: "bold", color: "white", mb: 0.5 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                          {stat.title}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Card>

              {/* HR Insights Section */}
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}>
                HR Insights at a Glance
              </Typography>
              <Typography variant="body2" sx={{ mb: 4, textAlign: "center", color: "text.secondary" }}>
                Stay on top of your team's important milestones and requests
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Employee Birthdays */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 3, borderRadius: 3, height: 400, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CakeIcon sx={{ color: "#9C27B0", mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Employee Birthdays
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                      Celebrate our team members' special days this month!
                    </Typography>

                    <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                      {hrStats.birthdays?.map((birthday, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                            p: 2,
                            backgroundColor: "#f8f9fa",
                            borderRadius: 2,
                          }}
                        >
                          <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: "#9C27B0" }}>
                            {birthday.name?.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                              {birthday.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {birthday.department} • {birthday.designation}
                            </Typography>
                            <Typography variant="caption" sx={{ display: "block", color: "#9C27B0" }}>
                              Aug {birthday.dob_day}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ textAlign: "center", mt: 2, p: 2, backgroundColor: "#f3e5f5", borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ color: "#9C27B0" }}>
                        {hrStats.birthdays?.length || 0} birthday
                        {hrStats.birthdays?.length !== 1 ? "s" : ""} this month
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                {/* Probation Periods */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 3, borderRadius: 3, height: 400, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <AssignmentIcon sx={{ color: "#FF9800", mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Probation Periods
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                      Track upcoming evaluations to ensure timely feedback.
                    </Typography>

                    <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                      {hrStats.probations?.map((probation, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: "#fff3e0", borderRadius: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                            {probation.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            {probation.department} • {probation.designation}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#FF9800", display: "block" }}>
                            Ends: {new Date(probation.probation_end_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ textAlign: "center", mt: 2, p: 2, backgroundColor: "#fff3e0", borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ color: "#FF9800" }}>
                        {hrStats.probations?.length || 0} evaluation
                        {hrStats.probations?.length !== 1 ? "s" : ""} due
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                {/* Work Anniversaries */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 3, borderRadius: 3, height: 400, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <EmojiEventsIcon sx={{ color: "#4CAF50", mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Work Anniversaries
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                      Recognize milestones that matter.
                    </Typography>

                    <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                      {hrStats.anniversaries?.map((anniversary, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: "#e8f5e8", borderRadius: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                {anniversary.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                {anniversary.department} • {anniversary.designation}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#4CAF50", display: "block" }}>
                                Aug {new Date(anniversary.date_of_joining).getDate()}
                              </Typography>
                            </Box>
                            <Chip
                              label={`${anniversary.years} year${anniversary.years !== 1 ? "s" : ""}`}
                              size="small"
                              sx={{ bgcolor: "#4CAF50", color: "white" }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ textAlign: "center", mt: 2, p: 2, backgroundColor: "#e8f5e8", borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ color: "#4CAF50" }}>
                        {hrStats.anniversaries?.length || 0} anniversar
                        {hrStats.anniversaries?.length !== 1 ? "ies" : "y"} this month
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>


              {/* Leave Requests and Document Expiries */}
              <Grid container spacing={3}>
                {/* Leave Requests */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <EventAvailableIcon sx={{ color: "#2196F3", mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Leave Requests
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                      Stay on top of team availability and manage requests efficiently.
                    </Typography>

                    {hrStats.leaveRequests?.slice(0, 3).map((request, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                              {request.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                              {request.type} • {request.total_days} day{request.total_days !== "1" ? "s" : ""}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#2196F3", display: "block" }}>
                              {new Date(request.start_date).toLocaleDateString()} -{" "}
                              {new Date(request.end_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Chip label="pending" size="small" sx={{ bgcolor: "#FFC107", color: "white" }} />
                        </Box>
                      </Box>
                    ))}

                    <Button variant="outlined" onClick={() => navigate('/leave-list')} fullWidth sx={{ mt: 2, color: "#2196F3", borderColor: "#2196F3" }}>
                      Review All Requests
                    </Button>

                    <Box sx={{ textAlign: "center", mt: 2 }}>
                      <Typography variant="caption" sx={{ color: "#2196F3" }}>
                        {hrStats.leaveRequests?.length || 0} pending
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                {/* Document Expiries */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <DescriptionIcon sx={{ color: "#F44336", mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Document Expiries
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                      Keep important documents up-to-date and compliant.
                    </Typography>

                    {hrStats.documentExpiries?.slice(0, 3).map((doc, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: "#ffebee", borderRadius: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                              {doc.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                              {doc.document_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                              ID: {doc.employee_id}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#F44336", display: "block" }}>
                              Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Chip label="High" size="small" sx={{ bgcolor: "#F44336", color: "white" }} />
                        </Box>
                      </Box>
                    ))}


                  </Card>
                </Grid>
              </Grid>
            </>
          )}

          {/* Existing Welcome Section for other roles */}
          {user?.role_id != 6 && (
            <Box className={classes.welcomeSection}>
              <Grid container spacing={2} alignItems="center" justifyContent={"space-between"}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Welcome back, {user?.name} ! <span className="waving-hand">&#x1F44B;</span>
                  </Typography>
                  <Typography variant="body1">Here's what's happening with your business today.</Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={4}
                  sx={{ textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end" }}
                >
                  <CalendarTodayIcon sx={{ mr: 1 }} />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Stats Cards */}
          <Grid container mt={1} xs={12} spacing={2} justifyContent={"space-between"}>
            {(currentState == "Typist" || currentState == "Typist Reception") &&
              statsData2.map((stat, index) => (
                <Grid item xs={12} sm={6} md={2.4} key={index}>
                  <Card
                    className={classes.dashboardCard}
                    sx={{
                      borderRadius: "16px",
                      backgroundColor: THEME.primary,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      height: "120px",
                      position: "relative",
                      overflow: "visible",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      color: "white",
                    }}
                  >
                    <CardContent sx={{ position: "relative", zIndex: 1, width: "100%" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              backgroundColor: stat.bgColor,
                              borderRadius: "12px",
                              width: 48,
                              height: 48,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              marginRight: 2,
                            }}
                          >
                            {stat.icon}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                              {stat.title}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>
                                {stat.value}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  ml: 1,
                                  color: "white",
                                  bgcolor: stat.trendUp ? "rgba(0,184,148,0.3)" : "rgba(255,118,117,0.3)",
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: "0.75rem",
                                }}
                              >
                                {stat.trendUp ? (
                                  <ArrowUpwardIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                ) : (
                                  <ArrowUpwardIcon sx={{ fontSize: 12, mr: 0.5, transform: "rotate(180deg)" }} />
                                )}
                                {stat.trend}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            {currentState == "Admin" &&
              statsData.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    className={classes.dashboardCard}
                    sx={{
                      borderRadius: "16px",
                      backgroundColor: THEME.primary,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      height: "120px",
                      position: "relative",
                      overflow: "visible",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      color: "white",
                    }}
                  >
                    <CardContent sx={{ position: "relative", zIndex: 1, width: "100%" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              backgroundColor: stat.bgColor,
                              borderRadius: "12px",
                              width: 48,
                              height: 48,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              marginRight: 2,
                            }}
                          >
                            {stat.icon}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                              {stat.title}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>
                                {stat.value}
                              </Typography>
                              {stat.title != "Sales Categories" && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    ml: 1,
                                    color: "white",
                                    bgcolor: stat.trendUp ? "rgba(0,184,148,0.3)" : "rgba(255,118,117,0.3)",
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {stat.trendUp ? (
                                    <ArrowUpwardIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                  ) : (
                                    <ArrowUpwardIcon sx={{ fontSize: 12, mr: 0.5, transform: "rotate(180deg)" }} />
                                  )}
                                  {stat.trend}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            {currentState == "Cashier" &&
              statsData3.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    className={classes.dashboardCard}
                    sx={{
                      borderRadius: "16px",
                      backgroundColor: THEME.primary,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      height: "120px",
                      position: "relative",
                      overflow: "visible",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      color: "white",
                    }}
                  >
                    <CardContent sx={{ position: "relative", zIndex: 1, width: "100%" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              backgroundColor: stat.bgColor,
                              borderRadius: "12px",
                              width: 48,
                              height: 48,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              marginRight: 2,
                            }}
                          >
                            {stat.icon}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                              {stat.title}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>
                                {stat.value}
                              </Typography>
                              {stat.title != "Sales Categories" && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    ml: 1,
                                    color: "white",
                                    bgcolor: stat.trendUp ? "rgba(0,184,148,0.3)" : "rgba(255,118,117,0.3)",
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {stat.trendUp ? (
                                    <ArrowUpwardIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                  ) : (
                                    <ArrowUpwardIcon sx={{ fontSize: 12, mr: 0.5, transform: "rotate(180deg)" }} />
                                  )}
                                  {stat.trend}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>

          {/* Charts Section */}
          {currentState == "Admin" && (
            <Grid container spacing={3} mt={2}>
              {/* Sales Trend Chart */}
              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: `1px solid ${THEME.primary}`,
                    "& .recharts-default-tooltip": {
                      backgroundColor: THEME.light,
                      border: `1px solid ${THEME.primary}`,
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: THEME.primary }}>
                    Monthly Sales Graph
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={statsDetail?.salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={THEME.secondary} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={THEME.secondary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <RechartsTooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={THEME.secondary}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>

              {/* Category Distribution */}
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: `1px solid ${THEME.primary}`,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: THEME.primary }}>
                    Category Wise Service Sales
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={(props) => {
                          const RADIAN = Math.PI / 180
                          const {
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            startAngle,
                            endAngle,
                            fill,
                            payload,
                            percent,
                            value,
                          } = props
                          const sin = Math.sin(-RADIAN * midAngle)
                          const cos = Math.cos(-RADIAN * midAngle)
                          const sx = cx + (outerRadius + 10) * cos
                          const sy = cy + (outerRadius + 10) * sin
                          const mx = cx + (outerRadius + 30) * cos
                          const my = cy + (outerRadius + 30) * sin
                          const ex = mx + (cos >= 0 ? 1 : -1) * 22
                          const ey = my
                          const textAnchor = cos >= 0 ? "start" : "end"

                          return (
                            <g>
                              <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                                {payload.name}
                              </text>
                              <Sector
                                cx={cx}
                                cy={cy}
                                innerRadius={innerRadius}
                                outerRadius={outerRadius}
                                startAngle={startAngle}
                                endAngle={endAngle}
                                fill={fill}
                              />
                              <Sector
                                cx={cx}
                                cy={cy}
                                startAngle={startAngle}
                                endAngle={endAngle}
                                innerRadius={outerRadius + 6}
                                outerRadius={outerRadius + 10}
                                fill={fill}
                              />
                              <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                              <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                              <text
                                x={ex + (cos >= 0 ? 1 : -1) * 12}
                                y={ey}
                                textAnchor={textAnchor}
                                fill="#333"
                              >{`${value}`}</text>
                              <text
                                x={ex + (cos >= 0 ? 1 : -1) * 12}
                                y={ey}
                                dy={18}
                                textAnchor={textAnchor}
                                fill="#999"
                              >
                                {`(${(percent * 100).toFixed(2)}%)`}
                              </text>
                            </g>
                          )
                        }}
                        data={catData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                      >
                        {catData?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={THEME.chartColors[index % THEME.chartColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>

              {/* Employee Service Distribution */}
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: `1px solid ${THEME.primary}`,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: THEME.primary }}>
                    Typist Wise Service Sales
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={employeess} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={false} />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill={THEME.accent1} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>

              {/* Revenue vs Expenses */}
              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: `1px solid ${THEME.primary}`,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: THEME.primary }}>
                    Credit Invoices vs Paid Invoices
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={statsDetail?.paidCreditGraph} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="credit"
                        stroke={THEME.accent1}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      <Line type="monotone" dataKey="paid" stroke={THEME.accent2} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
          )}
          <Grid container spacing={3} mt={2}>
            {currentState == "Cashier" && (
              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: `1px solid ${THEME.primary}`,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: THEME.primary }}>
                    Credit Invoices vs Paid Invoices
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={statsDetail?.paidCreditGraph} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="credit"
                        stroke={THEME.accent1}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      <Line type="monotone" dataKey="paid" stroke={THEME.accent2} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            )}
            {console.log(statsDetail?.salesData)}
            {(currentState == "Typist" || currentState == "Typist Reception") && (
              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: `1px solid ${THEME.primary}`,
                    "& .recharts-default-tooltip": {
                      backgroundColor: THEME.light,
                      border: `1px solid ${THEME.primary}`,
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: THEME.primary }}>
                    Monthly Sales Graph
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={statsDetail?.salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={THEME.secondary} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={THEME.secondary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <RechartsTooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={THEME.secondary}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      ) : (
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
                        <Typography variant="body2">
                          {moment(employeeDetail?.date_of_joining).format("DD-MM-YYYY")}
                        </Typography>
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
                <Box
                  sx={{ borderLeft: { md: "1px solid rgba(255,255,255,0.3)" }, pl: { md: 4 }, pt: { xs: 3, md: 0 } }}
                >
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
                const { icon, color: bgColor, statusColor } = getIconAndColor(doc.key)
                const { label, color: chipColor, icon: chipIcon } = getStatus(doc.expiry_date)
                const daysLeft = doc.expiry_date ? moment(doc.expiry_date).diff(moment(), "days") : null

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
                          if (doc.path) window.open(`${process.env.REACT_APP_IMAGE_BASE_URL_NEW}${doc.path}`, "_blank")
                        }}
                        disabled={!doc.path}
                      >
                        View Document
                      </Button>
                    </Card>
                  </Grid>
                )
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
                              {moment(shift?.created_at).format("DD-MM-YYYY")}
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
                              {moment().startOf("day").add(shift?.start_time, "minutes").format("hh:mm A")} -{" "}
                              {moment().startOf("day").add(shift?.end_time, "minutes").format("hh:mm A")}
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
                              {moment(shift?.created_at).format("DD-MM-YYYY")}
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
                              {moment().startOf("day").add(shift?.start_time, "minutes").format("hh:mm A")} -{" "}
                              {moment().startOf("day").add(shift?.end_time, "minutes").format("hh:mm A")}
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
                    <Typography variant="subtitle2">{record.worked_hours}h</Typography>
                    {record.excess_hours > 0 && (
                      <Typography variant="caption" color="orange">
                        +{record.excess_hours.toFixed(2)}h OT
                      </Typography>
                    )}
                    {record.status === "Present" ? (
                      <Chip label="Present" size="small" color="success" icon={<CheckCircleIcon />} sx={{ ml: 1 }} />
                    ) : (
                      <Chip label="Absent" size="small" color="error" icon={<CancelIcon />} sx={{ ml: 1 }} />
                    )}
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Box>
      )}
    </Fragment>
  )
}

export default Dashboard
