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
import {
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
import moment from "moment";
import CommissionServices from "services/Commission";
import LabelCustomInput from "components/Input/LabelCustomInput";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import { adjustSectionValue } from "@mui/x-date-pickers/internals/hooks/useField/useField.utils";
import VisaServices from "services/Visa";
import DatePicker from "components/DatePicker";
import SystemServices from "services/System";
import { PDFExport } from "@progress/kendo-react-pdf";
import { textAlign } from "@mui/system";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
// Custom Styled Components
const StyledBox = styled(Box)(({ theme }) => ({
  padding: "20px",
}));

const HeaderTypography = styled(Typography)(({ theme }) => ({
  fontSize: "20px",
  fontWeight: "bold",
  textAlign: "center",
}));

const TableHeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  fontSize: "12px",
  border: "1px solid #2c5b8f",
}));

const TableDataCell = styled(TableCell)(({ theme }) => ({
  fontSize: "12px",
  border: "1px solid #2c5b8f !important",
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: "20px",
  color: "#2c5b8f",
  textAlign: "center",
}));
function VisaInvoice() {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    setValue: setValue2,
    getValues: getValues2,
    formState: { errors: errors2 },
  } = useForm();
  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);

  const tableHead = [
    { name: "SR No.", key: "" },
    { name: "Description", key: "created_at" },
    { name: "Visa Rate", key: "visa_rate" },
    { name: "Tax", key: "tax" },
    { name: "Total", key: "total" },
  ];
  //   state for visaprocessing use it later saraib
  //  const [visaprocessingList, setVisaProcessingList] = useState([])

  const visaprocessingList = [
    {
      vr_no: 2,
      date: moment(),
      customer: "Talha",
      visa_qnty: 2,
      visa_rate: 23,
      status: "active",
    },
    {
      vr_no: 2,
      date: moment(),
      customer: "Talha",
      visa_qnty: 2,
      visa_rate: 23,
      status: "active",
    },
    {
      vr_no: 2,
      date: moment(),
      customer: "Talha",
      visa_qnty: 2,
      visa_rate: 23,
      status: "active",
    },
  ];
  const [loader, setLoader] = useState(false);

  const [sort, setSort] = useState("asc");

  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([
    { id: 1, name: "asdasd" },
    { id: 1, name: "asdasd" },
  ]);

  // *For setPermissions
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVisa, setSelectedVisa] = useState(null);

  const [itemAmount, setItemAmount] = useState();
  const [status, setStatus] = useState();
  const [date, setDate] = useState(null);
  const [paymentType, setPaymentType] = useState(null);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false);

  // *For Get Customer Queue

  const UpdateStatus = async () => {
    try {
      let obj = {
        status: status.id ? "approved" : "rejected",
        visa_id: selectedVisa?.id,
      };

      const promise = VisaServices.updateStatus(obj);
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
        // getVisaRequestList();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSort = (key) => {
    let data = {
      sort_by: key,
      sort_order: sort,
    };
    // Debounce(() => getVisaRequestList(1, '', data));
  };
  const rows = [
      { id: 1, name: "Ahamd Miya", country: "Indian", passport: "X9493037", rate: "2,000.00", amount: "112,000.00" },
      { id: 2, name: "Azadmiya", country: "Indian", passport: "V5411877", rate: "2,000.00", amount: "" },
      { id: 3, name: "Firoj Alam", country: "Indian", passport: "U2158798", rate: "2,000.00", amount: "" },
      { id: 4, name: "Balwinder Masih", country: "Indian", passport: "W9572433", rate: "2,000.00", amount: "" },
      { id: 5, name: "Manga Masih", country: "Indian", passport: "T3061480", rate: "2,000.00", amount: "" },
      { id: 6, name: "Imran Khan", country: "Indian", passport: "M7974660", rate: "2,000.00", amount: "" },
      { id: 7, name: "Jahir Hussain", country: "Indian", passport: "V9917114", rate: "2,000.00", amount: "" },
      { id: 8, name: "Osim Khan", country: "Indian", passport: "T0988033", rate: "2,000.00", amount: "" },
      { id: 9, name: "Safarul Khan", country: "Indian", passport: "V5413802", rate: "2,000.00", amount: "" },
      { id: 10, name: "Sajaidalam", country: "Indian", passport: "Y653221", rate: "2,000.00", amount: "" },
      { id: 11, name: "Santosh Kumar", country: "Indian", passport: "N8336332", rate: "2,000.00", amount: "" },
      { id: 12, name: "Santosh Kumar", country: "Indian", passport: "N8336332", rate: "2,000.00", amount: "" },
      { id: 13, name: "Santosh Kumar", country: "Indian", passport: "N8336332", rate: "2,000.00", amount: "" },
      { id: 14, name: "Santosh Kumar", country: "Indian", passport: "N8336332", rate: "2,000.00", amount: "" },
      { id: 15, name: "Santosh Kumar", country: "Indian", passport: "N8336332", rate: "2,000.00", amount: "" },
      { id: 16, name: "Santosh Kumar", country: "Indian", passport: "N8336332", rate: "2,000.00", amount: "" },
      { id: 17, name: "Santosh Kumar", country: "Indian", passport: "N8336332", rate: "2,000.00", amount: "" },
      { id: 14, name: "Santosh Kumar", country: "Indian", passport: "N8336332", rate: "2,000.00", amount: "" },
    
  ];

  const downloadPDF = async () => {
    if (contentRef.current) {
      const input = contentRef.current;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      const imgWidth = 210; 
      const imgHeight = 297; 
  
      // Capture the content of the ref as a canvas
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');
  console.log(imgData)
      const rowsPerPage = 10;
      let currentPage = 1;
      let totalRows = 14; // Total number of rows in your data
      let totalPages = Math.ceil(totalRows / rowsPerPage);
  
      const addHeaderFooter = (pdf, pageNumber) => {
        pdf.setFontSize(10);
        pdf.text('MABDE TRADING LLC.', 10, 10);
        pdf.text(`Page ${pageNumber}`, pageWidth - 20, 10);
        pdf.text('Footer Example', 10, pageHeight - 10);
      };
  
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        let startRow = pageIndex * rowsPerPage;
        let endRow = Math.min(startRow + rowsPerPage, totalRows);
  
        // Draw the content for the current page
        pdf.addImage(
          imgData,
          'PNG',
          0,
          0,
          imgWidth,
          (canvas.height * imgWidth) / canvas.width,
          undefined,
          'FAST'
        );
  
        // Add header and footer
        addHeaderFooter(pdf, pageIndex + 1);
  
        // Add a new page if not the last one
        if (pageIndex < totalPages - 1) {
          pdf.addPage();
        }
      }
  
      pdf.save('download.pdf');
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
          Performa Invoice
        </Typography>

        <Button
          sx={{
            border: "2px solid rgba(229, 37, 42, 1)",
            padding: "10px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "600",
            color: "rgba(229, 37, 42, 1)",
            backgroundColor: "rgba(229, 37, 42, 0.1)",
            display: "flex",
            alignItems: "center",
          }}
          // onClick={() => handleExportWithComponent(contentRef)}
          onClick={downloadPDF}
          endIcon={
            <img
              src={Images.pdfImg}
              alt="PDF Icon"
              style={{ width: "18px", height: "23px", marginLeft: "6px" }}
            />
          }
        >
          Download PDF
        </Button>
      </Box>
      <Box>








        
      {/* <PDFExport
        ref={contentRef}
        landscape={false}
        paperSize="A4"
        margin={5}
        fileName="Import Customers"
        
      > */}
      <Box ref={contentRef} className="border-custom" sx={{p:2 ,pt:0 }}>
  {/* Header */}
  <Box display="flex" justifyContent="center" alignItems="center">
    <Box>
      <Typography
        sx={{
          color: "#155368",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "20px",
        }}
      >
        مبد للتجارة (ش,ذ,م,م)
      </Typography>
      <Box sx={{ color: "#155368" }}>
        <HeaderTypography>MABDE TRADING L.L.C</HeaderTypography>
        <StyledTypography style={{ color: "#155368", fontWeight: "bold" }}>
          TEL: 04-3400000, FAX: 04-3488448 <br />
          P.O.BOX 81, DUBAI, UAE
        </StyledTypography>
      </Box>
    </Box>
  </Box>

  {/* Bill To Section */}
  <Box mb={4}>
    <Typography
      sx={{
        border: "2px solid black",
        fontWeight: "bold",
        width: "100px",
        textAlign: "center",
      }}
    >
      Bill To:
    </Typography>
    <Typography sx={{ fontWeight: "bold", mt: 3 }}>
      Firstserv Facilities Management Services Co LLC
    </Typography>
  </Box>

  {/* Address and Invoice Details */}
  <Box
    mb={4}
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <Box>
      <Typography>Dubai UAE.</Typography>
      <Typography sx={{ mt: 2 }}>Vat number: 104225575000003</Typography>
    </Box>
    <Box>
      <Typography sx={{ fontWeight: "bold" }}>
        Tax Invoice Number: MT/FFMS/V24070
      </Typography>
      <Typography sx={{ mt: 2 }}>Vat Reg. No. 100511270900003</Typography>
      <Typography sx={{ fontWeight: "bold", mt: 2 }}>
        Date: 14<sup>th</sup> May 2024
      </Typography>
    </Box>
  </Box>

  {/* Tax Invoice Title */}
  <Box textAlign="center" mb={4}>
    <Typography
      sx={{
        fontSize: "1.5rem",
        fontWeight: "bold",
        textDecoration: "underline",
        letterSpacing: "11px",
      }}
    >
      TAX INVOICE
    </Typography>
  </Box>

  {/* Table of Charges */}
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow className="table-header">
          <TableCell className="table-cell" sx={{ width: "72px" }}>Sr, No</TableCell>
          <TableCell className="table-cell">Visa Processing Initial Charges</TableCell>
          <TableCell className="table-cell">Country</TableCell>
          <TableCell className="table-cell">P/Port #</TableCell>
          <TableCell className="table-cell">Rate</TableCell>
          <TableCell className="table-cell">Amount AED</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="table-cell">{row.id}</TableCell>
            <TableCell className="table-cell">{row.name}</TableCell>
            <TableCell className="table-cell">{row.country}</TableCell>
            <TableCell className="table-cell">{row.passport}</TableCell>
            <TableCell className="table-cell">{row.rate}</TableCell>
            <TableCell className="table-cell">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>

  {/* Footer - Bank Details */}
  <Box mt={4} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
    <Box sx={{ display: "flex", width: "100%" }}>
      <Typography sx={{ flex: 0.1 }}>Account #:</Typography>
      <Typography sx={{ flex: 1, fontWeight: "bold" }}>0332676739001.</Typography>
    </Box>
    <Box sx={{ display: "flex", width: "100%" }}>
      <Typography sx={{ flex: 0.1 }}>Bank details:</Typography>
      <Typography sx={{ flex: 1, fontWeight: "bold" }}>The National Bank of Ras Al Khaimah</Typography>
    </Box>
    <Box sx={{ display: "flex", width: "100%" }}>
      <Typography sx={{ flex: 0.1 }}>Branch:</Typography>
      <Typography sx={{ flex: 1, fontWeight: "bold" }}>Umm Hurair.</Typography>
    </Box>
    <Box sx={{ display: "flex", width: "100%" }}>
      <Typography sx={{ flex: 0.1 }}>Iban:</Typography>
      <Typography sx={{ flex: 1, fontWeight: "bold" }}>AE540400000332676739001</Typography>
    </Box>
    <Box sx={{ display: "flex", width: "100%" }}>
      <Typography sx={{ flex: 0.1 }}>Swift Code:</Typography>
      <Typography sx={{ flex: 1, fontWeight: "bold" }}>NRAKAEAK.</Typography>
    </Box>
  </Box>

  {/* Terms and Conditions */}
  <Box mt={4}>
    <Typography sx={{ color: Colors.danger }}>Terms & Conditions:</Typography>
    <Typography>Immediate payment.</Typography>
  </Box>

  {/* Signature Section */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <Box mt={4}>
      <Typography>Authorized Signature</Typography>
      <Typography sx={{ color: Colors.primary, fontWeight: 'bold' }}>MABDE TRADING LLC.</Typography>
    </Box>
    <Box mt={4}>
      <Typography sx={{ color: Colors.primary, fontWeight: 'bold', textAlign: "center" }}>TEL: 04/3440000 FAX: 04/3448488</Typography>
      <Typography sx={{ color: Colors.primary, fontWeight: 'bold', textAlign: "center" }}>P.O.BOX: 51 DUBAI, U.A.E</Typography>
    </Box>
  </Box>
</Box>

      {/* </PDFExport> */}











      
      </Box>
    </Box>
  );
}

export default VisaInvoice;
