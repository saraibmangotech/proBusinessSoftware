import React, { Fragment, useState, useEffect } from "react";
import {
    Grid,
    Box,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    Checkbox,
    tableCellClasses,
    InputLabel,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    TableCell,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import { ErrorToaster } from "components/Toaster";
import moment from "moment";
import ClientServices from "services/Client";
import { Check, Close } from "@mui/icons-material";
import { useAuth } from "context/UseContext";
import FinanceServices from "services/Finance";
import { SuccessToaster } from "components/Toaster";
import { useNavigate } from "react-router-dom";
import CurrencyServices from "services/Currency";
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
        padding: "15px",
        textAlign: "center",
        whiteSpace: "nowrap",
        backgroundColor: Colors.primary,
        color: Colors.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontFamily: FontFamily.NunitoRegular,
        textAlign: "center",
        textWrap: "nowrap",

        ".MuiBox-root": {
            display: "flex",
            gap: "6px",
            alignItems: "center",
            justifyContent: "center",
            ".MuiBox-root": {
                cursor: "pointer",
            },
        },
        svg: {
            width: "auto",
            height: "24px",
        },
        ".MuiTypography-root": {
            textTransform: "capitalize",
            fontFamily: FontFamily.NunitoRegular,
            textWrap: "nowrap",
        },
        ".MuiButtonBase-root": {
            padding: "8px",
            width: "28px",
            height: "28px",
        },
    },
}));

const useStyles = makeStyles({
    loaderWrap: {
        display: "flex",
        height: 100,
        "& svg": {
            width: "40px !important",
            height: "40px !important",
        },
    },
});

