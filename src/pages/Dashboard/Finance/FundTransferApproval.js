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
	FormControl,
	Checkbox,
	Select,
	MenuItem,
	ListItemText,
	InputLabel,
	Tooltip
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { EyeIcon, FontFamily, CheckIcon, PendingIcon } from "assets";
import { ErrorToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import { CircleLoading } from "components/Loaders";
import Pagination from "components/Pagination";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";
import ClientServices from "services/Client";
import DatePicker from "components/DatePicker";
import FinanceServices from "services/Finance";
import { getYearMonthDateFormate, handleExportWithComponent } from "utils";
import { SuccessToaster } from "components/Toaster";
import FundTransferApproval from "components/Dialog/FundsTransferApproval";
import SimpleDialog from "components/Dialog/SimpleDialog";
import InputField from "components/Input";
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
		backgroundColor: Colors.primary,
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

function FundTransferApprovalList() {

	const classes = useStyles();
	const contentRef = useRef(null);
	const navigate = useNavigate();

	const tableHead = [
		"Date",
		"Ref#",
		"From COA Code",
		"From COA Name",
		"To COA Code",
		"To COA Name",
		"Transfer Amount",
		"Exchange Rate",
		"Received Amount",
		"Exchange Loss",
		"Note",
		"Reason",
		"Request By",
		"Status",

	];

	const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const [loader, setLoader] = useState(false);

	// *For Journal Voucher List
	const [vouchers, setVouchers] = useState();

	// *For Pagination
	const [totalCount, setTotalCount] = useState(0);
	const [pageLimit, setPageLimit] = useState(50);
	const [currentPage, setCurrentPage] = useState(1);

	// *For Dialog Box
	const [approvalStatusDialog, setApprovalStatusDialog] = useState(false);
	const [reasonDialog, setReasonDialog] = useState(false);


	const [approvalId, setApprovalId] = useState()

	// *For Approval Status
	const [approvalStatus, setApprovalStatus] = useState('');

	// *For Filters
	const [filters, setFilters] = useState({});
	const [fromDate, setFromDate] = useState()
	const [toDate, setToDate] = useState()

	// *Handle Date
	const handleFromDate = (newDate) => {
		try {
			if (newDate === "Invalid Date") {
				setFromDate("invalid");
				return;
			}
			setFromDate(new Date(newDate));
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *Handle Date
	const handleToDate = (newDate) => {
		try {
			if (newDate === "Invalid Date") {
				setToDate("invalid");
				return;
			}
			setToDate(new Date(newDate));
		} catch (error) {
			ErrorToaster(error);
		}
	};
	const handleClick = (item) => {

		if (item?.is_approved === null) {
			setApprovalStatusDialog(true);
			setApprovalId(item?.iftv_id)

			setApprovalStatus(item?.is_approved)
		}
	}

	// *For Update Approval Status
	const updateApprovalStatus = async (data) => {

		try {
			let obj = {
				iftv_id: approvalId,
				is_approved: data?.comment ? false : true,
				reason: data?.comment
			}
			const { message } = await FinanceServices.FundTransferApprove(obj)

			SuccessToaster(message)
			setApprovalStatusDialog(false)
			setReasonDialog(false)
			getFundTransferVouchers()
		} catch (error) {
			ErrorToaster(error)
		}
	}


	// *For Get Fund Transfer Vouchers List
	const getFundTransferVouchers = async (page, limit, filter) => {
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
			const { data } = await FinanceServices.getFundTransferApproval(params);
			setTotalCount(data?.vouchers?.count);
			setVouchers(data?.vouchers?.rows);
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
				from_date: getYearMonthDateFormate(fromDate),
				to_date: getYearMonthDateFormate(toDate),
			};
			getFundTransferVouchers(1, "", data);
		} catch (error) {
			ErrorToaster(error);
		}
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
				return moment(item?.created_at).format("MM-DD-YYYY");
			case 1:
				return item?.voucher?.ref_no ?? '-';
			case 2:
				return item?.voucher?.from_account?.account_code ?? '-';
			case 3:
				return item?.voucher?.from_account?.name ?? '-';
			case 4:
				return item?.voucher?.to_account?.account_code ?? '-';
			case 5:
				return item?.voucher?.to_account?.name ?? '-';
			case 6:
				return parseFloat(item?.voucher?.from_amount).toFixed(2);
			case 7:
				return parseFloat(item?.voucher?.exchange_rate).toFixed(3);
			case 8:
				return parseFloat(item?.voucher?.to_amount).toFixed(2);
			case 9:
				return parseFloat(item?.voucher?.exchange_loss).toFixed(2);
			case 10:
				return (
					<Box>
						<Tooltip
							className='pdf-hide'
							title={item?.voucher?.notes ?? "-"}
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
								item?.voucher?.notes?.length > 12
									? item?.voucher?.notes?.slice(0, 8) + "..." : item?.voucher?.notes
							}
						</Tooltip>
						<Box
							component={"div"}
							className='pdf-show'
							sx={{ display: "none !important" }}
						>
							{item?.voucher?.notes ?? "-"}
						</Box>
					</Box>
				)
			// item?.voucher?.notes ?? '-';
			case 11:
				return (
					<Box>
						<Tooltip
							className='pdf-hide'
							title={item?.reason ?? "-"}
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
								item?.reason?.length > 12
									? item?.reason?.slice(0, 8) + "..." : item?.reason
							}
						</Tooltip>
						<Box
							component={"div"}
							className='pdf-show'
							sx={{ display: "none !important" }}
						>
							{item?.reason ?? "-"}
						</Box>
					</Box>
				)
			// item?.reason ?? '-'
			case 12:
				return (
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
								? item?.creator?.name?.slice(0, 8) + "..." : item?.creator?.name
						}
						<Box
							component={"div"}
							className='pdf-show'
							sx={{ display: "none !important" }}
						>
							{item?.creator?.name ?? "-"}
						</Box>
					</Tooltip>
				)
			// item?.creator?.name ?? '-';
			case 13:
				return <Box onClick={() => handleClick(item)} sx={{ cursor: 'pointer', 'path': { fill: item?.is_approved ? '' : Colors.danger } }}>
					<span className="pdf-hide"> {item?.is_approved === null ? <PendingIcon /> : <CheckIcon />} </span>
					<Typography variant="body2">
						{item?.is_approved === null ? 'Pending' : item?.is_approved ? 'Approved' : 'Rejected'}
					</Typography>
				</Box>;
			default:
				return "-";
		}
	};

	const downloadExcel = () => {
		const headers = tableHead.filter((item) => item !== "Status");
		const rows = vouchers?.map((item) => [
			moment(item?.created_at).format("MM-DD-YYYY"),
			item?.voucher?.ref_no ?? '-',
			item?.voucher?.from_account?.account_code ?? '-',
			item?.voucher?.from_account?.name ?? '-',
			item?.voucher?.to_account?.account_code ?? '-',
			item?.voucher?.to_account?.name ?? '-',
			parseFloat(item?.voucher?.from_amount).toFixed(2),
			parseFloat(item?.voucher?.exchange_rate).toFixed(3),
			parseFloat(item?.voucher?.to_amount).toFixed(2),
			parseFloat(item?.voucher?.exchange_loss).toFixed(2),
			item?.voucher?.notes ?? "-",
			item?.reason ?? "-",
			item?.creator?.name ?? "-"
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
		getFundTransferVouchers();
	}, []);

	return (
		<Box sx={{ m: 4, mb: 5 }}>

			{/* ========== Approval Status Dialog ========== */}
			<FundTransferApproval open={approvalStatusDialog} onClose={() => setApprovalStatusDialog(false)} status={approvalStatus} updateStatus={(data) => data ? updateApprovalStatus(data) : setReasonDialog(true)} />



			{/* ========== Rejected Reason ========== */}
			<SimpleDialog open={reasonDialog} onClose={() => setReasonDialog(false)} title={'Reason to Reject'}>
				<Box component="form" onSubmit={handleSubmit(updateApprovalStatus)} >
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12}>
							<InputField
								label={'Comments'}
								placeholder={'Comments'}
								multiline={true}
								rows={4}
								error={errors?.comment?.message}
								register={register("comment", {
									required: 'Please enter comment.'
								})}
							/>
						</Grid>
						<Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
							<PrimaryButton
								title="Submit"
								type='submit'
							/>
						</Grid>
					</Grid>
				</Box>
			</SimpleDialog>
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
					IFTV approvals
				</Typography>
				{vouchers?.length > 0 && (
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

				}}
			>
				<Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px' }}>
					<Grid container spacing={2} alignItems={"center"} columns={10}>
						<Grid item xs={12} md={3}>
							<DatePicker
								size={"small"}
								label={"From"}
								register={register("fromDate")}
								onChange={(date) => handleFromDate(date)}

							/>
						</Grid>
						<Grid item xs={12} md={3}>
							<DatePicker
								size={"small"}
								label={"To"}
								register={register("toDate")}
								onChange={(date) => handleToDate(date)}

							/>
						</Grid>
						<Grid item xs={12} md={2} sx={{ height: "55px" }}>
							<Box
								sx={{
									mt: "11px",
									display: "flex",
									justifyContent: "flex-end",
								}}
							>
								<PrimaryButton type={"submit"} title={"Search"} />
							</Box>
						</Grid>
					</Grid>



					<Grid item md={11}>
						{vouchers && <Box>

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
								vouchers && (
									<Fragment>
										<PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
											fileName="IFTV approvals"
										>
											<Box className='pdf-show' sx={{ display: 'none' }}>
												<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
													<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
														IFTV approvals
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
													<TableHead>
														<TableRow>
															{visibleColumns.map((index) => (
																<Cell className='pdf-table'
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
															vouchers?.length > 0 ? (
																<Fragment>
																	{vouchers?.map((item, rowIndex) => {

																		const isActive = true;
																		return (
																			<Row
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
											onPageSizeChange={(size) => getFundTransferVouchers(1, size.target.value)}
											tableCount={vouchers?.length}
											totalCount={totalCount}
											onPageChange={(page) => getFundTransferVouchers(page, "")}
										/>

									</Fragment>
								)
							)}


							{loader && <CircleLoading />}

						</Box>}





					</Grid>
				</Box>
			</Box>

		</Box>
	);
}

export default FundTransferApprovalList;
