"use client"

import { useState, useMemo, useEffect, useCallback, memo } from "react"
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
    FormControl,
    InputLabel,
    Button,
} from "@mui/material"
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
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
import { PrimaryButton } from "components/Buttons"
import Colors from "assets/Style/Colors"
import { Controller, useForm } from "react-hook-form"
import SimpleDialog from "components/Dialog/SimpleDialog"
import CustomerServices from "services/Customer"
import { showErrorToast, showPromiseToast } from "components/NewToaster"
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs from "dayjs";

// Memoized function to get all days of a month - moved outside component
const getDaysInMonth = (year, month) => {
    const daysInMonth = moment([year, month]).daysInMonth()
    const days = []
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(moment([year, month, i]))
    }
    return days
}

// Memoized employee row component
const EmployeeRow = memo(({ employee, daysInMonth, onCellClick }) => {
    const theme = useTheme()

    return (
        <TableRow
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

            {daysInMonth.map((day) => {
                const dateStr = day.format("YYYY-MM-DD")

                const isSunday = day.day() === 0
                const dayAttendance = employee.attendance.find((att) => att.date === dateStr)

                const status = dayAttendance ? dayAttendance.status : "A"
                const duration = dayAttendance ? dayAttendance.duration : "0h 0m"

                return (
                    <TableCell key={`${employee.id}-${dateStr}`} align="center" onClick={() => {
                        console.log(dayAttendance, 'ssss', day);

                        onCellClick(employee, day.format("YYYY-MM-DD"), dayAttendance.logs)
                    }} sx={{ cursor: "pointer" }}>
                        <Tooltip title={`Duration: ${duration}`} arrow>
                            <Chip
                                label={status === "Present" ? duration : status}
                                size="small"
                                sx={{
                                    fontWeight: 500,
                                    borderRadius: 1,
                                    width: "100px",
                                    py: 4,
                                    px: 2,
                                    backgroundColor:  status === "Present"
                                            ? "#daffd3"
                                            : status === "A"
                                                ? "#fee6e4"
                                                : "#e6f2ff",
                                    border: `1px solid ${status === "Present" ? "green" : status === "A" ? "red" : "#e6f2ff"
                                        }`,
                                }}
                            />
                        </Tooltip>
                    </TableCell>
                )
            })}
        </TableRow>
    )
})

EmployeeRow.displayName = "EmployeeRow"

export default function AttendanceTable() {
    const theme = useTheme()
    const [nameFilter, setNameFilter] = useState("")
    const [selectedDate, setSelectedDate] = useState(moment())
    const [attendanceData, setAttendanceData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [dialog, setDialog] = useState(false)
    const [tableDate, setTableDate] = useState(null)
    const [selectedData, setSelectedData] = useState(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        control,
        reset,
    } = useForm()
    const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));

    const handleStartDateChange = (e) => {
        console.log(e.target.value);
        
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };
    // Memoize transformed data to prevent recalculation on every render
    const transformedData = useMemo(() => {
        if (!attendanceData?.attendance) return []
        

        return attendanceData.attendance.map((employee) => ({
            id: employee.user_id,
            name: employee.user_name,
            avatar: `/placeholder.svg?height=40&width=40&text=${employee.user_name.charAt(0)}`,
            attendance:
                employee.attendance?.map((day) => ({
                    date: day.date,
                    status: day.logs ? "Present" : day.status === "absent" ? "A" : "Leave",
                    logs: day?.logs,
                    duration: day.totalDuration,
                })) || [],
        }))
    }, [attendanceData])

    // Memoize filtered data
    const filteredData = useMemo(() => {
        if (!transformedData.length) return []
        return transformedData.filter((employee) => employee.name.toLowerCase().includes(nameFilter.toLowerCase()))
    }, [transformedData, nameFilter])

