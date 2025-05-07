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
import AddIcon from '@mui/icons-material/Add';
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
import SearchIcon from "@mui/icons-material/Search";

// import { TableBody, TableHead } from "mui-datatables";

function UpdatePreSale() {
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
    const [selectedRow, setSelectedRow] = useState(null)
    const [editState, setEditState] = useState(false)
    const [settings, setSettings] = useState({})
    

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
    const bankCharges = watch('bank_charge', 0);
    const qty = watch('quantity', 1);
    useEffect(() => {
        const feesTotal = (parseFloat(govtFee) || 0) + (parseFloat(centerFee) || 0) + (parseFloat(bankCharges) || 0);
        const finalTotal = feesTotal * (parseFloat(qty) || 1);
        setValue("total", parseFloat(finalTotal).toFixed(2));
    }, [govtFee, centerFee, bankCharges, qty]);

    const addItem = (data) => {
        console.log(data, 'datadata');
      
        const newSalesId = serviceItem?.sales_account_id;
        const newRow = { ...data, service: serviceItem, sales_id: newSalesId };
      
        setRows((prevRows) => {
          // If not the first row, enforce that all sales_ids must match
          if (prevRows.length > 0) {
            const existingSalesId = prevRows[0].sales_id;
      
            if (existingSalesId !== newSalesId) {
              showErrorToast("Only items with the same sales account ID can be added.");
              return prevRows; // Don't add if sales_id is different
            }
          }
      
          // Add the item since it's the first one or has the same sales_id
          const updatedRows = [...prevRows, newRow];
      
          const newSubTotal = updatedRows.reduce(
            (sum, row) => sum + parseFloat(row.total || 0),
            0
          );
          setSubTotal(parseFloat(newSubTotal.toFixed(2)));
      
          return updatedRows;
        });
      
        reset();
        setServiceItem("");
      };


      const updateItem = (data) => {
        console.log("Raw data passed to updateItem:", data);
        console.log("Current serviceItem:", serviceItem);
      
        if (!data?.id) {
          console.warn("No valid ID found in data. Skipping update.");
          return;
        }
      
        const updatedSalesId = serviceItem?.sales_account_id;
        const updatedItem = { ...data, service: serviceItem, sales_id: updatedSalesId };
        console.log("Updated item to be saved:", updatedItem);
      
        setRows(prevItems => {
          console.log("Previous rows:", prevItems);
      
          // Get the existing sales_id from the list (any one is enough)
          const existingSalesId = prevItems.length > 0 ? prevItems[0].sales_id : null;
      
          // Check if the updated item has a different sales_id
          if (existingSalesId && existingSalesId !== updatedSalesId) {
            showErrorToast("You can only update with the same sales account ID.");
            return prevItems; // Don't update
          }
      
          const updatedRows = prevItems.map(item => {
            if (item.id === data.id) {
              console.log(`Item with ID ${item.id} matched. Replacing with updated item.`);
              return updatedItem;
            }
            return item;
          });
      
          console.log("Rows after update:", updatedRows);
      
          // Calculate new subtotal
          const newSubTotal = updatedRows.reduce((sum, row) => {
            const total = parseFloat(row.total || 0);
            return sum + (isNaN(total) ? 0 : total);
          }, 0);
      
          setSubTotal(parseFloat(newSubTotal.toFixed(2)));
          return updatedRows;
        });
      
        console.log("Resetting form and states...");
        reset();
        setServiceItem(null);
        setEditState(false);
      };


    const getInvoiceNumber = async () => {
        // setLoader(true)
        try {
            const { data } = await CustomerServices.getInvoiceNumber();

            console.log(data);
            setValue1("invoice_no", `DED/${data?.next_invoice_number}`);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
    };

      const getSystemSettings = async () => {
        // setLoader(true)
        try {
          const { data } = await CustomerServices.getSystemSettings();
    
          console.log(data,"settings");
          setSettings(data?.settings)
          setValue1("cost_center", { id: data?.settings?.cost_center, name: data?.settings?.cost_center })
    
         // setValue1("invoice_no", `DED/${data?.next_invoice_number}`);
        } catch (error) {
          ErrorToaster(error);
        } finally {
          // setLoader(false)
        }
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
    const { id } = useParams()
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
    const [selectedCostCenter, setSelectedCostCenter] = useState(null)
    const [services, setServices] = useState(null);
    const [serviceItem, setServiceItem] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [detail, setDetail] = useState(null)
    //documents array

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const submitForm1 = async (formData) => {
        console.log(formData);
        try {
            let obj = {
                id: detail?.id,
                token_number: formData?.token,
                token_date: moment(date).format('MM-DD-YYYY'),
                invoice_prefix: "DED",
                trn: formData?.trn,
                case_no: formData?.caseno,
                customer_address: formData?.address,
                cost_center: formData?.cost_center,
                customer_name: formData?.display_customer,
                customer_id: detail?.customer_id,
                reception_id: detail?.reception_id,
                customer_mobile: formData?.mobile,
                customer_email: formData?.email,
                ref: formData?.ref,
                total_amount: subTotal,

                items: rows
            };
            console.log(formData, "formData");
            const promise = CustomerServices.UpdateSaleReceipt(obj);

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
    const getReceptionDetail = async () => {
        try {
            let params = {
                token_number: getValues1("token"),
            };
            const { data } = await CustomerServices.getReceptionDetail(params);
            console.log(data, "dataaa");
            setDetail(data?.token)
            setValue1("customer", data?.token?.customer_name);
            setValue1("invoice_date", moment().toDate());
            setValue1("mobile", data?.token?.mobile);
            setValue1("ref", data?.token?.reference);
            setValue1("display_customer", data?.token?.customer_name);
            setValue1("email", data?.token?.customer_email);
            setValue1("address", data?.token?.customer_address);
            setValue1("trn", data?.token?.trn);
            setValue1("cost_center", data?.token?.cost_center);
            setValue1("mobileValue", data?.token?.mobile);

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
            const categoryIds = user?.categories?.map(category => category?.category_id).join(',');
            console.log(categoryIds, "cats");
            let params = {
                page: 1,
                limit: 1000,
                category_id: categoryIds,
            };

            const { data } = await CustomerServices.getServiceItem(params);

            const mappedServices = data?.rows.map(item => ({
                ...item,
                name: `${item.name} - ${item.name_ar}`,
              }));
        
              setServices(mappedServices);
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
                setValue("item_code", data?.service?.item_code);
                setValue("govt_fee", data?.service?.government_fee);
                setValue("center_fee", data?.service?.center_fee);
                setValue("bank_charge", data?.service?.bank_service_charge);

                let serviceItem = {...data?.service}
                serviceItem.name = data?.service?.name + "-" + data?.service?.name_ar;
                // setValue("transaction_id", data?.transaction_id);
                setServiceItem({
                    ...data?.service,
                    name: `${data?.service?.name} - ${data?.service?.name_ar}`,
                  });
                //setServiceItem(serviceItem);
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
        getSystemSettings();
        getCategories();
        getServiceItem();
        setSelectedCustomer({ id: "walkin", name: "Walk-in Customer" })
        //setValue1("customer", { id: "walkin", name: "Walk-in Customer" })
        setValue1("cost_center", { id: settings?.cost_center, name: settings?.cost_center })
    }, []);
    const getData = async () => {
        try {
            let params = {
                id: id
            };

            const { data } = await CustomerServices.getPreSaleDetail(params);
            setDetail(data?.receipt)
            console.log(data?.receipt?.sale_receipt_items);
            setValue1('token', data?.receipt?.token_number)
            setValue1("mobileValue", data?.receipt?.customer_mobile);
            setRows(data?.receipt?.sale_receipt_items)
            setSubTotal(data?.receipt?.total_amount)
            setDate(new Date(data?.receipt?.created_at))
            setValue1('display_customer', data?.receipt?.customer_name)
            setSelectedCostCenter({ id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
            setValue1('cost_center', { id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
            setValue1('mobile', data?.receipt?.customer_mobile)
            setValue1('trn', data?.receipt?.trn)
            setValue1('email', data?.receipt?.customer_email)
            setValue1('caseno', data?.receipt?.case_no)
            setValue1('ref', data?.receipt?.ref)
            setValue1('address', data?.receipt?.customer_address)
           // setValue1("customer", { id: "walkin", name: "Walk-in Customer" })
            setSelectedCustomer({ id: data?.receipt?.customer_id, name: data?.receipt?.customer?.name });
            setValue1("customer", { id: data?.receipt?.customer_id, name: data?.receipt?.customer?.name });


        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };
    useEffect(() => {
        getData()
        getInvoiceNumber()
    }, [])

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
                                    Update Sales Receipt
                                </Typography>
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <Grid container sx={{ gap: "5px 25px" }}>
                                    <Grid item xs={12}  >
                                        <Grid container gap={2}>
                                            <Grid item md={3} sm={12} xs={12}>
                                                <InputField
                                                    label="Token"
                                                    size="small"
                                                    disabled={true}
                                                    placeholder="Enter Token"
                                                    register={register1("token")}

                                                />
                                            </Grid>
                                            <Grid item md={3} sm={12} xs={12}>
                                                <InputField
                                                    label={"Mobile *:"}
                                                    size={'small'}
                                                    type={'number'}
                                                    disabled={fieldsDisabled}
                                                    placeholder={"Mobile"}
                                                    register={register1("mobileValue")}
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
                                            {/* <Grid item md={5.7} sm={12} xs={12}>
                                                <InputField
                                                    disabled={true}
                                                    label="Invoice No"
                                                    size="small"
                                                    placeholder="TSL/83540"
                                                    register={register1("invoice_no")}
                                                />
                                            </Grid> */}
                                            <Grid item xs={5.7}>
                                                <DatePicker
                                                    label={"Request Date :*"}
                                                    value={date}
                                                    size={'small'}
                                                    disabled={true}
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
                                                        required: 'please enter display name.'
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
                                                        required: 'please enter mobile .',
                                                        pattern: {
                                                            value: /^05[0-9]{8}$/,
                                                            message: "Please enter a valid UAE phone number (starting with 05 and 8 digits)."
                                                          },
                                                    })}
                                                    error={errors1?.mobile?.message}
                                                />
                                            </Grid>

                                            <Grid item md={5.7} sm={12} xs={12}>
                                                <InputField
                                                    label="Email"
                                                    size="small"
                                                    placeholder="Email"

                                                    register={register1("email", {
                                                        required: false
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

                                            <Grid item md={5.7} sm={12} xs={12}>
                                                <SelectField
                                                    label="Cost Center"
                                                    size="small"

                                                    options={[{ id: settings?.cost_center, name: settings?.cost_center }]}
                                                    selected={selectedCostCenter}
                                                    onSelect={(value) => setSelectedCostCenter(value)}
                                                    register={register1("cost_center",
                                                        {
                                                            required: false
                                                        }
                                                    )}

                                                />
                                            </Grid>
                                            <Grid item md={5.7} sm={12} xs={12}>
                                                <InputField
                                                    label="TRN"
                                                    size="small"
                                                    placeholder="TRN"

                                                    register={register1("trn", {
                                                        required: false
                                                    })}

                                                />
                                            </Grid>
                                            {/* <Grid item md={5.7} sm={12} xs={12}>
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
                                                    label="Address"
                                                    size="small"
                                                    placeholder="Address"
                                                    multiline
                                                    rows={2}

                                                    register={register1("address", {
                                                        required: false
                                                    })}
                                                    error={errors1?.address?.message}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* </Grid> */}
                                    <Grid item xs={12} display={'flex'} justifyContent={'flex-end'}>
                                        <Button
                                            type="submit"
                                            disabled={rows?.length == 0}
                                            variant="contained"
                                            sx={{
                                                textTransform: 'capitalize',
                                                backgroundColor: "#bd9b4a",
                                                ":hover": {
                                                    backgroundColor: "rgb(189 155 74)",
                                                },
                                            }}
                                        >
                                            Update
                                        </Button>
                                    </Grid>
                                </Grid>
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
                                            <TableCell sx={{ display: "none" }}>
                                                <InputField
                                                    size="small"
                                                    disabled={true}
                                                    placeholder="Item Id"
                                                    register={register("id", { required: "Item id is required" })}
                                                />
                                                {errors.id && <span>{errors.id.message}</span>}
                                            </TableCell>
                                            <TableCell >
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
                                                    disabled={detail?.is_paid || editState}
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
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-",",","."].includes(e.key)) {
                                                          e.preventDefault();
                                                        }
                                                      }}
                                                    register={register("quantity", { required: "Quantity is required" })}
                                                />
                                                {errors.quantity && <span style={{ color: "red" }}>{errors.quantity.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    disabled={detail?.is_paid || !serviceItem?.govt_fee_enable}
                                                    placeholder="Govt fee"
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-",","].includes(e.key)) {
                                                          e.preventDefault();
                                                        }
                                                      }}

                                                    register={register("govt_fee", { required: "Govt fee is required" })}
                                                />
                                                {errors.govt_fee && <span style={{ color: "red" }}>{errors.govt_fee.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    disabled={detail?.is_paid || !serviceItem?.center_fee_enable}
                                                    placeholder="Center Fee"
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-",","].includes(e.key)) {
                                                          e.preventDefault();
                                                        }
                                                      }}

                                                    register={register("center_fee", { required: "Center fee is required" })}
                                                />
                                                {errors.center_fee && <span style={{ color: "red" }}>{errors.center_fee.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    disabled={detail?.is_paid || !serviceItem?.bank_charges_enable}
                                                    placeholder="Bank Charges"
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-",","].includes(e.key)) {
                                                          e.preventDefault();
                                                        }
                                                      }}

                                                    register={register("bank_charge", { required: "Bank charges are required" })}

                                                />
                                                {errors.bank_charge && <span style={{ color: "red" }}>{errors.bank_charge.message}</span>}

                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    placeholder="Transaction Id"
                                                    disabled={!!getValues("transaction_id")}
                                                    register={register("transaction_id", { 
                                                        required: settings?.required_trans_id ? 'Transaction id is required' : false,
                                                      })}
                                                />
                                                {errors.transaction_id && <span style={{ color: "red" }}>{errors.transaction_id.message}</span>}

                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    placeholder="Application Id"

                                                    register={register("application_id", {
                                                        required: settings?.required_app_id ? 'Application id is required' : false,
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

                                                    register={register("ref_no", {
                                                        required: settings?.required_ref_no ? 'Reference no is required' : false,
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
                                                            setValue("item_code", '');
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
                                                <TableCell  sx={{ display: "none" }}>{item?.id}</TableCell>
                                                <TableCell>{item?.service?.item_code}</TableCell>
                                                <TableCell>{item?.service?.name + "-" + item?.service?.name_ar}</TableCell>
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
                                                        setValue("id", item?.id);
                                                        setValue("item_code", item?.service?.item_code);
                                                        setValue("govt_fee", item?.govt_fee);
                                                        setValue("center_fee", item?.center_fee);
                                                        setValue("bank_charge", item?.bank_charge);
                                                        setValue("transaction_id", item?.transaction_id);
                                                        setValue("application_id", item?.application_id);
                                                        setValue("ref_no", item?.ref_no);
                                                        setValue("service", item?.service);
                                                        setServiceItem(item?.service);
                                                        setValue("quantity", item?.quantity);
                                                        console.log(item?.service, "tteeet")

                                                    }} src={Images.editIcon} width={'35px'}></Box>}
                                                    <Box>
                                                        {!detail?.is_paid && <Box sx={{ cursor: 'pointer' }} component={'img'} src={Images.deleteIcon} onClick={() => {

                                                            let selectedID = item?.id
                                                            setRows(rows?.filter(item2 => item2?.id != item?.id))
                                                            let filteredData = rows?.filter(item2 => item2?.id != item?.id)
                                                            // 👇 Calculate total after updating rows
                                                            const total = filteredData.reduce((sum, item) => {
                                                                // Replace `item.amount` with the correct field to total (e.g., item.price or item.total)
                                                                return sum + (parseFloat(item.total) || 0);
                                                            }, 0);

                                                            console.log("New total after update:", total);

                                                            // You can update a state for total if you have one:
                                                            setSubTotal(total); // <-- Make sure to declare this with useState

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
                                        <TableRow>
                                            <TableCell colSpan={9} align="right">
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>Net Taxable Amount:</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>{rows
                                                    ?.reduce((total, item) => {
                                                        const fee = parseFloat(item?.center_fee ?? 0);
                                                        const qty = parseInt(item?.quantity ?? 1);
                                                        return total + fee * qty;
                                                    }, 0)
                                                    .toFixed(2)}</Typography> {/* Display the Sub-total */}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={9} align="right">
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>Total Vat:</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>{(
                                                    rows?.reduce((total, item) => {
                                                        const fee = parseFloat(item?.center_fee ?? 0);
                                                        const qty = parseFloat(item?.quantity ?? 1);
                                                        return total + fee * qty;
                                                    }, 0) * 0.05
                                                ).toFixed(2)}
                                                </Typography> {/* Display the Sub-total */}
                                            </TableCell>
                                        </TableRow>
                                        {/* Amount Total Row (optional, if needed for the final sum) */}
                                        <TableRow>
                                            <TableCell colSpan={9} align="right">
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>Amount Total:</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>{(
                                                    parseFloat(subTotal) +
                                                    rows?.reduce((total, item) => {
                                                        const fee = parseFloat(item?.center_fee ?? 0);
                                                        const qty = parseFloat(item?.quantity ?? 1);
                                                        return total + fee * qty;
                                                    }, 0) * 0.05
                                                ).toFixed(2)}
                                                </Typography> {/* This can be the same as Sub-total */}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </form>
                    </>
                }
            </Box >
        </>
    );
}

export default UpdatePreSale;
