import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
    Box, CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, InputLabel,
    FormControl,
    Checkbox,
    Select,
    MenuItem,
    ListItemText,
    Tooltip,
    CardMedia
} from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, FontFamily, Images, InvoiceGlobal, InvoiceLocation, InvoiceMail, InvoicePhone, PendingIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import Pagination from 'components/Pagination';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
import GatePassReceiveDialog from 'components/Dialog/GatePassReceiveDialog';
import GatePassRefundDialog from 'components/Dialog/GatePassRefundDialog';
import RefundFormDialog from 'components/Dialog/RefundFormDialog';
import VccServices from 'services/Vcc';
import DatePicker from 'components/DatePicker';
import SelectField from 'components/Select';
import { PrimaryButton } from 'components/Buttons';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from '@progress/kendo-react-pdf';
import StatementHeader from './Components/StatementHeader';

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

function VatUnDueStatement() {

    const navigate = useNavigate();
    const classes = useStyles();
    const contentRef = useRef(null);
    let Url = window.location.href


    const tableHead = ['Customer ID', 'Customer Name', 'VIN', 'LOT', 'Make', 'Modal', 'Color', 'Status', 'VAT']

    const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);

    const { register } = useForm();

    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);
    const [auth, setAuth] = useState()

    // *For Vehicle List
    const [vehicleList, setVehicleList] = useState();
    const [vehicleDetail, setVehicleDetail] = useState();

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    // *For Filters
    const [filters, setFilters] = useState({});
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [selectedStatus, setSelectedStatus] = useState(null)
    const [statementData, setStatementData] = useState()

    const [originalVehicle, setOriginalVehicle] = useState([])

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



    // *For Permissions
    const [permissions, setPermissions] = useState();

    //For Total
    const [totalValue, setTotalValue] = useState(0)

    // *For Handle Date
    const handleFromDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == 'Invalid Date') {
                setFromDate('invalid')
                return
            }
            setFromDate(new Date(newDate))
            handleFilter({ fromDate: moment(new Date(newDate)).format('MM-DD-YYYY') })
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
            handleFilter({ toDate: moment(new Date(newDate)).format('MM-DD-YYYY') })
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Get Vehicle List
    const getVatDue = async (page, limit, filter) => {
        setLoader(true)
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
                auth: authToken ? authToken : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQWRtaW4iLCJlbWFpbCI6ImFkbWluQGdhbGF4eS5jb20iLCJpZCI6MzAyNTYsImZyb21fZGF0ZSI6IjIwMjMtMTItMzFUMTk6MDA6MDAuMDAwWiIsInRvX2RhdGUiOiIyMDI0LTEyLTExVDE5OjAwOjAwLjAwMFoiLCJyZXBvcnQiOnRydWUsInVybCI6Ii9wYWlkLXZlaGljbGUtc29hLXN0YXRlbWVudCIsImlhdCI6MTcxMTAxMTYzNiwiZXhwIjoxNzExMDE0NjM2fQ.CF6ympVCYHNlQO6l-n0bNFyk0mFdY6dhWiiHDW5KOJU'
            }
            params = { ...params, ...Filter }
            const { data } = await VccServices.getVatUnDueStatement(params)
            setVehicleList(data?.dues)
            setStatementData(data)
            setOriginalVehicle(data?.dues)
            const totalValue = data?.dues.reduce((acc, entry) => acc + parseFloat(entry.vcc?.vat_charges_aed ? entry.vcc?.vat_charges_aed : 0), 0);
            setTotalValue(totalValue.toFixed(2))

            setTotalCount(data?.vehicles?.count)

        } catch (error) {
            ErrorToaster("Link Is Expired")
        } finally {
            setLoader(false)
        }
    }

    // *For Handle Filter
    const handleFilter = (value) => {

        if (value) {
            const result = originalVehicle.filter(item => {
                const idMatches = item?.customer?.id && item.customer.id.toString().includes(value);
                const nameMatches = item?.customer?.name && item.customer.name.toLowerCase().includes(value.toLowerCase());
                const vinMatches = item?.vin && item.vin.toLowerCase().includes(value.toLowerCase());
                const lotMatches = item?.lot_number && item.lot_number.toLowerCase().includes(value.toLowerCase());
                const makeMatches = item?.veh_make?.name && item.veh_make.name.toLowerCase().includes(value.toLowerCase());
                const modelMatches = item?.veh_model?.name && item.veh_model.name.toLowerCase().includes(value.toLowerCase());
                const colorMatches = item?.color && item.color.toLowerCase().includes(value.toLowerCase());

                return nameMatches || idMatches || vinMatches || lotMatches || makeMatches || modelMatches || colorMatches;
            });
            const totalValue = result.reduce((acc, entry) => acc + parseFloat(entry.value), 0);
            setTotalValue(totalValue.toFixed(2))
            setVehicleList(result)

        }
        else {
            setVehicleList(originalVehicle)
            const totalValue = originalVehicle.reduce((acc, entry) => acc + parseFloat(entry.value), 0);
            setTotalValue(totalValue.toFixed(2))
        }

    }

    const handleColumnChange = (event) => {
        const selectedColumns = event.target.value;
        // Sort the selected columns to maintain the correct order
        const sortedColumns = selectedColumns.sort((a, b) => a - b);
        setVisibleColumns(sortedColumns);
    };

    const renderCellContent = (colIndex, item, isActive,) => {

        const date = moment(item?.vcc_expiry_date).format('MM-DD-YYYY');
        const targetDate = moment(date, 'MM-DD-YYYY');
        let daysRemaining = targetDate.diff(moment(), 'days');
        if (daysRemaining < 0) {
            daysRemaining = 0
        }

        switch (colIndex) {
            case 0:
                return item?.customer_id ?? '-';
            case 1:
                return item?.customer?.name ?? "-";
            // item?.customer?.name ?? '-';
            case 2:
                return item?.vin;
            // item?.vin ?? '-';
            case 3:
                return (
                    <Tooltip
                        title={copied ? "copied" : item?.lot_number ?? "-"}
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
                        onClick={() => copyContent(item?.lot_number)}
                    >
                        {item?.lot_number?.length > 12
                            ? item?.lot_number?.slice(0, 12) + "..."
                            : item?.lot_number
                        }
                    </Tooltip>
                )
            // item?.lot_number ?? '-';
            case 4:
                return (
                    <Tooltip
                        title={item?.veh_make?.name ?? "-"}
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
                        {item?.veh_make?.name?.length > 12
                            ? item?.veh_make?.name?.slice(0, 12) + "..."
                            : item?.veh_make?.name
                        }
                    </Tooltip>
                )
            // item?.veh_make?.name ?? '-';
            case 5:
                return (
                    <Tooltip
                        title={item?.veh_model?.name ?? "-"}
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
                        {item?.veh_model?.name?.length > 12
                            ? item?.veh_model?.name?.slice(0, 12) + "..."
                            : item?.veh_model?.name
                        }
                    </Tooltip>
                )
            // item?.veh_model?.name ?? '-';
            case 6:
                return item?.color ?? '-';
            case 7:
                return item?.vcc?.custom_vat_paid ? 'Paid' : 'UnPaid' ?? '-';
            case 8:
                return item?.vcc?.vat_charges_aed ? parseFloat(item?.vcc?.vat_charges_aed).toFixed(2) : parseFloat(0).toFixed(2) ?? '-';
            default:
                return "-";
        }
    };

    const downloadExcel = () => {
        // Define headers and data separately
        const headers = tableHead;
        const data = vehicleList;

        // Extract values from objects and create an array for each row
        const rows = data.map((item, index) => {
            const date = moment(item?.vcc_expiry_date).format('MM-DD-YYYY');
            const targetDate = moment(date, 'MM-DD-YYYY');
            let daysRemaining = targetDate.diff(moment(), 'days');
            if (daysRemaining < 0) {
                daysRemaining = 0
            }
            return [
                item?.customer_id,
                item?.customer?.name,
                item?.vin ?? "-",
                item?.lot_number ?? "-",
                item?.veh_make?.name ?? "-",
                item?.veh_model?.name ?? "-",
                item?.color ?? '-',
                parseFloat(item?.value).toFixed(2) ?? '-',
            ]
        });

        const totalRow = [
            "",
            "",
            "",
            "",
            "",
            "",
            "Total VAT",
            totalValue,
        ]

        // Create a workbook with a worksheet
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRow]);

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
        getVatDue()
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
                    fileName="Undue VAT"
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
                                VAT UnDue Report
                            </Typography>
                            {/* {vehicleList?.length > 0 && (
                    <PrimaryButton
                        title={"Download Excel"}
                        onClick={() => downloadExcel()}
                    />
                )} */}
                        </Box>

                        {/* Filters */}
                        <Grid container spacing={1} alignItems="center">
                            {/* <Grid item xs={12} sm={3} >
                    <InputField
                        size={'small'}
                        label={'Search'}
                        placeholder={'Search'}
                        register={register('search', {
                            onChange: (e) => handleFilter(e.target.value)
                        })}
                    />
                </Grid> */}

                            {/* <Grid item xs={12} sm={2.5}>
          <DatePicker
            size='small'
            disableFuture={true}
            label={'From Date'}
            maxDate={toDate}
            value={fromDate}
            onChange={(date) => handleFromDate(date)}
          />
        </Grid>
        <Grid item xs={12} sm={2.5}>
          <DatePicker
            size='small'
            disableFuture={true}
            minDate={fromDate}
            label={'To Date'}
            value={toDate}
            onChange={(date) => handleToDate(date)}
          />
        </Grid> 
        {/* <Grid item xs={12} sm={2.5}     sx={{mt:1}}>
        <SelectField
            size={"small"}
            label={"Issued"}
            options={[{id:true,name:'Issued'},{id:false,name:'Not Issued'}]}
            selected={selectedStatus}
            onSelect={(value) => {
              setSelectedStatus(value);

       
              handleFilter({ issued: value?.id });
            }}
        
            register={register("Account")}
          />
        </Grid> */}
                        </Grid>



                        <Grid item md={11}>
                            {vehicleList?.length > 0 ? <Box>



                                {(
                                    vehicleList && (
                                        <Fragment>
                                            <TableContainer
                                                component={Paper}
                                                sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }}
                                            >
                                                <Table stickyHeader sx={{ minWidth: 500 }}>
                                                    {/* Table Header */}
                                                    <TableHead >
                                                        <TableRow sx={{ lineHeight: '0 !important', padding: '2px !important' }} >
                                                            {visibleColumns.map((index) => (
                                                                <Cell
                                                                    key={index}
                                                                    sx={{ fontSize: '7px !important', lineHeight: '0 !important' }}
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
                                                                                key={rowIndex}
                                                                                sx={{ bgcolor: rowIndex % 2 !== 0 && "#EFF8E7" }}
                                                                            >
                                                                                {visibleColumns.map((colIndex) => (
                                                                                    <>
                                                                                        <Cell key={colIndex} sx={{ fontSize: '7px !important' }}>
                                                                                            {renderCellContent(colIndex, item, isActive,)}
                                                                                        </Cell>

                                                                                    </>
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
                                                                    fontSize: '7px'
                                                                }}
                                                            >
                                                                Total VAT
                                                            </Typography>
                                                            <Box
                                                                sx={{
                                                                    textAlign: "center",
                                                                    p: 1,
                                                                    width: "80px",

                                                                    bgcolor: Colors.flashWhite,
                                                                    border: "1px solid #B2B5BA",
                                                                    borderRadius: "4px",
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{ color: Colors.smokeyGrey, fontSize: '7px' }}
                                                                >
                                                                    {totalValue}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Box>

                                            {/* ========== Pagination ========== */}
                                            {/* <Pagination
                  currentPage={currentPage}
                  pageSize={pageLimit}
                  onPageSizeChange={(size) => getVatDue(1, size.target.value)}
                  tableCount={vehicleList?.length}
                  totalCount={totalCount}
                  onPageChange={(page) => getVatDue(page, "")}
                /> */}

                                        </Fragment>
                                    )
                                )}




                            </Box> : <Box > <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, textAlign: 'center', mt: 15 }}>
                                No Data Found
                            </Typography> </Box>}





                        </Grid>

                    </Box >
                </PDFExport>
            </Box>
        </>
    );
}

export default VatUnDueStatement;