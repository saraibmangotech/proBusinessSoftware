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
  Input,
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
import { FileDownload } from "@mui/icons-material"
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

function ServiceReport() {

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


  const [loader, setLoader] = useState(false);

  const [confirmationDialog, setConfirmationDialog] = useState(false)

  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([]);
  const [Totals, setTotals] = useState(null)



  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());




  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState('desc')
  const [invoiceTotal, setInvoiceTotal] = useState(0)
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

      const { data } = await CustomerServices.getServiceReport(params)
      setCustomerQueue(data?.rows)
      const uniqueData = data?.rows?.filter(
        (item, index, self) =>
          index === self.findIndex(
            (t) => t.receipt?.invoice_number === item.receipt?.invoice_number
          )
      );

      const totalLineTotal = data?.rows?.reduce((sum, item) => {
        const centerFee = parseFloat(item?.center_fee) || 0;
        const govtFee = parseFloat(item?.govt_fee) || 0;
        const bankCharge = parseFloat(item?.bank_charge) || 0;
        const quantity = parseFloat(item?.quantity) || 0;

        const lineTotal = (centerFee + govtFee + bankCharge + (centerFee * 0.05)) * quantity;
        return sum + lineTotal;
      }, 0);

      setInvoiceTotal(totalLineTotal)
      const result = data?.rows?.reduce((acc, item) => {

        acc.totalQuantity += item.quantity;
        acc.totalServiceCharges += (item.center_fee * parseInt(item.quantity));
        acc.totalVat += (item.center_fee * parseInt(item.quantity || 0)) * 0.05;
        acc.totalGovtFee += ((parseFloat(item.govt_fee || 0) + parseFloat(item?.bank_charge || 0)) * parseInt(item.quantity || 0));
        acc.invoiceTotal += (parseFloat(item?.total || 0) + ((parseFloat(item?.center_fee || 0) * parseFloat(item?.quantity || 1)) * 0.05)).toFixed(2);
        return acc;
      }, {
        totalQuantity: 0,
        totalServiceCharges: 0,
        totalVat: 0,
        totalGovtFee: 0,
        invoiceTotal: 0
      });

      console.log(result, 'result');
      setTotals(result)

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
      header: "Inv No.",
      accessorKey: "invoice_number",
      total: false,
      accessorFn: (row) => row?.receipt?.invoice_number,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.invoice_number}
        </Box>
      ),
    },
    {
      header: "Inv Date",
      accessorFn: (row) => row?.receipt?.invoice_date ? moment(row?.receipt?.invoice_date).format("DD/MM/YYYY") : '',
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.invoice_date ? moment(row?.original?.receipt?.invoice_date).format("DD/MM/YYYY") : ''}
        </Box>
      ),
      total: false,
    },
    {
      header: "Department",
      accessorKey: "department",
      accessorFn: () => agencyType[process.env.REACT_APP_TYPE].category == 'AL-AHDEED' ? 'AL-ADHEED' : agencyType[process.env.REACT_APP_TYPE].category,
      cell: () => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {agencyType[process.env.REACT_APP_TYPE].category == 'AL-AHDEED' ? 'AL-ADHEED' : agencyType[process.env.REACT_APP_TYPE].category}
        </Box>
      ),
    },
    {
      header: "Stock ID",
      accessorKey: "stock_id",
      total: false,
      accessorFn: (row) => row?.service?.item_code,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.service?.item_code}
        </Box>
      ),
    },
    {
      header: "Service Name",
      accessorKey: "service_name",
      total: false,
      accessorFn: (row) => row?.service?.name,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.service?.name}
        </Box>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      total: false,
      accessorFn: (row) => row?.service?.category?.name,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.service?.category?.name}
        </Box>
      ),
    },
    {
      header: "Customer Ref",
      total: false,
      accessorFn: (row) => row?.receipt?.customer?.name,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.customer?.name}
        </Box>
      ),
    },
    {
      header: "Display Customer",
      accessorKey: "customer_name",
      total: false,
      accessorFn: (row) => row?.receipt?.customer_name,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.customer_name}
        </Box>
      ),
    },
    {
      header: "Customer Mobile",
      accessorKey: "customer_mobile",
      total: false,
      accessorFn: (row) => row?.receipt?.customer_mobile,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.customer_mobile}
        </Box>
      ),
    },
    {
      header: "Customer Email",
      accessorKey: "customer_email",
      total: false,
      accessorFn: (row) => row?.receipt?.customer_email,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
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
      accessorFn: (row) => (parseFloat(row?.center_fee || 0)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.center_fee || 0)).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Total Service Charge",
      accessorKey: "total_service_charge",
      accessorFn: (row) => (parseFloat(row?.center_fee || 0) * parseFloat(row?.quantity || 1)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.center_fee || 0) * parseFloat(row?.original?.quantity || 1)).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Total VAT",
      accessorKey: "total_vat",
      accessorFn: (row) => ((parseFloat(row?.center_fee || 0) * parseFloat(row?.quantity || 1)) * 0.05).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {((parseFloat(row?.original?.center_fee || 0) * parseFloat(row?.original?.quantity || 1)) * 0.05).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Govt. Fee",
      accessorKey: "govt_fee",
      accessorFn: (row) => (parseFloat(row?.govt_fee || 0) * parseFloat(row?.quantity || 1)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.govt_fee || 0) * parseFloat(row?.original?.quantity || 1)).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Bank Service Charge",
      accessorKey: "bank_charge",
      accessorFn: (row) => (parseFloat(row?.bank_charge || 0) * parseFloat(row?.quantity || 1)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.bank_charge || 0) * parseFloat(row?.original?.quantity || 1)).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Other Charge",
      accessorKey: "other_charge",
      accessorFn: () => "0.00",
      cell: () => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          0.00
        </Box>
      ),
    },
    {
      header: "Total Govt. Fee",
      accessorKey: "total_govt_fee",
      accessorFn: (row) => {
        const govtFee = parseFloat(row?.govt_fee || 0);
        const bankCharge = parseFloat(row?.bank_charge || 0);
        const quantity = parseFloat(row?.quantity || 1); // Default to 1 if quantity is missing
        return ((govtFee + bankCharge) * quantity).toFixed(2);
      },
      cell: ({ row }) => {
        const govtFee = parseFloat(row?.original?.govt_fee || 0);
        const bankCharge = parseFloat(row?.original?.bank_charge || 0);
        const quantity = parseFloat(row?.original?.quantity || 1);
        const total = (govtFee + bankCharge) * quantity;
        return (
          <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
            {total.toFixed(2)}
          </Box>
        );
      },
    },
    {
      header: "PRO Commission",
      accessorKey: "pro_commission",
      accessorFn: (row) => row?.pro_commission,
      cell: (row) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.pro_commission ? parseFloat(row?.original?.pro_commission).toFixed(2) :  '0.00'}
        </Box>
      ),
    },
    {
      header: "Typist Commission",
      accessorKey: "typist_commission",
      accessorFn: (row) => row?.typist_commission,
      cell: (row) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.typist_commission ? parseFloat(row?.original?.typist_commission).toFixed(2) :  '0.00'}
        </Box>
      ),
    },
    {
      header: "Transaction ID",
      accessorKey: "transaction_id",
      total: false,
    },
    {
      header: "Application/Case ID",
      accessorKey: "application_id",
      total: false,
    },
    {
      header: "Ref Name",
      accessorKey: "ref_no",
      total: false,
    },
    {
      header: "Payment Status",
      accessorKey: "payment_status",
      total: false,
      accessorFn: (row) => row?.receipt?.payment_status,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.is_paid ? "Paid" : "UnPaid"}
        </Box>
      ),
    },
    {
      header: "Employee ID",
      accessorKey: "employee_id",
      total: false,
      accessorFn: (row) => row?.receipt?.creator?.employee_id,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.creator?.employee_id}
        </Box>
      ),
    },
    {
      header: "Employee Name",
      accessorKey: "employee_name",
      total: false,
      accessorFn: (row) => row?.receipt?.creator?.name,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.creator?.name}
        </Box>
      ),
    },
    {
      header: "Line Total",
      accessorFn: (row) => (parseFloat(row?.center_fee || 0) + parseFloat(row?.bank_charge || 0) + parseFloat(row?.govt_fee || 0) + ((parseFloat(row?.center_fee || 0)) * 0.05) * parseFloat(row?.quantity || 1)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.center_fee || 0) + parseFloat(row?.original?.bank_charge || 0) + parseFloat(row?.original?.govt_fee || 0) + ((parseFloat(row?.original?.center_fee || 0)) * 0.05) * parseFloat(row?.original?.quantity || 1)).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Invoice Total",
      accessorKey: "total_amount",
      accessorFn: (row) => (parseFloat(row?.receipt?.total_amount || 0) + parseFloat(row?.receipt?.total_vat || 0)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.receipt?.total_amount || 0) + parseFloat(row?.original?.receipt?.total_vat || 0)).toFixed(2)}
        </Box>
      ),
    },
  ];

  const headers = [
    "SR No.",
    "Inv No.",
    "Inv Date",
    "Department",
    "Stock ID",
    "Service Name",
    "Category",
    "Customer Ref",
    "Display Customer",
    "Customer Mobile",
    "Customer Email",
    "Quantity",
    "Service Charge",
    "Total Service Charge",
    "Total VAT",
    "Govt. Fee",
    "Bank Service Charge",
    "Other Charge",
    "Total Govt. Fee",
    "Transaction ID",
    "Application/Case ID",
    "Ref Name",
    "Payment Status",
    "Employee ID",
    "Employee Name",
    "Line Total",
    "Invoice Total"
  ];
  const downloadInvoiceExcel = (data) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Invoice Report")

    // Set professional header
    worksheet.headerFooter.oddHeader =
      '&C&"Arial,Bold"&18INVOICE REPORT\n' +
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
    const titleRow = worksheet.addRow(["INVOICE REPORT"])
    titleRow.getCell(1).font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "2F4F4F" },
    }
    titleRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A1:Z1")

    const companyRow = worksheet.addRow([
      agencyType?.[process.env.REACT_APP_TYPE]?.category === "TASHEEL"
        ? "PREMIUM PROFESSIONAL GOVERNMENT SERVICES LLC"
        : "PREMIUM BUSINESSMAN SERVICES",
    ])
    companyRow.getCell(1).font = {
      name: "Arial",
      size: 14,
      bold: true,
      color: { argb: "4472C4" },
    }
    companyRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A2:Z2")

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
    worksheet.mergeCells("A3:Z3")

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
    worksheet.mergeCells("A4:Z4")

    // Add empty row for spacing
    worksheet.addRow([])

    // Define headers exactly as in your CSV function
    const headers = [
      "SR No.",
      "Inv No.",
      "Inv Date",
      "Department",
      "Stock ID",
      "Service Name",
      "Category",
      "Customer Ref",
      "Display Customer",
      "Customer Mobile",
      "Customer Email",
      "Quantity",
      "Service Charge",
      "Total Service Charge",
      "Total VAT",
      "Govt. Fee",
      "Bank Service Charge",
      "Other Charge",
      "Total Govt. Fee",
      "PRO Commission",
      "Typist Commission",
      
      "Transaction ID",
      "Application/Case ID",
      "Ref Name",
      "Payment Status",
      "Employee ID",
      "Employee Name",
      "Line Total",
      "Invoice Total",
    ]

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

    // Process data exactly as in your CSV function
    data?.forEach((item) => {
      const quantity = Number.parseFloat(item?.quantity) || 0
      const centerFee = Number.parseFloat(item?.center_fee) || 0
      const govtFee = Number.parseFloat(item?.govt_fee) || 0
      const bankCharge = Number.parseFloat(item?.bank_charge) || 0
      const totalServiceCharge = centerFee * quantity
      const totalVAT = Number.parseFloat(item?.center_fee) * Number.parseFloat(item?.quantity) * 0.05
      const totalGovtFee = (govtFee + bankCharge) * quantity

      const dataRow = worksheet.addRow([
        item.id || "",
        item?.receipt?.invoice_number || "",
        item?.receipt?.invoice_date ? moment(item?.receipt?.invoice_date).format("DD/MM/YYYY") : "",
        agencyType?.[process.env.REACT_APP_TYPE]?.category || "",
        item?.service?.item_code || "",
        item?.service?.name || "",
        item?.service?.category?.name || "",
        item?.receipt?.customer?.name || "",
        item?.receipt?.customer_name || "",
        item?.receipt?.customer_mobile || "",
        item?.receipt?.customer_email || "",
        quantity,
        centerFee.toFixed(2),
        totalServiceCharge.toFixed(2),
        totalVAT.toFixed(5),
        govtFee.toFixed(2),
        bankCharge.toFixed(2),
        "0", // Static
        totalGovtFee.toFixed(2),
        item.pro_commission ? parseFloat(item.pro_commission).toFixed(2) :  '0.00',
        item.typist_commission ? parseFloat(item.typist_commission).toFixed(2) :  '0.00',
        item.transaction_id || "",
        item.application_id || "",
        item.ref_no || "",
        item?.receipt?.is_paid ? "Paid" : "UnPaid",
        item?.receipt?.creator?.employee_id || "",
        item?.receipt?.creator?.name || "",
        ((centerFee + bankCharge + govtFee + (centerFee * 0.05)) * quantity).toFixed(5),
        (Number.parseFloat(item?.receipt?.total_amount) + Number.parseFloat(item?.receipt?.total_vat)).toFixed(5),
      ])

      // Style data rows
      dataRow.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 10 }
        cell.alignment = {
          horizontal: [12, 13, 14, 15, 16, 18, 26, 27].includes(colNumber) ? "right" : "left", // Number columns right-aligned
          vertical: "middle",
        }
        cell.border = {
          top: { style: "hair", color: { argb: "CCCCCC" } },
          left: { style: "hair", color: { argb: "CCCCCC" } },
          bottom: { style: "hair", color: { argb: "CCCCCC" } },
          right: { style: "hair", color: { argb: "CCCCCC" } },
        }

        // Format number columns
        if ([12, 13, 14, 15, 16, 18, 26, 27].includes(colNumber)) {
          if (colNumber === 14 || colNumber === 26 || colNumber === 27) {
            cell.numFmt = "#,##0.00000" // 5 decimal places for VAT and totals
          } else {
            cell.numFmt = "#,##0.00" // 2 decimal places for other amounts
          }
        }
      })
    })

    // Calculate totals exactly as in your CSV function
    const totalServiceCharge = data.reduce(
      (sum, item) => sum + Number.parseFloat(item?.center_fee) * Number.parseFloat(item?.quantity),
      0,
    )
    const totalVat = data.reduce(
      (sum, item) => sum + Number.parseFloat(item?.center_fee) * Number.parseFloat(item?.quantity) * 0.05,
      0,
    )
    const totalGovtFee = data.reduce((sum, item) => {
      const govtFee = Number.parseFloat(item?.govt_fee) || 0
      const bankCharge = Number.parseFloat(item?.bank_charge) || 0
      const quantity = Number.parseFloat(item?.quantity) || 0
      return sum + (govtFee + bankCharge) * quantity
    }, 0)
    const totalLineTotal = data.reduce((sum, item) => {
      const centerFee = parseFloat(item?.center_fee) || 0;
      const govtFee = parseFloat(item?.govt_fee) || 0;
      const bankCharge = parseFloat(item?.bank_charge) || 0;
      const quantity = parseFloat(item?.quantity) || 0;

      const subtotal = centerFee + govtFee + bankCharge + (centerFee * 0.05);
      return sum + (subtotal * quantity);
    }, 0);
    const totalInvoiceTotal = data.reduce(
      (sum, item) => sum + (Number.parseFloat(item?.receipt?.total_amount) + Number.parseFloat(item?.receipt?.total_vat)),
      0,
    )

    // Add empty row before totals
    worksheet.addRow([])

    // Add totals row
    const totalRow = worksheet.addRow([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      totalServiceCharge.toFixed(2),
      totalVat.toFixed(2),
      "",
      "",
      "0",
      totalGovtFee.toFixed(2),
      "",
      "",
      "",
      "",
      "",
      "",
      totalLineTotal.toFixed(2),
      totalInvoiceTotal.toFixed(2),
    ])

    // Style totals row
    totalRow.eachCell((cell, colNumber) => {
      if ([14, 15, 19, 26, 27].includes(colNumber)) {
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
        cell.alignment = { horizontal: "right", vertical: "middle" }

        if (colNumber === 15 || colNumber === 26 || colNumber === 27) {
          cell.numFmt = "#,##0.00000" // 5 decimal places
        } else {
          cell.numFmt = "#,##0.00" // 2 decimal places
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
    worksheet.mergeCells(`A${reportRow.number}:Z${reportRow.number}`)

    // Add powered by line
    const poweredByRow = worksheet.addRow(["Powered by MangotechDevs.ae"])
    poweredByRow.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    poweredByRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`A${poweredByRow.number}:Z${poweredByRow.number}`)

    // Set column widths
    worksheet.columns = [
      { width: 8 }, // SR No.
      { width: 12 }, // Inv No.
      { width: 12 }, // Inv Date
      { width: 15 }, // Department
      { width: 12 }, // Stock ID
      { width: 20 }, // Service Name
      { width: 15 }, // Category
      { width: 15 }, // Customer Ref
      { width: 15 }, // Display Customer
      { width: 15 }, // Customer Mobile
      { width: 20 }, // Customer Email
      { width: 10 }, // Quantity
      { width: 12 }, // Service Charge
      { width: 15 }, // Total Service Charge
      { width: 12 }, // Total VAT
      { width: 12 }, // Govt. Fee
      { width: 15 }, // Bank Service Charge
      { width: 12 }, // Other Charge
      { width: 15 }, // Total Govt. Fee
      { width: 15 }, // Transaction ID
      { width: 18 }, // Application/Case ID
      { width: 12 }, // Ref Name
      { width: 12 }, // Payment Status
      { width: 12 }, // Employee ID
      { width: 15 }, // Employee Name
      { width: 12 }, // Line Total
      { width: 15 }, // Invoice Total
    ]

    // Add workbook properties
    workbook.creator = "Finance Department"
    workbook.lastModifiedBy = "Finance System"
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.lastPrinted = new Date()

    // Set workbook properties
    workbook.properties = {
      title: "Invoice Report",
      subject: "Financial Report",
      keywords: "invoice, financial, accounting, services",
      category: "Financial Reports",
      description: "Invoice report generated from accounting system",
      company: "Premium Professional Government Services LLC",
    }

    const download = async () => {
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      saveAs(blob, "Invoice_Report.xlsx")
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
        <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Service Report</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          {customerQueue?.length > 0 &&
            <Button
              onClick={() => downloadInvoiceExcel(customerQueue)}
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
            </Button>}

        </Box>


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


        {<DataTable loading={loader} csvName={'service_report'} data={customerQueue} columns={columns} />}

        <Grid container spacing={2} mt={1}>
          <Grid item xs={4}>
            <Input
              sx={{
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: "Black !important"

                }
              }}
              fullWidth
              disabled
              value={`Total Quantity: ${CommaSeparator(parseFloat(Totals?.totalQuantity).toFixed(2))}`}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              sx={{
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: "Black !important"

                }
              }}
              fullWidth
              disabled
              value={`Total Govt Fee: ${CommaSeparator(parseFloat(Totals?.totalGovtFee).toFixed(2))}`}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              sx={{
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: "Black !important"

                }
              }}
              fullWidth
              disabled
              value={`Total Service Charges: ${CommaSeparator(parseFloat(Totals?.totalServiceCharges).toFixed(2))}`}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              sx={{
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: "Black !important"

                }
              }}
              fullWidth
              disabled
              value={`Total Vat: ${CommaSeparator(parseFloat(Totals?.totalVat).toFixed(2))}`}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              sx={{
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: "Black !important"

                }
              }}
              fullWidth
              disabled
              value={`Total Invoice Amount: ${CommaSeparator(parseFloat(invoiceTotal).toFixed(2))}`}
            />
          </Grid>

        </Grid>
      </Box>

    </Box>
  );
}

export default ServiceReport;