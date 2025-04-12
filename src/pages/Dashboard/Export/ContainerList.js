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
	InputLabel,
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
import { EyeIcon, FontFamily } from "assets";
import { PrimaryButton } from "components/Buttons";
import { useState, Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import styled from "@emotion/styled";
import { CircleLoading } from "components/Loaders";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import InputField from "components/Input";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import ExportServices from "services/Export";
import { getYearMonthDateFormate, handleExportWithComponent } from "utils";
import moment from "moment";
import { useNavigate } from "react-router-dom";
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

function ContainerList() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const navigate = useNavigate()
	const contentRef = useRef(null);

	const tableHead = [
		"Container Number",
		"Customer Name",
		"Pickup from",
		"UAE Location",
		"Origin Country",
		"Final Destination",
		"Price (USD)",
		"Container Size ",
		"BOL Number",
		"BOL Create Date",
		"Status Date ",
		"Status ",
		"Agent Name",
		"Action",
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

	// *For Options
	const [containerOptions, setContainerOptions] = useState([]);
	const [statusOptions, setStatusOptions] = useState([]);

	//*For Selected Option
	const [selectedContainer, setSelectedContainer] = useState("");
	const [ContainerId, setContainerId] = useState();
	const [selectedStatus, setSelectedStatus] = useState(null);
	const [purchaseDate, setPurchaseDate] = useState();
	const [date, setDate] = useState();

	//*For Date
	const [containerDate, setContainerDate] = useState();

	// *For Permissions
	const [permissions, setPermissions] = useState();

	// *ForContainers Date
	const [ContainersData, setContainersData] = useState();

	const [loading, setLoading] = useState(false);

	const classes = useStyles();

	// const navigate = useNavigate();

	//*Date Change Functions
	const handleDate = (newDate) => {
		try {
			// eslint-disable-next-line eqeqeq
			if (newDate == "Invalid Date") {
				setDate("invalid");
				return;
			}
			setDate(new Date(newDate));
		} catch (error) {
			ErrorToaster(error);
		}
	};

	const handleContainerDate = (newDate) => {
		try {
			// eslint-disable-next-line eqeqeq
			if (newDate == "Invalid Date") {
				setContainerDate("invalid");
				return;
			}
			setContainerDate(new Date(newDate));
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Export Vehicles
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
				limit: Limit,
			};
			params = { ...params, ...Filter };
			const { data } = await ExportServices.getContainerList(params);

			setContainersData(data?.containers.rows);
			setTotalCount(data?.containers?.count)
			setContainerId(data?.containers.rows[0].id);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	//For Container Options
	const getExportContainerOptions = async (search) => {
		try {
			let params = {
				page: 1,
				limit: 1000,
			};

			const { data } = await ExportServices.getExportContainers(params);

			const result = data.containers.rows.map((item) => ({
				id: item.container_number,
				name: item.container_number,
			}));
			setContainerOptions(result);



		} catch (error) {
			ErrorToaster(error);
		}
	};

	///For Status Options
	const getStatus = async () => {
		try {
			const { data } = await ExportServices.getStatus();
			setStatusOptions(data?.statuses);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	//*Update  Container
	const ContainerList = async (formData) => {
		setLoading(true);

		try {
			let obj = {
				bol_number: formData?.BOLNumber,
				bol_date: getYearMonthDateFormate(date),
				status_id: selectedStatus.id,
				container_id: ContainerId,
				status_date: getYearMonthDateFormate(containerDate),
			};

			const { message } = await ExportServices.ContainerList(obj);
			SuccessToaster(message);
			handleFilter({ filter: selectedContainer.id });
		} catch (error) {
			ErrorToaster(error);
		} finally {
			setLoading(false);
		}
	};

	// *For Handle Filter
	const handleFilter = (data) => {
		console.log(data, 'awdsadsaasd');
		getExportContainers(1, "", data);
	};

	const downloadExcel = () => {
		const headers = tableHead.filter(item => item !== "Action");
		const rows = ContainersData?.map((item) => [
			item?.container_number ?? "-",
			item?.customer?.name ?? "-",
			item?.pickup_from ?? "-",
			item?.uae_location ?? "-",
			item?.country ?? "UAE",
			item?.destination?.name ?? "-",
			item?.price ?? "-",
			item?.container_size?.name ?? "-",
			item?.bol_number ?? "-",
			item?.bol_date ? moment(item?.bol_date).format("MM-DD-YYYY") : "-",
			item?.status_date ? moment(item?.status_date).format("MM-DD-YYYY") : "-",
			item?.status.name ?? "-",
			item?.agent?.name ?? "-"
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
		getStatus();
		getExportContainerOptions();
		getExportContainers()
	}, []);

	return (
		<Box component={"form"} onSubmit={handleSubmit(ContainerList)}>
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
								mt: 4,
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
								Container List
							</Typography>
							{ContainersData?.length > 0 && (
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
				sx={{

					borderRadius: "5px",

					m: 4,
					pb: 1,
					mb: 0

				}}
				xs={10}
			>
				<Grid sm={11} md={3} justifyContent={"center"} item>
					{" "}
					<InputField
						size={'small'}
						label={'Search'}
						placeholder={'Search '}
						register={register('search', {
							onChange: (e) => handleFilter({ search: e.target.value })
						})}
					/>
				</Grid>
			</Grid>
			<Box sx={{ m: 4, mb: 2, mt: 0 }}>
				{/* ========== Confirmation Dialog ========== */}
				<ConfirmationDialog
					open={confirmationDialog}
					onClose={() => setConfirmationDialog(false)}
					message={"Are you sure you want to delete this?"}
				// action={() => deleteBuyerId()}
				/>

				{ContainersData ? (
					<Fragment>
						<PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
							fileName="Container List"
						>
							<Box className='pdf-show' sx={{ display: 'none' }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
										Container List
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
											ContainersData?.length > 0 ? (
												<Fragment>
													{ContainersData.map((item, index) => (
														<Row
															key={index}
															sx={{
																bgcolor: index % 2 !== 0 && "#EFF8E7",
															}}
														>
															<Cell className="pdf-table" >{item?.container_number ?? "-"}</Cell>
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
															<Cell className="pdf-table" >{item?.pickup_from ?? "-"}</Cell>
															<Cell className="pdf-table" >{item?.uae_location ?? "-"}</Cell>
															<Cell className="pdf-table" >{item?.country ?? "UAE"}</Cell>
															<Cell className="pdf-table" >
																{item?.destination?.name ?? "-"}
															</Cell>
															<Cell className="pdf-table" >{item?.price ?? "-"}</Cell>
															<Cell className="pdf-table" >
																{item?.container_size?.name ?? "-"}
															</Cell>
															<Cell className="pdf-table" >{item?.bol_number ?? "-"}</Cell>
															<Cell className="pdf-table" >
																{" "}
																{item?.bol_date
																	? moment(item?.bol_date).format(
																		"MM-DD-YYYY"
																	)
																	: "-"}
															</Cell>
															<Cell className="pdf-table" >
																{" "}
																{item?.status_date
																	? moment(item?.status_date).format(
																		"MM-DD-YYYY"
																	)
																	: "-"}
															</Cell>
															<Cell className="pdf-table" >{item?.status.name ?? "-"}</Cell>
															<Cell className="pdf-table" >
																<Tooltip
																	className='pdf-hide'
																	title={item?.agent?.name ?? "-"}
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
																		item?.agent?.name?.length > 12
																			? item?.agent?.name?.slice(0, 8) + "..."
																			: item?.agent?.name
																	}
																</Tooltip>
																<Box
																	component={"div"}
																	className='pdf-show'
																	sx={{ display: "none !important" }}
																>
																	{item?.agent?.name ?? "-"}
																</Box>
																{/* {item?.agent?.name ?? "-"} */}
															</Cell>
															<Cell >
																<Box component={'div'}
																	className="pdf-hide" sx={{ disaplay: 'flex', justifyContent: 'space-between' }}>


																	<Box
																		onClick={() =>
																			navigate(
																				`/edit-container`,
																				{
																					state: item,

																				}
																			)
																		}
																	>
																		<IconButton
																			sx={{
																				bgcolor: Colors.blackShade,
																				"&:hover": { bgcolor: Colors.blackShade },
																			}}
																		>
																			<Edit
																				sx={{ color: Colors.white, height: "16px !important" }}
																			/>
																		</IconButton>
																		<Typography variant="body2">
																			Edit
																		</Typography>
																	</Box>
																	<Box
																		sx={{ gap: "16px !important" }}
																	>
																		{true && (
																			<Box
																				onClick={() =>
																					navigate(
																						`/export-container-invoice/${item?.id}`,
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
																	</Box>
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
						{/* ========== Pagination ========== */}
						<Pagination
							currentPage={currentPage}
							pageSize={pageLimit}
							onPageSizeChange={(size) => getExportContainers(1, size.target.value)}
							tableCount={ContainersData?.length}
							totalCount={totalCount}
							onPageChange={(page) => getExportContainers(page, "")}
						/>
					</Fragment>
				) : (
					""
				)}
			</Box>

		</Box>
	);
}
export default ContainerList;
