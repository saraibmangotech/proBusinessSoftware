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
import { useLocation, useNavigate } from 'react-router-dom';
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
import UserServices from 'services/User';

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

function ProductUnitList() {

    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [status, setStatus] = useState(null)
    const [statusDialog, setStatusDialog] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const [tableLoader, setTableLoader] = useState(false)
    const { state } = useLocation()
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        reset,
    } = useForm();

    const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Customer ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]


    const [loader, setLoader] = useState(false);

    const [confirmationDialog, setConfirmationDialog] = useState(false)

    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);



    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState([])



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
            const Page = page ? page : currentPage
            const Limit = limit ? limit : pageLimit
            const Filter = filter ? { ...filters, ...filter } : null;
            setCurrentPage(Page)
            setPageLimit(Limit)
            setFilters(Filter)
            let params = {
                page: 1,
                limit: 999999,
                product_id: state?.id


            }

            const { data } = await CustomerServices.getUnits(params)
            console.log(data);

            setCustomerQueue(data?.rows)

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

  const getUsers = async (page, limit, filter) => {
    // setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = filter ?  { ...filters, ...filter } : null;
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      let params = {
        page: 1,
        limit: 9999,
      }
      params = { ...params, ...Filter }

      const { data } = await UserServices.getUsers(params)
      setUsers(data?.users?.rows)
   
    

    } catch (error) {
      showErrorToast(error)
    } finally {
      // setLoader(false)
    }
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
            let params = { id: selectedData?.id, status: 'Unassigned' }


            const { message } = await CustomerServices.unitStatusUpdate(params)

            SuccessToaster(message);
            getCustomerQueue()
        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }
    const UpdateStatus = async (formData) => {
        try {
            let obj = {
                id: selectedData?.id, 
                reference_detail: formData?.reference_detail,
                assigned_user_id:status?.id,
                assigned_name:status?.name,
                status:'Assigned'

            };

            const promise = CustomerServices.unitStatusUpdate(obj);
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
            id: "created_at",
            header: "Purchased Date",
            // Remove accessorKey and fix accessorFn to use row directly
            accessorFn: (row) => moment(row.created_at).format("MM-DD-YYYY"),
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment(row.original.created_at).format("MM-DD-YYYY")}
                </Box>
            ),
        },
        {
            header: "Assigned To",
            accessorKey: "name",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.assignee?.name}
                </Box>
            ),

        },
        {
            header: "Assigned At",
            accessorFn: (row) =>
                row?.assigned_at ? moment(row.assigned_at).format("MM-DD-YYYY") : '-',
            cell: ({ row }) => (
                <Box
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {row?.original?.assigned_at
                        ? moment(row.original.assigned_at).format("MM-DD-YYYY")
                        : '-'}
                </Box>
            ),
        },
        
        {
            header: "Reference Detail",
            accessorKey: "reference_detail",
            cell: ({ row }) => (

                <Box sx={{ display: 'flex', gap: 1 }}>

                    {row?.original?.reference_detail}

                </Box>
            ),


        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => (

                <Box sx={{ display: 'flex', gap: 1 }}>

                    {row?.original?.status}

                </Box>
            ),


        },





        {
            header: "Actions",
            cell: ({ row }) => (
                (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: 150 }}>
                        <PrimaryButton
                            bgcolor="#001f3f"
                            title={row?.original?.status == 'Assigned' ? 'Unassign' : 'Assign'}
                            onClick={() => {
                                console.log('asdasd');
                                setSelectedData(row?.original)

                                if (row?.original?.status == 'Assigned') {
                                    setConfirmationDialog(true)
                                }
                                else {
                                    setStatusDialog(true)
                                }


                            }}
                            loading={loading}
                        />
                    </Box>
                ) : null           // render nothing when unit_count ≤ 0
            ),

},

    ]



useEffect(() => {
    getUsers()
    getCustomerQueue()
}, []);

return (
    <Box sx={{ p: 3 }}>
        <SimpleDialog
            open={statusDialog}
            onClose={() => setStatusDialog(false)}
            title={"Assign User"}
        >
            <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12}>
                        <SelectField
                            size={"small"}
                            label={"Select User :"}
                            options={users}
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
                            label={"Reference Detail :"}
                            size={'small'}
                            fullWidth={true}
                            multiline={true}
                            rows={7}
                            placeholder={"Reference Detail"}
                            error={errors?.reference_detail?.message}
                            register={register("reference_detail", {
                                required:
                                    'reference detail is required'

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
            <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>{state?.name}'s Units</Typography>



        </Box>

        {/* Filters */}
        <Box >


            {<DataTable loading={loader} data={customerQueue} columns={columns} />}
        </Box>

    </Box>
);
}

export default ProductUnitList;