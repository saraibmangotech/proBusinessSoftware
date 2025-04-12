import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid, Tooltip } from '@mui/material';
import styled from '@emotion/styled';
import { EyeIcon, FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster } from 'components/Toaster';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { CommaSeparator, Debounce, LedgerLinking, handleExportWithComponent } from 'utils';
import DatePicker from 'components/DatePicker';
import { PrimaryButton } from 'components/Buttons';
import moment from 'moment';
import FinanceServices from 'services/Finance';
import CustomerServices from 'services/Customer';
import SelectField from 'components/Select';
import ClientServices from 'services/Client';
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
        padding: '15px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        backgroundColor: Colors.primary,
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

function CustomerShippingLedger() {

    const classes = useStyles();
    const navigate = useNavigate();
    const { id } = useParams();
    const { state } = useLocation();
    const contentRef = useRef(null);

    let Balance = 0

    const { register, handleSubmit, getValues, setValue } = useForm();

    const tableHead = ['Date', 'JV#', 'Particular#', 'Type', 'Description', 'Comments', 'Debit  (USD)', 'Credit  (USD)', 'Balance  (USD)', 'Action']

    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);

    // *For Customer Booking
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    //for Opening Balance
    const [openingBalance, setOpeningBalance] = useState(0)

    const [ledgerCustomers, setLedgerCustomers] = useState([])

    // *For Account Ledger
    const [accountLedgers, setAccountLedgers] = useState();

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    // *For Filters
    const [filters, setFilters] = useState({});

    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();

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


    // *For Get Account Ledger
    const getAccountLedgers = async (page, limit, filter) => {
        setLoading(true)
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
                account_id: id
            }
            params = { ...params, ...Filter }
            const { data } = await FinanceServices.getAccountLedgers(params)
            setAccountLedgers(data?.statement?.rows)
            setOpeningBalance(data?.statement?.opening_balance)
            setTotalCount(data?.statement?.count)
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setLoading(false)
        }
    }

    // *For Get Vault Dashboard
    const getVaultDashboard = async (search) => {
        setLoader(true)
        try {
            let params = {
                page: 1,
                limit: 50,
                search: search,

            }

            const { data } = await ClientServices.getClientDropdown(params)
            console.log(data);
            setCustomers(data?.customers?.rows)
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false)
        }
    };
    // *For Get Vault Dashboard
    const getVaultDashboardCustomers = async (page, limit, filter) => {
        setLoader(true)
        try {


            const { data } = await FinanceServices.getVehicleSumLedger()
            console.log(data);
            setLedgerCustomers(data?.detail?.rows)
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false)
        }
    };

    // *For Handle Filter
    const handleFilter = () => {

        let foundData = ledgerCustomers?.find(account => account?.id == selectedCustomer?.id)
        console.log(foundData);

        let data = {
            from_date: fromDate ? moment(new Date(fromDate)).format('MM-DD-YYYY') : '',
            to_date: toDate ? moment(new Date(toDate)).format('MM-DD-YYYY') : '',
            account_id: foundData?.accounts.find(account => account.type_code === 'A2' && account.primary_series === 20003).id,
            search: getValues('search')
        }
        getAccountLedgers(1, '', data)
        // Debounce(() => getAccountLedgers(1, '', data));
    }

    const handleFilterSearch = (data) => {
        Debounce(() => getAccountLedgers(1, '', data));
    }

    const downloadExcel = () => {
        // Define headers and data separately
        const headers = tableHead;
        const data = accountLedgers;

        // Extract values from objects and create an array for each row
        const rows = data.map((item, index) => {
            let page = LedgerLinking(item?.entry?.reference_module)
            const balance = item?.account?.nature === 'credit' ? (parseFloat(item?.credit_cur) - parseFloat(item?.debit_cur)).toFixed(2) : (parseFloat(item?.debit_cur) - parseFloat(item?.credit_cur)).toFixed(2)
            Balance += parseFloat(balance)
            return [
                item?.created_at ? moment(item?.created_at).format('MM-DD-YYYY') : '-',
                item?.journal_id ? item?.series_id + item?.journal_id : '-',
                item?.entry?.reference_no ?? '-',
                item?.type?.type_name ?? '-',
                item?.description ?? '-',
                item?.comment ?? "-",
                parseFloat(item?.debit_cur).toFixed(2),
                parseFloat(item?.credit_cur).toFixed(2),
                Balance?.toFixed(2)
            ]
        });

        const totalRows = [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "Opening Balance",
            `$ ${parseFloat(openingBalance).toFixed(2)}`,
        ]

        // Create a workbook with a worksheet
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRows]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Convert the workbook to an array buffer
        const buf = XLSX.write(wb, {
            bookType: "xlsx",
            type: "array",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Save the file using FileSaver.js
        saveAs(new Blob([buf]), "data.xlsx");
    };

    useEffect(() => {
        // getAccountLedgers()
        getVaultDashboardCustomers()
        getVaultDashboard()
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
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, }}>
                    {state?.accountName} Customer Shipping Ledger
                </Typography>
                {accountLedgers?.length > 0 && (
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
            <Box component={'form'} onSubmit={handleSubmit(handleFilter)}>
                <Grid container spacing={1} >
                    <Grid item xs={12} md={2.5}>
                        <SelectField
                            size={'small'}
                            label={'Select Customer'}
                            onSearch={(v) => getVaultDashboard(v)}
                            options={customers}
                            selected={selectedCustomer}
                            onSelect={(value) => { setSelectedCustomer(value) }}
                            register={register("customer")}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.5}>
                        <InputField
                            size={'small'}
                            label={'Search'}
                            placeholder={'Search'}
                            register={register('search')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.5}>
                        <DatePicker
                            disableFuture={true}
                            size='small'
                            label={'From Date'}
                            value={fromDate}
                            onChange={(date) => handleFromDate(date)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.5}>
                        <DatePicker
                            disableFuture={true}
                            size='small'
                            minDate={fromDate}
                            label={'To Date'}
                            value={toDate}
                            onChange={(date) => handleToDate(date)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2} sx={{ mt: 3.5 }}>
                        <PrimaryButton
                            title="Search"
                            type='submit'
                            loading={loading}
                        />
                    </Grid>
                </Grid>
            </Box>

            {accountLedgers &&
                <Fragment>
                    <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                        fileName="Customer Shipping Ledger"
                    >
                        <Box className='pdf-show' sx={{ display: 'none' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                    Customer Shipping Ledger
                                </Typography>
                                <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                            </Box>
                        </Box>
                        {/* ========== Table ========== */}
                        <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }} className='table- box'>
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
                                        accountLedgers?.length > 0 ? (
                                            <Fragment>
                                                {accountLedgers.map((item, index) => {
                                                    let page = LedgerLinking(item?.entry?.reference_module)
                                                    const balance = item?.account?.nature === 'credit' ? (parseFloat(item?.credit_cur) - parseFloat(item?.debit_cur)).toFixed(2) : (parseFloat(item?.debit_cur) - parseFloat(item?.credit_cur)).toFixed(2)
                                                    Balance += parseFloat(balance)
                                                    return (
                                                        <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                                                            <Cell className="pdf-table">
                                                                {item?.created_at ? moment(item?.created_at).format('MM-DD-YYYY') : '-'}
                                                            </Cell>
                                                            <Cell className="pdf-table">
                                                                {item?.journal_id ? item?.series_id + item?.journal_id : '-'}
                                                            </Cell>
                                                            <Cell className="pdf-table">
                                                                {item?.entry?.reference_no ?? '-'}
                                                            </Cell>
                                                            <Cell className="pdf-table">
                                                                {item?.type?.type_name ?? '-'}
                                                            </Cell>
                                                            <Cell className="pdf-table">
                                                                <Tooltip
                                                                    className="pdf-hide"
                                                                    title={item?.description}
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
                                                                    {item?.description?.length > 20
                                                                        ? item?.description?.slice(0, 20) +
                                                                        "..."
                                                                        : item?.description}{" "}
                                                                </Tooltip>
                                                                <Box
                                                                    component={"div"}
                                                                    className="pdf-show"
                                                                    sx={{ display: "none !important" }}
                                                                >
                                                                    {item?.description}
                                                                </Box>
                                                            </Cell>
                                                            <Cell className="pdf-table">
                                                                <Tooltip
                                                                    className='pdf-hide'
                                                                    title={item?.comment}
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
                                                                    {item?.comment?.length > 20 ? item?.comment?.slice(0, 20) + "..." : item?.comment ?? "-"}
                                                                </Tooltip>
                                                                <Box
                                                                    component={"div"}
                                                                    className="pdf-show"
                                                                    sx={{ display: "none !important" }}
                                                                >
                                                                    {item?.comment}
                                                                </Box>
                                                            </Cell>
                                                            <Cell className="pdf-table">
                                                                {CommaSeparator(parseFloat(item?.debit_cur).toFixed(2))}
                                                            </Cell>
                                                            <Cell className="pdf-table">
                                                                {CommaSeparator(parseFloat(item?.credit_cur).toFixed(2))}
                                                            </Cell>
                                                            <Cell className="pdf-table">
                                                                {CommaSeparator(Balance?.toFixed(2))}
                                                            </Cell>
                                                            <Cell><Box component={'div'} className='pdf-hide'
                                                                onClick={page ? () =>
                                                                    navigate(`/${page}/${item?.entry?.reference_id}`)
                                                                    : () => {
                                                                        navigate(`/general-journal-ledger`, { state: item?.series_id + item?.journal_id })
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

                                                            </Box></Cell>

                                                        </Row>
                                                    )
                                                })}
                                            </Fragment>
                                        ) : (
                                            <Row>
                                                <Cell colSpan={tableHead.length + 1} align="center" sx={{ fontWeight: 600 }}>
                                                    No Data Found
                                                </Cell>
                                            </Row>
                                        )) : (
                                        <Row>
                                            <Cell colSpan={tableHead.length + 2} align="center" sx={{ fontWeight: 600 }}>
                                                <Box className={classes.loaderWrap}>
                                                    <CircularProgress />
                                                </Box>
                                            </Cell>
                                        </Row>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{ py: 1, bgcolor: Colors.whiteSmoke }}>
                            <Grid container spacing={1} justifyContent={"flex-end"}>


                                <Grid item xs={12} sm={3}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: "10px",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 700,
                                                fontFamily: FontFamily.NunitoRegular,
                                            }}
                                        >
                                            Opening Balance
                                        </Typography>
                                        <Box
                                            sx={{
                                                textAlign: "center",
                                                p: 1,
                                                width: "130px",
                                                bgcolor: Colors.flashWhite,
                                                border: "1px solid #B2B5BA",
                                                borderRadius: "4px",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{ color: Colors.smokeyGrey }}
                                            >
                                                {CommaSeparator(parseFloat(openingBalance).toFixed(2))}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </PDFExport>
                    {/* ========== Pagination ========== */}
                    <Pagination
                        currentPage={currentPage}
                        pageSize={pageLimit}
                        onPageSizeChange={(size) => getAccountLedgers(1, size.target.value)}
                        tableCount={accountLedgers?.length}
                        totalCount={totalCount}
                        onPageChange={(page) => getAccountLedgers(page, '')}
                    />

                </Fragment>
            }

        </Box>
    );
}

export default CustomerShippingLedger;