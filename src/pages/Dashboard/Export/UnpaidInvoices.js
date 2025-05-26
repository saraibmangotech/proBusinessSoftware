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
    CircularProgress,
    InputLabel,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    TableCell,
    Select,
    MenuItem,
    ListItemText,
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
import ExportFinanceServices from "services/ExportFinance";
import ExportServices from "services/Export";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

function UnpaidInvoices() {
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

    const [cashierDisbled, setCashierDisbled] = useState(false)

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

    const [brokers, setBrokers] = useState([])
    const [agents, setAgents] = useState([])

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

    const [brokerBalance, setBrokerBalance] = useState(0)
    const [agentBalance, setAgentBalance] = useState(0)

    const [totalReceiving, setTotalReceiving] = useState(0)

    const [brokerOptions, setBrokerOptions] = useState([]);
    const [agentOptions, setAgentOptions] = useState([]);
    const [selectedBroker, setSelectedBroker] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);

    const [brokerVault, setbrokerVault] = useState(false)
    const [agentVault, setagentVault] = useState(false)
    // loss
    const [loss, setLoss] = useState(0)
    const [items, setItems] = useState([]);
    const [balances, setBalances] = useState({});
    // *for details
    const [sendDetails, setSendDetails] = useState();

    const [agentId, setAgentId] = useState(null)
    const [brokerId, setbrokerId] = useState(null)



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
        "Checkbox",
        "Inv.#",
        "Shipped Date",
        "Name",
        "Model",
        "Make",
        "VIN#",

        "Applied Status",
        "Net Due",
        "Receiving Amount",
        "Paid",
        "Balance",
    ];


    const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead.length).keys()]);



    const handleColumnChange = (event) => {
        const selectedColumns = event.target.value;
        // Sort the selected columns to maintain the correct order
        const sortedColumns = selectedColumns.sort((a, b) => a - b);
        setVisibleColumns(sortedColumns);
    };

    // *For Clients
    const getClientDropdown = async () => {
        let params = {
            limit: 999999
        }
        try {
            const { data } = await ExportServices.getExportCustomers(params);
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
            parseFloat(getValues2("appliedAmountCashier") || 0) +
            parseFloat(getValues2("appliedAmountWallet") || 0) +
            parseFloat(getValues2("appliedAmountWallet2") || 0)
        console.log(sum);
        console.log(totalReceiving, 'totalReceiving');
        setValue('remainingAmount', parseFloat(totalReceiving) - parseFloat(sum))
        if (parseFloat(sum).toFixed(2) == totalReceiving) {
            setButtonState(true);
        } else {
            setButtonState(false);
        }
    };

    //*For get Broker
    const getBroker = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 100,
                search: search,
                broker_type: "2",
            };
            const { data } = await ExportServices.getExportCustomers(params);
            setBrokerOptions(data?.customers?.rows);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    //*For get Agents
    const getAgent = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 100,
                search: search,
                broker_type: "1",
            };
            const { data } = await ExportServices.getExportCustomers(params);
            setAgentOptions(data?.customers?.rows);
        } catch (error) {
            ErrorToaster(error);
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
                id: value?.vin, // Adding 1 to start the id from 1
                name: value?.vin,
            }));
            const arrayOfObjects1 = data?.details?.lots.map((value, index) => ({
                id: value?.lot, // Adding 1 to start the id from 1
                name: value?.lot,
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

    // *For Get Vendor Center
    const getVendorCenter = async () => {
        setLoader(true)
        let params = {
            limit: 999999
        }
        try {
            const { data } = await ExportServices.getVendorCenter(params)
            setBrokers(data?.brokers)
            setAgents(data?.agents)

        } catch (error) {
            ErrorToaster(error)
        } finally {
            setLoader(false)
        }
    }

    // *For Get Vault Customers
    const getVaultCustomers = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                customer_id: selectedClient?.id,
            };
            const { data } = await FinanceServices.getVaultCustomers(params);

            let findAccount = data?.customers?.rows[0].accounts.find(account => account.type_code === 'L2' && account.primary_series === 50005)

            setWalletBalance(
                findAccount?.total_cr -
                findAccount?.total_dr
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
                limit: 999999
            }
            const { data } = await ExportServices.getPaymentAccounts(params)
            // *Filter only vehicle account
            const vehicleAcc = data?.cashierAccounts?.rows?.filter(e => e.unit === 'Shipping')
            // *1003 is the cashier role ID if the login user is a cashier then show only their account
            if (user?.role_id === 1004) {
                const userId = user?.ref_id.split('-')[1]
                const filterCashier = vehicleAcc.filter(e => e.user_id == userId && e.currency == 'usd')

                setCashierAccounts(filterCashier)
            } else {

                setCashierAccounts(vehicleAcc.filter(e => e.currency == "usd"))
            }
        } catch (error) {
            ErrorToaster(error)
        }
    }
    const [balances1, setBalances1] = useState([]);
    // *For Handle Total Calculation
    const handleCalc = (fieldName, id, currency, val, item) => {

        let sendBalance;
        if (val > 0) {
            setCashierDetails(true);
        } else {
            setCashierDetails(false);
        }

        if (fieldName === "discount") {
            const discountValue = parseFloat(val) || 0;
            const newBalance = parseFloat(item?.price) - discountValue;
            // Create a new object with 'id' and 'balance' fields
            const updatedBalanceObj = {
                id: id,
                balance: newBalance,
            };

            // Store the updated array in a variable
            const updatedBalancesArray = [...balances1, updatedBalanceObj];
            setBalances1(updatedBalancesArray);

            function filterUniqueById(arr) {
                const uniqueObjects = {};

                // Iterate over the array and store the latest object for each id
                arr.forEach(obj => {
                    uniqueObjects[obj.id] = obj;
                });

                // Convert the object back to an array
                const resultArray = Object.values(uniqueObjects);

                return resultArray;
            }
            const resultArray = filterUniqueById(updatedBalancesArray);


            sendBalance = resultArray

            setBalances((prevBalances) => ({
                ...prevBalances,
                [id]: parseFloat(newBalance).toFixed(2),
            }));
        }

        let indexToUpdate = copyClientCosting.findIndex(obj => obj.id === id);

        // Update the "amount" key if the uid is found
        if (indexToUpdate !== -1) {
            copyClientCosting[indexToUpdate].amount = val;

        } else {
            console.log(`Object with uid  not found`);
        }

        let Total = copyClientCosting.reduce((acc, obj) => acc + parseFloat(obj.amount), 0);


        setCopyClientCosting(copyClientCosting)
        setTotalReceiving(Total)


        const resultObjects = copyClientCosting.filter(obj => selectedClientBooking.includes(obj.id));


        const uniqueAgentIds = [...new Set(resultObjects.map(obj => obj.agent_id))];

        // Check if there is only one unique agent_id
        if (uniqueAgentIds.length === 1) {
            if (!uniqueAgentIds[0]) {
                setagentVault(false)
            }
            else {
                let selectedAccount = agents.find(item => item?.id == uniqueAgentIds[0])
                let account = selectedAccount?.accounts.find(item => item?.primary_account_id == "11200017")

                setAgentId(account?.id)
                setAgentBalance(account?.nature === 'credit' ? parseFloat(account?.total_cr_cur ? account?.total_cr_cur : 0) - parseFloat(account?.total_dr_cur ? account?.total_dr_cur : 0) : parseFloat(account?.total_dr_cur ? account?.total_dr_cur : 0) - parseFloat(account?.total_cr_cur ? account?.total_cr_cur : 0))
                setValue('walletBalance', account?.nature === 'credit' ? parseFloat(account?.total_cr_cur ? account?.total_cr_cur : 0) - parseFloat(account?.total_dr_cur ? account?.total_dr_cur : 0) : parseFloat(account?.total_dr_cur ? account?.total_dr_cur : 0) - parseFloat(account?.total_cr_cur ? account?.total_cr_cur : 0))
                setagentVault(true)
            }
        } else {

            setagentVault(false)

        }

        const uniqueBrokerIds = [...new Set(resultObjects.map(obj => obj.broker_id))];

        // Check if there is only one unique agent_id
        if (uniqueBrokerIds.length === 1) {

            if (!uniqueBrokerIds[0]) {
                setbrokerVault(false)
            }
            else {
                let selectedAccount = brokers.find(item => item?.id == uniqueBrokerIds[0])

                let account = selectedAccount?.accounts.find(item => item?.primary_account_id == "11200017")

                setbrokerId(account?.id)
                setBrokerBalance(account?.nature === 'credit' ? parseFloat(account?.total_cr_cur ? account?.total_cr_cur : 0) - parseFloat(account?.total_dr_cur ? account?.total_dr_cur : 0) : parseFloat(account?.total_dr_cur ? account?.total_dr_cur : 0) - parseFloat(account?.total_cr_cur ? account?.total_cr_cur : 0))
                setValue('walletBalance2', account?.nature === 'credit' ? parseFloat(account?.total_cr_cur ? account?.total_cr_cur : 0) - parseFloat(account?.total_dr_cur ? account?.total_dr_cur : 0) : parseFloat(account?.total_dr_cur ? account?.total_dr_cur : 0) - parseFloat(account?.total_cr_cur ? account?.total_cr_cur : 0))
                setbrokerVault(true)
            }
        } else {

            setbrokerVault(false)
        }




        try {



        } catch (error) {
            ErrorToaster(error);
        }
    };

    const addItem = (item) => {
        setItems([item, ...items]);

        setSendDetails([item, ...items]);
    };


    // *For Select and DeSelect client
    const handleSelectClientBooking = (item, id) => {
        try {
            const shallowCopy = [...selectedClientBooking];
            const currentIndex = selectedClientBooking.indexOf(id);
            if (currentIndex === -1) {
                shallowCopy.push(id);
            } else {
                shallowCopy.splice(currentIndex, 1);
            }
            setSelectedClientBooking(shallowCopy);
            const updatedItem = { ...item, applied_amount: 0 };

            addItem(updatedItem);


        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Client Costing
    const getClientCosting = async (page, limit, filter) => {
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
                invoice: true,
            };
            params = { ...params, ...Filter };
            const { data } = await ExportFinanceServices.getUnpaidInvoices(params);

            let totalShippingCharges = 0;
            let totalLateFee = 0;
            let totalStorage = 0;
            let totalCategoryA = 0;
            let totalBrokerFee = 0;
            let totalTitleFee = 0;
            let totalOtherCharges = 0;
            let totalCustomDuty = 0;
            let totalVAT5Percent = 0;
            let totalReceivingAmount = 0;
            let subtotal = 0;
            let total = 0;
            let balance = 0;

            // Iterate through the array and accumulate the shipping charges
            const updatedArray = data?.vehicles?.rows.map(obj => ({
                ...obj,
                amount: 0, // Add your new property and its value here
            }));
            setCopyClientCosting(updatedArray);
            data?.vehicles?.rows.forEach((item) => {
                totalShippingCharges += parseFloat(item?.shipping_charges);
                totalLateFee += parseFloat(item?.late_fee);
                totalStorage += parseFloat(item?.storage);
                totalCategoryA += parseFloat(item?.category_a);
                totalBrokerFee += parseFloat(item?.broker_fee);
                totalTitleFee += parseFloat(item?.title_fee);
                totalOtherCharges += parseFloat(item?.other_charge);
                totalCustomDuty += parseFloat(item?.custom_duty ? parseFloat(item?.custom_duty) : 0);
                totalVAT5Percent += parseFloat(item?.vat ? parseFloat(item?.vat) : 0);
                totalReceivingAmount += parseFloat(item?.receiving_amount);
                subtotal += parseFloat(item?.subtotal);
                balance += parseFloat(item?.invoice?.balance);
                total += parseFloat(item?.total);
            });

            const obj = [
                { value: totalShippingCharges || 0, flag: false },
                { value: totalLateFee || 0, flag: false },
                { value: totalStorage || 0, flag: false },
                { value: totalCategoryA || 0, flag: false },
                { value: totalBrokerFee || 0, flag: false },
                { value: totalTitleFee || 0, flag: false },
                { value: totalOtherCharges || 0, flag: false },

                { value: subtotal || 0, flag: false },
                { value: null || 0, flag: false },
                { value: null || 0, flag: false },
                { value: total || 0, flag: true },

            ];

            setAllSums(obj);

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


            setClientCosting(data?.vehicles?.rows);
            setTotalCount(data?.costings?.count);
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
                vendor_id: selectedAgent ? selectedAgent?.id : selectedBroker?.id
                // vin: selectedVin?.id,
                // lot: selectedLot?.id,
                // container: getValues("container"),
            };
            console.log(selectedClient, selectedAgent, selectedBroker);
            if (selectedClient || selectedAgent || selectedBroker) {

                getClientCosting(1, "", data);

            }
            else {
                ErrorToaster('Please Select Vendor Or Client')
            }
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const handleCalc2 = (e) => {


        setLoss(parseFloat(usdExchangeRate * getValues2('appliedAmountCashier') - getValues2('exChangeRate') * getValues2('appliedAmountCashier')).toFixed(2))

    }

    // *For Update client Costing
    const updateClientCosting = async (formData) => {

        const resultObjects = copyClientCosting.filter(obj => selectedClientBooking.includes(obj.id));

        console.log(resultObjects);
        const transformedData = resultObjects.map((item) => ({
            ev_id: item?.id,
            amount: item?.amount,
            vin: item?.vin,
            make_name: item?.make?.name,
            model_name: item?.model?.name,
            color: item?.color,
            year: item?.year,
            customer_id: item?.customer_id
        }));



        setLoading(true);
        try {
            let obj = {

                vault_amount: getValues2("appliedAmountWallet"),
                cashier_amount: getValues2("appliedAmountCashier"),
                shipping_due: totalReceiving,
                round_off: 0,
                balance_due: totalReceiving,
                customer_id: selectedClient?.id,
                cashier_account_id: selectedCashierAccount?.id,
                broker_vault_id: brokerId,
                agent_vault_id: agentId,
                agent_amount: getValues2('appliedAmountWallet') || 0,
                broker_amount: getValues2('appliedAmountWallet2') || 0,

                vault_account_id: walletId,
                vehicles: transformedData,
            };

            const { message } = await ExportServices.addVehiclePayment(obj);
            SuccessToaster(message);


            navigate('/export-payment-list')
            let data = {
                container_id: selectedClient?.id,
            };
            getClientCosting(1, "", data);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoading(false);
        }
    };

    const renderCellContent = (colIndex, item, isActive) => {

        switch (colIndex) {
            case 0:
                return (
                    <Checkbox
                        checked={isActive}
                        onChange={() => handleSelectClientBooking(item, item?.id)}
                    />
                );
            case 1:
                return ' GEVOTW-' + item?.id ?? "-";
            case 2:
                return item?.date
                    ? moment(
                        item?.date
                    ).format("DD-MMM-YYYY")
                    : "-" ?? "-";

            case 3:
                return item?.customer?.name ?? "-";
            case 4:
                return item?.model?.name ?? "-";
            case 5:
                return item?.make
                    ?.name ?? "-";


            case 6:
                return item?.vin ?? "-";
            case 7:
                return item?.vendor_paid == 0 ? (
                    <Box>
                        <Box
                            sx={{
                                width: "25px",
                                height: "25px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: `1px solid ${Colors.danger}`,
                                borderRadius: "50%",
                            }}
                        >
                            <Close
                                sx={{
                                    fontSize: "18px",
                                    color: Colors.danger,
                                }}
                            />
                        </Box>
                        Unpaid
                    </Box>
                ) : item?.vendor_paid > 0 &&
                    item?.vendor_paid <
                    item?.price ? (
                    <Box>
                        <Box
                            sx={{
                                width: "25px",
                                height: "25px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #25ABE1",
                                borderRadius: "50%",
                            }}
                        >
                            <Check
                                sx={{
                                    fontSize: "18px",
                                    color: "#25ABE1",
                                }}
                            />
                        </Box>
                        Partial
                    </Box>
                ) : (
                    <Box>
                        <Box
                            sx={{
                                width: "25px",
                                height: "25px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: `1px solid ${Colors.primary}`,
                                borderRadius: "50%",
                            }}
                        >
                            <Check
                                sx={{
                                    fontSize: "18px",
                                    color: "#25ABE1",
                                }}
                            />
                        </Box>
                        Paid
                    </Box>
                );
            case 8:
                return parseFloat(item?.price).toFixed(2) ?? "-";
            case 9:
                return isActive ? (
                    <InputField
                        size={"small"}
                        type={"number"}
                        defaultValue={0.0}
                        InputProps={{
                            inputProps: {
                                min: 0,
                            },
                        }}
                        register={register2(
                            `${item?.id}-discount`,
                            {
                                onChange: (e) => {
                                    if (e.target.value > parseFloat(item?.price) - parseFloat(item?.vendor_paid)) {
                                        setValue(`${item?.id}-discount`, parseFloat(parseFloat(item?.price) - parseFloat(item?.vendor_paid)).toFixed(2))
                                    }

                                    handleCalc(
                                        "discount",
                                        item?.id,
                                        item?.shipping_currency,
                                        e.target.value,
                                        item
                                    )

                                }

                            }
                        )}
                        inputStyle={{
                            width: "100px",
                        }}
                    />
                ) : (
                    0.0 ?? "-"
                );
            case 10:
                return <b>
                    USD{" "}
                    {
                        item?.vendor_paid ? parseFloat(item?.vendor_paid).toFixed(2) : parseFloat(0).toFixed(2)}
                </b>;
            case 11:
                return <b>
                    USD{" "}
                    {balances[item?.id] ??
                        parseFloat((item?.price) - parseFloat(item?.vendor_paid)).toFixed(2)}
                </b>;
            default:
                return "-";
        }
    };

    const downloadExcel = () => {
        const headers = tableHead.filter(item => item !== "Checkbox");
        const rows = clientCosting?.map((item) => [
            'GEVOTW-' + item?.id ?? "-",
            item?.date ? moment(item?.date).format("DD-MMM-YYYY") : "-" ?? "-",
            item?.customer?.name ?? "-",
            item?.model?.name ?? "-",
            item?.make?.name ?? "-",
            item?.vin ?? "-",
            item?.vendor_paid == 0 ? "Unpaid" : item?.vendor_paid > 0 && item?.vendor_paid < item?.price ? "Partial" : "Paid",
            parseFloat(item?.price).toFixed(2) ?? "-",
            0.0 ?? "-",
            item?.vendor_paid ? parseFloat(item?.vendor_paid).toFixed(2) : parseFloat(0).toFixed(2),
            balances[item?.id] ?? parseFloat((item?.price) - parseFloat(item?.vendor_paid)).toFixed(2)
        ])

        const totalRow = [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "Total Due",
            totalReceiving ? totalReceiving : parseFloat(0).toFixed(2)
        ]

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRow]);
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
        getClientDropdown();
        getVin();
        getBroker();
        getAgent();
        getPaymentAccounts();
        getCurrencies()
        getVendorCenter()
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
                            my: 4,
                            mr: 4,
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                color: Colors.charcoalGrey,
                                fontFamily: FontFamily.NunitoRegular,
                            }}
                        >
                            Pay Invoice
                        </Typography>
                        {clientCosting?.length > 0 && (
                            <PrimaryButton
                                title={"Download Excel"}
                                onClick={() => downloadExcel()}
                            />
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
                            justifyContent={"space-between"}
                            component={"form"}
                            onSubmit={handleSubmit(applyFilter)}
                        >
                            <Grid item xs={12} md={2.5}>
                                <SelectField
                                    size="small"
                                    label={"Client"}
                                    options={clients}
                                    selected={selectedClient}
                                    onSelect={(value) => {
                                        setSelectedClient(value)
                                        setSelectedAgent(null)
                                        setSelectedBroker(null)
                                    }}
                                    error={errors?.client?.message}
                                    register={register("client")}
                                />
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <SelectField
                                    size={"small"}
                                    label={"Select Agent"}
                                    options={agentOptions}
                                    onSearch={(v) => getAgent(v)}
                                    selected={selectedAgent}
                                    onSelect={(value) => {
                                        setSelectedAgent(value)
                                        setSelectedClient(null)
                                        setSelectedBroker(null)
                                    }}
                                    error={errors?.Agent?.message}
                                    register={register("Agent")}
                                />
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <SelectField
                                    size={"small"}
                                    label={"Select Broker"}
                                    options={brokerOptions}
                                    onSearch={(v) => getBroker(v)}
                                    selected={selectedBroker}
                                    onSelect={(value) => {
                                        setSelectedBroker(value)
                                        setSelectedClient(null)
                                        setSelectedAgent(null)
                                    }}
                                    error={errors?.Broker?.message}
                                    register={register("Broker")}
                                />
                            </Grid>
                            {/* <Grid item xs={12} md={2.5}>
                                <SelectField
                                    size="small"
                                    label={"Vin"}
                                    options={vin}
                                    selected={selectedVin}
                                    onSelect={(value) => {
                                        setSelectedVin(value);
                                    }}
                                    error={errors?.vin?.message}
                                    register={register("vin", {})}
                                />
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <SelectField
                                    size="small"
                                    options={lot}
                                    label={"Lot"}
                                    selected={selectedLot}
                                    onSelect={(value) => setSelectedLot(value)}
                                    error={errors?.lot?.message}
                                    register={register("lot", {})}
                                />
                            </Grid>
                            <Grid item xs={12} md={2.5}>
                                <InputField
                                    size="small"
                                    label={"Container#"}
                                    error={errors?.container?.message}
                                    register={register("container", {})}
                                />
                            </Grid> */}
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
                    {clientCosting.length > 0 && <Grid container mb={2} >
                        <Grid item xs={5}>
                            <FormControl>
                                <InputLabel>Columns</InputLabel>
                                <Select
                                    size={'small'}
                                    multiple
                                    label={'Columns'}
                                    value={visibleColumns}
                                    onChange={handleColumnChange}
                                    renderValue={() => "Show/Hide"}
                                >

                                    {tableHead.map((column, index) => {


                                        if (
                                            column !== 'Checkbox' &&
                                            column !== 'Arrived Date' &&
                                            column !== 'SHIPPING CHARGE' &&
                                            column !== 'LATE FEE' &&
                                            column !== 'STORAGE' &&
                                            column !== 'CATEGORY A' &&
                                            column !== 'BROKER FEE' &&
                                            column !== 'TITLE FEE' &&
                                            column !== 'OTHER CHARGE' &&
                                            column !== 'CUSTOM DUTY' &&
                                            column !== 'VAT' &&
                                            column !== 'TOTAL' &&
                                            column !== 'Discount' &&
                                            column !== 'Net Due' &&
                                            column !== 'Receiving Amount' &&
                                            column !== 'Applied Status' &&
                                            column !== 'Paid' &&
                                            column !== 'Balance'
                                        ) {
                                            return (
                                                <MenuItem key={index} value={index}>
                                                    <Checkbox checked={visibleColumns.includes(index)} />
                                                    <ListItemText primary={column} />
                                                </MenuItem>
                                            );
                                        } else {
                                            return null;
                                        }
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>}

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
                                        <TableRow>
                                            {visibleColumns.map((index) => (
                                                <Cell
                                                    key={index}
                                                    sx={{
                                                        bgcolor: `${index < 9 ? Colors.primary : Colors.blue} !important`,
                                                    }}
                                                >
                                                    {tableHead[index]}
                                                </Cell>
                                            ))}
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {!loader ? (
                                            clientCosting?.length > 0 ? (
                                                <Fragment>
                                                    {clientCosting.map((item, rowIndex) => {
                                                        const isActive = selectedClientBooking.indexOf(item?.id) !== -1;

                                                        return (
                                                            <Row
                                                                key={rowIndex}
                                                                sx={{ bgcolor: rowIndex % 2 !== 0 && "#EFF8E7" }}
                                                            >
                                                                {visibleColumns.map((colIndex) => (
                                                                    <Cell key={colIndex}>
                                                                        {renderCellContent(colIndex, item, isActive)}
                                                                    </Cell>
                                                                ))}
                                                            </Row>
                                                        );
                                                    })}
                                                </Fragment>
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={visibleColumns.length + 1}
                                                        align="center"
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        No Data Found
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={visibleColumns.length + 2}
                                                    align="center"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    <Box className={classes.loaderWrap}>
                                                        <CircularProgress />
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {/* <Row sx={{ bgcolor: "#EEFBEE", p: "10px" }}>
											{[...Array(visibleColumns?.length - 15)].map((_, index) => (
												<Cell key={index} />
											))}
											<Cell>
												<Box
													sx={{
														bgcolor: "#747474",
														border: "1px solid #747474",
														p: "10px 20px",
														textAlign: "center",
														color: Colors.white,
													}}
												>
													Total Due
												</Box>
											</Cell>
											{allSums &&
												allSums.length > 0 &&
												allSums.map((item, index) => (
													<Cell key={index}>
														{item.flag && (
															<Box
																sx={{
																	bgcolor: "#E3E3E3",
																	border: "1px solid #747474",
																	p: "10px 20px",
																	textAlign: "center",
																}}
															>
																{parseFloat(item.value).toFixed(2)}
															</Box>
														)}
													</Cell>
												))}
											<Cell>

												<Box
													sx={{
														bgcolor: "#E3E3E3",
														border: "1px solid #747474",
														p: "10px 20px",
														textAlign: "center",
													}}
												>
													{totalPayment ? totalPayment : 0}
												</Box>

											</Cell>
										</Row> */}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        )}
                        <Box sx={{ my: 4, py: 2, bgcolor: Colors.whiteSmoke }}>
                            <Grid container spacing={1} justifyContent={'flex-end'}>


                                <Grid item xs={12} sm={2.5}>
                                    <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>
                                            Total Due
                                        </Typography>
                                        <Box sx={{ textAlign: 'center', p: 1, width: '130px', bgcolor: Colors.flashWhite, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                                            <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                                                {totalReceiving ? totalReceiving : parseFloat(0).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                            </Grid>
                        </Box>
                    </Box>
                </Grid>
                {
                    cashierDetails && (
                        <Grid item md={12} m={4} mt={0}>
                            <Box sx={{ p: 2 }}>
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

                                    <Grid item xs={12} sm={3}>
                                        <SelectField
                                            disabled={user?.role_id === 1003 ? true : false}
                                            size={"small"}
                                            label={"Cashier Account"}
                                            options={cashierAccounts}
                                            selected={selectedCashierAccount}
                                            onSelect={(value) => setSelectedCashierAccount(value)}
                                            error={errors2?.cash?.message}
                                            register={register2("cash", {
                                                required: cashierDisbled ? "Please select cashier." : false,
                                            })}
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
                                                    setCashierDisbled(e.target.value)
                                                },
                                            })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <InputField
                                            size="small"
                                            disabled={true}
                                            label={"Remaining Amount"}
                                            type={"number"}
                                            defaultValue={"0.00"}
                                            error={errors2?.remainingAmount?.message}
                                            register={register2("remainingAmount")}
                                        />
                                    </Grid>





                                </Grid>

                                {!selectedClient ? <Grid container spacing={3}>
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
                                    {agentVault && selectedAgent && <>    <Grid item xs={12} md={3}>
                                        <InputField
                                            label={"Agent balance "}
                                            disabled={true}

                                            register={register2("walletBalance", {
                                                onChange: (e) => {
                                                    handleAppliedAmountChange();
                                                },
                                            })}
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
                                                        if (e.target.value > getValues2('walletBalance')) {
                                                            setValue('appliedAmountWallet', 0)
                                                        }
                                                    },
                                                })}
                                            />
                                        </Grid> </>}

                                    {brokerVault && selectedBroker && <>
                                        <Grid item xs={12} md={3}>
                                            <InputField
                                                label={"Broker balance "}
                                                disabled={true}
                                                register={register2("walletBalance2", {
                                                    onChange: (e) => {
                                                        handleAppliedAmountChange();

                                                    },
                                                })}
                                                size="small"
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <InputField
                                                label={"Applied Amount"}
                                                type={"number"}
                                                size="small"
                                                defaultValue={"0.00"}
                                                error={errors2?.appliedAmountWallet2?.message}
                                                register={register2("appliedAmountWallet2", {
                                                    onChange: (e) => {
                                                        handleAppliedAmountChange();
                                                        if (e.target.value > getValues2('walletBalance2')) {
                                                            setValue('appliedAmountWallet2', 0)
                                                        }
                                                    },
                                                })}
                                            />
                                        </Grid> </>}
                                </Grid> : ''}

                            </Box>
                            <Grid container sm={12}>
                                <Box
                                    sx={{

                                        p: 2,

                                        borderRadius: 3,

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

                            <Grid item md={11}>
                                <Box
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: "20px",
                                    }}
                                >
                                    <PrimaryButton
                                        type={"submit"}
                                        disabled={!buttonState}
                                        onClick={handleSubmit2(updateClientCosting)}
                                        title="Update"
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    )
                }
            </Grid >
        </Fragment >
    );
}

export default UnpaidInvoices;
