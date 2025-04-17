"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  Box,
  Grid,
  IconButton,
  Table,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  TableBody,
  TableHead,
  TextField,
  Paper,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import Button from "@mui/material/Button"
import { PrimaryButton } from "components/Buttons"
import { useForm } from "react-hook-form"
import InputField from "components/Input"
import DatePicker from "components/DatePicker"
import { ErrorToaster } from "components/Toaster"
import SelectField from "components/Select"
import CustomerServices from "services/Customer"
import { showErrorToast, showPromiseToast } from "components/NewToaster"
import moment from "moment"
import { useNavigate } from "react-router-dom"
import { useAuth } from "context/UseContext"
import FinanceServices from "services/Finance"
import SearchIcon from "@mui/icons-material/Search"
// import { TableBody, TableHead } from "mui-datatables";

function CreatePaidReceipt() {
  const theme = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formChange, setFormChange] = useState(false)
  const [submit, setSubmit] = useState(false)
  const [excludeFromSales, setExcludeFromSales] = useState("no")
  const [excludeFromPurchase, setExcludeFromPurchase] = useState("no")
  const [total, setTotal] = useState(0)
  const [subTotal, setSubTotal] = useState(0)
  const [payButton, setPayButton] = useState(false)
  const [rows, setRows] = useState([])
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [amountError, setAmountError] = useState("")
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
  ])

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
  } = useForm()
  const {
    register: register1,
    handleSubmit: handleSubmit1,
    setValue: setValue1,
    getValues: getValues1,
    control,
    watch: watch1,
    formState: { errors: errors1 },
  } = useForm({
    defaultValues: {
      amount: "",
      payment: null,
      bank: null,
      card: null,
    },
  })

  // Watch all form data

  // Watch for changes in the fee-related fields
  const govtFee = watch("govt_fee", 0)
  const centerFee = watch("center_fee", 0)
  const bankCharges = watch("bank_charges", 0)
  const qty = watch("qty", 1)
  const paymentAmount = watch1("amount", 0)
  const paymentMethod = watch1("payment")

  useEffect(() => {
    const feesTotal =
      (Number.parseFloat(govtFee) || 0) + (Number.parseFloat(centerFee) || 0) + (Number.parseFloat(bankCharges) || 0)
    const finalTotal = feesTotal * (Number.parseFloat(qty) || 1)
    setValue("total", finalTotal)
  }, [govtFee, centerFee, bankCharges, qty])

  // Validate amount against total
  useEffect(() => {
    if (paymentAmount && watch1("total")) {
      const amount = Number.parseFloat(paymentAmount)
      const total = Number.parseFloat(watch1("total"))

      if (amount > total) {
        setAmountError("Amount cannot exceed total")
      } else if (amount <= 0) {
        setAmountError("Amount must be greater than 0")
      } else {
        setAmountError("")
        // Calculate balance
        setValue1("balance", (total - amount).toFixed(2))
      }
    }
  }, [paymentAmount, watch1("total")])

  const addItem = (data) => {
    const total = data.total
    setRows((prevRows) => {
      const updatedRows = [...prevRows, data]
      const newSubTotal = updatedRows.reduce((sum, row) => sum + row.total, 0)
      setSubTotal(newSubTotal)
      return updatedRows
    })
    reset()
    setServiceItem("")
  }

  const allowFilesType2 = ["image/png", "image/jpg", "image/jpeg"]
  const [guarantors, setGuarantors] = useState([])
  const [activeStep, setActiveStep] = React.useState(1)

  // *For Deposit Slip
  const [progress, setProgress] = useState(0)
  const [uploadedSize, setUploadedSize] = useState(0)
  const [slipDetail, setSlipDetail] = useState([])

  const [selectedDue, setSelectedDue] = useState({
    id: "Instant",
    name: "Instant",
  })
  const [passport, setPassport] = useState()
  const [allocation, setAllocation] = useState(false)
  const [depositError, setDepositError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailVerify, setEmailVerify] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedBank, setSelectedBank] = useState(null)
  const [loader, setLoader] = useState(false)
  console.log(selectedBank, "objobj")

  const [center, setCenter] = useState(null)
  const [status, setStatus] = useState(null)
  const [fieldsDisabled, setFieldsDisabled] = useState(false)

  // *For Stepper Forms Data
  const [stepFormData, setStepFormData] = useState()
  const [step1FormData, setStep1FormData] = useState()
  const [selectedType, setSelectedType] = useState(null)
  const [date, setDate] = useState(null)
  const [balanceType, setBalanceType] = useState(null)
  const [imageURL, setImageURL] = useState(null)
  const fileInputRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [salesAccount, setSalesAccount] = useState(null)
  const [inventoryAccount, setInventoryAccount] = useState(null)
  const [cogsAccount, setCogsAccount] = useState(null)
  const [adjustmentAccount, setAdjustmentAccount] = useState(null)
  const [assemblyAccount, setAssemblyAccount] = useState(null)
  const [itemType, setItemType] = useState(null)
  const [unit, setUnit] = useState(null)
  const [taxes, setTaxes] = useState([])
  const [tax, setTax] = useState(null)
  const [category, setCategory] = useState(null)
  const [categories, setCategories] = useState(null)
  const [governmentAccount, setGovernmnentAccount] = useState(null)
  const [description, setDescription] = useState(null)
  const [ownGovBank, setOwnGovBank] = useState(null)
  const [services, setServices] = useState(null)
  const [serviceItem, setServiceItem] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [detail, setDetail] = useState(null)
  const [banks, setBanks] = useState([])
  const [holdState, setHoldState] = useState(true)
  const [selectedMode, setSelectedMode] = useState(null)
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedCostCenter, setSelectedCostCenter] = useState(null)
  //documents array

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }
  console.log("objobj", watch1("bank"))

  const submitForm1 = async (formData) => {
    console.log(formData, "objobjj")
    setButtonDisabled(true)
    try {
      const obj = {
        id: getValues1("invoicenumber"),
        total_amount: formData?.total,
        items: rows,
        // paid_amount: formData?.paid,
        paid_amount: formData?.amount || formData?.total,
        payment_status: formData?.amount < formData?.total ? "Partially Paid" : "Paid",
        payment_mode: selectedMode?.id, // Cash, Bank, Card
        account_id:
          selectedMode?.id == "Cash"
            ? 700117
            : selectedMode?.id == "Bank"
              ? selectedBank?.account_id
              : selectedMode?.id == "Card"
                ? selectedCard?.account_id
                : selectedMode?.id == "Payment Link"
                  ? 700171
                  : null,
        ref_id: selectedMode?.id == "Bank" ? selectedBank?.id : null,
        remarks: formData?.remarks,
        narration: formData?.narration,

        charges: detail?.sale_receipt_items?.reduce((acc, item) => acc + Number(item?.center_fee || 0), 0),
        govt_charges: detail?.sale_receipt_items?.reduce((acc, item) => acc + Number(item?.govt_fee || 0), 0),
        bank_charges: detail?.sale_receipt_items?.reduce((acc, item) => acc + Number(item?.bank_charge || 0), 0),

        bank_name: selectedMode?.id == "Bank" ? selectedBank?.name : "",
        bank_id: selectedMode?.id == "Bank" ? selectedBank?.id : "",
        customer_id: detail?.customer_id,
        invoice_prefix: detail?.invoice_prefix,
        category_id: detail?.sale_receipt_items[0]?.service?.category_id,
      }

      console.log(obj, "objobj")
      if (detail?.is_paid == true) {
        ErrorToaster("Already paid")
      } else {
        const promise = CustomerServices.PayReceipt(obj)
        const response = await promise
        showPromiseToast(promise, "Saving...", "Added Successfully", "Something Went Wrong")
        if (response?.responseCode === 200) {
          navigate('/paid-receipts')
        }
      }
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setButtonDisabled(false)
    }
  }
  // *For Get Customer Queue
  const getBanks = async (page, limit, filter) => {
    setLoader(true)

    try {
      const params = {
        page: 1,
        limit: 1000,
      }

      const { data } = await CustomerServices.getBanks(params)
      setBanks(data?.banks)
    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoader(false)
    }
  }
  // *For Get Customer Queue
  const getCards = async (page, limit, filter) => {
    setLoader(true)

    try {
      const params = {
        page: 1,
        limit: 1000,
      }

      const { data } = await CustomerServices.getCards(params)
      setCards(
        data?.cards?.map((card) => ({
          ...card,
          name: card.account_name,
        })),
      )
    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoader(false)
    }
  }
  // *For Get Account
  const getReceptionDetail = async (state) => {
    setFieldsDisabled(true)
    try {
      let params = {
        token_number: getValues1("token"),
      }
      if (state) {
        params = {
          invoice_number: getValues1("invoicenumber"),
        }
      }
      const { data } = await CustomerServices.getReceiptDetail(params)
      console.log(data?.receipt, "dataaa")
      if (data?.receipt) {
        setRows(data?.receipt?.sale_receipt_items)
        setDetail(data?.receipt)

        setValue1("paid", 0)
        setValue1("customer", data?.receipt?.customer_name)
        setValue1("invoice_date", moment().toDate())
        setDate(new Date(data?.receipt?.invoice_date))
        setValue1("mobile", data?.receipt?.customer_mobile)
        setValue1("ref", data?.receipt?.ref)
        setValue1("display_customer", data?.receipt?.customer_name)
        setValue1("email", data?.receipt?.customer_email)
        setValue1("address", data?.receipt?.customer_address)
        setValue1("trn", data?.receipt?.trn)
        setSelectedCostCenter({ id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
        setValue1("cost_center", { id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
        setValue1("caseno", data?.receipt?.case_no)
        setSubTotal(data?.receipt?.total_amount)

        setValue1(
          "total",
          (
            Number.parseFloat(data?.receipt?.total_amount) +
            data?.receipt?.sale_receipt_items?.reduce((total, item) => {
              const fee = Number.parseFloat(item?.center_fee ?? 0)
              const qty = Number.parseFloat(item?.quantity ?? 1)
              console.log(fee);
              console.log(qty);
              console.log(total);
              return total + fee * qty
            }, 0) *
            0.05
          ).toFixed(2),
        )
        setValue1(
          "balance",
          (
            Number.parseFloat(data?.receipt?.total_amount) +
            data?.receipt?.sale_receipt_items?.reduce((total, item) => {
              const fee = Number.parseFloat(item?.center_fee ?? 0)
              const qty = Number.parseFloat(item?.quantity ?? 1)
              console.log(fee);
              console.log(qty);
              console.log(total);
              return total + fee * qty
              
            }, 0) *
            0.05
          ).toFixed(2),
        )
        setSelectedCostCenter({ id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
        setValue1("cost_center", { id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
        setAccounts(data?.accounts?.rows)
      }
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }

  const getServiceItem = async () => {
    // setLoader(true)
    try {
      const params = {
        page: 1,
        limit: 1000,
      }

      const { data } = await CustomerServices.getServiceItem(params)

      setServices(data?.rows)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }
  const handleServiceSelect = async (value) => {
    console.log(value, "idididid")
    setServiceItem(value)
    // setLoader(true)
    try {
      const params = {
        service_id: value?.id,
      }

      const { data } = await CustomerServices.DetailServiceItem(params)
      setValue("item_code", data?.service?.id)
      setValue("govt_fee", data?.service?.bank_service_charge)
      setValue("center_fee", data?.service?.center_fee)
      setValue("bank_charges", data?.service?.bank_service_charge)

      setValue("qty", 1)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }

  const getAccounts = async (page, limit, filter) => {
    // setLoader(true)
    try {
      const params = {
        page: 1,
        limit: 1000,
      }

      const { data } = await FinanceServices.getAccounts(params)
      console.log(data?.accounts?.rows)

      setAccounts(data?.accounts?.rows)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows]
    updatedRows[index] = {
      ...updatedRows[index],
      [field]: value,
    }
    setRows(updatedRows)
  }
  console.log(rows)

  const getTax = async () => {
    // setLoader(true)
    try {
      const params = {
        page: 1,
        limit: 1000,
      }

      const { data } = await FinanceServices.getTax(params)
      console.log(data?.accounts?.rows)

      setTaxes(data?.tax)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }
  const getCategories = async () => {
    // setLoader(true)
    try {
      const params = {
        page: 1,
        limit: 1000,
      }

      const { data } = await CustomerServices.getCategoryList(params)

      setCategories(data?.categories)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }

  // *For Get Account
  const getReceiptDetail = async (state) => {
    setFieldsDisabled(true)
    try {
      const params = {
        token_number: getValues1("token"),
        invoice_date: date,
      }

      const { data } = await CustomerServices.getReceiptDetail(params)
      console.log(data)
      if (data?.receipt) {
        setHoldState(true)

        setRows(data?.receipt?.sale_receipt_items)
        setDetail(data?.receipt)

        setValue1("paid", 0)
        setValue1("customer", data?.receipt?.customer_name)
        setValue1("invoice_date", moment().toDate())
        setValue1("invoicenumber", data?.receipt?.id)
        setDate(new Date(data?.receipt?.invoice_date))
        setValue1("mobile", data?.receipt?.customer_mobile)
        setValue1("ref", data?.receipt?.ref)
        setValue1("display_customer", data?.receipt?.customer_name)
        setValue1("email", data?.receipt?.customer_email)
        setValue1("address", data?.receipt?.address)
        setValue1("trn", data?.receipt?.trn)
        setSelectedCostCenter({ id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
        setValue1("cost_center", { id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
        setValue1("caseno", data?.receipt?.case_no)
        setSubTotal(data?.receipt?.total_amount)
        setValue1(
          "total",
          (
            Number.parseFloat(data?.receipt?.total_amount) +
            data?.receipt?.sale_receipt_items?.reduce((total, item) => {
              const fee = Number.parseFloat(item?.center_fee ?? 0)
              const qty = Number.parseFloat(item?.quantity ?? 1)
              console.log(fee);
              console.log(qty);
              console.log(total);
              return total + fee * qty
              
            }, 0) *
            0.05
          ).toFixed(2),
        )
        setValue1(
          "balance",
          (
            Number.parseFloat(data?.receipt?.total_amount) +
            data?.receipt?.sale_receipt_items?.reduce((total, item) => {
              const fee = Number.parseFloat(item?.center_fee ?? 0)
              const qty = Number.parseFloat(item?.quantity ?? 1)
              console.log(fee);
              console.log(qty);
              console.log(total);
              return total + fee * qty
              
            }, 0) *
            0.05
          ).toFixed(2),
        )
        setSelectedCostCenter({ id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
        setValue1("cost_center", { id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
        setAccounts(data?.accounts?.rows)
      } else {
        showErrorToast("Data Not Found")
      }
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }
  useEffect(() => {
    getBanks()
    getCards()
    getAccounts()
    getTax()
    getCategories()
    getServiceItem()
    setDate(new Date())
    setSelectedCustomer({ id: "walkin", name: "Walk-in Customer" })
    setValue1("customer", { id: "walkin", name: "Walk-in Customer" })
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
                <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>Pay Receipt</Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                <Grid container sx={{ gap: "5px 25px" }}>
                  <Grid item xs={12}>
                    <Grid container gap={2} alignItems={"center"}>
                      <Grid item xs={3}>
                        <DatePicker
                          label={"Invoice Date :*"}
                          value={date}
                          size={"small"}
                          disabled={fieldsDisabled}
                          error={errors1?.date?.message}
                          register={register1("date")}
                          onChange={(date) => {
                            setValue1("date", date)
                            setDate(new Date(date))
                          }}
                        />
                      </Grid>
                      <Grid item md={3} sm={12} xs={12} mt={1}>
                        <InputField
                          label="Invoice Number"
                          size="small"
                          disabled={fieldsDisabled}
                          placeholder="Invoice Number"
                          register={register1("invoicenumber")}
                          InputProps={{
                            endAdornment: (
                              <IconButton onClick={() => getReceptionDetail(true)}>
                                <SearchIcon sx={{ color: "#bd9b4a" }} />
                              </IconButton>
                            ),
                          }}
                        />
                      </Grid>
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
                                  getReceiptDetail()
                                }}
                              >
                                <SearchIcon sx={{ color: "#bd9b4a" }} />
                              </IconButton>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item md={2} sm={12} xs={12} mt={2.5}>
                        <PrimaryButton
                          bgcolor={"#bd9b4a"}
                          title="Clear"
                          onClick={() => {
                            setFieldsDisabled(false)
                            setValue1("token", "")
                            setValue1("invoicenumber", "")
                            setValue1("customer", "")
                            setValue1("invoice_date", "")
                            setValue1("mobile", "")
                            setValue1("ref", "")
                            setValue1("display_customer", "")
                            setValue1("email", "")
                            setValue1("address", "")
                            setValue1("trn", "")
                            setValue1("cost_center", "")
                            setRows([])
                            setPayButton(false)
                            setSubTotal(0)
                          }}
                          loading={loading}
                        />
                      </Grid>
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
                                                    register={register1("customer")}
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
                        <SelectField
                          size={"small"}
                          label={"Customer *:"}
                          disabled={true}
                          options={[{ id: "walkin", name: "Walk-in Customer" }]}
                          selected={selectedCustomer}
                          onSelect={(value) => {
                            setSelectedCustomer(value)
                          }}
                          error={errors1?.customer?.message}
                          register={register1("customer")}
                        />
                      </Grid>
                      <Grid item md={3.8} sm={5.5} xs={12}>
                        <InputField
                          label="Display Customer"
                          size="small"
                          disabled={true}
                          placeholder="Walk-in Customer"
                          register={register1("display_customer")}
                          error={errors1?.display_customer?.message}
                        />
                      </Grid>

                      <Grid item md={3.8} sm={5.5} xs={12}>
                        <InputField
                          label="Mobile"
                          size="small"
                          placeholder="Mobile No"
                          disabled={true}
                          register={register1("mobile")}
                          error={errors1?.display_customer?.message}
                        />
                      </Grid>

                      <Grid item md={3.8} sm={5.5} xs={12}>
                        <InputField
                          label="Email"
                          size="small"
                          placeholder="Email"
                          disabled={true}
                          register={register1("email")}
                          error={errors1?.email?.message}
                        />
                      </Grid>

                      <Grid item md={3.8} sm={5.5} xs={12}>
                        <InputField
                          label="TRN"
                          size="small"
                          placeholder="TRN"
                          disabled={true}
                          register={register1("trn", {
                            required: false,
                          })}
                        />
                      </Grid>
                      {/* <Grid item md={3.8} sm={5.5} xs={12}>
                        <InputField
                          label="Case No"
                          size="small"
                          placeholder="Case No"
                          disabled={true}
                          register={register1("caseno", {
                            required: false
                          })}

                        />
                      </Grid> */}
                      <Grid item md={3.8} sm={5.5} xs={12}>
                        <InputField
                          label="Ref"
                          disabled={true}
                          size="small"
                          placeholder="Reference"
                          register={register1("ref")}
                        />
                      </Grid>

                      <Grid item md={3.8} sm={5.5} xs={12}>
                        <SelectField
                          label="Cost Center"
                          size="small"
                          disabled={true}
                          options={[{ id: "Al-ADHEED", name: "Al-ADHEED" }]}
                          selected={selectedCostCenter}
                          onSelect={(value) => setSelectedCostCenter(value)}
                          register={register1("cost_center", {
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
                          disabled={true}
                          rows={2}
                          register={register1("address")}
                          error={errors1?.address?.message}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>

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
                      <TableCell sx={{ width: "150px" }}>Trans Id</TableCell>
                      <TableCell sx={{ width: "150px" }}>App Id</TableCell>
                      <TableCell sx={{ width: "150px" }}>Ref Id</TableCell>

                      <TableCell sx={{ width: "150px" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item?.id}</TableCell>
                        <TableCell>{item?.service?.name}</TableCell>
                        <TableCell>{item?.quantity}</TableCell>
                        <TableCell>{item?.govt_fee}</TableCell>
                        <TableCell>{item?.center_fee}</TableCell>
                        <TableCell>{item?.bank_charge}</TableCell>
                        <TableCell>{item?.total}</TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Transaction Id"
                            type="number"
                            value={item.transaction_id || ""}
                            onChange={(e) => handleInputChange(index, "transaction_id", e.target.value)}
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Application Id"
                            type="number"
                            disabled={true}
                            value={item.application_id || ""}
                            onChange={(e) => handleInputChange(index, "application_id", e.target.value)}
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Ref No"
                            type="number"
                            disabled={true}
                            value={item.ref_no || ""}
                            onChange={(e) => handleInputChange(index, "ref_no", e.target.value)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableRow>
                      <TableCell colSpan={9} align="right">
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
                      <TableCell colSpan={9} align="right">
                        <Typography variant="h6" sx={{ fontSize: "15px" }}>
                          Net Taxable Amount:
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontSize: "15px" }}>
                          {rows
                            ?.reduce((total, item) => {
                              const fee = Number.parseFloat(item?.center_fee ?? 0)
                              const qty = Number.parseInt(item?.quantity ?? 1)
                              return total + fee * qty
                            }, 0)
                            .toFixed(2)}
                        </Typography>{" "}
                        {/* Display the Sub-total */}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={9} align="right">
                        <Typography variant="h6" sx={{ fontSize: "15px" }}>
                          Total Vat:
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontSize: "15px" }}>
                          {(
                            rows?.reduce((total, item) => {
                              const fee = Number.parseFloat(item?.center_fee ?? 0)
                              const qty = Number.parseFloat(item?.quantity ?? 1)
                              return total + fee * qty
                            }, 0) * 0.05
                          ).toFixed(2)}
                        </Typography>{" "}
                        {/* Display the Sub-total */}
                      </TableCell>
                    </TableRow>
                    {/* Amount Total Row (optional, if needed for the final sum) */}
                    <TableRow>
                      <TableCell colSpan={9} align="right">
                        <Typography variant="h6" sx={{ fontSize: "15px" }}>
                          Amount Total:
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontSize: "15px" }}>
                          {(
                            Number.parseFloat(subTotal) +
                            rows?.reduce((total, item) => {
                              const fee = Number.parseFloat(item?.center_fee ?? 0)
                              const qty = Number.parseFloat(item?.quantity ?? 1)
                              return total + fee * qty
                            }, 0) *
                            0.05
                          ).toFixed(2)}
                        </Typography>{" "}
                        {/* This can be the same as Sub-total */}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={10} align="right">
                        <Grid container gap={2} justifyContent={"center"}>
                          <Button
                            onClick={() => setPayButton(true)}
                            disabled={rows?.length == 0}
                            variant="contained"
                            sx={{
                              textTransform: "capitalize",
                              backgroundColor: "#bd9b4a",
                              width: "200px",
                              ":hover": {
                                backgroundColor: "rgb(189 155 74)",
                              },
                            }}
                          >
                            Pay
                          </Button>
                          <Button
                            onClick={() => setPayButton(false)}
                            variant="contained"
                            sx={{
                              textTransform: "capitalize",
                              backgroundColor: "#bd9b4a",
                              width: "200px",
                              ":hover": {
                                backgroundColor: "rgb(189 155 74)",
                              },
                            }}
                          >
                            Cancel
                          </Button>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              {payButton && (
                <Grid container mt={2} spacing={2}>
                  <Grid item md={3} sm={12} xs={12}>
                    <InputField
                      label="Total Amount"
                      size="small"
                      disabled={true}
                      placeholder="Total Amount"
                      register={register1("total", {
                        required: "please enter total .",
                      })}
                      error={errors1?.total?.message}
                    />
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <InputField
                      label="Paid Amount"
                      value={0}
                      disabled={true}
                      size="small"
                      placeholder="Enter amount"

                      register={register1("amount", {
                        required: false,

                      })}
                      error={errors1?.amount?.message || amountError}
                    />
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <InputField
                      label="Balance Amount"
                      size="small"
                      disabled={true}
                      placeholder="Balance Amount"
                      register={register1("balance", {
                        required: "please enter balance .",
                      })}
                      error={errors1?.balance?.message}
                    />
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <SelectField
                      label="Payment Mode"
                      size="small"
                      options={[
                        { id: "Cash", name: "Cash" },
                        { id: "Bank", name: "Bank" },
                        { id: "Card", name: "Card" },
                        { id: "Payment Link", name: "Payment Link" },
                      ]}
                      selected={watch1("payment")}
                      onSelect={(value) => {
                        setValue1("payment", value)
                        setSelectedMode(value)
                      }}
                      register={register1("payment", {
                        required: "Please select payment mode",
                      })}
                      error={errors1?.payment?.message}
                    />
                  </Grid>
                  {selectedMode?.id == "Bank" && (
                    <Grid item md={3} sm={12} xs={12}>
                      <SelectField
                        label="Banks"
                        size="small"
                        options={banks}
                        selected={selectedBank}
                        onSelect={(value) => {
                          setSelectedBank(value)
                        }}
                        register={register1("bank", {
                          required: "Please select a bank",
                        })}
                        error={errors1?.bank?.message}
                      />
                    </Grid>
                  )}
                  {selectedMode?.id == "Card" && (
                    <Grid item md={3} sm={12} xs={12}>
                      <SelectField
                        label="Card"
                        size="small"
                        options={cards}
                        selected={selectedCard}
                        onSelect={(value) => {
                          setSelectedCard(value)
                        }}
                        register={register1("card", {
                          required: "Please select a card",
                        })}
                        error={errors1?.card?.message}
                      />
                    </Grid>
                  )}
                  {selectedMode?.id == "Card" && <Grid item md={3} sm={12} xs={12}>
                    <InputField
                      label="Authorization Code"
                      size="small"
                      placeholder="Authorization Code"
                      register={register1("remarks", {
                        required: "Please enter code",
                      })}
                      error={errors1?.remarks?.message}
                    />
                  </Grid>}
                  <Grid item md={3} sm={12} xs={12}>
                    <InputField
                      label="Narration"
                      size="small"
                      placeholder="Narration"
                      register={register1("narration")}
                      error={errors1?.narration?.message}
                    />
                  </Grid>
                  <Grid container justifyContent={"flex-end"} mt={2} pr={2}>
                    <Button
                      type="submit"
                      disabled={rows?.length == 0 || buttonDisabled}
                      variant="contained"
                      sx={{
                        textTransform: "capitalize",
                        backgroundColor: "#bd9b4a",
                        ":hover": {
                          backgroundColor: "rgb(189 155 74)",
                        },
                      }}
                    >
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Box>
          </>
        }
      </Box>
    </>
  )
}

export default CreatePaidReceipt
