import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
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

function SalaryList() {

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



    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false)
    const [sort, setSort] = useState('desc')

    // *For Get Customer Queue

    const [data, setData] = useState([
        {
          id: 1,
          masId: "EMP001",
          desg: "Driver",
          cnic: "42101-1234567-1",
          name: "Ali Khan",
          days: 30,
          bsSal: 30000,
          lve: 1,
          abs: 0,
          salPerDay: 1000,
          absAmt: 0,
          ot: 5,
          otRate: 100,
          otAmt: 500,
          night: 2,
          aa: 200,
          fuel: 1000,
          arr: 0,
          ded: 0,
          grSal: 32000,
          adv: 2000,
          loan: 1500,
          tax: 500,
          netSal: 28000,
        },
        {
          id: 2,
          masId: "EMP002",
          desg: "Helper",
          cnic: "42101-7654321-2",
          name: "Sara Bibi",
          days: 28,
          bsSal: 25000,
          lve: 2,
          abs: 0,
          salPerDay: 892,
          absAmt: 0,
          ot: 3,
          otRate: 100,
          otAmt: 300,
          night: 1,
          aa: 100,
          fuel: 800,
          arr: 0,
          ded: 0,
          grSal: 26000,
          adv: 1000,
          loan: 1000,
          tax: 300,
          netSal: 23700,
        }
      ]);
      const [data2, setData2] = useState([
        {
          id: 1,
          masId: "EMP001",
          desg: "Driver",
          cnic: "42101-1234567-1",
          name: "Ali Khan",
          days: 30,
          bsSal: 30000,
          lve: 1,
          abs: 0,
          salPerDay: 1000,
          absAmt: 0,
          ot: 5,
          otRate: 100,
          otAmt: 500,
          night: 2,
          aa: 200,
          fuel: 1000,
          arr: 0,
          ded: 0,
          grSal: 32000,
          adv: 2000,
          loan: 1500,
          tax: 500,
          netSal: 28000,
        },
        {
          id: 2,
          masId: "EMP002",
          desg: "Helper",
          cnic: "42101-7654321-2",
          name: "Sara Bibi",
          days: 28,
          bsSal: 25000,
          lve: 2,
          abs: 0,
          salPerDay: 892,
          absAmt: 0,
          ot: 3,
          otRate: 100,
          otAmt: 300,
          night: 1,
          aa: 100,
          fuel: 800,
          arr: 0,
          ded: 0,
          grSal: 26000,
          adv: 1000,
          loan: 1000,
          tax: 300,
          netSal: 23700,
        }
      ]);

      const handleInputChange = (id, key, value) => {
        setData2(prevData =>
          prevData.map(item =>
            item.id === id ? { ...item, [key]: Number(value) } : item
          )
        );
      };
      

    const getCustomerQueue = async (page, limit, filter) => {
        setLoader(true)

        try {

            let params = {
                page: 1,
                limit: 999999,


            }

            const { data } = await CustomerServices.getReceptionsList(params)
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
                customer_id: selectedData?.id,
                is_active: status?.id,
            };

            const promise = CustomerServices.CustomerStatus(obj);
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

    const columns = useMemo(() => [
        { header: "Mas.ID", accessorKey: "masId" },
        { header: "Desg.", accessorKey: "desg" },
        { header: "CNIC", accessorKey: "cnic" },
        { header: "Name", accessorKey: "name" },
        { header: "Days", accessorKey: "days" },
        { header: "Bs Sal", accessorKey: "bsSal" },
        { header: "Lve", accessorKey: "lve" },
        { header: "Abs", accessorKey: "abs" },
        { header: "Sal/Day", accessorKey: "salPerDay" },
        { header: "AbsAmt", accessorKey: "absAmt" },
        { header: "OT", accessorKey: "ot" },
        { header: "OT Rt", accessorKey: "otRate" },
        { header: "OT Am", accessorKey: "otAmt" },
        { header: "Nght", accessorKey: "night" },
        { header: "AA", accessorKey: "aa" },
        { header: "Fuel", accessorKey: "fuel" },
        {
          header: "Arr.",
          cell: ({ row }) => (
            <TextField
              type="number"
              variant="standard"
              value={row.original.arr}
              onChange={(e) =>
                handleInputChange(row.original.id, "arr", e.target.value)
              }
            />
          ),
        },
        {
          header: "Ded.",
          cell: ({ row }) => (
            <TextField
              type="number"
              variant="standard"
              value={row.original.ded}
              onChange={(e) =>
                handleInputChange(row.original.id, "ded", e.target.value)
              }
            />
          ),
        },
        {
          header: "Loan",
          cell: ({ row }) => (
            <TextField
              type="number"
              variant="standard"
              value={row.original.loan}
              onChange={(e) =>
                handleInputChange(row.original.id, "loan", e.target.value)
              }
            />
          ),
        },
        {
          header: "Tax",
          cell: ({ row }) => (
            <TextField
              type="number"
              variant="standard"
              value={row.original.tax}
              onChange={(e) =>
                handleInputChange(row.original.id, "tax", e.target.value)
              }
            />
          ),
        },
        { header: "GrSal", accessorKey: "grSal" },
        { header: "Adv", accessorKey: "adv" },
        { header: "NetSal", accessorKey: "netSal" },
      ], [handleInputChange]); // Add dependency only if it's recreated, else just wrap in []
      
      


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
                                label={"Select Status :"}
                                options={[
                                    { id: "Pending", name: "Pending" },
                                    { id: "In Progress", name: "In Progress" },

                                    { id: "Completed", name: "Completed" },


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
                                label={"Select Status :"}
                                options={

                                    [
                                        { id: false, name: "Disabled" },
                                        { id: true, name: "Enabled" },

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


            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Salary List</Typography>
          


            </Box>

            {/* Filters */}
            <Box >


                {<DataTable loading={loader} data={data} columns={columns} />}
            </Box>

        </Box>
    );
}

export default SalaryList;