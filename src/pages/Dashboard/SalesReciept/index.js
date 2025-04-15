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
import AddIcon from "@mui/icons-material/Add";
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
import { addMonths, max } from "date-fns";
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

  console.log(rows, "data");
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
    watch: watch1,
    formState: { errors: errors1 },
  } = useForm();

  // Watch all form data

  // Watch for changes in the fee-related fields
  const govtFee = watch("govt_fee", 0);
  const centerFee = watch("center_fee", 0);
  const bankCharges = watch("bank_charge", 0);
  const qty = watch("quantity", 1);
  useEffect(() => {
    const feesTotal =
      (parseFloat(govtFee) || 0) +
      (parseFloat(centerFee) || 0) +
      (parseFloat(bankCharges) || 0);
    const finalTotal = feesTotal * (parseFloat(qty) || 1);
    setValue("total", finalTotal);
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
    setServiceItem("");
  };

  const [activeStep, setActiveStep] = React.useState(1);

  // const [fieldsDisabled, setFieldsDisabled] = useState({
  //   monthlyVisaServiceCharges: false,
  //   vipMedical: false,
  //   extraTyping: true,
  // });
  const [fieldsDisabled, setFieldsDisabled] = useState(false);

  const [center, setCenter] = useState(null);
  const [status, setStatus] = useState(null);

  // *For Stepper Forms Data
  const [stepFormData, setStepFormData] = useState();
  const [step1FormData, setStep1FormData] = useState();
  const [selectedType, setSelectedType] = useState(null);
  const [date, setDate] = useState(new Date());
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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detail, setDetail] = useState(null);
  const [holdState, setHoldState] = useState(true);
  // const [fieldsDisabled, setFieldsDisabled] = useState(false)

  //documents array

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const submitForm1 = async (formData) => {
    console.log(formData);
    try {
      let obj = {
        token_number: formData?.token,
        token_date: date,
        invoice_prefix: "AAD",
        cost_center: formData?.cost_center,
        customer_name: formData?.display_customer,
        reception_id: detail?.id,
        customer_mobile: formData?.mobile,
        customer_email: formData?.email,
        ref: formData?.ref,
        total_amount: subTotal,

        items: rows,
      };
      console.log(formData, "formData");
      const promise = CustomerServices.CreateSaleReceipt(obj);

      showPromiseToast(
        promise,
        "Saving...",
        "Added Successfully",
        "Something Went Wrong"
      );
      const response = await promise;
      if (response?.responseCode === 200) {
        navigate("/pre-sales");
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Account
  const getReceptionDetail = async (value) => {
    setFieldsDisabled(true);

    try {
      let params =
        value === "token"
          ? { token_number: getValues1("token") }
          : { mobile: getValues1("mobileValue") };

      const { data } = await CustomerServices.getReceptionDetail(params);
      console.log(data, "dataaa");
      setDetail(data?.token);
      setValue1("customer", data?.token?.customer_name);
      setValue1("invoice_date", moment().toDate());
      setValue1("mobile", data?.token?.mobile);
      setValue1("ref", data?.token?.reference);
      setValue1("display_customer", data?.token?.customer_name);
      setValue1("email", data?.token?.email);
      setValue1("address", data?.token?.address);
      setValue1("trn", data?.token?.trn);
      setValue1("cost_center", data?.token?.cost_center);
      setValue1("token", data?.token?.token_number);
      setValue1("mobileValue", data?.token?.mobile);

      setAccounts(data?.accounts?.rows);

      getServiceItem(data?.token?.service_category?.id);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };

  const getServiceItem = async (id) => {
    // setLoader(true)
    try {
      let params = {
        page: 1,
        limit: 1000,
        category_id: id,
      };

      const { data } = await CustomerServices.getServiceItem(params);

      setServices(data?.rows);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };
  const getInvoiceNumber = async () => {
    // setLoader(true)
    try {
      const { data } = await CustomerServices.getInvoiceNumber();

      console.log(data);
      setValue1("invoice_no", `AAD/${data?.next_invoice_number}`);
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
      setValue("service_id", data?.service?.id);
      setValue("govt_fee", data?.service?.bank_service_charge);
      setValue("center_fee", data?.service?.center_fee);
      setValue("bank_charge", data?.service?.bank_service_charge);

      setValue("quantity", 1);
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
  // *For Get Account
  const getReceiptDetail = async (state) => {
    setFieldsDisabled(true);
    try {
      let params = {
        token_number: getValues1("token"),
      };

      const { data } = await CustomerServices.getReceiptDetail(params);
      console.log(data);
      if (data?.receipt) {
        setHoldState(true);

        showErrorToast("Invoice already exist with this token number");
      } else {
        setHoldState(false);
      }
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
    // getServiceItem();
    getInvoiceNumber();
    setSelectedCustomer({ id: "walkin", name: "Walk-in Customer" });
    setValue1("customer", { id: "walkin", name: "Walk-in Customer" });
  }, []);

  const getCustomerDetail2 = async (phone) => {
    try {
      let params = {
        mobile: phone,
      };

      const { data } = await CustomerServices.getCustomerDetail(params);
      let detail = data?.customer;
      console.log(detail);
      setValue1("customer", detail?.token?.customer_name);
      setValue1("invoice_date", moment().toDate());
      setValue1("mobile", detail?.token?.mobile);
      setValue1("ref", detail?.token?.reference);
      setValue1("display_customer", detail?.token?.customer_name);
      setValue1("email", detail?.token?.email);
      setValue1("address", detail?.token?.address);
      setValue1("trn", detail?.token?.trn);
      setValue1("cost_center", detail?.token?.cost_center);

      setAccounts(detail?.accounts?.rows);

      getServiceItem(detail?.token?.service_category?.id);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };
  return (
    <>
      <Box m={3} sx={{ backgroundColor: "white", borderRadius: "12px" }}>
        <Box component={"form"} onSubmit={handleSubmit1(submitForm1)}>
          <Box>
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
              Create Sales Receipt
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <Grid container sx={{ gap: "5px 25px" }}>
              <Grid item xs={12}>
                <Grid item xs={12}>
                  <Grid container gap={2} alignItems={"center"}>
                    <Grid item md={3} sm={12} xs={12}>
                      <InputField
                        label="Token"
                        size="small"
                        disabled={fieldsDisabled}
                        placeholder="Enter Token"
                        register={register1("token")}
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={() => {
                                getReceptionDetail("token");
                                // getReceiptDetail();
                              }}
                            >
                              <SearchIcon sx={{ color: "#bd9b4a" }} />
                            </IconButton>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item md={3} sm={12} xs={12}>
                      <InputField
                        label={"Mobile *:"}
                        size={"small"}
                        type={"number"}
                        disabled={fieldsDisabled}
                        placeholder={"Mobile"}
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={() => {
                                getReceptionDetail("mobile");
                                // getReceiptDetail();
                              }}
                            >
                              <SearchIcon sx={{ color: "#bd9b4a" }} />
                            </IconButton>
                          ),
                        }}
                        register={register1("mobileValue", {
                          required: "Please enter your mobile.",
                          pattern: {
                            value: /^05[0-9]{8}$/,
                            message:
                              "Please enter a valid UAE phone number (starting with 05 and 8 digits).",
                          },
                          onChange: (e) => {
                            console.log("asdas");
                            if (getValues1("mobileValue").length == 10) {
                              //  getReceiptDetail()
                            }

                            // Delay the execution of verifyEmail by 2 seconds
                          },
                        })}
                      />
                    </Grid>
                    <Grid item md={1} sm={12} xs={12} mt={2}>
                      <PrimaryButton
                        bgcolor={"#bd9b4a"}
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
                          setValue1("trn", "");
                          setValue1("cost_center", "");
                          setValue1("mobileValue", "");
                          setValue1("token", "");

                          setAccounts("");
                        }}
                        // loading={loading}
                      />
                    </Grid>
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
                  <Grid item xs={5.7}>
                    <DatePicker
                      label={"Invoice Date :*"}
                      value={date}
                      size={"small"}
                      error={errors1?.date?.message}
                      register={register1("date", {
                        required: date ? false : "please enter  date.",
                      })}
                      maxDate={new Date()}
                      onChange={(date) => {
                        setValue1("date", date);
                        setDate(new Date(date));
                      }}
                    />
                  </Grid>

                  <Grid item xs={5.7}>
                    <SelectField
                      size={"small"}
                      label={"Customer *:"}
                      disabled={true}
                      options={[{ id: "walkin", name: "Walk-in Customer" }]}
                      selected={selectedCustomer}
                      onSelect={(value) => {
                        setSelectedCustomer(value);
                      }}
                      error={errors1?.customer?.message}
                      register={register1("customer", {
                        required: false,
                      })}
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
                      register={register1("display_customer", {
                        required: "please enter display name.",
                      })}
                      error={errors1?.display_customer?.message}
                    />
                  </Grid>

                  <Grid item md={5.7} sm={12} xs={12}>
                    <InputField
                      label="Mobile"
                      size="small"
                      placeholder="Mobile No"
                      register={register1("mobile", {
                        required: "please enter mobile .",
                      })}
                      error={errors1?.display_customer?.message}
                    />
                  </Grid>

                  <Grid item md={5.7} sm={12} xs={12}>
                    <InputField
                      label="Email"
                      size="small"
                      placeholder="Email"
                      register={register1("email", {
                        required: "please enter email .",
                      })}
                      error={errors1?.email?.message}
                    />
                  </Grid>
                  {/* 
                      <Grid item md={5.7} sm={12} xs={12}>
                        <InputField
                          label="TRN"
                          size="small"
                          placeholder="TRN"


                          register={register1("trn", {
                            required: 'please enter trn .'
                          })}
                          error={errors1?.trn?.message}
                        />
                      </Grid> */}

                  <Grid item md={5.7} sm={12} xs={12}>
                    <InputField
                      label="Ref"
                      size="small"
                      placeholder="Reference"
                      register={register1("ref")}
                    />
                  </Grid>

                  {/* <Grid item md={5.7} sm={12} xs={12}>
                        <SelectField
                          label="Cost Center"
                          size="small"
                          options={[{ id: 'Tasheel', name: 'Tasheel' }, { id: 'DED', name: 'DED' }, { id: 'Typing', name: 'Typing' }, { id: 'General', name: 'General' }]}
                          selected={watch1("cost_center")}
                          onSelect={(value) => setValue1("cost_center", value)}

                          register={register1("cost_center", {
                            required: 'please enter cost center .'
                          })}
                          error={errors1?.cost_center?.message}
                        />
                      </Grid> */}
                  <Grid item md={5.7} sm={12} xs={12}>
                    <InputField
                      label="Address"
                      size="small"
                      placeholder="Address"
                      multiline
                      rows={2}
                      register={register1("address", {
                        required: "please enter address .",
                      })}
                      error={errors1?.address?.message}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>

          </Box>

          <form>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "150px" }}>Item Code</TableCell>
                    <TableCell sx={{ width: "400px" }}>Service</TableCell>
                    <TableCell sx={{ width: "150px" }}>Qty</TableCell>
                    <TableCell sx={{ width: "150px" }}>Govt fee</TableCell>
                    <TableCell sx={{ width: "150px" }}>Center fee</TableCell>
                    <TableCell sx={{ width: "150px" }}>Bank Charge</TableCell>
                    <TableCell sx={{ width: "150px" }}>Trsn ID</TableCell>
                    <TableCell sx={{ width: "150px" }}>App/Case ID</TableCell>
                    <TableCell sx={{ width: "150px" }}>Ref No</TableCell>

                    <TableCell sx={{ width: "150px" }}>Total</TableCell>
                    <TableCell sx={{ width: "150px" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <InputField
                        size="small"
                        disabled={true}
                        placeholder="Item code"
                        register={register("service_id", {
                          required: "Item code is required",
                        })}
                      />
                      {errors.service_id && (
                        <span>{errors.service_id.message}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <SelectField
                        size="small"
                        options={services}
                        selected={serviceItem}
                        onSelect={handleServiceSelect}
                        register={register("service_description", {
                          required: "Please select a service.",
                        })}
                      />
                      {errors.service_description && (
                        <span style={{ color: "red" }}>
                          {errors.service_description.message}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <InputField
                        size="small"
                        placeholder="Quantity"
                        type="number"
                        register={register("quantity", {
                          required: "Quantity is required",
                        })}
                      />
                      {errors.quantity && (
                        <span style={{ color: "red" }}>
                          {errors.quantity.message}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <InputField
                        size="small"
                        placeholder="Govt fee"
                        type="number"
                        register={register("govt_fee", {
                          required: "Govt fee is required",
                        })}
                      />
                      {errors.govt_fee && (
                        <span style={{ color: "red" }}>
                          {errors.govt_fee.message}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <InputField
                        size="small"
                        placeholder="Center Fee"
                        type="number"
                        register={register("center_fee", {
                          required: "Center fee is required",
                        })}
                      />
                      {errors.center_fee && (
                        <span style={{ color: "red" }}>
                          {errors.center_fee.message}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <InputField
                        size="small"
                        placeholder="Bank Charges"
                        type="number"
                        register={register("bank_charge", {
                          required: "Bank charges are required",
                        })}
                        disabled
                      />
                      {errors.bank_charge && (
                        <span style={{ color: "red" }}>
                          {errors.bank_charge.message}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <InputField
                        size="small"
                        placeholder="Transaction Id"
                        type="number"
                        register={register("transaction_id", {
                          required: "Transaction Id is required",
                        })}
                      />
                      {errors.transaction_id && (
                        <span style={{ color: "red" }}>
                          {errors.transaction_id.message}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <InputField
                        size="small"
                        placeholder="Application Id"
                        type="number"
                        register={register("application_id", {
                          required: "Application Id is required",
                        })}
                      />
                      {errors.application_id && (
                        <span style={{ color: "red" }}>
                          {errors.application_id.message}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <InputField
                        size="small"
                        placeholder=" Ref No"
                        type="number"
                        register={register("ref_no", {
                          required: "Ref No is required",
                        })}
                      />
                      {errors.ref_no && (
                        <span style={{ color: "red" }}>
                          {errors.ref_no.message}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <InputField
                        disabled={true}
                        style={{ border: "none" }}
                        size="small"
                        register={register("total")}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{
                          textTransform: "capitalize",
                          backgroundColor: "rgb(189 155 74)",
                          fontSize: "12px",
                          ":hover": {
                            backgroundColor: "rgb(189 155 74)",
                          },
                        }}
                        onClick={handleSubmit(addItem)}
                      >
                        <AddIcon />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {rows.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item?.service_id}</TableCell>
                      <TableCell>{item?.service_description}</TableCell>
                      <TableCell>{item?.quantity}</TableCell>
                      <TableCell>{item?.govt_fee}</TableCell>
                      <TableCell>{item?.center_fee}</TableCell>
                      <TableCell>{item?.bank_charge}</TableCell>
                      <TableCell>{item?.transaction_id}</TableCell>
                      <TableCell>{item?.application_id}</TableCell>
                      <TableCell>{item?.ref_no}</TableCell>

                      <TableCell>{item?.total}</TableCell>
                    </TableRow>
                  ))}

                  <TableRow>
                    <TableCell colSpan={7} align="right">
                      <Typography variant="h6" sx={{ fontSize: "15px" }}>
                        Sub-total:
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" sx={{ fontSize: "15px" }}>
                        {subTotal}
                      </Typography>{" "}
                      {/* Display the Sub-total */}
                    </TableCell>
                  </TableRow>

                  {/* Amount Total Row (optional, if needed for the final sum) */}
                  <TableRow>
                    <TableCell colSpan={7} align="right">
                      <Typography variant="h6" sx={{ fontSize: "15px" }}>
                        Amount Total:
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" sx={{ fontSize: "15px" }}>
                        {subTotal}
                      </Typography>{" "}
                      {/* This can be the same as Sub-total */}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </form>

          <TableContainer component={Paper}>
            <Table>
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box
                    sx={{ display: "flex", gap: 2, justifyContent: "center" }}
                  >
                    <Button
                      type="submit"
                   
                      disabled={rows?.length === 0}
                      variant="contained"
                      sx={{
                        width: "350px",
                        textTransform: "capitalize",
                        backgroundColor: "#bd9b4a",
                        ":hover": {
                          backgroundColor: "rgb(189 155 74)",
                        },
                      }}
                    >
                      Place Invoice
                    </Button>
                    <Button
                      onClick={() => navigate("/pre-sales")}
                      variant="contained"
                      sx={{
                        width: "350px",
                        textTransform: "capitalize",
                        backgroundColor: "#bd9b4a",
                        ":hover": {
                          backgroundColor: "rgb(189 155 74)",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </>
  );
}

export default SalesReciept;
