import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  tableCellClasses,
  IconButton,
  CircularProgress,
  Chip,
  Grid,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  ListItemText,
  Tooltip,
  Checkbox,
  InputAdornment,
  Button,
} from "@mui/material";
import {
  AllocateIcon,
  CheckIcon,
  EyeIcon,
  FontFamily,
  Images,
  MessageIcon,
  PendingIcon,
  RequestBuyerIdIcon,
} from "assets";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import Colors from "assets/Style/Colors";
import { CircleLoading } from "components/Loaders";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import FinanceStatusDialog from "components/Dialog/FinanceStatusDialog";
import AllocateStatusDialog from "components/Dialog/AllocateStatusDialog";
import AllocateDialog from "components/Dialog/AllocateDialog";
import CustomerServices from "services/Customer";
import { makeStyles } from "@mui/styles";
import Pagination from "components/Pagination";
import ReceiptIcon from '@mui/icons-material/Receipt';
import {
  agencyType,
  Debounce,
  encryptData,
  formatPermissionData,
  handleExportWithComponent,
} from "utils";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addPermission } from "redux/slices/navigationDataSlice";
import SimpleDialog from "components/Dialog/SimpleDialog";
import { PrimaryButton } from "components/Buttons";
import SelectField from "components/Select";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from "@progress/kendo-react-pdf";
import moment from "moment";
import LabelCustomInput from "components/Input/LabelCustomInput";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import { useCallbackPrompt } from "hooks/useCallBackPrompt";
import DataTable from "components/DataTable";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"; // for invoice
import PaymentIcon from "@mui/icons-material/Payment"; // for payment receipt
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Barcode from "react-barcode";
import DatePicker from 'components/DatePicker';
import ExcelJS from "exceljs";
// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: "Public Sans",
    border: "1px solid #EEEEEE",
    padding: "15px",
    textAlign: "left",
    whiteSpace: "nowrap",
    color: "#434343",
    paddingRight: "50px",
    background: "transparent",
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: "Public Sans",

    textWrap: "nowrap",
    padding: "5px !important",
    paddingLeft: "15px !important",

    ".MuiBox-root": {
      display: "flex",
      gap: "6px",
      alignItems: "center",
      justifyContent: "center",
      ".MuiBox-root": {
        cursor: "pointer",
      },
    },
    svg: {
      width: "auto",
      height: "24px",
    },
    ".MuiTypography-root": {
      textTransform: "capitalize",
      fontFamily: FontFamily.NunitoRegular,
      textWrap: "nowrap",
    },
    ".MuiButtonBase-root": {
      padding: "8px",
      width: "28px",
      height: "28px",
    },
  },
}));

const useStyles = makeStyles({
  loaderWrap: {
    display: "flex",
    height: 100,
    "& svg": {
      width: "40px !important",
      height: "40px !important",
    },
  },
});

