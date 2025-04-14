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
  Table,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  TableBody,
  TableHead,
  TextField,
  Paper,
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
import {
  CleanTypes,
  Debounce,
  Debounce2,
  getFileSize,
  handleDownload,
} from "utils";
import instance from "config/axios";
import routes from "services/System/routes";
import CustomerServices from "services/Customer";
import CustomerService from "../DashboardPages/CustomerService";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
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
import SearchIcon from "@mui/icons-material/Search";
// import { TableBody, TableHead } from "mui-datatables";

function SalesReciept() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formChange, setFormChange] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [excludeFromSales, setExcludeFromSales] = useState("no");
  const [excludeFromPurchase, setExcludeFromPurchase] = useState("no");
  const [total, setTotal] = useState(0);
  const [subTotal, setSubTotal] = useState(0); 
  const [rows, setRows] = useState([]);


console.log(rows , "data")
  const [items, setItems] = useState([
    {
      itemCode: "",
      itemDescription: "TASHEEL AUTO 19",
      totalCharge: 17.1,
      mbNo: "",
      applicationId: "",
      total: 17.1,
    },
  ]);

  // const addItem = () => {
  //   const newItem = {
  //     itemCode: "",
  //     itemDescription: "",
  //     totalCharge: 0,
  //     mbNo: "",
  //     applicationId: "",
  //     total: 0,
  //   };
  //   setItems([...items, newItem]);
  // };

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const {
    register: register1,
    handleSubmit: handleSubmit1,
    setValue: setValue1,
    getValues: getValues1,
    control,
    watch :watch1,
    formState: { errors: errors1 },
  } = useForm();

  // Watch all form data
  
  // Watch for changes in the fee-related fields
  const govtFee = watch('govt_fee', 0);
  const centerFee = watch('center_fee', 0);
  const bankCharges = watch('bank_charges', 0);
  const qty = watch('qty', 1);
  useEffect(() => {
    const feesTotal = (parseFloat(govtFee) || 0) + (parseFloat(centerFee) || 0) + (parseFloat(bankCharges) || 0);
    const finalTotal = feesTotal * (parseFloat(qty) || 1); 
    setValue("total",finalTotal);
  }, [govtFee, centerFee, bankCharges, qty]);

