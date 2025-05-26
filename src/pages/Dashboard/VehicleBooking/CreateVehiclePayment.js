import React, { Fragment, useEffect, useState } from 'react';
import { Box, Checkbox, Grid, Paper, FormControl, FormControlLabel, Table, Radio, RadioGroup, InputLabel, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, Tooltip } from '@mui/material';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, FontFamily, PendingIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import Pagination from 'components/Pagination';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { Debounce } from 'utils';
import VehiclePaymentServices from 'services/VehiclePayment';
import SelectField from 'components/Select';
import CustomerServices from 'services/Customer';
import CurrencyServices from 'services/Currency';
import FinanceServices from 'services/Finance';
import BankServices from 'services/Bank';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import { useAuth } from 'context/UseContext';
import { useSelector } from "react-redux";

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

function CreateVehiclePayment() {

  const navigate = useNavigate();
  const { user } = useAuth();
  const { usdExchangeRate, cadExchangeRate } = useSelector((state) => state.navigationReducer);

  const tableHead = ['Select', 'Date', 'Invoice ID', 'Name', 'VIN', 'Currency', 'Value', 'Other Charges', 'Total Amount', 'Paid', 'Balance', 'Payment Status', 'Receiving']

  const { register, formState: { errors }, handleSubmit, setValue } = useForm();
  const { register: register2 } = useForm();
  const { register: register3, handleSubmit: handleSubmit3 } = useForm();
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  // *For Customer Booking
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // *For Invoice List
  const [invoiceList, setInvoiceList] = useState();
  const [selectedInvoice, setSelectedInvoice] = useState([]);
  const [exchangeRate, setExchangeRate] = useState();
  const [totalAmount, setTotalAmount] = useState(0);
  const [aedTotalAmount, setAedTotalAmount] = useState(0);
  const [exchangeLoss, setExchangeLoss] = useState(0);

  // *For Currencies
  const [currencies, setCurrencies] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentType, setPaymentType] = useState('aed');

  // *For Bank Account
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);

  // *For Cashier Account
  const [cashierAccounts, setCashierAccounts] = useState([]);
  const [selectedCashierAccount, setSelectedCashierAccount] = useState(null);

  // *For Vault Account
  const [vaultAccounts, setVaultAccounts] = useState([]);
  const [selectedVaultAccount, setSelectedVaultAccount] = useState(null);
  const [vaultBalance, setVaultBalance] = useState();

  // *For Tooltip
  const [copied, setCopied] = useState(false);

  const copyContent = (text) => {
    const contentToCopy = text;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 999999);
  }

  // *For Vault Low Balance 
  const [lowBalanceError, setLowBalanceError] = useState(false);

  const [openRateDialog, setOpenRateDialog] = useState(false);

  // *For Get Currencies
  const getCurrencies = async () => {
    try {
      let params = {
        detailed: true
      }
      const { data } = await CurrencyServices.getCurrencies(params)
      setCurrencies(data?.currencies)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Customer Booking
  const getCustomerBooking = async (search) => {
    try {
      let params = {
        name: search ?? ''
      }
      const { data } = await CustomerServices.getCustomerBooking(params)
      setCustomers(data?.customers)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Invoice List
  const getInvoiceList = async (page, limit, filter) => {
    setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = { ...filters, ...filter }
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      let params = {
        page: Page,
        limit: Limit,
        unpaid: true
      }
      params = { ...params, ...Filter }
      const { data: { approvals } } = await VehiclePaymentServices.getInvoiceList(params)
      setInvoiceList(approvals?.rows)
      setTotalCount(approvals?.count)
      setSelectedInvoice([])
      if (filter?.customer_id) {
        getVaultCustomers(filter?.customer_id)
      }
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Select and DeSelect Invoice
  const handleSelectInvoice = (data) => {
    getVaultCustomers(data?.customer_id)

    try {
      const shallowCopy = [...selectedInvoice]
      const currentIndex = selectedInvoice.findIndex(e => e.invoiceId === data?.id)
      const rate = parseFloat(currencies.find(e => e.currency === data?.booking?.currency)?.conversion_rate)
      if (currentIndex === -1) {
        console.log(data);
        let obj = {
          customerId: data?.customer_id,
          customerName: data?.booking?.customer?.name,
          customerPhone: data?.booking?.customer?.uae_phone,
          invoiceId: data?.id,
          bookingId: data?.booking_id,
          amount: data?.amount,
          exchangeRate: rate,
          currency: data?.booking?.currency,
          vin: data?.booking?.vin,
          lot_number: data?.booking?.lot_number,
          color: data?.booking?.color,
          make: data?.booking?.veh_make?.name,
          model: data?.booking?.veh_model?.name,
          receiveAmount: 0
        }
        shallowCopy.push(obj)
      } else {
        shallowCopy.splice(currentIndex, 1);
      }
      setSelectedInvoice(shallowCopy)
      if (!exchangeRate) {
        setExchangeRate(parseFloat(currencies.find(e => e.currency === shallowCopy[0]?.currency)?.conversion_rate))
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Receive Amount
  const handleReceive = (value, id, balance) => {
    try {
      const shallowCopy = [...selectedInvoice]
      const currentIndex = selectedInvoice.findIndex(e => e.invoiceId === id)
      if (parseFloat(value) > parseFloat(balance)) {
        shallowCopy[currentIndex].receiveAmount = parseFloat(balance)
        setValue(`receiving${id}`, parseFloat(balance).toFixed(2))
      } else {
        shallowCopy[currentIndex].receiveAmount = value
      }
      setSelectedInvoice(shallowCopy)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Payment Accounts
  const getPaymentAccounts = async () => {
    try {
      let params = {
        page: 1,
        limit: 999999
      }
      const { data } = await FinanceServices.getPaymentAccounts(params)
      // *Filter only vehicle account
      const vehicleAcc = data?.cashierAccounts?.rows?.filter(e => e.unit === 'Vehicle')
      // *1003 is the cashier role ID if the login user is a cashier then show only their account
      if (user?.role_id === 1003) {
        const userId = user?.ref_id.split('-')[1]
        const filterCashier = vehicleAcc?.filter(e => e.user_id == userId)
        setCashierAccounts(filterCashier)
        // *Select Default AED cashier account
        const cashierDetail = filterCashier.find(e => e.currency === paymentType)
        setValue('cash', cashierDetail?.name)
        setSelectedCashierAccount(cashierDetail)
      } else {
        setCashierAccounts(vehicleAcc)
        // *Select Default AED cashier account
        const cashierDetail = vehicleAcc.find(e => e.currency === paymentType)
        setValue('cash', cashierDetail?.name)
        setSelectedCashierAccount(cashierDetail)
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
        limit: 999999
      }
      const { data } = await BankServices.getBanks(params)
      setBankAccounts(data?.banks?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Vault Customers
  const getVaultCustomers = async (id) => {
    try {
      let params = {
        page: 1,
        limit: 999999,
        customer_id: id
      }
      const { data } = await FinanceServices.getVaultCustomers(params)
      console.log(data, 'setVaultAccounts');
      if (data?.customers?.rows[0]?.accounts?.length > 0) {
        const filterData = data?.customers?.rows[0]?.accounts?.filter(e => e.unit === 'Vehicle')
        setVaultAccounts(filterData)

      }
      else {
        setVaultAccounts([])
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Select Vault Detail
  const handleSelectVault = (data) => {
    console.log(data, 'asaasas');
    setSelectedVaultAccount(data)
    const debit = data?.total_dr_cur ? data?.total_dr_cur : 0
    const credit = data?.total_cr_cur ? data?.total_cr_cur : 0
    const balance = data?.nature === 'credit' ? parseFloat(credit) - parseFloat(debit) : parseFloat(debit) - parseFloat(credit)
    setValue('vaultBalance', parseFloat(balance).toFixed(2))
    setVaultBalance(balance)
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getInvoiceList(1, '', data));
  }

  // *For Receive Payment
  const receivePayment = async (formData) => {
    setLoading(true)
    try {
      const payments = []
      const vins = []
      console.log(selectedInvoice, 'selectedInvoiceselectedInvoice');
      selectedInvoice.forEach(e => {
        const exRateDefault = e?.currency === 'usd' ? usdExchangeRate : cadExchangeRate
        let pay = {
          invoice_id: e.invoiceId,
          booking_id: e.bookingId,
          amount: e.receiveAmount,
          amount_aed: e.receiveAmount * e.exchangeRate,
          make_name: e.make,
          model_name: e.model,
          color: e.color,
          vin: e.vin,
          lot_number: e.lot_number,
          exchange_loss: (e.receiveAmount * exRateDefault) - (e.receiveAmount * e.exchangeRate),
        }
        payments.push(pay)
      })
      selectedInvoice.forEach(e => {

        let vin = {
          vin: e.vin,

        }
        vins.push(vin)
      })

      let obj = {
        customer_id: selectedInvoice[0]?.customerId,
        currency: selectedInvoice[0]?.currency,
        exchange_rate: exchangeRate,
        exchange_loss: exchangeLoss,
        amount: totalAmount,
        amount_aed: aedTotalAmount,
        payment_medium: selectedPaymentMethod?.id,
        payments: payments,
        vins: vins,
        comments: formData?.comment,
        customer_name: selectedInvoice[0]?.customerName,
        customer_phone: selectedInvoice[0]?.customerPhone
      }
      if (selectedPaymentMethod?.id === 'bank') {
        obj.bank_id = selectedBankAccount?.id
        obj.bank_name = selectedBankAccount?.name
        obj.payment_account = selectedBankAccount?.guc_account_id
      }
      if (selectedPaymentMethod?.id === 'cash') {
        obj.payment_account = selectedCashierAccount?.id
        obj.account_name = selectedCashierAccount?.name
      }
      if (selectedPaymentMethod?.id === 'vault') {
        obj.payment_account = selectedVaultAccount?.id
        obj.account_name = selectedVaultAccount?.name
      }
      const { message } = await VehiclePaymentServices.createVehiclePayment(obj)
      SuccessToaster(message)
      navigate('/invoice-list')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  // *For Update Exchange Rate
  const updateExchangeRate = (formData) => {
    try {
      setExchangeRate(formData?.rate)
      setOpenRateDialog(false)
      const updateInvoice = []
      selectedInvoice.forEach(element => {
        const newExchangeRate = element?.currency === 'aed' ? element?.ex_rate : formData?.rate
        let obj = {
          ...element,
          exchangeRate: newExchangeRate,
        }
        updateInvoice.push(obj)
      });
      setSelectedInvoice(updateInvoice)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  useEffect(() => {
    if (selectedInvoice.length > 0) {
      const exRateDefault = selectedInvoice[0]?.currency === 'usd' ? usdExchangeRate : cadExchangeRate
      let totalAmount = 0.00
      selectedInvoice.forEach(e => {
        if (e?.receiveAmount) {
          totalAmount += parseFloat(e?.receiveAmount)
        }
      })
      const totalAed = totalAmount * exchangeRate
      const totalExchangeLoss = (totalAmount * exRateDefault) - totalAed
      setTotalAmount(totalAmount)
      setAedTotalAmount(totalAed)
      setExchangeLoss(totalExchangeLoss)
    }
  }, [selectedInvoice]);

  useEffect(() => {
    if (selectedPaymentMethod?.id === 'vault' && vaultBalance < totalAmount) {
      setLowBalanceError(true)
    }
    if (selectedPaymentMethod?.id === 'vault' && vaultAccounts?.length > 0) {
      console.log(vaultAccounts.find(item => item?.primary_series == 50004));

      handleSelectVault(vaultAccounts.find(item => item?.primary_series == 50004))
      setValue('vault', vaultAccounts.find(item => item?.primary_series == 50004)?.name)
    }
  }, [vaultBalance, selectedPaymentMethod]);

  useEffect(() => {
    if (paymentType) {
      const cashierDetail = cashierAccounts.find(e => e.currency === paymentType)
      setValue('cash', cashierDetail?.name)
      setSelectedCashierAccount(cashierDetail)
    }
  }, [paymentType]);

  useEffect(() => {
    getCurrencies()
    getCustomerBooking()
    getPaymentAccounts()
    getBanks()
  }, []);

  return (
    <Box sx={{ m: 4 }}>

      <SimpleDialog open={openRateDialog} onClose={() => setOpenRateDialog(false)} title={'Update Exchange Rate'}>
        <Box component="form" onSubmit={handleSubmit3(updateExchangeRate)} >
          <Grid container spacing={0}>
            <Grid item xs={12} sm={12}>
              <InputField
                size={'small'}
                label={'Exchange Rate'}
                placeholder={'Exchange Rate'}
                defaultValue={exchangeRate}
                register={register3("rate", {
                  required: 'Please enter rate.',
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

      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        Pay Vehicles
      </Typography>

      {/* Filters */}
      <Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px' }} >
        <Grid container spacing={1}>
          <Grid item xs={12} sm={3}>
            <SelectField
              size={'small'}
              onSearch={(v) => getCustomerBooking(v)}
              label={'Select Customer'}
              options={customers}
              selected={selectedCustomer}
              onSelect={(value) => { setSelectedCustomer(value); getInvoiceList(1, '', { customer_id: value?.id }) }}
              register={register2("customer")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              size={'small'}
              label={'VIN'}
              placeholder={'VIN'}
              register={register2('vin', {
                onChange: (e) => handleFilter({ vins: e.target.value })
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              size={'small'}
              label={'Lot'}
              placeholder={'Lot'}
              register={register2('lot', {
                onChange: (e) => handleFilter({ lots: e.target.value })
              })}
            />
          </Grid>
        </Grid>

        {invoiceList &&
          <Fragment>

            {/* ========== Table ========== */}
            <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 100px)' }}>
              <Table stickyHeader sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow>
                    {tableHead.map((item, index) => (
                      <Cell key={index}>{item}</Cell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceList?.length > 0 ? (
                    <Fragment>
                      {invoiceList.map((item, index) => (
                        <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                          <Cell>
                            <Checkbox
                              disabled={selectedInvoice.length > 0 && selectedInvoice.findIndex(e => e.currency === item?.booking?.currency && e.customerId === item?.customer_id) === -1}
                              checked={selectedInvoice.findIndex(e => e.invoiceId === item?.id) !== -1}
                              onChange={() => handleSelectInvoice(item)}
                            />
                          </Cell>
                          <Cell>
                            {moment(item?.created_at).format('DD-MMM-YYYY')}
                          </Cell>
                          <Cell>
                            {item?.id ?? '-'}
                          </Cell>
                          <Cell>
                            <Tooltip
                              title={item?.booking?.customer?.name ?? '-'}
                              arrow
                              placement="top"
                              slotProps={{
                                popper: {
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: {
                                        offset: [10, -2],
                                      },
                                    },
                                  ],
                                },
                              }}
                            >
                              {item?.booking?.customer?.name?.length > 15 ? item?.booking?.customer?.name?.slice(0, 10) + "..." : item?.booking?.customer?.name}
                            </Tooltip>
                          </Cell>
                          <Cell>
                            <Tooltip
                              title={item?.booking?.vin ?? '-'}
                              arrow
                              placement="top"
                              slotProps={{
                                popper: {
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: {
                                        offset: [10, -2],
                                      },
                                    },
                                  ],
                                },
                              }}
                            >
                              {item?.booking?.vin?.length > 15 ? item?.booking?.vin?.slice(0, 10) + "..." : item?.booking?.vin}
                            </Tooltip>
                          </Cell>
                          <Cell>
                            {item?.booking?.currency ?? '-'}
                          </Cell>
                          <Cell>
                            {parseFloat(item?.booking?.value).toFixed(2) ?? '-'}
                          </Cell>
                          <Cell>
                            {parseFloat(item?.booking?.other_charges).toFixed(2) ?? '-'}
                          </Cell>
                          <Cell>
                            {parseFloat(item?.amount).toFixed(2) ?? '-'}
                          </Cell>
                          <Cell>
                            {parseFloat(item?.paid).toFixed(2) ?? '-'}
                          </Cell>
                          <Cell>
                            {parseFloat(item?.balance).toFixed(2) ?? '-'}
                          </Cell>
                          <Cell>
                            <Box sx={{ 'path': { fill: item?.paid !== item?.amount && item?.paid !== '0.000' && Colors.bluishCyan } }}>
                              {item?.paid === item?.amount ? <CheckIcon /> : item?.paid === '0.000' ? <PendingIcon /> : <CheckIcon />}
                              <Typography variant="body2">
                                {item?.paid === item?.amount ? 'Paid' : item?.paid === '0.000' ? 'UnPaid' : 'Partial Paid'}
                              </Typography>
                            </Box>
                          </Cell>
                          <Cell>
                            <Box sx={{ width: '150px' }}>
                              <InputField
                                disabled={selectedInvoice.findIndex(e => e.invoiceId === item?.id) === -1}
                                size={'small'}
                                type={'number'}
                                placeholder={'Receiving'}
                                InputProps={{ inputProps: { min: 0 } }}
                                error={errors[`receiving${item?.id}`]?.message}
                                register={register(`receiving${item?.id}`, {
                                  required: selectedInvoice.findIndex(e => e.invoiceId === item?.id) === -1 ? false : 'please enter receive amount',
                                  onChange: (e) => handleReceive(e.target.value, item?.id, item?.balance),
                                })}
                              />
                            </Box>
                          </Cell>
                        </Row>
                      ))}
                    </Fragment>
                  ) : (
                    <Row>
                      <Cell colSpan={tableHead.length + 1} align="center" sx={{ fontWeight: 600 }}>
                        No Data Found
                      </Cell>
                    </Row>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* ========== Pagination ========== */}
            <Pagination
              currentPage={currentPage}
              pageSize={pageLimit}
              onPageSizeChange={(size) => getInvoiceList(1, size.target.value)}
              tableCount={invoiceList?.length}
              totalCount={totalCount}
              onPageChange={(page) => getInvoiceList(page, '')}
            />

            <Box sx={{ my: 4, py: 2, bgcolor: Colors.whiteSmoke }}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={2.5}>
                  <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>
                      Total
                    </Typography>
                    <Box sx={{ textAlign: 'center', p: 1, width: '130px', bgcolor: Colors.flashWhite, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                      <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                        {totalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3.5}>
                  <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>
                      Exchange Rate to AED
                    </Typography>
                    <Box sx={{ textAlign: 'center', p: 1, width: '130px', bgcolor: Colors.white, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                      <Typography variant="body2" onClick={() => setOpenRateDialog(true)} sx={{ cursor: 'pointer', color: Colors.smokeyGrey }}>
                        {exchangeRate ? parseFloat(exchangeRate)?.toFixed(3) : 0}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2.5}>
                  <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>
                      Total AED
                    </Typography>
                    <Box sx={{ textAlign: 'center', p: 1, width: '130px', bgcolor: Colors.flashWhite, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                      <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                        {aedTotalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3.5}>
                  <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>
                      Exchange Loss/Gain
                    </Typography>
                    <Box sx={{ textAlign: 'center', p: 1, width: '130px', bgcolor: Colors.flashWhite, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                      <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                        {exchangeLoss.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {<Box component={'form'} sx={{ my: 4 }} onSubmit={handleSubmit(receivePayment)}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={3}>
                  <SelectField
                    size={'small'}
                    label={'Payment Method'}
                    options={[
                      {
                        "id": "cash",
                        "name": "Cash"
                      },
                      {
                        "id": "bank",
                        "name": "Bank"
                      },
                      {
                        "id": "vault",
                        "name": "Vault"
                      }
                    ]}
                    selected={selectedPaymentMethod}
                    onSelect={(value) => setSelectedPaymentMethod(value)}
                    error={errors?.paymentMethod?.message}
                    register={register("paymentMethod", {
                      required: 'Please select payment method.',
                    })}
                  />
                </Grid>
                {selectedPaymentMethod?.id === 'cash' &&
                  <Fragment>
                    <Grid item xs={12} sm={3}>
                      <InputLabel>
                        Cash in Hand
                      </InputLabel>
                      <FormControl>
                        <RadioGroup row value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                          <FormControlLabel value="aed" control={<Radio />} label="AED" />
                          <FormControlLabel value="usd" control={<Radio />} label="USD" />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <SelectField
                        disabled={user?.role_id === 1003 ? true : false}
                        size={'small'}
                        label={'Cashier Account'}
                        options={cashierAccounts}
                        selected={selectedCashierAccount}
                        onSelect={(value) => setSelectedCashierAccount(value)}
                        error={errors?.cash?.message}
                        register={register("cash", {
                          required: selectedPaymentMethod?.id === 'cash' ? 'Please select cash account.' : false,
                        })}
                      />
                    </Grid>
                  </Fragment>
                }
                {selectedPaymentMethod?.id === 'bank' &&
                  <Grid item xs={12} sm={3}>
                    <SelectField
                      size={'small'}
                      label={'Bank Account'}
                      options={bankAccounts}
                      selected={selectedBankAccount}
                      onSelect={(value) => setSelectedBankAccount(value)}
                      error={errors?.bank?.message}
                      register={register("bank", {
                        required: selectedPaymentMethod?.id === 'bank' ? 'Please select bank account.' : false,
                      })}
                    />
                  </Grid>
                }
                {selectedPaymentMethod?.id === 'vault' &&
                  <Fragment>
                    <Grid item xs={12} sm={3}>
                      <SelectField
                        size={'small'}
                        label={'Vault Account'}
                        options={vaultAccounts}
                        selected={selectedVaultAccount}
                        onSelect={(value) => handleSelectVault(value)}
                        error={errors?.vault?.message}
                        register={register("vault", {
                          required: selectedPaymentMethod?.id === 'vault' ? 'Please select vault account.' : false,
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <InputField
                        disabled={true}
                        size={'small'}
                        label={'Vault Balance (USD)'}
                        placeholder={'Vault Balance(USD)'}
                        register={register('vaultBalance')}
                      />
                    </Grid>
                  </Fragment>
                }
                {lowBalanceError &&
                  <Grid item xs={12} sm={12} >
                    <Typography color="error" sx={{ fontSize: 12, textAlign: 'left' }}>
                      Low Balance (please top up your vault account)
                    </Typography>
                  </Grid>
                }
                <Grid item xs={12} sm={12}>
                  <InputField
                    label={'Comment'}
                    multiline={true}
                    rows={2}
                    placeholder={'comment'}
                    register={register('comment')}
                    inputStyle={{ width: '350px' }}
                  />
                </Grid>
                {console.log(selectedInvoice.length > 0)}
                <Grid item xs={12} sm={12} sx={{ textAlign: 'right' }}>
                  <PrimaryButton
                    disabled={selectedInvoice.length > 0 && !lowBalanceError ? false : true}
                    title="Receive Payment"
                    type='submit'
                    loading={loading}
                  />
                </Grid>
              </Grid>
            </Box>
            }

          </Fragment>
        }

        {loader && <CircleLoading />}
      </Box>
    </Box >
  );
}

export default CreateVehiclePayment;