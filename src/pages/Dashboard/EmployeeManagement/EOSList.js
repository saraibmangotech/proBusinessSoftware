import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid, InputLabel,
    FormControl,
    Select,
    MenuItem,
    ListItemText,
    Tooltip,
    Checkbox,
    InputAdornment,
    TextField,
} from '@mui/material';
import { AllocateIcon, CheckIcon, EyeIcon, FontFamily, Images, MessageIcon, PendingIcon, RequestBuyerIdIcon } from 'assets';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import FinanceStatusDialog from 'components/Dialog/FinanceStatusDialog';
import AllocateStatusDialog from 'components/Dialog/AllocateStatusDialog';
import AllocateDialog from 'components/Dialog/AllocateDialog';
import CustomerServices from 'services/Customer';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { Debounce, encryptData, formatPermissionData, handleExportWithComponent } from 'utils';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { addPermission } from 'redux/slices/navigationDataSlice';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import { PrimaryButton, SwitchButton } from 'components/Buttons';
import SelectField from 'components/Select';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import DataTable from 'components/DataTable';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';
import { useAuth } from 'context/UseContext';
import FinanceServices from 'services/Finance';
import BuildIcon from '@mui/icons-material/Build';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
    border: 0,

}));

const Cell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        fontSize: 14,
        fontFamily: 'Public Sans',
        border: '1px solid #EEEEEE',
        padding: '15px',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        color: '#434343',
        paddingRight: '50px',
        background: 'transparent',
        fontWeight: 'bold'

    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontFamily: 'Public Sans',

        textWrap: 'nowrap',
        padding: '5px !important',
        paddingLeft: '15px !important',

        '.MuiBox-root': {
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            justifyContent: 'center',
            '.MuiBox-root': {
                cursor: 'pointer'
            }
        },
        'svg': {
            width: 'auto',
            height: '24px',
        },
        '.MuiTypography-root': {
            textTransform: 'capitalize',
            fontFamily: FontFamily.NunitoRegular,
            textWrap: 'nowrap',
        },
        '.MuiButtonBase-root': {
            padding: '8px',
            width: '28px',
            height: '28px',
        }
    },
}));

const useStyles = makeStyles({
    loaderWrap: {
        display: 'flex',
        height: 100,
        '& svg': {
            width: '40px !important',
            height: '40px !important'
        }
    }
})

