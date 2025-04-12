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

function CanceledVisaList() {
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
  const [cost, setCost] = useState(0)


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
    { name: "Visa Rate", key: "visa_rate" },
    { name: "Cancellation Rate", key: "visa_rate" },
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
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false);

  const DepositReversal = async (status) => {
    console.log(status,'status');
    
  
    try {
      let obj = {
       candidate_id:selectedVisa?.candidate?.id
      };

      const promise = VisaServices.DepositReversal(obj);
      console.log(promise);

     

     
    } catch (error) {
      console.log(error);
    }
  };

  // *For Get Customer Queue

  const UpdateStatus = async () => {
    console.log(getValues('date'));
    try {
      let obj = {
        status: status.id,
        id: selectedVisa?.id,
        candidate_id: selectedVisa?.candidate_id,
        visa_tenure: selectedVisa?.candidate?.visa_tenure,
        date: moment(getValues('date')).format('MM-DD-YYYY'),
        document: document
      };

      if(status?.id.toLowerCase() == "canceled"){
        obj.grace_period=getValues('grace')
      }

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
        getRenewList()
        setDocument('');
        setStatus(null)
        setValue("date", '');
        setValue("grace", '');
        setDate(null)
        if(status?.id == 'Canceled-Status Changed' || status?.id == 'Canceled-Exited' ){
          DepositReversal(status?.id)
        }
     
      }
    } catch (error) {
      console.log(error);
    }
  };
  const UpdateRequestStatus = async () => {
    try {
      let obj = {
        request_status: status.id ? "approved" : "rejected",
        id: selectedVisa?.id,
        candidate_id: selectedVisa?.candidate_id,
        type: selectedVisa?.type
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
        setStatus(null)
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
        id: selectedVisa?.id,
        customer_id: selectedVisa?.visa?.customer?.id,
        candidate_id: selectedVisa?.candidate_id,
        amount: formData?.amount,
      
        tax: selectedVisa?.additional_type == 'inside' ?  (parseFloat(selectedVisa?.visa?.customer?.cancellation_inside) * 0.05).toFixed(2) :  (parseFloat(selectedVisa?.visa?.customer?.cancellation_outside) * 0.05).toFixed(2) ,
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
        setDate(null)
        setPaymentType(null)
        setValue2('amount', '')
        setValue2('description', '')

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

  const getData = async (formData) => {
    setLoading(true)
    console.log(formData);
    try {
      let params = {
        charges_type: 'cost'

      }

      const { data } = await SystemServices.getRates(params);

      let details = data?.charges
      setCost(details?.overstay)
      setRates(data?.charges)
      console.log(details?.medical_extra);




    } catch (error) {

    } finally {
      setLoading(false);
    }
  }
  const getRenewList = async (page, limit, filter) => {
    // setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = filter ?  { ...filters, ...filter } : null
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      console.log('asasd');
      let params = {
        page: Page,
        limit: Limit,
        type: "Cancel",
        customer_id: user?.user_type == 'C' ? user?.customer_id : null,
      }
      params = { ...params, ...Filter }

      const { data } = await CustomerServices.VisaProcessing(params)
      console.log(data);

      console.log(data?.permissions, 'data?.permissions');

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
        onClose={() => { setRequestDialog(false); setStatus(null) }}
        title={"Change Status?"}
      >
        <Box component="form" onSubmit={handleSubmit3(UpdateRequestStatus)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <SelectField
                size={"small"}
                label={"Select Status :"}
                options={[
                  { id: true, name: "Approved" },
                  { id: false, name: "Rejected" },

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
                  onClick={() => { setRequestDialog(false); setStatus(null) }}
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
        onClose={() => { setStatusDialog(false); setStatus(null) }}
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
                  { id: "Canceled", name: "Canceled" },
                  { id: "Canceled-Exited", name: "Canceled-Exited" },
                  { id: "Canceled-Status Changed", name: "Canceled-Status Changed" },
                  { id: "Overstay", name: "Overstay" },
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
            {status?.id == 'Canceled' && <Grid item xs={12}>
              <InputField
                label={"Grace Period :*"}
                size={'small'}
                fullWidth={true}
                type={'number'}
                max={365}
                inputProps={{
                  max:365
                }}
                placeholder={"Grace Period"}
                error={errors?.grace?.message}
                register={register("grace", {
                  required:
                    "Please enter grace period."

                })}
              />
            </Grid>}
            <Grid item xs={12} sm={12}>
              <DatePicker
                label={"Date :"}
                value={date}
                size={"small"}
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
                  title="Yes,Confirm"
                  type="submit"
                />
                <PrimaryButton
                  onClick={() => { setStatusDialog(false); setStatus(null) }}
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
                  required: "Please enter  date.",
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
                  { id: "cheque", name: "Cheque" },

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
          Canceled Visa List
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
              onClick={() => {setFilters(''); setFromDate(null); setToDate(null); setValue('search');getRenewList(1, '', null)}}
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
                                    cell?.name == "VR No." ? "left" : "left",
                                  paddingRight:
                                    cell?.name == "VR No." ? "50px" : "50px",
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
                            let sorteddata = item?.statuses.sort((a, b) => a.id - b.id);
                            let daysDiff = moment().diff(sorteddata[sorteddata.length - 1]?.date ? sorteddata[sorteddata.length - 1]?.date : sorteddata[sorteddata.length - 1]?.created_at, 'days')
                            console.log(daysDiff);
                            console.log(sorteddata[sorteddata.length - 1]?.date);
                            let costDay = daysDiff - 30
                            console.log(costDay);
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
                                  {item?.candidate?.visa_charges}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.additional_type == 'inside' ? parseFloat(item?.visa?.customer?.cancellation_inside).toFixed(2)  : parseFloat(item?.visa?.customer?.cancellation_outside).toFixed(2)   }
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                   {item?.additional_type == 'inside' ?  (parseFloat(item?.visa?.customer?.cancellation_inside) * 0.05).toFixed(2)  :  (parseFloat(item?.visa?.customer?.cancellation_outside) * 0.05).toFixed(2)  }
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                  onClick={() => {
                                    if (permissions?.request_update) {
                                      if (item?.request_status == 'pending') {

                                        setRequestDialog(true);
                                        setSelectedVisa(item);
                                      }

                                    }
                                  }}
                                >
                                  <Box
                                    component={"div"}
                                    sx={{ cursor: "pointer", display: 'flex !important', justifyContent: 'flex-start !important' }}

                                  >
                                    <Box
                                      component={"img"}
                                      src={
                                        item?.request_status == "approved"
                                          ? Images.successIcon
                                          : item?.request_status == "pending" ? Images.pendingIcon : Images.errorIcon
                                      }
                                      width={"13px"}
                                    ></Box>
                                    {item?.request_status == "approved" ? 'Approved' : item?.request_status == "pending" ? 'Pending' : 'Rejected'}
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
                                      if (item?.payment_status != "paid" && item?.request_status?.toLowerCase() == "approved") {
                                        if (permissions?.payment_update) {
                                          if(item?.additional_type == 'inside'){
                                            console.log(item?.visa?.customer,'check');
                                            
                                            setValue2('amount', parseFloat(parseFloat(item?.visa?.customer?.cancellation_inside) + (parseFloat(item?.visa?.customer?.cancellation_inside) * 0.05)).toFixed(2))
                                          }
                                          else{
                                            console.log(item?.visa?.customer,'check');
                                            setValue2('amount', parseFloat(parseFloat(item?.visa?.customer?.cancellation_outside) + (parseFloat(item?.visa?.customer?.cancellation_outside) * 0.05)).toFixed(2))
                                          }
                                         
                                          setPaymentDialog(true);
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
                                      if (permissions?.status_update) {

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

                                    {permissions?.details && <Box component={'img'} src={Images.detailIcon} onClick={() => navigate(`/cancelled-detail/${item?.id}`)} width={'35px'}></Box>}
                                    {permissions?.invoice && <Box component={'img'} onClick={() => {

                                      if (permissions?.invoice) {

                                        navigate(`/cancel_invoice/${item?.id}`)
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

export default CanceledVisaList;
