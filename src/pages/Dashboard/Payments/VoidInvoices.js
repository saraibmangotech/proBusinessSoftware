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
import { agencyType, Debounce, encryptData, formatPermissionData, handleExportWithComponent } from 'utils';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { addPermission } from 'redux/slices/navigationDataSlice';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import { PrimaryButton } from 'components/Buttons';
import SelectField from 'components/Select';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"; // for invoice
import PaymentIcon from "@mui/icons-material/Payment"; // for payment receipt
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Barcode from "react-barcode";
import ReceiptIcon from '@mui/icons-material/Receipt';
import DatePicker from 'components/DatePicker';
import { id } from 'date-fns/locale';
import { useAuth } from 'context/UseContext';
import ExcelJS from "exceljs";
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
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

function VoidInvoices() {

    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [status, setStatus] = useState(null)
    const [statusDialog, setStatusDialog] = useState(false)
    const [statusDialog2, setStatusDialog2] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const [tableLoader, setTableLoader] = useState(false)
    const [invoiceData, setInvoiceData] = useState(null)
    const [invoiceData2, setInvoiceData2] = useState(null)
    const [payReceiptData, setPayReceiptData] = useState([]);
    console.log(payReceiptData, "payReceiptData");
    const [buttonVal, setButtonVal] = useState(null)
    const [paid, setPaid] = useState(null)
    const { user } = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        reset,
    } = useForm();
    const invoiceRef = useRef(null);
    const invoiceRef2 = useRef(null);
    const invoiceRef3 = useRef(null);
    const generatePDF = async () => {
        if (!invoiceRef.current) return;

        // Temporarily show the content while generating the PDF
        const invoiceElement = invoiceRef.current;
        invoiceElement.style.display = "block"; // Show the element

        // Capture the content using html2canvas
        const canvas = await html2canvas(invoiceElement, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // A4 dimensions: 210mm × 297mm
        const pageWidth = 210;
        const pageHeight = 297;

        // Calculate dimensions to fit content on page with margins
        const margin = 14; // 14mm margins
        const contentWidth = pageWidth - (margin * 2);

        // Calculate height while maintaining aspect ratio
        const contentHeight = (canvas.height * contentWidth) / canvas.width;

        // Check if content would exceed page height and scale if necessary
        const availableHeight = pageHeight - (margin * 2);
        const scale = contentHeight > availableHeight ? availableHeight / contentHeight : 1;

        // Calculate final dimensions
        const finalWidth = contentWidth * scale;
        const finalHeight = contentHeight * scale;

        // Add image to the PDF with margins
        pdf.addImage(imgData, "PNG", margin, margin, finalWidth, finalHeight);

        const blob = pdf.output("blob");

        // Create a blob URL
        const blobUrl = URL.createObjectURL(blob);

        // Open the PDF in a new tab
        window.open(blobUrl);

        // Restore the content visibility after generating the PDF
        invoiceElement.style.display = "none"; // Hide the element again
    };
    const generatePDF2 = async () => {
        if (!invoiceRef2.current) return;

        // Temporarily show the content while generating the PDF
        const invoiceElement = invoiceRef2.current;
        invoiceElement.style.display = "block"; // Show the element

        // Capture the content using html2canvas
        const canvas = await html2canvas(invoiceElement, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // A4 dimensions: 210mm × 297mm
        const pageWidth = 210;
        const pageHeight = 297;

        // Calculate dimensions to fit content on page with margins
        const margin = 14; // 14mm margins
        const contentWidth = pageWidth - (margin * 2);

        // Calculate height while maintaining aspect ratio
        const contentHeight = (canvas.height * contentWidth) / canvas.width;

        // Check if content would exceed page height and scale if necessary
        const availableHeight = pageHeight - (margin * 2);
        const scale = contentHeight > availableHeight ? availableHeight / contentHeight : 1;

        // Calculate final dimensions
        const finalWidth = contentWidth * scale;
        const finalHeight = contentHeight * scale;

        // Add image to the PDF with margins
        pdf.addImage(imgData, "PNG", margin, margin, finalWidth, finalHeight);

        const blob = pdf.output("blob");

        // Create a blob URL
        const blobUrl = URL.createObjectURL(blob);

        // Open the PDF in a new tab
        window.open(blobUrl);

        // Restore the content visibility after generating the PDF
        invoiceElement.style.display = "none"; // Hide the element again
    };

    const generatePDF3 = async () => {
        if (!invoiceRef3.current) return;

        // Temporarily show the content while generating the PDF
        const invoiceElement = invoiceRef3.current;
        invoiceElement.style.display = "block"; // Show the element

        // Capture the content using html2canvas
        const canvas = await html2canvas(invoiceElement, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // A4 dimensions: 210mm × 297mm
        const pageWidth = 210;
        const pageHeight = 297;

        // Calculate dimensions to fit content on page with margins
        const margin = 14; // 14mm margins
        const contentWidth = pageWidth - (margin * 2);

        // Calculate height while maintaining aspect ratio
        const contentHeight = (canvas.height * contentWidth) / canvas.width;

        // Check if content would exceed page height and scale if necessary
        const availableHeight = pageHeight - (margin * 2);
        const scale = contentHeight > availableHeight ? availableHeight / contentHeight : 1;

        // Calculate final dimensions
        const finalWidth = contentWidth * scale;
        const finalHeight = contentHeight * scale;

        // Add image to the PDF with margins
        pdf.addImage(imgData, "PNG", margin, margin, finalWidth, finalHeight);

        const blob = pdf.output("blob");

        // Create a blob URL
        const blobUrl = URL.createObjectURL(blob);

        // Open the PDF in a new tab
        window.open(blobUrl);

        // Restore the content visibility after generating the PDF
        invoiceElement.style.display = "none"; // Hide the element again
    };
    const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Customer ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]


    const [loader, setLoader] = useState(false);

    const [confirmationDialog, setConfirmationDialog] = useState(false)
    const [confirmationDialog2, setConfirmationDialog2] = useState(false)
    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);
    const [data, setData] = useState([])


    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [fromDate, setFromDate] = useState(new Date());
    const [invoiceDate, setInvoiceDate] = useState();
    const [toDate, setToDate] = useState(new Date());


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
                from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
                to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',
                is_paid: true,
                invoice_number: getValues('invoiceNumber'),
                is_voided:true,


            }

            const { data } = await CustomerServices.getInvoices(params)
            setData(data?.rows);



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
    const handleFromDate2 = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == 'Invalid Date') {
                setInvoiceDate('invalid')
                return
            }
            console.log(newDate, "newDate")
            setInvoiceDate(new Date(newDate))
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
            let params = {
                id: selectedData?.id,


            }


            const { message } = await CustomerServices.DeletePreSale(params)

            SuccessToaster(message);
            getCustomerQueue()
        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }
    const handleVoid = async (item) => {


        try {
            let params = {
                id: selectedData?.id,
                void_type:buttonVal
                


            }


            const { message } = await CustomerServices.handleVoid(params)

            SuccessToaster(message);
            setStatusDialog2(false)
            getCustomerQueue()
        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }
    const getData = async (id) => {
        try {
            let params = {
                id: id,
            };

            const { data } = await CustomerServices.getPreSaleDetail(params);
            console.log(data?.receipt);
            let invoice = {
                date: moment(data?.receipt?.date).format("DD-MM-YYYY"),
                invoiceType: data?.receipt?.invoice_number,
                id: data?.receipt?.id,
                trn: data?.receipt?.trn,
                tokenNumber: data?.receipt?.token_number,
                customerName: data?.receipt?.display_customer,
                mobileNo: data?.receipt?.mobile,
                customerReference: data?.receipt?.ref,
                customerAddress: data?.receipt?.address,
                items: data?.receipt?.sale_receipt_items,
                totalSales: 367.25,
                netTaxableAmount: 27.5,
                totalVAT: 1.38,
                grossTotal: 396.13,
                customerCardPayment: 0.0,
                totalPayable: 396.13,
            };
            setInvoiceData(invoice);
        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };
    const getData2 = async (id) => {
        try {
            let params = {
                id: id,
            };

            const { data } = await CustomerServices.getPreSaleDetail(params);
            console.log(data?.receipt);
            let invoice = {
                date: moment(data?.receipt?.date).format("DD-MM-YYYY"),
                invoiceType: data?.receipt?.invoice_number,
                id: data?.receipt?.id,
                trn: data?.receipt?.trn,
                tokenNumber: data?.receipt?.token_number,
                customerName: data?.receipt?.customer_name,
                created_by: data?.receipt?.creator,
                payment_creator: data?.receipt?.payment_creator,
                mobileNo: data?.receipt?.customer_mobile,
                email: data?.receipt?.customer_email,
                customerReference: data?.receipt?.ref,
                customerAddress: data?.receipt?.customer_address,
                items: data?.receipt?.sale_receipt_items,
                totalSales: 367.25,
                netTaxableAmount: 27.5,
                totalVAT: 1.38,
                grossTotal: 396.13,
                customerCardPayment: 0.0,
                totalPayable: 396.13,
                total_amount: data?.receipt?.total_amount,
                payment_mode: data?.receipt?.payment_mode
            };
            setInvoiceData2(invoice);
        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };
    const UpdateStatus = async () => {
        try {
            let obj = {
                id: selectedData?.id,
                invoice_date: invoiceDate,
            };

            const promise = CustomerServices.invoiceDateUpdate(obj);
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
    const UpdateStatus2 = async () => {
        try {
            let obj = {
                id: selectedData?.id,
                invoice_date: invoiceDate,
            };

            const promise = CustomerServices.invoiceDateUpdate(obj);
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
        if (invoiceData) {
            generatePDF();
        }
    }, [invoiceData]);
    useEffect(() => {
        if (invoiceData2) {
            generatePDF3();
        }
    }, [invoiceData2]);
    const columns = [
        {
            header: "Invoice#",
            accessorKey: "invoice_number",
        },
        {
            header: "Customer",
            accessorKey: "customer_name",
        },
        {
            header: "Token Number",
            accessorKey: "token_number",
        },
        {
            header: "Total Amount",
            accessorFn: (row) => {

                return (
                    row?.sale_receipt_items?.reduce((total2, item) => {
                        return parseFloat(total2) + parseFloat(item?.total ?? 0);
                    }, 0) +
                    row?.sale_receipt_items?.reduce((total, item) => {
                        const fee = parseFloat(item?.center_fee ?? 0);
                        const qty = parseFloat(item?.quantity ?? 1);
                        return total + fee * qty;
                    }, 0) * 0.05
                ).toFixed(2);

            },
            accessorKey: "total_amount",
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {(
                        row?.original?.sale_receipt_items?.reduce((total2, item) => {
                            return parseFloat(total2) + parseFloat(item?.total ?? 0);
                        }, 0) +
                        row?.original?.sale_receipt_items?.reduce((total, item) => {
                            const fee = parseFloat(item?.center_fee ?? 0);
                            const qty = parseFloat(item?.quantity ?? 1);
                            return total + fee * qty;
                        }, 0) * 0.05
                    ).toFixed(2)}
                </Box>
            ),
        },
   
        {
            header: "Voided By",
            accessorKey: "creator",
            accessorFn: (row) => row?.void_by,
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.void_by?.name}
                </Box>
            ),
        },
        
        {
            id: "created_at",
            header: "Created At",
            accessorFn: (row) => moment(row.created_at).format("DD/MM/YYYY"),
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment(row.original.created_at).format("DD/MM/YYYY")}
                </Box>
            ),
        },
        {
            id: "voided_at",
            header: "Voided At",
            accessorFn: (row) => moment(row.voided_at).format("DD/MM/YYYY"),
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment(row.original.voided_at).format("DD/MM/YYYY")}
                </Box>
            ),
        },
        {
            header: "Actions",
            cell: ({ row }) => (
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>

                    {true && (
                        <Tooltip title=" Invoice">
                            <IconButton
                                onClick={() => {
                                    window.open(
                                        `${process.env.REACT_APP_INVOICE_GENERATOR}generate-voided-invoice?id=${row?.original?.id}&instance=${process.env.REACT_APP_TYPE}`,
                                        '_blank'
                                    );
                                }}
                                sx={{
                                    backgroundColor: "#f9f9f9",
                                    borderRadius: 2,
                                    border: "1px solid #eee",
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <ReceiptIcon color="black" fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}


              
                 
               
                </Box>
            ),
        },
    ];

    const downloadPaidReceiptsExcel = () => {
        // Skip if no data
        if (!data || data.length === 0) return

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Void Invoices")

        // Set professional header
        worksheet.headerFooter.oddHeader =
            '&C&"Arial,Bold"&18PAID RECEIPTS\n' +
            '&C&"Arial,Regular"&12Your Company Name\n' +
            '&C&"Arial,Regular"&10Period: &D - &T\n' +
            '&L&"Arial,Regular"&8Generated on: ' +
            new Date().toLocaleDateString() +
            "\n" +
            '&R&"Arial,Regular"&8Page &P of &N'

        // Set custom footer as requested
        worksheet.headerFooter.oddFooter =
            '&C&"Arial,Regular"&10\n' + // One line gap
            '&C&"Arial,Bold"&12This is electronically generated report\n' +
            '&C&"Arial,Regular"&10Powered by MangotechDevs.ae'

        worksheet.headerFooter.evenFooter = worksheet.headerFooter.oddFooter

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
        }

        // Add title section at the top of the worksheet
        const titleRow = worksheet.addRow(["VOID INVOICES"])
        titleRow.getCell(1).font = {
            name: "Arial",
            size: 16,
            bold: true,
            color: { argb: "2F4F4F" },
        }
        titleRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A1:G1") // Merge cells across all columns

        const companyName =
            agencyType?.[process.env.REACT_APP_TYPE]?.category === "TASHEEL"
                ? "PREMIUM BUSINESSMEN SERVICES"
                : "PREMIUM PROFESSIONAL GOVERNMENT SERVICES LLC"

        const companyRow = worksheet.addRow([companyName])
        companyRow.getCell(1).font = {
            name: "Arial",
            size: 14,
            bold: true,
            color: { argb: "4472C4" },
        }
        companyRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A2:G2")

        const dateRow = worksheet.addRow([
            `Report Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        ])
        dateRow.getCell(1).font = {
            name: "Arial",
            size: 10,
            italic: true,
            color: { argb: "666666" },
        }
        dateRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A3:G3")

        const periodRow = worksheet.addRow([
            toDate && fromDate
                ? `Period: ${fromDate ? moment(fromDate).format("MM/DD/YYYY") : "-"} To ${toDate ? moment(toDate).format("MM/DD/YYYY") : "Present"}`
                : `Period: All`,
        ])
        periodRow.getCell(1).font = {
            name: "Arial",
            size: 10,
            italic: true,
            color: { argb: "666666" },
        }
        periodRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A4:G4")

        // Add empty row for spacing
        worksheet.addRow([])

        // Define headers based on the columns structure (excluding Actions column)
        const headers = ["Invoice#", "Customer", "Token Number", "Total Amount",  "Voided By", "Created At","Voided At"]

        // Add headers with professional styling
        const headerRow = worksheet.addRow(headers)
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "2F4F4F" }, // Dark slate gray
            }
            cell.font = {
                name: "Arial",
                bold: true,
                color: { argb: "FFFFFF" },
                size: 11,
            }
            cell.alignment = { horizontal: "center", vertical: "middle" }
            cell.border = {
                top: { style: "thin", color: { argb: "000000" } },
                left: { style: "thin", color: { argb: "000000" } },
                bottom: { style: "thin", color: { argb: "000000" } },
                right: { style: "thin", color: { argb: "000000" } },
            }
        })

        // Track totals for numeric columns
        let totalAmount = 0

        // Add data rows
        data.forEach((item, index) => {
            // Calculate total amount exactly as in the column definition
            const itemsTotal =
                item?.sale_receipt_items?.reduce((total2, receiptItem) => {
                    return Number.parseFloat(total2) + Number.parseFloat(receiptItem?.total ?? 0)
                }, 0) || 0

            const vatTotal =
                item?.sale_receipt_items?.reduce((total, receiptItem) => {
                    const fee = Number.parseFloat(receiptItem?.center_fee ?? 0)
                    const qty = Number.parseFloat(receiptItem?.quantity ?? 1)
                    return total + fee * qty
                }, 0) * 0.05 || 0

            const calculatedTotalAmount = itemsTotal + vatTotal

            // Determine status (simplified to Paid/Unpaid as per column definition)
            const status = item?.is_paid ? "Paid" : "Unpaid"

            const dataRow = worksheet.addRow([
                item?.invoice_number || "",
                item?.customer_name || "",
                item?.token_number || "",
                calculatedTotalAmount.toFixed(2),
                
                item?.void_by?.name || "",
                item?.created_at ? moment(item?.created_at).format("DD/MM/YYYY") : "",
                item?.voided_at ? moment(item?.voided_at).format("DD/MM/YYYY") : "",
            ])

            // Add to total
            totalAmount += calculatedTotalAmount

            // Style data rows
            dataRow.eachCell((cell, colNumber) => {
                cell.font = { name: "Arial", size: 10 }

                // Determine alignment based on column type
                const isNumericColumn = colNumber === 4 // Total Amount column

                cell.alignment = {
                    horizontal: isNumericColumn ? "right" : "left",
                    vertical: "middle",
                }

                cell.border = {
                    top: { style: "hair", color: { argb: "CCCCCC" } },
                    left: { style: "hair", color: { argb: "CCCCCC" } },
                    bottom: { style: "hair", color: { argb: "CCCCCC" } },
                    right: { style: "hair", color: { argb: "CCCCCC" } },
                }

                // Format numeric columns
                if (isNumericColumn) {
                    cell.numFmt = "#,##0.00"
                    cell.value = Number.parseFloat(cell.value || 0)
                }

                // Color coding for status
                if (colNumber === 5) {
                    // Status column
                    if (cell.value === "Paid") {
                        cell.font = { name: "Arial", size: 10, color: { argb: "008000" }, bold: true } // Green
                    } else if (cell.value === "Unpaid") {
                        cell.font = { name: "Arial", size: 10, color: { argb: "FF0000" }, bold: true } // Red
                    }
                }
            })
        })

        // Add empty row before totals
        worksheet.addRow([])

        // Add totals row
        const totalRow = worksheet.addRow(["", "", "TOTAL", totalAmount.toFixed(2), "", "", ""])

        // Style totals row
        totalRow.eachCell((cell, colNumber) => {
            if (colNumber === 3 || colNumber === 4) {
                // "TOTAL" label and amount
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "000000" }, // Black
                }
                cell.font = {
                    name: "Arial",
                    bold: true,
                    color: { argb: "FFFFFF" },
                    size: 11,
                }
                cell.border = {
                    top: { style: "medium", color: { argb: "000000" } },
                    left: { style: "medium", color: { argb: "000000" } },
                    bottom: { style: "medium", color: { argb: "000000" } },
                    right: { style: "medium", color: { argb: "000000" } },
                }

                if (colNumber === 3) {
                    cell.alignment = { horizontal: "center", vertical: "middle" }
                } else {
                    cell.alignment = { horizontal: "right", vertical: "middle" }
                    cell.numFmt = "#,##0.00"
                    cell.value = Number.parseFloat(cell.value || 0)
                }
            }
        })

        // Add empty rows for spacing before footer
        worksheet.addRow([])
        worksheet.addRow([])

        // Add the electronic generated report text with black border as requested
        const reportRow = worksheet.addRow(["This is electronically generated report"])
        reportRow.getCell(1).font = {
            name: "Arial",
            size: 12,
            bold: true,
            color: { argb: "000000" },
        }
        reportRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" }
        reportRow.getCell(1).border = {
            top: { style: "medium", color: { argb: "000000" } },
            left: { style: "medium", color: { argb: "000000" } },
            bottom: { style: "medium", color: { argb: "000000" } },
            right: { style: "medium", color: { argb: "000000" } },
        }
        worksheet.mergeCells(`A${reportRow.number}:G${reportRow.number}`)

        // Add powered by line
        const poweredByRow = worksheet.addRow(["Powered by MangotechDevs.ae"])
        poweredByRow.getCell(1).font = {
            name: "Arial",
            size: 10,
            italic: true,
            color: { argb: "666666" },
        }
        poweredByRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells(`A${poweredByRow.number}:G${poweredByRow.number}`)

        // Set column widths
        worksheet.columns = [
            { width: 15 }, // Invoice#
            { width: 25 }, // Customer
            { width: 15 }, // Token Number
            { width: 15 }, // Total Amount
            { width: 12 }, // Status
            { width: 20 }, // Created By
            { width: 15 }, // Created At
        ]

        // Add workbook properties
        workbook.creator = "Finance Department"
        workbook.lastModifiedBy = "Finance System"
        workbook.created = new Date()
        workbook.modified = new Date()
        workbook.lastPrinted = new Date()

        // Set workbook properties
        workbook.properties = {
            title: "Void Invoices",
            subject: "Void Invoices Report",
            keywords: "paid, receipts, invoice, customer, payment, financial",
            category: "Financial Reports",
            description: "Void receipts report generated from system",
            company: companyName,
        }

        const download = async () => {
            const buffer = await workbook.xlsx.writeBuffer()
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })
            saveAs(blob,
                toDate && fromDate
                    ? `void_invoices : ${fromDate ? moment(fromDate).format("MM/DD/YYYY") : "-"} To ${toDate ? moment(toDate).format("MM/DD/YYYY") : "Present"}`
                    : `void_invoices: Present `,);
       
        }

        download()
    }

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

            <ConfirmationDialog
                open={confirmationDialog2}
                onClose={() => setConfirmationDialog2(false)}
                message={"Are You Sure? This action can not be reversed."}
                action={() => {
                    setConfirmationDialog2(false);
                    handleVoid()

                }}
            />
            <SimpleDialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
                title={"Change Date?"}
            >
                <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <DatePicker
                                label={"Invoice Date"}
                                disableFuture={true}
                                size="small"
                                value={invoiceDate}
                                onChange={(date) => handleFromDate2(date)}
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

            <SimpleDialog
                open={statusDialog2}
                onClose={() => setStatusDialog2(false)}
                title={"Void Invoice"}
            >
                <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
                    <Box sx={{display:'flex',justifyContent:'center',gap:2}}>
                        <Box>Invoice No : {selectedData?.invoice_number ? selectedData?.invoice_number : '-' } </Box>
                        {selectedData?.payment?.id && <Box>Receipt No : {selectedData?.payment?.id ? 'RC-'+selectedData?.payment?.id : '-'}</Box>}
                    </Box>
                    <Grid container spacing={2}>

                        <Grid
                            item
                            xs={12}
                            sm={12}
                            sx={{
                                mt: 2,
                                display: "flex",
                                justifyContent: "center",
                                gap: "25px",
                            }}
                        >
                            <PrimaryButton
                                onClick={() => {setButtonVal('invoice');setConfirmationDialog2(true)}}
                                bgcolor={Colors.primary}
                                title="Void Invoice"

                            />
                            {paid && <PrimaryButton
                                onClick={() => {setButtonVal('receipt');setConfirmationDialog2(true)}}
                                bgcolor={"#FF1F25"}
                                title="Void Receipt"
                            />}
                            {paid && <PrimaryButton
                                onClick={() => {setButtonVal('both');setConfirmationDialog2(true)}}
                                bgcolor={"#FF1F25"}
                                title="Void Both"
                            />}
                        </Grid>


                    </Grid>
                </Box>
            </SimpleDialog>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Void Invoice List</Typography>
                <Box sx={{ display: 'flex', gap: 2 }} >
                    {data?.length > 0 &&
                        <Button
                            onClick={() => downloadPaidReceiptsExcel(customerQueue)}


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
                    <PrimaryButton
                        bgcolor={'#001f3f'}
                        title="Create"

                        onClick={() => { navigate('/create-paid-receipt'); localStorage.setItem("currentUrl", '/create-customer') }}
                        loading={loading}
                    />
                </Box>

            </Box>

            {/* Filters */}



            <Grid container spacing={1} justifyContent={"space-between"} alignItems={"center"}>
                <Grid item xs={10}>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={3}>
                            <InputField
                                size={'small'}
                                label={'Invoice No.'}
                                placeholder={'Invoice No'}
                                register={register('invoiceNumber', {

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

            </Grid>


            <Box >


                {<DataTable loading={loader} csvName={'paid_receipts'} data={data} columns={columns} />}
            </Box>

        </Box>
    );
}

export default VoidInvoices;