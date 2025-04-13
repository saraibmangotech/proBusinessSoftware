import React, { useEffect, useState } from 'react';
import { Box, Checkbox, Container, FormControlLabel, Grid, IconButton, Radio, RadioGroup, Typography } from '@mui/material';
import RegisterContainer from 'container/Register'
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { PrimaryButton } from 'components/Buttons';
import Colors from 'assets/Style/Colors';
import DeleteIcon from '@mui/icons-material/Delete';
import { Controller, useForm } from 'react-hook-form';
import UploadFile from 'components/UploadFile';
import InputField from 'components/Input';
import DatePicker from 'components/DatePicker';
import { ErrorToaster } from 'components/Toaster';
import { FormControl } from '@mui/base';
import LabelCustomInput from 'components/Input/LabelCustomInput';
import SelectField from 'components/Select';
import { CleanTypes, Debounce2, getFileSize, handleDownload } from 'utils';
import instance from 'config/axios';
import routes from 'services/System/routes';
import CustomerServices from 'services/Customer';
import CustomerService from '../DashboardPages/CustomerService';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import moment from 'moment';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SystemServices from 'services/System';
import UploadFileSingle from 'components/UploadFileSingle';
import { Images } from 'assets';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import { addMonths } from 'date-fns';
import { useAuth } from 'context/UseContext';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';


function CreateCustomer() {
const theme = useTheme();
const { user } = useAuth()
const navigate = useNavigate()
const { id } = useParams()
const [formChange, setFormChange] = useState(false)
const [submit, setSubmit] = useState(false)

const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm();
const {
  register: register1,
  handleSubmit: handleSubmit1,
  setValue: setValue1,
  getValues: getValues1,
  watch,
  formState: { errors: errors1 },

} = useForm();

// Watch all form data
console.log(watch());


const isFormDataEmpty = (data) => {
  // Check if all form fields are empty
  return Object.values(data).every((value) => {
    // If the value is an object (like companyLogo), check if it's empty
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).length === 0;
    }
    // Otherwise, check if the value is an empty string
    return value === "";
  });
};






const allowFilesType = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const allowFilesType2 = [
  'image/png',
  'image/jpg',
  'image/jpeg',

];
const [guarantors, setGuarantors] = useState([])
const [activeStep, setActiveStep] = React.useState(1);

// *For Deposit Slip
const [progress, setProgress] = useState(0);
const [uploadedSize, setUploadedSize] = useState(0);
const [slipDetail, setSlipDetail] = useState([]);


const [selectedDue, setSelectedDue] = useState({ id: 'Instant', name: 'Instant' })
const [passport, setPassport] = useState()
const [allocation, setAllocation] = useState(false)
const [depositError, setDepositError] = useState(false)
const [loading, setLoading] = useState(false)
const [emailVerify, setEmailVerify] = useState(false)
const [isUploading, setIsUploading] = useState(false);
const [loader, setLoader] = useState(false)
const [fieldsDisabled, setFieldsDisabled] = useState({
  monthlyVisaServiceCharges: false,
  vipMedical: false,
  extraTyping: true,
});

const [center, setCenter] = useState(null)
const [status, setStatus] = useState(null)

// *For Stepper Forms Data
const [stepFormData, setStepFormData] = useState()
const [step1FormData, setStep1FormData] = useState();
const [selectedType, setSelectedType] = useState(null)
const [date, setDate] = useState(null)
const [balanceType, setBalanceType] = useState(null)

//documents array






const handleNext = () => {
  setActiveStep((prevActiveStep) => prevActiveStep + 1);
};




