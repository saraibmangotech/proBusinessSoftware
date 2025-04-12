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
	IconButton,
	CircularProgress,
	Paper,
	InputAdornment
} from "@mui/material";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Colors from "assets/Style/Colors";
import SelectField from "components/Select";
import { makeStyles } from "@mui/styles";
import { FontFamily } from "assets";
import { PrimaryButton } from "components/Buttons";
import { useState, Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import styled from "@emotion/styled";
import { CircleLoading } from "components/Loaders";
import InputField from "components/Input";
import ExportServices from "services/Export";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { EyeIcon } from "assets";
import FinanceServices from "services/Finance";
import { useAuth } from "context/UseContext";

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

function CreateDamage() {
	const classes = useStyles();
	const { user } = useAuth();


	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	//*Table Headings
	const tableHead = [
		"Ref No",
		"Date",
		"Customer",
		"VIN",
		"Year",
		"Make",
		"Model",
		"Color",
		"Accountable Party",
		"Damage Part",
		"Cost",
		"View",
	];

	//*Vehicle Id
	const [ev_id, setEv_id] = useState();

	//*Loading
	const [loading, setLoading] = useState(false);
	const [loader, setLoader] = useState(false);

	// *For Filters
	const [filters, setFilters] = useState({});

	//*For Manifest
	const [manifestOptions, setManifestOptions] = useState([]);
	const [selectedManifest, setSelectedManifest] = useState(null);

	//*For Vehicle Data
	const [ExportData, setExportData] = useState();

	///For get Customers
	const [customersOptions, setCustomersOptions] = useState([]);
	const [selectedCustomer, setSelectedCustomer] = useState(null);

	const [cashierAccounts, setCashierAccounts] = useState([])
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [userData, setUserData] = useState()

	// *For Permissions
	const [permissions, setPermissions] = useState();



	//*For Get Vehicles Details
	const getExportVehicles = async (filter) => {
		try {
			const Filter = { ...filters, ...filter };
			setFilters(Filter);
			let params = {
				page: 1,
				limit: 15,
			};
			params = { ...params, ...Filter };
			const { data } = await ExportServices.getExportVehicles(params);

			setExportData(data?.vehicles?.rows);
			setEv_id(data?.vehicles?.rows[0].id);
			setUserData(data?.vehicles?.rows[0])
			console.log(data?.vehicles?.rows);
			const agentAndBrokerArray = data?.vehicles?.rows.flatMap(item => [item.agent, item.broker]);
			console.log(agentAndBrokerArray, 'agentAndBrokerArrayagentAndBrokerArray');
			let newArray = agentAndBrokerArray.filter(element => element !== null);

			console.log(newArray);
			console.log([...newArray, { id: '30001', name: 'GWS' }]);
			setCustomersOptions([...newArray, { id: '30001', name: 'GWS' }])


		} catch (error) {
			ErrorToaster(error);
		}
	};




	//*Get Manifest Options
	const getManifest = async () => {
		try {
			const { data } = await ExportServices.getManifest();
			setManifestOptions(
				data?.filter?.vins.map((item) => {
					return { id: item, name: item };
				})
			);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	//*For Damage Create
	const CreateDamage = async (formData) => {
		setLoading(true);
		console.log(userData, 'userData');
		try {
			let obj = {
				ev_id: ev_id,
				accountable_party_id: selectedCustomer.id,
				damaged_part: formData?.DamagePart,
				damage_cost: formData?.DamageCost,
				damage_description: formData?.DamageDescription,
				customer_id: userData?.customer_id,
				vin: userData?.vin,
				make_name: userData?.make?.name,
				model_name: userData?.model?.name,
				color: userData?.color,
				year: userData?.year
			};

			const { message } = await ExportServices.CreateDamage(obj);
			SuccessToaster(message);
			handleFilter({ filter: selectedManifest.id });
		} catch (error) {
			ErrorToaster(error);
		} finally {
			setLoading(false);
		}
	};

	// *For Handle Filter
	const handleFilter = (data) => {
		getExportVehicles(data);
	};

	useEffect(() => {
		setPermissions(true);
		// getExportCustomers();
		getManifest();

	}, []);

	return (
		<Box component={"form"} onSubmit={handleSubmit(CreateDamage)}>
			<Box sx={{ width: '50%' }}>
				<Grid
					container
					sx={{

						borderRadius: "5px",

						p: 0,
						pb: 1,
						m: 4,
						mb: 1,
						mt: 3
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
						Update Damage
					</Typography>
				</Grid>
			</Box>
			<Grid
				container
				sx={{

					borderRadius: "5px",

					p: 4,
					pb: 0,
					pt: 0
				}}
			>
				<Grid sm={12} md={3} item>
					<SelectField
						size={'small'}
						label={"VIN"}
						options={manifestOptions}
						selected={selectedManifest}
						onSelect={(value) => {
							setSelectedManifest(value);
							handleFilter({ filter: value?.id });
						}}
						error={errors?.manifest?.message}
						register={register("manifest", {
							required: "Please select manifest .",
						})}
					/>
				</Grid>
			</Grid>

			<Box sx={{ m: 4, mb: 2, mt: 0 }}>
				{ExportData && (
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
															bgcolor: index % 2 !== 0 && "#EFF8E7",
														}}
													>
														<Cell>{item?.id ?? "-"}</Cell>
														<Cell>
															{" "}
															{item?.created_at
																? moment(item?.created_at).format(
																	"MM-DD-YYYY"
																)
																: "N/A"}
														</Cell>
														<Cell>{item?.customer?.name ?? "-"}</Cell>
														<Cell>{item?.vin ?? "-"}</Cell>
														<Cell>{item?.year ?? "-"}</Cell>
														<Cell>{item?.make?.name ?? "-"}</Cell>
														<Cell>{item?.model?.name ?? "-"}</Cell>
														<Cell>{item?.color ?? "-"}</Cell>
														<Cell>
															{item?.accountable?.name ?? "-"}
														</Cell>
														<Cell>{item?.damaged_part ?? "-"}</Cell>
														<Cell>{item?.damage_cost ?? "-"}</Cell>
														<Cell>
															<Box
																sx={{
																	display: "flex",
																	justifyContent: "space-between",
																	gap: "20px",
																}}
															>
																<Box
																	sx={{ gap: "16px !important" }}
																>
																	<Box
																		onClick={() =>
																			navigate(
																				`/damage-detail-view/${item?.vin}`,
																				{
																					state: {
																						shipping: true,
																					},
																				}
																			)
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
																			View Detail
																		</Typography>
																	</Box>
																</Box>
															</Box>
														</Cell>
													</Row>
												))}
											</Fragment>
										) : (
											<Row>
												<Cell
													colSpan={tableHead?.length + 1}
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
												colSpan={tableHead?.length + 2}
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
				)}
			</Box>
			{ExportData?.length > 0 && <><Box
				sx={{
					m: 4,
					p: 2,
					mb: 0,
					mt: 0,
					bgcolor: Colors.white,
					borderRadius: 3,
					boxShadow: "0px 8px 18px 0px #9B9B9B1A",
				}}
			>
				<Grid container spacing={2}>
					<Grid item xs={12} sm={12}>
						<Typography
							variant="h5"
							sx={{
								color: Colors.charcoalGrey,
								fontFamily: FontFamily.NunitoRegular,
								mb: 0,
							}}
						>
							Damage Information
						</Typography>
					</Grid>
					<Grid item xs={3} sm={3} md={3}>
						<SelectField
							size={'small'}
							label={"Accountable Party"}
							options={customersOptions}
							selected={selectedCustomer}
							onSelect={(value) => {
								setSelectedCustomer(value);
							}}
						/>
					</Grid>
					<Grid item xs={3} sm={3} md={3}>
						<InputField
							size={'small'}
							label={" Damage Part"}
							placeholder={" Damage part"}
							error={errors?.DamagePart?.message}
							register={register("DamagePart", {
								required: "Please enter damage  part.",
							})}
						/>
					</Grid>
					<Grid item xs={3} sm={6} md={3}>
						<InputField
							size={'small'}
							label={"Damage Cost"}
							placeholder={"Damage Cost"}
							error={errors?.DamageCost?.message}
							endAdornment={
								<InputAdornment position="end">
									<IconButton>
										<AttachMoneyIcon />
									</IconButton>
								</InputAdornment>
							}
							register={register("DamageCost", {
								required: "Please enter damage  cost.",
							})}
						/>
					</Grid>
					<Grid item xs={3}>

						<InputField
							label={'Description'}
							size={'small'}
							error={errors?.DamageDescription?.message}
							register={register("DamageDescription", {
								required: "Please enter damage description.",
							})}
						/>
					</Grid>

					<Grid item xs={12} sm={12} sx={{ mt: 0, textAlign: "right", p: 4, pt: 1 }}>
						<PrimaryButton disabled={customersOptions?.length > 0 ? false : true} title="Update" type="submit" loading={loading} />
					</Grid>
				</Grid>
			</Box>

			</>}
		</Box>
	);
}
export default CreateDamage;
