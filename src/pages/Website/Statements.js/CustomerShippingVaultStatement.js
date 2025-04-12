import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid, Tooltip } from '@mui/material';
import styled from '@emotion/styled';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster } from 'components/Toaster';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { Debounce, handleExportWithComponent } from 'utils';
import DatePicker from 'components/DatePicker';
import { PrimaryButton } from 'components/Buttons';
import moment from 'moment';
import FinanceServices from 'services/Finance';
import CustomerServices from 'services/Customer';
import SelectField from 'components/Select';
import { CommaSeparator } from 'utils';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import StatementHeader from './Components/StatementHeader';
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

function CustomerShippingVaultStatement() {

    const classes = useStyles();
    const navigate = useNavigate();
    const { id } = useParams();
    let Url = window.location.href

    const { state } = useLocation();
    const contentRef = useRef(null);

    let Balance = 0

    const { register, handleSubmit, getValues } = useForm();

    const tableHead = ['Date', 'JV#', 'Particular#', 'Type', 'Description', 'Comments', 'Debit  (USD)', 'Credit  (USD)', 'Balance  (USD)']

    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);

    const [auth, setAuth] = useState()

    // *For Customer Booking
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [statementData, setStatementData] = useState()

    // *For Account Ledger
    const [accountLedgers, setAccountLedgers] = useState();

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

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


    // *For Get Account Ledger
    const getAccountLedgers = async (page, limit, filter) => {
        setLoading(true)
        const params = new URLSearchParams(window.location.search);

        // Extract the value of the 'auth' parameter
        const authToken = params.get('auth');

        // Now you have the authToken, you can use it as needed
        setAuth(authToken);
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
                auth: authToken ? authToken : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQWRtaW4iLCJlbWFpbCI6ImFkbWluQGdhbGF4eS5jb20iLCJpZCI6MzAyNTYsImZyb21fZGF0ZSI6IjIwMjMtMTItMzFUMTk6MDA6MDAuMDAwWiIsInRvX2RhdGUiOiIyMDI0LTEyLTExVDE5OjAwOjAwLjAwMFoiLCJyZXBvcnQiOnRydWUsInVybCI6Ii9jdXN0b21lci12ZWhpY2xlLXZhdWx0LXN0YXRlbWVudCIsImlhdCI6MTcxMTAwNzM3MiwiZXhwIjoxNzExMDEwMzcyfQ.yH9IwgL-yYhHVuT4mfxrjOZ6khSVewSFCU-z26PwQqU'
            }
            params = { ...params, ...Filter }
            const { data } = await FinanceServices.getAccountLedgersStatement(params)
            setAccountLedgers(data?.statement?.rows)
            setStatementData(data)
            setTotalCount(data?.statement?.count)
        } catch (error) {
            ErrorToaster("Link Is Expired")
        } finally {
            setLoading(false)
        }
    }


    // *For Handle Filter
    const handleFilter = () => {
        let data = {
            auth: auth ? auth : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQWRtaW4iLCJlbWFpbCI6ImFkbWluQGdhbGF4eS5jb20iLCJpZCI6MzAyNTYsImZyb21fZGF0ZSI6IjIwMjMtMTItMzFUMTk6MDA6MDAuMDAwWiIsInRvX2RhdGUiOiIyMDI0LTEyLTExVDE5OjAwOjAwLjAwMFoiLCJyZXBvcnQiOnRydWUsInVybCI6Ii9jdXN0b21lci1zaGlwcGluZy12YXVsdC1zdGF0ZW1lbnQiLCJpYXQiOjE3MTEwMDgzMDAsImV4cCI6MTcxMTAxMTMwMH0.IaIRmV9x6vceJS7Ay-Jcckx7nUbgvtmKWYnt_oqKwwI'
        }
        getAccountLedgers()
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
            const balance = item?.account?.nature === 'credit'
                ? (parseFloat(item?.credit_cur) - parseFloat(item?.debit_cur)).toFixed(2)
                : (parseFloat(item?.debit_cur) - parseFloat(item?.credit_cur)).toFixed(2)
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

        // Create a workbook with a worksheet
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

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


        handleFilter()
    }, []);



    return (
        <>
            <Box sx={{
                textAlign: "right", p: 4, height: "100vh",
                display: 'flex',
                justifyContent: "center", alignItems: "center"
            }}>
                <PrimaryButton
                    title="Download Statement"
                    type="button"
                    style={{ backgroundColor: Colors.bluishCyan }}
                    onClick={() => handleExportWithComponent(contentRef)}
                />
            </Box>
            <Box className={"blur-wrapper"} sx={{ height: '100vh', backgroundColor: '#fff', width: '100%', zIndex: '1111' }} >
                <PDFExport ref={contentRef} landscape={true} paperSize="A4"
                    fileName="Shipping Vault"
                >
                    <StatementHeader data={statementData} />
                    <Box sx={{ m: 4, my: 1 }}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                mr: 4,
                                my: 2,

                            }}
                        >
                            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, fontSize: '20px', textAlign: 'center' }}>
                                Customer  Shipping Vault
                            </Typography>
                            {/* {accountLedgers?.length > 0 && (
                    <PrimaryButton
                        title={"Download Excel"}
                        onClick={() => downloadExcel()}
                    />
                )} */}
                        </Box>

                        {/* Filters */}
                        {/* <Box component={'form'} onSubmit={handleSubmit(handleFilter)}>
                <Grid container spacing={1} >
                    <Grid item xs={12} md={2.5}>
                        <SelectField
                            size={'small'}
                            onSearch={(v) => getVaultDashboard(v)}
                            label={'Select Customer'}
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
            </Box> */}

                        {accountLedgers?.length > 0 ?
                            <Fragment>

                                {/* ========== Table ========== */}
                                <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: '100vh' }}>
                                    <Table stickyHeader sx={{ minWidth: 500 }}>
                                        <TableHead>
                                            <TableRow sx={{ lineHeight: '0 !important', padding: '2px !important' }}>
                                                {tableHead.map((item, index) => (
                                                    <Cell key={index} sx={{ fontSize: '5px !important', lineHeight: '0 !important' }}>{item}</Cell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {!loader ? (
                                                accountLedgers?.length > 0 ? (
                                                    <Fragment>
                                                        {accountLedgers.map((item, index) => {
                                                            const balance = item?.account?.nature === 'credit' ? (parseFloat(item?.credit_cur) - parseFloat(item?.debit_cur)).toFixed(2) : (parseFloat(item?.debit_cur) - parseFloat(item?.credit_cur)).toFixed(2)
                                                            Balance += parseFloat(balance)
                                                            return (
                                                                <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE', fontSizeL: "5px" }}>
                                                                    <Cell sx={{ fontSize: '5px !important', lineHeight: '0 !important' }}>
                                                                        {item?.created_at ? moment(item?.created_at).format('MM-DD-YYYY') : '-'}
                                                                    </Cell>
                                                                    <Cell sx={{ fontSize: '5px !important', lineHeight: '0 !important' }}>
                                                                        {item?.journal_id ? item?.series_id + item?.journal_id : '-'}
                                                                    </Cell>
                                                                    <Cell sx={{ fontSize: '5px !important', lineHeight: '0 !important' }}>
                                                                        {item?.entry?.reference_no ?? '-'}
                                                                    </Cell>
                                                                    <Cell sx={{ fontSize: '5px !important', lineHeight: '0 !important' }}>
                                                                        {item?.type?.type_name ?? '-'}
                                                                    </Cell>
                                                                    <Cell sx={{ fontSize: '5px !important', lineHeight: '0 !important' }}>
                                                                        {item?.description ?? "-"}
                                                                    </Cell>
                                                                    <Cell sx={{ fontSize: '5px !important', lineHeight: '0 !important' }}>
                                                                        {item?.comment ?? "-"}
                                                                    </Cell>
                                                                    <Cell sx={{ fontSize: '5px !important', lineHeight: '0 !important' }}>
                                                                        {CommaSeparator(item?.debit_cur)}

                                                                    </Cell>
                                                                    <Cell sx={{ fontSize: '5px !important', lineHeight: '0 !important' }}>


                                                                        {CommaSeparator(item?.credit_cur)}
                                                                    </Cell>
                                                                    <Cell sx={{ fontSize: '5px !important', lineHeight: '0 !important' }}>

                                                                        {CommaSeparator(Balance)}
                                                                    </Cell>
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



                            </Fragment> : <Box > <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, textAlign: 'center', mt: 15 }}>
                                No Data Found
                            </Typography> </Box>
                        }

                    </Box>
                </PDFExport>
            </Box>
        </>
    );
}

export default CustomerShippingVaultStatement;