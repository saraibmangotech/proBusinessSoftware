import React, { Fragment, useEffect, useRef, useState } from "react";
import {
	Box,
	CircularProgress,
	Grid,
	CardMedia,
	Typography,
	Container,
} from "@mui/material";
import { useParams } from "react-router-dom";
import Colors from "assets/Style/Colors";
import { ErrorToaster } from "components/Toaster";
import { PrimaryButton } from "components/Buttons";
import { GeneratePDF } from "utils";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import {
	FontFamily,
	Images,
	InvoiceGlobal,
	InvoiceLocation,
	InvoiceMail,
	InvoicePhone,
} from "assets";
import { makeStyles } from "@mui/styles";
import moment from "moment";
import CurrencyServices from "services/Currency";
import { QRCodeCanvas } from "qrcode.react";
import ExportServices from "services/Export";


const useStyle = makeStyles({
	headingBg: {
		margin: "32px 0px",
		padding: "12px 0px",
		textAlign: "center",
	},
	heading: {
		color: Colors.white,
		textTransform: "uppercase",
		fontWeight: 300,
		fontFamily: FontFamily.NunitoRegular,
	},
	text: {
		color: Colors.smokeyGrey,
		fontWeight: 300,
		fontFamily: FontFamily.NunitoRegular,
	},
	tableCell: {
		backgroundColor: Colors.aliceBlue,
		border: "0.25px solid #D9D9D9",
		"& .MuiTypography-root": {
			padding: "4px 12px",
		},
	},
});

