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
import ExcelJS from "exceljs";
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
import LedgerModal from 'LedgerTable';

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
        "Cost Center",
        "Description",

        "Debit (AED)",
        "Credit (AED)",
        "Action",

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



    const prepareCustomerLedgerXLSX = (data) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Customer Ledger");

        // Set professional header and footer
        worksheet.headerFooter.oddHeader =
            '&C&"Arial,Bold"&18CUSTOMER LEDGER\n' +
            '&C&"Arial,Regular"&12Your Company Name\n' +
            '&C&"Arial,Regular"&10Period: &D - &T\n' +
            '&L&"Arial,Regular"&8Generated on: ' +
            new Date().toLocaleDateString() +
            "\n" +
            '&R&"Arial,Regular"&8Page &P of &N';

        worksheet.headerFooter.oddFooter =
            '&L&"Arial,Regular"&8Confidential - Internal Use Only' +
            '&C&"Arial,Regular"&8This report contains financial data as of ' +
            new Date().toLocaleDateString() +
            '&R&"Arial,Regular"&8Generated by: Finance Department\n' +
            '&C&"Arial,Regular"&8Powered by Premium Business Solutions';

        worksheet.headerFooter.evenFooter = worksheet.headerFooter.oddFooter;

        // Set page setup for professional printing
        worksheet.pageSetup = {
            paperSize: 9, // A4
            orientation: "landscape",
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: {
                left: 0.7,
                right: 0.7,
                top: 1.0,
                bottom: 1.0,
                header: 0.3,
                footer: 0.5,
            },
        };

        // Add title section at the top of the worksheet
        const titleRow = worksheet.addRow(["CUSTOMER LEDGER"]);
        titleRow.getCell(1).font = {
            name: "Arial",
            size: 16,
            bold: true,
            color: { argb: "2F4F4F" },
        };
        titleRow.getCell(1).alignment = { horizontal: "center" };
        worksheet.mergeCells("A1:J1");

        const name = agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL"
            ? "PREMIUM BUSINESSMEN SERVICES"
            : "PREMIUM PROFESSIONAL GOVERNMENT SERVICES LLC";
        const companyRow = worksheet.addRow([name]);
        companyRow.getCell(1).font = {
            name: "Arial",
            size: 14,
            bold: true,
            color: { argb: "4472C4" },
        };
        companyRow.getCell(1).alignment = { horizontal: "center" };
        worksheet.mergeCells("A2:J2");

        const dateRow = worksheet.addRow([
            `Report Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`,
        ]);
        dateRow.getCell(1).font = {
            name: "Arial",
            size: 10,
            italic: true,
            color: { argb: "666666" },
        };
        dateRow.getCell(1).alignment = { horizontal: "center" };
        worksheet.mergeCells("A3:J3");

        // Add empty row for spacing
        worksheet.addRow([]);

        // Add report information section
        const startOfYear = moment().startOf('year').format("MM/DD/YYYY");
        const endOfYear = moment().endOf('year').format("MM/DD/YYYY");

        // Print out date
        const printDateRow = worksheet.addRow(["Print Out Date:", moment().format("MM/DD/YYYY HH:mm"), "", "", "", "", "", "", "", ""]);
        printDateRow.getCell(1).font = { name: "Arial", size: 10, bold: true };
        printDateRow.getCell(2).font = { name: "Arial", size: 10 };

        // Fiscal year
        const fiscalYearRow = worksheet.addRow(["Fiscal Year:", `${startOfYear} - ${endOfYear} (Active)`, "", "", "", "", "", "", "", ""]);
        fiscalYearRow.getCell(1).font = { name: "Arial", size: 10, bold: true };
        fiscalYearRow.getCell(2).font = { name: "Arial", size: 10 };

        // Period (if fromDate and toDate are available)
        if (typeof fromDate !== 'undefined' && typeof toDate !== 'undefined') {
            const periodRow = worksheet.addRow([
                "Period:",
                `${moment(fromDate).format("MM/DD/YYYY")} - ${moment(toDate).format("MM/DD/YYYY")}`,
                "", "", "", "", "", "", "", ""
            ]);
            periodRow.getCell(1).font = { name: "Arial", size: 10, bold: true };
            periodRow.getCell(2).font = { name: "Arial", size: 10 };
        }

        // Currency
        const currencyRow = worksheet.addRow(["Currency:", "AED", "", "", "", "", "", "", "", ""]);
        currencyRow.getCell(1).font = { name: "Arial", size: 10, bold: true };
        currencyRow.getCell(2).font = { name: "Arial", size: 10 };

        // Add empty rows for spacing
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Add table headers
        const headers = ["Reference", "Date", "JV", "Description", "Type", "Cost Center", "Account", "Debit", "Credit", "Balance"];
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "2F4F4F" }, // Dark slate gray
            };
            cell.font = {
                name: "Arial",
                bold: true,
                color: { argb: "FFFFFF" },
                size: 11,
            };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin", color: { argb: "000000" } },
                left: { style: "thin", color: { argb: "000000" } },
                bottom: { style: "thin", color: { argb: "000000" } },
                right: { style: "thin", color: { argb: "000000" } },
            };
        });

        // Process data with running balance calculation
        let runningBalance = 0;

        // Map each entry into the desired format with Balance
        data.forEach((item) => {
            const credit = parseFloat(item.credit || 0);
            const debit = parseFloat(item.debit || 0);
            const nature = item.account?.nature;

            // Calculate balance based on nature of account
            if (nature === "debit") {
                runningBalance += debit - credit;
            } else {
                runningBalance += credit - debit;
            }

            // Add data row - FIXED: Use numbers instead of strings
            const dataRow = worksheet.addRow([
                item.entry?.reference_no || "",
                item?.created_at ? moment(item?.created_at).format('DD/MM/YYYY') : '',
                `JV-${item.id}` || "",
                item.description || "",
                item.type?.type_name || "",
                item?.cost_center || "",
                item.account?.name || "",
                debit, // Use number directly
                credit, // Use number directly
                runningBalance, // Use number directly
            ]);

            // Style data rows
            dataRow.eachCell((cell, colNumber) => {
                cell.font = { name: "Arial", size: 10 };
                cell.alignment = {
                    horizontal: colNumber >= 8 ? "right" : "left", // Amount columns right-aligned
                    vertical: "middle",
                };
                cell.border = {
                    top: { style: "hair", color: { argb: "CCCCCC" } },
                    left: { style: "hair", color: { argb: "CCCCCC" } },
                    bottom: { style: "hair", color: { argb: "CCCCCC" } },
                    right: { style: "hair", color: { argb: "CCCCCC" } },
                };

                // Format numeric columns (Debit, Credit, Balance)
                if (colNumber >= 8 && colNumber <= 10) {
                    cell.numFmt = "#,##0.00";
                }
            });
        });

        // Calculate totals
        const totalDebit = data.reduce((sum, item) => sum + parseFloat(item.debit || 0), 0);
        const totalCredit = data.reduce((sum, item) => sum + parseFloat(item.credit || 0), 0);

        // Add totals row - FIXED: Use numbers instead of strings
        const totalRow = worksheet.addRow([
            "",
            "",
            "",
            "",
            "",
            "",
            "Total",
            totalDebit, // Use number directly
            totalCredit, // Use number directly
            runningBalance, // Final closing balance as number
        ]);

        // Style totals row
        totalRow.eachCell((cell, colNumber) => {
            if (colNumber === 7 || colNumber >= 8) {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "000000" }, // Black
                };
                cell.font = {
                    name: "Arial",
                    bold: true,
                    color: { argb: "FFFFFF" },
                    size: 11,
                };
                cell.border = {
                    top: { style: "medium", color: { argb: "000000" } },
                    left: { style: "medium", color: { argb: "000000" } },
                    bottom: { style: "medium", color: { argb: "000000" } },
                    right: { style: "medium", color: { argb: "000000" } },
                };

                if (colNumber >= 8) {
                    cell.numFmt = "#,##0.00";
                    cell.alignment = { horizontal: "right", vertical: "middle" };
                } else {
                    cell.alignment = { horizontal: "center", vertical: "middle" };
                }
            }
        });

        // Set column widths
        worksheet.columns = [
            { width: 15 }, // Reference
            { width: 12 }, // Date
            { width: 12 }, // JV
            { width: 25 }, // Description
            { width: 15 }, // Type
            { width: 15 }, // Cost Center
            { width: 20 }, // Account
            { width: 12 }, // Debit
            { width: 12 }, // Credit
            { width: 15 }, // Balance
        ];

        // Add workbook properties
        workbook.creator = "Finance Department";
        workbook.lastModifiedBy = "Finance System";
        workbook.created = new Date();
        workbook.modified = new Date();
        workbook.lastPrinted = new Date();

        // Set workbook properties
        workbook.properties = {
            title: "Customer Ledger",
            subject: "Financial Report",
            keywords: "customer ledger, financial, accounting",
            category: "Financial Reports",
            description: "Customer ledger generated from accounting system",
            company: name,
        };

        // Add empty rows for spacing before footer
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Add the electronically generated report text with black border
        const reportRow = worksheet.addRow(["This is electronically generated report"]);
        reportRow.getCell(1).font = {
            name: "Arial",
            size: 12,
            bold: false,
            color: { argb: "000000" },
        };
        reportRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
        reportRow.getCell(1).border = {
            top: { style: "medium", color: { argb: "000000" } },
            left: { style: "medium", color: { argb: "000000" } },
            bottom: { style: "medium", color: { argb: "000000" } },
            right: { style: "medium", color: { argb: "000000" } },
        };
        worksheet.mergeCells(`A${reportRow.number}:J${reportRow.number}`);

        // Add powered by line
        const poweredByRow = worksheet.addRow(["Powered By: MangotechDevs.ae"]);
        poweredByRow.getCell(1).font = {
            name: "Arial",
            size: 10,
            italic: true,
            color: { argb: "666666" },
        };
        poweredByRow.getCell(1).alignment = { horizontal: "center" };
        worksheet.mergeCells(`A${poweredByRow.number}:J${poweredByRow.number}`);

        // Download the file
        const download = async () => {
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            saveAs(blob, 'Customer_Ledger.xlsx');
        };
        download();
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

    const computeRunningBalance = (data, setClosingBal) => {
        let runningBalance = 0;

        const processedData = data.map((row) => {
            const credit = parseFloat(row.credit) || 0;
            const debit = parseFloat(row.debit) || 0;
            const nature = row.account?.nature;

            if (nature === "debit") {
                runningBalance += debit - credit;
            } else {
                runningBalance += credit - debit;
            }

            return {
                ...row,
                runningBalance: runningBalance.toFixed(2),
            };
        });

        // Set the last closing balance
        setClosingBal(runningBalance.toFixed(2));

        return processedData;
    };


    // Example: in your component before rendering table
    const tableData = useMemo(() => computeRunningBalance(customerQueue, setClosingBal), [customerQueue]);


    const columns = [

        {
            id: "created_at",
            header: " Date",
            // Remove accessorKey and fix accessorFn to use row directly
            accessorFn: (row) => moment(row.created_at).format("MM-DD-YYYY"),
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment(row.original.created_at).format("MM-DD-YYYY")}
                </Box>
            ),



        },
        {
            header: "JV#",
            accessorKey: "journal_id",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.journal_id
                        ? row?.original?.series_id + row?.original?.journal_id
                        : "-"}
                </Box>
            ),


        },
        {
            header: "Account Name",
            accessorKey: "id",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.account?.name ?? '-'}
                </Box>
            ),


        },
        {
            header: "Particular#.",
            accessorKey: "reference_no",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.entry?.reference_no ?? '-'}
                </Box>
            ),

        },
        {
            header: "Type",
            accessorKey: "type_name",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.type?.type_name ?? '-'}
                </Box>
            ),

        },
        {
            header: "Cost Center",
            accessorKey: "cost_center",


        },
        {
            header: "Description",
            accessorKey: "description",



        },
        {
            header: "Debit",
            accessorKey: "debit",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {parseFloat(row?.original?.debit).toFixed(2) ?? '-'}
                </Box>
            ),

        },
        {
            header: "Credit",
            accessorKey: "credit",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {parseFloat(row?.original?.credit).toFixed(2) ?? '-'}
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
                        color: parseFloat(row.original.runningBalance) >= 0 ? "green" : "red",
                    }}
                >
                    {row.original.runningBalance}
                </Box>
            ),
        },




        {
            header: "Actions",
            cell: ({ row }) => (

                <Box component={'div'} sx={{ display: 'flex', gap: '20px', }}>
                    <IconButton
                        onClick={() =>


                            getGeneralJournalLedgers(row?.original?.journal_id)
                        }
                        sx={{
                            width: '35px',
                            height: '35px',
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



                </Box>
            ),
        },

    ]


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

                let params = {
                    page: 1,
                    limit: 999999,
                    from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
                    to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',
                    account_id: selectedUser?.receivable_account_id,
                    is_customer: true,
                    cost_center: selectedCostCenter?.name

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

    const [data, setData] = useState([])
    const [loader2, setLoader2] = useState(false);
    const [modalOpen, setModalOpen] = useState(false)
    const handleOpenModal = () => {
        setModalOpen(true)
    }

    const handleCloseModal = () => {
        setModalOpen(false)
    }

    const getGeneralJournalLedgers = async (number) => {
        setModalOpen(true)
        setLoader2(true)
        try {

            let params = {
                page: 1,
                limit: 999999,
                search: number
            }

            const { data } = await FinanceServices.getGeneralJournalLedgers(params)
            setData(data?.statement?.rows)


        } catch (error) {
            ErrorToaster(error)
        } finally {
            setLoader2(false)
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
            <LedgerModal
                open={modalOpen}
                onClose={handleCloseModal}
                generalJournalAccounts={data}
                title=" Journal Entries"
                loading={loader2}
            />
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
                                size="small"
                                label="Select Cost Center"
                                options={costCenters}
                                selected={selectedCostCenter}
                                onSelect={(value) => {
                                    setSelectedCostCenter(value)

                                }}
                                register={register("costcenter", { required: "costcenter is required" })}

                            />
                        </Grid>
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
                    {customerQueue?.length > 0 &&
                        <Button

                            startIcon={<FileDownload />}
                            onClick={() => prepareCustomerLedgerXLSX(tableData)}
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
                    }
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

export default CustomerLedgers;