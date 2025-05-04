import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
	Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Grid, Dialog, Tooltip, FormControl,
	Checkbox,
	Select,
	MenuItem,
	ListItemText,
	InputLabel,
	InputAdornment
} from '@mui/material';
import styled from '@emotion/styled';
import { EyeIcon, FontFamily, SearchIcon } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster } from 'components/Toaster';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { Debounce, LedgerLinking, handleExportWithComponent } from 'utils';
import { PrimaryButton } from 'components/Buttons';
import moment from 'moment';
import FinanceServices from 'services/Finance';
import DatePicker from 'components/DatePicker';
import { CancelOutlined, FilterAlt } from '@mui/icons-material';
import SelectField from 'components/Select';
import { useLocation, useNavigate } from "react-router-dom";
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
		fontFamily: 'Public Sans',
		border: '1px solid #EEEEEE',
		padding: '15px',
		textAlign: 'left',
		whiteSpace: 'nowrap',
		color: '#434343',
		paddingRight: '50px',
		background: 'transparent',
		fontWeight: 'bold'
  
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
		fontFamily: 'Public Sans',
  
		textWrap: 'nowrap',
		padding: '5px !important',
		paddingLeft: '15px !important',
  
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
			height: '24px',
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

function GeneralJournalLedger() {

	const classes = useStyles();
	const { state } = useLocation();
	console.log(state, 'state');
	const contentRef = useRef()

	const { register, handleSubmit, getValues, setValue } = useForm();


	const tableHead = ['JV#', 'Date', 'Particular#', 'Type', 'COA Code', 'COA Name', 'Debit (AED)', 'Credit (AED)', 'Description', 'Comments','Actions']

	const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);

	const [loader, setLoader] = useState(false);

	const navigate = useNavigate();

	// *For General Journal
	const [generalJournalAccounts, setGeneralJournalAccounts] = useState();

	// *For Pagination
	const [totalCount, setTotalCount] = useState(0);
	const [pageLimit, setPageLimit] = useState(50);
	const [currentPage, setCurrentPage] = useState(1);

	// *For Dialog
	const [openFilterDialog, setOpenFilterDialog] = useState(false);

	// *For Major Categories
	const [majorCategories, setMajorCategories] = useState([]);
	const [selectedMajorCategory, setSelectedMajorCategory] = useState(null);

	// *For Sub Categories
	const [subCategories, setSubCategories] = useState([]);
	const [selectedSubCategory, setSelectedSubCategory] = useState(null);

	// *For Accounts
	const [accounts, setAccounts] = useState([]);
	const [selectedAccount, setSelectedAccount] = useState(null);

	// *For Filters
	const [filters, setFilters] = useState({});
	const [fromDate, setFromDate] = useState();
	const [toDate, setToDate] = useState();

	// *For Handle Date
	const handleFromDate = (newDate) => {
		try {
			// eslint-disable-next-line eqeqeq
			if (newDate == 'Invalid Date') {
				setFromDate('invalid')
				return
			}
			setFromDate(new Date(newDate))
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
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Get Major Categories
	const getMajorCategories = async () => {
		try {
			const { data } = await FinanceServices.getMajorCategories()
			setMajorCategories(data?.categories)
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Get Sub Categories
	const getSubCategories = async (id) => {
		try {
			let params = {
				category_id: id ?? ''
			}
			const { data } = await FinanceServices.getSubCategories(params)
			setSubCategories(data?.categories)
			if (id) {
				getAccountsDropDown('', id, data?.categories[0]?.id)
			}
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Get Account Dropdown
	const getAccountsDropDown = async (search, category, subCategory) => {
		try {
			let params = {
				page: 1,
				limit: 50,
				name: search,
				category: category ?? selectedMajorCategory?.id,
				sub_category: subCategory ?? selectedSubCategory?.id,
			}
			const { data } = await FinanceServices.getAccountsDropDown(params)
			setAccounts(data?.accounts?.rows)
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Get General Journal Ledger
	const getGeneralJournalLedgers = async (page, limit, filter) => {
		// setLoader(true)
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
			const { data } = await FinanceServices.getGeneralJournalLedgers(params)
			setGeneralJournalAccounts(data?.statement?.rows)
			setTotalCount(data?.statement?.count)
		} catch (error) {
			ErrorToaster(error)
		} finally {
			// setLoader(false)
		}
	}

	// *For Handle Filter
	const handleFilter = (data) => {
		Debounce(() => getGeneralJournalLedgers(1, '', data));
	}

	const applyFilter = () => {
		let filterData = {
			accounts: selectedAccount?.id,
			categories: selectedMajorCategory?.id,
			sub_categories: selectedSubCategory?.id,
			from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
			to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',
		}
		getGeneralJournalLedgers(1, '', filterData)
		setOpenFilterDialog(false)
	}

	const clearFilter = () => {
		setSelectedAccount(null)
		setSelectedMajorCategory(null)
		setSelectedSubCategory(null)
		setFromDate(null)
		setToDate(null)
		let filterData = {
			accounts: '',
			categories: '',
			sub_categories: '',
			form_date: '',
			to_date: '',
		}
		getGeneralJournalLedgers(1, '', filterData)
		setOpenFilterDialog(false)
	}

	const handleColumnChange = (event) => {
		const selectedColumns = event.target.value;
		// Sort the selected columns to maintain the correct order
		const sortedColumns = selectedColumns.sort((a, b) => a - b);
		setVisibleColumns(sortedColumns);
	};

	const renderCellContent = (colIndex, item, isActive,) => {

		let page = LedgerLinking(item?.entry?.reference_module)


		switch (colIndex) {
			case 0:
				return item?.journal_id
					? item?.series_id + item?.journal_id
					: "-";
			case 1:
				return moment(item?.created_at).format(
					"DD/MM/YYYY"
				) ?? "-";

			case 2:
				return <Box>
					<Tooltip
						className="pdf-hide"
						title={item.entry?.reference_no}
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
					>{item.entry?.reference_no?.length > 24 ? item.entry?.reference_no?.slice(0, 8) + "..." : item.entry?.reference_no}</Tooltip>
					<Box component="div" sx={{ display: 'none !important' }} className='pdf-show'>
						{item.entry?.reference_no}
					</Box>
				</Box>
			case 3:
				return item?.type?.type_name ?? "-";
			case 4:
				return item?.account?.account_code ?? "-";
			case 5:
				return item?.account?.name ?? "-";
			case 6:
				return parseFloat(item?.debit).toFixed(2) ??
					"0.00";
			case 7:
				return parseFloat(item?.credit).toFixed(2) ?? "0.00";
			case 8:
				return item?.description ?? "-"
					;

			case 9:
				return (
					<Box>
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
							{item?.comment?.length > 24 ? item?.comment?.slice(0, 18) : item?.comment}
						</Tooltip>
						<Box
							component={"div"}
							className='pdf-show'
							sx={{ display: "none !important" }}
						>
							{item?.comment ?? "-"}
						</Box>
					</Box>
				)
			case 10:
				return <Box component={'div'} className='pdf-hide'
					onClick={  () => {
							setValue('search', item?.series_id + item?.journal_id);
							handleFilter({ search: item?.series_id + item?.journal_id })
						}}
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

				</Box>;

			default:
				return "-";
		}
	};

	const downloadExcel = () => {
		// Define headers and data separately
		const headers = tableHead.filter((item) => item !== "Action");
		const data = generalJournalAccounts;
		// Extract values from objects and create an array for each row
		const rows = data.map((item, index) => [
			item?.journal_id ? item?.series_id + item?.journal_id : "-",
			moment(item?.created_at).format("MM-DD-YYYY") ?? "-",
			item.entry?.reference_no,
			item?.type?.type_name ?? "-",
			item?.account?.account_code ?? "-",
			item?.account?.name ?? "-",
			parseFloat(item?.debit).toFixed(2) ?? "0.00",
			parseFloat(item?.credit).toFixed(2) ?? "0.00",
			item?.description ?? "-",
			item?.comment ?? "-"
		]);

		// Create a workbook with a worksheet
		const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

		// Convert the workbook to an array buffer
		const buf = XLSX.write(wb, {
			bookType: "xlsx",
			type: "array",
			mimeType:
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		// Save the file using FileSaver.js
		saveAs(new Blob([buf]), "data.xlsx");
	};

	useEffect(() => {
		getGeneralJournalLedgers()
		getAccountsDropDown()
		getMajorCategories()
		getSubCategories()
		if (state) {
			setValue('search', state)
			handleFilter({ search: state })
		}

	}, []);

	return (
		<Box sx={{ m: 4, mb: 2 }}>
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
					General Journal Entries
				</Typography>
				{/* {generalJournalAccounts?.length > 0 && (
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
				)} */}
			</Box>

			{/* Filters */}
			<Grid container spacing={1} alignItems="center" justifyContent={"space-between"}>
				<Grid item xs={12} sm={3}>
					<InputField
						size={"small"}
						inputStyle={{ backgroundColor: '#f5f5f5' }}
						label={'Search'}
						InputProps={{
							startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
						}}
						placeholder={"Search"}
						register={register("search", {
							onChange: (e) => handleFilter({ search: e.target.value }),
						})}
					/>
				</Grid>
				<Grid item xs={12} sm={3} sx={{ textAlign: "right" }}>
					<PrimaryButton
						title="Filters"
						startIcon={<FilterAlt />}
						buttonStyle={{ minWidth: "120px" }}
						onClick={() => setOpenFilterDialog(true)}
					/>
				</Grid>
			</Grid>

			<Dialog
				open={openFilterDialog}
				sx={{
					"& .MuiDialog-paper": {
						width: "35%",
						height: "auto",
						borderRadius: 2,
						py: 2,
						px: 3,
					},
				}}
			>
				<IconButton
					onClick={() => setOpenFilterDialog(false)}
					sx={{ position: "absolute", right: 13, top: 13 }}
				>
					<CancelOutlined />
				</IconButton>
				<Typography
					variant="h5"
					sx={{
						color: Colors.charcoalGrey,
						fontFamily: FontFamily.NunitoRegular,
						mt: 1,
						mb: 2.5,
					}}
				>
					Filters
				</Typography>
				<Box component="form" onSubmit={handleSubmit(applyFilter)}>
					<Grid container spacing={0.5} alignItems="center">
						<Grid item xs={12} sm={3}>
							<Typography variant="body1">Category:</Typography>
						</Grid>
						<Grid item xs={12} sm={9}>
							<SelectField
								size={"small"}
								options={majorCategories}
								selected={selectedMajorCategory}
								onSelect={(value) => { setSelectedMajorCategory(value); getSubCategories(value?.id); setSelectedSubCategory(subCategories[0]) }}
								register={register("category")}
							/>
						</Grid>
						<Grid item xs={12} sm={3}>
							<Typography variant="body1">Sub Category:</Typography>
						</Grid>
						<Grid item xs={12} sm={9}>
							<SelectField
								size={"small"}
								options={subCategories}
								selected={selectedSubCategory}
								onSelect={(value) => { setSelectedSubCategory(value); getAccountsDropDown('', undefined, value?.id) }}
								register={register("subCategory")}
							/>
						</Grid>
						<Grid item xs={12} sm={3}>
							<Typography variant="body1">Account:</Typography>
						</Grid>
						<Grid item xs={12} sm={9}>
							<SelectField
								size={"small"}
								onSearch={(v) => getAccountsDropDown(v)}
								options={accounts}
								selected={selectedAccount}
								onSelect={(value) => setSelectedAccount(value)}
							/>
						</Grid>
						<Grid item xs={12} sm={3}>
							<Typography variant="body1">From Date:</Typography>
						</Grid>
						<Grid item xs={12} sm={9}>
							<DatePicker
								disableFuture={true}
								size="small"
								value={fromDate}
								onChange={(date) => handleFromDate(date)}
							/>
						</Grid>
						<Grid item xs={12} sm={3}>
							<Typography variant="body1">To Date:</Typography>
						</Grid>
						<Grid item xs={12} sm={9}>
							<DatePicker
								disableFuture={true}
								size="small"
								minDate={fromDate}
								value={toDate}
								onChange={(date) => handleToDate(date)}
							/>
						</Grid>
						<Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
							<PrimaryButton
								title="Apply"
								type="submit"
								buttonStyle={{ minWidth: "120px" }}
							/>
							<Box component={"span"} sx={{ mx: 1 }} />
							<PrimaryButton
								title="Reset"
								type="button"
								buttonStyle={{
									minWidth: "120px",
									bgcolor: Colors.cloudyGrey,
									"&:hover": { bgcolor: Colors.cloudyGrey },
								}}
								onClick={() => clearFilter()}
							/>
						</Grid>
					</Grid>
				</Box>
			</Dialog>


			<Grid item md={11}>
				{generalJournalAccounts && <Box>

					{/* <Grid container mb={2} >
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


										if (column !== 'Credit (AED)' && column !== 'Debit (AED)') {
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
					</Grid> */}

					{(
						generalJournalAccounts && (
							<Fragment>
								<PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
									fileName="General Journal Entries"
								>
									<Box className='pdf-show' sx={{ display: 'none' }}>
										<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
											<Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
												General Journal Entries
											</Typography>
											<Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
										</Box>
									</Box>
									<TableContainer
										component={Paper}
										sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }}
										className='table-box'
									>
										<Table stickyHeader sx={{ minWidth: 500 }}>
											{/* Table Header */}
											<TableHead>
												<TableRow>
													{visibleColumns.map((index) => (
														<Cell className="pdf-table"
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
													generalJournalAccounts?.length > 0 ? (
														<Fragment>
															{generalJournalAccounts?.map((item, rowIndex) => {

																const isActive = true;
																return (
																	<Row
																		key={rowIndex}
																		sx={{ bgcolor: rowIndex % 2 !== 0 && "#EFF8E7" }}
																	>
																		{visibleColumns.map((colIndex) => (
																			<Cell className="pdf-table" key={colIndex}>
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
									onPageSizeChange={(size) => getGeneralJournalLedgers(1, size.target.value)}
									tableCount={generalJournalAccounts?.length}
									totalCount={totalCount}
									onPageChange={(page) => getGeneralJournalLedgers(page, "")}
								/>

							</Fragment>
						)
					)}


					{loader && <CircleLoading />}

				</Box>}





			</Grid>
		</Box>
	);
}

export default GeneralJournalLedger;