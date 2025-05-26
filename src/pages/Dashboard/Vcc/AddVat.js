import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
	Box, Checkbox, CircularProgress, Dialog, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, Select,
	MenuItem,
	ListItemText,
	InputLabel,
	FormControl,
	Tooltip,
	InputAdornment
} from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { FontFamily, SearchIcon, VccIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import { CancelOutlined, Edit } from '@mui/icons-material';
import Pagination from 'components/Pagination';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import DatePicker from 'components/DatePicker';
import { Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
import VccServices from 'services/Vcc';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from '@progress/kendo-react-pdf';

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
	border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		fontSize: 14,
		fontFamily: FontFamily.NunitoRegular,
		border: 0,
		textAlign: 'center',
		whiteSpace: 'nowrap',
		background: Colors.primary,
		color: Colors.white
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
		fontFamily: FontFamily.NunitoRegular,
		textAlign: 'center',
		textWrap: 'nowrap',

		'.MuiBox-root': {
			display: 'flex',
			gap: '6px',
			alignItems: 'center',
			justifyContent: 'center',
			'.MuiBox-root': {
				cursor: 'pointer'
			}
		},
		'svg': {
			width: 'auto',
			height: '24px'
		},
		'.MuiTypography-root': {
			textTransform: 'capitalize',
			fontFamily: FontFamily.NunitoRegular,
			textWrap: 'nowrap',
		},
		'.MuiButtonBase-root': {
			padding: '8px',
			width: '28px',
			height: '28px',
		}
	},
}));

const useStyles = makeStyles({
	loaderWrap: {
		display: 'flex',
		height: 100,
		'& svg': {
			width: '40px !important',
			height: '40px !important'
		}
	}
})

