import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Dialog, Grid, IconButton, ImageListItem, InputAdornment, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, tableCellClasses } from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, EyeIcon, FontFamily, PendingIcon, SearchIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import VehicleBookingServices from 'services/VehicleBooking';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import { CancelOutlined, Edit } from '@mui/icons-material';
import Pagination from 'components/Pagination';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import DatePicker from 'components/DatePicker';
import { Debounce, formatPermissionData, compareObjects, handleExportWithComponent } from 'utils';
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
		padding: '5px !important',

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

function ApprovalList() {

	const navigate = useNavigate();
	const classes = useStyles();
	const contentRef = useRef(null);
	const tableHead = ['Vehicle ID', 'User', 'Date & Time', 'Customer', 'Comment', 'Status']

	const { register, handleSubmit } = useForm();
	const [loader, setLoader] = useState(false);
	const [loading, setLoading] = useState(false);

	// *For Dialog Box
	const [approvalRequestDialog, setApprovalRequestDialog] = useState(false);

	// *For Approval List
	const [approvalList, setApprovalList] = useState();
	const [approvalDetail, setApprovalDetail] = useState();
	const [bookingId, setBookingId] = useState();
	const [approvalId, setApprovalId] = useState();

	// *For Pagination
	const [totalCount, setTotalCount] = useState(0);
	const [pageLimit, setPageLimit] = useState(50);
	const [currentPage, setCurrentPage] = useState(1);

	// *For Filters
	const [filters, setFilters] = useState({});
	const [fromDate, setFromDate] = useState();
	const [toDate, setToDate] = useState();

	// *For Permissions
	const [permissions, setPermissions] = useState();

	// *For Handle Date
	const handleFromDate = (newDate) => {
		try {
			// eslint-disable-next-line eqeqeq
			if (newDate == 'Invalid Date') {
				setFromDate('invalid')
				return
			}
			setFromDate(new Date(newDate))
			handleFilter({ from_date: moment(new Date(newDate)).format('MM-DD-YYYY') })
		} catch (error) {
			ErrorToaster(error)
		}
	}

	const handleToDate = (newDate) => {
		try {
			// eslint-disable-next-line eqeqeq
			if (newDate == 'Invalid Date') {
				setToDate('invalid')
				return
			}
			setToDate(new Date(newDate))
			handleFilter({ to_date: moment(new Date(newDate)).format('MM-DD-YYYY') })
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Get Approval List
	const getApprovalList = async (page, limit, filter) => {
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
			const { data } = await VehicleBookingServices.getApprovalList(params)
			setApprovalList(data?.approvals?.rows)
			setTotalCount(data?.approvals?.count)
			setPermissions(formatPermissionData(data?.permissions))
		} catch (error) {
			ErrorToaster(error)
		} finally {
			setLoader(false)
		}
	}

	// *For Get Approval Detail
	const getApprovalDetail = async (id) => {
		try {
			let params = {
				approval_id: id
			}
			let { data } = await VehicleBookingServices.getApprovalDetail(params)
			let oldData = data?.details?.edited_data?.old_data
			let newData = data?.details?.edited_data?.old_data

			let obj = {
				...data.details,
				oldData: oldData,
				newData: newData
			}

			setApprovalDetail(obj)
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Review Approval
	const reviewApproval = async (status) => {
		setLoading(true)
		try {
			let obj = {
				approval_id: approvalId,
				booking_id: bookingId,
				status: status,
			}
			if (status === 'approved') {
				obj.new_data = approvalDetail?.edited_data
			}
			const { message } = await VehicleBookingServices.reviewApproval(obj)
			SuccessToaster(message)
			setApprovalRequestDialog(false)
			getApprovalList()
		} catch (error) {
			ErrorToaster(error)
		} finally {
			setLoading(false)
		}
	}

	// *For Handle Status Action
	const handleStatusAction = (id, status, bookingId) => {
		if (permissions?.review && status === 'pending') {
			setApprovalRequestDialog(true);
			getApprovalDetail(id);
			setBookingId(bookingId);
			setApprovalId(id)
		}
	}

	// *For Handle Filter
	const handleFilter = (data) => {
		Debounce(() => getApprovalList(1, '', data));
	}

	const downloadExcel = () => {
		const headers = tableHead;
		const rows = approvalList?.map((item) => [
			item?.booking_id ?? "-",
			item?.editor?.name ?? "-",
			moment(item?.edited_at).format("MM-DD-YYYY HH:mm a"),
			item?.booking?.customer?.name ?? "-",
			item?.comment ?? "-",
			item?.status,
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
		getApprovalList()
	}, []);

	return (
		<Box sx={{ m: 4, mb: 2 }}>

			<Dialog
				open={approvalRequestDialog}
				sx={{ '& .MuiDialog-paper': { width: '40%', height: "auto", borderRadius: 2, py: { xs: 2, md: 4 }, px: { xs: 3, md: 6 } } }}
			>
				<IconButton onClick={() => setApprovalRequestDialog(false)} sx={{ position: 'absolute', right: 13, top: 13 }}>
					<CancelOutlined />
				</IconButton>
				<Box>
					<Typography variant="h5" sx={{ textAlign: 'center', color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mt: 1, mb: 1.5 }}>
						Approval Request
					</Typography>
					<Box component="form" onSubmit={handleSubmit(reviewApproval)} sx={{ mt: 4 }}>
						<Grid container spacing={1} alignItems={'flex-start'}>
							<Grid container spacing={0} item xs={12} sm={6}>
								<Grid item xs={12} sm={12}>
									<Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1.5 }}>
										Old Data
									</Typography>
								</Grid>
								{approvalDetail?.old_data?.map((item, index) => (
									<Grid item xs={12} sm={12}>
										{item?.key.includes('pictures') ? (
											<Fragment>
												<Typography variant="body1">{item?.key.split('_').join(' ')}</Typography>
												{item?.value.map((item, index) => (
													<ImageListItem key={index}>
														<Box sx={{ position: 'relative', textAlign: 'center' }}>
															<Box
																component={'img'}
																src={process.env.REACT_APP_IMAGE_BASE_URL + item}
																sx={{ height: 200, width: 200, objectFit: 'contain' }}
															/>
														</Box>
													</ImageListItem>
												))}
											</Fragment>
										) : (
											<InputField
												disabled={true}
												size='small'
												value={item?.value}
												label={item?.key.split('_').join(' ').replace('id', '')}
											/>
										)}
									</Grid>
								))}
							</Grid>
							<Grid container spacing={0} item xs={12} sm={6}>
								<Grid item xs={12} sm={12}>
									<Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1.5 }}>
										New Data
									</Typography>
								</Grid>
								{approvalDetail?.new_data?.map((item, index) => (
									<Grid item xs={12} sm={12}>
										{item?.key.includes('pictures') ? (
											<Fragment>
												<Typography variant="body1">{item?.key.split('_').join(' ')}</Typography>
												{item?.value.map((item, index) => (
													<ImageListItem key={index}>
														<Box sx={{ position: 'relative', textAlign: 'center' }}>
															<Box
																component={'img'}
																src={process.env.REACT_APP_IMAGE_BASE_URL + item}
																sx={{ height: 200, width: 200, objectFit: 'contain' }}
															/>
														</Box>
													</ImageListItem>
												))}
											</Fragment>
										) : (
											<InputField
												disabled={true}
												size='small'
												value={item?.value}
												label={item?.key.split('_').join(' ').replace('id', '')}
											/>
										)}
									</Grid>
								))}
							</Grid>
							<Grid item xs={12} sm={12}>
								<InputField
									disabled={true}
									multiline={true}
									rows={4}
									label={'Comment'}
									placeholder={'Comment'}
									value={approvalDetail?.comment}
								/>
							</Grid>
							<Grid item xs={12} sm={6} sx={{ mt: 2, textAlign: 'center' }}>
								<PrimaryButton
									title="Reject"
									style={{ backgroundColor: Colors.greyShade, marginRight: '8px' }}
									onClick={() => reviewApproval('rejected')}
								/>
							</Grid>
							<Grid item xs={12} sm={6} sx={{ mt: 2, textAlign: 'center' }}>
								<PrimaryButton
									title="Approve"
									onClick={() => reviewApproval('approved')}
								/>
							</Grid>
						</Grid>
					</Box>
				</Box>
			</Dialog>
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
					Approval Record
				</Typography>
				{approvalList?.length > 0 && (
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
							register={register("Search", {
								onChange: (e) => handleFilter({ search: e.target.value }),
							})}
						/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<DatePicker
							size="small"
							label={"From Date"}
							maxDate={toDate}
							value={fromDate}
							onChange={(date) => handleFromDate(date)}
						/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<DatePicker
							size="small"
							minDate={fromDate}
							label={"To Date"}
							value={toDate}
							onChange={(date) => handleToDate(date)}
						/>
					</Grid>
				</Grid>

				{approvalList ? (
					<Fragment>
						<PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName='Approval Record'>
							<Box className='pdf-show' sx={{ display: 'none' }}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
										Approval List
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
								className='table-box'
							>
								<Table stickyHeader sx={{ minWidth: 500 }}>
									<TableHead>
										<TableRow>
											{tableHead.map((item, index) => (
												<Cell className='pdf-table' key={index}>{item}</Cell>
											))}
										</TableRow>
									</TableHead>
									<TableBody>
										{!loader ? (
											approvalList?.length > 0 ? (
												<Fragment>
													{approvalList.map((item, index) => (
														<Row
															key={index}
															sx={{ bgcolor: index % 2 !== 0 && "#EFF8E7" }}
														>
															<Cell className='pdf-table'>{item?.booking_id ?? "-"}</Cell>
															<Cell className='pdf-table'>
																<Tooltip
																	className="pdf-hide"
																	title={item?.editor?.name ?? "-"}
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
																		item?.editor?.name?.length > 12
																			? item?.editor?.name?.slice(0, 8) + "..." : item?.editor?.name
																	}
																</Tooltip>
																<Box
																	component={"div"}
																	className='pdf-show'
																	sx={{ display: "none !important" }}
																>
																	{item?.editor?.name ?? "-"}
																</Box>
															</Cell>
															<Cell className='pdf-table'>
																{moment(item?.edited_at).format(
																	"MM-DD-YYYY HH:mm a"
																)}
															</Cell>
															<Cell className='pdf-table '>
																<Tooltip
																	className='pdf-hide'
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
																<Box sx={{ display: 'none !important' }} component={'div'} className='pdf-show'>{item?.booking?.customer?.name ?? "-"}</Box>
															</Cell>
															<Cell className='pdf-table'>
																<Tooltip
																	className='pdf-hide'
																	title={item?.comment ?? "-"}
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
																		item?.comment?.length > 12
																			? item?.comment?.slice(0, 8) + "..." : item?.comment
																	}
																</Tooltip>
																<Box
																	component={"div"}
																	className='pdf-show'
																	sx={{ display: "none !important" }}
																>
																	{item?.comment ?? "-"}
																</Box>
															</Cell>
															<Cell className='pdf-table'>
																<Box
																	component={'div'}
																	sx={{
																		cursor:
																			item?.status === "pending" &&
																			"pointer",
																		path: {
																			fill:
																				item?.status === "approved"
																					? Colors.success
																					: Colors.danger,
																		},
																	}}
																	onClick={() =>
																		handleStatusAction(
																			item.id,
																			item?.status,
																			item.booking_id
																		)
																	}
																>
																	<span className='pdf-hide'>{item?.status === "pending" ? (
																		<PendingIcon />
																	) : (
																		<CheckIcon />
																	)}</span>
																	<Typography variant="body2">
																		{item?.status}
																	</Typography>
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
							onPageSizeChange={(size) => getApprovalList(1, size.target.value)}
							tableCount={approvalList?.length}
							totalCount={totalCount}
							onPageChange={(page) => getApprovalList(page, "")}
						/>
					</Fragment>
				) : (
					<CircleLoading />
				)}
			</Box>
		</Box>
	);
}

export default ApprovalList;