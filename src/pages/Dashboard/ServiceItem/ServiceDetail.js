import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Checkbox,
  Container,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import RegisterContainer from "container/Register";
import { useTheme } from "@mui/material/styles";
import MobileStepper from "@mui/material/MobileStepper";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import DeleteIcon from "@mui/icons-material/Delete";
import { Controller, useForm } from "react-hook-form";
import UploadFile from "components/UploadFile";
import InputField from "components/Input";
import DatePicker from "components/DatePicker";
import { ErrorToaster } from "components/Toaster";
import { FormControl } from "@mui/base";
import LabelCustomInput from "components/Input/LabelCustomInput";
import SelectField from "components/Select";
import { CleanTypes, Debounce2, getFileSize, handleDownload } from "utils";
import instance from "config/axios";
import routes from "services/System/routes";
import CustomerServices from "services/Customer";
import CustomerService from "../DashboardPages/CustomerService";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import moment from "moment";
import { Link, useNavigate, useParams } from "react-router-dom";
import SystemServices from "services/System";
import UploadFileSingle from "components/UploadFileSingle";
import { Images } from "assets";
import { useCallbackPrompt } from "hooks/useCallBackPrompt";
import { addMonths } from "date-fns";
import { useAuth } from "context/UseContext";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import axios from "axios";
import UploadIcon from "@mui/icons-material/Upload";
import FinanceServices from "services/Finance";

