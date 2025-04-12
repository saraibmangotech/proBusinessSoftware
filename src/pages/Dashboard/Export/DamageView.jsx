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
	Chip,
	Tooltip,
} from "@mui/material";
import RowRadioButtonsGroup from "components/Input/RadioGroup";
import Pagination from "components/Pagination";
import { Delete, Edit } from "@mui/icons-material";
import Colors from "assets/Style/Colors";
import DatePicker from "components/DatePicker";
import SelectField from "components/Select";
import { makeStyles } from "@mui/styles";
import { FontFamily } from "assets";
import { PrimaryButton } from "components/Buttons";
import { useState, Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import styled from "@emotion/styled";
import { CircleLoading } from "components/Loaders";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import ExportServices from "services/Export";
import InputField from "components/Input";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { EyeIcon } from "assets";
import moment from "moment";
import { useNavigate } from "react-router-dom";
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

function DamageView() {
	const [selectedManifest, setselectedManifest] = useState(null);
	const [manifestOptions, setmanifestOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const classes = useStyles();
	const contentRef = useRef(null);
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

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

	const [loader, setLoader] = useState(false);

	// *For Dialog Box
	const [confirmationDialog, setConfirmationDialog] = useState(false);

	// *For Pagination
	const [totalCount, setTotalCount] = useState(0);
	const [pageLimit, setPageLimit] = useState(50);
	const [currentPage, setCurrentPage] = useState(1);

	// *For Filters
	const [filters, setFilters] = useState({});
	const [selectedValue, setSelectedValue] = useState("option1"); // State to manage the selected radio button value

	const handleRadioChange = (value) => {
		setSelectedValue(value);
	};
	// *For Auction House
	const [auctionHouses, setAuctionHouses] = useState();
	const [selectedAuctionHouses, setSelectedAuctionHouses] = useState("");

	// *For Permissions
	const [permissions, setPermissions] = useState();

	const [ExportDatas, setExportDatas] = useState();

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

	// *For Export Vechicles
	const getExportVehicles = async (page, limit, filter) => {
		try {
			const Page = page ? page : currentPage;
			const Limit = limit ? limit : pageLimit;
			const Filter = { ...filters, ...filter };
			setCurrentPage(Page);
			setPageLimit(Limit);
			setFilters(Filter);
			let params = {
				page: Page,
				limit: 15,
			};
			params = { ...params, ...Filter };
			const { data } = await ExportServices.getExportVehicles(params);
			setExportDatas(data?.vehicles?.rows);
			setTotalCount(data?.vehicles?.count);
		} catch (error) {
			ErrorToaster(error);
		}
	};
	const getFilteredData = async (search) => {
		try {
			let params = {
				page: 1,
				limit: 15,
				filter: search,
			};
			const { data } = await ExportServices.getExportVehicles(params);
			setExportDatas(data?.vehicles?.rows);
			setTotalCount(data?.vehicles?.count);
		} catch (error) {
			ErrorToaster(error);
		}
	};
	const getManifest = async (search) => {
		try {
			let params = {
				page: 1,
				limit: 15,
				search: search,
			};
			const { data } = await ExportServices.getManifest(params);

			//Custom Filter

			if (!search) {
				const resultArray = data?.filter?.vins.map((item) => {
					return { id: item, name: item };
				});
				setmanifestOptions(resultArray);
			} else {
				const filteredResults = data?.filter?.vins.filter((item) => item.includes(search));

				const resultArray = filteredResults.map((item) => {
					return { id: item, name: item };
				});

				setmanifestOptions(resultArray);
			}

		} catch (error) {
			ErrorToaster(error);
		}
	};
	// *For Handle Filter
	const handleFilter = (data) => {
		getExportVehicles(1, "", data);
	};

	const UpdateDamage = async (formData) => {
		setLoading(true);
		try {
			let obj = {};
			const { message } = await ExportServices.UpdateManifest(obj);
			SuccessToaster(message);
		} catch (error) {
			ErrorToaster(error);
		} finally {
			setLoading(false);
		}
	};

	const downloadExcel = () => {
		const headers = tableHead.filter((item) => item !== "View");
		const rows = ExportDatas?.map((item) => [
			item?.id ?? "-",
			item?.created_at ? moment(item?.created_at).format("MM-DD-YYYY") : "N/A",
			item?.customer?.name ?? "-",
			item?.vin ?? "-",
			item?.year ?? "-",
			item?.make?.name ?? "-",
			item?.model?.name ?? "-",
			item?.color ?? "-",
			item?.accountable?.id == 30001 ? 'GWS' : item?.accountable?.name ?? "-",
			item?.damaged_part ?? "-",
			item?.damage_cost ?? "-"
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
		setPermissions(true);
		getManifest();
		getExportVehicles()
	}, []);

	return (
		<Box component={"form"} onSubmit={handleSubmit(UpdateDamage)}>
			<Box sx={{ width: '100%' }}>
				<Grid container>
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
								Damage View
							</Typography>
							{ExportDatas?.length > 0 && (
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


					m: 2,
					mt: 0
				}}
				spacing={2}
			>
				<Grid item xs={12} md={3}>
					<InputField
						size={'small'}
						label={'Search'}
						placeholder={'Search'}
						register={register('search', {
							onChange: (e) => handleFilter({ search: e.target.value })
						})}
					/>
				</Grid>
				<Grid sm={12} md={3} item>
					{" "}
					<SelectField
						size={'small'}
						searchable={true}
						label={"VIN"}
						options={manifestOptions}
						selected={selectedManifest}
						onSelect={(value) => {
							setselectedManifest(value);
							console.log(value);
							handleFilter({ filter: value?.id });
						}}
						onSearch={(v) => getManifest(v)}
						// error={errors?.auctionHouses?.message}
						error={errors?.VIN?.message}
						register={register("VIN", {
							required: "Please select VIN.",
						})}
					/>
				</Grid>
			</Grid>

			<Box sx={{ m: 4, mb: 2 }}>
				{/* ========== Confirmation Dialog ========== */}
				<ConfirmationDialog
					open={confirmationDialog}
					onClose={() => setConfirmationDialog(false)}
					message={"Are you sure you want to delete this?"}
				// action={() => deleteBuyerId()}
				/>

				{ExportDatas ? (
					<Fragment>

						<PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
							fileName="Damage View"
						>
							<Box className='pdf-show' sx={{ display: 'none' }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
										Damage View
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
											ExportDatas?.length > 0 ? (
												<Fragment>
													{ExportDatas.map((item, index) => (
														<Row
															key={index}
															sx={{
																bgcolor: index % 2 !== 0 && "#EFF8E7",
															}}
														>
															<Cell className="pdf-table">{item?.id ?? "-"}</Cell>
															<Cell className="pdf-table">
																{" "}
																{item?.created_at
																	? moment(item?.created_at).format(
																		"MM-DD-YYYY"
																	)
																	: "N/A"}
															</Cell>
															<Cell className="pdf-table">
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
																{/* {item?.customer?.name ?? "-"}		 */}
															</Cell>
															<Cell className="pdf-table">
																<Tooltip
																	className='pdf-hide'
																	title={copied ? "copied" : (item?.vin ?? "-")}
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
																	onClick={() => copyContent(item?.vin ?? "-")}
																>
																	{
																		item?.vin?.length > 12
																			? item?.vin?.slice(0, 8) + "..."
																			: item?.vin
																	}
																</Tooltip>
																<Box
																	component={"div"}
																	className='pdf-show'
																	sx={{ display: "none !important" }}
																>
																	{item?.vin ?? "-"}
																</Box>
																{/* {item?.vin ?? "-"} */}
															</Cell>
															<Cell className="pdf-table">{item?.year ?? "-"}</Cell>
															<Cell className="pdf-table">
																<Tooltip
																	className='pdf-hide'
																	title={item?.make?.name ?? "-"}
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
																		item?.make?.name?.length > 12
																			? item?.make?.name?.slice(0, 8) + "..."
																			: item?.make?.name
																	}
																</Tooltip>
																<Box
																	component={"div"}
																	className='pdf-show'
																	sx={{ display: "none !important" }}
																>
																	{item?.make?.name ?? "-"}
																</Box>
																{/* {item?.make?.name ?? "-"} */}
															</Cell>
															<Cell className="pdf-table">
																<Tooltip
																	className='pdf-hide'
																	title={item?.model?.name ?? "-"}
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
																		item?.model?.name?.length > 12
																			? item?.model?.name?.slice(0, 8) + "..."
																			: item?.model?.name
																	}
																</Tooltip>
																<Box
																	component={"div"}
																	className='pdf-show'
																	sx={{ display: "none !important" }}
																>
																	{item?.model?.name ?? "-"}
																</Box>
																{/* {item?.model?.name ?? "-"} */}
															</Cell>
															<Cell className="pdf-table">{item?.color ?? "-"}</Cell>
															<Cell className="pdf-table">
																{item?.accountable?.id == 30001 ? 'GWS' : item?.accountable?.name ?? "-"}
															</Cell>
															<Cell className="pdf-table">{item?.damaged_part ?? "-"}</Cell>
															<Cell className="pdf-table">{item?.damage_cost ?? "-"}</Cell>
															<Cell>
																<Box
																	sx={{
																		display: "flex",
																		justifyContent: "space-between",
																		gap: "20px",
																	}}
																	component={'div'}
																	className="pdf-hide"
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
																				View & Receive Damages
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
						</PDFExport>
						{/* ========== Pagination ========== */}
						{/* <Pagination
							currentPage={currentPage}
							pageSize={pageLimit}
							onPageSizeChange={(size) => getExportVehicles(1, size.target.value)}
							tableCount={ExportDatas?.length}
							totalCount={totalCount}
							onPageChange={(page) => getExportVehicles(page, "")}
						/> */}
					</Fragment>
				) : (
					""
				)}
			</Box>
		</Box>
	);
}
export default DamageView;
