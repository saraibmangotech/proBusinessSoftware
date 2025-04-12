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
	TableRow,
	TableCell,
	CircularProgress,
	Paper,
	IconButton,
	Tooltip,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { EyeIcon, FontFamily } from "assets";
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

function UnpaidPaidInvoices() {
	const classes = useStyles();
	const navigate = useNavigate();
	const contentRef = useRef(null);
	const tableHead = [
		"Inv. #",
		"BUY DATE",
		"MODEL",
		"Make",
		"LOT#",
		"VIN#",
		"COLOR",
		"TOTAL SHIPPING",
		"DiSCOUNT",
		"NET DUE",
		"Status",
		"Action",

	];

	// *For Client Dropdown
	const [clients, setClients] = useState([]);
	const [selectedClient, setSelectedClient] = useState(null);

	// *For Paid Status
	const [selectedStatus, setSelectedStatus] = useState(null);

	//* ForLoader
	const [loader, setLoader] = useState(false);


	// *For Filters
	const [filters, setFilters] = useState({});

	const [invoices, setInvoices] = useState();

	// *For Tooltip
	const [copied, setCopied] = useState(false);

	const copyContent = (text) => {
		const contentToCopy = text;
		navigator.clipboard.writeText(contentToCopy);
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 300);
	}

	// *For Vendor Costing
	const getInvoices = async (page, limit, filter) => {
		setLoader(true);
		const Filter = { ...filters, ...filter };
		try {
			let params = {
				page: 1,
				limit: 15,
			};
			params = { ...params, ...Filter };
			const { data } = await ClientServices.getClientCosting(params);


			setInvoices(data?.costings?.rows);
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
				status: selectedStatus?.id
			};

			getInvoices(1, "", data);
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
		const rows = invoices?.map((item) => [
			`GSI-${item?.invoice?.id ?? "-"}`,
			item?.booking?.purchase_date ? moment(item?.booking?.purchase_date).format("MM-DD-YYYY") : "N/A",
			item?.booking?.veh_model?.name ?? "-",
			item?.booking?.veh_make?.name ?? "-",
			item?.booking?.lot_number ?? "-",
			item?.booking?.vin ?? "-",
			item?.booking?.color ?? "-",
			parseFloat(item?.subtotal).toFixed(2) ?? "-",
			parseFloat(item?.discount).toFixed(2) ?? "-",
			parseFloat(item?.total).toFixed(2) ?? "-",
			item?.invoice && item?.invoice?.paid == 0
				? "Unpaid" : item?.invoice && item?.invoice?.paid > 0 && item?.invoice?.paid < item?.invoice?.total
					? "Partial"
					: "Paid"
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
		getInvoices();
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
							Paid/Unpaid Shipping Invoices
						</Typography>
						{invoices?.length > 0 && (
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
							spacing={4}
							alignItems={"center"}
							justifyContent={"space-between"}
						>

							<Grid item xs={12} md={2.5}>
								<SelectField
									size="small"
									label={"Client"}
									options={clients}
									selected={selectedClient}
									onSelect={(value) => {
										setSelectedClient(value);
									}}
									error={errors?.client?.message}
									register={register("client")}
								/>
							</Grid>
							<Grid item md={2.5}>
								<SelectField
									size="small"
									label={"Status"}
									options={[{ id: true, name: 'Paid' }, { id: false, name: 'Unpaid' }]}
									selected={selectedStatus}
									onSelect={(value) => setSelectedStatus(value)}
									error={errors?.status?.message}
									register={register("status")}
								/>
							</Grid>
							<Grid item xs={12} md={2.5}>
								<InputField
									size={"small"}
									label={"Vin#"}
									placeholder={"Vin"}
									register={register("vin")}
								/>
							</Grid>
							<Grid item xs={12} md={2.5}>
								<InputField
									size={"small"}
									label={"Lot#"}
									placeholder={"Lot"}
									register={register("lot")}
								/>
							</Grid>

							<Grid item xs={12} md={2}>
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

				<Grid item md={11}>
					<Box>
						<PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
							fileName="Paid/Unpaid Shipping Invoices"
						>
							<Box className='pdf-show' sx={{ display: 'none' }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
										Paid/Unpaid Shipping Invoices
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
									maxHeight: "calc(94vh - 330px) "
								}}
								className="table-box"
							>
								<Table stickyHeader sx={{ minWidth: 500 }}>
									<TableHead>
										<Row>
											{tableHead.map((cell, index) => (
												<Cell
													className='pdf-table'
													key={index}

												>
													{cell}
												</Cell>
											))}
										</Row>
									</TableHead>
									<TableBody>
										{!loader ? (
											invoices?.length > 0 ? (
												<Fragment>
													{invoices?.map((item, index) => (
														<Row
															key={index}
															sx={{
																bgcolor: index % 2 !== 0 && "#EFF8E7",
															}}
														>
															<Cell className='pdf-table'>GSI-{item?.invoice?.id ?? "-"}</Cell>
															<Cell className='pdf-table'>
																{" "}
																{item?.booking?.purchase_date
																	? moment(
																		item?.booking?.purchase_date
																	).format("MM-DD-YYYY")
																	: "N/A"}
															</Cell>
															<Cell className='pdf-table'>
																<Tooltip
																	className='pdf-hide'
																	title={item?.booking?.veh_model?.name ?? "-"}
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
																		item?.booking?.veh_model?.name?.length > 12
																			? item?.booking?.veh_model?.name?.slice(0, 8) + "..."
																			: item?.booking?.veh_model?.name
																	}
																</Tooltip>
																<Box
																	component={"div"}
																	className='pdf-show'
																	sx={{ display: "none !important" }}
																>
																	{item?.booking?.veh_model?.name ?? "-"}
																</Box>
															</Cell>
															<Cell className='pdf-table'>
																<Tooltip
																	className='pdf-hide'
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
																<Box
																	component={"div"}
																	className='pdf-show'
																	sx={{ display: "none !important" }}
																>
																	{item?.booking?.veh_make?.name ?? "-"}
																</Box>
															</Cell>
															<Cell className='pdf-table'>
																<Tooltip
																	className='pdf-hide'
																	title={copied ? "copied" : (item?.booking?.lot_number ?? "-")}
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
																	onClick={() => copyContent(item?.booking?.lot_number ?? "-")}
																>
																	{
																		item?.booking?.lot_number?.length > 12
																			? item?.booking?.lot_number?.slice(0, 8) + "..."
																			: item?.booking?.lot_number
																	}
																</Tooltip>
																<Box
																	component={"div"}
																	className='pdf-show'
																	sx={{ display: "none !important" }}
																>
																	{item?.booking?.lot_number ?? "-"}
																</Box>
															</Cell>
															<Cell className='pdf-table'>
																<Tooltip
																	className='pdf-hide'
																	title={copied ? "copied" : (item?.booking?.vin ?? "-")}
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
																	onClick={() => copyContent(item?.booking?.vin ?? "-")}
																>
																	{
																		item?.booking?.vin?.length > 12
																			? item?.booking?.vin?.slice(0, 8) + "..."
																			: item?.booking?.vin
																	}
																</Tooltip>
																<Box
																	component={"div"}
																	className='pdf-show'
																	sx={{ display: "none !important" }}
																>
																	{item?.booking?.vin ?? "-"}
																</Box>
															</Cell>
															<Cell className='pdf-table'>{item?.booking?.color ?? "-"}</Cell>
															<Cell className='pdf-table'>{CommaSeparator(parseFloat(item?.subtotal).toFixed(2)) ?? "-"}</Cell>
															<Cell className='pdf-table'>{CommaSeparator(parseFloat(item?.discount).toFixed(2)) ?? "-"}</Cell>
															<Cell className='pdf-table'>{CommaSeparator(parseFloat(item?.total).toFixed(2)) ?? "-"}</Cell>
															<Cell className='pdf-table'>
																{item?.invoice && item?.invoice?.paid == 0 ? (
																	<Fragment>
																		<Box
																			component={"div"}
																			className='pdf-hide'
																		>
																			<Box
																				sx={{
																					width: "25px",
																					height: "25px",
																					display: "flex",
																					alignItems: "center",
																					justifyContent:
																						"center",
																					border: `1px solid ${Colors.danger}`,
																					borderRadius: "50%",
																				}}
																			>
																				<span className="pdf-hide"><Close
																					sx={{
																						fontSize: "18px",
																						color: Colors.danger,
																					}}
																				/></span>
																			</Box>
																			Unpaid
																		</Box>
																		<Box
																			component={"div"}
																			className='pdf-show'
																			sx={{ display: "none !important" }}
																		>
																			Unpaid
																		</Box>
																	</Fragment>
																) : item?.invoice && item?.invoice?.paid > 0 &&
																	item?.invoice?.paid <
																	item?.invoice?.total ? (
																	<Fragment>
																		<Box
																			component={"div"}
																			className='pdf-hide'
																		>
																			<Box
																				sx={{
																					width: "25px",
																					height: "25px",
																					display: "flex",
																					alignItems: "center",
																					justifyContent:
																						"center",
																					border: "1px solid #25ABE1",
																					borderRadius: "50%",
																				}}
																			>
																				<span className="pdf-hide">		<Check
																					sx={{
																						fontSize: "18px",
																						color: "#25ABE1",
																					}}
																				/></span>
																			</Box>
																			Partial
																		</Box>
																		<Box
																			component={"div"}
																			className='pdf-show'
																			sx={{ display: "none !important" }}
																		>
																			Partial
																		</Box>
																	</Fragment>
																) : (
																	<Fragment>
																		<Box
																			component={"div"}
																			className='pdf-hide'
																		>
																			<Box
																				sx={{
																					width: "25px",
																					height: "25px",
																					display: "flex",
																					alignItems: "center",
																					justifyContent:
																						"center",
																					border: `1px solid ${Colors.primary}`,
																					borderRadius: "50%",
																				}}
																			>
																				<span className="pdf-hide">	<Check
																					sx={{
																						fontSize: "18px",
																						color: "#25ABE1",
																					}}
																				/>
																				</span>
																			</Box>
																			Paid
																		</Box>
																		<Box
																			component={"div"}
																			className='pdf-show'
																			sx={{ display: "none !important" }}
																		>
																			Paid
																		</Box>
																	</Fragment>
																)}
															</Cell>
															<Cell>
																{item?.invoice && <Box component={'div'} className='pdf-hide' sx={{ gap: "16px !important" }}>
																	<Box
																		onClick={() =>
																			navigate(
																				`/client-invoice-detail/${item?.invoice?.id}`
																			)
																		}
																	>
																		<IconButton
																			sx={{
																				bgcolor: Colors.primary,
																				"&:hover": {
																					bgcolor:
																						Colors.primary,
																				},
																			}}
																		>
																			<EyeIcon />
																		</IconButton>
																		<Typography variant="body2">
																			View
																		</Typography>
																	</Box>
																</Box>}
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
						</PDFExport>
					</Box>
				</Grid>
			</Grid>
		</Fragment>
	);
}

export default UnpaidPaidInvoices;
