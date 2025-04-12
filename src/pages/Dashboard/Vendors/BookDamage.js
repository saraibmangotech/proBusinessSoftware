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
	InputAdornment,
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
import { useNavigate } from "react-router-dom";
import VendorServices from "services/Vendor";

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

function BookDamage() {
	const classes = useStyles();

	const navigate = useNavigate()

	const tableHead = [
		"Client Name",
		"Buyer ID",
		"Make",
		"Lot#.",
		"Vin#.",

	];
	const [storageData, setStorageData] = useState([]);

	//Show Button
	const [showButton, setShowButton] = useState(false)

	const [displayButton, setDisplayButton] = useState(false)

	// *For Vendor Dropdown
	const [vendors, setVendors] = useState([]);
	const [selectedVendor, setSelectedVendor] = useState(null);

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
		setValue,
		getValues,
		formState: { errors },
	} = useForm();
	const {
		register: register2,
		setValue: setValues2,
		getValues: getValues2,
		handleSubmit: handleSubmit2,
		formState: { errors: errors2 },
		reset,
	} = useForm();

	// *For Vendor
	const getVendorDropdown = async () => {
		try {
			const { data } = await VendorServices.getVendorDropdown();

			setVendors(data?.vendors);

		} catch (error) {
			ErrorToaster(error);
		}
	};


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

			getDamages(1, "", data);
			setShowButton(false)
		} catch (error) {
			ErrorToaster(error);
		}
	};


	const handleCalc = () => {
		setDisplayButton(true)
		let damagedSum = parseFloat(getValues2('DamageVendor')) + parseFloat(getValues2('DamageGWS'))
		let creditSum = parseFloat(getValues2('CreditVault')) + parseFloat(getValues2('CreditGWS'))

		if (damagedSum == creditSum && damagedSum != 0 && creditSum != 0) {
			setShowButton(false)
		}
		else {
			setShowButton(true)
		}


	}



	//*Create Storage

	const CreateDamage = async () => {
		setShowButton(true)
		setLoading(true);



		try {
			let obj = {
				booking_id: storageData[0]?.booking_id,
				vehicle_id: storageData[0]?.vehicle_id,
				vendor_id: storageData[0]?.vehicle?.shipping?.shipping_vendor,
				vendor_amount: getValues2('DamageVendor'),
				client_amount: getValues2('CreditVault'),
				credit_gws: getValues2('CreditGWS'),
				damage_gws: getValues2('DamageGWS'),
				reason: getValues2('reason'),
				account_id: storageData[0]?.vehicle?.shipping?.ship_vendor?.damage_account_id, //Vendor Damange AccountID
				customer_id: storageData[0]?.booking?.customer_id, //Customer ID
				container_no: storageData[0]?.vehicle?.container_no,
				vehicle_make: storageData[0]?.booking?.veh_make?.name,
				vehicle_model: storageData[0]?.booking?.veh_model?.name,
				vin: storageData[0]?.booking?.vin,
				lot_number: storageData[0]?.booking?.lot_number,
				color: storageData[0]?.booking?.color,

			};

			const { message } = await VendorServices.CreateDamage(obj);
			SuccessToaster(message);
			navigate('/damage-list')

		} catch (error) {
			ErrorToaster(error);
		} finally {
			setLoading(false);

		}
	};
	// *For Vendor Costing
	const getDamages = async (page, limit, filter) => {
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
			setSelectedVendor(data.details?.vehicle?.shipping?.ship_vendor)
			setValues2('DamageVendor', 0)
			setValues2('DamageGWS', 0)
			setValues2('CreditVault', 0)
			setValues2('CreditGWS', 0)


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
			damage: true,
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

		getVendorDropdown()

	}, []);



	return (
		<Fragment>
			<Box>
				<Grid container spacing={1} alignItems={"center"} justifyContent={"center"}>
					<Grid item xs={12} sm={12} md={12}>
						<Grid container alignItems={"center"} justifyContent={"center"}>
							<Grid item md={10.8}>
								<Typography
									variant="h4"
									sx={{
										color: Colors.charcoalGrey,
										fontFamily: FontFamily.NunitoRegular,
										mt: 4,

									}}
								>
									Booked Vehicle Damages
								</Typography>
							</Grid>

						</Grid>
					</Grid>
					<Grid item xs={11}>
						<Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px', mt: 3 }}>
							<Grid item md={11.5}>
								<Box
									sx={{
										m: 4,

									}}
									component={"form"}
									onSubmit={handleSubmit(applyFilter)}
								>
									<Grid
										container
										spacing={4}
										alignItems={"center"}

									>
										<Grid item xs={12} md={4}>
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
										<Grid item xs={12} md={4}>
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

										<Grid item xs={12} md={4}>
											<Box
												sx={{
													mt: "12px",
													display: 'flex',
													justifyContent: 'center'
												}}
											>
												<PrimaryButton type="submit" title="Search" />
											</Box>
										</Grid>
									</Grid>
								</Box>
							</Grid>
							<Grid item xs={12} sm={12} md={11}>
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
																					? item?.booking?.customer?.name?.slice(0, 8) + "..." : item?.booking?.customer?.name
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
											<Grid item sm={4}>
												<Grid container sm={12} justifyContent={"center"}>
													<Grid
														item
														xs={10}

														sx={{ mt: 8, }}
													>
														<SelectField
															size="small"
															label={"Vendor"}
															disabled={true}
															options={vendors}
															selected={selectedVendor}
															onSelect={(value) => setSelectedVendor(value)}

															register={register("vendor")}
														/>

													</Grid>



												</Grid>
											</Grid>
											<Grid item sm={4}>
												<Grid container sm={12}>
													<Grid
														item
														xs={12}
														display={"flex"}
														justifyContent={"flex-end"}
														sx={{ gap: '37px' }}
													>
														<Box>
															<Typography
																variant="h5"
																sx={{
																	color: Colors.charcoalGrey,
																	fontFamily: FontFamily.NunitoRegular,
																	mt: 4,
																	ml: "20px",
																}}
															>
																Damaged By
															</Typography>
														</Box>
														<Box sx={{ width: '80px' }}>
															<Typography
																variant="h5"
																sx={{
																	color: Colors.charcoalGrey,
																	fontFamily: FontFamily.NunitoRegular,
																	mt: 4,

																}}
															>
																USD
															</Typography>
														</Box>

													</Grid>

													<Grid
														item
														xs={12}
														display={"flex"}
														alignItems={"center"}
														justifyContent={"flex-end"}

														gap={"20px"}
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
																defaultValue={0}
																type={"number"}
																InputProps={{
																	startAdornment: (
																		<InputAdornment position="start">
																			$
																		</InputAdornment>
																	),
																}}

																register={register2("DamageVendor",
																	{
																		onChange: (e) => {
																			handleCalc()
																			if (e.target.value < 0) {
																				setValues2('DamageVendor', 0)
																			}
																		}
																	})}
															/>
														</Box>

													</Grid>

													<Grid
														item
														xs={12}
														display={"flex"}
														alignItems={"center"}
														justifyContent={"flex-end"}

														gap={"20px"}
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
																defaultValue={0}
																type={"number"}
																InputProps={{
																	startAdornment: (
																		<InputAdornment position="start">
																			$
																		</InputAdornment>
																	),
																}}
																register={register2("DamageGWS",
																	{
																		onChange: (e) => {
																			setValues2('CreditGWS', 0)
																			handleCalc()
																			if (e.target.value < 0) {
																				setValues2('DamageGWS', 0)
																			}
																		}

																	})}
															/>
														</Box>

													</Grid>
												</Grid>

											</Grid>
											<Grid item sm={4}>
												<Grid container sm={12}>
													<Grid
														item
														xs={12}
														display={"flex"}
														justifyContent={"flex-end"}
														sx={{ gap: '47px' }}
													>
														<Box>
															<Typography
																variant="h5"
																sx={{
																	color: Colors.charcoalGrey,
																	fontFamily: FontFamily.NunitoRegular,
																	mt: 4,

																}}
															>
																Credited To
															</Typography>
														</Box>
														<Box sx={{ width: '80px' }}>
															<Typography
																variant="h5"
																sx={{
																	color: Colors.charcoalGrey,
																	fontFamily: FontFamily.NunitoRegular,
																	mt: 4,
																	ml: "5px",
																}}
															>
																USD
															</Typography>
														</Box>

													</Grid>

													<Grid
														item
														xs={12}
														display={"flex"}
														alignItems={"center"}
														justifyContent={"flex-end"}

														gap={"20px"}
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
																Client Vault
															</Typography>
														</Box>
														<Box width={"100px"}>
															<InputField
																size="small"
																defaultValue={0}
																type={"number"}
																InputProps={{
																	startAdornment: (
																		<InputAdornment position="start">
																			$
																		</InputAdornment>
																	),
																}}

																register={register2("CreditVault",
																	{
																		onChange: (e) => {
																			handleCalc()
																			if (e.target.value < 0) {
																				setValues2('CreditVault', 0)
																			}
																		}
																	})}
															/>
														</Box>

													</Grid>

													<Grid
														item
														xs={12}
														display={"flex"}
														alignItems={"center"}
														justifyContent={"flex-end"}

														gap={"20px"}
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
																defaultValue={0}
																type={"number"}
																InputProps={{
																	startAdornment: (
																		<InputAdornment position="start">
																			$
																		</InputAdornment>
																	),
																}}


																register={register2("CreditGWS",
																	{
																		onChange: (e) => {
																			setValues2('DamageGWS', 0)
																			handleCalc()
																			if (e.target.value < 0) {
																				setValues2('CreditGWS', 0)
																			}
																		}
																	})}
															/>
														</Box>

													</Grid>
												</Grid>
											</Grid>
											<Grid item sm={12}>
												<Grid container sm={12} mt={8} >
													<Grid item xs={2}>
														<Box>
															<Typography
																variant="body1"
																sx={{
																	color: Colors.charcoalGrey,

																	mt: 1.6

																}}
															>
																Damage Reason :
															</Typography>
														</Box>

													</Grid>
													<Grid item xs={6}>
														<Box>
															<InputField
																size={'small'}
																register={register2("reason")}



															/>
														</Box>
													</Grid>


												</Grid>
											</Grid>


											{storageData.length > 0 && (
												<Grid
													item
													xs={12}
													sm={12}
													sx={{ mt: 4, textAlign: "right" }}
												>
													{displayButton && <PrimaryButton
														loading={loading}
														disabled={showButton}
														onClick={handleSubmit2(CreateDamage)}
														title="Save & Update"
														type="submit"

													/>}
												</Grid>
											)}
										</Grid>
									</Fragment>
								)}
							</Grid>
						</Box>
					</Grid>
				</Grid>
			</Box>
		</Fragment>
	);
}

export default BookDamage;