const daysInMonth = useMemo(() => {
  const start = moment(startDate);
  const end = moment(endDate);
  const days = [];

  const current = start.clone();

  while (current.isSameOrBefore(end, 'day')) {
    days.push(current.clone()); // 👈 important: push a copy, not reference
    current.add(1, 'day');
  }

  return days;
}, [startDate, endDate]);
console.log(daysInMonth,'daysInMonthdaysInMonth');

    // Memoize summary statistics
    const summaryStats = useMemo(() => {
        if (!transformedData.length) {
            return {
                presentCount: 0,
                absentCount: 0,
                totalDays: 0,
                attendanceRate: 0,
            }
        }

        const presentCount = transformedData.reduce((total, employee) => {
            return total + employee.attendance.filter((day) => day.status === "Present").length
        }, 0)

        const absentCount = transformedData.reduce((total, employee) => {
            return total + employee.attendance.filter((day) => day.status === "A").length
        }, 0)

        const totalDays = transformedData.reduce((total, employee) => {
            return total + employee.attendance.length
        }, 0)

        const attendanceRate = totalDays > 0 ? (presentCount / totalDays) * 100 : 0

        return {
            presentCount,
            absentCount,
            totalDays,
            attendanceRate,
        }
    }, [transformedData])

    // Memoize format date function
    const formattedDate = useMemo(() => {
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }
        return new Date().toLocaleDateString("en-US", options)
    }, [])

    // Optimize API call with useCallback
    const getAttendance = async (month, year) => {
        try {
            setLoading(true)
            const params = {
                start_date: startDate,
                end_date: endDate
            }
            console.log(params,'params');
            
            const { data } = await SystemServices.getAttendance(params)
            setAttendanceData(data)
        } catch (error) {
            console.error("Error fetching attendance:", error)
        } finally {
            setLoading(false)
        }
    }

    const [shifts, setShifts] = useState([]);

    const addShift = (formData) => {
        console.log(formData?.shiftStartTime);
        const lastShift = shifts[shifts.length - 1];
        if (lastShift && !lastShift.check_out) {
            showErrorToast("Please complete the previous shift's end time before adding a new one.");
            return;
        }


        const newShift = {
            id: uuidv4(), // Unique ID
            shift: shifts.length + 1, // Sequential number
            check_in: moment(formData?.shiftStartTime.toDate()).format('HH:mm'),
            check_out: formData?.shiftEndTime ? moment(formData?.shiftEndTime.toDate()).format('HH:mm') : null,
        };

        setShifts((prevShifts) => [...prevShifts, newShift]);
        setValue("shiftStartTime", null);
        setValue("shiftEndTime", null);
        reset({
            shiftStartTime: null,
            shiftEndTime: null,
        });
        reset()
        console.log('Shift added:', newShift);
    };
    const [editShiftId, setEditShiftId] = useState(null);
    const [editEndTime, setEditEndTime] = useState(null);

    const handleEditShiftEnd = (shiftId, currentEndTime) => {
        setEditShiftId(shiftId);
        setEditEndTime(currentEndTime);
    };

    const handleSaveEditedEndTime = () => {
        if (!editEndTime) {
            showErrorToast("End time cannot be empty.");
            return;
        }

        const updatedShifts = shifts.map((shift) =>
            shift.id === editShiftId ? { ...shift, check_out: dayjs(editEndTime).hour() * 60 + dayjs(editEndTime).minute() } : shift
        );
        setShifts(updatedShifts);
        setEditShiftId(null);
        setEditEndTime(null);
    };
    const handleRemoveShift = (id) => {
        const updatedShifts = shifts.filter((shift) => shift.id !== id);
        setShifts(updatedShifts);
    };

    const convertMinutesToTime = (totalMinutes) => {
        return moment().startOf('day').add(totalMinutes, 'minutes').format('HH:mm');
    };

    const UpdateHours = async () => {
        console.log(shifts);
        const convertedShifts = shifts.map(shift => ({
            ...shift,
            check_in: moment(shift.check_in, 'HH:mm').hours() * 60 + moment(shift.check_in, 'HH:mm').minutes(),
            check_out: shift?.check_out ? moment(shift.check_out, 'HH:mm').hours() * 60 + moment(shift.check_out, 'HH:mm').minutes() : null,
        }));

        console.log(convertedShifts);

        try {
            const obj = {

                user_id: selectedData?.id,
                date: tableDate,
                shifts: convertedShifts,

            }
            const promise = CustomerServices.markAttendance(obj)

            showPromiseToast(promise, "Saving...", "Added Successfully", "Something Went Wrong")

            const response = await promise
            if (response?.responseCode === 200) {
                setDialog(false)
                setShifts([])
                getAttendance(moment(selectedDate).format("MMMM"), moment().format("YYYY"))
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleTimeChange = (shiftId, field, newValue) => {
        console.log(newValue, 'newValue');


        const updatedShifts = shifts.map((shift) => {
            if (shift.id === shiftId) {
                return {
                    ...shift,
                    [field]: moment(newValue.toDate()).format('HH:mm')
                };
            }


            return shift;
        });
        console.log(updatedShifts, 'updatedShifts');
        setShifts(updatedShifts);
    };


    const handleCellClick = useCallback((employee, dateStr, logs) => {
        if (logs?.length > 0) {

            const convertedShifts = logs?.map(shift => {
                const checkInMinutes = parseFloat(shift.check_in);
                const checkOutMinutes = shift.check_out ? parseFloat(shift.check_out) : null;

                return {
                    ...shift,
                    check_in: moment.utc().startOf('day').add(checkInMinutes, 'minutes').format('HH:mm'),
                    check_out: checkOutMinutes !== null
                        ? moment.utc().startOf('day').add(checkOutMinutes, 'minutes').format('HH:mm')
                        : null,
                };
            });
            setShifts(convertedShifts)
        }
        else {
            setShifts([])
        }
        console.log(dateStr, 'dateStr');
        setTableDate(dateStr)
        setSelectedData(employee);

        setDialog(true);
    }, []);


    
    

 
     useEffect(() => {
        getAttendance()
    }, [startDate,endDate])

    return (
        <Box
            sx={{
                margin: "0 auto",
                p: { xs: 2, md: 4 },
                background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.background.default, 0)})`,
                minHeight: "100vh",
            }}
        >
            <SimpleDialog open={dialog} width={'70%'} onClose={() => setDialog(false)} title={"Update Shift?"}>
                <Box component="form" sx={{ width: '100%' }} onSubmit={handleSubmit(addShift)}>
                    <Grid container sx={{ justifyContent: "center", alignItems: "center" }} spacing={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Grid item xs={12} sm={5}>
                                <InputLabel
                                    error={!!errors.shiftStartTime}
                                    sx={{ textTransform: "capitalize", textAlign: "left", fontWeight: 700, color: Colors.gray }}
                                >
                                    Check in:*
                                </InputLabel>
                                <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                                    <Controller
                                        name="shiftStartTime"
                                        control={control}
                                        rules={{ required: "Shift Start Time is required" }}
                                        render={({ field: { onChange, value } }) => (
                                            <TimePicker
                                                slotProps={{
                                                    textField: {
                                                        sx: {
                                                            borderRadius: "10px !important",
                                                            border: "2px solid black !important",
                                                        },
                                                    },
                                                }}
                                                value={value}
                                                onChange={(newValue) => {
                                                    if (newValue && newValue.isValid && newValue.isValid()) {
                                                        console.log("Selected Time (24-hour):", moment(newValue.toDate()).format("HH:mm"))
                                                    } else {
                                                        console.log("Invalid time selected")
                                                    }
                                                    onChange(newValue)
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        size="small"
                                                        error={!!errors.shiftStartTime}
                                                        helperText={errors.shiftStartTime?.message}
                                                        sx={{
                                                            borderRadius: "10px !important",
                                                            "&.MuiTextField-root": {
                                                                borderRadius: "10px !important",
                                                                border: "1px solid black !important",
                                                                "& fieldset": { border: "1px solid black !important" },
                                                                "&.Mui-focused svg path": {
                                                                    fill: "#0076bf",
                                                                },
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        )}
                                    />

                                    <Typography color="error" sx={{ fontSize: 12, textAlign: "left" }}>
                                        {errors.shiftStartTime?.message}
                                    </Typography>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={5}>
                                <InputLabel
                                    error={!!errors.shiftEndTime}
                                    sx={{ textTransform: "capitalize", textAlign: "left", fontWeight: 700, color: Colors.gray }}
                                >
                                    Check out:*
                                </InputLabel>
                                <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                                    <Controller
                                        name="shiftEndTime"
                                        control={control}
                                        rules={{ required: false }}
                                        render={({ field: { onChange, value } }) => (
                                            <TimePicker
                                                value={value}
                                                slotProps={{
                                                    textField: {
                                                        sx: {
                                                            borderRadius: "10px !important",
                                                            border: "2px solid black !important",
                                                        },
                                                    },
                                                }}
                                                onChange={(newValue) => {
                                                    if (newValue && newValue.isValid && newValue.isValid()) {
                                                        console.log("Selected Time (24-hour):", moment(newValue?.toDate()).format("HH:mm"))
                                                    } else {
                                                        console.log("Invalid time selected")
                                                    }
                                                    onChange(newValue)
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        size="small"
                                                        error={!!errors.shiftEndTime}
                                                        helperText={errors.shiftEndTime?.message}
                                                        sx={{
                                                            borderRadius: "10px !important",
                                                            ".MuiOutlinedInput-root": {
                                                                borderRadius: "10px !important",
                                                                "& fieldset": { border: "none !important" },
                                                                "&.Mui-focused svg path": {
                                                                    fill: "#0076bf",
                                                                },
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        )}
                                    />
                                    <Typography color="error" sx={{ fontSize: 12, textAlign: "left" }}>
                                        {errors.shiftEndTime?.message}
                                    </Typography>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={2} mt={2}>
                                <PrimaryButton bgcolor={Colors.primary} title="Add" type="submit" />
                            </Grid>
                            {shifts.map((shift, index) => (
                                <Grid item xs={12} key={shift.id}>
                                    <Box
                                        sx={{
                                            padding: 2,
                                            border: "1px solid #ccc",
                                            borderRadius: "8px",
                                            backgroundColor: "#f9f9f9",
                                            display: "flex",
                                            justifyContent: 'space-between',
                                            gap: 2,
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography sx={{ minWidth: 70 }}>
                                            <strong>Shift {shift.shift || index + 1}:</strong>
                                        </Typography>

                                        <LocalizationProvider dateAdapter={AdapterDayjs}>

                                            <TimePicker
                                                label="Start Time"
                                                value={shift.check_in ? dayjs(shift.check_in, 'HH:mm') : null}
                                                onChange={(newValue) => handleTimeChange(shift.id, 'check_in', newValue)}
                                                slotProps={{ textField: { size: 'small' } }}
                                            />

                                            <TimePicker
                                                label="End Time"
                                                value={shift.check_out ? dayjs(shift.check_out, 'HH:mm') : null}
                                                onChange={(newValue) => handleTimeChange(shift.id, 'check_out', newValue)}
                                                slotProps={{ textField: { size: 'small' } }}
                                            />

                                        </LocalizationProvider>

                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleRemoveShift(shift.id)}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                </Grid>
                            ))}



                        </LocalizationProvider>
                        <Grid
                            item
                            xs={6}
                            sm={6}
                            sx={{
                                mt: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "25px",
                            }}
                        >
                            <PrimaryButton bgcolor={Colors.primary} onClick={() => UpdateHours()} title="Yes,Confirm" />
                            <PrimaryButton onClick={() => setDialog(false)} bgcolor={"#FF1F25"} title="No,Cancel" />
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>

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
                        {formattedDate}
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
                                label="Start Date"
                                type="date"
                                variant="outlined"
                                size="small"
                                value={startDate}
                                onChange={handleStartDateChange}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="End Date"
                                type="date"
                                variant="outlined"
                                size="small"
                                value={endDate}
                                onChange={handleEndDateChange}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
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
                            backgroundColor: "#001f3f",
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
                                <Typography variant="subtitle2" sx={{ color: "white" }}>
                                    Total Employees
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "white" }}>
                                    <Users fontSize="small" sx={{ color: "white" }} />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1, color: "white" }}>
                                {transformedData?.length || 0}
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
                                {summaryStats.presentCount}
                            </Typography>
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                                {Math.round((summaryStats.presentCount / summaryStats.totalDays) * 100) || 0}% of total days
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
                            backgroundColor: "#001f3f",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: theme.shadows[4],
                            },
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: "white" }}>
                                    Absent Days
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: "white" }}>
                                    <XCircleIcon fontSize="small" />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1, color: "white" }}>
                                {summaryStats.absentCount}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: "white" }}>
                                {Math.round((summaryStats.absentCount / summaryStats.totalDays) * 100) || 0}% of total days
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
                                For {selectedDate.format("MMMM YYYY")}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Attendance Progress */}
            {/* <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="subtitle2">Overall Attendance Rate</Typography>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {Math.round(summaryStats.attendanceRate) || 0}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={summaryStats.attendanceRate}
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
            </Box> */}

            {/* Table */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}
            >

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
                                        top: 0, // 👈 Make it sticky on scroll
                                        zIndex: 3, // 👈 Ensure it's above other cells
                                        minWidth: 200,
                                        background: "rgb(243 248 253)",
                                    }}
                                >
                                    Employee
                                </TableCell>

                                {daysInMonth.map((day) => (
                                    <TableCell
                                        key={day.format("D")}
                                        align="center"
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                            color: theme.palette.primary.main,
                                            minWidth: 100,
                                            padding: "8px 4px",
                                            fontSize: "0.75rem",
                                            lineHeight: 2,
                                            position: "sticky",
                                            top: 0,
                                            zIndex: 2,
                                            background: "rgb(243 248 253)",
                                        }}
                                    >
                                        {day.format("D")} <br />
                                        {day.format("ddd")}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredData?.length > 0 ? (
                                filteredData.map((employee) => (
                                    <EmployeeRow
                                        key={employee.id}
                                        employee={employee}
                                        daysInMonth={daysInMonth}
                                        onCellClick={handleCellClick}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={daysInMonth.length + 1} align="center" sx={{ py: 6 }}>
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
                        Showing {filteredData?.length || 0} of {transformedData?.length || 0} employees
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Last updated: {new Date().toLocaleTimeString()}
                    </Typography>
                </Box>
            </Card>
        </Box>
    )
}
