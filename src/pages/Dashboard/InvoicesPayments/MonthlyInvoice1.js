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
import { useNavigate, useParams } from "react-router-dom";
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
  handleExportWithComponent2,
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
import InvoiceServices from "services/Invoicing";
import VisaDetail from "../Visa/VisaDetail";

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
const HeaderTypography = styled(Typography)(({ theme }) => ({
  fontSize: "20px",
  fontWeight: "bold",
  textAlign: "center",
  marginBottom:"0px"
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: "20px",
  color: "#2c5b8f",
  textAlign: "center",
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

function MonthlyInvoice() {
  const { id } = useParams();
  let serialNumber = 0
  let serialNumberNew = 0
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
  const contentRef2 = useRef(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [previewLoader, setPreviewLoader] = useState(false)

  const tableHead = [
    { name: "SR No.", key: "" },
    { name: "Candidate Name", key: "created_at" },
    { name: "Charges", key: "visa_rate" },
    { name: "Tax", key: "tax" },
    { name: "Total", key: "total" },
  ];
  //   state for visaprocessing use it later saraib
  //  const [visaprocessingList, setVisaProcessingList] = useState([])

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
  const [invoiceDetail, setInvoiceDetail] = useState();

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

  // *For Get Customer Detail
  const getVisaDetail = async () => {
    try {
      let params = { invoice_id: id };
      const { data } = await InvoiceServices.getInvoiceDetail(params);
      console.log(data);
      setInvoiceDetail(data?.details);
    } catch (error) {
      showErrorToast(error);
    }
  };

    function chunkCandidates(candidates, baseChunkSize ) {
    const chunks = [];
    let currentChunk = [];
  
    for (let i = 0; i < candidates?.length; i++) {
      currentChunk.push(candidates[i]);
  
      // Check if we've reached the base chunk size
      if (currentChunk.length === baseChunkSize) {
        chunks.push(currentChunk);
        currentChunk = [];
      }
    }
  
    // Handle the last chunk
    if (currentChunk.length > 0) {
      if (currentChunk.length > 7) {
        // If last chunk has more than 7 candidates, move the rest to a new page
        chunks.push(currentChunk.slice(0, 7));
        chunks.push(currentChunk.slice(7));
      } else {
        // If last chunk has 7 or fewer candidates, keep it as is
        chunks.push(currentChunk);
      }
    }
  
    return chunks;
  }

  const chunks = chunkCandidates(invoiceDetail?.candidates, 14);

  const pageTemplate = ({ pageNum, totalPages }) => {
    return (
      <>
        {/* Header */}
        <Box
          style={{
            position: "absolute",
            top: "20px",
            left: "0",
            right: "0",
            textAlign: "center",

            paddingLeft: "10px",
          }}
        >
          <Box
            style={{
              alignItems: "center",
            }}
          >
            <Box>
              <img
                style={{ width: "300px", height: "20px" }}
                src={Images.pdfLogo}
              />
              <Box
                style={{
                  color: "#155368",
                  flexDirection: "column",
                }}
              >
                <Typography
                  style={{
                    textAlign: "center",
                  }}
                >
                  <span  className="pdf_font" style={{ display: "block" }}>MABDE TRADING L.L.C</span>
                </Typography>
                <Typography
                  style={{
                    color: "#155368",
                    fontWeight: "bold",
                    textAlign: "center",
             
                  }}
                >
                  <span className="pdf_font" style={{ display: "block" }}>
                    TEL: 04-3400000, FAX: 04-3488448
                  </span>
                </Typography>
                <Typography
                  style={{
                    color: "#155368",
                    fontWeight: "bold",

                    textAlign: "center",
                  }}
                >
                  <span className="pdf_font" style={{ display: "block" }}>
                    P.O.BOX 81, DUBAI, UAE
                  </span>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Bill To Section */}
          <Box mb={2}>
            <Typography
            className="pdf_font"
              style={{
                border: "2px solid black",
                fontWeight: "bold",
                width: "100px",
                textAlign: "center",
               marginLeft: '30px'
              }}
            >
              Bill To:
            </Typography>
            <Typography
            className="pdf_font"
              style={{
                fontWeight: "bold !important",
                marginTop: "24px !important",
                textAlign: "left !important",
                 marginLeft: '30px !important'
              }}
            >
              {invoiceDetail?.customer?.name}
            </Typography>
          <Typography className="pdf_font" style={{ fontWeight: "bold",  textAlign: "left !important", marginLeft: '30px !important' }}>
          {invoiceDetail?.customer?.userDetail?.email}

          </Typography>
          <Typography className="pdf_font" style={{ fontWeight: "bold",  textAlign: "left !important", marginLeft: '30px !important' }}>
          {invoiceDetail?.customer?.userDetail?.phone}

          </Typography>
          </Box>

          {/* Address and Invoice Details */}

          <Box
            mb={2}
            component={'div'}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              margin:"5px",
               marginLeft: '30px'
            }}
          >
            <Box style={{ textAlign: "left !important" ,marginRight: '35px'}}>
              <Typography className="pdf_font">{invoiceDetail?.customer?.address}</Typography>
              <Typography className="pdf_font" style={{ mt: 1 }}>
                Vat number:{invoiceDetail?.customer?.vat_no}
              </Typography>
            </Box>
            <Box style={{ textAlign: "left !important" ,marginRight: '35px'}}>
              <Typography className="pdf_font" style={{ fontWeight: "bold !important" }}>
                Tax Invoice Number: MT/MI/{invoiceDetail?.id}
                
              </Typography>
              <Typography className="pdf_font" style={{ mt: 1 }}>
                Vat Reg. No. 100511270900003
              </Typography>
              <Typography
              className="pdf_font"
                style={{
                  fontWeight: "bold !important",
                  marginTop: "16px !important",
                }}
              >
                Date: {moment(invoiceDetail?.created_at).format("DD-MM-YYYY")}
              </Typography>
            </Box>
          </Box>

          {/* <Box
            className="pdf-center"
            style={{ textAlign: "center", margin: "0 auto !important" }}
            mb={4}
          >
            <center>
              <Typography
                className="pdf-center"
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  letterSpacing: "11px",
                  textAlign: "center",
                  textDecoration: "underline",
                  marginLeft: "10px !important",
                }}
              >
                TAX INVOICE
              </Typography>
            </center>
          </Box> */}
        </Box>

        {/* Footer */}
        {pageNum == totalPages && <Box
          style={{
            position: "absolute",
            bottom: "5px",
            left: "0",
            right: "0",
            textAlign: "center",
            paddingLeft: "35px",
          }}
        >
          <Box
            id="pdf-padding"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              margin: "12px",
              marginTop: "20px"
            }}
          >
             <Box style={{ textAlign: "left !important" }}>
              <Typography

                className="pdf_font"
                component={"span"}
                style={{ display: "inline-block", width: "120px" }}
              >
                Account Name:
              </Typography>
              <Typography
                className="pdf_font"
                component={"span"}
                style={{
                  display: "inline-block",
                  fontWeight: "bold !important",
                }}
              >
                MADBE TRADING LLC
              </Typography>
            </Box>
            <Box style={{ textAlign: "left !important" }}>
              <Typography

                className="pdf_font"
                component={"span"}
                style={{ display: "inline-block", width: "120px" }}
              >
                Account #:
              </Typography>
              <Typography
                className="pdf_font"
                component={"span"}
                style={{
                  display: "inline-block",
                  fontWeight: "bold !important",
                }}
              >
                0332676739001
              </Typography>
            </Box>
            <Box style={{ textAlign: "left !important" }}>
              <Typography
                className="pdf_font"
                component={"span"}
                style={{ display: "inline-block", width: "120px" }}
              >
                Bank details:
              </Typography>
              <Typography
                className="pdf_font"
                component={"span"}
                style={{
                  display: "inline-block",
                  fontWeight: "bold !important",
                }}
              >
                The National Bank of Ras Al Khaimah
              </Typography>
            </Box>
            <Box style={{ textAlign: "left !important" }}>
              <Typography
                className="pdf_font"
                component={"span"}
                style={{ display: "inline-block", width: "120px" }}
              >
                Branch:
              </Typography>
              <Typography
                className="pdf_font"
                component={"span"}
                style={{
                  display: "inline-block",
                  fontWeight: "bold !important",
                }}
              >
                Umm Hurair.
              </Typography>
            </Box>
            <Box style={{ textAlign: "left !important" }}>
              <Typography
                className="pdf_font"
                component={"span"}
                style={{ display: "inline-block", width: "120px" }}
              >
                Iban:
              </Typography>
              <Typography
                className="pdf_font"
                component={"span"}
                style={{
                  display: "inline-block",
                  fontWeight: "bold !important",
                }}
              >
                AE540400000332676739001
              </Typography>
            </Box>
            <Box style={{ textAlign: "left !important" }}>
              <Typography
                className="pdf_font"
                component={"span"}
                style={{ display: "inline-block", width: "120px" }}
              >
                Swift Code:
              </Typography>
              <Typography
                className="pdf_font"
                component={"span"}
                style={{
                  display: "inline-block",
                  fontWeight: "bold !important",
                }}
              >
                NRAKAEAK.
              </Typography>
            </Box>
          </Box>

          {/* Terms and Conditions */}
          <Box style={{ textAlign: "left !important", margin: '12px' }}>
            <Typography className="pdf-myfont" style={{ color: `${Colors.danger} !important` }}>
              Terms & Conditions:
            </Typography>
            <Typography className="pdf-myfont">Immediate payment.</Typography>
          </Box>

          {/* Signature Section */}
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between", margin: '12px'
            }}
          >
            <Box>
              <Typography className="pdf-myfont">Authorized Signature</Typography>
              <Typography className="pdf-myfont" style={{ color: '#155368 !important', fontWeight: "bold" }}>
                MABDE TRADING LLC.
              </Typography>
            </Box>
            {/* <Box component={'div'} style={{ width: "35%" }}>
              <Typography
                className="pdf-myfont"
                style={{

                  fontWeight: "bold",
                  textAlign: "center",
                  margin: '5px',
                  marginRight: '12px !important',
                  color: '#155368 !important'
                }}
              >
                TEL: 04/3440000 FAX: 04/3448488
              </Typography>
              <Typography
                className="pdf-myfont"
                style={{

                  fontWeight: "bold",
                  textAlign: "center",
                  color: '#155368 !important'
                }}
              >
                P.O.BOX: 51 DUBAI, U.A.E
              </Typography>

            </Box> */}
          </Box>
        </Box>}
        <Typography
          className="pdf-myfont"
          style={{
            color: Colors.primary,
            fontWeight: "bold",
            textAlign: "right",
          }}
        >
          Page {pageNum}/{totalPages}
        </Typography>
      </>
    );
  };

  useEffect(() => {
    getVisaDetail();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
      <Box sx={{display:'flex',gap:2}}>
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
                        onClick={() => { serialNumber=0 
                          handleExportWithComponent(contentRef); }}
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
                        onClick={() => {
                            setPreviewLoader(true)
                            serialNumberNew = 0
                            handleExportWithComponent2(contentRef2)
                            setTimeout(() => {
                                setPreviewLoader(false)
                          }, "10000"); 
                       }}
                        endIcon={
                            <img
                                src={Images.pdfImg}
                                alt="PDF Icon"
                                style={{ width: "18px", height: "23px", marginLeft: "6px" }}
                            />
                        }
                    >

                        {previewLoader ? <Box sx={{padding:'0px 38px',display:'flex'}}><CircularProgress sx={{color:'red'}} size={20}/></Box>  : 'Preview PDF'}
                    </Button>
                </Box>
      </Box>
      <PDFExport
        ref={contentRef}
        paperSize="A4"
        margin={40}
        fileName="Monthly Invoice"
        pageTemplate={pageTemplate}
      >
       

        <Box id="pdf_data">
          {chunks.map((chunk, index) => (
            <Box key={index} style={{ pageBreakAfter: "always" }}>
              {/* Table */}
              <TableContainer id="pd-mytable">
                <Table>
                  <TableHead>
                    <TableRow id="table-header">
                      <TableCell id="table-cell-new">Sr No </TableCell>
                      <TableCell id="table-cell-new">Name</TableCell>
                      <TableCell id="table-cell-new">Charges</TableCell>
                      <TableCell id="table-cell-new">OD</TableCell>
                      <TableCell id="table-cell-new">OC</TableCell>
                      <TableCell id="table-cell-new">Total</TableCell>
                      {/* <TableCell id="table-cell-new">Amount AED</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chunk.map((row) => (
                      <TableRow id="table-header" >
                        <TableCell id="table-cell-new">
                          {" "}
                          {++serialNumber}
                        </TableCell>
                        <TableCell id="table-cell-new">
                          {" "}
                          {row?.detail?.name}
                        </TableCell>
                        <TableCell id="table-cell-new">
                          {" "}
                          {row?.service_charges}
                        </TableCell>
                        <TableCell id="table-cell-new">
                          {" "}
                          {row?.overstay_days}
                        </TableCell>
                        <TableCell id="table-cell-new">
                          {" "}
                          {parseFloat(
                            parseFloat(row?.overstay_charges)
                          )}
                        </TableCell>
                        <TableCell id="table-cell-new">
                          {parseFloat(
                            parseFloat(parseFloat(row?.service_charges) ) +
                              parseFloat(row?.overstay_charges)
                          ).toFixed(2)}
                        </TableCell>

                        {/* <TableCell className="table-cell-new">{row.amount}</TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>


        <Box id="pdf_data" className="pdf_margin">
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow id="table-header">
                    <TableCell  id="table-cell-new" colSpan={4} />
                    <TableCell id="table-cell-new">Charges</TableCell>
                    <TableCell id="table-cell-new">{invoiceDetail?.total_amount}AED</TableCell>
                  </TableRow>
                  <TableRow id="table-header">
                    <TableCell   id="table-cell-new"  colSpan={4} />
                    <TableCell id="table-cell-new"> Tax</TableCell>
                    <TableCell id="table-cell-new">{invoiceDetail?.tax} AED</TableCell>
                  </TableRow>
                  <TableRow id="table-header">
                    <TableCell id="table-cell-new"  colSpan={4} />
                    <TableCell id="table-cell-new">Grand Total</TableCell>
                    <TableCell id="table-cell-new">{parseFloat(parseFloat(invoiceDetail?.total_amount)+parseFloat(invoiceDetail?.tax)).toFixed(2)} AED</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
      </PDFExport>
      <PDFExport
        ref={contentRef2}
        paperSize="A4"
        margin={40}
        forceProxy={true}
        proxyURL= {`${process.env.REACT_APP_BASE_URL}/system/forwardPDF`}
        proxyTarget="_blank"
        fileName="Monthly Invoice"
        pageTemplate={pageTemplate}
      >
       

        <Box id="pdf_data">
          {chunks.map((chunk, index) => (
            <Box key={index} style={{ pageBreakAfter: "always" }}>
              {/* Table */}
              <TableContainer id="pd-mytable">
                <Table>
                  <TableHead>
                    <TableRow id="table-header">
                      <TableCell id="table-cell-new">Sr No </TableCell>
                      <TableCell id="table-cell-new">Name</TableCell>
                      <TableCell id="table-cell-new">Charges</TableCell>
                      <TableCell id="table-cell-new">OD</TableCell>
                      <TableCell id="table-cell-new">OC</TableCell>
                      <TableCell id="table-cell-new">Total</TableCell>
                      {/* <TableCell id="table-cell-new">Amount AED</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chunk.map((row) => (
                      <TableRow id="table-header" >
                        <TableCell id="table-cell-new">
                          {" "}
                          {++serialNumberNew}
                        </TableCell>
                        <TableCell id="table-cell-new">
                          {" "}
                          {row?.detail?.name}
                        </TableCell>
                        <TableCell id="table-cell-new">
                          {" "}
                          {row?.service_charges}
                        </TableCell>
                        <TableCell id="table-cell-new">
                          {" "}
                          {row?.overstay_days}
                        </TableCell>
                        <TableCell id="table-cell-new">
                          {" "}
                          {parseFloat(
                            parseFloat(row?.overstay_charges)
                          )}
                        </TableCell>
                        <TableCell id="table-cell-new">
                          {parseFloat(
                            parseFloat(parseFloat(row?.service_charges) ) +
                              parseFloat(row?.overstay_charges)
                          ).toFixed(2)}
                        </TableCell>

                        {/* <TableCell className="table-cell-new">{row.amount}</TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>


        <Box id="pdf_data" className="pdf_margin">
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow id="table-header">
                    <TableCell  id="table-cell-new" colSpan={4} />
                    <TableCell id="table-cell-new">Charges</TableCell>
                    <TableCell id="table-cell-new">{invoiceDetail?.total_amount}AED</TableCell>
                  </TableRow>
                  <TableRow id="table-header">
                    <TableCell   id="table-cell-new"  colSpan={4} />
                    <TableCell id="table-cell-new"> Tax</TableCell>
                    <TableCell id="table-cell-new">{invoiceDetail?.tax} AED</TableCell>
                  </TableRow>
                  <TableRow id="table-header">
                    <TableCell id="table-cell-new"  colSpan={4} />
                    <TableCell id="table-cell-new">Grand Total</TableCell>
                    <TableCell id="table-cell-new">{parseFloat(parseFloat(invoiceDetail?.total_amount)+parseFloat(invoiceDetail?.tax)).toFixed(2)} AED</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
      </PDFExport>



      <Box className="border-custom" sx={{ p: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="center" alignItems="center">
          <Box>
          <img style={{width:"445px",height:"50px"}} src={Images.pdfLogo} />

            <Box sx={{ color: "#155368" }}>
              <HeaderTypography>MABDE TRADING L.L.C</HeaderTypography>
              <StyledTypography
                style={{ color: "#155368", fontWeight: "bold" }}
              >
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
            {invoiceDetail?.customer?.name}
          </Typography>
          <Typography sx={{ fontWeight: "bold",  }}>
          {invoiceDetail?.customer?.userDetail?.email}

          </Typography>
          <Typography sx={{ fontWeight: "bold",  }}>
          {invoiceDetail?.customer?.userDetail?.phone}

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
            <Typography>{invoiceDetail?.customer?.address}</Typography>
            <Typography sx={{ mt: 2 }}>
              Vat number: {invoiceDetail?.customer?.vat_no}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: "bold" }}>
            Tax Invoice Number: MT/MI/{invoiceDetail?.id}
            </Typography>
            <Typography sx={{ mt: 2 }}>Vat Reg. No. 100511270900003</Typography>
            <Typography sx={{ fontWeight: "bold", mt: 2 }}>
              Date: {moment(invoiceDetail?.created_at).format("DD-MM-YYYY")}
            </Typography>
          </Box>
        </Box>

        {/* Tax Invoice Title */}
        {/* <Grid container spacing={3} style={{ padding: "20px" }}>
          <Grid item xs={4}>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              <span style={{ color: Colors.lightGrey }}>Invoice No:</span> #
              {invoiceDetail?.id}
            </Typography>

            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: "14px" }} variant="body1">
                <span style={{ color: Colors.lightGrey }}>Invoice Date:</span>{" "}
                {moment(invoiceDetail?.created_at).format("DD-MM-YYYY")}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography
              variant="h4"
              component="h1"
              sx={{ color: Colors.primary, fontSize: "15px" }}
            >
              Customer Details
            </Typography>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              {invoiceDetail?.customer?.name}
            </Typography>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              {invoiceDetail?.customer?.userDetail?.email}
            </Typography>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              {invoiceDetail?.customer?.userDetail?.phone}
            </Typography>
          </Grid>
        </Grid> */}

        {/* Table of Charges */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow className="table-header">
                <TableCell className="table-cell-new">SR No </TableCell>
                <TableCell className="table-cell-new">Name</TableCell>
                <TableCell className="table-cell-new">Charges </TableCell>
                <TableCell className="table-cell-new">OD</TableCell>
                <TableCell className="table-cell-new">OC </TableCell>
            
                <TableCell className="table-cell-new">Total </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                
              {invoiceDetail?.candidates?.map((item, index) => {
                return(

              
                <>
                  <TableRow>
                    <TableCell className="table-cell-new">
                      {" "}
                      {item?.candidate_id}
                    </TableCell>
                    <TableCell className="table-cell-new">
                      {item?.detail?.name}
                    </TableCell>
                    <TableCell className="table-cell-new">
                      {" "}
                      {item?.total_amount}
                    </TableCell>
                    <TableCell className="table-cell-new">
                      {" "}
                      {parseFloat(
                        item?.overstay_days ? parseFloat(item?.overstay_days)  : 0
                      )}
                    </TableCell>
                    <TableCell className="table-cell-new">
                      {" "}
                      {parseFloat(
                        parseFloat(item?.overstay_charges) 
                      ).toFixed(2)}
                    </TableCell>
                   
                    <TableCell className="table-cell-new">
                      {parseFloat(
                        parseFloat(parseFloat(item?.service_charges) ) +
                          parseFloat(item?.overstay_charges)
                      ).toFixed(2)}
                    </TableCell>
                  </TableRow>
                 
                </>
                  )
              })}
               <TableRow id="table-header">
                    <TableCell id="table-cell-new" colSpan={4} />
                    <TableCell id="table-cell-new">Charges</TableCell>
                    <TableCell id="table-cell-new">
                    {invoiceDetail?.total_amount}AED
                    </TableCell>
                  </TableRow>
                  <TableRow id="table-header">
                    <TableCell id="table-cell-new" colSpan={4} />
                    <TableCell id="table-cell-new">Tax</TableCell>
                    <TableCell id="table-cell-new">
                    {invoiceDetail?.tax} AED
                    </TableCell>
                  </TableRow>
                  <TableRow id="table-header">
                    <TableCell id="table-cell-new" colSpan={4} />
                    <TableCell id="table-cell-new">Grand Total </TableCell>
                    <TableCell id="table-cell-new">
                    {parseFloat(parseFloat(invoiceDetail?.total_amount)+parseFloat(invoiceDetail?.tax)).toFixed(2)} AED
                    </TableCell>
                  </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer - Bank Details */}
        <Box
          mt={4}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", width: "100%" }}>
            <Typography sx={{ flex: 0.1 }}>Account Name:</Typography>
            <Typography sx={{ flex: 1, fontWeight: "bold" }}>
              MABDE TRADING LLC
            </Typography>
          </Box>
          <Box sx={{ display: "flex", width: "100%" }}>
            <Typography sx={{ flex: 0.1 }}>Account #:</Typography>
            <Typography sx={{ flex: 1, fontWeight: "bold" }}>
              0332676739001.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", width: "100%" }}>
            <Typography sx={{ flex: 0.1 }}>Bank details:</Typography>
            <Typography sx={{ flex: 1, fontWeight: "bold" }}>
              The National Bank of Ras Al Khaimah
            </Typography>
          </Box>
          <Box sx={{ display: "flex", width: "100%" }}>
            <Typography sx={{ flex: 0.1 }}>Branch:</Typography>
            <Typography sx={{ flex: 1, fontWeight: "bold" }}>
              Umm Hurair.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", width: "100%" }}>
            <Typography sx={{ flex: 0.1 }}>Iban:</Typography>
            <Typography sx={{ flex: 1, fontWeight: "bold" }}>
              AE540400000332676739001
            </Typography>
          </Box>
          <Box sx={{ display: "flex", width: "100%" }}>
            <Typography sx={{ flex: 0.1 }}>Swift Code:</Typography>
            <Typography sx={{ flex: 1, fontWeight: "bold" }}>
              NRAKAEAK.
            </Typography>
          </Box>
        </Box>

        {/* Terms and Conditions */}
        <Box mt={4}>
          <Typography sx={{ color: Colors.danger }}>
            Terms & Conditions:
          </Typography>
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
            <Typography sx={{ color: Colors.primary, fontWeight: "bold" }}>
              MABDE TRADING LLC.
            </Typography>
          </Box>
          {/* <Box mt={4}>
            <Typography
              sx={{
                color: Colors.primary,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              TEL: 04/3440000 FAX: 04/3448488
            </Typography>
            <Typography
              sx={{
                color: Colors.primary,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              P.O.BOX: 51 DUBAI, U.A.E
            </Typography>
          </Box> */}
        </Box>
      </Box>
    </Box>
  );
}

export default MonthlyInvoice;
