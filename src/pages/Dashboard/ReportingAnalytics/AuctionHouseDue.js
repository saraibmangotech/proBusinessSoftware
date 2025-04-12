import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
    Box, CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, InputLabel,
    FormControl,
    Checkbox,
    Select,
    MenuItem,
    ListItemText,
    Tooltip
} from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, FontFamily, PendingIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import Pagination from 'components/Pagination';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { CommaSeparator, Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
import GatePassReceiveDialog from 'components/Dialog/GatePassReceiveDialog';
import GatePassRefundDialog from 'components/Dialog/GatePassRefundDialog';
import RefundFormDialog from 'components/Dialog/RefundFormDialog';
import VccServices from 'services/Vcc';
import DatePicker from 'components/DatePicker';
import SelectField from 'components/Select';
import AuctionHouseServices from 'services/AuctionHouse';
import BuyerServices from 'services/Buyer';
import { PrimaryButton } from 'components/Buttons';
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
        backgroundColor: Colors.primary,
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

function AuctionHouseDueList() {

    const navigate = useNavigate();
    const classes = useStyles();
    const contentRef = useRef(null);

    const tableHead = ['Customer ID', 'Customer Name', 'Auctioneer', 'Buyer Name', 'VIN', 'LOT', 'Make', 'Modal', 'Color', 'Remaining Due']

    const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);

    const { register } = useForm();

    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);

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

    // *For Dialog Box
    const [receiveStatusDialog, setReceiveStatusDialog] = useState(false);
    const [refundStatusDialog, setRefundStatusDialog] = useState(false);
    const [refundFormDialog, setRefundFormDialog] = useState(false);

    // *For Auction House
    const [auctionHouses, setAuctionHouses] = useState([]);
    const [selectedAuctionHouses, setSelectedAuctionHouses] = useState(null);
    const [filteredBuyerIds, setFilteredBuyerIds] = useState([])

    // *For Buyer ID
    const [buyerIds, setBuyerIds] = useState([]);
    const [selectedBuyerId, setSelectedBuyerId] = useState(null);

    // *For Permissions
    const [permissions, setPermissions] = useState();

    //For Total Remaining Value
    const [totalRemainingDue, setTotalRemainingDue] = useState(0)

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

    // *For Get Auction Houses
    const getAuctionHouses = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                search: search,
            };
            const { data } = await AuctionHouseServices.getAuctionHouses(params);
            setAuctionHouses(data?.auction_houses.rows);
        } catch (error) {
            ErrorToaster(error);
        }
    };
    // *For Get Buyer IDs
    const getBuyerIds = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                search: search
            }
            const { data } = await BuyerServices.getBuyerIds(params)
            setBuyerIds(data?.buyer_ids?.rows)
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Get Vehicle List
    const getAuctionHouseDue = async (page, limit, filter) => {
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
            const { data } = await VccServices.getAuctionHouseDue(params)
            setVehicleList(data?.dues)
            const totalValue = data?.dues.reduce((acc, entry) => acc + parseFloat(entry.remaining_due), 0);
            setTotalRemainingDue(totalValue.toFixed(2))

            setTotalCount(data?.vehicles?.count)
            setPermissions(formatPermissionData(data?.permissions))
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setLoader(false)
        }
    }

    // *For Handle Dialog
    const handleDialog = (data) => {
        try {
            setVehicleDetail(data)
            if (data?.exit_paper_received === null) {
                setReceiveStatusDialog(true)
            }
            // if (data?.exit_paper_received) {
            //   setRefundStatusDialog(true)
            // }
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Receive Exit Paper 
    const receiveMakasa = async () => {
        try {
            let obj = {
                vehicle_id: vehicleDetail?.vehicle_id,
                received: true,
                vcc_id: vehicleDetail?.id,
                vcc_expiry: vehicleDetail?.vcc_expiry_date,
                customer_id: vehicleDetail?.booking?.customer?.id
            }
            const { message } = await VccServices.receiveMakasa(obj)
            SuccessToaster(message)
            getAuctionHouseDue()
            setReceiveStatusDialog(false)
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Refund Exit Paper 
    const refundExitPaper = async (data) => {
        setLoading(true)
        try {
            let obj = {
                vehicle_id: vehicleDetail?.vehicle_id,
                vcc_id: vehicleDetail?.id,
                is_refunded: true,
                make_name: vehicleDetail?.booking?.veh_make?.name,
                model_name: vehicleDetail?.booking?.veh_model?.name,
                color: vehicleDetail?.booking?.color,
                vin: vehicleDetail?.booking?.vin,
                lot_number: vehicleDetail?.booking?.lot_number,
                customer_id: vehicleDetail?.booking?.customer?.id,
                ...data
            }
            const { message } = await VccServices.refundExitPaper(obj)
            SuccessToaster(message)
            getAuctionHouseDue()
            setRefundStatusDialog(false)
            setRefundFormDialog(false)
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setLoading(false)
        }
    }

    // *For Handle Filter
    const handleFilter = (data) => {
        Debounce(() => getAuctionHouseDue(1, '', data));
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
                return item?.booking?.customer?.id ?? '-';
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
                            {item?.booking?.customer?.name?.length > 12
                                ? item?.booking?.customer?.name?.slice(0, 12) + "..."
                                : item?.booking?.customer?.name
                            }
                        </Tooltip>
                        <Box
                            component={"div"}
                            className="pdf-show"
                            sx={{ display: "none !important" }}
                        >
                            {item?.booking?.customer?.name ?? "-"}
                        </Box>
                    </Box>
                )
            //  item?.booking?.customer?.name ?? '-';
            case 2:
                return (
                    <Box>
                        <Tooltip
                            className="pdf-hide"
                            title={item?.booking?.auctioneer ?? "-"}
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
                            {item?.booking?.auctioneer?.length > 12
                                ? item?.booking?.auctioneer?.slice(0, 12) + "..."
                                : item?.booking?.auctioneer
                            }
                        </Tooltip>
                        <Box
                            component={"div"}
                            className="pdf-show"
                            sx={{ display: "none !important" }}
                        >
                            {item?.booking?.auctioneer ?? '-'}
                        </Box>
                    </Box>
                )
            // item?.booking?.auctioneer ?? '-';
            case 3:
                return (
                    <Box>
                        <Tooltip
                            className="pdf-hide"
                            title={item?.booking?.buyer?.name ?? "-"}
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
                            {item?.booking?.buyer?.name?.length > 12
                                ? item?.booking?.buyer?.name?.slice(0, 12) + "..."
                                : item?.booking?.buyer?.name
                            }
                        </Tooltip>
                        <Box
                            component={"div"}
                            className="pdf-show"
                            sx={{ display: "none !important" }}
                        >
                            {item?.booking?.buyer?.name ?? '-'}
                        </Box>
                    </Box>
                )
            // item?.booking?.buyer?.name ?? '-';

            case 4:
                return (
                    <Box>
                        <Tooltip
                            className="pdf-hide"
                            title={copied ? "copied" : item?.booking?.vin ?? "-"}
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
                            onClick={() => copyContent(item?.booking?.vin)}
                        >
                            {item?.booking?.vin?.length > 12
                                ? item?.booking?.vin?.slice(0, 12) + "..."
                                : item?.booking?.vin
                            }
                        </Tooltip>
                        <Box
                            component={"div"}
                            className="pdf-show"
                            sx={{ display: "none !important" }}
                        >
                            {item?.booking?.vin ?? '-'}
                        </Box>
                    </Box>
                )
            // item?.booking?.vin ?? '-';
            case 5:
                return (
                    <Box>
                        <Tooltip
                            className="pdf-hide"
                            title={copied ? "copied" : item?.booking?.lot_number ?? "-"}
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
                            onClick={() => copyContent(item?.booking?.lot_number)}
                        >
                            {item?.booking?.lot_number?.length > 12
                                ? item?.booking?.lot_number?.slice(0, 12) + "..."
                                : item?.booking?.lot_number
                            }
                        </Tooltip>
                        <Box
                            component={"div"}
                            className="pdf-show"
                            sx={{ display: "none !important" }}
                        >
                            {item?.booking?.lot_number ?? '-'}
                        </Box>
                    </Box>
                )
            // item?.booking?.lot_number ?? '-';
            case 6:
                return (
                    <Box>
                        <Tooltip
                            className="pdf-hide"
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
                            {item?.booking?.veh_make?.name?.length > 12
                                ? item?.booking?.veh_make?.name?.slice(0, 12) + "..."
                                : item?.booking?.veh_make?.name
                            }
                        </Tooltip>
                        <Box
                            component={"div"}
                            className="pdf-show"
                            sx={{ display: "none !important" }}
                        >
                            {item?.booking?.veh_make?.name ?? '-'}
                        </Box>
                    </Box>
                )
            // item?.booking?.veh_make?.name ?? '-';
            case 7:
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
                            {item?.booking?.veh_model?.name?.length > 12
                                ? item?.booking?.veh_model?.name?.slice(0, 12) + "..."
                                : item?.booking?.veh_model?.name
                            }
                        </Tooltip>
                        <Box
                            component={"div"}
                            className="pdf-show"
                            sx={{ display: "none !important" }}
                        >
                            {item?.booking?.veh_model?.name ?? '-'}
                        </Box>
                    </Box>
                )
            // item?.booking?.veh_model?.name ?? '-';
            case 8:
                return item?.booking?.color ?? '-';
            case 9:
                return CommaSeparator(parseFloat(item?.remaining_due).toFixed(2)) ?? '-';
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
                item?.booking?.customer?.id ?? '-',
                item?.booking?.customer?.name ?? "-",
                item?.booking?.auctioneer ?? "-",
                item?.booking?.buyer?.name ?? "-",
                item?.booking?.vin ?? "-",
                item?.booking?.lot_number ?? "-",
                item?.booking?.veh_make?.name ?? "-",
                item?.booking?.veh_model?.name,
                item?.booking?.color ?? "-",
                parseFloat(item?.remaining_due).toFixed(2) ?? '-',
            ]
        });

        const totalRow = [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "Total Remaining Due",
            `$ ${totalRemainingDue}`,
        ];

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
        getAuctionHouseDue()
        getAuctionHouses()
        getBuyerIds()
    }, []);

    return (
        <Box sx={{ m: 4, mb: 2 }}>

            {/* ========== Receive Dialog ========== */}
            <GatePassReceiveDialog open={receiveStatusDialog} onClose={() => setReceiveStatusDialog(false)} updateStatus={() => receiveMakasa()} page={'AuctionHouseDueList'} />

            {/* ========== Refund Dialog ========== */}
            <GatePassRefundDialog open={refundStatusDialog} onClose={() => setRefundStatusDialog(false)} updateStatus={() => setRefundFormDialog(true)} />

            {/* ========== Refund Form Dialog ========== */}
            <RefundFormDialog open={refundFormDialog} onClose={() => setRefundFormDialog(false)} loading={loading} depositId={vehicleDetail?.deposit?.id} depositAmount={vehicleDetail?.deposit?.amount} customerId={vehicleDetail?.booking?.customer?.id} onSubmit={(data) => refundExitPaper(data)} />
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
                    Auction House Due Report
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

            {/* Filters */}
            <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} sm={2} >
                    <InputField
                        size={'small'}
                        label={'Search'}
                        placeholder={'Search'}
                        register={register('search', {
                            onChange: (e) => handleFilter({ search: e.target.value })
                        })}
                    />
                </Grid>
                <Grid item xs={12} sm={2.5}>
                    <SelectField
                        size={"small"}
                        onSearch={(v) => getAuctionHouses(v)}
                        label={"Auctions Houses"}
                        options={auctionHouses}
                        selected={selectedAuctionHouses}
                        onSelect={(value) => {
                            setSelectedAuctionHouses(value);


                            setFilteredBuyerIds(buyerIds?.filter(item => item?.auction?.id == value.id))
                            handleFilter({ auction_house: value?.id });
                        }}
                        register={register("auctionHouses")}
                    />
                </Grid>
                <Grid item xs={12} sm={2.5}>
                    <SelectField
                        size='small'
                        onSearch={(v) => getBuyerIds(v)}
                        label={'Buyer ID'}
                        options={filteredBuyerIds}
                        selected={selectedBuyerId}
                        onSelect={(value) => { setSelectedBuyerId(value); handleFilter({ buyer_id: value?.id }) }}
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


                                        if (column !== 'Exit Paper Status' && column !== 'Status') {
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
                                <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                                    fileName="Auction House Due Report"
                                >
                                    <Box className='pdf-show' sx={{ display: 'none' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                                Auction House Due Report
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

                                    {/* ========== Pagination ========== */}
                                    {/* <Pagination
                                    currentPage={currentPage}
                                    pageSize={pageLimit}
                                    onPageSizeChange={(size) => getAuctionHouseDue(1, size.target.value)}
                                    tableCount={vehicleList?.length}
                                    totalCount={totalCount}
                                    onPageChange={(page) => getAuctionHouseDue(page, "")}
                                /> */}
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
                                                    <Typography className="pdf-table"
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 700,
                                                            fontFamily: FontFamily.NunitoRegular,
                                                        }}
                                                    >
                                                        Total Remaining Due
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
                                                        <Typography className="pdf-table"
                                                            variant="body2"
                                                            sx={{ color: Colors.smokeyGrey }}
                                                        >
                                                            $  {CommaSeparator(totalRemainingDue)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </PDFExport>
                            </Fragment>
                        )
                    )}


                    {loader && <CircleLoading />}

                </Box>}





            </Grid>

        </Box >
    );
}

export default AuctionHouseDueList;