import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import FinanceServices from "services/Finance";
import DatePicker from "components/DatePicker";
import { useSelector } from "react-redux";
import { setDate } from "date-fns";

function FundTransferVoucherDetail() {
  const { id } = useParams()
  const navigate = useNavigate();
  const { usdExchangeRate } = useSelector((state) => state.navigationReducer);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const [loading, setLoading] = useState(false);

  // *For Accounts
  const [accounts, setAccounts] = useState([]);
  const [selectedFromAccount, setSelectedFromAccount] = useState(null);
  const [voucherItem, setVoucherItem] = useState(null);
  const [selectedToAccount, setSelectedToAccount] = useState(null);
  const [cashierAccounts, setCashierAccounts] = useState([])

  // *For Handle Date
  const [vaultDate, setVaultDate] = useState(new Date());

  // *For Exchange Rate Disabled
  const [disabledExchangeRate, setDisabledExchangeRate] = useState(false);

  // *For Updated Exchange Rate
  const [updateExchangeRate, setUpdateExchangeRate] = useState(usdExchangeRate);

  // *For Transfer Amount
  const [transferAmount, setTransferAmount] = useState();

  // *For Handle Date
  const handleVaultDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setVaultDate('invalid')
        return
      }
      setVaultDate(new Date(newDate))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Payment Accounts
  const getPaymentAccounts = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        name: search
      }
      const { data } = await FinanceServices.getAccounts(params)
      console.log(data?.rows);

      setAccounts(data?.accounts?.rows)

    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Create FUnd Transfer Voucher
  const FundTransferVoucherDetail = async (formData) => {
    setLoading(true)
    try {
      if (selectedFromAccount?.id === selectedToAccount?.id) {
        ErrorToaster('Transfer account and Receiver account is same')
        return
      }

      let fromAccount = null;
      let toAccount = null;
      let cashier = false
      fromAccount = cashierAccounts?.find(item => item?.id == selectedFromAccount?.id)
      toAccount = cashierAccounts?.find(item => item?.id == selectedToAccount?.id)

      if (fromAccount && toAccount) {
        cashier = true

      }
      else {
        cashier = false

      }
      let obj = {
        from_account_id: selectedFromAccount?.id,
        to_account_id: selectedToAccount?.id,
        from_currency: selectedFromAccount?.currency,
        from_amount: formData?.transferAmount,
        to_currency: selectedToAccount?.currency,
        to_amount: formData?.receivedAmount,
        exchange_rate: updateExchangeRate,
        exchange_loss: formData.exchangeLoss,
        ref_no: formData.ref,
        notes: formData.note,
        cashier: cashier
      }

      const { message } = await FinanceServices.createFundTransferVoucher(obj)
      SuccessToaster(message)
      navigate('/fund-transfer-vouchers')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }
  const getFundTransferVoucherDetail = async () => {

    try {
      let params = {
        id: id
      }
      const { data } = await FinanceServices.getFundTransferVoucherDetail(params)
      console.log(data);
      let voucher = data?.voucher
      setVoucherItem(data?.voucher)
      console.log("voucher",voucher)
      setDate(new Date(voucher?.createdAt))
      setValue('transferAmount',parseFloat(voucher?.from_amount).toFixed(2))
      setValue('note',voucher?.notes)
      setValue('ref',voucher?.ref)
      setValue('from_account',voucher?.from_account?.name)
      setValue('to_account',voucher?.to_account?.name)
      setSelectedFromAccount(voucher?.from_account)
      setSelectedToAccount(voucher?.to_account)

    } catch (error) {
      ErrorToaster(error)
    }
  }
  useEffect(() => {
    getFundTransferVoucherDetail()
    getPaymentAccounts()
  }, []);

  useEffect(() => {
    if (transferAmount) {
      let aedIntoUsd = 0
      let totalExchangeLoss = 0
      if (selectedFromAccount?.currency === selectedToAccount?.currency) {
        setDisabledExchangeRate(true)
        aedIntoUsd = parseFloat(transferAmount)
        setValue('receivedAmount', parseFloat(aedIntoUsd).toFixed(2))
        setValue('exchangeLoss', 0);
        return
      }
      setDisabledExchangeRate(false)
      if (selectedFromAccount?.currency === 'usd') {
        aedIntoUsd = parseFloat(transferAmount) * parseFloat(updateExchangeRate)
        setValue('receivedAmount', parseFloat(aedIntoUsd).toFixed(2))
        totalExchangeLoss = transferAmount * usdExchangeRate - transferAmount * updateExchangeRate;
        setValue('exchangeLoss', parseFloat(totalExchangeLoss).toFixed(2));
      }
      if (selectedFromAccount?.currency === 'aed') {

        aedIntoUsd = parseFloat(transferAmount) / parseFloat(updateExchangeRate)
        console.log(aedIntoUsd);
        console.log(transferAmount / usdExchangeRate);
        console.log(transferAmount / updateExchangeRate);
        console.log(usdExchangeRate);
        console.log(updateExchangeRate);
        setValue('receivedAmount', parseFloat(aedIntoUsd).toFixed(2))
        totalExchangeLoss = (transferAmount / usdExchangeRate) - (transferAmount / updateExchangeRate);
        setValue('exchangeLoss', parseFloat(totalExchangeLoss).toFixed(2));
      }
      if (selectedFromAccount?.currency === 'aed' && selectedToAccount?.currency === 'usd') {

        aedIntoUsd = parseFloat(transferAmount) / parseFloat(updateExchangeRate)

        setValue('receivedAmount', parseFloat(aedIntoUsd).toFixed(2))
        totalExchangeLoss = (transferAmount / usdExchangeRate) - (transferAmount / updateExchangeRate);
        setValue('exchangeLoss', parseFloat(parseFloat(totalExchangeLoss) * usdExchangeRate).toFixed(2));
      }
    }
  }, [transferAmount, updateExchangeRate, selectedFromAccount, selectedToAccount]);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <Box component="form" onSubmit={handleSubmit(FundTransferVoucherDetail)} >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
              Fund Transfer Voucher Detail
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              size={'small'}
              label={'Date'}
              disabled={true}
              value={vaultDate}
              onChange={(date) => handleVaultDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              size={'small'}
              label={'Ref No'}
              disabled={true}
              placeholder={'Ref No'}
              value={voucherItem?.ref_no}

              error={errors?.ref?.message}
              register={register("ref", {
                required: 'please enter ref no'
              })}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <InputField
              size={'small'}
              label={'Note'}
              disabled={true}
              value={voucherItem?.notes}
              placeholder={'Note'}
              register={register("note")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
          <InputField
              size={'small'}
              label={'From Account'}
              disabled={true}
              value={voucherItem?.from_account?.name}

              placeholder={'From Account'}
              register={register("from_account")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              size={'small'}
              disabled={true}
              label={'Transfer Amount'}
              placeholder={'Amount'}
              value={voucherItem?.to_amount}

              error={errors?.transferAmount?.message}
              register={register("transferAmount", {
                required: 'Please enter transfer amount',
                onChange: e => setTransferAmount(e.target.value)
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
          <InputField
              size={'small'}
              label={'To Account'}
              disabled={true}
              value={voucherItem?.to_account?.name}

              placeholder={'To Account'}
              register={register("to_account")}
            />
          </Grid>


          
        </Grid>
      </Box>

    </Box>
  );
}

export default FundTransferVoucherDetail;