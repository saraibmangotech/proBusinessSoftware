import React, { useRef } from "react";
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

import Pagination from "components/Pagination";
import { Edit } from "@mui/icons-material";
import Colors from "assets/Style/Colors";
import { makeStyles } from "@mui/styles";
import { FontFamily } from "assets";
import { PrimaryButton } from "components/Buttons";
import { useState, Fragment, useEffect } from "react";
import { Icons } from "assets/index";
import { useForm } from "react-hook-form";
import styled from "@emotion/styled";
import { CircleLoading } from "components/Loaders";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import InputField from "components/Input";
import ExportServices from "services/Export";
import { ErrorToaster } from "components/Toaster";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import VINContainerDialog from "components/Dialog/VINContainerStatus";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { handleExportWithComponent } from "utils";
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

function AddShipment() {
	//*Table Heading
	const tableHead = [
		"Inv.#",
		"Shipped Date",
		"Client ID",
		"Name",
		"Vin/Cont.#",
		"Status Date",
		"Status",
		"Action",
	];

	//*For Form
	const { register, handleSubmit } = useForm();
	const contentRef = useRef(null);
	//*For Status Dialogue Box
	const [receiveStatusDialog, setReceiveStatusDialog] = useState(false);
	const [dialogStatusOptions, setDialogStatusOptions] = useState([]);
	const [statusCheck, setStatusCheck] = useState();
	const [currentStatus, setCurrentStatus] = useState();

	const [rowData, setRowData] = useState()

	//* For Container Vin Ids
	const [Container, setContainer] = useState();
	const [VIN, setVIN] = useState();
	const [Id, setId] = useState();

	const [loading, setLoading] = useState(false);
	const classes = useStyles();

	//*Navigate
	const navigate = useNavigate();

	const [loader, setLoader] = useState(false);

	//*For Table Data
	const [ExportData, setExportData] = useState();

	// *For Dialog Box
	const [confirmationDialog, setConfirmationDialog] = useState(false);

	// *For Pagination
	const [totalCount, setTotalCount] = useState(0);
	const [pageLimit, setPageLimit] = useState(50);
	const [currentPage, setCurrentPage] = useState(1);

	// *For Filters
	const [filters, setFilters] = useState({});

	// *For Permissions
	const [permissions, setPermissions] = useState();

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

	//*Status Options
	const handleStatus = (item) => {
		if (item?.container) {
			setStatusCheck(true);

			const getStatus = async () => {
				try {
					const { data } = await ExportServices.getStatus();
					setDialogStatusOptions(data.statuses);
				} catch (error) {
					ErrorToaster(error);
				}
			};
			getStatus();
		} else {
			setStatusCheck(false);

			const getStatus = async () => {
				try {
					const { data } = await ExportServices.getVehicleStatus();
					setDialogStatusOptions(data.statuses);
				} catch (error) {
					ErrorToaster(error);
				}
			};
			getStatus();
		}
	};

	//*Get Shipment Details
	const getShipmentDetails = async (page, limit, filter) => {
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

			setExportData(data?.shipments?.rows);
			setTotalCount(data?.shipments?.count);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	//*Api Success Function
	const handleApiSuccess = () => {
		getShipmentDetails();
		setReceiveStatusDialog(false);
	};

	//*Data Filter  Conditions For VIN/Container
	const handleData = () => {
		if (VIN) {
			handleFilter({ vin: VIN });
		} else if (Container) {
			handleFilter({ container_number: Container });
		}
	};

	// *For Handle Filter
	const handleFilter = (data) => {
		getShipmentDetails(1, "", data);
	};

	const downloadExcel = () => {
		const headers = tableHead.filter((item) => item !== "Action");
		const rows = ExportData?.map((item) => [
			item?.id ?? "-",
			moment(item?.created_at).format("MM-DD-YYYY") ?? "-",
			item?.customer_id ?? "-",
			item?.customer?.name ?? "-",
			item?.vin ? item?.vin : item?.container_number,
			item?.vehicle?.date ? moment(item?.vehicle?.date).format("MM-DD-YYYY")
				: item?.container?.status_date
					? moment(item?.container?.status_date).format("MM-DD-YYYY") : "-",
			item?.vehicle?.status?.name ? item?.vehicle?.status?.name : item?.container?.status?.name
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
		getShipmentDetails();
		setPermissions(true);
	}, []);

	return (
		<Box component={"form"}>
			<Box sx={{ width: '100%' }}>
				<Grid
					container
					sx={{
						borderRadius: "5px",
					}}
				>
					<Grid item md={12}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								my: 4,
								ml: 4,
								mr: 8
							}}
						>
							<Typography
								variant="h5"
								sx={{
									color: Colors.charcoalGrey,
									fontFamily: FontFamily.NunitoRegular,
									textAlign: "left",
								}}
							>
								Shipment Status
							</Typography>
							{ExportData?.length > 0 && (
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
				</Grid>
			</Box>
			<Grid
				container
				xs={10}
				sx={{

					borderRadius: "5px",

					p: 0,
					pb: 1,
					m: 2,
					mt: 0
				}}
				spacing={2}


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
						onClick={handleData}

						loading={loading}
					/>
				</Grid>
			</Grid>
			<Box sx={{ width: "83%", margin: "0 auto" }}>
				<VINContainerDialog
					open={receiveStatusDialog}
					rowData={rowData}
					Options={dialogStatusOptions}
					statusCheck={statusCheck}
					CurrentStatus={currentStatus}
					onApiSuccess={handleApiSuccess}
					Id={Id}
					onClose={() => setReceiveStatusDialog(false)}
				/>


			</Box>

			<Box sx={{ m: 4, mb: 2, mt: 0 }}>
				{/* ========== Confirmation Dialog ========== */}
				<ConfirmationDialog
					open={confirmationDialog}
					onClose={() => setConfirmationDialog(false)}
					message={"Are you sure you want to delete this?"}
				// action={() => deleteBuyerId()}
				/>
				{/* <Grid container display={"flex"} justifyContent={"flex-end"}>
					<Grid
						item
						sm={3.5}
						md={3.5}
						lg={3.5}
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: "10px",
						}}
					>
						<InputLabel sx={{ width: "50%", textAlign: "right" }}>Status </InputLabel>
						<SelectField
							options={statusOptions}
							selected={selectedStatus}
							onSelect={(value) => setselectedStatus(value)}
							size="small"
							// error={errors?.auctionHouses?.message}
							register={register("Status")}
						/>
					</Grid>
				</Grid> */}
				{ExportData ? (
					<Fragment>
						<PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
							fileName="Shipment Status"
						>
							<Box className='pdf-show' sx={{ display: 'none' }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
										Shipment Status
									</Typography>
									<Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
								</Box>
							</Box>
							{/* ========== Table ========== */}
							<TableContainer
								component={Paper}
								sx={{
									boxShadow: "0px 8px 18px 0px #9B9B9B1A",
									borderRadius: 2,
									maxHeight: "calc(100vh - 330px)",
								}}
								className="tabl;e-box"
							>
								<Table stickyHeader sx={{ minWidth: 500 }}>
									<TableHead>
										<TableRow>
											{tableHead.map((item, index) => (
												<Cell className="pdf-table" key={index}>{item}</Cell>
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
															<Cell className="pdf-table" >{item?.id ?? "-"}</Cell>
															<Cell className="pdf-table" >
																{" "}
																{moment(item?.created_at).format(
																	"MM-DD-YYYY"
																) ?? "-"}
															</Cell>
															<Cell className="pdf-table" >{item?.customer_id ?? "-"}</Cell>
															<Cell className="pdf-table" >
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
																{/* {item?.customer?.name ?? "-"} */}
															</Cell>
															<Cell className="pdf-table" >
																<Tooltip
																	className='pdf-hide'
																	title={copied ? "copied" : item?.vin ? item?.vin : (item?.container_number ?? "-")}
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
																	onClick={() => copyContent(item?.vin ? item?.vin : (item?.container_number ?? "-"))}
																>
																	{item.vin ? (item?.vin?.length > 12 ? item?.vin?.slice(0, 8) + "..." : item?.vin)
																		: (item?.container_number?.length > 12
																			? item?.container_number?.slice(0, 8) + "..."
																			: item?.container_number)
																	}
																</Tooltip>
																<Box
																	component={"div"}
																	className='pdf-show'
																	sx={{ display: "none !important" }}
																>
																	{item?.vin ? item?.vin : (item?.container_number ?? "-")}
																</Box>
																{/* {item?.vin
																	? item?.vin
																	: item?.container_number} */}
															</Cell>
															<Cell className="pdf-table" >
																{item?.vehicle?.date
																	? moment(
																		item?.vehicle?.date
																	).format("MM-DD-YYYY")
																	: item?.container?.status_date
																		? moment(
																			item?.container?.status_date
																		).format("MM-DD-YYYY")
																		: "-"}
															</Cell>
															<Cell className="pdf-table" >
																{item?.vehicle?.status?.name
																	? item?.vehicle?.status?.name
																	: item?.container?.status?.name}
															</Cell>
															<Cell className="pdf-table" >
																{" "}
																<Box component={'div'}
																	className="pdf-hide" sx={{ gap: "16px !important" }}>
																	{permissions && (
																		<Box
																			onClick={() => {
																				setRowData(item)
																				setCurrentStatus(
																					item?.vehicle
																						?.status
																						? item?.vehicle
																							?.status
																						: item
																							?.container
																							?.status
																				);
																				setReceiveStatusDialog(
																					true
																				);
																				handleStatus(item);
																				setId(
																					item?.container_id
																						? item?.container_id
																						: item?.vehicle
																							?.id
																				);
																			}}
																		>
																			<IconButton
																				sx={{
																					bgcolor:
																						Colors.blackShade,
																					"&:hover": {
																						bgcolor:
																							Colors.blackShade,
																					},
																				}}
																			>
																				<Edit
																					sx={{
																						color: Colors.white,
																						height: "16px !important",
																					}}
																				/>
																			</IconButton>
																			<Typography variant="body2">
																				Update Status
																			</Typography>
																		</Box>
																	)}
																</Box>
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

						{/* ========== Pagination ========== */}
						<Pagination
							currentPage={currentPage}
							pageSize={pageLimit}
							onPageSizeChange={(size) => getShipmentDetails(1, size.target.value)}
							tableCount={ExportData?.length}
							totalCount={totalCount}
							onPageChange={(page) => getShipmentDetails(page, "")}
						/>
					</Fragment>
				) : (
					<CircleLoading />
				)}
			</Box>
		</Box>
	);
}
export default AddShipment;