function ShippingProfit() {
    const { user } = useAuth();
    const navigate = useNavigate()

    const { usdExchangeRate, cadExchangeRate } = useSelector((state) => state.navigationReducer);

    // *For Total Amount
    const [totalAmount, setTotalAmount] = useState([]);

    const [allSums, setAllSums] = useState();

    // *For Client Dropdown
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);

    // *for Payment Type

    const [paymentType, setPaymentType] = useState("aed");

    // *For Cashier Account
    const [cashierAccounts, setCashierAccounts] = useState([]);
    const [selectedCashierAccount, setSelectedCashierAccount] = useState(null);

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    const [clientCosting, setClientCosting] = useState([]);
    const [copyClientCosting, setCopyClientCosting] = useState();
    const [selectedClientBooking, setSelectedClientBooking] = useState([]);

    // *Cashier Details
    const [cashierDetails, setCashierDetails] = useState(false);

    // *For Vin and Lot
    const [vin, setVin] = useState();
    const [selectedVin, setSelectedVin] = useState();
    const [lot, setLot] = useState();
    const [selectedLot, setSelectedLot] = useState();

    // *For Filters
    const [filters, setFilters] = useState({});

    const [showTotal, setShowTotal] = useState(false);

    const [walletBalance, setWalletBalance] = useState();

    const [totalPayment, setTotalPayment] = useState();

    // *wallet Id
    const [walletId, setWalletId] = useState();

    // *For Currencies
    const [currencyExchangeRate, setCurrencyExchangeRate] = useState();

    // *for button Disable
    const [buttonState, setButtonState] = useState(false);

    // loss
    const [loss, setLoss] = useState(0)
    const [items, setItems] = useState([]);
    const [balances, setBalances] = useState({});
    // *for details
    const [sendDetails, setSendDetails] = useState();

    // for totals
    const [ShippingTotal, setShippingTotal] = useState()
    const [vendorTotal, setVendorTotal] = useState()


    const classes = useStyles();

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm();

    const {
        register: register2,
        handleSubmit: handleSubmit2,
        setValue,
        getValues: getValues2,
        formState: { errors: errors2 },
        reset,
    } = useForm();

    const tableHead = [
        "BUY DATE",
        "MODEL",
        "Make",
        "LOT#",
        "VIN#",
        "COLOR",
        "Arrived Date",
        "SHIPPING CHARGE",
        "LATE FEE",
        "STORAGE",
        "CATEGORY A",
        "BROKER FEE",
        "TITLE FEE",
        "OTHER CHARGE",
        "CUSTOM DUTY",
        "VAT",
        "TOTAL",
        "Discount",
        "SHIPPING TOTAL",

        "VENDOR TOTAL",
        "Profit By Amount",
        "Profit By Margin",
    ];

    // *For Clients
    const getClientDropdown = async () => {
        try {
            const { data } = await ClientServices.getClientDropdown();
            setClients(data?.customers?.rows);
        } catch (error) {
            ErrorToaster(error);
        }
    };
    const handleAppliedAmountChange = () => {

        handleCalc2()

        if (walletBalance < getValues2("appliedAmountWallet")) {
            setValue("appliedAmountWallet", 0);
        }
        if (isNaN(parseFloat(getValues2("appliedAmountCashier")))) {
            setValue("appliedAmountCashier", '');
        }
        if (isNaN(parseFloat(getValues2("appliedAmountWallet")))) {
            setValue("appliedAmountWallet", '');
        }

        let sum =
            parseFloat(getValues2("appliedAmountCashier")) +
            parseFloat(getValues2("appliedAmountWallet"));

        if (parseFloat(sum).toFixed(2) == totalPayment) {
            setButtonState(true);
        } else {
            setButtonState(false);
        }
    };

    // *For Vin Lot
    const getVin = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                search: search,
            };
            const { data } = await ClientServices.getTTVin(params);
            const arrayOfObjects = data?.details?.vins.map((value, index) => ({
                id: value, // Adding 1 to start the id from 1
                name: value,
            }));
            const arrayOfObjects1 = data?.details?.lots.map((value, index) => ({
                id: value, // Adding 1 to start the id from 1
                name: value,
            }));

            setVin(arrayOfObjects);
            setLot(arrayOfObjects1);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Get Currencies
    const getCurrencies = async (currency) => {
        try {
            let params = {
                detailed: true,
            };
            const { data } = await CurrencyServices.getCurrencies(params);

            setCurrencyExchangeRate(data.currencies[2].conversion_rate);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Get Vault Customers
    const getVaultCustomers = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                customer_id: selectedClient?.id,
            };
            const { data } = await FinanceServices.getVaultCustomers(params);
            setWalletBalance(
                data?.customers?.rows[0].accounts[1].total_cr -
                data?.customers?.rows[0].accounts[1].total_dr
            );
            setWalletId(data?.customers?.rows[0].accounts[1].id);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Get Payment Accounts
    const getPaymentAccounts = async () => {
        try {
            let params = {
                page: 1,
                limit: 1000,
            };
            const { data } = await FinanceServices.getPaymentAccounts(params);
            // *Filter only vehicle account
            const vehicleAcc = data?.cashierAccounts?.rows?.filter((e) => e.unit === "Vehicle");
            // *1003 is the cashier role ID if the login user is a cashier then show only their account
            if (user?.role_id === 1003) {
                const userId = user?.ref_id.split("-")[1];
                const filterCashier = vehicleAcc.filter((e) => e.user_id == userId);
                setCashierAccounts(filterCashier);
                // *Select Default AED cashier account
                const cashierDetail = filterCashier.find((e) => e.currency === paymentType);
                setValue("cash", cashierDetail?.name);
                setSelectedCashierAccount(cashierDetail);
            } else {
                setCashierAccounts(vehicleAcc);
                // *Select Default AED cashier account
                const cashierDetail = vehicleAcc.find((e) => e.currency === paymentType);
                setValue("cash", cashierDetail?.name);
                setSelectedCashierAccount(cashierDetail);
            }
        } catch (error) {
            ErrorToaster(error);
        }
    };


    const addItem = (item) => {
        setItems([item, ...items]);

        setSendDetails([item, ...items]);
    };


    // *For Client Costing
    const getShippingProfit = async (page, limit, filter) => {
        setLoader(true);
        try {
            const Page = page ? page : currentPage;
            const Limit = limit ? limit : pageLimit;
            const Filter = { ...filters, ...filter };
            setCurrentPage(Page);
            setPageLimit(Limit);
            setFilters(Filter);
            let params = {
                page: Page,
                limit: Limit,

            };
            params = { ...params, ...Filter };
            const { data } = await FinanceServices.getShippingProfit(params);

            let totalClientCosting = 0;
            let totalVendorCosting = 0;


            // Iterate through the array and accumulate the shipping charges

            data?.vehicles?.rows.forEach((item) => {
                totalClientCosting += parseFloat(item?.client_costing?.total);
                totalVendorCosting += parseFloat(item?.vendor_costing?.shipping_vendor_total);

            });

            setShippingTotal(totalClientCosting)
            setVendorTotal(totalVendorCosting)

            // setAllSums(balance);

            const shallowCopy = [];
            const clientCostArray = [];

            data?.vehicles?.rows.forEach((e) => {
                let val =
                    parseFloat(e?.shipping_charges) +
                    parseFloat(e?.late_fee) +
                    parseFloat(e?.storage) +
                    parseFloat(e?.category_a) +
                    parseFloat(e?.broker_fee) +
                    parseFloat(e?.title_fee) +
                    parseFloat(e?.other_charge) +
                    parseFloat(e?.custom_duty);
                let copyClientCost = {
                    costing_id: e?.id,
                };
                let obj = {
                    id: e?.id,
                    shipping_charges: e?.shipping_charges,
                    late_fee: e?.late_fee,
                    storage: e?.storage,
                    category_a: e?.category_a,
                    broker_fee: e?.broker_fee,
                    title_fee: e?.title_fee,
                    other_charge: e?.other_charge,
                    custom_duty: e?.custom_duty,
                    balance: e?.invoice?.balance,
                };

                obj.amount = val.toFixed(2);

                if (true) {
                    copyClientCost.shipping_charges = e?.shipping_charges;
                    copyClientCost.late_fee = e?.late_fee;
                    copyClientCost.storage = e?.storage;
                    copyClientCost.category_a = e?.category_a;
                    copyClientCost.broker_fee = e?.broker_fee;
                    copyClientCost.title_fee = e?.title_fee;
                    copyClientCost.other_charge = e?.other_charge;
                    copyClientCost.custom_duty = e?.custom_duty;
                    copyClientCost.balance = e?.invoice?.balance;
                }

                shallowCopy.push(obj);
                clientCostArray.push(copyClientCost);
            });
            reset();
            setTotalAmount(shallowCopy);

            setCopyClientCosting(clientCostArray);
            setClientCosting(data?.vehicles?.rows);
            setTotalCount(data?.vehicles?.count);
            getVaultCustomers();
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false);
        }
    };

    // *For Apply Filters
    const applyFilter = async () => {
        try {
            let data = {
                customer_id: selectedClient?.id,
                vin: getValues("vin"),
                container: getValues("container"),
            };

            getShippingProfit(1, "", data);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const handleCalc2 = (e) => {


        setLoss(parseFloat(usdExchangeRate * getValues2('appliedAmountCashier') - getValues2('exChangeRate') * getValues2('appliedAmountCashier')).toFixed(2))

    }



    useEffect(() => {
        if (paymentType) {
            const cashierDetail = cashierAccounts.find(e => e.currency === paymentType)
            setValue('cash', cashierDetail?.name)
            setSelectedCashierAccount(cashierDetail)
        }
    }, [paymentType]);

    useEffect(() => {
        getClientDropdown();
        getVin();
        getPaymentAccounts();
        getCurrencies()
    }, []);

    return (
        <Fragment>
            <Grid container spacing={1} alignItems={"center"} justifyContent={"center"}>
                <Grid item xs={12} sm={12} md={11}>
                    <Typography
                        variant="h4"
                        sx={{
                            color: Colors.charcoalGrey,
                            fontFamily: FontFamily.NunitoRegular,
                            mt: 4,
                            ml: "5px",
                        }}
                    >
                        SHIPPING PROFIT
                    </Typography>
                </Grid>

                <Grid item md={11}>
                    <Box
                        sx={{
                            m: "20px 0 20px 0",
                            p: "20px",
                            bgcolor: Colors.feta,
                            border: `1px solid ${Colors.iron}`,
                            borderRadius: "9px",
                        }}
                    >
                        <Grid
                            container
                            spacing={1}
                            alignItems={"center"}
                            gap={4}
                            component={"form"}
                            onSubmit={handleSubmit(applyFilter)}
                        >
                            <Grid item xs={12} md={2.5}>
                                <SelectField
                                    size="small"
                                    label={"Select Customer"}
                                    options={clients}
                                    selected={selectedClient}
                                    onSelect={(value) => setSelectedClient(value)}
                                    error={errors?.client?.message}
                                    register={register("client", {
                                        required: "Please select client.",
                                    })}
                                />
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <InputField
                                    size="small"
                                    label={"Vin"}
                                    placeholder={'Vin'}


                                    register={register("vin")}
                                />
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <InputField
                                    size="small"
                                    label={"Container"}
                                    placeholder={'Container'}


                                    register={register("container")}
                                />
                            </Grid>



                            <Grid item xs={12} md={2}>
                                <Box
                                    sx={{
                                        mt: "12px",
                                    }}
                                >
                                    <PrimaryButton type="submit" title="Search" />
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                <Grid item md={11}>
                    <Box>
                        {clientCosting.length > 0 && (
                            <TableContainer
                                // component={Paper}
                                sx={{
                                    // boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                    borderRadius: 2,
                                    maxWidth: "calc(100vw - 330px)",

                                }}
                            >
                                <Table stickyHeader sx={{ minWidth: 500 }}>
                                    <TableHead>
                                        <Row>
                                            {tableHead.map((cell, index) => (
                                                <Cell
                                                    key={index}

                                                >
                                                    {cell}
                                                </Cell>
                                            ))}
                                        </Row>
                                    </TableHead>
                                    <TableBody>
                                        {clientCosting.map((item, index) => {
                                            const isActive =
                                                selectedClientBooking.indexOf(item?.id) !== -1;
                                            return (
                                                <Row
                                                    key={index}
                                                    sx={{
                                                        bgcolor: index % 2 !== 0 && "#EFF8E7",
                                                    }}
                                                >


                                                    <Cell>
                                                        {item?.booking?.purchase_date
                                                            ? moment(
                                                                item?.booking?.purchase_date
                                                            ).format("DD-MMM-YYYY")
                                                            : "-"}
                                                    </Cell>
                                                    <Cell>
                                                        {item?.booking?.veh_model?.name ?? "-"}
                                                    </Cell>
                                                    <Cell>
                                                        {item?.booking?.veh_make?.name ?? "-"}
                                                    </Cell>
                                                    <Cell>{item?.booking?.lot_number ?? "-"}</Cell>
                                                    <Cell>{item?.booking?.vin ?? "-"}</Cell>
                                                    <Cell>{item?.booking?.color ?? "-"}</Cell>
                                                    <Cell>
                                                        {item?.vehicle?.arrived_port_date
                                                            ? moment(
                                                                item?.vehicle?.arrived_port_date
                                                            ).format("DD-MMM-YYYY")
                                                            : "-"}
                                                    </Cell>
                                                    <Cell>{parseFloat(item?.client_costing?.shipping_charges).toFixed(2) ?? "-"}</Cell>
                                                    <Cell>{parseFloat(item?.client_costing?.late_fee).toFixed(2) ?? "-"}</Cell>
                                                    <Cell>{parseFloat(item?.client_costing?.storage).toFixed(2) ?? "-"}</Cell>
                                                    <Cell>{parseFloat(item?.client_costing?.category_a).toFixed(2) ?? "-"}</Cell>
                                                    <Cell>{parseFloat(item?.client_costing?.broker_fee).toFixed(2) ?? "-"}</Cell>
                                                    <Cell>{parseFloat(item?.client_costing?.title_fee).toFixed(2) ?? "-"}</Cell>
                                                    <Cell>{parseFloat(item?.client_costing?.other_charge).toFixed(2) ?? "-"}</Cell>
                                                    <Cell>
                                                        {parseFloat(item?.vehicle?.vcc ? parseFloat(item?.vehicle?.vcc?.custom_charges_aed) / currencyExchangeRate : 0).toFixed(2)}
                                                    </Cell>
                                                    <Cell>{parseFloat(item?.vehicle?.vcc ? parseFloat(item?.vehicle?.vcc?.vat_charges_aed) / currencyExchangeRate : 0).toFixed(2)}</Cell>
                                                    <Cell>{parseFloat(item?.client_costing?.subtotal).toFixed(2) ?? "-"}</Cell>

                                                    <Cell>{parseFloat(item?.client_costing?.discount).toFixed(2) ?? "-"}</Cell>
                                                    <Cell> <b>  {parseFloat(item?.client_costing?.total).toFixed(2) ?? "-"} </b></Cell>

                                                    <Cell>
                                                        {" "}
                                                        <b>

                                                            {
                                                                parseFloat(item?.vendor_costing?.shipping_vendor_total).toFixed(2)}
                                                        </b>
                                                    </Cell>
                                                    <Cell>
                                                        {" "}
                                                        <b>

                                                            {parseFloat(parseFloat(item?.client_costing?.total) - parseFloat(item?.vendor_costing?.shipping_vendor_total)).toFixed(2)}
                                                        </b>
                                                    </Cell>
                                                    <Cell>
                                                        {" "}
                                                        <b>

                                                            {parseFloat((parseFloat(parseFloat(item?.client_costing?.total) - parseFloat(item?.vendor_costing?.shipping_vendor_total)) / parseFloat(item?.client_costing?.total)) * 100).toFixed(2)}%
                                                        </b>
                                                    </Cell>
                                                </Row>
                                            );
                                        })}
                                        <Row >

                                            <Cell colSpan={18} >

                                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                    Total Due
                                                </Typography>

                                            </Cell>
                                            <Cell  >

                                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                    {parseFloat(ShippingTotal).toFixed(2)}
                                                </Typography>

                                            </Cell>
                                            <Cell  >

                                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                    {parseFloat(vendorTotal).toFixed(2)}
                                                </Typography>

                                            </Cell>
                                            <Cell  >

                                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                    {parseFloat(ShippingTotal) - parseFloat(vendorTotal)}
                                                </Typography>

                                            </Cell>


                                        </Row>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                </Grid>
                {cashierDetails && (
                    <Grid item md={12}>
                        <Box sx={{ p: 5.5 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: Colors.charcoalGrey,
                                            fontFamily: FontFamily.NunitoRegular,
                                            mt: 4,
                                        }}
                                    >
                                        Cashier
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <InputLabel>Cash in Hand</InputLabel>
                                    <FormControl>
                                        <RadioGroup
                                            row
                                            value={paymentType}
                                            onChange={(e) => setPaymentType(e.target.value)}
                                        >
                                            <FormControlLabel
                                                value="aed"
                                                control={<Radio />}
                                                label="AED"
                                            />
                                            <FormControlLabel
                                                value="usd"
                                                control={<Radio />}
                                                label="USD"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <SelectField
                                        disabled={user?.role_id === 1003 ? true : false}
                                        size={"small"}
                                        label={"Cashier Account"}
                                        options={cashierAccounts}
                                        selected={selectedCashierAccount}
                                        onSelect={(value) => setSelectedCashierAccount(value)}
                                        error={errors?.cash2?.message}
                                        register={register2("cash", {})}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <InputField
                                        size="small"
                                        label={"Applied Amount"}
                                        type={"number"}
                                        defaultValue={"0.00"}
                                        error={errors2?.appliedAmountCashier?.message}
                                        register={register2("appliedAmountCashier", {
                                            onChange: (e) => {
                                                handleAppliedAmountChange();
                                            },
                                        })}
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <InputField
                                        label={"Exchange Rate "}
                                        defaultValue={"3.670"}
                                        size="small"
                                        register={register2("exChangeRate", {
                                            onChange: (
                                                e
                                            ) =>
                                                handleCalc2(
                                                    e
                                                ),
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <InputField
                                        label={"Exchange Loss/Gain"}
                                        value={loss}
                                        disabled={true}
                                        size="small"
                                        register={register2("exChangeLoss", {})}
                                    />
                                </Grid>

                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: Colors.charcoalGrey,
                                            fontFamily: FontFamily.NunitoRegular,
                                            mt: 4,
                                        }}
                                    >
                                        Wallet
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <InputField
                                        label={"Wallet balance "}
                                        disabled={true}
                                        value={walletBalance}
                                        size="small"
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <InputField
                                        label={"Applied Amount"}
                                        type={"number"}
                                        size="small"
                                        defaultValue={"0.00"}
                                        error={errors2?.appliedAmountWallet?.message}
                                        register={register2("appliedAmountWallet", {
                                            onChange: (e) => {
                                                handleAppliedAmountChange();
                                            },
                                        })}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                        <Grid container sm={12}>
                            <Box
                                sx={{
                                    m: 4,
                                    p: 5,
                                    bgcolor: Colors.white,
                                    borderRadius: 3,
                                    boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                    width: "50%",
                                }}
                            >
                                <Grid container>
                                    <Grid xs={12}>
                                        {" "}
                                        <InputField label={"Notes"} />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>

                    </Grid>
                )}
            </Grid>
        </Fragment>
    );
}

export default ShippingProfit;
