import React, { useEffect, useRef, useState } from "react";
import {
	Box,
	CircularProgress,
	Container,
	Grid,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	tableCellClasses,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster } from "components/Toaster";
import styled from "@emotion/styled";
import { GeneratePDF, handleExportWithComponent } from "utils";
import moment from "moment";
import { QRCodeCanvas } from "qrcode.react";
import ClientServices from "services/Client";
import { useReactToPrint } from 'react-to-print';
import { PDFExport } from "@progress/kendo-react-pdf";

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
	border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		fontSize: 14,
		fontFamily: FontFamily.NunitoRegular,
		border: 0,
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

function VehicleTTDetail() {
	const { id } = useParams();
	const contentRef = useRef(null);

	const [loader, setLoader] = useState(false);

	// *For Vehicle TT
	const [ttDetail, setTtDetail] = useState();
	const [otherDetails, setOtherDetails] = useState()

	const handlePrint = useReactToPrint({
		content: () => contentRef.current,
		documentTitle: 'Shipping-Remittance',
	});

	// *For Get TT Detail
	const getTTDetail = async () => {
		setLoader(true);
		try {
			let params = {
				tt_id: id,
			};
			const { data } = await ClientServices.getTTDetail(params);
			setTtDetail(data?.tt.details);
			setOtherDetails(data?.tt)
		} catch (error) {
			ErrorToaster(error);
		} finally {
			setLoader(false);
		}
	};

	useEffect(() => {
		if (id) {
			getTTDetail();
		}
	}, [id]);

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
			<PDFExport ref={contentRef}
				fileName="Vehicle Remittance JV"
			>
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
							<Box sx={{ p: 5 }}>
								<Grid container spacing={2} alignItems="flex-start">
									<Grid item xs={12} sm={12}>
										<Typography
											variant="h5"
											sx={{
												color: Colors.charcoalGrey,
												fontFamily: FontFamily.NunitoRegular,
												mb: 2,
											}}
										>
											Vehicle Remittance JV
										</Typography>
									</Grid>
									<Grid
										container
										item
										xs={12}
										sm={12}
										alignItems={"center"}
										justifyContent={"space-between"}
									>
										<Grid item sm={3.2}>
											<Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
												<Typography variant="body1">Date:</Typography>
												<Typography variant="body1">
													{moment(ttDetail?.created_at).format("MM-DD-YYYY")}
												</Typography>
											</Box>
										</Grid>
										<Grid item sm={5}>
											<Box
												sx={{
													display: "flex",
													gap: "5px",
													alignItems: "center",
													justifyContent: "space-between",
												}}
											>
												<Typography variant="body1">
													VUAF No:
												</Typography>
												<Typography variant="body1">VUAF-{otherDetails?.id}</Typography>
											</Box>
											<Box
												sx={{
													display: "flex",
													gap: "5px",
													alignItems: "center",
													justifyContent: "space-between",
													width: '100%'
												}}
											>
												<Typography variant="body1">
													External Ref No:
												</Typography>
												<Typography variant="body1" >
													{otherDetails?.external_ref_no}
												</Typography>
											</Box>
										</Grid>
									</Grid>
									<Grid item sm={12}>
										<TableContainer
											component={Paper}
											sx={{
												boxShadow: "0px 8px 18px 0px #9B9B9B1A",
												borderRadius: 2,
											}}
										>
											<Table stickyHeader>
												<TableHead>
													<TableRow>
														<Cell>Sr</Cell>
														<Cell>Buyer ID</Cell>
														<Cell>Model</Cell>
														<Cell>Make</Cell>
														<Cell>Lot</Cell>
														<Cell>Vin</Cell>
														<Cell>FCY Currency</Cell>
														<Cell>FCY Amount</Cell>
														<Cell>LCY Amount (AED)</Cell>
													</TableRow>
												</TableHead>
												<TableBody>

													{ttDetail && ttDetail.map((item, index) => (
														<Row >
															<Cell >
																{index + 1}
															</Cell>
															<Cell >
																<Box >
																	<Typography variant="body1">
																		{
																			item?.buyer ? item?.buyer?.name : item?.booking?.buyer?.name ?? "-"
																		}
																	</Typography>
																</Box>
															</Cell>
															{item?.booking ?
																<>
																	<Cell >
																		{item?.booking?.veh_model?.name}
																	</Cell>
																	<Cell >
																		{item?.booking?.veh_make?.name}
																	</Cell>
																	<Cell >
																		{item?.booking?.lot_number}
																	</Cell>
																	<Cell >
																		{item?.booking?.vin}
																	</Cell> </> : <Cell colSpan={4}>
																	Funds to Buyer ID
																</Cell>}
															<Cell sx={{ width: "180px" }} >
																{item?.booking?.currency ? item?.booking?.currency : "usd"}
															</Cell>
															<Cell sx={{ width: "180px" }} >
																{item?.fcy_amount}
															</Cell>
															<Cell sx={{ width: "180px" }} >
																{item?.lcy_amount}
															</Cell>


														</Row>
													))}
													{/* <Cell>1</Cell>
												<Cell>
													<Box sx={{ width: "300px" }}>
														<Typography variant="body1">
															{
																ttDetail?.booking
																	?.customer?.name
															}
														</Typography>
													</Box>
												</Cell>
												<Cell sx={{ width: "180px" }}>
													{parseFloat(
														ttDetail?.fcy_amount
													).toFixed(2)}
												</Cell>
												<Cell sx={{ width: "130px" }}>
													{parseFloat(
														ttDetail?.lcy_amount
													).toFixed(2)}
												</Cell> */}

													<Row>
														<Cell colspan={7}>
															<b>Total</b>
														</Cell>
														<Cell sx={{ width: "180px" }}>
															{parseFloat(otherDetails?.total_fcy_amount).toFixed(
																2
															)}
														</Cell>
														<Cell sx={{ width: "130px" }}>
															{parseFloat(otherDetails?.total_lcy_amount).toFixed(
																2
															)}
														</Cell>
													</Row>
												</TableBody>
											</Table>
										</TableContainer>
									</Grid>
									<Grid container item xs={12} sm={12} justifyContent={"space-between"}>
										<Grid item sm={5}>
											<Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
												<Typography variant="body1" sx={{ width: "180px" }}>
													TT Rate :
												</Typography>
												<Typography variant="body1">{otherDetails?.ex_rate}</Typography>
											</Box>
										</Grid>
										<Grid item sm={4}>
											<Box
												sx={{
													display: "flex",
													gap: "5px",
													alignItems: "center",
													justifyContent: "space-between",
												}}
											>
												<Typography variant="body1" sx={{ width: "212px" }}>
													TT and Bank Charges (AED)
												</Typography>
												<Typography variant="body1">
													{parseFloat(otherDetails?.tt_charges).toFixed(2)}
												</Typography>
											</Box>
											<Box
												sx={{
													display: "flex",
													gap: "5px",
													alignItems: "center",
													justifyContent: "space-between",
												}}
											>
												<Typography variant="body1" sx={{ width: "212px" }}>
													VAT on Bank Charges (AED)
												</Typography>
												<Typography variant="body1">
													{parseFloat(otherDetails?.vat_charges).toFixed(2)}
												</Typography>
											</Box>
										</Grid>
									</Grid>
									<Grid
										container
										item
										xs={12}
										sm={12}
										alignItems={"center"}
										justifyContent={"space-between"}
									>
										{/* <Grid item sm={5}>
									<Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
										<Typography variant="body1" sx={{ width: "180px" }}>
											TT Fund form Account:
										</Typography>
										<Typography variant="body1">
											{otherDetails?.account?.name}
										</Typography>
									</Box>
								</Grid> */}
										<Grid item sm={4}>
											<Box
												sx={{
													display: "flex",
													gap: "5px",
													alignItems: "center",

												}}
											>
												<Typography variant="body1" sx={{ width: "212px" }}>
													Total Amount Paid (AED) :
												</Typography>
												<Typography variant="body1" sx={{ textAlign: "right" }}>
													{parseFloat(otherDetails?.total_paid_aed).toFixed(2)}
												</Typography>
											</Box>
										</Grid>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
											<Typography variant="body1" sx={{ width: "170px" }}>
												Accountant Notes :
											</Typography>
											<Typography variant="body1">{otherDetails?.notes}</Typography>
										</Box>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Box
											sx={{
												height: "100%",
												display: "flex",
												alignItems: "center",
												justifyContent: "flex-end",
												mr: 0,
											}}
										>
											<QRCodeCanvas
												value={
													window.location.origin +
													`/vehicle-tt-preview/${btoa("tt-" + id)}`
												}
											/>
										</Box>
									</Grid>
								</Grid>
							</Box></Box>

					) : (
						<Box sx={{ textAlign: "center", py: 3 }}>
							<CircularProgress />
						</Box>
					)}
				</Box>
			</PDFExport>
		</Container >
	);
}

export default VehicleTTDetail;
