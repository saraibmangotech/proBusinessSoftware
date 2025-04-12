import React, { Fragment, useState, useEffect } from "react";
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
	IconButton,
	CircularProgress,
	Paper,
	Tooltip,
} from "@mui/material";
import SelectField from "components/Select";
import InputField from "components/Input";
import { PrimaryButton } from "components/Buttons";
import styled from "@emotion/styled";
import { makeStyles } from "@mui/styles";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import moment from "moment";
import { ErrorToaster } from "components/Toaster";
import ClientServices from "services/Client";
import { SuccessToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import { Storage } from "@mui/icons-material";

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

function Storages() {
	const classes = useStyles();

	const tableHead = [
		"Client Name",
		"Buyer ID",
		"Make",
		"Lot#.",
		"Vin#.",
		"Purchase Date",
		"Client Paid Date",
		"TT Date",
		"Veh. Pickup",
	];
	const [storageData, setStorageData] = useState([]);

	//Show Button
	const [showButton, setShowButton] = useState(false)

	// *For Vin and Lot
	const [vin, setVin] = useState([]);
	const [selectedVin, setSelectedVin] = useState();
	const [lot, setLot] = useState([]);
	const [selectedLot, setSelectedLot] = useState();

	//* ForLoader
	const [loader, setLoader] = useState(false);
	const [loading, setLoading] = useState(false);

	const [storageId, setStorageId] = useState();

	const {
		register,
		handleSubmit,
		getValues: getValues2,
		formState: { errors },
	} = useForm();
	const {
		register: register2,
		setValue,
		getValues,
		handleSubmit: handleSubmit2,
		reset,
	} = useForm();
	// *For Apply Filters
	const applyFilter = async () => {
		let data;
		try {
			if (selectedVin?.id) {
				data = {
					filter: selectedVin?.id,
				};
			} else {
				data = {
					filter: selectedLot?.id,
				};
			}

			getStorages(1, "", data);
			setShowButton(false)
		} catch (error) {
			ErrorToaster(error);
		}
	};

	//*Create Storage

	const UpdateStorage = async () => {
		setShowButton(true)
		setLoading(true);


		try {
			let obj = {
				storage_id: storageId,
				gws_storage_charges: getValues("gwsStorage"),
				gws_late_charges: getValues("gwsPmt"),
				client_storage_charges: getValues("clientStorage"),
				client_late_charges: getValues("clientPmt"),
				vendor_storage_charges: getValues("vendorStorage"),
				vendor_late_charges: getValues("vendorPmt"),
				vendor_account_id: storageData[0]?.vehicle?.shipping?.ship_vendor?.account_id,
				vendor_undue_account_id:
					storageData[0]?.vehicle?.shipping?.ship_vendor?.undue_account_id,
				customer_id: storageData[0]?.booking?.customer_id,
				container_no: storageData[0]?.vehicle?.container_no,
				vehicle_make: storageData[0]?.booking?.veh_make?.name,
				vehicle_model: storageData[0]?.booking?.veh_model?.name,
				vin: storageData[0]?.booking?.vin,
				lot_number: storageData[0]?.booking?.lot_number,
				color: storageData[0]?.booking?.color,
				vehicle_id: storageData[0]?.vehicle?.id,
				arrived_galaxy_port: storageData[0]?.vehicle?.arrived_galaxy_date
					? storageData[0]?.vehicle?.arrived_galaxy_date
					: null,
			};

			const { message } = await ClientServices.updateStorage(obj);
			SuccessToaster(message);
			window.location.reload();

		} catch (error) {
			ErrorToaster(error);
		} finally {
			setLoading(false);

		}
	};
	// *For Vendor Costing
	const getStorages = async (page, limit, filter) => {
		setLoader(true);
		const Filter = { ...filter };
		try {
			let params = {
				page: 1,
				limit: 15,
			};
			params = { ...params, ...Filter };

			const { data } = await ClientServices.getStorageDetails(params);

			setStorageId(data.details.id);

			if (data.details != null) {
				setStorageData([data?.details]);
			} else {
				setStorageData([]);
			}

			setValue("clientStorage", parseFloat(data.details.client_storage_charges).toFixed(2));
			setValue("clientPmt", parseFloat(data.details.client_late_charges).toFixed(2));
			setValue("vendorStorage", parseFloat(data.details.vendor_storage_charges).toFixed(2));
			setValue("vendorPmt", parseFloat(data.details.vendor_late_charges).toFixed(2));
			setValue("gwsStorage", parseFloat(data.details.gws_storage_charges).toFixed(2));
			setValue("gwsPmt", parseFloat(data.details.gws_late_charges).toFixed(2));
		} catch (error) {
			ErrorToaster(error);
		} finally {
			setLoader(false);
		}
	};

	// *For Get Business Countries
	const getClientVin = async () => {
		let params = {
			page: 1,
			limit: 15,
			unused: false,
		};
		try {
			const { data } = await ClientServices.getClientVin(params);

			const arrayOfObjects = data?.filters?.vins.map((value, index) => ({
				id: value, // Adding 1 to start the id from 1
				name: value,
			}));
			const arrayOfObjects1 = data?.filters?.lots.map((value, index) => ({
				id: value, // Adding 1 to start the id from 1
				name: value,
			}));

			setVin(arrayOfObjects);
			setLot(arrayOfObjects1);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	useEffect(() => {
		getClientVin();
	}, []);

	return (
		<Fragment>
			<Box>
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
									Book Storges and Late Payment
								</Typography>
							</Grid>
							<Grid item md={11}>
								<Box
									sx={{
										m: 4,
										p: 4,
										bgcolor: Colors.feta,
										border: `1px solid ${Colors.iron}`,
										borderRadius: "9px",
									}}
									component={"form"}
									onSubmit={handleSubmit(applyFilter)}
								>
									<Grid
										container
										spacing={0}
										alignItems={"center"}
										justifyContent={"space-between"}
									>
										<Grid item xs={12} md={3}>
											<SelectField
												size="small"
												options={vin}
												label={"Vin"}
												selected={selectedVin}
												onSelect={(value) => setSelectedVin(value)}
												error={errors?.vin?.message}
												register={register("vin", {})}
											/>
										</Grid>
										<Grid item xs={12} md={3}>
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

										<Grid item xs={12} md={3}>
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
						</Grid>
					</Grid>

					<Grid item xs={12} sm={12} md={10}>
						{storageData && storageData.length > 0 && (
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
													<Cell key={index}>{item}</Cell>
												))}
											</TableRow>
										</TableHead>
										<TableBody>
											{!loader && storageData && storageData?.length > 0 ? (
												<Fragment>
													{storageData.map((item, index) => (
														<Row
															key={index}
															sx={{
																bgcolor:
																	index % 2 !== 0 && "#EFF8E7",
															}}
														>
															{/* Render your data rows here */}
															<Cell>
																<Tooltip
																	title={item?.booking?.customer?.name ?? "-"}
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
																	{
																		item?.booking?.customer?.name?.length > 12
																			? item?.booking?.customer?.name?.slice(0, 8) + "..."
																			: item?.booking?.customer?.name
																	}
																</Tooltip>
															</Cell>
															<Cell>
																{item?.booking?.buyer?.name ?? "-"}
															</Cell>
															<Cell>
																<Tooltip
																	title={item?.booking?.veh_make?.name ?? "-"}
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
																	{
																		item?.booking?.veh_make?.name?.length > 12
																			? item?.booking?.veh_make?.name?.slice(0, 8) + "..."
																			: item?.booking?.veh_make?.name
																	}
																</Tooltip>
															</Cell>
															<Cell>
																<Tooltip
																	title={item?.booking?.lot_number ?? "-"}
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
																	{
																		item?.booking?.lot_number?.length > 12
																			? item?.booking?.lot_number?.slice(0, 8) + "..."
																			: item?.booking?.lot_number
																	}
																</Tooltip>
															</Cell>
															<Cell>
																<Tooltip
																	title={item?.booking?.vin ?? "-"}
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
																	{
																		item?.booking?.vin?.length > 12
																			? item?.booking?.vin?.slice(0, 8) + "..."
																			: item?.booking?.vin
																	}
																</Tooltip>
															</Cell>
															<Cell>
																{item?.booking?.purchase_date
																	? moment(
																		item?.booking
																			?.purchase_date
																	).format("MM-DD-YYYY")
																	: "N/A"}
															</Cell>
															<Cell>
																{item?.booking?.invoice?.balance == 0
																	? moment(
																		item?.booking?.invoice?.updated_at
																	).format("MM-DD-YYYY")
																	: "-"}
															</Cell>
															<Cell>
																{item?.booking?.tt_detail ?
																	moment(
																		item?.booking?.tt_detail?.created_at
																	).format("MM-DD-YYYY")
																	: "-"}
															</Cell>
															<Cell>
																{item?.booking?.pickup_date
																	? moment(
																		item?.booking
																			?.pickup_date
																	).format("MM-DD-YYYY")
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
								{/* <Pagination
									currentPage={1}
									pageSize={5}
									// onPageSizeChange={(size) =>
									// 	getInvoiceList(1, size.target.value)
									// }
									tableCount={3}
									totalCount={3}
									// onPageChange={(page) => getInvoiceList(page, "")}
								/> */}
								<Grid container component={"form"}>
									<Grid item sm={6}>
										<Typography
											variant="h5"
											sx={{
												color: Colors.charcoalGrey,
												fontFamily: FontFamily.NunitoRegular,
												mt: 4,
												ml: "5px",
											}}
										>
											Booking
										</Typography>
										<Typography
											variant="h6"
											sx={{
												color: Colors.charcoalGrey,
												fontFamily: FontFamily.NunitoRegular,

												ml: "5px",
												fontSize: "15px",
											}}
										>
											{storageData[0].booking?.auctioneer.toUpperCase() +
												"-" +
												storageData[0].booking?.buyer_id}
										</Typography>
										{/* <Grid container>
											<Grid
												item
												xs={12}
												display={"flex"}
												alignItems={"center"}
												justifyContent={"flex-start"}
												gap={"50px"}
											>
												<Box display={"flex"} alignItems={"center"}>
													<Typography
														variant="h6"
														sx={{
															color: Colors.charcoalGrey,
															fontFamily: FontFamily.NunitoRegular,

															ml: "5px",
															width: "50px",
															fontSize: "19px",
														}}
													>
														Balance
													</Typography>
												</Box>
												<Box width={"100px"}>
													<InputField
														disabled={true}
														value={"50000"}
														size="small"
													/>
												</Box>
											</Grid>
										</Grid> */}
									</Grid>
									<Grid item sm={6}>
										<Grid container sm={12}>
											<Grid
												item
												xs={12}
												display={"flex"}
												justifyContent={"space-between"}
											>
												<Box>
													<Typography
														variant="h5"
														sx={{
															color: Colors.charcoalGrey,
															fontFamily: FontFamily.NunitoRegular,
															mt: 4,
															ml: "5px",
														}}
													>
														Charges on
													</Typography>
												</Box>
												<Box>
													<Typography
														variant="h5"
														sx={{
															color: Colors.charcoalGrey,
															fontFamily: FontFamily.NunitoRegular,
															mt: 4,
															ml: "5px",
														}}
													>
														Storages (AED)
													</Typography>
												</Box>
												<Box>
													<Typography
														variant="h5"
														sx={{
															color: Colors.charcoalGrey,
															fontFamily: FontFamily.NunitoRegular,
															mt: 4,
															ml: "5px",
														}}
													>
														Late Pmt (AED)
													</Typography>
												</Box>
											</Grid>

											<Grid
												item
												xs={12}
												display={"flex"}
												alignItems={"center"}
												justifyContent={"space-between"}
												gap={"50px"}
											>
												<Box display={"flex"} alignItems={"center"}>
													<Typography
														variant="h6"
														sx={{
															color: Colors.charcoalGrey,
															fontFamily: FontFamily.NunitoRegular,

															ml: "5px",
															width: "120px",
														}}
													>
														Client
													</Typography>
												</Box>
												<Box width={"100px"}>
													<InputField
														size="small"
														register={register2("clientStorage")}
													/>
												</Box>
												<Box width={"100px"}>
													<InputField
														size="small"
														register={register2("clientPmt")}
													/>
												</Box>
											</Grid>
											<Grid
												item
												xs={12}
												display={"flex"}
												alignItems={"center"}
												justifyContent={"space-between"}
												gap={"50px"}
											>
												<Box display={"flex"} alignItems={"center"}>
													<Typography
														variant="h6"
														sx={{
															color: Colors.charcoalGrey,
															fontFamily: FontFamily.NunitoRegular,

															ml: "5px",
															width: "120px",
														}}
													>
														Vendor
													</Typography>
												</Box>
												<Box width={"100px"}>
													<InputField
														size="small"
														register={register2("vendorStorage")}
													/>
												</Box>
												<Box width={"100px"}>
													<InputField
														size="small"
														register={register2("vendorPmt")}
													/>
												</Box>
											</Grid>
											<Grid
												item
												xs={12}
												display={"flex"}
												alignItems={"center"}
												justifyContent={"space-between"}
												gap={"50px"}
											>
												<Box display={"flex"} alignItems={"center"}>
													<Typography
														variant="h6"
														sx={{
															color: Colors.charcoalGrey,
															fontFamily: FontFamily.NunitoRegular,

															ml: "5px",
															width: "120px",
														}}
													>
														GWS
													</Typography>
												</Box>
												<Box width={"100px"}>
													<InputField
														size="small"
														register={register2("gwsStorage")}
													/>
												</Box>
												<Box width={"100px"}>
													<InputField
														size="small"
														register={register2("gwsPmt")}
													/>
												</Box>
											</Grid>
										</Grid>
									</Grid>
									<Grid item sm={6}>
										{/* <Grid container>
											<Grid
												item
												xs={12}
												display={"flex"}
												alignItems={"center"}
												justifyContent={"flex-start"}
												gap={"50px"}
											>
												<Box display={"flex"} alignItems={"center"}>
													<Typography
														variant="h6"
														sx={{
															color: Colors.charcoalGrey,
															fontFamily: FontFamily.NunitoRegular,

															ml: "5px",

															fontSize: "19px",
															fontWeight: "bold",
														}}
													>
														Total Charged
													</Typography>
												</Box>
												<Box width={"100px"}>
													<InputField
														disabled={true}
														value={"50000"}
														size="small"
													/>
												</Box>
											</Grid>
										</Grid> */}
									</Grid>
									{storageData.length > 0 && (
										<Grid
											item
											xs={12}
											sm={12}
											sx={{ mt: 4, textAlign: "right" }}
										>
											<PrimaryButton
												loading={loading}
												disabled={showButton}
												onClick={handleSubmit2(UpdateStorage)}
												title="Save & Update"
												type="submit"

											/>
										</Grid>
									)}
								</Grid>
							</Fragment>
						)}
					</Grid>
				</Grid>
			</Box>
		</Fragment>
	);
}

export default Storages;
