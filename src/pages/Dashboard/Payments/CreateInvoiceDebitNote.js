import { IconButton, Grid, Box, Button, Typography, FormControlLabel, InputLabel, Checkbox } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import InputField from "components/Input";
import DatePicker from "components/DatePicker";
import SelectField from "components/Select";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import CustomerServices from "services/Customer";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import FinanceServices from "services/Finance";
import HierarchicalSelectField from "components/Select2";
import Colors from "assets/Style/Colors";

const CreateInvoiceDebitNote = () => {
    const { register, setValue, formState: { errors }, handleSubmit, getValues } = useForm();
    const [fieldsDisabled, setFieldsDisabled] = useState(false);
    const [date, setDate] = useState(null);

    // *For Customer Booking
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [costCenters, setCostCenters] = useState([])
    const [selectedCostCenter, setSelectedCostCenter] = useState(null)
    const [isVatEnabled, setIsVatEnabled] = useState(true)
    const [error, setError] = useState("")
    const { state } = useLocation()
    console.log(state, 'statestate');

    // *For Accounts
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const navigate = useNavigate()
    const getReceptionDetail = (isSearchClicked) => {
        console.log("Reception detail clicked:", isSearchClicked);
    };

    const getChildAccounts = async (accountId) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                primary_account_id: accountId ?? selectedAccount?.id,
            };
            const { data } = await FinanceServices.getAccounts(params);

            if (data?.accounts?.rows?.length > 0) {
                setSelectedAccount(null)
                showErrorToast("Cannot use this account because it has child accounts.");
            }
        } catch (error) {
            showErrorToast(error);
        }
    };
    const onSubmit = async (formData) => {
        console.log(formData);


        try {
            let obj = {
                invoice_id: state?.tableData?.id,  //credit_note or debit_note

                vendor_id: state?.tableData?.vendor_id, // vendor ID in case of Debit NOte

                date: moment(date).format('MM-DD-YYYY'),
                notes: formData?.notes,
                amount: formData?.totalCreditAmount,
                tax_amount: formData?.Vat,
                total_amount: formData?.totalAmount,

                cost_center: selectedCostCenter?.name,

            }

            const promise = CustomerServices.CreateInvoiceDebitNote(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                if (state?.tableData?.invoice_prefix == 'FA') {
                    navigate("/fixed-assets");
                }
                else {
                    navigate("/prepaid-expenses");
                }

            }


        } catch (error) {
            showErrorToast(error);
        }



    };
    // *For Get Customer Queue
    const getCustomerQueue = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await CustomerServices.getVendors(params);
            setCustomers(data?.rows);
        } catch (error) {
            showErrorToast(error);
        }
    };
    // *For Get Account
    const getAccounts = async (search, accountId) => {
        try {
            let params = {
                page: 1,
                limit: 10000,
                name: search,
                is_disabled: false

            }
            const { data } = await FinanceServices.getChartOfAccount(params)
            const updatedAccounts = data?.accounts?.rows?.map(account => ({
                ...account,
                name: ` ${account.account_code} ${account.name}`
            }));


            setAccounts(data?.COA)
        } catch (error) {
            showErrorToast(error)
        }
    }

    const handleAccountSelect = (account) => {
        console.log(account);
        getChildAccounts(account?.id)
        setSelectedAccount(account)
        setError("")
        console.log("Selected Account:", account)
    }

    const getTokenNumber = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
                type: 'debit_note'
            };

            const { data } = await CustomerServices.getCreditDebitToken(params);
            console.log(data);
            setValue('creditNoteNumber', data?.voucherNumber)

        } catch (error) {
            showErrorToast(error);
        }
    };
    const getCostCenters = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await CustomerServices.getCostCenters(params);
            setCostCenters(data?.cost_centers);
        } catch (error) {
            showErrorToast(error);
        }
    };
    useEffect(() => {
        getAccounts()
        getTokenNumber()
        getCustomerQueue();
        getCostCenters()
    }, []);

    return (
        <Box p={3} component={'form'} onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Create Invoice Debit Note
            </Typography>

            <Grid container spacing={2}>
                {/* Credit Note Information */}
                <Grid item xs={12} md={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <DatePicker
                                label="Debit Note Date :*"
                                value={date}
                                size="small"
                                register={register("creditNoteDate", { required: "Debit Note Date is required" })}
                                error={errors?.creditNoteDate?.message}
                                onChange={(date) => {
                                    setValue("creditNoteDate", date);
                                    setDate(new Date(date));
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <SelectField
                                size="small"
                                label="Select Cost Center"
                                options={costCenters}
                                selected={selectedCostCenter}
                                onSelect={(value) => {
                                    setSelectedCostCenter(value)

                                }}
                                register={register("costcenter", { required: "costcenter is required" })}
                                error={errors?.costcenter?.message}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <InputField
                                label="Total Debit Amount"
                                size="small"
                                type={'number'}
                                step={'any'}
                                disabled={fieldsDisabled}
                                placeholder="Total Debit Amount"
                                register={register("totalCreditAmount", {
                                    required: "Total Debit Amount is required",
                                    onChange: (e) => {
                                        // custom onChange logic here
                                        // custom onChange logic here
                                        const value = parseFloat(e.target.value) || 0;
                                        if (isVatEnabled) {
                                            setValue("Vat", (value * 0.05).toFixed(2));
                                            let total = parseFloat(value * 0.05) + parseFloat(value)
                                            console.log(total);
                                            setValue("totalAmount", total);
                                        }
                                        else {
                                            setValue("Vat", (0).toFixed(2));
                                            let total = parseFloat(0) + parseFloat(value)
                                            console.log(total);
                                            setValue("totalAmount", total);
                                        }

                                    },
                                })}
                                error={!!errors?.totalCreditAmount}
                                helperText={errors?.totalCreditAmount?.message}
                            />

                        </Grid>
                        <Grid item xs={12} md={1}>
                            <InputLabel sx={{ textTransform: "capitalize", textAlign: 'left', fontWeight: 700, color: Colors.gray }}>

                                Enable VAT
                            </InputLabel>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={isVatEnabled}
                                        {...register("vatEnabled")}
                                        onChange={(e) => {
                                            setIsVatEnabled(e.target.checked)
                                            if (!e.target.checked) {
                                                setValue("Vat", 0); // Set VAT to 0 if unchecked

                                                console.log(e.target.checked);

                                                let total = parseFloat(0) + parseFloat(getValues('totalCreditAmount'))
                                                console.log(total);
                                                setValue("totalAmount", total);
                                            } else {
                                                let vat = parseFloat(getValues('totalCreditAmount') * 0.05)
                                                setValue("Vat", vat); // Set VAT to 0 if unchecked
                                                console.log(e.target.checked);
                                                let total = parseFloat(getValues('totalCreditAmount') * 0.05) + parseFloat(getValues('totalCreditAmount'))
                                                console.log(total);
                                                setValue("totalAmount", total);

                                            }
                                        }}
                                    />
                                }

                            />

                        </Grid>
                        <Grid item xs={12} md={2}>
                            <InputField
                                label="Vat"
                                size="small"
                                disabled
                                placeholder="Vat"
                                register={register("Vat", { required: false })}

                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <InputField
                                        label="Notes"
                                        size="small"
                                        disabled={fieldsDisabled}
                                        placeholder="Additional notes"
                                        register={register("notes", { required: false })}
                                        multiline
                                        rows={4}

                                    />
                                </Grid>
                            </Grid>
                        </Grid>



                    </Grid>
                </Grid>



                {/* Credit Amount */}

                {/* <Grid item xs={12} md={1}>
                    <InputLabel sx={{ textTransform: "capitalize", textAlign: 'left', fontWeight: 700, color: Colors.gray }}>

                        Enable VAT
                    </InputLabel>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isVatEnabled}
                                {...register("vatEnabled")}
                                onChange={(e) => {
                                    setIsVatEnabled(e.target.checked)
                                    if (!e.target.checked) {
                                        setValue("Vat", 0); // Set VAT to 0 if unchecked

                                        console.log(e.target.checked);

                                        let total = parseFloat(0) + parseFloat(getValues('totalCreditAmount'))
                                        console.log(total);
                                        setValue("totalAmount", total);
                                    } else {
                                        let vat = parseFloat(getValues('totalCreditAmount') * 0.05)
                                        setValue("Vat", vat); // Set VAT to 0 if unchecked
                                        console.log(e.target.checked);
                                        let total = parseFloat(getValues('totalCreditAmount') * 0.05) + parseFloat(getValues('totalCreditAmount'))
                                        console.log(total);
                                        setValue("totalAmount", total);

                                    }
                                }}
                            />
                        }

                    />

                </Grid>
                <Grid item xs={12} md={2}>
                    <InputField
                        label="Vat"
                        size="small"
                        disabled
                        placeholder="Vat"
                        register={register("Vat", { required: false })}

                    />
                </Grid>

                <Grid item xs={12} md={2}>
                    <InputField
                        label="Total Amount"
                        size="small"
                        disabled
                        placeholder="Total Amount"
                        register={register("totalAmount", { required: false })}

                    />
                </Grid> */}
                {/* <Grid item xs={12} md={5}>

                    <HierarchicalSelectField
                        label={'Select Credit Account'}
                        selected={selectedAccount}
                        onSelect={handleAccountSelect}
                        data={accounts}
                        error={error}
                        placeholder="Select Account"
                    />
                </Grid> */}
                {/* Credit Note Details */}


                {/* Buttons */}
                <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                        type="submit"

                        variant="contained"
                        sx={{
                            textTransform: "capitalize",
                            backgroundColor: "#001f3f",
                            ":hover": {
                                backgroundColor: "#001f3f",
                            },
                        }}
                    >
                        Create
                    </Button>
                </Grid>
            </Grid>
        </Box>

    );
};

export default CreateInvoiceDebitNote;
