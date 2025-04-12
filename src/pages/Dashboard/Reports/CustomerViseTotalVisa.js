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
import VisaServices from "services/Visa";
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
    paddingLeft: "15px ",
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

function CustomerViseTotalVisa() {
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

  const tableHead = [
    { name: "Client", key: "created_at" },
    { name: "Request ID", key: "name" },
    { name: "Request Date", key: "commission_visa" },
    { name: "Employee ID", key: "commission_monthly" },
    { name: "Name", key: "commission_monthly" },
    { name: "Designation", key: "commission_monthly" },
    { name: "Nationality", key: "commission_monthly" },
    { name: "Passport No.", key: "commission_monthly" },
    { name: "Passport Expiry Date", key: "commission_monthly" },
    { name: "Basic Salary (AED)", key: "commission_monthly" },
    { name: "Allowance (AED)", key: "commission_monthly" },
    { name: "Total Salary (AED)", key: "commission_monthly" },
    { name: "Apply Visa ", key: "commission_monthly" },
    { name: "Status Date", key: "commission_monthly" },
    { name: "Status", key: "commission_monthly" },
  ];

  const allowFilesType = ["application/pdf"];

  const [loader, setLoader] = useState(false);

  const [sort, setSort] = useState("asc");

  // *For Customer Queue
  const [visas, setVisas] = useState([]);

  // *For setPermissions
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [itemAmount, setItemAmount] = useState();

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false);

  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVisaType, setSelectedVisaType] = useState(null);

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

  const getVisaSales = async (page, limit, filter, id, visaId) => {
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
        status: visaId ? visaId : selectedVisaType?.id,
      };
      params = { ...params, ...Filter };

      const { data } = await InvoiceServices.getVisaSales(params);
      setVisas(data?.rows);
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
        customer_id:  selectedCustomer?.id,
        status: selectedVisaType?.id,
        ...filters
      };

      const { data } = await InvoiceServices.getVisaSales(params);

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
        { label: "Passport Expiry Date", key: "commission_monthly" },
        { label: "Basic Salary (AED)", key: "commission_monthly" },
        { label: "Allowance (AED)", key: "commission_monthly" },
        { label: "Total Salary (AED)", key: "commission_monthly" },
        { label: "Apply Visa ", key: "commission_monthly" },
        { label: "Status Date", key: "commission_monthly" },
        { label: "Status", key: "commission_monthly" },
      ];

      const csvData = data?.rows?.map((item, index) => {
        let foundStatus = null;
        let statusDate = null;
        console.log(selectedVisaType, "selectedVisaType");

        if (selectedVisaType?.name == "Active") {
          foundStatus = item?.statuses.find(
            (item, index) => item?.status == "Stamping"
          );
          statusDate = foundStatus?.date;
          console.log(statusDate, "statusDatestatusDate");
        } else {
          statusDate = item?.updated_at;
        }

        let VisaCost = 0;
        if (
          item?.visa_tenure.includes("1") &&
          item?.visa_type === "In"
        ) {
          VisaCost =
            parseFloat(charges?.one_year_inside) +
            parseFloat(charges?.one_year_renewal);
        } else if (
          item?.visa_tenure.includes("1") &&
          item?.visa_type === "Out"
        ) {
          VisaCost =
            parseFloat(charges?.one_year_outside) +
            parseFloat(charges?.one_year_renewal);
        } else if (
          item?.visa_tenure.includes("2") &&
          item?.visa_type === "In"
        ) {
          VisaCost =
            parseFloat(charges?.two_year_inside) +
            parseFloat(charges?.two_year_renewal);
        } else if (
          item?.visa_tenure.includes("2") &&
          item?.visa_type === "Out"
        ) {
          VisaCost =
            parseFloat(charges?.two_year_outside) +
            parseFloat(charges?.two_year_renewal);
        } else {
          // Handle other cases or set a default value if needed
          VisaCost = 0;
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
          passport_expiry_date:item?.passport_expiry ?moment(item?.passport_expiry).format(
            "MM-DD-YYYY"
          ):"-",
          basic_salary: item?.salary_basic || "-",
          allowance: item?.salary_allowance || "-",
          total_salary: item?.salary_total,
          apply_visa: item?.visa_type || "-",
          status_date: statusDate
          ? moment(statusDate).format("MM-DD-YYYY")
          : "-",
         status:item?.visa_status,
        };
      });
      

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
        charges_type: "cost",
      };

      const { data } = await SystemServices.getRates(params);

      let details = data?.charges;
      setCharges(details);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // *For Handle Filter
  const handleFilter = () => {
    let data = {
      search: getValues("search"),
    };
    Debounce(() => getVisaSales(1, "", data));
  };

  const handleSort = (key) => {
    let data = {
      sort_by: key,
      sort_order: sort,
    };
    Debounce(() => getVisaSales(1, "", data));
  };

  useEffect(() => {
    getData();
    getCustomerQueue();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
          Customer Vise Total Visas
        </Typography>

        <Box sx={{ display: "flex", gap: "10px" }}>
          {visas.length > 0 && (
            <>
              <PrimaryButton
                title="Download PDF"
                type="button"
                style={{ backgroundColor: Colors.bluishCyan }}
                onClick={() => handleExportWithComponent(contentRef)}
              />
              <CSVLink
                ref={csvLink}
                data={csvData}
                filename={`Customer_Vise-Total_Visas${moment().format(
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
                if (value && selectedVisaType) {
                  getVisaSales(null, null, null, value?.id);
                }
              }}
              error={errors?.customer?.message}
              register={register("customer", {
                required: "Please select customer account.",
              })}
            />
          </Grid>
          <Grid item xs={3}>
            <SelectField
              size={"small"}
              label={"Select Visa Type :"}
              options={[
                { id: "Active", name: "Active" },
                { id: "Cancel", name: "Cancelled" },
                { id: "Absconder", name: "Absconder" },
              ]}
              selected={selectedVisaType}
              onSelect={(value) => {
                setSelectedVisaType(value);
                if (value && selectedCustomer) {
                  getVisaSales(
                    null,
                    null,
                    null,
                    selectedCustomer?.id,
                    value?.id
                  );
                }
              }}
              error={errors?.visatype?.message}
              register={register("visatype", {
                required: "Please select visatype .",
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
                            onClick={() => { getVisaSales(); setValue('search', '') }}
                            loading={loading}
                        />
                        <PrimaryButton
                            bgcolor={Colors.buttonBg}
                            title="Search"
                            onClick={() => handleFilter()}
                            loading={loading}
                        />
                    </Grid> */}
        </Grid>

        <Grid item md={11}>
          {visas.length > 0 && (
            <Box>
              <Grid container mb={2}></Grid>

              {visas && (
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
                            Customer Vise Total Visa
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
                            {tableHead.map((cell, index) => (
                              <Cell
                                style={{
                                  textAlign:
                                    cell?.name === "Select" ? "center" : "left",
                                  paddingRight:
                                    cell?.name === "Select" ? "15px" : "20px",
                                }}
                                className="pdf-table pdf-table-head2"
                                key={index}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "flex-end",
                                  }}
                                >
                                  {cell?.name}
                                  {cell?.name === "Date" && (
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
                                              sort === "asc" ? "desc" : "asc"
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
                          {visas.map((item, index) => {
                            let foundStatus = null;
                            let statusDate = null;
                            console.log(selectedVisaType, "selectedVisaType");

                            if (selectedVisaType?.name == "Active") {
                              foundStatus = item?.statuses.find(
                                (item, index) => item?.status == "Stamping"
                              );
                              statusDate = foundStatus?.date;
                              console.log(statusDate, "statusDatestatusDate");
                            } else {
                              statusDate = item?.updated_at;
                            }

                            let VisaCost = 0;
                            if (
                              item?.visa_tenure.includes("1") &&
                              item?.visa_type === "In"
                            ) {
                              VisaCost =
                                parseFloat(charges?.one_year_inside) +
                                parseFloat(charges?.one_year_renewal);
                            } else if (
                              item?.visa_tenure.includes("1") &&
                              item?.visa_type === "Out"
                            ) {
                              VisaCost =
                                parseFloat(charges?.one_year_outside) +
                                parseFloat(charges?.one_year_renewal);
                            } else if (
                              item?.visa_tenure.includes("2") &&
                              item?.visa_type === "In"
                            ) {
                              VisaCost =
                                parseFloat(charges?.two_year_inside) +
                                parseFloat(charges?.two_year_renewal);
                            } else if (
                              item?.visa_tenure.includes("2") &&
                              item?.visa_type === "Out"
                            ) {
                              VisaCost =
                                parseFloat(charges?.two_year_outside) +
                                parseFloat(charges?.two_year_renewal);
                            } else {
                              // Handle other cases or set a default value if needed
                              VisaCost = 0;
                            }
                            return (
                              <Row
                                key={index}
                                sx={{ border: "1px solid #EEEEEE !important" }}
                              >
                                <Cell
                                  style={{
                                    textAlign: "left",
                                    paddingLeft: "0px !important",
                                  }}
                                  className="pdf-table2"
                                >
                                  {item?.customer?.name}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {item?.visa_id + "_" + item?.serial_id}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {moment(
                                    item?.visa_request?.request_date
                                  ).format("MM-DD-YYYY")}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {item?.employee_id}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {item?.name}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {item?.visa_designation}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {item?.nationality?.name
                                    ? item?.nationality?.name
                                    : "-"}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {item?.passport_number
                                    ? item?.passport_number
                                    : "-"}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {moment(item?.passport_expiry).format(
                                    "MM-DD-YYYY"
                                  )}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {item?.salary_basic}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {item?.salary_allowance}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {item?.salary_total}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {item?.visa_type}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {statusDate
                                    ? moment(statusDate).format("MM-DD-YYYY")
                                    : "-"}
                                </Cell>

                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table2"
                                >
                                  {item?.visa_status}
                                </Cell>
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
                      getVisaSales(1, size.target.value)
                    }
                    tableCount={visas?.length}
                    totalCount={totalCount}
                    onPageChange={(page) => getVisaSales(page, "")}
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

export default CustomerViseTotalVisa;