const handleUpload = async (file, docs) => {
  setProgress(0);
  try {
    const formData = new FormData();
    formData.append("document", file);
    console.log(file.size);
    console.log(getFileSize(file.size))
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
const submitForm = async (formData) => {
  console.log(formData);
  try {
    let obj = {
      name: formData?.companyName,

      phone: formData?.mobile,
      email: formData?.email,
      address: formData?.businessAddress,
      website: formData?.businessWebsite,
      cp_name: formData?.personName,
      cp_mobile: formData?.phone,

    };

    setStepFormData(obj);
    handleNext()
  } catch (error) {
    ErrorToaster(error);
  }
};





const submitForm1 = async (formData) => {
  console.log(formData);
  try {
    let obj = {
      id:id,
      name: formData?.name,
      type: selectedType?.id,
      mobile: formData?.mobile,
      trn: formData?.trn,
      eid: formData?.eid,
      trade_license_no: formData?.trade,
      opening_balance: formData?.balance,
      opening_balance_type: balanceType?.id,
      opening_balance_date: date,
      credit_limit: formData?.credit,
      credit_status: status?.id,
      cost_center: center?.id,
      general_notes: formData?.notes,
      email: formData?.email,
      address: formData?.address,


    };
    const promise = CustomerServices.UpdateCustomer(obj);

    showPromiseToast(
      promise,
      'Saving...',
      'Added Successfully',
      'Something Went Wrong'
    );
    const response = await promise;
    if (response?.responseCode === 200) {
      navigate("/customer-list");
    }


  } catch (error) {
    ErrorToaster(error);
  }
};






const verifyEmail = async (value) => {
  let Myemail = getValues1('email')
  if (Myemail) {

    try {
      let obj = {
        email: Myemail.toLowerCase(),
        validate: true


      };

      console.log(obj);

      const { status } = await CustomerServices.addCustomer(obj);

      console.log(status);
      if (status) {
        setEmailVerify(true)
      }


    } catch (error) {
      console.log(error);
      setEmailVerify(false)
      showErrorToast(error)
    }
  }
};

const getData = async () => {
  try {
    let params = {
      customer_id: id
    };

    const { data } = await CustomerServices.getCustomerDetail(params);
    let detail = data?.customer
    console.log(detail);

    setValue1('name', detail?.name)
    setValue1('email', detail?.email)
    setValue1('mobile', detail?.mobile)
    setValue1('address', detail?.address)
    setValue1('trn', detail?.trn)
    setValue1('eid', detail?.eid)
    setValue1('trade', detail?.trade_license_no)
    setValue1('paymentType',{ id: detail?.opening_balance_type, name: detail?.opening_balance_type })
    setSelectedType({ id: detail?.opening_balance_type, name: detail?.opening_balance_type })
    setValue1('status',{ id: detail?.credit_status, name: detail?.credit_status })
    setStatus({ id: detail?.credit_status, name: detail?.credit_status })
    setValue1('center',{ id: detail?.cost_center, name: detail?.cost_center })
    setCenter({ id: detail?.cost_center, name: detail?.cost_center })
    setValue1('type',{ id: detail?.type, name: detail?.type })
    setBalanceType({ id: detail?.type, name: detail?.type })
    setDate(new Date(detail?.opening_balance_date))
    setValue1('balance', detail?.opening_balance)
    setValue1('credit', detail?.credit_limit)
    setValue1('notes', detail?.general_notes)

  } catch (error) {
    console.error("Error fetching location:", error);
  }
};
useEffect(() => {
  getData()
}, [])




return (
  <>
    <Box sx={{ width: "100%" }}>


    </Box>
    <Box m={3} sx={{ backgroundColor: 'white', borderRadius: "12px" }} >
      {<>

        <Box component={'form'} onSubmit={handleSubmit1(submitForm1)}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', p: 3, alignItems: 'flex-end' }}>
            <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >Update Customer</Typography>

          </Box>

          <Box sx={{ p: 3 }}>


            <Grid container sx={{ gap: '5px 25px' }}>
              <Grid item xs={2.8}>
                <InputField
                  label={" Name :*"}
                  size={'small'}
                  placeholder={" Name"}
                  error={errors1?.name?.message}
                  register={register1("name", {
                    required:
                      "Please enter your name."

                  })}
                /></Grid>
              <Grid item xs={2.8}><InputField
                label={"Mobile :*"}
                size={'small'}
                type={'number'}
                placeholder={"Mobile"}
                error={errors1?.mobile?.message}
                register={register1("mobile", {
                  required:
                    "Please enter your mobile.",
                  pattern: {
                    value: /^05[0-9]{8}$/,
                    message: "Please enter a valid UAE phone number (starting with 05 and 8 digits)."
                  }

                })}
              /></Grid>
              <Grid item xs={2.8}>
                <InputField
                  label={"Email :*"}
                  size={"small"}
                  placeholder={"Email"}
                  error={errors1?.email?.message}
                  register={register1("email", {
                    required: "Please enter your email.",
                    onChange: (e) => {
                      console.log('asdas');



                    },
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address."
                    },

                  })}
                />
              </Grid>
              <Grid item xs={2.8}><InputField
                label={" Address :*"}
                size={'small'}
                placeholder={" Address"}
                error={errors1?.address?.message}
                register={register1("address", {
                  required:
                    "Please enter your  address."

                })}
              /></Grid>





              <Grid item xs={2.8}><InputField
                label={"TRN Number :*"}
                size={'small'}
                type={'number'}
                placeholder={"TRN Number"}
                error={errors1?.trn?.message}
                register={register1("trn", {
                  required:
                    "Please enter your trn."

                })}
              /></Grid>
              <Grid item xs={2.8}><InputField
                label={"EID Number :*"}
                size={'small'}
                type={'number'}
                placeholder={"EID Number"}
                error={errors1?.eid?.message}
                register={register1("eid", {
                  required:
                    "Please enter your eid."

                })}
              /></Grid>
              <Grid item xs={2.8}><InputField
                label={"Trade License Number :*"}
                size={'small'}
                type={'number'}
                placeholder={"Trade License Number"}
                error={errors1?.trade?.message}
                register={register1("trade", {
                  required:
                    "Please enter your trade."

                })}
              /></Grid>
              <Grid item xs={2.8} >
                <SelectField
                  size={'small'}
                  label={'Payment Type *:'}

                  options={[{ id: 'Credit', name: 'Credit' }, { id: 'Cash', name: 'Cash' }]}
                  selected={selectedType}
                  onSelect={(value) => {
                    setSelectedType(value)


                  }}
                  error={errors?.paymentType?.message}
                  register={register("paymentType", {
                    required: 'Please select type .',
                  })}
                />
              </Grid>
              <Grid item xs={2.8} >
                <SelectField
                  size={'small'}
                  label={'Credit Status *:'}

                  options={[{ id: 'Good History', name: 'Good History' }, { id: 'In Liquidation', name: 'In Liquidation' }, { id: 'No More Work until Payment Received', name: 'No More Work until Payment Received' }]}
                  selected={status}
                  onSelect={(value) => {
                    setStatus(value)


                  }}
                  error={errors?.status?.message}
                  register={register("status", {
                    required: 'Please select status .',
                  })}
                />
              </Grid>
              <Grid item xs={2.8} >
                <SelectField
                  size={'small'}
                  label={'Cost Center *:'}

                  options={[{ id: 'Tasheel', name: 'Tasheel' }, { id: 'DED', name: 'DED' }, { id: 'Typing', name: 'Typing' }, { id: 'General', name: 'General' }]}
                  selected={center}
                  onSelect={(value) => {
                    setCenter(value)


                  }}
                  error={errors?.center?.message}
                  register={register("center", {
                    required: 'Please select center .',
                  })}
                />
              </Grid>
              <Grid item xs={2.8} >
                <SelectField
                  size={'small'}
                  label={'Balance Type *:'}

                  options={[{ id: 'Credit', name: 'Credit' }, { id: 'Debit', name: 'Debit' }]}
                  selected={balanceType}
                  onSelect={(value) => {
                    setBalanceType(value)


                  }}
                  error={errors?.type?.message}
                  register={register("type", {
                    required: 'Please select type account.',
                  })}
                />
              </Grid>
              <Grid item xs={2.8}>
                <DatePicker
                  label={"Opening Balance Date :*"}
                  value={date}
                  size={'small'}

                  error={errors1?.date?.message}
                  register={register1("date", {
                    required:
                      date ? false :
                        "please enter  date."

                  })}
                  onChange={(date) => {

                    setValue1('date', date)
                    setDate(new Date(date));

                  }

                  }
                /></Grid>
              <Grid item xs={2.8}><InputField
                label={"Opening Balance :*"}
                size={'small'}
                type={'number'}
                placeholder={"Opening Balance "}
                error={errors1?.balance?.message}
                register={register1("balance", {
                  required:
                    "Please enter your balance."

                })}
              /></Grid>
              <Grid item xs={2.8}><InputField
                label={"Credit Limit :*"}
                size={'small'}
                type={'number'}
                placeholder={"Credit Limit"}
                error={errors1?.credit?.message}
                register={register1("credit", {
                  required:
                    "Please enter your credit."

                })}
              /></Grid>

              <Grid item xs={5.5}><InputField
                label={"Notes :"}
                multiline
                rows={4}
                size={'small'}
                placeholder={"Notes"}
                error={errors1?.notes?.message}
                register={register1("notes", {
                  required:
                    false

                })}
              /></Grid>
              <Grid container justifyContent={'flex-end'}>
                <PrimaryButton
                 bgcolor={'#bd9b4a'}
                  title="Update"
                  type={'submit'}


                />
              </Grid>
            </Grid>
          </Box>
        </Box></>}

    </Box>
  </>
);
}

export default CreateCustomer;