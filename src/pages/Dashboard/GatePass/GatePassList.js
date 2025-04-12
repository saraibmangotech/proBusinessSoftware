import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
    Box, CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses,
    FormControl,
    Checkbox,
    Select,
    MenuItem,
    ListItemText,
    InputLabel,
    Tooltip,
    InputAdornment
} from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { CheckIcon, FontFamily, PendingIcon, SearchIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import Pagination from 'components/Pagination';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { Debounce, DownloadFile, formatPermissionData, handleExportWithComponent } from 'utils';
import GatePassServices from 'services/GatePass';
import GatePassApproveRejectStatusDialog from 'components/Dialog/GatePassApproveRejectStatusDialog';
import moment from 'moment';
import SelectField from 'components/Select';
import ImageIcon from '@mui/icons-material/Image';
import SystemServices from 'services/System';
import JSZip from 'jszip';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PrimaryButton } from 'components/Buttons';
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
            justifyContent: 'flex-start',
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

function GatePassList() {

    const classes = useStyles();
    const contentRef = useRef(null);

    const tableHead = ['Date', 'Driver Name', 'Gate Pass Date', 'VIN', 'LOT', 'From Yard', 'To Yard', 'Picture']

    const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);

    const { register } = useForm();

    const [loader, setLoader] = useState(false);

    // *For Vehicle List
    const [vehicleList, setVehicleList] = useState();

    // *For Pass Id
    const [passId, setPassId] = useState();

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    // *For Permissions
    const [permissions, setPermissions] = useState();

    // *For Filters
    const [filters, setFilters] = useState({});
    const [imageDialog, setImageDialog] = useState(false)

    const [imageUrl, setImageUrl] = useState()

    // *For Shipping Yards
    const [galaxyYards, setGalaxyYards] = useState([]);
    const [selectedGalaxyYard, setSelectedGalaxyYard] = useState(null);
    const [selectedToGalaxyYard, setSelectedToGalaxyYard] = useState(null);

    // *For Dialog Box
    const [approveRejectStatusDialog, setApproveRejectStatusDialog] = useState(false);

    // *For Get Galaxy Yards
    const getGalaxyYards = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                search: search
            }
            const { data } = await SystemServices.getGalaxyYards(params)
            setGalaxyYards(data?.yards?.rows)
        } catch (error) {
            ErrorToaster(error)
        }
    }

    function downloadImage(url) {
        const anchor = document.createElement("a");

        anchor.download = url;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    // *For Get Vehicle List
    const getGatePassList = async (page, limit, filter) => {
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
            const { data } = await GatePassServices.getGatePassList(params)
            setVehicleList(data?.passes?.rows)
            setTotalCount(data?.passes?.count)
            setPermissions(formatPermissionData(data?.permissions))
        } catch (error) {
            ErrorToaster(error)
        } finally {
            // setLoader(false)
        }
    }

    //*for Download Zip
    const handleDownloadClick = (pics) => {
        let pictures = [pics]
        console.log(console.log(pictures));
        const zip = new JSZip();
        const downloadPromises = pictures.map((imagePath) =>
            fetch(`${process.env.REACT_APP_IMAGE_BASE_URL}${imagePath}`)
                .then((response) => response.blob())
                .then((data) => {
                    const filename = imagePath.split("/").pop();
                    zip.file(filename, data);
                })
        );

        Promise.all(downloadPromises).then(() => {
            zip.generateAsync({ type: "blob" }).then((blob) => {
                const zipFilename = "images.zip";
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = zipFilename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            });
        });
    };


    // *For Handle Dialog
    const handleDialog = (data) => {
        try {
            if (data?.arrived_galaxy_date === null || data?.arrived_galaxy_date >= moment().format()) {
                ErrorToaster('Vehicle is not arrived yet.')
                return
            }
            if (data?.gate_pass?.is_approved === null) {
                setApproveRejectStatusDialog(true)
                setPassId(data?.gate_pass?.id)
            }
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Approve Reject Status
    const approveStatus = async (status) => {
        try {
            let obj = {
                pass_id: passId,
                approve: status
            }
            const { message } = await GatePassServices.approveStatus(obj)
            SuccessToaster(message)
            getGatePassList()
            setApproveRejectStatusDialog(false)
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Handle Filter
    const handleFilter = (data) => {
        Debounce(() => getGatePassList(1, '', data));
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
            daysRemaining = 0
        }

        switch (colIndex) {
            case 0:
                return moment(item?.created_at).format('MM-DD-YYYY');
            case 1:
                return item?.driver_name ?? '-';

            case 2:
                return item?.gp_date ? moment(item?.created_at).format('MM-DD-YYYY') : '-';
            case 3:
                return (
                    <Box>
                        <Tooltip
                            className='pdf-hide'
                            title={item?.booking?.vin ?? "-"}
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
            case 4:
                return (
                    <Box>
                        <Tooltip
                            className='pdf-hide'
                            title={item?.booking?.lot_number ?? "-"}
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
                                item?.booking?.lot_number?.length > 12
                                    ? item?.booking?.lot_number?.slice(0, 8) + "..." : item?.booking?.lot_number
                            }
                        </Tooltip>
                        <Box
                            component={"div"}
                            className='pdf-show'
                            sx={{ display: "none !important" }}
                        >
                            {item?.booking?.lot_number ?? "-"}
                        </Box>
                    </Box>
                )
            // item?.booking?.lot_number ?? '-';
            case 5:
                return item?.from_yard?.name
            case 6:
                return item?.to_yard?.name
            case 7:
                return <Box component={'div'} className='pdf-hide' onClick={() => {
                    setImageDialog(true)
                    setImageUrl(item?.key_picture)
                }} sx={{ width: '100%', display: 'flex !important', justifyContent: 'center !important' }}>
                    <Box>
                        <ImageIcon sx={{ textAlign: 'center', color: '#0c6135' }} />
                    </Box>
                </Box>

            default:
                return "-";
        }
    };

    const downloadExcel = () => {
        const headers = tableHead.filter((item) => item !== "Picture");
        const rows = vehicleList?.map((item) => {
            const date = moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY');
            const targetDate = moment(date, 'MM-DD-YYYY');
            let daysRemaining = targetDate.diff(moment(), 'days');
            if (daysRemaining < 0) {
                daysRemaining = 0
            }
            return [
                moment(item?.created_at).format('MM-DD-YYYY'),
                item?.driver_name ?? '-',
                item?.gp_date ? moment(item?.created_at).format('MM-DD-YYYY') : '-',
                item?.booking?.vin ?? "-",
                item?.booking?.lot_number ?? "-",
                item?.from_yard?.name,
                item?.to_yard?.name,
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
        getGatePassList()
        getGalaxyYards()
    }, []);

    return (
        <Box sx={{ m: 4, mb: 2 }}>
            {/* ========== VCC Purpose ========== */}
            <SimpleDialog
                open={imageDialog}
                onClose={() => setImageDialog(false)}
                title={"Image"}
            >
                <Box component="form" >
                    <Grid container spacing={2} justifyContent={'center'}>

                        <Box
                            component={"img"}
                            src={
                                process.env.REACT_APP_IMAGE_BASE_URL +
                                imageUrl
                            }
                            sx={{
                                height: 350,
                                width: 400,
                                objectFit: "cover",
                            }}
                        />

                    </Grid>
                </Box>
            </SimpleDialog>

            {/* ========== Approve Reject Dialog ========== */}
            <GatePassApproveRejectStatusDialog open={approveRejectStatusDialog} onClose={() => setApproveRejectStatusDialog(false)} updateStatus={(status) => approveStatus(status)} />
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
                    Internal Gate Pass
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
            <Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px' }}>
                <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <InputField
                            size={'small'}
                            inputStyle={{ backgroundColor: '#f5f5f5' }}
                            label={'Search'}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                            }}
                            placeholder={'Search'}
                            register={register('search', {
                                onChange: (e) => handleFilter({ search: e.target.value })
                            })}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <SelectField
                            size={'small'}

                            onSearch={(v) => getGalaxyYards(v)}
                            label={'From Galaxy Yard'}
                            options={galaxyYards}
                            selected={selectedGalaxyYard}
                            onSelect={(value) => {
                                setSelectedGalaxyYard(value)
                                handleFilter({ from_yard: value?.id, to_yard: selectedToGalaxyYard?.id })
                            }}
                            register={register("galaxyYard")}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <SelectField
                            size={'small'}

                            onSearch={(v) => getGalaxyYards(v)}
                            label={' To Galaxy Yard'}
                            options={galaxyYards}
                            selected={selectedToGalaxyYard}
                            onSelect={(value) => {
                                setSelectedToGalaxyYard(value)
                                handleFilter({ to_yard: value?.id, from_yard: selectedGalaxyYard?.id })
                            }}
                            register={register("galaxyToYard")}
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
                                        fileName="Internal Gate Pass"
                                    >
                                        <Box className='pdf-show' sx={{ display: 'none' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                                    Internal Gate Pass
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
                                                            <Cell
                                                                className='pdf-table'
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
                                        onPageSizeChange={(size) => getGatePassList(1, size.target.value)}
                                        tableCount={vehicleList?.length}
                                        totalCount={totalCount}
                                        onPageChange={(page) => getGatePassList(page, "")}
                                    />

                                </Fragment>
                            )
                        )}


                        {loader && <CircleLoading />}

                    </Box>}





                </Grid>
            </Box>
        </Box >
    );
}

export default GatePassList;