import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CancelOutlined } from '@mui/icons-material';
import { Box, Dialog, Grid, IconButton, InputAdornment, FormControl, FormControlLabel, Radio, RadioGroup, InputLabel } from '@mui/material';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import SelectField from 'components/Select';
import { ErrorToaster } from 'components/Toaster';
import FinanceServices from 'services/Finance';
import BankServices from 'services/Bank';
import { useAuth } from 'context/UseContext';

function RefundFormDialog({ open, onClose, onSubmit, loading, customerId, depositId, depositAmount ,selectedVehicle}) {

  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm()

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

  // *For Get Payment Accounts
  const getPaymentAccounts = async () => {
    try {
      let params = {
        page: 1,
        limit: 1000
      }
      const { data } = await FinanceServices.getPaymentAccounts(params)
      // *Filter only shipping account
      const vehicleAcc = data?.cashierAccounts?.rows?.filter(e => e.unit === 'Shipping')

      // *1003 is the cashier role ID if the login user is a cashier then show only their account
      if (user?.role_id === 1003) {
        const userId = user?.ref_id.split('-')[1]
        const filterCashier = vehicleAcc.filter(e => e.user_id == userId)
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
        limit: 1000
      }
      const { data } = await BankServices.getBanks(params)
      setBankAccounts(data?.banks?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Vault Customers
  const getVaultCustomers = async () => {
    try {
      let params = {
        page: 1,
        limit: 1000,
        customer_id: customerId
      }
      const { data } = await FinanceServices.getVaultCustomers(params)
      const filterData = data?.customers?.rows[0]?.accounts.filter(e => e.unit === 'Shipping')
      setVaultAccounts(filterData)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Select Vault Detail
  const handleSelectVault = (data) => {
    setSelectedVaultAccount(data)
    const debit = data?.total_dr ? data?.total_dr : 0
    const credit = data?.total_cr ? data?.total_cr : 0
    const balance = data?.nature === 'credit' ? parseFloat(credit) - parseFloat(debit) : parseFloat(debit) - parseFloat(credit)
    setValue('vaultBalance', parseFloat(balance).toFixed(2))
  }

  const submitData = (formData) => {
    try {
      let obj = {
        deposit_slip: 'GVD-' + depositId,
        deposit_amount: depositAmount,
        refund_medium: selectedPaymentMethod?.id,
        vehicle_id:selectedVehicle
        
      }
      if (selectedPaymentMethod?.id === 'bank') {
        obj.bank_id = selectedBankAccount?.id
        obj.bank_name = selectedBankAccount?.name
        obj.payment_account_id = selectedBankAccount?.guc_account_id
      }
      if (selectedPaymentMethod?.id === 'cash') {
        obj.payment_account_id = selectedCashierAccount?.id
      }
      if (selectedPaymentMethod?.id === 'vault') {
        obj.payment_account_id = selectedVaultAccount?.id
      }
      onSubmit(obj)
      resetField()
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const resetField = () => {
    reset()
    setSelectedPaymentMethod(null)
  }

  useEffect(() => {
    if (paymentType) {
      const cashierDetail = cashierAccounts.find(e => e.currency === paymentType)
      setValue('cash', cashierDetail?.name)
      setSelectedCashierAccount(cashierDetail)
    }
  }, [paymentType]);

  useEffect(() => {
    getPaymentAccounts()
    getBanks()
    getVaultCustomers()
  }, []);

  return (
    <Dialog
      open={open}
      sx={{ '& .MuiDialog-paper': { width: '30%', height: "auto", borderRadius: 2, py: { xs: 2, md: 4 }, px: { xs: 3, md: 6 } } }}
    >
      <IconButton onClick={() => { onClose(); resetField() }} sx={{ position: 'absolute', right: 13, top: 13 }}>
        <CancelOutlined />
      </IconButton>
      <Box component="form" onSubmit={handleSubmit(submitData)} sx={{ mt: 3 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={12}>
            <InputField
              disabled={true}
              size={'small'}
              label={'Deposit Slip Number'}
              placeholder={'Deposit Slip Number'}
              InputProps={{
                startAdornment: <InputAdornment position="start">GVD-</InputAdornment>,
              }}
              value={depositId}
              register={register("depositSlip")}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <InputField
              disabled={true}
              size={'small'}
              label={'Deposited Amount'}
              placeholder={'Deposited Amount'}
              value={depositAmount}
              register={register("depositAmount")}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <SelectField
              size={'small'}
              label={'Refund Method'}
              options={[
                {
                  "id": "cash",
                  "name": "Cash"
                },
                {
                  "id": "vault",
                  "name": "wallet"
                }
              ]}
              selected={selectedPaymentMethod}
              onSelect={(value) => setSelectedPaymentMethod(value)}
              error={errors?.refundMethod?.message}
              register={register("refundMethod", {
                required: 'Please select refund method.',
              })}
            />
          </Grid>
          {selectedPaymentMethod?.id === 'cash' &&
            <Fragment>
              <Grid item xs={12} sm={12}>
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
              <Grid item xs={12} sm={12}>
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
            <Grid item xs={12} sm={12}>
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
              <Grid item xs={12} sm={12}>
                <SelectField
                  size={'small'}
                  label={'Wallet Account'}
                  options={vaultAccounts}
                  selected={selectedVaultAccount}
                  onSelect={(value) => handleSelectVault(value)}
                  error={errors?.vault?.message}
                  register={register("vault", {
                    required: selectedPaymentMethod?.id === 'vault' ? 'Please select wallet account.' : false,
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <InputField
                  disabled={true}
                  size={'small'}
                  label={'Wallet Balance'}
                  placeholder={'Wallet Balance'}
                  register={register('vaultBalance')}
                />
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
    </Dialog>
  )
}

export default RefundFormDialog