function CreateCategory() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [formChange, setFormChange] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [excludeFromSales, setExcludeFromSales] = useState("no");
  const [excludeFromPurchase, setExcludeFromPurchase] = useState("no");

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();
  const {
    register: register1,
    handleSubmit: handleSubmit1,
    setValue: setValue1,
    getValues: getValues1,
    control,
    watch,
    formState: { errors: errors1 },
  } = useForm();

  // Watch all form data
  console.log(watch());

  const isFormDataEmpty = (data) => {
    // Check if all form fields are empty
    return Object.values(data).every((value) => {
      // If the value is an object (like companyLogo), check if it's empty
      if (typeof value === "object" && value !== null) {
        return Object.keys(value).length === 0;
      }
      // Otherwise, check if the value is an empty string
      return value === "";
    });
  };

  const allowFilesType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "application/pdf",
    "application/vnd.ms-excel",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const allowFilesType2 = ["image/png", "image/jpg", "image/jpeg"];
  const [guarantors, setGuarantors] = useState([]);
  const [activeStep, setActiveStep] = React.useState(1);

  // *For Deposit Slip
  const [progress, setProgress] = useState(0);
  const [uploadedSize, setUploadedSize] = useState(0);
  const [slipDetail, setSlipDetail] = useState([]);

  const [selectedDue, setSelectedDue] = useState({
    id: "Instant",
    name: "Instant",
  });
  const [passport, setPassport] = useState();
  const [allocation, setAllocation] = useState(false);
  const [depositError, setDepositError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailVerify, setEmailVerify] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [fieldsDisabled, setFieldsDisabled] = useState({
    monthlyVisaServiceCharges: false,
    vipMedical: false,
    extraTyping: true,
  });

  const [center, setCenter] = useState(null);
  const [status, setStatus] = useState(null);

  // *For Stepper Forms Data
  const [stepFormData, setStepFormData] = useState();
  const [step1FormData, setStep1FormData] = useState();
  const [selectedType, setSelectedType] = useState(null);
  const [date, setDate] = useState(null);
  const [balanceType, setBalanceType] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const fileInputRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [salesAccount, setSalesAccount] = useState(null);
  const [inventoryAccount, setInventoryAccount] = useState(null);
  const [cogsAccount, setCogsAccount] = useState(null);
  const [adjustmentAccount, setAdjustmentAccount] = useState(null);
  const [assemblyAccount, setAssemblyAccount] = useState(null);
  const [itemType, setItemType] = useState(null);
  const [unit, setUnit] = useState(null);
  const [taxes, setTaxes] = useState([]);
  const [tax, setTax] = useState(null);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState(null);
  const [governmentAccount, setGovernmnentAccount] = useState(null);
  const [description, setDescription] = useState(null);
  const [ownGovBank, setOwnGovBank] = useState(null);
  //documents array

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
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
      handleNext();
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
        name_ar: formData?.arabic,
        item_code: formData?.item_code,
        category_id: category?.id,
        center_fee: Number(formData?.center_fee),
        govt_bank_account_id: governmentAccount?.id,
        bank_service_charge: Number(formData?.bank_service_charges),
        other_charge: Number(formData?.other_charge),
        local_commission: Number(formData?.local_commission),
        item_tax_type: tax?.name,
        editable_description: description?.id,
        sales_account_id: salesAccount?.id,
        use_own_govt_bank: ownGovBank?.id,
        cogs_account_id: cogsAccount?.id,
        vat_bank_charge: Number(formData?.vat_bank_charge),
        non_local_commission: Number(formData?.non_local_commission),
      };
      console.log(obj);
      const promise = CustomerServices.UpdateServiceItem(obj);

      showPromiseToast(
        promise,
        "Saving...",
        "Added Successfully",
        "Something Went Wrong"
      );
      const response = await promise;
      if (response?.responseCode === 200) {
        navigate("/service-list");
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };
  const handleFileChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        setValue("image", file, { shouldValidate: true }); // Set value and trigger validation
      }
      const formData = new FormData();
      formData.append("document", e.target.files[0]);

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/system/uploadDocuments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response?.data?.data?.path);

      setImageURL(response?.data?.data?.path);
    } catch (error) {
      console.log(error);
    }
  };

  // *For Get Account
  const getAccounts = async (page, limit, filter) => {
    // setLoader(true)
    try {
      let params = {
        page: 1,
        limit: 1000,
      };

      const { data } = await FinanceServices.getAccounts(params);
      console.log(data?.accounts?.rows);

      setAccounts(data?.accounts?.rows);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };
  const getTax = async () => {
    // setLoader(true)
    try {
      let params = {
        page: 1,
        limit: 1000,
      };

      const { data } = await FinanceServices.getTax(params);
      console.log(data?.accounts?.rows);

      setTaxes(data?.tax);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };
  const getCategories = async () => {
    // setLoader(true)
    try {
      let params = {
        page: 1,
        limit: 1000,
      };

      const { data } = await CustomerServices.getCategoryList(params);

      setCategories(data?.categories);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };

  const verifyEmail = async (value) => {
    let Myemail = getValues1("email");
    if (Myemail) {
      try {
        let obj = {
          email: Myemail.toLowerCase(),
          validate: true,
        };

        console.log(obj);

        const { status } = await CustomerServices.addCustomer(obj);

        console.log(status);
        if (status) {
          setEmailVerify(true);
        }
      } catch (error) {
        console.log(error);
        setEmailVerify(false);
        showErrorToast(error);
      }
    }
  };

  useEffect(() => {
    getAccounts();
    getTax();
    getCategories();
  }, []);

  const getData = async () => {
    try {
      let params = {
        service_id: id,
      };

      const { data } = await CustomerServices.DetailServiceItem(params);
      let detail = data?.service;
      console.log(detail);

      setValue1("name", detail?.name);
      setValue1("arabic", detail?.name_ar);
      setValue1("item_code", detail?.item_code);
      setValue1("center_fee", detail?.center_fee);
      setValue1("category", detail?.category);
      setCategory(detail?.category?.name);
      setTax(detail?.item_tax_type);
      setGovernmnentAccount(detail?.govt_bank_account);
      setValue1("bank_service_charges", detail?.bank_service_charge);
      setValue1("other_charge", detail?.other_charge);
      setValue1("local_commission", detail?.local_commission);
      setValue1("non_local_commission", detail?.non_local_commission);
      setValue1("vat_bank_charge", detail?.vat_bank_charge);
      setSalesAccount(detail?.sales_account);
      setCogsAccount(detail?.cogs_account);
      setOwnGovBank(detail?.use_own_govt_bank == true ? "Yes" : "No");
      setDescription(detail?.editable_description == true ? "Yes" : "No");
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };
  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <Box sx={{ width: "100%" }}></Box>
      <Box m={3} sx={{ backgroundColor: "white", borderRadius: "12px" }}>
        {
          <>
            <Box component={"form"} onSubmit={handleSubmit1(submitForm1)}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  p: 3,
                  alignItems: "flex-end",
                }}
              >
                <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
                   Service Item Detail
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                <Grid container sx={{ gap: "5px 25px" }}>
                  <Grid item xs={2.8}>
                    <InputField
                     disabled={true}
                      label={" Name :*"}
                      size={"small"}
                      placeholder={" Name"}
                      error={errors1?.name?.message}
                      register={register1("name", {
                        required: "Please enter your name.",
                      })}
                    />
                  </Grid>

                  <Grid item xs={2.8}>
                    <InputField
                     disabled={true}

                      label={"Arabic Name :*"}
                      size={"small"}
                      placeholder={"Arabic Name"}
                      error={errors1?.arabic?.message}
                      register={register1("arabic", {
                        required: "Please enter your arabic.",
                        onChange: (e) => {
                          console.log("asdas");
                        },
                      })}
                    />
                  </Grid>
                  <Grid item xs={2.8}>
                    <InputField
                     disabled={true}

                      label={"Item Code :*"}
                      size={"small"}
                      placeholder={"Item Code"}
                      error={errors1?.item_code?.message}
                      register={register1("item_code", {
                        required: "Please enter Item Code.",
                        onChange: (e) => {
                          console.log("asdas");
                        },
                      })}
                    />
                  </Grid>
                  <Grid item xs={2.8}>
                    <InputField
                     disabled={true}

                      label={"Center Fee :*"}
                      size={"small"}
                      placeholder={"Center fee"}
                      error={errors1?.center_fee?.message}
                      register={register1("center_fee", {
                        required: "Please Enter Center fee.",
                        onChange: (e) => {
                          console.log("asdas");
                        },
                      })}
                    />
                  </Grid>

                  <Grid item xs={2.8}>
                    <SelectField
                     disabled={true}

                      size={"small"}
                      label={"Category *:"}
                      options={categories}
                      selected={category}
                      onSelect={(value) => {
                        setCategory(value);
                      }}
                      error={errors?.category?.message}
                      register={register("category", {
                        required: "Please select category .",
                      })}
                    />
                  </Grid>
                  <Grid item xs={2.8}>
                    <SelectField
                                         disabled={true}

                      size={"small"}
                      label={"Tax Type *:"}
                      options={taxes}
                      selected={tax}
                      onSelect={(value) => {
                        setTax(value);
                      }}
                      error={errors?.tax?.message}
                      register={register("tax", {
                        required: "Please select tax .",
                      })}
                    />
                  </Grid>

                  <Grid item xs={2.8}>
                    <SelectField
                                         disabled={true}

                      size={"small"}
                      label={"Govt Bank Account *:"}
                      options={accounts}
                      selected={governmentAccount}
                      onSelect={(value) => {
                        setGovernmnentAccount(value);
                      }}
                      error={errors?.governmentAccount?.message}
                      register={register("governmentAccount", {
                        required: "Please select Government Account .",
                      })}
                    />
                  </Grid>

                  <Grid item xs={2.8}>
                    <InputField
                                         disabled={true}

                      label={"Bank Services Charges :*"}
                      size={"small"}
                      placeholder={"Service Charges"}
                      error={errors1?.bank_service_charges?.message}
                      register={register1("bank_service_charges", {
                        required: "Please Enter Bank Service Charges .",
                        onChange: (e) => {
                          console.log("asdas");
                        },
                      })}
                    />
                  </Grid>
                  <Grid item xs={2.8}>
                    <InputField
                                         disabled={true}

                      label={"Other Charges :*"}
                      size={"small"}
                      placeholder={"Other Charges"}
                      error={errors1?.other_charge?.message}
                      register={register1("other_charge", {
                        required: "Please Enter Other Charges .",
                        onChange: (e) => {
                          console.log("asdas");
                        },
                      })}
                    />
                  </Grid>
                  <Grid item xs={2.8}>
                    <InputField
                                         disabled={true}

                      label={"Local Commission:*"}
                      size={"small"}
                      placeholder={"Local Commission"}
                      error={errors1?.local_commission?.message}
                      register={register1("local_commission", {
                        required: "Please Enter Local Commission .",
                        onChange: (e) => {
                          console.log("asdas");
                        },
                      })}
                    />
                  </Grid>
                  <Grid item xs={2.8}>
                    <InputField
                                         disabled={true}

                      label={"Non Local Commission:*"}
                      size={"small"}
                      placeholder={"Non Local Commission"}
                      error={errors1?.non_local_commission?.message}
                      register={register1("non_local_commission", {
                        required: "Please Enter Non Local Commission .",
                        onChange: (e) => {
                          console.log("asdas");
                        },
                      })}
                    />
                  </Grid>
                  <Grid item xs={2.8}>
                    <InputField
                                         disabled={true}

                      label={"vat Bank Charge:*"}
                      size={"small"}
                      placeholder={"vat Bank Charge"}
                      error={errors1?.vat_bank_charge?.message}
                      register={register1("vat_bank_charge", {
                        required: "Please Enter vat Bank Charge .",
                        onChange: (e) => {
                          console.log("asdas");
                        },
                      })}
                    />
                  </Grid>

                  <Grid item xs={2.8}>
                    <SelectField
                                         disabled={true}

                      size={"small"}
                      label={"Sales Account *:"}
                      options={accounts}
                      selected={salesAccount}
                      onSelect={(value) => {
                        setSalesAccount(value);
                      }}
                      error={errors?.sales?.message}
                      register={register("sales", {
                        required: "Please select sales account.",
                      })}
                    />
                  </Grid>

                  <Grid item xs={2.8}>
                    <SelectField
                                         disabled={true}

                      size={"small"}
                      label={"Cogs Account *:"}
                      options={accounts}
                      selected={cogsAccount}
                      onSelect={(value) => {
                        setCogsAccount(value);
                      }}
                      error={errors?.cogs?.message}
                      register={register("cogs", {
                        required: "Please select cogs account.",
                      })}
                    />
                  </Grid>

                  <Grid item xs={2.8}>
                    <SelectField
                                         disabled={true}

                      size={"small"}
                      label={"Use Own Gov Bank *:"}
                      options={[
                        { id: true, name: "Yes" },
                        { id: false, name: "No" },
                      ]}
                      selected={ownGovBank}
                      onSelect={(value) => {
                        setOwnGovBank(value);
                      }}
                      error={errors?.use_own_govt_bank?.message}
                      register={register("use_own_govt_bank", {
                        required: "Please select Editable Description .",
                      })}
                    />
                  </Grid>
                  <Grid item xs={2.8}>
                    <SelectField
                                         disabled={true}

                      size={"small"}
                      label={"Editable Description *:"}
                      options={[
                        { id: true, name: "Yes" },
                        { id: false, name: "No" },
                      ]}
                      selected={description}
                      onSelect={(value) => {
                        setDescription(value);
                        console.log(value);
                      }}
                      error={errors?.editable_description?.message}
                      register={register("editable_description", {
                        required: "Please select Editable Description .",
                      })}
                    />
                  </Grid>

               
                </Grid>
              </Box>
            </Box>
          </>
        }
      </Box>
    </>
  );
}

export default CreateCategory;
