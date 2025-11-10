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
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SearchIcon from "@mui/icons-material/Search";
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
import { FontFamily, Images } from 'assets';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import { addMonths } from 'date-fns';
import { useAuth } from 'context/UseContext';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';


function CreateCustomer() {
  const theme = useTheme();
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formChange, setFormChange] = useState(false)
  const [submit, setSubmit] = useState(false)
  const [emirates, setEmirates] = useState(null)
  const [visa, setVisa] = useState(null)
  const [passport, setPassport] = useState(null)
  const [signature, setSignature] = useState(null)

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
  const [categories, setCategories] = useState([])
  const [documents, setDocuments] = useState(
    [
      { label: "Upload Emirates ID", name: "emirates", doc: '' },
      { label: "Upload Passport", name: "passport", doc: '' },
      { label: "Upload Visa", name: "visa", doc: '' },
      { label: "Upload Signature", name: "signature", doc: '' },
    ]
  )
  const [emailVerify, setEmailVerify] = useState(false)


  const [center, setCenter] = useState(null)
  const [status, setStatus] = useState(null)

  // *For Stepper Forms Data
  const [stepFormData, setStepFormData] = useState()

  const [selectedType, setSelectedType] = useState(null)
  const [date, setDate] = useState(null)
  const [balanceType, setBalanceType] = useState(null)
  const [fieldsDisabled, setFieldsDisabled] = useState(false)
  const [holdState, setHoldState] = useState(true)
  //documents array






  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };










  const submitForm1 = async (formData) => {
    console.log(formData);
    const simplifiedCategories = categories.map(({ id, commission_value }) => ({
      category_id: id,
      commission_value,
    }));
    try {
      let obj = {
        name: formData?.name,
        type: selectedType?.id,
        mobile: formData?.mobile,
        trn: formData?.trn,
        eid: formData?.eid,
        trade_license_no: formData?.trade,
        opening_balance: formData?.balance,
        opening_balance_type: balanceType?.id,
        opening_balance_date: date,
        credit_limit: formData?.credit || 0,
        credit_balance: formData?.creditBalance || 0,
        credit_status: status?.id,
        cost_center: center?.id,
        general_notes: formData?.notes,
        email: formData?.email,
        address: formData?.address,
        commission_settings: simplifiedCategories,
        emirates_id: emirates,
        passport: passport,
        visa: visa,
        signature: signature,


      };
      const promise = CustomerServices.addCustomer(obj);

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


  const handleUploadDocument5 = async (e, type) => {
    try {
      e.preventDefault()
      const file = e.target.files[0]
      const arr = [
        {
          name: file?.name,
          file: "",
          type: file?.type.split("/")[1],
          size: getFileSize(file.size),
          isUpload: false,
        },
      ]
      if (type !== "picture" && allowFilesType.includes(file.type)) {
        handleUpload5(file, arr, type)


      } else {
        ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleUpload5 = async (file, docs, type) => {

    try {
      const formData = new FormData()
      formData.append("document", file)
      const { data } = await instance.post(routes.uploadDocuments, formData, {
        onUploadProgress: (progressEvent) => {
          const uploadedBytes = progressEvent.loaded
          const percentCompleted = Math.round((uploadedBytes * 100) / progressEvent.total)

        },
      })
      if (data) {
        docs[0].isUpload = true
        docs[0].file = data?.data?.path
        console.log(data);

        if (type == 'emirates') {
          setEmirates(data?.data?.path)
        }
        if (type == 'passport') {
          setPassport(data?.data?.path)
        }
        if (type == 'visa') {
          setVisa(data?.data?.path)
        }
        if (type == 'signature') {
          setSignature(data?.data?.path)
        }

        if (data?.data?.path) {
          setDocuments((prev) =>
            prev.map((item) =>
              item.name === type ? { ...item, doc: data?.data?.path || '' } : item
            )
          );


        }


      }
    } catch (error) {
      ErrorToaster(error)
    }
  }
  console.log(documents, 'documents');


  const getReceiptDetail = async (state) => {
    setFieldsDisabled(true);
    try {
      let params = {
        mobile: getValues1("mobile"),

      };

      const { data } = await CustomerServices.getCustomerDetail(params);
      console.log(data);
      if (data?.customer) {
        setHoldState(true);

        showErrorToast("account already exist with this mobile number");
      } else {
        console.log(data?.receipt);

        setHoldState(false);
      }
    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };




  const getCategories = async (state) => {

    try {
      let params = {


      };

      const { data } = await CustomerServices.getServiceCategories(params);

      setCategories(data?.categories)

    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };
  useEffect(() => {
    getCategories()
  }, [])


  return (
    <>
      <Box sx={{ width: "100%" }}>


      </Box>
      <Box m={3} sx={{ backgroundColor: 'white', borderRadius: "12px" }} >
        {<>

          <Box component={'form'} onSubmit={handleSubmit1(submitForm1)}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', p: 3, alignItems: 'flex-end' }}>
              <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >Create Customer</Typography>

            </Box>

            <Box sx={{ p: 3 }}>


              <Grid container gap={2} justifyContent={'space-between'}>
                <Grid container item xs={5.5} spacing={2} p={2} sx={{ border: '1px solid black', borderRadius: '12px' }}>
                  <Grid item xs={6}>
                    <InputField
                      label={" Name :*"}
                      size={'small'}
                      placeholder={" Name"}
                      error={errors1?.name?.message}
                      register={register1("name", {
                        required: "Please enter your name."
                      })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InputField
                      label={"Mobile *:"}
                      size={"small"}
                      type={"number"}

                      placeholder={"Mobile"}
                      // InputProps={{
                      //   endAdornment: (
                      //     <IconButton
                      //       onClick={() => {
                      //         getReceiptDetail();


                      //       }}
                      //     >
                      //       <SearchIcon sx={{ color: "#001f3f" }} />
                      //     </IconButton>
                      //   ),
                      // }}
                      register={register1("mobile", {
                        required: 'mobile is required',

                        onChange: (e) => {
                          console.log("asdas");
                          if (getValues1("mobile").length == 10) {
                            getReceiptDetail()
                          }

                          // Delay the execution of verifyEmail by 2 seconds
                        },
                      })}
                    />
                    {/* <Grid item md={1} sm={12} xs={12} mt={2}>
                      <PrimaryButton
                        bgcolor={"#001f3f"}
                        title="Clear"
                        onClick={() => {
                          setFieldsDisabled(false);
                          setValue1("customer", "");
                          setValue1("invoice_date", moment().toDate());
                          setValue1("mobile", "");
                          setValue1("ref", "");
                          setValue1("display_customer", "");
                          setValue1("email", "");
                          setValue1("address", "");

                          setValue1("mobileValue", "");


                         
                        }}
                      // loading={loading}
                      />
                    </Grid> */}
                  </Grid>
                  <Grid item xs={6}>
                    <InputField
                      label={"Email :*"}
                      size={"small"}
                      placeholder={"Email"}
                      error={errors1?.email?.message}
                      register={register1("email", {
                        required: false,
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address."
                        },
                      })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InputField
                      label={" Address :*"}
                      size={'small'}
                      placeholder={" Address"}
                      error={errors1?.address?.message}
                      register={register1("address", {
                        required: false,
                      })}
                    />
                  </Grid>
                </Grid>

                <Grid container item xs={5.8} spacing={2} p={2} sx={{ border: '1px solid black', borderRadius: '12px' }}>
                  <Grid item xs={6}><InputField
                    label={"TRN Number :*"}
                    size={'small'}
                    type={'number'}
                    placeholder={"TRN Number"}
                    error={errors1?.trn?.message}
                    register={register1("trn", {
                      required:
                        false,

                    })}
                  /></Grid>
                  <Grid item xs={6}><InputField
                    label={"EID Number :*"}
                    size={'small'}
                    type={'number'}
                    placeholder={"EID Number"}
                    error={errors1?.eid?.message}
                    register={register1("eid", {
                      required:
                        false,

                    })}
                  /></Grid>
                  <Grid item xs={6}><InputField
                    label={"Trade License Number :*"}
                    size={'small'}
                    type={'number'}
                    placeholder={"Trade License Number"}
                    error={errors1?.trade?.message}
                    register={register1("trade", {
                      required:
                        false,

                    })}
                  /></Grid>

                </Grid>



                <Grid container item xs={5.5} spacing={2} p={2} mt={2} sx={{ border: '1px solid black', borderRadius: '12px' }}>
                  <Grid item xs={6}><InputField
                    label={"Credit Limit :*"}
                    size={'small'}
                    type={'number'}
                    placeholder={"Credit Limit"}
                    error={errors1?.credit?.message}
                    register={register1("credit", {
                      required:
                        false,

                    })}
                  /></Grid>
                  <Grid item xs={6}><InputField
                    label={"Credit Balance :*"}
                    size={'small'}
                    type={'number'}
                    placeholder={"Credit Balance"}
                    error={errors1?.creditBalance?.message}
                    register={register1("creditBalance", {
                      required:
                        false,

                    })}
                  /></Grid>
                  <Grid item xs={6} >
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
                        required: false,
                      })}
                    />
                  </Grid>



                </Grid>

                <Grid container item xs={5.8} spacing={2} p={2} mt={2} sx={{ border: '1px solid black', borderRadius: '12px' }}>

                  <InputField
                    label={"Additional Notes :"}
                    multiline
                    rows={5}
                    size={'small'}
                    placeholder={"Additional Notes"}
                    error={errors1?.notes?.message}
                    register={register1("notes", {
                      required:
                        false

                    })}
                  />
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  spacing={2}
                  p={2}
                  mt={2}
                  pt={0}
                  alignItems={'flex-start'}
                  sx={{ border: "1px solid black", borderRadius: "12px" }}
                >
                  <Grid
                    item
                    xs={12}
                    sm={12}

                  >
                    <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >Upload Documents</Typography>
                  </Grid>


                  {documents?.map((doc, i) => (
                    <Grid
                      item
                      xs={12}
                      sm={3}
                      key={i}
                      display="flex"
                      justifyContent="center"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          textAlign: "center",
                          color: Colors.charcoalGrey,
                          fontFamily: FontFamily.NunitoRegular,
                          mt: 1,
                          mb: 1.5,
                          fontWeight: "bold",
                        }}
                      >
                        {doc.label}
                      </Typography>

                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <UploadFile
                          accept={allowFilesType}
                          error={errors1?.[doc.name]?.message}
                          register={register1(doc.name, {
                            required: false,
                            onChange: (e) => handleUploadDocument5(e, doc.name),
                          })}
                        />
                      </Box>
                      {doc.doc && (
                        <Box display="flex" alignItems="center" gap={2} mt={1}>
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            sx={{ cursor: "pointer" }}
                            onClick={() =>
                              window.open(
                                process.env.REACT_APP_IMAGE_BASE_URL_NEW + doc.doc,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }
                          >
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                borderRadius: 2,
                                bgcolor: "#f5f5f5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <DescriptionOutlinedIcon sx={{ fontSize: 30, color: "green" }} />
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                mt: 0.5,
                                textAlign: "center",
                                wordBreak: "break-word",
                                maxWidth: 120,
                              }}
                            >
                              {doc.doc?.split("\\").pop().split("/").pop()}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Grid>
                  ))}
                </Grid>
                <Grid container item xs={12} spacing={2} p={2} mt={2} sx={{ border: '1px solid black', borderRadius: '12px' }}>
                  <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >Commission Setting</Typography>
                  {categories.map((cat, index) => (
                    <Grid item xs={12} key={index}>
                      <Typography variant="subtitle2">{cat.name}</Typography>
                      <InputField
                        fullWidth
                        size="small"
                        type="number"
                        step="any"
                        label="Commission"
                        register={register1(`categories.${index}.commission_value`, {
                          onChange: (e) => {
                            const newCategories = [...categories];
                            newCategories[index].commission_value = e.target.value;
                            console.log(newCategories);

                            setCategories(newCategories);
                          },
                        })}
                        value={cat.commission_value}
                      />
                    </Grid>
                  ))}

                </Grid>


                <Grid container justifyContent={'flex-end'}>
                  <PrimaryButton
                    disabled={holdState}
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

export default CreateCustomer;