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
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
const HeaderTypography = styled(Typography)(({ theme }) => ({
  fontSize: "20px",
  fontWeight: "bold",
  textAlign: "center",
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: "20px",
  color: "#2c5b8f",
  textAlign: "center",
}));

function RenewInvoice() {
  const { state } = useLocation();
  const { id } = useParams();
  console.log(state);

  const tableHead = [
    { name: "Payment Date", key: "" },
    { name: "Payment Type", key: "created_at" },
    { name: "Amount", key: "created_at" },
  ];
  const contentRef = useRef(null);
const contentRef2 = useRef(null);
const [previewLoader, setPreviewLoader] = useState(false)
const [rates, setRates] = useState()
  const [customerDetail, setCustomerDetail] = useState();
  const [detail, setDetail] = useState();

  // *For Get  Detail
  const getCustomerDetail = async () => {
    try {
      let params = { id: id };


      const { data } = await VisaServices.getListDetails(params);
      console.log(data?.details?.security_deposit_scenario);
      setDetail(data?.details)

    }

    catch (error) {
      showErrorToast(error);
    }
  };

  const getData = async (formData) => {
  
    console.log(formData);
    try {
      let params = {
        charges_type: 'cost'

      }

      const { data } = await SystemServices.getRates(params);

      let details = data?.charges
      
      setRates(data?.charges)
      console.log(details?.medical_extra);




    } catch (error) {

    } finally {
    
    }
  }

  useEffect(() => {
    getData()
    getCustomerDetail()
  }, [])


  const chunkRows = (detail, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < detail?.length; i += chunkSize) {
      chunks.push(detail?.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const chunks = chunkRows(detail, 1);

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
                  <span className="pdf-myfont" style={{ display: "block", color: "#155368 !important", fontWeight: "bold", }}>MABDE TRADING L.L.C</span>
                </Typography>
                <Typography
                  className="pdf-myfont"
                  style={{
                    color: "#155368",
                    fontWeight: "bold",
                    textAlign: "center",

                  }}
                >
                  <span className="pdf-myfont" style={{ display: "block", color: "#155368 !important" }}>
                    TEL: 04-3400000, FAX: 04-3488448
                  </span>
                </Typography>
                <Typography
                  className="pdf-myfont"
                  style={{
                    color: "#155368",
                    fontWeight: "bold",

                    textAlign: "center",
                  }}
                >
                  <span className="pdf-myfont" style={{ display: "block", color: "#155368 !important" }}>
                    P.O.BOX 81, DUBAI, UAE
                  </span>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Bill To Section */}
          <Box component={'div'} mb={2} style={{ marginLeft: '25px' }}>
            <Typography
              className="pdf-myfont"
              style={{
                border: "2px solid black",
                fontWeight: "bold",
                width: "100px",
                textAlign: "center",
              }}
            >
              Bill To:
            </Typography>
            <Box component={'div'} style={{ width: '200px !important' }}>
              <Typography
                className="pdf-myfont"
                style={{
                  fontWeight: "bold !important",
                  marginTop: "24px !important",
                  textAlign: "left !important",

                }}
              >
                {detail?.visa?.customer?.name}
              </Typography>
            </Box>
            <Typography className="pdf-myfont" style={{ fontWeight: "bold", textAlign: "left !important", }}>
              {detail?.visa?.customer?.userDetail?.email}

            </Typography>
            <Typography className="pdf-myfont" style={{ fontWeight: "bold", textAlign: "left !important", }}>
              {detail?.visa?.customer?.userDetail?.phone}

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
              marginLeft: '25px'
            }}
          >
            <Box style={{ textAlign: "left !important", marginRight: '35px' }}>
              <Typography className="pdf-myfont" style={{ paddingRight: '50px !important' }} >{detail?.visa?.customer?.address}</Typography>
              <Typography className="pdf-myfont" style={{ mt: 1 }}>
                Vat number:{detail?.visa?.customer?.vat_no}
              </Typography>
            </Box>
            <Box style={{ textAlign: "left !important", marginRight: '35px' }}>
              <Typography className="pdf-myfont" style={{ fontWeight: "bold !important" }}>
                Tax Invoice Number: MT/RI/{detail?.id}
              </Typography>
              <Typography className="pdf-myfont" style={{ mt: 1 }}>
                Vat Reg. No. 100511270900003
              </Typography>
              <Typography
                className="pdf-myfont"
                style={{
                  fontWeight: "bold !important",
                  marginTop: "16px !important",
                }}
              >
                Date: {moment(detail?.created_at).format("DD-MM-YYYY")}
              </Typography>
            </Box>
          </Box>
          {/* 
          <Box
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
                  
                   marginLeft:"50px !important"
                }}
              >
                TAX INVOICE
              </Typography>
            </center>
          </Box> */}
           <Box className="pdf-center" style={{ textAlign: "center" }} mb={4}>
                <Typography
                  className="pdf-myfont"
                  style={{
                    fontSize: "15px !important",
                    fontWeight: "bold !important",

                    letterSpacing: "5px !important",
                    textAlign: "center",
                    marginLeft: detail?.payment_status && detail?.payment_status.toLowerCase() == 'paid' ? '40px' : '90px'


                  }}
                >
                  {detail?.payment_status && detail?.payment_status.toLowerCase() == 'paid' ? " INVOICE" : " PROFORMA INVOICE"}
                </Typography>
              </Box>
        </Box>

        {/* Footer */}
        <Box
          style={{
            position: "absolute",
            bottom: "20px",
            left: "0",
            right: "0",
            textAlign: "center",
            paddingLeft: "30px",
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
                MABDE TRADING LLC
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
        </Box>
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
          {detail?.payment_status.toLowerCase() == 'unpaid' ? 'Cancel Proforma Invoice' : 'Cancel Invoice'}
        </Typography>

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
                        onClick={() => handleExportWithComponent(contentRef)}
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
        fileName="Cancel Invoice"
        pageTemplate={pageTemplate}
      >
        <Box id="pdf_data">
          {/* {chunks.map((chunk, index) => ( */}
          <Box style={{ pageBreakAfter: "always" }}>
            {/* Table */}

            <TableContainer sx={{ mt: 5 }} id="pd-mytable">
           
              <Table>
                <TableHead>
                  <TableRow id="table-header">

                    <TableCell id="table-cell-new">Payment Date</TableCell>
                    <TableCell id="table-cell-new">Candidate</TableCell>
                    <TableCell id="table-cell-new">Payment Type</TableCell>

                    <TableCell id="table-cell-new">Amount </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* {chunk.map((row) => ( */}
                  <TableRow id="table-header">

                    <TableCell id="table-cell-new">
                      {" "}
                      {moment(detail?.payment?.payment_date).format(
                        "DD-MM-YYYY"
                      )}
                    </TableCell>
                    <TableCell id="table-cell-new">
                      {" "}
                      {detail?.candidate?.name}-{detail?.candidate?.passport_number}-{detail?.candidate?.visa_tenure}-{detail?.candidate?.visa_type}

                    </TableCell>
                    <TableCell id="table-cell-new">
                      {detail?.payment?.payment_type}
                    </TableCell>
                    <TableCell id="table-cell-new">
                      {" "}
                      { detail?.payment_status.toLowerCase() == 'paid' ?  parseFloat(parseFloat(detail?.payment?.amount) - parseFloat(detail?.payment?.tax || 0)).toFixed(2) : detail?.additional_type == 'inside' ?  parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)).toFixed(2) : parseFloat(parseFloat(detail?.visa?.customer?.cancellation_outside || 0)).toFixed(2) }
                    </TableCell>
                  </TableRow>
                  {/* ))} */}
                </TableBody>
              </Table>
            </TableContainer>

          </Box>
          {/* ))} */}
        </Box>

        <Box id="pdf_data" className="pdf_margin">
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                <TableRow id="table-header">
                  <TableCell id="table-cell-new" colSpan={2} />
                  <TableCell id="table-cell-new" className="pdf-myfont">Sub Total</TableCell>
                  <TableCell id="table-cell-new" className="pdf-myfont">
                    {" "}
                    { detail?.payment_status.toLowerCase() == 'paid'  ? parseFloat(parseFloat(detail?.payment?.amount) - parseFloat(detail?.payment?.tax || 0)).toFixed(2) : detail?.additional_type == 'inside' ?  parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)).toFixed(2) : parseFloat(parseFloat(detail?.visa?.customer?.cancellation_outside || 0)).toFixed(2)} AED
                  </TableCell>
                </TableRow>
                <TableRow id="table-header">
                  <TableCell id="table-cell-new" colSpan={2} />
                  <TableCell id="table-cell-new" className="pdf-myfont">Tax</TableCell>
                  <TableCell id="table-cell-new" className="pdf-myfont">
                  {detail?.payment_status.toLowerCase() == 'paid'   ? parseFloat(parseFloat(detail?.payment?.tax || 0)).toFixed(2) : detail?.additional_type == 'inside' ?  parseFloat(parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)) * 0.05).toFixed(2) : parseFloat( parseFloat(parseFloat(detail?.visa?.customer?.cancellation_outside || 0)) * 0.05).toFixed(2)} AED
                  </TableCell>
                </TableRow>
                <TableRow id="table-header">
                  <TableCell id="table-cell-new" colSpan={2} />
                  <TableCell id="table-cell-new" className="pdf-myfont">Grand Total</TableCell>
                  <TableCell id="table-cell-new" className="pdf-myfont">
                  {detail?.payment_status.toLowerCase() == 'paid'   ? parseFloat(parseFloat(parseFloat(detail?.payment?.amount))).toFixed(2) : detail?.additional_type == 'inside' ? parseFloat(parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)) + parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)) * 0.05).toFixed(2) : parseFloat(parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)) + parseFloat(parseFloat(detail?.visa?.customer?.cancellation_outside || 0)) * 0.05).toFixed(2)} AED
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Grid container spacing={2} style={{ padding: "0px",paddingTop:'15px' }}>
        
            {detail?.payment?.description != "" && (
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="h4"
                  component="h1"
                  style={{ color: Colors.primary, fontSize: "14px" }}
                  className="pdf_font"
                >
                  Description
                </Typography>

                <Typography className="pdf_font" style={{}} variant="body1" gutterBottom>
                  {detail?.payment?.description}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>


      </PDFExport>
      <PDFExport
        ref={contentRef2}
        paperSize="A4"
        margin={40}
        forceProxy={true}
        proxyURL={`${process.env.REACT_APP_BASE_URL}/system/forwardPDF`}
        proxyTarget="_blank"
        fileName="Cancel Invoice"
        pageTemplate={pageTemplate}
      >
        <Box id="pdf_data">
          {/* {chunks.map((chunk, index) => ( */}
          <Box style={{ pageBreakAfter: "always" }}>
            {/* Table */}

            <TableContainer sx={{ mt: 5 }} id="pd-mytable">
             
              <Table>
                <TableHead>
                  <TableRow id="table-header">

                    <TableCell id="table-cell-new">Payment Date</TableCell>
                    <TableCell id="table-cell-new">Candidate</TableCell>
                    <TableCell id="table-cell-new">Payment Type</TableCell>

                    <TableCell id="table-cell-new">Amount </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* {chunk.map((row) => ( */}
                  <TableRow id="table-header">

                    <TableCell id="table-cell-new">
                      {" "}
                      {moment(detail?.payment?.payment_date).format(
                        "DD-MM-YYYY"
                      )}
                    </TableCell>
                    <TableCell id="table-cell-new">
                      {" "}
                      {detail?.candidate?.name}-{detail?.candidate?.passport_number}-{detail?.candidate?.visa_tenure}-{detail?.candidate?.visa_type}

                    </TableCell>
                    <TableCell id="table-cell-new">
                      {detail?.payment?.payment_type}
                    </TableCell>
                    <TableCell id="table-cell-new">
                      {" "}
                      { detail?.payment_status.toLowerCase() == 'paid' ?  parseFloat(parseFloat(detail?.payment?.amount) - parseFloat(detail?.payment?.tax || 0)).toFixed(2) : detail?.additional_type == 'inside' ?  parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)).toFixed(2) : parseFloat(parseFloat(detail?.visa?.customer?.cancellation_outside || 0)).toFixed(2) }
                    </TableCell>
                  </TableRow>
                  {/* ))} */}
                </TableBody>
              </Table>
            </TableContainer>

          </Box>
          {/* ))} */}
        </Box>

        <Box id="pdf_data" className="pdf_margin">
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                <TableRow id="table-header">
                  <TableCell id="table-cell-new" colSpan={2} />
                  <TableCell id="table-cell-new" className="pdf-myfont">Sub Total</TableCell>
                  <TableCell id="table-cell-new" className="pdf-myfont">
                    {" "}
                    { detail?.payment_status.toLowerCase() == 'paid'  ? parseFloat(parseFloat(detail?.payment?.amount) - parseFloat(detail?.payment?.tax || 0)).toFixed(2) : detail?.additional_type == 'inside' ?  parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)).toFixed(2) : parseFloat(parseFloat(detail?.visa?.customer?.cancellation_outside || 0)).toFixed(2)} AED
                  </TableCell>
                </TableRow>
                <TableRow id="table-header">
                  <TableCell id="table-cell-new" colSpan={2} />
                  <TableCell id="table-cell-new" className="pdf-myfont">Tax</TableCell>
                  <TableCell id="table-cell-new" className="pdf-myfont">
                  {detail?.payment_status.toLowerCase() == 'paid'   ? parseFloat(parseFloat(detail?.payment?.tax || 0)).toFixed(2) : detail?.additional_type == 'inside' ?  parseFloat(parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)) * 0.05).toFixed(2) : parseFloat( parseFloat(parseFloat(detail?.visa?.customer?.cancellation_outside || 0)) * 0.05).toFixed(2)} AED
                  </TableCell>
                </TableRow>
                <TableRow id="table-header">
                  <TableCell id="table-cell-new" colSpan={2} />
                  <TableCell id="table-cell-new" className="pdf-myfont">Grand Total</TableCell>
                  <TableCell id="table-cell-new" className="pdf-myfont">
                  {detail?.payment_status.toLowerCase() == 'paid'   ? parseFloat(parseFloat(parseFloat(detail?.payment?.amount))).toFixed(2) : detail?.additional_type == 'inside' ? parseFloat(parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)) + parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)) * 0.05).toFixed(2) : parseFloat(parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)) + parseFloat(parseFloat(detail?.visa?.customer?.cancellation_outside || 0)) * 0.05).toFixed(2)} AED
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Grid container spacing={2} style={{ padding: "0px",paddingTop:'15px' }}>
        
            {detail?.payment?.description != "" && (
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="h4"
                  component="h1"
                  style={{ color: Colors.primary, fontSize: "14px" }}
                  className="pdf_font"
                >
                  Description
                </Typography>

                <Typography className="pdf_font" style={{}} variant="body1" gutterBottom>
                  {detail?.payment?.description}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>


      </PDFExport>
      <Box className="border-custom" sx={{ p: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="center" alignItems="center">
          <Box>
            <img style={{ width: "445px", height: "50px" }} src={Images.pdfLogo} />

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
            {detail?.visa?.customer?.name}
          </Typography>
          <Typography style={{ fontWeight: "bold", }}>
            {detail?.visa?.customer?.userDetail?.email}

          </Typography>
          <Typography style={{ fontWeight: "bold", }}>
            {detail?.visa?.customer?.userDetail?.phone}

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
            <Typography> {detail?.visa?.customer?.address}</Typography>
            <Typography sx={{ mt: 2 }}>Vat number: {detail?.visa?.customer?.vat_no}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: "bold" }}>
              Tax Invoice Number: MT/CI/{detail?.id}
            </Typography>
            <Typography sx={{ mt: 2 }}>Vat Reg. No. 100511270900003</Typography>
            <Typography sx={{ fontWeight: "bold", mt: 2 }}>
              Date: {moment(detail?.created_at).format("DD-MM-YYYY")}
            </Typography>
          </Box>
        </Box>
        <Box className="pdf-center" style={{textAlign:"center"}} mb={4}>
          <Typography
          className="pdf-myfont"
            sx={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              textDecoration: "underline",
              letterSpacing: "11px",
              textAlign:"center",
            

            }}
          >
           {detail?.payment_status && detail?.payment_status.toLowerCase() == 'paid'   ? " INVOICE" : " PROFORMA INVOICE"}
          </Typography>
        </Box>


        {/* Table of Charges */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow className="table-header">
                <TableCell className="table-cell">Candidate</TableCell>
                <TableCell className="table-cell">Payment Date</TableCell>
                <TableCell className="table-cell">Payment Type</TableCell>

                <TableCell className="table-cell">Amount </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* {detail?.map((row) => ( */}
              <>
                <TableRow>
                  <TableCell className="table-cell">
                    {" "}
                    {detail?.candidate?.name}-{detail?.candidate?.passport_number}-{detail?.candidate?.visa_tenure}-{detail?.candidate?.visa_type}

                  </TableCell>
                  <TableCell className="table-cell">
                    {" "}
                    {moment(detail?.payment?.payment_date).format("DD-MM-YYYY")}
                  </TableCell>
                  <TableCell className="table-cell">
                    {detail?.payment?.payment_type ? detail?.payment?.payment_type : 'Unpaid' }
                  </TableCell>
                  <TableCell className="table-cell">
                    {console.log(detail?.payment)
                    }
                  { detail?.payment_status.toLowerCase() == 'paid' ?  parseFloat(parseFloat(detail?.payment?.amount) - parseFloat(detail?.payment?.tax || 0)).toFixed(2) : detail?.additional_type == 'inside' ?  parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)).toFixed(2) : parseFloat(parseFloat(detail?.visa?.customer?.cancellation_outside || 0)).toFixed(2) }
                  </TableCell>
                </TableRow>
                <TableRow id="table-header">
                  <TableCell id="table-cell" colSpan={2} />
                  <TableCell id="table-cell">Sub Total</TableCell>
                  <TableCell id="table-cell">
                   
                    { detail?.payment_status.toLowerCase() == 'paid'  ? parseFloat(parseFloat(detail?.payment?.amount) - parseFloat(detail?.payment?.tax || 0)).toFixed(2) : detail?.additional_type == 'inside' ?  parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)).toFixed(2) : parseFloat(parseFloat(detail?.visa?.customer?.cancellation_outside || 0)).toFixed(2)} AED
                  </TableCell>
                </TableRow>
                <TableRow id="table-header">
                  <TableCell id="table-cell" colSpan={2} />
                  <TableCell id="table-cell">Tax</TableCell>
                  <TableCell id="table-cell">
                    {detail?.payment_status.toLowerCase() == 'paid'   ? parseFloat(parseFloat(detail?.payment?.tax || 0)).toFixed(2) : detail?.additional_type == 'inside' ?  parseFloat(parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)) * 0.05).toFixed(2) : parseFloat( parseFloat(parseFloat(detail?.visa?.customer?.cancellation_outside || 0)) * 0.05).toFixed(2)} AED
                  </TableCell>
                </TableRow>
                <TableRow id="table-header">
                  <TableCell id="table-cell" colSpan={2} />
                  <TableCell id="table-cell">Grand Total </TableCell>
                  <TableCell id="table-cell">
                    {detail?.payment_status.toLowerCase() == 'paid'   ? parseFloat(parseFloat(parseFloat(detail?.payment?.amount))).toFixed(2) : detail?.additional_type == 'inside' ? parseFloat(parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)) + parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)) * 0.05).toFixed(2) : parseFloat(parseFloat(parseFloat(detail?.visa?.customer?.cancellation_inside || 0)) + parseFloat(parseFloat(detail?.visa?.customer?.cancellation_outside || 0)) * 0.05).toFixed(2)} AED
                  </TableCell>
                </TableRow>
              </>

              {/* ))} */}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Tax Invoice Title */}
        <Grid container spacing={3} style={{ padding: "20px" }}>
          {/* <Grid item xs={4}>
            
          <Typography sx={{ fontSize: "14px" }} variant="body1">
                <span style={{ color: Colors.lightGrey }}>Invoice No:</span>{" "}
                #{detail?.id}
              </Typography>
           
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: "14px" }} variant="body1">
                <span style={{ color: Colors.lightGrey }}>Invoice Date:</span>{" "}
                {moment(detail?.created_at).format("DD-MM-YYYY")}
              </Typography>
            </Box>
          </Grid> */}

          {/* <Grid item xs={12} sm={4}>
            <Typography
              variant="h4"
              component="h1"
              sx={{ color: Colors.primary, fontSize: "15px" }}
            >
              Customer Details
            </Typography>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              {detail?.visa?.customer?.name}
            </Typography>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              {detail?.visa?.customer?.userDetail?.email}
            </Typography>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              {detail?.visa?.customer?.userDetail?.phone}
            </Typography>
          </Grid> */}
          {/* <Grid item xs={12} sm={4}>
            <Typography
              variant="h4"
              component="h1"
              sx={{ color: Colors.primary, fontSize: "15px" }}
            >
              Candidate Details
            </Typography>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              {detail?.candidate?.name}
            </Typography>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              {detail?.candidate?.email}
            </Typography>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              {detail?.candidate?.phone}
            </Typography>
          </Grid> */}
          {detail?.payment?.description != "" && (
            <Grid item xs={12} sm={12}>
              <Typography
                variant="h4"
                component="h1"
                sx={{ color: Colors.primary, fontSize: "14px" }}
              >
                Description
              </Typography>

              <Typography sx={{}} variant="body1" gutterBottom>
                {detail?.payment?.description}
              </Typography>
            </Grid>
          )}

        </Grid>
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

export default RenewInvoice;
