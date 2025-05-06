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
    Button,
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
import { FileDownload } from "@mui/icons-material"
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { agencyType, Debounce, encryptData, formatPermissionData, handleExportWithComponent } from 'utils';
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
import DatePicker from 'components/DatePicker';
import UserServices from 'services/User';
import { useAuth } from 'context/UseContext';
import FinanceServices from 'services/Finance';
import { CSVLink } from 'react-csv';

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

function CustomerLedgers() {

    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [status, setStatus] = useState(null)
    const [statusDialog, setStatusDialog] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const [tableLoader, setTableLoader] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        reset,
    } = useForm();
    const [TotalBalance, setTotalBalance] = useState(0);
    let Balance = TotalBalance;
    const tableHead = [
        "Date",

        "JV#",
        "Account Name",
        "Particular#",
        "Type",
        "Description",

        "Debit (AED)",
        "Credit (AED)",


    ];



    const [loader, setLoader] = useState(false);

    const [confirmationDialog, setConfirmationDialog] = useState(false)

    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);



    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [selectedUser, setSelectedUser] = useState(null)
    const [users, setUsers] = useState([])
    const { user } = useAuth();
    const [fieldDisabled, setFieldDisabled] = useState(false)

    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false)
    const [sort, setSort] = useState('desc')

    const prepareCSVData = (data) => {
        // Map each entry into the desired CSV format
        const csvRows = data.map((item) => ({
            Reference: item.entry.reference_no || "",
            Date: item?.created_at || '',
            JV: `JV-${item.id} ` || "",
            Description: item.description || "",
            Type: item.type?.type_name || "",
            Account: item.account?.name || "",
            Debit: parseFloat(item.debit || 0).toFixed(2),
            Credit: parseFloat(item.credit || 0).toFixed(2),
        }));

        // Calculate totals
        const totalDebit = data.reduce((sum, item) => sum + parseFloat(item.debit || 0), 0);
        const totalCredit = data.reduce((sum, item) => sum + parseFloat(item.credit || 0), 0);

        // Append totals row
        csvRows.push({
            JV: "",
            Date: "",
            Reference: "",
            Description: "",
            Type: "",
            Account: "Total",
            Debit: totalDebit.toFixed(2),
            Credit: totalCredit.toFixed(2),
        });

        return csvRows;
    };
    const headers = [
        { label: "Date", key: "Date" },
        { label: "JV #", key: "JV" },
        { label: "Account", key: "Account" },
        { label: "Reference", key: "Reference" },
        { label: "Description", key: "Description" },
        { label: "Type", key: "Type" },

        { label: "Debit", key: "Debit" },
        { label: "Credit", key: "Credit" },
    ];

    // *For Get Customer Queue
    const getCustomerQueue = async (page, limit, filter) => {
        if (true) {
            setLoader(true)

            try {

                let params = {
                    page: 1,
                    limit: 1000,
                    from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
                    to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',
                    account_id: selectedUser?.receivable_account_id,
                    is_customer: true

                }

                const { data } = await FinanceServices.getNewAccountLedgers(params)
                setCustomerQueue(data?.statement?.rows);
                setTotalCount(data?.statement?.count);
                setTotalBalance(data?.statement?.opening_balance_aed);

            } catch (error) {
                showErrorToast(error)
            } finally {
                setLoader(false)
            }
        }
        else {
            showErrorToast('Select User')
        }

    }




    const getUsers = async (page, limit, filter) => {
        // setLoader(true)
        try {
            const Page = page ? page : currentPage
            const Limit = limit ? limit : pageLimit
            const Filter = filter ? { ...filters, ...filter } : null;
            setCurrentPage(Page)
            setPageLimit(Limit)
            setFilters(Filter)
            let params = {
                page: 1,
                limit: 1000,
            }
            params = { ...params, ...Filter }

            const { data } = await CustomerServices.getCustomerQueue(params)
            setUsers(data?.rows)



        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
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

    const handleFromDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == 'Invalid Date') {
                setFromDate('invalid')
                return
            }
            console.log(newDate, "newDate")
            setFromDate(new Date(newDate))
        } catch (error) {
            ErrorToaster(error)
        }
    }

    const handleToDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == 'Invalid Date') {
                setToDate('invalid')
                return
            }
            setToDate(new Date(newDate))
        } catch (error) {
            ErrorToaster(error)
        }
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

    const columns = [
        {
            header: "SR No.",
            accessorKey: "id",
        },
        {
            header: "Name",
            accessorKey: "name",
            accessorFn: (row) => row?.name,
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {row?.original?.name}
                </Box>
            ),
        },
        {
            header: "Email",
            accessorKey: "email",
            accessorFn: (row) => row?.email,
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {row?.original?.email}
                </Box>
            ),
        },
        {
            header: "Mobile",
            accessorKey: "mobile",
            accessorFn: (row) => row?.mobile,
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {row?.original?.mobile}
                </Box>
            ),
        },
        {
            header: "Inv Date",
            accessorKey: "invoice_date",
            accessorFn: (row) => moment(row?.receipt?.invoice_date).format("DD/MM/YYYY"),
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {moment(row?.original?.receipt?.invoice_date).format("DD/MM/YYYY")}
                </Box>
            ),
        },

        {
            header: "Stock ID",
            accessorKey: "stock_id",
            accessorFn: (row) => row?.service?.item_code,
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {row?.original?.service?.item_code}
                </Box>
            ),
        },
        {
            header: "Service Name",
            accessorKey: "service_name",
            accessorFn: (row) => row?.service?.name,
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {row?.original?.service?.name}
                </Box>
            ),
        },
        {
            header: "Category",
            accessorKey: "category",
            accessorFn: (row) => row?.service.category?.name,
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {row?.original?.service?.category?.name}
                </Box>
            ),
        },
        {
            header: "Customer Ref",
            accessorFn: (row) => 'Walk-In Customer',

            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    Walk-In Customer
                </Box>
            ),
        },
        {
            header: "Display Customer",
            accessorKey: "customer_name",
            accessorFn: (row) => row?.receipt?.customer_name,
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {row?.original?.receipt?.customer_name}
                </Box>
            ),
        },
        {
            header: "Customer Mobile",
            accessorKey: "customer_mobile",
            accessorFn: (row) => row?.receipt?.customer_mobile,
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {row?.original?.receipt?.customer_mobile}
                </Box>
            ),
        },
        {
            header: "Customer Email",
            accessorKey: "customer_email",
            accessorFn: (row) => row?.receipt?.customer_email,
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {row?.original?.receipt?.customer_email}
                </Box>
            ),
        },
        {
            header: "Quantity",
            accessorKey: "quantity",
        },
        {
            header: "Service Charge",
            accessorKey: "center_fee",
        },
        {
            header: "Total Service Charge",
            accessorKey: "total_service_charge",
            accessorFn: (row) => (parseFloat(row?.center_fee) * parseFloat(row?.quantity)).toFixed(2),
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {(parseFloat(row?.original?.center_fee) * parseFloat(row?.original?.quantity)).toFixed(2)}
                </Box>
            ),
        },
        {
            header: "Total VAT",
            accessorKey: "total_vat",
            accessorFn: (row) => (parseFloat(row?.center_fee) * parseFloat(row?.quantity)) * 0.05,
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {(parseFloat(row?.original?.center_fee) * parseFloat(row?.original?.quantity)) * 0.05}
                </Box>
            ),
        },
        {
            header: "Govt. Fee",
            accessorKey: "govt_fee",
        },

        {
            header: "Bank Service Charge",
            accessorKey: "bank_charge",
        },
        {
            header: "Other Charge",
            accessorKey: "other_charge",
            accessorFn: (row) => 0,
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    0
                </Box>
            ),
        },
        {
            header: "Total Govt. Fee",
            accessorKey: "govt_fee",
        },
        {
            header: "Transaction ID",
            accessorKey: "transaction_id",
        },
        {
            header: "Application/Case ID",
            accessorKey: "application_id",
        },
        {
            header: "Ref Name",
            accessorKey: "ref_no",
        },
        {
            header: "Payment Status",
            accessorKey: "payment_status",
            accessorFn: (row) => row?.receipt?.payment_status,
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {row?.original?.receipt?.is_paid ? "Paid" : "UnPaid"}
                </Box>
            ),
        },

        {
            header: "Line Total",
            accessorKey: "total",
            accessorFn: (row) => parseFloat(row?.total) + ((parseFloat(row?.center_fee) * parseFloat(row?.quantity)) * 0.05),
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {parseFloat(row?.original?.total) + ((parseFloat(row?.original?.center_fee) * parseFloat(row?.original?.quantity)) * 0.05)}
                </Box>
            ),
        },
        {
            header: "Invoice Total",
            accessorKey: "inv_total",
            accessorFn: (row) => row?.receipt?.total_amount,
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {parseFloat(row?.original?.receipt?.total_amount)}
                </Box>
            ),
        },
    ];


    useEffect(() => {
        getUsers()
        setFromDate(new Date())
        setToDate(new Date())
        getCustomerQueue()

    }, []);
    useEffect(() => {
        if (user?.role_id != 1000) {
            setFieldDisabled(true)
            setSelectedUser(user)

        }

    }, [user])

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
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Customer Ledgers</Typography>



            </Box>

            {/* Filters */}


            <Grid container spacing={1} justifyContent={"space-between"} alignItems={"center"}>
                <Grid item xs={12}>
                    <Grid container spacing={1}>
                        <Grid item xs={3}>
                            <SelectField
                                size={"small"}
                                label={"Select Customer "}
                                options={users}
                                disabled={fieldDisabled}
                                selected={selectedUser}
                                onSelect={(value) => {
                                    setSelectedUser(value);

                                }}
                                error={errors?.customer?.message}
                                register={register("customer", {
                                    required: "Please select customer account.",
                                })}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <DatePicker
                                label={"From Date"}
                                disableFuture={true}
                                size="small"
                                value={fromDate}
                                onChange={(date) => handleFromDate(date)}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <DatePicker
                                label={"To Date"}

                                disableFuture={true}
                                size="small"
                                value={toDate}
                                onChange={(date) => handleToDate(date)}
                            />
                        </Grid>

                        <Grid item xs={1} sx={{ marginTop: "30px" }}>
                            <PrimaryButton
                                bgcolor={"#bd9b4a"}
                                icon={<SearchIcon />}
                                title="Search"
                                sx={{ marginTop: "30px" }}
                                onClick={() => getCustomerQueue(null, null, null)}
                                loading={loading}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={4} display={'flex'} mt={2.7} justifyContent={'flex-end'}>

                </Grid>
            </Grid>


            <Box >

               <Box sx={{display:'flex',justifyContent:'flex-end',mb:2}}>
                <CSVLink
                    data={prepareCSVData(customerQueue)}
                    headers={headers}
                    filename="journal_entries.csv"
                >
                <Button

                    startIcon={<FileDownload />}
                   
                    variant="contained"
                    color="primary"
                    sx={{
                        padding: '10px',
                        textTransform: 'capitalize !important',
                        backgroundColor: "#bd9b4a !important",
                        fontSize: "12px",
                        ":hover": {
                            backgroundColor: "#bd9b4a !important",
                        },
                    }}
                >
                    Export to Excel
                </Button>
                </CSVLink>
                </Box>
                {customerQueue?.length > 0 && (
                    <Fragment>
                        <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                            fileName="General Ledger"
                        >
                            <Box className='pdf-show' sx={{ display: 'none' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                        Vehicle Sales Agreement Reversals
                                    </Typography>
                                    <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                                </Box>
                            </Box>
                            {/* ========== Table ========== */}
                            <TableContainer
                                component={Paper}
                                sx={{
                                    boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                    borderRadius: 2,
                                    maxHeight: "calc(100vh - 330px)",
                                }}
                                className="table-box"
                            >
                                <Table stickyHeader sx={{ minWidth: 500 }}>
                                    <TableHead>
                                        <TableRow>
                                            {tableHead.map((item, index) => (
                                                <Cell className="pdf-table" key={index}>{item}</Cell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {!loader ? (
                                            customerQueue?.length > 0 ? (
                                                <Fragment>
                                                    {customerQueue.map((item, index) => {

                                                        const balance =
                                                            selectedUser?.nature === "debit"
                                                                ? (
                                                                    parseFloat(item?.debit) -
                                                                    parseFloat(item?.credit)
                                                                ).toFixed(2)
                                                                : (
                                                                    parseFloat(item?.credit) -
                                                                    parseFloat(item?.debit)
                                                                ).toFixed(2);
                                                        Balance += parseFloat(balance);
                                                        return (
                                                            <Row
                                                                key={index}
                                                                sx={{
                                                                    bgcolor: index % 2 !== 0 && "#EFF8E7",
                                                                }}
                                                            >
                                                                <Cell className="pdf-table">
                                                                    {item?.created_at
                                                                        ? moment(item?.created_at).format("DD/MM/YYYY")
                                                                        : "-"}
                                                                </Cell>
                                                                <Cell className="pdf-table">
                                                                    {item?.journal_id
                                                                        ? item?.series_id + item?.journal_id
                                                                        : "-"}
                                                                </Cell>
                                                                <Cell className="pdf-table">{item?.account?.name ?? "-"}</Cell>
                                                                <Cell className="pdf-table">{item?.entry?.reference_no ?? "-"}</Cell>
                                                                <Cell className="pdf-table">{item?.type?.type_name ?? "-"}</Cell>
                                                                <Cell className="pdf-table">
                                                                    <Tooltip
                                                                        className="pdf-hide"
                                                                        title={item?.description ?? '-'}
                                                                        arrow
                                                                        placement="top"
                                                                        slotProps={{
                                                                            popper: {
                                                                                modifiers: [
                                                                                    {
                                                                                        name: "offset",
                                                                                        options: {
                                                                                            offset: [10, -2],
                                                                                        },
                                                                                    },
                                                                                ],
                                                                            },
                                                                        }}
                                                                    >
                                                                        {item?.description}
                                                                    </Tooltip>
                                                                    <Box
                                                                        component={"div"}
                                                                        className='pdf-show'
                                                                        sx={{ display: "none !important" }}
                                                                    >
                                                                        {item?.description ?? '-'}
                                                                    </Box>
                                                                </Cell>

                                                                <Cell className="pdf-table">{parseFloat(item?.debit).toFixed(2)}</Cell>
                                                                <Cell className="pdf-table">{parseFloat(item?.credit).toFixed(2)}</Cell>

                                                                {/* <Cell><Box className="pdf-hide"
                                  onClick={page ? () =>
                                    navigate(`/${page}/${item?.journal_id}`)
                                    : () => {
                                      navigate(`/general-journal-ledger`, { state: item?.series_id + item?.journal_id })
                                    }}
                                >
                                  <IconButton
                                    sx={{
                                      bgcolor:
                                        Colors.primary,
                                      "&:hover": {
                                        bgcolor:
                                          Colors.primary,
                                      },
                                    }}
                                  >
                                    <EyeIcon />
                                  </IconButton>

                                </Box></Cell> */}
                                                            </Row>
                                                        );
                                                    })}
                                                </Fragment>
                                            ) : (
                                                <Row>
                                                    <Cell
                                                        colSpan={tableHead.length + 1}
                                                        align="center"
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        No Data Found
                                                    </Cell>
                                                </Row>
                                            )
                                        ) : (
                                            <Row>
                                                <Cell
                                                    colSpan={tableHead.length + 2}
                                                    align="center"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    <Box className={classes.loaderWrap}>
                                                        <CircularProgress />
                                                    </Box>
                                                </Cell>
                                            </Row>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </PDFExport>
                        {/* ========== Pagination ========== */}
                        <Pagination
                            currentPage={currentPage}
                            pageSize={pageLimit}
                            onPageSizeChange={(size) => getCustomerQueue(1, size.target.value)}
                            tableCount={customerQueue?.length}
                            totalCount={totalCount}
                            onPageChange={(page) => getCustomerQueue(page, "")}
                        />
                    </Fragment>
                )}

                {loader && <CircleLoading />}
                {/* {<DataTable loading={loader} csv={true} csvName={'service_report'} data={customerQueue} columns={columns} />} */}
            </Box>

        </Box>
    );
}

export default CustomerLedgers;