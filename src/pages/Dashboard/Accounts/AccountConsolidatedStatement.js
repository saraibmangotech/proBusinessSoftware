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
    FormHelperText,
    OutlinedInput,
    useTheme,
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
import './table.css'

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

function AccountConsolidatedProStatement() {

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
        "Debit",
        "Credit",

        "Balance"
    ];


    // Add a new function to calculate grand totals
    const calculateGrandTotals = (data) => {
        let grandTotalDebit = 0
        let grandTotalCredit = 0
        const grandTotalAllocated = 0
        let grandTotalBalance = 0

        // Only count actual transaction rows, not headers or totals
        data.forEach((row) => {
            if (!row.isAccountHeader && !row.isTotal && !row.isOpeningBalance) {
                grandTotalDebit += Number.parseFloat(row.debit || 0)
                grandTotalCredit += Number.parseFloat(row.credit || 0)
            }
        })

        // Calculate the final balance
        grandTotalBalance = Number.parseFloat((grandTotalDebit - grandTotalCredit).toFixed(2))

        return {
            debit: grandTotalDebit,
            credit: grandTotalCredit,
            allocated: grandTotalAllocated,
            balance: grandTotalBalance,
        }
    }
    const [loader, setLoader] = useState(false);

    const [confirmationDialog, setConfirmationDialog] = useState(false)

    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);


    const theme = useTheme();
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [selectedUser, setSelectedUser] = useState([])
    const [users, setUsers] = useState([])
    const { user } = useAuth();
    const [fieldDisabled, setFieldDisabled] = useState(false)
    const [selectedCostCenter, setSelectedCostCenter] = useState(null)
    const [costCenters, setCostCenters] = useState([])
    const [closingBal, setClosingBal] = useState(0)
    const [childAccounts, setChildAccounts] = useState([]);
    const [selectedChildAccount, setSelectedChildAccount] = useState([]);
    // *For Accounts
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false)
    const [sort, setSort] = useState('desc')

    const prepareCSVData = (data) => {
        const csvRows = []

        // Add header information first
        csvRows.push(["Customer Statement", "", "", "", "", "", ""])
        csvRows.push(["", "", "", "", "", "", ""])


        const startOfYear = moment().startOf('year').format("MM/DD/YYYY");
        const endOfYear = moment().endOf('year').format("MM/DD/YYYY");
        // Print out date
        csvRows.push(["Print Out Date:", moment().format("MM/DD/YYYY HH:mm"), "", "", "", "", ""])

        // Fiscal year
        csvRows.push(["Fiscal Year:", `${startOfYear} - ${endOfYear} (Active)`, "", "", "", "", ""])

        // Period
        csvRows.push([
            "Period:",
            `${moment(fromDate).format("MM/DD/YYYY")} - ${moment(toDate).format("MM/DD/YYYY")}`,
            "",
            "",
            "",
            "",
            "",
        ])

        // Customer
        csvRows.push(["Customer:", selectedUser ? 'Selected Users' : "All", "", "", "", "", ""])

        // Currency
        csvRows.push(["Currency:", "AED", "", "", "", "", ""])

        // Add empty rows for spacing
        csvRows.push(["", "", "", "", "", "", ""])
        csvRows.push(["", "", "", "", "", "", ""])

        // Add table headers
        csvRows.push(["Type", "#", "Date", "Due Date", "Debit", "Credit", "Balance"])

        // Process the actual table data
        data.forEach((row) => {
            // Account Header Row
            if (row.isAccountHeader) {
                csvRows.push([row.account.name, "", "", "", "", "", ""])
                return
            }

            // Opening Balance Row
            if (row.isOpeningBalance) {
                csvRows.push([
                    "",
                    "",
                    "",
                    "Opening Balance",
                    Number.parseFloat(row.debit || 0).toFixed(2),
                    Number.parseFloat(row.credit || 0).toFixed(2),
                    row.runningBalance || "0.00",
                ])
                return
            }

            // Total Row
            if (row.isTotal) {
                csvRows.push([
                    "Total",
                    "",
                    "",
                    "",
                    Number.parseFloat(row.debit || 0).toFixed(2),
                    Number.parseFloat(row.credit || 0).toFixed(2),
                    row.runningBalance || "0.00",
                ])
                return
            }

            // Regular Transaction Row
            const type =
                row?.type?.type_name === "Receipt Payment"
                    ? Number.parseFloat(row?.debit || 0) > 0
                        ? "Invoice"
                        : "Payment"
                    : row?.type?.type_name || "-"

            const number =
                row?.entry?.reference_no?.split("-")[1] || (row?.journal_id ? row?.series_id + row?.journal_id : "-")

            const date = row.created_at ? moment(row.created_at).format("YYYY-MM-DD") : ""
            const dueDate = row.created_at ? moment(row.created_at).format("YYYY-MM-DD") : ""

            csvRows.push([
                type,
                number,
                date,
                dueDate,
                Number.parseFloat(row?.debit || 0).toFixed(2),
                Number.parseFloat(row?.credit || 0).toFixed(2),
                row.runningBalance || "0.00",
            ])
        })

        // Add Grand Total Row
        if (data.length > 0) {
            const grandTotals = calculateGrandTotals(data)
            csvRows.push([
                "Grand Total",
                "",
                "",
                "",
                grandTotals.debit.toFixed(2),
                grandTotals.credit.toFixed(2),
                grandTotals.balance.toFixed(2),
            ])
        }

        return csvRows
    }

    const headers = [
        { label: "Type", key: "Type" },
        { label: "#", key: "#" },
        { label: "Date", key: "Date" },
        { label: "Due Date", key: "Due Date" },
        { label: "Debit", key: "Debit" },
        { label: "Credit", key: "Credit" },
        { label: "Balance", key: "Balance" },

    ];

     const handleFilterSearch = (data) => {
        Debounce(() => {
          getCustomerQueue(1, "", data);
       
        })(); // assuming Debounce is a debounce function
      };

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
        if (selectedAccount) {
            setLoader(true)
            try {
                const params = {
                    page: 1,
                    limit: 999999,
                    from_date: fromDate ? moment(fromDate).format("MM-DD-YYYY") : "",
                    to_date: toDate ? moment(toDate).format("MM-DD-YYYY") : "",
                    accounts: selectedChildAccount?.map(account => account.id).join(','),
                    account_id: selectedAccount?.id,
                }

                const { data } = await FinanceServices.getConsolidatedProStatement(params)
                console.log(data?.statements)

                // Process the data to create the table rows
                const processedData = processStatementsData(data?.statements || [])
                setCustomerQueue(processedData)
                setTotalCount(data?.statements?.reduce((total, account) => total + (account.statement?.length || 0), 0))
                setTotalBalance(0)
            } catch (error) {
                showErrorToast(error)
            } finally {
                setLoader(false)
            }
        } else {
            showErrorToast("Please Select an Account")
        }
    }

    // Process statements data to create table rows
    const processStatementsData = (statements) => {
        const result = []

        statements.forEach((account) => {
            if (account.account && account.account.name) {
                // Add account header
                result.push({
                    isAccountHeader: true,
                    id: `header-${account.account.id}`,
                    account: account.account,
                })

                // Add opening balance row if available
                if (account.opening_balance !== null && account.opening_balance !== undefined) {
                    result.push({
                        type: { type_name: "" },
                        id: `opening-${account.account.id}`,
                        isOpeningBalance: true,
                        debit: 0.0,
                        credit: 0.0,
                        allocated: 0.0,
                        runningBalance: account.opening_balance || 0.0,
                    })
                }

                // Add statement entries if available
                let totalDebit = 0
                let totalCredit = 0
                let runningBalance = Number.parseFloat(account.opening_balance || 0)

                if (account.statement && account.statement.length > 0) {
                    account.statement.forEach((entry) => {
                        const debit = Number.parseFloat(entry.debit || 0)
                        const credit = Number.parseFloat(entry.credit || 0)

                        runningBalance = Number.parseFloat((runningBalance + debit - credit).toFixed(2))
                        totalDebit += debit
                        totalCredit += credit

                        result.push({
                            ...entry,
                            runningBalance: runningBalance.toFixed(2),
                        })
                    })
                }

                // Add total row
                result.push({
                    id: `total-${account.account.id}`,
                    isTotal: true,
                    debit: totalDebit,
                    credit: totalCredit,
                    allocated: "0.00",
                    runningBalance: runningBalance.toFixed(2),
                })
            }
        })

        return result
    }

    // useEffect(() => {
    //     getCustomerQueue(1, 999999, {})
    // }, [fromDate, toDate])




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

            const { data } = await CustomerServices.getVendors(params)
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

    const [personName, setPersonName] = React.useState([]);
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
    const handleChange = (event) => {
        const {
            target: { value },
        } = event;

        // value will be an array of objects
        setSelectedChildAccount(typeof value === 'string' ? [] : value);
    };

    const getStyles = (user, selectedUsers, theme) => ({
        fontWeight: selectedUsers.some((u) => u.id === user.id)
            ? theme.typography.fontWeightMedium
            : theme.typography.fontWeightRegular,
    });



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

    // *For Get Account
    const getAccountsDropDown = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                name: search,
                is_disabled: false
            };
            const { data } = await FinanceServices.getAccountsDropDown(params);

            setAccounts(data?.accounts?.rows);
        } catch (error) {
            showErrorToast(error);
        }
    };

    // *For Get Account
    const getAccounts = async (accountId) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                primary_account_id: accountId ?? selectedAccount?.id,
            };
            const { data } = await FinanceServices.getAccounts(params);
            setChildAccounts(data?.accounts?.rows);
        } catch (error) {
            showErrorToast(error);
        }
    };


    useEffect(() => {
        getUsers()
        setFromDate(new Date())
        setToDate(new Date())
        getAccountsDropDown();
    
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
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Account Consolidated Statement</Typography>


                <PrimaryButton
                                bgcolor={"#001f3f"}
                                icon={<SearchIcon />}
                                title="Search"
                                sx={{ marginTop: "30px" }}
                                onClick={() => getCustomerQueue(null, null, null)}
                                loading={loading}
                            />
            </Box>

            {/* Filters */}

            <Grid container spacing={1} columns={12}>
                <Grid item xs={12} sm={2}>
                    <SelectField
                        size={"small"}
                        onSearch={(v) => getAccountsDropDown(v)}
                        label={"Account"}
                        options={accounts}
                        selected={selectedAccount}
                        onSelect={(value) => {
                            setSelectedAccount(value);
                            getAccounts(value?.id);
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    
                        <InputLabel id="demo-multiple-name-label" sx={{ fontWeight: 'bold', color: '#434343' }}> Child Accounts</InputLabel>
                            <FormControl fullWidth size="small" sx={{ pt: 1 }}>
                                <Select
                                    multiple
                                    value={selectedChildAccount}
                                    onChange={handleChange}
                                    input={<OutlinedInput label="Name" />}
                                    MenuProps={MenuProps}
                                    slotProps={{
                                        input: {
                                            sx: {
                                                border: `2px solid ${Colors.primary}`,
                                                borderRadius: "8px",
                                            },
                                        },
                                    }}
                                    renderValue={(selected) =>
                                        selected.map((user) => user.name).join(', ')
                                    }
                                    sx={{
                                        "&.MuiFormControl-root": {
                                            "&.MuiSelect-select": {
                                                borderRadius: "8px",
                                            },
                                        },
                                        "&.MuiInputBase-root": {
                                            borderRadius: "8px",
                                        },
                                    }}
                                >
                                    {childAccounts?.map((user) => (
                                        <MenuItem
                                            key={user.id}
                                            value={user}
                                            style={getStyles(selectedChildAccount, selectedChildAccount, theme)}
                                        >
                                            {user.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                    <InputField
                        size={"small"}
                        label={"Search"}
                        placeholder={"Search"}
                        register={register("search", {
                            onChange: (e) => handleFilterSearch({ search: e.target.value }),
                        })}
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <SelectField

                        size={"small"}
                        label={"Cost  Center"}
                        options={costCenters}
                        selected={selectedCostCenter}
                        onSelect={(value) => {
                            setSelectedCostCenter(value);
                        }}
                        register={register("costCenter")}
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <DatePicker
                        disableFuture={true}
                        size="small"
                        label={"From Date"}
                        value={fromDate}
                        onChange={(date) => handleFromDate(date)}
                    />
                </Grid>

                <Grid item xs={12} sm={2}>
                    <DatePicker
                        disableFuture={true}
                        size="small"
                        minDate={fromDate}
                        label={"To Date"}
                        value={toDate}
                        onChange={(date) => handleToDate(date)}
                    />
                </Grid>

            </Grid>
        


            <Box >

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    {customerQueue?.length > 0 && <CSVLink
                        data={prepareCSVData(customerQueue)}
                        filename={'Consolidated_Statement'}
                        style={{ textDecoration: "none" }}
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

                <div className="table-container">
                    <table className="financial-table">
                        <thead>
                            <tr>
                                {tableHead.map((item, index) => (
                                    <th key={index} className="pdf-table">
                                        {item}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loader ? (
                                <tr>
                                    <td colSpan={tableHead.length} align="center">
                                        <div className="loader-wrap">
                                            <div className="spinner"></div>
                                            <span>Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : customerQueue?.length > 0 ? (
                                customerQueue.map((row, index) => {
                                    // Account Header Row
                                    if (row.isAccountHeader) {
                                        return (
                                            <tr key={row.id} className="account-header">
                                                <td colSpan={7} className="account-name">
                                                    {row.account.name}
                                                </td>
                                            </tr>
                                        )
                                    }

                                    // Opening Balance Row
                                    if (row.isOpeningBalance) {
                                        return (
                                            <tr key={row.id} className="opening-balance-row">
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td>Opening Balance</td>
                                                <td className="number-cell">{Number.parseFloat(row.debit || 0).toFixed(2)}</td>
                                                <td className="number-cell">{Number.parseFloat(row.credit || 0).toFixed(2)}</td>
                                                <td
                                                    className={`number-cell ${Number.parseFloat(row.runningBalance || 0) >= 0 ? "positive" : "negative"}`}
                                                >
                                                    {parseFloat(row.runningBalance).toFixed(2) || "0.00"}
                                                </td>
                                            </tr>
                                        )
                                    }

                                    // Total Row
                                    if (row.isTotal) {
                                        return (
                                            <tr key={row.id} className="total-row">
                                                <td className="bold">Total</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td className="number-cell bold">{Number.parseFloat(row.debit || 0).toFixed(2)}</td>
                                                <td className="number-cell bold">{Number.parseFloat(row.credit || 0).toFixed(2)}</td>
                                                <td
                                                    className={`number-cell bold ${Number.parseFloat(row.runningBalance || 0) >= 0 ? "positive" : "negative"}`}
                                                >
                                                    {row.runningBalance || "0.00"}
                                                </td>
                                            </tr>
                                        )
                                    }

                                    // Regular Transaction Row
                                    return (
                                        <tr key={row.id || index} className="transaction-row">
                                            <td>
                                                {row?.type?.type_name === "Receipt Payment"
                                                    ? Number.parseFloat(row?.debit || 0) > 0
                                                        ? "Invoice"
                                                        : "Payment"
                                                    : row?.type?.type_name || "-"}
                                            </td>
                                            <td>
                                                {row?.entry?.reference_no?.split("-")[1] ||
                                                    (row?.journal_id ? row?.series_id + row?.journal_id : "-")}
                                            </td>
                                            <td>{row.created_at ? moment(row.created_at).format("YYYY-MM-DD") : ""}</td>
                                            <td>{row.created_at ? moment(row.created_at).format("YYYY-MM-DD") : ""}</td>
                                            <td className="number-cell">{Number.parseFloat(row?.debit || 0).toFixed(2)}</td>
                                            <td className="number-cell">{Number.parseFloat(row?.credit || 0).toFixed(2)}</td>
                                            <td
                                                className={`number-cell ${Number.parseFloat(row.runningBalance || 0) >= 0 ? "positive" : "negative"}`}
                                            >
                                                {row.runningBalance || "0.00"}
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={tableHead.length} align="center" className="no-data">
                                        No Data Found
                                    </td>
                                </tr>
                            )}
                            {!loader && customerQueue?.length > 0 && (
                                <tr className="grand-total-row">
                                    <td colSpan={3} className="bold">
                                        Grand Total
                                    </td>
                                    <td></td>
                                    <td className="number-cell bold">{calculateGrandTotals(customerQueue).debit.toFixed(2)}</td>
                                    <td className="number-cell bold">{calculateGrandTotals(customerQueue).credit.toFixed(2)}</td>
                                    <td
                                        className={`number-cell bold ${calculateGrandTotals(customerQueue).balance >= 0 ? "positive" : "negative"
                                            }`}
                                    >
                                        {calculateGrandTotals(customerQueue).balance.toFixed(2)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </Box>

        </Box>
    );
}

export default AccountConsolidatedProStatement;