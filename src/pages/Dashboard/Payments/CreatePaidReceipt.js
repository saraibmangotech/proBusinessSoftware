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
import { showErrorToast, showPromiseToast, showSuccessToast } from "components/NewToaster"
import moment from "moment"
import { useNavigate } from "react-router-dom"
import { useAuth } from "context/UseContext"
import FinanceServices from "services/Finance"
import SearchIcon from "@mui/icons-material/Search"
import DeleteIcon from '@mui/icons-material/Delete';
import { agencyType } from "utils"
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
  const [oldRows, setOldRows] = useState([])
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
  console.log(errors1);

  useEffect(() => {
    const feesTotal =
      (Number.parseFloat(govtFee) || 0) + (Number.parseFloat(centerFee) || 0) + (Number.parseFloat(bankCharges) || 0)
    const finalTotal = feesTotal * (Number.parseFloat(qty) || 1)
    setValue("total", finalTotal)
  }, [govtFee, centerFee, bankCharges, qty])


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
  const [totalDepositVal, setTotalDepositVal] = useState(0)
  console.log(selectedBank, "objobj")

  const [center, setCenter] = useState(null)
  const [status, setStatus] = useState(null)
  const [fieldsDisabled, setFieldsDisabled] = useState(false)

  // *For Stepper Forms Data
  const [stepFormData, setStepFormData] = useState()
  const [step1FormData, setStep1FormData] = useState()
  const [selectedType, setSelectedType] = useState(null)
  const [date, setDate] = useState(null)
  const [paidAt, setPaidAt] = useState(new Date())
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
  const [payments, setPayments] = useState([])
  const [chargesDisabled, setChargesDisabled] = useState(false)
  const [paymentTotal, setPaymentTotal] = useState(0)
  const [creditButton, setCreditButton] = useState(false)
  //documents array

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }
  console.log("objobj", watch1("bank"))

  const submitForm1 = async (formData) => {
    console.log(formData, "objobjj")
    const existingTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const paymentModesString = payments.map((item) => item.payment_mode).join(", ");
    const totalAdditionalCharges = payments.reduce((sum, p) => sum + parseFloat(p.additional_charges_value || 0), 0);
    console.log(paymentModesString); // Output: "Cash, Bank, Card"
    getValues1('total')
    if (parseFloat(existingTotal.toFixed(2)) == parseFloat(getValues1('finalTotal').toFixed(2))) {

      setButtonDisabled(true)
      try {
        const obj = {
          id: getValues1("invoicenumber"),
          total_amount: detail?.total_amount,
          items: rows,
          paid_date: moment(paidAt).format('MM-DD-YYYY'),
          paid_amount: detail?.amount,

          remarks: formData?.remarks,
          narration: formData?.narration,
          payment_mode: paymentModesString,
          payment_status: 'Paid',
          charges: detail?.sale_receipt_items?.reduce((acc, item) => acc + Number(item?.center_fee || 0), 0),
          govt_charges: detail?.sale_receipt_items?.reduce((acc, item) => acc + Number(item?.govt_fee || 0), 0),
          bank_charges: detail?.sale_receipt_items?.reduce((acc, item) => acc + Number(item?.bank_charge || 0), 0),
          additional_charges_value: totalAdditionalCharges,

          customer_id: detail?.customer_id,
          invoice_prefix: detail?.invoice_prefix,
          category_id: detail?.sale_receipt_items[0]?.service?.category_id,
          payment_methods: payments,

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
    else {
      const difference = getValues1('finalTotal') - existingTotal;
      showErrorToast(`Remaining amount to be added is ${difference.toFixed(2)}`)
    }
  }

  const handleCredit = async (formData) => {


    console.log(detail, 'detail');

    try {
      const obj = {
        id: detail?.id,
        customer: selectedCustomer?.id,
        total_amount: subTotal,
        paid_date: moment(paidAt).format('MM-DD-YYYY'),
        final_amount: (
          Number.parseFloat(subTotal) +
          rows?.reduce((total, item) => {
            const fee = Number.parseFloat(item?.center_fee ?? 0)
            const qty = Number.parseFloat(item?.quantity ?? 1)
            return total + fee * qty
          }, 0) *
          0.05
        ).toFixed(2)
      }
      console.log(obj, 'detail');


      const promise = CustomerServices.CreditReceipt(obj)
      const response = await promise
      showPromiseToast(promise, "Saving...", "Added Successfully", "Something Went Wrong")
      if (response?.responseCode === 200) {
        navigate('/paid-receipts')
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
        limit: 999999,
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
        limit: 999999,
      }

      const { data } = await CustomerServices.getCards(params)
      let cardsData = data?.cards?.map((card) => ({
        ...card,
        name: card.account_name,
      }));
      setCards(
        data?.cards?.map((card) => ({
          ...card,
          name: card.account_name,
        })),

      )

      setSelectedCard({ id: cardsData[0]?.id, name: cardsData[0]?.name, account_id: cardsData[0]?.account_id })
      setValue1("card", { id: cardsData[0]?.id, name: cardsData[0]?.name, account_id: cardsData[0]?.account_id })


    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoader(false)
    }
  }

  const round = (num) => Math.round(num * 100) / 100;

  // *For Get Account
  const getReceptionDetail = async (state) => {

    try {
      let params = {
        token_number: getValues1("token"),
      }
      if (state) {
        params = {
          invoice_number: getValues1("invoicenumber"),
        }

        if (!params.invoice_number) {
          ErrorToaster("Enter Something in SR Number")
          return;
        }
      }
      setFieldsDisabled(true)

      const { data } = await CustomerServices.getReceiptDetail(params)

      if (!data?.receipt) {
        ErrorToaster("No Result Found")
       
        setFieldsDisabled(false)
        return;
      }

      if (data?.receipt) {
        getInvoiceNumber(data?.receipt?.id)
        if (data?.receipt?.is_paid) {
          ErrorToaster("Receipt already Paid")
          return;
        }

        if (data?.receipt?.is_deleted) {
          ErrorToaster("Receipt is voided")
          return;
        }

        setRows(data?.receipt?.sale_receipt_items)
        setOldRows(data?.receipt?.sale_receipt_items)
        setDetail(data?.receipt)
        setCreditButton(true)
        setValue1("paid", 0)
        //setValue1("customer", data?.receipt?.customer_name)
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
        setSelectedCustomer({ id: data?.receipt?.customer_id, name: data?.receipt?.customer?.name })
        setValue1("customer", { id: data?.receipt?.customer_id, name: data?.receipt?.customer?.name })
        setSubTotal(data?.receipt?.total_amount)

        let taxable = 0;
        for (let i = 0; i < data?.receipt?.sale_receipt_items.length; i++) {
          const element = data?.receipt?.sale_receipt_items[i];
          taxable += round(parseFloat(element.center_fee) * element.quantity)
        }
        let tax = round(taxable * 0.05)
        console.log("taxable", taxable, tax)
        let total = round(parseFloat(data?.receipt?.total_amount) + tax)
        console.log("taxable", total)
        setTotalDepositVal((
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
        ))
        setValue1(
          "total",
          total,
        )
        setValue1(
          "percentage",
          0,
        )
        setValue1(
          "additionalCharges",
          0,
        )
        setValue1(
          "methodTotal",
          0,
        )
        setValue1(
          "finalTotal",
          total,
        )
        setValue1(
          "balance",
          total,
        )
        setValue1(
          "payamount",
          total,
        )
        setSelectedCostCenter({ id: data?.receipt?.customer_id, name: data?.receipt?.customer_name })
        setSelectedCostCenter({ id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
        setValue1("cost_center", { id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
        setAccounts(data?.accounts?.rows)
      }
      else {
        setCreditButton(false)
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
        limit: 999999,
      }

      const { data } = await CustomerServices.getServiceItem(params)
      const mappedServices = data?.rows.map(item => ({
        ...item,
        name: `${item.name} - ${item.name_ar}`,
      }));

      setServices(mappedServices);
      //setServices(data?.rows)
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
        limit: 999999,
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
        limit: 999999,
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

  const getInvoiceNumber = async (id) => {
    // setLoader(true)
    try {
      const params = {
       id:id
      }

      const { data } = await CustomerServices.getInvoiceNumber(params)
      console.log(data,'datadatadata')
      setValue1('invoiceID',data?.invoice_number)

      
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }
  const addPayments = (amount, mode, bank, card, code, percentage = null, additionalCharges = null, submit = null) => {
    console.log(percentage);
    
    const total = parseFloat(getValues1("total")) || 0;
    const currentAmount = parseFloat(amount) || 0;
    const existingTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    let sum = existingTotal + currentAmount;

    // Convert to fixed decimals and parse back to numbers
    let formattedSum = parseFloat(sum.toFixed(2));
    let formattedTotal = parseFloat(total.toFixed(2));
    
    console.log("Formatted Sum:", formattedSum);
    console.log("Formatted Total:", formattedTotal);
    console.log("Comparison:", formattedSum > formattedTotal);
    
    if (formattedSum > formattedTotal) {
      showErrorToast("Total payment exceeds the required amount.");
      return;
    }

    if (!amount) {
      showErrorToast("Amount is required");
      return;
    }

    if (parseFloat(amount) === 0) {
      showErrorToast("Amount is 0");
      return;
    }

    if (!mode) {
      showErrorToast("Payment mode is required");
      return;
    }

    if (mode === "Bank" && !bank) {
      showErrorToast("Bank is required for Bank mode");
      return;
    }

    if (mode === "Card" && !card) {
      showErrorToast("Card is required for Card mode");
      return;
    }

    if (mode === "Card" && !code) {
      showErrorToast("Authorization code is required for Card mode");
      return;
    }

    if ((mode === "Payment Link" || mode === "Card") && (percentage === undefined || percentage === null || isNaN(percentage))) {
      showErrorToast("Percentage is required for Bank/Card mode");
      return;
    }

    const paymentObj = {
      amount: currentAmount,
      payment_mode: mode,
      account_id:
        mode === "Bank"
          ? bank?.account_id
          : mode === "Card"
            ? card?.account_id
            : mode === "Cash"
              ? 700117
              : 700171,
      ref_id: mode === "Bank" ? bank?.id : mode === "Card" ? card?.id : null,
      ref_name: mode === "Bank" ? bank?.name : mode === "Card" ? card?.name : null,
      auth_code: mode === "Card" ? code : null,
      additional_charges_percentage: mode === "Payment Link" || mode === "Card" ? parseFloat(percentage) : null,
      additional_charges_value: mode === "Payment Link" || mode === "Card" ? parseFloat(additionalCharges || 0) : null,
    };

    setPayments((prev) => [...prev, paymentObj]);

    // Reset form fields
    setSelectedBank(null);
    setSelectedCard(null);
    setValue1("payamount", "");
    setValue1("percentage", "");
    setValue1("additionalCharges", "");
    setValue1("remarks", "");
    setValue1("authCode", "");
    // Optionally reset payment mode
    // setValue1("payment", { id: "Cash", name: "Cash" });
    // setSelectedMode({ id: "Cash", name: "Cash" });
  };

  useEffect(() => {
    console.log(payments, 'paymentspayments');

    const total = parseFloat(getValues1("total")) || 0;
    const existingTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    console.log(total, 'total');
    console.log(existingTotal, 'existingTotal');
    console.log(total, 'total');
    console.log(parseFloat(parseFloat(total) - parseFloat(existingTotal)), 'minusval');

    setValue1('amount', parseFloat(existingTotal).toFixed(2))
    setValue1('balance', parseFloat(parseFloat(parseFloat(total) - parseFloat(existingTotal))).toFixed(2))
    setValue1('payamount', parseFloat(parseFloat(parseFloat(total) - parseFloat(existingTotal))).toFixed(2))

    if (payments?.length > 0) {
      setChargesDisabled(true)
    }
    else if (payments?.length == 0) {
      setChargesDisabled(false)
    }
    setValue1("payment", { id: "Cash", name: "Cash" })
    setSelectedMode({ id: "Cash", name: "Cash" })
  }, [payments])

  const getCategories = async () => {
    // setLoader(true)
    try {
      const params = {
        page: 1,
        limit: 999999,
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

    try {
      const params = {
        token_number: getValues1("token"),
        invoice_date: moment(date).format('MM-DD-YYYY'),
      }

      if (!params.token_number) {
        showErrorToast("Enter Token Number First")
        return
      }
      setFieldsDisabled(true)

      const { data } = await CustomerServices.getReceiptDetail(params)

      if (data?.receipt) {
        if (data?.receipt?.is_deleted) {
          ErrorToaster("Receipt is voided")
          return;
        }
        setHoldState(true)
        setCreditButton(true)
        setRows(data?.receipt?.sale_receipt_items)
        setOldRows(data?.receipt?.sale_receipt_items)
        setDetail(data?.receipt)
        getInvoiceNumber(data?.receipt?.id)
        //alert("Data found")
        setValue1("paid", 0)
        //setValue1("customer", data?.receipt?.customer_name)
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
        setSelectedCustomer({ id: data?.receipt?.customer_id, name: data?.receipt?.customer?.name })
        setValue1("customer", { id: data?.receipt?.customer_id, name: data?.receipt?.customer?.name })
        // setSelectedCustomer({ id: 11002, name: "Walk-in Customer" })
        // setValue1("customer", { id: 11002, name: "Walk-in Customer" })
        setSubTotal(data?.receipt?.total_amount)


        let taxable = 0;
        for (let i = 0; i < data?.receipt?.sale_receipt_items.length; i++) {
          const element = data?.receipt?.sale_receipt_items[i];
          taxable += round(parseFloat(element.center_fee) * element.quantity)
        }
        let tax = round(taxable * 0.05)
        console.log("taxable", taxable, tax)
        let total = round(parseFloat(data?.receipt?.total_amount) + tax)
        console.log("taxable", total)
        setTotalDepositVal((
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
        )) //yaha kaam
        setValue1(
          "total",
          total,
        )
        setValue1(
          "percentage",
          0,
        )
        setValue1(
          "additionalCharges",
          0,
        )
        setValue1(
          "methodTotal",
          0,
        )
        setValue1(
          "finalTotal",
          total,
        )
        setValue1(
          "balance",
          total,
        )
        setValue1(
          "payamount",
          total,
        )
        setSelectedCostCenter({ id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
        setSelectedCustomer({ id: data?.receipt?.customer_id, name: data?.receipt?.customer?.name })
        setValue1("cost_center", { id: data?.receipt?.cost_center, name: data?.receipt?.cost_center })
        setAccounts(data?.accounts?.rows)
      } else {
        setCreditButton(false)
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
    
    setValue1("payment", { id: "Cash", name: "Cash" })
    setSelectedMode({ id: "Cash", name: "Cash" })
    //setSelectedCustomer({ id: 11002, name: "Walk-in Customer" })
    //setValue1("customer", { id: 11002, name: "Walk-in Customer" })
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
                          label={"Token Date :*"}
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
                          label="Service Request Number"
                          size="small"
                          disabled={fieldsDisabled}
                          placeholder="Service Request Number"
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
                                <SearchIcon sx={{ color: "#001f3f" }} />
                              </IconButton>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item md={2} sm={12} xs={12} mt={2.5}>
                        <PrimaryButton
                          bgcolor={"#001f3f"}
                          title="Clear"
                          onClick={() => {
                            setCreditButton(false)
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
                        <DatePicker
                          label={"Payment Date :*"}
                          value={date}
                          disabled={true}
                          size={"small"}
                          error={errors1?.date?.message}
                          register={register1("paidAt")}
                          onChange={(date) => {
                            setValue1("paidAt", date)
                            setPaidAt(new Date(date))
                          }}
                        />
                      </Grid>
                      <Grid item md={3.8} sm={5.5} xs={12}>
                        <InputField
                          label="Invoice Number"
                          size="small"
                          disabled={true}
                          placeholder="Invoice Number"
                          register={register1("invoiceID")}
                          error={errors1?.invoiceID?.message}
                        />
                      </Grid>
                      <Grid item md={3.8} sm={5.5} xs={12}>
                        <SelectField
                          size={"small"}
                          label={"Customer *:"}
                          disabled={true}
                          options={[{ id: 11002, name: "Walk-in Customer" }]}
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
                          register={register1("mobile", {
                         
                          })}
                          error={errors1?.mobile?.message}
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

                      {/* <Grid item md={3.8} sm={5.5} xs={12}>
                        <SelectField
                          label="Cost Center"
                          size="small"
                          disabled={true}
                          options={[{ id: "TASHEEL", name: "TASHEEL" }]}
                          selected={selectedCostCenter}
                          onSelect={(value) => setSelectedCostCenter(value)}
                          register={register1("cost_center", {
                            required: false,
                          })}
                        />
                      </Grid> */}

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
                        <TableCell sx={{ display: "none" }}>{item?.id}</TableCell>
                        <TableCell>{item?.service?.item_code}</TableCell>
                        <TableCell>{item?.service?.name + "-" + item?.service?.name_ar}</TableCell>
                        <TableCell>{item?.quantity}</TableCell>
                        <TableCell>{item?.govt_fee}</TableCell>
                        <TableCell>{item?.center_fee}</TableCell>
                        <TableCell>{item?.bank_charge}</TableCell>
                        <TableCell>{item?.total}</TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Transaction Id"
                            disabled={oldRows[index].transaction_id ? true : false}
                            type="text"
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
                          {round(
                            Number.parseFloat(subTotal) +
                            round(
                              rows?.reduce((total, item) => {
                                const fee = Number.parseFloat(item?.center_fee ?? 0);
                                const qty = Number.parseFloat(item?.quantity ?? 1);
                                return total + round(fee * qty);
                              }, 0) * 0.05
                            )
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
                              backgroundColor: "#001f3f",
                              width: "200px",
                              ":hover": {
                                backgroundColor: "#001f3f",
                              },
                            }}
                          >
                            Pay
                          </Button>
                          {console.log(selectedCustomer, 'selectedCustomer')
                          }
                          {creditButton && detail?.is_presale && <Button
                            onClick={() => handleCredit()}

                            variant="contained"
                            sx={{
                              textTransform: "capitalize",
                              backgroundColor: "#001f3f",
                              width: "200px",
                              ":hover": {
                                backgroundColor: "#001f3f",
                              },
                            }}
                          >
                            Mark As Credit
                          </Button>}
                          <Button
                            onClick={() => setPayButton(false)}
                            variant="contained"
                            sx={{
                              textTransform: "capitalize",
                              backgroundColor: "#001f3f",
                              width: "200px",
                              ":hover": {
                                backgroundColor: "#001f3f",
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
                      label="Final Total"
                      size="small"
                      disabled={true}
                      placeholder="Final Total"
                      register={register1("finalTotal", {
                        required: "please enter finalTotal .",
                      })}
                      error={errors1?.finalTotal?.message}
                    />
                  </Grid>
                  <Grid item md={3} sm={12} xs={12}>
                    <InputField
                      label="Paid Amount"

                      disabled={true}
                      size="small"
                      placeholder="Enter amount"

                      register={register1("amount", {
                        required: false,

                      })}
                      error={errors1?.amount?.message}
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
                    <InputField
                      label="Narration"
                      size="small"
                      placeholder="Narration"
                      register={register1("narration")}
                      error={errors1?.narration?.message}
                    />
                  </Grid>

                  <Grid container p={2} spacing={2}>
                    <Grid item md={3} sm={12} xs={12}>
                      <InputField
                        label="Amount"
                        size="small"
                        placeholder="Amount"
                        type="number"
                        register={register1("payamount", {
                          required: false,
                          onChange: (e) => {
                            const amount = parseFloat(e.target.value || 0);
                            const percentage = parseFloat(getValues1("percentage") || 0);
                            const additionalCharge = ((percentage / 100) * amount).toFixed(2);
                            setValue1("additionalCharges", additionalCharge);
                            setValue1("methodTotal",parseFloat(parseFloat(getValues1('total')) + parseFloat(additionalCharge)).toFixed(2));
                          },
                        })}
                        error={errors1?.payamount?.message}
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
                          console.log(agencyType[process.env.REACT_APP_TYPE]);

                          if ((agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" ||
                            agencyType[process.env.REACT_APP_TYPE]?.category === "AL-AHDEED")
                            && value?.id === 'Card') {
                              console.log(agencyType[process.env.REACT_APP_TYPE]?.category,'value?.id');
                              console.log(getValues1('invoiceID')?.includes('DED'),'value?.id');
                            console.log(agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" && getValues1('invoiceID')?.includes('DED'), 'value?.id');

                            setValue1('percentage', 1);
                            let percentageValue = parseFloat(1 || 0);
                            if(agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" && getValues1('invoiceID')?.includes('DED')){
                              setValue1('percentage',0);
                             percentageValue = parseFloat(0);
                            }
                            if(agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" && getValues1('invoiceID')?.includes('TYP')){
                              setValue1('percentage',1);
                             percentageValue = parseFloat(1 || 0);
                            }
                            const amount = parseFloat(getValues1("payamount") || 0);
                            const additionalCharge = ((percentageValue / 100) * amount).toFixed(2);

                            setValue1("additionalCharges", additionalCharge);
                            setValue1("methodTotal",parseFloat(parseFloat(getValues1('total')) + parseFloat(additionalCharge)).toFixed(2));

                          } else if (agencyType[process.env.REACT_APP_TYPE]?.category === "AL-AHDEED" &&
                            value?.id === 'Payment Link') {
                            setValue1('percentage', 1.35);
                            const percentageValue = parseFloat(1.35 || 0);
                            const amount = parseFloat(getValues1("payamount") || 0);
                            const additionalCharge = ((percentageValue / 100) * amount).toFixed(2);

                            setValue1("additionalCharges", additionalCharge);
                            setValue1("methodTotal",parseFloat(parseFloat(getValues1('total')) + parseFloat(additionalCharge)).toFixed(2));
                          }
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
                    {(selectedMode?.id === "Card" || selectedMode?.id === "Payment Link") && (
                      <>
                        <Grid item md={3} sm={12} xs={12}>
                          <InputField
                            label="Percentage"
                            size="small"
                            placeholder="Enter percentage"
                            type="number"
                            register={register1("percentage", {
                              required: "Please enter percentage",
                              min: { value: 0, message: "Minimum 0%" },
                              max: { value: 100, message: "Maximum 100%" },
                              onChange: (e) => {
                                const percentageValue = parseFloat(e.target.value || 0);
                                const amount = parseFloat(getValues1("payamount") || 0);
                                const additionalCharge = ((percentageValue / 100) * amount).toFixed(2);

                                setValue1("additionalCharges", additionalCharge);
                                setValue1("methodTotal",parseFloat(parseFloat(getValues1('total')) + parseFloat(additionalCharge)).toFixed(2));
                              },
                            })}
                            error={errors1?.percentage?.message}
                          />
                        </Grid>


                        <Grid item md={3} sm={12} xs={12}>
                          <InputField
                            label="Additional Charges"
                            size="small"
                            placeholder="Auto calculated"
                            disabled
                            value={watch1("additionalCharges")}
                            register={register1("additionalCharges")}
                            error={errors1?.additionalCharges?.message}
                          />
                        </Grid>
                        
                        <Grid item md={3} sm={12} xs={12}>
                          <InputField
                            label="Method Total"
                            size="small"
                            placeholder="Auto calculated"
                            disabled
                            value={watch1("methodTotal")}
                            register={register1("methodTotal")}
                            error={errors1?.methodTotal?.message}
                          />
                        </Grid>
                      </>
                    )}

                    <Grid item md={12} sm={12} xs={12}>
                      <Button
                        onClick={() => addPayments(
                          getValues1("payamount"),
                          selectedMode?.id,
                          selectedBank,
                          selectedCard,
                          getValues1("remarks"),
                          getValues1("percentage"),
                          getValues1("additionalCharges")
                        )}

                        variant="contained"
                        sx={{
                          textTransform: "capitalize",
                          backgroundColor: "#001f3f",
                          width: "200px",
                          ":hover": {
                            backgroundColor: "#001f3f",
                          },
                        }}
                      >
                        Add New Method
                      </Button>


                    </Grid>
                    <Typography variant="body1" sx={{ p: 2, fontWeight: 'bold', mt: 2 }} color="initial">

                      Payment Details
                    </Typography>

                    <Grid container mt={2} p={2}>
                      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2, width: '100%' }}>
                        {payments.map((payment, index) => (
                          <Box
                            key={index}
                            sx={{
                              border: "1px solid #ccc",
                              borderRadius: 2,
                              width: "30%",
                              p: 2,
                              mb: 1,
                              backgroundColor: "#f9f9f9",
                              position: "relative",
                            }}
                          >
                            <IconButton
                              size="small"
                              sx={{ position: "absolute", top: 8, right: 8 }}
                              onClick={() => {
                                const updatedPayments = payments.filter((_, i) => i !== index);
                                setPayments(updatedPayments);
                              }}
                            >
                              <DeleteIcon color="error" fontSize="small" />
                            </IconButton>

                            <Typography variant="body1">
                              <strong>Amount:</strong> {parseFloat(payment.amount || 0).toFixed(2)}
                            </Typography>
                            <Typography variant="body1">
                              <strong>Mode:</strong> {payment.payment_mode}
                            </Typography>
                            {payment.mode === "Bank" && (
                              <Typography variant="body1">
                                <strong>Bank:</strong>{" "}
                                {payment.bank?.name || payment.bank}
                              </Typography>
                            )}
                            {payment.mode === "Card" && (
                              <Typography variant="body1">
                                <strong>Card:</strong>{" "}
                                {payment.card?.name || payment.card}
                              </Typography>
                            )}
                            {(payment.payment_mode === "Card" || payment.payment_mode === "Payment Link") && (
                              <Typography variant="body1">
                                <strong>Additional Percent:</strong> {payment.additional_charges_percentage}%
                              </Typography>
                            )}
                            {(payment.payment_mode === "Card" || payment.payment_mode === "Payment Link") && (
                              <Typography variant="body1">
                                <strong>Additional Charges:</strong>{" "}
                                {payment.additional_charges_value}
                              </Typography>
                            )}
                              {(payment.payment_mode === "Card" || payment.payment_mode === "Payment Link") && (
                              <Typography variant="body1">
                                <strong>Total:</strong>{" "}
                                {parseFloat(parseFloat(payment.additional_charges_value)+parseFloat(payment?.amount)).toFixed(2)}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                    <Grid>

                    </Grid>
                  </Grid>
                  <Grid container justifyContent={"flex-end"} mt={2} pr={2}>
                    <Button
                      type="submit"
                      disabled={rows?.length == 0 || buttonDisabled}
                      variant="contained"
                      sx={{
                        textTransform: "capitalize",
                        backgroundColor: "#001f3f",
                        ":hover": {
                          backgroundColor: "#001f3f",
                        },
                      }}
                    >
                      Create Receipt
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
