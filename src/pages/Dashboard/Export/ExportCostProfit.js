import React, { Fragment, useState, useEffect, useRef } from "react";
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
import ExportServices from "services/Export";
import ExportFinanceServices from "services/ExportFinance";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CommaSeparator, handleExportWithComponent } from "utils";
import { PDFExport } from "@progress/kendo-react-pdf";

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
        padding: '5px !important',

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

function ExportCostProfit() {
    const { user } = useAuth();
    const navigate = useNavigate()
    const contentRef = useRef(null);

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
        "Date",
        "Country Name",
        "Manifest Number",
        "Number Of Cars",
        "Total USD",
        "Per Car",
        "Broker Charges",
        "Agent Charges",
        "Galaxy Charges",
        "Profit Per Car",
        "Total Profit",

    ];

    // *For Clients
    const getCountryDropdown = async () => {
        try {
            const { data } = await ExportServices.getCountryDropdown();
            setClients(data?.countries);
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
                limit: 999999,
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
            const { data } = await ExportFinanceServices.getCostProfit(params);

            let totalClientCosting = 0;
            let totalVendorCosting = 0;


            // Iterate through the array and accumulate the shipping charges

            data?.costing.forEach((item) => {
                totalClientCosting += parseFloat(item?.client_costing?.total);
                totalVendorCosting += parseFloat(item?.vendor_costing?.shipping_vendor_total);

            });

            setShippingTotal(totalClientCosting)
            setVendorTotal(totalVendorCosting)

            // setAllSums(balance);

            const shallowCopy = [];
            const clientCostArray = [];

            data?.costing.forEach((e) => {
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
            setClientCosting(data?.costing);
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
                country_id: selectedClient?.id,

            };

            getShippingProfit(1, "", data);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const handleCalc2 = (e) => {


        setLoss(parseFloat(usdExchangeRate * getValues2('appliedAmountCashier') - getValues2('exChangeRate') * getValues2('appliedAmountCashier')).toFixed(2))

    }

    const downloadExcel = () => {
        const headers = tableHead;
        const rows = clientCosting?.map((item) => [
            item?.created_at ? moment(item?.created_at).format("DD-MMM-YYYY") : "-",
            item?.country?.name ?? "-",
            item?.manifest ?? "-",
            item?.vehicle_qty ?? "-",
            parseFloat(item?.total_usd).toFixed(2) ?? "-",
            parseFloat(parseFloat(item?.total_usd) / parseFloat(item?.vehicle_qty)).toFixed(2) ?? "-",
            parseFloat(item?.broker_charges).toFixed(2) ?? "-",
            parseFloat(item?.agent_charges).toFixed(2) ?? "-",
            parseFloat(item?.galaxy_charges).toFixed(2) ?? "-",
            parseFloat(item?.profit_per_vehicle).toFixed(2) ?? "-",
            parseFloat(item?.total_profit).toFixed(2) ?? "-"
        ])

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const buf = XLSX.write(wb, {
            bookType: "xlsx",
            type: "array",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(new Blob([buf]), "data.xlsx");
    };



    useEffect(() => {
        if (paymentType) {
            const cashierDetail = cashierAccounts.find(e => e.currency === paymentType)
            setValue('cash', cashierDetail?.name)
            setSelectedCashierAccount(cashierDetail)
        }
    }, [paymentType]);

    useEffect(() => {
        getCountryDropdown();

        getPaymentAccounts();
        getCurrencies()
    }, []);

    return (
        <Fragment>
            <Grid container spacing={1} alignItems={"center"} justifyContent={"center"}>
                <Grid item xs={12} sm={12} md={11}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mr: 4,
                            my: 4,
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                color: Colors.charcoalGrey,
                                fontFamily: FontFamily.NunitoRegular,
                                ml: "5px",
                            }}
                        >
                            Cost & Profit
                        </Typography>
                        {clientCosting?.length > 0 && (
                            <Box sx={{
                                textAlign: "right", p: 4, display: "flex", gap: 2

                            }}>
                                <PrimaryButton
                                    title="Download PDF"
                                    type="button"
                                    style={{ backgroundColor: Colors.bluishCyan }}
                                    onClick={() => handleExportWithComponent(contentRef)}
                                />
                                <PrimaryButton
                                    title={"Download Excel"}
                                    onClick={() => downloadExcel()}
                                />
                            </Box>
                        )}
                    </Box>
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
                                    label={"Select Country"}
                                    options={clients}
                                    selected={selectedClient}
                                    onSelect={(value) => setSelectedClient(value)}
                                    error={errors?.client?.message}
                                    register={register("client", {
                                        required: "Please select Country.",
                                    })}
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
                            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                                fileName="Cost & Profit"
                            >
                                <Box className='pdf-show' sx={{ display: 'none' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                            Cost & Profit
                                        </Typography>
                                        <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                                    </Box>
                                </Box>
                                <TableContainer
                                    // component={Paper}
                                    sx={{
                                        // boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                        borderRadius: 2,
                                        maxWidth: "calc(100vw - 330px)",

                                    }}
                                    className="table-box"
                                >
                                    <Table stickyHeader sx={{ minWidth: 500 }}>
                                        <TableHead>
                                            <Row>
                                                {tableHead.map((cell, index) => (
                                                    <Cell className="pdf-table"
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


                                                        <Cell className="pdf-table">
                                                            {item?.created_at
                                                                ? moment(
                                                                    item?.created_at
                                                                ).format("DD-MMM-YYYY")
                                                                : "-"}
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            {item?.country?.name ?? "-"}
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            {item?.manifest ?? "-"}
                                                        </Cell>
                                                        <Cell className="pdf-table">{item?.vehicle_qty ?? "-"}</Cell>
                                                        <Cell className="pdf-table">{parseFloat(item?.total_usd).toFixed(2) ?? "-"}</Cell>
                                                        <Cell className="pdf-table">{parseFloat(parseFloat(item?.total_usd) / parseFloat(item?.vehicle_qty)).toFixed(2) ?? "-"}</Cell>
                                                        <Cell className="pdf-table">
                                                            {CommaSeparator(parseFloat(item?.broker_charges).toFixed(2)) ?? "-"}
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            {CommaSeparator(parseFloat(item?.agent_charges).toFixed(2)) ?? "-"}
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            {CommaSeparator(parseFloat(item?.galaxy_charges).toFixed(2)) ?? "-"}
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            {CommaSeparator(parseFloat(item?.profit_per_vehicle).toFixed(2)) ?? "-"}
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            {CommaSeparator(parseFloat(item?.total_profit).toFixed(2)) ?? "-"}
                                                        </Cell>

                                                    </Row>
                                                );
                                            })}

                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </PDFExport>
                        )}
                    </Box>
                </Grid>
                {cashierDetails && (
                    <Grid item md={12}>
                        <Box sx={{ p: 5.5 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography className="pdf-table"
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
                                    <InputLabel className="pdf-table">Cash in Hand</InputLabel>
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

export default ExportCostProfit;
