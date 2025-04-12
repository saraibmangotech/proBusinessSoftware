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
import { drawDOM, exportPDF } from "@progress/kendo-drawing";

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

function CreditNote() {
    const { state } = useLocation();
    const { id } = useParams();
    console.log(state);
    const [previewLoader, setPreviewLoader] = useState(false)

    const tableHead = [
        { name: "Payment Date", key: "" },
        { name: "Payment Type", key: "created_at" },
        { name: "Amount", key: "created_at" },
    ];
    const contentRef = useRef(null);
    const contentRef2 = useRef(null);
    const [customerDetail, setCustomerDetail] = useState();
    const [cancelDate, setCancelDate] = useState(null)
    const [detail, setDetail] = useState();

    // *For Get  Detail
    const getCustomerDetail = async () => {
        try {
            let params = { candidate_id: id };


            const { data } = await CustomerServices.getCandidateDetail(params);
            console.log(data, 'data');
            let find=data?.statuses?.find(item => item?.status.toLowerCase() == 'cancel' || item?.status.toLowerCase() == 'reject')
            setCancelDate(find?.date)
            setDetail(data)

        }

        catch (error) {
            showErrorToast(error);
        }
    };




    useEffect(() => {
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
                                    <span className="pdf_font" style={{ display: "block" }}>MABDE TRADING L.L.C</span>
                                </Typography>
                                <Typography
                                    className="pdf_font"
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
                                    className="pdf_font"
                                    style={{
                                        color: "#155368",
                                        fontWeight: "bold",

                                        textAlign: "center",
                                    }}
                                >
                                    <span style={{ display: "block" }}>
                                        P.O.BOX 81, DUBAI, UAE
                                    </span>
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Bill To Section */}
                    <Box mb={2} style={{ marginLeft: '25px' }}>
                        <Typography className="pdf_font"
                            style={{
                                border: "2px solid black",
                                fontWeight: "bold",
                                width: "100px",
                                textAlign: "center",
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
                            }}
                        >
                            {detail?.visa_request?.customer?.name}
                        </Typography>
                        <Typography className="pdf_font" style={{ fontWeight: "bold", textAlign: "left !important", }}>
                            {detail?.visa_request?.customer?.userDetail?.email}

                        </Typography>
                        <Typography className="pdf_font" style={{ fontWeight: "bold", textAlign: "left !important", }}>
                            {detail?.visa_request?.customer?.userDetail?.phone}

                        </Typography>
                    </Box>

                    {/* Address and Invoice Details */}

                    <Box
                        m={1}
                        mb={2}
                        component={'div'}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: '5px',
                          marginLeft: '25px'
                        }}
                    >
                        <Box style={{ textAlign: "left !important" }}>
                            <Typography className="pdf_font"> {detail?.visa_request?.customer?.address}</Typography>
                            <Typography className="pdf_font" style={{ mt: 1 }}>
                                Vat number:{detail?.visa_request?.customer?.vat_no}
                            </Typography>
                        </Box>
                        <Box style={{ textAlign: "left !important", marginRight: '35px', marginTop: '15px' }}>
                            <Typography className="pdf_font" style={{ fontWeight: "bold !important" }}>
                                Tax Invoice Number: MT/CN/{detail?.id}
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
                                Date: {cancelDate ? moment(cancelDate).format("DD-MM-YYYY") : ''}
                            </Typography>
                        </Box>
                    </Box>
                    <Box className="pdf-center" style={{ textAlign: "center" }} mb={4}>
                                <Typography
                                   className="pdf-myfont"
                                   style={{
                                     fontSize: "15px !important",
                                     fontWeight: "bold !important",
                     
                                     letterSpacing: "5px",
                                     textAlign: "center",
                                     marginLeft:'80px'
                                        // marginLeft: detail?.payment_status && detail?.payment_status?.toLowerCase() == 'paid' ? '100px' : '150px'


                                    }}
                                >
                                    Tax Credit Invoice
                                </Typography>
                            </Box>
                </Box>
              
                {/* Footer */}
                {<>
          { <Box
            style={{
              position: "absolute",
              bottom: "5px",
              left: "0",
              right: "0",
              textAlign: "center",
              paddingLeft: "30px",
            }}
          >
            <Box
              component={'div'}
              id="pdf-padding"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                margin: "12px",
                marginTop: "25px !important"
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
        }
            </>
        );
    };
    const exportPDFWithMethod = () => {
        let gridElement = document.querySelector('.k-grid');
        drawDOM(gridElement, { paperSize: 'A4' })
            .then((group) => {
                return exportPDF(group);
            })
            .then((dataUri) => {
                console.log(dataUri.split(';base64,')[1]);
            });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
                    Credit Note
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
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

                        {previewLoader ? <Box sx={{ padding: '0px 38px', display: 'flex' }}><CircularProgress sx={{ color: 'red' }} size={20} /></Box> : 'Preview PDF'}
                    </Button>
                </Box>
            </Box>
            <PDFExport
                ref={contentRef2}
                paperSize="A4"
                margin={40}
                forceProxy={true}
                proxyURL={`${process.env.REACT_APP_BASE_URL}/system/forwardPDF`}
                proxyTarget="_blank"
                fileName="Credit Note"
                pageTemplate={pageTemplate}
            >
                <Box id="pdf_data">
                    {/* {chunks.map((chunk, index) => ( */}
                    <Box style={{ pageBreakAfter: "always" }}>
                        {/* Table */}

                        <TableContainer sx={{ mt: 5 }} id="pd-mytable2">
                            
                            <Table>
                                <TableHead>
                                    <TableRow id="table-header">
                                        <TableCell id="table-cell-new">Candidate</TableCell>
                                        <TableCell id="table-cell-new">Visa Charges</TableCell>
                                        <TableCell id="table-cell-new">Charges Tax</TableCell>
                                        <TableCell id="table-cell-new">{detail?.last_status == 'Cancel' ? 'Cance. Charges' : 'Rejec. Charges'} </TableCell>
                                        <TableCell id="table-cell-new">{detail?.last_status == 'Cancel' ? 'Cance. Tax' : 'Rejec. Tax'} </TableCell>

                                        <TableCell id="table-cell-new">Credit Amount </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {/* {chunk.map((row) => ( */}
                                    <TableRow id="table-header">
                                        <TableCell id="table-cell-new">
                                            {" "}
                                            {detail?.name}-{detail?.passport_number}-{detail?.visa_tenure}-{detail?.visa_type}

                                        </TableCell>
                                        <TableCell id="table-cell-new">
                                            {" "}
                                            {detail?.visa_charges}
                                        </TableCell>
                                        <TableCell id="table-cell-new">
                                            {" "}
                                            {parseFloat(parseFloat(detail?.visa_charges) * 0.05).toFixed(2)}
                                        </TableCell>
                                        <TableCell id="table-cell-new">
                                            {detail?.rejection_charges}
                                        </TableCell>
                                        <TableCell id="table-cell-new">
                                            {" "}
                                            {parseFloat(parseFloat(detail?.rejection_charges) * 0.05).toFixed(2)}
                                        </TableCell>
                                        <TableCell id="table-cell-new">
                                            {(parseFloat(detail?.visa_charges) + parseFloat(detail?.visa_charges) * 0.05) - (parseFloat(detail?.rejection_charges) + parseFloat(detail?.rejection_charges) * 0.05)}
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

                    <Grid container spacing={2} style={{ padding: "0px",paddingTop:'10px' }}>
              
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
                ref={contentRef}
                paperSize="A4"
                margin={40}

                fileName="Credit Note"
                pageTemplate={pageTemplate}
            >
                <Box id="pdf_data">
                    {/* {chunks.map((chunk, index) => ( */}
                    <Box style={{ pageBreakAfter: "always" }}>
                        {/* Table */}

                        <TableContainer sx={{ mt: 5 }} id="pd-mytable2">
                           
                            <Table>
                                <TableHead>
                                    <TableRow id="table-header">
                                        <TableCell id="table-cell-new">Candidate</TableCell>
                                        <TableCell id="table-cell-new">Visa Charges</TableCell>
                                        <TableCell id="table-cell-new">Charges Tax</TableCell>
                                        <TableCell id="table-cell-new">{detail?.last_status == 'Cancel' ? 'Cance. Charges' : 'Rejec. Charges'} </TableCell>
                                        <TableCell id="table-cell-new">{detail?.last_status == 'Cancel' ? 'Cance. Tax' : 'Rejec. Tax'} </TableCell>

                                        <TableCell id="table-cell-new">Credit Amount </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {/* {chunk.map((row) => ( */}
                                    <TableRow id="table-header">
                                        <TableCell id="table-cell-new">
                                            {" "}
                                            {detail?.name}-{detail?.passport_number}-{detail?.visa_tenure}-{detail?.visa_type}

                                        </TableCell>
                                        <TableCell id="table-cell-new">
                                            {" "}
                                            {detail?.visa_charges}
                                        </TableCell>
                                        <TableCell id="table-cell-new">
                                            {" "}
                                            {parseFloat(parseFloat(detail?.visa_charges) * 0.05).toFixed(2)}
                                        </TableCell>
                                        <TableCell id="table-cell-new">
                                            {detail?.rejection_charges}
                                        </TableCell>
                                        <TableCell id="table-cell-new">
                                            {" "}
                                            {parseFloat(parseFloat(detail?.rejection_charges) * 0.05).toFixed(2)}
                                        </TableCell>
                                        <TableCell id="table-cell-new">
                                            {(parseFloat(detail?.visa_charges) + parseFloat(detail?.visa_charges) * 0.05) - (parseFloat(detail?.rejection_charges) + parseFloat(detail?.rejection_charges) * 0.05)}
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

                    <Grid container spacing={2} style={{ padding: "0px",paddingTop:'10px' }}>
                        {/* <Grid item xs={4}>
            <Box style={{ mt: 1 }}>
              <Typography style={{ fontSize: "14px" }} variant="body1" className="pdf_font" >
                <span className="pdf_font" style={{ color: Colors.lightGrey }}>Invoice No:</span>{" "}
                #{detail?.id}
              </Typography>
              <Typography style={{ fontSize: "14px" }} variant="body1" className="pdf_font" >
                <span className="pdf_font" style={{ color: Colors.lightGrey }}>Invoice Date:</span>{" "}
                {moment(cancelDate).format("DD-MM-YYYY")}
              </Typography>
            </Box>
          </Grid> */}

                        {/* <Grid item xs={12} sm={4}>
            <Typography
              variant="h4"
              component="h1"
              style={{ color: Colors.primary, fontSize: "15px" }}
              className="pdf_font"
            >
              Customer Details
            </Typography> 
              
              <Typography className="pdf_font"  style={{ fontSize: "14px" }} variant="body1"   >
              {detail?.visa_request?.customer?.name}
            </Typography>
            <Typography className="pdf_font" style={{ fontSize: "14px" }} variant="body1">
              {detail?.visa_request?.customer?.userDetail?.email}
            </Typography>
            <Typography className="pdf_font" style={{ fontSize: "14px" }} variant="body1">
              {detail?.visa_request?.customer?.userDetail?.phone}
            </Typography>
          </Grid> */}
                        {/* <Grid item xs={12} sm={4}>
            <Typography
              variant="h4"
              component="h1"
              style={{ color: Colors.primary, fontSize: "15px" }}
              className="pdf_font"
            >
              Candidate Details
            </Typography>
            <Typography className="pdf_font" style={{ fontSize: "14px" }} variant="body1">
              {detail?.name}
            </Typography>
            <Typography className="pdf_font" style={{ fontSize: "14px" }} variant="body1">
              {detail?.email}
            </Typography>
            <Typography className="pdf_font" style={{ fontSize: "14px" }} variant="body1">
              {detail?.phone}
            </Typography>
          </Grid> */}
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
                        {detail?.visa_request?.customer?.name}
                    </Typography>
                    <Typography style={{ fontWeight: "bold", }}>
                        {detail?.visa_request?.customer?.userDetail?.email}

                    </Typography>
                    <Typography style={{ fontWeight: "bold", }}>
                        {detail?.visa_request?.customer?.userDetail?.phone}

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
                        <Typography> {detail?.visa_request?.customer?.address}</Typography>
                        <Typography sx={{ mt: 2 }}>Vat number: {detail?.visa_request?.customer?.vat_no}</Typography>
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: "bold" }}>
                            Tax Invoice Number: MT/CN/{detail?.id}
                        </Typography>
                        <Typography sx={{ mt: 2 }}>Vat Reg. No. 100511270900003</Typography>
                        <Typography sx={{ fontWeight: "bold", mt: 2 }}>
                            Date: {moment(cancelDate).format("DD-MM-YYYY")}
                        </Typography>
                    </Box>
                </Box>
                <Box className="pdf-center" style={{ textAlign: "center" }} mb={4}>
                    <Typography
                        className="pdf-myfont"
                        sx={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            textDecoration: "underline",
                            letterSpacing: "11px",
                            textAlign: "center",


                        }}
                    >
                        Tax Credit Invoice
                    </Typography>
                </Box>


                {/* Table of Charges */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow className="table-header">
                                <TableCell className="table-cell-new">Candidate</TableCell>
                                <TableCell className="table-cell-new">Visa Charges</TableCell>
                                <TableCell id="table-cell-new">Charges Tax</TableCell>
                                <TableCell className="table-cell-new">{detail?.last_status == 'Cancel' ? 'Cancellation Charges' : 'Rejection Charges'} </TableCell>
                                <TableCell id="table-cell-new">{detail?.last_status == 'Cancel' ? 'Cancellation Tax' : 'Rejection Tax'} </TableCell>

                                <TableCell className="table-cell-new">Credit Amount </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* {detail?.map((row) => ( */}
                            <>
                                <TableRow>
                                    <TableCell className="table-cell-new">
                                        {" "}
                                        {detail?.name}-{detail?.passport_number}-{detail?.visa_tenure}-{detail?.visa_type}

                                    </TableCell>
                                    <TableCell className="table-cell-new">
                                        {" "}
                                        {detail?.visa_charges}
                                    </TableCell>
                                    <TableCell id="table-cell-new">
                                        {" "}
                                        {parseFloat(parseFloat(detail?.visa_charges) * 0.05).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="table-cell-new">
                                        {detail?.rejection_charges}
                                    </TableCell>
                                    <TableCell id="table-cell-new">
                                        {" "}
                                        {parseFloat(parseFloat(detail?.rejection_charges) * 0.05).toFixed(2)}
                                    </TableCell>
                                    <TableCell id="table-cell-new">
                                        {(parseFloat(detail?.visa_charges) + parseFloat(detail?.visa_charges) * 0.05) - (parseFloat(detail?.rejection_charges) + parseFloat(detail?.rejection_charges) * 0.05)}
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
                {moment(cancelDate).format("DD-MM-YYYY")}
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
              {detail?.visa_request?.customer?.name}
            </Typography>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              {detail?.visa_request?.customer?.userDetail?.email}
            </Typography>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              {detail?.visa_request?.customer?.userDetail?.phone}
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
              {detail?.name}
            </Typography>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              {detail?.email}
            </Typography>
            <Typography sx={{ fontSize: "14px" }} variant="body1">
              {detail?.phone}
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
                    <Box mt={4}>
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
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default CreditNote;