function PreSalesList() {
  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [tableLoader, setTableLoader] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
  } = useForm();

  const tableHead = [
    { name: "SR No.", key: "" },
    { name: "Customer ", key: "name" },
    { name: "Registration Date", key: "visa_eligibility" },
    { name: "Deposit Amount", key: "deposit_total" },
    { name: "Status", key: "" },
    { name: "Actions", key: "" },
  ];

  const [loader, setLoader] = useState(false);

  const [confirmationDialog, setConfirmationDialog] = useState(false);

  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([]);
  const [payReceiptData, setPayReceiptData] = useState([]);
  const [invoiceData2, setInvoiceData2] = useState(null)
  console.log(payReceiptData, "payReceiptData");
  const [data, setData] = useState([]);

  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [invoiceData, setInvoiceData] = useState(null);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("desc");
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
        created_by: data?.receipt?.creator,
        payment_creator: data?.receipt?.payment_creator,

        tokenNumber: data?.receipt?.token_number,
        email: data?.receipt?.customer_email,
        customerName: data?.receipt?.customer_name,
        mobileNo: data?.receipt?.customer_mobile,
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

  // *For Get Customer Queue
  const getCustomerQueue = async (page, limit, filter) => {
    setLoader(true);

    try {
      let params = {
        is_presale: true,
        from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
        to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',
      };

      const { data } = await CustomerServices.getPreSales(params);
      setData(data?.rows);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoader(false);
    }
  };

  const handleSort = (key) => {
    let data = {
      sort_by: key,
      sort_order: sort,
    };
    Debounce(() => getCustomerQueue(1, "", data));
  };
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
        created_by: data?.receipt?.created_by,
        payment_creator: data?.receipt?.payment_creator,

        trn: data?.receipt?.trn,
        tokenNumber: data?.receipt?.token_number,
        customerName: data?.receipt?.customer_name,
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
      };
      setInvoiceData(invoice);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

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
      search: getValues("search"),
    };
    Debounce(() => getCustomerQueue(1, "", data));
  };
  const handleDelete = async (item) => {
    try {
      let params = {
        id: selectedData?.id,
      };

      const { message } = await CustomerServices.DeletePreSale(params);

      SuccessToaster(message);
      getCustomerQueue();
    } catch (error) {
      showErrorToast(error);
    } finally {
      // setLoader(false)
    }
  };
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
        setStatus(null);
        getCustomerQueue();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (invoiceData2) {
      generatePDF3();
    }
  }, [invoiceData2]);
  const columns = [
    {
      header: "SR No.",
      accessorKey: "id",
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
        ).toFixed(2)
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
      header: "Payment Status",
      accessorKey: "is_paid",
      cell: ({ row }) => (
        <Box variant="contained" sx={{ display: "flex", gap: 2 }}>
          {row?.original?.is_paid == null
            ? "Pending"
            : row?.original?.is_paid == false
              ? "Unpaid"
              : "Paid"}
        </Box>
      ),
    },

    {
      header: "Created By",
      accessorKey: "creator",
      accessorFn: (row) => row?.creator,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.creator?.name}
        </Box>
      ),
    },
    {
      id: "created_at",
      header: "Created At",
      // Remove accessorKey and fix accessorFn to use row directly
      accessorFn: (row) => moment(row.created_at).format("DD/MM/YYYY"),
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {moment(row.original.created_at).format("DD/MM/YYYY")}
        </Box>
      ),
    },

    {
      header: "Actions",
      cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {(row?.original?.is_paid != false) && (<Box
            component={"img"}
            sx={{ cursor: "pointer" }}
            onClick={() => {
              navigate(`/update-presale/${row?.original?.id}`);
              localStorage.setItem("currentUrl", "/update-customer");
            }}
            src={Images.editIcon}
            width={"35px"}
          ></Box>)}
          <Box>
            {row?.original?.is_paid == null && (
              <Box
                sx={{ cursor: "pointer", mt: 1 }}
                component={"img"}
                src={Images.deleteIcon}
                onClick={() => {
                  setSelectedData(row?.original);
                  setConfirmationDialog(true);
                }}
                width={"35px"}
              ></Box>
            )}
          </Box>
          {(!row?.original?.is_paid && row?.original?.credited_by != null) && (
            <Tooltip title="Credit Invoice">
              <IconButton
                onClick={() => {
                  window.open(
                    `${process.env.REACT_APP_INVOICE_GENERATOR}generate-unpaid?id=${row?.original?.invoice_id}&instance=${process.env.REACT_APP_TYPE}`,
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
            <Tooltip title=" Invoice">
              <IconButton
                onClick={() => {
                  window.open(
                    `${process.env.REACT_APP_INVOICE_GENERATOR}generate-invoice?id=${row?.original?.invoice_id}&instance=${process.env.REACT_APP_TYPE}`,
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

          {(!row?.original?.is_paid && row?.original?.credited_by != null) && (
            <Tooltip title=" Credit Invoice">
              <IconButton
                onClick={() => {
                  window.open(
                    `${process.env.REACT_APP_INVOICE_GENERATOR}generate-unpaid?id=${row?.original?.invoice_id}&instance=${process.env.REACT_APP_TYPE}`,
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

          <Box>
            <Tooltip title="Sales Request">
              <IconButton
                onClick={() => {
                  window.open(
                    `${process.env.REACT_APP_INVOICE_GENERATOR}generate-request?id=${row?.original?.id}&instance=${process.env.REACT_APP_TYPE}`,
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
                <ReceiptLongIcon color="black" fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          {/* Payment Receipt Button */}
          <Box>
            {row?.original?.is_paid &&
              <Tooltip title="Payment Receipt">
                <IconButton
                  onClick={() => {
                    window.open(
                      `${process.env.REACT_APP_INVOICE_GENERATOR}generate-receipt?id=${row?.original?.invoice_id}&instance=${process.env.REACT_APP_TYPE}`,
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
              </Tooltip>}
          </Box>
        </Box>
      ),
    },
  ];

  const downloadSalesRequestsExcel = () => {
    // Skip if no data
    if (!data || data.length === 0) return

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Sales Requests")

    // Set professional header
    worksheet.headerFooter.oddHeader =
      '&C&"Arial,Bold"&18SALES REQUESTS\n' +
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
    const titleRow = worksheet.addRow(["SALES REQUESTS"])
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
    const headers = ["SR No.", "Customer", "Token Number", "Total Amount", "Payment Status", "Created By", "Created At"]

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

      // Determine payment status
      let paymentStatus = "Pending"
      if (item?.is_paid === false) {
        paymentStatus = "Unpaid"
      } else if (item?.is_paid === true) {
        paymentStatus = "Paid"
      }

      const dataRow = worksheet.addRow([
        index + 1, // SR No.
        item?.customer_name || "",
        item?.token_number || "",
        calculatedTotalAmount.toFixed(2),
        paymentStatus,
        item?.creator?.name || "",
        item?.created_at ? moment(item?.created_at).format("DD/MM/YYYY") : "",
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

        // Color coding for payment status
        if (colNumber === 5) {
          // Payment Status column
          if (cell.value === "Paid") {
            cell.font = { name: "Arial", size: 10, color: { argb: "008000" }, bold: true } // Green
          } else if (cell.value === "Unpaid") {
            cell.font = { name: "Arial", size: 10, color: { argb: "FF0000" }, bold: true } // Red
          } else if (cell.value === "Pending") {
            cell.font = { name: "Arial", size: 10, color: { argb: "FF8C00" }, bold: true } // Orange
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
      { width: 10 }, // SR No.
      { width: 25 }, // Customer
      { width: 15 }, // Token Number
      { width: 15 }, // Total Amount
      { width: 15 }, // Payment Status
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
      title: "Sales Requests",
      subject: "Sales Requests Report",
      keywords: "sales, requests, customer, payment, financial",
      category: "Sales Reports",
      description: "Sales requests report generated from system",
      company: companyName,
    }

    const download = async () => {
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      saveAs(blob,
        toDate && fromDate
            ? `sales_requests : ${fromDate ? moment(fromDate).format("MM/DD/YYYY") : "-"} To ${toDate ? moment(toDate).format("MM/DD/YYYY") : "Present"}`
            : `sales_requests: Present `,);
 
    }

    download()
  }

  useEffect(() => {
    if (invoiceData) {
      generatePDF();
    }
  }, [invoiceData]);

  useEffect(() => {
    setFromDate(new Date())
    setToDate(new Date())
    getCustomerQueue();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <ConfirmationDialog
        open={confirmationDialog}
        onClose={() => setConfirmationDialog(false)}
        message={"Are You Sure?"}
        action={() => {
          setConfirmationDialog(false);
          handleDelete();
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
                options={[
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

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
          {" "}
          Sales List
        </Typography>
        {data?.length > 0 &&
          <Button
            onClick={() => downloadSalesRequestsExcel(customerQueue)}


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
        {/* {true && (
          <PrimaryButton
            bgcolor={"#001f3f"}
            title="Create"
            onClick={() => {
              navigate("/sales-receipt");
              localStorage.setItem("currentUrl", "/create-customer");
            }}
            loading={loading}
          />
        )} */}
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
          <PrimaryButton
            bgcolor={'#001f3f'}
            title="Create"

            onClick={() => {
              navigate("/sales-receipt");
              localStorage.setItem("currentUrl", "/create-customer");
            }}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Box>{<DataTable loading={loader} data={data} csvName={'presale_requests'} columns={columns} />}</Box>
      <Box className="showPdf" ref={invoiceRef} sx={{ padding: "20px 60px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "white",
          }}
        >
          {/* Left Box - English Content */}
          <div
            style={{
              // width: "32%",
              // border: "1px solid #e2e2e2",
              borderRadius: "6px",
              padding: "12px",
              // backgroundColor: "#f9f9f9",
              textAlign: "left",
              display: "flex", gap: "20px"
            }}
          >
            <div>


              <p
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  color: "#333",
                  marginBottom: "4px",

                }}
              >
                PREMIUM PROFESSIONAL GOVERNMENT SERVICES L.L.C
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#333",
                  margin: "2px 0",
                  fontWeight: "bold"

                }}
              >
                One Deira Mall, Al Khaleej Street
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#333",
                  fontWeight: "bold",

                  margin: "2px 0",
                }}
              >
                Deira, Dubai
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#333",
                  fontWeight: "bold",

                  margin: "2px 0",
                }}
              >
                Tel: 045264466
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#333",
                  margin: "2px 0",
                  fontWeight: "bold"

                }}
              >
                TRN: 100465380200003
              </p>
            </div>

          </div>

          {/* Center Box - Logos */}

          <div style={{ display: "flex", gap: '25px', alignItems: 'center' }}>
            <div

            >
              <img
                src={Images.headerRightImage}
                alt="Header"
                style={{ width: '100px' }}

              />
            </div>  <div

            >
              <img
                src={Images.headerLeftImage}
                alt="Header"
                style={{ width: '100px' }}

              />
            </div>
          </div>

          {/* Right Box - Arabic Content */}
          <div
            style={{
              // width: "32%",
              // border: "1px solid #e2e2e2",
              borderRadius: "6px",
              padding: "12px",
              // backgroundColor: "#f9f9f9",
              textAlign: "right",
              direction: "rtl",
            }}
          >
            <p
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                color: "#333",
                marginBottom: "4px",
                fontWeight: "bold"

              }}
            >
              بريميم بروفيشنل للخدمات الحكومية ش.ذ.م.م
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#333",
                margin: "2px 0",
                fontWeight: "bold"

              }}
            >
              ون ديرة مول، شارع الخليج

            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#333",
                margin: "2px 0",
                fontWeight: "bold"

              }}
            >
              ديرة — دبي
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#333",
                margin: "2px 0",
                fontWeight: "bold"

              }}
            >
              هاتف: 045264466
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#333",
                margin: "2px 0",
                fontWeight: "bold"

              }}
            >
              الرقم الضريبي: 100465380200003
            </p>
          </div>
        </div>
        <p
          variant="body2"
          style={{
            fontWeight: "bold",
            fontSize: "20px",
            margin: 0,
            textAlign: 'center',
            textDecoration: 'underline',
            marginTop: '40px',
            marginBottom: '40px',
          }}
        >
          SERVICE REQUEST    طلب الخدمة
        </p>
        <Box
          sx={{
            display: "flex",
            border: "1px solid #000",
            my: 2,
            fontSize: "15px",
          }}
        >
          <Box
            sx={{
              width: "50%",
              p: 2,
              borderRight: "1px solid #000",
              display: "flex",
              flexDirection: "column",
            }}
          >


            <Grid container spacing={1}>

              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Invoice Type - Invoice No نوع الفاتورة - رقم الفاتورة
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.invoiceType}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "12px",
                    margin: 0,
                  }}
                >
                  Date/التاريخ والوقت
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.date}
                </Typography>
              </Grid>
              {/* <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "15px" }}
                >
                  Name Of Employee (Typist)
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  Typist
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "15px" }}
                >
                  Name Of Employee (Cashier)
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  Cashier
                </Typography>
              </Grid> */}



              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Token Number رقم الرمز المميز
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.tokenNumber}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ width: "50%", p: 2 }}>
            <Grid item xs={6}>
              <p
                variant="body2"
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  margin: 0,
                  // textAlign:"center",
                  // marginBottom:2
                }}
              >
                Customer Information معلومات المتعاملين
              </p>
            </Grid>


            <Grid container spacing={1}>
              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    margin: 0,
                    // textAlign:"center",
                    // marginBottom:2
                  }}
                >
                  Name / الاسم
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.customerName}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    margin: 0,
                  }}
                >
                  Phone/ الهاتف رق
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.mobileNo}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Email / الالكتروني البريد
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.email}
                </Typography>
              </Grid>


              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Customer Address عنوان العميل

                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.customerAddress}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  TRN:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.trn}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box sx={{ my: 5 }}>
          <p
            variant="h6"
            style={{
              fontSize: "15px",
            }}
          >
            Particulars تفاصيل
          </p>

          <table className="mytable" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "transparent" }}>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "5%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black', }}>Sl.No الرقم</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "30%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>Service - الخدمات</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "8%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black', }}>Qty - الكمية</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "18%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>
                    Govt Fee and Bank Charge - الرسوم الحكومية
                  </p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>
                    Service Charge Taxable - تكلفة الخدمة
                  </p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>Tax Amt - قيمة المضافة</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>Total - الإجمالي بالدرهم</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceData?.items?.map((item, index) => (
                <tr key={item.id}>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                        {item?.service?.name}

                      </span>
                      <span style={{ fontSize: "12px" }}>
                        {item.service?.name_ar}
                      </span>

                    </div>
                    <span style={{ fontSize: "12px" }}>
                      {item?.application_id}
                      {item?.transaction_id && ` || ${item.transaction_id}`}
                      {item?.ref_id && ` || ${item.ref_id}`}
                    </span>

                    {/* <p style={{ fontSize: "9px", textAlign: "left" }}>
                          {item?.details}
                        </p> */}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {item?.quantity}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {(
                      parseFloat(item?.govt_fee || 0) +
                      parseFloat(item?.bank_charge || 0)
                    ).toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {parseFloat(item?.center_fee).toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {parseFloat(parseFloat(item?.center_fee) * 0.05).toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {parseFloat(item?.total).toFixed(2)}
                  </td>
                </tr>

              ))}
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    Total Govt.fee & Bank Charge إجمالي الرسوم الحكومية ورسوم البنك
                  </p>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "8%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {
                      invoiceData?.items
                        ?.reduce(
                          (total, item) =>
                            parseFloat(total) +
                            (parseFloat(item?.govt_fee ?? 0) + parseFloat(item?.bank_charge ?? 0)) *
                            (parseFloat(item?.quantity) || 1),
                          0
                        )
                        ?.toFixed(2)
                    }

                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>Net Taxable Amount صافي المبلغ الخاضع للضريبة</p>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {invoiceData?.items
                      ?.reduce((total, item) => {
                        const fee = parseFloat(item?.center_fee ?? 0);
                        const qty = parseFloat(item?.quantity ?? 1);
                        return total + fee * qty;
                      }, 0)
                      .toFixed(2)}

                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}> Total VAT إجمالي القيمة المضافة</p>

                </td>
                <td
                  align="center"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {(
                      invoiceData?.items?.reduce((total, item) => {
                        const fee = parseFloat(item?.center_fee ?? 0);
                        const qty = parseFloat(item?.quantity ?? 1);
                        return total + fee * qty;
                      }, 0) * 0.05
                    ).toFixed(2)}

                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={6}
                  align="right"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>     Gross Total إجمالي القيمة</p>

                </td>
                <td
                  align="center"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {(
                      invoiceData?.items?.reduce((total2, item) => {
                        return parseFloat(total2) + parseFloat(item?.total ?? 0);
                      }, 0) +
                      invoiceData?.items?.reduce((total, item) => {
                        const fee = parseFloat(item?.center_fee ?? 0);
                        const qty = parseFloat(item?.quantity ?? 1);
                        return total + fee * qty;
                      }, 0) * 0.05
                    ).toFixed(2)}

                  </p>
                </td>
              </tr>

              <tr>
                <td
                  colSpan={6}
                  align="right"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>     Total Payable الإجمالي</p>

                </td>
                <td
                  align="right"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>
                    {(
                      invoiceData?.items?.reduce((total2, item) => {
                        return parseFloat(total2) + parseFloat(item?.total ?? 0);
                      }, 0) +
                      invoiceData?.items?.reduce((total, item) => {
                        const fee = parseFloat(item?.center_fee ?? 0);
                        const qty = parseFloat(item?.quantity ?? 1);
                        return total + fee * qty;
                      }, 0) * 0.05
                    ).toFixed(2)}

                  </p>
                </td>
              </tr>
            </tbody>
          </table>


        </Box>
        <Box class="footer" style={{ marginTop: '250px' }}>
          <Box textAlign="center" pb={2} sx={{ my: "60px", mt: "200px" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box textAlign="center">
                <Typography variant="body2" dir="ltr" sx={{ fontSize: "12px", fontWeight: 'bold' }}>
                  {invoiceData2?.created_by?.name}
                </Typography>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  Authorized Signatory - المخول بالتوقيع
                </p>

              </Box>

              <Box textAlign="right" sx={{ fontSize: "12px" }}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  Note - ملاحظات
                </p>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  الرجاء التأكد من الفاتورة والمستندات قبل مغادرة الكاونتر
                </p>
                <Typography variant="body2" dir="ltr" sx={{ fontSize: "12px" }}>
                  Kindly check the invoice and documents before leaving the
                  counter
                </Typography>
              </Box>
            </Box>


          </Box>

          <div className="w-full h-[115px] flex justify-center items-center mb-4 mt-4" >
            <img
              src={Images.footer}
              alt="Header"
              style={{ width: "100%" }}
              className="max-w-full h-auto"
            />
          </div>
          < hr style={{ color: 'black !important' }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", fontSize: "15px", textAlign: 'right' }}
          >
            Powered By : MangoTechDevs.ae
          </Typography>
        </Box>
      </Box>

      <Box className="showPdf2" ref={invoiceRef2} sx={{ padding: "20px 60px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "white",
          }}
        >
          {/* Left Box - English Content */}
          <div
            style={{
              // width: "32%",
              // border: "1px solid #e2e2e2",
              borderRadius: "6px",
              padding: "12px",
              // backgroundColor: "#f9f9f9",
              textAlign: "left",
              display: "flex", gap: "20px"
            }}
          >
            <div>


              <p
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  color: "#333",
                  marginBottom: "4px",

                }}
              >
                PREMIUM PROFESSIONAL GOVERNMENT SERVICES L.L.C
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#333",
                  margin: "2px 0",
                  fontWeight: "bold"

                }}
              >
                One Deira Mall, Al Khaleej Street
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#333",
                  fontWeight: "bold",

                  margin: "2px 0",
                }}
              >
                Deira, Dubai
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#333",
                  fontWeight: "bold",

                  margin: "2px 0",
                }}
              >
                Tel: 045264466
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#333",
                  margin: "2px 0",
                  fontWeight: "bold"

                }}
              >
                TRN: 100465380200003
              </p>
            </div>

          </div>

          {/* Center Box - Logos */}

          <div style={{ display: "flex", gap: '25px', alignItems: 'center' }}>
            <div

            >
              <img
                src={Images.headerRightImage}
                alt="Header"
                style={{ width: '100px' }}

              />
            </div>  <div

            >
              <img
                src={Images.headerLeftImage}
                alt="Header"
                style={{ width: '100px' }}

              />
            </div>
          </div>

          {/* Right Box - Arabic Content */}
          <div
            style={{
              // width: "32%",
              // border: "1px solid #e2e2e2",
              borderRadius: "6px",
              padding: "12px",
              // backgroundColor: "#f9f9f9",
              textAlign: "right",
              direction: "rtl",
            }}
          >
            <p
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                color: "#333",
                marginBottom: "4px",
                fontWeight: "bold"

              }}
            >
              بريميم بروفيشنل للخدمات الحكومية ش.ذ.م.م
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#333",
                margin: "2px 0",
                fontWeight: "bold"

              }}
            >
              ون ديرة مول، شارع الخليج

            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#333",
                margin: "2px 0",
                fontWeight: "bold"

              }}
            >
              ديرة — دبي
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#333",
                margin: "2px 0",
                fontWeight: "bold"

              }}
            >
              هاتف: 045264466
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#333",
                margin: "2px 0",
                fontWeight: "bold"

              }}
            >
              الرقم الضريبي: 100465380200003
            </p>
          </div>
        </div>

        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          <p
            variant="h6"
            style={{
              fontSize: "25px",
              fontWeight: "bold",
              fontFamily: "Atlassian Sans",
              textDecoration: 'underline',

              marginTop: '40px',
              marginBottom: '40px',
            }}
          >
            RECEIPT - الإيصال
          </p>
        </Box>
        <Box
          sx={{
            display: "flex",
            border: "1px solid #000",
            my: 2,
            fontSize: "15px",
          }}
        >
          <Box
            sx={{
              width: "50%",
              p: 2,
              borderRight: "1px solid #000",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Receipt No/رقم الإيصال
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {"RC" + payReceiptData?.id}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Customer/المتعامل
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {payReceiptData?.customer_name}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Payment Cash Method/طريقة الدفع
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {payReceiptData?.payment_mode}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Into Account/داخل الحساب
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {payReceiptData?.payment_creator?.name}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ width: "50%", p: 2 }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Payment Date / تاريخ الدفع
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {moment(payReceiptData?.paid_date).format(
                    "DD-MM-YYYY hh:mm:ss a"
                  )}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Printed at/طبع في
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {moment().format("DD-MM-YYYY hh:mm:ss a")}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Mobile No./رقم الهاتف المتحرك
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {payReceiptData?.customer_mobile}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Authorization Code/رمز التفويض
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {payReceiptData?.payment?.remarks}
                </Typography>
              </Grid>

            </Grid>
          </Box>
        </Box>

        <Box sx={{ my: 5 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  Sl.No الرقم
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  Barcode الخدمات
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  Invoice No الكمية
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  Invoice Amount تلفة المعاملة
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  This Alloc هذا التخصيص
                </th>
              </tr>
            </thead>
            <tbody>
              {/* {invoiceData.items.map((item) => ( */}
              <tr>
                <td
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  1
                </td>
                <td
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Box
                      sx={{
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        alignItems: "center",
                        margin: "0 auto",
                      }}
                    >
                      <Barcode
                        value={payReceiptData?.id}
                        width={1.4}
                        height={40}
                        displayValue={false}
                      />
                      <Typography variant="body2" sx={{ fontSize: "15px" }}>
                        {payReceiptData?.id}
                      </Typography>
                    </Box>
                  </div>
                </td>
                <td
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {payReceiptData?.invoice_number}
                </td>

                <td
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {parseFloat(payReceiptData?.total_amount)?.toFixed(2)}
                </td>
                <td
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {parseFloat(payReceiptData?.total_amount)?.toFixed(2)}
                </td>
              </tr>
              {/* ))} */}
              <tr>
                <td
                  colSpan={4}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  TOTAL RECEIPT AMOUNT
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  {parseFloat(payReceiptData?.total_amount)?.toFixed(2)}

                  {/* {invoiceData.totalSales.toFixed(2)} */}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={4}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  TOTAL COLLECTED AMOUNT
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {parseFloat(payReceiptData?.total_amount)?.toFixed(2)}

                  {/* {invoiceData.netTaxableAmount.toFixed(2)} */}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={4}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  ALLOCATED AMOUNT
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  {parseFloat(payReceiptData?.total_amount)?.toFixed(2)}

                  {/* {invoiceData.totalVAT.toFixed(2)} */}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={4}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  BALANCE
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  {payReceiptData?.balance_amount
                    ? parseFloat(payReceiptData?.balance_amount).toFixed(2)
                    : "0.00"}

                  {/* {invoiceData.grossTotal.toFixed(2)} */}
                </td>
              </tr>

              <tr>
                <td
                  colSpan={5}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  This receipt is generated electronically - تم دفع إلكترونيا
                  المعاملة
                </td>
              </tr>
            </tbody>
          </table>

        </Box>
        <Box class="footer" style={{ marginTop: '300px' }}>
          <Box textAlign="center" pb={2} sx={{ my: "60px", mt: "200px" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box textAlign="center">
                <Typography variant="body2" dir="ltr" sx={{ fontSize: "12px", fontWeight: 'bold' }}>
                  {payReceiptData?.payment_creator?.name}
                </Typography>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  Authorized Signatory - المخول بالتوقيع
                </p>

              </Box>

              <Box textAlign="right" sx={{ fontSize: "12px" }}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  Note - ملاحظات
                </p>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  الرجاء التأكد من الفاتورة والمستندات قبل مغادرة الكاونتر
                </p>
                <Typography variant="body2" dir="ltr" sx={{ fontSize: "12px" }}>
                  Kindly check the invoice and documents before leaving the
                  counter
                </Typography>
              </Box>
            </Box>


          </Box>

          <div className="w-full h-[115px] flex justify-center items-center mb-4 mt-4" >
            <img
              src={Images.footer}
              alt="Header"
              style={{ width: "100%" }}
              className="max-w-full h-auto"
            />
          </div>
          < hr style={{ color: 'black !important' }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", fontSize: "15px", textAlign: 'right' }}
          >
            Powered By : MangoTechDevs.ae
          </Typography>
        </Box>
      </Box>
      <Box className="showPdf" ref={invoiceRef3} sx={{ padding: "20px 60px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "white",
          }}
        >
          {/* Left Box - English Content */}
          <div
            style={{
              // width: "32%",
              // border: "1px solid #e2e2e2",
              borderRadius: "6px",
              padding: "12px",
              // backgroundColor: "#f9f9f9",
              textAlign: "left",
              display: "flex", gap: "20px"
            }}
          >
            <div>


              <p
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  color: "#333",
                  marginBottom: "4px",

                }}
              >
                PREMIUM PROFESSIONAL GOVERNMENT SERVICES L.L.C
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#333",
                  margin: "2px 0",
                  fontWeight: "bold"

                }}
              >
                One Deira Mall, Al Khaleej Street
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#333",
                  fontWeight: "bold",

                  margin: "2px 0",
                }}
              >
                Deira, Dubai
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#333",
                  fontWeight: "bold",

                  margin: "2px 0",
                }}
              >
                Tel: 045264466
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#333",
                  margin: "2px 0",
                  fontWeight: "bold"

                }}
              >
                TRN: 100465380200003
              </p>
            </div>

          </div>

          {/* Center Box - Logos */}

          <div style={{ display: "flex", gap: '25px', alignItems: 'center' }}>
            <div

            >
              <img
                src={Images.headerRightImage}
                alt="Header"
                style={{ width: '100px' }}

              />
            </div>  <div

            >
              <img
                src={Images.headerLeftImage}
                alt="Header"
                style={{ width: '100px' }}

              />
            </div>
          </div>

          {/* Right Box - Arabic Content */}
          <div
            style={{
              // width: "32%",
              // border: "1px solid #e2e2e2",
              borderRadius: "6px",
              padding: "12px",
              // backgroundColor: "#f9f9f9",
              textAlign: "right",
              direction: "rtl",
            }}
          >
            <p
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                color: "#333",
                marginBottom: "4px",
                fontWeight: "bold"

              }}
            >
              بريميم بروفيشنل للخدمات الحكومية ش.ذ.م.م
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#333",
                margin: "2px 0",
                fontWeight: "bold"

              }}
            >
              ون ديرة مول، شارع الخليج

            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#333",
                margin: "2px 0",
                fontWeight: "bold"

              }}
            >
              ديرة — دبي
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#333",
                margin: "2px 0",
                fontWeight: "bold"

              }}
            >
              هاتف: 045264466
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#333",
                margin: "2px 0",
                fontWeight: "bold"

              }}
            >
              الرقم الضريبي: 100465380200003
            </p>
          </div>
        </div>
        <p
          variant="body2"
          style={{
            fontWeight: "bold",
            fontSize: "20px",
            margin: 0,
            textAlign: 'center',
            textDecoration: 'underline',
            marginTop: '40px',
            marginBottom: '40px',
          }}
        >
          TAX INVOICE / طلب الخدمة
        </p>
        <Box
          sx={{
            display: "flex",
            border: "1px solid #000",
            my: 2,
            fontSize: "15px",
          }}
        >
          <Box
            sx={{
              width: "50%",
              p: 2,
              borderRight: "1px solid #000",
              display: "flex",
              flexDirection: "column",
            }}
          >


            <Grid container spacing={1}>

              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Invoice Type - Invoice No نوع الفاتورة - رقم الفاتورة
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.invoiceType}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "12px",
                    margin: 0,
                  }}
                >
                  Date/التاريخ والوقت
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.date}
                </Typography>
              </Grid>
              {/* <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "15px" }}
                >
                  Name Of Employee (Typist)
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  Typist
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "15px" }}
                >
                  Name Of Employee (Cashier)
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  Cashier
                </Typography>
              </Grid> */}



              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Token Number رقم الرمز المميز
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.tokenNumber}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ width: "50%", p: 2 }}>
            <Grid item xs={6}>
              <p
                variant="body2"
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  margin: 0,
                  // textAlign:"center",
                  // marginBottom:2
                }}
              >
                Customer Information معلومات المتعاملين
              </p>
            </Grid>


            <Grid container spacing={1}>
              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    margin: 0,
                    // textAlign:"center",
                    // marginBottom:2
                  }}
                >
                  Name / الاسم
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.customerName}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    margin: 0,
                  }}
                >
                  Phone/ الهاتف رق
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.mobileNo}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Email / الالكتروني البريد
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.email}
                </Typography>
              </Grid>


              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Customer Address عنوان العميل

                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.customerAddress}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  TRN:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.trn}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box sx={{ my: 5 }}>
          <p
            variant="h6"
            style={{
              fontSize: "15px",
            }}
          >
            Particulars تفاصيل
          </p>

          <table className="mytable" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "transparent" }}>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "5%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black', }}>Sl.No الرقم</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "30%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>Service - الخدمات</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "8%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black', }}>Qty - الكمية</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "18%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>
                    Govt Fee and Bank Charge - الرسوم الحكومية
                  </p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>
                    Service Charge Taxable - تكلفة الخدمة
                  </p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>Tax Amt - قيمة المضافة</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>Total - الإجمالي بالدرهم</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceData2?.items?.map((item, index) => (
                <tr key={item.id}>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                        {item?.service?.name}

                      </span>
                      <span style={{ fontSize: "12px" }}>
                        {item.service?.name_ar}
                      </span>

                    </div>
                    <span style={{ fontSize: "12px" }}>
                      {item?.application_id}
                      {item?.transaction_id && ` || ${item.transaction_id}`}
                      {item?.ref_id && ` || ${item.ref_id}`}
                    </span>

                    {/* <p style={{ fontSize: "9px", textAlign: "left" }}>
                          {item?.details}
                        </p> */}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {item?.quantity}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {(
                      parseFloat(item?.govt_fee || 0) +
                      parseFloat(item?.bank_charge || 0)
                    ).toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {parseFloat(item?.center_fee).toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {parseFloat(parseFloat(item?.center_fee) * 0.05).toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {parseFloat(item?.total).toFixed(2)}
                  </td>
                </tr>

              ))}
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    Total Govt.fee & Bank Charge إجمالي الرسوم الحكومية ورسوم البنك
                  </p>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "8%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {
                      invoiceData2?.items
                        ?.reduce(
                          (total, item) =>
                            parseFloat(total) +
                            (parseFloat(item?.govt_fee ?? 0) + parseFloat(item?.bank_charge ?? 0)) *
                            (parseFloat(item?.quantity) || 1),
                          0
                        )
                        ?.toFixed(2)
                    }

                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>Net Taxable Amount صافي المبلغ الخاضع للضريبة</p>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {invoiceData2?.items
                      ?.reduce((total, item) => {
                        const fee = parseFloat(item?.center_fee ?? 0);
                        const qty = parseFloat(item?.quantity ?? 1);
                        return total + fee * qty;
                      }, 0)
                      .toFixed(2)}

                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}> Total VAT إجمالي القيمة المضافة</p>

                </td>
                <td
                  align="center"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {(
                      invoiceData2?.items?.reduce((total, item) => {
                        const fee = parseFloat(item?.center_fee ?? 0);
                        const qty = parseFloat(item?.quantity ?? 1);
                        return total + fee * qty;
                      }, 0) * 0.05
                    ).toFixed(2)}

                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={6}
                  align="right"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>     Gross Total إجمالي القيمة</p>

                </td>
                <td
                  align="center"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {(
                      invoiceData2?.items?.reduce((total2, item) => {
                        return parseFloat(total2) + parseFloat(item?.total ?? 0);
                      }, 0) +
                      invoiceData2?.items?.reduce((total, item) => {
                        const fee = parseFloat(item?.center_fee ?? 0);
                        const qty = parseFloat(item?.quantity ?? 1);
                        return total + fee * qty;
                      }, 0) * 0.05
                    ).toFixed(2)}

                  </p>
                </td>
              </tr>

              <tr>
                <td
                  colSpan={6}
                  align="right"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>     Total Payable الإجمالي</p>

                </td>
                <td
                  align="right"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>
                    {(
                      invoiceData2?.items?.reduce((total2, item) => {
                        return parseFloat(total2) + parseFloat(item?.total ?? 0);
                      }, 0) +
                      invoiceData2?.items?.reduce((total, item) => {
                        const fee = parseFloat(item?.center_fee ?? 0);
                        const qty = parseFloat(item?.quantity ?? 1);
                        return total + fee * qty;
                      }, 0) * 0.05
                    ).toFixed(2)}

                  </p>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="mytable" style={{ width: "100%", borderCollapse: "collapse", marginTop: '100px' }}>
            <thead>
              <tr style={{ backgroundColor: "transparent" }}>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    width: "5%",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>Receipt No.</p>
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    width: "30%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>Date </p>
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    width: "8%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>Amount</p>
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    width: "18%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>
                    Collected  By
                  </p>
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>
                    Payment Mode
                  </p>
                </th>

              </tr>
            </thead>
            <tbody>

              <tr >
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {invoiceData2?.id}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {invoiceData2?.date}
                  </div>
                  {/* <p style={{ fontSize: "9px", textAlign: "left" }}>
                                {item?.details}
                              </p> */}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "12px",
                  }}
                >
                  {(
                    invoiceData2?.items?.reduce((total2, item) => {
                      return parseFloat(total2) + parseFloat(item?.total ?? 0);
                    }, 0) +
                    invoiceData2?.items?.reduce((total, item) => {
                      const fee = parseFloat(item?.center_fee ?? 0);
                      const qty = parseFloat(item?.quantity ?? 1);
                      return total + fee * qty;
                    }, 0) * 0.05
                  ).toFixed(2)}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "12px",
                  }}
                >
                  {invoiceData2?.payment_creator?.name}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "12px",
                  }}
                >
                  {invoiceData2?.payment_mode}
                </td>

              </tr>

            </tbody>
          </table>
        </Box>
        <Box class="footer" style={{ marginTop: '0px' }}>
          <Box textAlign="center" pb={2} sx={{ my: "60px", mt: "100px" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box textAlign="center">
                <Typography variant="body2" dir="ltr" sx={{ fontSize: "12px", fontWeight: 'bold' }}>
                  {invoiceData2?.created_by?.name}
                </Typography>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  Authorized Signatory - المخول بالتوقيع
                </p>

              </Box>

              <Box textAlign="right" sx={{ fontSize: "12px" }}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  Note - ملاحظات
                </p>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  الرجاء التأكد من الفاتورة والمستندات قبل مغادرة الكاونتر
                </p>
                <Typography variant="body2" dir="ltr" sx={{ fontSize: "12px" }}>
                  Kindly check the invoice and documents before leaving the
                  counter
                </Typography>
              </Box>
            </Box>


          </Box>

          <div className="w-full h-[115px] flex justify-center items-center mb-4 mt-4" >
            <img
              src={Images.footer}
              alt="Header"
              style={{ width: "100%" }}
              className="max-w-full h-auto"
            />
          </div>
          < hr style={{ color: 'black !important' }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", fontSize: "15px", textAlign: 'right' }}
          >
            Powered By : MangoTechDevs.ae
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default PreSalesList;
