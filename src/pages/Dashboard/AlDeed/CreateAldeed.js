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
import Barcode from "react-barcode";

import SearchIcon from "@mui/icons-material/Search";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// import { TableBody, TableHead } from "mui-datatables";

function CreateAldeed() {
  const invoiceRef = useRef(null);
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
      
        // Restore the content visibility after generating the PDF
        invoiceElement.style.display = 'none';  // Show the content again
      };
      

    console.log(rows, "data")
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
    const govtFee = watch('govt_fee', 0);
    const centerFee = watch('center_fee', 0);
    const bankCharges = watch('bank_charges', 0);
    const qty = watch('qty', 1);
    useEffect(() => {
        const feesTotal = (parseFloat(govtFee) || 0) + (parseFloat(centerFee) || 0) + (parseFloat(bankCharges) || 0);
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

    const [center, setCenter] = useState(null);
    const [status, setStatus] = useState(null);
    const [fieldsDisabled, setFieldsDisabled] = useState(false)

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
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [detail, setDetail] = useState(null)
    const [invoiceData, setInvoiceData] = useState(null)
    //documents array

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const submitForm1 = async (formData) => {

        let invoice = {
            date:moment(date).format("DD-MM-YYYY"),
            invoiceType: detail?.invoice_number,
            
            trn:formData?.trn,
            tokenNumber: detail?.token_number,
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
    setInvoiceData(invoice)
         
        console.log(formData);
        try {
            let obj = {
                id:detail?.id,
                // token_number: formData?.token,
                token_date: date,
                invoice_prefix: "AAD",
                cost_center: formData?.cost_center?.id,
                trn: formData?.trn,
                case_no: formData?.caseno,
                customer_name: formData?.display_customer,
                reception_id: detail?.id,
                customer_mobile: formData?.mobile,
                customer_email: formData?.email,
                ref: formData?.ref,
                total_amount: subTotal,

                items: rows
            };
            console.log(formData, "formData");
            const promise = CustomerServices.CreateAlDed(obj);

            showPromiseToast(
                promise,
                "Saving...",
                "Added Successfully",
                "Something Went Wrong"
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                generatePDF()
                navigate("/aldeed-list");

            }
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Get Account
    const getReceptionDetail = async (state) => {
        setFieldsDisabled(true)
        try {
            let params = {
                token_number: getValues1("token"),
            };
            if (state) {
                params = {
                    invoice_number: getValues1("invoicenumber"),
                };
            }
            const { data } = await CustomerServices.getReceiptDetail(params);
            console.log(data, "dataaa");
            if(  data?.receipt?.is_presale == true){

                setDetail(data?.receipt)
                setValue1("customer", data?.receipt?.customer_name);
                setValue1("invoice_date", moment().toDate());
                setValue1("mobile", data?.receipt?.customer_mobile);
                setValue1("ref", data?.receipt?.ref);
                setValue1("display_customer", data?.receipt?.customer_name);
                setValue1("email", data?.receipt?.customer_email);
                setValue1("address", data?.receipt?.address);
                setValue1("trn", data?.receipt?.trn);
                setValue1("cost_center", data?.receipt?.cost_center);
                setValue1("caseno", data?.receipt?.case_no);
                setSubTotal(data?.receipt?.total_amount)
                setRows(data?.receipt?.sale_receipt_items)
                setAccounts(data?.accounts?.rows);
            }else if(data?.receipt == null){

                ErrorToaster("Invoice Not  Found")
            }
            else{
                ErrorToaster("Invoice Already Created")
            }
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

            setValue("qty", 1);
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
        setSelectedCustomer({ id: "walkin", name: "Walk-in Customer" })
        setValue1("customer", { id: "walkin", name: "Walk-in Customer" })
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
                                    Create Al-ADHEED
                                </Typography>
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <Grid container sx={{ gap: "5px 25px" }}>
                                    <Grid item xs={12}>
                                        <Grid container gap={2} alignItems={'center'}>
                                            <Grid item md={3} sm={12} xs={12}>
                                                <InputField
                                                    label="Token"
                                                    size="small"
                                                    disabled={fieldsDisabled}
                                                    placeholder="Enter Token"
                                                    register={register1("token")}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <IconButton onClick={() => getReceptionDetail()}>
                                                                <SearchIcon sx={{ color: "#001f3f" }} />
                                                            </IconButton>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item md={3} sm={12} xs={12}>
                                                <InputField
                                                    label="Invoice Number"
                                                    size="small"
                                                    disabled={fieldsDisabled}
                                                    placeholder="Invoice Number"
                                                    register={register1("invoicenumber")}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <IconButton onClick={() => getReceptionDetail(true)}>
                                                                <SearchIcon sx={{ color: "#001f3f" }} />
                                                            </IconButton>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item md={1} sm={12} xs={12} mt={2}>
                                                <PrimaryButton
                                                    bgcolor={'#001f3f'}
                                                    title="Clear"
                                                    onClick={() => {
                                                        setFieldsDisabled(false)
                                                        setValue1('token', '')
                                                        setValue1('invoicenumber', '')
                                                        setValue1("customer", '');
                                                        setValue1("invoice_date", '');
                                                        setValue1("mobile", '');
                                                        setValue1("ref", '');
                                                        setValue1("display_customer", '');
                                                        setValue1("email", '');
                                                        setValue1("address", '');
                                                        setValue1("trn", '');
                                                        setValue1("cost_center", '');
                                                    }}
                                                    loading={loading}
                                                />
                                            </Grid>
                                            <Grid item md={3} sm={12} xs={12}>
                                                <DatePicker
                                                    label={"Invoice Date :*"}
                                                    value={date}
                                                    size={'small'}

                                                    error={errors1?.date?.message}
                                                    register={register1("date", {
                                                        required:
                                                            date ? false :
                                                                "please enter  date."

                                                    })}
                                                    maxDate={new Date()}
                                                    onChange={(date) => {

                                                        setValue1('date', date)
                                                        setDate(new Date(date));

                                                    }

                                                    }
                                                /></Grid>
                                        </Grid>
                                    </Grid>

                                    {/* <Grid
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

                                            <Grid item xs={5.7}>
                                                <DatePicker
                                                    label={"Invoice Date :*"}
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

                                            <Grid item xs={5.7} >
                                                <SelectField
                                                    size={'small'}
                                                    label={'Customer *:'}
                                                    disabled={true}
                                                    options={[{ id: "walkin", name: "Walk-in Customer" }]}
                                                    selected={selectedCustomer}
                                                    onSelect={(value) => {
                                                        setSelectedCustomer(value)


                                                    }}
                                                    error={errors1?.customer?.message}
                                                    register={register1("customer", {
                                                        required: false,
                                                    })}
                                                />
                                            </Grid>



                                        </Grid>
                                    </Grid> */}
                                    <Grid
                                        item
                                        md={12}
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
                                            <Grid item md={3.8} sm={5.5} xs={12}>
                                                <InputField
                                                    label="Display Customer"
                                                    size="small"
                                                    placeholder="Walk-in Customer"
                                                    register={register1("display_customer", {
                                                        required: 'please enter display name.'
                                                    })}
                                                    error={errors1?.display_customer?.message}
                                                />
                                            </Grid>

                                            <Grid item md={3.8} sm={5.5} xs={12}>
                                                <InputField
                                                    label="Mobile"
                                                    size="small"
                                                    placeholder="Mobile No"

                                                    register={register1("mobile", {
                                                        required: 'please enter mobile .'
                                                    })}
                                                    error={errors1?.mobile?.message}
                                                />
                                            </Grid>

                                            <Grid item md={3.8} sm={5.5} xs={12}>
                                                <InputField
                                                    label="Email"
                                                    size="small"
                                                    placeholder="Email"

                                                    register={register1("email", {
                                                        required: 'please enter email .'
                                                    })}
                                                    error={errors1?.email?.message}
                                                />
                                            </Grid>

                                            <Grid item md={3.8} sm={5.5} xs={12}>
                                                <InputField
                                                    label="TRN"
                                                    size="small"
                                                    placeholder="TRN"


                                                    register={register1("trn", {
                                                        required: 'please enter trn .'
                                                    })}
                                                    error={errors1?.trn?.message}
                                                />
                                            </Grid>
                                            <Grid item md={3.8} sm={5.5} xs={12}>
                                                <InputField
                                                    label="Case No"
                                                    size="small"
                                                    placeholder="Case No"


                                                    register={register1("caseno", {
                                                        required: 'please enter caseno .'
                                                    })}
                                                    error={errors1?.caseno?.message}
                                                />
                                            </Grid>
                                            <Grid item md={3.8} sm={5.5} xs={12}>
                                                <InputField
                                                    label="Ref"
                                                    size="small"
                                                    placeholder="Reference"
                                                    register={register1("ref")}
                                                />
                                            </Grid>

                                            <Grid item md={3.8} sm={5.5} xs={12}>
                                                <SelectField
                                                    label="Cost Center"
                                                    size="small"
                                                    options={[{ id: 'Al-ADHEED', name: 'Al-ADHEED' }]}
                                                    selected={watch1("cost_center")}
                                                    onSelect={(value) => setValue1("cost_center", value)}

                                                    register={register1("cost_center", {
                                                        required: 'please enter cost center .'
                                                    })}
                                                    error={errors1?.cost_center?.message}
                                                />
                                            </Grid>
                                            <Grid item md={3.8} sm={5.5} xs={12} >
                                                <SelectField
                                                    size={'small'}
                                                    label={'Customer *:'}
                                                    disabled={true}
                                                    options={[{ id: "walkin", name: "Walk-in Customer" }]}
                                                    selected={selectedCustomer}
                                                    onSelect={(value) => {
                                                        setSelectedCustomer(value)


                                                    }}
                                                    error={errors1?.customer?.message}
                                                    register={register1("customer", {
                                                        required: false,
                                                    })}
                                                />
                                            </Grid>
                                            <Grid item md={3.8} sm={5.5} xs={12}>
                                                <InputField
                                                    label="Address"
                                                    size="small"
                                                    placeholder="Address"
                                                    multiline
                                                    rows={2}

                                                    register={register1("address", {
                                                        required: 'please enter address .'
                                                    })}
                                                    error={errors1?.address?.message}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>


                                </Grid>
                            </Box>
                       


                        <form >
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

                                            <TableCell sx={{ width: "150px" }}>Total</TableCell>
                                            <TableCell sx={{ width: "150px" }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {/* <TableRow>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    disabled={true}
                                                    placeholder="Item code"
                                                    register={register("item_code", { required: "Item code is required" })}
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
                                                {errors.service && <span style={{ color: "red" }}>{errors.service.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    placeholder="Quantity"
                                                    type="number"
                                                    register={register("qty", {
                                                        required: "Quantity is required",
                                                        min: {
                                                            value: 1,
                                                            message: "Quantity must be at least 0",
                                                        },
                                                    })}
                                                />
                                                {errors.qty && <span style={{ color: "red" }}>{errors.qty.message}</span>}
                                            </TableCell>

                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    placeholder="Govt fee"
                                                    type="number"
                                                    register={register("govt_fee", {
                                                        required: "Govt fee is required",
                                                        min: {
                                                            value: 1,
                                                            message: "Govt fee must be at least 0",
                                                        },
                                                    })}
                                                />
                                                {errors.govt_fee && <span style={{ color: "red" }}>{errors.govt_fee.message}</span>}
                                            </TableCell>

                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    placeholder="Center Fee"
                                                    type="number"
                                                    register={register("center_fee", {
                                                        required: "Center fee is required",
                                                        min: {
                                                            value: 1,
                                                            message: "Center fee must be at least 0",
                                                        },
                                                    })}
                                                />
                                                {errors.center_fee && <span style={{ color: "red" }}>{errors.center_fee.message}</span>}
                                            </TableCell>

                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    placeholder="Bank Charges"
                                                    type="number"
                                                    register={register("bank_charges", { required: "Bank charges are required" })}
                                                    disabled
                                                />
                                                {errors.bank_charges && <span style={{ color: "red" }}>{errors.bank_charges.message}</span>}

                                            </TableCell>

                                            <TableCell>
                                                <InputField
                                                    disabled={true}
                                                    style={{ border: "none" }}
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
                                                        textTransform: 'capitalize',
                                                        backgroundColor: "#001f3f",
                                                        fontSize: "12px",
                                                        ":hover": {
                                                            backgroundColor: "#001f3f",
                                                        },
                                                    }}
                                                >
                                                    Add Item
                                                </Button>
                                            </TableCell>
                                        </TableRow> */}

                                        {rows.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item?.id}</TableCell>
                                                <TableCell>{item?.service?.name}</TableCell>
                                                <TableCell>{item?.quantity}</TableCell>
                                                <TableCell>{item?.govt_fee}</TableCell>
                                                <TableCell>{item?.center_fee}</TableCell>
                                                <TableCell>{item?.bank_charge}</TableCell>

                                                <TableCell>{item?.total}</TableCell>

                                            </TableRow>
                                        ))}

                                        <TableRow>
                                            <TableCell colSpan={7} align="right">
                                                <Typography variant="h6" sx={{ fontSize: "12px" }}>Sub-total:</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="h6" sx={{ fontSize: "12px" }}>{subTotal}</Typography> {/* Display the Sub-total */}
                                            </TableCell>
                                        </TableRow>

                                        {/* Amount Total Row (optional, if needed for the final sum) */}
                                        <TableRow>
                                            <TableCell colSpan={7} align="right">
                                                <Typography variant="h6" sx={{ fontSize: "12px" }}>Amount Total:</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="h6" sx={{ fontSize: "12px" }}>{subTotal}</Typography> {/* This can be the same as Sub-total */}
                                            </TableCell>
                                        </TableRow>
                                        {/* </Grid> */}
                                        

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </form>

                        <TableContainer component={Paper}>
                            <Table>
                            <TableRow>
                                            <TableCell colSpan={8} align="center"> {/* adjust colSpan to match total columns */}
                                                <Box sx={{display:'flex',gap:2,justifyContent:'center'}}>
                                                <Button
                                                    type="submit"
                                                    
                                                    disabled={rows?.length === 0}
                                                    variant="contained"
                                                    sx={{
                                                        width:'350px',
                                                        textTransform: 'capitalize',
                                                        backgroundColor: "#001f3f",
                                                        ":hover": {
                                                            backgroundColor: "#001f3f",
                                                        },
                                                    }}
                                                >
                                                    Place Invoice
                                                </Button>
                                                <Button
                                                   onClick={()=> navigate('/aldeed-list')}
                                                    
                                                    variant="contained"
                                                    sx={{
                                                        width:'350px',
                                                        textTransform: 'capitalize',
                                                        backgroundColor: "#001f3f",
                                                        ":hover": {
                                                            backgroundColor: "#001f3f",
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
                    </>
                }
            </Box>



            <Box className="showPdf"  ref={invoiceRef} sx={{ padding: "20px 60px" }}>
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
          <Box sx={{ mb: 1 }}>
            <Barcode
              value={detail?.id}
              width={1.4}
              height={40}
              displayValue={false}
            />
            <Typography
              variant="body2"
              align="left"
              sx={{ fontSize: "15px", ml: 3 }}
            >
              {detail?.id}
            </Typography>
          </Box>

          <Grid container spacing={1}>
            <Grid item xs={6}>
              <p
                variant="body2"
                style={{
                   fontWeight: "bold", fontSize: "12px" ,
                   margin: 0
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
                Invoice Type - Invoice No
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ fontSize: "15px" }}>
                {invoiceData?.invoiceType}
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
          <p
            variant="body2"
            style={{
              fontSize: "14px",
              textAlign: "center",
             
              marginBottom: 2,
            }}
          >
            Customer Information معلومات المتعاملين
          </p>

          <Grid container spacing={1}>
            <Grid item xs={6}>
              <p
                variant="body2"
                style={{
                  fontSize: "12px",
                  fontWeight:"bold",
                  margin: 0
                  // textAlign:"center",
                  // marginBottom:2
                }}
              >
                Customer/المتعامل
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
                  fontWeight:"bold",
                  margin: 0
                }}
              >
                Mobile No./رقم الهاتف المتحرك
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
                sx={{ fontWeight: "bold", fontSize: "15px" }}
              >
                Customer Reference
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ fontSize: "15px" }}>
                {invoiceData?.customerReference}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", fontSize: "15px" }}
              >
                Customer Address
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ fontSize: "15px" }}>
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

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "center",
                  width: "5%",
                }}
              >
                <p style={{ fontSize: "12px" }}>Sl.No الرقم</p>
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "center",
                  width: "30%",
                  fontWeight: "bold",
                }}
              >
                <p style={{ fontSize: "12px" }}>Service - الخدمات</p>
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "center",
                  width: "8%",
                  fontWeight: "bold",
                }}
              >
                <p style={{ fontSize: "12px" }}>Qty - الكمية</p>
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "center",
                  width: "18%",
                  fontWeight: "bold",
                }}
              >
                <p style={{ fontSize: "12px" }}>
                  Govt Fee and Bank Charge - الرسوم الحكومية
                </p>
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "center",
                  width: "15%",
                }}
              >
                <p style={{ fontSize: "12px" }}>
                  Service Charge Taxable - تكلفة الخدمة
                </p>
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "center",
                  width: "15%",
                }}
              >
                <p style={{ fontSize: "12px" }}>Tax Amt - قيمة المضافة</p>
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "center",
                  width: "15%",
                }}
              >
                <p style={{ fontSize: "12px" }}>Total - الإجمالي بالدرهم</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {invoiceData?.items.map((item) => (
              <tr key={item.id}>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {item?.id}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                      {item?.service?.name}
                    </span>
                    <span style={{ fontSize: "12px" }}>{item.service?.name_ar}</span>
                  </div>
                  {/* <p style={{ fontSize: "9px", textAlign: "left" }}>
                    {item?.details}
                  </p> */}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    fontSize:'12px'
                  }}
                >
                  {item?.quantity}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    fontSize:'12px'

                  }}
                >
                  {((item?.govt_fee ?? 0) + (item?.bank_charge ?? 0)).toFixed(2)}

                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    fontSize:'12px'

                  }}
                >
                  {item?.center_fee?.toFixed(2)}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    fontSize:'12px'

                  }}
                >
                  {item?.bank_charge?.toFixed(2)}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    fontSize:'12px'

                  }}
                >
                  {item?.total?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #000",
                  padding: "0.5rem",
                  textAlign: "right",
                }}
              >
                <p style={{ fontSize: "12px" }}>Total Govt.fee & Bank Charge</p>
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "0.5rem",
                  textAlign: "center",
                  width: "10%",
                }}
              >
                <p style={{ fontSize: "12px" }}>
                {(invoiceData?.items?.reduce((total, item) => total + (item?.govt_fee ?? 0) + (item?.bank_charge ?? 0), 0) )?.toFixed(2)} 

                </p>
              </td>
            </tr>
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #000",
                  padding: "0.5rem",
                  textAlign: "right",
                }}
              >
                <p style={{ fontSize: "12px" }}>Net Taxable Amount</p>
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "0.5rem",
                  textAlign: "center",
                  width: "10%",
                }}
              >
                <p style={{ fontSize: "12px" }}>
                {(invoiceData?.items?.reduce((total, item) => total + (item?.center_fee ?? 0), 0))?.toFixed(2)}


                </p>
              </td>
            </tr>
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #000",
                  padding: "0.5rem",
                  textAlign: "right",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "'Amiri', Arial, sans-serif",
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
                  padding: "0.5rem",
                  textAlign: "center",
                  width: "10%",
                }}
              >
                <p style={{ fontSize: "12px" }}>
                {(invoiceData?.items?.reduce((total, item) => total + (item?.bank_charge ?? 0), 0))?.toFixed(2)}

                </p>
              </td>
            </tr>
            <tr>
              <td
                colSpan={5}
                align="right"
                style={{
                  border: "1px solid #000",
                  padding: "0.5rem",
                  textAlign: "right",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "'Amiri', Arial, sans-serif",
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
                  padding: "0.5rem",
                  textAlign: "center",
                  width: "10%",
                }}
              >
                <p style={{ fontSize: "12px" }}>
                  {detail?.total_amount?.toFixed(2)}
                </p>
              </td>
            </tr>
            <tr>
              <td
                colSpan={5}
                align="right"
                style={{
                  border: "1px solid #000",
                  padding: "0.5rem",
                  textAlign: "right",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "'Amiri', Arial, sans-serif",
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
                  padding: "0.5rem",
                  textAlign: "center",
                  width: "10%",
                }}
              >
                <p style={{ fontSize: "12px" }}>
                {(invoiceData?.items?.reduce((total, item) => total + (item?.bank_charge ?? 0), 0))?.toFixed(2)}

                

                </p>
              </td>
            </tr>
            <tr>
              <td
                colSpan={5}
                align="right"
                style={{
                  border: "1px solid #000",
                  padding: "0.5rem",
                  textAlign: "right",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "'Amiri', Arial, sans-serif",
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
                  padding: "0.5rem",
                  textAlign: "center",
                  width: "10%",
                }}
              >
                <p style={{ fontSize: "12px" }}>
                {detail?.total_amount?.toFixed(2)}

                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </Box>
      <Box class="footer">
        <Box textAlign="center" pb={2} sx={{ my: "60px", mt: "100px" }}>
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

          <Typography variant="body1" fontWeight="bold" color="error" mt={2}>
            "save 10 aed on all DED transactions every Saturday in Premium
            Businessmen Services"
          </Typography>
        </Box>

        <div className="w-full h-[115px] flex justify-center items-center mb-4">
          <img
            src={Images.footer}
            alt="Header"
            style={{ width: "100%" }}
            className="max-w-full h-auto"
          />
        </div>
      </Box>
    </Box>
        </>
    );
}

export default CreateAldeed;
