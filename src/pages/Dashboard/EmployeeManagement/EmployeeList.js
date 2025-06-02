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

function EmployeeList() {

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



    const getCustomerQueue = async (page, limit, filter) => {
        setLoader(true)

        try {

            let params = {
                page: 1,
                limit: 999999,


            }

            const { data } = await CustomerServices.getEmployees(params)
            setCustomerQueue(data?.employees?.rows)

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
                user_id: selectedData?.user_id,
                adjustment_type: status?.id,
                leave_days: getValues('leave'),
                description: getValues('description')
            };

            const promise = CustomerServices.adjustLeaves(obj);
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
                reset()
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
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.user?.name}
                </Box>
            ),


        },
        {
            header: "Phone",
            accessorKey: "phone",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.user?.phone}
                </Box>
            ),



        },
        {
            header: "Email",
            accessorKey: "email",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.user?.email}
                </Box>
            ),

        },

        {
            header: "Designation",
            accessorKey: "designation",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.designation}
                </Box>
            ),

        },

        {
            header: "Department",
            accessorKey: "department",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.department}
                </Box>
            ),

        },

        {
            header: "Status",
            accessorKey: "department",
            cell: ({ row }) => (
                <Box component={'div'} className='pdf-hide' sx={{ display: 'flex', justifyContent: 'center' }}>
                    <SwitchButton
                        sx={{
                            '& .MuiButtonBase-root': {
                                width: '28px',
                                height: '28px'
                            }
                        }}
                        isChecked={row?.original?.is_active}
                        setIsChecked={() => updateAccountStatus(row?.original?.id, !row?.original?.is_active)}
                    />
                </Box>
            ),

        },
        {
            header: "Actions",
            cell: ({ row }) => (

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Adjust Leaves" arrow>
                        <IconButton
                            onClick={() => {
                                setSelectedData(row?.original);
                                setStatusDialog(true);
                            }}
                        >
                            <BuildIcon sx={{ color: 'black', fontSize: '14px' }} />
                        </IconButton>
                    </Tooltip>
                    {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/employee-detail/${row?.original?.user_id}`); localStorage.setItem("currentUrl", '/customer-detail'); }} src={Images.detailIcon} width={'35px'}></Box>}
                    {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/update-employee/${row?.original?.user_id}`); localStorage.setItem("currentUrl", '/update-customer') }} src={Images.editIcon} width={'35px'}></Box>}
                    <Box>



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
                                label={"Adjustment Type :"}
                                options={[
                                    { id: "add", name: "Add" },
                                    { id: "subtract", name: "Subtract" },




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
                                label={"Leave Days :"}
                                size={'small'}

                                placeholder={"Leave Days "}
                                error={errors?.leave?.message}
                                register={register("leave", {
                                    required:
                                        "Please enter leave."

                                })}
                            />


                        </Grid>
                        <Grid item xs={12} sm={12}>

                            <InputField
                                label={"Description :"}
                                size={'small'}
                                multiline
                                rows={4}

                                placeholder={"Description "}
                                error={errors?.description?.message}
                                register={register("description", {
                                    required:
                                        "Please enter description."

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
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Employee List</Typography>
                {user?.role_id != 1003 && <PrimaryButton
                    bgcolor={'#001f3f'}
                    title="Create "
                    onClick={() => { navigate('/create-employee'); localStorage.setItem("currentUrl", '/create-customer') }}
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

export default EmployeeList;