const addItem = (data) => {
  const total = data.total;  
  setRows((prevRows) => {
    const updatedRows = [...prevRows, data];
    const newSubTotal = updatedRows.reduce((sum, row) => sum + row.total, 0); 
    setSubTotal(newSubTotal); 
    return updatedRows;
  });
  reset();
  setServiceItem("")
};
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
  const [services, setServices] = useState(null);
  const [serviceItem, setServiceItem] = useState(null);
  //documents array

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const submitForm1 = async (formData) => {
    console.log(formData);
    try {
      let obj = {
        name: formData?.name,
        name_ar: formData?.arabic,
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
      console.log(formData, "formData");
      //   const promise = CustomerServices.AddServiceItem(obj);

      //   showPromiseToast(
      //     promise,
      //     "Saving...",
      //     "Added Successfully",
      //     "Something Went Wrong"
      //   );
      //   const response = await promise;
      //   if (response?.responseCode === 200) {
      //     navigate("/service-list");
      //   }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Account
  const getReceptionDetail = async () => {
    try {
      let params = {
        token_number: getValues1("token"),
      };
      const { data } = await CustomerServices.getReceptionDetail(params);
      console.log(data, "dataaa");
      setValue1("customer", data?.token?.customer_name);
      setValue1("invoice_date", moment().toDate());
      setValue1("mobile", data?.token?.mobile);
      setValue1("ref", data?.token?.reference);
      setValue1("display_customer", data?.token?.customer_name);
      setValue1("email", data?.token?.email);
      setValue1("address", data?.token?.address);
      setValue1("trn", data?.token?.trn);
      setValue1("cost_center", data?.token?.cost_center);

      setAccounts(data?.accounts?.rows);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };

  const getServiceItem = async () => {
    // setLoader(true)
    try {
      let params = {
        page: 1,
        limit: 1000,
      };

      const { data } = await CustomerServices.getServiceItem(params);

      setServices(data?.rows);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };
  const handleServiceSelect = async (value) => {
    console.log(value, "idididid");
    setServiceItem(value);
    // setLoader(true)
    try {
      let params = {
        service_id: value?.id,
      };

      const { data } = await CustomerServices.DetailServiceItem(params);
      setValue("item_code", data?.service?.id);
      setValue("govt_fee", data?.service?.bank_service_charge);
      setValue("center_fee", data?.service?.center_fee);
      setValue("bank_charges", data?.service?.bank_service_charge);
      setValue("qty",1);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };

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

  useEffect(() => {
    getAccounts();
    getTax();
    getCategories();
    getServiceItem();
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
                  Sales Receipt
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                <Grid container sx={{ gap: "5px 25px" }}>
                  <Grid item xs={12}>
                    <Grid container>
                      <Grid item md={3} sm={12} xs={12}>
                        <InputField
                          label="Token"
                          size="small"
                          placeholder="Enter Token"
                          register={register1("token")}
                          InputProps={{
                            endAdornment: (
                              <IconButton onClick={getReceptionDetail}>
                                <SearchIcon sx={{ color: "#bd9b4a" }} />
                              </IconButton>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid
                    item
                    md={5.5}
                    sm={12}
                    xs={12}
                    sx={{
                      border: "2px solid black",
                      p: 2,
                      borderRadius: "15px",
                    }}
                  >
                    <Grid container sx={{ gap: "5px 25px" }}>
                      <Grid item md={5.7} sm={12} xs={12}>
                        <InputField
                          label="Invoice No"
                          size="small"
                          placeholder="TSL/83540"
                          register={register1("invoice_no")}
                        />
                      </Grid>

                      <Grid item md={5.7} sm={12} xs={12}>
                        <DatePicker
                          label="Invoice Date"
                          value={watch1("invoice_date")}
                          onChange={(value) => setValue("invoice_date", value)}
                          maxDate={moment().toDate()}
                        />
                      </Grid>

                      <Grid item md={5.7} sm={12} xs={12}>
                        <SelectField
                          label="Customer"
                          size="small"
                          options={[{ id: "walkin", name: "Walk-in Customer" }]}
                          selected={watch1("customer")}
                          onSelect={(value) => setValue("customer", value)}
                          register={register1("customer")}
                        />
                      </Grid>

                      <Grid item md={5.7} sm={12} xs={12}>
                        <SelectField
                          label="Company"
                          size="small"
                          options={[{ id: 1, name: "ABC Ltd" }]} // Replace with real data
                          selected={watch1("company")}
                          onSelect={(value) => setValue("company", value)}
                          register={register1("company")}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    md={5.5}
                    sm={12}
                    xs={12}
                    sx={{
                      border: "2px solid black",
                      p: 2,
                      borderRadius: "15px",
                      mt: { md: 0, sm: 2, xs: 2 },
                    }}
                  >
                    <Grid container sx={{ gap: "5px 25px" }}>
                      <Grid item md={5.7} sm={12} xs={12}>
                        <InputField
                          label="Display Customer"
                          size="small"
                          placeholder="Walk-in Customer"
                          register={register1("display_customer")}
                        />
                      </Grid>

                      <Grid item md={5.7} sm={12} xs={12}>
                        <InputField
                          label="Mobile"
                          size="small"
                          placeholder="Mobile No"
                          register={register1("mobile")}
                        />
                      </Grid>

                      <Grid item md={5.7} sm={12} xs={12}>
                        <InputField
                          label="Email"
                          size="small"
                          placeholder="Email"
                          register={register1("email")}
                        />
                      </Grid>

                      <Grid item md={5.7} sm={12} xs={12}>
                        <InputField
                          label="TRN"
                          size="small"
                          placeholder="TRN"
                          register={register1("trn")}
                        />
                      </Grid>

                      <Grid item md={5.7} sm={12} xs={12}>
                        <InputField
                          label="Ref"
                          size="small"
                          placeholder="Reference"
                          register={register1("ref")}
                        />
                      </Grid>

                      <Grid item md={5.7} sm={12} xs={12}>
                        <SelectField
                          label="Cost Center"
                          size="small"
                          options={[{ id: "tasheel", name: "TASHEEL" }]}
                          selected={watch1("cost_center")}
                          onSelect={(value) => setValue("cost_center", value)}
                          register={register1("cost_center")}
                        />
                      </Grid>
                      <Grid item md={5.7} sm={12} xs={12}>
                        <InputField
                          label="Address"
                          size="small"
                          placeholder="Address"
                          multiline
                          rows={2}
                          register={register1("address")}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* </Grid> */}
                  <Grid item xs={2.8}>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        backgroundColor: "#bd9b4a",
                        ":hover": {
                          backgroundColor: "rgb(189 155 74)",
                        },
                      }}
                    >
                      Add Company
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            
    <form onSubmit={handleSubmit(addItem)}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Code</TableCell>
              <TableCell sx={{ width: "200px" }}>Item Description</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Govt fee</TableCell>
              <TableCell>Center fee</TableCell>
              <TableCell>Bank Charge</TableCell>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Application ID</TableCell>
              <TableCell>Narration</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <InputField
                  size="small"
                  placeholder="Item code"
                  {...register("item_code", { required: "Item code is required" })}
                />
                {errors.item_code && <span>{errors.item_code.message}</span>}
              </TableCell>
              <TableCell>
              <SelectField
                         size="small"
                         options={services}
                         selected={serviceItem}
                         onSelect={handleServiceSelect}
                        //  error={errors?.service?.message}
                         register={register("service", {
                           required: "Please select a service.",
                         })}
                       />
                {errors.service && <span style={{color:"red"}}>{errors.service.message}</span>}
              </TableCell>
              <TableCell>
                <InputField
                  size="small"
                  placeholder="Quantity"
                  type="number"
                  register={register("qty", { required: "Quantity is required" })}
                />
                {errors.qty && <span style={{color:"red"}}>{errors.qty.message}</span>}
              </TableCell>
              <TableCell>
                <InputField
                  size="small"
                  placeholder="Govt fee"
                  type="number"
                  register={register("govt_fee", { required: "Govt fee is required" })}
                />
                {errors.govt_fee && <span style={{color:"red"}}>{errors.govt_fee.message}</span>}
              </TableCell>
              <TableCell>
                <InputField
                  size="small"
                  placeholder="Center Fee"
                  type="number"
                  register={register("center_fee", { required: "Center fee is required" })}
                />
                {errors.center_fee && <span style={{color:"red"}}>{errors.center_fee.message}</span>}
              </TableCell>
              <TableCell>
                <InputField
                  size="small"
                  placeholder="Bank Charges"
                  type="number"
                  register={register("bank_charges", { required: "Bank charges are required" })}
                  disabled
                />
                {errors.bank_charges && <span style={{color:"red"}}>{errors.bank_charges.message}</span>}

              </TableCell>
              <TableCell>
                <InputField
                  size="small"
                  placeholder="Transaction Id"
                  register={register("transaction_id", { required: "Transaction Id is required" })}
                />
                {errors.transaction_id && <span style={{color:"red"}}>{errors.transaction_id.message}</span>}
              </TableCell>
              <TableCell>
                <InputField
                  size="small"
                  placeholder="Application Id"
                  register={register("application_id", { required: "Application Id is required" })}
                />
                {errors.application_id && <span style={{color:"red"}}>{errors.application_id.message}</span>}
              </TableCell>
              <TableCell>
                <InputField
                  size="small"
                  placeholder="Narration"
                  register={register("narration", { required: "Narration is required" })}
                />
                {errors.narration && <span style={{color:"red"}}>{errors.narration.message}</span>}
              </TableCell>
              <TableCell>
               <InputField
                   disabled={true}
                   style={{border:"none"}}
                  size="small"
                  placeholder="Narration"
                  register={register("total")}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  sx={{
                    backgroundColor: "rgb(189 155 74)",
                    fontSize: "12px",
                    ":hover": {
                      backgroundColor: "rgb(189 155 74)",
                    },
                  }}
                >
                  Add Item
                </Button>
              </TableCell>
            </TableRow>

            {rows.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item?.item_code}</TableCell>
                <TableCell>{item?.service}</TableCell>
                <TableCell>{item?.qty}</TableCell>
                <TableCell>{item?.govt_fee}</TableCell>
                <TableCell>{item?.center_fee}</TableCell>
                <TableCell>{item?.bank_charges}</TableCell>
                <TableCell>{item?.transaction_id}</TableCell>
                <TableCell>{item?.application_id}</TableCell>
                <TableCell>{item?.narration}</TableCell>
                <TableCell>{item?.total}</TableCell>
               
              </TableRow>
            ))}

<TableRow>
              <TableCell colSpan={9} align="right">
                <Typography variant="h6"  sx={{fontSize:"15px"}}>Sub-total:</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6"  sx={{fontSize:"15px"}}>{subTotal}</Typography> {/* Display the Sub-total */}
              </TableCell>
            </TableRow>

            {/* Amount Total Row (optional, if needed for the final sum) */}
            <TableRow>
              <TableCell colSpan={9} align="right">
                <Typography variant="h6"  sx={{fontSize:"15px"}}>Amount Total:</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6" sx={{fontSize:"15px"}}>{subTotal}</Typography> {/* This can be the same as Sub-total */}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </form>
          </>
        }
      </Box>
    </>
  );
}

export default SalesReciept;
