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

function ConsolidatedProStatement() {

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
        "Type",
        "#",
        "Date",
        "Due Date",
        "Charges",
        "Credits",
        "Allocated",
        "Balance"
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
    const [selectedCostCenter, setSelectedCostCenter] = useState(null)
    const [costCenters, setCostCenters] = useState([])
    const [closingBal, setClosingBal] = useState(0)
    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false)
    const [sort, setSort] = useState('desc')

    const prepareCSVData = (data) => {
        let runningBalance = 0;

        // Map each entry into the desired CSV format with Balance
        const csvRows = data.map((item) => {
            const credit = parseFloat(item.credit || 0);
            const debit = parseFloat(item.debit || 0);
            const nature = item.account?.nature;

            // Calculate balance based on nature of account
            if (nature === "debit") {
                runningBalance += debit - credit;
            } else {
                runningBalance += credit - debit;
            }

            return {
                Reference: item.entry?.reference_no || "",
                Date: item?.created_at ? moment(item?.created_at).format('DD/MM/YYYY') : '',
                JV: `JV-${item.id}` || "",
                Description: item.description || "",
                Type: item.type?.type_name || "",
                Cost_Center: item?.cost_center || "",
                Account: item.account?.name || "",
                Debit: debit.toFixed(2),
                Credit: credit.toFixed(2),
                Balance: runningBalance.toFixed(2),
            };
        });

        // Calculate totals
        const totalDebit = data.reduce((sum, item) => sum + parseFloat(item.debit || 0), 0);
        const totalCredit = data.reduce((sum, item) => sum + parseFloat(item.credit || 0), 0);

        // Append totals row with closing balance
        csvRows.push({
            JV: "",
            Date: "",
            Reference: "",
            Description: "",
            Type: "",
            Cost_Center: "",
            Account: "Total",
            Debit: totalDebit.toFixed(2),
            Credit: totalCredit.toFixed(2),
            Balance: runningBalance.toFixed(2), // Final closing balance
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
        { label: "Cost Center", key: "Cost_Center" },

        { label: "Debit", key: "Debit" },
        { label: "Credit", key: "Credit" },
        { label: "Balance", key: "Balance" },
    ];

    const computeRunningBalance = (allAccountsData, setClosingBal) => {
        const processedData = [];
        let overallRunningBalance = 0;

        // Add opening balance row at the very beginning
        processedData.push({
            id: 'opening',
            type: { type_name: 'Opening Balance' },
            journal_id: '',
            created_at: '',
            due_date: '',
            debit: '0.00',
            credit: '0.00',
            allocated: '0.00',
            runningBalance: '0.00',
            entry: { reference_no: '' },
            isAccountHeader: false,
            isTotal: false
        });

        // Process each account
        allAccountsData.forEach((accountData) => {
            if (accountData.statement && accountData.statement.length > 0) {
                // Add account name header row
                processedData.push({
                    id: `account-header-${accountData.account.id}`,
                    type: { type_name: accountData.account.name },
                    journal_id: '',
                    created_at: '',
                    due_date: '',
                    debit: '',
                    credit: '',
                    allocated: '',
                    runningBalance: '',
                    entry: { reference_no: '' },
                    isAccountHeader: true,
                    isTotal: false,
                    account: accountData.account
                });

                let accountRunningBalance = overallRunningBalance;
                let accountTotalCharges = 0;
                let accountTotalCredits = 0;

                // Process transactions for this account
                accountData.statement.forEach((row) => {
                    const credit = parseFloat(row.credit) || 0;
                    const debit = parseFloat(row.debit) || 0;
                    const nature = row.account?.nature;

                    accountTotalCharges += debit;
                    accountTotalCredits += credit;

                    if (nature === "debit") {
                        accountRunningBalance += debit - credit;
                    } else {
                        accountRunningBalance += credit - debit;
                    }

                    processedData.push({
                        ...row,
                        allocated: debit > 0 ? debit.toFixed(2) : credit.toFixed(2),
                        runningBalance: accountRunningBalance.toFixed(2),
                        isAccountHeader: false,
                        isTotal: false
                    });
                });

                // Add total row for this account
                processedData.push({
                    id: `total-${accountData.account.id}`,
                    type: { type_name: 'Total' },
                    journal_id: '',
                    created_at: '',
                    due_date: '',
                    debit: accountTotalCharges.toFixed(2),
                    credit: accountTotalCredits.toFixed(2),
                    allocated: '0.00',
                    runningBalance: accountRunningBalance.toFixed(2),
                    entry: { reference_no: '' },
                    isAccountHeader: false,
                    isTotal: true
                });

                overallRunningBalance = accountRunningBalance;
            }
        });

        setClosingBal(overallRunningBalance.toFixed(2));
        return processedData;
    };


    // Example: in your component before rendering table
    const tableData = useMemo(() => computeRunningBalance(customerQueue, setClosingBal), [customerQueue]);


    const columns = [
        {
            header: "Type",
            accessorKey: "type_name",
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{
                        cursor: "pointer",
                        display: "flex",
                        gap: 2,
                        fontWeight: row?.original?.isAccountHeader ? 'bold' : 'normal',
                        backgroundColor: row?.original?.isAccountHeader ? '#f5f5f5' : 'transparent',
                        color: row?.original?.isTotal ? '#1976d2' : 'inherit'
                    }}
                >
                    {row?.original?.isAccountHeader ?
                        row?.original?.type?.type_name :
                        row?.original?.type?.type_name === 'Receipt Payment' ?
                            (parseFloat(row?.original?.debit || 0) > 0 ? 'Invoice' : 'Payment') :
                            row?.original?.type?.type_name || '-'}
                </Box>
            ),
        },
        {
            header: "#",
            accessorKey: "journal_id",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.entry?.reference_no?.split('-')[1] ||
                        (row?.original?.journal_id ? row?.original?.series_id + row?.original?.journal_id : '-')}
                </Box>
            ),
        },
        {
            id: "created_at",
            header: "Date",
            accessorFn: (row) => row.created_at ? moment(row.created_at).format("YYYY-MM-DD") : '',
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row.original.created_at ? moment(row.original.created_at).format("YYYY-MM-DD") : ''}
                </Box>
            ),
        },
        {
            header: "Due Date",
            accessorKey: "due_date",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row.original.created_at ? moment(row.original.created_at).format("YYYY-MM-DD") : ''}
                </Box>
            ),
        },
        {
            header: "Charges",
            accessorKey: "debit",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {parseFloat(row?.original?.debit || 0).toFixed(2)}
                </Box>
            ),
        },
        {
            header: "Credits",
            accessorKey: "credit",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {parseFloat(row?.original?.credit || 0).toFixed(2)}
                </Box>
            ),
        },
        {
            header: "Allocated",
            accessorKey: "allocated",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.allocated || '0.00'}
                </Box>
            ),
        },
        {
            header: "Balance",
            accessorKey: "runningBalance",
            cell: ({ row }) => (
                <Box
                    sx={{
                        cursor: "pointer",
                        display: "flex",
                        gap: 2,
                        fontWeight: 500,
                        color: parseFloat(row.original.runningBalance || 0) >= 0 ? "green" : "red",
                    }}
                >
                    {row.original.runningBalance || '0.00'}
                </Box>
            ),
        }
    ];


    const getCostCenters = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await CustomerServices.getCostCenters(params);
            setCostCenters([{ id: 'All', name: 'All' }, ...(data?.cost_centers || [])]);
            setSelectedCostCenter({ id: 'All', name: 'All' })

        } catch (error) {
            showErrorToast(error);
        }
    };

    // *For Get Customer Queue
    const getCustomerQueue = async (page, limit, filter) => {
        if (true) {
            setLoader(true)
            try {
                // Using your provided JSON data - all accounts
                const providedData = [
                    {
                        "statement": [],
                        "opening_balance": 0,
                        "account": {
                            "id": 700631,
                            "name": "PRO-11174-Maleek",
                            "nature": "debit"
                        }
                    },
                    {
                        "statement": [],
                        "opening_balance": 0,
                        "account": {
                            "id": 700633,
                            "name": "PRO-11175-Sohail Khan Ayub Khan",
                            "nature": "debit"
                        }
                    },
                    {
                        "statement": [
                            {
                                "id": 22176,
                                "journal_id": 903393,
                                "series_id": "JV-",
                                "debit": "231",
                                "credit": "0",
                                "account_id": 700167,
                                "description": "Payment for Invoice# DED/20010612",
                                "comment": "",
                                "counter_account_id": 700167,
                                "journal_type_id": 1,
                                "cost_center": "DED",
                                "created_at": "2025-05-01T05:27:37.100Z",
                                "updated_at": "2025-05-11T16:41:09.218Z",
                                "type": {
                                    "id": 1,
                                    "type_name": "Receipt Payment",
                                    "detail": null
                                },
                                "account": {
                                    "account_code": "A2-20001-1",
                                    "name": "Walk-In Customer",
                                    "id": 700167,
                                    "nature": "debit",
                                    "unit": null
                                },
                                "counter": {
                                    "account_code": "A2-20001-1",
                                    "name": "Walk-In Customer",
                                    "id": 700167
                                },
                                "entry": {
                                    "reference_no": "SI-DED/20010612",
                                    "reference_date": null,
                                    "reference_id": 20010648,
                                    "reference_module": "receipt_payment"
                                }
                            },
                            {
                                "id": 22175,
                                "journal_id": 903393,
                                "series_id": "JV-",
                                "debit": "0",
                                "credit": "231",
                                "account_id": 700167,
                                "description": "Payment for Invoice# DED/20010612",
                                "comment": "",
                                "counter_account_id": 700167,
                                "journal_type_id": 1,
                                "cost_center": "DED",
                                "created_at": "2025-05-01T05:27:37.100Z",
                                "updated_at": "2025-05-11T16:41:09.175Z",
                                "type": {
                                    "id": 1,
                                    "type_name": "Receipt Payment",
                                    "detail": null
                                },
                                "account": {
                                    "account_code": "A2-20001-1",
                                    "name": "Walk-In Customer",
                                    "id": 700167,
                                    "nature": "debit",
                                    "unit": null
                                },
                                "counter": {
                                    "account_code": "A2-20001-1",
                                    "name": "Walk-In Customer",
                                    "id": 700167
                                },
                                "entry": {
                                    "reference_no": "SI-DED/20010612",
                                    "reference_date": null,
                                    "reference_id": 20010648,
                                    "reference_module": "receipt_payment"
                                }
                            },
                            {
                                "id": 22211,
                                "journal_id": 903398,
                                "series_id": "JV-",
                                "debit": "195.47",
                                "credit": "0",
                                "account_id": 700167,
                                "description": "Payment for Invoice# TYP/80010531",
                                "comment": "",
                                "counter_account_id": 700167,
                                "journal_type_id": 1,
                                "cost_center": "EID & MED",
                                "created_at": "2025-05-01T07:34:47.240Z",
                                "updated_at": "2025-05-11T16:41:11.916Z",
                                "type": {
                                    "id": 1,
                                    "type_name": "Receipt Payment",
                                    "detail": null
                                },
                                "account": {
                                    "account_code": "A2-20001-1",
                                    "name": "Walk-In Customer",
                                    "id": 700167,
                                    "nature": "debit",
                                    "unit": null
                                },
                                "counter": {
                                    "account_code": "A2-20001-1",
                                    "name": "Walk-In Customer",
                                    "id": 700167
                                },
                                "entry": {
                                    "reference_no": "SI-TYP/80010531",
                                    "reference_date": null,
                                    "reference_id": 20010658,
                                    "reference_module": "receipt_payment"
                                }
                            },
                            {
                                "id": 22210,
                                "journal_id": 903398,
                                "series_id": "JV-",
                                "debit": "0",
                                "credit": "195.47",
                                "account_id": 700167,
                                "description": "Payment for Invoice# TYP/80010531",
                                "comment": "",
                                "counter_account_id": 700167,
                                "journal_type_id": 1,
                                "cost_center": "EID & MED",
                                "created_at": "2025-05-01T07:34:47.240Z",
                                "updated_at": "2025-05-11T16:41:11.887Z",
                                "type": {
                                    "id": 1,
                                    "type_name": "Receipt Payment",
                                    "detail": null
                                },
                                "account": {
                                    "account_code": "A2-20001-1",
                                    "name": "Walk-In Customer",
                                    "id": 700167,
                                    "nature": "debit",
                                    "unit": null
                                },
                                "counter": {
                                    "account_code": "A2-20001-1",
                                    "name": "Walk-In Customer",
                                    "id": 700167
                                },
                                "entry": {
                                    "reference_no": "SI-TYP/80010531",
                                    "reference_date": null,
                                    "reference_id": 20010658,
                                    "reference_module": "receipt_payment"
                                }
                            }
                        ],
                        "opening_balance": null,
                        "account": {
                            "id": 700167,
                            "category": 1,
                            "sub_category": 5,
                            "head_id": 1,
                            "sub_head": 4,
                            "name": "Walk-In Customer",
                            "ref_id": null,
                            "type_code": "A2",
                            "primary_series": 20001,
                            "sub_series": 1,
                            "account_code": "A2-20001-1",
                            "primary_account_id": 700108,
                            "user_id": null,
                            "created_by": 30001,
                            "approved_by": null,
                            "approved_at": null,
                            "nature": "debit",
                            "opening_balance": "0",
                            "balance_date": "2025-04-14T19:00:00.000Z",
                            "is_approved": true,
                            "is_active": true,
                            "comments": "Test",
                            "created_at": "2025-04-15T11:26:25.892Z",
                            "updated_at": "2025-04-15T11:26:25.892Z"
                        }
                    }
                ];
                let params = {
                    page: 1,
                    limit: 999999,
                    from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
                    to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',
                    account_id: 700108
                  

                }
                const { data } = await FinanceServices.getConsolidatedProStatement(params)

                setCustomerQueue(data?.statements);
                setTotalCount(data?.statements?.reduce((total, account) => total + (account.statement?.length || 0), 0));
                setTotalBalance(0);

            } catch (error) {
                showErrorToast(error)
            } finally {
                setLoader(false)
            }
        } else {
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
                limit: 999999,
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




    useEffect(() => {
        getUsers()
        setFromDate(new Date())
        setToDate(new Date())
        getCustomerQueue()
        getCostCenters()
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

                        <Grid item xs={2.5}>
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
                        <Grid item xs={2.5}>
                            <DatePicker
                                label={"From Date"}
                                disableFuture={true}
                                size="small"
                                value={fromDate}
                                onChange={(date) => handleFromDate(date)}
                            />
                        </Grid>
                        <Grid item xs={2.5}>
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
                                bgcolor={"#001f3f"}
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

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    {customerQueue?.length > 0 && <CSVLink
                        data={prepareCSVData(tableData)}
                        headers={headers}
                        filename="customer_ledgers.csv"
                    >
                        <Button

                            startIcon={<FileDownload />}

                            variant="contained"
                            color="primary"
                            sx={{
                                padding: '10px',
                                textTransform: 'capitalize !important',
                                backgroundColor: "#001f3f !important",
                                fontSize: "12px",
                                ":hover": {
                                    backgroundColor: "#001f3f !important",
                                },
                            }}
                        >
                            Export to Excel
                        </Button>
                    </CSVLink>}
                </Box>


                {loader && <CircleLoading />}
                {<DataTable loading={loader} data={tableData} columns={columns} />}

                <Box sx={{ mt: 4 }}>
                    <Grid container spacing={2}>

                        <Grid item xs={12} sm={6} display={'flex'} gap={1} alignItems={'center'}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Closing Balance
                            </Typography>
                            <Typography variant="body1" >
                                {/* Replace with actual value or variable */}
                                {parseFloat(closingBal).toFixed(2)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

        </Box>
    );
}

export default ConsolidatedProStatement;