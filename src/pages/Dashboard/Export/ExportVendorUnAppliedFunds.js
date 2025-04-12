import React, { Fragment, useEffect, useRef, useState } from "react";
import {
	Grid,
	Box,
	Typography,
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	Paper,
	tableCellClasses,
	CircularProgress,
	IconButton,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { EyeIcon, FontFamily } from "assets";
import VendorServices from "services/Vendor";
import { ErrorToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import { CircleLoading } from "components/Loaders";
import Pagination from "components/Pagination";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";
import { addPermission } from "redux/slices/navigationDataSlice";
import { useDispatch } from "react-redux";
import { CommaSeparator, Debounce, formatPermissionData, handleExportWithComponent } from "utils";
import { Check, Close, Inventory, Visibility } from "@mui/icons-material";
import ExportServices from "services/Export";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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

function ExportVendorUnAppliedFunds() {
	const classes = useStyles();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const contentRef = useRef(null);
	const tableHead = ["TT Date", "Ref No", "External Ref No", "FCY Amount", "Status", "Action"];

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const [loader, setLoader] = useState(false);

	// *For Vendor Dropdown
	const [vendors, setVendors] = useState([]);
	const [selectedVendor, setSelectedVendor] = useState(null);

	// *For Permissions
	const [permissions, setPermissions] = useState();

	// *For TT List
	const [vendorTT, setVendorTT] = useState();

	// *For Pagination
	const [totalCount, setTotalCount] = useState(0);
	const [pageLimit, setPageLimit] = useState(50);
	const [currentPage, setCurrentPage] = useState(1);

	// *For Filters
	const [filters, setFilters] = useState({});

	// *For Vendor
	const getVendorDropdown = async () => {
		try {
			const { data } = await ExportServices.getVendorDropdown();
			setVendors([...data?.agents, ...data?.brokers]);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For TT List
	const getTT = async (page, limit, filter) => {
		setLoader(true);
		try {
			const Page = page ? page : currentPage;
			const Limit = limit ? limit : pageLimit;
			const Filter = { ...filters, ...filter };
			setCurrentPage(Page);
			setPageLimit(Limit);
			setFilters(Filter);
			let params = {
				page: Page,
				limit: Limit,
			};
			params = { ...params, ...Filter };
			const { data } = await ExportServices.getTT(params);
			setTotalCount(data?.tt?.count);
			setVendorTT(data?.tt?.rows);
			setPermissions(formatPermissionData(data?.permissions));
			data?.permissions.forEach((e) => {
				if (e?.route && e?.identifier && e?.permitted) {
					dispatch(addPermission(e?.route));
				}
			});
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
				vendor_id: selectedVendor?.id,
				is_paid: false,
			};
			getTT(1, "", data);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	const downloadExcel = () => {
		const headers = tableHead.filter((item) => item !== "Action");
		const rows = vendorTT?.map((item) => [
			moment(item?.created_at).format("MM-DD-YYYY"),
			`VUAF-${item?.id ?? "-"}`,
			item?.external_no ?? "-",
			item?.fcy_amount ?? "-",
			item?.paid_amount == 0 ? "Unpaid" : parseFloat(item?.paid_amount) < parseFloat(item?.fcy_amount) ? "Partial" : "Paid"
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
		getVendorDropdown();
	}, []);

	return (
		<Box sx={{ m: 4, mb: 2 }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mr: 8,
				}}
			>
				<Typography
					variant="h5"
					sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}
				>
					Export Vendor Un-Applied Funds
				</Typography>
				{vendorTT?.length > 0 && (
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

			<Box
				component={"form"}
				onSubmit={handleSubmit(applyFilter)}
				sx={{
					m: "20px 0 20px 5px",
					p: "20px",
					bgcolor: Colors.feta,
					border: `1px solid ${Colors.iron}`,
					borderRadius: "9px",
				}}
			>
				<Grid container spacing={1} alignItems={"center"} columns={10}>
					<Grid item md={3}>
						<SelectField
							size="small"
							label={"Vendor"}
							options={vendors}
							selected={selectedVendor}
							onSelect={(value) => setSelectedVendor(value)}
							error={errors?.vendor?.message}
							register={register("vendor", {
								required: "Please select vendor.",
							})}
						/>
					</Grid>
					<Grid item xs={12} md={2}>
						<Box
							sx={{
								mt: "11px",
								display: "flex",
								justifyContent: "flex-end",
							}}
						>
							<PrimaryButton title={"Search"} type={"submit"} />
						</Box>
					</Grid>
				</Grid>
			</Box>

			{loader ? (
				<CircleLoading />
			) : (
				vendorTT && (
					<Fragment>
						<PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
							fileName="Export Vendor Un-Applied Funds"
						>
							<Box className='pdf-show' sx={{ display: 'none' }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
										Export Vendor Un-Applied Funds
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
								className="table-box"
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
											vendorTT?.length > 0 ? (
												<Fragment>
													{vendorTT.map((item, index) => (
														<Row
															key={index}
															sx={{
																bgcolor: index % 2 !== 0 && "#EFF8E7",
															}}
														>
															<Cell className="pdf-table">
																{moment(item?.created_at).format(
																	"MM-DD-YYYY"
																)}
															</Cell>
															<Cell className="pdf-table">VUAF-{item?.id ?? "-"}</Cell>
															<Cell className="pdf-table">{item?.external_no ?? "-"}</Cell>
															<Cell className="pdf-table">{CommaSeparator(item?.fcy_amount) ?? "-"}</Cell>
															<Cell>
																{item?.paid_amount == 0 ? (
																	<Box>
																		<Box
																			component={'div'}
																			className="pdf-hide"
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
																			<Close
																				sx={{
																					fontSize: "18px",
																					color: Colors.danger,
																				}}
																			/>
																		</Box>
																		<span className="pdf-table">	Unpaid </span>
																	</Box>
																) : parseFloat(item?.paid_amount) < parseFloat(item?.fcy_amount)
																	? (
																		<Box>
																			<Box
																				component={'div'}
																				className="pdf-hide"
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
																				<Check
																					sx={{
																						fontSize: "18px",
																						color: "#25ABE1",
																					}}
																				/>
																			</Box>
																			<span className="pdf-table">		Partial </span>
																		</Box>
																	) : (
																		<Box>
																			<Box component={'div'}
																				className="pdf-hide"
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
																				<Check
																					sx={{
																						fontSize: "18px",
																						color: "#25ABE1",
																					}}
																				/>
																			</Box>
																			<span className="pdf-table">	Paid </span>
																		</Box>
																	)}
															</Cell>
															<Cell>
																<Box component={'div'}
																	className="pdf-hide" sx={{ gap: "16px !important" }}>
																	<Box
																		onClick={() =>
																			navigate(
																				`/export-vendor-funds-apply`,
																				{ state: item }
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
																			Apply Fund
																		</Typography>
																	</Box>
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
							onPageSizeChange={(size) => getTT(1, size.target.value)}
							tableCount={vendorTT?.length}
							totalCount={totalCount}
							onPageChange={(page) => getTT(page, "")}
						/>
					</Fragment>
				)
			)}
		</Box>
	);
}

export default ExportVendorUnAppliedFunds;