function AddVat() {

	const classes = useStyles();
	const contentRef = useRef(null);

	const tableHead = ['Serial Number', 'Customer', 'Make', 'Model', 'LOT', 'VIN', 'Color', 'Container', 'VCC Declaration Number', 'VCC Receiving Date', 'VCC Expiry Date', 'Time Left', 'Custom Charges (AED)', 'VAT Charges (AED)', 'Action']

	const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);

	const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();
	const { register: register2 } = useForm();
	const { register: register3, handleSubmit: handleSubmit3, formState: { errors: errors3 }, reset: reset3 } = useForm();
	const { register: register4, handleSubmit: handleSubmit4, formState: { errors: errors4 }, reset: reset4 } = useForm();
	const [loader, setLoader] = useState(false);
	const [loading, setLoading] = useState(false);

	const [declarationDialog, setDeclarationDialog] = useState(false)

	// *For Dialog Box
	const [vccDeclareDialog, setVccDeclareDialog] = useState(false);
	const [vccVatChargesDialog, setVccVatChargesDialog] = useState(false);

	// *For Vehicle List
	const [vehicleList, setVehicleList] = useState();
	const [selectedVehicles, setSelectedVehicles] = useState([]);
	const [vccDetail, setVccDetail] = useState();

	const [vccId, setVccId] = useState();

	// *For Pagination
	const [totalCount, setTotalCount] = useState(0);
	const [pageLimit, setPageLimit] = useState(50);
	const [currentPage, setCurrentPage] = useState(1);

	// *For Filters
	const [filters, setFilters] = useState({});

	// *For Handle Date
	const [vccDate, setVccDate] = useState();
	const [vccExpDate, setVccExpDate] = useState();

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
		}, 999999);
	}

	// *For Handle Date
	const handleVccDate = (newDate) => {
		try {
			// eslint-disable-next-line eqeqeq
			if (newDate == 'Invalid Date') {
				setVccDate('invalid')
				return
			}
			setVccDate(newDate)
			setValue('vccDate', newDate)
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Update Approval Status
	const updateDeclaration = async (data) => {
		try {
			let obj = {
				vcc_id: vccId,
				vcc_declaration: data?.comment,
			};
			const { message } = await VccServices.updateDeclaration(obj);
			setDeclarationDialog(false);
			SuccessToaster(message);
			getVccVehicles()
			reset4();

		} catch (error) {
			ErrorToaster(error);
		}
	};

	const handleVccExpDate = (newDate) => {
		try {
			// eslint-disable-next-line eqeqeq
			if (newDate == 'Invalid Date') {
				setVccExpDate('invalid')
				return
			}
			setVccExpDate(newDate)
			setValue('vccExpDate', newDate)
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Get Vcc Vehicle List
	const getVccVehicles = async (page, limit, filter) => {
		setLoader(true)
		try {
			const Page = page ? page : currentPage
			const Limit = limit ? limit : pageLimit
			const Filter = { ...filters, ...filter }
			setCurrentPage(Page)
			setPageLimit(Limit)
			setFilters(Filter)
			let params = {
				page: Page,
				limit: Limit
			}
			params = { ...params, ...Filter }
			const { data } = await VccServices.getVccVehicles(params)
			setVehicleList(data?.vehicles?.rows)
			setTotalCount(data?.vehicles?.count)
			setPermissions(formatPermissionData(data?.permissions))
		} catch (error) {
			ErrorToaster(error)
		} finally {
			setLoader(false)
		}
	}

	// *For Handle Filter
	const handleFilter = (data) => {
		Debounce(() => getVccVehicles(1, '', data));
	}

	// *For Select and DeSelect Vehicles
	const handleCheck = (data) => {
		try {
			const shallowCopy = [...selectedVehicles]
			const currentIndex = selectedVehicles.findIndex(e => e.vehicleId === data?.id)
			if (currentIndex === -1) {
				let obj = {
					vehicleId: data?.id,
					bookingId: data?.booking_id,
				}
				shallowCopy.push(obj)
			} else {
				shallowCopy.splice(currentIndex, 1);
			}
			setSelectedVehicles(shallowCopy)
		} catch (error) {
			ErrorToaster(error)
		}
	}
	const handleClick = (item) => {

		if (item?.vcc?.vcc_declaration) {
			setDeclarationDialog(true);


			setVccId(item?.vcc?.id);
		}
	};

	// *For Declare Vcc
	const declareVcc = async (formData) => {
		setLoading(true)
		try {
			const declarations = []
			selectedVehicles.forEach(e => {
				let newObj = {
					vehicle_id: e.vehicleId,
					booking_id: e.bookingId
				}
				declarations.push(newObj)
			})
			let obj = {
				vcc_declaration: formData?.declaration,
				vcc_date: vccDate,
				vcc_expiry_date: new Date(moment(vccDate).add(150, 'days')),
				declarations: declarations
			}
			const { message } = await VccServices.declareVcc(obj)
			SuccessToaster(message)
			setSelectedVehicles([])
			getVccVehicles()
			handleCloseVccDialog()
			setVccDeclareDialog(false)
		} catch (error) {
			ErrorToaster(error)
		} finally {
			setLoading(false)
		}
	}

	// *For Handle Close Vcc Dialog
	const handleCloseVccDialog = () => {
		reset()
		handleVccDate()
		handleVccExpDate()
	}

	// *For Add Custom VAT Charges
	const customVatCharges = async (formData) => {
		setLoading(true)
		try {
			let obj = {
				vcc_id: vccDetail?.vcc?.id,
				custom_charges_aed: formData?.customCharges,
				vat_charges_aed: formData?.vatCharges,
				make_name: vccDetail?.booking?.veh_make?.name,
				model_name: vccDetail?.booking?.veh_model?.name,
				color: vccDetail?.booking?.color,
				vin: vccDetail?.booking?.vin,
				lot_number: vccDetail?.booking?.lot_number,
				customer_id: vccDetail?.booking?.customer?.id,
				vcc_expiry_date: vccDetail?.vcc?.vcc_expiry_date
			}
			const { message } = await VccServices.customVatCharges(obj)
			SuccessToaster(message)
			getVccVehicles()
			reset3()
			setVccVatChargesDialog(false)
		} catch (error) {
			ErrorToaster(error)
		} finally {
			setLoading(false)
		}
	}

	const handleColumnChange = (event) => {
		const selectedColumns = event.target.value;
		// Sort the selected columns to maintain the correct order
		const sortedColumns = selectedColumns.sort((a, b) => a - b);
		setVisibleColumns(sortedColumns);
	};

	const renderCellContent = (colIndex, item, isActive,) => {
		const date = moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY');
		const targetDate = moment(date, 'MM-DD-YYYY');
		let daysRemaining = targetDate.diff(moment(), 'days');
		if (daysRemaining < 0) {
			daysRemaining = 0;
		}
		switch (colIndex) {
			case 0:
				return item?.vcc?.id ?? '-';
			case 1:
				return (
					<Box>
						<Tooltip
							className="pdf-hide"
							title={item?.booking?.customer?.name ?? "-"}
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
								item?.booking?.customer?.name?.length > 12
									? item?.booking?.customer?.name?.slice(0, 8) + "..." : item?.booking?.customer?.name
							}
						</Tooltip>
						<Box
							component={"div"}
							className='pdf-show'
							sx={{ display: "none !important" }}
						>
							{item?.booking?.customer?.name ?? "-"}
						</Box>
					</Box>
				)
			// item?.booking?.customer?.name ?? '-';
			case 2:
				return (
					<Box>
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
									? item?.booking?.veh_make?.name?.slice(0, 8) + "..." : item?.booking?.veh_make?.name
							}
						</Tooltip>
						<Box
							component={"div"}
							className='pdf-show'
							sx={{ display: "none !important" }}
						>
							{item?.booking?.veh_make?.name ?? "-"}
						</Box>
					</Box>
				)
			// item?.booking?.veh_make?.name ?? '-';
			case 3:
				return (
					<Box>
						<Tooltip
							className="pdf-hide"
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
									? item?.booking?.veh_model?.name?.slice(0, 8) + "..." : item?.booking?.veh_model?.name
							}
						</Tooltip>
						<Box
							component={"div"}
							className='pdf-show'
							sx={{ display: "none !important" }}
						>
							{item?.booking?.veh_model?.name ?? "-"}
						</Box>
					</Box>
				)
			// item?.booking?.veh_model?.name ?? '-';
			case 4:
				return (
					<Box>
						<Tooltip
							className="pdf-hide"
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
									? item?.booking?.lot_number?.slice(0, 8) + "..." : item?.booking?.lot_number
							}
						</Tooltip>
						<Box
							component={"div"}
							className='pdf-show'
							sx={{ display: "none !important" }}>
							{item?.booking?.lot_number ?? "-"}
						</Box>
					</Box>
				)
			// item?.booking?.lot_number ?? '-';
			case 5:
				return (
					<Box>
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
									? item?.booking?.vin?.slice(0, 8) + "..." : item?.booking?.vin
							}
						</Tooltip>
						<Box
							component={"div"}
							className='pdf-show'
							sx={{ display: "none !important" }}
						>
							{item?.booking?.vin ?? "-"}
						</Box>
					</Box>
				)
			// item?.booking?.vin ?? '-';
			case 6:
				return item?.booking?.color ?? '-';
			case 7:
				return (
					<Box>
						<Tooltip
							className="pdf-hide"
							title={item?.container_no ?? "-"}
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
								item?.container_no?.length > 12
									? item?.container_no?.slice(0, 8) + "..." : item?.container_no
							}
						</Tooltip>
						<Box
							component={"div"}
							className='pdf-show'
							sx={{ display: "none !important" }}
						>
							{item?.container_no ?? "-"}
						</Box>
					</Box>
				)
			// item?.container_no ?? '-';
			case 8:
				return (
					<Box>
						<Tooltip
							className='pdf-hide'
							title={item?.vcc?.vcc_declaration ?? "-"}
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
								item?.vcc?.vcc_declaration?.length > 12
									? item?.vcc?.vcc_declaration?.slice(0, 8) + "..." : item?.vcc?.vcc_declaration
							}
						</Tooltip>
						<Box
							component={"div"}
							className='pdf-show'
							sx={{ display: "none !important" }}
						>
							{item?.vcc?.vcc_declaration ?? "-"}
						</Box>
					</Box>
				)
			// item?.vcc?.vcc_declaration ?? "-";
			case 9:
				return item?.vcc?.vcc_date ? moment(item?.vcc?.vcc_date).format('MM-DD-YYYY') : '-';
			case 10:
				return item?.vcc?.vcc_expiry_date ? moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY') : '-';
			case 11:
				return item?.vcc?.vcc_expiry_date ? `${daysRemaining} days` : '-';
			case 12:
				return item?.vcc?.custom_charges_aed ?? '-';
			case 13:
				return item?.vcc?.vat_charges_aed ?? '-';
			case 14:
				return item?.arrived_port_date && item?.vcc?.id &&
					<Box className="pdf-hide" sx={{ cursor: 'pointer' }} onClick={() => { setVccVatChargesDialog(true); setVccDetail(item) }}>
						<IconButton sx={{ bgcolor: Colors.blackShade, '&:hover': { bgcolor: Colors.blackShade } }}>
							<Edit sx={{ color: Colors.white, height: '16px !important' }} />
						</IconButton>
						<Typography variant="body2">
							Add Custom & VAT
						</Typography>
					</Box>;
			default:
				return "-";
		}
	};

	const downloadExcel = () => {
		const headers = tableHead.filter((item) => item !== "Action");
		const rows = vehicleList?.map((item) => {
			const date = moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY');
			const targetDate = moment(date, 'MM-DD-YYYY');
			let daysRemaining = targetDate.diff(moment(), 'days');
			if (daysRemaining < 0) {
				daysRemaining = 0;
			}
			return [
				item?.vcc?.id ?? '-',
				item?.booking?.customer?.name ?? "-",
				item?.booking?.veh_make?.name ?? "-",
				item?.booking?.veh_model?.name ?? "-",
				item?.booking?.lot_number ?? "-",
				item?.booking?.vin ?? "-",
				item?.booking?.color ?? '-',
				item?.container_no ?? "-",
				item?.vcc?.vcc_declaration ?? "-",
				item?.vcc?.vcc_date ? moment(item?.vcc?.vcc_date).format('MM-DD-YYYY') : '-',
				item?.vcc?.vcc_expiry_date ? moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY') : '-',
				item?.vcc?.vcc_expiry_date ? `${daysRemaining} days` : '-',
				item?.vcc?.custom_charges_aed ?? '-',
				item?.vcc?.vat_charges_aed ?? '-'
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
		getVccVehicles()
	}, []);

	return (
		<Box sx={{ m: 4 }}>

			<Dialog
				open={vccDeclareDialog}
				sx={{ '& .MuiDialog-paper': { width: '40%', height: "auto", borderRadius: 2, py: { xs: 2, md: 4 }, px: { xs: 3, md: 6 } } }}
			>
				<IconButton onClick={() => { setVccDeclareDialog(false); handleCloseVccDialog() }} sx={{ position: 'absolute', right: 13, top: 13 }}>
					<CancelOutlined />
				</IconButton>
				<Box>
					<Typography variant="h5" sx={{ textAlign: 'center', color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mt: 1, mb: 1.5 }}>
						Add VCC Declaration
					</Typography>
					<Box component="form" onSubmit={handleSubmit(declareVcc)} sx={{ mt: 4 }}>
						<Grid container spacing={1} alignItems={'flex-start'}>
							<Grid item xs={12} sm={12}>
								<InputField
									size={'small'}
									label={'VCC Declaration'}
									placeholder={'VCC Declaration'}
									error={errors?.declaration?.message}
									register={register("declaration", {
										required: 'Please enter vcc declaration.',
									})}
								/>
							</Grid>
							<Grid item xs={12} sm={12}>
								<DatePicker
									size={'small'}
									label={'Date'}
									value={vccDate}
									disablePast={true}
									error={errors?.vccDate?.message}
									register={register("vccDate", {
										required: 'Please enter date.',
									})}
									onChange={(date) => handleVccDate(date)}
								/>
							</Grid>
							<Grid item xs={12} sm={12}>
								<DatePicker
									disabled={true}
									size={'small'}
									label={'Expiry Date'}
									value={new Date(moment(vccDate).add(150, 'days'))}
									disablePast={true}
									register={register("vccExpDate")}
									onChange={(date) => handleVccExpDate(date)}
								/>
							</Grid>
							<Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
								<PrimaryButton
									title="Submit"
									type={'submit'}
									loading={loading}
								/>
							</Grid>
						</Grid>
					</Box>
				</Box>
			</Dialog>

			<Dialog
				open={vccVatChargesDialog}
				sx={{ '& .MuiDialog-paper': { width: '40%', height: "auto", borderRadius: 2, py: { xs: 2, md: 4 }, px: { xs: 3, md: 6 } } }}
			>
				<IconButton onClick={() => { setVccVatChargesDialog(false); reset3() }} sx={{ position: 'absolute', right: 13, top: 13 }}>
					<CancelOutlined />
				</IconButton>
				<Box>
					<Typography variant="h5" sx={{ textAlign: 'center', color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mt: 1, mb: 1.5 }}>
						Custom VAT Charges
					</Typography>
					<Box component="form" onSubmit={handleSubmit3(customVatCharges)} sx={{ mt: 4 }}>
						<Grid container spacing={1} alignItems={'flex-start'}>
							<Grid item xs={12} sm={12}>
								<InputField
									size={'small'}
									type={'number'}
									label={'Custom Charges in AED'}
									placeholder={'Custom Charges in AED'}
									InputProps={{ inputProps: { min: 0 } }}
									error={errors3?.customCharges?.message}
									register={register3("customCharges", {
										required: 'Please enter custom charges.',
										onChange: e => console.log(e.target.value)
									})}
								/>
							</Grid>
							<Grid item xs={12} sm={12}>
								<InputField
									size={'small'}
									type={'number'}
									label={'VAT Charges in AED'}
									placeholder={'VAT Charges in AED'}
									InputProps={{ inputProps: { min: 0 } }}
									error={errors3?.vatCharges?.message}
									register={register3("vatCharges", {
										required: 'Please enter vat charges.',
									})}
								/>
							</Grid>
							<Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
								<PrimaryButton
									title="Submit"
									type={'submit'}
									loading={loading}
								/>
							</Grid>
						</Grid>
					</Box>
				</Box>
			</Dialog>
			<SimpleDialog
				open={declarationDialog}
				onClose={() => setDeclarationDialog(false)}
				title={"Declaration Number"}
			>
				<Box component="form" onSubmit={handleSubmit4(updateDeclaration)}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12}>
							<InputField
								label={"Declaration Number"}
								placeholder={"Declaration Number"}
								multiline={true}

								error={errors4?.comment?.message}
								register={register4("comment", {
									required: "Please enter comment.",
								})}
							/>
						</Grid>
						<Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
							<PrimaryButton title="Submit" type="submit" />
						</Grid>
					</Grid>
				</Box>
			</SimpleDialog>
			<Grid container spacing={1}>
				<Grid item xs={12} sm={8} md={12}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mr: 4,
							my: 4,
						}}
					>
						<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
							Add Custom & VAT
						</Typography>
						{vehicleList?.length > 0 && (
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
				<Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
					{permissions?.declare &&
						<PrimaryButton
							disabled={selectedVehicles.length > 0 ? false : true}
							title="Add"
							type='button'
							buttonStyle={{ justifyContent: 'space-evenly', 'path': { fill: Colors.white } }}
							startIcon={<VccIcon />}
							onClick={() => setVccDeclareDialog(true)}
						/>
					}
				</Grid>
			</Grid>

			{/* Filters */}
			<Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px' }}>
				<Grid container spacing={1}>
					<Grid item xs={12} sm={3}>
						<InputField
							size={'small'}
							inputStyle={{ backgroundColor: '#f5f5f5' }}
							label={'Search'}
							InputProps={{
								startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
							}}
							placeholder={'Search'}
							register={register2('search', {
								onChange: (e) => handleFilter({ search: e.target.value })
							})}
						/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<InputField
							size={'small'}
							label={'Container'}
							placeholder={'Container'}
							register={register2('container', {
								onChange: (e) => handleFilter({ container: e.target.value })
							})}
						/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<InputField
							size={'small'}
							label={'VIN'}
							placeholder={'VIN'}
							register={register2('vin', {
								onChange: (e) => handleFilter({ vin: e.target.value })
							})}
						/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<InputField
							size={'small'}
							label={'Lot'}
							placeholder={'Lot'}
							register={register2('lot', {
								onChange: (e) => handleFilter({ lot: e.target.value })
							})}
						/>
					</Grid>
				</Grid>

				<Grid item md={11}>
					{vehicleList && <Box>

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
							vehicleList && (
								<Fragment>
									<PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName='Add Custom & VAT'>
										<Box className='pdf-show' sx={{ display: 'none' }}>
											<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
												<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
													Custom & VAT
												</Typography>
												<Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
											</Box>
										</Box>
										<TableContainer
											component={Paper}
											sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }}
											className="table-box"
										>
											<Table stickyHeader sx={{ minWidth: 500 }}>
												{/* Table Header */}
												<TableHead className='pdf-table'>
													<TableRow className='pdf-table'>
														{visibleColumns.map((index) => (
															<Cell
																key={index}
																className='pdf-table'
															>
																{tableHead[index]}
															</Cell>
														))}
													</TableRow>
												</TableHead>

												{/* Table Body */}
												<TableBody>
													{!loader ? (
														vehicleList?.length > 0 ? (
															<Fragment>
																{vehicleList?.map((item, rowIndex) => {

																	const isActive = true;
																	return (
																		<Row
																			className='pdf-table'
																			key={rowIndex}
																			sx={{ bgcolor: rowIndex % 2 !== 0 && "#EFF8E7" }}
																		>
																			{visibleColumns.map((colIndex) => (
																				<Cell className='pdf-table' key={colIndex}>
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
										onPageSizeChange={(size) => getVccVehicles(1, size.target.value)}
										tableCount={vehicleList?.length}
										totalCount={totalCount}
										onPageChange={(page) => getVccVehicles(page, "")}
									/>

								</Fragment>
							)
						)}


						{loader && <CircleLoading />}

					</Box>}





				</Grid>
			</Box>

		</Box>
	);
}

export default AddVat;