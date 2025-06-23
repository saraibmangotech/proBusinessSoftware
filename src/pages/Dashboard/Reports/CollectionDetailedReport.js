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
  Input, Drawer,
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

function CollectionDetailedReport() {

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
  const [customTotals, setCustomTotals] = useState({});
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());


  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState(null)



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

      const { data } = await CustomerServices.getDetailedCollectionReport(params)
      setCustomerQueue(data?.rows)
      let totalData = data?.totals
      if (agencyType[process.env.REACT_APP_TYPE]?.category != "TASHEEL") {

        delete totalData?.totalMohre
        console.log(totalData, 'totalDatatotalData');
      }

      setData(totalData)


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
      header: "SR No.",
      accessorKey: "sr_no",
      cell: ({ row }) => row.index + 1,
    },
    {
      header: "Receipt No.",
      accessorKey: "receipt_number",
      total: false,
      accessorFn: (row) => row?.receipt_number,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.receipt_number}
        </Box>
      ),
    },

    {
      header: "Invoice no.",
      accessorKey: "invoice_number",
      total: false,
      accessorFn: (row) => row?.invoice_number,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.invoice_number}
        </Box>
      ),
    },

    {
      header: "Receipt Date",
      accessorKey: "invoice_date",
      total: false,
      accessorFn: (row) => row?.receipt_date ? moment(row?.receipt_date).format("DD/MM/YYYY") : '',
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.receipt_date ? moment(row?.original?.receipt_date).format("DD/MM/YYYY") : ""}
        </Box>
      ),
    },






    {
      header: "Cashier",
      accessorKey: "cashier",
      total: false,
      accessorFn: (row) => row?.cashier?.name,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.cashier?.name}
        </Box>
      ),
    },
    {
      header: "Pay. Method",
      accessorKey: "pay_method",
      total: false,
      accessorFn: (row) => row?.payment_method,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.payment_method}
        </Box>
      ),
    },


    {
      header: "Sub Total",
      accessorKey: "line_total",
      accessorFn: (row) => (parseFloat(row?.line_total)).toFixed(2),
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {(parseFloat(row?.original?.line_total)).toFixed(2)}

        </Box>
      ),
    },

    {
      header: "Amount",
      accessorKey: "amount",
      accessorFn: (row) => (parseFloat(row?.amount)).toFixed(2),
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {(parseFloat(row?.original?.amount)).toFixed(2)}

        </Box>
      ),
    },

    {
      header: "Additional Charges",
      accessorKey: "additional_charges",
      accessorFn: (row) => (parseFloat(row?.additional_charges_value)).toFixed(2),
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {(parseFloat(row?.original?.additional_charges_value)).toFixed(2)}

        </Box>
      ),
    },
    {
      header: "Auth Code",
      accessorKey: "auth_code",
      total: false,
      accessorFn: (row) => (row?.auth_code ? row?.auth_code : "-"),
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.auth_code ? row?.original?.auth_code : "-"}
        </Box>
      ),
    },

    {
      header: "Total",
      accessorKey: "line_total",
      accessorFn: (row) => (parseFloat(row?.line_total)).toFixed(2),
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {(parseFloat(row?.original?.line_total)).toFixed(2)}

        </Box>
      ),
    },






  ];


  useEffect(() => {
    setFromDate(new Date())
    setToDate(new Date())
    getCustomerQueue()
  }, []);



