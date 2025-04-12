import React, { Fragment, useEffect, useRef, useState } from "react";
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	tableCellClasses,
	IconButton,
	CircularProgress,
	Chip,
	Grid,
	Tooltip,
	InputAdornment,
} from "@mui/material";
import { EyeIcon, FontFamily, SearchIcon } from "assets";
import InputField from "components/Input";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import Colors from "assets/Style/Colors";
import { CircleLoading } from "components/Loaders";
import { ErrorToaster } from "components/Toaster";
import { makeStyles } from "@mui/styles";
import Pagination from "components/Pagination";
import { Debounce, formatPermissionData, handleExportWithComponent } from "utils";
import SelectField from "components/Select";
import ExportServices from "services/Export";
import { useForm } from "react-hook-form";
import { useDispatch } from 'react-redux';
import { addPermission } from 'redux/slices/navigationDataSlice';
import { PrimaryButton } from "components/Buttons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";
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
			justifyContent: "flex-start",
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

function ExportCustomers() {

	const navigate = useNavigate();
	const classes = useStyles();
	const dispatch = useDispatch();
	const contentRef = useRef(null);

	const { register } = useForm();

	const tableHead = [
		"Customer ID",
		"Name",
		"Email",
		"Phone Number",
		"Creator",
		"Customer Type",
		"Status",
		"Actions",
	];

	const [loader, setLoader] = useState(false);

	// *For Customer Drop Down
	const [selectedCustomer, setSelectedCustomer] = useState(null);

	// *For Customer Queue
	const [customerQueue, setCustomerQueue] = useState();

	// *For Pagination
	const [totalCount, setTotalCount] = useState(0);
	const [pageLimit, setPageLimit] = useState(50);
	const [currentPage, setCurrentPage] = useState(1);

	// *For Filters
	const [filters, setFilters] = useState({});

	// *For Permissions
	const [permissions, setPermissions] = useState();

	// *For Get Export Customers
	const getExportCustomersList = async (page, limit, filter) => {
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
			const { data } = await ExportServices.getExportCustomersList(params);
			setCustomerQueue(data?.customers?.rows);
			setTotalCount(data?.customers?.count);
			setPermissions(formatPermissionData(data?.permissions))
			data?.permissions.forEach(e => {
				if (e?.route && e?.identifier && e?.permitted) {
					dispatch(addPermission(e?.route));
				}
			})
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Handle Filter
	const handleFilter = (data) => {
		Debounce(() => getExportCustomersList(1, "", data));
	};

	const downloadExcel = () => {
		const headers = tableHead.filter((item) => item !== "Actions");
		const rows = customerQueue?.map((item) => [
			item?.customerProfile?.broker_type_id === null ? `CE-${item?.id ?? "-"}`
				: item?.customerProfile?.broker_type_id === 1 ? `AE-${item?.id ?? "-"}`
					: item?.customerProfile?.broker_type_id === 2 ? `BE-${item?.id ?? "-"}` : "-",
			item?.name ?? '-',
			item?.email ?? "-",
			item?.uae_phone ?? "-",
			item?.creator ? item?.creator?.name : "Self",
			item?.customerProfile?.broker_type_id === null && item?.customerProfile?.trade_license
				? "Company" : item?.customerProfile?.broker_type_id === null && item?.customerProfile?.trade_license === null
					? "Individual" : item?.customerProfile?.broker_type_id === 1
						? "Agent" : item?.customerProfile?.broker_type_id === 2
							? "Broker" : "-",
			item?.is_active ? "Active" : "In Active",
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
		getExportCustomersList();
	}, []);

	return (
		<Box sx={{ m: 4, mb: 2 }} component={"form"}>
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
					variant="h5"
					sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}
				>
					Export Customers
				</Typography>
				{customerQueue?.length > 0 && (

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

			{/* Filters */}
			<Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px' }}>
				<Grid container spacing={1}>
					<Grid item xs={12} sm={3}>
						<InputField
							size={"small"}

							inputStyle={{ backgroundColor: '#f5f5f5' }}
							label={'Search'}
							InputProps={{
								startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
							}}
							placeholder={"Search"}
							register={register('search', {
								onChange: (e) => handleFilter({ search: e.target.value })
							})}
						/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<SelectField
							size={"small"}
							label={"Select Type"}
							options={[
								{ id: 0, name: "Customer" },
								{ id: 1, name: "Agent" },
								{ id: 2, name: "Broker" },
							]}
							selected={selectedCustomer}
							onSelect={(value) => { setSelectedCustomer(value); getExportCustomersList(1, "", { customer_type: value?.id }) }}
						/>
					</Grid>
				</Grid>

				{customerQueue ? (
					<Fragment>
						{/* ========== Table ========== */}
						<PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName='Export Customers' >
							<Box className='pdf-show' sx={{ display: 'none' }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
										Export Customers
									</Typography>
									<Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
								</Box>
							</Box>
							<TableContainer
								component={Paper}
								sx={{
									boxShadow: "0px 8px 18px 0px #9B9B9B1A",
									borderRadius: 2,
									maxHeight: "calc(100vh - 330px)",
								}}
								className='table-box'
							>
								<Table stickyHeader sx={{ minWidth: 500 }}>
									<TableHead>
										<TableRow>
											{tableHead.map((item, index) => (
												<Cell key={index} className='pdf-table'>{item}</Cell>
											))}
										</TableRow>
									</TableHead>
									<TableBody>
										{!loader ? (
											customerQueue?.length > 0 ? (
												<Fragment>
													{customerQueue.map((item, index) => (
														<Row
															key={index}
															sx={{ bgcolor: index % 2 !== 0 && "#EFF8E7" }}
														>
															<Cell className='pdf-table'>
																{item?.customerProfile?.broker_type_id ===
																	null
																	? `CE-${item?.id ?? "-"}`
																	: item?.customerProfile
																		?.broker_type_id === 1
																		? `AE-${item?.id ?? "-"}`
																		: item?.customerProfile
																			?.broker_type_id === 2
																			? `BE-${item?.id ?? "-"}`
																			: "-"}
															</Cell>
															<Cell className='pdf-table'>
																<Tooltip
																	className="pdf-hide"
																	title={item?.name ?? '-'}
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
																	{item?.name.length > 15 ? item?.name?.slice(0, 10) + "..." : item?.name}
																</Tooltip>
																<Box component={"div"} sx={{ display: "none !important" }} className="pdf-show">
																	{item?.name ?? '-'}
																</Box>
															</Cell>
															<Cell className='pdf-table'>
																<Tooltip
																	className="pdf-hide"
																	title={item?.email ?? "-"}
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
																	{item?.email?.length > 40 ? item?.email?.slice(0, 20) + "..." : item?.email}
																</Tooltip>
																<Box component={"div"} sx={{ display: "none !important" }} className="pdf-show">
																	{item?.email ?? "-"}
																</Box>
															</Cell>
															<Cell className='pdf-table'>{item?.uae_phone ?? "-"}</Cell>
															<Cell className='pdf-table'>
																<Tooltip
																	className="pdf-hide"
																	title={item?.creator ? item?.creator?.name : "Self"}
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
																	{item?.creator ? (
																		item?.creator?.name.length > 15
																			? item?.creator?.name?.slice(0, 10) + "..." : item?.creator?.name
																	) : "Self"}
																</Tooltip>
																<Box component={"div"} sx={{ display: "none !important" }} className="pdf-show">
																	{item?.creator ? item?.creator?.name : "Self"}
																</Box>
															</Cell>
															<Cell className='pdf-table'>
																{item?.customerProfile?.broker_type_id ===
																	null &&
																	item?.customerProfile?.trade_license
																	? "Company"
																	: item?.customerProfile
																		?.broker_type_id === null &&
																		item?.customerProfile
																			?.trade_license === null
																		? "Individual"
																		: item?.customerProfile
																			?.broker_type_id === 1
																			? "Agent"
																			: item?.customerProfile
																				?.broker_type_id === 2
																				? "Broker"
																				: "-"}
															</Cell>
															<Cell className='pdf-table'>

																<Box sx={{
																	bgcolor: item?.is_active
																		? Colors.success + 26
																		: Colors.danger + 26,
																	color: item?.is_active
																		? Colors.success
																		: Colors.danger,
																	height: '30px',
																	width: '70px',
																	borderRadius: '20px'
																	,
																	justifyContent: "center !important",
																	textTransform: "capitalize",
																	fontFamily: FontFamily.NunitoRegular,

																}}>{item?.is_active ? 'Active' : 'In Active'}</Box>
															</Cell>
															<Cell className='pdf-table'>
																<Box component={'div'} className='pdf-hide' sx={{ gap: "16px !important" }}>
																	{permissions?.detail_view && (
																		<Box
																			onClick={() =>
																				navigate(
																					`/customer-detail/${item.id}`
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
																				Detail View
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
							onPageSizeChange={(size) => getExportCustomersList(1, size.target.value)}
							tableCount={customerQueue?.length}
							totalCount={totalCount}
							onPageChange={(page) => getExportCustomersList(page, "")}
						/>
					</Fragment>
				) : (
					<CircleLoading />
				)}
			</Box>
		</Box>
	);
}

export default ExportCustomers;
