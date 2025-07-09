"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Chip,
    Stack,
    IconButton,
    Checkbox,
    ListItemText,
    FormHelperText,
} from "@mui/material"
import {
    Add as AddIcon,
    Edit as EditIcon,
    People as PeopleIcon,
    AccessTime as AccessTimeIcon,
    LocationOn as LocationOnIcon,
    Schedule as ScheduleIcon,
} from "@mui/icons-material"
import DeleteIcon from '@mui/icons-material/Delete';
import { ErrorToaster } from "components/Toaster"
import { showErrorToast, showPromiseToast } from "components/NewToaster"
import SystemServices from "services/System"
import CustomerServices from "services/Customer"
import DatePicker from "components/DatePicker"
import Colors from "assets/Style/Colors"
import ConfirmationDialog from "components/Dialog/ConfirmationDialog"

const ShiftManagement = () => {
    const [shifts, setShifts] = useState([])
    const [employees, setEmployees] = useState([])
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [selectedShift, setSelectedShift] = useState(null)
    const [selectedEmployees, setSelectedEmployees] = useState([])
    const [confirmationDialog, setConfirmationDialog] = useState(false)
    const {
        control,
        handleSubmit: handleFormSubmit,
        reset,
        watch,
        setValue,
    } = useForm({
        defaultValues: {
            name: "",
            department: "",
            start_time: 540,
            end_time: 1080,
            break_minutes: 60,
            location: "",
            description: "",
        },
    })
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        formState: { errors: errors2 },
        setValue: setValue2,
        reset: reset2,
    } = useForm();

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDialogOpen2, setIsDialogOpen2] = useState(false)
    // Convert minutes to time string (HH:MM)
    const minutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
    }

    // Convert time string to minutes
    const timeToMinutes = (timeString) => {
        const [hours, minutes] = timeString.split(":").map(Number)
        return hours * 60 + minutes
    }

    // Format time for display (12-hour format)
    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        const period = hours >= 12 ? "PM" : "AM"
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
        return `${displayHours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} ${period}`
    }

    const handleDeleteShift = async (id) => {


        try {
            const obj = {
                id: selectedShift?.id,


            }
            const promise = SystemServices.deleteShift(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {

                setIsDialogOpen(false)
                getShifts()
            }


        } catch (error) {
            ErrorToaster(error);
        }
        finally {
            getShifts()
            reset()
            setIsDialogOpen(false)
        }
    };


    const getRandomColor = () => {
        const colors = [
            { bg: "#E3F2FD", badge: "#2196F3" },
            { bg: "#E8F5E8", badge: "#4CAF50" },
            { bg: "#F3E5F5", badge: "#9C27B0" },
            { bg: "#FFF3E0", badge: "#FF9800" },
            { bg: "#FCE4EC", badge: "#E91E63" },
            { bg: "#E8EAF6", badge: "#3F51B5" },
        ]
        return colors[Math.floor(Math.random() * colors.length)]
    }

    const handleSubmit = async (data) => {
        const colors = getRandomColor()

        try {
            const obj = {

                ...data,
                color: colors.bg,
                badgeColor: colors.badge,
            }
            const promise = SystemServices.CreateShift(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {

            }


        } catch (error) {
            ErrorToaster(error);
        }
        finally {
            getShifts()
            reset()
            setIsDialogOpen(false)
        }

    }
    const AssignEmployee = async (formData) => {
        console.log(selectedEmployees.split(','), 'selectedEmployees');


        try {
            const obj = {

                shift_id: selectedShift?.id,
                user_ids: selectedEmployees.split(','),
                from_date: fromDate,
                to_date: toDate
            }
            console.log();

            const promise = SystemServices.AssignEmployee(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                setFromDate(null)
                setToDate(null)
                handleCloseDialog2()
                getShifts()

            }


        } catch (error) {
            ErrorToaster(error);
        }
        finally {
            getShifts()
            reset()
            setIsDialogOpen2(false)
        }

    }
    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        reset()
    }
    const handleCloseDialog2 = () => {
        setIsDialogOpen2(false)
        reset2()
    }
    const getShifts = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await CustomerServices.getShifts(params);
            setShifts(data?.shifts?.rows);

        } catch (error) {
            showErrorToast(error);
        }
    };

    const getEmployees = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
                shift_type: 'Roaster'
            };

            const { data } = await CustomerServices.getEmployees(params);

            const formattedData = data?.employees?.rows?.map((item, index) => ({
                ...item,
                id: item?.id,
                name: item?.user?.name,
            }));

            console.log(formattedData, 'formattedData');

            setEmployees(formattedData);



        } catch (error) {
            showErrorToast(error);
        }
    };
    useEffect(() => {
        getEmployees()
        getShifts()
    }, [])


    return (
        <Box sx={{ minHeight: "100vh", p: 3 }}>
            {/* Header */}
            <ConfirmationDialog
                open={confirmationDialog}
                onClose={() => setConfirmationDialog(false)}
                message={"Are you sure you?"}
                action={() => {
                    handleDeleteShift()
                    setConfirmationDialog(false);

                }}
            />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "#9C27B0",
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <ScheduleIcon sx={{ fontSize: 20, color: "white" }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="600" color="text.primary">
                            Predefined Shift 
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            Create and manage reusable shift for quick assignment
                        </Typography>
                    </Box>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setIsDialogOpen(true)}
                        sx={{
                            textTransform: "none",
                            bgcolor: "white",
                            color: "#374151",
                            borderColor: "#D1D5DB",
                            "&:hover": {
                                bgcolor: "#F9FAFB",
                                borderColor: "#D1D5DB",
                            },
                        }}
                    >
                        Create Shift
                    </Button>

                </Stack>
            </Box>

            {/* Shift Cards Grid */}
            <Grid container >
                {shifts.map((shift) => (
                    <Grid item xs={12} sm={6} lg={4} key={shift.id}>
                        <Card
                            sx={{
                                bgcolor: shift.color,
                                border: `2px solid ${shift.color}`,
                                borderRadius: 2,
                                transition: "box-shadow 0.2s",
                                m: 1,
                                "&:hover": {
                                    boxShadow: 3,
                                },
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: "50%",
                                                bgcolor: shift.badgeColor,
                                            }}
                                        />
                                        <Typography variant="subtitle1" fontWeight="600" color="#111827">
                                            {shift.name}
                                        </Typography>
                                    </Box>
                                    {/* Delete button here */}
                                    <IconButton onClick={() => { setSelectedShift(shift); setConfirmationDialog(true) }} size="small">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Stack spacing={1} mb={2}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <AccessTimeIcon sx={{ fontSize: 16, color: "#6B7280" }} />
                                        <Typography variant="body2" color="#6B7280" fontSize="0.875rem">
                                            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Box display="flex" gap={1}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => { setSelectedShift(shift); setIsDialogOpen2(true) }}
                                        startIcon={<PeopleIcon sx={{ fontSize: 16 }} />}
                                        sx={{
                                            textTransform: "none",
                                            flexGrow: 1,
                                            fontSize: "0.875rem",
                                            py: 0.5,
                                        }}
                                    >
                                        Assign
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            minWidth: "auto",
                                            p: 0.5,
                                            fontSize: "0.875rem",
                                        }}
                                    >
                                        <EditIcon sx={{ fontSize: 16 }} />
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Add Shift Dialog */}
            <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Shift Template</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleFormSubmit(handleSubmit)} sx={{ pt: 1 }}>
                        <Box spacing={3}>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: "Shift name is required" }}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Shift Name"
                                        placeholder="e.g., Morning Shift"
                                        error={!!error}
                                        helperText={error?.message}
                                    />
                                )}
                            />



                            <Grid container columnSpacing={1} mt={2} mb={2}>
                                <Grid item xs={6}>
                                    <Controller
                                        name="start_time"
                                        control={control}
                                        rules={{ required: "Start time is required" }}
                                        render={({ field, fieldState: { error } }) => (
                                            <TextField
                                                fullWidth
                                                label="Start Time"
                                                type="time"
                                                value={minutesToTime(field.value)}
                                                onChange={(e) => field.onChange(timeToMinutes(e.target.value))}
                                                InputLabelProps={{ shrink: true }}
                                                error={!!error}
                                                helperText={error?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6} display={'flex'} justifyContent={'flex-start'}>
                                    <Controller
                                        name="end_time"
                                        control={control}
                                        rules={{ required: "End time is required" }}
                                        render={({ field, fieldState: { error } }) => (
                                            <TextField
                                                fullWidth
                                                label="End Time"
                                                type="time"
                                                value={minutesToTime(field.value)}
                                                onChange={(e) => field.onChange(timeToMinutes(e.target.value))}
                                                InputLabelProps={{ shrink: true }}
                                                error={!!error}
                                                helperText={error?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>

                            <Controller
                                name="break_minutes"
                                control={control}
                                rules={{
                                    required: "Break duration is required",
                                    min: { value: 0, message: "Break duration must be at least 0 minutes" },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Break Duration (minutes)"
                                        type="number"
                                        inputProps={{ min: 0 }}
                                        error={!!error}
                                        helperText={error?.message}
                                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                    />
                                )}
                            />





                            <Stack direction="row" spacing={1} sx={{ pt: 2 }}>
                                <Button type="submit" variant="contained" fullWidth>
                                    Create Template
                                </Button>
                                <Button variant="outlined" onClick={handleCloseDialog} fullWidth>
                                    Cancel
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen2} onClose={handleCloseDialog2} maxWidth="sm" fullWidth>
                <DialogTitle>Assign Shift</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit2(AssignEmployee)} sx={{ pt: 1 }}>
                        <Box spacing={3}>
                            <InputLabel sx={{ textTransform: "capitalize", textAlign: 'left', fontWeight: 700, color: Colors.gray }}>Assign Shift</InputLabel>
                            <Controller
                                name="selectedEmployees"
                                control={control}
                                defaultValue=""
                                rules={{ required: "Please select at least one employee" }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormControl fullWidth size="small"

                                        sx={{
                                            mt: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                paddingRight: '8px',
                                                height: '40px',
                                                borderColor: '#000',
                                            },
                                            '& .MuiSelect-select': {
                                                padding: '10px 14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#000',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#000',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#000',
                                            },
                                        }} error={!!error}>

                                        <Select
                                            labelId="employee-multi-label"
                                            multiple
                                            value={field.value ? field.value.split(',') : []} // Convert comma string to array
                                            onChange={(e) => {
                                                const selectedIds = e.target.value;
                                                setSelectedEmployees(selectedIds.join(','))
                                                field.onChange(selectedIds.join(',')); // Convert back to comma string
                                            }}
                                            renderValue={(selected) =>
                                                selected
                                                    .map((id) => employees.find((emp) => emp.id.toString() === id)?.name)
                                                    .filter(Boolean)
                                                    .join(', ')

                                            }
                                        >
                                            {employees.map((emp) => (
                                                <MenuItem key={emp.id} value={emp.id.toString()}>
                                                    <Checkbox checked={(field.value?.split(',') || []).includes(emp.id.toString())} />
                                                    <ListItemText primary={emp.name} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {error && (
                                            <FormHelperText>{error.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />


                            <Box mt={2}>
                                <DatePicker
                                    label={"From Date"}
                                    disableFuture={true}
                                    size="small"
                                    value={fromDate}
                                    onChange={(date) => setFromDate(new Date(date))}
                                />
                            </Box>
                            <Box >
                                <DatePicker
                                    label={"To Date"}

                                    disableFuture={true}
                                    size="small"
                                    value={toDate}
                                    onChange={(date) => setToDate(new Date(date))}
                                />
                            </Box>










                            <Stack direction="row" spacing={1} sx={{ pt: 2 }}>
                                <Button type="submit" variant="contained" fullWidth>
                                    Assign Shift
                                </Button>
                                <Button variant="outlined" onClick={handleCloseDialog2} fullWidth>
                                    Cancel
                                </Button>
                            </Stack>
                        </Box>

                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    )
}

export default ShiftManagement
