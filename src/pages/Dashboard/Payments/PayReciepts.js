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

function PayReceipts() {

    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [status, setStatus] = useState(null)
    const [statusDialog, setStatusDialog] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const [tableLoader, setTableLoader] = useState(false)
    const [invoiceData, setInvoiceData] = useState(null)
    const [invoiceData2, setInvoiceData2] = useState(null)
    const [payReceiptData, setPayReceiptData] = useState([]);
    console.log(payReceiptData, "payReceiptData");
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
                invoice_number:getValues('invoiceNumber')


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
            header: "Status",
            accessorKey: "is_paid",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.is_paid ? 'Paid' : 'Unpaid'}
                </Box>
            ),
        },
        {
            header: "Created By",
            accessorKey: "creator",
            accessorFn: (row) => row?.creator,
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.creator?.name}
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
            header: "Actions",
            cell: ({ row }) => (
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>

                    {(!row?.original?.is_paid && row?.original?.credited_by != null) && (
                        <Tooltip title="Credit Invoice">
                            <IconButton
                                onClick={() => {
                                    window.open(
                                        `${process.env.REACT_APP_INVOICE_GENERATOR}generate-unpaid?id=${row?.original?.id}&instance=${process.env.REACT_APP_TYPE}`,
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


                    {row?.original?.is_paid && (
                        <Tooltip title="Invoice">
                            <IconButton
                                onClick={() => {
                                    window.open(
                                        `${process.env.REACT_APP_INVOICE_GENERATOR}generate-invoice?id=${row?.original?.id}&instance=${process.env.REACT_APP_TYPE}`,
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
                    { (
                        <Tooltip title="Payment Receipt">
                            <IconButton
                                onClick={() => {
                                    window.open(
                                        `${process.env.REACT_APP_INVOICE_GENERATOR}generate-receipt?id=${row?.original?.id}&instance=${process.env.REACT_APP_TYPE}`,
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
                                <PaymentIcon color="black" fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                      {[1000,3,2].includes(user?.role_id) && (
                        <Tooltip title="Change Invoice Date">
                            <IconButton
                                onClick={() => {
                                    setSelectedData(row?.original)
                                    setInvoiceDate(new Date(row?.original?.invoice_date))
                                    setStatusDialog(true)
                                }}
                                sx={{
                                    backgroundColor: "#f9f9f9",
                                    borderRadius: 2,
                                    border: "1px solid #eee",
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <CalendarMonthIcon color="black" fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            ),
        },
    ];



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


            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Paid Receipt List</Typography>
                <Box >
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


                {<DataTable loading={loader} csv={true} csvName={'paid_receipts'} data={data} columns={columns} />}
            </Box>
         
        </Box>
    );
}

export default PayReceipts;