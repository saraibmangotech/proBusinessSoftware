import React, { Fragment, useEffect, useState } from "react";
import { Box, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, Paper, Radio, RadioGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import SystemServices from "services/System";
import BankServices from "services/Bank";
import FinanceServices from "services/Finance";
import DatePicker from "components/DatePicker";
import { numberRegex } from "utils";
import { Add, Delete } from "@mui/icons-material";
import styled from "@emotion/styled";
import SimpleDialog from "components/Dialog/SimpleDialog";
import { useSelector } from "react-redux";
import { useAuth } from "context/UseContext";

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    border: 0,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    background: Colors.primary,
    color: Colors.white
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    textAlign: 'center',
    textWrap: 'nowrap',
    padding: '5px !important',

    '.MuiBox-root': {
      display: 'flex',
      gap: '6px',
      alignItems: 'center',
      justifyContent: 'center',
      '.MuiBox-root': {
        cursor: 'pointer'
      }
    },
    'svg': {
      width: 'auto',
      height: '24px'
    },
    '.MuiTypography-root': {
      textTransform: 'capitalize',
      fontFamily: FontFamily.NunitoRegular,
      textWrap: 'nowrap',
    },
    '.MuiButtonBase-root': {
      padding: '8px',
      width: '28px',
      height: '28px',
    }
  },
}));

