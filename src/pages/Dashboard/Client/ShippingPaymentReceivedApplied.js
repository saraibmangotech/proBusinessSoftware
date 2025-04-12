

import React, { Fragment, useState, useEffect, useRef } from "react";
import {
	Grid,
	Box,
	Typography,
	TableContainer,
	Table,
	TableHead,
	tableCellClasses,
	TableBody,
	IconButton,
	TableRow,
	TableCell,
	Paper,
	CircularProgress,
	Tooltip,
} from "@mui/material";
import SelectField from "components/Select";
import { EyeIcon } from "assets";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import InputField from "components/Input";
import { Check, Close, Inventory, Visibility } from "@mui/icons-material";
import ClientServices from "services/Client";
import { ErrorToaster } from "components/Toaster";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import { useForm } from "react-hook-form";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CommaSeparator, handleExportWithComponent } from "utils";
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

function ShippingPaymentReceived() {
	const navigate = useNavigate()
	const classes = useStyles();
	const contentRef = useRef(null);
	const tableHead = [
		"DATE",
		"CFA No",
		"Client ID",
		"Client Name",
		"Applied Amount (AED)",
		"Applied By",
		"Action",

	];

	// *For Client Dropdown
	const [clients, setClients] = useState([]);
	const [selectedClient, setSelectedClient] = useState(null);

	//* ForLoader
	const [loader, setLoader] = useState(false);

	// *For Filters
	const [filters, setFilters] = useState({});

	const [funds, setFunds] = useState();

	// *For Vendor Costing
	const getAppliedFunds = async (page, limit, filter) => {
		setLoader(true);
		const Filter = { ...filters, ...filter };
		try {
			let params = {
				page: 1,
				limit: 15,
			};
			params = { ...params, ...Filter };
			const { data } = await ClientServices.getAppliedFunds(params);

			setFunds(data?.funds?.rows);
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
				vin: getValues("vin"),
				lot: getValues("lot"),
			};

			getAppliedFunds(1, "", data);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	const {
		register,
		handleSubmit,
		getValues,
		formState: { errors },
	} = useForm();

	// *For Clients
	const getClientDropdown = async () => {
		try {
			const { data } = await ClientServices.getClientDropdown();

			setClients(data?.customers?.rows);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	const downloadExcel = () => {
		const headers = tableHead.filter((item) => item !== "Action");
		const rows = funds?.map((item) => [
			item?.createdAt ? moment(item?.createdAt).format("MM-DD-YYYY") : "N/A",
			`CFA-${item?.id ?? "-"}`,
			item?.customer?.id ?? "-",
			item?.customer?.name ?? "-",
			(+item?.cash_amount) + (+item?.vault_amount) ?? "-",
			item?.creator?.name ?? "-"
		])

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
		getClientDropdown();
		getAppliedFunds();
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
							Rcvd-Applied Shipping
						</Typography>
						{funds?.length > 0 && (
							<Box sx={{
								textAlign: "right", p: 4, display: "flex", gap: 2

							}}>
								<PrimaryButton
									title="Download PDF"
									type="button"
									style={{ backgroundColor: Colors.bluishCyan }}
									onClick={() => handleExportWithComponent(contentRef)}
								/>
								<PrimaryButton
									title={"Download Excel"}
									onClick={() => downloadExcel()}
								/>
							</Box>
						)}
					</Box>
				</Grid>
				<Grid item md={11} component={"form"} onSubmit={handleSubmit(applyFilter)}>
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

						>
							<Grid item xs={12} md={3}>
								<SelectField
									size="small"
									label={"Client"}
									options={clients}
									selected={selectedClient}
									onSelect={(value) => {
										setSelectedClient(value);
									}}
									error={errors?.client?.message}
									register={register("client", {
										required: "Please select client.",
									})}
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
					<Box>
						<PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
							fileName="Rcvd-Applied Shipping"
						>
							<Box className='pdf-show' sx={{ display: 'none' }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
										Rcvd-Applied Shipping
									</Typography>
									<Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
								</Box>
							</Box>
							<TableContainer
								component={Paper}
								sx={{
									boxShadow: "0px 8px 18px 0px #9B9B9B1A",
									borderRadius: 2,
									maxWidth: "calc(100vw - 330px)",
									height: '300px'

								}}
								className="table-box"
							>
								<Table stickyHeader sx={{ minWidth: 500 }}>
									<TableHead>
										<Row>
											{tableHead.map((cell, index) => (
												<Cell className='pdf-table'
													key={index}

												>
													{cell}
												</Cell>
											))}
										</Row>
									</TableHead>
									<TableBody>
										{!loader ? (
											funds?.length > 0 ? (
												<Fragment>
													{funds?.map((item, index) => (
														<Row
															key={index}
															sx={{
																bgcolor: index % 2 !== 0 && "#EFF8E7",
															}}
														>
															<Cell className='pdf-table'>
																{item?.createdAt
																	? moment(item?.createdAt).format(
																		"MM-DD-YYYY"
																	)
																	: "N/A"}
															</Cell>
															<Cell className='pdf-table'>CFA-{item?.id ?? "-"}</Cell>
															<Cell className='pdf-table'>{item?.customer?.id ?? "-"}</Cell>
															<Cell className='pdf-table'>
																<Tooltip
																	className='pdf-hide'
																	title={item?.customer?.name ?? "-"}
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
																		item?.customer?.name?.length > 12
																			? item?.customer?.name?.slice(0, 8) + "..."
																			: item?.customer?.name
																	}
																</Tooltip>
																<Box
																	component={"div"}
																	className='pdf-show'
																	sx={{ display: "none !important" }}
																>
																	{item?.customer?.name ?? "-"}
																</Box>
															</Cell>
															<Cell className='pdf-table'>
																{CommaSeparator(+item?.cash_amount +
																	+item?.vault_amount) ?? "-"}
															</Cell>
															<Cell className='pdf-table'>
																<Tooltip
																	className='pdf-hide'
																	title={item?.creator?.name ?? "-"}
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
																		item?.creator?.name?.length > 12
																			? item?.creator?.name?.slice(0, 8) + "..."
																			: item?.creator?.name
																	}
																</Tooltip>
																<Box
																	component={"div"}
																	className='pdf-show'
																	sx={{ display: "none !important" }}
																>
																	{item?.creator?.name ?? "-"}
																</Box>
															</Cell>
															<Cell><Box component={'div'} className='pdf-hide'
																sx={{ gap: "16px !important" }}
															>
																{true && (
																	<Box
																		onClick={() =>
																			navigate(
																				`/shipping-payment-details/${item?.id}`,
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
																)}
															</Box></Cell>
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
						</PDFExport>
					</Box>
				</Grid>
			</Grid>
		</Fragment>
	);
}

export default ShippingPaymentReceived;
