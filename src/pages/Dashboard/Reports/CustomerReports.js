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
import { useAuth } from "context/UseContext";
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

function CustomerViseReport() {
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
  const [candidates, setCandidates] = useState([]);
  const [slipLink, setSlipLink] = useState("");
  const { user } = useAuth()
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
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [comparisonCsvData, setComparisonCsvData] = useState([]);
  const csvLink = useRef();

  const tableHead = [

    { name: "VR No.", key: "" },
    { name: "Date", key: "created_at" },
    { name: "Customer", key: "created_at" },
    { name: "Passport Number", keyy: "passport_number" },
    { name: "Candidate Name", key: "candidate_name" },
    { name: "Visa Rate", key: "visa_rate" },
    { name: "Visa Expiry", key: "visa_expiry" },
    { name: "Status", key: "" },
    { name: "Processing Status", key: "" },
    { name: "Action", key: "" },

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

  // *For Get Customer Queue
  //   const getVisaSales = async (page, limit, filter, id, visaId) => {
  //     try {
  //       const Page = page ? page : currentPage;
  //       const Limit = limit ? limit : pageLimit;
  //       const Filter = { ...filters, ...filter };
  //       setCurrentPage(Page);
  //       setPageLimit(Limit);
  //       setFilters(Filter);
  //       let params = {
  //         page: Page,
  //         limit: Limit,
  //         customer_id: id ? id : selectedCustomer?.id,
  //       };
  //       params = { ...params, ...Filter };

  //       const { data } = await InvoiceServices.getVisaSales(params);
  //       setVisas(data?.rows);
  //       if (data?.rows?.length == 0) {
  //         showErrorToast("No Data Found");
  //       }
  //       setTotalCount(data?.count);
  //     } catch (error) {
  //       showErrorToast(error);
  //     } finally {
  //       // setLoader(false)
  //     }
  //   };

;

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
    Debounce(() => getVisaRequestList(1, "", "", data));
  };

  const handleSort = (key) => {
    let data = {
      sort_by: key,
      sort_order: sort,
    };
    Debounce(() => getVisaRequestList(1, "", "", data));
  };
  const getVisaRequestList = async (page, limit, filter, id) => {
    // setLoader(true)
    console.log(selectedCustomer?.customer_id, 'test');
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = { ...filters, ...filter }

      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      let params = {
        page: Page,
        limit: Limit,
        customer_id: user?.user_type == 'C' ? user?.customer_id : id,
      }
      params = { ...params, ...Filter }

      const { data } = await CustomerServices.getCandidateLists(params)
      setCandidates(data?.rows)
      setVisas(data?.rows);
      setTotalCount(data?.count)
      console.log(formatPermissionData(data?.permissions))
      setPermissions(formatPermissionData(data?.permissions))
      data?.permissions.forEach(e => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      })

    } catch (error) {
      showErrorToast(error)
    } finally {
      // setLoader(false)
    }
  }
  useEffect(() => {
    // getVisaRequestList();
    getCustomerQueue();
  }, []);


  const downloadExcel = async (id) => {
    console.log("Downloading Excel...",selectedCustomer);
    setCsvLoading(true);

    try {
      const allDataLimit = 9999;
      const allDataPage = 1;

      const params = {
        page: allDataPage,
        limit: allDataLimit,
        customer_id:  selectedCustomer?.id,
        ...filters,
      };

      const { data } = await  CustomerServices.getCandidateLists(params);

      const csvHeaders = [
      { label: "SR No.", key: "" },
      { label: "VR No.", key: "" },
      { label: "Date", key: "created_at" },
      { label: "Customer", key: "created_at" },
      { label: "Passport Number", keyy: "passport_number" },
      { label: "Candidate Name", key: "candidate_name" },
      { label: "Visa Rate", key: "visa_rate" },
      { label: "Visa Expiry", key: "visa_expiry" },
      { label: "Status", key: "" },
      { label: "Processing Status", key: "" },  
    ]
      

      const csvData = data?.rows?.map((item, index) => {
        let sorteddata = item?.statuses.sort(
          (a, b) => a.id - b.id
        );
        return {
          "Sr No": index + 1,
          "VR_No":item?.visa_id + "_" + item?.serial_id,
          "date":moment(item?.created_at).format(
            "MM-DD-YYYY"
          ),
          "Customer":item?.visa_request?.customer?.name,
           "Passport Number":item?.passport_number,
           "Candidate Name":item?.name,
           "Visa Rate":item?.visa_charges
           ? item?.visa_charges
           : "0",
           "Visa Expiry":item?.visa_expiry
           ? moment(item?.visa_expiry).format(
             "MM-DD-YYYY"
           )
           : "-",
           "Status":sorteddata[sorteddata.length - 1]?.status,
           "Processing Status":item?.approval_status,
        
              
            
                
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



  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
          Customer Vise Total Visa
        </Typography>

        {candidates.length > 0 && <Box sx={{ display: "flex", gap: "10px" }}>
          <PrimaryButton
            title="Download PDF"
            type="button"
            style={{ backgroundColor: Colors.bluishCyan }}
            onClick={() => handleExportWithComponent(contentRef)}
          />
           <CSVLink
                ref={csvLink}
                data={csvData}
                filename={`Customer_vise_report${moment().format(
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
        </Box>}
      </Box>

      {/* Filters */}
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <SelectField
              size={"small"}
              label={"Select Customer :"}
              options={customerQueue}
              selected={selectedCustomer}
              onSelect={(value) => {
                setSelectedCustomer(value);
                if (value) {
                  getVisaRequestList(null, null, null, value?.id);
                }
              }}
              error={errors?.customer?.message}
              register={register("customer", {
                required: "Please select customer account.",
              })}
            />
          </Grid>
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
                    fileName="Visa Sales Revenue"
                    pageTemplate={({ pageNumber, totalPages }) => (
                      <>
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
                                  <span style={{ display: "block" }}>MABDE TRADING L.L.C</span>
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

                          <Typography className='pdf-myfont' sx={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }}>Customer Vise Total Visa</Typography>

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
                      </>
                    )}
                  >
                    <TableContainer
                      component={Paper}
                       className='main-table'
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
                                    'center',
                                  paddingRight:
                                     "50px",
                                }}
                                className=' pdf-table pdf-table-head2' 
                                key={index}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "flex-end",
                                  }}
                                  className=' pdf-table pdf-table-head2' 
                                >
                                  {cell?.name}{" "}
                                  {cell?.name == "Date" && (
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
                                         className="pdf-hide"
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
                          {candidates?.map((item, index) => {
                            let sorteddata = item?.statuses.sort(
                              (a, b) => a.id - b.id
                            );
                            console.log(sorteddata);
                            return (
                              <Row
                                key={index}
                                sx={{
                                  border: "1px solid #EEEEEE !important",
                                }}
                              >

                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.visa_id + "_" + item?.serial_id}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {moment(item?.created_at).format(
                                    "MM-DD-YYYY"
                                  )}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.visa_request?.customer?.name}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.passport_number}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.name}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.visa_charges
                                    ? item?.visa_charges
                                    : "0"}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.visa_expiry
                                    ? moment(item?.visa_expiry).format(
                                      "MM-DD-YYYY"
                                    )
                                    : "-"}
                                </Cell>

                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"

                                >
                                  <Box
                                    component={"div"}
                                    sx={{
                                      cursor: "pointer",
                                      display: "flex !important",
                                      justifyContent: "flex-start !important",
                                    }}

                                  >
                                    <Box
                                     className="pdf-hide"
                                      component={"img"}
                                      src={
                                        sorteddata[sorteddata.length - 1]
                                          ?.status == "Medical"
                                          ? Images.blueCircle
                                          : sorteddata[sorteddata.length - 1]
                                            ?.status == "Stamping"
                                            ? Images.successIcon
                                            : sorteddata[sorteddata.length - 1]
                                              ?.status == "Emirates Id"
                                              ? Images.lightGreenCircle
                                              : sorteddata[sorteddata.length - 1]
                                                ?.status == "Entry permit"
                                                ? Images.pendingIcon
                                                : sorteddata[sorteddata.length - 1]
                                                  ?.status == "Change Status"
                                                  ? Images.pendingIcon
                                                  : Images.errorIcon
                                      }
                                      width={"13px"}
                                    ></Box>
                                    {sorteddata[sorteddata.length - 1]?.status}
                                  </Box>
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"

                                >
                                  <Box
                                    component={"div"}
                                    sx={{
                                      cursor: "pointer",
                                      display: "flex !important",
                                      justifyContent: "flex-start !important",
                                    }}

                                  >
                                    <Box
                                    className="pdf-hide"
                                      component={"img"}
                                      src={
                                        item?.approval_status == "Approved"
                                          ? Images.successIcon
                                          : item?.approval_status == "Reject"
                                            ? Images.successIcon : Images.errorIcon
                                      }
                                      width={"13px"}
                                    ></Box>
                                    {item?.approval_status}
                                  </Box>
                                </Cell>

                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  <Box>
                                    <Box
                                     className="pdf-hide"
                                      component={"img"}
                                      src={Images.detailIcon}
                                      onClick={() =>
                                        navigate(
                                          `/view-candidate-detail/${item?.id}`
                                        )
                                      }
                                      width={"35px"}
                                    ></Box>
                                  </Box>
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
                    // onPageSizeChange={(size) => getVisaRequestList(1, size.target.value)}/
                    tableCount={customerQueue?.length}
                    totalCount={totalCount}
                  // onPageChange={(page) => getVisaRequestList(page, "")}
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

export default CustomerViseReport;
