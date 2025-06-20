import React, { useEffect, useState } from "react";
import { Box, Divider, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Grid, IconButton, InputAdornment, ListItemText, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Images, SvgIcon, SvgIcon as SvgIconss } from 'assets';
import { useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { useTheme } from '@mui/material/styles';
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import RoleServices from "services/Role";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import SelectField from "components/Select";
import UserServices from "services/User";
import SystemServices from "services/System";
import { useCallbackPrompt } from "hooks/useCallBackPrompt";
import CustomerServices from "services/Customer";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { InputLabel } from "@mui/material";
import { Checkbox } from "@mui/material";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DatePicker from "components/DatePicker";
import { TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import moment from "moment";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};
// function PasswordIcon(props) {
// 	return (
// 		<SvgIcon className='saraib' {...props}>
// 			<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
// 				<path d="M16.1163 8.29886C16.9177 8.63783 17.6589 9.08308 18.3311 9.62599V5.78823C18.3311 2.59681 15.7343 0 12.5429 0H12.4538C9.26526 0 6.66846 2.59681 6.66846 5.78823V9.62599C7.34064 9.0831 8.08176 8.63786 8.88321 8.29886C9.09865 8.20694 9.31984 8.12364 9.54103 8.04895V5.78823C9.54103 4.17959 10.8481 2.87257 12.4567 2.87257H12.5457C14.1544 2.87257 15.4614 4.17959 15.4614 5.78823V8.05182C15.6797 8.12364 15.9009 8.20694 16.1163 8.29886Z" fill="#B6B6B6" />
// 				<path d="M4.35889 16.8591C4.35889 21.3547 8.00418 24.9999 12.4998 24.9999C16.9953 24.9999 20.6407 21.3575 20.6407 16.8591C20.6407 14.6501 19.7587 12.645 18.3311 11.1771C17.5268 10.3527 16.5501 9.69772 15.4585 9.26974C14.5422 8.91067 13.5425 8.71533 12.4998 8.71533C11.457 8.71533 10.4574 8.91067 9.54104 9.26974C8.44946 9.69488 7.47278 10.3498 6.66846 11.1771C5.23789 12.645 4.35889 14.6501 4.35889 16.8591ZM10.4028 15.216C10.4315 14.1043 11.3363 13.1994 12.448 13.1735C13.6286 13.1448 14.5967 14.0957 14.5967 15.2705C14.5967 15.3941 14.5852 15.5147 14.5651 15.6296C14.4616 16.2242 14.1084 16.7355 13.6142 17.0458C13.4103 17.1751 13.3069 17.4163 13.3586 17.649L13.982 20.6049C14.0194 20.783 13.8843 20.9525 13.7005 20.9525H11.299C11.1152 20.9525 10.9801 20.7859 11.0175 20.6049L11.6408 17.649C11.6897 17.4135 11.5891 17.1722 11.3852 17.0429C10.8911 16.7327 10.5378 16.2242 10.4343 15.6267C10.4114 15.4946 10.3999 15.3567 10.4028 15.216Z" fill="#B6B6B6" />
// 			</svg>
// 		</SvgIcon>
// 	);
// }

function UpdateEmployee() {
    const [handleBlockedNavigation] =
        useCallbackPrompt(false)
    const navigate = useNavigate();
    const { id } = useParams()

    const { register, handleSubmit, formState: { errors }, control, getValues, watch, setError, setValue, reset,
        clearErrors, } = useForm({
            defaultValues: {
                overtime: '', // include all controlled fields here
                leftJob: '',
                // other fields
            },
        });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [inputError, setInputError] = useState(false);
    const [roles, setRoles] = useState([])
    const [selectedRole, setSelectedRole] = useState(null)
    const [buttondisabled, setButtondisabled] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState([])
    const [categories, setCategories] = useState([])
    const [dob, setDob] = useState(null)
    const [doj, setDoj] = useState(null)
    const [airFareDueDate, setAirFareDueDate] = useState(null)
    const [probEndDate, setProbEndDate] = useState(null)
    const [leavingDate, setLeavingDate] = useState(null)
    const [isActive, setIsActive] = useState('');
    const [leftJob, setLeftJob] = useState('');
    const [overtime, setOvertime] = useState('');
    const [costCenters, setCostCenters] = useState([])
    const [selectedCostCenter, setSelectedCostCenter] = useState(null)
    const [isLocal, setisLocal] = useState(true)
    const theme = useTheme();
    function getStyles(name, personName, theme) {
        return {
            fontWeight: personName.includes(name)
                ? theme.typography.fontWeightMedium
                : theme.typography.fontWeightRegular,
        };
    }
    // Watch both password and confirm password fields for changes
    const password = watch('password', '');
    const confirmPassword = watch('confirmpassword', '');
    console.log(watch());

    const [personName, setPersonName] = React.useState([]);

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;

        const selected = typeof value === 'string' ? value.split(',') : value;

        const selectedObjects = categories.filter((item) => selected.includes(item.label));

        setPersonName(selectedObjects); // Now you're storing the whole objects
    };


    const getRoles = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 999999,
                search: search,
            };
            const { data } = await SystemServices.getRoles(params);
            setRoles(data?.roles?.rows)
        } catch (error) {
            showErrorToast(error);
        }
    };


    // *For Create Role
    const UpdateEmployee = async (formData) => {
        console.log(selectedCategoryObjects);

        setLoading(true)
        setButtondisabled(true)
        console.log(formData);
        try {
            let obj = {
                id: id,
                name: getValues('name'),
                employee_id: getValues('id'),
                email: getValues('email'),
                phone: getValues('phone'),
                password: getValues('password'),
                permittedCategories: selectedRole?.name == 'Typist' ? selectedCategoryObjects : null,
                role_id: selectedRole?.id,
                employee_detail: {
                    date_of_joining: doj,
                    date_of_birth: dob,
                    probation_period_months: formData?.probation,
                    probation_end_date: probEndDate,
                    employment_status: formData?.status,
                    shift_start: moment(formData?.shiftStartTime).format('HH:mm'),
                    shift_end: moment(formData?.shiftEndTime).format('HH:mm'),

                    grace_period_minutes: formData?.graceMonths,
                    minimum_required_hours: formData?.minHours,
                    short_time_deduction_type: formData?.shortTimeDec,
                    personal_time_minutes_per_month: formData?.personalMintPerMonth,
                    leave_allocation_per_month: formData?.leavesPerMonth,
                    eligible_for_airfare: formData?.eligibleForAirfare == 'yes' ? true : false,
                    airfare_cycle_years: formData?.airfaireCycleYear,
                    next_airfare_due_date: airFareDueDate,
                    basic_salary: formData?.basicSalary,
                    designation: formData?.designation,
                    department: formData?.department,
                    is_active: isActive == 'yes' ? true : false,
                    is_overtime_eligible: overtime == 'yes' ? true : false,
                    has_left_job: leftJob == 'yes' ? true : false,
                    date_of_leaving: leavingDate,
                    leaving_reason: formData?.reason,
                    branch: formData?.branch,
                    visa: formData?.visa,
                    work_permit: formData?.work_permit,
                    iban: formData?.iban,
                    routing: formData?.routing,
                    is_local: isLocal,
                    cost_center: selectedCostCenter?.name
                }

            }


            console.log(obj);
            const promise = UserServices.UpdateEmployee(obj);

            showPromiseToast(
                promise,
                'Saving ...',
                'Success',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                navigate('/employee-list')
            }


        } catch (error) {
            setButtondisabled(false)
            // showErrorToast(error)
        } finally {
            setLoading(false)
        }
    }
    // *For Get Customer Queue
    const getCategoryList = async (page, limit, filter) => {


        try {

            let params = {
                page: 1,
                limit: 999999,


            }

            const { data } = await CustomerServices.getCategoryList(params)
            setCategories(data?.categories);



        } catch (error) {
            showErrorToast(error)
        }
    }
    const parseTime = (timeString) => {
        return timeString && moment(timeString, 'HH:mm').isValid()
            ? moment(timeString, 'HH:mm')
            : null;
    };


    const getData = async () => {
        try {
            let params = { user_id: id };
            const { data } = await CustomerServices.getEmployeeDetail(params);
            let data2 = data?.employee
            console.log(data2, 'datadata');

            const employee = data2 || {};
            const details = data2 || {};
            console.log(details, 'details');

            setValue('name', employee?.user?.name || '');
            setValue('id', employee?.user?.employee_id || '');
            setValue('email', employee?.user?.email || '');
            setValue('phone', employee?.user?.phone || '');
            setValue('password', ''); // Usually not returned

            setValue('shiftStartTime', details?.shift_start ? moment(details?.shift_start, 'HH:mm') : null);
            setValue('shiftEndTime', details?.shift_end ? moment(details?.shift_end, 'HH:mm') : null);
            setValue('probation', details?.probation_period_months || '');
            setValue('status', details?.employment_status || '');
            setValue('graceMonths', details?.grace_period_minutes || '');
            setValue('minHours', details?.minimum_required_hours || '');
            setValue('shortTimeDec', details?.short_time_deduction_type || '');
            setValue('personalMintPerMonth', details?.personal_time_minutes_per_month || '');
            setValue('leavesPerMonth', details?.leave_allocation_per_month || '');
            setValue('eligibleForAirfare', details?.eligible_for_airfare ? 'yes' : 'no');
            setValue('airfaireCycleYear', details?.airfare_cycle_years || '');
            setValue('basicSalary', details?.basic_salary || '');
            setValue('designation', details?.designation || '');
            setValue('department', details?.department || '');
            setIsActive(details?.is_active ? 'yes' : 'no')
            setOvertime(details?.is_overtime_eligible ? "yes" : "no")
            setLeftJob(details?.has_left_job ? "yes" : "no")
            setValue('isActive', details?.is_active ? 'yes' : 'no');
            setValue("leftJob", details?.has_left_job ? "yes" : "no");
            setValue("overtime", details?.is_overtime_eligible ? "yes" : "no");
            setValue('reason', details?.leaving_reason || '');
            setValue('iban', details?.iban || '');
            setValue('branch', details?.branch || '');
            setValue('visa', details?.visa || '');
            setValue('work_permit', details?.iban || '');
            setValue('routing', details?.routing || '');
            setisLocal( details?.is_local)
            setSelectedCostCenter({id:details?.cost_center,name:details?.cost_center})
            console.log(moment(details?.date_of_birth).format('MM/DD/YYYY'));

            setDob(details?.date_of_birth ? new Date(details?.date_of_birth) : null)
            setValue('dob', details?.date_of_birth ? new Date(details?.date_of_birth) : null);
            setDoj(details?.date_of_birth ? new Date(details?.date_of_joining) : null)
            setValue('doj', details?.date_of_joining ? new Date(details?.date_of_joining) : null);
            // setValue('doj', details?.date_of_joining ? moment(details?.date_of_joining) : null);
            // setValue('leavingDate', details?.date_of_leaving ? moment(details?.date_of_leaving) : null);
            setLeavingDate(details?.date_of_leaving ? new Date(details?.date_of_leaving) : null)
            setValue('leavingDate', details?.date_of_leaving ? new Date(details?.date_of_leaving) : null);
            setProbEndDate(details?.probation_end_date ? new Date(details?.probation_end_date) : null)
            setValue('probEndDate', details?.probation_end_date ? new Date(details?.probation_end_date) : null);
            setAirFareDueDate(details?.probation_end_date ? new Date(details?.next_airfare_due_date) : null)
            setValue('airFareDueDate', details?.next_airfare_due_date ? new Date(details?.next_airfare_due_date) : null);


        } catch (error) {
            console.error("Error fetching employee data:", error);
        }
    };
    const getCostCenters = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await CustomerServices.getCostCenters(params);
            setCostCenters(data?.cost_centers);

        } catch (error) {
            showErrorToast(error);
        }
    };
    useEffect(() => {
        getCostCenters()
        getData()
        getCategoryList()
        getRoles()
    }, [])

    const selectedCategoryObjects = categories.filter((category) => selectedCategory.includes(category.id))

    // Handle checkbox change
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory((prev) => {
            if (prev.includes(categoryId)) {
                // Remove if already selected
                return prev.filter((id) => id !== categoryId)
            } else {
                // Add if not selected
                return [...prev, categoryId]
            }
        })
    }




    return (
        <Box sx={{ p: 3, borderRadius: 3, backgroundColor: 'white !important', boxShadow: ' rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>

            <Box component="form" onSubmit={handleSubmit(UpdateEmployee)} >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
                    <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >Update Employee</Typography>

                </Box>
                <Box>
                    <Box display="flex" alignItems="center" mt={2}>
                        <PersonOutlineIcon sx={{ fontSize: 20, mr: 1, color: '#2f3b52' }} />
                        <Typography variant="subtitle1" sx={{ color: '#2f3b52' }}>
                            Personal Info
                        </Typography>
                    </Box>
                    <Divider mt={1} sx={{ borderColor: '#2f3b52' }} />
                </Box>
                <Grid container spacing={0} mt={3} p={1} gap={'0px 20px'} >

                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Name :*"}
                            size={'small'}
                            placeholder={" Name"}
                            error={errors?.name?.message}
                            register={register("name", {
                                required:
                                    "Please enter name."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Employee ID :*"}
                            size={'small'}
                            placeholder={" Employee ID "}
                            error={errors?.id?.message}
                            register={register("id", {
                                required:
                                    "Please enter id."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={"Email :"}
                            size={'small'}
                            placeholder={"Email"}
                            error={errors?.email?.message}
                            register={register("email", {
                                required: false,
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Please enter a valid email address."
                                }
                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={"Phone :*"}
                            size={'small'}
                            placeholder={"Phone "}
                            type={'number'}
                            error={errors?.phone?.message}
                            register={register("phone", {
                                required:
                                    false,
                                pattern: {
                                    value: /^05[0-9]{8}$/,
                                    message: "Please enter a valid UAE phone number (starting with 05 and 8 digits)."
                                }

                            })}
                        />


                    </Grid>




                    <Grid item xs={12} sm={2.8}>
                        <DatePicker
                            label={"DOB:*"}
                            value={dob}
                            size={"small"}
                            error={errors?.dob?.message}
                            register={register("dob", {
                                required: dob ? false : 'Date is required'
                            })}
                            onChange={(date) => {
                                setValue("dob", date)
                                setDob(new Date(date))

                            }}
                        />
                    </Grid>


                    {/* <Grid item xs={12} sm={2.8}>
                        <InputField
                            size="small"
                            label="Password :*"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter Your Password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <Visibility color="primary" /> : <VisibilityOff color="primary" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            error={errors.password?.message || (inputError && 'You have entered an invalid email or password.')}
                            register={register('password', {
                                required: 'Please enter the password.',
                            })}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            size="small"
                            label="Confirm Password :*"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Enter Your Confirm Password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton edge="end" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? <Visibility color="primary" /> : <VisibilityOff color="primary" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            error={errors.confirmpassword?.message || (inputError && 'You have entered an invalid email or password.')}
                            register={register('confirmpassword', {
                                required: 'Please enter the confirm password.',
                                validate: value => value === password || 'Passwords do not match.',
                            })}
                        />

                    </Grid> */}
                    {selectedRole?.name === 'Typist' && (
                        <Grid item xs={12} sm={12}>

                            <Typography variant="h5" gutterBottom>
                                Select Categories
                            </Typography>

                            {selectedRole?.name === "Typist" && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={5}>
                                        <FormGroup>
                                            {categories?.map((category) => (
                                                <FormControlLabel
                                                    key={category.id}
                                                    control={
                                                        <Checkbox
                                                            checked={selectedCategory?.includes(category.id)}
                                                            onChange={() => handleCategoryChange(category.id)}
                                                        />
                                                    }
                                                    label={category.name}
                                                />
                                            ))}
                                        </FormGroup>
                                    </Grid>


                                </Grid>
                            )}

                        </Grid>
                    )}
                </Grid>
                <Box>
                    <Box display="flex" alignItems="center" mt={2}>
                        <PersonOutlineIcon sx={{ fontSize: 20, mr: 1, color: '#2f3b52' }} />
                        <Typography variant="subtitle1" sx={{ color: '#2f3b52' }}>
                            Employeement Info
                        </Typography>
                    </Box>
                    <Divider mt={1} sx={{ borderColor: '#2f3b52' }} />
                </Box>
                <Grid container spacing={0} mt={3} p={1} gap={'0px 20px'} >

                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Employeement Status :*"}
                            size={'small'}
                            placeholder={" Status"}
                            error={errors?.status?.message}
                            register={register("status", {
                                required:
                                    "Please enter status."

                            })}
                        />


                    </Grid>


                    <Grid item xs={12} sm={2.8}>
                        <DatePicker
                            label={"Date of Joining:*"}
                            value={doj}
                            size={"small"}
                            error={errors?.doj?.message}
                            register={register("doj", {
                                required: doj ? false : 'Date is required'
                            })}
                            onChange={(date) => {
                                setValue("doj", date)
                                setDoj(new Date(date))

                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Probation Period Months :*"}
                            size={'small'}
                            placeholder={" probation"}
                            error={errors?.probation?.message}
                            register={register("probation", {
                                required:
                                    "Please enter probation."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <DatePicker
                            label={"Probation Period End Date:*"}
                            value={probEndDate}
                            size={"small"}
                            error={errors?.probEndDate?.message}
                            register={register("probEndDate", {
                                required: probEndDate ? false : 'Date is required'
                            })}
                            onChange={(date) => {
                                setValue("probEndDate", date)
                                setProbEndDate(new Date(date))

                            }}
                        />
                    </Grid>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid item xs={12} sm={2.8}>
                            <InputLabel
                                error={!!errors.shiftStartTime}
                                sx={{ textTransform: "capitalize", textAlign: "left", fontWeight: 700, color: Colors.gray }}
                            >
                                Shift Start Time:*
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
                                                    }
                                                }
                                            }}
                                            value={value}
                                            onChange={(newValue) => {
                                                if (newValue && newValue.isValid && newValue.isValid()) {
                                                    console.log("Selected Time (24-hour):", moment(newValue.toDate()).format("HH:mm"));
                                                } else {
                                                    console.log("Invalid time selected");
                                                }
                                                onChange(newValue);
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
                                                            '& fieldset': { border: "1px solid black !important" },
                                                            "&.Mui-focused svg path": {
                                                                fill: "#0076bf"
                                                            }
                                                        }
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

                        {/* Shift End Time */}
                        <Grid item xs={12} sm={2.8}>
                            <InputLabel
                                error={!!errors.shiftEndTime}
                                sx={{ textTransform: "capitalize", textAlign: "left", fontWeight: 700, color: Colors.gray }}
                            >
                                Shift End Time:*
                            </InputLabel>
                            <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                                <Controller
                                    name="shiftEndTime"
                                    control={control}
                                    rules={{ required: "Shift End Time is required" }}
                                    render={({ field: { onChange, value } }) => (
                                        <TimePicker
                                            value={value}
                                            slotProps={{
                                                textField: {
                                                    sx: {
                                                        borderRadius: "10px !important",
                                                        border: "2px solid black !important",
                                                    }
                                                }
                                            }}
                                            onChange={(newValue) => {
                                                if (newValue && newValue.isValid && newValue.isValid()) {
                                                    console.log("Selected Time (24-hour):", moment(newValue.toDate()).format("HH:mm"));
                                                } else {
                                                    console.log("Invalid time selected");
                                                }
                                                onChange(newValue);
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
                                                            '& fieldset': { border: "none !important" },
                                                            "&.Mui-focused svg path": {
                                                                fill: "#0076bf"
                                                            }
                                                        }
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
                    </LocalizationProvider>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Grace Period Minutes :*"}
                            size={'small'}
                            placeholder={"Grace Period Minutes"}
                            error={errors?.graceMonths?.message}
                            register={register("graceMonths", {
                                required:
                                    "Please enter graceMonths."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={"Minimum Required Hours :*"}
                            size={'small'}
                            placeholder={"Minimum Required Hours"}
                            error={errors?.minHours?.message}
                            register={register("minHours", {
                                required:
                                    "Please enter min hours."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={"Short Time Deduction Time :*"}
                            size={'small'}
                            placeholder={"Short Time Deduction Time"}
                            error={errors?.shortTimeDec?.message}
                            register={register("shortTimeDec", {
                                required:
                                    "Please enter short time deduction."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={"Personal Time Minutes Per Month :*"}
                            size={'small'}
                            placeholder={"Personal Time Minutes Per Month"}
                            error={errors?.personalMintPerMonth?.message}
                            register={register("personalMintPerMonth", {
                                required:
                                    "Please enter personal time mint per month."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={"Leaves Allocation Per Month :*"}
                            size={'small'}
                            type={'number'}
                            placeholder={"Leaves Allocation Per Month"}
                            error={errors?.leavesPerMonth?.message}
                            register={register("leavesPerMonth", {
                                required:
                                    "Please enter leaves per month."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"Branch:*"}
                            size="small"
                            placeholder="Branch"
                            error={errors?.branch?.message}
                            register={register("branch", {
                                required: "Please enter branch.",
                            })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"Visa:*"}
                            size="small"
                            placeholder="Visa"
                            error={errors?.visa?.message}
                            register={register("visa", {
                                required: "Please enter visa.",
                            })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"Work Permit:*"}
                            size="small"
                            placeholder="Work Permit"
                            error={errors?.work_permit?.message}
                            register={register("work_permit", {
                                required: "Please enter work permit.",
                            })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"IBAN:*"}
                            size="small"
                            placeholder="IBAN"
                            error={errors?.iban?.message}
                            register={register("iban", {
                                required: "Please enter IBAN.",
                            })}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <SelectField

                            size={"small"}
                            label={"Cost Center"}
                            options={costCenters}
                            selected={selectedCostCenter}
                            onSelect={(value) => {
                                setSelectedCostCenter(value);
                            }}
                            register={register("costCenter")}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"Routing:*"}
                            size="small"
                            placeholder="Routing"
                            error={errors?.routing?.message}
                            register={register("routing", {
                                required: "Please enter routing.",
                            })}
                        />
                    </Grid>
                </Grid>
                <Box>
                    <Box display="flex" alignItems="center" mt={2}>
                        <PersonOutlineIcon sx={{ fontSize: 20, mr: 1, color: '#2f3b52' }} />
                        <Typography variant="subtitle1" sx={{ color: '#2f3b52' }}>
                            Salary Info
                        </Typography>
                    </Box>
                    <Divider mt={1} sx={{ borderColor: '#2f3b52' }} />
                </Box>
                <Grid container spacing={0} mt={3} p={1} gap={'0px 20px'} >




                    <Grid item xs={12} sm={2.8}>
                        <InputLabel sx={{ fontWeight: 700, color: "#434343", mb: 1 }}>Is Active :*</InputLabel>
                        <Controller
                            name="isActive"
                            control={control}
                            rules={{ required: "Please select an option" }}
                            render={({ field }) => (
                                <RadioGroup
                                    row
                                    {...field}
                                    value={isActive}
                                    onChange={(e) => {
                                        setIsActive(e.target.value);
                                        field.onChange(e);
                                    }}
                                >
                                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            )}
                        />
                        {errors.isActive && <Typography color="error" sx={{ fontSize: 12 }}>{errors.isActive.message}</Typography>}
                    </Grid>

                    {/* Has Left Job */}
                    <Grid item xs={12} sm={2.8}>
                        <InputLabel sx={{ fontWeight: 700, color: "#434343", mb: 1 }}>Has Left Job :*</InputLabel>
                        <Controller
                            name="leftJob"
                            control={control}
                            rules={{ required: "Please select an option" }}
                            render={({ field }) => (
                                <RadioGroup
                                    row
                                    {...field}
                                    value={leftJob}
                                    onChange={(e) => {
                                        setLeftJob(e.target.value);
                                        field.onChange(e);
                                    }}
                                >
                                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            )}
                        />
                        {errors.leftJob && <Typography color="error" sx={{ fontSize: 12 }}>{errors.leftJob.message}</Typography>}
                    </Grid>

                    {/* Overtime */}
                    <Grid item xs={12} sm={2.8}>
                        <InputLabel sx={{ fontWeight: 700, color: "#434343", mb: 1 }}>Overtime Eligible :*</InputLabel>
                        <Controller
                            name="overtime"
                            control={control}
                            rules={{ required: "Please select an option" }}
                            render={({ field }) => (
                                <RadioGroup
                                    row
                                    {...field}
                                    value={overtime}
                                    onChange={(e) => {
                                        setOvertime(e.target.value);
                                        field.onChange(e);
                                    }}
                                >
                                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            )}
                        />
                        {errors.overtime && <Typography color="error" sx={{ fontSize: 12 }}>{errors.overtime.message}</Typography>}
                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <InputLabel sx={{ fontWeight: 700, color: "#434343", mb: 1 }}>Is Local :*</InputLabel>
                        <Controller
                            name="isLocal"
                            control={control}
                            rules={{ required: "Please select an option" }}
                            render={({ field }) => (
                                <RadioGroup
                                    row
                                    {...field}
                                    value={isLocal}
                                    onChange={(e) => {
                                        setisLocal(e.target.value);
                                        field.onChange(e);
                                    }}
                                >
                                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            )}
                        />
                        {errors.isLocal && <Typography color="error" sx={{ fontSize: 12 }}>{errors.isLocal.message}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={2.8}>
                        <DatePicker
                            label={"Next Airfare Due Date:*"}
                            value={airFareDueDate}
                            size={"small"}
                            error={errors?.AirFareDueDate?.message}
                            register={register("AirFareDueDate", {
                                required: airFareDueDate ? false : 'Date is required'
                            })}
                            onChange={(date) => {
                                setValue("AirFareDueDate", date)
                                setAirFareDueDate(new Date(date))

                            }}
                        />
                    </Grid>





                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Airfare Cycle Years :*"}
                            size={'small'}
                            placeholder={" Airfare Cycle Years "}
                            error={errors?.airfaireCycleYear?.message}
                            register={register("airfaireCycleYear", {
                                required:
                                    "Please enter airfaireCycleYear."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Basic Salary :*"}
                            size={'small'}
                            type={'number'}
                            placeholder={"  Basic Salary "}
                            error={errors?.basicSalary?.message}
                            register={register("basicSalary", {
                                required:
                                    "Please enter basic salary."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Designation :*"}
                            size={'small'}

                            placeholder={"  Designation "}
                            error={errors?.designation?.message}
                            register={register("designation", {
                                required:
                                    "Please enter designation."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Department :*"}
                            size={'small'}

                            placeholder={"  Department "}
                            error={errors?.department?.message}
                            register={register("department", {
                                required:
                                    "Please enter department."

                            })}
                        />


                    </Grid>


                    <Grid item xs={12} sm={2.8}>
                        <DatePicker
                            label={"Leaving Date:*"}
                            value={leavingDate}
                            size={"small"}
                            error={errors?.leavingDate?.message}
                            register={register("leavingDate", {
                                required: leavingDate ? false : 'Date is required'
                            })}
                            onChange={(date) => {
                                setValue("leavingDate", date)
                                setLeavingDate(new Date(date))

                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Leaving Reason :*"}
                            size={'small'}

                            placeholder={"  Leaving Reason "}
                            error={errors?.reason?.message}
                            register={register("reason", {
                                required:
                                    "Please enter reason."

                            })}
                        />


                    </Grid>
                </Grid>
                <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <PrimaryButton
                        bgcolor={'#001f3f'}
                        title="Update"
                        type={'submit'}
                        disabled={buttondisabled}

                    />

                </Box>
            </Box>

        </Box>
    );
}

export default UpdateEmployee;