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
import Barcode from "react-barcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// import { TableBody, TableHead } from "mui-datatables";

function SalesReciept() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRow, setSelectedRow] = useState(null)
  const [editState, setEditState] = useState(false)
  const [formChange, setFormChange] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [excludeFromSales, setExcludeFromSales] = useState("no");
  const [excludeFromPurchase, setExcludeFromPurchase] = useState("no");
  const [total, setTotal] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [rows, setRows] = useState([]);
  const [invoiceData, setInvoiceData] = useState(null)
  const [buttonDisabled, setButtonDisabled] = useState(false)

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
  console.log(errors1);

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
    console.log(data);

    // Create a new row with the serviceItem included
    const newRow = { ...data, service: serviceItem };

    setRows((prevRows) => {
        const updatedRows = [...prevRows, newRow];
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
  const invoiceRef = useRef(null);
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
  const [services, setServices] = useState([]);
  const [serviceItem, setServiceItem] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detail, setDetail] = useState(null);
  const [holdState, setHoldState] = useState(true);
  // const [fieldsDisabled, setFieldsDisabled] = useState(false)

  //documents array

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    // Temporarily hide the content while generating the PDF
    const invoiceElement = invoiceRef.current;
    invoiceElement.style.display = 'block';  // Hide the element

    // Capture the content using html2canvas
    const canvas = await html2canvas(invoiceElement, {
      scale: 1,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add image to the PDF
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Save the generated PDF
    pdf.save("invoice.pdf");
    navigate("/pre-sales");
    // Restore the content visibility after generating the PDF
    invoiceElement.style.display = 'none';  // Show the content again
  };


  const submitForm1 = async (formData) => {
    setButtonDisabled(true);
    console.log(formData);
    const updatedRows = rows.map(({ id, ...rest }) => ({
      ...rest,
      service_id: id,
    }));
    
    try {
      let obj = {
        token_number: formData?.token,
        token_date: date,
        invoice_prefix: "AAD",
        trn: formData?.trn,
        case_no: formData?.caseno,
        cost_center: formData?.cost_center,
        customer_address: formData?.address,
        customer_name: formData?.display_customer,
        reception_id: detail?.id,
        customer_mobile: formData?.mobile,
        customer_email: formData?.email,
        customer_id: detail?.customer_id,
        ref: formData?.ref,
        total_amount: subTotal,
        items: updatedRows,
      };
  
      console.log(formData, "formData");
  
      const apiPromise = CustomerServices.CreateSaleReceipt(obj);
  
      // Show the toast without awaiting immediately
      showPromiseToast(apiPromise, "Saving...", "Added Successfully", "Something Went Wrong");
  
      // Wait for the result separately
      const response = await apiPromise;
  
      // Now you can use the response data
      if (response?.responseCode === 200) {
        console.log(response,'response');
        
        const invoice = {
          id:response?.data?.id,
          date: moment(date).format("DD-MM-YYYY"),
          invoiceType: formData?.invoice_number,
          trn: formData?.trn,
          tokenNumber: formData?.token_number,
          customerName: formData?.display_customer,
          mobileNo: formData?.mobile,
          customerReference: formData?.ref,
          customerAddress: formData?.address,
          items: rows,
          totalSales: 367.25,
          netTaxableAmount: 27.5,
          totalVAT: 1.38,
          grossTotal: 396.13,
          customerCardPayment: 0.0,
          totalPayable: 396.13,
        };
        console.log(invoice, 'invoice');
  
        setInvoiceData(invoice);
  
       
      }
  
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setButtonDisabled(false);
    }
  };
  useEffect(() => {
    if(invoiceData){
      generatePDF()
    }
    
   
  }, [invoiceData])
  

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
      if (value === "token") {
        setValue1("mobileValue", data?.token?.mobile);
      }
      else {
        setValue1("token", data?.token?.token_number);
      }



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
    if (value) {
        // setLoader(true)
        try {
            let params = {
                service_id: value?.id,
            };

            const { data } = await CustomerServices.DetailServiceItem(params);
            setValue("id", data?.service?.id);
            setValue("govt_fee", data?.service?.bank_service_charge);
            setValue("center_fee", data?.service?.center_fee);
            setValue("bank_charge", data?.service?.bank_service_charge);
            // setValue("transaction_id", data?.transaction_id);
            setServiceItem(data?.service);
            setValue("quantity", 1);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
    }
    else {
        setValue("id", '');
        setValue("govt_fee", '');
        setValue("center_fee", '');
        setValue("bank_charge", '');
        setValue("transaction_id", '');
        setValue("application_id", '');
        setValue("ref_no", '');
        setServiceItem(null);
        setValue("quantity", '');
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
        invoice_date: date,
      };

      const { data } = await CustomerServices.getReceiptDetail(params);
      console.log(data);
      if (data?.receipt) {
        setHoldState(true);

        showErrorToast("Invoice already exist with this token number");
      } else {
        getReceptionDetail("token");
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
  const updateItem = (data) => {
    console.log("Raw data passed to updateItem:", data);
    console.log("Current serviceItem:", serviceItem);

    if (!data?.id) {
        console.warn("No valid ID found in data. Skipping update.");
        return;
    }

    const updatedItem = { ...data, service: serviceItem };
    console.log("Updated item to be saved:", updatedItem);

    setRows(prevItems => {
        console.log("Previous rows:", prevItems);
        
        const updatedRows = prevItems.map(item => {
            if (item.id === data.id) {
                console.log(`Item with ID ${item.id} matched. Replacing with updated item.`);
                return updatedItem;
            } else {
                return item;
            }
        });

        console.log("Rows after update:", updatedRows);
        return updatedRows;
    });

    console.log("Resetting form and states...");
    reset();
    setServiceItem(null);
    setEditState(false);
};

  useEffect(() => {
    getAccounts();
    getTax();
    getCategories();
    // getServiceItem();
    getInvoiceNumber();
    setSelectedCustomer({ id: "walkin", name: "Walk-in Customer" });
    setValue1("customer", { id: "walkin", name: "Walk-in Customer" });
    setValue1("cost_center", { id: "Al-ADHEED", name: "Al-ADHEED" })
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
                <Button
                      type="submit"

                      disabled={rows?.length === 0}
                      variant="contained"
                      sx={{
                        width: "200px",
                        textTransform: "capitalize",
                        backgroundColor: "#bd9b4a",
                        ":hover": {
                          backgroundColor: "rgb(189 155 74)",
                        },
                      }}
                    >
                      Place Invoice
                    </Button>
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
                                  getReceiptDetail();
                                 
                                 
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
                                  getReceiptDetail();
                                 
                                  
                                }}
                              >
                                <SearchIcon sx={{ color: "#bd9b4a" }} />
                              </IconButton>
                            ),
                          }}
                          register={register1("mobileValue", {
                            required: false,

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

                            setValue1("mobileValue", "");


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
                        disabled={true}
                        placeholder="TSL/83540"
                        register={register1("invoice_no")}
                      />
                    </Grid>
                    <Grid item xs={5.7}>
                      <DatePicker
                        label={"Invoice Date :*"}
                        value={date}
                        size={"small"}
                        error={errors1?.invoice_date?.message}
                        register={register1("invoice_date", {
                          required: date ? false : "please enter  date.",
                        })}
                        maxDate={new Date()}
                        onChange={(date) => {
                          setValue1("invoice_date", date);
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
                    <Grid item md={5.7} sm={5.5} xs={12}>
                      <InputField
                        label="TRN"
                        size="small"
                        placeholder="TRN"

                        register={register1("trn", {
                          required: false
                        })}

                      />
                    </Grid>
                    {/* <Grid item md={5.7} sm={5.5} xs={12}>
                      <InputField
                        label="Case No"
                        size="small"
                        placeholder="Case No"

                        register={register1("caseno", {
                          required: false
                        })}

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
                    <Grid item md={5.7} sm={5.5} xs={12}>
                      <SelectField
                        label="Cost Center"
                        size="small"

                        options={[{ id: "Al-ADHEED", name: "Al-ADHEED" }]}
                        selected={watch1("cost_center")}
                        onSelect={(value) => setValue1("cost_center", value)}
                        register={register1("cost_center",
                          {
                            required: false
                          }
                        )}

                      />
                    </Grid>

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
          </Box>
          <form onSubmit={handleSubmit(!editState ? addItem : updateItem)}>
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
                                            <TableCell sx={{ width: "150px" }}>Trsn Id</TableCell>
                                            <TableCell sx={{ width: "150px" }}>App/Case ID</TableCell>
                                            <TableCell sx={{ width: "150px" }}>Ref No</TableCell>
                                            <TableCell sx={{ width: "150px" }}>Total</TableCell>
                                            <TableCell sx={{ width: "150px" }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {<TableRow>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    disabled={true}
                                                    placeholder="Item code"
                                                    register={register("id", { required: "Item code is required" })}
                                                />
                                                {errors.id && <span>{errors.id.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <SelectField
                                                    size="small"
                                                    options={services}
                                                    disabled={detail?.is_paid}
                                                    selected={serviceItem}
                                                    onSelect={handleServiceSelect}
                                                    //  error={errors?.service?.message}
                                                    register={register("service", {
                                                        required: "Please select a service.",
                                                    })}
                                                />
                                                {errors.service && <span style={{ color: "red" }}>{errors.service.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    disabled={detail?.is_paid}
                                                    placeholder="Quantity"
                                                    type="number"
                                                    register={register("quantity", { required: "Quantity is required" })}
                                                />
                                                {errors.quantity && <span style={{ color: "red" }}>{errors.quantity.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    disabled={detail?.is_paid}
                                                    placeholder="Govt fee"
                                                    type="number"
                                                    register={register("govt_fee", { required: "Govt fee is required" })}
                                                />
                                                {errors.govt_fee && <span style={{ color: "red" }}>{errors.govt_fee.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    disabled={detail?.is_paid}
                                                    placeholder="Center Fee"
                                                    type="number"
                                                    register={register("center_fee", { required: "Center fee is required" })}
                                                />
                                                {errors.center_fee && <span style={{ color: "red" }}>{errors.center_fee.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    disabled={detail?.is_paid}
                                                    placeholder="Bank Charges"
                                                    type="number"
                                                    register={register("bank_charge", { required: "Bank charges are required" })}
                                                    
                                                />
                                                {errors.bank_charge && <span style={{ color: "red" }}>{errors.bank_charge.message}</span>}

                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    placeholder="Transaction Id"
                                                    type="number"
                                                    register={register("transaction_id", { required: false })}

                                                />
                                                {errors.transaction_id && <span style={{ color: "red" }}>{errors.transaction_id.message}</span>}

                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    placeholder="Application Id"
                                                    type="number"
                                                    register={register("application_id", {
                                                      required: false ,
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
                                                      required: false ,
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
                                                    placeholder=""
                                                    register={register("total")}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {(!editState && !detail?.is_paid) && <Button
                                                    variant="contained"
                                                    color="primary"
                                                    type="submit"
                                                    sx={{
                                                        textTransform: 'capitalize',
                                                        backgroundColor: "rgb(189 155 74)",
                                                        fontSize: "12px",
                                                        ":hover": {
                                                            backgroundColor: "rgb(189 155 74)",
                                                        },
                                                    }}
                                                >
                                                    <AddIcon />
                                                </Button>}
                                                {editState && <> <Button
                                                    variant="contained"
                                                    color="primary"
                                                    type="submit"
                                                    sx={{
                                                        textTransform: 'capitalize',
                                                        backgroundColor: "rgb(189 155 74)",
                                                        fontSize: "12px",
                                                        ":hover": {
                                                            backgroundColor: "rgb(189 155 74)",
                                                        },
                                                    }}
                                                >
                                                    Update
                                                </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"

                                                        onClick={() => {
                                                            setEditState(false)

                                                            setValue("id", '');
                                                            setValue("govt_fee", '');
                                                            setValue("center_fee", '');
                                                            setValue("bank_charge", '');
                                                            setValue("transaction_id", '');
                                                            setValue("application_id", '');
                                                            setValue("ref_no", '');
                                                            setServiceItem(null);
                                                            setValue("quantity", '');
                                                        }}
                                                        sx={{
                                                            mt: 2,
                                                            textTransform: 'capitalize',
                                                            backgroundColor: "rgb(189 155 74)",
                                                            fontSize: "12px",
                                                            ":hover": {
                                                                backgroundColor: "rgb(189 155 74)",
                                                            },
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button></>}
                                            </TableCell>
                                        </TableRow>}

                                        {rows?.length > 0 && rows?.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item?.id}</TableCell>
                                                <TableCell>{item?.service?.name}</TableCell>
                                                <TableCell>{item?.quantity}</TableCell>
                                                <TableCell>{item?.govt_fee}</TableCell>
                                                <TableCell>{item?.center_fee}</TableCell>
                                                <TableCell>{item?.bank_charge}</TableCell>
                                                <TableCell>{item?.transaction_id}</TableCell>
                                                <TableCell>{item?.application_id}</TableCell>
                                                <TableCell>{item?.ref_no}</TableCell>

                                                <TableCell>{item?.total}</TableCell>
                                                <TableCell><Box sx={{ display: 'flex', gap: 1 }}>

                                                    {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => {
                                                        setSelectedRow(item); setEditState(true)
                                                        console.log(item);
                                                        
                                                        setValue("id", item?.id);
                                                        setValue("govt_fee", item?.govt_fee);
                                                        setValue("center_fee", item?.service?.center_fee);
                                                        setValue("bank_charge", item?.service?.bank_service_charge);
                                                        setValue("transaction_id", item?.transaction_id);
                                                        setValue("application_id", item?.application_id);
                                                        setValue("ref_no", item?.ref_no);
                                                        setValue("service", item?.service);
                                                        setServiceItem(item?.service);
                                                        setValue("quantity", item?.quantity);
                                                        console.log(item?.service)

                                                    }} src={Images.editIcon} width={'35px'}></Box>}
                                                    <Box>
                                                        {true && <Box sx={{ cursor: 'pointer' }} component={'img'} src={Images.deleteIcon} onClick={() => {

                                                            let selectedID = item?.id
                                                            setRows(rows?.filter(item2 => item2?.id != item?.id))
                                                        }} width={'35px'}></Box>}


                                                    </Box>

                                                </Box></TableCell>
                                            </TableRow>
                                        ))}

                                        <TableRow>
                                            <TableCell colSpan={9} align="right">
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>Sub-total:</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>{subTotal}</Typography> {/* Display the Sub-total */}
                                            </TableCell>
                                        </TableRow>

                                        {/* Amount Total Row (optional, if needed for the final sum) */}
                                        <TableRow>
                                            <TableCell colSpan={9} align="right">
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>Amount Total:</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>{subTotal}</Typography> {/* This can be the same as Sub-total */}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </form>

         
        
      </Box>
      {console.log(invoiceData)}
       <Box className="showPdf" ref={invoiceRef} sx={{ padding: "20px 60px" }}>
             <div className="w-full h-[115px] flex justify-center items-center mb-4">
               <img
                 src={Images.header}
                 alt="Header"
                 style={{ width: "100%" }}
                 className="max-w-full h-auto"
               />
             </div>
     
             <Box
               sx={{
                 display: "flex",
                 border: "1px solid #000",
                 my: 2,
                 fontSize: "15px",
               }}
             >
               <Box
                 sx={{
                   width: "50%",
                   p: 2,
                   borderRight: "1px solid #000",
                   display: "flex",
                   flexDirection: "column",
                 }}
               >
     
     
                 <Grid container spacing={1}>
     
                   <Grid item xs={6}>
                     <Typography
                       variant="body2"
                       sx={{ fontWeight: "bold", fontSize: "15px" }}
                     >
                       Invoice Type - Invoice No
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography variant="body2" sx={{ fontSize: "15px" }}>
                       {invoiceData?.invoiceType}
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <p
                       variant="body2"
                       style={{
                         fontWeight: "bold",
                         fontSize: "12px",
                         margin: 0,
                       }}
                     >
                       Date/التاريخ والوقت
                     </p>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography variant="body2" sx={{ fontSize: "12px" }}>
                       {invoiceData?.date}
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography
                       variant="body2"
                       sx={{ fontWeight: "bold", fontSize: "15px" }}
                     >
                       Name Of Employee (Typist)
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography variant="body2" sx={{ fontSize: "15px" }}>
                       Typist
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography
                       variant="body2"
                       sx={{ fontWeight: "bold", fontSize: "15px" }}
                     >
                       Name Of Employee (Cashier)
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography variant="body2" sx={{ fontSize: "15px" }}>
                       Cashier
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography
                       variant="body2"
                       sx={{ fontWeight: "bold", fontSize: "15px" }}
                     >
                       Application number/Case number
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography variant="body2" sx={{ fontSize: "15px" }}>
     
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography
                       variant="body2"
                       sx={{ fontWeight: "bold", fontSize: "15px" }}
                     >
                       TRN:
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography variant="body2" sx={{ fontSize: "15px" }}>
                       {invoiceData?.trn}
                     </Typography>
                   </Grid>
     
                   <Grid item xs={6}>
                     <Typography
                       variant="body2"
                       sx={{ fontWeight: "bold", fontSize: "15px" }}
                     >
                       Token Number
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography variant="body2" sx={{ fontSize: "15px" }}>
                       {invoiceData?.tokenNumber}
                     </Typography>
                   </Grid>
                 </Grid>
               </Box>
     
               <Box sx={{ width: "50%", p: 2 }}>
                 <Grid item xs={6}>
                   <p
                     variant="body2"
                     style={{
                       fontSize: "12px",
                       fontWeight: "bold",
                       margin: 0,
                       // textAlign:"center",
                       // marginBottom:2
                     }}
                   >
                     Customer Information معلومات المتعاملين
                   </p>
                 </Grid>
     
     
                 <Grid container spacing={1}>
                   <Grid item xs={6}>
                     <p
                       variant="body2"
                       style={{
                         fontSize: "12px",
                         fontWeight: "bold",
                         margin: 0,
                         // textAlign:"center",
                         // marginBottom:2
                       }}
                     >
                       Name.. / الاسم
                     </p>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography variant="body2" sx={{ fontSize: "12px" }}>
                       {invoiceData?.customerName}
                     </Typography>
                   </Grid>
     
                   <Grid item xs={6}>
                     <p
                       variant="body2"
                       style={{
                         fontSize: "12px",
                         fontWeight: "bold",
                         margin: 0,
                       }}
                     >
                       Phone/ الهاتف رق
                     </p>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography variant="body2" sx={{ fontSize: "15px" }}>
                       {invoiceData?.mobileNo}
                     </Typography>
                   </Grid>
     
                   <Grid item xs={6}>
                     <Typography
                       variant="body2"
                       sx={{ fontWeight: "bold", fontSize: "12px" }}
                     >
                       Email / الالكتروني البريد
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography variant="body2" sx={{ fontSize: "12px" }}>
                       {invoiceData?.email}
                     </Typography>
                   </Grid>
     
                   <Grid item xs={6}>
                     <Typography
                       variant="body2"
                       sx={{ fontWeight: "bold", fontSize: "12px" }}
                     >
                       The No.of the Claim Or Request /
                       رقم الطلب أو الدعوى
     
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography variant="body2" sx={{ fontSize: "12px" }}>
     
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography
                       variant="body2"
                       sx={{ fontWeight: "bold", fontSize: "12px" }}
                     >
                       Customer Address
     
                     </Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography variant="body2" sx={{ fontSize: "12px" }}>
                       {invoiceData?.customerAddress}
                     </Typography>
                   </Grid>
                 </Grid>
               </Box>
             </Box>
     
             <Box sx={{ my: 5 }}>
               <p
                 variant="h6"
                 style={{
                   fontSize: "15px",
                 }}
               >
                 Particulars تفاصيل
               </p>
     
               <table className="mytable" style={{ width: "100%", borderCollapse: "collapse" }}>
                 <thead>
                   <tr style={{ backgroundColor: "transparent" }}>
                     <th
                       style={{
                         border: "1px solid black !important",
                         padding: "8px",
                         textAlign: "center",
                         width: "5%",
                       }}
                     >
                       <p style={{ fontSize: "12px", color: 'black', }}>Sl.No الرقم</p>
                     </th>
                     <th
                       style={{
                         border: "1px solid black !important",
                         padding: "8px",
                         textAlign: "center",
                         width: "30%",
                         fontWeight: "bold",
                       }}
                     >
                       <p style={{ fontSize: "12px", color: 'black' }}>Service - الخدمات</p>
                     </th>
                     <th
                       style={{
                         border: "1px solid black !important",
                         padding: "8px",
                         textAlign: "center",
                         width: "8%",
                         fontWeight: "bold",
                       }}
                     >
                       <p style={{ fontSize: "12px", color: 'black', }}>Qty - الكمية</p>
                     </th>
                     <th
                       style={{
                         border: "1px solid black !important",
                         padding: "8px",
                         textAlign: "center",
                         width: "18%",
                         fontWeight: "bold",
                       }}
                     >
                       <p style={{ fontSize: "12px", color: 'black' }}>
                         Govt Fee and Bank Charge - الرسوم الحكومية
                       </p>
                     </th>
                     <th
                       style={{
                         border: "1px solid black !important",
                         padding: "8px",
                         textAlign: "center",
                         width: "15%",
                       }}
                     >
                       <p style={{ fontSize: "12px", color: 'black' }}>
                         Service Charge Taxable - تكلفة الخدمة
                       </p>
                     </th>
                     <th
                       style={{
                         border: "1px solid black !important",
                         padding: "8px",
                         textAlign: "center",
                         width: "15%",
                       }}
                     >
                       <p style={{ fontSize: "12px", color: 'black' }}>Tax Amt - قيمة المضافة</p>
                     </th>
                     <th
                       style={{
                         border: "1px solid black !important",
                         padding: "8px",
                         textAlign: "center",
                         width: "15%",
                       }}
                     >
                       <p style={{ fontSize: "12px", color: 'black' }}>Total - الإجمالي بالدرهم</p>
                     </th>
                   </tr>
                 </thead>
                 <tbody>
                   {invoiceData?.items?.map((item) => (
                     <tr key={item.id}>
                       <td
                         style={{
                           border: "1px solid black !important",
                           padding: "8px",
                           textAlign: "center",
                         }}
                       >
                         {item?.id}
                       </td>
                       <td
                         style={{
                           border: "1px solid black !important",
                           padding: "8px",
                           textAlign: "center",
                         }}
                       >
                         <div
                           style={{
                             display: "flex",
                             justifyContent: "space-between",
                           }}
                         >
                           <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                             {item?.service?.name}
                           </span>
                           <span style={{ fontSize: "12px" }}>
                             {item.service?.name_ar}
                           </span>
                         </div>
                         {/* <p style={{ fontSize: "9px", textAlign: "left" }}>
                               {item?.details}
                             </p> */}
                       </td>
                       <td
                         style={{
                           border: "1px solid black !important",
                           padding: "8px",
                           textAlign: "center",
                           fontSize: "12px",
                         }}
                       >
                         {item?.quantity}
                       </td>
                       <td
                         style={{
                           border: "1px solid black !important",
                           padding: "8px",
                           textAlign: "center",
                           fontSize: "12px",
                         }}
                       >
                         {(
                           parseFloat(item?.govt_fee || 0) +
                           parseFloat(item?.bank_charge || 0)
                         ).toFixed(2)}
                       </td>
                       <td
                         style={{
                           border: "1px solid black !important",
                           padding: "8px",
                           textAlign: "center",
                           fontSize: "12px",
                         }}
                       >
                         {parseFloat(item?.center_fee).toFixed(2)}
                       </td>
                       <td
                         style={{
                           border: "1px solid black !important",
                           padding: "8px",
                           textAlign: "center",
                           fontSize: "12px",
                         }}
                       >
                         {parseFloat(item?.bank_charge).toFixed(2)}
                       </td>
                       <td
                         style={{
                           border: "1px solid black !important",
                           padding: "8px",
                           textAlign: "center",
                           fontSize: "12px",
                         }}
                       >
                         {parseFloat(item?.total).toFixed(2)}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
     
               <table className="mytable" style={{ width: "100%", borderCollapse: "collapse" }}>
                 <tbody>
                   <tr>
                     <td
                       colSpan={5}
                       style={{
                         border: "1px solid #000",
                         padding: "0.01rem",
                         textAlign: "right",
                       }}
                     >
                       <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                         Total Govt.fee & Bank Charge
                       </p>
                     </td>
                     <td
                       style={{
                         border: "1px solid #000",
                         padding: "0.01rem",
                         textAlign: "center",
                         width: "8%",
                       }}
                     >
                       <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                         {invoiceData?.items
                           ?.reduce(
                             (total, item) =>
                               parseFloat(total) +
                               parseFloat(item?.govt_fee ?? 0) +
                               parseFloat(item?.bank_charge ?? 0),
                             0
                           )
                           ?.toFixed(2)}
                       </p>
                     </td>
                   </tr>
                   <tr>
                     <td
                       colSpan={5}
                       style={{
                         border: "1px solid #000",
                         padding: "0.01rem",
                         textAlign: "right",
                       }}
                     >
                       <p style={{ fontSize: "12px", fontWeight: 'bold' }}>Net Taxable Amount</p>
                     </td>
                     <td
                       style={{
                         border: "1px solid #000",
                         padding: "0.01rem",
                         textAlign: "center",
                         width: "10%",
                       }}
                     >
                       <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                         {invoiceData?.items
                           ?.reduce(
                             (total, item) =>
                               total + parseFloat(item?.center_fee ?? 0),
                             0
                           )
                           ?.toFixed(2)}
                       </p>
                     </td>
                   </tr>
                   <tr>
                     <td
                       colSpan={5}
                       style={{
                         border: "1px solid #000",
                         padding: "0.01rem",
                         textAlign: "right",
                       }}
                     >
                       <p
                         style={{
                           fontSize: "12px",
                           fontFamily: "'Amiri', Arial, sans-serif",
                           fontWeight: 'bold'
                         }}
                         className="arabic-text"
                       >
                         Total VAT إجمالي القيمة المضافة
                       </p>
                     </td>
                     <td
                       align="center"
                       style={{
                         border: "1px solid #000",
                         padding: "0.01rem",
                         textAlign: "center",
                         width: "10%",
                       }}
                     >
                       <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                         {invoiceData?.items
                           ?.reduce(
                             (total, item) =>
                               total + parseFloat(item?.bank_charge ?? 0),
                             0
                           )
                           ?.toFixed(2)}
                       </p>
                     </td>
                   </tr>
                   <tr>
                     <td
                       colSpan={5}
                       align="right"
                       style={{
                         border: "1px solid #000",
                         padding: "0.01rem",
                         textAlign: "right",
                       }}
                     >
                       <p
                         style={{
                           fontSize: "12px",
                           fontFamily: "'Amiri', Arial, sans-serif",
                           fontWeight: 'bold'
                         }}
                         className="arabic-text"
                       >
                         Gross Total إجمالي القيمة
                       </p>
                     </td>
                     <td
                       align="center"
                       style={{
                         border: "1px solid #000",
                         padding: "0.01rem",
                         textAlign: "center",
                         width: "10%",
                       }}
                     >
                       <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                         {invoiceData?.items
                           ?.reduce(
                             (total2, item) =>
                               parseFloat(total2) + parseFloat(item?.total ?? 0),
                             0
                           )
                           ?.toFixed(2)}
                       </p>
                     </td>
                   </tr>
                   <tr>
                     <td
                       colSpan={5}
                       align="right"
                       style={{
                         border: "1px solid #000",
                         padding: "0.01rem",
                         textAlign: "right",
                       }}
                     >
                       <p
                         style={{
                           fontSize: "12px",
                           fontFamily: "'Amiri', Arial, sans-serif", fontWeight: 'bold'
                         }}
                         className="arabic-text"
                       >
                         Customer Card Payment الإجمالي
                       </p>
                     </td>
                     <td
                       align="right"
                       style={{
                         border: "1px solid #000",
                         padding: "0.01rem",
                         textAlign: "center",
                         width: "10%",
                       }}
                     >
                       <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                         {invoiceData?.items
                           ?.reduce(
                             (total, item) =>
                               total + parseFloat(item?.bank_charge ?? 0),
                             0
                           )
                           ?.toFixed(2)}
                       </p>
                     </td>
                   </tr>
                   <tr>
                     <td
                       colSpan={5}
                       align="right"
                       style={{
                         border: "1px solid #000",
                         padding: "0.01rem",
                         textAlign: "right",
                       }}
                     >
                       <p
                         style={{
                           fontSize: "12px",
                           fontFamily: "'Amiri', Arial, sans-serif", fontWeight: 'bold'
                         }}
                         className="arabic-text"
                       >
                         Total Payable الإجمالي
                       </p>
                     </td>
                     <td
                       align="right"
                       style={{
                         border: "1px solid #000",
                         padding: "0.01rem",
                         textAlign: "center",
                         width: "10%",
                       }}
                     >
                       <p style={{ fontSize: "12px" }}>
                         {invoiceData?.items
                           ?.reduce(
                             (total2, item) =>
                               parseFloat(total2) + parseFloat(item?.total ?? 0),
                             0
                           )
                           ?.toFixed(2)}
                       </p>
                     </td>
                   </tr>
                 </tbody>
               </table>
             </Box>
             <Box class="footer" style={{marginTop:'100px'}}>
               <Box textAlign="center" pb={2} sx={{ my: "60px", mt: "200px" }}>
                 <Box
                   display="flex"
                   justifyContent="space-between"
                   alignItems="flex-start"
                 >
                   <Box textAlign="center">
                     <Typography
                       variant="h6"
                       fontWeight="bold"
                       sx={{ fontSize: "12px" }}
                     >
                       SabelahHaq Naqaz
                     </Typography>
                     <p
                       variant="body2"
                       style={{
                         fontSize: "12px",
                       }}
                     >
                       Authorized Signatory - المخول بالتوقيع
                     </p>
                     <Typography
                       variant="body2"
                       sx={{ fontSize: "12px", textAlign: "center" }}
                     >
                       (REPRINT)
                     </Typography>
                   </Box>
     
                   <Box textAlign="right" sx={{ fontSize: "12px" }}>
                     <p
                       variant="body2"
                       style={{
                         fontSize: "12px",
                       }}
                     >
                       Note - ملاحظات
                     </p>
                     <p
                       variant="body2"
                       style={{
                         fontSize: "12px",
                       }}
                     >
                       الرجاء التأكد من الفاتورة والمستندات قبل مغادرة الكاونتر
                     </p>
                     <Typography variant="body2" dir="ltr" sx={{ fontSize: "12px" }}>
                       Kindly check the invoice and documents before leaving the
                       counter
                     </Typography>
                   </Box>
                 </Box>
     
     
               </Box>
     
               <div className="w-full h-[115px] flex justify-center items-center mb-4 mt-4" >
                 <img
                   src={Images.footer}
                   alt="Header"
                   style={{ width: "100%" }}
                   className="max-w-full h-auto"
                 />
               </div>
               < hr style={{ color: 'black !important' }} />
               <Typography
                 variant="body2"
                 sx={{ fontWeight: "bold", fontSize: "15px",textAlign:'right' }}
               >
                 Powered By : MangoTechDevs.ae
               </Typography>
             </Box>
           </Box>
    </>
  );
}

export default SalesReciept;
