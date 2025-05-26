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
	IconButton,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { EyeIcon, FontFamily } from "assets";
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
import ExchangeRate from "../Finance/ExchangeRate";
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
		background: Colors.primary,
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

function ClientFundsApplication() {
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
		"Inv. Ref",
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

		"TOTAL",
		"Applied Status",
		"Discount",
		"Net Due",
		"Receiving Amount",
		"Paid",
		"Balance",
		'Action'
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
			setValue('exChangeRate', data.currencies[2].conversion_rate)
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
			console.log(data?.customers?.rows[0].accounts);
			let findAccount = data?.customers?.rows[0].accounts.find(account => account.type_code === 'L2' && account.primary_series === 50005)
			console.log(findAccount);
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
	const [balances1, setBalances1] = useState([]);
	// *For Handle Total Calculation
	const handleCalc = (fieldName, id, currency, val, item) => {
		console.log(fieldName, val, item);
		let sendBalance;
		if (val > 0) {
			setCashierDetails(true);
		} else {
			setCashierDetails(false);
		}

		if (fieldName === "discount") {
			const discountValue = parseFloat(val) || 0;

			const newBalance = parseFloat(parseFloat((item?.invoice.shipping_total) - parseFloat(item?.invoice.shipping_paid))) - discountValue;

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

		try {
			console.log('sdasadsdausa')
			const shallowCopy = [...totalAmount];
			const index = totalAmount.findIndex((e) => e.id === id);

			let usd;
			let value = val ? val : 0;
			if (currency === "cad") {
				const aed = value * cadExchangeRate;
				usd = aed / usdExchangeRate;
			}
			if (currency === "aed") {
				usd = value / usdExchangeRate;
			}
			if (currency === "usd") {
				usd = value;
			}

			if (fieldName === "discount") {
				// Subtract the discount value
				usd = -usd;
			}
			console.log(shallowCopy, 'shallowCopy');

			shallowCopy[index][fieldName] = usd;
			let total = 0;
			for (let key in shallowCopy[index]) {
				if (key !== "id" && key !== "discount") {
					total += parseFloat(shallowCopy[index][key]);
				}
			}
			shallowCopy[index].amount = parseFloat(total).toFixed(2);
			setTotalAmount(shallowCopy);
			console.log(sendDetails, 'sendDetails');
			const updatedSendDetails = sendDetails.map((item) => {
				if (item.id === id) {
					// Update the appliedAmount to 5
					item.applied_amount = val;
				}
				return item;
			});
			const updatedDetails = updatedSendDetails.map((detail) => {
				const matchingDiscount = sendBalance.find((balance) => balance.id === detail.id);

				if (matchingDiscount) {
					return {
						...detail,
						invoice: {
							...detail.invoice,
							balance: matchingDiscount.balance,
						},
					};
				}

				return detail;
			});

			setSendDetails(updatedDetails);
			console.log(shallowCopy, 'shallowCopy212121');

			const filteredVariable = shallowCopy.filter((item) =>
				selectedClientBooking.includes(item.id)
			);
			console.log(filteredVariable, 'filteredVariable');

			const subAmount = filteredVariable.reduce(
				(sum, item) => sum + parseFloat(item.discount),
				0
			);
			console.log(subAmount, 'subAmount');

			const absoluteSubAmount = Math.abs(subAmount);

			setTotalPayment(absoluteSubAmount);

			setShowTotal(true);
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
			const { data } = await ClientServices.getClientCosting(params);

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
			if (data?.costings?.rows?.length == 0) {
				ErrorToaster("No Data Found")

			}
			let allData = data?.costings?.rows.forEach((item) => {
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
				subtotal += (parseFloat(item?.shipping_charges) + parseFloat(item?.late_fee) + parseFloat(item?.storage) + parseFloat(item?.category_a) + parseFloat(item?.broker_fee) + parseFloat(item?.title_fee) + parseFloat(item?.other_charge));
				balance += parseFloat(item?.invoice?.shipping_total) - parseFloat(item?.invoice?.shipping_paid);
				total += parseFloat(item?.invoice?.shipping_total);
				console.log(parseFloat(item?.shipping_charges) + parseFloat(item?.late_fee));
			});
			console.log(totalShippingCharges, totalLateFee,);
			console.log(subtotal, 'allData');
			const obj = [
				{ value: totalShippingCharges || 0, flag: true },
				{ value: totalLateFee || 0, flag: true },
				{ value: totalStorage || 0, flag: true },
				{ value: totalCategoryA || 0, flag: true },
				{ value: totalBrokerFee || 0, flag: true },
				{ value: totalTitleFee || 0, flag: true },
				{ value: totalOtherCharges || 0, flag: true },

				{ value: subtotal || 0, flag: true },
				{ value: null || 0, flag: false },
				{ value: null || 0, flag: false },
				{ value: total || 0, flag: true },

			];

			setAllSums(obj);

			const shallowCopy = [];
			const clientCostArray = [];

			data?.costings?.rows.forEach((e) => {
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
					balance: parseFloat(e?.invoice?.shipping_total) - parseFloat(e?.invoice?.shipping_paid),
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
					copyClientCost.balance = parseFloat(e?.invoice?.shipping_total) - parseFloat(e?.invoice?.shipping_paid);
				}

				shallowCopy.push(obj);
				clientCostArray.push(copyClientCost);
			});
			reset();
			setTotalAmount(shallowCopy);

			setCopyClientCosting(clientCostArray);
			setClientCosting(data?.costings?.rows);
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
				vin: selectedVin?.id,
				lot: selectedLot?.id,
				container: getValues("container"),
			};

			getClientCosting(1, "", data);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	const handleCalc2 = (e) => {


		setLoss(parseFloat(usdExchangeRate * getValues2('appliedAmountCashier') - getValues2('exChangeRate') * getValues2('appliedAmountCashier')).toFixed(2))

	}

	// *For Update client Costing
	const updateClientCosting = async (formData) => {
		setButtonState(false)
		console.log(sendDetails);
		const transformedData = sendDetails.map((item) => ({
			applied_amount: item?.applied_amount,
			paid: item?.invoice.paid ? parseFloat(item?.invoice.paid) + parseFloat(item?.applied_amount) : parseFloat(item?.applied_amount),
			balance: item?.invoice.balance,
			costing_id: item?.invoice.costing_id,
			invoice_id: item?.invoice.id,
			container_no: item?.vehicle.container_no,
			vehicle_make: item?.booking.veh_make.name,
			vehicle_model: item?.booking.veh_model.name,
			vin: item?.booking.vin,
			lot_number: item?.booking.lot_number,
			color: item?.booking.color,
			customer_id: item?.booking?.customer?.id,
			customer_phone: item?.booking?.customer?.uae_phone,

		}));

		const uniqueTransformedData = transformedData.reduce(
			(acc, item) => {
				if (!acc.idSet.has(item.invoice_id)) {
					acc.idSet.add(item.invoice_id);
					acc.result.push(item);
				}
				return acc;
			},
			{ result: [], idSet: new Set() }
		).result;

		setLoading(true);
		try {
			let obj = {
				vault_amount: getValues2("appliedAmountWallet"),
				cash_amount: getValues2("appliedAmountCashier"),
				customer_id: selectedClient?.id,
				ex_rate: getValues2("exChangeRate"),
				ex_loss: loss,
				cash_account_id: selectedCashierAccount?.id,
				account_name: selectedCashierAccount?.name,
				vault_account_id: walletId,
				details: uniqueTransformedData,
			};
			console.log(selectedCashierAccount, 'objobjobj');
			console.log(obj, 'objobjobj');
			const { message } = await ClientServices.updateFundsApply(obj);
			SuccessToaster(message);


			navigate('/shipping-payment-received-applied')
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
				return ' GSI-' + item?.invoice?.id ?? "-";
			case 2:
				return item?.booking?.purchase_date
					? moment(
						item?.booking?.purchase_date
					).format("DD-MMM-YYYY")
					: "-" ?? "-";

			case 3:
				return item?.booking?.veh_model?.name ?? "-";
			case 4:
				return item?.booking?.veh_make?.name ?? "-";
			case 5:
				return item?.booking
					?.lot_number ?? "-";
			case 6:
				return item?.booking
					?.vin ?? "-";
			case 7:
				return item?.booking?.color ?? "-";
			case 8:
				return item?.vehicle?.arrived_port_date
					? moment(
						item?.vehicle?.arrived_port_date
					).format("DD-MMM-YYYY")
					: "-";
			case 9:
				return parseFloat(item?.shipping_charges).toFixed(2) ?? "-";
			case 10:
				return parseFloat(item?.late_fee).toFixed(2) ?? "-";
			case 11:
				return parseFloat(item?.storage).toFixed(2) ?? "-";
			case 12:
				return parseFloat(item?.category_a).toFixed(2) ?? "-";
			case 13:
				return parseFloat(item?.broker_fee).toFixed(2) ?? "-";
			case 14:
				return parseFloat(item?.title_fee).toFixed(2) ?? "-";
			case 15:
				return parseFloat(item?.other_charge).toFixed(2) ?? "-";

			case 16:
				return (parseFloat(item?.shipping_charges) + parseFloat(item?.late_fee) + parseFloat(item?.storage) + parseFloat(item?.category_a) + parseFloat(item?.broker_fee) + parseFloat(item?.title_fee) + parseFloat(item?.other_charge)) ?? "-";
			case 17:
				return item?.invoice?.paid == 0 ? (
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
				) : item?.invoice?.paid > 0 &&
					item?.invoice?.paid <
					item?.invoice?.total ? (
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
			case 18:
				return parseFloat(item?.discount).toFixed(2) ?? "-";
			case 19:
				return parseFloat(item?.invoice.shipping_total).toFixed(2) ?? "-";
			case 20:
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
									if (e.target.value > parseFloat(item?.invoice?.balance)) {
										setValue(`${item?.id}-discount`, parseFloat(item?.invoice?.balance).toFixed(2))
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
			case 21:
				return <b>
					USD{" "}
					{
						parseFloat(item?.invoice?.shipping_paid).toFixed(2)}
				</b>;
			case 22:
				return <b>
					USD{" "}
					{balances[item?.id] ??
						parseFloat(item?.invoice?.shipping_total) - parseFloat(item?.invoice?.shipping_paid)}
				</b>;
			case 23:
				return <Box
					onClick={item?.invoice ? () =>
						navigate(
							`/client-invoice-detail/${item?.invoice?.id}`,
							{
								state: {
									shipping: true,
								},
							}
						)
						: () => { ErrorToaster('Invoice Not Available') }
					}
				>
					<IconButton
						sx={{
							bgcolor:
								Colors.primary,
							"&:hover": {
								bgcolor:
									Colors.primary,
							},
						}}
					>
						<EyeIcon />
					</IconButton>
					<Typography variant="body2">
						View
					</Typography>
				</Box>;
			default:
				return "-";
		}
	};

	const downloadExcel = () => {
		const headers = tableHead.filter((item) => item !== "Checkbox" && item !== "Action");
		const rows = clientCosting?.map((item) => [
			' GSI-' + item?.invoice?.id ?? "-",
			item?.booking?.purchase_date ? moment(item?.booking?.purchase_date).format("DD-MMM-YYYY") : "-" ?? "-",
			item?.booking?.veh_model?.name ?? "-",
			item?.booking?.veh_make?.name ?? "-",
			item?.booking?.lot_number ?? "-",
			item?.booking?.vin ?? "-",
			item?.booking?.color ?? "-",
			item?.vehicle?.arrived_port_date ? moment(item?.vehicle?.arrived_port_date).format("DD-MMM-YYYY") : "-",
			parseFloat(item?.shipping_charges).toFixed(2) ?? "-",
			parseFloat(item?.late_fee).toFixed(2) ?? "-",
			parseFloat(item?.storage).toFixed(2) ?? "-",
			parseFloat(item?.category_a).toFixed(2) ?? "-",
			parseFloat(item?.broker_fee).toFixed(2) ?? "-",
			parseFloat(item?.title_fee).toFixed(2) ?? "-",
			parseFloat(item?.other_charge).toFixed(2) ?? "-",
			(parseFloat(item?.shipping_charges)
				+ parseFloat(item?.late_fee)
				+ parseFloat(item?.storage)
				+ parseFloat(item?.category_a)
				+ parseFloat(item?.broker_fee)
				+ parseFloat(item?.title_fee)
				+ parseFloat(item?.other_charge)) ?? "-",
			item?.invoice?.paid == 0
				? "Unpaid"
				: item?.invoice?.paid > 0 && item?.invoice?.paid < item?.invoice?.total
					? "Partial"
					: "Paid",
			parseFloat(item?.discount).toFixed(2) ?? "-",
			parseFloat(item?.invoice.shipping_total).toFixed(2) ?? "-",
			0.0 ?? "-",
			`USD ${parseFloat(item?.invoice?.shipping_paid).toFixed(2)}`,
			`USD ${balances[item?.id] ?? parseFloat(item?.invoice?.shipping_total) - parseFloat(item?.invoice?.shipping_paid)}`
		])

		let sum = [];
		allSums?.forEach((item, i) => {
			sum.push(item.flag == true ? parseFloat(item.value).toFixed(2) : "")
		})
		const totalRow = [
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"Total",
			...sum,
			totalPayment ? totalPayment : 0
		];
		console.log("🚀 ~ downloadExcel ~ totalRow:", totalRow)

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
							}}
						>
							Rcv-Apply Shipping
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
									error={errors?.client?.message}
									onSelect={(value) => {
										setSelectedClient(value);
									}}
									register={register("client", {
										required: "Please select client.",
									})}
								/>
							</Grid>

							<Grid item xs={12} md={2.5}>
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
										<Row sx={{ bgcolor: "#EEFBEE", p: "10px" }}>
											{[...Array(visibleColumns?.length - 16)].map((_, index) => (
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
										label={"Applied Amount (Cash)"}
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
										defaultValue={currencyExchangeRate}
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
										label={"Applied Amount (Vault)"}
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
				)}
			</Grid>
		</Fragment>
	);
}

export default ClientFundsApplication;
