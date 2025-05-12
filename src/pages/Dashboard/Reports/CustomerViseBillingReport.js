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
  FormControlLabel,
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
  CleanTypes,
  Debounce,
  encryptData,
  formatPermissionData,
  getFileSize,
  handleDownload,
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
import CommissionServices from "services/Commission";
import LabelCustomInput from "components/Input/LabelCustomInput";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import { adjustSectionValue } from "@mui/x-date-pickers/internals/hooks/useField/useField.utils";
import DatePicker from "components/DatePicker";
import billingservices from "services/Visa";
import { CloudUpload } from "@mui/icons-material";
import instance from "config/axios";
import routes from "services/System/routes";
import { BoxTypes } from "devextreme-react/cjs/box";
import { mt } from "date-fns/locale";
import InvoiceServices from "services/Invoicing";
import SystemServices from "services/System";
import { CSVLink } from "react-csv";

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
    padding: "5px ",
    paddingLeft: "15px",
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

function CustomerViseBillingReport() {
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
  // *For Deposit Slip
  const [progress, setProgress] = useState(0);
  const [uploadedSize, setUploadedSize] = useState(0);
  const [slipDetail, setSlipDetail] = useState([]);
  const [slipLink, setSlipLink] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [comparisonCsvData, setComparisonCsvData] = useState([]);
  const csvLink = useRef();

  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [status, setStatus] = useState(null);
  const [payment, setPayment] = useState(null);
  const [selectedVisa, setSelectedVisa] = useState();
  const [charges, setCharges] = useState();
  const [selectedItem, setSelectedItem] = useState(null);
  const [pdfDialog, setPdfDialog] = useState(false);

  const tableHead = [
    { name: "Client", key: "created_at" },
    { name: "Request ID", key: "name" },
    { name: "Request Date", key: "commission_visa" },
    { name: "Employee ID", key: "commission_monthly" },
    { name: "Name", key: "commission_monthly" },
    { name: "Designation", key: "commission_monthly" },
    { name: "Nationality", key: "commission_monthly" },
    { name: "Passport No.", key: "commission_monthly" },
    { name: "Basic Salary (AED)", key: "commission_monthly" },
    { name: "Allowance (AED)", key: "commission_monthly" },
    { name: "Total Salary (AED)", key: "commission_monthly" },
    { name: "Apply Visa ", key: "commission_monthly" },
    { name: "Status Date", key: "commission_monthly" },
    { name: "Charges Starting Date", key: "commission_monthly" },
    { name: "Monthly Charges ", key: "commission_monthly" },
    { name: "Agent", key: "commission_monthly" },
    { name: "Net Profit  ", key: "commission_monthly" },
    { name: "Fahad ", key: "commission_monthly" },
    { name: "Sultan", key: "commission_monthly" },
  ];

  const [visibleColumns, setVisibleColumns] = useState({
    Client: true,
    "Request ID": true,
    "Request Date": true,
    "Employee ID": true,
    Name: true,
    Designation: true,
    Nationality: true,
    "Passport No.": true,
    "Basic Salary (AED)": true,
    "Allowance (AED)": true,
    "Total Salary (AED)": true,
    "Apply Visa": true,
    "Status Date": true,
    "Charges Starting Date": true,
    "Monthly Charges": true,
    Agent: true,
    "Net Profit": true,
    Fahad: true,
    Sultan: true,
  });

  // Function to toggle column visibility
  const toggleColumn = (columnKey) => {
    setVisibleColumns((prevState) => ({
      ...prevState,
      [columnKey]: !prevState[columnKey],
    }));
  };
  const allowFilesType = ["application/pdf"];

  const [loader, setLoader] = useState(false);

  const [sort, setSort] = useState("asc");

  // *For Customer Queue
  const [billings, setBillings] = useState([]);

  // *For setPermissions
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [itemAmount, setItemAmount] = useState();

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false);

  // *For Upload Document
  const handleUploadDocument = async (e) => {
    try {
      e.preventDefault();
      const file = e.target.files[0];
      let arr = [
        {
          name: file?.name,
          file: "",
          type: file?.type.split("/")[1],
          size: getFileSize(file.size),
          isUpload: false,
        },
      ];
      if (allowFilesType.includes(file.type)) {
        handleUpload(file, arr);
        const path = await handleUpload(file, arr);
        console.log("Uploaded file path:", path);
        setSlipLink(path);
        console.log(path, "pathpathpath");
        return path;
      } else {
        ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`);
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const handleRadioChange = (item) => {
    setSelectedItem(item);
  };
  const handleUpload = async (file, docs) => {
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("document", file);
      console.log(file);
      const { data } = await instance.post(routes.uploadDocuments, formData, {
        onUploadProgress: (progressEvent) => {
          const uploadedBytes = progressEvent.loaded;
          const percentCompleted = Math.round(
            (uploadedBytes * 100) / progressEvent.total
          );

          setProgress(percentCompleted);
          console.log(getFileSize(uploadedBytes));
          setUploadedSize(getFileSize(uploadedBytes));
        },
      });
      if (data) {
        docs[0].isUpload = true;
        docs[0].file = data?.data?.nations;
        setSlipDetail(docs);
        console.log(data, "asddasasd");
        return data?.data?.path;
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Customer Queue
  const getMonthlyBillings = async (page, limit, filter, id) => {
    // setLoader(true)
    try {
      const Page = page ? page : currentPage;
      const Limit = limit ? limit : pageLimit;
      const Filter = { ...filters, ...filter };
      setCurrentPage(Page);
      setPageLimit(Limit);
      setFilters(Filter);
      let params = {
        page: Page,
        limit: Limit,
        customer_id: id ? id : selectedCustomer?.id,
      };
      params = { ...params, ...Filter };

      const { data } = await InvoiceServices.getMonthlyBillings(params);
      setBillings(data?.rows);
      if (data?.rows?.length == 0) {
        showErrorToast("No Data Found");
      }
      setTotalCount(data?.count);
    } catch (error) {
      showErrorToast(error);
    } finally {
      // setLoader(false)
    }
  };

  const downloadExcel = async () => {
    console.log("Downloading Excel...");
    setCsvLoading(true);

    try {
      const allDataLimit = 9999;
      const allDataPage = 1;

      const params = {
        page: allDataPage,
        limit: allDataLimit,
        customer_id: selectedCustomer?.id,

        ...filters,
      };

      const { data } = await InvoiceServices.getMonthlyBillings(params);

      const csvHeaders = [
        { label: "Sr No", key: "sr_no" },
        { label: "Client", key: "created_at" },
        { label: "Request ID", key: "name" },
        { label: "Request Date", key: "commission_visa" },
        { label: "Employee ID", key: "commission_monthly" },
        { label: "Name", key: "commission_monthly" },
        { label: "Designation", key: "commission_monthly" },
        { label: "Nationality", key: "commission_monthly" },
        { label: "Passport No.", key: "commission_monthly" },
        { label: "Basic Salary (AED)", key: "commission_monthly" },
        { label: "Allowance (AED)", key: "commission_monthly" },
        { label: "Total Salary (AED)", key: "commission_monthly" },
        { label: "Apply Visa ", key: "commission_monthly" },
        { label: "Status Date", key: "commission_monthly" },
        { label: "Charges Starting Date", key: "commission_monthly" },
        { label: "Monthly Charges ", key: "commission_monthly" },
        { label: "Agent", key: "commission_monthly" },
        { label: "Net Profit  ", key: "commission_monthly" },
        { label: "Fahad ", key: "commission_monthly" },
        { label: "Sultan", key: "commission_monthly" },
      ];

      const csvData = data?.rows?.map((item, index) => {
        parseFloat(item?.salary_total) > 2000
        ? parseFloat(
            item?.customer?.monthly_visa_service_above
          ).toFixed(2)
        : parseFloat(
            item?.customer?.monthly_visa_service_below
          ).toFixed(2);
      let profitCalc =
        parseFloat(
          parseFloat(item?.salary_total) > 2000
            ? item?.customer?.monthly_visa_service_above
            : item?.customer
                ?.monthly_visa_service_below || 0
        ) -
        parseFloat(
          parseFloat(item?.salary_total) > 2000
            ? charges?.monthly_visa_service_above
            : charges?.monthly_visa_service_below || 0
        );
      console.log(profitCalc, "profit");

      let multiplier =
        parseFloat(
          item?.customer?.agent_commission_monthly || 0
        ) / 100;
      let agentCalc = profitCalc * multiplier;
      let mabdeProfit = profitCalc - agentCalc;

      let foundStatus = item?.statuses.find(
        (item, index) =>
          item?.status == "Entry permit" ||
          item?.status == "Change Status"
      );
      let statusDate = foundStatus?.date
        ? foundStatus?.date
        : foundStatus?.created_at;
      let VisaCost = 0;
      if (
        item?.visa_tenure?.includes("1") &&
        item?.visa_type === "In"
      ) {
        VisaCost =
          parseFloat(charges?.one_year_inside) +
          parseFloat(charges?.one_year_renewal);
      } else if (
        item?.visa_tenure?.includes("1") &&
        item?.visa_type === "Out"
      ) {
        VisaCost =
          parseFloat(charges?.one_year_outside) +
          parseFloat(charges?.one_year_renewal);
      } else if (
        item?.visa_tenure?.includes("2") &&
        item?.visa_type === "In"
      ) {
        VisaCost =
          parseFloat(charges?.two_year_inside) +
          parseFloat(charges?.two_year_renewal);
      } else if (
        item?.visa_tenure?.includes("2") &&
        item?.visa_type === "Out"
      ) {
        VisaCost =
          parseFloat(charges?.two_year_outside) +
          parseFloat(charges?.two_year_renewal);
      } else {
        // Handle other cases or set a default value if needed
        VisaCost = 0;
      }

      let additionalDays = 0;
      const customer = item?.customer;

      // Determine additional days based on due_date_policy
      if (customer.due_date_policy?.includes("7")) {
        additionalDays = 7;
      } else if (
        customer.due_date_policy?.includes("15")
      ) {
        additionalDays = 15;
      } else if (
        customer.due_date_policy?.includes("20")
      ) {
        additionalDays = 20;
      } else if (
        customer.due_date_policy?.includes("25")
      ) {
        additionalDays = 25;
      } else if (
        customer.due_date_policy?.includes("30")
      ) {
        additionalDays = 30;
      } else if (
        customer.due_date_policy?.includes("60")
      ) {
        additionalDays = 60;
      } else if (
        customer.due_date_policy?.includes("90")
      ) {
        additionalDays = 90;
      }
      
        return {
          sr_no: index + 1,
          client: item?.customer?.name || "-",
          request_id: `${item?.visa_id || ""}_${item?.serial_id || ""}`,
          request_date: item?.visa_request?.request_date
            ? moment(item?.visa_request?.request_date).format("MM-DD-YYYY")
            : "-",
          employee_id: item?.employee_id || "-",
          name: item?.name || "-",
          designation: item?.visa_designation || "-",
          nationality: item?.nationality?.name || "-",
          passport_no: item?.passport_number || "-",
          basic_salary: item?.salary_basic || "-",
          allowance: item?.salary_allowance || "-",
          total_salary:  item?.salary_total || "-",
          apply_visa: item?.visa_type || "-",
          status_date: item?.change_status_date
          ? moment(
              item?.change_status_date
            ).format("MM-DD-YYYY")
          : "-",
          charges_starting_date: item?.change_status_date
          ? moment(item?.change_status_date)
              .add(additionalDays, "days")
              .format("MM-DD-YYYY")
          : "-",
          
          monthly_charges: parseFloat(item?.salary_total) > 2000
          ? parseFloat(
              item?.customer
                ?.monthly_visa_service_above
            ).toFixed(2)
          : parseFloat(
              item?.customer
                ?.monthly_visa_service_below
            ).toFixed(2),
          agent: parseFloat(agentCalc).toFixed(2),
          net_profit: parseFloat(mabdeProfit).toFixed(2),
          fahad: parseFloat(
            mabdeProfit * 0.25
          ).toFixed(2),
          sultan: parseFloat(
            mabdeProfit * 0.25
          ).toFixed(2),
        };
      });
      ;

      setCsvData([
        csvHeaders.map((header) => header.label),
        ...csvData.map((row) => Object.values(row)),
      ]);
    } catch (error) {
      console.error("Error generating CSV data: ", error);
      ErrorToaster("Failed to generate CSV data: " + error.message);
    } finally {
      setCsvLoading(false);
    }
  };
  useEffect(() => {
    if (csvData.length > 0) {
      csvLink?.current.link.click();
    }
  }, [csvData, comparisonCsvData]);

  const getData = async (formData) => {
    setLoading(true);
    console.log(formData);
    try {
      let params = {
        charges_type: "rate",
      };

      const { data } = await SystemServices.getRates(params);

      let details = data?.charges;
      setCharges(details);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  // *For Get Customer Queue

  const getCustomerQueue = async (page, limit, filter) => {
    // setLoader(true)
    try {
      const Page = page ? page : currentPage;
      const Limit = limit ? limit : pageLimit;
      const Filter = { ...filters, ...filter };
      setCurrentPage(Page);
      setPageLimit(Limit);
      setFilters(Filter);
      let params = {
        page: Page,
        limit: Limit,
      };
      params = { ...params, ...Filter };
      const { data } = await CustomerServices.getCustomerQueue(params);

      setCustomerQueue(data?.rows);
    } catch (error) {
      showErrorToast(error);
    } finally {
      // setLoader(false)
    }
  };

  // *For Handle Filter
  const handleFilter = () => {
    let data = {
      search: getValues("search"),
    };
    Debounce(() => getMonthlyBillings(1, "", data));
  };

  const handleSort = (key) => {
    let data = {
      sort_by: key,
      sort_order: sort,
    };
    Debounce(() => getMonthlyBillings(1, "", data));
  };

  useEffect(() => {
    getData();
    getCustomerQueue();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <SimpleDialog
        open={pdfDialog}
        onClose={() => {
          setPdfDialog(false);
        }}
        title={"Download Pdf"}
      >
        <Box component="form">
          <p style={{ fontWeight: "bold" }}>Select Columns For PDF</p>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <div>
                {Object.keys(visibleColumns).map((column) => (
                  <FormControlLabel
                    key={column}
                    control={
                      <Checkbox
                        checked={visibleColumns[column]}
                        onChange={() => toggleColumn(column)}
                        name={column}
                      />
                    }
                    label={column}
                  />
                ))}
              </div>
              {console.log(visibleColumns)}
              <p>
                Selected Coloumns :{" "}
                {Object.values(visibleColumns).filter(Boolean).length}
              </p>
              {Object.values(visibleColumns).filter(Boolean).length > 13 && (
                <p style={{ color: "blue" }}>
                  Select 13 columns to get best result
                </p>
              )}
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
                  disabled={visibleColumns.length < 14 ? true : false}
                  onClick={() => handleExportWithComponent(contentRef)}
                  title="Yes,Confirm"
                />
                <PrimaryButton
                  onClick={() => {
                    setPdfDialog(false);
                  }}
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
          Customer Vise Billing Report
        </Typography>

        <Box sx={{ display: "flex", gap: "10px" }}>
          {billings.length > 0 && (
            <>
              <PrimaryButton
                title="Download PDF"
                type="button"
                style={{ backgroundColor: Colors.bluishCyan }}
                onClick={() => setPdfDialog(true)}
              />
              <CSVLink
                ref={csvLink}
                data={csvData}
                filename={`Customer_Vise_Billing_Report${moment().format(
                  "DD-MMM-YYYY_HHmmss"
                )}.csv`}
                target="_blank"
              ></CSVLink>
              <PrimaryButton
                title="Download Excel"
                type="button"
                style={{ backgroundColor: Colors.bluishCyan }}
                onClick={() => {
                  downloadExcel();
                }}
                loading={csvLoading}
              />
            </>
          )}
          {/* <PrimaryButton
                        title={"Download Excel"}
                        onClick={() => downloadExcel()}
                    /> */}
        </Box>
      </Box>

      {/* Filters */}
      <Box>
        <Grid container spacing={2}>
          {/* <Grid item xs={6} >
                        <LabelCustomInput type={'text'} bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'Search'} placeholder={'Search'} register={register("search")} />
                    </Grid> */}
          <Grid item xs={3}>
            <SelectField
              size={"small"}
              label={"Select Customer :"}
              options={customerQueue}
              selected={selectedCustomer}
              onSelect={(value) => {
                setSelectedCustomer(value);

                getMonthlyBillings(null, null, null, value?.id);
              }}
              error={errors?.customer?.message}
              register={register("customer", {
                required: "Please select customer account.",
              })}
            />
          </Grid>
          {/* <Grid item xs={3} >
                        <LabelCustomInput type={'text'} bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'By Customers'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid>
                    <Grid item xs={3} >
                        <LabelCustomInput bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'By Commission'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid>
                    <Grid item xs={3} >
                        <LabelCustomInput bgcolor={'#FAFAFA'} color={Colors.primary} border={'2px solid #FAFAFA'} StartLabel={'By Date'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid> */}
          {/* <Grid item xs={6} display={'flex'} justifyContent={'flex-end'} gap={2} >
                        <PrimaryButton
                            bgcolor={Colors.white}
                            textcolor={Colors.primary}
                            // border={`1px solid ${Colors.primary}`}
                            title="Reset"
                            onClick={() => { getMonthlyBillings(); setValue('search', '') }}
                            loading={loading}
                        />
                        <PrimaryButton
                           bgcolor={'#001f3f'}
                            title="Search"
                            onClick={() => handleFilter()}
                            loading={loading}
                        />
                    </Grid> */}
        </Grid>

        <Grid item md={11}>
          {billings.length > 0 && (
            <Box>
              <Grid container></Grid>

              {billings && (
                <Fragment>
                  <PDFExport
                    ref={contentRef}
                    landscape={true}
                    paperSize="A4"
                    margin={5}
                    fileName="Data"
                    pageTemplate={({ pageNumber, totalPages }) => (
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
                                  <span style={{ display: "block" }}>
                                    MABDE TRADING L.L.C
                                  </span>
                                </Typography>
                                <Typography
                                  style={{
                                    color: "#155368",
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    marginLeft: "30px",
                                  }}
                                >
                                  <span style={{ display: "block" }}>
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
                                  <span style={{ display: "block" }}>
                                    P.O.BOX 81, DUBAI, UAE
                                  </span>
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Typography
                            className="pdf-myfont"
                            sx={{
                              fontSize: "24px",
                              fontWeight: "bold",
                              textAlign: "left",
                              fontFamily: "Arial, Helvetica, sans-serif",
                            }}
                          >
                            Customer Vise Billing Report
                          </Typography>

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
                        {/* <Box style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '50px',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <img src={Images.invoiceHeader} style={{ width: '100%' }} alt="Footer" />
                                                </Box> */}
                      </>
                    )}
                  >
                    {/* Main content */}
                    <TableContainer
                      component={Paper}
                      className="main-table"
                      sx={{
                        maxHeight: "100%",
                        mt: 5,
                        backgroundColor: "transparent",
                        boxShadow: "none !important",
                        borderRadius: "0px !important",
                        paddingTop: "60px", // Adjust for header height
                        paddingBottom: "60px", // Adjust for footer height
                      }}
                    >
                      <Table stickyHeader sx={{ minWidth: 500 }}>
                        <TableHead>
                          <Row>
                            {visibleColumns["Client"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Client
                              </Cell>
                            )}
                            {visibleColumns["Request ID"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Request ID
                              </Cell>
                            )}
                            {visibleColumns["Request Date"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Request Date
                                <>
                                  &nbsp;
                                  <span
                                    className="pdf-hide"
                                    style={{
                                      height: "20px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Box
                                      component={"img"}
                                      onClick={() => {
                                        setSort(
                                          sort === "asc" ? "desc" : "asc"
                                        );
                                        handleSort("created_at");
                                      }}
                                      src={Images.sortIcon}
                                      width={"18px"}
                                    />
                                  </span>
                                </>
                              </Cell>
                            )}
                            {visibleColumns["Employee ID"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Employee ID
                              </Cell>
                            )}
                            {visibleColumns["Name"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Name
                              </Cell>
                            )}
                            {visibleColumns["Designation"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Designation
                              </Cell>
                            )}
                            {visibleColumns["Nationality"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Nationality
                              </Cell>
                            )}
                            {visibleColumns["Passport No."] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Passport No.
                              </Cell>
                            )}
                            {visibleColumns["Basic Salary (AED)"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Basic Salary (AED)
                              </Cell>
                            )}
                            {visibleColumns["Allowance (AED)"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Allowance (AED)
                              </Cell>
                            )}
                            {visibleColumns["Total Salary (AED)"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Total Salary (AED)
                              </Cell>
                            )}
                            {visibleColumns["Apply Visa"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Apply Visa
                              </Cell>
                            )}
                            {visibleColumns["Status Date"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Status Date
                              </Cell>
                            )}
                            {visibleColumns["Charges Starting Date"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Charges Starting Date
                              </Cell>
                            )}
                            {visibleColumns["Monthly Charges"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Monthly Charges
                              </Cell>
                            )}
                            {visibleColumns["Agent"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Agent
                              </Cell>
                            )}
                            {visibleColumns["Net Profit"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Net Profit
                              </Cell>
                            )}
                            {visibleColumns["Fahad"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Fahad
                              </Cell>
                            )}
                            {visibleColumns["Sultan"] && (
                              <Cell className="pdf-table pdf-table-head2">
                                Sultan
                              </Cell>
                            )}
                          </Row>
                        </TableHead>
                        {console.log(visibleColumns["Client"], "test")}
                        <TableBody>
                          {billings.map((item, index) => {
                            parseFloat(item?.salary_total) > 2000
                              ? parseFloat(
                                  item?.customer?.monthly_visa_service_above
                                ).toFixed(2)
                              : parseFloat(
                                  item?.customer?.monthly_visa_service_below
                                ).toFixed(2);
                            let profitCalc =
                              parseFloat(
                                parseFloat(item?.salary_total) > 2000
                                  ? item?.customer?.monthly_visa_service_above
                                  : item?.customer
                                      ?.monthly_visa_service_below || 0
                              ) -
                              parseFloat(
                                parseFloat(item?.salary_total) > 2000
                                  ? charges?.monthly_visa_service_above
                                  : charges?.monthly_visa_service_below || 0
                              );
                            console.log(profitCalc, "profit");

                            let multiplier =
                              parseFloat(
                                item?.customer?.agent_commission_monthly || 0
                              ) / 100;
                            let agentCalc = profitCalc * multiplier;
                            let mabdeProfit = profitCalc - agentCalc;

                            let foundStatus = item?.statuses.find(
                              (item, index) =>
                                item?.status == "Entry permit" ||
                                item?.status == "Change Status"
                            );
                            let statusDate = foundStatus?.date
                              ? foundStatus?.date
                              : foundStatus?.created_at;
                            let VisaCost = 0;
                            if (
                              item?.visa_tenure?.includes("1") &&
                              item?.visa_type === "In"
                            ) {
                              VisaCost =
                                parseFloat(charges?.one_year_inside) +
                                parseFloat(charges?.one_year_renewal);
                            } else if (
                              item?.visa_tenure?.includes("1") &&
                              item?.visa_type === "Out"
                            ) {
                              VisaCost =
                                parseFloat(charges?.one_year_outside) +
                                parseFloat(charges?.one_year_renewal);
                            } else if (
                              item?.visa_tenure?.includes("2") &&
                              item?.visa_type === "In"
                            ) {
                              VisaCost =
                                parseFloat(charges?.two_year_inside) +
                                parseFloat(charges?.two_year_renewal);
                            } else if (
                              item?.visa_tenure?.includes("2") &&
                              item?.visa_type === "Out"
                            ) {
                              VisaCost =
                                parseFloat(charges?.two_year_outside) +
                                parseFloat(charges?.two_year_renewal);
                            } else {
                              // Handle other cases or set a default value if needed
                              VisaCost = 0;
                            }

                            let additionalDays = 0;
                            const customer = item?.customer;

                            // Determine additional days based on due_date_policy
                            if (customer.due_date_policy?.includes("7")) {
                              additionalDays = 7;
                            } else if (
                              customer.due_date_policy?.includes("15")
                            ) {
                              additionalDays = 15;
                            } else if (
                              customer.due_date_policy?.includes("20")
                            ) {
                              additionalDays = 20;
                            } else if (
                              customer.due_date_policy?.includes("25")
                            ) {
                              additionalDays = 25;
                            } else if (
                              customer.due_date_policy?.includes("30")
                            ) {
                              additionalDays = 30;
                            } else if (
                              customer.due_date_policy?.includes("60")
                            ) {
                              additionalDays = 60;
                            } else if (
                              customer.due_date_policy?.includes("90")
                            ) {
                              additionalDays = 90;
                            }

                            return (
                              <Row
                                key={index}
                                sx={{ border: "1px solid #EEEEEE !important" }}
                              >
                                {Object.keys(visibleColumns).map((column) => {
                                  switch (column) {
                                    case "Client":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {item?.customer?.name}
                                        </Cell>
                                      ) : null;

                                    case "Request ID":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {item?.visa_id +
                                            "_" +
                                            item?.serial_id}
                                        </Cell>
                                      ) : null;

                                    case "Request Date":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {moment(
                                            item?.visa_request?.request_date
                                          ).format("MM-DD-YYYY")}
                                        </Cell>
                                      ) : null;

                                    case "Employee ID":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {item?.employee_id}
                                        </Cell>
                                      ) : null;

                                    case "Name":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {item?.name}
                                        </Cell>
                                      ) : null;

                                    case "Designation":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {item?.visa_designation}
                                        </Cell>
                                      ) : null;

                                    case "Nationality":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {item?.nationality?.name}
                                        </Cell>
                                      ) : null;

                                    case "Passport No.":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {item?.passport_number}
                                        </Cell>
                                      ) : null;

                                    case "Basic Salary (AED)":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {item?.salary_basic}
                                        </Cell>
                                      ) : null;

                                    case "Allowance (AED)":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {item?.salary_allowance}
                                        </Cell>
                                      ) : null;

                                    case "Total Salary (AED)":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {item?.salary_total}
                                        </Cell>
                                      ) : null;

                                    case "Apply Visa":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {item?.visa_type}
                                        </Cell>
                                      ) : null;

                                    case "Status Date":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {item?.change_status_date
                                            ? moment(
                                                item?.change_status_date
                                              ).format("MM-DD-YYYY")
                                            : "-"}
                                        </Cell>
                                      ) : null;

                                    case "Charges Starting Date":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {item?.change_status_date
                                            ? moment(item?.change_status_date)
                                                .add(additionalDays, "days")
                                                .format("MM-DD-YYYY")
                                            : "-"}
                                        </Cell>
                                      ) : null;

                                    case "Monthly Charges":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {parseFloat(item?.salary_total) > 2000
                                            ? parseFloat(
                                                item?.customer
                                                  ?.monthly_visa_service_above
                                              ).toFixed(2)
                                            : parseFloat(
                                                item?.customer
                                                  ?.monthly_visa_service_below
                                              ).toFixed(2)}
                                        </Cell>
                                      ) : null;

                                    case "Agent":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {parseFloat(agentCalc).toFixed(2)}
                                        </Cell>
                                      ) : null;

                                    case "Net Profit":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {parseFloat(mabdeProfit).toFixed(2)}
                                        </Cell>
                                      ) : null;

                                    case "Fahad":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {parseFloat(
                                            mabdeProfit * 0.25
                                          ).toFixed(2)}
                                        </Cell>
                                      ) : null;

                                    case "Sultan":
                                      return visibleColumns[column] ? (
                                        <Cell className="pdf-table2">
                                          {parseFloat(
                                            mabdeProfit * 0.25
                                          ).toFixed(2)}
                                        </Cell>
                                      ) : null;

                                    default:
                                      return null;
                                  }
                                })}
                              </Row>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </PDFExport>

                  {/* ========== Pagination ========== */}
                  <Pagination
                    currentPage={currentPage}
                    pageSize={pageLimit}
                    onPageSizeChange={(size) =>
                      getMonthlyBillings(1, size.target.value)
                    }
                    tableCount={billings?.length}
                    totalCount={totalCount}
                    onPageChange={(page) => getMonthlyBillings(page, "")}
                  />
                </Fragment>
              )}

              {loader && <CircleLoading />}
            </Box>
          )}
        </Grid>
      </Box>
    </Box>
  );
}

export default CustomerViseBillingReport;