function EOSList() {

    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [status, setStatus] = useState(null)
    const [statusDialog, setStatusDialog] = useState(false)
    const [statusDialog2, setStatusDialog2] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const [tableLoader, setTableLoader] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [inputError, setInputError] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(dayjs().subtract(1, "month"));


    const { user } = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        reset,
    } = useForm();
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        formState: { errors: errors2 },
        setValue: setValue2,
        getValues: getValues2,
        reset: reset2,
        watch: watch2
    } = useForm();

    const password = watch2("password")
    const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Token Number.', key: '' }, { name: 'Customer ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]
    // *For Update Account Status
    const updateAccountStatus = async (id, status) => {
        const shallowCopy = [...customerQueue];
        let accountIndex = shallowCopy.findIndex(item => item.id == id);

        if (accountIndex != -1) {
            shallowCopy[accountIndex].is_active = status;
        }

        setCustomerQueue(shallowCopy)


        try {
            let obj = {
                user_id: id,
                is_active: status
            }


            const promise = FinanceServices.updateEmployee(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );


            // getAccounts()
        } catch (error) {
            showErrorToast(error)
        }
    }

    const [loader, setLoader] = useState(false);

    const [confirmationDialog, setConfirmationDialog] = useState(false)

    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);



    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);



    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false)
    const [sort, setSort] = useState('desc')

    // *For Get Customer Queue



    const getCustomerQueue = async (date) => {
        setLoader(true)
        console.log(selectedMonth, 'selectedMonth');


        try {

            let params = {
                month: date ? moment(date).month() + 1 :  moment(selectedMonth).month() ,
                year: date ? moment(date).year() : moment().year(),
                limit: 999999,



            }

            const { data } = await CustomerServices.getEos(params)
            setCustomerQueue(data?.eos?.rows)

        } catch (error) {
            showErrorToast(error)
        } finally {
            setLoader(false)
        }
    }






    const handleSort = (key) => {
        let data = {
            sort_by: key,
            sort_order: sort
        }
        Debounce(() => getCustomerQueue(1, '', data));
    }

  useEffect(() => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  getCustomerQueue(oneMonthAgo);
}, []);

    // *For Handle Filter

    const handleFilter = () => {
        let data = {
            search: getValues('search')
        }
        Debounce(() => getCustomerQueue(1, '', data));
    }
    const handleDelete = async (item) => {


        try {
            let params = { reception_id: selectedData?.id }


            const { message } = await CustomerServices.deleteReception(params)

            SuccessToaster(message);
            getCustomerQueue()
        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }
    const UpdateStatus = async () => {
        try {
            let obj = {
                id: selectedData?.id,
                status: status?.id,

            };

            const promise = CustomerServices.updateEOSStatus(obj);
            console.log(promise);

            showPromiseToast(
                promise,
                "Saving...",
                "Added Successfully",
                "Something Went Wrong"
            );

            // Await the promise and then check its response
            const response = await promise;
            if (response?.responseCode === 200) {
                setStatusDialog(false);
                setStatus(null)
                getCustomerQueue(new Date());
                reset()
            }
        } catch (error) {
            console.log(error);
        }
    };

    const UpdateStatus2 = async () => {
        try {
            let obj = {
                user_id: selectedData?.user_id,
                password: getValues2('password'),

            };

            const promise = CustomerServices.updateEmployeePassword(obj);
            console.log(promise);

            showPromiseToast(
                promise,
                "Saving...",
                "Added Successfully",
                "Something Went Wrong"
            );

            // Await the promise and then check its response
            const response = await promise;
            if (response?.responseCode === 200) {
                setStatusDialog2(false);
                setStatus(null)
                getCustomerQueue();
                reset2()
            }
        } catch (error) {
            console.log(error);
        }
    };
    const columns = [
        {
            header: "SR No.",
            accessorKey: "id",

        },
        // {
        //     header: "Employee Count",
        //     accessorKey: "employee_count",
        //     cell: ({ row }) => (
        //         <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
        //             {row?.original?.employee_count}
        //         </Box>
        //     ),
        // },

        {
            header: "Month",
            accessorKey: "month", // ✅ Corrected for search
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment().month(row?.original?.month - 1).format("MMMM")}
                </Box>
            ),
        },
        {
            header: "Year",
            accessorKey: "year", // ✅ Corrected for search
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.year}
                </Box>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => {
                const status = row?.original?.status?.toUpperCase();

                // Define color for each status
                const statusColorMap = {
                    APPROVED: "#4caf50", // green
                    PENDING: "#ff9800",  // orange
                    REJECTED: "#f44336", // red
                };

                return (
                    <Box
                        component={'div'}
                        onClick={() => {
                            setSelectedData(row?.original);
                            if (status === 'PENDING') {
                                setStatusDialog(true);
                            }
                        }}
                        sx={{
                            cursor: "pointer",
                            display: "flex",
                            gap: 2,
                            color: statusColorMap[status] || "black", // fallback to black
                            fontWeight: 600,
                            textTransform: "capitalize"
                        }}
                    >
                        {row?.original?.status}
                    </Box>
                );
            },
        },


        {
            header: "Actions",
            cell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 1 }}>


                    {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/eos-detail/${row?.original?.id}`); localStorage.setItem("currentUrl", '/customer-detail'); }} src={Images.detailIcon} width={'35px'}></Box>}
                    {row?.original?.status == 'Pending' && <Box
                        component="img"
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                            navigate(`/update-eos/${row?.original?.id}`);
                            localStorage.setItem("currentUrl", '/update-customer');
                        }}
                        src={Images.editIcon}
                        width="35px"
                    />}
                </Box>
            ),
        },
    ];






    return (
        <Box sx={{ p: 3 }}>
            <SimpleDialog open={statusDialog2} onClose={() => setStatusDialog2(false)} title={"Change Password?"}>
                <Box component="form" onSubmit={handleSubmit2(UpdateStatus2)}>
                    <Grid container spacing={2}>

                        <Grid item xs={12} sm={12}>
                            <InputField
                                size="small"
                                label="Password :*"
                                type={showPassword ? "text" : "password"}
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
                                error={errors2.password?.message || (inputError && "You have entered an invalid email or password.")}
                                register={register2("password", {
                                    required: "Please enter the password.",
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <InputField
                                size="small"
                                label="Confirm Password :*"
                                type={showConfirmPassword ? "text" : "password"}
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
                                error={
                                    errors2.confirmpassword?.message || (inputError && "You have entered an invalid email or password.")
                                }
                                register={register2("confirmpassword", {
                                    required: "Please enter the confirm password.",
                                    validate: (value) => value === password || "Passwords do not match.",
                                })}
                            />
                        </Grid>
                        <Grid container sx={{ justifyContent: "center" }}>
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
                                <PrimaryButton bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => setStatusDialog2(false)} bgcolor={"#FF1F25"} title="No,Cancel" />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>
            <SimpleDialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
                title={"Change Status?"}
            >
                <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={"small"}
                                label={"Status "}
                                options={[
                                    { id: "Pending", name: "Pending" },
                                    { id: "Approved", name: "Approved" },
                                    { id: "Rejected", name: "Rejected" },



                                ]}
                                selected={status}
                                onSelect={(value) => {
                                    setStatus(value);
                                }}
                                error={errors?.status?.message}
                                register={register("status", {
                                    required: "Please select status.",
                                })}
                            />
                        </Grid>

                        <Grid container sx={{ justifyContent: "center" }}>
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
                                <PrimaryButton
                                    bgcolor={Colors.primary}
                                    title="Yes,Confirm"
                                    type="submit"
                                />
                                <PrimaryButton
                                    onClick={() => setStatusDialog(false)}
                                    bgcolor={"#FF1F25"}
                                    title="No,Cancel"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>
            <ConfirmationDialog
                open={confirmationDialog}
                onClose={() => setConfirmationDialog(false)}
                message={"Are You Sure?"}
                action={() => {
                    setConfirmationDialog(false);
                    handleDelete()

                }}
            />



            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Final Statement List</Typography>
                {user?.role_id == 6 && <PrimaryButton
                    bgcolor={'#001f3f'}
                    title="Create "
                    onClick={() => { navigate('/create-eos'); localStorage.setItem("currentUrl", '/create-customer') }}
                    loading={loading}
                />}


            </Box>
            <Grid container xs={12} spacing={2}>



                <Grid item xs={6}>
                    <Box sx={{ mb: 3 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                views={['year', 'month']}

                                label="Select Month & Year"
                                minDate={dayjs('2000-01-01')}
                                maxDate={dayjs('2100-12-31')}
                                value={selectedMonth}
                                onChange={(newValue) => {
                                    setSelectedMonth(newValue); console.log(newValue, 'newValuenewValue');
                                    getCustomerQueue(new Date(newValue))
                                }}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Box>
                </Grid>

            </Grid>
            {/* Filters */}
            <Box >


                {<DataTable loading={loader} data={customerQueue} columns={columns} />}
            </Box>

        </Box>
    );
}

export default EOSList;