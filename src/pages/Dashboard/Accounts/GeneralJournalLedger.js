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
import EditIcon from '@mui/icons-material/Edit';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { EyeIcon, FontFamily, SearchIcon } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster } from 'components/Toaster';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import InputField from 'components/Input';
import ExcelJS from "exceljs";
import { useForm } from 'react-hook-form';
import { Debounce, LedgerLinking, agencyType, handleExportWithComponent } from 'utils';
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


	const tableHead = ['JV#', 'Date', 'Cost Center', 'Particular#', 'Type', 'COA Code', 'COA Name', 'Debit (AED)', 'Credit (AED)', 'Description', 'Comments', 'Actions']

	const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);

	const [loader, setLoader] = useState(false);

	const [loader2, setLoader2] = useState(false);
	const navigate = useNavigate();

	// *For General Journal
	const [generalJournalAccounts, setGeneralJournalAccounts] = useState();
	const [generalJournalAccounts2, setGeneralJournalAccounts2] = useState();
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
	const [fromDate, setFromDate] = useState(new Date());
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
				limit: Limit,
				from_date:fromDate ?  moment(fromDate).format('DD/MM/YYYY') : ''
			}
			params = { ...params, ...Filter }
			const { data } = await FinanceServices.getGeneralJournalLedgers(params)
			setGeneralJournalAccounts(data?.statement?.rows)
			setTotalCount(data?.statement?.count)
		} catch (error) {
			ErrorToaster(error)
		} finally {
			setLoader(false)
		}
	}

	const getGeneralJournalLedgers2 = async (page, limit, filter) => {
		// setLoader(true)
		setLoader2(true)
		try {
			const Page = page ? page : currentPage
			const Limit = limit ? limit : pageLimit
			const Filter = { ...filters, ...filter }
			setCurrentPage(Page)
			setPageLimit(Limit)
			setFilters(Filter)
			let params = {
				page: 1,
				limit: 99999,
				search:getValues('search'),
				from_date:fromDate ?  moment(fromDate).format('DD/MM/YYYY') : ''
			}
			params = { ...params, ...Filter }
			const { data } = await FinanceServices.getGeneralJournalLedgers(params)
			setGeneralJournalAccounts2(data?.statement?.rows)

		} catch (error) {
			ErrorToaster(error)
		} finally {
			setLoader2(false)
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
			from_date: '',
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
				return item?.cost_center
					?? "-";

			case 3:
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
			case 4:
				return item?.type?.type_name ?? "-";
			case 5:
				return item?.account?.account_code ?? "-";
			case 6:
				return item?.account?.name ?? "-";
			case 7:
				return parseFloat(item?.debit).toFixed(2) ??
					"0.00";
			case 8:
				return parseFloat(item?.credit).toFixed(2) ?? "0.00";
			case 9:
				return item?.description ?? "-"
					;

			case 10:
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
			case 11:
				return <Box component={'div'} className='pdf-hide'
					sx={{ display: 'flex', gap: 1 }}
					onClick={() => {
						setValue('search', item?.series_id + item?.journal_id);
						handleFilter({ search: item?.journal_id })
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
					{(
						item?.entry?.reference_module === 'payment_voucher' ||
						item?.entry?.reference_module === 'receipt_voucher' ||
						item?.entry?.reference_module === 'journal_voucher' ||
						item?.entry?.reference_module === 'ift_voucher'
					) && (
							<IconButton
								onClick={() => {
									const module = item?.entry?.reference_module;
									let route = '';

									switch (module) {
										case 'payment_voucher':
											route = `/update-payment-voucher/${item?.entry?.reference_id}`;
											break;
										case 'receipt_voucher':
											route = `/update-receipt-voucher/${item?.entry?.reference_id}`;
											break;
										case 'journal_voucher':
											route = `/update-journal-voucher/${item?.entry?.reference_id}`;
											break;
										case 'ift_voucher':
											route = `/update-fund-transfer-voucher/${item?.entry?.reference_id}`;
											break;
										default:
											return;
									}

									window.open(route, '_blank'); // Opens the route in a new tab
								}}
								sx={{
									bgcolor: Colors.primary,
									"&:hover": {
										bgcolor: Colors.primary,
									},
								}}
							>
								<EditOutlinedIcon sx={{ color: 'white', fontSize: '12px !important' }} />
							</IconButton>
						)}


				</Box>;

			default:
				return "-";
		}
	};

	const downloadExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("General Journal Entries");

    // Set professional header and footer
    worksheet.headerFooter.oddHeader =
        '&C&"Arial,Bold"&18GENERAL JOURNAL ENTRIES\n' +
        '&C&"Arial,Regular"&12Your Company Name\n' +
        '&C&"Arial,Regular"&10Period: &D - &T\n' +
        '&L&"Arial,Regular"&8Generated on: ' +
        new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) +
        "\n" +
        '&R&"Arial,Regular"&8Page &P of &N';

    worksheet.headerFooter.oddFooter =
        '&L&"Arial,Regular"&8Confidential - Internal Use Only' +
        '&C&"Arial,Regular"&8This report contains financial data as of ' +
        new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) +
        '&R&"Arial,Regular"&8Generated by: Finance Department\n' +
        '&C&"Arial,Regular"&8Powered by Premium Business Solutions';

    worksheet.headerFooter.evenFooter = worksheet.headerFooter.oddFooter;

    // Set page setup for professional printing
    worksheet.pageSetup = {
        paperSize: 9, // A4
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
            left: 0.7,
            right: 0.7,
            top: 1.0,
            bottom: 1.0,
            header: 0.3,
            footer: 0.5,
        },
    };

    // Add title section at the top of the worksheet
    const titleRow = worksheet.addRow(["GENERAL JOURNAL ENTRIES"]);
    titleRow.getCell(1).font = {
        name: "Arial",
        size: 16,
        bold: true,
        color: { argb: "2F4F4F" },
    };
    titleRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A1:J1");

    const companyRow = worksheet.addRow(["PREMIUM BUSINESSMEN SERVICES"]);
    companyRow.getCell(1).font = {
        name: "Arial",
        size: 14,
        bold: true,
        color: { argb: "4472C4" },
    };
    companyRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A2:J2");

    const dateRow = worksheet.addRow([
        `Report Generated: ${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})} at ${new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}`,
    ]);
    dateRow.getCell(1).font = {
        name: "Arial",
        size: 10,
        italic: true,
        color: { argb: "666666" },
    };
    dateRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A3:J3");

    // Add empty row for spacing
    worksheet.addRow([]);

    // Define headers based on visibleColumns and tableHead
    const tableHead = [
        "Journal ID",
        "Date", 
        "Reference No",
        "Type",
        "Account Code",
        "Account Name",
        "Debit",
        "Credit", 
        "Description",
        "Comment",
        "Actions"
    ];

    // Filter headers to exclude Actions
    const headers = tableHead.filter((item) => item !== "Actions");
    const data = generalJournalAccounts2;

    // Add headers with professional styling
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "2F4F4F" }, // Dark slate gray
        };
        cell.font = {
            name: "Arial",
            bold: true,
            color: { argb: "FFFFFF" },
            size: 11,
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
            top: { style: "thin", color: { argb: "000000" } },
            left: { style: "thin", color: { argb: "000000" } },
            bottom: { style: "thin", color: { argb: "000000" } },
            right: { style: "thin", color: { argb: "000000" } },
        };
    });

    let totalDebit = 0;
    let totalCredit = 0;

    // Add data rows
    generalJournalAccounts2?.forEach((item, index) => {
        const debit = parseFloat(item?.debit || 0);
        const credit = parseFloat(item?.credit || 0);
        totalDebit += debit;
        totalCredit += credit;

        const dataRow = worksheet.addRow([
            item?.journal_id ? item?.series_id + item?.journal_id : "-", // Journal ID
            item?.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "-", // Date
            item?.entry?.reference_no ?? "-", // Reference No
            item?.type?.type_name ?? "-", // Type
            item?.account?.account_code ?? "-", // Account Code
            item?.account?.name ?? "-", // Account Name
            debit.toFixed(2), // Debit
            credit.toFixed(2), // Credit
            item?.description ?? "-", // Description
            item?.comment ?? "-" // Comment
        ]);

        // Style data rows
        dataRow.eachCell((cell, colNumber) => {
            cell.font = { name: "Arial", size: 10 };
            cell.alignment = {
                horizontal: colNumber === 7 || colNumber === 8 ? "right" : "left", // Debit/Credit columns right-aligned
                vertical: "middle",
            };
            cell.border = {
                top: { style: "hair", color: { argb: "CCCCCC" } },
                left: { style: "hair", color: { argb: "CCCCCC" } },
                bottom: { style: "hair", color: { argb: "CCCCCC" } },
                right: { style: "hair", color: { argb: "CCCCCC" } },
            };

            // Format amount columns (Debit and Credit)
            if (colNumber === 7 || colNumber === 8) {
                cell.numFmt = '#,##0.00';
            }

            // Add alternating row colors like your table
            if (index % 2 !== 0) {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "EFF8E7" }, // Light green like your table
                };
            }
        });
    });

    // Add totals row
    const totalRow = worksheet.addRow([
        "Total", "", "", "", "", "", // Empty cells up to Debit column
        totalDebit.toFixed(2), // Total Debit
        totalCredit.toFixed(2), // Total Credit
        "", "" // Empty cells for Description and Comment
    ]);

    // Style totals row
    totalRow.eachCell((cell, colNumber) => {
        if (colNumber === 1 || colNumber === 7 || colNumber === 8) {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "000000" }, // Black
            };
            cell.font = {
                name: "Arial",
                bold: true,
                color: { argb: "FFFFFF" },
                size: 11,
            };
            cell.border = {
                top: { style: "medium", color: { argb: "000000" } },
                left: { style: "medium", color: { argb: "000000" } },
                bottom: { style: "medium", color: { argb: "000000" } },
                right: { style: "medium", color: { argb: "000000" } },
            };

            if (colNumber === 7 || colNumber === 8) {
                cell.numFmt = '#,##0.00';
                cell.alignment = { horizontal: "right", vertical: "middle" };
            } else {
                cell.alignment = { horizontal: "center", vertical: "middle" };
            }
        }
    });

    // Set column widths
    worksheet.columns = [
        { width: 15 }, // Journal ID
        { width: 12 }, // Date
        { width: 15 }, // Reference No
        { width: 15 }, // Type
        { width: 12 }, // Account Code
        { width: 25 }, // Account Name
        { width: 12 }, // Debit
        { width: 12 }, // Credit
        { width: 20 }, // Description
        { width: 15 }, // Comment
    ];

    // Add workbook properties
    workbook.creator = "Finance Department";
    workbook.lastModifiedBy = "Finance System";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    // Set workbook properties
    workbook.properties = {
        title: "General Journal Entries",
        subject: "Financial Report",
        keywords: "general journal, journal entries, financial, accounting",
        category: "Financial Reports",
        description: "General journal entries report generated from accounting system",
        company: "Your Company Name",
    };

    // Add empty rows for spacing before footer
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Add the electronically generated report text with black border
    const reportRow = worksheet.addRow(["This is electronically generated report"]);
    reportRow.getCell(1).font = {
        name: "Arial",
        size: 12,
        bold: false,
        color: { argb: "000000" },
    };
    reportRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    reportRow.getCell(1).border = {
        top: { style: "medium", color: { argb: "000000" } },
        left: { style: "medium", color: { argb: "000000" } },
        bottom: { style: "medium", color: { argb: "000000" } },
        right: { style: "medium", color: { argb: "000000" } },
    };
    worksheet.mergeCells(`A${reportRow.number}:J${reportRow.number}`);

    // Add powered by line
    const poweredByRow = worksheet.addRow(["Powered by : MangotechDevs.ae"]);
    poweredByRow.getCell(1).font = {
        name: "Arial",
        size: 10,
        italic: true,
        color: { argb: "666666" },
    };
    poweredByRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells(`A${poweredByRow.number}:J${poweredByRow.number}`);

    // Add empty row for spacing
    worksheet.addRow([]);

    const download = async () => {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
        });
        saveAs(blob, `General_Journal_Entries_${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '-')}.xlsx`);
    };
    download();
};


	useEffect(() => {
		// getGeneralJournalLedgers2()

		getAccountsDropDown()
		getMajorCategories()
		getSubCategories()
		if (state) {
			setValue('search', state)
			handleFilter({ search: state })
		}
		else {
			getGeneralJournalLedgers()
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
				{generalJournalAccounts?.length > 0 && (
					<Box sx={{
						textAlign: "right", p: 4, display: "flex", gap: 2

					}}>

						<PrimaryButton
							title={"Download Excel"}
							loading={loader2}
							onClick={async () => {
								try {
									await getGeneralJournalLedgers2(); // Wait for this to finish
									downloadExcel(generalJournalAccounts); // Then run this
								} catch (error) {
									console.error("Error getting data:", error);
									// Optionally show a user alert here
								}
							}}

						/>
					</Box>
				)}
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
				{<Box>

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
						(
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
															<Box sx={{ display: 'flex', justifyContent: 'center' }} className={classes.loaderWrap}>
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