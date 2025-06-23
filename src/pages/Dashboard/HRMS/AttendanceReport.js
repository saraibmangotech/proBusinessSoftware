"use client"

import { useState, useMemo, useEffect } from "react"
import moment from "moment"
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Box,
    Chip,
    InputAdornment,
    Grid,
    Card,
    CardContent,
    Avatar,
    Tooltip,
    LinearProgress,
    useTheme,
    alpha,
} from "@mui/material"
import {
    Search as SearchIcon,
    CalendarToday as CalendarIcon,
    Group as Users,
    AccessTime as Clock,
    CheckCircle as CheckCircleIcon,
    Cancel as XCircleIcon,
    FilterAlt as Filter,
} from "@mui/icons-material"
import SystemServices from "services/System"

// Real attendance data from the provided JSON
// const attendanceData = {
//     attendance: [
//         {
//             user_id: "2",
//             user_name: "Aslam",
//             employee_id: null,
//             attendance: [
//                 {
//                     user_id: "2",
//                     date: "2025-05-01",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-02",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-03",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-04",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-05",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-06",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-07",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-08",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-09",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-10",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-11",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-12",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-13",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     date: "2025-05-14",
//                     logs: [
//                         {
//                             id: 12,
//                             user_id: 2,
//                             machine_id: 17,
//                             shift: 1,
//                             log_date: "2025-05-14",
//                             check_in: "450.00",
//                             check_out: "720.00",
//                             status: "check-out",
//                             meta_data: null,
//                             created_at: "2025-05-14T07:30:46.476Z",
//                             updated_at: "2025-05-14T07:31:05.823Z",
//                             user: {
//                                 id: 2,
//                                 name: "Aslam",
//                                 employee_id: null,
//                             },
//                         },
//                     ],
//                     totalDuration: "4h 30m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-15",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-16",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-17",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-18",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-19",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-20",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-21",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-22",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-23",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-24",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-25",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-26",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-27",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-28",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-29",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-30",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "2",
//                     date: "2025-05-31",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//             ],
//         },
//         {
//             user_id: "30002",
//             user_name: "Staff",
//             employee_id: null,
//             attendance: [
//                 {
//                     user_id: "30002",
//                     date: "2025-05-01",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-02",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-03",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-04",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-05",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-06",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-07",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-08",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-09",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-10",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-11",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-12",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-13",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     date: "2025-05-14",
//                     logs: [
//                         {
//                             id: 11,
//                             user_id: 30002,
//                             machine_id: 2,
//                             shift: 1,
//                             log_date: "2025-05-14",
//                             check_in: "437.00",
//                             check_out: "450.00",
//                             status: "check-out",
//                             meta_data: null,
//                             created_at: "2025-05-14T07:17:58.477Z",
//                             updated_at: "2025-05-14T07:30:55.604Z",
//                             user: {
//                                 id: 30002,
//                                 name: "Staff",
//                                 employee_id: null,
//                             },
//                         },
//                     ],
//                     totalDuration: "0h 13m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-15",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-16",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-17",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-18",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-19",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-20",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-21",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-22",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-23",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-24",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-25",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-26",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-27",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-28",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-29",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-30",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//                 {
//                     user_id: "30002",
//                     date: "2025-05-31",
//                     status: "absent",
//                     totalDuration: "0h 0m",
//                 },
//             ],
//         },
//     ],
// }


// Add a function to get all days of May 2025
const getDaysInMonth = () => {
    const year = 2025
    const month = 4 // May is 4 in zero-based month index
    const daysInMonth = moment([year, month]).daysInMonth()

    const days = []
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(moment([year, month, i]))
    }
    return days
}



