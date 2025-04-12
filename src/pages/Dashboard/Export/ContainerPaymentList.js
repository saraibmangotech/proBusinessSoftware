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

function ExportContainerPayments() {
	const [selectedManifest, setselectedManifest] = useState(null);
	const [manifestOptions, setmanifestOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const classes = useStyles();
	const navigate = useNavigate();
	const contentRef = useRef(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const tableHead = [
		"Ref No",
		"No of Containers",
		"Containers",
		"Date",
		"Total",
		"Payment By",
		"Action"

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

	// *For Export Vechicles
	const getExportContainers = async (page, limit, filter) => {
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
			const { data } = await ExportServices.getExportContainerPayments(params);
			setExportDatas(data?.funds?.rows);
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
			const { data } = await ExportServices.getExportContainers(params);
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
		getExportContainers(1, "", data);
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
		const headers = tableHead.filter(item => item !== "Action");
		const rows = ExportDatas?.map((item) => {
			const containers = (item?.details || []).map(detail => detail?.container?.container_number).join(',');
			return [
				item?.id ?? "-",
				item?.details?.length ?? "-",
				containers ?? "-",
				item?.created_at ? moment(item?.created_at).format("MM-DD-YYYY") : "N/A",
				item?.shipping_due ? parseFloat(item?.shipping_due).toFixed(2) : parseFloat(0).toFixed(2) ?? "-",
				(item?.creator?.name) ?? "-"
			]
		})

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
		getExportContainers()
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
								mr: 8,
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
								Export Container Payments
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


					m: 4,
					mt: 0
				}}
			>
				{/* <Grid sm={12} md={3} item>
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
				</Grid> */}
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
							fileName="Export Container Payments"
						>
							<Box className='pdf-show' sx={{ display: 'none' }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
										Export Container Payments
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
													{ExportDatas.map((item, index) => {
														// Corrected vins assignment
														// If item.details is falsy, use an empty array to avoid errors
														const containers = (item?.details || []).map(detail => detail?.container?.container_number).join(',');
														console.log(containers);

														return (
															<Row
																key={index}
																sx={{
																	bgcolor: index % 2 !== 0 && "#EFF8E7",
																}}
															>
																<Cell className="pdf-table">{item?.id ?? "-"}</Cell>
																<Cell className="pdf-table">{item?.details?.length ?? "-"}</Cell>
																<Cell className="pdf-table">
																	<Tooltip
																		className="pdf-hide"
																		title={containers ?? "-"}
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
																		{containers.length > 24 ? containers.slice(0, 20) + "..." : containers}
																	</Tooltip>
																	<Box
																		component={"div"}
																		className='pdf-show'
																		sx={{ display: "none !important" }}
																	>
																		{containers ?? "-"}
																	</Box>
																</Cell>
																<Cell className="pdf-table">
																	{item?.created_at
																		? moment(item?.created_at).format("MM-DD-YYYY")
																		: "N/A"}
																</Cell>



																<Cell className="pdf-table">
																	{item?.shipping_due
																		? parseFloat(item?.shipping_due).toFixed(2)
																		: parseFloat(0).toFixed(2) ?? "-"}
																</Cell>
																<Cell className="pdf-table">
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
																	{/* {(item?.creator?.name) ?? "-"} */}
																</Cell>
																<Cell>
																	<Box component={'div'}
																		className="pdf-hide"
																		onClick={() =>
																			navigate(`/export-container-payment-receipt/${item?.id}`, {
																				state: {
																					shipping: true,
																				},
																			})
																		}
																	>
																		<IconButton
																			sx={{
																				bgcolor: Colors.primary,
																				"&:hover": {
																					bgcolor: Colors.primary,
																				},
																			}}
																		>
																			<EyeIcon />
																		</IconButton>
																		<Typography variant="body2">View Detail</Typography>
																	</Box>
																</Cell>
															</Row>
														);
													})}

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
							onPageSizeChange={(size) => getExportContainers(1, size.target.value)}
							tableCount={ExportDatas?.length}
							totalCount={totalCount}
							onPageChange={(page) => getExportContainers(page, "")}
						/> */}
					</Fragment>
				) : (
					""
				)}
			</Box>
		</Box>
	);
}
export default ExportContainerPayments;
