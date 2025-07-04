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

function SnapshotEmployeeServiceReport() {

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

  // *For Get Customer Queue
  const getCustomerQueue = async (page, limit, filter) => {
    if (selectedUser?.id) {
      setLoader(true)

      try {

        let params = {
          page: 1,
          limit: 999999,
          from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
          to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',
          created_by: selectedUser?.id

        }

        const { data } = await CustomerServices.getServiceReport(params)
        setCustomerQueue(data?.rows)

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
        limit: 999999,
      }
      params = { ...params, ...Filter }

      const { data } = await UserServices.getUsers(params)
      setUsers(data?.users?.rows)



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
      header: "Employee ID",
      accessorKey: "employee_id",
      accessorFn: (row) => row?.receipt?.creator?.employee_id,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.receipt?.creator?.employee_id}
        </Box>
      ),
    },
    {
      header: "Employee Name",
      accessorKey: "employee_name",
      accessorFn: (row) => row?.receipt?.creator?.name,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.receipt?.creator?.name}
        </Box>
      ),
    },
    {
      header: "Inv No.",
      accessorKey: "invoice_number",
      accessorFn: (row) => row?.receipt?.invoice_number,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.receipt?.invoice_number}
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
      header: "Department",
      accessorKey: "department",
      accessorFn: (row) => agencyType[process.env.REACT_APP_TYPE].category == 'AL-AHDEED' ? 'AL-ADHEED' : 'TASHEEL',
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {agencyType[process.env.REACT_APP_TYPE].category == 'AL-AHDEED' ? 'AL-ADHEED' : 'TASHEEL' }
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
      accessorFn: (row) => row?.service?.category?.name,
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
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {parseFloat(row?.original?.center_fee).toFixed(2)}
        </Box>
      ),
    },

    {
      header: "Total Service Charge",
      accessorKey: "total_service_charge",
      accessorFn: (row) =>
        (parseFloat(row?.center_fee) * parseFloat(row?.quantity)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.center_fee) * parseFloat(row?.original?.quantity)).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Total VAT",
      accessorKey: "total_vat",
      accessorFn: (row) =>
        ((parseFloat(row?.center_fee) * parseFloat(row?.quantity)) * 0.05).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {((parseFloat(row?.original?.center_fee) * parseFloat(row?.original?.quantity)) * 0.05).toFixed(2)}
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
      accessorFn: (row) => (
        parseFloat(row?.total) +
        ((parseFloat(row?.center_fee) * parseFloat(row?.quantity)) * 0.05)
      ).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.total) +
            ((parseFloat(row?.original?.center_fee) * parseFloat(row?.original?.quantity)) * 0.05)).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Invoice Total",
      accessorKey: "inv_total",
      accessorFn: (row) =>
        (parseFloat(row?.receipt?.total_amount) + parseFloat(row?.receipt?.total_vat)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.receipt?.total_amount) +
            parseFloat(row?.original?.receipt?.total_vat)).toFixed(2)}
        </Box>
      ),
    },
  ];

  const downloadEmployeeServiceReportExcel = () => {
    // Skip if no data
    if (!customerQueue || customerQueue.length === 0) return

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Employee Service Report")

    // Set professional header
    worksheet.headerFooter.oddHeader =
      '&C&"Arial,Bold"&18EMPLOYEE SERVICE REPORT\n' +
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
    const titleRow = worksheet.addRow(["EMPLOYEE SERVICE REPORT"])
    titleRow.getCell(1).font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "2F4F4F" },
    }
    titleRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A1:AA1") // Merge cells across all columns

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
    worksheet.mergeCells("A2:AA2")

    // Add selected employee name row
    const employeeRow = worksheet.addRow([
      selectedUser
        ? `Employee: ${selectedUser.name || selectedUser.employeeName || selectedUser}`
        : "Employee: All Employees",
    ])
    employeeRow.getCell(1).font = {
      name: "Arial",
      size: 12,
      bold: true,
      color: { argb: "2F4F4F" },
    }
    employeeRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A3:AA3")

    const dateRow = worksheet.addRow([
      `Report Generated: ${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})} at ${new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}`,
    ])
    dateRow.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    dateRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A4:AA4")

    const periodRow = worksheet.addRow([
      toDate && fromDate
        ? `Period: ${fromDate ? new Date(fromDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "Present"}`
        : `Period: All`,
    ])
    periodRow.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    periodRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A5:AA5")

    // Add empty row for spacing
    worksheet.addRow([])

    // Define headers based on the columns structure
    const headers = [
      "SR No.",
      "Employee ID",
      "Employee Name",
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

    // Track totals for numeric columns
    const totals = {}

    // Add data rows
    customerQueue.forEach((item, index) => {
      const quantity = Number.parseFloat(item?.quantity) || 0
      const centerFee = Number.parseFloat(item?.center_fee) || 0
      const govtFee = Number.parseFloat(item?.govt_fee) || 0
      const bankCharge = Number.parseFloat(item?.bank_charge) || 0
      const totalServiceCharge = centerFee * quantity
      const totalVAT = totalServiceCharge * 0.05
      const lineTotal = Number.parseFloat(item?.total) + totalVAT
      const invoiceTotal = Number.parseFloat(item?.receipt?.total_amount) + Number.parseFloat(item?.receipt?.total_vat)

      const dataRow = worksheet.addRow([
        index + 1, // SR No.
        item?.receipt?.creator?.employee_id || "",
        item?.receipt?.creator?.name || "",
        item?.receipt?.invoice_number || "",
        item?.receipt?.invoice_date ? moment(item?.receipt?.invoice_date).format("DD/MM/YYYY") : "",
        agencyType[process.env.REACT_APP_TYPE].category == 'AL-AHDEED' ? 'AL-ADHEED' : 'TASHEEL',
        item?.service?.item_code || "",
        item?.service?.name || "",
        item?.service?.category?.name || "",
        "Walk-In Customer",
        item?.receipt?.customer_name || "",
        item?.receipt?.customer_mobile || "",
        item?.receipt?.customer_email || "",
        quantity,
        centerFee.toFixed(2),
        totalServiceCharge.toFixed(2),
        totalVAT.toFixed(2),
        govtFee.toFixed(2),
        bankCharge.toFixed(2),
        "0.00", // Other Charge (static)
        govtFee.toFixed(2), // Total Govt. Fee (same as Govt. Fee based on columns)
        item?.transaction_id || "",
        item?.application_id || "",
        item?.ref_no || "",
        item?.receipt?.is_paid ? "Paid" : "UnPaid",
        lineTotal.toFixed(2),
        invoiceTotal.toFixed(2),
      ])

      // Calculate totals for numeric columns
      totals.quantity = (totals.quantity || 0) + quantity
      totals.centerFee = (totals.centerFee || 0) + centerFee
      totals.totalServiceCharge = (totals.totalServiceCharge || 0) + totalServiceCharge
      totals.totalVAT = (totals.totalVAT || 0) + totalVAT
      totals.govtFee = (totals.govtFee || 0) + govtFee
      totals.bankCharge = (totals.bankCharge || 0) + bankCharge
      totals.lineTotal = (totals.lineTotal || 0) + lineTotal
      totals.invoiceTotal = (totals.invoiceTotal || 0) + invoiceTotal

      // Style data rows
      dataRow.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 10 }

        // Determine alignment based on column type
        const isNumericColumn = [14, 15, 16, 17, 18, 19, 20, 21, 26, 27].includes(colNumber) // Quantity and amount columns

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
          if (colNumber === 14) {
            // Quantity
            cell.numFmt = "#,##0"
            cell.value = Number.parseInt(cell.value || 0)
          } else {
            // Amount columns
            cell.numFmt = "#,##0.00"
            cell.value = Number.parseFloat(cell.value || 0)
          }
        }
      })
    })

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
      totals.quantity || 0,
      totals.centerFee?.toFixed(2) || "0.00",
      totals.totalServiceCharge?.toFixed(2) || "0.00",
      totals.totalVAT?.toFixed(2) || "0.00",
      totals.govtFee?.toFixed(2) || "0.00",
      totals.bankCharge?.toFixed(2) || "0.00",
      "0.00",
      totals.govtFee?.toFixed(2) || "0.00",
      "",
      "",
      "",
      "",
      totals.lineTotal?.toFixed(2) || "0.00",
      totals.invoiceTotal?.toFixed(2) || "0.00",
    ])

    // Style totals row
    totalRow.eachCell((cell, colNumber) => {
      const hasValue = [14, 15, 16, 17, 18, 19, 20, 21, 26, 27].includes(colNumber)

      if (hasValue) {
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

        if (colNumber === 14) {
          // Quantity
          cell.numFmt = "#,##0"
          cell.value = Number.parseInt(cell.value || 0)
        } else {
          // Amount columns
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
    worksheet.mergeCells(`A${reportRow.number}:AA${reportRow.number}`)

    // Add powered by line
    const poweredByRow = worksheet.addRow(["Powered by MangotechDevs.ae"])
    poweredByRow.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    poweredByRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`A${poweredByRow.number}:AA${poweredByRow.number}`)

    // Set column widths
    worksheet.columns = [
      { width: 8 }, // SR No.
      { width: 12 }, // Employee ID
      { width: 20 }, // Employee Name
      { width: 12 }, // Inv No.
      { width: 12 }, // Inv Date
      { width: 15 }, // Department
      { width: 12 }, // Stock ID
      { width: 25 }, // Service Name
      { width: 15 }, // Category
      { width: 18 }, // Customer Ref
      { width: 20 }, // Display Customer
      { width: 15 }, // Customer Mobile
      { width: 25 }, // Customer Email
      { width: 10 }, // Quantity
      { width: 15 }, // Service Charge
      { width: 18 }, // Total Service Charge
      { width: 12 }, // Total VAT
      { width: 12 }, // Govt. Fee
      { width: 18 }, // Bank Service Charge
      { width: 12 }, // Other Charge
      { width: 15 }, // Total Govt. Fee
      { width: 15 }, // Transaction ID
      { width: 18 }, // Application/Case ID
      { width: 12 }, // Ref Name
      { width: 15 }, // Payment Status
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
      title: "Employee Service Report",
      subject: "Employee Service Report",
      keywords: "employee, service, invoice, financial, accounting",
      category: "Service Reports",
      description: "Employee service report generated from accounting system",
      company: companyName,
    }

    const download = async () => {
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      saveAs(blob,
        toDate && fromDate
            ? `employee_service_report : ${fromDate ? new Date(fromDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "Present"}`
            : `employee_service_report: Present `,);
 
    }

    download()
  }
  useEffect(() => {
    getUsers()
    setFromDate(new Date())
    setToDate(new Date())

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
        <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}> Employee Service Report</Typography>

        {customerQueue?.length > 0 &&
          <Button
            onClick={() => downloadEmployeeServiceReportExcel(customerQueue)}


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
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <SelectField
                size={"small"}
                label={"Select User "}
                options={users}
                disabled={fieldDisabled}
                selected={selectedUser}
                onSelect={(value) => {
                  setSelectedUser(value);

                }}
                error={errors?.user?.message}
                register={register("user", {
                  required: "Please select user account.",
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
      </Box>

    </Box>
  );
}

export default SnapshotEmployeeServiceReport;