import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import SystemServices from "services/System";
import DatePicker from "components/DatePicker";
import VendorServices from "services/Vendor";
import BankServices from "services/Bank";
import FinanceServices from "services/Finance";
import { useAuth } from "context/UseContext";
import ExportServices from "services/Export";
import ExportFinanceServices from "services/ExportFinance";

function ExportTT() {

  const navigate = useNavigate();
  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Handle Date
  const [ttDate, setTtDate] = useState(new Date());

  // *For Vendor Dropdown
  const [vendors, setVendors] = useState();
  const [selectedVendor, setSelectedVendor] = useState(null);

  // *For Currencies
  const [currencies, setCurrencies] = useState();
  const [exchangeRate, setExchangeRate] = useState();

  // *For Rates
  const [ttCharges, setTtCharges] = useState(0);
  const [vatCharges, setVatCharges] = useState(0);
  const [fcyAmount, setFcyAmount] = useState(0);
  const [lcyAmount, setLcyAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // *For Payment Method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // *For Bank Account
  const [bankAccounts, setBankAccounts] = useState([]);
  const [cashierAccounts, setCashierAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // *For Handle Date
  const handleTtDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setTtDate('invalid')
        return
      }
      setTtDate(new Date(newDate))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Currencies
  const getCurrencies = async () => {
    try {
      let params = {
        detailed: true
      }
      const { data } = await SystemServices.getCurrencies(params)
      setCurrencies(data?.currencies)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Vendor
  const getVendorDropdown = async () => {
    try {
      const { data } = await ExportServices.getVendorDropdown()
      setVendors([...data?.agents,...data?.brokers])
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Payment Accounts
  const getPaymentAccounts = async () => {
    try {
      let params = {
        page: 1,
        limit: 1000
      }
      const { data } = await ExportServices.getPaymentAccounts(params)
      // *Filter only vehicle account
      const vehicleAcc = data?.cashierAccounts?.rows?.filter(e => e.unit === 'Shipping')
      // *1003 is the cashier role ID if the login user is a cashier then show only their account
      if (user?.role_id === 1004) {
        const userId = user?.ref_id.split('-')[1]
        const filterCashier = vehicleAcc.filter(e => e.user_id == userId)
        setCashierAccounts(filterCashier)
      } else {
        setCashierAccounts(vehicleAcc)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Banks
  const getBanks = async () => {
    try {
      let params = {
        page: 1,
        limit: 1000
      }
      const { data } = await ExportFinanceServices.getBanks(params)
      setBankAccounts(data?.banks?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Create TT
  const createTT = async (formData) => {
    setLoading(true)
    try {
      let obj = {
        vendor_id: selectedVendor?.id,
        vendor_name: selectedVendor?.name,
        vendor_type: selectedVendor?.type,
        external_no: formData?.externalRef,
        fcy_amount: fcyAmount,
        ex_rate: exchangeRate,
        fcy_currency: selectedVendor?.currency,
        lcy_amount: lcyAmount,
        tt_charges: ttCharges,
        vat_charges: vatCharges,
        total_amount: (parseFloat(totalAmount) + parseFloat(ttCharges) + parseFloat(vatCharges)).toFixed(2),
        notes: formData?.note,
        payment_medium: selectedPaymentMethod?.id
      }
      if (selectedPaymentMethod?.id === 'bank') {
        obj.bank_id = selectedAccount?.id
        obj.bank_name = selectedAccount?.name
        obj.account_id = selectedAccount?.gwc_account_id
      } else {
        obj.account_id = selectedAccount?.id
      }
      const { message } = await ExportServices.createExportTT(obj)
      SuccessToaster(message)
      navigate('/export-tt-list')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  // *For Handle Select Vendor
  const handleSelectVendor = (data) => {
    try {
        console.log(data,'data');
      const exRate = currencies.find(e => e.currency === 'usd')?.conversion_rate
      setSelectedVendor(data)
      setValue('ttRate', exRate)
      setExchangeRate(exRate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Calculate
  const handleCalc = (value) => {
    try {
        console.log(value,exchangeRate);
      let aed = value * exchangeRate
      setFcyAmount(value)
      setLcyAmount(aed)
      setTotalAmount(aed)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Payment Method
  const handlePaymentMethod = (data) => {
    try {
      setSelectedPaymentMethod(data)
      if (data?.id === 'bank') {
        setSelectedAccount(bankAccounts[0])
      } else {
        setSelectedAccount(null)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  useEffect(() => {
    if (exchangeRate) {
      handleCalc(fcyAmount)
    }
  }, [exchangeRate]);

  useEffect(() => {
    getVendorDropdown()
    getPaymentAccounts()
    getBanks()
    getCurrencies()
  }, []);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <Box component="form" onSubmit={handleSubmit(createTT)}>
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 3 }}>
          Add Export TT
        </Typography>
        <Grid container spacing={2} alignItems={'center'}>
          <Grid item sm={4}>
            <DatePicker
              label={'Date'}
              value={ttDate}
              onChange={(date) => handleTtDate(date)}
            />
          </Grid>
          <Grid item sm={4}>
            <InputField
              label={"External Ref No"}
              placeholder={"External Ref No"}
              error={errors?.externalRef?.message}
              register={register("externalRef", {
                required: "Please enter external ref.",
              })}
            />
          </Grid>
          <Grid item sm={4}>
          </Grid>
          <Grid item sm={4}>
            <SelectField
              label={'Vendor'}
              options={vendors}
              selected={selectedVendor}
              onSelect={(value) => handleSelectVendor(value)}
              error={errors?.vendor?.message}
              register={register("vendor", {
                required: 'Please select vendor.',
              })}
            />
          </Grid>
          <Grid item sm={4}>
            <InputField
              type={'number'}
              label={"FCY Amount (USD)"}
              placeholder={"FCY Amount"}
              InputProps={{ inputProps: { min: 0 } }}
              register={register("fcyAmount", {
                onChange: e => e.target.value ? handleCalc(e.target.value) : handleCalc(0)
              })}
            />
          </Grid>
          <Grid item sm={4}>
            <InputField
              disabled={true}
              label={"LCY Amount (AED)"}
              placeholder={"LCY Amount"}
              value={parseFloat(lcyAmount).toFixed(2)}
            />
          </Grid>
          <Grid item sm={4}>
            <InputField
              label={'TT Rate'}
              placeholder={'TT Rate'}
              InputProps={{ inputProps: { min: 0 } }}
              register={register("ttRate", {
                onChange: e => e.target.value ? setExchangeRate(e.target.value) : setExchangeRate(0)
              })}
            />
          </Grid>
          <Grid item sm={4}>
            <InputField
              label={'TT and Bank Charges'}
              placeholder={'TT and Bank Charges'}
              error={errors?.ttCharges?.message}
              register={register("ttCharges", {
                required: "Please enter tt bank charges.",
                onChange: e => e.target.value ? setTtCharges(e.target.value) : setTtCharges(0)
              })}
            />
          </Grid>
          <Grid item sm={4}>
            <InputField
              label={'VAT on Bank Charges'}
              placeholder={'VAT on Bank Charges'}
              error={errors?.vatCharges?.message}
              register={register("vatCharges", {
                required: "Please enter vat charges.",
                onChange: e => e.target.value ? setVatCharges(e.target.value) : setVatCharges(0)
              })}
            />
          </Grid>
          <Grid item sm={4}>
            <SelectField
              label={'Payment Method'}
              options={[
                {
                  "id": "cash",
                  "name": "Cash"
                },
                {
                  "id": "bank",
                  "name": "Bank"
                }
              ]}
              selected={selectedPaymentMethod}
              onSelect={(value) => handlePaymentMethod(value)}
              error={errors?.paymentMethod?.message}
              register={register("paymentMethod", {
                required: 'Please select payment method.',
              })}
            />
          </Grid>
          <Grid item sm={4}>
            <SelectField
              disabled={selectedPaymentMethod ? false : true}
              label={'TT Fund form Account:'}
              options={selectedPaymentMethod?.id === 'bank' ? bankAccounts : cashierAccounts}
              selected={selectedAccount}
              onSelect={(value) => setSelectedAccount(value)}
              error={errors?.account?.message}
              register={register("account", {
                required: 'Please select  account.',
              })}
            />
          </Grid>
          <Grid item sm={4}>
            <InputField
              disabled={true}
              label={'Total Amount (AED)'}
              placeholder={'Total Amount'}
              InputProps={{ inputProps: { min: 0 } }}
              value={(parseFloat(totalAmount) + parseFloat(ttCharges) + parseFloat(vatCharges)).toFixed(2)}
            />
          </Grid>
          <Grid item sm={12}>
            <InputField
              label={"Accountant Notes"}
              placeholder={"Accountant Notes"}
              multiline={true}
              rows={2}
              register={register("note")}
            />
          </Grid>
          <Grid item xs={12} sm={12} >
            <Box sx={{ textAlign: 'right' }}>
              <PrimaryButton
                title="Submit"
                type="submit"
                loading={loading}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

    </Box>
  );
}

export default ExportTT;