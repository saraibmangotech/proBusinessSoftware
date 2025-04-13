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
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  RadioGroup,
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
import UploadFile from "components/UploadFile";
import { CleanTypes, getFileSize } from "utils";
import instance from "config/axios";
import routes from "services/System/routes";
import UploadFileSingle from "components/UploadFileSingle";
import { useAuth } from "context/UseContext";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { addDays, addMonths } from "date-fns";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SummarizeIcon from "@mui/icons-material/Summarize";
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
    watch,
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
  const {
    register: register4,
    handleSubmit: handleSubmit4,
    setValue: setValue4,

    getValues: getValues4,
    formState: { errors: errors4 },
  } = useForm();
  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [activaVisaDialog, setActiveVisaDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [dateDialog, setDateDialog] = useState(null);
  const [reasonDialog, setReasonDialog] = useState(false);
  const [charges, setCharges] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const docRef = useRef(null);
  const [visaType, setVisaType] = useState("In");
  const [visaTenture, setVisaTenture] = useState("1 year");

  const tableHead = [
    ...(isClicked ? [{ name: "Select", key: "" }] : []),
    { name: "VR No.", key: "" },
    { name: "Date", key: "created_at" },
    { name: "Customer", key: "created_at" },
    { name: "Passport # ", key: "candidate_name" },
    { name: "Candidate Name", key: "candidate_name" },
    { name: "Visa Rate", key: "visa_rate" },

    { name: "Visa Type", key: "visa_type" },
    { name: "Status", key: "" },

    { name: "CS/EP Date", key: "" },
    { name: "Action", key: "" },
  ];
  //   state for visaprocessing use it later saraib
  const [candidates, setCandidates] = useState([]);

  const allowFilesType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "application/pdf",
    "application/vnd.ms-excel",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const [loader, setLoader] = useState(false);

  const [sort, setSort] = useState("asc");

  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([]);

  // *For setPermissions
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVisa, setSelectedVisa] = useState(null);
  const { user, userLogout } = useAuth();
  const [itemAmount, setItemAmount] = useState();
  const [status, setStatus] = useState();
  const [date, setDate] = useState(null);
  const [date2, setDate2] = useState(null);
  const [paymentType, setPaymentType] = useState(null);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [buttonValue, setButtonValue] = useState("");
  const [uploadedSize, setUploadedSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [slipDetail, setSlipDetail] = useState([]);
  const [document, setDocument] = useState(null);
  const [fitnessDocument, setFitnessDocument] = useState(null);
  const [cost, setCost] = useState(0);
  const [statuses, setStatuses] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [disabledButton, setDisabledButton] = useState(false);
  const [reason, setReason] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [open, setOpen] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [vipMedicalCheck, setVipMedicalCheck] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [passPortNo, setPassPortNo] = useState(null);
  const [customers2, setCustomers2] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [cancelStatus, setCancelStatus] = useState(false)

  const [documents, setDocuments] = useState([
    {
      name: "Employee Undertaking",
      key: "undertaking",
      path: "",
      expiry_date: null,
      is_required: true,
    },
    {
      name: "Company Undertaking",
      key: "cundertaking",
      path: "",
      expiry_date: null,
      is_required: true,
    },

    {
      name: "Passport Copy",
      key: "passportcopy",
      path: "",
      expiry_date: null,
      is_required: true,
    },
    {
      name: "Digital Photo",
      key: "digitalphoto",
      path: "",
      expiry_date: null,
      is_required: true,
    },
    {
      name: "Employment Contract",
      key: "contract",
      path: "",
      expiry_date: null,
      is_required: true,
    },
    {
      name: "Offer Letter",
      key: "offerletter",
      path: "",
      expiry_date: null,
      is_required: true,
    },
    {
      name: "Previous Emirates Ids",
      key: "emiratesids",
      path: "",
      expiry_date: null,
      is_required: false,
    },
    {
      name: "Previous UAE Visa Copy",
      key: "uaevisa",
      path: "",
      expiry_date: null,
      is_required: false,
    },
    {
      name: "Cancellation",
      key: "cancellation",
      path: "",
      expiry_date: null,
      is_required: false,
    },
    {
      name: "UAE Driving License",
      key: "drivinglicense",
      path: "",
      expiry_date: null,
      is_required: false,
    },
    {
      name: "Work Permit",
      key: "workpermit",
      path: "",
      expiry_date: null,
      is_required: false,
    },
    {
      name: "Other Documents",
      key: "otherdoc",
      path: "",
      expiry_date: null,
      is_required: false,
    },
  ]);

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleRadioChange = (item) => {
    setSelectedItem(item);
  };
  const DepositReversal = async (status) => {
    console.log(status,'status');
    
  
    try {
      let obj = {
       candidate_id:selectedVisa?.id
      };

      const promise = VisaServices.DepositReversal(obj);
      console.log(promise);

     

     
    } catch (error) {
      console.log(error);
    }
  };
  // *For Get Customer Queue

  const UpdateStatus = async () => {
    setDisabled(true);
    setStatusDialog(false);
    try {
      let obj = {
        id: selectedVisa?.id,
        candidate_name: selectedVisa?.name,
        visa_id: selectedVisa?.visa_id,
        visa_charges: selectedVisa?.visa_charges,
        visa_cost: selectedVisa?.visa_cost,
        rejection_charges: getValues("rejectionCharges"),
        rejection_tax: parseFloat(getValues("rejectionCharges")) * 0.05,
        rejection_reason: getValues("rejectionReason"),
        status: status?.id,

        date: moment(date).format("YYYY-MM-DD"),
        visa_tenure: selectedVisa?.visa_tenure,
        document: document,
      };

      const promise = VisaServices.CandidateUpdateStatus(obj);

      showPromiseToast(
        promise,
        "Saving...",
        "Added Successfully",
        "Something Went Wrong"
      );

      // Await the promise and then check its response
      const response = await promise;
      if (response?.responseCode === 200) {
        setDisabled(false);
        getVisaRequestList();
        setStatus(null);
        if(status?.id == 'Reject' || status?.id == 'Cancel' ){
          DepositReversal(status?.id)
        }
      }
    } catch (error) {
      setDisabled(false);
    }
  };

  // *For Get Customer Queue
  const getCustomerQueue = async (page, limit, filter) => {
    setLoader(true);
    try {
      let params = {
        page: 1,
        limit: 1000,
        sort_order: sort,
      };

      const { data } = await CustomerServices.getCustomerQueue(params);
      setCustomerQueue(data?.rows);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoader(false);
    }
  };

  const handleFileChange = (file) => {
    setDocument(file);

    if (!file) {
      setDocument(null);
    }
  };

  const UpdateDate = async () => {
    setDisabled(true);
    setStatusDialog(false);

    try {
      let obj = {
        id: selectedVisa?.id,
        visa_id: selectedVisa?.visa_id,
        passport_number: selectedVisa?.passport_number,
        actual_entry_date: moment(date).format("YYYY-MM-DD"),
      };

      const promise = VisaServices.UpdateDate(obj);

      showPromiseToast(
        promise,
        "Saving...",
        "Added Successfully",
        "Something Went Wrong"
      );

      // Await the promise and then check its response
      const response = await promise;
      if (response?.responseCode === 200) {
        setDisabled(false);
        getVisaRequestList();
        setDate(null);

        setStatus(null);
        setDateDialog(false);
      }
    } catch (error) {
      setDisabled(false);
    }
  };

  // *For Get Countries
  const getCountries = async (id) => {
    try {
      const { data } = await SystemServices.getCountries();
      setCountries(data?.countries?.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const updateActiveVisa = async () => {
    try {
      let obj = {
        type: buttonValue,
        candidate_id: selectedItem?.id,
        visa_id: selectedItem?.visa_id,
        document: document,
        date: new Date(),
      };

      const promise = VisaServices.visaProcessingAdd(obj);

      showPromiseToast(
        promise,
        "Saving...",
        "Added Successfully",
        "Something Went Wrong"
      );

      // Await the promise and then check its response
      const response = await promise;
      if (response?.responseCode === 200) {
        setActiveVisaDialog(false);
        getVisaRequestList();
        setDocument("");
        setButtonValue("");
        setIsClicked(false);
        setSelectedItem(null);
      }
    } catch (error) { }
  };

  const handleDocArrayUpdate = async (field, value, key) => {
    if (field === "path") {
      const updatedDocuments = documents.map((doc) => {
        if (doc.key === key) {
          return { ...doc, path: value }; // Update the path
        }
        return doc; // Return the document as is if the key doesn't match
      });

      // Assuming you want to update the documents array
      // You can replace the following line with your state updating logic
      setDocuments(updatedDocuments);
    } else {
      const updatedDocuments = documents.map((doc) => {
        if (doc.key === key) {
          return { ...doc, expiry_date: moment(value).format("YYYY-MM-DD") }; // Update the path
        }
        return doc; // Return the document as is if the key doesn't match
      });

      setDocuments(updatedDocuments);
      // Handle other fields if needed
    }
  };

  const updateResult = (key, newResult) => {
    console.log(newResult);
    const updatedDocuments = documents.map((doc) => {
      if (doc.key === key) {
        return { ...doc, path: newResult }; // Update the path
      }
      return doc; // Return the document as is if the key doesn't match
    });

    setDocuments(updatedDocuments);
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
        setDate2("invalid");
        return;
      }
      setDate2(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Handle Filter
  const handleFilter = () => {
    let data = {
      search: getValues("search"),
      customer_id: selectedCustomer?.id,
      last_status: selectedStatus?.id,
    };
    Debounce(() => getVisaRequestList(1, "", data));
  };

  const getVisaRequestList = async (page, limit, filter) => {
    // setLoader(true)
    try {
      const Page = page ? page : currentPage;
      const Limit = limit ? limit : pageLimit;
      const Filter = filter ? { ...filters, ...filter } : null;
      setCurrentPage(Page);
      setPageLimit(Limit);
      setFilters(Filter);
      let params = {
        page: Page,
        limit: Limit,
        approval_status: "Approved",
        customer_id: user?.user_type == "C" ? user?.customer_id : null,
      };
      params = { ...params, ...Filter };
      console.log(params);

      const { data } = await CustomerServices.getCandidateLists(params);
      setCandidates(data?.rows);

      setTotalCount(data?.count);

      setPermissions(formatPermissionData(data?.permissions));
      data?.permissions.forEach((e) => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      });
    } catch (error) {
      showErrorToast(error);
    } finally {
      // setLoader(false)
    }
  };

  const handleSort = (key) => {
    let data = {
      sort_by: key,
      sort_order: sort,
    };
    Debounce(() => getVisaRequestList(1, "", data));
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

    // Or set a state or call another function with the value
    setButtonValue(value);
  };

  const handleUploadDocument = async (e) => {
    try {
      e.preventDefault();
      const inputElement = e.target;
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
        let maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          showErrorToast("File Size Must Be Less than 10 MB");
        } else {
          const path = await handleUpload(file, arr);

          return path;
        }
      } else {
        ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`);
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const getData = async (formData) => {
    setLoading(true);

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
  const handleUpload = async (file, docs) => {
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("document", file);

      const { data } = await instance.post(routes.uploadDocuments, formData, {
        onUploadProgress: (progressEvent) => {
          const uploadedBytes = progressEvent.loaded;
          const percentCompleted = Math.round(
            (uploadedBytes * 100) / progressEvent.total
          );

          setProgress(percentCompleted);

          setUploadedSize(getFileSize(uploadedBytes));
        },
      });
      if (data) {
        docs[0].isUpload = true;
        docs[0].file = data?.data?.nations;
        setSlipDetail(docs);

        return data?.data?.path;
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const handleOpenStatusDialog = (item) => {
    if (permissions.processing_status_update) {
      if (user?.user_type != "C") {
        setSelectedVisa(item); // Set the currently selected visa

        const sortedData = item?.statuses.sort((a, b) => a.id - b.id); // Sort statuses

        setCurrentStatus(sortedData[sortedData?.length - 1].status);
        // setStatuses(getAvailableStatuses(sortedData));
        // setStatus(sortedData[sortedData.length - 1]?.status); // Set the current status
        setStatusDialog(true); // Open the dialog
      }
    }
  };

  const UpdateCandidate = async (formData) => {
    try {
      let obj = {
        id: selectedCandidate,
        name: formData?.candidateName,
        phone: formData?.Phone,
        is_editable: selectedCandidate?.is_editable,
        email: formData?.email,
        camp_location: formData?.campLocation,
        vip_medical_temp: formData?.vipMedical,
        vip_medical_extra: vipMedicalCheck ? formData?.vipMedical : null,
        nationality: selectedCountry,
        nationality_id: selectedCountry?.id,
        passport_number: formData?.passportNumber.toUpperCase(),
        employee_id: formData?.employeeid,
        passport_expiry: moment(formData?.passportExp).format("YYYY-MM-DD"),
        visa_designation: formData?.visaDesignation,
        end_consumer: formData?.endConsumer,
        end_consumer_company: formData?.endConsumerCompany,
        documents: documents,
      };

      const promise = CustomerServices.UpdateCandidate(obj);

      showPromiseToast(
        promise,
        "Saving...",
        "Added Successfully",
        "Something Went Wrong"
      );

      const response = await promise;
      if (response?.responseCode === 200) {
        handleFilter();
        setOpen(false);
        setDocuments([
          {
            name: "Employee Undertaking",
            key: "undertaking",
            path: "",
            expiry_date: null,
            is_required: true,
          },
          {
            name: "Company Undertaking",
            key: "cundertaking",
            path: "",
            expiry_date: null,
            is_required: true,
          },

          {
            name: "Passport Copy",
            key: "passportcopy",
            path: "",
            expiry_date: null,
            is_required: true,
          },
          {
            name: "Digital Photo",
            key: "digitalphoto",
            path: "",
            expiry_date: null,
            is_required: true,
          },
          {
            name: "Employment Contract",
            key: "contract",
            path: "",
            expiry_date: null,
            is_required: true,
          },
          {
            name: "Offer Letter",
            key: "offerletter",
            path: "",
            expiry_date: null,
            is_required: true,
          },
          {
            name: "Previous Emirates Ids",
            key: "emiratesids",
            path: "",
            expiry_date: null,
            is_required: false,
          },
          {
            name: "Previous UAE Visa Copy",
            key: "uaevisa",
            path: "",
            expiry_date: null,
            is_required: false,
          },
          {
            name: "Cancellation",
            key: "cancellation",
            path: "",
            expiry_date: null,
            is_required: false,
          },
          {
            name: "UAE Driving License",
            key: "drivinglicense",
            path: "",
            expiry_date: null,
            is_required: false,
          },
          {
            name: "Work Permit",
            key: "workpermit",
            path: "",
            expiry_date: null,
            is_required: false,
          },
          {
            name: "Other Documents",
            key: "otherdoc",
            path: "",
            expiry_date: null,
            is_required: false,
          },
        ]);
      }
      // setCandidates((prevCandidates) => [...prevCandidates, obj]);
      // const updatedCandidates = candidates.map(candidate =>
      //     candidate.serial_id === candidateIndex ? obj : candidate
      // );
      //
      // setOpen(false)
      // // Update the state with the updated candidates array
      // setCandidates(updatedCandidates);

      // Add your logic to handle the form data here, e.g., sending it to an API.
    } catch (error) {
      console.error("Error adding candidate:", error);
      // Handle the error appropriately, e.g., displaying an error message to the user.
    }
  };

  const handleUpdateCandidate = (item, index) => {
    let serialId = item?.serial_id;

    setSelectedCandidate(item?.id);
    if (item?.documents?.length > 0) {
      setDocuments(item?.documents);
    } else {
      setDocuments([
        {
          name: "Employee Undertaking",
          key: "undertaking",
          path: "",
          expiry_date: null,
          is_required: true,
        },
        {
          name: "Company Undertaking",
          key: "cundertaking",
          path: "",
          expiry_date: null,
          is_required: true,
        },

        {
          name: "Passport Copy",
          key: "passportcopy",
          path: "",
          expiry_date: null,
          is_required: true,
        },
        {
          name: "Digital Photo",
          key: "digitalphoto",
          path: "",
          expiry_date: null,
          is_required: true,
        },
        {
          name: "Employment Contract",
          key: "contract",
          path: "",
          expiry_date: null,
          is_required: true,
        },
        {
          name: "Offer Letter",
          key: "offerletter",
          path: "",
          expiry_date: null,
          is_required: true,
        },
        {
          name: "Previous Emirates Ids",
          key: "emiratesids",
          path: "",
          expiry_date: null,
          is_required: false,
        },
        {
          name: "Previous UAE Visa Copy",
          key: "uaevisa",
          path: "",
          expiry_date: null,
          is_required: false,
        },
        {
          name: "Cancellation",
          key: "cancellation",
          path: "",
          expiry_date: null,
          is_required: false,
        },
        {
          name: "UAE Driving License",
          key: "drivinglicense",
          path: "",
          expiry_date: null,
          is_required: false,
        },
        {
          name: "Work Permit",
          key: "workpermit",
          path: "",
          expiry_date: null,
          is_required: false,
        },
        {
          name: "Other Documents",
          key: "otherdoc",
          path: "",
          expiry_date: null,
          is_required: false,
        },
      ]);
    }

    setOpen(true);

    setVisaTenture(item?.visa_tenure?.includes("1") ? "1 year" : "2 year");
    setVisaType(item?.visa_type);

    setValue2("candidateName", item?.name);
    setValue2("Phone", item?.phone);
    setValue2("email", item?.email);
    setValue2("campLocation", item?.camp_location);
    setValue2("passportNumber", item?.passport_number);
    setValue2("employeeid", item?.employee_id);
    setValue2(
      "passportExp",
      moment(item?.passport_expiry).format("MM-DD-YYYY")
    );
    handleDate2(item?.passport_expiry);
    if (item?.vip_medical_extra) {
      setVipMedicalCheck(true);
    } else {
      setVipMedicalCheck(false);
    }
    let nationality = countries?.find(
      (item2) => item2?.id == item?.nationality_id
    );

    setSelectedCountry(nationality);
    setValue2("nationality", nationality);
    setValue2("visaDesignation", item?.visa_designation);
    setValue2("basic", item?.salary_basic);
    setValue2("allowance", item?.salary_allowance);
    setValue2("endConsumer", item?.end_consumer);
    setValue2("endConsumerCompany", item?.end_consumer_company);
    setValue2("totalSalary", item?.salary_total);

    setValue2("2yearInsideRate", item?.inside_rate);
    setValue2("2yearOutsideRate", item?.outside_rate);
    setValue2("2yearRenewalRates", item?.renewal_rate);

    setValue2("1yearInsideRate", item?.inside_rate);
    setValue2("1yearOutsideRate", item?.outside_rate);
    setValue2("1yearRenewalRates", item?.renewal_rate);

    setValue2("vipMedical", item?.vip_medical_extra);
  };

  useEffect(() => {
    getVisaRequestList();
    getData();
    getCustomerQueue();

    getCountries();
  }, []);
  // const getAvailableStatuses = (sortedData) => {
  //   const lastStatus = sortedData[sortedData.length - 1]?.status;

  //   switch (lastStatus) {
  //     case "In Progress":
  //       return [

  //         { id: "Change Status", name: "Change Status" },
  //         { id: "Reject", name: "Reject" },
  //       ];

  //     case "Pending":
  //       return [
  //         { id: "In Progress", name: "In Progress" },
  //         { id: "Reject", name: "Reject" },
  //       ];

  //     case "Entry Permit":
  //       return [

  //         { id: "Medical", name: "Medical" },
  //         { id: "Reject", name: "Reject" },
  //       ];

  //     case "Change Status":
  //       return [

  //         { id: "Medical", name: "Medical" },
  //         { id: "Reject", name: "Reject" },
  //       ];

  //     case "Medical":
  //       return [

  //         { id: "Emirates Id", name: "Emirates Id" },
  //         { id: "Reject", name: "Reject" },
  //       ];

  //     case "Emirates Id":
  //       return [

  //         { id: "Stamping", name: "Stamping" },
  //         { id: "Reject", name: "Reject" },
  //       ];

  //     case "Stamping":
  //       return [

  //         { id: "Reject", name: "Reject" },
  //       ];

  //     default:
  //       return [];
  //   }
  // };


  const updateDocument = async () => {
    const params = {
      id: selectedCandidate,
      fitness_report: fitnessDocument,
      passport_number: passPortNo
    }
    console.log(params)
    try {
      const data = await VisaServices.CustomerCandidateUpdate(params);
      SuccessToaster(data?.message)
      setOpenEditDialog(false)
      getVisaRequestList()
    } catch (error) {
      ErrorToaster(error)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <SimpleDialog
        open={statusDialog}
        onClose={() => setStatusDialog(false)}
        title={"Change Status?"}
      >
        <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
          <Grid container>
            <Grid item xs={12} sm={12}>
              <SelectField
                size={"small"}
                label={"Select Status *:"}
                options={statuses}
                selected={status}
                onSelect={(value) => {
                  setStatus(value);
                  setValue("status", value?.name);
                }}
                error={errors?.status?.message}
                register={register("status", {
                  required: "Please select status.",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <DatePicker
                label={"Date *:"}
                value={date}
                size={"small"}
                error={errors?.date?.message}
                register={register("date", {
                  required: "Please enter date.",
                })}
                onChange={(date) => {
                  handleDate(date);
                  setValue("date", date);
                }}
              />
            </Grid>
            {(status?.name == "Reject" ||  status?.name == "Cancel") &&   (
              <>
                {" "}
                <Grid item mt={2} xs={12}>
                  <LabelCustomInput
                    label={status?.name == "Cancel" ? "Cancellation Charges *:" : "Rejection Charges *: "}
                    StartLabel={"AED"}
                    register={register("rejectionCharges", {
                      required: "Enter rejection charges",
                      onChange: (e) =>
                        setValue(
                          "rejectionTax",
                          parseFloat(e.target.value * 0.05).toFixed(2)
                        ),
                    })}
                    postfix={user?.user_type ? false : true}
                  />
                </Grid>
                <Grid item mt={2} xs={12}>
                  <LabelCustomInput
                    label={"Tax : "}
                    StartLabel={"AED"}
                    register={register("rejectionTax")}
                    postfix={user?.user_type ? false : true}
                    disabled={true}
                  />
                </Grid>
              </>
            )}

            {(status?.name == "Reject" ||  status?.name == "Cancel") &&  (
              <Grid item mt={2} xs={12}>
                <InputField
                  label={status?.name == "Cancel" ? "Cancellation Reason * :" : "Rejection Reason * :"}
                  size={"small"}
                  placeholder={status?.name == "Cancel" ? "Cancellation Reason" :"Rejection Reason"}
                  multiline={true}
                  rows={5}
                  error={errors?.rejectionReason?.message}
                  register={register("rejectionReason", {
                    required: "reason is required",
                  })}
                />
              </Grid>
            )}

            <Grid item mt={2} xs={12}>
              <Box sx={{ fontWeight: "bold" }}>
                {status?.name != "In Progress"
                  ? "Upload Document: *"
                  : "Upload Document:"}
              </Box>
              <UploadFileSingle
                Memo={true}
                accept={allowFilesType}
                className={"validationClass"}
                error={errors?.document?.message}
                disabled={isUploading}
                inputRef={docRef}
                file={document}
                register={register("document", {
                  required:
                    status?.name !== "In Progress" && !docRef.current
                      ? "upload document"
                      : false,
                  onChange: async (e) => {
                    setIsUploading(true);

                    // Check if file was deleted
                    if (e.target.files.length === 0) {
                      setDocument(null); // Reset the document state
                      setIsUploading(false); // Handle any additional logic when the file is deleted
                      return;
                    }

                    // If a new file is uploaded
                    const path = await handleUploadDocument(e);
                    if (path) {
                      setDocument(path);
                      setIsUploading(false);
                    }
                  },
                })}
              />
            </Grid>
            <Grid container sx={{ justifyContent: "center", mt: 2 }}>
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
                  disabled={disabled}
                  className="disbaledClass"
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
      </SimpleDialog>
      <SimpleDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        title={"Upload Fitness Report"}
      >
        <Box component="form" onSubmit={handleSubmit4(updateDocument)}>
          <Grid container>
            <Grid item mt={2} xs={12}>
              <Box sx={{ fontWeight: "bold" }}>"Upload Document"</Box>
              <UploadFileSingle
                Memo={true}
                accept={allowFilesType}
                className={"validationClass"}
                error={errors4?.document?.message}
                disabled={isUploading}
                inputRef={docRef}
                file={fitnessDocument}
                register={register4("document", {
                  required: !docRef.current ? "upload document" : false,
                  onChange: async (e) => {
                    setIsUploading(true);
                    if (e.target.files.length === 0) {
                      setFitnessDocument(null);
                      setIsUploading(false);
                      return;
                    }
                    const path = await handleUploadDocument(e);
                    if (path) {
                      setFitnessDocument(path);
                      setIsUploading(false);
                    }
                  },
                })}
              />
            </Grid>
            <Grid container sx={{ justifyContent: "center", mt: 2 }}>
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
                  disabled={disabled}
                  className="disbaledClass"
                  bgcolor={Colors.primary}
                  title={isUploading ? <CircularProgress size={20} /> : "Upload"}
                  type="submit"
                />
                <PrimaryButton
                  onClick={() => setOpenEditDialog(false)}
                  bgcolor={"#FF1F25"}
                  title="No,Cancel"
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
      <SimpleDialog
        open={reasonDialog}
        onClose={() => setReasonDialog(false)}
        title={cancelStatus ? "Cancellation Reason" :"Rejection Reason"}
      >
        <Box sx={{ textAlign: "left" }}>
          <span style={{ fontWeight: "bold" }}> Reason : </span>{" "}
          {reason?.rejection_reason}
        </Box>
        <Box sx={{ display: "flex", mt: 2, gap: 4 }}>
          <Box sx={{ textAlign: "left" }}>
            <span style={{ fontWeight: "bold" }}> Charges : </span>{" "}
            {reason?.rejection_charges}
          </Box>
          <Box sx={{ textAlign: "left" }}>
            <span style={{ fontWeight: "bold" }}> Tax : </span>{" "}
            {reason?.rejection_tax}
          </Box>
        </Box>
      </SimpleDialog>
      <SimpleDialog
        open={dateDialog}
        onClose={() => setDateDialog(false)}
        title={"Change Date?"}
      >
        <Box component="form" onSubmit={handleSubmit3(UpdateDate)}>
          <Grid container>
            <Grid item xs={12} sm={12}>
              <DatePicker
                label={"Actual Entry Date :"}
                value={date}
                size={"small"}
                error={errors3?.date?.message}
                register={register3("date", {
                  required: "Please enter  date.",
                })}
                onChange={(date) => {
                  handleDate(date);
                  setValue3("date", date);
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
                  disabled={disabled}
                  bgcolor={Colors.primary}
                  title="Yes,Confirm"
                  type="submit"
                />
                <PrimaryButton
                  onClick={() => setDateDialog(false)}
                  bgcolor={"#FF1F25"}
                  title="No,Cancel"
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
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
        onClose={() => {
          setActiveVisaDialog(false);
          setDocument("");
        }}
        title={buttonValue + " " + "Visa"}
      >
        <Box component="form" onSubmit={handleSubmit(updateActiveVisa)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <Box sx={{ fontWeight: "bold" }}>Upload Document:*</Box>
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
                  },
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
                  onClick={() => {
                    setActiveVisaDialog(false);
                    setDocument("");
                  }}
                  bgcolor={"#FF1F25"}
                  title="No,Cancel"
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>

      <Dialog
        component={"form"}
        onSubmit={handleSubmit2(UpdateCandidate)}
        open={open}
        maxWidth={"md"}
        fullWidth={true}
      >
        <DialogTitle id="scroll-dialog-title">Update Candidate</DialogTitle>
        <DialogContent>
          <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
            <Grid container spacing={2}>
              <Grid container mt={5} pl={3}>
                <Grid item xs={3} sm={3}>
                  <Typography
                    sx={{
                      fontSize: "15px",
                      color: Colors.black,
                      mb: 2,
                      fontWeight: "bold",
                    }}
                  >
                    Visa Type :{" "}
                  </Typography>
                  <FormControl>
                    <RadioGroup
                      row
                      defaultValue={visaType}
                      onChange={(e) => {
                        setVisaType(e.target.value);

                        setTimeout(() => {
                          setValue2(
                            "2yearInsideRate",
                            getValues("2yearInsideRate")
                          );
                          setValue2(
                            "2yearOutsideRate",
                            getValues("2yearOutsideRate")
                          );
                        }, 1000);
                      }}
                    >
                      <FormControlLabel
                        sx={{ color: "#000" }}
                        disabled={true}
                        value="In"
                        control={<Radio />}
                        label="In"
                      />
                      <FormControlLabel
                        sx={{ color: "#000" }}
                        disabled={true}
                        value="out"
                        control={<Radio />}
                        label="Out"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid item xs={3} sm={3}>
                  <Typography
                    sx={{
                      fontSize: "15px",
                      color: Colors.black,
                      mb: 2,
                      fontWeight: "bold",
                    }}
                  >
                    Visa Tenure :{" "}
                  </Typography>
                  <FormControl>
                    <RadioGroup
                      row
                      defaultValue={visaTenture}
                      onChange={(e) => {
                        setVisaTenture(e.target.value);
                      }}
                    >
                      <FormControlLabel
                        sx={{ color: "#000" }}
                        disabled={true}
                        value="1 year"
                        control={<Radio />}
                        label="1 Year"
                      />
                      <FormControlLabel
                        sx={{ color: "#000" }}
                        disabled={true}
                        value="2 year"
                        control={<Radio />}
                        label="2 Years"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: Colors.textColorDarkBlue,
                  p: 3,
                }}
              >
                Visa Rates :{" "}
              </Typography>
              {
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: Colors.textColorDarkBlue,
                    mt: 3,
                  }}
                >
                  {visaTenture.includes("1")
                    ? "1 Year Rates "
                    : "2 Years Rates "}
                </Typography>
              }

              <Grid container pl={3}>
                {visaTenture.includes("1") &&
                  visaType?.toLowerCase() == "in" && (
                    <Grid container sx={{ gap: "20px 25px" }}>
                      <Grid item xs={5}>
                        <LabelCustomInput
                          label={"Year Inside Rates :* "}
                          disabled={true}
                          StartLabel={"AED"}
                          register={register2("1yearInsideRate", {
                            required: "Enter year inside rate",
                          })}
                          postfix={false}
                        />
                      </Grid>

                      {/* <Grid item xs={5} >
                                        <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false }  StartLabel={'AED'} register={register2("1yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                    </Grid> */}
                    </Grid>
                  )}
                {visaTenture.includes("1") &&
                  visaType?.toLowerCase() == "out" && (
                    <Grid container sx={{ gap: "20px 25px" }}>
                      <Grid item xs={5}>
                        <LabelCustomInput
                          label={"Year Outside Rates :*  "}
                          disabled={true}
                          StartLabel={"AED"}
                          register={register2("1yearOutsideRate", {
                            required: "Enter year outside rate",
                          })}
                          postfix={true}
                        />
                      </Grid>

                      {/* <Grid item xs={5} >
                                        <LabelCustomInput label={'Renewal Rates :*  '}  disabled={user?.user_type == 'C' ? true : false } StartLabel={'AED'} register={register2("1yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                    </Grid> */}
                    </Grid>
                  )}

                {visaTenture.includes("2") &&
                  visaType?.toLowerCase() == "in" && (
                    <>
                      <Grid container sx={{ gap: "20px 25px" }}>
                        <Grid item xs={5}>
                          <LabelCustomInput
                            label={"Year Inside Rates :*  "}
                            disabled={true}
                            StartLabel={"AED"}
                            register={register2("2yearInsideRate", {
                              required: "Enter year inside rate",
                            })}
                            postfix={false}
                          />
                        </Grid>

                        {/* <Grid item xs={5} >
                                            <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false } StartLabel={'AED'} register={register2("2yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                        </Grid> */}
                      </Grid>
                    </>
                  )}
                {visaTenture.includes("2") &&
                  visaType?.toLowerCase() == "out" && (
                    <>
                      <Grid container sx={{ gap: "20px 25px" }}>
                        <Grid item xs={5}>
                          <LabelCustomInput
                            label={"Year Outside Rates :*  "}
                            disabled={true}
                            StartLabel={"AED"}
                            register={register2("2yearOutsideRate", {
                              required: "Enter year outside rate",
                            })}
                            postfix={false}
                          />
                        </Grid>

                        {/* 
                                        <Grid item xs={5} >
                                            <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false } StartLabel={'AED'} register={register2("2yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                        </Grid> */}
                      </Grid>
                    </>
                  )}
              </Grid>
              <Grid container p={3}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: Colors.textColorDarkBlue,
                    mb: 2,
                  }}
                >
                  Extra Costing :{" "}
                </Typography>

                <Grid container sx={{ gap: "20px 25px" }}>
                  <Grid item xs={5}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Box sx={{ marginTop: "22px" }}>
                        {
                          <Checkbox
                            checked={vipMedicalCheck}
                            disabled={true}
                            onChange={(e) => { }}
                          />
                        }
                      </Box>
                      <LabelCustomInput
                        label="VIP Medical Extra Charges : "
                        StartLabel="AED"
                        register={register2("vipMedical")}
                        postfix={false}
                        disabled={true}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Candidate Name :"}
                  size={"small"}
                  fullWidth={true}
                  placeholder={"Candidate Name"}
                  error={errors2?.candidateName?.message}
                  register={register2("candidateName", {
                    required: "Please enter your candidate name.",
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Phone :"}
                  size={"small"}
                  fullWidth={true}
                  type={"number"}
                  placeholder={"Phone"}
                  error={errors2?.Phone?.message}
                  register={register2("Phone", {
                    required: "Please enter your Phone.",
                    pattern: {
                      value: /^05[0-9]{8}$/,
                      message:
                        "Please enter a valid UAE phone number (starting with 05 and 8 digits).",
                    },
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Email :"}
                  size={"small"}
                  fullWidth={true}
                  placeholder={"Email "}
                  error={errors2?.email?.message}
                  register={register2("email", {
                    required: "Please enter your email.",
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Camp Location  :"}
                  size={"small"}
                  fullWidth={true}
                  placeholder={"Camp Location "}
                  error={errors2?.campLocation?.message}
                  register={register2("campLocation", {
                    required: "Please enter your camp location.",
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Employee ID :*"}
                  size={"small"}
                  fullWidth={true}
                  placeholder={"Employee ID"}
                  error={errors?.employeeid?.message}
                  register={register2("employeeid", {
                    required: "Please enter your employee id.",
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <SelectField
                  size={"small"}
                  label={"Nationality :*"}
                  options={countries}
                  selected={selectedCountry}
                  onSelect={(value) => setSelectedCountry(value)}
                  error={errors2?.nationality?.message}
                  register={register2("nationality", {
                    required: "Please select nationality",
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Passport Number :"}
                  size={"small"}
                  fullWidth={true}
                  placeholder={"Passport Number"}
                  error={errors2?.passportNumber?.message}
                  register={register2("passportNumber", {
                    required: "Please enter your passport number.",
                    onChange: (e) => { },
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label={"Passport Expiry :*"}
                  value={date}
                  disablePast={true}
                  minDate={addDays(addMonths(new Date(), 6), 1)}
                  size={"small"}
                  error={errors2?.passportExp?.message}
                  {...register2("passportExp", {
                    required: "Please enter your passport expiry date.",
                    validate: (value) => {
                      const minAllowedDate = addMonths(new Date(), 6);
                      console.log(value, "value");
                      console.log(moment(minAllowedDate), "value");
                      console.log(
                        moment(value) > moment(minAllowedDate),
                        "value"
                      );

                      return (
                        moment(value) > moment(minAllowedDate) ||
                        "Passport expiry date must be at least 6 months from today."
                      );
                    },
                  })}
                  onChange={(date) => {
                    handleDate(date);
                    setValue2("passportExp", date, { shouldValidate: true });
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Visa Designation :"}
                  size={"small"}
                  fullWidth={true}
                  placeholder={"Visa Designation"}
                  error={errors2?.visaDesignation?.message}
                  register={register2("visaDesignation", {
                    required: "Please enter your visa designation .",
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: Colors.textColorDarkBlue,
                  }}
                >
                  Salary :{" "}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <LabelCustomInput
                  label={"Basic : "}
                  disabled={true}
                  StartLabel={"AED"}
                  placeholder={"Basic"}
                  error={errors?.basic?.message}
                  register={register2("basic", {
                    required: "Enter basic  salary",
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <LabelCustomInput
                  allowance={true}
                  label={"Allowance : "}
                  disabled={true}
                  StartLabel={"AED"}
                  placeholder={"Allowance"}
                  error={errors?.allowance?.message}
                  register={register2("allowance", {
                    required: "Enter allowance ",
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <LabelCustomInput
                  disabled={true}
                  label={"Total Salary : "}
                  StartLabel={"AED"}
                  placeholder={"Total"}
                  register={register2("totalSalary")}
                />
                {/* {(customerPaymentType == 'payroll' && salaryError) ? <p style={{ color: 'red' }}>Salary Limit Exceeded </p> : ''} */}
              </Grid>
              {/* <Grid item xs={6}>
                                <InputField
                                    label={"End Consumer :"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"End Consumer"}
                                    error={errors2?.endConsumer?.message}
                                    register={register2("endConsumer", {
                                        required:
                                            "Please enter your end consumer  ."

                                    })}
                                />
                            </Grid> */}
              <Grid item xs={6}>
                <InputField
                  label={"End Consumer Company :"}
                  size={"small"}
                  fullWidth={true}
                  placeholder={"End Consumer Company "}
                  error={errors2?.endConsumerCompany?.message}
                  register={register2("endConsumerCompany", {
                    required: "Please enter your end consumer company .",
                  })}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: Colors.textColorDarkBlue,
                  }}
                >
                  Documents :{" "}
                </Typography>
              </Grid>
              {documents?.length > 0 &&
                documents
                  ?.sort((a, b) => a.id - b.id) // Sort by id in ascending order
                  .map((item, index) => (
                    <Grid item xs={5} key={index}>
                      <Typography
                        sx={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: Colors.gray,
                        }}
                      >
                        {item?.is_required
                          ? item?.name
                          : `${item?.name} (If Any)`}{" "}
                        :{item?.is_required ? "*" : " "}
                      </Typography>
                      <UploadFile
                        Memo={true}
                        accept={allowFilesType}
                        file={documents}
                        multiple={true}
                        updateResult={updateResult}
                        fileId={item?.key}
                        error={errors2[item?.key]?.message}
                        loader={loader}
                        disabled={isUploading}
                        register={register2(`${item?.key}`, {
                          required: item?.is_required
                            ? documents.find(
                              (item2) => item2?.key === item?.key
                            )?.path !== ""
                              ? false
                              : "Please upload document."
                            : false,
                          onChange: async (e) => {
                            setIsUploading(true); // Set uploading to true when the upload starts
                            const path = await handleUploadDocument(
                              e,
                              item?.key
                            );
                            if (path) {
                              handleDocArrayUpdate("path", path, item?.key);
                            }
                            setIsUploading(false); // Reset uploading status when done
                          },
                        })}
                      />
                    </Grid>
                  ))}
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ fontFamily: "Public Sans" }}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button sx={{ fontFamily: "Public Sans" }} type="submit">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
          Visa Processing Management List
        </Typography>
        {/* <Box sx={{ display: "flex", gap: "10px" }}>
          {isClicked == true ? (
            <>
              {selectedItem && (
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
                  onClick={() => setIsClicked(false)}
                >
                  Cancel
                </Button>
              )}
              {selectedItem && (
                <Button
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
                    },
                  }}
                  onClick={() => setActiveVisaDialog(true)}
                >
                  Next
                </Button>
              )}
            </>
          ) : (
            <>
              {permissions?.renew && (
                <Button
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
                  onClick={() => handleClick("Renew")}
                >
                  Renew
                </Button>
              )}

              {permissions?.cancel && (
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
                  onClick={() => handleClick("Cancel")}
                >
                  Cancel
                </Button>
              )}

              {permissions?.absconder && (
                <Button
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
                  onClick={() => handleClick("Absconder")}
                >
                  Absconder
                </Button>
              )}
            </>
          )}
        </Box> */}
      </Box>

      {/* Filters */}
      <Box>
        <Grid container spacing={2} alignItems={"center"}>
          <Grid item xs={3}>
            <InputField
              label={"Search :"}
              size={"small"}
              fullWidth={true}
              placeholder={"Search"}
              error={errors?.search?.message}
              register={register("search")}
            />
          </Grid>
          {user?.user_type != "C" && (
            <Grid item xs={3}>
              <SelectField
                size={"small"}
                label={"Select Customer :"}
                options={customerQueue}
                selected={selectedCustomer}
                onSelect={(value) => {
                  setSelectedCustomer(value);
                }}
                error={errors?.customer?.message}
                register={register("customer")}
              />
            </Grid>
          )}
          <Grid item xs={3}>
            <SelectField
              size={"small"}
              label={"Select Status :"}
              options={[
                {
                  id: "Entry Permit",
                  name: "Entry Permit",
                },
                {
                  id: "In Progress",
                  name: "In Progress",
                },
                {
                  id: "Change Status",
                  name: "Change Status",
                },
                { id: "Medical", name: "Medical" },
                {
                  id: "Emirates Id",
                  name: "Emirates Id",
                },
                { id: "Stamping", name: "Stamping" },
                { id: "Complete (EID)", name: "Complete (EID)" },
                {
                  id: "Cancel",
                  name: "Cancel",
                },
                { id: "Reject", name: "Reject" },
              ]}
              selected={selectedStatus}
              onSelect={(value) => {
                setSelectedStatus(value);
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
                setValue("search", "");
                setSelectedCustomer(null);
                setSelectedStatus(null);
                getVisaRequestList(1, "", null);
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
                            let sorteddata = item?.statuses.sort(
                              (a, b) => a.id - b.id
                            );

                            return (
                              <Row
                                key={index}
                                sx={{
                                  border: "1px solid #EEEEEE !important",
                                }}
                              >
                                {/* {isClicked && (
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
                                      type="radio"
                                      checked={selectedItem?.id === item?.id}
                                      onChange={() => handleRadioChange(item)}
                                      style={{ cursor: "pointer" }}
                                    />
                                  </Cell>
                                )} */}
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
                                    "DD-MM-YYYY"
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
                                  {item?.visa_type?.toLowerCase() == "in"
                                    ? "In"
                                    : "Out"}
                                </Cell>

                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                  onClick={() => {
                                    if (
                                      sorteddata[sorteddata?.length - 1]
                                        .status != "Complete (EID)" &&
                                      sorteddata[sorteddata?.length - 1]
                                        .status != "Reject"
                                        &&
                                      sorteddata[sorteddata?.length - 1]
                                        .status != "Cancel"
                                    ) {
                                      handleOpenStatusDialog(item);
                                    }

                                    handleDate(new Date());
                                    // if (permissions?.update_candidate_status) {
                                    // if (permissions?.update_candidate_status) {

                                    // setStatusDialog(true);
                                    // }
                                    // }
                                    setSelectedVisa(item);
                                    setStatus(null);
                                    setDate(null);
                                    setDocument("");
                                    if (
                                      sorteddata[sorteddata?.length - 1]
                                        ?.status == "In Progress"
                                    ) {
                                      if (
                                        item?.visa_type?.toLowerCase() == "out"
                                      ) {
                                        setStatuses([
                                          // {
                                          //   id: "In Progress",
                                          //   name: "In Progress",
                                          // },
                                          {
                                            id: "Entry Permit",
                                            name: "Entry Permit",
                                          },
                                          { id: "Reject", name: "Reject" },
                                          { id: "Cancel", name: "Cancel" },
                                        ]);
                                      } else {
                                        setStatuses([
                                          // {
                                          //   id: "In Progress",
                                          //   name: "In Progress",
                                          // },
                                          {
                                            id: "Change Status",
                                            name: "Change Status",
                                          },

                                          { id: "Reject", name: "Reject" },
                                          { id: "Cancel", name: "Cancel" },
                                        ]);
                                      }
                                    } else if (
                                      sorteddata[sorteddata.length - 1]
                                        .status == "Pending"
                                    ) {
                                      setStatuses([
                                        {
                                          id: "In Progress",
                                          name: "In Progress",
                                        },

                                        { id: "Reject", name: "Reject" },
                                        { id: "Cancel", name: "Cancel" },
                                      ]);
                                    } else if (
                                      sorteddata[sorteddata.length - 1]
                                        .status == "Entry Permit"
                                    ) {
                                      setStatuses([
                                        // {
                                        //   id: "Entry Permit",
                                        //   name: "Entry Permit",
                                        // },
                                        { id: "Medical", name: "Medical" },
                                        { id: "Reject", name: "Reject" },
                                        { id: "Cancel", name: "Cancel" },
                                      ]);
                                    } else if (
                                      sorteddata[sorteddata.length - 1]
                                        .status == "Change Status"
                                    ) {
                                      setStatuses([
                                        // {
                                        //   id: "Change Status",
                                        //   name: "Change Status",
                                        // },
                                        { id: "Medical", name: "Medical" },

                                        { id: "Reject", name: "Reject" },
                                        { id: "Cancel", name: "Cancel" },
                                      ]);
                                    } else if (
                                      sorteddata[sorteddata.length - 1]
                                        .status == "Medical"
                                    ) {
                                      setStatuses([
                                        // { id: "Medical", name: "Medical" },
                                        {
                                          id: "Emirates Id",
                                          name: "Emirates Id",
                                        },

                                        { id: "Reject", name: "Reject" },
                                        { id: "Cancel", name: "Cancel" },
                                      ]);
                                    } else if (
                                      sorteddata[sorteddata.length - 1]
                                        .status == "Emirates Id"
                                    ) {
                                      setStatuses([
                                        // {
                                        //   id: "Emirates Id",
                                        //   name: "Emirates Id",
                                        // },
                                        { id: "Stamping", name: "Stamping" },
                                        { id: "Reject", name: "Reject" },
                                        { id: "Cancel", name: "Cancel" },
                                      ]);
                                    } else if (
                                      sorteddata[sorteddata.length - 1]
                                        .status == "Stamping"
                                    ) {
                                      setStatuses([
                                        {
                                          id: "Complete (EID)",
                                          name: "Complete (EID)",
                                        },
                                      ]);
                                    } else if (
                                      sorteddata[sorteddata.length - 1]
                                        .status == "Reject"
                                    ) {
                                      setStatuses([
                                        // { id: "Stamping", name: "Stamping" },

                                        {},
                                      ]);
                                    }
                                  }}
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
                                      sx={{
                                        width: "13px",
                                        height: "13px",
                                        borderRadius: "50%",
                                        backgroundColor:
                                          sorteddata[sorteddata.length - 1]
                                            ?.status === "Medical"
                                            ? "#007BFF" // Blue
                                            : sorteddata[sorteddata.length - 1]
                                              ?.status === "Stamping"
                                              ? "#B0BEC5" // Yellow
                                              : sorteddata[sorteddata.length - 1]
                                                ?.status === "Emirates Id"
                                                ? "#FF69B4" // Pink
                                                : sorteddata[sorteddata.length - 1]
                                                  ?.status === "Entry Permit"
                                                  ? "#FFA500" // Orange
                                                  : sorteddata[sorteddata.length - 1]
                                                    ?.status === "Change Status"
                                                    ? "#6C757D" // Gray
                                                    : sorteddata[sorteddata.length - 1]
                                                      ?.status === "Complete (EID)"
                                                      ? "#2bcb0e" :  // Green
                                                      sorteddata[sorteddata.length - 1]
                                                        ?.status === "In Progress"
                                                        ? "#e7e00a" : "#DC3545", // Red (default for error)
                                      }}
                                    ></Box>

                                    {sorteddata[sorteddata.length - 1]
                                      ?.status === "Reject" ? (
                                      <Tooltip
                                        title={item?.rejection_reason}
                                        placement="top"
                                      >
                                        {
                                          sorteddata[sorteddata.length - 1]
                                            ?.status
                                        }
                                      </Tooltip>
                                    ) : (
                                      <span>
                                        {
                                          sorteddata[sorteddata.length - 1]
                                            ?.status
                                        }
                                      </span>
                                    )}
                                  </Box>
                                </Cell>
                                <Cell
                                  style={{
                                    textAlign: "left",
                                    cursor:
                                      item?.visa_type?.toLowerCase() == "in" &&
                                        (sorteddata[sorteddata.length - 1]
                                          ?.status === "Entry Permit" ||
                                          sorteddata[sorteddata.length - 1]
                                            ?.status === "Medical" ||
                                          sorteddata[sorteddata.length - 1]
                                            ?.status === "Emirates Id" ||
                                          sorteddata[sorteddata.length - 1]
                                            ?.status === "Stamping" ||
                                          sorteddata[sorteddata.length - 1]
                                            ?.status === "Complete (EID)")
                                        ? "pointer"
                                        : "",
                                  }}
                                  className="pdf-table"
                                  onClick={() => {
                                    if (
                                      item?.visa_type?.toLowerCase() == "in" &&
                                      (sorteddata[sorteddata.length - 1]
                                        ?.status === "Entry Permit" ||
                                        sorteddata[sorteddata.length - 1]
                                          ?.status === "Medical" ||
                                        sorteddata[sorteddata.length - 1]
                                          ?.status === "Emirates Id" ||
                                        sorteddata[sorteddata.length - 1]
                                          ?.status === "Stamping" ||
                                        sorteddata[sorteddata.length - 1]
                                          ?.status === "Complete (EID)")
                                    ) {
                                      setSelectedVisa(item);

                                      setDate(null);
                                      setValue2("date", "");
                                    }
                                  }}
                                >
                                  {item?.change_status_date
                                    ? moment(item?.change_status_date).format(
                                      "DD-MM-YYYY"
                                    )
                                    : "-"}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                  onClick={() => {
                                    setSelectedVisa(item);
                                    console.log(
                                      moment(item?.actual_entry_date).format(
                                        "MM-DD-YYYY"
                                      )
                                    );
                                    setDate(
                                      item?.actual_entry_date
                                        ? new Date(item?.actual_entry_date)
                                        : null
                                    );
                                  }}
                                >
                                  <Box>
                                    {sorteddata[sorteddata.length - 1]
                                      ?.status === "Reject" &&
                                      permissions?.rejection_reason && (
                                        <Box
                                          component={"div"}
                                          onClick={() => {
                                            setCancelStatus(false)
                                            setReason(item);
                                            setReasonDialog(true);
                                          }}
                                          sx={{ cursor: "pointer" }}
                                        >
                                          <InfoOutlinedIcon />
                                        </Box>
                                      )}
                                        {sorteddata[sorteddata.length - 1]
                                      ?.status === "Cancel" &&
                                      permissions?.rejection_reason && (
                                        <Box
                                          component={"div"}
                                          onClick={() => {
                                            setReason(item);
                                            setCancelStatus(true)
                                            setReasonDialog(true);
                                          }}
                                          sx={{ cursor: "pointer" }}
                                        >
                                          <InfoOutlinedIcon />
                                        </Box>
                                      )}
                                    {item?.is_editable &&
                                      permissions?.candidate_edit && (
                                        <Box
                                          component={"img"}
                                          sx={{ cursor: "pointer" }}
                                          onClick={() =>
                                            handleUpdateCandidate(item)
                                          }
                                          src={Images.editIcon}
                                          width={"35px"}
                                        ></Box>
                                      )}
                                    {item?.visa_type?.toLowerCase() == "out" && (
                                      <Box
                                        component={"div"}
                                        onClick={() => setDateDialog(true)}
                                        sx={{ cursor: "pointer" }}
                                      >
                                        <CalendarMonthIcon />
                                      </Box>
                                    )}
                                    <Box
                                      component={"img"}
                                      src={Images.detailIcon}
                                      onClick={() => {
                                        if (permissions?.processing_details) {
                                          navigate(
                                            `/view-candidate-detail/${item?.id}`
                                          );
                                        }
                                      }}
                                      width={"35px"}
                                    ></Box>
                                    <Box
                                      component={"div"}
                                      onClick={() => {
                                        setSelectedCandidate(item?.id)
                                        setPassPortNo(item?.passport_number)
                                        setFitnessDocument(item?.fitness_report)
                                        setOpenEditDialog(true)
                                      }}
                                      sx={{ cursor: "pointer" }}
                                    >
                                      <Tooltip title="Fitness Report">

                                        <SummarizeIcon sx={{ color: item?.fitness_report ? '#56ba28' : 'black' }} />
                                      </Tooltip>
                                    </Box>
                                    <Box>


                                      {(permissions.credit_note && (item?.last_status?.toLowerCase() == 'reject' || item?.last_status?.toLowerCase() == 'cancel') ) && <Box component={'img'} onClick={() => {

                                        if (permissions.credit_note && (item?.last_status?.toLowerCase() == 'reject' || item?.last_status?.toLowerCase() == 'cancel')) {

                                          navigate(`/credit_note/${item?.id}`)
                                        }

                                      }} sx={{ cursor: "pointer" }} src={Images.invoiceIcon} width={'35px'}></Box>}
                                      {/* <Box component={'img'} src={Images.deleteIcon} width={'35px'}></Box>  */}
                                    </Box>
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
                    onPageSizeChange={(size) =>
                      getVisaRequestList(1, size.target.value, filters)
                    }
                    tableCount={candidates.length}
                    totalCount={totalCount}
                    onPageChange={(page) =>
                      getVisaRequestList(page, "", filters)
                    }
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
