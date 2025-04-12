import React from "react";
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
	InputLabel,
} from "@mui/material";
import RowRadioButtonsGroup from "components/Input/RadioGroup";
import Colors from "assets/Style/Colors";
import DatePicker from "components/DatePicker";
import { makeStyles } from "@mui/styles";
import { FontFamily } from "assets";
import { PrimaryButton } from "components/Buttons";
import { useState, Fragment } from "react";
import { Icons } from "assets/index";
import { useForm } from "react-hook-form";
import styled from "@emotion/styled";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import InputField from "components/Input";
import ExportServices from "services/Export";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import moment from "moment";
import UploadedFile from "components/UploadedFile";
import SelectField from "components/Select";

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
		background: Colors.tableGradient,
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

function CustomerHandover() {
	const {
		register,
		handleSubmit,
		formState: { errors },
		getValues
	} = useForm();

	//*Table Headings
	const tableHead = ["Inv.#", "Shipped Date", "Client ID", "Name", "Agent", "Broker", "Vin/Cont.#", "Status"];

	const DamageRadioOptions = [
		{ value: true, label: "Yes" },
		{ value: false, label: "No" },
	];
	const PersonTypeOptions = [
		{ value: true, label: "Receiving Customer" },
		{ value: false, label: "Authorized Person " },
	];

	//*Radio Change
	const [radioValue, setRadioValue] = useState(false);
	const [personType, setPersonType] = useState(true);

	const [VIN, setVIN] = useState("");

	const [accountableParty, setAccountableParty] = useState();

	//*For Damage Details
	const [damageType, setDamageType] = useState();
	const [damageDesc, setDamageDesc] = useState();
	const [damageDate, setDamageDate] = useState();

	//*For Ids
	const [shipment_id, setShipment_id] = useState();
	const [Id, setId] = useState();
	const [idChecker, setIdChecker] = useState();

	//*For Person Details
	const [authorizedName, setAuthorizedName] = useState();
	const [authorizedNumber, setAuthorizedNumber] = useState();
	const [authorizedDoc, setAuthorizedDoc] = useState();
	const [authorizeFile, setAuthorizeFile] = useState();

	const [receivingPartyOptions, setReceivingPartyOptions] = useState([])
	const [selectedReceivingParty, setSelectedReceivingParty] = useState()

	const [loading, setLoading] = useState(false);
	const [loading2, setLoading2] = useState(false);
	const classes = useStyles();

	const [loader, setLoader] = useState(false);

	// *For Dialog Box
	const [confirmationDialog, setConfirmationDialog] = useState(false);

	// *For Pagination
	const [totalCount, setTotalCount] = useState(0);
	const [pageLimit, setPageLimit] = useState(50);
	const [currentPage, setCurrentPage] = useState(1);
	const [ExportData, setExportData] = useState();

	const [buttonDisabled, setButtonDisabled] = useState(false)

	// *For Filters
	const [filters, setFilters] = useState({});

	//*Data
	const [showData, setsShowData] = useState(false);

	//*Container Data
	const [Container, setContainer] = useState("");

	const [showDamage, setShowDamage] = useState(false)

	//* Radio Change Functions
	const handleRadioChange = (event) => {
		setRadioValue(event.target.value);
	};

	const handleRadioPersonChange = (event) => {
		setPersonType(event.target.value);
	};

	// *For Export Vehicles
	const getExportVehicles = async (page, limit, filter) => {
		try {
			const Page = page ? page : currentPage;
			const Limit = limit ? limit : pageLimit;
			let Filter;

			if (filter) {
				Filter = { ...filter };
			} else {
				Filter = { ...filters, ...filter };
			}
			setCurrentPage(Page);
			setPageLimit(Limit);
			setFilters(Filter);
			let params = {
				page: Page,
				limit: Limit,
			};
			params = { ...params, ...Filter };
			const { data } = await ExportServices.getShipmentDetails(params);
			setShipment_id(data?.shipments?.rows[0]?.id);
			console.log(data?.shipments?.rows[0]?.id);
			if (data?.shipments?.rows[0]?.handed_over) {
				ErrorToaster("Vehicle Already Handed Over")
			}
			else {

				setExportData(data?.shipments?.rows);
			}

			console.log(data?.shipments?.rows[0]?.vehicle, 'data');
			const Data = data?.shipments?.rows[0]?.vehicle;
			if (Data.damage_cost) {
				setShowDamage(true)
			}
			else {
				setShowDamage(false)
			}



			setTotalCount(data?.shipments?.count);
			setAccountableParty(data?.shipments?.rows[0]?.vehicle?.accountable?.name);
			console.log(data?.shipments?.rows[0].id);

			if (data?.shipments?.rows[0]?.ev_id) {
				setId(data?.shipments?.rows[0]?.ev_id);
				setIdChecker(true);
				setButtonDisabled(false)
			} else {
				setId(data?.shipments?.rows[0]?.container_id);
				setIdChecker(false);
				setButtonDisabled(false)
			}
			setDamageDate(data?.shipments?.rows[0]?.vehicle?.date);
			setDamageType(data?.shipments?.rows[0]?.vehicle?.damaged_part);
			setDamageDesc(data?.shipments?.rows[0]?.vehicle?.damage_description);
			setAuthorizedName(data?.shipments?.rows[0]?.customer?.customerProfile?.ap_name);
			setAuthorizedNumber(data?.shipments?.rows[0]?.customer?.customerProfile?.ap_number);
			setAuthorizedDoc(data?.shipments?.rows[0]?.customer?.customerProfile?.ap_document_name);
			setAuthorizeFile(data?.shipments?.rows[0]?.customer?.customerProfile?.ap_documents);
		} catch (error) {
			ErrorToaster(error);


		}
	};

	//*Search by Vin Or Container Condition
	const handleData = (e) => {
		e.preventDefault()
		if (VIN) {
			setContainer("");
			handleFilter({ vin: VIN });
		} else if (Container) {
			setVIN("");
			handleFilter({ container_number: Container });
		}
	};

	//*Filter

	const handleFilter = (data) => {
		getExportVehicles(1, "", data);
		setsShowData(true);
	};

	//*Handover to Customer

	const CustomerHandover = async (formData) => {
		setLoading(true);

		try {
			let obj;
			if (idChecker) {
				obj = {
					receiver_customer: personType, //If received by Customer then true || if receive by Authorized person than false
					damage_claim: radioValue,
					shipment_id: shipment_id,
					ev_id: Id,
					country_id: ExportData[0].vehicle?.country_id,
					customer_id: ExportData[0].customer?.id,
					customer_name: ExportData[0].customer?.name,
					customer_phone: ExportData[0].customer?.uae_phone,
					final_amount: ExportData[0].vehicle?.final_price,
					vin: ExportData[0]?.vin,
					color: ExportData[0]?.vehicle?.color,
					year: ExportData[0]?.vehicle?.year,
					make_name: ExportData[0]?.vehicle?.make?.name,
					model_name: ExportData[0]?.vehicle?.make?.name,
					manifest_no: ExportData[0]?.vehicle?.manifest_number,
					receiver: getValues('party'),
					notes: getValues('Notes')
				};
			} else {
				console.log(ExportData[0]);
				obj = {
					receiver_customer: personType, //If received by Customer then true || if receive by Authorized person than false
					damage_claim: radioValue,
					shipment_id: shipment_id,
					container_id: ExportData[0]?.container_id,
					container_number: ExportData[0]?.container_number,
					country_id: ExportData[0]?.container?.country_id,
					final_amount: ExportData[0]?.container?.price,
					receiver: getValues('party'),
					notes: getValues('Notes')
				};
			}
			console.log(obj);
			const { message } = await ExportServices.CustomerHandover(obj);
			SuccessToaster(message);

			setButtonDisabled(true)
		} catch (error) {
			ErrorToaster(error);
			setButtonDisabled(true)
		} finally {
			setLoading(false);
			setButtonDisabled(true)
		}
	};

	return (
		<Box>
			<Box sx={{ width: '50%' }}>
				<Grid
					container
					sx={{

						borderRadius: "5px",

						p: 0,
						pb: 1,
						m: 4,
						mb: 1
					}}
					display={"flex"}


				>
					<Typography
						variant="h5"
						sx={{
							color: Colors.charcoalGrey,
							fontFamily: FontFamily.NunitoRegular,

							textAlign: "left",

						}}
					>
						Shipment Handover
					</Typography>
				</Grid>
			</Box>


			<Grid
				container
				sx={{

					borderRadius: "5px",

					p: 0,
					pb: 1,
					m: 4
				}}
				xs={10}

				spacing={1}
			>
				<Grid sm={12} md={3} item>
					{" "}
					<InputField
						size={"small"}
						placeholder={"VIN"}

						label={"VIN"}
						value={VIN}
						register={register("vin", {
							onChange: (e) => {
								setVIN(e.target.value);
								setContainer("");
							},
						})}
					/>
				</Grid>
				<Grid sm={12} md={3} item>
					{" "}
					<InputField
						size={"small"}
						placeholder={"Container"}
						label={"Container"}
						value={Container}

						register={register("Container", {
							onChange: (e) => {
								setContainer(e.target.value);
								setRadioValue(false)

								setVIN("");
							},
						})}
					/>
				</Grid>
				<Grid
					sm={12}
					md={2}
					item
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						marginTop: "10px",
					}}
				>
					<PrimaryButton
						title="Search"
						src={Icons.SearchIcon}
						onClick={(e) => handleData(e)}
						loading={loading2}
					/>
				</Grid>
			</Grid>

			<Box component={"form"} onSubmit={handleSubmit(CustomerHandover)}>
				<Box sx={{ m: 4, mb: 2 }}>
					{/* ========== Confirmation Dialog ========== */}
					<ConfirmationDialog
						open={confirmationDialog}
						onClose={() => setConfirmationDialog(false)}
						message={"Are you sure you want to delete this?"}
					// action={() => deleteBuyerId()}
					/>

					{ExportData ? (
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
										{!loader ? (
											ExportData?.length > 0 ? (
												<Fragment>
													{ExportData.map((item, index) => (
														<Row
															key={index}
															sx={{
																bgcolor:
																	index % 2 !== 0 && "#EFF8E7",
															}}
														>
															<Cell>{item?.id ?? "-"}</Cell>
															<Cell>
																{" "}
																{moment(item?.created_at).format(
																	"MM-DD-YYYY"
																) ?? "-"}
															</Cell>
															<Cell>{item?.customer?.id ?? "-"}</Cell>
															<Cell>
																{item?.customer?.name ?? "-"}
															</Cell>
															<Cell>
																{item?.vehicle ? item?.vehicle?.agent?.name : item?.container?.agent?.name ?? "-"}
															</Cell>
															<Cell>
																{item?.vehicle ? item?.vehicle?.broker?.name : item?.container?.broker?.name ?? "-"}
															</Cell>
															<Cell>
																{item?.vin
																	? item?.vin
																	: item?.container_number ?? "-"}
															</Cell>
															<Cell>
																{item?.vehicle?.status?.name
																	? item?.vehicle?.status?.name
																	: item?.container?.status
																		?.name ?? "-"}
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
														No Data Found
													</Cell>
												</Row>
											)
										) : (
											<Row>
												<Cell
													colSpan={tableHead.length + 2}
													align="center"
													sx={{ fontWeight: 600 }}
												>
													<Box className={classes.loaderWrap}>
														<CircularProgress />
													</Box>
												</Cell>
											</Row>
										)}
									</TableBody>
								</Table>
							</TableContainer>
						</Fragment>
					) : (
						""
					)}
				</Box>
				{ExportData?.length > 0 && <Box
					sx={{
						m: 4,
						p: 5,
						bgcolor: Colors.white,
						borderRadius: 3,
						boxShadow: "0px 8px 18px 0px #9B9B9B1A",
					}}
				>
					<Grid container spacing={0}>
						<Grid item xs={6}>
							{Container == '' && showDamage && <Grid item xs={12} sm={12} md={12}>
								<RowRadioButtonsGroup
									label="Damage Claim"
									options={DamageRadioOptions}
									value={radioValue}
									onChange={handleRadioChange}
								/>
							</Grid>}
							<Grid item xs={12} sm={8} md={8}>
								<InputField
									size={'small'}
									placeholder={"Receiving Party"}

									label={"Receiving Party"}
									error={errors?.party?.message}
									register={register("party", {
										required: "Please select Receiving Party .",

									})}
								/>
							</Grid>

						</Grid>



						<Grid
							item
							xs={12}
							sm={6}
							md={6}
							spacing={0}
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: "10px",
							}}
						>
							<InputLabel sx={{ width: "50%", textAlign: "right" }}>Date </InputLabel>
							<DatePicker size="small" />
						</Grid>
						<Grid item xs={6}>
							{" "}
							<InputField
								size={'small'}
								label={"Notes"}

								error={errors?.Notes?.message}
								register={register("Notes")}
							/>
						</Grid>

						{radioValue == "true" && showData && (
							<>
								{" "}
								<Grid container lg={12} spacing={2}>
									<Grid item xs={12} sm={6} md={3}>
										<InputField
											size={'small'}
											label={"Accountable Party"}
											disabled={true}
											value={accountableParty ? accountableParty : "-"}
										/>
									</Grid>
									<Grid item xs={12} sm={6} md={3}>
										<InputField
											size={'small'}
											label={"Damage Type"}
											disabled={true}
											value={damageType ? damageType : "-"}
										/>
									</Grid>
									<Grid item xs={12} sm={6} md={3}>
										<InputField
											size={'small'}
											label={"Damage Description"}
											disabled={true}
											value={damageDesc ? damageDesc : "-"}
										/>
									</Grid>{" "}
									<Grid item xs={12} sm={6} md={3}>
										<InputField
											size={'small'}
											label={"Damage Create Date"}
											disabled={true}
											value={
												damageDate
													? moment(damageDate).format("MM-DD-YYYY")
													: "-"
											}
										/>
									</Grid>
									<Grid item xs={6}>
										{" "}
										<InputField
											size={'small'}
											label={"Notes"}

											error={errors?.Notes?.message}
											register={register("Notes")}
										/>
									</Grid>
								</Grid>
							</>
						)}
						{personType == "false" && showData && (
							<>
								{" "}
								<Grid container lg={12} spacing={3}>
									<Grid item xs={12} sm={6} md={4}>
										<InputField
											label={"Authorized person name"}
											disabled={true}
											value={authorizedName ? authorizedName : "-"}
										/>
									</Grid>
									<Grid item xs={12} sm={6} md={4}>
										<InputField
											label={"Authorized Person Number"}
											disabled={true}
											value={authorizedNumber ? authorizedNumber : "-"}
										/>
									</Grid>
									<Grid item xs={12} sm={6} md={4}>
										<InputField
											label={"Document Name"}
											disabled={true}
											value={authorizedDoc ? authorizedDoc : "-"}
										/>
									</Grid>{" "}
									<Grid sm={12} sx={{ display: "flex", gap: "15px" }}>
										<Grid
											item
											xs={12}
											sm={3.5}
											sx={{
												backgroundColor: Colors.white,
												borderLeft: "",
												borderRadius: "15px",
												padding: "15px !important",
												ml: 2,
											}}
										>
											<Box sx={{ mb: 1.5 }}>
												<Typography
													variant="body1"
													sx={{ color: Colors.charcoalGrey }}
												>
													Document
												</Typography>

												{authorizeFile.length > 0 ? (
													<UploadedFile
														data={{
															name: "Document",
															file: authorizeFile,
														}}
													/>
												) : (
													"N/A"
												)}
											</Box>
										</Grid>
									</Grid>
									{/* <Grid item xs={12} sm={6} md={4}>
								<InputField
									label={"Damage Create Date"}
									disabled={true}
									value={
										damageDate ? moment(damageDate).format("MM-DD-YYYY") : "-"
									}
								/>
							</Grid> */}
								</Grid>
							</>
						)}
					</Grid>
				</Box>}

				{ExportData?.length > 0 && <Grid item xs={12} sm={12} sx={{ mt: 4, textAlign: "right", p: 4 }}>
					<PrimaryButton disabled={buttonDisabled} title="Shipment Handover" type="submit" loading={loading} />
				</Grid>}
			</Box>
		</Box>
	);
}
export default CustomerHandover;
