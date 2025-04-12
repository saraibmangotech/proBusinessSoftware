import React, { Fragment, useState, useEffect, useRef } from "react";
import {
	Grid,
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	tableCellClasses,
	CircularProgress,
	Paper,
	Pagination,
	PaginationItem,
} from "@mui/material";
import SelectField from "components/Select";
import InputField from "components/Input";
import { PrimaryButton } from "components/Buttons";
import styled from "@emotion/styled";
import { makeStyles } from "@mui/styles";
import Colors from "assets/Style/Colors";
import CustomPagination from "components/CustomPagination";
import { FontFamily } from "assets";
import moment from "moment";
import SystemServices from "services/System";
import { ErrorToaster } from "components/Toaster";
import DatePicker from "components/DatePicker";
import ClientServices from "services/Client";
import { useForm } from "react-hook-form";
import { getYearMonthDateFormate } from "utils";
import { SuccessToaster } from "components/Toaster";
import VendorServices from "services/Vendor";
import { CSVLink } from "react-csv";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useDemoData } from '@mui/x-data-grid-generator';
import {
	DataGrid,
	GridToolbar,
	gridFilteredSortedRowIdsSelector,
	selectedGridRowsSelector,
} from '@mui/x-data-grid';
import { useTable, useRowSelect } from 'react-table';




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


