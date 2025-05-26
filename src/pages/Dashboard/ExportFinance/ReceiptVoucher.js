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
import ExportFinanceServices from "services/ExportFinance";
import DatePicker from "components/DatePicker";
import { numberRegex } from "utils";
import { Add, Delete } from "@mui/icons-material";
import styled from "@emotion/styled";
import SimpleDialog from "components/Dialog/SimpleDialog";
import { useSelector } from "react-redux";
import { logDOM } from "@testing-library/react";

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
        backgroundColor: Colors.primary,
        color: Colors.white
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontFamily: FontFamily.NunitoRegular,
        textAlign: 'center',
        textWrap: 'nowrap',

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

function ReceiptVoucher() {

    const navigate = useNavigate();
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

    // *For Major Categories
    const [majorCategories, setMajorCategories] = useState([]);
    const [selectedMajorCategory, setSelectedMajorCategory] = useState(null);


    // *For Sub Categories
    const [subCategories, setSubCategories] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);

    // *For Parent Account
    const [parentAccounts, setParentAccounts] = useState([]);
    const [selectedParentAccount, setSelectedParentAccount] = useState(null);

    // *For Accounts
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);

    // *For Vault Unit
    const [vaultUnit, setVaultUnit] = useState();

    const [accountList, setAccountList] = useState([]);

    const [fcyAed, setFcyAed] = useState(0);
    const [fcyUsd, setFcyUsd] = useState(0);

    // *For Currency
    const [exchangeRateAed, setExchangeRateAed] = useState();
    const [exchangeRateUsd, setExchangeRateUsd] = useState();

    const [exchangeLoss, setExchangeLoss] = useState();

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
            const { data } = await ExportFinanceServices.getBanks(params)
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
            const { data } = await ExportFinanceServices.getPaymentAccounts(params)
            console.log(data?.cashierAccounts?.rows.filter(e => e.currency !== 'cad'));
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
            const { data } = await ExportFinanceServices.getVaultCustomers(params)
            setVaultCustomers(data?.customers?.rows)
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Get Sub Categories
    const getSubCategories = async (id) => {
        try {
            let params = {
                category_id: id ?? ''
            }
            const { data } = await ExportFinanceServices.getSubCategories(params)
            setSubCategories(data?.categories)
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Get Major Categories
    const getMajorCategories = async () => {
        try {
            const { data } = await ExportFinanceServices.getMajorCategories()
            setMajorCategories(data?.categories)
        } catch (error) {
            ErrorToaster(error)
        }
    }
    // *For Get Account By SubCategory
    const getAccountBySubCategory = async (id) => {
        try {
            let params = {
                sub_category: id,
            }
            const { data } = await ExportFinanceServices.getAccountBySubCategory(params)
            setParentAccounts(data?.accounts?.rows)
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Get Account
    const getAccounts = async (search, accountId) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                name: search,
                primary_account_id: accountId ?? selectedParentAccount?.id,
            }
            const { data } = await ExportFinanceServices.getAccounts(params)
            setAccounts(data?.accounts?.rows)
        } catch (error) {
            ErrorToaster(error)
        }
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
            let unit = selectedAccount ? selectedAccount?.unit : selectedParentAccount?.unit
            let obj = {
                id: selectedBankAccount?.id,
                name: selectedBankAccount?.name,
                fcy_amount: price,
                ex_rate: exRate,
                lcy_amount: price * exRate,
                currency: selectedBankAccount?.currency,
                account_id: unit === 'Vehicle' ? selectedBankAccount?.guc_account_id : selectedBankAccount?.gwc_account_id
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
    const ReceiptVoucher = async (formData) => {
        setLoading(true)
        try {
            const accDetail = []

            let obj1 = {
                aed_amount_fcy: accountList[0]?.currency == "aed" ? accountList[0]?.fcy_amount : 0,
                usd_amount_exrate: accountList[0]?.ex_rate,
                aed_amount_lcy: accountList[0]?.currency == "aed" ? accountList[0]?.lcy_amount : 0,
                usd_amount_fcy: accountList[0]?.currency == "usd" ? accountList[0]?.fcy_amount : 0,
                usd_amount_lcy: accountList[0]?.currency == "usd" ? accountList[0]?.lcy_amount : 0,
                currency: accountList[0]?.currency,
                account_id: accountList[0]?.account_id
            }
            if (paymentMethod === 'bank') {
                obj1.bank_id = accountList[0]?.id
                obj1.bank_name = accountList[0]?.name
            }

            accountList.forEach(e => {
                let obj = {
                    fcy_amount: e?.fcy_amount,
                    ex_rate: e?.ex_rate,
                    lcy_amount: e?.lcy_amount,
                    currency: e?.currency,
                    account_id: e?.account_id,
                    ex_loss: exchangeLoss,
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

                customer_id: selectedVaultCustomer?.id,
                receiver_vault: accounts.length > 0 ? selectedAccount?.id : selectedParentAccount?.id,
                remarks: formData?.remark,
                received_by: formData?.receivedBy,
                aed_total: totalAmountAed,
                usd_total: totalAmountUsd,
                payment_medium: paymentMethod,
                created_at: vaultDate,
                unit: accounts.length > 0 ? selectedAccount?.unit : selectedParentAccount?.unit,

                detail: accDetail,


            }

            const { message } = await ExportFinanceServices.ReceiptVoucher(obj)
            SuccessToaster(message)
            navigate('/receipt-voucher-list-export')
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
        getMajorCategories()
        getSubCategories()
        getPaymentAccounts()
        getVaultCustomers()
        getCurrencies()
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

            <Box component="form" onSubmit={handleSubmit(ReceiptVoucher)} >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12}>
                        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
                            Create Receipt Voucher
                        </Typography>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <DatePicker
                                size={'small'}
                                label={'Date'}
                                value={vaultDate}
                                onChange={(date) => handleVaultDate(date)}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <SelectField
                                size={'small'}
                                label={'Major Category'}
                                options={majorCategories}
                                selected={selectedMajorCategory}
                                onSelect={(value) => { setSelectedMajorCategory(value); getSubCategories(value?.id); setSelectedSubCategory(null) }}
                                register={register("majorCategory")}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <SelectField
                                size={'small'}
                                label={'Sub Category'}
                                options={subCategories}
                                selected={selectedSubCategory}
                                onSelect={(value) => { setSelectedSubCategory(value); getAccountBySubCategory(value?.id) }}
                                error={errors?.subCategory?.message}
                                register={register("subCategory", {
                                    required: 'Please select sub category.',
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <SelectField
                                disabled={selectedSubCategory ? false : true}
                                size={'small'}
                                label={'Account'}
                                options={parentAccounts}
                                selected={selectedParentAccount}
                                onSelect={(value) => { setSelectedParentAccount(value); getAccounts('', value?.id); setValue('accountCode', value?.account_code) }}
                                error={errors?.parentAccount?.message}
                                register={register("parentAccount", {
                                    required: 'Please select parent account.',
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            {accounts?.length > 0 &&
                                <SelectField
                                    disabled={selectedParentAccount ? false : true}
                                    size={'small'}
                                    label={'Child Account'}
                                    onSearch={(v) => getAccounts(v)}
                                    options={accounts}
                                    selected={selectedAccount}
                                    onSelect={(value) => { setSelectedAccount(value); setValue('accountCode', value?.account_code) }}
                                    error={errors?.description?.message}
                                    register={register("account", {
                                        required: accounts?.length > 0 ? 'Please select a account' : false,
                                    })}
                                />
                            }
                        </Grid>
                    </Grid>


                    <Grid item xs={12} sm={3}>
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
                        <InputField
                            size={'small'}
                            label={'Remark'}


                            placeholder={'Remark'}
                            register={register("remark")}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                    </Grid>
                    {accounts?.length > 0 ? selectedParentAccount && selectedAccount &&
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
                                                options={cashierAccounts.filter(e => e?.unit === selectedAccount ? selectedAccount?.unit : selectedParentAccount?.unit)}
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

                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box>
                                    <Box sx={{ mb: 2, mt: 8 }}>
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
                                                        {parseFloat((fcyUsd * usdExchangeRate) - (fcyUsd * exchangeRateUsd)).toFixed(2)}
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
                                                            {parseFloat((fcyUsd * usdExchangeRate) - (fcyUsd * exchangeRateUsd)).toFixed(2)}
                                                        </Typography>
                                                    </Cell>
                                                </Row>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            </Grid>
                        </Fragment>
                        : selectedParentAccount &&
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
                                                options={cashierAccounts.filter(e => e?.unit === selectedAccount ? selectedAccount?.unit : selectedParentAccount?.unit)}
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

                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box>
                                    <Box sx={{ mb: 2, mt: 8 }}>
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
                                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                                Ex. Loss
                                                            </Typography>
                                                        </Cell>
                                                        <Cell>
                                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                                {parseFloat((fcyUsd * exchangeRateUsd) - (fcyUsd * usdExchangeRate)).toFixed(2)}
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

export default ReceiptVoucher;