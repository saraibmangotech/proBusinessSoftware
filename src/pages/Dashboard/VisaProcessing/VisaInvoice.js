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

  const UpdatePaymentStatus = async (formData) => {
    try {
      let obj = {
        payment_date: date,
        payment_type: paymentType?.name,
        visa_id: selectedVisa?.id,
        amount: formData?.amount,
        bank_id: selectedBank?.id,
        description: formData?.description,
      };

      const promise = VisaServices.updatePaymentStatus(obj);
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
        setPaymentDialog(false);
        // getVisaRequestList();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setDate("invalid");
        return;
      }
      setDate(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Handle Filter
  const handleFilter = () => {
    let data = {
      search: getValues("search"),
    };
    // Debounce(() => getVisaRequestList(1, '', data));
  };

  const handleSort = (key) => {
    let data = {
      sort_by: key,
      sort_order: sort,
    };
    // Debounce(() => getVisaRequestList(1, '', data));
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
                    fileName="Import Customers"
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
              No: #MMYYYY0001-01A
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: "12px" }} variant="body1">
                <span style={{ color: Colors.lightGrey }}>Order No.:</span>{" "}
                #MMYYYY0001
              </Typography>
              <Typography sx={{ fontSize: "12px" }} variant="body1">
                <span style={{ color: Colors.lightGrey }}>Custom (PO):</span>{" "}
                P00000001
              </Typography>
              <Typography sx={{ fontSize: "12px" }} variant="body1">
                <span style={{ color: Colors.lightGrey }}>Invoice Date:</span>{" "}
                MM-DD-YYYY
              </Typography>
              <Typography sx={{ fontSize: "12px" }} variant="body1">
                <span style={{ color: Colors.lightGrey }}>Due Date:</span>{" "}
                MM-DD-YYYY
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ fontSize: "12px" }} variant="body1">
              Address line, Street Address, City Name, State, Country – Pin Code
            </Typography>
            <Typography sx={{ fontSize: "12px" }} variant="body1">
              username@email.com
            </Typography>
            <Typography sx={{ fontSize: "12px" }} variant="body1">
              +91 98765 43210
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}></Grid>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ color: Colors.primary,fontSize: "12px"  }}
            >
              Customer Details
            </Typography>
            <Typography sx={{ fontSize: "12px" }} variant="body1">
              Customer/Business name
            </Typography>
            <Typography sx={{ fontSize: "12px" }} variant="body1">
              username@email.com
            </Typography>
            <Typography sx={{ fontSize: "12px" }} variant="body1">
              +91 98765 43210
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
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
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Grid item md={11}>
          {visaprocessingList && (
            <Box>
              <Grid container mb={2}></Grid>

              {visaprocessingList && (
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
                                  {cell?.name == "Date" && (
                                    <>
                                      &nbsp;
                                      <span
                                        style={{
                                          height: "20px",
                                          cursor: "pointer",
                                        }}
                                      >
                                        <Box
                                          component={"img"}
                                          onClick={() => {
                                            setSort(
                                              sort == "asc" ? "desc" : "asc"
                                            );
                                            handleSort(cell?.key);
                                          }}
                                          src={Images.sortIcon}
                                          width={"18px"}
                                        ></Box>
                                      </span>
                                    </>
                                  )}
                                </Box>
                              </Cell>
                            ))}
                          </Row>
                        </TableHead>
                        <TableBody>
                          {visaprocessingList?.map((item, index) => {
                            return (
                              <Row
                                key={index}
                                sx={{
                                  border: "1px solid #EEEEEE !important",
                                }}
                              >
                                <Cell
                                  style={{ textAlign: "center" }}
                                  className="pdf-table"
                                >
                                  {item?.vr_no}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {moment().format("MM-DD-YYYY")}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.customer}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.visa_qnty}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.visa_rate}
                                </Cell>
                              </Row>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  
                </Fragment>
              )}

              {loader && <CircleLoading />}
            </Box>
          )}
        </Grid>
      </Box>

      <Box sx={{mt:3}}>
      <Grid container spacing={3} style={{ padding: '20px' }}>
   
      <Grid item xs={12} sm={6} sx={{mt:4}}>
        <Typography variant="body2" color="textSecondary">
          Thank you for doing business with us. Have a good day!
        </Typography>
      </Grid>
      {/* <Grid item xs={12} sm={6}></Grid> */}
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
      </Box>
      </PDFExport>
    </Box>
  );
}

export default VisaInvoice;
