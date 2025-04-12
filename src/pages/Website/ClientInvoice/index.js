import React, { useEffect, useRef, useState } from "react";
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
import { GeneratePDF, handleExportWithComponent } from "utils";
import ClientServices from "services/Client";
import { Debounce } from "utils";

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
import { useReactToPrint } from "react-to-print";
import { PDFExport } from "@progress/kendo-react-pdf";


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

function ClientInvoicePreview() {

	const { id } = useParams();
	const contentRef = useRef(null);
	const classes = useStyle();

	const [loader, setLoader] = useState(true);

	// *For Invoice Detail
	const [invoiceDetail, setInvoiceDetail] = useState();

	// *For Sum
	const [sum, setSum] = useState();

	// *For Currencies
	const [currencyExchangeRate, setCurrencyExchangeRate] = useState();

	// *For Get Invoice Detail
	const getClientInvoice = async () => {
		setLoader(true);
		console.log(atob(id).split('-')[1]);
		try {
			let params = {
				invoice_id: atob(id).split('-')[1],
			};
			const { data } = await ClientServices.getClientInvoicePreview(params);
			setInvoiceDetail(data?.details);
			let costing = data?.details?.costing
			setSum(parseFloat(costing?.shipping_charges) + parseFloat(costing?.broker_fee) + parseFloat(costing?.category_a) + parseFloat(costing?.late_fee) + parseFloat(costing?.other_charge) + parseFloat(costing?.storage) + parseFloat(costing?.title_fee))
			getCurrencies(data?.currency);
		} catch (error) {
			ErrorToaster(error);
		} finally {
			setLoader(false);
		}
	};
	const handlePrint = useReactToPrint({
		content: () => contentRef.current,
		documentTitle: 'ShippingInvoice',
	});

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
			getClientInvoice();
		}
	}, [id]);

	useEffect(() => {
		if (!loader) {
			let Url = window.location.href

			if (Url.includes('mobile')) {
				handleExportWithComponent(contentRef)
			}
		}

	}, [loader])

	return (
		<Container>
			{!loader && (
				<Box sx={{ textAlign: "right", p: 4 }}>
					<PrimaryButton
						title="Download PDF"
						type="button"
						style={{ backgroundColor: Colors.bluishCyan }}
						onClick={() => handleExportWithComponent(contentRef)}
					/>
				</Box>
			)}
			<PDFExport ref={contentRef} fileName="Import Shipping Invoice">
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
						<Box >
							<Grid container spacing={0}>
								<Grid item xs={3.5}>
									<Box
										component={"img"}
										src={Images.logo}
										sx={{ height: "150px", ml: 2 }}
									/>
								</Grid>
								<Grid item xs={8.5}>
									<CardMedia image={Images.invoiceHeader} sx={{ mb: 2 }}>
										<Typography
											variant="h3"
											sx={{ py: 3, textAlign: "center", color: Colors.white }}
										>
											Galaxy Used Cars Tr. LLC
										</Typography>
									</CardMedia>
									<Grid
										container
										spacing={1.5}
										alignItems={"center"}
										justifyContent={"space-evenly"}
									>
										<Grid item xs={4}>
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
										<Grid item xs={6}>
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
										<Grid item xs={4}>
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
										<Grid item xs={6}>
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
									IMPORT SHIPPING INVOICE
								</Typography>
							</Box>
							<Grid container spacing={0} justifyContent={"space-between"}>
								<Grid item xs={5.5}>
									<Box sx={{ ml: 4, mb: 7.5 }}>
										<Grid container spacing={0.5}>
											<Grid item xs={12}>
												<Typography
													variant="h4"
													className={classes.text}
													sx={{ mb: 1 }}
												>
													Invoice To:
												</Typography>
											</Grid>
											<Grid item xs={5}>
												<Typography variant="body1" className={classes.text}>
													Customer ID:
												</Typography>
											</Grid>
											<Grid item xs={6}>
												<Typography
													noWrap
													variant="body1"
													className={classes.text}
												>
													{invoiceDetail?.customer?.id ?? "-"}
												</Typography>
											</Grid>
											<Grid item xs={5}>
												<Typography variant="body1" className={classes.text}>
													Customer Name:
												</Typography>
											</Grid>
											<Grid item xs={6}>
												<Typography variant="body1" className={classes.text}>
													{invoiceDetail?.customer?.name ?? "-"}
												</Typography>
											</Grid>
											<Grid item xs={5}>
												<Typography variant="body1" className={classes.text}>
													Phone:
												</Typography>
											</Grid>
											<Grid item xs={6}>
												<Typography variant="body1" className={classes.text}>
													{invoiceDetail?.customer?.uae_phone ?? "-"}
												</Typography>
											</Grid>
											<Grid item xs={5}>
												<Typography variant="body1" className={classes.text}>
													Email:
												</Typography>
											</Grid>
											<Grid item xs={6}>
												<Typography variant="body1" className={classes.text}>
													{invoiceDetail?.customer?.email ?? "-"}
												</Typography>
											</Grid>
										</Grid>
									</Box>
									<Box className={classes.headingBg} sx={{ bgcolor: Colors.primary }}>
										<Typography variant="h5" className={classes.heading}>
											VEHICLE INFORMATION
										</Typography>
									</Box>
									<Box sx={{ ml: 4 }}>
										<Grid container spacing={1.34}>
											<Grid item xs={5}>
												<Typography variant="body1" className={classes.text}>
													Buyer ID
												</Typography>
											</Grid>
											<Grid item xs={6}>
												<Typography variant="body1" className={classes.text}>
													{invoiceDetail?.booking?.buyer?.name ?? "-"}
												</Typography>
											</Grid>
											<Grid item xs={5}>
												<Typography variant="body1" className={classes.text}>
													Purchase Date
												</Typography>
											</Grid>
											<Grid item xs={6}>
												<Typography variant="body1" className={classes.text}>

													{moment(invoiceDetail?.booking?.purchase_date).format("DD-MMM-YYYY")}
												</Typography>
											</Grid>
											<Grid item xs={5}>
												<Typography variant="body1" className={classes.text}>
													VIN #
												</Typography>
											</Grid>
											<Grid item xs={6}>
												<Typography variant="body1" className={classes.text}>
													{invoiceDetail?.booking?.vin ?? "-"}
												</Typography>
											</Grid>
											<Grid item xs={5}>
												<Typography variant="body1" className={classes.text}>
													Make:
												</Typography>
											</Grid>
											<Grid item xs={6}>
												<Typography variant="body1" className={classes.text}>
													{invoiceDetail?.booking?.veh_make?.name ?? "-"}
												</Typography>
											</Grid>
											<Grid item xs={5}>
												<Typography variant="body1" className={classes.text}>
													Model:
												</Typography>
											</Grid>
											<Grid item xs={6}>
												<Typography variant="body1" className={classes.text}>
													{invoiceDetail?.booking?.veh_model?.name ?? "-"}
												</Typography>
											</Grid>
											{/* <Grid item xs={5}>
											<Typography variant="body1" className={classes.text}>
												Year:
											</Typography>
										</Grid>
										<Grid item xs={6}>
											<Typography variant="body1" className={classes.text}>
												{invoiceDetail?.year ?? "-"}
											</Typography>
										</Grid> */}
											<Grid item xs={5}>
												<Typography variant="body1" className={classes.text}>
													Color:
												</Typography>
											</Grid>
											<Grid item xs={6}>
												<Typography variant="body1" className={classes.text}>
													{invoiceDetail?.booking?.color ?? "-"}
												</Typography>
											</Grid>

											{/* <Grid item xs={5}>
											<Typography variant="body1" className={classes.text}>
												Status
											</Typography>
										</Grid>
										<Grid item xs={6}>
											<Typography variant="body1" className={classes.text}>
												{invoiceDetail?.status?.name ?? "-"}
											</Typography>
										</Grid> */}
											<Grid item xs={5}>
												<Typography variant="body1" className={classes.text}>
													Arrived Date:
												</Typography>
											</Grid>
											<Grid item xs={6}>
												<Typography variant="body1" className={classes.text}>
													{moment(invoiceDetail?.booking?.arrived_galaxy_date).format("DD-MMM-YYYY")}
												</Typography>
											</Grid>
										</Grid>
									</Box>
									<Box
										className={classes.headingBg}
										sx={{ bgcolor: Colors.primary, }}
									>
										<Typography variant="h5" className={classes.heading}>
											Payment History
										</Typography>
									</Box>

									<Box sx={{ mr: 2, mb: 8, ml: 2 }}>
										<Grid container spacing={0} justifyContent={"flex-end"}>
											<Grid item xs={4}></Grid>
											<Grid item xs={8}></Grid>
											{invoiceDetail?.payments.length > 0 && <> <Grid item xs={4}>
												<Typography
													variant="subtitle2"
													sx={{ fontFamily: FontFamily.NunitoRegular }}
												>
													Paid On
												</Typography>
											</Grid>

												<Grid item xs={4}>
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
												<Grid item xs={4}>
													<Typography
														variant="subtitle2"
														sx={{
															textAlign: "center",
															fontFamily: FontFamily.NunitoRegular,
														}}
													>
														AED
													</Typography>
												</Grid> </>}

											{invoiceDetail?.payments && invoiceDetail?.payments?.map((payment, index) => (

												<React.Fragment key={index}>
													{console.log(index)}
													<Grid item xs={4} className={classes.tableCell}>
														<Typography variant="body1" className={classes.text}>

															{moment(payment.createdAt).format(
																"DD-MMM-YYYY"
															)}
														</Typography>
													</Grid>

													<Grid item xs={4} className={classes.tableCell}>
														<Typography variant="body1" className={classes.text} sx={{ textAlign: "right" }}>
															{parseFloat(payment.applied_amount).toFixed(2)}
														</Typography>
													</Grid>
													<Grid item xs={4} className={classes.tableCell}>
														<Typography variant="body1" className={classes.text} sx={{ textAlign: "right" }}>
															{parseFloat(parseFloat(payment.applied_amount) * currencyExchangeRate).toFixed(2)}
														</Typography>
													</Grid>
												</React.Fragment>
											))}













										</Grid>
									</Box>

									<Box
										className={classes.headingBg}
										sx={{ bgcolor: Colors.bluishCyan }}
									>
										<Typography variant="h5" className={classes.heading}>
											NOTES
										</Typography>
									</Box>
									<Box sx={{ ml: 4, mr: 2 }}>
										<Typography variant="body1" className={classes.text}>
											{invoiceDetail?.notes ?? "-"}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={5.5}>
									<Box sx={{ mr: 3, mt: 0 }}>
										<Grid container spacing={0} justifyContent={"flex-end"}>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													Invoice #:
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													GSI-{atob(id).split('-')[1]}
												</Typography>
											</Grid>

											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													Invoice on:
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													{moment(invoiceDetail?.invoice?.created_at).format(
														"DD-MMM-YYYY hh:mm"
													)}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													Creation on:
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													{moment(
														invoiceDetail?.invoice?.booking?.created_at
													).format("DD-MMM-YYYY hh:mm")}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													Last Updated on:
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													{moment(invoiceDetail?.invoice?.updated_at).format(
														"DD-MMM-YYYY hh:mm"
													)}
												</Typography>
											</Grid>
										</Grid>
									</Box>
									<Box
										className={classes.headingBg}
										sx={{ bgcolor: Colors.primary, }}
									>
										<Typography variant="h5" className={classes.heading}>
											Computation
										</Typography>
									</Box>

									<Box sx={{ mr: 3, mb: 8 }}>
										<Grid container spacing={0} justifyContent={"flex-end"}>
											<Grid item xs={4}></Grid>
											<Grid item xs={8}></Grid>
											<Grid item xs={6}>
												<Typography
													variant="subtitle2"
													sx={{ fontFamily: FontFamily.NunitoRegular }}
												>
													Particular
												</Typography>
											</Grid>
											<Grid item xs={3}>
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
											<Grid item xs={3}>
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

											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													Shipping Charge:
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.total
														? parseFloat(invoiceDetail?.costing?.shipping_charges)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.total
														? parseFloat(
															invoiceDetail?.costing?.shipping_charges *
															currencyExchangeRate
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													Late Fee:
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.paid
														? parseFloat(invoiceDetail?.costing?.late_fee)?.toFixed(
															2
														)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.paid
														? parseFloat(
															invoiceDetail?.costing?.late_fee *
															currencyExchangeRate
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													Storage:
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(
															invoiceDetail?.costing?.storage
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing?.storage
														? parseFloat(
															invoiceDetail?.costing?.storage *
															currencyExchangeRate
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													Category A :
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(
															invoiceDetail?.costing?.category_a
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing?.category_a
														? parseFloat(
															invoiceDetail?.costing?.category_a *
															currencyExchangeRate
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													Broker Fee:
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(
															invoiceDetail?.costing?.broker_fee
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing?.broker_fee
														? parseFloat(
															invoiceDetail?.costing?.broker_fee *
															currencyExchangeRate
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													Title Fee:
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(
															invoiceDetail?.costing?.title_fee
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing?.title_fee
														? parseFloat(
															invoiceDetail?.costing?.title_fee *
															currencyExchangeRate
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													Other Charge:
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(
															invoiceDetail?.costing?.other_charge
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing?.other_charge
														? parseFloat(
															invoiceDetail?.costing?.other_charge *
															currencyExchangeRate
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text} sx={{ fontWeight: 'bold !important' }}>
													A-Shipping Due:
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell} sx={{ fontWeight: 'bold !important' }}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(sum).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell} sx={{ fontWeight: 'bold !important' }}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{/* {invoiceDetail?.costing?.storage
													? parseFloat(
														invoiceDetail?.costing?.storage *
														currencyExchangeRate
													)?.toFixed(2)
													: "00"} */}
													{invoiceDetail?.costing
														? parseFloat(sum * currencyExchangeRate).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													Custom Duty:
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(
															invoiceDetail?.costing?.custom_duty
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing?.custom_duty
														? parseFloat(
															invoiceDetail?.costing?.custom_duty *
															currencyExchangeRate
														)?.toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													VAT 5%:
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(sum * 0.05).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(parseFloat(sum * currencyExchangeRate).toFixed(2) * 0.05).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text} sx={{ fontWeight: 'bold !important' }}>
													B-Custom & VAT Due:
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(parseFloat(sum * 0.05).toFixed(2) + parseFloat(invoiceDetail?.costing?.custom_duty).toFixed(2)).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(parseFloat((sum * 0.05).toFixed(2) + parseFloat(invoiceDetail?.costing?.custom_duty).toFixed(2)) * currencyExchangeRate).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text}>
													Total Due A+B:
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(parseFloat(sum) + parseFloat(parseFloat(sum * 0.05) + parseFloat(invoiceDetail?.costing?.custom_duty) * currencyExchangeRate)).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(parseFloat((sum) + parseFloat(parseFloat(sum * 0.05) + parseFloat(invoiceDetail?.costing?.custom_duty) * currencyExchangeRate)) * currencyExchangeRate).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text} sx={{ fontWeight: 'bold !important' }}>
													Total :
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(parseFloat(sum) + parseFloat(parseFloat(sum * 0.05) + parseFloat(invoiceDetail?.costing?.custom_duty) * currencyExchangeRate) - parseFloat(invoiceDetail?.costing?.discount)).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.costing
														? parseFloat(parseFloat((sum) + parseFloat(parseFloat(sum * 0.05) + parseFloat(invoiceDetail?.costing?.custom_duty) * currencyExchangeRate) - parseFloat(invoiceDetail?.costing?.discount)) * currencyExchangeRate).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text} sx={{ fontWeight: 'bold !important' }}>
													Paid :
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.paid
														? parseFloat(invoiceDetail?.paid).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.paid
														? parseFloat(parseFloat(invoiceDetail?.paid) * currencyExchangeRate).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={6} className={classes.tableCell}>
												<Typography variant="body1" className={classes.text} sx={{ fontWeight: 'bold !important' }}>
													Balance :
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.balance
														? parseFloat(invoiceDetail?.balance).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
											<Grid item xs={3} className={classes.tableCell}>
												<Typography
													variant="body1"
													className={classes.text}
													sx={{ textAlign: "right" }}
												>
													{invoiceDetail?.balance
														? parseFloat(parseFloat(invoiceDetail?.balance) * currencyExchangeRate).toFixed(2)
														: "00"}
												</Typography>
											</Grid>
										</Grid>
									</Box>
								</Grid>
							</Grid>
							<Grid container spacing={0} justifyContent={"space-between"}>
								<Grid item xs={9.5}>

								</Grid>
								<Grid item xs={2}>
									<Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
										<QRCodeCanvas
											value={
												window.location.origin +
												`/client-invoice-preview/${btoa("clientInvoice-" + id)}`
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
			</PDFExport>
		</Container>
	);
}

export default ClientInvoicePreview;
