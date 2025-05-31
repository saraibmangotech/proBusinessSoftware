import React, { useEffect, useState } from 'react';
import { Box, Checkbox, Container, FormControlLabel, Grid, IconButton, InputLabel, Radio, RadioGroup, Typography } from '@mui/material';
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
import { Link, useNavigate } from 'react-router-dom';
import SystemServices from 'services/System';
import UploadFileSingle from 'components/UploadFileSingle';
import { Images } from 'assets';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import { addMonths } from 'date-fns';
import { useAuth } from 'context/UseContext';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import FinanceServices from 'services/Finance';


function CreateBank() {
  const theme = useTheme();
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formChange, setFormChange] = useState(false)
  const [submit, setSubmit] = useState(false)
  const [radioValue, setRadioValue] = useState('create_new_ledger')

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
  const [selectedAccount, setSelectedAccount] = useState(null)


  const [emailVerify, setEmailVerify] = useState(false)


  const [center, setCenter] = useState(null)
  const [status, setStatus] = useState(null)

  // *For Stepper Forms Data
  const [stepFormData, setStepFormData] = useState()

  const [selectedType, setSelectedType] = useState(null)
  const [date, setDate] = useState(null)
  const [balanceType, setBalanceType] = useState(null)
  const [accounts, setAccounts] = useState([])

  //documents array

  // *For Get Account
  const getAccounts = async (search, accountId) => {
    try {
      let params = {
        page: 1,
        limit: 10000,

        name: search,
        is_disabled: false,
        sub_category: 4,

      }
      const { data } = await FinanceServices.getAccountBySubCategory(params)
      const updatedAccounts = data?.accounts?.rows?.map(account => ({
        ...account,
        name: ` ${account.account_code} ${account.name}`
      }));
      console.log(updatedAccounts, 'updatedAccountsupdatedAccounts');

      setAccounts(updatedAccounts)
    } catch (error) {
      showErrorToast(error)
    }
  }




  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };










  const submitForm1 = async (formData) => {
    console.log(formData);
    try {
      let obj = {
        name: formData?.name,
        account_title: formData?.title,
        account_number: formData?.accountnumber,
        account_ibn: formData?.ibn,
        account_id: selectedAccount?.id,


      };
      const promise = CustomerServices.CreateBank(obj);

      showPromiseToast(
        promise,
        'Saving...',
        'Added Successfully',
        'Something Went Wrong'
      );
      const response = await promise;
      if (response?.responseCode === 200) {
        navigate("/bank-list");
      }


    } catch (error) {
      ErrorToaster(error);
    }
  };



  useEffect(() => {
    getAccounts()
  }, [])







  return (
    <>
      <Box sx={{ width: "100%" }}>


      </Box>
      <Box m={3} sx={{ backgroundColor: 'white', borderRadius: "12px" }} >
        {<>

          <Box component={'form'} onSubmit={handleSubmit1(submitForm1)}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', p: 3, alignItems: 'flex-end' }}>
              <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >Create Bank</Typography>

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
                  label={" Account Title :*"}
                  size={'small'}
                  placeholder={" Account Title"}
                  error={errors1?.title?.message}
                  register={register1("title", {
                    required:
                      "Please enter your  title."

                  })}
                /></Grid>





                <Grid item xs={2.8}><InputField
                  label={"Account Number :*"}
                  size={'small'}
                  type={'number'}
                  placeholder={"Account Number"}
                  error={errors1?.accountnumber?.message}
                  register={register1("accountnumber", {
                    required:
                      "Please enter your accountnumber."

                  })}
                /></Grid>
                <Grid item xs={2.8}><InputField
                  label={"Account IBN Number :*"}
                  size={'small'}
                  type={'number'}
                  placeholder={"Account IBN Number"}
                  error={errors1?.ibn?.message}
                  register={register1("ibn", {
                    required:
                      "Please enter your ibn."

                  })}
                /></Grid>



                <Grid item xs={2.8}>
                  <InputLabel sx={{ fontWeight: 700, color: "#434343", mb: 1 }}>Select Option :*</InputLabel>
                  <RadioGroup
                    row
                    value={radioValue}
                    onChange={(e) => setRadioValue(e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    <FormControlLabel value="create_new_ledger" control={<Radio />} label="Create New Ledger" />
                    <FormControlLabel value="select_an_account" control={<Radio />} label="Select An Account" />
                  </RadioGroup>
                </Grid>

                {radioValue == 'select_an_account' && <Grid item xs={2.8}>

                  <SelectField
                    size="small"
                    options={accounts}
                    label={'Select Account'}
                    selected={selectedAccount}
                    onSelect={(value) => {
                      setSelectedAccount(value)
                      console.log(value);
                      setValue('AccountCode', value?.account_code)
                      // getChildAccounts(value?.id)

                    }}
                    //  error={errors?.service?.message}
                    register={register("service", {
                      required: "Please select a service.",
                    })}
                  /></Grid>}
                <Grid container justifyContent={'flex-end'}>
                  <PrimaryButton
                    bgcolor={'#001f3f'}
                    title="Submit"
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

export default CreateBank;