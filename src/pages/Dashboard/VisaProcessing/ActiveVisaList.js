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
  TextField,
  Button,
  Radio,
  FormLabel,
  RadioGroup,
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
import { useLocation, useNavigate } from "react-router-dom";
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
import { Controller, useForm } from "react-hook-form";
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
import VisaServices from "services/Visa";
import DatePicker from "components/DatePicker";
import SystemServices from "services/System";
import UploadFile from "components/UploadFile";
import { CleanTypes, getFileSize } from 'utils';
import instance from 'config/axios';
import routes from 'services/System/routes';
import UploadFileSingle from "components/UploadFileSingle";
import { useAuth } from "context/UseContext";


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
    padding: "12px !important",
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

function VisaList() {
  const { state } = useLocation()
  const {
    register,
    handleSubmit,
    getValues,
    control,
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
  const [activaVisaDialog, setActiveVisaDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [selectedValue, setSelectedValue] = useState("inside");

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const tableHead = [
    ...(isClicked ? [{ name: "Select", key: "" }] : []),
    { name: "VR No.", key: "" },
    { name: "Date", key: "created_at" },
    { name: "Customer", key: "created_at" },
    { name: "Passport Number", key: "created_at" },
    { name: "Candidate Name", key: "candidate_name" },
    { name: "Visa Rate", key: "visa_rate" },
    { name: "Visa Expiry", key: "visa_expiry" },

    { name: "Status", key: "" },
    { name: "Action", key: "" },

  ];
  //   state for visaprocessing use it later saraib
  const [candidates, setCandidates] = useState([])

  const allowFilesType = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];


  const [loader, setLoader] = useState(false);

  const [sort, setSort] = useState("asc");

  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)

  // *For setPermissions
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVisa, setSelectedVisa] = useState(null);
  const { user, userLogout } = useAuth();
  const [itemAmount, setItemAmount] = useState();
  const [status, setStatus] = useState();
  const [date, setDate] = useState(null);
  const [paymentType, setPaymentType] = useState(null);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [buttonValue, setButtonValue] = useState("");
  const [uploadedSize, setUploadedSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [slipDetail, setSlipDetail] = useState([]);
  const [document, setDocument] = useState(null);
  const [cost, setCost] = useState(0)

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleRadioChange = (item) => {
    console.log(item);
    setSelectedItem(item);
  };



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

  // *For Get Customer Queue
  const getCustomerQueue = async (page, limit, filter) => {
    setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit

      setCurrentPage(Page)
      setPageLimit(Limit)

      let params = {
        page: 1,
        limit: 1000,


      }

      const { data } = await CustomerServices.getCustomerQueue(params)
      setCustomerQueue(data?.rows)

    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoader(false)
    }
  }

  const updateActiveVisa = async () => {
    try {
      let obj = {
        type: buttonValue,
        candidate_id: selectedItem?.id,
        visa_id: selectedItem?.visa_id,
        additional_type: selectedValue,
        document: document,
        date: new Date()
      };
      console.log(obj);

      const promise = VisaServices.visaProcessingAdd(obj);


      showPromiseToast(
        promise,
        'Saving...',
        'Added Successfully',
        'Something Went Wrong'
      );

      // Await the promise and then check its response
      const response = await promise;
      if (response?.responseCode === 200) {
        setActiveVisaDialog(false);
        getVisaRequestList();
        setDocument('')
        setButtonValue('')
        setIsClicked(false)
        setSelectedItem(null)
      }
    }
    catch (error) {
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
      customer_id: selectedCustomer?.id,
      expiry_status: selectedStatus?.id,
    };
    getVisaRequestList(1, '', data)
  };

  const getVisaRequestList = async (page, limit, filter) => {
    // setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = { ...filters, ...filter };
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)

      let params = {
        page: Page,
        limit: Limit,
        visa_status: 'active',
        customer_id: user?.user_type == 'C' ? user?.customer_id : null,
      }
      params = { ...params, ...Filter }
      console.log(params, 'params');

      const { data } = await CustomerServices.getCandidateLists(params)
      setCandidates(data?.rows)

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


  const handleSort = (key) => {
    let data = {
      sort_by: key,
      sort_order: sort,
    };
    // Debounce(() => getVisaRequestList(1, '', data));
  };
  const CustomCheckbox = styled(Checkbox)(({ theme }) => ({
    "& .MuiSvgIcon-root": {
      display: "none", // Hide the default check icon
    },
    "&.Mui-checked": {
      // This class applies when the checkbox is checked
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: "3px", // Adjust this value to control top padding
        left: "3px", // Adjust this value to control left padding
        width: "calc(100% - 6px)", // Adjust this value to control width
        height: "calc(100% - 6px)", // Adjust this value to control height
        backgroundColor: Colors.primary, // Background color when checked
        borderRadius: "4px", // Ensure border-radius matches checkbox
      },
    },

    width: 20, // Set the width of the checkbox
    height: 20, // Set the height of the checkbox
    borderRadius: 4, // Border-radius for the checkbox
    border: "1px solid grey", // Border for the checkbox
    position: "relative", // Ensure that the pseudo-element positions correctly
  }));
  const handleClick = (value) => {
    setIsClicked(true);
    // Handle the value as needed, for example:
    console.log(value);
    // Or set a state or call another function with the value
    setButtonValue(value);
  };

  const handleUploadDocument = async (e) => {
    try {
      const inputElement = e.target; // Store a reference to the file input element
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
        let maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
          showErrorToast('File Size Must Be Less than 10 MB')
        }
        else {
          const currentDate = new Date().toISOString().split('T')[0]; // e.g., "2024-08-23"
          const uniqueFileName = `${currentDate}_${file.name}`;

          // Create a new file with the date-prefixed name
          const newFile = new File([file], uniqueFileName, { type: file.type });


          const path = await handleUpload(newFile, arr);
          console.log('Uploaded file path:', path);
          console.log(path, 'pathpathpath');
          // Clear the file input after processing
          inputElement.value = "";
          setDocument('')
          return path
        }
      } else {
        ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`);
      }
    } catch (error) {
      ErrorToaster(error);
    }
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
        console.log(data, 'asddasasd');
        return data?.data?.path

      }
    } catch (error) {
      ErrorToaster(error);
    }
  };
  useEffect(() => {

    getCustomerQueue()
    if (state) {
      let data = {

        expiry_status: state,
      };
      getVisaRequestList(1, '', data)
    }
    else {
      getVisaRequestList()
    }
  }, [])

  return (
    <Box sx={{ p: 3 }}>
      {/* <SimpleDialog
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
                options={[
                  { id: false, name: "rejected" },
                  { id: true, name: "approved" },
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
            <Grid item xs={12} sm={12}>
              <DatePicker
                label={"Date :"}
                value={date}
                size={"small"}
                error={errors2?.date?.message}
                register={register2("date", {
                  required: "Please enter  date.",
                })}
                onChange={(date) => {
                  handleDate(date);
                  setValue2("date", date);
                }}
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
      </SimpleDialog> */}
      <SimpleDialog
        open={activaVisaDialog}
        onClose={() => { setActiveVisaDialog(false); setDocument('') }}
        title={buttonValue + " " + "Visa"}
      >
        {buttonValue == 'Absconder' && <Box sx={{ textAlign: 'center' }}>Please deliver original passport of the candidate to MABDE office to process absconder request</Box>}
        <Box component="form" onSubmit={handleSubmit(updateActiveVisa)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} mt={buttonValue == 'Absconder' ? 4 : ''}>
              { buttonValue == 'Cancel' && <FormControl component="fieldset">
                <Box sx={{ fontWeight: "bold" }}>Type</Box>
                <RadioGroup
                  row
                  value={selectedValue}
                  onChange={handleChange}
                  name="type-options"
                >
                  <FormControlLabel
                    value="inside"
                    control={<Radio />}
                    label="Inside"
                  />
                  <FormControlLabel
                    value="outside"
                    control={<Radio />}
                    label="Outside"
                  />
                </RadioGroup>
              </FormControl>}
              <Box sx={{ fontWeight: "bold",mt:2 }}>{buttonValue == 'Absconder' ? 'Upload Document:' : 'Upload Document : *'}</Box>
              <UploadFileSingle
                Memo={true}
                accept={allowFilesType}
                error={errors?.document?.message}

                file={document}
                register={register("document", {
                  required: (document || buttonValue == 'Absconder') ? false : 'please upload doc',
                  onChange: async (e) => {
                    const path = await handleUploadDocument(e);
                    if (path) {
                      setDocument(path);
                    }
                  }
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
                  disabled={buttonValue == 'Absconder' ? false : !document}
                  title="Yes,Confirm"
                  type="submit"

                />
                <PrimaryButton
                  onClick={() => { setActiveVisaDialog(false); setDocument('') }}
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
          Active Visa List
        </Typography>
        <Box sx={{ display: "flex", gap: "10px" }}>
          {isClicked == true ? (
            <>
              {
                <Button
                  sx={{
                    border: `2px solid ${Colors.primary}`,
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: Colors.primary,
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={() => { setIsClicked(false); setSelectedItem(null) }}
                >
                  Cancel
                </Button>}
              {selectedItem && <Button
                sx={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: Colors.white,
                  display: "flex",
                  background: Colors.primary,
                  alignItems: "center",
                  "&:hover": {
                    background: Colors.primary,
                  }
                }}
                onClick={() => setActiveVisaDialog(true)}
              >
                Next
              </Button>}
            </>
          ) : (
            <>
              {permissions?.renew && <Button
                sx={{
                  border: `2px solid ${Colors.green}`,
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: Colors.green,
                  backgroundColor: Colors.lightGreen,
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={() => handleClick('Renew')}
              >
                Renew
              </Button>}

              {permissions?.cancel && <Button
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
                onClick={() => handleClick('Cancel')}
              >
                Cancel
              </Button>}

              {permissions?.absconder && <Button
                sx={{
                  border: `2px solid ${Colors.orange}`,
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: Colors.orange,
                  backgroundColor: Colors.lightOrange,
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={() => handleClick('Absconder')}
              >
                Absconder
              </Button>}
            </>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Box>
        <Grid container spacing={2} alignItems={'center'}>
          <Grid item xs={3}>
            <InputField
              label={"Search :"}
              size={'small'}
              fullWidth={true}
              placeholder={"Search"}
              error={errors?.search?.message}
              register={register("search")}
            />
          </Grid>
          {user?.user_type != 'C' && <Grid item xs={3} >
            <SelectField
              size={'small'}
              label={'Select Customer :'}

              options={customerQueue}
              selected={selectedCustomer}
              onSelect={(value) => {
                setSelectedCustomer(value)


              }}
              error={errors?.customer?.message}
              register={register("customer")}
            />
          </Grid>}
          <Grid item xs={3} >
            <SelectField
              size={'small'}
              label={'Select Status :'}

              options={[{ id: 'Valid', name: 'Valid' }, { id: 'Near Expiry', name: 'Near Expiry' }, { id: 'Expired', name: 'Expired' }]}
              selected={selectedStatus}
              onSelect={(value) => {
                setSelectedStatus(value)

              }}
              error={errors?.status?.message}
              register={register("status")}
            />
          </Grid>

          <Grid
            item
            xs={2}
            display={"flex"}
            justifyContent={"flex-end"}
            gap={2}
            mt={2}
          >
            <PrimaryButton
              bgcolor={"#0076bf"}
              textcolor={Colors.white}
              // border={`1px solid ${Colors.primary}`}
              title="Reset"
              onClick={() => {

                setValue('search', ''); setSelectedStatus(null); setSelectedCustomer(null)
                getVisaRequestList();
              }}
              loading={loading}
            />
            <PrimaryButton
             bgcolor={'#bd9b4a'}
              title="Search"
              onClick={() => handleFilter()}
              loading={loading}
            />
          </Grid>
        </Grid>

        <Grid item md={11}>
          {candidates && (
            <Box>
              <Grid container mb={2}></Grid>

              {candidates && (
                <Fragment>
                  <PDFExport
                    ref={contentRef}
                    landscape={true}
                    paperSize="A4"
                    margin={5}
                    fileName="Import Customers"
                  >
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
                          {candidates?.map((item, index) => {
                            return (
                              <Row
                                key={index}
                                sx={{
                                  border: "1px solid #EEEEEE !important",
                                }}
                              >
                                {isClicked && (
                                  <Cell
                                    sx={{
                                      textAlign: "center",
                                      span: {
                                        padding: "8px",
                                        width: "22px !important",
                                        height: "23px !important",
                                      },
                                    }}
                                    className="pdf-table"
                                  >
                                    <input
                                      disabled={buttonValue == 'Renew' && !moment().add("2", "months").startOf("day").isAfter(moment(item.visa_expiry).startOf("day"))}
                                      type="radio"
                                      checked={selectedItem?.id === item?.id}
                                      onChange={() => handleRadioChange(item)}
                                      style={{ cursor: 'pointer' }}
                                    />
                                  </Cell>
                                )}
                                <Cell style={{ textAlign: "left" }} className="pdf-table">
                                  {item?.visa_id + '_' + item?.serial_id}
                                </Cell>
                                <Cell style={{ textAlign: "left" }} className="pdf-table">
                                  {moment(item?.created_at).format("MM-DD-YYYY")}
                                </Cell>
                                <Cell style={{ textAlign: "left" }} className="pdf-table">
                                  {item?.visa_request?.customer?.name}
                                </Cell>
                                <Cell style={{ textAlign: "left" }} className="pdf-table">
                                  {item?.passport_number}
                                </Cell>
                                <Cell style={{ textAlign: "left" }} className="pdf-table">
                                  {item?.name}
                                </Cell>
                                <Cell style={{ textAlign: "left" }} className="pdf-table">
                                  {item?.visa_charges ? item?.visa_charges : '0'}
                                </Cell>
                                <Cell style={{ textAlign: "left" }} className="pdf-table">
                                  {item?.visa_expiry ? moment(item?.visa_expiry).format("MM-DD-YYYY") : '-'}
                                </Cell>




                                <Cell style={{ textAlign: "left" }} className="pdf-table">
                                  <Box sx={{ display: 'flex !important', justifyContent: 'flex-start !important' }}>
                                    <Box component={'img'} src={moment().isAfter(moment(item.visa_expiry)) ? Images?.errorIcon : Images.successIcon} width={'15px'}></Box>
                                    {moment().isAfter(moment(item.visa_expiry)) ? 'Expired' : 'Valid'}

                                  </Box>
                                </Cell>
                                <Cell style={{ textAlign: "left" }} className="pdf-table">
                                  <Box>
                                    {<Box component={'img'} src={Images.detailIcon} onClick={() => navigate(`/view-candidate-detail/${item?.id}`)} width={'35px'}></Box>}

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
                    onPageSizeChange={(size) => getVisaRequestList(1, size.target.value)}
                    tableCount={customerQueue?.length}
                    totalCount={totalCount}
                    onPageChange={(page) => getVisaRequestList(page, "")}
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

export default VisaList;
