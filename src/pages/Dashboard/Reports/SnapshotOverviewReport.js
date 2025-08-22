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
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { agencyType, CommaSeparator, Debounce, encryptData, formatPermissionData, handleExportWithComponent } from 'utils';
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
import { CSVLink } from 'react-csv';
import ExcelJS from "exceljs";

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

function SnapshotOverviewReport() {

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

    const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Token Number.', key: '' }, { name: 'Customer ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]

    const tableHead2 = [{ name: 'Description', key: '' }, { name: 'Value', key: '' },]
    const tableHead3 = [{ name: 'Description', key: '' }, { name: 'Amount', key: '' },]
    const [loader, setLoader] = useState(false);

    const [confirmationDialog, setConfirmationDialog] = useState(false)

    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());


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
                from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
                to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',

            }

            const { data } = await CustomerServices.getSnapshotOverviewReport(params)
         
            let totalData=data?.report
            if(agencyType[process.env.REACT_APP_TYPE]?.category != "TASHEEL"){
      
              delete totalData?.totalMohre
              console.log(totalData,'totalDatatotalData');
            }
            
            setCustomerQueue(totalData)

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

    const columns = [

        {
            header: "Category",
            accessorKey: "category",
            accessorFn: (row) => 'Al-ADHEED',
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {agencyType[process.env.REACT_APP_TYPE].category}
                </Box>
            ),
        },
        {
            header: "Count",
            accessorKey: "itemCount",
        },
        {
            header: "Total Govt. Charges",
            accessorKey: "customer_name",
            accessorFn: (row) => parseFloat(row?.totalCharges || 0),
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {parseFloat(row?.original?.totalCharges || 0).toFixed(2)}
                </Box>
            ),
        },
        {
            header: "Total Service Charges",
            accessorFn: (row) => parseFloat(row?.totalCenterFee || 0),
            accessorKey: "totalCenterFee",
        },

        {
            header: "Tax",
            accessorFn: (row) => parseFloat(row?.totalVat || 0),
            accessorKey: "totalVat",
        },

        {
            header: "Typist Commission",
            accessorFn: (row) => parseFloat(row?.typistCommission || 0),
            accessorKey: "typistCommission",
        },
        {
            header: "Customer Commission",
            accessorFn: (row) => parseFloat(row?.proCommission || 0),
            accessorKey: "proCommission",
        },




        {
            header: "Net Service Charge",
            accessorKey: "total",
            accessorFn: (row) => parseFloat(row?.netCharges || 0).toFixed(2),
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {parseFloat(row?.original?.netCharges || 0).toFixed(2)}
                </Box>
            ),
        },

    ];
    const tableData = [
        { description: "Invoice Count", value: customerQueue.invoiceCount },
        { description: "Service Count", value: customerQueue.itemCount },
        { description: "Total Invoice Amount", value: (parseFloat(customerQueue.totalGovernmentCharges) + parseFloat(customerQueue.totalBankCharges) + parseFloat(customerQueue.totalCenterFee)).toFixed(2) },
        { description: "Total Govt. Charges", value: (parseFloat(customerQueue.totalGovernmentCharges) + parseFloat(customerQueue.totalBankCharges)).toFixed(2) },
        { description: "Total Service Charges", value: parseFloat(customerQueue.totalCenterFee).toFixed(2) },
        { description: "Total VAT", value: parseFloat(customerQueue.totalVat).toFixed(2) },
        { description: "Total PRO Commission", value: parseFloat(customerQueue.proCommission).toFixed(2) },
        { description: "Total Employee Commission", value: parseFloat(customerQueue.typistCommission).toFixed(2) },
        { description: "Net Service Charge", value: (parseFloat(customerQueue.totalGovernmentCharges) + parseFloat(customerQueue.totalBankCharges) + parseFloat(customerQueue.totalCenterFee) + parseFloat(customerQueue.totalVat) - parseFloat(customerQueue.proCommission) - parseFloat(customerQueue.typistCommission)).toFixed(2) },
        { description: "Cash Collection", value: parseFloat(customerQueue.totalCash).toFixed(2) },
        { description: "Credit Card Collection", value: parseFloat(customerQueue.totalCard).toFixed(2) },
        { description: "Bank Transfer Collection", value: parseFloat(customerQueue.totalBank).toFixed(2) },
        { description: "Online Payment Collection", value: parseFloat(customerQueue.totalNetwork).toFixed(2) },
       // Conditionally include Mohre
        { description: "Net Collection", value: (parseFloat(customerQueue.totalCash) + parseFloat(customerQueue.totalCard) + parseFloat(customerQueue.totalBank) + parseFloat(customerQueue.totalMohre ||0)+ parseFloat(customerQueue.totalNetwork)).toFixed(2) },
    ];

    if (agencyType[process.env.REACT_APP_TYPE]?.category == "TASHEEL") {
        tableData.splice(tableData.length - 1, 0, {
          description: "Mohre Account Receivable",
          value: parseFloat(customerQueue.totalMohre).toFixed(2),
        });
      }


      const downloadOverviewReportExcel = () => {
        // Skip if no data
        if (!customerQueue) return;
    
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Overview Report");
    
        // Set professional header
        worksheet.headerFooter.oddHeader =
            '&C&"Arial,Bold"&18OVERVIEW REPORT\n' +
            '&C&"Arial,Regular"&12Your Company Name\n' +
            '&C&"Arial,Regular"&10Period: &D - &T\n' +
            '&L&"Arial,Regular"&8Generated on: ' +
            new Date().toLocaleDateString() +
            "\n" +
            '&R&"Arial,Regular"&8Page &P of &N';
    
        // Set custom footer as requested
        worksheet.headerFooter.oddFooter =
            '&C&"Arial,Regular"&10\n' + // One line gap
            '&C&"Arial,Bold"&12This is electronically generated report\n' +
            '&C&"Arial,Regular"&10Powered by MangotechDevs.ae';
    
        worksheet.headerFooter.evenFooter = worksheet.headerFooter.oddFooter;
    
        // Set page setup for professional printing
        worksheet.pageSetup = {
            paperSize: 9, // A4
            orientation: "portrait", // Portrait for overview report
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
        const titleRow = worksheet.addRow(["OVERVIEW REPORT"]);
        titleRow.getCell(1).font = {
            name: "Arial",
            size: 16,
            bold: true,
            color: { argb: "2F4F4F" },
        };
        titleRow.getCell(1).alignment = { horizontal: "center" };
        worksheet.mergeCells("A1:B1");
    
        const companyName =
          agencyType[process.env.REACT_APP_TYPE]?.name
    
        const companyRow = worksheet.addRow([companyName]);
        companyRow.getCell(1).font = {
            name: "Arial",
            size: 14,
            bold: true,
            color: { argb: "4472C4" },
        };
        companyRow.getCell(1).alignment = { horizontal: "center" };
        worksheet.mergeCells("A2:B2");
    
        const dateRow = worksheet.addRow([
            `Report Generated: ${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})} at ${new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}`,
        ]);
        dateRow.getCell(1).font = {
            name: "Arial",
            size: 10,
            italic: true,
            color: { argb: "666666" },
        };
        dateRow.getCell(1).alignment = { horizontal: "center" };
        worksheet.mergeCells("A3:B3");
    
        const periodRow = worksheet.addRow([
            toDate && fromDate
                ? `Period: ${fromDate ? new Date(fromDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "Present"}`
                : `Period: All`,
        ]);
        periodRow.getCell(1).font = {
            name: "Arial",
            size: 10,
            italic: true,
            color: { argb: "666666" },
        };
        periodRow.getCell(1).alignment = { horizontal: "center" };
        worksheet.mergeCells("A4:B4");
    
        // Add empty row for spacing
        worksheet.addRow([]);
    
        // Create table data exactly as provided
        const tableData = [
            { description: "Invoice Count", value: customerQueue.invoiceCount },
            { description: "Service Count", value: customerQueue.itemCount },
            {
                description: "Total Invoice Amount",
                value: (
                    Number.parseFloat(customerQueue.totalGovernmentCharges) +
                    Number.parseFloat(customerQueue.totalBankCharges) +
                    Number.parseFloat(customerQueue.totalCenterFee)
                ).toFixed(2),
            },
            {
                description: "Total Govt. Charges",
                value: (
                    Number.parseFloat(customerQueue.totalGovernmentCharges) + Number.parseFloat(customerQueue.totalBankCharges)
                ).toFixed(2),
            },
            { description: "Total Service Charges", value: Number.parseFloat(customerQueue.totalCenterFee).toFixed(2) },
            { description: "Total VAT", value: Number.parseFloat(customerQueue.totalVat).toFixed(2) },
            { description: "Total PRO Commission", value: Number.parseFloat(customerQueue.proCommission).toFixed(2) },
            { description: "Total Employee Commission", value: Number.parseFloat(customerQueue.typistCommission).toFixed(2) },
            {
                description: "Net Service Charge",
                value: (
                    Number.parseFloat(customerQueue.totalGovernmentCharges) +
                    Number.parseFloat(customerQueue.totalBankCharges) +
                    Number.parseFloat(customerQueue.totalCenterFee) +
                    Number.parseFloat(customerQueue.totalVat) -
                    Number.parseFloat(customerQueue.proCommission) -
                    Number.parseFloat(customerQueue.typistCommission)
                ).toFixed(2),
            },
            { description: "Cash Collection", value: Number.parseFloat(customerQueue.totalCash).toFixed(2) },
            { description: "Credit Card Collection", value: Number.parseFloat(customerQueue.totalCard).toFixed(2) },
            { description: "Bank Transfer Collection", value: Number.parseFloat(customerQueue.totalBank).toFixed(2) },
            { description: "Online Payment Collection", value: Number.parseFloat(customerQueue.totalNetwork).toFixed(2) },
            {
                description: "Net Collection",
                value: (
                    Number.parseFloat(customerQueue.totalCash) +
                    Number.parseFloat(customerQueue.totalCard) +
                    Number.parseFloat(customerQueue.totalBank) +
                    Number.parseFloat(customerQueue.totalMohre || 0) +
                    Number.parseFloat(customerQueue.totalNetwork)
                ).toFixed(2),
            },
        ];
    
        // Add headers
        const headers = ["Description", "Value"];
        const headerRow = worksheet.addRow(headers);
    
        // Style header row
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
    
        // Add data rows
        tableData.forEach((row, index) => {
            const dataRow = worksheet.addRow([row.description, row.value]);
    
            // Style data rows
            dataRow.eachCell((cell, colNumber) => {
                cell.font = { name: "Arial", size: 10 };
                cell.alignment = {
                    horizontal: colNumber === 1 ? "left" : "right", // Description left-aligned, value right-aligned
                    vertical: "middle",
                };
                cell.border = {
                    top: { style: "hair", color: { argb: "CCCCCC" } },
                    left: { style: "hair", color: { argb: "CCCCCC" } },
                    bottom: { style: "hair", color: { argb: "CCCCCC" } },
                    right: { style: "hair", color: { argb: "CCCCCC" } },
                };
    
                // Format value column (column 2)
                if (colNumber === 2) {
                    // Check if it's a count field (no decimal formatting needed)
                    if (row.description.includes("Count")) {
                        cell.numFmt = "#,##0";
                        cell.value = Number.parseInt(row.value || 0);
                    } else {
                        // Amount fields - 2 decimal places
                        cell.numFmt = "#,##0.00";
                        cell.value = Number.parseFloat(row.value || 0);
                    }
                }
    
                // Highlight important rows with different background colors
                if (
                    row.description === "Total Invoice Amount" ||
                    row.description === "Net Service Charge" ||
                    row.description === "Net Collection"
                ) {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "E6F3FF" }, // Light blue background for key metrics
                    };
                    cell.font = { name: "Arial", size: 10, bold: true };
                }
    
                // Highlight collection rows with light green
                if (row.description.includes("Collection") && row.description !== "Net Collection") {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "E6F7E6" }, // Light green background for collection methods
                    };
                }
            });
        });
    
        // Add empty rows for spacing before footer
        worksheet.addRow([]);
        worksheet.addRow([]);
    
        // Add the electronic generated report text with black border as requested
        const reportRow = worksheet.addRow(["This is electronically generated report"]);
        reportRow.getCell(1).font = {
            name: "Arial",
            size: 12,
            bold: true,
            color: { argb: "000000" },
        };
        reportRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
        reportRow.getCell(1).border = {
            top: { style: "medium", color: { argb: "000000" } },
            left: { style: "medium", color: { argb: "000000" } },
            bottom: { style: "medium", color: { argb: "000000" } },
            right: { style: "medium", color: { argb: "000000" } },
        };
        worksheet.mergeCells(`A${reportRow.number}:B${reportRow.number}`);
    
        // Add powered by line
        const poweredByRow = worksheet.addRow(["Powered by MangotechDevs.ae"]);
        poweredByRow.getCell(1).font = {
            name: "Arial",
            size: 10,
            italic: true,
            color: { argb: "666666" },
        };
        poweredByRow.getCell(1).alignment = { horizontal: "center" };
        worksheet.mergeCells(`A${poweredByRow.number}:B${poweredByRow.number}`);
    
        // Set column widths
        worksheet.columns = [
            { width: 35 }, // Description
            { width: 20 }, // Value
        ];
    
        // Add workbook properties
        workbook.creator = "Finance Department";
        workbook.lastModifiedBy = "Finance System";
        workbook.created = new Date();
        workbook.modified = new Date();
        workbook.lastPrinted = new Date();
    
        // Set workbook properties
        workbook.properties = {
            title: "Overview Report",
            subject: "Financial Overview Report",
            keywords: "overview, financial, summary, invoice, collection, charges, commission",
            category: "Financial Reports",
            description: "Overview report generated from accounting system",
            company: companyName,
        };
    
        const download = async () => {
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob,
                toDate && fromDate
                    ? `overview_report : ${fromDate ? new Date(fromDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "Present"}`
                    : `overview_report: Present`);
        };
    
        download();
    };
  
    useEffect(() => {
        setFromDate(new Date())
        setToDate(new Date())
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
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}> Overview Report</Typography>

                {
                    <Button
                        onClick={() => downloadOverviewReportExcel()}


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
                    </Button>}

            </Box>

            {/* Filters */}

            <Grid container spacing={1} justifyContent={"space-between"} alignItems={"center"}>
                <Grid item xs={8}>
                    <Grid container spacing={1}>
                        <Grid item xs={5}>
                            <DatePicker
                                label={"From Date"}
                                disableFuture={true}
                                size="small"
                                value={fromDate}
                                onChange={(date) => handleFromDate(date)}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <DatePicker
                                label={"To Date"}

                                disableFuture={true}
                                size="small"
                                value={toDate}
                                onChange={(date) => handleToDate(date)}
                            />
                        </Grid>

                        <Grid item xs={2} sx={{ marginTop: "30px" }}>
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



                <Grid container>
                    <Grid item xs={6}>
                        <TableContainer
                            component={Paper}
                            className="main-table"
                            sx={{
                                maxHeight: "calc(100vh - 200px)",
                                mt: 5,
                                backgroundColor: "transparent",
                                boxShadow: "none !important",
                                borderRadius: "0px !important",
                            }}
                        >
                            <Table stickyHeader sx={{ minWidth: 500 }}>
                                <TableHead>
                                    <Row>
                                        {tableHead2.map((cell, index) => (
                                            <Cell
                                                style={{
                                                    textAlign: 'center',
                                                    paddingRight: "50px",
                                                }}
                                                className="pdf-table pdf-table-head2"
                                                key={index}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "flex-end",
                                                    }}
                                                    className="pdf-table pdf-table-head2"
                                                >
                                                    {cell?.name}{" "}
                                                    {cell?.name == "Date" && (
                                                        <>
                                                            &nbsp;
                                                            <span
                                                                className="pdf-hide"
                                                                style={{
                                                                    height: "20px",
                                                                    cursor: "pointer",
                                                                }}
                                                            >
                                                                <Box
                                                                    className="pdf-hide"
                                                                    component={"img"}
                                                                    onClick={() => {
                                                                        setSort(sort == "asc" ? "desc" : "asc");
                                                                        handleSort(cell?.key);
                                                                    }}
                                                                    src={Images.sortIcon}
                                                                    width={"18px"}
                                                                ></Box>
                                                            </span>
                                                        </>
                                                    )}
                                                </Box>
                                            </Cell>
                                        ))}
                                    </Row>
                                </TableHead>
                                <TableBody>
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Invoice Count
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {CommaSeparator(customerQueue?.invoiceCount)}
                                        </Cell>
                                    </Row>
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Service Count
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {customerQueue?.itemCount}
                                        </Cell>
                                    </Row>
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Total Invoice Amount
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {CommaSeparator((
                                                parseFloat(customerQueue?.totalGovernmentCharges) +
                                                parseFloat(customerQueue?.totalBankCharges) +
                                                parseFloat(customerQueue?.totalVat) +
                                                parseFloat(customerQueue?.totalCenterFee)
                                            ).toFixed(2))}
                                        </Cell>
                                    </Row>
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Total Govt. Charges
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                                 
                                                {CommaSeparator((parseFloat(customerQueue?.totalGovernmentCharges)+parseFloat(customerQueue?.totalBankCharges)).toFixed(2))}
                                        </Cell>
                                    </Row>
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Total Service Charges
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {CommaSeparator(parseFloat(customerQueue?.totalCenterFee).toFixed(2))}
                                        </Cell>
                                    </Row>
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Total VAT
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {CommaSeparator(parseFloat(customerQueue?.totalVat).toFixed(2))}
                                        </Cell>
                                    </Row>
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Total PRO Commission
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {CommaSeparator(parseFloat(customerQueue?.proCommission).toFixed(2))}
                                        </Cell>
                                    </Row>
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Total Employee Commission
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {CommaSeparator(parseFloat(customerQueue?.typistCommission).toFixed(2))}
                                        </Cell>
                                    </Row>
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Net Service Charge
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {CommaSeparator((
                                                (parseFloat(customerQueue?.totalGovernmentCharges) +
                                                parseFloat(customerQueue?.totalBankCharges) +
                                                parseFloat(customerQueue?.totalVat) +
                                            
                                                parseFloat(customerQueue?.totalCenterFee))
                                            ).toFixed(2))}
                                        </Cell>
                                    </Row>
                                </TableBody>
                            </Table>
                        </TableContainer>

                    </Grid>
                    <Grid item xs={6}>
                        <TableContainer
                            component={Paper}
                            className="main-table"
                            sx={{
                                maxHeight: "calc(100vh - 200px)",
                                mt: 5,
                                backgroundColor: "transparent",
                                boxShadow: "none !important",
                                borderRadius: "0px !important",
                            }}
                        >
                            <Table stickyHeader sx={{ minWidth: 500 }}>
                                <TableHead>
                                    <Row>
                                        {tableHead3.map((cell, index) => (
                                            <Cell
                                                style={{
                                                    textAlign: 'center',
                                                    paddingRight: "50px",
                                                }}
                                                className="pdf-table pdf-table-head2"
                                                key={index}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "flex-end",
                                                    }}
                                                    className="pdf-table pdf-table-head2"
                                                >
                                                    {cell?.name}{" "}
                                                    {cell?.name == "Date" && (
                                                        <>
                                                            &nbsp;
                                                            <span
                                                                className="pdf-hide"
                                                                style={{
                                                                    height: "20px",
                                                                    cursor: "pointer",
                                                                }}
                                                            >
                                                                <Box
                                                                    className="pdf-hide"
                                                                    component={"img"}
                                                                    onClick={() => {
                                                                        setSort(sort == "asc" ? "desc" : "asc");
                                                                        handleSort(cell?.key);
                                                                    }}
                                                                    src={Images.sortIcon}
                                                                    width={"18px"}
                                                                ></Box>
                                                            </span>
                                                        </>
                                                    )}
                                                </Box>
                                            </Cell>
                                        ))}
                                    </Row>
                                </TableHead>
                                <TableBody>
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Cash Collection
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {CommaSeparator(parseFloat(customerQueue?.totalCash).toFixed(2))}
                                        </Cell>
                                    </Row>
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Credit Card Collection
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {CommaSeparator(parseFloat(customerQueue?.totalCard).toFixed(2))}
                                        </Cell>
                                    </Row>
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Bank Transfer Collection
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {CommaSeparator(parseFloat(customerQueue?.totalBank).toFixed(2))}
                                        </Cell>
                                    </Row>
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Online Payment Collection
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {CommaSeparator(parseFloat(customerQueue?.totalNetwork).toFixed(2))}
                                        </Cell>
                                    </Row>
                                    {agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" &&<Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Total Mohre Receivable
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {CommaSeparator(parseFloat(customerQueue?.totalMohre).toFixed(2))}
                                        </Cell>
                                    </Row>}
                                    <Row sx={{ border: "1px solid #EEEEEE !important" }}>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            Net Collection
                                        </Cell>
                                        <Cell style={{ textAlign: "left" }} className="pdf-table">
                                            {CommaSeparator((
                                                parseFloat(customerQueue?.totalCash) +
                                                parseFloat(customerQueue?.totalCard) +
                                                parseFloat(customerQueue?.totalBank) +
                                                parseFloat(customerQueue.totalMohre ||0) +
                                                parseFloat(customerQueue?.totalNetwork)
                                            ).toFixed(2))}
                                        </Cell>
                                    </Row>
                                </TableBody>
                            </Table>
                        </TableContainer>

                    </Grid>
                </Grid>
            </Box>

        </Box>
    );
}

export default SnapshotOverviewReport;