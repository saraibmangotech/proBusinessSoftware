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
	InputLabel,
	FormControl,
	Select,
	MenuItem,
	ListItemText,
	Checkbox,
	Tooltip
} from "@mui/material";
import Pagination from "components/Pagination";
import { Edit } from "@mui/icons-material";
import Colors from "assets/Style/Colors";
import SelectField from "components/Select";
import { makeStyles } from "@mui/styles";
import { FontFamily } from "assets";
import { useState, Fragment, useEffect } from "react";
import styled from "@emotion/styled";
import { CircleLoading } from "components/Loaders";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import { ErrorToaster } from "components/Toaster";
import ExportServices from "services/Export";
import moment from "moment";
import { EyeIcon } from "assets";
import { Icons } from "assets/index";
import { useNavigate } from "react-router-dom";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PrimaryButton } from "components/Buttons";
import { PDFExport } from "@progress/kendo-react-pdf";
import { handleExportWithComponent } from "utils";

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
		background: Colors.tableGradient,
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

function ExportVehicleList() {
	//*For Navigation
	const navigate = useNavigate();
	const contentRef = useRef(null);
	const classes = useStyles();

	const { register, formState: { errors }, handleSubmit, setValue } = useForm();


	//Table Heading
	const tableHead = [
		"Booking Date",
		"Customer ID",
		"VIN",
		"Year",
		"Make",
		"Model",
		"Color",
		"Agent Name",
		"Customer Name",
		"Pick up from",
		"Final Destination",
		"Manifest Number",
		"Manifest Status",
		"Manifest Date",
		"CMR Number",
		"CMR Date",
		"Price",
		"Discount ",
		"Final Price",
		"Vehicle Status Date",
		"Vehicle Status",
		"Action",
	];

	const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);

	//*permissions
	const [permissions, setPermissions] = useState();


	//*Export Vehicle Data
	const [ExportData, setExportData] = useState();

	//* ForLoader
	const [loader, setLoader] = useState(false);

	// *For Dialog Box
	const [confirmationDialog, setConfirmationDialog] = useState(false);

	// *For Pagination
	const [totalCount, setTotalCount] = useState(0);
	const [pageLimit, setPageLimit] = useState(50);
	const [selectedManifest, setSelectedManifest] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [manifestOptions, setManifestOptions] = useState([]);

	// *For Filters
	const [filters, setFilters] = useState({});

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

	// *For Export Vehicles
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
				limit: Limit,
			};
			params = { ...params, ...Filter };
			const { data } = await ExportServices.getExportVehicles(params);
			setExportData(data?.vehicles?.rows);
			setTotalCount(data?.vehicles?.count);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	//*Get Manifest Options
	const getManifest = async (search) => {
		try {
			let params = {
				page: 1,
				limit: 15,
				search: search,
			};
			const { data } = await ExportServices.getManifest(params);
			//Custom Filter

			const myData = [...data?.filter?.manifestNumbers, ...data?.filter?.vins]
			const resultArray = myData.map((item) => {
				return { id: item, name: item };
			});

			setManifestOptions(resultArray);

		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Handle Filter
	const handleFilter = (data) => {
		getExportVehicles(1, "", data);
	};

	const handleColumnChange = (event) => {
		const selectedColumns = event.target.value;
		// Sort the selected columns to maintain the correct order
		const sortedColumns = selectedColumns.sort((a, b) => a - b);
		setVisibleColumns(sortedColumns);
	};

	const renderCellContent = (colIndex, item, isActive,) => {
		switch (colIndex) {
			case 0:
				return item?.created_at
					? moment(item?.created_at).format(
						"MM-DD-YYYY"
					)
					: "-";
			case 1:
				return item?.customer_id ? 'CE-' + item?.customer_id ?? "" : "-";
			case 2:
				return (
					<Box>
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
					</Box>
				)
			// item?.vin ?? "-";
			case 3:
				return item?.year ?? "-";
			case 4:
				return (
					<Box>
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
					</Box>
				)
			// item?.make?.name ?? "-";
			case 5:
				return (
					<Box>
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
					</Box>
				)
			// item?.model?.name ?? "-";
			case 6:
				return item?.color ?? "-";
			case 7:
				return (
					<Box>
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
					</Box>
				)
			// item?.agent?.name ?? "-";
			case 8:
				return (
					<Box>
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
					</Box>
				)
			// item?.customer?.name ?? "-";
			case 9:
				return item?.pickup_from ?? "-";
			case 10:
				return item?.destination?.name ?? "-";
			case 11:
				return item?.manifest_number ?? "-";
			case 12:
				return item?.manifest_number ? 'transit to bandar lengeh' : "-";
			case 13:
				return item?.manifest_date
					? moment(item?.manifest_date).format(
						"MM-DD-YYYY"
					)
					: "-";
			case 14:
				return item?.cmr_number ?? "-";
			case 15:
				return item?.cmr_date
					? moment(item?.cmr_date).format(
						"MM-DD-YYYY"
					)
					: "-";
			case 16:
				return item?.price ?? "-";
			case 17:
				return item?.discount ?? "-";
			case 18:
				return item?.final_price ?? "-";
			case 19:
				return item?.date
					? moment(item?.date).format(
						"MM-DD-YYYY"
					)
					: "N/A";
			case 20:
				return item?.status?.name ?? "-";
			case 21:
				return <Box
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
						{permissions && (
							<Box
								onClick={() =>
									navigate(
										`/export-vehicle-details/${item?.id}`,
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
					<Box
						sx={{ gap: "16px !important" }}
					>
						{permissions && (
							<Box
								onClick={() =>
									navigate(
										`/export-invoice/${item?.id}`,
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
											Colors.invoice,
										"&:hover": {
											bgcolor:
												Colors.invoice,
										},
									}}
								>
									<img
										src={
											Icons.invoiceIcon
										}
										alt=""
										width={"12px"}
									/>
								</IconButton>
								<Typography variant="body2">
									Print Invoice
								</Typography>
							</Box>
						)}
						{permissions && (
							<Box
								onClick={() =>
									navigate(
										`/export-vehicle-details-form/${item?.id}`,
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
											Colors.blue,
										"&:hover": {
											bgcolor:
												Colors.blue,
										},
									}}
								>
									<img
										src={
											Icons.invoiceIcon
										}
										alt=""
										width={"12px"}
									/>
								</IconButton>
								<Typography variant="body2">
									Print Form
								</Typography>
							</Box>
						)}
						{permissions && (
							<Box
								onClick={() =>
									navigate(
										`/update-export-vehicle/${item?.id}`,
										{}
									)
								}
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
									Update
								</Typography>
							</Box>
						)}
					</Box>
				</Box>;
			default:
				return "-";
		}
	};

	const downloadExcel = () => {
		const headers = tableHead.filter((item) => item !== "Action");
		const rows = ExportData?.map((item) => [
			item?.created_at ? moment(item?.created_at).format("MM-DD-YYYY") : "-",
			item?.customer_id ? 'CE-' + item?.customer_id ?? "" : "-",
			item?.vin ?? "-",
			item?.year ?? "-",
			, item?.make?.name ?? "-",
			item?.model?.name ?? "-",
			item?.color ?? "-",
			item?.agent?.name ?? "-",
			item?.customer?.name ?? "-",
			item?.pickup_from ?? "-",
			item?.destination?.name ?? "-",
			item?.manifest_number ?? "-",
			item?.manifest_number ? 'transit to bandar lengeh' : "-",
			item?.manifest_date ? moment(item?.manifest_date).format("MM-DD-YYYY") : "-",
			item?.cmr_number ?? "-",
			item?.cmr_date ? moment(item?.cmr_date).format("MM-DD-YYYY") : "-",
			item?.price ?? "-",
			item?.discount ?? "-",
			item?.final_price ?? "-",
			item?.date ? moment(item?.date).format("MM-DD-YYYY") : "N/A",
			item?.status?.name ?? "-"
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
		getExportVehicles();
		setPermissions(true);
		getManifest();
	}, []);

	return (
		<Box component={"form"}>
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

								}}
							>
								Export Vehicle List
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
					m: 2,
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
						size={"small"}
						searchable={true}
						label={"Vin/Manifest"}
						options={manifestOptions}
						selected={selectedManifest}
						onSelect={(value) => {
							setSelectedManifest(value);
							handleFilter({ filter: value?.id });
						}}
					// error={errors?.auctionHouses?.message}
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


				<Grid item md={11}>
					{ExportData && <Box>

						<Grid container mb={2} >
							<Grid item xs={5}>
								<FormControl>
									<InputLabel>Columns</InputLabel>
									<Select
										size={'small'}
										multiple
										value={visibleColumns}
										label={'Columns'}
										onChange={handleColumnChange}
										renderValue={() => "Show/Hide"}
									>

										{tableHead.map((column, index) => {


											if (column !== 'Action' && column !== 'Status') {
												return (
													<MenuItem key={index} value={index}>
														<Checkbox checked={visibleColumns.includes(index)} />
														<ListItemText primary={column} />
													</MenuItem>
												);
											} else {
												return null;
											}
										})}
									</Select>
								</FormControl>
							</Grid>
						</Grid>

						{(
							ExportData && (
								<Fragment>
									<PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
										fileName="Export Vehicle List"
									>
										<Box className='pdf-show' sx={{ display: 'none' }}>
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
													Export Vehicle List
												</Typography>
												<Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
											</Box>
										</Box>
										<TableContainer
											component={Paper}
											sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 420px)' }}
											className="table-box">
											<Table stickyHeader sx={{ minWidth: 500 }}>
												{/* Table Header */}
												<TableHead>
													<TableRow>
														{visibleColumns.map((index) => (
															<Cell
																className="pdf-table2"
																key={index}

															>
																{tableHead[index]}
															</Cell>
														))}
													</TableRow>
												</TableHead>

												{/* Table Body */}
												<TableBody>
													{!loader ? (
														ExportData?.length > 0 ? (
															<Fragment>
																{ExportData.map((item, rowIndex) => {

																	const isActive = true;
																	return (
																		<Row
																			key={rowIndex}
																			sx={{ bgcolor: rowIndex % 2 !== 0 && "#EFF8E7" }}
																		>
																			{visibleColumns.map((colIndex) => (
																				<Cell className="pdf-table2" key={colIndex}>
																					{renderCellContent(colIndex, item, isActive,)}
																				</Cell>
																			))}
																		</Row>

																	);
																})}

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
														<TableRow>
															<TableCell
																colSpan={visibleColumns?.length + 2}
																align="center"
																sx={{ fontWeight: 600 }}
															>
																<Box className={classes.loaderWrap}>
																	<CircularProgress />
																</Box>
															</TableCell>
														</TableRow>
													)}
												</TableBody>
											</Table>
										</TableContainer>
									</PDFExport>
									{/* ========== Pagination ========== */}
									<Pagination
										currentPage={currentPage}
										pageSize={pageLimit}
										onPageSizeChange={(size) => getExportVehicles(1, size.target.value)}
										tableCount={ExportData?.length}
										totalCount={totalCount}
										onPageChange={(page) => getExportVehicles(page, "")}
									/>

								</Fragment>
							)
						)}


						{loader && <CircleLoading />}

					</Box>}





				</Grid>
			</Box >
		</Box >
	);
}

export default ExportVehicleList;