const handleCSVDownload = () => {
  // Skip if no data
  if (!customerQueue || customerQueue.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Collection Detailed Report");

  // Set professional header
  worksheet.headerFooter.oddHeader =
    '&C&"Arial,Bold"&18COLLECTION DETAILED REPORT\n' +
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
  const titleRow = worksheet.addRow(["COLLECTION DETAILED REPORT"]);
  titleRow.getCell(1).font = {
    name: "Arial",
    size: 16,
    bold: true,
    color: { argb: "2F4F4F" },
  };
  titleRow.getCell(1).alignment = { horizontal: "center" };
  worksheet.mergeCells(`A1:${String.fromCharCode(64 + columns.length)}1`); // Merge cells across all columns

  const companyName =
    agencyType?.[process.env.REACT_APP_TYPE]?.category === "TASHEEL"
      ? "PREMIUM BUSINESSMEN SERVICES"
      : "PREMIUM PROFESSIONAL GOVERNMENT SERVICES LLC";

  const companyRow = worksheet.addRow([companyName]);
  companyRow.getCell(1).font = {
    name: "Arial",
    size: 14,
    bold: true,
    color: { argb: "4472C4" },
  };
  companyRow.getCell(1).alignment = { horizontal: "center" };
  worksheet.mergeCells(`A2:${String.fromCharCode(64 + columns.length)}2`);

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
  worksheet.mergeCells(`A3:${String.fromCharCode(64 + columns.length)}3`);

  const periodRow = worksheet.addRow([
    toDate && fromDate
      ? `Period: ${fromDate ? new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Present"}`
      : `Period: All`,
  ]);
  periodRow.getCell(1).font = {
    name: "Arial",
    size: 10,
    italic: true,
    color: { argb: "666666" },
  };
  periodRow.getCell(1).alignment = { horizontal: "center" };
  worksheet.mergeCells(`A4:${String.fromCharCode(64 + columns.length)}4`);

  // Add empty row for spacing
  worksheet.addRow([]);

  // Add headers exactly as in your original code
  const headers = columns.map((col) => col.header);
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

  // Track totals for numeric columns exactly as in your original code
  const totals = {};
  const excludeFromTotal = ["Receipt Date", "Card No.", "Category", "Cashier", "Pay. Method"];

  // Add data rows exactly as in your original code
  customerQueue.forEach((row, index) => {
    const rowData = columns.map((col, colIndex) => {
      if (col.header === "SR No.") return index + 1;

      let value = col.accessorFn ? col.accessorFn(row) : row[col.accessorKey];

      // Format payment method exactly as in your original code
      if (col.accessorKey === "pay_method") {
        value = value?.split(",").join(" & ");
      }

      // Determine if numeric exactly as in your original code
      const isNumeric = typeof value === "number" || !isNaN(Number.parseFloat(value));

      // Calculate totals for numeric columns exactly as in your original code
      if (isNumeric && col.header !== "SR No." && !excludeFromTotal.includes(col.header)) {
        totals[col.header] = (totals[col.header] || 0) + Number.parseFloat(value || 0);
      }

      return value ?? "";
    });

    const dataRow = worksheet.addRow(rowData);

    // Style data rows
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: "Arial", size: 10 };

      // Check if this column is likely to be numeric
      const colHeader = columns[colNumber - 1]?.header;
      const isLikelyNumeric =
        !excludeFromTotal.includes(colHeader) &&
        colHeader !== "SR No." &&
        (colHeader?.includes("Amount") ||
          colHeader?.includes("Total") ||
          colHeader?.includes("Fee") ||
          colHeader?.includes("Price") ||
          colHeader?.includes("Cost"));

      cell.alignment = {
        horizontal: isLikelyNumeric ? "right" : "left",
        vertical: "middle",
      };

      cell.border = {
        top: { style: "hair", color: { argb: "CCCCCC" } },
        left: { style: "hair", color: { argb: "CCCCCC" } },
        bottom: { style: "hair", color: { argb: "CCCCCC" } },
        right: { style: "hair", color: { argb: "CCCCCC" } },
      };

      // Format numeric cells
      if (isLikelyNumeric && !isNaN(Number.parseFloat(cell.value))) {
        cell.numFmt = "#,##0.00";
        cell.value = Number.parseFloat(cell.value);
      }
    });
  });

  // Add empty row before totals
  worksheet.addRow([]);

  // Add TOTAL row - FIXED: Use numbers instead of strings
  const totalRowData = columns.map((col, i) => {
    if (i === 0) return "TOTAL";
    const val = totals[col.header];
    return val != null ? val : ""; // Return number directly, not string with .toFixed(2)
  });

  const totalRow = worksheet.addRow(totalRowData);

  // Style total row
  totalRow.eachCell((cell, colNumber) => {
    const colHeader = columns[colNumber - 1]?.header;
    const hasValue = cell.value !== "" && cell.value !== "TOTAL";

    if (colNumber === 1 || hasValue) {
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

      if (colNumber === 1) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "right", vertical: "middle" };
        if (!isNaN(Number.parseFloat(cell.value))) {
          cell.numFmt = "#,##0.00";
          // cell.value is already a number, no need to convert
        }
      }
    }
  });

  // Add custom total rows from data object with specific totals structure (like collection report)
  if (data && Object.keys(data).length > 0) {
    // Add empty row for spacing
    worksheet.addRow([]);

    // Add a section header for totals
    const totalsHeaderRow = worksheet.addRow(["PAYMENT METHOD TOTALS"]);
    totalsHeaderRow.getCell(1).font = {
      name: "Arial",
      size: 12,
      bold: true,
      color: { argb: "2F4F4F" },
    };
    totalsHeaderRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    totalsHeaderRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "E6E6E6" }, // Light gray background
    };
    worksheet.mergeCells(
      `A${totalsHeaderRow.number}:${String.fromCharCode(64 + Math.min(columns.length, 4))}${totalsHeaderRow.number}`,
    );

    // Define the specific totals with proper labels (like collection report)
    const totalLabels = {
      totalCash: "Total Cash",
      totalNetwork: "Total Network",
      totalBank: "Total Bank Transfer",
      totalCard: "Total Card",
      totalAmount: "Grand Total Amount",
      totalMohre: "Total MOHRE",
    };

    // Add custom total rows in a structured format - FIXED: Use numbers instead of strings
    Object.entries(data).forEach(([key, value]) => {
      const label = totalLabels[key] || key.replace(/total/, "Total ");
      const customRowData = Array(columns.length).fill("");
      customRowData[0] = label;
      customRowData[1] = Number.parseFloat(value || 0); // Use number directly, not .toFixed(2)

      const customRow = worksheet.addRow(customRowData);

      // Style custom total rows with different colors for grand total
      const isGrandTotal = key === "totalAmount";

      customRow.getCell(1).font = {
        name: "Arial",
        size: isGrandTotal ? 12 : 11,
        bold: true,
        color: { argb: isGrandTotal ? "FFFFFF" : "000000" },
      };
      customRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

      if (isGrandTotal) {
        customRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "2F4F4F" }, // Dark gray for grand total
        };
      }

      customRow.getCell(2).font = {
        name: "Arial",
        size: isGrandTotal ? 12 : 11,
        bold: true,
        color: { argb: isGrandTotal ? "FFFFFF" : "000000" },
      };
      customRow.getCell(2).alignment = { horizontal: "right", vertical: "middle" };
      customRow.getCell(2).numFmt = "#,##0.00";
      // cell.value is already set as number above

      if (isGrandTotal) {
        customRow.getCell(2).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "2F4F4F" }, // Dark gray for grand total
        };
        customRow.getCell(2).border = {
          top: { style: "medium", color: { argb: "000000" } },
          left: { style: "medium", color: { argb: "000000" } },
          bottom: { style: "medium", color: { argb: "000000" } },
          right: { style: "medium", color: { argb: "000000" } },
        };
        customRow.getCell(1).border = {
          top: { style: "medium", color: { argb: "000000" } },
          left: { style: "medium", color: { argb: "000000" } },
          bottom: { style: "medium", color: { argb: "000000" } },
          right: { style: "medium", color: { argb: "000000" } },
        };
      }
    });
  }

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
  worksheet.mergeCells(`A${reportRow.number}:${String.fromCharCode(64 + columns.length)}${reportRow.number}`);

  // Add powered by line
  const poweredByRow = worksheet.addRow(["Powered by MangotechDevs.ae"]);
  poweredByRow.getCell(1).font = {
    name: "Arial",
    size: 10,
    italic: true,
    color: { argb: "666666" },
  };
  poweredByRow.getCell(1).alignment = { horizontal: "center" };
  worksheet.mergeCells(`A${poweredByRow.number}:${String.fromCharCode(64 + columns.length)}${poweredByRow.number}`);

  // Set column widths - dynamically based on header content
  worksheet.columns.forEach((column, i) => {
    const maxLength = headers[i]?.length || 10;
    column.width = Math.max(maxLength + 2, 12); // Minimum width of 12
  });

  // Add workbook properties
  workbook.creator = "Finance Department";
  workbook.lastModifiedBy = "Finance System";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.lastPrinted = new Date();

  // Set workbook properties
  workbook.properties = {
    title: "Collection Detailed Report",
    subject: "Financial Report",
    keywords: "collection, detailed, financial, accounting",
    category: "Financial Reports",
    description: "Collection detailed report generated from accounting system",
    company: companyName,
  };

  const download = async () => {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob,
      toDate && fromDate
        ? `collection_report_detailed : ${fromDate ? new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Present"}`
        : `collection_report_detailed: Present `);
  };

  download();
};



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
        <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Detailed Collection Report</Typography>



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
          <Grid item>
            <PrimaryButton
              bgcolor={"#001f3f"}
              title="Download Excel"
              sx={{ marginTop: "30px" }}
              onClick={() => handleCSVDownload()}
              loading={loading}
            />
          </Grid>
        </Grid>
      </Grid>
      <Box >


        {<DataTable loading={loader} total={true} csv={false} data={customerQueue} columns={columns} />}
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
              value={`Total Cash: ${CommaSeparator(parseFloat(data?.totalCash).toFixed(2))}`}
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
              value={`Total Network: ${CommaSeparator(parseFloat(data?.totalNetwork).toFixed(2))}`}
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
              value={`Total Bank: ${CommaSeparator(parseFloat(data?.totalBank).toFixed(2))}`}
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
              value={`Total Card: ${CommaSeparator(parseFloat(data?.totalCard).toFixed(2))}`}
            />
          </Grid>
          {agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" && <Grid item xs={4}>
            <Input
              sx={{
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: "Black !important"

                }
              }}
              fullWidth
              disabled
              value={`Mohre Account Receivable: ${CommaSeparator(parseFloat(data?.totalMohre).toFixed(2))}`}
            />
          </Grid>}
          <Grid item xs={4}>
            <Input
              sx={{
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: "Black !important"

                }
              }}
              fullWidth
              disabled
              value={`Total Amount: ${CommaSeparator(parseFloat(data?.totalAmount).toFixed(2))}`}
            />
          </Grid>
        </Grid>
      </Box>

    </Box>
  );
}

export default CollectionDetailedReport;