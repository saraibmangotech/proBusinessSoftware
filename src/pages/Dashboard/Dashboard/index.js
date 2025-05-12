"use client"

import { Fragment, useEffect, useState } from "react"
import { Box, Card, CardContent, Grid, Typography, Paper } from "@mui/material"
import styled from "@emotion/styled"
import { makeStyles } from "@mui/styles"
import { useNavigate } from "react-router-dom"
import { BuyerRegistrationIcon, Images, ReceivedBuyerIdIcon, RequestBuyerIdIcon } from "assets"
import Colors from "assets/Style/Colors"
import { useAuth } from "context/UseContext"
import Storage from "utils/Storage"
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
      boxShadow: "0 10px 20px rgba(0,0,0,0.1) !important",
    },
  },
  welcomeSection: {
    background: "linear-gradient(135deg, #0066ff 0%, #00c2a8 100%)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
    color: "white",
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

const statsData = [
  {
    title: "Total Sales",
    value: "248",
    icon: <PeopleAltIcon />,
    color: "#00c2a8",
    bgColor: "#00c2a8",
    trend: "+12%",
    trendUp: true,
  },
  {
    title: "Employee Service Count",
    value: "436",
    icon: <DescriptionIcon />,
    color: "#0066ff",
    bgColor: "#0066ff",
    trend: "+8%",
    trendUp: true,
  },
  {
    title: "Sales Category Count",
    value: "123",
    icon: <SendIcon />,
    color: "#8c54ff",
    bgColor: "#8c54ff",
    trend: "+5%",
    trendUp: true,
  },
  {
    title: "Quantity",
    value: "$1,264",
    icon: <TaskAltIcon />,
    color: "#ff7a45",
    bgColor: "#ff7a45",
    trend: "-3%",
    trendUp: false,
  },
]

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

const categoryData = [
  { name: "Category A", value: 400 },
  { name: "Category B", value: 300 },
  { name: "Category C", value: 300 },
  { name: "Category D", value: 200 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

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

function Dashboard() {
  const classes = useStyle()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getStorageItem } = Storage()

  const userJourney = getStorageItem("journey")
  const [renderState, setRenderState] = useState(false)
  const [stepperLabel, setStepperLabel] = useState([])
  const [statsDetail, setStatsDetail] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const pdfContent = Images?.guidelinePDF

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
        limit: 1000,
        search: search,
      }
      const { data } = await SystemServices.getStats(params)
      console.log(data)
      setStatsDetail(data)
    } catch (error) {
      showErrorToast(error)
    }
  }

  useEffect(() => {
    // getStats()
  }, [])

  const onPieEnter = (_, index) => {
    setActiveIndex(index)
  }

  return (
    <Fragment>
      <Box sx={{ m: 2, position: "relative" }}>
        {/* Welcome Section */}
        <Box className={classes.welcomeSection}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome back, {user?.name || "Admin"}
              </Typography>
              <Typography variant="body1">Here's what's happening with your business today.</Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
              <CalendarTodayIcon sx={{ mr: 1 }} />
              <Typography variant="body2" component="span">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Stats Cards */}
        <Grid container mt={1} spacing={2}>
          {statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                className={classes.dashboardCard}
                sx={{
                  borderRadius: "16px",
                  backgroundColor: "white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  height: "120px",
                  position: "relative",
                  overflow: "visible",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
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
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {stat.title}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.primary" }}>
                            {stat.value}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              ml: 1,
                              color: stat.trendUp ? "success.main" : "error.main",
                              bgcolor: stat.trendUp ? "success.light" : "error.light",
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
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} mt={2}>
          {/* Sales Trend Chart */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2, borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Sales Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066ff" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0066ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="value" stroke="#0066ff" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Category Distribution
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
                          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                            {`(${(percent * 100).toFixed(2)}%)`}
                          </text>
                        </g>
                      )
                    }}
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Employee Service Distribution */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Employee Service Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employeeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#8c54ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Revenue vs Expenses */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2, borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Revenue vs Expenses
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#00c2a8" activeDot={{ r: 8 }} strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#ff7a45" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  )
}

export default Dashboard
