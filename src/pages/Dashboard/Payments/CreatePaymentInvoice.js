import React, { Fragment, useEffect, useState } from 'react';
import { Box, Checkbox, Grid, Paper, FormControl, FormControlLabel, Table, Radio, RadioGroup, InputLabel, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, Tooltip, IconButton, Button } from '@mui/material';
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
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

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

function CreatePaymentInvoice() {

    const navigate = useNavigate();
    const { user } = useAuth();
    const { usdExchangeRate, cadExchangeRate } = useSelector((state) => state.navigationReducer);

    const tableHead = ['Select', 'Date', 'Invoice ID', 'Vendor Name', ' Charges', ' Vat', 'Total Amount', 'Paid', 'Balance', 'Payment Status', 'Receiving']

    const { register, formState: { errors }, handleSubmit, setValue, getValues, trigger, watch } = useForm();
    const { register: register2, getValues: getValues2 } = useForm();
    const { register: register3, handleSubmit: handleSubmit3 } = useForm();
    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([])
    const [chargesDisabled, setChargesDisabled] = useState(false)
    const [buttonDisabled, setButtonDisabled] = useState(false)
    console.log(errors, 'watchwatchwatch');

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
    const [banks, setBanks] = useState([])
    const [selectedMode, setSelectedMode] = useState(null)
    const [cards, setCards] = useState([])
    const [selectedCard, setSelectedCard] = useState(null)
    const [selectedBank, setSelectedBank] = useState(null)
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [accounts, setAccounts] = useState([])


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
    const [vendors, setVendors] = useState([])
    const [selectedVendor, setSelectedVendor] = useState(null)

    // *For Tooltip
    const [copied, setCopied] = useState(false);

    const copyContent = (text) => {
        const contentToCopy = text;
        navigator.clipboard.writeText(contentToCopy);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 1000);
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
    // *For Get Customer Queue
    const getVendors = async (page, limit, filter) => {
        setLoader(true)

        try {

            let params = {
                page: 1,
                limit: 1000,


            }

            const { data } = await CustomerServices.getVendors(params)
            setVendors(data?.rows)

        } catch (error) {
            showErrorToast(error)
        } finally {
            setLoader(false)
        }
    }

    // *For Get Invoice List
    const getInvoiceList = async (page, limit, filter) => {
        setLoader(true)
        try {

            let params = {
                page: 1,
                limit: 1000,
                vendor_id: selectedVendor?.id,
                invoice_number: getValues2('invoiceNumber'),
                is_paid: true

            }

            const { data } = await CustomerServices.getPurchaseInvoices(params)
            setInvoiceList(data?.rows)
            setTotalCount(data?.count)
            setSelectedInvoice([])

        } catch (error) {
            ErrorToaster(error)
        } finally {
            setLoader(false)
        }
    }
    const getAccounts = async (search, accountId) => {
        try {
            let params = {
                page: 1,
                limit: 10000,
                name: search,
                is_disabled: false,
                sub_category: 4

            }
            const { data } = await FinanceServices.getAccountsDropDown(params)
            const updatedAccounts = data?.accounts?.rows?.map(account => ({
                ...account,
                name: ` ${account.account_code} ${account.name}`
            }));
            console.log(updatedAccounts, 'updatedAccountsupdatedAccounts');

            setAccounts(updatedAccounts)
        } catch (error) {
            showErrorToast(error)
        }
    }
    const getChildAccounts = async (accountId) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                primary_account_id: accountId ?? selectedAccount?.id,
            };
            const { data } = await FinanceServices.getAccounts(params);

            if (data?.accounts?.rows?.length > 0) {
                showErrorToast('Cannot use this account because it has child accounts.')
                setSelectedAccount(null)
            }
        } catch (error) {
            showErrorToast(error);
        }
    };

    // *For Select and DeSelect Invoice
    const handleSelectInvoice = (data) => {
        console.log(data);

        // getVaultCustomers(data?.vendor_id); // Changed from customer_id to vendor_id as per the provided structure

        try {
            const shallowCopy = [...selectedInvoice];
            const currentIndex = shallowCopy.findIndex(e => e.invoiceId === data?.id);



            if (currentIndex === -1) {
                const obj = {
                    vendor_id: data?.vendor_id,
                    vendor_name: data?.vendor?.name,
                    invoiceId: data?.id,
                    invoice_id: data?.id,
                    invoiceNumber: data?.invoice_number,
                    invoicePrefix: data?.invoice_prefix,
                    purchaseDate: data?.purchase_date,
                    amount: parseFloat(data?.total_amount),
                    paidAmount: parseFloat(data?.paid_amount),
                    paymentStatus: data?.payment_status,
                    isPaid: data?.is_paid,
                    receiveAmount: 0,

                };
                shallowCopy.push(obj);
            } else {
                shallowCopy.splice(currentIndex, 1);
            }
            console.log(shallowCopy, 'shallowCopyshallowCopy');

            setSelectedInvoice(shallowCopy);



        } catch (error) {
            ErrorToaster(error);
        }
    };


    // *For Handle Receive Amount
    const handleReceive = (value, id, balance) => {
        try {
            const shallowCopy = [...selectedInvoice];
            const currentIndex = shallowCopy.findIndex(e => e.invoiceId === id);

            if (currentIndex === -1) return; // Safeguard: invoice not found

            const numericValue = parseFloat(value);
            const numericBalance = parseFloat(balance);

            if (numericValue > numericBalance) {
                shallowCopy[currentIndex].receiveAmount = numericBalance;
                setValue(`receiving${id}`, numericBalance.toFixed(2));
            } else {
                shallowCopy[currentIndex].receiveAmount = numericValue;
            }

            setSelectedInvoice(shallowCopy);
        } catch (error) {
            ErrorToaster(error);
        }
    };


    // *For Get Payment Accounts
    const getPaymentAccounts = async () => {
        try {
            let params = {
                page: 1,
                limit: 1000
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


    // *For Get Vault Customers
    const getVaultCustomers = async (id) => {
        try {
            let params = {
                page: 1,
                limit: 1000,
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
        setLoading(true);

        const finalTotal = parseFloat(getValues('finalTotal') || 0);
        const existingTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        console.log("Final Total:", finalTotal);
        console.log("Existing Total:", existingTotal);

        if (finalTotal !== existingTotal) {
            showErrorToast(`Remaining amount must be paid. Remaining: ${(finalTotal - existingTotal).toFixed(2)}`);
            setLoading(false);
            return;
        }

        const paymentModesString = payments.map((item) => item.payment_mode).join(", ");

        try {
            let obj = {
                additional_charges_percentage: formData?.percentage,
                additional_charges_value: formData?.additionalCharges,
                payment_methods: payments,
                total_amount: getValues('total'),
                final_amount: finalTotal,
                invoices: selectedInvoice,
                narration: formData?.narration,
                notes: formData?.notes,
                payment_mode: paymentModesString,
            };
            console.log(obj);


            const promise = VehiclePaymentServices.CreatePaymentInvoice(obj)
            const response = await promise
            showPromiseToast(promise, "Saving...", "Added Successfully", "Something Went Wrong")
            if (response?.responseCode === 200) {
                navigate('/payment-invoice-list')
            }


        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoading(false);
        }
    };


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


    const addPayments = (amount, account, submit = null) => {
        const total = parseFloat(getValues("total")) || 0;
        const currentAmount = parseFloat(amount) || 0;
        const existingTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        if (existingTotal + currentAmount > total) {
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



        if (!account) {
            showErrorToast("Account is required");
            return;
        }




        const paymentObj = {
            amount: currentAmount,
            payment_mode: account?.name,
            account_id: account?.id



        };

        setPayments((prev) => [...prev, paymentObj]);

        // Reset form fields
        setSelectedBank(null);
        setSelectedCard(null);
        setValue("payamount", "");

        // Optionally reset payment mode
        // setValue1("payment", { id: "Cash", name: "Cash" });
        // setSelectedMode({ id: "Cash", name: "Cash" });
    };

    useEffect(() => {
        console.log(payments, 'paymentspayments');

        const total = parseFloat(getValues("finalTotal")) || 0;
        const existingTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        console.log(total, 'total');
        console.log(existingTotal, 'existingTotal');
        console.log(total, 'total');
        console.log(parseFloat(parseFloat(total) - parseFloat(existingTotal)), 'minusval');

        setValue('amount', parseFloat(existingTotal).toFixed(2))
        setValue('balance', parseFloat(parseFloat(parseFloat(total) - parseFloat(existingTotal))).toFixed(2))
        setValue('payamount', parseFloat(parseFloat(parseFloat(total) - parseFloat(existingTotal))).toFixed(2))

        if (payments?.length > 0) {
            setChargesDisabled(true)
        }
        else if (payments?.length == 0) {
            setChargesDisabled(false)
        }
        setValue("payment", { id: "Cash", name: "Cash" })
        setSelectedMode({ id: "Cash", name: "Cash" })
    }, [payments])


    useEffect(() => {
        if (selectedInvoice.length > 0) {

            let totalAmount = 0.00
            selectedInvoice.forEach(e => {
                if (e?.receiveAmount) {
                    console.log(e?.receiveAmount);

                    totalAmount += parseFloat(e?.receiveAmount)
                }
            })
            console.log(totalAmount, 'totalAmount');

            setValue('total', totalAmount)
            setValue('finalTotal', totalAmount)
            setTotalAmount(totalAmount)

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

            setSelectedCard({ id: cardsData[0]?.id, name: cardsData[0]?.name })
            setValue("card", { id: cardsData[0]?.id, name: cardsData[0]?.name })


        } catch (error) {
            showErrorToast(error)
        } finally {
            setLoader(false)
        }
    }

    useEffect(() => {
        getBanks()

        getAccounts()
        getCards()
        getVendors()
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
                Create Payment Invoice
            </Typography>

            {/* Filters */}
            <Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px' }} >
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={3}>
                        <SelectField
                            size={'small'}

                            label={'Select Vendor'}
                            options={vendors}
                            selected={selectedVendor}
                            onSelect={(value) => { setSelectedVendor(value); }}
                            register={register2("vendor")}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <InputField
                            size={'small'}
                            label={'Invoice No.'}
                            placeholder={'Invoice No'}
                            register={register2('invoiceNumber', {

                            })}
                        />
                    </Grid>
                    <Grid item xs={2} sm={3} sx={{ marginTop: "30px" }}>
                        <PrimaryButton
                            bgcolor={"#001f3f"}
                            icon={<SearchIcon />}
                            title="Search"
                            sx={{ marginTop: "30px" }}
                            onClick={() => getInvoiceList(null, null, null)}
                            loading={loading}
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
                                                        {console.log(selectedInvoice)}
                                                        <Checkbox
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
                                                            title={item?.vendor?.name ?? '-'}
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
                                                            {item?.vendor?.name?.length > 15 ? item?.vendor?.name?.slice(0, 10) + "..." : item?.vendor?.name}
                                                        </Tooltip>
                                                    </Cell>


                                                    <Cell>
                                                        {parseFloat(item?.total_charges).toFixed(2) ?? '-'}
                                                    </Cell>
                                                    <Cell>
                                                        {parseFloat(item?.tax).toFixed(2) ?? '-'}
                                                    </Cell>
                                                    <Cell>
                                                        {parseFloat(item?.total_amount).toFixed(2) ?? '-'}
                                                    </Cell>
                                                    <Cell>
                                                        {parseFloat(item?.paid_amount).toFixed(2) ?? '-'}
                                                    </Cell>
                                                    <Cell>
                                                        {parseFloat(item?.total_amount) - parseFloat(item?.paid_amount) ?? '-'}
                                                    </Cell>
                                                    <Cell>
                                                        <Box sx={{ 'path': { fill: item?.paid_amount != item?.total_amount && item?.paid_amount != 0 && Colors.bluishCyan } }}>
                                                            {item?.paid_amount == item?.total_amount ? <CheckIcon /> : item?.paid_amount == 0 ? <PendingIcon /> : <CheckIcon />}
                                                            <Typography variant="body2">
                                                                {item?.paid_amount == item?.total_amount ? 'Paid' : item?.paid_amount == 0 ? 'UnPaid' : 'Partial Paid'}
                                                            </Typography>
                                                        </Box>
                                                    </Cell>
                                                    <Cell>
                                                        <Box sx={{ width: '150px' }}>
                                                            <InputField
                                                                disabled={selectedInvoice.findIndex(e => e.invoiceId === item?.id) === -1}
                                                                size="small"
                                                                type="number"
                                                                placeholder="Receiving"
                                                                InputProps={{ inputProps: { min: 0 } }}
                                                                error={!!errors[`receiving${item?.id}`]}
                                                                helperText={errors[`receiving${item?.id}`]?.message}
                                                                register={register(`receiving${item?.id}`, {
                                                                    required:
                                                                        selectedInvoice.findIndex(e => e.invoiceId === item?.id) === -1
                                                                            ? false
                                                                            : 'Please enter receive amount',
                                                                    validate:
                                                                        selectedInvoice.findIndex(e => e.invoiceId === item?.id) === -1
                                                                            ? false
                                                                            : value => {
                                                                                const num = Number(value);
                                                                                if (num < 0) return 'Amount cannot be negative';
                                                                                if (num > (parseFloat(item?.total_amount) - parseFloat(item?.paid_amount))) {
                                                                                    return 'Amount cannot be greater than balance amount';
                                                                                }
                                                                                return true;
                                                                            },
                                                                    onChange: e => {
                                                                        const num = Number(e.target.value);
                                                                        trigger(`receiving${item?.id}`);
                                                                        if (
                                                                            num >= 0 &&
                                                                            num <= (parseFloat(item?.total_amount) - parseFloat(item?.paid_amount))
                                                                        ) {
                                                                            handleReceive(num, item?.id, item?.balance);
                                                                        }
                                                                    },
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
                            <Grid container spacing={1} p={2} justifyContent={'space-between'} alignItems={'center'}>
                                <Grid item md={6} sm={12} xs={12}>
                                    <InputField
                                        label="Notes"
                                        size="small"
                                        placeholder="Notes"
                                        register={register("notes")}
                                        error={errors?.notes?.message}
                                    />
                                </Grid>
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

                            </Grid>
                        </Box>

                        {<Box component={'form'} sx={{ my: 4 }} onSubmit={handleSubmit(receivePayment)}>
                            {true && (
                                <Grid container mt={2} spacing={2}>
                                    <Grid item md={3} sm={12} xs={12}>
                                        <InputField
                                            label="Total Amount"
                                            size="small"
                                            disabled={true}
                                            placeholder="Total Amount"
                                            register={register("total", {
                                                required: "please enter total .",
                                            })}
                                            error={errors?.total?.message}
                                        />
                                    </Grid>
                                    {/* <Grid item md={3} sm={12} xs={12}>
                                        <InputField
                                            label="Additional Percentage"
                                            size="small"

                                            placeholder="Additional Percentage"
                                            register={register("percentage", {
                                                required: false,
                                                onChange: (e) => {
                                                    const percentage = parseFloat(e.target.value) || 0;
                                                    const totalAmount = parseFloat(getValues("total")) || 0;

                                                    const additionalCharges = (totalAmount * percentage) / 100;

                                                    console.log("Additional Charges:", additionalCharges.toFixed(2));

                                                    setValue("additionalCharges", additionalCharges.toFixed(2));
                                                    setValue('finalTotal', parseFloat(parseFloat(getValues('total')) + parseFloat(additionalCharges)).toFixed(2))
                                                    setValue('balance', parseFloat(parseFloat(getValues('total')) + parseFloat(additionalCharges)).toFixed(2))
                                                    setValue('payamount', parseFloat(parseFloat(getValues('total')) + parseFloat(additionalCharges)).toFixed(2))
                                                },
                                            })}
                                            error={errors?.percentage?.message}
                                        />
                                    </Grid>


                                    <Grid item md={3} sm={12} xs={12}>
                                        <InputField
                                            label="Additional Charges"
                                            size="small"
                                            disabled={true}
                                            placeholder="Additional Charges"
                                            register={register("additionalCharges", {
                                                required: false,
                                            })}
                                            error={errors?.additionalCharges?.message}
                                        />
                                    </Grid> */}
                                    <Grid item md={3} sm={12} xs={12}>
                                        <InputField
                                            label="Final Total"
                                            size="small"
                                            disabled={true}
                                            placeholder="Final Total"
                                            register={register("finalTotal", {
                                                required: "please enter finalTotal .",
                                            })}
                                            error={errors?.finalTotal?.message}
                                        />
                                    </Grid>
                                    <Grid item md={3} sm={12} xs={12}>
                                        <InputField
                                            label="Paid Amount"

                                            disabled={true}
                                            size="small"
                                            placeholder="Enter amount"

                                            register={register("amount", {
                                                required: false,

                                            })}
                                            error={errors?.amount?.message}
                                        />
                                    </Grid>
                                    <Grid item md={3} sm={12} xs={12}>
                                        <InputField
                                            label="Balance Amount"
                                            size="small"
                                            disabled={true}
                                            placeholder="Balance Amount"
                                            register={register("balance", {
                                                required: "please enter balance .",
                                            })}
                                            error={errors?.balance?.message}
                                        />
                                    </Grid>

                                    <Grid item md={3} sm={12} xs={12}>
                                        <InputField
                                            label="Narration"
                                            size="small"
                                            placeholder="Narration"
                                            register={register("narration")}
                                            error={errors?.narration?.message}
                                        />
                                    </Grid>

                                    <Grid container p={2} spacing={2}>
                                        <Grid item md={3} sm={12} xs={12}>
                                            <InputField
                                                label="Amount"
                                                size="small"

                                                placeholder="Amount"
                                                register={register("payamount", {
                                                    required: false,
                                                })}
                                                error={errors?.payamount?.message}
                                            />
                                        </Grid>
                                        {(
                                            <Grid item xs={3.8} >
                                                <SelectField
                                                    size="small"
                                                    options={accounts}
                                                    label={'Select Account *:'}
                                                    selected={selectedAccount}
                                                    onSelect={(value) => {
                                                        setSelectedAccount(value)
                                                        console.log(value);
                                                        setValue('AccountCode', value?.account_code)
                                                        getChildAccounts(value?.id)

                                                    }}
                                                    error={errors?.service?.message}
                                                    register={register("service", {
                                                        required: false,
                                                    })}
                                                />
                                            </Grid>
                                        )}
                                        <Grid item md={12} sm={12} xs={12}>
                                            <Button
                                                onClick={() =>
                                                    addPayments(
                                                        getValues("payamount"),


                                                        selectedAccount
                                                    )
                                                }

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
                                                            border: '1px solid #ccc',
                                                            borderRadius: 2,
                                                            width: '30%',
                                                            p: 2,
                                                            mb: 1,
                                                            backgroundColor: '#f9f9f9',
                                                            position: 'relative',
                                                        }}
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            sx={{ position: 'absolute', top: 8, right: 8 }}
                                                            onClick={() => {
                                                                const updatedPayments = payments.filter((_, i) => i !== index);
                                                                setPayments(updatedPayments);
                                                            }}
                                                        >
                                                            <DeleteIcon color="error" fontSize="small" />
                                                        </IconButton>

                                                        <Typography variant="body1"><strong>Amount:</strong> {payment.amount}</Typography>
                                                        <Typography variant="body1"><strong>Account Name:</strong> {payment.payment_mode}</Typography>
                                                        {payment.mode === 'Bank' && (
                                                            <Typography variant="body1"><strong>Bank:</strong> {payment.bank?.name || payment.bank}</Typography>
                                                        )}
                                                        {payment.mode === 'Card' && (
                                                            <Typography variant="body1"><strong>Card:</strong> {payment.card?.name || payment.card}</Typography>
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
                                            disabled={selectedInvoice?.length == 0 || buttonDisabled}
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
                        }

                    </Fragment>
                }

                {loader && <CircleLoading />}
            </Box>
        </Box >
    );
}

export default CreatePaymentInvoice;