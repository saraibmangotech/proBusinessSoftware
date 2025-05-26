import React, { Fragment, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Pagination,
  Paper,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  tableCellClasses,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontFamily, Images } from "assets";
import Colors from "assets/Style/Colors";
import InputField from "components/Input";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import CustomerServices from "services/Customer";
import SelectField from "components/Select";
import SystemServices from "services/System";
import { PrimaryButton } from "components/Buttons";
import InputPhone from "components/InputPhone";
import DatePicker from "components/DatePicker";
import UploadedFile from "components/UploadedFile";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import AuthServices from "services/Auth";
import UserServices from "services/User";
import { getValue } from "@testing-library/user-event/dist/utils";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import VisaServices from "services/Visa";
import { CircleLoading } from "components/Loaders";
import { PDFExport } from "@progress/kendo-react-pdf";

import moment from "moment";
import styled from "@emotion/styled";
import SimpleDialog from "components/Dialog/SimpleDialog";
import { CleanTypes, formatPermissionData, getFileSize } from "utils";
import instance from "config/axios";
import routes from "services/System/routes";
import UploadFile from "components/UploadFile";
import UploadFileSingle from "components/UploadFileSingle";
import { addPermission } from "redux/slices/navigationDataSlice";
import { useDispatch } from "react-redux";
import LabelCustomInput from "components/Input/LabelCustomInput";
import { FormControl } from "@mui/base";
import { useAuth } from "context/UseContext";
import CandidateDetail from "./CandidateDetail";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { addDays, addMonths } from "date-fns";
import { red } from "@mui/material/colors";
import Circle from '@mui/icons-material/Circle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

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

function VisaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, userLogout } = useAuth();
  const tableHead1 = [
    { name: "SR No.", key: "" },
    { name: "Date ", key: "name" },
    { name: "Customer Name", key: "visa_eligibility" },
    { name: "Candidate Name", key: "deposit_total" },
    { name: "Visa Rates", key: "" },
    { name: "Approval Status", key: "" },
    { name: "Processing Status", key: "" },
    { name: "Actions", key: "" },
  ];
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    formState: { errors },
    reset,
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
    watch,
    formState: { errors: errors3 },

  } = useForm();
  const allowFilesType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "application/pdf",
    "application/vnd.ms-excel",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  // *For Dialog Box
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [confirmationDialog2, setConfirmationDialog2] = useState(false);
  const [loader, setLoader] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedSize, setUploadedSize] = useState(0);
  const [scroll, setScroll] = React.useState("paper");
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState();
  const [status, setStatus] = useState(null);
  const [document, setDocument] = useState();
  const [date, setDate] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [permissions, setPermissions] = useState();
  const [candidateIndex, setCandidateIndex] = useState()
  const [updateCandidate, setUpdateCandidate] = useState()

  const [open1, setOpen1] = useState()
  const [visaType, setVisaType] = useState('In')
  const [visaTenture, setVisaTenture] = useState('1 year')
  const [originalCandidates, setOriginalCandidates] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [rejections, setRejections] = useState([])
  // *For Customer Detail
  const [visaDetail, setVisaDetail] = useState();

  // *For International Country Code
  const [intCode, setIntCode] = useState();
  // *For Countries
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [customerPaymentType, setCustomerPaymentType] = useState(null)
  const [candidateSalary, setCandidateSalary] = useState()
  const [payrollPercent, setPayrollPercent] = useState()
  const [eligibility, setEligibility] = useState()
  const [salaryError, setSalaryError] = useState(false)
  const [totalVisaCharges, setTotalVisaCharges] = useState()
  const [candidates, setCandidates] = useState([])
  const [vipMedicalCheck, setVipMedicalCheck] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [paginatedCandidates, setPaginatedCandidates] = useState([]);
  const [rejectionDialog, setRejectionDialog] = useState(false)
  const [depositScenario, setDepositScenario] = useState()
  const [customerDetail, setCustomerDetail] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [updateDialog2, setUpdateDialog2] = useState(false)
  const [charges, setCharges] = useState(null)
  const [consumed, setConsumed] = useState(0)


  const [customerDeposit, setCustomerDeposit] = useState()

  const [totalDepositCharges, setTotalDepositCharges] = useState()

  const [customerBalance, setCustomerBalance] = useState()
  console.log(consumed, 'consumedconsumedconsumed');


  const candidatesPerPage = 3; // Adjust this value based on how many candidates you want per page

  // useEffect(() => {
  //   // Calculate total pages
  //   console.log(candidates, 'console.log(candidates);');
  //   setTotalPages(Math.ceil(candidates.length / candidatesPerPage));

  //   console.log(Math.ceil(candidates.length / candidatesPerPage));

  //   // Calculate the indexes for slicing
  //   const indexOfLastCandidate = (currentPage + 1) * candidatesPerPage;
  //   const indexOfFirstCandidate = Math.max(0, indexOfLastCandidate - candidatesPerPage);

  //   // Slice the candidates array to get the candidates for the current page
  //   const currentCandidates = originalCandidates.slice(
  //     indexOfFirstCandidate,
  //     indexOfLastCandidate
  //   );

  //   setCandidates([...currentCandidates]);

  // }, [candidates, currentPage]);
  let itemsPerPage = 20

  const handlePageChange = (event, value) => {
    setCurrentPage(value);

    const startIndex = (value - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // // Slice the candidates based on the current page and search term
    // const filteredCandidates = origianlCandidates.filter((candidate) =>
    //     candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     candidate.phone.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    const paginatedCandidates = originalCandidates.slice(startIndex, endIndex);
    setCandidates(paginatedCandidates);
  };

  const [fieldsDisabled, setFieldsDisabled] = useState({
    monthlyVisaServiceCharges: true,
    vipMedical: false,
    extraTyping: true,
  });


  const handleClose = () => {
    setOpen(false);
  };



  //documents array
  const [documents, setDocuments] = useState([
    {
      name: "Employee Undertaking",
      key: "undertaking",
      path: "",
      expiry_date: null,
      is_required: true


    },
    {
      name: "Company Undertaking",
      key: "cundertaking",
      path: "",
      expiry_date: null,
      is_required: true
    },

    {
      name: "Passport Copy",
      key: "passportcopy",
      path: "",
      expiry_date: null,
      is_required: true
    },
    {
      name: "Digital Photo",
      key: "digitalphoto",
      path: "",
      expiry_date: null,
      is_required: true
    },
    {
      name: "Employment Contract",
      key: "contract",
      path: "",
      expiry_date: null,
      is_required: true
    },
    {
      name: "Offer Letter",
      key: "offerletter",
      path: "",
      expiry_date: null,
      is_required: true
    },
    {
      name: "Previous Emirates Ids",
      key: "emiratesids",
      path: "",
      expiry_date: null,
      is_required: false
    },
    {
      name: "Previous UAE Visa Copy",
      key: "uaevisa",
      path: "",
      expiry_date: null,
      is_required: false
    },
    {
      name: "Cancellation",
      key: "cancellation",
      path: "",
      expiry_date: null,
      is_required: false
    },
    {
      name: "UAE Driving License",
      key: "drivinglicense",
      path: "",
      expiry_date: null,
      is_required: false
    },
    {
      name: "Work Permit",
      key: "workpermit",
      path: "",
      expiry_date: null,
      is_required: false
    },
    {
      name: "Other Documents",
      key: "otherdoc",
      path: "",
      expiry_date: null,
      is_required: false
    },

  ]
  )

  // *For Expiration Date
  const [passportExp, setPassportExp] = useState();
  const [editUser, setEditUser] = useState(false);

  // *For Handle Date
  const handlePassportDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setPassportExp("invalid");
        return;
      }
      setPassportExp(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const getData = async (formData) => {

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

    }
  };

  const updateResult = (key, newResult) => {

    console.log(newResult)
    const updatedDocuments = documents.map(doc => {
      if (doc.key === key) {
        return { ...doc, path: newResult }; // Update the path
      }
      return doc; // Return the document as is if the key doesn't match
    });
    console.log(updatedDocuments, 'updatedDocuments');
    setDocuments(updatedDocuments)
  };
  const DepositReversal = async (status) => {
    console.log(selectedVisa,'status');
    
  
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
  const UpdateStatus = async () => {
    console.log(selectedVisa);
    setButtonDisabled(true)
    try {
      let obj = {
        id: selectedVisa?.id,
        customer_id: selectedVisa?.customer_id,
        approval_status: status?.id,
        visa_id: selectedVisa?.visa_id,
        passport_number:selectedVisa?.passport_number,
        reason: status?.id == 'Rejected' ? getValues('reason') : null,
        candidate_name: selectedVisa?.name

      };

      const promise = VisaServices.CustomerCandidateUpdate(obj);
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
        setStatus(null)
        getVisaDetail();
        if(status?.id == 'Rejected'){
          DepositReversal(status?.id)
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleTotalVisaCharges = () => {
    let fields = [];

    // Determine which fields to use based on visaTenture and visaType
    if (visaTenture.includes('1') && visaType.toLowerCase() == 'in') {
      fields = [
        '1yearInsideRate',
        '1yearRenewalRates',
        'monthlyVisaServiceCharges',
        'vipMedical',
        'extraTyping'
      ];
    } else if (visaTenture.includes('1') && visaType.toLowerCase() == 'out') {
      fields = [
        '1yearOutsideRate',
        '1yearRenewalRates',
        'monthlyVisaServiceCharges',
        'vipMedical',
        'extraTyping'
      ];
    } else if (visaTenture.includes('2') && visaType.toLowerCase() == 'in') {
      fields = [
        '2yearInsideRate',
        '2yearRenewalRates',
        'monthlyVisaServiceCharges',
        'vipMedical',
        'extraTyping'
      ];
    } else if (visaTenture.includes('2') && visaType.toLowerCase() === 'out') {
      fields = [
        '2yearOutsideRate',
        '2yearRenewalRates',
        'monthlyVisaServiceCharges',
        'vipMedical',
        'extraTyping'
      ];
    }

    // Retrieve the current values of the specified fields
    const values = getValues(fields);

    // Convert non-numeric values to 0 and calculate the sum
    const total = values.reduce((acc, value) => {
      const numericValue = parseFloat(value) || 0;
      return acc + numericValue;
    }, 0);
    setTotalVisaCharges(total)
    console.log('Total Visa Charges:', total);
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

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  // *For Get Customer Detail
  const getVisaDetail = async () => {
    try {
      let params = { visa_id: id };
      const { data } = await VisaServices.getVisaDetail(params);
      console.log(data);
      setVisaDetail(data?.details);
      setCandidates(data?.details?.candidates.slice(0, 20));
      setTotalPages(Math.ceil(data?.details?.candidates.length / itemsPerPage));
      setCustomerPaymentType(data?.details?.customer?.security_deposit_scenario)
      setOriginalCandidates(data?.details?.candidates)
      setCustomerBalance(data?.details?.customer?.deposit_balance)
      setPayrollPercent(data?.details?.customer?.payroll_percentage)
      setPermissions(formatPermissionData(data?.permissions));
      console.log(formatPermissionData(data?.permissions));
      console.log();

      if (data?.details?.customer?.security_deposit_scenario == 'payroll') {
        setEligibility(data?.details?.customer?.payroll_eligibility)
      }
      else {
        setEligibility(data?.details?.customer?.visa_eligibility)
      }

      setPermissions(formatPermissionData(data?.permissions));
      data?.permissions.forEach((e) => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      });
    } catch (error) {
      showErrorToast(error);
    }
  };

  const UpdateCandidate = async (formData) => {
    setButtonDisabled(true)
    handleClose()
    console.log(formData);

    console.log(candidateIndex);
    // let sum = 0
    // if (visaTenture === '1 year') {
    //   if (visaType === 'In') {
    //     sum += parseFloat(Number(formData["1yearInsideRate"]));
    //   } else if (visaType === 'out') {
    //     sum += parseFloat(Number(formData["1yearOutsideRate"]));
    //   }


    //   sum += parseFloat(Number(formData["vipMedical"])) || 0;

    // } else if (visaTenture === '2 year') {
    //   if (visaType === 'In') {
    //     sum += parseFloat(Number(formData["2yearInsideRate"]));
    //   } else if (visaType === 'out') {
    //     sum += parseFloat(Number(formData["2yearOutsideRate"]));
    //   }

    // }

    try {
      let obj = {

        phone: getValues2('Phone'),
        email: getValues2('email'),
        camp_location: getValues2('campLocation'),
        passport_number: getValues2('passportNumber'),
        camp_location: getValues2('campLocation'),
        passport_expiry: date,
        id: updateCandidate?.id,
        documents: documents
      }
      console.log(obj);
      const promise = VisaServices.CustomerCandidateUpdate(obj);
      console.log(promise);

      showPromiseToast(
        promise,
        "Saving...",
        "Added Successfully",
        "Something Went Wrong"
      );
      setOpen1(false)
      // Await the promise and then check its response
      const response = await promise;
      if (response?.responseCode === 200) {
        getVisaDetail()
      }
      setButtonDisabled(false)

      // // setCandidates((prevCandidates) => [...prevCandidates, obj]);
      // const updatedCandidates = candidates.map(candidate =>
      //   candidate.serial_id === candidateIndex ? obj : candidate
      // );
      // console.log(updatedCandidates);
      // setOpen1(false)
      // // Update the state with the updated candidates array
      // setCandidates(updatedCandidates);
      reset()
      setDocuments([
        {
          name: "Employee Undertaking",
          key: "undertaking",
          path: "",
          expiry_date: null,
          is_required: true


        },
        {
          name: "Company Undertaking",
          key: "cundertaking",
          path: "",
          expiry_date: null,
          is_required: true
        },

        {
          name: "Passport Copy",
          key: "passportcopy",
          path: "",
          expiry_date: null,
          is_required: true
        },
        {
          name: "Digital Photo",
          key: "digitalphoto",
          path: "",
          expiry_date: null,
          is_required: true
        },
        {
          name: "Employment Contract",
          key: "contract",
          path: "",
          expiry_date: null,
          is_required: true
        },
        {
          name: "Offer Letter",
          key: "offerletter",
          path: "",
          expiry_date: null,
          is_required: true
        },
        {
          name: "Previous Emirates Ids",
          key: "emiratesids",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "Previous UAE Visa Copy",
          key: "uaevisa",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "Cancellation",
          key: "cancellation",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "UAE Driving License",
          key: "drivinglicense",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "Work Permit",
          key: "workpermit",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "Other Documents",
          key: "otherdoc",
          path: "",
          expiry_date: null,
          is_required: false
        },

      ])
      console.log(candidates);
      // Add your logic to handle the form data here, e.g., sending it to an API.
    } catch (error) {
      console.error('Error adding candidate:', error);
      // Handle the error appropriately, e.g., displaying an error message to the user.
    }
  }
  console.log(watch(), 'watch');

  const UpdateCandidate3 = async (formData) => {
    console.log(formData, 'watch');

    if (!salaryError) {

      setUpdateDialog2(false)
      console.log(candidateIndex);
      let sum = 0
      let sum2 = 0
      if (visaTenture.includes('1')) {
        if (visaType.toLowerCase() === 'in') {
          sum += parseFloat(Number(formData["1yearInsideRate"]));
        } else if (visaType.toLowerCase() === 'out') {
          sum += parseFloat(Number(formData["1yearOutsideRate"]));
        }


        sum += vipMedicalCheck ? parseFloat(Number(formData["vipMedical"])) || 0 : 0;

      } else if (visaTenture.includes('2')) {
        if (visaType.toLowerCase() === 'in') {
          sum += parseFloat(Number(formData["2yearInsideRate"]));
        } else if (visaType.toLowerCase() === 'out') {
          sum += parseFloat(Number(formData["2yearOutsideRate"]));
        }
        sum += vipMedicalCheck ? parseFloat(Number(formData["vipMedical"])) || 0 : 0;

      }

      if (visaTenture.includes('1')) {
        if (visaType.toLowerCase() === 'in') {
          sum2 += parseFloat(Number(charges?.one_year_inside));
        } else if (visaType.toLowerCase() === 'out') {
          sum2 += parseFloat(Number(charges?.one_year_outside));
        }


        sum2 += vipMedicalCheck ? parseFloat(Number(charges?.medical_extra)) || 0 : 0;

      } else if (visaTenture.includes('2')) {
        if (visaType.toLowerCase() === 'in') {
          sum2 += parseFloat(Number(charges?.two_year_inside));
        } else if (visaType.toLowerCase() === 'out') {
          sum2 += parseFloat(Number(charges?.two_year_outside));
        }
        sum2 += vipMedicalCheck ? parseFloat(Number(formData["vipMedical"])) || 0 : 0;

      }
      console.log(vipMedicalCheck, 'sum2');
      let multiplier = parseFloat(payrollPercent) / 100
      console.log(customerBalance);
      console.log(customerPaymentType === 'visa' ? totalDepositCharges : parseFloat(parseFloat(formData?.basic) + parseFloat(formData?.allowance)) * multiplier);



      try {
        let obj = {
          serial_id: candidateIndex,
          id: updateCandidate?.id,
          name: formData?.candidateName,
          customer_id: updateCandidate?.customer_id,
          visa_id: updateCandidate?.visa_id,
          phone: formData?.Phone,
          email: formData?.email,
          approval_status: "Pending",
          camp_location: formData?.campLocation,
          visa_charges: sum,
          visa_cost: sum2,
          visa_type: visaType,
          visa_tenure: visaTenture,
          employee_id: formData?.employeeid,
          deposit_consumed: customerPaymentType === 'visa' ? totalDepositCharges : parseFloat(parseFloat(formData?.basic) + parseFloat(formData?.allowance)) * multiplier,
          security_deposit_visa: totalDepositCharges,
          payroll_percentage: payrollPercent,
          inside_rate: visaTenture.includes('1') ? formData["1yearInsideRate"] : formData["2yearInsideRate"],
          outside_rate: visaTenture.includes('1') ? formData["1yearOutsideRate"] : formData["2yearOutsideRate"],
          renewal_rate: 0,
          total_deposit_charges: parseFloat(consumed) + (customerPaymentType === 'visa' ? totalDepositCharges : parseFloat(parseFloat(formData?.basic) + parseFloat(formData?.allowance)) * multiplier),
          deposit_balance: parseFloat(customerBalance) - (customerPaymentType === 'visa' ? totalDepositCharges : parseFloat(parseFloat(formData?.basic) + parseFloat(formData?.allowance)) * multiplier),
          vip_medical_temp: formData?.vipMedical,
          vip_medical_extra: vipMedicalCheck ? formData?.vipMedical : null,
          nationality: selectedCountry,
          nationality_id: selectedCountry?.id,
          passport_number: formData?.passportNumber,
          passport_expiry: moment(formData?.passportExp).format('YYYY-MM-DD'),
          visa_designation: formData?.visaDesignation,
          salary_basic: formData?.basic,
          salary_allowance: formData?.allowance,
          salary_total: parseFloat(parseFloat(formData?.basic) + parseFloat(formData?.allowance)).toFixed(2),
          end_consumer: formData?.endConsumer,
          end_consumer_company: formData?.endConsumerCompany,
          documents: documents
        }
        console.log(totalDepositCharges);
        console.log(parseFloat(consumed));
        console.log(parseFloat(formData?.basic) + parseFloat(formData?.allowance));
        console.log(multiplier);

        console.log((customerPaymentType === 'visa' ? totalDepositCharges : parseFloat(parseFloat(formData?.basic) + parseFloat(formData?.allowance)) * multiplier));


        console.log(obj, 'obj');

        // console.log(obj);
        // // setCandidates((prevCandidates) => [...prevCandidates, obj]);
        // const updatedCandidates = candidates.map(candidate =>
        //   candidate.serial_id === candidateIndex ? obj : candidate
        // );
        // console.log(updatedCandidates);
        // setUpdateDialog2(false)
        // // Update the state with the updated candidates array
        // setCandidates(updatedCandidates);
        reset()
        setDocuments([
          {
            name: "Employee Undertaking",
            key: "undertaking",
            path: "",
            expiry_date: null,
            is_required: true


          },
          {
            name: "Company Undertaking",
            key: "cundertaking",
            path: "",
            expiry_date: null,
            is_required: true
          },

          {
            name: "Passport Copy",
            key: "passportcopy",
            path: "",
            expiry_date: null,
            is_required: true
          },
          {
            name: "Digital Photo",
            key: "digitalphoto",
            path: "",
            expiry_date: null,
            is_required: true
          },
          {
            name: "Employment Contract",
            key: "contract",
            path: "",
            expiry_date: null,
            is_required: true
          },
          {
            name: "Offer Letter",
            key: "offerletter",
            path: "",
            expiry_date: null,
            is_required: true
          },
          {
            name: "Previous Emirates Ids",
            key: "emiratesids",
            path: "",
            expiry_date: null,
            is_required: false
          },
          {
            name: "Previous UAE Visa Copy",
            key: "uaevisa",
            path: "",
            expiry_date: null,
            is_required: false
          },
          {
            name: "Cancellation",
            key: "cancellation",
            path: "",
            expiry_date: null,
            is_required: false
          },
          {
            name: "UAE Driving License",
            key: "drivinglicense",
            path: "",
            expiry_date: null,
            is_required: false
          },
          {
            name: "Work Permit",
            key: "workpermit",
            path: "",
            expiry_date: null,
            is_required: false
          },
          {
            name: "Other Documents",
            key: "otherdoc",
            path: "",
            expiry_date: null,
            is_required: false
          },

        ])
        console.log(obj);
        const promise = VisaServices.CustomerCandidateUpdate(obj);
        console.log(promise);

        showPromiseToast(
          promise,
          "Saving...",
          "Added Successfully",
          "Something Went Wrong"
        );
        setOpen1(false)
        // Await the promise and then check its response
        const response = await promise;
        if (response?.responseCode === 200) {
          getVisaDetail()
        }
        setButtonDisabled(false)
        console.log(candidates);
        // Add your logic to handle the form data here, e.g., sending it to an API.
      } catch (error) {
        console.error('Error adding candidate:', error);
        // Handle the error appropriately, e.g., displaying an error message to the user.
      }
    }
    else {
      showErrorToast('Salary Limit Exceeded')
    }
  }

  const handleUpdateCandidate = (item, index) => {
    let serialId = item?.serial_id
    console.log(item);
    setCandidateIndex(item?.serial_id)
    console.log(item?.documents, 'documents');
    if (item?.documents.length > 0) {

      setDocuments(item?.documents)
    }
    else {
      setDocuments([
        {
          name: "Employee Undertaking",
          key: "undertaking",
          path: "",
          expiry_date: null,
          is_required: true


        },
        {
          name: "Company Undertaking",
          key: "cundertaking",
          path: "",
          expiry_date: null,
          is_required: true
        },

        {
          name: "Passport Copy",
          key: "passportcopy",
          path: "",
          expiry_date: null,
          is_required: true
        },
        {
          name: "Digital Photo",
          key: "digitalphoto",
          path: "",
          expiry_date: null,
          is_required: true
        },
        {
          name: "Employment Contract",
          key: "contract",
          path: "",
          expiry_date: null,
          is_required: true
        },
        {
          name: "Offer Letter",
          key: "offerletter",
          path: "",
          expiry_date: null,
          is_required: true
        },
        {
          name: "Previous Emirates Ids",
          key: "emiratesids",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "Previous UAE Visa Copy",
          key: "uaevisa",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "Cancellation",
          key: "cancellation",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "UAE Driving License",
          key: "drivinglicense",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "Work Permit",
          key: "workpermit",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "Other Documents",
          key: "otherdoc",
          path: "",
          expiry_date: null,
          is_required: false
        },

      ])
    }
    setUpdateCandidate(item)
    setOpen1(true)
    console.log(item);
    setValue2('candidateName', item?.name)
    setValue2('Phone', item?.phone)
    setValue2('email', item?.email)
    setValue2('campLocation', item?.camp_location)
    setValue2('passportNumber', item?.passport_number)
    setValue2('passportExp', moment(item?.passport_expiry).format('MM-DD-YYYY'))
    handleDate(item?.passport_expiry)
    setSelectedCountry(item?.nationality)
    setValue2('nationality', item?.nationality)
    setValue2('visaDesignation', item?.visa_designation)
    setValue2('basic', item?.salary_basic)
    setValue2('allowance', item?.salary_allowance)
    setValue2('employeeid', item?.employee_id)
    setValue2('endConsumer', item?.end_consumer)
    setValue2('endConsumerCompany', item?.end_consumer_company)
    setValue2('totalSalary', item?.salary_total)
    setVisaTenture(item?.visa_tenure)
    setVisaType(item?.visa_type)
    if (item?.vip_medical_extra) {
      setVipMedicalCheck(true)
    }
    else {
      setVipMedicalCheck(false)
    }

    setValue2('2yearInsideRate', item?.inside_rate)
    setValue2('2yearOutsideRate', item?.outside_rate)
    setValue2('2yearRenewalRates', item?.renewal_rate)



    setValue2('1yearInsideRate', item?.inside_rate)
    setValue2('1yearOutsideRate', item?.outside_rate)
    setValue2('1yearRenewalRates', item?.renewal_rate)



    setValue2('monthlyVisaServiceCharges', item?.monthly_visa_service)
    setValue2('vipMedical', item?.vip_medical_extra)







  }

  const handleUpdateCandidate3 = (item, index) => {
    let serialId = item?.serial_id
    console.log(item);
    setCandidateIndex(item?.serial_id)
    console.log(item?.documents, 'documents');
    if (item?.documents.length > 0) {

      setDocuments(item?.documents)
    }
    else {
      setDocuments([
        {
          name: "Employee Undertaking",
          key: "undertaking",
          path: "",
          expiry_date: null,
          is_required: true


        },
        {
          name: "Company Undertaking",
          key: "cundertaking",
          path: "",
          expiry_date: null,
          is_required: true
        },

        {
          name: "Passport Copy",
          key: "passportcopy",
          path: "",
          expiry_date: null,
          is_required: true
        },
        {
          name: "Digital Photo",
          key: "digitalphoto",
          path: "",
          expiry_date: null,
          is_required: true
        },
        {
          name: "Employment Contract",
          key: "contract",
          path: "",
          expiry_date: null,
          is_required: true
        },
        {
          name: "Offer Letter",
          key: "offerletter",
          path: "",
          expiry_date: null,
          is_required: true
        },
        {
          name: "Previous Emirates Ids",
          key: "emiratesids",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "Previous UAE Visa Copy",
          key: "uaevisa",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "Cancellation",
          key: "cancellation",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "UAE Driving License",
          key: "drivinglicense",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "Work Permit",
          key: "workpermit",
          path: "",
          expiry_date: null,
          is_required: false
        },
        {
          name: "Other Documents",
          key: "otherdoc",
          path: "",
          expiry_date: null,
          is_required: false
        },

      ])
    }

    setUpdateCandidate(item)
    setUpdateDialog2(true)
    console.log(item);
    setValue3('candidateName', item?.name)
    setValue3('Phone', item?.phone)
    setValue3('email', item?.email)
    setValue3('campLocation', item?.camp_location)
    setValue3('employeeid', item?.employee_id)

    setConsumed(parseFloat(visaDetail?.total_deposit_charges) - parseFloat(item?.deposit_consumed))
    setCustomerBalance(parseFloat(customerBalance) + parseFloat(item?.deposit_consumed))
    setValue3('passportNumber', item?.passport_number)
    setValue3('passportExp', moment(item?.passport_expiry).format('MM-DD-YYYY'))
    handleDate(item?.passport_expiry)
    setSelectedCountry(item?.nationality)
    setValue3('nationality', item?.nationality)
    setValue3('visaDesignation', item?.visa_designation)
    setValue3('basic', item?.salary_basic)
    setValue3('allowance', item?.salary_allowance)
    setValue3('endConsumer', item?.end_consumer)

    setValue3('endConsumerCompany', item?.end_consumer_company)
    setValue3('totalSalary', item?.salary_total)
    setVisaTenture(item?.visa_tenure)
    setVisaType(item?.visa_type)
    if (item?.vip_medical_extra) {
      setVipMedicalCheck(true)
    }
    else {
      setVipMedicalCheck(false)
    }

    setValue3('2yearInsideRate', item?.inside_rate)
    setValue3('2yearOutsideRate', item?.outside_rate)
    setValue3('2yearRenewalRates', item?.renewal_rate)



    setValue3('1yearInsideRate', item?.inside_rate)
    setValue3('1yearOutsideRate', item?.outside_rate)
    setValue3('1yearRenewalRates', item?.renewal_rate)



    setValue3('monthlyVisaServiceCharges', item?.monthly_visa_service)
    setValue3('vipMedical', item?.vip_medical_extra)







  }

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
        let maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          showErrorToast("File Size Must Be Less than 10 MB");
        } else {
          handleUpload(file, arr);
          const path = await handleUpload(file, arr);
          console.log("Uploaded file path:", path);
          console.log(path, "pathpathpath");
          return path;
        }
      } else {
        ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`);
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const totalSalaryCalc = (type) => {
    let multiplier = payrollPercent / 100
    if (type == 'update') {
      console.log();

      let basic = getValues3('basic')
      let allowance = getValues3('allowance')
      if (basic && allowance) {
        let total = parseFloat(basic) + parseFloat(allowance)
        setValue3('totalSalary', total)
        console.log(total);
        console.log(eligibility);
        if (total > eligibility || parseFloat(parseFloat(total) * parseFloat(multiplier)) > customerBalance) {
          setSalaryError(true)
        }
        else {
          setSalaryError(false)
        }
      }
    }
    else {
      let basic = getValues('basic')
      let allowance = getValues('allowance')
      if (basic && allowance) {
        let total = parseFloat(basic) + parseFloat(allowance)
        setValue('totalSalary', total)
        console.log(total);
        console.log(eligibility);
        if (total > eligibility || parseFloat(parseFloat(total) * parseFloat(multiplier)) > customerBalance) {
          setSalaryError(true)
        }
        else {
          setSalaryError(false)
        }
      }
    }

  }

  // *For Get Customer Detail
  const getCustomerDetail = async (id, type) => {
    console.log(updateCandidate);

    try {
      let params = { customer_id: updateCandidate?.customer_id };
      if (updateCandidate?.customer_id) {

        const { data } = await CustomerServices.getCustomerDetail(params);
        console.log(data?.details?.security_deposit_scenario);

        // setCandidates([])
        setCustomerPaymentType(data?.details?.security_deposit_scenario)

        setDepositScenario(data?.details?.security_deposit_scenario)
        if (data?.details?.security_deposit_scenario == 'payroll') {
          setEligibility(data?.details?.payroll_eligibility)
        }
        else {
          setEligibility(data?.details?.visa_eligibility)
        }
        setCustomerDeposit(parseFloat(data?.details?.deposit_total))
        setCustomerDetail(data?.details);
        let details = data?.details
        if (type == 'update') {
          setValue3('1yearInsideRate', details?.one_year_inside)
          setValue3('1yearOutsideRate', details?.one_year_outside)
          setValue3('1yearRenewalRates', details?.one_year_renewal)
          setValue3('2yearInsideRate', details?.two_year_inside)
          setValue3('2yearOutsideRate', details?.two_year_outside)
          setValue3('2yearRenewalRates', details?.two_year_renewal)
          setValue3('monthlyVisaServiceCharges', details?.monthly_visa_service)



          handleTotalVisaCharges()
        }
        setValue('1yearInsideRate', details?.one_year_inside)
        setValue('1yearOutsideRate', details?.one_year_outside)
        setValue('1yearRenewalRates', details?.one_year_renewal)
        setValue('2yearInsideRate', details?.two_year_inside)
        setValue('2yearOutsideRate', details?.two_year_outside)
        setValue('2yearRenewalRates', details?.two_year_renewal)
        setValue('monthlyVisaServiceCharges', details?.monthly_visa_service)
        setValue('vipMedical', details?.medical_extra)
        setValue2('vipMedical', details?.medical_extra)
        if (parseFloat(details?.medical_extra) > 0) {
          setVipMedicalCheck(true)
        }
        else {
          setVipMedicalCheck(false)
        }


        handleTotalVisaCharges()
      }


    } catch (error) {
      showErrorToast(error);
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

        console.log(data, "asddasasd");
        return data?.data?.path;
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const steps = [
    { label: 'Select campaign settings', rejectionDate: '2024-10-01', rejectionReason: 'Budget too low' },
    { label: 'Create an ad group', rejectionDate: '2024-10-01', rejectionReason: 'Target audience not defined' },
    { label: 'Create an ad', rejectionDate: '2024-10-02', rejectionReason: 'Invalid ad format' },
  ];

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
  const handleCheckboxChange = (name) => (event) => {
    console.log(name);
    setFieldsDisabled({
      ...fieldsDisabled,
      [name]: !event.target.checked,
    });
  };

  const handleDocArrayUpdate = async (field, value, key) => {
    console.log(documents);

    if (field === 'path') {
      const updatedDocuments = documents.map(doc => {
        if (doc.key === key) {
          return { ...doc, path: value }; // Update the path
        }
        return doc; // Return the document as is if the key doesn't match
      });
      console.log(updatedDocuments);
      // Assuming you want to update the documents array
      // You can replace the following line with your state updating logic
      setDocuments(updatedDocuments)
    } else {
      const updatedDocuments = documents.map(doc => {
        if (doc.key === key) {
          return { ...doc, expiry_date: moment(value).format('MM-DD-YYYY') }; // Update the path
        }
        return doc; // Return the document as is if the key doesn't match
      });
      console.log(updatedDocuments);
      setDocuments(updatedDocuments)
      // Handle other fields if needed
    }
  }

  const handleDownload = async (path, name) => {
    try {
      const url = `${process.env.REACT_APP_IMAGE_BASE_URL}${path}`;
      window.open(url, "_blank");
      // let params = { path: path, name: `${name}.png` };
      // const response = await SystemServices.downloadDocuments(params, { responseType: 'blob' });

      // // Create a Blob from the response data
      // const blob = new Blob([response], { type: 'image/png' });
      // const url = URL.createObjectURL(blob);

      // // Create a link element, set its href to the blob URL, and trigger a click to download
      // const link = document.createElement('a');
      // link.href = url;

      // link.download = name || 'download.png'; // Set the desired filename here
      // document.body.appendChild(link);
      // // Set the href attribute to the URL you want to open
      // link.href = link;

      // // Set the target attribute to '_blank' to open the link in a new tab
      // link.target = '_blank';

      // // Append the link to the body (not necessary for the link to work, but needed for click simulation)
      // document.body.appendChild(link);

      // // Simulate a click on the link
      // // link.click();
      // window.location.href = link

      // // Clean up by removing the link element and revoking the object URL
      // document.body.removeChild(link);
      // URL.revokeObjectURL(url);
    } catch (error) {
      showErrorToast(error);
    }
  };

  // *For Reset User Password

  useEffect(() => {
    if (id) {
      getVisaDetail();
      getCountries();
      getData()
    }
  }, [id]);


  return (
    <Box sx={{ p: 3 }}>
      <Dialog
        component={'form'} onSubmit={handleSubmit3(UpdateCandidate3)}
        open={updateDialog2}

        maxWidth={'md'}
        fullWidth={true}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Update Candidate</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            <Grid container spacing={2}>
              <Grid container mt={5} pl={3}>
                <Grid item xs={3} sm={3}>
                  <Typography sx={{ fontSize: '15px', color: Colors.black, mb: 2, fontWeight: 'bold' }}>Visa Type : </Typography>
                  <FormControl>
                    <RadioGroup
                      row
                      defaultValue={visaType}

                      onChange={(e) => {
                        setVisaType(e.target.value);
                        console.log(getValues('1yearInsideRate'));
                        console.log(getValues('1yearOutsideRate'));
                        getCustomerDetail(selectedCustomer?.id, 'update')
                        setTimeout(() => {
                          setValue3('2yearInsideRate', getValues('2yearInsideRate'))
                          setValue3('2yearOutsideRate', getValues('2yearOutsideRate'))
                          console.log(getValues('1yearInsideRate'), 'asdasdasdasd');
                        }, 999999);
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
                  <Typography sx={{ fontSize: '15px', color: Colors.black, mb: 2, fontWeight: 'bold' }}>Visa Tenure : </Typography>
                  <FormControl>
                    <RadioGroup
                      row
                      defaultValue={visaTenture}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setVisaTenture(e.target.value);
                        getCustomerDetail(selectedCustomer?.id, 'update')
                      }}
                    >
                      <FormControlLabel
                        sx={{ color: "#000" }}
                        value="1 year"
                        disabled={true}
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
              <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.textColorDarkBlue, p: 3 }}>Visa Rates : </Typography>
              {<Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mt: 3 }}>{visaTenture.includes('1') ? "1 Year Rates " : "2 Years Rates "}</Typography>}

              <Grid container pl={3}>

                {visaTenture.includes('1') && visaType.toLowerCase() == 'in' && <Grid container sx={{ gap: '20px 25px' }}>


                  <Grid item xs={5} >
                    <LabelCustomInput label={'Year Inside Rates :* '} disabled={true} StartLabel={'AED'} register={register3("1yearInsideRate", { required: "Enter year inside rate", onChange: () => handleTotalVisaCharges() })} />
                  </Grid>

                  {/* <Grid item xs={5} >
                                        <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false }  StartLabel={'AED'} register={register2("1yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                    </Grid> */}



                </Grid>}
                {visaTenture.includes('1') && visaType.toLowerCase() == 'out' && <Grid container sx={{ gap: '20px 25px' }}>


                  <Grid item xs={5} >
                    <LabelCustomInput label={'Year Outside Rates :*  '} disabled={true} StartLabel={'AED'} register={register3("1yearOutsideRate", { required: "Enter year outside rate", onChange: () => handleTotalVisaCharges() })} />
                  </Grid>

                  {/* <Grid item xs={5} >
                                        <LabelCustomInput label={'Renewal Rates :*  '}  disabled={user?.user_type == 'C' ? true : false } StartLabel={'AED'} register={register2("1yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                    </Grid> */}



                </Grid>}

                {visaTenture.includes('2') && visaType == 'in' && <>

                  <Grid container sx={{ gap: '20px 25px' }}>

                    <Grid item xs={5} >
                      <LabelCustomInput label={'Year Inside Rates :*  '} disabled={true} StartLabel={'AED'} register={register3("2yearInsideRate", { required: "Enter year inside rate", onChange: () => handleTotalVisaCharges() })} />

                    </Grid>


                    {/* <Grid item xs={5} >
                                            <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false } StartLabel={'AED'} register={register2("2yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                        </Grid> */}



                  </Grid></>}
                {visaTenture.includes('2') && visaType.toLowerCase() == 'out' && <>

                  <Grid container sx={{ gap: '20px 25px' }}>

                    <Grid item xs={5} >
                      <LabelCustomInput label={'Year Outside Rates :*  '} disabled={true} StartLabel={'AED'} register={register3("2yearOutsideRate", { required: "Enter year outside rate", onChange: () => handleTotalVisaCharges() })} />
                    </Grid>

                    {/* 
                                        <Grid item xs={5} >
                                            <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false } StartLabel={'AED'} register={register2("2yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                        </Grid> */}



                  </Grid></>}
              </Grid>
              <Grid container p={3}>
                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mb: 2 }}>Extra Costing : </Typography>

                <Grid container sx={{ gap: '20px 25px' }}>

                  <Grid item xs={5}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ marginTop: '22px' }}>
                        {<Checkbox checked={vipMedicalCheck} disabled={true} onChange={(e) => {
                          console.log(!vipMedicalCheck);
                          if (!vipMedicalCheck == true) {
                            console.log(updateCandidate);


                            setValue3('vipMedical', updateCandidate?.vip_medical_temp)
                          }

                          setVipMedicalCheck(!vipMedicalCheck)
                        }} />}
                      </Box>
                      <LabelCustomInput
                        label="VIP Medical Extra Charges : "
                        StartLabel="AED"
                        disabled={true}
                        register={register3('vipMedical')}


                      />

                    </Box>
                  </Grid>


                </Grid>
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Candidate Name :"}
                  size={'small'}
                  fullWidth={true}
                  placeholder={"Candidate Name"}
                  error={errors3?.candidateName?.message}
                  register={register3("candidateName", {
                    required:
                      "Please enter your candidate name."

                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Phone :"}
                  size={'small'}
                  fullWidth={true}
                  type={'number'}
                  placeholder={"Phone"}
                  error={errors3?.Phone?.message}
                  register={register3("Phone", {
                    required:
                      "Please enter your Phone.",
                    pattern: {
                      value: /^05[0-9]{8}$/,
                      message: "Please enter a valid UAE phone number (starting with 05 and 8 digits)."
                    }

                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Email :"}
                  size={'small'}
                  fullWidth={true}
                  placeholder={"Email "}
                  error={errors3?.email?.message}
                  register={register3("email", {
                    required:
                      "Please enter your email."

                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Camp Location  :"}
                  size={'small'}
                  fullWidth={true}
                  placeholder={"Camp Location "}
                  error={errors3?.campLocation?.message}
                  register={register3("campLocation", {
                    required:
                      "Please enter your camp location."

                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Employee ID :*"}
                  size={'small'}
                  fullWidth={true}


                  placeholder={"Employee ID"}
                  error={errors3?.employeeid?.message}
                  register={register3("employeeid", {
                    required:
                      "Please enter your employee id."

                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <SelectField
                  size={'small'}
                  label={'Nationality :*'}
                  options={countries}
                  selected={selectedCountry}
                  onSelect={(value) => setSelectedCountry(value)}
                  error={errors3?.nationality?.message}
                  register={register3("nationality", {
                    required: 'Please select nationality'
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Passport Number :"}
                  size={'small'}
                  fullWidth={true}
                  placeholder={"Passport Number"}
                  error={errors3?.passportNumber?.message}
                  register={register3("passportNumber", {
                    required:
                      "Please enter your passport number."

                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label={"Passport Expiry :*"}
                  value={date}
                  disablePast={true}
                  minDate={addDays(addMonths(new Date(), 6), 1)}
                  size={'small'}
                  error={errors3?.passportExp?.message}
                  {...register3("passportExp", {
                    required: "Please enter your passport expiry date.",
                    validate: (value) => {
                      const minAllowedDate = addMonths(new Date(), 6);
                      console.log(value, 'value');
                      console.log(moment(minAllowedDate), 'value');
                      console.log(moment(value) > moment(minAllowedDate), 'value');

                      return moment(value) > moment(minAllowedDate) || "Passport expiry date must be at least 6 months from today.";
                    },
                  })}
                  onChange={(date) => {
                    handleDate(date);
                    setValue3("passportExp", date, { shouldValidate: true });
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Visa Designation :"}
                  size={'small'}
                  fullWidth={true}
                  placeholder={"Visa Designation"}
                  error={errors3?.visaDesignation?.message}
                  register={register3("visaDesignation", {
                    required:
                      "Please enter your visa designation ."

                  })}
                />
              </Grid>
              <Grid item xs={12} >
                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue }}>Salary : </Typography>
              </Grid>
              <Grid item xs={6} >
                <LabelCustomInput label={'Basic : '} StartLabel={'AED'} placeholder={'Basic'} error={errors?.basic?.message} register={register3("basic", { required: "Enter basic  salary", onChange: (e) => totalSalaryCalc('update') })} />
              </Grid>
              <Grid item xs={6} >
                <LabelCustomInput allowance={true} label={'Allowance : '} StartLabel={'AED'} placeholder={'Allowance'} error={errors?.allowance?.message} register={register3("allowance", { required: "Enter allowance ", onChange: (e) => totalSalaryCalc('update') })} />
              </Grid>
              <Grid item xs={6} >
                <LabelCustomInput disabled={true} label={'Total Salary : '} StartLabel={'AED'} placeholder={'Total'} register={register3("totalSalary")} />
                {(customerPaymentType == 'payroll' && salaryError) ? <p style={{ color: 'red' }}>Salary Limit Exceeded </p> : ''}
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
                  size={'small'}
                  fullWidth={true}
                  placeholder={"End Consumer Company "}
                  error={errors3?.endConsumerCompany?.message}
                  register={register3("endConsumerCompany", {
                    required:
                      "Please enter your end consumer company ."

                  })}
                />
              </Grid>

              <Grid item xs={12} >
                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue }}>Documents : </Typography>
              </Grid>
              {documents?.length > 0 && documents?.map((item, index) => (


                <Grid item xs={5} >
                  <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray }}>{item?.is_required ? item?.name : item?.name + '(If Any)'} :{item?.is_required ? '*' : ' '} </Typography>
                  <UploadFile
                    Memo={true}
                    accept={allowFilesType}
                    file={documents}
                    multiple={true}
                    updateResult={updateResult}
                    fileId={item?.key}
                    error={errors3[item?.key]?.message}
                    loader={loader}
                    disabled={isUploading}
                    register={register3(`${item?.key}`, {
                      required: item?.is_required ? documents.find((item2 => item2?.key == item?.key))?.path != '' ? false :
                        "Please upload document." : false,
                      onChange: async (e) => {
                        setIsUploading(true); // Set uploading to true when the upload starts
                        const path = await handleUploadDocument(e, item?.key);
                        if (path) {
                          handleDocArrayUpdate('path', path, item?.key);
                          console.log(path);
                        }
                        setIsUploading(false); // Reset uploading status when done
                      }
                    })}
                  />


                </Grid>


              ))}


            </Grid>

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button sx={{ fontFamily: 'Public Sans' }} onClick={() => { setUpdateDialog2(false); setCustomerBalance(parseFloat(customerBalance) - parseFloat(updateCandidate?.deposit_consumed)); setConsumed(parseFloat(consumed) - parseFloat(updateCandidate?.deposit_consumed)) }}>Cancel</Button>
          <Button sx={{ fontFamily: 'Public Sans' }} disabled={(customerPaymentType == 'payroll' && salaryError) ? true : false} type='submit'>Update</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        component={'form'} onSubmit={handleSubmit2(UpdateCandidate)}
        open={open1}

        maxWidth={'md'}
        fullWidth={true}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Update Candidate</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            <Grid container spacing={2}>
              <Grid container mt={5} pl={3}>
                <Grid item xs={3} sm={3}>
                  <Typography sx={{ fontSize: '15px', color: Colors.black, mb: 2, fontWeight: 'bold' }}>Visa Type : </Typography>
                  <Typography sx={{ fontSize: '15px', color: Colors.black, mb: 2, fontWeight: 'bold' }}> {visaType}</Typography>
                  {/*                  
                  <FormControl>
                    <RadioGroup
                      row
                      defaultValue={visaType}
                      onChange={(e) => {
                        setVisaType(e.target.value);
                      }}
                    >
                      <FormControlLabel
                        sx={{ color: "#000" }}
                        value="In"
                        control={<Radio />}
                        label="In"
                      />
                      <FormControlLabel
                        sx={{ color: "#000" }}
                        value="out"
                        control={<Radio />}
                        label="Out"
                      />
                    </RadioGroup>
                  </FormControl> */}
                </Grid>
                <Grid item xs={3} sm={3}>
                  <Typography sx={{ fontSize: '15px', color: Colors.black, mb: 2, fontWeight: 'bold' }}>Visa Tenure : </Typography>
                  <Typography sx={{ fontSize: '15px', color: Colors.black, mb: 2, fontWeight: 'bold' }}>{visaTenture} </Typography>
                  {/* <FormControl>
                    <RadioGroup
                      row
                      defaultValue={visaTenture}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setVisaTenture(e.target.value);
                      }}
                    >
                      <FormControlLabel
                        sx={{ color: "#000" }}
                        value="1 year"
                        control={<Radio />}
                        label="1 Year"
                      />
                      <FormControlLabel
                        sx={{ color: "#000" }}
                        value="2 year"
                        control={<Radio />}
                        label="2 Years"
                      />
                    </RadioGroup>
                  </FormControl> */}
                </Grid>

              </Grid>
              <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.textColorDarkBlue, p: 3 }}>Visa Rates : </Typography>
              {<Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mt: 3 }}>{visaTenture.includes('1') ? "1 Year Rates " : "2 Years Rates "}</Typography>}

              <Grid container pl={3}>

                {visaTenture.includes('1') && visaType.toLowerCase() == 'in' && <Grid container sx={{ gap: '20px 25px' }}>


                  <Grid item xs={5} >
                    <LabelCustomInput label={'Year Inside Rates :* '} disabled={true} StartLabel={'AED'} register={register2("1yearInsideRate", { required: false, onChange: () => handleTotalVisaCharges() })} postfix={true} />
                  </Grid>

                  {/* <Grid item xs={5} >
                                        <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false }  StartLabel={'AED'} register={register2("1yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                    </Grid> */}



                </Grid>}
                {visaTenture.includes('1') && visaType.toLowerCase() == 'out' && <Grid container sx={{ gap: '20px 25px' }}>


                  <Grid item xs={5} >
                    <LabelCustomInput label={'Year Outside Rates :*  '} disabled={true} StartLabel={'AED'} register={register2("1yearOutsideRate", { required: false, onChange: () => handleTotalVisaCharges() })} postfix={true} />
                  </Grid>

                  {/* <Grid item xs={5} >
                                        <LabelCustomInput label={'Renewal Rates :*  '}  disabled={user?.user_type == 'C' ? true : false } StartLabel={'AED'} register={register2("1yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                    </Grid> */}



                </Grid>}

                {visaTenture.includes('2') && visaType.toLowerCase() == 'in' && <>

                  <Grid container sx={{ gap: '20px 25px' }}>

                    <Grid item xs={5} >
                      <LabelCustomInput label={'Year Inside Rates :*  '} disabled={true} StartLabel={'AED'} register={register2("2yearInsideRate", { required: false, onChange: () => handleTotalVisaCharges() })} postfix={true} />

                    </Grid>


                    {/* <Grid item xs={5} >
                                            <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false } StartLabel={'AED'} register={register2("2yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                        </Grid> */}



                  </Grid></>}
                {visaTenture.includes('2') && visaType.toLowerCase() == 'out' && <>

                  <Grid container sx={{ gap: '20px 25px' }}>

                    <Grid item xs={5} >
                      <LabelCustomInput label={'Year Outside Rates :*  '} disabled={true} StartLabel={'AED'} register={register2("2yearOutsideRate", { required: false, onChange: () => handleTotalVisaCharges() })} postfix={true} />
                    </Grid>

                    {/* 
                                        <Grid item xs={5} >
                                            <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false } StartLabel={'AED'} register={register2("2yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                        </Grid> */}



                  </Grid></>}
              </Grid>
              <Grid container p={3}>
                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mb: 2 }}>Extra Costing : </Typography>

                <Grid container sx={{ gap: '20px 25px' }}>

                  <Grid item xs={5}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ marginTop: '22px' }}>
                        {<Checkbox checked={vipMedicalCheck} disabled={true} onChange={() => setVipMedicalCheck(!vipMedicalCheck)} />}
                      </Box>
                      <LabelCustomInput
                        label="VIP Medical Extra Charges : "
                        StartLabel="AED"
                        register={register2('vipMedical', { required: false })}
                        postfix={user?.user_type == 'C' ? false : true}
                        disabled={true}
                      />

                    </Box>
                  </Grid>


                </Grid>
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Candidate Name :"}
                  size={'small'}
                  fullWidth={true}
                  disabled={true}
                  placeholder={"Candidate Name"}
                  error={errors2?.candidateName?.message}
                  register={register2("candidateName", {
                    required:
                      false

                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Phone :"}
                  size={'small'}
                  fullWidth={true}
                  type={'number'}
                  placeholder={"Phone"}
                  error={errors2?.Phone?.message}
                  register={register2("Phone", {
                    required:
                      "Please enter your Phone.",
                    pattern: {
                      value: /^05[0-9]{8}$/,
                      message: "Please enter a valid UAE phone number (starting with 05 and 8 digits)."
                    }

                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Email :"}
                  size={'small'}
                  fullWidth={true}
                  placeholder={"Email "}
                  error={errors2?.email?.message}
                  register={register2("email", {
                    required:
                      "Please enter your email."

                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Camp Location  :"}
                  size={'small'}
                  fullWidth={true}
                  placeholder={"Camp Location "}
                  error={errors2?.campLocation?.message}
                  register={register2("campLocation", {
                    required:
                      "Please enter your camp location."

                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Employee ID  :"}
                  size={'small'}
                  fullWidth={true}
                  disabled={true}
                  placeholder={"Employee ID "}
                  error={errors2?.employeeid?.message}
                  register={register2("employeeid", {
                    required:
                      "Please enter your employee id."

                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <SelectField
                  size={'small'}
                  label={'Nationality :*'}
                  options={countries}
                  disabled={true}
                  selected={selectedCountry}
                  onSelect={(value) => setSelectedCountry(value)}
                  error={errors2?.nationality?.message}
                  register={register2("nationality", {
                    required: false
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <InputField
                  label={"Passport Number :"}
                  size={'small'}

                  fullWidth={true}
                  placeholder={"Passport Number"}
                  error={errors2?.passportNumber?.message}
                  register={register2("passportNumber", {
                    required:
                      'passport number is required'

                  })}
                />
              </Grid>
              <Grid item xs={6}>
              <DatePicker
                  label={"Passport Expiry :*"}
                  value={date}
                  disablePast={true}
                  minDate={addDays(addMonths(new Date(), 6), 1)}
                  size={'small'}
                  error={errors2?.passportExp?.message}
                  {...register2("passportExp", {
                    required: "Please enter your passport expiry date.",
                    validate: (value) => {
                      const minAllowedDate = addMonths(new Date(), 6);
                      console.log(value, 'value');
                      console.log(moment(minAllowedDate), 'value');
                      console.log(moment(value) > moment(minAllowedDate), 'value');

                      return moment(value) > moment(minAllowedDate) || "Passport expiry date must be at least 6 months from today.";
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
                  size={'small'}
                  disabled={true}
                  fullWidth={true}
                  placeholder={"Visa Designation"}
                  error={errors2?.visaDesignation?.message}
                  register={register2("visaDesignation", {
                    required:
                      false

                  })}
                />
              </Grid>
              <Grid item xs={12} >
                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue }}>Salary : </Typography>
              </Grid>
              <Grid item xs={6} >
                <LabelCustomInput label={'Basic : '} disabled={true} StartLabel={'AED'} placeholder={'Basic'} error={errors?.basic?.message} register={register2("basic", { required: false, onChange: (e) => totalSalaryCalc('update') })} />
              </Grid>
              <Grid item xs={6} >
                <LabelCustomInput label={'Allowance : '} disabled={true} StartLabel={'AED'} placeholder={'Allowance'} error={errors?.allowance?.message} register={register2("allowance", { required: false, onChange: (e) => totalSalaryCalc('update') })} />
              </Grid>
              <Grid item xs={6} >
                <LabelCustomInput label={'Total Salary : '} StartLabel={'AED'} placeholder={'Total'} register={register2("totalSalary")} disabled={true} />
                {(customerPaymentType == 'payroll' && salaryError) ? <p style={{ color: 'red' }}>Salary Limit Exceeded </p> : ''}
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
                  size={'small'}
                  fullWidth={true}
                  disabled={true}
                  placeholder={"End Consumer Company "}
                  error={errors2?.endConsumerCompany?.message}
                  register={register2("endConsumerCompany", {
                    required:
                      false

                  })}
                />
              </Grid>

              <Grid item xs={12} >
                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue }}>Documents : </Typography>
              </Grid>
              {documents?.length > 0 && documents.map((item, index) => (
                <Grid item xs={5} key={index}>
                  <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray }}>
                    {item?.is_required ? item?.name : `${item?.name} (If Any)`} : {item?.is_required ? '*' : ' '}
                  </Typography>
                  <UploadFile
                    Memo={true}
                    accept={allowFilesType}
                    file={documents}
                    multiple={true}
                    disabled={isUploading}
                    updateResult={updateResult}
                    fileId={item?.key}
                    error={errors2[item?.key]?.message}
                    register={register2(`${item?.key}`, {
                      required: item?.is_required ? documents.find((item2 => item2?.key == item?.key))?.path != '' ? false :
                        "Please upload document." : false,
                      onChange: async (e) => {
                        setIsUploading(true); // Set uploading to true when the upload starts
                        const path = await handleUploadDocument(e, item?.key);
                        if (path) {
                          handleDocArrayUpdate('path', path, item?.key);
                          console.log(path);
                        }
                        setIsUploading(false); // Reset uploading status when done
                      }
                    })}
                  />
                </Grid>
              ))}



            </Grid>

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button sx={{ fontFamily: 'Public Sans' }} onClick={() => setOpen1(false)}>Cancel</Button>
          <Button sx={{ fontFamily: 'Public Sans' }} disabled={buttonDisabled}
            type='submit'>Update</Button>
        </DialogActions>
      </Dialog>
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
                  { id: "Approved", name: "Approved" },
                  { id: "Rejected", name: "Rejected" },
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
            {status?.id == 'Rejected' && <Grid item xs={12} sm={12}>
              <InputField
                label={"Reason :*"}
                size={"small"}

                multiline={true}
                rows={5}
                placeholder={"Reason"}
                error={errors?.reason?.message}
                register={register("reason", {
                  required: 'Please Enter Reason',
                })}
              />
            </Grid>}

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
                  disabled={buttonDisabled}
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
        open={rejectionDialog}
        onClose={() => setRejectionDialog(false)}
        title={"Rejections"}
      >
        <Box >
          <Grid container spacing={2}>

            <Box sx={{ width: '100%' }}>
              <Stepper activeStep={-1} orientation="vertical">
                {rejections?.map((item, index) => (
                  <Step key={index}>
                    <StepLabel StepIconComponent={() => <ErrorIcon sx={{ color: red[500] }} />}>
                      <Typography variant="body2" color={'black'}>
                        <span style={{ fontWeight: 'bold' }}>Rejection Date : </span> {moment(item?.created_at).format('DD-MM-YYYY')}
                      </Typography>
                      <Typography variant="body2" color={'black'}>
                        <span style={{ fontWeight: 'bold' }}>Reason : </span> {item?.reason}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

          </Grid>
        </Box>
      </SimpleDialog>
      {/* <SimpleDialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
                title={"Change Status?"}
            >
                <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
                    <Grid container >
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={"small"}
                                label={"Select Status :"}
                                options={statuses}
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
                                    onClick={() => setStatusDialog(false)}
                                    bgcolor={"#FF1F25"}
                                    title="No,Cancel"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog> */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          alignItems: "flex-end",
        }}
      >
        <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
          VISA DETAIL
        </Typography>
        <PrimaryButton
          title="Back"
          style={{ backgroundColor: Colors.greyShade }}
          onClick={() => navigate(-1)}
        />
        {/* <Box sx={{ display: 'flex', gap: '10px' }}>
          <PrimaryButton
           bgcolor={'#001f3f'}
            title="Edit"
            onClick={() => navigate(`/update-customer/${id}`)}


          />

        </Box> */}
      </Box>
      <Grid
        container
        sx={{
          mt: 5,
          border: "1px solid #B6B6B6",
          borderRadius: "8px",
          p: "15px",
          justifyContent: "space-between",
        }}
      >
        <Grid item xs={4}>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Typography sx={{ fontSize: "14px" }} variant="body1">
                Company Name:
              </Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                sx={{ fontSize: "14px", color: "#0F2772" }}
                variant="body1"
              >
                {visaDetail?.customer?.name}
              </Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography sx={{ fontSize: "14px" }} variant="body1">
                Business Address:
              </Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                sx={{ fontSize: "14px", color: "#0F2772" }}
                variant="body1"
              >
                {visaDetail?.customer?.address}
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography sx={{ fontSize: "14px" }} variant="body1">
                Phone Number:
              </Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                sx={{ fontSize: "14px", color: "#0F2772" }}
                variant="body1"
              >
                {visaDetail?.customer?.userDetail?.phone}
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography sx={{ fontSize: "14px" }} variant="body1">
                Email :
              </Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                sx={{ fontSize: "14px", color: "#0F2772" }}
                variant="body1"
              >
                {visaDetail?.customer?.userDetail?.email}
              </Typography>
            </Grid>

            {/* <Grid item xs={5}>
                            <Typography sx={{ fontSize: '14px' }} variant="body1">Website:</Typography>
                        </Grid> */}
            {/* <Grid item xs={7}>
                            <Link sx={{ fontSize: '14px', color: '#0F2772 !important' }} href={visaDetail?.customer?.website} target="_blank" rel="noopener noreferrer">
                                {visaDetail?.customer?.website}
                            </Link>
                        </Grid> */}
          </Grid>
        </Grid>
        <Grid item xs={4} display={"flex"} justifyContent={"center"}>
          <Box>
            <Avatar
              alt="Remy Sharp"
              src={
                visaDetail?.logo
                  ? process.env.REACT_APP_IMAGE_BASE_URL + visaDetail?.logo
                  : Images.logoDarkCircle
              }
              sx={{ width: 100, height: 100 }}
            />
          </Box>
        </Grid>
        {/* <Grid item xs={4}>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Typography sx={{ fontSize: "14px" }} variant="body1">
                Guarantor Name:
              </Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                sx={{ fontSize: "14px", color: "#0F2772" }}
                variant="body1"
              >
                {visaDetail?.customer?.guarantor_name}
              </Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography sx={{ fontSize: "14px" }} variant="body1">
                Guarantor Number:
              </Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography
                sx={{ fontSize: "14px", color: "#0F2772" }}
                variant="body1"
              >
                {visaDetail?.customer?.guarantor_number}
              </Typography>
            </Grid>

       
          </Grid>
        </Grid> */}
      </Grid>
      <Box p={2}>
        <Typography
          mb={2}
          mt={2}
          sx={{ color: "#03091A", fontWeight: "bold" }}
          variant="h6"
        >
          Security Deposit:
        </Typography>
        <Grid container spacing={4}>
          {/* Security Deposit Section */}

          <Grid item xs={12} sm={6}>
            <Typography mb={2} mt={2} variant="body1">
              Security Deposit Scenario:{" "}
              <strong style={{ color: "#0F2772" }}>
                {visaDetail?.customer?.security_deposit_scenario.toLowerCase() == "visa"
                  ? "VISA"
                  : "PAYROLL"}
              </strong>
            </Typography>

            {visaDetail?.customer?.security_deposit_scenario.toLowerCase() != "visa" && <Typography mb={2} mt={2} variant="body1">
              Payroll Percentage:{" "}
              <strong style={{ color: "#0F2772" }}>
                {visaDetail?.customer?.payroll_percentage} %
              </strong>
            </Typography>}
            <Typography mb={2} mt={2} variant="body1">
              Security Deposit:{" "}
              <strong style={{ color: "#0F2772" }}>
                {visaDetail?.customer?.deposit_total} AED
              </strong>
            </Typography>
            <Typography mb={2} mt={2} variant="body1">
              Previously Consumed:{" "}
              <strong style={{ color: "#0F2772" }}>
                {parseFloat(visaDetail?.customer?.deposit_total) - parseFloat(visaDetail?.last_deposit_balance || 0)} AED
              </strong>
            </Typography>


          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography mb={2} mt={2} variant="body1">
              Deposit Available:{" "}
              <strong style={{ color: "#0F2772" }}>
                {visaDetail?.last_deposit_balance || 0} AED

              </strong>
            </Typography>

            {/* <Typography mb={2} mt={2} variant="body1">
              {visaDetail?.customer?.security_deposit_scenario == "payroll"
                ? "Payroll Eligibility:"
                : "Total Visa Quantity:"}{" "}
              <strong style={{ color: "#0F2772" }}>
                {visaDetail?.customer?.security_deposit_scenario == "payroll"
                  ? visaDetail?.customer?.payroll_eligibility + " " + "AED"
                  : visaDetail?.customer?.visa_eligibility}
              </strong>
            </Typography> */}
               {visaDetail?.customer?.security_deposit_scenario == 'visa' && <Typography mb={2} mt={2} variant="body1">{ 'Visa Eligibility Remaining : '} <strong style={{ color: "#0F2772" }}> { visaDetail?.customer?.visa_eligibility_remaining} </strong></Typography>}

            <Typography mb={2} mt={2} variant="body1">
              This VR Consumption:{" "}
              <strong style={{ color: "#0F2772" }}>
                {visaDetail?.total_deposit_charges} AED
              </strong>
            </Typography>
            <Typography mb={2} mt={2} variant="body1">
              Final Balance:{" "}
              <strong style={{ color: "#0F2772" }}>
                {visaDetail?.current_deposit_balance || 0} AED
              </strong>
            </Typography>
          </Grid>
        </Grid>
        <Typography
          mb={2}
          mt={2}
          sx={{ color: "#03091A", fontWeight: "bold" }}
          variant="h6"
        >
          Total Visa Charges: <strong style={{ color: "#0F2772" }}>
            {visaDetail?.total_visa_charges || 0} AED
          </strong>
        </Typography>
        <Grid container>
          <Box>
            <Typography
              sx={{ color: "#03091A", fontWeight: "bold" }}
              variant="h6"
            >
              Candidates :
            </Typography>
          </Box>
        </Grid>

        <Grid container mt={2}>
          <Grid item md={12}>
            {
              <Box>
                {candidates.length > 0 && (
                  <Fragment>
                    <PDFExport
                      landscape={true}
                      paperSize="A4"
                      margin={5}
                      fileName="Import Customers"
                    >
                      <TableContainer
                        component={Paper}
                        sx={{
                          maxHeight: "calc(100vh - 200px)",
                          backgroundColor: "transparent",
                          boxShadow: "none !important",
                          borderRadius: "0px !important",
                        }}
                      >
                        <Table stickyHeader sx={{ minWidth: 500 }}>
                          <TableHead>
                            <Row>
                              {tableHead1.map((cell, index) => (
                                <Cell
                                  style={{
                                    textAlign:
                                      cell?.name == "SR No."
                                        ? "center"
                                        : "left",
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
                                    {cell?.name}
                                  </Box>
                                </Cell>
                              ))}
                            </Row>
                          </TableHead>
                          <TableBody>
                            {candidates.length > 0 && candidates?.sort((a, b) => a.serial_id - b.serial_id).map((item, index) => {
                              console.log(item?.statuses);
                              let sorteddata = item?.statuses?.sort(
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
                                    style={{ textAlign: "center" }}
                                    className="pdf-table"
                                  >
                                    {item?.visa_id + "_" + item?.serial_id}
                                  </Cell>
                                  <Cell
                                    style={{ textAlign: "left" }}
                                    className="pdf-table"
                                  >
                                    {moment(item?.created_at).format(
                                      "YYYY-MM-DD"
                                    )}
                                  </Cell>
                                  <Cell
                                    style={{ textAlign: "left" }}
                                    className="pdf-table"
                                  >
                                    {visaDetail?.customer?.name}
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
                                    {item?.visa_charges}
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
                                        alignItems: "center",
                                      }}
                                      onClick={() => {
                                        if (visaDetail?.payment_status == 'paid' && item?.approval_status == "Pending" && user?.user_type != 'C') {
                                          setValue('reason', '')
                                          setStatusDialog(true);
                                        } else if (visaDetail?.payment_status != 'paid' && user?.user_type != 'C') {
                                          showErrorToast("Please complete payment before updating")
                                        }
                                        setSelectedVisa(item);
                                      }}
                                    >
                                      <Box
                                        component={"img"}
                                        src={
                                          item?.approval_status === "Pending"
                                            ? Images.pendingIcon
                                            : item?.approval_status === "Approved"
                                              ? Images.successIcon
                                              : item?.approval_status === "Rejected"
                                                ? Images.errorIcon : ""

                                        }
                                        width={"13px"}
                                        alt="status icon"
                                      />
                                      <Box
                                        component={"span"}
                                        sx={{ marginLeft: "5px" }}
                                      >
                                        {item?.approval_status === "Pending"
                                          ? "Pending"
                                          : item?.approval_status === "Approved"
                                            ? "Approved"
                                            : item?.approval_status === "Rejected"
                                              ? "Rejected" : ""}
                                      </Box>
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
                                        component={"img"}
                                        src={sorteddata ?
                                          sorteddata[sorteddata?.length - 1]
                                            ?.status == "Medical"
                                            ? Images.blueCircle
                                            : sorteddata[sorteddata?.length - 1]
                                              ?.status == "Stamping"
                                              ? Images.successIcon
                                              : sorteddata[sorteddata?.length - 1]
                                                ?.status == "Emirates Id"
                                                ? Images.lightGreenCircle
                                                : sorteddata[sorteddata?.length - 1]
                                                  ?.status == "Entry permit"
                                                  ? Images.pendingIcon
                                                  : sorteddata[sorteddata?.length - 1]
                                                    ?.status == "Change Status"
                                                    ? Images.pendingIcon
                                                    : Images.errorIcon
                                          : ''}
                                        width={"13px"}
                                      ></Box>
                                      {sorteddata && sorteddata[sorteddata?.length - 1]?.status}
                                    </Box>
                                  </Cell>
                                  <Cell
                                    style={{ textAlign: "left" }}
                                    className="pdf-table"
                                  >
                                    <Box>
                                      {sorteddata && (item?.approval_status == "Approved" && (sorteddata[sorteddata?.length - 1]?.status == 'Stamping' || sorteddata[sorteddata?.length - 1]?.status == 'Complete (EID)')) && <Box
                                        component={"img"}
                                        src={Images.editIcon}
                                        onClick={() =>
                                          handleUpdateCandidate(item, index)
                                        }
                                        width={"35px"}
                                      ></Box>}
                                      {(item?.approval_status == 'Rejected') && <Box
                                        component={"img"}
                                        src={Images.editIcon}
                                        onClick={() =>
                                          handleUpdateCandidate3(item, index)
                                        }
                                        width={"35px"}
                                      ></Box>}
                                      {item?.rejections.length > 0 && <Box component={'div'} onClick={() => {
                                        setRejections(
                                          item?.rejections?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                        );; setRejectionDialog(true)
                                      }}>
                                        <InfoOutlinedIcon />
                                      </Box>}
                                      <Box
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
                      <Pagination
                        sx={{ mt: 2 }}
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                      />
                    </PDFExport>
                  </Fragment>
                )}

                {loader && <CircleLoading />}
              </Box>
            }
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default VisaDetail;