function ClientRates() {
	const classes = useStyles();

	const csvLink = useRef();
	const csvCompareLink = useRef();
	const inputRef = useRef();

	const tableHead = ['Sr', 'Type', 'Destination', 'Country', 'State/City', 'Port', 'Cost', 'Month Year'];

	const {
		register,
		handleSubmit,
		getValues,
		setValue,
		formState: { errors },
	} = useForm();
	const {
		register: register2,
		handleSubmit: handleSubmit2,
		reset,
		formState: { errors: errors2 },
		
	} = useForm();






	const [data, setData] = useState([
		{ id: 1, name: 'John Doe', age: 25 },
		{ id: 2, name: 'Jane Doe', age: 30 },
	]);

	const updateData = (rowIndex, cellIndex, value, columnName) => {
		const newData = [...data];
		newData[rowIndex]["name"] = value;
		setData(newData);

	};

	const columns = [
		{ Header: 'ID', accessor: 'id' },
		{ Header: 'Name', accessor: 'name' },
		{ Header: 'Age', accessor: 'age' },
	];


	const rateTypeOptions = [
		{ id: 1, name: "Normal Bike" },
		{ id: 2, name: "Oversize Bike" },
		{ id: 3, name: "Auto" },
		{ id: 4, name: "Container Price" },
		{ id: 5, name: "Scrap Price" },
		{ id: 6, name: "Cutting" },
	];

	// *For Handle Date
	const [selectMonth, setSelectMonth] = useState();
	const [selectedRate, setSelectedRate] = useState();

	// *for rate List
	const [rateList, setRateList] = useState();

	//*For Csv Loading
	const [csvLoading, setCsvLoading] = useState(false);
	const [csvUploadLoading, setCsvUploadLoading] = useState(false);

	// *For Export CSV Table
	const [csvData, setCsvData] = useState([]);
	const [comparisonCsvData, setComparisonCsvData] = useState([]);

	// *For Business Location
	const [businessLocation, setBusinessLocation] = useState([]);
	const [selectedLocation, setSelectedLocation] = useState(null);

	// *For Countries
	const [countries, setCountries] = useState([]);
	const [selectedCountry, setSelectedCountry] = useState(null);

	const [items, setItems] = useState([]); // Your array of items
	const [page, setPage] = useState(1);
	const itemsPerPage = 100; // Change this to the number of items you want per page

	const pageCount = Math.ceil(items.length / itemsPerPage);

	const handleChangePage = (event, value) => {

		setPage(value);
		PaginationFunc(null, value)
	};

	let startIndex
	let endIndex
	let displayedItems

	const PaginationFunc = (data, pg = 1) => {
		if (!data) {
			data = items
		}
		startIndex = (pg - 1) * itemsPerPage;
		endIndex = startIndex + itemsPerPage;
		displayedItems = data.slice(startIndex, endIndex);
		setRateList(displayedItems)
		setRatesData(displayedItems)
		setLoading(false)
		setLoader(false)
		console.log(displayedItems);
	}

	// *For Destination
	const [destinations, setDestinations] = useState([]);
	const [selectedDestination, setSelectedDestination] = useState(null);

	//* ForLoader
	const [loader, setLoader] = useState(false);
	const [loading, setLoading] = useState(false);

	// *For Pagination
	const [totalCount, setTotalCount] = useState(0);
	const [pageLimit, setPageLimit] = useState(50);
	const [currentPage, setCurrentPage] = useState(1);

	// *For Filters
	const [filters, setFilters] = useState({});

	// *For get Data
	const [ratesData, setRatesData] = useState();

	// *For Get BUsiness Location
	const getBusinessLocation = async (countryId) => {
		try {
			const { data } = await SystemServices.getBusinessLocation(countryId);
			const formattedData = [];
			data?.locations?.forEach((e) => {
				let obj = {
					id: e.id,
					name: e?.state_code + "-" + e?.city_name,
				};
				formattedData.push(obj);
			});
			setBusinessLocation(formattedData);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Get client rates
	const getClientRates = async (page, limit, filter) => {
		reset()
		setLoading(true)
		setLoader(true)
		try {
			const Page = page ? page : currentPage;
			const Limit = limit ? limit : pageLimit;
			const Filter = { ...filters, ...filter };
			setCurrentPage(Page);
			setPageLimit(Limit);
			setFilters(Filter);
			let params = {
				date: getValues("month"),
				country_id: selectedCountry?.id,
				location_id: selectedLocation?.id,
				destination_id: selectedDestination?.id,
				type_id: selectedRate?.id,
				page: Page,
				limit: Limit,
			};
			params = { ...params, ...Filter };

			const { data } = await ClientServices.getClientRates(params);
			console.log('abc');
			setItems(data?.rates)
			// setRatesData(data?.rates);
			// console.log(data.rates[0]);
			PaginationFunc(data?.rates)
			// setRateList(data?.rates);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Get Business Countries
	const getBusinessCountries = async () => {
		try {
			const { data } = await SystemServices.getBusinessCountries();
			setCountries(data?.countries);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Handle Filter
	const handleFilter = (value) => {


		if (value) {
			const result = items.filter(item => {
				const destinations = item?.destination?.name && item?.destination?.name.toString().toLowerCase().includes(value);
				const country = item?.location?.country_code && item?.location?.country_code.toLowerCase().includes(value.toLowerCase());
				const city = item?.location?.city_name && item?.location?.city_name.toLowerCase().includes(value.toLowerCase());
				const port = item?.location?.port?.name && item?.location?.port?.name.toLowerCase().includes(value.toLowerCase());



				return destinations || country || city || port
			});


			setRatesData(result)
		}
		else {
			setRatesData(items)
		}

	}


	// *For Download CSV File
	const downloadCsv = () => {
		setCsvLoading(true);
		try {
			const title = ['sep=,'];
			const head = ['Sr', 'Type', 'Destination', 'Country', 'State/City', 'Port', 'Cost', 'City', 'Month Year'];
			const data = []
			data.push(title);
			data.push(head);

			for (let index = 0; index < items?.length; index++) {
				const rate = items[index];
				const monthYear = moment(rate?.month_year).format('MMM-YY')

				let newRow = [index + 1, rate?.type?.name, rate?.destination?.name, rate?.location?.country_code, rate?.location?.state_code, rate?.location?.port?.name, rate?.cost, rate?.location?.city_name, monthYear,]
				data.push(newRow)
			}

			setCsvData(data)
		} catch (error) {
			ErrorToaster(error)
		} finally {
			setCsvLoading(false);
		}
	}

	// *For Upload CsV File
	const uploadCsv = async (e) => {
		setCsvUploadLoading(true)
		try {
			e.preventDefault();
			const file = e.target.files[0]
			const formData = new FormData();
			formData.append('rates', file);
			// *For Check Image Format
			if (file.type === 'text/csv') {
				const { message } = await ClientServices.uploadClientRate(formData)
				SuccessToaster(message)
			} else {
				ErrorToaster(`Only CSV formats is supported`)
			}
		} catch (error) {
			ErrorToaster(error)
		} finally {
			setCsvUploadLoading(false)
		}
	}

	// *For Handle Date
	const handleSelectMonth = (newDate) => {
		try {
			// eslint-disable-next-line eqeqeq
			if (newDate == "Invalid Date") {
				setSelectMonth("invalid");
				return;
			}
			const selectedMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 2);


			// Format the date to MM-DD-YYYY format (or any other format you prefer)
			const formattedDate = `${selectedMonth.getFullYear()}-${(selectedMonth.getMonth() + 1)
				.toString()
				.padStart(2, "0")}-${selectedMonth.getDate().toString().padStart(2, "0")}`;
			setSelectMonth(selectedMonth);

			setValue("month", formattedDate);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Destination
	const getDestinations = async (search) => {
		try {
			let params = {
				page: 1,
				limit: 50,
				search: search,
			};
			const { data } = await SystemServices.getDestinations(params);
			setDestinations(data?.destinations?.rows);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	const updateRates = async (formData) => {
		const updatedRateList = rateList
			.filter(({ id, cost }) => cost > 0.0)
			.map(({ id, cost }) => ({ id, cost }));

		try {
			let obj = {
				rates: updatedRateList,
			};

			const { message } = await ClientServices.updateRates(obj);
			SuccessToaster(message);
		} catch (error) {
			ErrorToaster(error);
		}
	};
	const sortData = (e, type, item) => {
		console.log('sdasdasdasda');
		e.preventDefault();





		if (type === "ascending" && item == "Type") {
			const sortedData = [...ratesData].sort((a, b) => {
				// Use the localeCompare method for string comparison
				return a.location?.city_name.localeCompare(b.location?.city_name);
			});

			setRatesData(sortedData);
		}

		if (type === "descending" && item == "Type") {
			const sortedData = [...ratesData].sort((a, b) => {
				// Use the localeCompare method for string comparison
				return b.type?.name.localeCompare(a.type?.name);
			});

			setRatesData(sortedData);
		}

		if (type === "ascending" && item == "Destination") {
			const sortedData = [...ratesData].sort((a, b) => {
				// Use the localeCompare method for string comparison
				return a.destination?.name.localeCompare(b.destination?.name);
			});

			setRatesData(sortedData);
		}

		if (type === "descending" && item == "Destination") {
			const sortedData = [...ratesData].sort((a, b) => {
				// Use the localeCompare method for string comparison
				return b.destination?.name.localeCompare(a.destination?.name);
			});

			setRatesData(sortedData);
		}

		if (type === "ascending" && item == "Country") {
			const sortedData = [...ratesData].sort((a, b) => {
				// Use the localeCompare method for string comparison
				return a.location?.country_code.localeCompare(b.location?.country_code);
			});

			setRatesData(sortedData);
		}

		if (type === "descending" && item == "Country") {
			const sortedData = [...ratesData].sort((a, b) => {
				// Use the localeCompare method for string comparison
				return b.location?.country_code.localeCompare(a.location?.country_code);
			});

			setRatesData(sortedData);
		}

		if (type === "ascending" && item == "State/City") {
			const sortedData = [...ratesData].sort((a, b) => {
				// Use the localeCompare method for string comparison
				return a.location?.state_code.localeCompare(b.location?.state_code);
			});

			setRatesData(sortedData);
		}

		if (type === "descending" && item == "State/City") {
			const sortedData = [...ratesData].sort((a, b) => {
				// Use the localeCompare method for string comparison
				return b.location?.state_code.localeCompare(a.location?.state_code);
			});

			setRatesData(sortedData);
		}
		if (type === "ascending" && item == "State/City") {
			const sortedData = [...ratesData].sort((a, b) => {
				// Use the localeCompare method for string comparison
				return a.location?.port?.name.localeCompare(b.location?.port?.name);
			});

			setRatesData(sortedData);
		}

		if (type === "descending" && item == "State/City") {
			const sortedData = [...ratesData].sort((a, b) => {
				// Use the localeCompare method for string comparison
				return b.location?.port?.name.localeCompare(a.location?.port?.name);
			});

			setRatesData(sortedData);
		}

		if (type === "ascending" && item === "Cost") {
			const sortedData = [...ratesData].sort((a, b) => {
				const costA = parseFloat(a.cost) || 0;
				const costB = parseFloat(b.cost) || 0;

				return costA - costB;
			});

			setRatesData(sortedData);
		}

		if (type === "descending" && item === "Cost") {
			const sortedData = [...ratesData].sort((a, b) => {
				const costA = parseFloat(a.cost) || 0;
				const costB = parseFloat(b.cost) || 0;

				return costB - costA;
			});

			setRatesData(sortedData);
		}



	};


	useEffect(() => {
		if (csvData.length > 0) {
			csvLink?.current.link.click();
		}

	}, [csvData, comparisonCsvData]);
	useEffect(() => {
		getBusinessCountries();
		getDestinations();
	}, []);

	return (
		<Fragment>
			<Box>
				{/* ========== Export CSV File ========== */}
				{ratesData && (
					<CSVLink
						ref={csvLink}
						data={csvData}
						filename={`client-rates ${moment().format('DD-MMM-YYYY h:mm A')}.csv`}
						target="_blank"
					/>
				)}
				<Grid container spacing={1} alignItems={"center"} justifyContent={"center"}>
					<Grid item xs={12} sm={12} md={12}>
						<Grid container alignItems={"center"} justifyContent={"center"}>
							<Grid item md={10}>
								<Typography
									variant="h4"
									sx={{
										color: Colors.charcoalGrey,
										fontFamily: FontFamily.NunitoRegular,
										mt: 4,
										ml: "5px",
									}}
								>
									Client Rates
								</Typography>
							</Grid>
							<Grid item md={10} sx={{ textAlign: 'right' }}>

								<PrimaryButton
									disabled={ratesData?.length > 0 ? false : true}
									title="Download Excel"
									style={{ backgroundColor: Colors.bluishCyan, marginRight: '10px' }}
									onClick={() => downloadCsv()}
									loading={csvLoading}
								/>
								<input ref={inputRef} accept=".csv" type="file" onChange={(e) => uploadCsv(e)} style={{ display: 'none' }} />
								<PrimaryButton
									title="Upload Excel"
									onClick={(e) => inputRef?.current.click()}
									loading={csvUploadLoading}
								/>
							</Grid>
						</Grid>
					</Grid>

					<Grid item xs={12} sm={12} md={10}>
						<Grid container spacing={1} alignItems={"center"} justifyContent={"center"}>
							<Grid item md={12}>
								<Box
									sx={{
										m: "20px 0 20px 5px",
										p: "20px",
										bgcolor: Colors.feta,
										border: `1px solid ${Colors.iron}`,
										borderRadius: "9px",
									}}
									component={"form"}
									onSubmit={handleSubmit(getClientRates)}
								>
									<Grid
										container
										spacing={1}
										alignItems={"center"}
										justifyContent={"center"}
									>
										<Grid item xs={12} md={4}>
											<SelectField
												label={"Select Country"}
												size={"small"}
												options={countries}
												selected={selectedCountry}
												error={errors?.country?.message}
												register={register("country", {
													required: "Please select country.",
												})}
												onSelect={(value) => {
													setSelectedCountry(value);
													getBusinessLocation(value?.id);
												}}
											/>
										</Grid>

										<Grid item xs={12} md={4}>
											<SelectField
												size={"small"}
												disabled={selectedCountry ? false : true}
												label={"State & City"}
												options={businessLocation}
												selected={selectedLocation}
												register={register("city", {})}
												onSelect={(value) => setSelectedLocation(value)}
											/>
										</Grid>
										<Grid item xs={12} md={4}>
											<SelectField
												size="small"
												label={"Destination Port"}
												options={destinations}
												selected={selectedDestination}
												register={register("destination", {})}
												onSelect={(value) => setSelectedDestination(value)}
											/>
										</Grid>
										<Grid item xs={12} md={4} mb={"1%"}>
											<DatePicker
												size={"small"}
												label={"Select Month"}
												// value={selectMonth}
												openTo="month"
												views={['month', 'year']}

												minDate={new Date('2023-11-01')}
												error={errors?.month?.message}
												register={register("month", {
													required: "Please enter month.",
												})}
												onChange={(date) => handleSelectMonth(date)}
											/>

										</Grid>
										<Grid item xs={12} md={4}>
											<SelectField
												size="small"
												label={"Rate Type"}
												options={rateTypeOptions}
												selected={selectedRate}
												error={errors?.rateType?.message}
												register={register("rateType", {
													required: "Please select type.",
												})}
												onSelect={(value) => setSelectedRate(value)}
											/>
										</Grid>
										<Grid item xs={12} md={4}>
											<Box
												sx={{
													mt: "12px",
												}}
											>
												<PrimaryButton type="submit" loading={loading} title="Search" />
											</Box>
										</Grid>
									</Grid>
								</Box>
							</Grid>
						</Grid>
					</Grid>
					<Grid item xs={12} md={12} sm={3} >
						<Grid container sx={{ pl: '50px !important' }}>

							<Grid item xs={12} md={3} sm={3} >
								<InputField
									size={'small'}
									label={'Search'}
									placeholder={'Search'}
									register={register('search', {
										onChange: (e) => handleFilter(e.target.value)
									})}
								/>
							</Grid>

						</Grid>

					</Grid>
					<Grid
						item
						xs={12}
						sm={12}
						md={10}
						component={"form"}
						onSubmit={handleSubmit2(updateRates)}
					>
						{ratesData ? (
							<Fragment>
								{/* ========== Table ========== */}
								<TableContainer
									component={Paper}
									sx={{
										boxShadow: "0px 8px 18px 0px #9B9B9B1A",
										borderRadius: 2,
										maxHeight: "calc(100vh - 330px)",
									}}
								>
									<Table stickyHeader sx={{ minWidth: 500 }}>
										<TableHead>
											<TableRow>
												{tableHead.map((item, index) => (
													<Cell key={index}>{item}  {item == "Sr" || item == "Month Year" ? '' : <> <ArrowUpwardIcon sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "ascending", item)} /> <ArrowDownwardIcon sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "descending", item)} /> </>}</Cell>

												))}
											</TableRow>
										</TableHead>
										<TableBody>
											{!loader && ratesData && ratesData?.length > 0 ? (
												<Fragment>
													{ratesData?.map((item, index) => (
														<Row
															key={index}
															sx={{
																bgcolor:
																	index % 2 !== 0 && "#EFF8E7",
															}}
														>
															{/* Render your data rows here */}
															<Cell>
																{index + 1}
															</Cell>
															<Cell>
																{item?.type?.name ??
																	"-"}
															</Cell>
															<Cell>
																{item?.destination?.name ?? "-"}
															</Cell>
															<Cell>{item?.location?.country_code ?? "-"}</Cell>
															<Cell>
																{item?.location?.state_code + "-" + item?.location?.city_name ?? "-"}
															</Cell>
															<Cell>
																{item?.location?.port?.name ?? "-"}
															</Cell>

															<Cell

															>
																<Box
																	sx={{
																		width: "200px",
																		display: "flex",
																		justifyContent: "center",
																		padding: 0
																	}}
																>
																	{console.log(item?.cost)}
																	<InputField
																		value={Math.round(item?.cost)}
																		size="small"
																		sx={{ width: '200px', height: "10px" }}
																		register={register2(
																			index + "cost",
																			{
																				required: true,

																				onChange: (e) => {
																					// Create a copy of the ratesData array
																					const updatedRatesData =
																						[
																							...ratesData,
																						];
																					// Update the cost in the specific item
																					updatedRatesData[
																						index
																					].cost =
																						e.target.value;
																					console.log(
																						updatedRatesData,'updatedRatesData'
																					);

																					setRateList(
																						updatedRatesData
																					);
																				},
																			}
																		)}
																		error={
																			errors2?.cost?.message
																		}
																	/>
																</Box>
															</Cell>
															<Cell>
																{item?.month_year
																	? moment(
																		item?.month_year
																	).format("MMM-YYYY")
																	: "-"}
															</Cell>


														</Row>
													))}
												</Fragment>
											) : (
												<Row>
													<Cell
														colSpan={tableHead.length + 1}
														align="center"
														sx={{ fontWeight: 600 }}
													>
														{loader ? (
															<Box className={classes.loaderWrap}>
																<CircularProgress />
															</Box>
														) : (
															"No Data Found"
														)}
													</Cell>
												</Row>
											)}
										</TableBody>
									</Table>
								</TableContainer>
								<Grid container justifyContent={'flex-end'} mt={5}>
									<Pagination
										count={pageCount}
										page={page}
										onChange={handleChangePage}
										renderItem={(item) => (
											<PaginationItem
												component="div"
												{...item}
											/>
										)}
									/>
								</Grid>
								{/* ========== Pagination ========== */}
								{/* <Pagination
									currentPage={currentPage}
									pageSize={pageLimit}
									onPageSizeChange={(size) => getClientRates(1, size.target.value)}
									tableCount={ratesData?.length}
									totalCount={totalCount}
									onPageChange={(page) => getClientRates(page, "")}
								/> */}
								<Grid item xs={12} sm={12} sx={{ mt: 4, textAlign: "right" }}>
									<PrimaryButton title="Update" type="submit" loading={loading} />
								</Grid>
							</Fragment>
						) : (
							" "
						)}
					</Grid>
				</Grid>


			</Box>
		</Fragment>
	);
}

export default ClientRates;