export default function AttendanceTable() {
    const theme = useTheme()
    const [nameFilter, setNameFilter] = useState("")
    const [selectedDate, setSelectedDate] = useState(moment())
    const [attendanceData, setAttendanceData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [transformedData, setTransformedData] = useState(null)
    // Transform attendance data for easier use
    

useEffect(() => {
  setTransformedData(attendanceData?.attendance?.map((employee) => {
 

        return {
            id: employee.user_id,
            name: employee.user_name,
            avatar: `/placeholder.svg?height=40&width=40&text=${employee.user_name.charAt(0)}`,

            attendance: employee.attendance?.map((day) => {
                return {
                    date: day.date,
                    status: day.logs ? "Present" : day.status == "absent" ? "A" : "Leave",
                    duration: day.totalDuration,
                }
            }),
        }
    }))
}, [attendanceData])

    useEffect(() => {
        
        setNameFilter('')
    }, [])

    // Calculate summary statistics
    const presentCount = transformedData?.reduce((total, employee) => {
        return total + employee.attendance.filter((day) => day.status === "Present").length
    }, 0)

    const absentCount = transformedData?.reduce((total, employee) => {
        return total + employee.attendance.filter((day) => day.status === "A").length
    }, 0)

    const totalDays = transformedData?.reduce((total, employee) => {
        return total + employee.attendance.length
    }, 0)

    const attendanceRate = (presentCount / totalDays) * 100
    const [filteredData, setFilteredData] = useState([]);
    // Filter data based on selected filters
    useEffect(() => {
        if (transformedData?.length) {
            const filtered = transformedData.filter((employee) =>
                employee.name.toLowerCase().includes(nameFilter.toLowerCase())
            );
            setFilteredData(filtered);
        } else {
            setFilteredData([]);
        }
    }, [nameFilter, transformedData]);
    

    const filteredAttendanceData = useMemo(() => {
        const month = selectedDate.month() // 0-indexed
        const year = selectedDate.year()

        return attendanceData?.attendance?.map((user) => ({
            ...user,
            attendance: user.attendance.filter((entry) => {
                const entryDate = moment(entry.date)
                return entryDate.month() === month && entryDate.year() === year
            }),
        }))
    }, [selectedDate])

    // Format date
    const formatDate = () => {
        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
        return new Date().toLocaleDateString("en-US", options)
    }

    // Get attendance for a specific employee on a specific date
    const getAttendanceForDate = (employeeId, date) => {
        const employee = transformedData?.find((emp) => emp.id === employeeId)
        if (!employee) return null

        const dayAttendance = employee.attendance.find((day) => day.date === date)
        return dayAttendance || { status: "Unknown", duration: "0h 0m" }
    }
    const getAttendance = async (month,year) => {
        try {
            let params = {
                month: month, // month is 0-indexed, so add 1
                year: year,

            };
            const { data } = await SystemServices.getAttendance(params);
            console.log(data);
            setAttendanceData(data)


        } catch (error) {

        }
    };


    useEffect(() => {
        getAttendance(moment().format('MMMM'),moment().format('YYYY'))
    }, [])


    return (
        <Box
            sx={{
                margin: "0 auto",
                p: { xs: 2, md: 4 },
                background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.background.default, 0)})`,
                minHeight: "100vh",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.primary.main,
                            mb: 0.5,
                        }}
                    >
                        Attendance Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarIcon fontSize="small" />
                        {formatDate()}
                    </Typography>
                </Box>
            </Box>
   {/* Filters */}
   <Card
                elevation={0}
                sx={{
                    mb: 4,
                    borderRadius: 2,
                    border: `1px solid #001f3f`,
                }}
            >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <Filter fontSize="small" color={theme.palette.primary.main} />
                        <Typography variant="h6" component="h2" sx={{ ml: 1, fontWeight: 600 }}>
                            Filter Attendance Records
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Search by Name"
                                variant="outlined"
                                size="small"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" color={theme.palette.text.secondary} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Select Month"
                                type="month"
                                variant="outlined"
                                size="small"
                                value={selectedDate.format("YYYY-MM")}
                                onChange={(e) => {
                                    setSelectedDate(moment(e.target.value, "YYYY-MM"))
                                    getAttendance(moment(e.target.value).format("MMMM"),moment(e.target.value).format("YYYY"))
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" color={theme.palette.text.secondary} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            height: "100%",
                            backgroundColor:'#001f3f',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: theme.shadows[4],
                            },
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="subtitle2" sx={{color:'white'}}>
                                    Total Employees
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'white' }}>
                                    <Users fontSize="small" sx={{color:'white'}} />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 ,color:'white'}}>
                                {transformedData?.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            height: "100%",
                            
                            border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: theme.shadows[4],
                            },
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Present Days
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                                    <CheckCircleIcon fontSize="small" />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                                {presentCount}
                            </Typography>
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                                {Math.round((presentCount / totalDays) * 100)}% of total days
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            height: "100%",
                            border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                            backgroundColor:'#001f3f',
                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: theme.shadows[4],
                            },
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="subtitle2" sx={{color:'white'}}>
                                    Absent Days
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'white' }}>
                                    <XCircleIcon fontSize="small" />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1,color:'white' }}>
                                {absentCount}
                            </Typography>
                            <Typography variant="body2" color="error.main" sx={{ fontWeight: 500,color:'white' }}>
                                {Math.round((absentCount / totalDays) * 100)}% of total days
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            height: "100%",
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",

                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: theme.shadows[4],
                            },
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Total Work Hours
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                                    <Clock fontSize="small" />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                                4h 43m
                            </Typography>
                            <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500 }}>
                                For May 2025
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

         

            {/* Attendance Progress */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="subtitle2">Overall Attendance Rate</Typography>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {attendanceRate ? Math.round(attendanceRate) : ''}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={attendanceRate}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            background: `linear-gradient(90deg, '#001f3f', ${theme.palette.primary.light})`,
                        },
                    }}
                />
            </Box>

            {/* Table */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}
            >
                {loading && <LinearProgress />}
                <TableContainer sx={{ maxHeight: 500, overflow: "auto" }}>
                    <Table aria-label="attendance table">
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        color: theme.palette.primary.main,
                                        position: "sticky",
                                        left: 0,
                                        zIndex: 2,
                                        minWidth: 200,
                                        background: "rgb(243 248 253)",
                                    }}
                                >
                                    Employee
                                </TableCell>

                                {getDaysInMonth().map((day) => {
                                    const isSunday = day.day() === 0
                                    return (
                                        <TableCell
                                            key={day.format("D")}
                                            align="center"
                                            sx={{
                                                fontWeight: 600,
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                color: theme.palette.primary.main,
                                                minWidth: 100,
                                                padding: "8px 4px",
                                                border: "none !important",
                                                fontSize: "0.75rem",
                                                lineHeight: 2,
                                            }}
                                        >
                                            {day.format("D")} <br />
                                            {day.format("ddd")}

                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                            {/* Row for day names */}
                            <TableRow>


                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData?.length > 0 ? (
                                filteredData?.map((employee) => (
                                    <TableRow
                                        key={employee.id}
                                        hover
                                        sx={{
                                            transition: "background-color 0.2s",
                                            "&:hover": {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                            },
                                        }}
                                    >
                                        <TableCell
                                            sx={{
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 1,
                                                bgcolor: theme.palette.background.paper,
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                <Avatar src={employee.avatar} alt={employee.name} sx={{ width: 40, height: 40 }} />
                                                <Box>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {employee.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID: {employee.id}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        {getDaysInMonth().map((day) => {
                                            const dateStr = day.format("YYYY-MM-DD")
                                            const isSunday = day.day() === 0
                                            const dayAttendance = employee.attendance.find((att) => att.date === dateStr)

                                            // Default to absent if no attendance found
                                            const status = dayAttendance ? dayAttendance.status : "A"
                                            const duration = dayAttendance ? dayAttendance.duration : "0h 0m"

                                            return (
                                                <TableCell
                                                    key={`${employee.id}-${dateStr}`}
                                                    align="center"

                                                >
                                                    <Tooltip title={`Duration: ${duration}`} arrow>
                                                        <Chip
                                                            label={isSunday ? "Holiday" : status == "Present" ? duration : status == "A" ? "A" : "L"}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 500,
                                                                borderRadius: 1,
                                                                width: "100px",
                                                                py: 4,
                                                                px: 2,
                                                                backgroundColor: isSunday
                                                                    ? "#f0f0f0"
                                                                    : status === "Present"
                                                                        ? "#daffd3"
                                                                        : status === "A"
                                                                            ? "#fee6e4"
                                                                            : "#e6f2ff",
                                                                border: `1px solid ${isSunday
                                                                    ? "grey"
                                                                    : status === "Present"
                                                                        ? "green"
                                                                        : status === "A"
                                                                            ? "red"
                                                                            : "#e6f2ff"
                                                                    }`,
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={getDaysInMonth().length + 1} align="center" sx={{ py: 6 }}>
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                            <Filter fontSize="large" color={alpha(theme.palette.text.primary, 0.2)} />
                                            <Typography variant="h6" color="text.secondary">
                                                No matching records found
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Try adjusting your filters to find what you're looking for
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box
                    sx={{
                        p: 2,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Showing {filteredData?.length} of {transformedData?.length} employees
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Last updated: {new Date().toLocaleTimeString()}
                    </Typography>
                </Box>
            </Card>
        </Box>
    )
}
