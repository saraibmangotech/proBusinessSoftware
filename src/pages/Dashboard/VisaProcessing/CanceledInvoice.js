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
import { PDFExport } from '@progress/kendo-react-pdf';


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
        paddingLeft: '15px !important',

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

function CanceledInvoice() {

    const { state } = useLocation()
    const { id } = useParams()
    console.log(state);

    const tableHead = [
        { name: "Payment Date", key: "" },
        { name: "Payment Type", key: "created_at" },
        { name: "Amount", key: "created_at" },


    ];
    const contentRef = useRef(null);




    const [customerDetail, setCustomerDetail] = useState()
    const [detail, setDetail] = useState()




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



    useEffect(() => {
        getCustomerDetail()
    }, [])


    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
                    Canceled Invoice
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
            </Box>
            <PDFExport
                ref={contentRef}
                landscape={true}
                paperSize="A4"
                margin={5}
                fileName="Canceled Invoice"
            >
                <Box>
                    <Grid container spacing={3} style={{ padding: "20px" }}>
                        <Grid item xs={4}>
                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{ color: Colors.primary }}
                            >
                                Invoice
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: "12px" }}>
                                No : #{detail?.id}
                            </Typography>
                            <Box sx={{ mt: 1 }}>


                                <Typography sx={{ fontSize: "12px" }} variant="body1">
                                    <span style={{ color: Colors.lightGrey }}>Invoice Date:</span>{" "}
                                    {moment(detail?.created_at).format('MM-DD-YYYY')}
                                </Typography>

                            </Box>
                        </Grid>


                        <Grid item xs={12} sm={4}>
                            <Typography
                                variant="h5"
                                component="h2"
                                sx={{ color: Colors.primary, fontSize: "12px" }}
                            >
                                Customer Details
                            </Typography>
                            <Typography sx={{ fontSize: "12px" }} variant="body1">
                                {detail?.visa?.customer?.name}
                            </Typography>
                            <Typography sx={{ fontSize: "12px" }} variant="body1">
                                {detail?.visa?.customer?.userDetail?.email}
                            </Typography>
                            <Typography sx={{ fontSize: "12px" }} variant="body1">
                                {detail?.visa?.customer?.userDetail?.phone}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography
                                variant="h5"
                                component="h2"
                                sx={{ color: Colors.primary, fontSize: "12px" }}
                            >
                                Candidate Details
                            </Typography>
                            <Typography sx={{ fontSize: "12px" }} variant="body1">
                                {detail?.candidate?.name}
                            </Typography>
                            <Typography sx={{ fontSize: "12px" }} variant="body1">
                                {detail?.candidate?.email}
                            </Typography>
                            <Typography sx={{ fontSize: "12px" }} variant="body1">
                                {detail?.candidate?.phone}
                            </Typography>
                        </Grid>
                        {detail?.payment?.description != "" && (

                        
                        <Grid item xs={12} sm={12}>
                            <Typography
                                variant="h4"
                                component="h3"
                                sx={{ color: Colors.primary, fontSize: "14px" }}
                            >
                                Description
                            </Typography>
                          
                            <Typography sx={{  }} variant="body1" gutterBottom>
                                    {detail?.payment?.description}
                                </Typography>
                          
                           
                        </Grid>
                        )}
                        {/* <Grid item xs={12} sm={4}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ color: Colors.primary,fontSize: "12px"  }}
            >
              Billing Address
            </Typography>
            <Typography sx={{ fontSize: "12px" }} variant="body1">
              Address line 01, Street Address, City Name, State, Country – Pin
              Code
            </Typography>
          </Grid> */}
                    </Grid>
                    <Grid container spacing={3} >


                        {/* <Grid item xs={12} sm={4}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ color: Colors.primary,fontSize: "12px"  }}
            >
              Customer Details
            </Typography>
            <Typography sx={{ fontSize: "12px" }} variant="body1">
              {detail?.visa?.customer?.name}
            </Typography>
            <Typography sx={{ fontSize: "12px" }} variant="body1">
            {detail?.visa?.customer?.userDetail?.email}
            </Typography>
            <Typography sx={{ fontSize: "12px" }} variant="body1">
            {detail?.visa?.customer?.userDetail?.phone}
            </Typography>
          </Grid> */}
                    </Grid>
                </Box>
                <Box sx={{ p: 3,pb:1 }}>
                    <Typography sx={{ fontSize: "20px", color: Colors.primary, fontWeight: 'bold' }} variant="body1" >Payment Details</Typography>
                </Box>
                <Box>
                    <Grid item md={11}>
                        {true && (
                            <Box>
                                <Grid container mb={2}></Grid>

                                {true && (
                                    <Fragment>

                                        <TableContainer
                                            component={Paper}
                                            sx={{
                                                maxHeight: "calc(100vh - 200px)",
                                                mt: 5,
                                                backgroundColor: "transparent",
                                                boxShadow: "none !important",
                                                borderRadius: "0px !important",
                                            }}
                                        >
                                            <Table stickyHeader sx={{ minWidth: 500 }}>
                                                <TableHead>
                                                    <Row>
                                                        {tableHead.map((cell, index) => (
                                                            <Cell
                                                                style={{
                                                                    textAlign:
                                                                        cell?.name == "SR No." ? "center" : "left",
                                                                    paddingRight:
                                                                        cell?.name == "SR No." ? "15px" : "50px",
                                                                }}
                                                                className="pdf-table"
                                                                key={index}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        display: "flex",
                                                                        alignItems: "flex-end",
                                                                    }}
                                                                >
                                                                    {cell?.name}{" "}

                                                                </Box>
                                                            </Cell>
                                                        ))}
                                                    </Row>
                                                </TableHead>
                                                <TableBody>

                                                    <Row

                                                        sx={{
                                                            border: "1px solid #EEEEEE !important",
                                                        }}
                                                    >
                                                        <Cell
                                                            style={{ textAlign: "left" }}
                                                            className="pdf-table"
                                                        >
                                                            {moment(detail?.payment?.payment_date).format("MM-DD-YYYY")}
                                                        </Cell>
                                                        <Cell
                                                            style={{ textAlign: "left" }}
                                                            className="pdf-table"
                                                        >
                                                            {detail?.payment?.payment_type}
                                                        </Cell>
                                                        <Cell
                                                            style={{ textAlign: "left" }}
                                                            className="pdf-table"
                                                        >
                                                            {detail?.payment?.amount}
                                                        </Cell>

                                                    </Row>

                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                    </Fragment>
                                )}


                            </Box>
                        )}
                        <Box sx={{ mt: 3 }}>
                            <Grid container spacing={3} style={{ padding: '20px' }}>

                                <Grid item xs={12} sm={6} sx={{ mt: 4 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Thank you for doing business with us. Have a good day!
                                    </Typography>
                                </Grid>
                                {/* <Grid item xs={12} sm={6}></Grid> */}
                                <Grid item xs={12} sm={6} sx={{ mt: -3 }}>
                                    <Grid container>

                                        <Grid item xs={6}>
                                            <Typography sx={{ fontSize: "12px", textAlign: "right" }} variant="body1">Subtotal</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography sx={{ fontSize: "12px" }} variant="body1" align="right">{detail?.payment ? detail?.payment?.amount : '0'} AED</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography sx={{ fontSize: "12px", textAlign: "right" }} variant="body1">Tax</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography sx={{ fontSize: "12px" }} variant="body1" align="right">{detail?.payment?.tax ? detail?.payment?.tax : '0'} AED</Typography>
                                        </Grid>

                                        <Grid item xs={6}>
                                            <Typography sx={{ fontSize: "12px", color: Colors.primary, textAlign: "right" }} variant="h6"><strong>Grand Total</strong></Typography>
                                        </Grid>
                                        <Grid item xs={6}>

                                            <Typography sx={{ fontSize: "12px", color: Colors.primary, fontWeight: 'bold' }} variant="body1" align="right">{detail?.payment ? detail?.payment?.amount : '0'} AED</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Box>

                {/* <Box sx={{mt:3}}>
      <Grid container spacing={3} style={{ padding: '20px' }}>
   
      <Grid item xs={12} sm={6} sx={{mt:4}}>
        <Typography variant="body2" color="textSecondary">
          Thank you for doing business with us. Have a good day!
        </Typography>
      </Grid>
     
      <Grid item xs={12} sm={6} sx={{mt:-3}}>
        <Grid container>
          <Grid item xs={6}>
            <Typography sx={{fontSize:"12px",textAlign:"right"}} variant="body1">Charges</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{fontSize:"12px"}} variant="body1" align="right">24,000 AED</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{fontSize:"12px",textAlign:"right"}} variant="body1">Subtotal</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{fontSize:"12px"}} variant="body1" align="right">24,000 AED</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{fontSize:"12px",textAlign:"right"}} variant="body1">Discount</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{fontSize:"12px"}} variant="body1" align="right">0</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{fontSize:"12px",color:Colors.primary,textAlign:"right"}} variant="h6"><strong>Grand Total</strong></Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{fontSize:"12px" ,color:Colors.primary}} variant="h6" align="right" ><strong>24,000 AED</strong></Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
      </Box> */}
            </PDFExport>
        </Box>
    );
}

export default CanceledInvoice;
