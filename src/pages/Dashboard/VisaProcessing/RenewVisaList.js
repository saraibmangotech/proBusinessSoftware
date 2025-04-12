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
import UploadFile from 'components/UploadFile';
import { CleanTypes, getFileSize } from 'utils';
import instance from 'config/axios';
import routes from 'services/System/routes';
import UploadFileSingle from "components/UploadFileSingle";
import { useAuth } from "context/UseContext";
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
  const {
    register: register3,
    handleSubmit: handleSubmit3,
    setValue: setValue3,
    getValues: getValues3,
    formState: { errors: errors3 },
  } = useForm();
  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [uploadedSize, setUploadedSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [slipDetail, setSlipDetail] = useState([]);
  const [document, setDocument] = useState(null);
  const [requestDialog, setRequestDialog] = useState(false)


  const allowFilesType = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const tableHead = [
    { name: "VR No.", key: "" },
    { name: "Date", key: "created_at" },
    { name: "Customer", key: "created_at" },
    { name: "Candidate Name", key: "created_at" },
    { name: "Fee", key: "visa_rate" },
    { name: "VAT", key: "visa_rate" },
    { name: "Request Status", key: "" },
    { name: "Payment Status", key: "" },
    { name: "Status", key: "" },
    { name: "Actions", key: "" },

  ];
  //   state for visaprocessing use it later saraib
  //  const [renewVisas, setrenewVisas] = useState([])
  const [renewVisas, setRenewVisas] = useState([])
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
        // Add the current date before the file name to ensure uniqueness
        const currentDate = new Date().toISOString().split('T')[0]; // e.g., "2024-08-23"
        const uniqueFileName = `${currentDate}_${file.name}`;

        // Create a new file with the date-prefixed name
        const newFile = new File([file], uniqueFileName, { type: file.type });

        // Upload the file with the new name
        const path = await handleUpload(newFile, arr);

        console.log('Uploaded file path:', path);
        console.log(path, 'pathpathpath');

        // Clear the file input after processing
        e.target.value = "";

        return path;
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
  const { user, userLogout } = useAuth();
  const [rates, setRates] = useState()
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false);

  // *For Get Customer Queue

  const UpdateStatus = async () => {
    console.log(selectedVisa?.candidate, 'selectedVisa');
    let filteredDoc = selectedVisa?.candidate?.documents.filter((item => item?.is_required))
    console.log(filteredDoc);

    const allHavePath = filteredDoc.length > 0 ? filteredDoc?.every(doc => doc.path && doc.path.trim() !== "") : false;

    // Step 3: Log the result
    console.log(allHavePath);
    console.log(moment().add(6, 'months').startOf('day').format('MM-DD-YYYY'));
    console.log(moment().add(6, 'months').startOf('day').format('MM-DD-YYYY') < moment(selectedVisa?.candidate?.passport_expiry).startOf('day').format('MM-DD-YYYY'));

    if ((status?.id == 'Renewed' && !allHavePath) || (status?.id == 'Renewed' && moment().add(6, 'months').startOf('day') > moment(selectedVisa?.candidate?.passport_expiry).startOf('day'))) {
      showErrorToast((moment().add(6, 'months').startOf('day') > moment(selectedVisa?.candidate?.passport_expiry).startOf('day')) ? 'Passport Expired' : 'Candidate Document Missing')
    }
    else {
      setButtonDisabled(true)
      try {
        let obj = {
          status: status.id,
          id: selectedVisa?.id,
          candidate_id: selectedVisa?.candidate_id,
          visa_expiry: moment(selectedVisa?.candidate?.visa_expiry).format('MM-DD-YYYY'),
          visa_tenure: selectedVisa?.candidate?.visa_tenure,
          date: moment(getValues('date')).format('MM-DD-YYYY'),
          document: document
        };

        const promise = VisaServices.UpdateVisaProcessingStatus(obj);
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
          setButtonDisabled(false)
          getRenewList()

        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  const UpdateRequestStatus = async () => {
    try {
      let obj = {
        request_status: status.id,
        id: selectedVisa?.id,
      };

      const promise = VisaServices.UpdateRequestStatus(obj);
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
        setRequestDialog(false);
        getRenewList()
      }
    } catch (error) {
      console.log(error);
    }
  };


  const handleDate2 = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setFromDate("invalid");
        return;
      }
      setFromDate(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };
  const handleDate3 = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setToDate("invalid");
        return;
      }
      setToDate(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };
  const UpdatePaymentStatus = async (formData) => {

    try {
      let obj = {
        payment_date: date,
        customer_id: selectedVisa?.visa?.customer?.id,
        payment_type: paymentType?.name,
        candidate_id: selectedVisa?.candidate_id,
        id: selectedVisa?.id,
        amount: formData?.amount,
        tax: selectedVisa?.candidate?.visa_tenure?.includes('1') ? parseFloat((parseFloat(selectedVisa?.visa?.customer?.one_year_renewal) * 0.05)).toFixed(2) : parseFloat((parseFloat(selectedVisa?.visa?.customer?.two_year_renewal) * 0.05)),
        bank_id: selectedBank?.id,
        description: formData?.description,
      };

      const promise = VisaServices.updateProcessingPaymentStatus(obj);
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
        getRenewList()
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
  const getRenewList = async (page, limit, filter) => {
    // setLoader(true)
    console.log(filter);

    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = filter ? { ...filters, ...filter } : ''
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      console.log('asasd');
      let params = {
        page: Page,
        limit: Limit,
        type: "Renew",
        customer_id: user?.user_type == 'C' ? user?.customer_id : null,
      }
      params = { ...params, ...Filter }

      const { data } = await CustomerServices.VisaProcessing(params)
      console.log(data);

      console.log(formatPermissionData(data?.permissions))
      setPermissions(formatPermissionData(data?.permissions))
      data?.permissions.forEach(e => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      })
      setRenewVisas(data?.rows)
      setTotalCount(data?.count)
    } catch (error) {
      showErrorToast(error)
    } finally {
      // setLoader(false)
    }
  }

  const getData = async (formData) => {
    setLoading(true)
    console.log(formData);
    try {
      let params = {
        charges_type: 'rate'

      }

      const { data } = await SystemServices.getRates(params);


      setRates(data?.charges)




    } catch (error) {

    } finally {
      setLoading(false);
    }
  }

  const getBanks = async (page, limit, filter) => {
    // setLoader(true)
    try {





      const { data } = await SystemServices.getBanks()

      setBanks(data?.banks)
    } catch (error) {
      showErrorToast(error)
    } finally {
      // setLoader(false)
    }
  }
  // *For Handle Filter
  const handleFilter = () => {
    let data = {
      search: getValues("search"),
      from_date: fromDate,
      to_date: toDate
    };
    Debounce(() => getRenewList(1, '', data));
  };

  const handleSort = (key) => {
    let data = {
      sort_by: key,
      sort_order: sort,
    };
    Debounce(() => getRenewList(1, '', data));
  };
  useEffect(() => {
    getRenewList()
    getBanks()
    getData()

  }, [])


  return (
    <Box sx={{ p: 3 }}>
      <SimpleDialog
        open={requestDialog}
        onClose={() => setRequestDialog(false)}
        title={"Change Status?"}
      >
        <Box component="form" onSubmit={handleSubmit3(UpdateRequestStatus)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <SelectField
                size={"small"}
                label={"Select Status :"}
                options={[
                  { id: 'Approved', name: "Approved" },
                  { id: 'Rejected', name: "Rejected" },

                ]}
                selected={status}
                onSelect={(value) => {
                  setStatus(value);
                }}
                error={errors3?.status?.message}
                register={register3("status", {
                  required: "Please select status.",
                })}
              />
            </Grid>
            {/* <Grid item xs={12} sm={12}>
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
            <Grid item xs={12}>
              <Box sx={{ fontWeight: "bold" }}>Upload Document:</Box>
              <UploadFile
                Memo={true}
                accept={allowFilesType}
                error={errors?.document?.message}

                file={document}
                register={register("document", {
                  required: false,
                  onChange: async (e) => {
                    const path = await handleUploadDocument(e);
                    if (path) {
                      setDocument(path);
                    }
                  }
                })}
              />
              <Box sx={{ fontSize: "11px", marginTop: "-12px" }}>(Max File 25MB)</Box>
            </Grid> */}
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
                  onClick={() => { setRequestDialog(false) }}
                  bgcolor={"#FF1F25"}
                  title="No,Cancel"
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
      <SimpleDialog
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
                  { id: "In Process", name: "In Process" },
                  { id: "Pending", name: "Pending" },
                  { id: "Renewed", name: "Renewed" },
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
                disableFuture={true}
                error={errors?.date?.message}
                register={register("date", {
                  required: "Please enter  date.",
                })}
                onChange={(date) => {
                  handleDate(date);
                  setValue("date", date);
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ fontWeight: "bold" }}>Upload Document:</Box>
              <UploadFileSingle
                Memo={true}
                accept={allowFilesType}
                error={errors?.document?.message}

                file={document}
                register={register("document", {
                  required: false,
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
                  disabled={buttonDisabled}
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
      </SimpleDialog>
      <SimpleDialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        title={"Change Payment Status?"}
      >
        <Box component="form" onSubmit={handleSubmit2(UpdatePaymentStatus)}>
          <Grid container>
            <Grid item xs={12} sm={12}>
              <DatePicker
                label={"Payment Date :"}
                value={date}
                size={"small"}
                error={errors2?.date?.message}
                register={register2("date", {
                  required: date ? false : "Please enter  date.",
                })}
                onChange={(date) => {
                  handleDate(date);
                  setValue2("date", date);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <SelectField
                size={"small"}
                label={"Payment Type :"}
                options={[
                  { id: "cash", name: "Cash" },
                  { id: "bank", name: "Bank" },
                  // { id: "cheque", name: "Cheque" },

                ]}
                selected={paymentType}
                onSelect={(value) => {
                  setPaymentType(value);
                }}
                error={errors2?.status?.message}
                register={register2("status", {
                  required: "Please select status.",
                })}
              />
            </Grid>
            {/* <Grid item xs={12} sm={12}>
              <SelectField
                size={"small"}
                label={"Bank :"}
                options={banks}
                selected={selectedBank}
                onSelect={(value) => {
                  setSelectedBank(value);
                }}
                error={errors2?.banks?.message}
                register={register2("bank", {
                  required: "Please select bank.",
                })}
              />
            </Grid> */}
            <Grid item xs={12} sm={12}>
              <LabelCustomInput
                label={"Amount : "}
                StartLabel={"AED"}
                disabled={true}
                register={register2("amount", {
                  required: "Enter year inside rate",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12} mt={2}>
              <InputField
                label={"Description :"}
                size={"small"}
                rows={5}
                multiline={true}
                placeholder={"Description"}
                error={errors2?.description?.message}
                register={register2("description", {
                  required: false,
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
                  title="Yes,Confirm"
                  type="submit"
                />
                <PrimaryButton
                  onClick={() => setPaymentDialog(false)}
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
          Renewed Visa List
        </Typography>
      </Box>

      {/* Filters */}
      <Box>
        <Grid container spacing={2} alignItems={'center'}>
          <Grid item xs={3} mt={1}>
            <InputField
              label={"Search :"}
              size={'small'}
              fullWidth={true}
              placeholder={"Search"}
              error={errors?.search?.message}
              register={register("search")}
            />
          </Grid>
          <Grid item xs={3}>
            <DatePicker
              label={" From Date  :"}
              value={fromDate}

              size={'small'}
              maxDate={new Date()}
              error={errors?.fromDate?.message}
              register={register("fromDate")}
              onChange={(date) => {
                handleDate2(date)
                setValue('fromDate', date)
              }

              }
            />
          </Grid>
          <Grid item xs={3}>
            <DatePicker
              label={" To Date  :"}
              value={toDate}
              maxDate={new Date()}
              size={'small'}
              minDate={new Date(fromDate)}
              error={errors?.toDate?.message}
              register={register("toDate")}
              onChange={(date) => {
                handleDate3(date)
                setValue('toDate', date)
              }

              }
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
          <Grid
            item
            xs={2}
            display={"flex"}
            justifyContent={"flex-end"}
            gap={2}
            mt={2.5}
          >
            <PrimaryButton
              bgcolor={"#0076bf"}
              textcolor={Colors.white}
              // border={`1px solid ${Colors.primary}`}
              title="Reset"
              onClick={() => { setFilters(''); setFromDate(null); setToDate(null); setValue('search'); getRenewList(1, '', null) }}
              loading={loading}
            />
            <PrimaryButton
              bgcolor={Colors.buttonBg}
              title="Search"
              onClick={() => handleFilter()}
              loading={loading}
            />
          </Grid>
        </Grid>

        <Grid item md={11}>
          {renewVisas?.length > 0 && (
            <Box>
              <Grid container mb={2}></Grid>

              {renewVisas && (
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
                                    cell?.name == "VR No." ? "center" : "left",
                                  paddingRight:
                                    cell?.name == "VR No." ? "15px" : "50px",
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
                          {renewVisas?.map((item, index) => {
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
                                  {item?.candidate?.visa_id + "_" + item?.candidate?.serial_id}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {moment(item?.created_at).format('MM-DD-YYYY')}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.visa?.customer?.name}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.candidate?.name}
                                </Cell>

                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.candidate?.visa_tenure?.includes('1') ? parseFloat((parseFloat(item?.visa?.customer?.one_year_renewal))).toFixed(2) : parseFloat((parseFloat(item?.visa?.customer?.two_year_renewal))).toFixed(2)}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.candidate?.visa_tenure?.includes('1') ? parseFloat((parseFloat(item?.visa?.customer?.one_year_renewal) * 0.05)).toFixed(2) : parseFloat((parseFloat(item?.visa?.customer?.two_year_renewal) * 0.05)).toFixed(2)}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  <Box
                                    component={"div"}
                                    sx={{ cursor: "pointer", display: 'flex !important', justifyContent: 'flex-start !important' }}
                                    onClick={() => {
                                      if (permissions?.request_update) {
                                        setStatus({ id: item?.request_status, name: item?.request_status })
                                        setRequestDialog(true);
                                        setSelectedVisa(item);
                                      }
                                    }}
                                  >
                                    <Box
                                      component={"img"}
                                      src={
                                        item?.request_status == "Approved"
                                          ? Images.successIcon
                                          : Images.errorIcon
                                      }
                                      width={"13px"}
                                    ></Box>
                                    {item?.request_status == "Approved" ? 'Approved' : item?.request_status == "pending" ? "Pending" : 'Rejected'}
                                  </Box>
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  <Box
                                    component={"div"}
                                    sx={{ cursor: "pointer", display: 'flex !important', justifyContent: 'flex-start !important' }}
                                    onClick={() => {
                                      if (item?.payment_status != "paid" && item?.request_status == "Approved") {
                                        if (permissions?.payment_update) {

                                          setPaymentDialog(true);

                                          setValue2('amount', item?.candidate?.visa_tenure?.includes('1') ? parseFloat((parseFloat(item?.visa?.customer?.one_year_renewal) * 0.05) + parseFloat(item?.visa?.customer?.one_year_renewal)).toFixed(2) : parseFloat((parseFloat(item?.visa?.customer?.two_year_renewal) * 0.05) + parseFloat(item?.visa?.customer?.two_year_renewal)).toFixed(2))


                                          setSelectedVisa(item);
                                        }
                                      }

                                    }}
                                  >
                                    <Box
                                      component={"img"}
                                      src={
                                        item?.payment_status == "paid"
                                          ? Images.successIcon
                                          : Images.errorIcon
                                      }
                                      width={"13px"}
                                    ></Box>
                                    {item?.payment_status == "paid" ? "Paid" : 'Unpaid'}
                                  </Box>
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  <Box
                                    component={"div"}
                                    sx={{ cursor: "pointer", display: 'flex !important', justifyContent: 'flex-start !important' }}
                                    onClick={() => {
                                      setDate(null)
                                      setStatus(null)
                                      setDocument(null)
                                      if (permissions?.status_update && item?.statuses[item?.statuses.length - 1].status != "Renewed") {

                                        setStatus({ id: item?.statuses[item?.statuses.length - 1].status, name: item?.statuses[item?.statuses.length - 1].status })
                                        setStatusDialog(true);
                                        setSelectedVisa(item);
                                      }
                                    }}
                                  >
                                    <Box
                                      component={"img"}
                                      src={
                                        item?.statuses[item?.statuses.length - 1].status == "In Process"
                                          ? Images.pendingIcon
                                          : item?.statuses[item?.statuses.length - 1].status == "Renewed" ?
                                            Images.successIcon : Images.orangeCircle
                                      }
                                      width={"13px"}
                                    ></Box>
                                    {item?.statuses[item?.statuses.length - 1].status}
                                  </Box>
                                </Cell>
                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                  <Box>

                                    {permissions?.details && <Box component={'img'} src={Images.detailIcon} onClick={() => navigate(`/renewed-detail/${item?.id}`)} width={'35px'}></Box>}
                                    {permissions?.invoice && <Box component={'img'} onClick={() => {

                                      if (permissions?.invoice) {

                                        navigate(`/renew-invoice/${item?.id}`)
                                      }


                                    }} sx={{ cursor: "pointer" }} src={Images.invoiceIcon} width={'35px'}></Box>}
                                    {/* <Box component={'img'} src={Images.deleteIcon} width={'35px'}></Box>  */}
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
                    onPageSizeChange={(size) => getRenewList(1, size.target.value,filters)}
                    tableCount={customerQueue?.length}
                    totalCount={totalCount}
                    onPageChange={(page) => getRenewList(page, "",filters)}
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