function CreateVaultTopUp() {

  const navigate = useNavigate();
  const { user, userLogout } = useAuth();
  const { usdExchangeRate } = useSelector((state) => state.navigationReducer);

  const { register, handleSubmit, formState: { errors }, setValue, getValues, resetField } = useForm();
  const { register: register2, handleSubmit: handleSubmit2 } = useForm();
  const [loading, setLoading] = useState(false);

  const [openRateDialog, setOpenRateDialog] = useState(false);

  // *For Payment Method
  const [paymentMethod, setPaymentMethod] = useState('bank');

  // *For Bank Account
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);

  // *For Cashier Account
  const [cashierAccounts, setCashierAccounts] = useState([]);
  const [selectedCashierAccount, setSelectedCashierAccount] = useState(null);

  // *For Vault Customer
  const [vaultCustomers, setVaultCustomers] = useState([]);
  const [selectedVaultCustomer, setSelectedVaultCustomer] = useState(null);

  // *For Customer Vault Accounts
  const [vaultAccounts, setVaultAccounts] = useState([]);
  const [selectedVaultAccount, setSelectedVaultAccount] = useState(null);

  // *For Handle Date
  const [vaultDate, setVaultDate] = useState(new Date());

  // *For Vault Unit
  const [vaultUnit, setVaultUnit] = useState();

  const [accountList, setAccountList] = useState([]);

  const [fcyAed, setFcyAed] = useState(0);
  const [fcyUsd, setFcyUsd] = useState(0);

  // *For Currency
  const [exchangeRateAed, setExchangeRateAed] = useState();
  const [exchangeRateUsd, setExchangeRateUsd] = useState();

  const [exchangeLoss, setExchangeLoss] = useState(0);

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

  // *For Get Currencies
  const getCurrencies = async () => {
    try {
      let params = {
        detailed: true
      }
      const { data } = await SystemServices.getCurrencies(params)
      setExchangeRateAed(parseFloat(data?.currencies.find(e => e.currency === 'aed')?.conversion_rate))
      setExchangeRateUsd(parseFloat(data?.currencies.find(e => e.currency === 'usd')?.conversion_rate))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Banks
  const getBanks = async () => {
    try {
      let params = {
        page: 1,
        limit: 999999
      }
      const { data } = await BankServices.getBanks(params)
      const bankArray = []
      data?.banks?.rows.filter(e => e.currency !== 'cad').forEach(e => {
        let obj = {
          ...e,
          name: e?.name + ' ' + e?.currency.toUpperCase()
        }
        bankArray.push(obj)
      })
      setBankAccounts(bankArray)
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
      const { data } = await FinanceServices.getPaymentAccounts(params)
      setCashierAccounts(data?.cashierAccounts?.rows.filter(e => e.currency !== 'cad'))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Vault Customers
  const getVaultCustomers = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        name: search
      }
      const { data } = await FinanceServices.getVaultCustomers(params)
      setVaultCustomers(data?.customers?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Select Customer
  const handleSelectCustomer = (data) => {
    setSelectedVaultCustomer(data)
    setVaultAccounts(data?.accounts)
    console.log(data?.accounts);
  }

  // *For Handle Select Customer Account 
  const handleSelectAccount = (data) => {
    setSelectedVaultAccount(data)
    console.log(data);
    const debit = data?.total_dr_cur ? data?.total_dr_cur : 0
    const credit = data?.total_cr_cur ? data?.total_cr_cur : 0

    const balance = data?.nature === 'credit' ? parseFloat(credit) - parseFloat(debit) : parseFloat(debit) - parseFloat(credit)
    console.log(balance, 'balance');
    setValue('vaultBalance', parseFloat(balance).toFixed(2))
    setVaultUnit(data?.unit)
  }

  // *For Handle Add Received Detail
  const handleAddReceivedDetail = () => {
    const price = getValues('price')
    if (!price) {
      return
    }
    const shallowCopy = [...accountList]
    if (paymentMethod === 'bank') {
      const exRate = selectedBankAccount?.currency === 'aed' ? exchangeRateAed : exchangeRateUsd
      let obj = {
        id: selectedBankAccount?.id,
        name: selectedBankAccount?.name,
        fcy_amount: price,
        ex_rate: exRate,
        lcy_amount: price * exRate,
        currency: selectedBankAccount?.currency,
        account_id: vaultUnit === 'Vehicle' ? selectedBankAccount?.guc_account_id : selectedBankAccount?.gwc_account_id
      }
      shallowCopy.push(obj)
      if (selectedBankAccount?.currency === 'aed') {
        let totalFcyAed = fcyAed
        totalFcyAed += parseFloat(price)
        setFcyAed(totalFcyAed)
      } else {
        let totalFcyUsd = fcyUsd
        totalFcyUsd += parseFloat(price)
        setFcyUsd(totalFcyUsd)
        const totalExchangeLoss = (totalFcyUsd * usdExchangeRate) - totalFcyUsd * exRate
        setExchangeLoss(totalExchangeLoss)
      }
      setSelectedBankAccount(null)
    } else {
      const exRate = selectedCashierAccount?.currency === 'aed' ? exchangeRateAed : exchangeRateUsd
      let obj = {
        id: selectedCashierAccount?.id,
        name: selectedCashierAccount?.name,
        fcy_amount: price,
        ex_rate: exRate,
        lcy_amount: price * exRate,
        currency: selectedCashierAccount?.currency,
        account_id: selectedCashierAccount?.id
      }
      shallowCopy.push(obj)
      if (selectedCashierAccount?.currency === 'aed') {
        let totalFcyAed = fcyAed
        totalFcyAed += parseFloat(price)
        setFcyAed(totalFcyAed)
      } else {
        let totalFcyUsd = fcyUsd
        totalFcyUsd += parseFloat(price)
        setFcyUsd(totalFcyUsd)
        const totalExchangeLoss = (totalFcyUsd * usdExchangeRate) - totalFcyUsd * exRate
        setExchangeLoss(totalExchangeLoss)
      }
      setSelectedCashierAccount(null)
    }
    setAccountList(shallowCopy)
    resetField('price')
  }

  const handleDelete = (index, amount, currency) => {
    const shallowCopy = [...accountList]
    shallowCopy.splice(index, 1)

    if (currency === 'aed') {
      let totalFcyAed = fcyAed
      totalFcyAed -= parseFloat(amount)
      setFcyAed(totalFcyAed)
    } else {
      let totalFcyUsd = fcyUsd
      totalFcyUsd -= parseFloat(amount)
      setFcyUsd(totalFcyUsd)
    }

    setAccountList(shallowCopy)
    resetField('price')
  }

  // *For Create Vault Top Up
  const createVaultTopUp = async (formData) => {
    setLoading(true)
    try {
      const accDetail = []
      accountList.forEach(e => {
        let obj = {
          fcy_amount: e?.fcy_amount,
          ex_rate: e?.ex_rate,
          lcy_amount: e?.lcy_amount,
          currency: e?.currency,
          account_id: e?.account_id
        }
        if (paymentMethod === 'bank') {
          obj.bank_id = e?.id
          obj.bank_name = e?.name
        }
        accDetail.push(obj)
      })
      const totalAmountAed = (fcyAed * exchangeRateAed) + (fcyUsd * exchangeRateUsd)
      const totalAmountUsd = ((fcyAed * exchangeRateAed) + (fcyUsd * exchangeRateUsd)) / exchangeRateUsd
      let obj = {
        receiver_id: selectedVaultCustomer?.id,
        customer_phone: selectedVaultCustomer?.uae_phone,
        receiver_vault: selectedVaultAccount?.id,
        account_name: selectedVaultAccount?.name,
        remarks: formData?.remark,
        received_by: getValues('receivedBy'),
        total_amount_aed: totalAmountAed,
        total_amount_usd: totalAmountUsd,
        payment_medium: paymentMethod,
        created_at: vaultDate,
        unit: vaultUnit,
        ex_loss: exchangeLoss,
        details: accDetail
      }
      const { message } = await FinanceServices.createVaultTopUp(obj)
      SuccessToaster(message)
      navigate('/vault-top-up')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  // *For Update Exchange Rate
  const updateExchangeRate = (formData) => {
    try {
      setExchangeRateUsd(formData?.rate)
      setOpenRateDialog(false)
      const accountUpdatedRate = []
      accountList.forEach(element => {
        const newExchangeRate = element?.currency === 'aed' ? element?.ex_rate : formData?.rate
        let obj = {
          ...element,
          ex_rate: newExchangeRate,
          lcy_amount: element?.fcy_amount * newExchangeRate,
        }
        accountUpdatedRate.push(obj)
      });
      setAccountList(accountUpdatedRate)
      const totalExchangeLoss = (fcyUsd * usdExchangeRate) - fcyUsd * formData?.rate
      setExchangeLoss(totalExchangeLoss)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  useEffect(() => {
    getBanks()
    getPaymentAccounts()
    getVaultCustomers()
    getCurrencies()
    setValue('receivedBy',user?.name)
  }, []);

  useEffect(() => {
    setSelectedBankAccount(null)
    setSelectedCashierAccount(null)
    setAccountList([])
    setFcyAed(0)
    setFcyUsd(0)
  }, [paymentMethod]);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <SimpleDialog open={openRateDialog} onClose={() => setOpenRateDialog(false)} title={'Update Exchange Rate'}>
        <Box component="form" onSubmit={handleSubmit2(updateExchangeRate)} >
          <Grid container spacing={0}>
            <Grid item xs={12} sm={12}>
              <InputField
                size={'small'}
                label={'Exchange Rate'}
                placeholder={'Exchange Rate'}
                defaultValue={exchangeRateUsd}
                register={register2("rate", {
                  required: 'Please enter make.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
              <PrimaryButton
                title="Save"
                type='submit'
              />
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>

      <Box component="form" onSubmit={handleSubmit(createVaultTopUp)} >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
              Wallet Top UP
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              size={'small'}
              label={'Date'}
              value={vaultDate}
              onChange={(date) => handleVaultDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
              Payment Method
            </Typography>
            <FormControl>
              <RadioGroup row value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <FormControlLabel value="cash" control={<Radio />} label="Cash" />
                <FormControlLabel value="bank" control={<Radio />} label="Bank" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
              size={'small'}
              onSearch={(v) => getVaultCustomers(v)}
              label={'Received From'}
              options={vaultCustomers}
              selected={selectedVaultCustomer}
              onSelect={(value) => handleSelectCustomer(value)}
              error={errors?.customer?.message}
              register={register("customer", {
                required: 'Please select customer.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
              disabled={vaultAccounts?.length > 0 ? false : true}
              size={'small'}
              label={'Wallet Account'}
              options={vaultAccounts}
              selected={selectedVaultAccount}
              onSelect={(value) => handleSelectAccount(value)}
              error={errors?.vaultAccount?.message}
              register={register("vaultAccount", {
                required: 'Please select wallet account.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              size={'small'}
              label={'Available Balance (USD)'}
              placeholder={'Wallet Balance(USD)'}
              register={register("vaultBalance")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              size={'small'}
              label={'Remark'}
              placeholder={'Remark'}
              register={register("remark")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              size={'small'}
              disabled={true}
              label={'Received By'}
              placeholder={'Received By'}
              error={errors?.receivedBy?.message}
              register={register("receivedBy", {
                required: 'please enter receiver name'
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
          </Grid>
          {selectedVaultAccount &&
            <Fragment>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle1">{paymentMethod === 'bank' ? 'Bank' : 'Cashier'} A/c</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ width: '250px' }}>
                    {paymentMethod === 'bank' &&
                      <SelectField
                        size={'small'}
                        options={bankAccounts}
                        selected={selectedBankAccount}
                        onSelect={(value) => setSelectedBankAccount(value)}
                        register={register("bank")}
                      />
                    }
                    {paymentMethod === 'cash' &&
                      <SelectField
                        size={'small'}
                        onSearch={(v) => getPaymentAccounts(v)}
                        options={cashierAccounts.filter(e => e?.unit === vaultUnit)}
                        selected={selectedCashierAccount}
                        onSelect={(value) => setSelectedCashierAccount(value)}
                        register={register("cash")}
                      />
                    }
                  </Box>
                  <Box sx={{ width: '150px' }}>
                    <InputField
                      size={'small'}
                      placeholder={'Amount'}
                      register={register("price", {
                        pattern: numberRegex,
                      })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{paymentMethod == 'cash' ? selectedCashierAccount?.currency == 'usd' ? "USD" : "AED" : paymentMethod == 'bank' ? selectedBankAccount?.currency == 'usd' ? "USD" : "AED" : ''}</InputAdornment>,
                      }}
                    />
                  </Box>
                  <Box sx={{ width: '50px' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleAddReceivedDetail()}
                      sx={{
                        bgcolor: Colors.primary,
                        color: Colors.white,
                        '&:hover': {
                          bgcolor: Colors.primary,
                          color: Colors.white
                        }
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Box>
                {accountList?.length > 0 &&
                  <Box>
                    <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <Cell>{paymentMethod === 'bank' ? 'Bank' : 'Cashier'} A/C</Cell>
                            <Cell>Amount</Cell>
                            <Cell>Status</Cell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {accountList.map((item, index) => (
                            <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                              <Cell>
                                {item?.name ?? '-'}
                              </Cell>
                              <Cell>
                                {item?.fcy_amount ?? '-'}
                              </Cell>
                              <Cell>
                                <Box sx={{ gap: '16px !important' }}>
                                  <Box onClick={() => handleDelete(index, item?.fcy_amount, item?.currency)}>
                                    <IconButton sx={{ bgcolor: Colors.danger, '&:hover': { bgcolor: Colors.danger } }}>
                                      <Delete sx={{ color: Colors.white, height: '16px !important' }} />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </Cell>
                            </Row>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                }
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle1">Exchange Loss</Typography>
                  </Box>
                  <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <Cell>GWS Rate</Cell>
                          <Cell>Ex. Loss</Cell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <Row>
                          <Cell>
                            {parseFloat(exchangeRateAed)?.toFixed(2)}
                          </Cell>
                          <Cell>
                            {'-'}
                          </Cell>
                        </Row>
                        <Row>
                          <Cell>
                            {parseFloat(usdExchangeRate)?.toFixed(2)}
                          </Cell>
                          <Cell>
                            {(fcyUsd * usdExchangeRate) - fcyUsd * exchangeRateUsd}
                          </Cell>
                        </Row>
                        <Row>
                          <Cell>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              Ex. Loss
                            </Typography>
                          </Cell>
                          <Cell>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              {(fcyUsd * usdExchangeRate) - fcyUsd * exchangeRateUsd}
                            </Typography>
                          </Cell>
                        </Row>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle1">Amount Received</Typography>
                    </Box>
                    <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <Cell>AED</Cell>
                            <Cell>Rate</Cell>
                            <Cell>USD</Cell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <Row>
                            <Cell>
                              {((fcyAed * exchangeRateAed) + (fcyUsd * exchangeRateUsd))?.toFixed(2)}
                            </Cell>
                            <Cell sx={{ cursor: 'pointer' }} onClick={() => setOpenRateDialog(true)}>
                              <Box sx={{ textAlign: 'center', p: 1, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                                {parseFloat(exchangeRateUsd)?.toFixed(3)}
                              </Box>
                            </Cell>
                            <Cell>
                              {(((fcyAed * exchangeRateAed) + (fcyUsd * exchangeRateUsd)) / exchangeRateUsd)?.toFixed(2)}
                            </Cell>
                          </Row>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle1">Received Currency Detail</Typography>
                  </Box>
                  <Box>
                    <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <Cell>Currency</Cell>
                            <Cell>FCY Amt</Cell>
                            <Cell>Ex.Rate</Cell>
                            <Cell>LCY</Cell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <Row>
                            <Cell>
                              AED
                            </Cell>
                            <Cell>
                              {fcyAed?.toFixed(2)}
                            </Cell>
                            <Cell>
                              {exchangeRateAed?.toFixed(2)}
                            </Cell>
                            <Cell>
                              {(fcyAed * exchangeRateAed)?.toFixed(2)}
                            </Cell>
                          </Row>
                          <Row>
                            <Cell>
                              USD
                            </Cell>
                            <Cell>
                              {fcyUsd?.toFixed(2)}
                            </Cell>
                            <Cell>
                              {parseFloat(exchangeRateUsd)?.toFixed(2)}
                            </Cell>
                            <Cell>
                              {(fcyUsd * exchangeRateUsd)?.toFixed(2)}
                            </Cell>
                          </Row>
                          <Row>
                            <Cell colspan={2}>
                              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                Total in AED
                              </Typography>
                            </Cell>
                            <Cell colspan={2}>
                              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                {((fcyAed * exchangeRateAed) + (fcyUsd * exchangeRateUsd))?.toFixed(2)}
                              </Typography>
                            </Cell>
                          </Row>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              </Grid>
            </Fragment>
          }
          <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
            <PrimaryButton
              title="Submit"
              type='submit'
              loading={loading}
            />
          </Grid>
        </Grid>
      </Box>

    </Box>
  );
}

export default CreateVaultTopUp;