function ExportVehicleDetails() {

	const { id } = useParams();
	const contentRef = useRef(null);
	const classes = useStyle();

	const [loader, setLoader] = useState(true);
	const [checkList, setCheckList] = useState("");

	// *For Invoice Detail
	const [invoiceDetail, setInvoiceDetail] = useState();

	// *For Currencies
	const [currencyExchangeRate, setCurrencyExchangeRate] = useState();

	// *For Get Invoice Detail
	const getExportInvoice = async () => {
		setLoader(true);
		try {
			let params = {
				ev_id: id,
			};
			const { data } = await ExportServices.getVehicleExportDetails(params);
			setInvoiceDetail(data?.vehicle);
			getCurrencies(data?.currency);
			setCheckList(data?.vehicle?.checkList);
		} catch (error) {
			ErrorToaster(error);
		} finally {
			setLoader(false);
		}
	};

	// *For Get Currencies
	const getCurrencies = async (currency) => {
		try {
			let params = {
				detailed: true,
			};
			const { data } = await CurrencyServices.getCurrencies(params);

			const rate = data?.currencies.find((e) => e.currency === currency)?.conversion_rate;

			setCurrencyExchangeRate(data.currencies[2].conversion_rate);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	useEffect(() => {
		if (id) {
			getExportInvoice();
		}
	}, [id]);

	return (
		<Container>
			{!loader && (
				<Box sx={{ textAlign: "right", p: 4 }}>
					<PrimaryButton
						title="Download Details"
						type="button"
						style={{ backgroundColor: Colors.bluishCyan }}
						onClick={() => GeneratePDF(contentRef.current, "details", true)}
					/>
				</Box>
			)}

			<Box
				sx={{
					width: "1000px",
					mx: 4,
					my: 2,
					bgcolor: Colors.white,
					boxShadow: "0px 8px 18px 0px #9B9B9B1A",
				}}
			>
				{!loader ? (
					<Box ref={contentRef}>
						<Grid container spacing={0}>
							<Grid item md={3.5}>
								<Box component={"img"} src={Images.logo} sx={{ height: "150px" }} />
							</Grid>
							<Grid item md={8.5}>
								<CardMedia image={Images.invoiceHeader} sx={{ mb: 2 }}>
									<Typography
										variant="h3"
										sx={{ py: 3, textAlign: "center", color: Colors.white }}
									>
										Galaxy World Wide Shipping
									</Typography>
								</CardMedia>
								<Grid
									container
									spacing={1.5}
									alignItems={"center"}
									justifyContent={"space-evenly"}
								>
									<Grid item md={4}>
										<Box
											sx={{
												display: "flex",
												gap: "5px",
												alignItems: "center",
											}}
										>
											<InvoicePhone />
											<Typography
												variant="body1"
												sx={{
													color: Colors.smokeyGrey,
													fontFamily: FontFamily.NunitoRegular,
												}}
											>
												+971 6 510 2000
											</Typography>
										</Box>
									</Grid>
									<Grid item md={6}>
										<Box
											sx={{
												display: "flex",
												gap: "5px",
												alignItems: "center",
											}}
										>
											<InvoiceMail />
											<Typography
												variant="body1"
												sx={{
													color: Colors.smokeyGrey,
													fontFamily: FontFamily.NunitoRegular,
												}}
											>
												info@galaxyshipping.com
											</Typography>
										</Box>
									</Grid>
									<Grid item md={4}>
										<Box
											sx={{
												display: "flex",
												gap: "5px",
												alignItems: "center",
											}}
										>
											<InvoiceGlobal />
											<Typography
												variant="body1"
												sx={{
													color: Colors.smokeyGrey,
													fontFamily: FontFamily.NunitoRegular,
												}}
											>
												https://galaxyshipping.com
											</Typography>
										</Box>
									</Grid>
									<Grid item md={6}>
										<Box
											sx={{
												display: "flex",
												gap: "5px",
												alignItems: "center",
											}}
										>
											<InvoiceLocation />
											<Typography
												variant="body1"
												sx={{
													color: Colors.smokeyGrey,
													fontFamily: FontFamily.NunitoRegular,
												}}
											>
												Ind Area#4 P.O Box 83126, Sharjah , UAE
											</Typography>
										</Box>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
						<Box
							sx={{
								my: 5,
								position: "relative",
								bgcolor: Colors.bluishCyan,
								width: 1,
								height: "12px",
							}}
						>
							<Typography
								component={"span"}
								variant="h2"
								sx={{
									color: Colors.charcoalGrey,
									bgcolor: Colors.white,
									p: 2,
									letterSpacing: "3px",
									position: "absolute",
									right: "90px",
									top: "-40px",
								}}
							>
								Export Invoice
							</Typography>
						</Box>
						<Grid container spacing={0} justifyContent={"space-between"}>
							<Grid item md={5.5}>
								<Box className={classes.headingBg} sx={{ bgcolor: Colors.primary }}>
									<Typography variant="h4" className={classes.heading}>
										VEHICLE INFORMATION
									</Typography>
								</Box>
								<Box sx={{ ml: 4 }}>
									<Grid container spacing={1.34}>
										<Grid item md={5}>
											<Typography variant="body1" className={classes.text}>
												VIN #
											</Typography>
										</Grid>
										<Grid item md={6}>
											<Typography variant="body1" className={classes.text}>
												{invoiceDetail?.vin ?? "-"}
											</Typography>
										</Grid>
										<Grid item md={5}>
											<Typography variant="body1" className={classes.text}>
												Make:
											</Typography>
										</Grid>
										<Grid item md={6}>
											<Typography variant="body1" className={classes.text}>
												{invoiceDetail?.make?.name ?? "-"}
											</Typography>
										</Grid>
										<Grid item md={5}>
											<Typography variant="body1" className={classes.text}>
												Model:
											</Typography>
										</Grid>
										<Grid item md={6}>
											<Typography variant="body1" className={classes.text}>
												{invoiceDetail?.model?.name ?? "-"}
											</Typography>
										</Grid>
										<Grid item md={5}>
											<Typography variant="body1" className={classes.text}>
												Year:
											</Typography>
										</Grid>
										<Grid item md={6}>
											<Typography variant="body1" className={classes.text}>
												{invoiceDetail?.year ?? "-"}
											</Typography>
										</Grid>
										<Grid item md={5}>
											<Typography variant="body1" className={classes.text}>
												Color:
											</Typography>
										</Grid>
										<Grid item md={6}>
											<Typography variant="body1" className={classes.text}>
												{invoiceDetail?.color ?? "-"}
											</Typography>
										</Grid>

										<Grid item md={5}>
											<Typography variant="body1" className={classes.text}>
												Status
											</Typography>
										</Grid>
										<Grid item md={6}>
											<Typography variant="body1" className={classes.text}>
												{invoiceDetail?.status?.name ?? "-"}
											</Typography>
										</Grid>
										<Grid item md={5}>
											<Typography variant="body1" className={classes.text}>
												Date:
											</Typography>
										</Grid>
										<Grid item md={6}>
											<Typography variant="body1" className={classes.text}>
												{moment(invoiceDetail?.date).format("DD-MMM-YYYY")}
											</Typography>
										</Grid>
									</Grid>
								</Box>

								<Box
									className={classes.headingBg}
									sx={{ bgcolor: Colors.bluishCyan }}
								>
									<Typography variant="h4" className={classes.heading}>
										checkList
									</Typography>
								</Box>
								<Box sx={{ ml: 4, mr: 2 }}>
									<Grid container spacing={2}>
										{invoiceDetail?.checklist &&
											invoiceDetail?.checklist.map((item, index) => (
												<Grid item key={index} lg={4} md={6} sm={12}>
													<div
														style={{
															display: "flex",
															justifyContent: "space-evenly",
															alignItems: "center",
														}}
													>
														<div
															style={{
																width: "120px",
																textAlign: "left",
															}}
														>
															{item.name}
														</div>
														<div
															style={{
																textAlign: "left",
															}}
														>
															{item.value == "-1" ? (
																<Box
																	sx={{
																		width: "28px",
																		height: "28px",
																		borderRadius: "50%",
																		backgroundColor: "#A3A3A3",
																	}}
																	display={"flex"}
																	justifyContent={"center"}
																	alignItems={"center"}
																>
																	<DoNotDisturbIcon
																		sx={{ color: "white" }}
																	/>
																</Box>
															) : item.value == "1" ? (
																<Box
																	sx={{
																		width: "28px",
																		height: "28px",
																		borderRadius: "50%",
																		backgroundColor: "#38CB89",
																	}}
																	display={"flex"}
																	justifyContent={"center"}
																	alignItems={"center"}
																>
																	<DoneIcon
																		sx={{ color: "white" }}
																	/>
																</Box>
															) : item.value == "0" ? (
																<Box
																	sx={{
																		width: "28px",
																		height: "28px",
																		borderRadius: "50%",
																		backgroundColor: "#d10202",
																	}}
																	display={"flex"}
																	justifyContent={"center"}
																	alignItems={"center"}
																>
																	<ClearIcon
																		sx={{
																			color: "white",
																			fontSize: "20px",
																		}}
																	/>
																</Box>
															) : (
																""
															)}
														</div>
													</div>
												</Grid>
											))}
									</Grid>
								</Box>
							</Grid>
							<Grid item md={5.5}>
								<Box sx={{ mr: 3, mt: 0 }}></Box>
								<Box className={classes.headingBg} sx={{ bgcolor: Colors.primary }}>
									<Typography variant="h4" className={classes.heading}>
										Shipping Information
									</Typography>
								</Box>
								<Box sx={{ ml: 4, mb: 4 }}>
									<Grid container spacing={1.34}>
										<Grid item md={5}>
											<Typography variant="body1" className={classes.text}>
												Pick up from
											</Typography>
										</Grid>
										<Grid item md={6}>
											<Typography variant="body1" className={classes.text}>
												{invoiceDetail?.pickup_from ?? "-"}
											</Typography>
										</Grid>
										<Grid container spacing={0} mt={"2%"}>
											{invoiceDetail?.uae_location && (
												<Grid container spacing={0} ml={1.1}>
													<Grid item md={5}>
														<Typography
															variant="body1"
															className={classes.text}
														>
															UAE Location:
														</Typography>
													</Grid>
													<Grid item md={6} ml={0.8}>
														<Typography
															variant="body1"
															className={classes.text}
														>
															{invoiceDetail?.uae_location ?? "-"}
														</Typography>
													</Grid>
												</Grid>
											)}
										</Grid>

										<Grid item md={5}>
											<Typography variant="body1" className={classes.text}>
												Final Destination:
											</Typography>
										</Grid>
										<Grid item md={6}>
											<Typography variant="body1" className={classes.text}>
												{invoiceDetail?.destination?.name ?? "-"}
											</Typography>
										</Grid>
										<Grid item md={5}>
											<Typography variant="body1" className={classes.text}>
												Payment at:
											</Typography>
										</Grid>
										<Grid item md={6}>
											<Typography variant="body1" className={classes.text}>
												{invoiceDetail?.payment_at ?? "-"}
											</Typography>
										</Grid>
									</Grid>
								</Box>
								{/* <Box sx={{ mr: 3, mb: 8 }}>
									<Grid container spacing={0} justifyContent={"flex-end"}>
										<Grid item md={4}></Grid>
										<Grid item md={8}></Grid>
										<Grid item md={4}>
											<Typography
												variant="subtitle2"
												sx={{ fontFamily: FontFamily.NunitoRegular }}
											>
												Particular
											</Typography>
										</Grid>
										<Grid item md={4}>
											<Typography
												variant="subtitle2"
												sx={{
													textAlign: "center",
													fontFamily: FontFamily.NunitoRegular,
												}}
											>
												USD
											</Typography>
										</Grid>
										<Grid item md={4}>
											<Typography
												variant="subtitle2"
												sx={{
													textAlign: "center",
													fontFamily: FontFamily.NunitoRegular,
												}}
											>
												AED
											</Typography>
										</Grid>

										<Grid item md={4} className={classes.tableCell}>
											<Typography variant="body1" className={classes.text}>
												Price:
											</Typography>
										</Grid>
										<Grid item md={4} className={classes.tableCell}>
											<Typography
												variant="body1"
												className={classes.text}
												sx={{ textAlign: "right" }}
											>
												{invoiceDetail?.price
													? parseFloat(invoiceDetail?.price)?.toFixed(2)
													: "00"}
											</Typography>
										</Grid>
										<Grid item md={4} className={classes.tableCell}>
											<Typography
												variant="body1"
												className={classes.text}
												sx={{ textAlign: "right" }}
											>
												{invoiceDetail?.price
													? parseFloat(
															invoiceDetail?.price *
																currencyExchangeRate
													  )?.toFixed(2)
													: "00"}
											</Typography>
										</Grid>
										<Grid item md={4} className={classes.tableCell}>
											<Typography variant="body1" className={classes.text}>
												Discount:
											</Typography>
										</Grid>
										<Grid item md={4} className={classes.tableCell}>
											<Typography
												variant="body1"
												className={classes.text}
												sx={{ textAlign: "right" }}
											>
												{invoiceDetail?.discount
													? parseFloat(invoiceDetail?.discount)?.toFixed(
															2
													  )
													: "00"}
											</Typography>
										</Grid>
										<Grid item md={4} className={classes.tableCell}>
											<Typography
												variant="body1"
												className={classes.text}
												sx={{ textAlign: "right" }}
											>
												{invoiceDetail?.discount
													? parseFloat(
															invoiceDetail?.discount *
																currencyExchangeRate
													  )?.toFixed(2)
													: "00"}
											</Typography>
										</Grid>
										<Grid item md={4} className={classes.tableCell}>
											<Typography variant="body1" className={classes.text}>
												Final Price:
											</Typography>
										</Grid>
										<Grid item md={4} className={classes.tableCell}>
											<Typography
												variant="body1"
												className={classes.text}
												sx={{ textAlign: "right" }}
											>
												{invoiceDetail?.final_price
													? parseFloat(
															invoiceDetail?.final_price
													  )?.toFixed(2)
													: "00"}
											</Typography>
										</Grid>
										<Grid item md={4} className={classes.tableCell}>
											<Typography
												variant="body1"
												className={classes.text}
												sx={{ textAlign: "right" }}
											>
												{invoiceDetail?.final_price
													? parseFloat(
															invoiceDetail?.final_price *
																currencyExchangeRate
													  )?.toFixed(2)
													: "00"}
											</Typography>
										</Grid>
									</Grid>
								</Box> */}

								<Box
									className={classes.headingBg}
									sx={{ bgcolor: Colors.bluishCyan, marginTop: "30% !important" }}
								>
									<Typography variant="h4" className={classes.heading}>
										Vehicle Condition
									</Typography>
								</Box>
								<Box sx={{ mr: 3, mb: 8 }}>
									<Grid container spacing={0} justifyContent={"flex-end"}>
										<Grid item md={4}></Grid>
										<Grid item md={8}></Grid>

										<Grid item md={6} className={classes.tableCell}>
											<Typography variant="body1" className={classes.text}>
												Damage On receiving:
											</Typography>
										</Grid>
										<Grid item md={6} className={classes.tableCell}>
											<Typography
												variant="body1"
												className={classes.text}
												sx={{ textAlign: "right" }}
											>
												{invoiceDetail?.damage_on_receiving ? "Yes" : "No"}
											</Typography>
										</Grid>

										<Grid item md={6} className={classes.tableCell}>
											<Typography variant="body1" className={classes.text}>
												Pictures:
											</Typography>
										</Grid>
										<Grid item md={6} className={classes.tableCell}>
											<Typography
												variant="body1"
												className={classes.text}
												sx={{ textAlign: "right" }}
											>
												{invoiceDetail?.pictures.length > 0 ? "Yes" : "No"}
											</Typography>
										</Grid>

										<Grid item md={6} className={classes.tableCell}>
											<Typography variant="body1" className={classes.text}>
												Key:
											</Typography>
										</Grid>
										<Grid item md={6} className={classes.tableCell}>
											<Typography
												variant="body1"
												className={classes.text}
												sx={{ textAlign: "right" }}
											>
												{invoiceDetail?.key ? "Yes" : "No"}
											</Typography>
										</Grid>
									</Grid>
								</Box>
								<Box
									className={classes.headingBg}
									sx={{ bgcolor: Colors.bluishCyan }}
								>
									<Typography variant="h4" className={classes.heading}>
										NOTES
									</Typography>
								</Box>
								<Box sx={{ ml: 4, mr: 2 }}>
									<Typography variant="body1" className={classes.text}>
										{invoiceDetail?.notes ?? "-"}
									</Typography>
								</Box>
							</Grid>
						</Grid>
						<Grid container spacing={0} justifyContent={"space-between"}>
							<Grid item md={9.5}>
								{/* <Box sx={{ pl: 4, pr: 3, mb: 3, mt: 4 }}>
									<Typography variant="body1" sx={{ mb: 2 }}>
										PLEASE READ CAREFULLY BELOW TERM & CONDITION:
									</Typography>
									<Typography
										variant="body2"
										className={classes.text}
										sx={{ mb: 1 }}
									>
										1 - I've clearly informed and the make the understand all
										the vehicle information, amount, charges and rates.
									</Typography>
									<Typography
										variant="body2"
										className={classes.text}
										sx={{ mb: 1 }}
									>
										2 - Kindly pay the due amount within 3 business days from
										the purchase date to avoid the Late Payment and Storages
										that will be charged once vehicle arrived to final
										destination (Further, If there are some special
										annousment/memo ignore this and follow that)
									</Typography>
									<Typography
										variant="body2"
										className={classes.text}
										sx={{ mb: 1 }}
									>
										3 - If vehicle got relisted, the relist charges customer has
										to pay within 3 days otherwise 15% Penalty will applied
										after 3 days as issued memo on 9/Jun/2022.
									</Typography>
									<Typography
										variant="body2"
										className={classes.text}
										sx={{ mb: 1 }}
									>
										4 - Galaxy Customer care department will inform you about
										the latest updates about rates and charges through WhatsApp
										and emails.
									</Typography>
								</Box> */}
							</Grid>
							<Grid item md={2}>
								<Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
									<QRCodeCanvas
										value={
											window.location.origin +
											`/export-preview/${btoa("exportvehicle-" + id)}`
										}
									/>
								</Box>
							</Grid>
						</Grid>
						<Box sx={{ pl: 4, pr: 3, py: 1, bgcolor: Colors.primary, mt: 4 }}>
							<Typography
								variant="caption"
								sx={{ color: Colors.white, fontFamily: FontFamily.NunitoRegular }}
							>
								Customer care Contact: Mohammed husni - +971523195682 (Arabic &
								English ) Ardamehr Shoev - +971545836028 (English ,Arabic, Tajik &
								Farsi)
							</Typography>
							<Typography
								variant="caption"
								sx={{ color: Colors.white, fontFamily: FontFamily.NunitoRegular }}
							>
								Ravin abdul kareem - +971528293801 (Kurdish , Arabic & English)
								Magsat Gylyjov - +97158666403 (Turken , Russian & English)
							</Typography>
						</Box>
					</Box>
				) : (
					<Box sx={{ textAlign: "center", py: 3 }}>
						<CircularProgress />
					</Box>
				)}
			</Box>
		</Container>
	);
}

export default ExportVehicleDetails;
