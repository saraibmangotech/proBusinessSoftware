import React, { Fragment, useEffect, useState } from "react";
import {
	Grid,
	Box,
	Checkbox,
	Typography,
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	Paper,
	tableCellClasses,
	CircularProgress,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	ListItemText,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import VendorServices from "services/Vendor";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import { CircleLoading } from "components/Loaders";
import InputField from "components/Input";
import Pagination from "components/Pagination";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import moment from "moment/moment";
import { findDifferences } from "utils";
import { useSelector } from "react-redux";
import { EditNote } from "@mui/icons-material";
import EditNotesVendor from "components/Dialog/EditNotesVendor";
import { useLocation } from "react-router-dom";
import CurrencyServices from "services/Currency";
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

function VendorCosting() {
	const { state } = useLocation();


	const classes = useStyles();
	const { usdExchangeRate, cadExchangeRate } = useSelector((state) => state.navigationReducer);

	const tableHead = [
		"Select",
		"Purchase Date",
		"Model",
		"Make",
		"LOT#",
		"VIN#",
		"Color",
		"Loading Location",
		"Container#",
		"Arrived Date",
		"Shipping Charges",
		"Towing",
		"Clearance",
		"Late Fee",
		"Storage",
		"Category A",
		"Broker Fee",
		"Title Fee",
		"Inspection",
		"Other Charges",
		"Custom Duty",
		"Total",
		"Notes",
	];

	const {
		register,
		handleSubmit,
		getValues,
		setValue,
		formState: { errors },
	} = useForm();
	const { register: register2, handleSubmit: handleSubmit2, getValues: getValues2, reset } = useForm();

	const [loader, setLoader] = useState(false);
	const [loading, setLoading] = useState(false);
	//for table ID
	const [tableId, setTableId] = useState()

	// *For Vendor Dropdown
	const [vendors, setVendors] = useState([]);
	const [selectedVendor, setSelectedVendor] = useState(null);
	const [selectedVendorBooking, setSelectedVendorBooking] = useState([]);

	// *For Vendor Costing
	const [vendorCosting, setVendorCosting] = useState();
	const [copyVendorCosting, setCopyVendorCosting] = useState();

	// *For Pagination
	const [totalCount, setTotalCount] = useState(0);
	const [pageLimit, setPageLimit] = useState(50);
	const [currentPage, setCurrentPage] = useState(1);

	// *For Filters
	const [filters, setFilters] = useState({});

	// *For Total Amount
	const [totalAmount, setTotalAmount] = useState([]);


	const [isDialogOpen, setDialogOpen] = useState(false);

	const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);
	// *For Currencies
	const [currencyExchangeRate, setCurrencyExchangeRate] = useState();

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

	const handleColumnChange = (event) => {
		const selectedColumns = event.target.value;
		// Sort the selected columns to maintain the correct order
		const sortedColumns = selectedColumns.sort((a, b) => a - b);
		setVisibleColumns(sortedColumns);
	};

	const handleOpenDialog = (item) => {

		setTableId(item)
		setDialogOpen(true);

	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
	};

	// *For Vendor
	const getVendorDropdown = async () => {
		try {
			const { data } = await VendorServices.getVendorDropdown();
			setVendors(data?.vendors);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Vendor Costing
	const getVendorCosting = async (page, limit, filter) => {

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
			const { data } = await VendorServices.getVendorCosting(params);
			setTotalCount(data?.costings?.count);
			setVendorCosting(data?.costings?.rows);
			const shallowCopy = [];
			const vendorCostArray = [];
			data?.costings?.rows.forEach((e) => {
				const date = moment(e?.vehicle?.vcc?.vcc_expiry_date).format(
					"MM-DD-YYYY"
				);

				const targetDate = moment(date, "MM-DD-YYYY");
				let daysRemaining = targetDate > moment()

				let val =
					parseFloat(e?.shipping_charges) +
					parseFloat(e?.late_fee) +
					parseFloat(e?.storage) +
					parseFloat(e?.category_a) +
					parseFloat(e?.broker_fee) +
					parseFloat(e?.title_fee) +
					parseFloat(e?.inspection) +
					parseFloat(e?.other_charges) +

					parseFloat(
						!e?.vehicle?.vcc?.exit_paper_received && !e?.vehicle?.vcc?.makasa_received && !e?.vehicle?.mobaya_issued_date && daysRemaining
							? parseFloat(0).toFixed(2) : !e?.vehicle?.vcc?.exit_paper_received && !e?.vehicle?.vcc?.makasa_received && !e?.vehicle?.mobaya_issued_date && !daysRemaining ? e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0 : e?.vehicle?.vcc?.exit_paper_received && daysRemaining ? parseFloat(0).toFixed(2) : e?.vehicle?.vcc?.makasa_received ? e?.custom_duty == 0 ? e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0 : e?.custom_duty
								: e?.vehicle?.mobaya_issued_date ? parseFloat(e?.custom_duty) == 0 ? e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0 : e?.custom_duty : e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0
					);
				let copyVendorCost = {
					costing_id: e?.id,
				};
				console.log(val, 'valvalval');
				let obj = {
					id: e?.id,
					shipping_charges: e?.shipping_charges,
					late_fee: e?.late_fee,
					storage: e?.storage,
					category_a: e?.category_a,
					broker_fee: e?.broker_fee,
					title_fee: e?.title_fee,
					inspection: e?.inspection,

					other_charges: e?.other_charges,
					custom_duty: parseFloat(
						!e?.vehicle?.vcc?.exit_paper_received && !e?.vehicle?.vcc?.makasa_received && !e?.vehicle?.mobaya_issued_date && daysRemaining
							? parseFloat(0).toFixed(2) : !e?.vehicle?.vcc?.exit_paper_received && !e?.vehicle?.vcc?.makasa_received && !e?.vehicle?.mobaya_issued_date && !daysRemaining ? e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0 : e?.vehicle?.vcc?.exit_paper_received && daysRemaining ? parseFloat(0).toFixed(2) : e?.vehicle?.vcc?.makasa_received ? e?.custom_duty == 0 ? e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0 : e?.custom_duty
								: e?.vehicle?.mobaya_issued_date ? parseFloat(e?.custom_duty) == 0 ? e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0 : e?.custom_duty : e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0
					),
				};

				if (e?.towing_currency === "cad") {
					const aed = parseFloat(e?.towing_charges) * cadExchangeRate;
					const usd = aed / usdExchangeRate;
					val += usd;
					obj.towing_charges = usd;
				}
				if (e?.towing_currency === "aed") {
					const usd = parseFloat(e?.towing_charges) / usdExchangeRate;
					val += usd;
					obj.towing_charges = usd;
				}
				if (e?.towing_currency === "usd") {
					const usd = parseFloat(e?.towing_charges);
					val += usd;
					obj.towing_charges = usd;
				}
				if (e?.clearance_currency === "cad") {
					const aed = e?.clearance_charges * cadExchangeRate;
					const usd = aed / usdExchangeRate;
					val += usd;
					obj.clearance_charges = usd;
				}
				if (e?.clearance_currency === "aed") {
					const usd = e?.clearance_charges / usdExchangeRate;
					val += usd;
					obj.clearance_charges = usd;
				}
				if (e?.clearance_currency === "usd") {
					const usd = e?.clearance_charges;
					val += usd;
					obj.clearance_charges = usd;
				}

				obj.amount = val.toFixed(2);

				if (selectedVendor?.type === "shipping") {
					copyVendorCost.shipping_charges = e?.shipping_charges;
					copyVendorCost.late_fee = e?.late_fee;
					copyVendorCost.storage = e?.storage;
					copyVendorCost.category_a = e?.category_a;
					copyVendorCost.broker_fee = e?.broker_fee;
					copyVendorCost.title_fee = e?.title_fee;
					copyVendorCost.inspection = e?.inspection;
					copyVendorCost.other_charges = e?.other_charges;
					copyVendorCost.custom_duty = parseFloat(
						!e?.vehicle?.vcc?.exit_paper_received && !e?.vehicle?.vcc?.makasa_received && !e?.vehicle?.mobaya_issued_date && daysRemaining
							? parseFloat(0).toFixed(2) : !e?.vehicle?.vcc?.exit_paper_received && !e?.vehicle?.vcc?.makasa_received && !e?.vehicle?.mobaya_issued_date && !daysRemaining ? e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0 : e?.vehicle?.vcc?.exit_paper_received && daysRemaining ? parseFloat(0).toFixed(2) : e?.vehicle?.vcc?.makasa_received ? e?.custom_duty == 0 ? e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0 : e?.custom_duty
								: e?.vehicle?.mobaya_issued_date ? parseFloat(e?.custom_duty) == 0 ? e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0 : e?.custom_duty : e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0
					);
					copyVendorCost.towing_charges = e?.towing_charges;
				}
				if (selectedVendor?.type === "towing") {
					copyVendorCost.towing_charges = e?.towing_charges;
				}

				if (selectedVendor?.type === "clearance") {
					copyVendorCost.clearance_charges = e?.clearance_charges;
				}

				shallowCopy.push(obj);
				vendorCostArray.push(copyVendorCost);

			});
			reset();
			setTotalAmount(shallowCopy);
			setCopyVendorCosting(vendorCostArray);
		} catch (error) {
			ErrorToaster(error);
		} finally {
			setLoader(false);
		}
	};

	// *For Select and DeSelect Vendor
	const handleSelectVendorBooking = (id) => {
		try {
			const shallowCopy = [...selectedVendorBooking];
			const currentIndex = selectedVendorBooking.indexOf(id);
			if (currentIndex === -1) {
				shallowCopy.push(id);
			} else {
				shallowCopy.splice(currentIndex, 1);
			}
			setSelectedVendorBooking(shallowCopy);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Apply Filters
	const applyFilter = async () => {
		try {

			let data = {
				vendor_id: selectedVendor?.id,
				country_id: selectedVendor?.country_id,
				type: selectedVendor?.type,
				container: getValues('container'),
				vin: getValues('vin'),
				lot: getValues('lot'),
			};
			getVendorCosting(1, "", data);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	const [valuesObject, seValuesObject] = useState([])
	let arrayOfObjects = [...valuesObject]
	// Function to add or update values in the array
	function addOrUpdateValue(id, value, value2) {
		// Check if the id already exists in the array
		const index = arrayOfObjects.findIndex(obj => obj.id === id);

		// If the id exists, update the value
		if (index !== -1) {
			arrayOfObjects[index].value = value;
			arrayOfObjects[index].value2 = value2;
		} else {
			// If the id doesn't exist, add a new object
			arrayOfObjects.push({ id, value, value2 });
		}
	}


	// *For Handle Total Calculation
	const handleCalc = (fieldName, id, currency, val, item) => {


		const ids = id;
		const values = getValues2(`${ids}-category_a`);
		const values2 = getValues2(`${ids}-broker_fee`);


		addOrUpdateValue(ids, values, values2);

		seValuesObject(arrayOfObjects)


		try {
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
			shallowCopy[index][fieldName] = usd;

			if (!shallowCopy[index].conditionApplied && item?.booking?.buyer?.type == "A") {
				shallowCopy[index].category_a = parseFloat(shallowCopy[index].category_a);


				shallowCopy[index].conditionApplied = true;
			}

			if (!shallowCopy[index].conditionApplied2 && item?.booking?.buyer?.type == "B") {

				shallowCopy[index].broker_fee = parseFloat(shallowCopy[index].broker_fee);


				shallowCopy[index].conditionApplied2 = true;
			}



			let total = 0;
			for (let key in shallowCopy[index]) {
				if (key !== "id" && key !== "amount" && key !== "conditionApplied" && key !== "conditionApplied2") {
					total += parseFloat(shallowCopy[index][key]);

				}
			}
			shallowCopy[index].amount = parseFloat(total).toFixed(2);

			setTotalAmount(shallowCopy);

		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Update Vendor Costing
	const updateVendorCosting = async (formData) => {
		setLoading(true);
		try {
			const costings = [];
			let costingId = Object.keys(formData)[0].split("-")[0];

			let costObj = {};

			for (let key in formData) {

				const costingDetail = vendorCosting.find((e) => e.id == costingId);

				if (costingId === key.split("-")[0]) {
					const objKey = key.split("-")[1];
					costObj["costing_id"] = costingId;
					costObj["vendor_type"] = selectedVendor?.type;
					costObj["vendor_account_id"] = selectedVendor?.account_id;
					costObj["container_no"] = costingDetail?.shipping?.container_no;
					costObj["vehicle_make"] = costingDetail?.booking?.veh_make?.name;
					costObj["vehicle_model"] = costingDetail?.booking?.veh_model?.name;
					costObj["vin"] = costingDetail?.booking?.vin;
					costObj["lot_number"] = costingDetail?.booking?.lot_number;
					costObj["color"] = costingDetail?.booking?.color;
					costObj["loading_port"] = costingDetail?.shipping?.loading_port?.name;
					costObj["location"] = costingDetail?.shipping?.location
						? `${costingDetail?.shipping?.location?.state_code}-${costingDetail?.shipping?.location?.city_name}`
						: null;
					costObj["country_code"] = costingDetail?.shipping?.location
						? costingDetail?.shipping?.location?.country_code
						: null;
					costObj["destination"] = costingDetail?.shipping?.dest?.name;
					costObj["galaxy_arrival_date"] = costingDetail?.vehicle?.arrived_galaxy_date;
					costObj[objKey] = formData[key] === "" ? 0 : formData[key];
				} else {
					costings.push(costObj);
					costingId = key.split("-")[0];
					costObj = {};
					const objKey = key.split("-")[1];
					costObj["costing_id"] = costingId;
					costObj["vendor_type"] = selectedVendor?.type;
					costObj["vendor_account_id"] = selectedVendor?.account_id;
					costObj["container_no"] = costingDetail?.shipping?.container_no;
					costObj["vehicle_make"] = costingDetail?.booking?.veh_make?.name;
					costObj["vehicle_model"] = costingDetail?.booking?.veh_model?.name;
					costObj["vin"] = costingDetail?.booking?.vin;
					costObj["lot_number"] = costingDetail?.booking?.lot_number;
					costObj["color"] = costingDetail?.booking?.color;
					costObj["loading_port"] = costingDetail?.shipping?.loading_port?.name;
					costObj["location"] = costingDetail?.shipping?.location
						? `${costingDetail?.shipping?.location?.state_code}-${costingDetail?.shipping?.location?.city_name}`
						: null;
					costObj["country_code"] = costingDetail?.shipping?.location
						? costingDetail?.shipping?.location?.country_code
						: null;
					costObj["destination"] = costingDetail?.shipping?.dest?.name;
					costObj["galaxy_arrival_date"] = costingDetail?.vehicle?.arrived_galaxy_date;
					costObj[objKey] = formData[key] === "" ? 0 : formData[key];
				}
			}
			costings.push(costObj);
			const costShallowCopy = [...costings];
			let newArray = costShallowCopy.map(
				({
					vendor_type,
					vendor_account_id,
					container_no,
					vehicle_make,
					vehicle_model,
					vin,
					lot_number,
					color,
					location,
					country_code,
					destination,
					galaxy_arrival_date,
					...rest
				}) => rest
			);

			const difference = findDifferences(newArray, copyVendorCosting);

			const newArr = [];
			difference.forEach((e) => {
				if (selectedVendorBooking.indexOf(parseInt(e?.costing_id)) !== -1) {
					const findData = costings.find((j) => j?.costing_id === e?.costing_id);

					let obj = {
						...e,
						vendor_type: findData?.vendor_type,
						vendor_account_id: findData?.vendor_account_id,
						container_no: findData?.container_no,
						vehicle_make: findData?.vehicle_make,
						vehicle_model: findData?.vehicle_model,
						vin: findData?.vin,
						lot_number: findData?.lot_number,
						color: findData?.color,
						loading_port: findData?.loading_port,
						location: findData?.location,
						country_code: findData?.country_code,
						destination: findData?.destination,
						galaxy_arrival_date: findData?.galaxy_arrival_date,

					};

					newArr.push(obj);
				}
			});


			const idToValueMap = {};
			const idToValue2Map = {};
			valuesObject.forEach(item => {
				idToValueMap[item.id] = item.value;
				idToValue2Map[item.id] = item.value2;
			});


			const updatedArray = newArr.map(item => {
				const matchingValue = idToValueMap[item.costing_id];
				const matchingValue2 = idToValue2Map[item.costing_id];

				if (matchingValue !== undefined) {

					if (item.category_a !== undefined) {

						item = { ...item, category_a: matchingValue };
					} else {

						item = { ...item, category_a: matchingValue };
					}
				}

				if (matchingValue2 !== undefined) {

					if (item.value2 !== undefined) {

						item = { ...item, broker_fee: matchingValue2 };
					} else {

						item = { ...item, broker_fee: matchingValue2 };
					}
				}

				return item;
			});

			let obj = {
				costings: updatedArray,
			};

			const { message } = await VendorServices.updateVendorCosting(obj);
			SuccessToaster(message);
			let data = {
				vendor_id: selectedVendor?.id,
				country_id: selectedVendor?.country,
				type: selectedVendor?.type,
			};
			getVendorCosting(1, "", data);
		} catch (error) {
			ErrorToaster(error);
		} finally {
			setLoading(false);
		}
	};




	const renderCellContent = (colIndex, item, isActive) => {
		const date = moment(item?.vehicle?.vcc?.vcc_expiry_date).format(
			"MM-DD-YYYY"
		);

		const targetDate = moment(date, "MM-DD-YYYY");
		let daysRemaining = targetDate > moment()

		switch (colIndex) {
			case 0:
				return (
					<Checkbox
						checked={isActive}
						onChange={() => handleSelectVendorBooking(item?.id)}
					/>
				);
			case 1:
				return item?.booking?.purchase_date
					? moment(
						item?.booking
							?.purchase_date
					).format("DD-MMM-YYYY")
					: "-";
			case 2:
				return item?.booking?.veh_model?.name ??
					"-";
			case 3:
				return item?.booking?.veh_make
					?.name ?? "-";
			case 4:
				return item?.booking?.lot_number ?? "-";

			case 5:
				return item?.booking?.vin ?? "-";


			case 6:
				return item?.booking?.color ?? "-";
			case 7:
				return item?.shipping?.loading_port
					?.name ?? "-";
			case 8:
				return item?.shipping
					?.container_no ?? "-";
			case 9:
				return item?.vehicle?.arrived_galaxy_date
					? moment(
						item?.vehicle
							?.arrived_galaxy_date
					).format("DD-MMM-YYYY")
					: "-";
			case 10:
				return selectedVendor?.type ===
					"shipping" && isActive ? (
					<InputField
						size={"small"}
						type={"number"}
						defaultValue={
							item?.shipping_charges ===
								"0.00"
								? item?.placeholder_shipping_rate
								: item?.shipping_charges
						}
						InputProps={{
							inputProps: { min: 0 },
						}}
						register={register2(
							`${item?.id}-shipping_charges`,
							{
								onChange: (e) =>
									handleCalc(
										"shipping_charges",
										item?.id,
										item?.shipping_currency,
										e.target
											.value,
										item
									),
							}
						)}
						inputStyle={{
							width: "100px",
						}}
					/>
				) : (
					item?.shipping_charges ?? "-"
				);
			case 11:
				return (selectedVendor?.type ===
					"towing" || selectedVendor?.name === 'W8 - Shipping USD') && isActive ? (

					<InputField
						size={"small"}
						type={"number"}
						defaultValue={
							item?.towing_charges ===
								"0.00"
								? item?.placeholder_towing_rate
								: item?.towing_charges
						}
						InputProps={{
							inputProps: { min: 0 },
						}}
						register={register2(
							`${item?.id}-towing_charges`,
							{
								onChange: (e) =>
									handleCalc(
										"towing_charges",
										item?.id,
										item?.shipping_currency,
										e.target
											.value,
										item
									),
							}
						)}
						inputStyle={{
							width: "100px",
						}}
					/>
				) : (
					item?.towing_charges ?? "-"
				);
			case 12:
				return selectedVendor?.type ===
					"clearance" && isActive ? (
					<InputField
						size={"small"}
						type={"number"}
						defaultValue={
							item?.clearance_charges ===
								"0.00"
								? item?.placeholder_clearance_rate
								: item?.clearance_charges
						}
						InputProps={{
							inputProps: { min: 0 },
						}}
						register={register2(
							`${item?.id}-clearance_charges`,
							{
								onChange: (e) =>
									handleCalc(
										"clearance_charges",
										item?.id,
										item?.clearance_currency,
										e.target
											.value,
										item
									),
							}
						)}
						inputStyle={{
							width: "100px",
						}}
					/>
				) : (
					item?.clearance_charges ?? "-"
				);
			case 13:
				return item?.late_fee ?? "-";
			case 14:
				return item?.storage ?? "-";
			case 15:
				return selectedVendor?.type ===
					"shipping" && isActive ? (
					<InputField
						size={"small"}
						type={"number"}
						defaultValue={
							item?.booking?.buyer?.type == "A" ? parseFloat(item?.category_a) : parseFloat(item?.category_a)
						}
						InputProps={{
							inputProps: { min: 0 },
						}}
						register={register2(
							`${item?.id}-category_a`,
							{
								onChange: (e) =>
									handleCalc(
										"category_a",
										item?.id,
										item?.shipping_currency,
										e.target
											.value,
										item
									),
							}
						)}
						inputStyle={{
							width: "100px",
						}}
					/>
				) : (
					item?.booking?.buyer?.type == "A" ? parseFloat(item?.category_a) : parseFloat(item?.category_a) ?? "-"
				);
			case 16:
				return selectedVendor?.type ===
					"shipping" && isActive ? (
					<InputField
						size={"small"}
						type={"number"}
						defaultValue={
							item?.booking?.buyer?.type == "B" ? parseFloat(item?.broker_fee) : parseFloat(item?.broker_fee)
						}
						InputProps={{
							inputProps: { min: 0 },
						}}
						register={register2(
							`${item?.id}-broker_fee`,
							{
								onChange: (e) =>
									handleCalc(
										"broker_fee",
										item?.id,
										item?.shipping_currency,
										e.target
											.value,
										item
									),
							}
						)}
						inputStyle={{
							width: "100px",
						}}
					/>
				) : (
					item?.booking?.buyer?.type == "B" ? parseFloat(item?.broker_fee) : parseFloat(item?.broker_fee) ?? "-"
				);
			case 17:
				return selectedVendor?.type ===
					"shipping" && isActive ? (
					<InputField
						size={"small"}
						type={"number"}
						defaultValue={
							item?.title_fee
						}
						InputProps={{
							inputProps: { min: 0 },
						}}
						register={register2(
							`${item?.id}-title_fee`,
							{
								onChange: (e) =>
									handleCalc(
										"title_fee",
										item?.id,
										item?.shipping_currency,
										e.target
											.value,
										item
									),
							}
						)}
						inputStyle={{
							width: "100px",
						}}
					/>
				) : (
					item?.title_fee ?? "-"
				);
			case 18:
				return selectedVendor?.type ===
					"clearance" && isActive ? (
					<InputField
						size={"small"}
						type={"number"}
						defaultValue={
							item?.inspection
						}
						InputProps={{
							inputProps: { min: 0 },
						}}
						register={register2(
							`${item?.id}-inspection`,
							{
								onChange: (e) =>
									handleCalc(
										"inspection",
										item?.id,
										item?.shipping_currency,
										e.target
											.value,
										item
									),
							}
						)}
						inputStyle={{
							width: "100px",
						}}
					/>
				) : (
					item?.inspection ?? "-"
				);
			case 19:
				return selectedVendor?.type ===
					"shipping" && isActive ? (
					<InputField
						size={"small"}
						type={"number"}
						defaultValue={
							item?.other_charges
						}
						InputProps={{
							inputProps: { min: 0 },
						}}
						inputStyle={{
							width: "100px",
						}}
						register={register2(
							`${item?.id}-other_charges`,
							{
								onChange: (e) =>
									handleCalc(
										"other_charges",
										item?.id,
										item?.shipping_currency,
										e.target
											.value,
										item
									),
							}
						)}
					/>
				) : (
					item?.other_charges ?? "-"
				);
			case 20:
				return parseFloat(
					!item?.vehicle?.vcc?.exit_paper_received && !item?.vehicle?.vcc?.makasa_received && !item?.vehicle?.mobaya_issued_date && daysRemaining
						? parseFloat(0).toFixed(2) : !item?.vehicle?.vcc?.exit_paper_received && !item?.vehicle?.vcc?.makasa_received && !item?.vehicle?.mobaya_issued_date && !daysRemaining ? item?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0 : item?.vehicle?.vcc?.exit_paper_received && daysRemaining ? parseFloat(0).toFixed(2) : item?.vehicle?.vcc?.makasa_received ? item?.custom_duty == 0 ? item?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0 : item?.custom_duty
							: item?.vehicle?.mobaya_issued_date ? parseFloat(item?.custom_duty) == 0 ? item?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0 : item?.custom_duty : item?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0
				).toFixed(2)
			case 21:
				return <b>
					USD{" "}
					{
						totalAmount.find(
							(e) => e.id === item?.id
						)?.amount
					}
				</b>;

			case 22:
				return <EditNote
					sx={{
						color: "#E3E3E3",
						cursor: "pointer",
					}}
					onClick={() => {
						handleOpenDialog(item)
					}
					}
				/>;
			default:
				return "-";
		}
	};

	const downloadExcel = () => {
		const headers = tableHead.filter((item) => item !== "Select" && item !== "Notes");
		const rows = vendorCosting?.map((item) => {
			const date = moment(item?.vehicle?.vcc?.vcc_expiry_date).format("MM-DD-YYYY");
			const targetDate = moment(date, "MM-DD-YYYY");
			let daysRemaining = targetDate > moment();
			return [
				item?.booking?.purchase_date ? moment(item?.booking?.purchase_date).format("DD-MMM-YYYY") : "-",
				item?.booking?.veh_model?.name ?? "-",
				item?.booking?.veh_make?.name ?? "-",
				item?.booking?.lot_number ?? "-",
				item?.booking?.vin ?? "-",
				item?.booking?.color ?? "-",
				item?.shipping?.loading_port?.name ?? "-",
				item?.shipping?.container_no ?? "-",
				item?.vehicle?.arrived_galaxy_date ? moment(item?.vehicle?.arrived_galaxy_date).format("DD-MMM-YYYY") : "-",
				item?.shipping_charges ?? "-",
				item?.towing_charges ?? "-",
				item?.clearance_charges ?? "-",
				item?.late_fee ?? "-",
				item?.storage ?? "-",
				item?.booking?.buyer?.type == "A" ? parseFloat(item?.category_a) : parseFloat(item?.category_a) ?? "-",
				item?.booking?.buyer?.type == "B" ? parseFloat(item?.broker_fee) : parseFloat(item?.broker_fee) ?? "-",
				item?.title_fee ?? "-",
				item?.inspection ?? "-",
				item?.other_charges ?? "-",
				parseFloat(
					!item?.vehicle?.vcc?.exit_paper_received &&
						!item?.vehicle?.vcc?.makasa_received &&
						!item?.vehicle?.mobaya_issued_date &&
						daysRemaining
						? parseFloat(0).toFixed(2)
						: !item?.vehicle?.vcc?.exit_paper_received &&
							!item?.vehicle?.vcc?.makasa_received &&
							!item?.vehicle?.mobaya_issued_date &&
							!daysRemaining ? item?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0
							: item?.vehicle?.vcc?.exit_paper_received && daysRemaining ? parseFloat(0).toFixed(2)
								: item?.vehicle?.vcc?.makasa_received ? item?.custom_duty == 0
									? item?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0
									: item?.custom_duty
									: item?.vehicle?.mobaya_issued_date
										? parseFloat(item?.custom_duty) == 0
											? item?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0
											: item?.custom_duty : item?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate || 0
				).toFixed(2),
				totalAmount.find((e) => e.id === item?.id)?.amount
			]
		})

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
		getVendorDropdown();
		if (state) {
			setSelectedVendor(state)
			setValue('vendor', state)
			try {

				let data = {
					vendor_id: state?.id,
					country_id: state?.country_id,
					type: state?.type,
					container: getValues('container'),
					vin: getValues('vin'),
					lot: getValues('lot'),
				};
				getVendorCosting(1, "", data);
			} catch (error) {
				ErrorToaster(error);
			}

		}
		getCurrencies()
	}, []);

	return (
		<Box sx={{ m: 4, mb: 2 }}>
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
					variant="h5"
					sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}
				>
					Vendor Costing
				</Typography>
				{vendorCosting?.length > 0 && (
					<PrimaryButton
						title={"Download Excel"}
						onClick={() => downloadExcel()}
					/>
				)}
			</Box>
			<Box>
				<EditNotesVendor item={tableId} open={isDialogOpen} onClose={handleCloseDialog} />
			</Box>
			<Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px', mt: 3 }}>
				<Box
					component={"form"}
					onSubmit={handleSubmit(applyFilter)}
					sx={{
						m: "20px 0 20px 5px",

					}}
				>
					<Grid container spacing={1} alignItems={"center"} columns={10}>
						<Grid item md={2}>
							<SelectField
								size="small"
								label={"Vendor"}
								options={vendors}
								selected={selectedVendor}
								onSelect={(value) => setSelectedVendor(value)}
								error={errors?.vendor?.message}
								register={register("vendor", {
									required: "Please select vendor.",
								})}
							/>
						</Grid>
						<Grid item md={2}>
							<InputField
								size={"small"}
								label={"Vin"}
								placeholder={"Vin"}
								error={errors?.vin?.message}
								register={register("vin")}
							/>
						</Grid>
						<Grid item md={2}>
							<InputField
								size={"small"}
								label={"Lot"}
								placeholder={"Lot"}
								register={register("lot")}
							/>
						</Grid>
						<Grid item md={2}>
							<InputField
								size={"small"}
								label={"Container"}
								placeholder={"Container"}
								register={register("container")}
							/>
						</Grid>
						<Grid item xs={12} md={2}>
							<Box
								sx={{
									mt: "11px",
									display: "flex",
									justifyContent: "flex-end",
								}}
							>
								<PrimaryButton title={"Search"} type={"submit"} />
							</Box>
						</Grid>
					</Grid>
				</Box>

				<Grid item md={11}>
					{vendorCosting?.length > 0 && <Box>

						<Grid container mb={2} >
							<Grid item xs={5}>
								<FormControl>
									<InputLabel>Columns</InputLabel>
									<Select
										size={'small'}
										multiple
										value={visibleColumns}
										label={'Columns'}
										onChange={handleColumnChange}
										renderValue={() => "Show/Hide"}
									>

										{tableHead.map((column, index) => {


											if (
												column !== 'Select' &&
												column !== 'Shipping Charges' &&
												column !== 'Towing' &&
												column !== 'Clearance' &&
												column !== 'Late Fee' &&
												column !== 'Storage' &&
												column !== 'Category A' &&
												column !== 'Broker Fee' &&
												column !== 'Title Fee' &&
												column !== 'Inspection' &&
												column !== 'Other Charges' &&
												column !== 'Custom Duty' &&
												column !== 'Total' &&
												column !== 'Notes'


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
						</Grid>

						{loader ? (
							<CircularProgress />
						) : (
							vendorCosting?.length > 0 && (
								<TableContainer
									component={Paper}
									sx={{
										boxShadow: "0px 8px 18px 0px #9B9B9B1A",
										borderRadius: 2,
										maxHeight: "calc(100vh - 330px)",
									}}
								>
									<Table stickyHeader sx={{ minWidth: 500 }}>
										{/* Table Header */}
										<TableHead>
											<TableRow>
												{visibleColumns.map((index) => (
													<Cell
														key={index}

													>
														{tableHead[index]}
													</Cell>
												))}
											</TableRow>
										</TableHead>

										{/* Table Body */}
										<TableBody>
											{!loader ? (
												vendorCosting?.length > 0 ? (
													<Fragment>
														{vendorCosting.map((item, rowIndex) => {
															const isActive = selectedVendorBooking.indexOf(item?.id) !== -1;
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
															colSpan={visibleColumns?.length + 1}
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
														colSpan={visibleColumns?.length + 2}
														align="center"
														sx={{ fontWeight: 600 }}
													>
														<Box className={classes.loaderWrap}>
															<CircularProgress />
														</Box>
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								</TableContainer>
							)
						)}

						{/* Pagination */}
						{vendorCosting?.length > 0 && (
							<Pagination
								currentPage={currentPage}
								pageSize={pageLimit}
								onPageSizeChange={(size) => getVendorCosting(1, size.target.value)}
								tableCount={vendorCosting?.length}
								totalCount={totalCount}
								onPageChange={(page) => getVendorCosting(page, "")}
							/>
						)}
					</Box>
					}
					{vendorCosting?.length > 0 && <Box
						sx={{
							mt: "11px",
							display: "flex",
							justifyContent: "flex-end",
						}}
					>
						<PrimaryButton
							loading={loading}
							title={"Update"}
							onClick={handleSubmit2(updateVendorCosting)}
						/>
					</Box>}
				</Grid>
			</Box>
		</Box>
	);
}

export default VendorCosting;
