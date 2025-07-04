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
import { PrimaryButton } from 'components/Buttons';
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

function LeaveList() {

    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [status, setStatus] = useState(null)
    const [statusDialog, setStatusDialog] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const [tableLoader, setTableLoader] = useState(false)
    const { user } = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        reset,
    } = useForm();

    const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Token Number.', key: '' }, { name: 'Customer ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]


    const [loader, setLoader] = useState(false);

    const [confirmationDialog, setConfirmationDialog] = useState(false)

    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);



    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [employeeData, setEmployeeData] = useState(null)



    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false)
    const [sort, setSort] = useState('desc')

    // *For Get Customer Queue



    const getCustomerQueue = async (page, limit, filter) => {
        setLoader(true)

        try {

            let params = {
                page: 1,
                limit: 999999,


            }

            const { data } = await CustomerServices.getLeaves(params)
            setCustomerQueue(data?.leaveRequests?.rows)

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


            const { message } = await CustomerServices.deleteLeave(params)

            SuccessToaster(message);
            getCustomerQueue()
        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }

    const getEmployeeDetail = async (id, newData) => {


        try {
            let params = { user_id: id }


            const { data } = await CustomerServices.getEmployeeDetail(params)

            console.log(data);
            setEmployeeData(data?.employee)
            let leaveBalance = Math.floor(data?.employee?.leaves_balance)
            let appliedDays = parseFloat(newData?.total_days)
            let approvedDays = appliedDays > leaveBalance ?
                leaveBalance :
                appliedDays
            console.log(appliedDays, 'appliedDays');
            setValue('leaves', leaveBalance)
            setValue('applied', appliedDays)
            setValue('approved',
                approvedDays)
            setValue('absent', appliedDays > leaveBalance ? leaveBalance - appliedDays : 0)
            setValue('balanced', Math.floor(leaveBalance) - approvedDays)


        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }
    const UpdateStatus = async () => {
        let appliedDays = parseFloat(selectedData?.total_days)
        let approvedDays = Math.floor(employeeData?.leaves_balance)
        try {
            let obj = {
                id: selectedData?.id,
                status: status?.id,
                hr_statement: getValues('statement'),
                user_id: selectedData?.user_id,
                approved_days: approvedDays,
                absent_days: appliedDays - approvedDays,
                balance_after: Math.floor(employeeData?.leaves_balance) - approvedDays,
            };

            const promise = CustomerServices.LeaveStatus(obj);
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
                getCustomerQueue();
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
        {
            header: "Name",
            accessorKey: "name",
            accessorFn: (row) => row?.employee?.name,
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.employee?.name}
                </Box>
            ),


        },
         {
            id: "created_at",
            header: "Requested Date",
            // Remove accessorKey and fix accessorFn to use row directly
            accessorFn: (row) => moment(row.created_at).format("DD/MM/YYYY"),
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment(row.original.created_at).format("DD/MM/YYYY")}
                </Box>
            ),
        },
        {
            id: "start_date",
            header: "Start Date",
            // Remove accessorKey and fix accessorFn to use row directly
            accessorFn: (row) => moment(row.start_date).format("DD/MM/YYYY"),
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment(row.original.start_date).format("DD/MM/YYYY")}
                </Box>
            ),
        },
        {
            id: "end_date",
            header: "End Date",
            // Remove accessorKey and fix accessorFn to use row directly
            accessorFn: (row) => moment(row.end_date).format("DD/MM/YYYY"),
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment(row.original.end_date).format("DD/MM/YYYY")}
                </Box>
            ),
        },
        {
            header: "Total Days",
            accessorKey: "total_days",


        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => (

                <Box sx={{ display: 'flex', gap: 1 }}>

                    { <Box
                        component={'div'}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => {
                            setSelectedData(row?.original)
                            getEmployeeDetail(row?.original?.user_id, row?.original)
                            if (row?.original?.status?.toLowerCase() == 'pending') {
                                setStatusDialog(true)
                            }

                        }}

                    >
                        {row?.original?.status} </Box>}

                    <Box>


                        {/* <Box component={'img'} src={Images.deleteIcon} width={'35px'}></Box>  */}
                    </Box>

                </Box>
            ),


        },




        {
            header: "Actions",
            cell: ({ row }) => (

                <Box sx={{ display: 'flex', gap: 1 }}>

                    {row?.original?.status?.toLowerCase() == 'pending' && <Box
                        component={'img'}
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                            navigate(`/update-leave/${row?.original?.id}`, {
                                state: row?.original
                            });
                        }}
                        src={Images.editIcon}
                        width={'35px'}
                    />}

                    <Box>


                        {/* <Box component={'img'} src={Images.deleteIcon} width={'35px'}></Box>  */}
                    </Box>

                </Box>
            ),
        },

    ]



    useEffect(() => {
        getCustomerQueue()
    }, []);

    return (
        <Box sx={{ p: 3 }}>

            <ConfirmationDialog
                open={confirmationDialog}
                onClose={() => setConfirmationDialog(false)}
                message={"Are You Sure?"}
                action={() => {
                    setConfirmationDialog(false);
                    handleDelete()

                }}
            />
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
                                label={"Select Status "}
                                options={

                                    [
                                        { id: 'Pending', name: "Pending" },
                                        { id: 'Approved', name: "Approved" },
                                        { id: 'Rejected', name: "Rejected" },
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
                        <Grid item xs={12} sm={12}>

                            <InputField
                                label={"Employee Leaves :"}
                                size={'small'}
                                disabled={true}
                                placeholder={"Employee Leaves "}
                                error={errors?.leaves?.message}
                                register={register("leaves", {
                                    required:
                                        "Please enter leaves."

                                })}
                            />


                        </Grid>
                        <Grid item xs={6} sm={6}>

                            <InputField
                                label={"Applied Days :"}
                                size={'small'}
                                disabled={true}
                                placeholder={"Applied Days "}
                                error={errors?.applied?.message}
                                register={register("applied", {
                                    required:
                                        "Please enter applied."

                                })}
                            />


                        </Grid>
                        <Grid item xs={6} sm={6}>

                            <InputField
                                label={"Approved Days :"}
                                size={'small'}
                                disabled={true}
                                placeholder={"Approved Days "}
                                error={errors?.approved?.message}
                                register={register("approved", {
                                    required:
                                        "Please enter approved."

                                })}
                            />


                        </Grid>
                        <Grid item xs={6} sm={6}>

                            <InputField
                                label={"Absent Days :"}
                                size={'small'}
                                disabled={true}
                                placeholder={"Absent Days "}
                                error={errors?.absent?.message}
                                register={register("absent", {
                                    required:
                                        "Please enter absent."

                                })}
                            />


                        </Grid>
                        <Grid item xs={6} sm={6}>

                            <InputField
                                label={"Balanced Days :"}
                                size={'small'}
                                disabled={true}
                                placeholder={"Balanced Days "}
                                error={errors?.balanced?.message}
                                register={register("balanced", {
                                    required:
                                        "Please enter balanced."

                                })}
                            />


                        </Grid>
                        <Grid item xs={12} sm={12}>

                            <InputField
                                label={"HR Statement :*"}
                                size={'small'}
                                multiline
                                rows={4}
                                placeholder={"HR Statement "}
                                error={errors?.statement?.message}
                                register={register("statement", {
                                    required:
                                        "Please enter statement."

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


            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Leave List</Typography>
                {user?.role_id != 1003 && <PrimaryButton
                    bgcolor={'#001f3f'}
                    title="Create "
                    onClick={() => { navigate('/create-leave'); localStorage.setItem("currentUrl", '/create-customer') }}
                    loading={loading}
                />}


            </Box>

            {/* Filters */}
            <Box >


                {<DataTable loading={loader} data={customerQueue} columns={columns} />}
            </Box>

        </Box>
    );
}

export default LeaveList;