import React, { Fragment, useEffect, useState } from 'react';
import {
    Box, CircularProgress, Dialog, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, InputLabel,
    FormControl,
    Select,
    MenuItem,
    ListItemText,
    Checkbox,
    Tooltip,
} from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, FontFamily, } from 'assets';
import Colors from 'assets/Style/Colors';
import VehicleBookingServices from 'services/VehicleBooking';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import { CancelOutlined, Edit } from '@mui/icons-material';
import Pagination from 'components/Pagination';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { Debounce, formatPermissionData, getYearMonthDateFormate } from 'utils';
import SelectField from 'components/Select';
import SystemServices from 'services/System';
import { addPermission } from "redux/slices/navigationDataSlice";
import { useDispatch } from "react-redux";
import DatePicker from 'components/DatePicker';
import PersonIcon from '@mui/icons-material/Person';
import moment from 'moment';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import CustomerServices from 'services/Customer';
import { useAuth } from 'context/UseContext';
import LockIcon from '@mui/icons-material/Lock';

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

function MyVehicles() {

    const navigate = useNavigate();
    const classes = useStyles();
    const { user, userLogout } = useAuth();
    const dispatch = useDispatch();

    const tableHead = ['Vehicle ID', 'Customer ID', 'Buy Date', 'Customer Name', 'Buyer', 'Lot', 'VIN', 'Make', 'Model', 'Value', 'Other Charges', 'Assigned To', 'Actions']

    const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);
    const [customerLoading, setCustomerLoading] = useState(false)

    const { register, handleSubmit, setValue } = useForm();
    const {
        register: register3,
        handleSubmit: handleSubmit3,
        formState: { errors: errors3 },
        reset: reset3,
    } = useForm();
    const {
        register: register4,
        handleSubmit: handleSubmit4,
        formState: { errors: errors4 },
        reset: reset4,
    } = useForm();
    const { register: register2 } = useForm();
    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);
    const [permissionData, setPermissionData] = useState()


    // *For Vehicle Bookings
    const [vehicleBookings, setVehicleBookings] = useState();


    const [customerList, setCustomerList] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    // *For Booking Customer
    const [bookingCustomers, setBookingCustomers] = useState([]);
    const [selectedBookingCustomer, setSelectedBookingCustomer] = useState(null);

    // *For Make
    const [makes, setMakes] = useState([]);
    const [selectedMake, setSelectedMake] = useState(null);

    const [bookingId, setBookingId] = useState()

    // *For Models
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [customerDialog, setcustomerDialog] = useState(false)

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    const [permissionDialog, setPermissionDialog] = useState(false)

    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Dialog Box
    const [updateFieldDialog, setUpdateFieldDialog] = useState(false);

    // *For Missing Fields
    const [missingFields, setMissingFields] = useState([])

    // *For Permissions
    const [permissions, setPermissions] = useState();
    const [vcc, setVcc] = useState(false)
    const [vehicleInvoice, setVehicleInvoice] = useState(false)
    const [shippingInvoice, setShippingInvoice] = useState(false)

    // *For Get Booking Customer
    const getBookingCustomers = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                search: search
            }
            const { data } = await VehicleBookingServices.getBookingCustomers(params)
            setBookingCustomers(data?.filters.map((item) => { return { id: item?.customer_id, name: item?.customer_name } }))
        } catch (error) {
            ErrorToaster(error)
        }
    }
    // *For Issue Vcc
    const SelectCustomer = async (formData) => {
        console.log('sdasdasda');
        setCustomerLoading(true)
        try {
            let obj = {
                booking_id: bookingId,
                assigned_to: selectedCustomer ? selectedCustomer?.id : null //sub customer id

            }

            const { message } = await CustomerServices.SelectCustomer(obj)
            SuccessToaster(message)
            getVehicleBookings()
            setcustomerDialog(false)

            // window.location.reload()
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setCustomerLoading(false)

        }
    }

    // *For Issue Vcc
    const ApplyPermissions = async (formData) => {
      
        setCustomerLoading(true)
        try {
            let obj = {
                booking_id: bookingId,
                vcc: vcc,
                vehicle_invoice: vehicleInvoice,
                shipping_invoice: shippingInvoice
            }


            const { message } = await SystemServices.ApplyPermissions(obj)
            SuccessToaster(message)
            getVehicleBookings()
            setPermissionDialog(false)

            // window.location.reload()
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setCustomerLoading(false)

        }
    }
    // *For Get Makes
    const getSubCustomerPermissions = async (id) => {
        try {
            let params = {
                booking_id: id,

            }
            const { data } = await SystemServices.getSubCustomerPermissions(params)
            console.log(data?.permissions);
            if(data?.permissions){
                setVcc(data?.permissions?.vcc)
                setVehicleInvoice(data?.permissions?.vehicle_invoice)
                setShippingInvoice(data?.permissions?.shipping_invoice)
                setPermissionData(data?.permissions)
                setPermissionDialog(true)
            }
            else{
                setVcc(false)
                setVehicleInvoice(false)
                setShippingInvoice(false)
                setPermissionData(data?.permissions)
                setPermissionDialog(true)
            }
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Get Makes
    const getMakes = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                search: search
            }
            const { data } = await SystemServices.getMakes(params)
            setMakes(data?.makes?.rows)
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Get Colors
    const getModels = async (id, search) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                make_id: id,
                search: search
            }
            const { data } = await SystemServices.getModels(params)
            setModels(data?.models?.rows)
        } catch (error) {
            ErrorToaster(error)
        }
    }
    // *For Get Vcc Vehicle List
    const getSubCustomerList = async (page, limit, filter) => {
        setLoader(true);
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
            console.log(params);
            const { data } = await CustomerServices.getSubCustomerList(params);
            setCustomerList(data?.users?.rows);

        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false);
        }
    };
    // *For Get Vehicle Bookings
    const getVehicleBookings = async (page, limit, filter) => {
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
                customer_id: user?.id
            }
            params = { ...params, ...Filter }
            const { data } = await VehicleBookingServices.getVehicleBookings(params)
            setVehicleBookings(data?.bookings?.rows)
            setTotalCount(data?.bookings?.count)
            setPermissions(formatPermissionData(data?.permissions));
            data?.permissions.forEach((e) => {
                if (e?.route && e?.identifier && e?.permitted) {
                    dispatch(addPermission(e?.route));
                }
            });
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setLoader(false)
        }
    }

    // *For Get Missing Fields
    const getMissingFields = async (id) => {
        try {
            let params = {
                booking_id: id
            }
            const { data } = await VehicleBookingServices.getMissingFields(params)
            setMissingFields(data?.values)
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Update Vehicle Booking Missing Fields
    const updateMissingFieldVehicleBooking = async (formData) => {
        setLoading(true)
        try {
            let obj = {
                booking_id: bookingId,
                ...formData
            }
            const { message } = await VehicleBookingServices.updateMissingFieldVehicleBooking(obj)
            SuccessToaster(message)
            setUpdateFieldDialog(false)
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setLoading(false)
        }
    }

    // *For Handle Filter
    const handleFilter = (data) => {
        Debounce(() => getVehicleBookings(1, '', data));
    }

    const handleColumnChange = (event) => {
        const selectedColumns = event.target.value;
        // Sort the selected columns to maintain the correct order
        const sortedColumns = selectedColumns.sort((a, b) => a - b);
        setVisibleColumns(sortedColumns);
    };

    const renderCellContent = (colIndex, item, isActive,) => {
        switch (colIndex) {
            case 0:
                return item?.id ? 'GBR-' + item?.id ?? "" : "-";
            case 1:
                return item?.customer?.id ?? '-';
            case 2:
                return item?.purchase_date ? moment(item?.purchase_date).format('DD-MMM-YYYY') : '-';
            case 3:
                return (
                    <Tooltip
                        title={item?.customer?.name ?? '-'}
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
                        {item?.customer?.name?.length > 15 ? item?.customer?.name?.slice(0, 10) + "..." : item?.customer?.name}
                    </Tooltip>
                )
            // item?.customer?.name ?? '-';
            case 4:
                return item?.buyer?.name ?? '-';
            case 5:
                return (
                    <Tooltip
                        title={item?.lot_number ?? '-'}
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
                        {item?.lot_number?.length > 12 ? item?.lot_number?.slice(0, 8) + "..." : item?.lot_number}
                    </Tooltip>
                )
            // item?.lot_number ?? '-';
            case 6:
                return (
                    <Tooltip
                        title={item?.vin ?? '-'}
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
                        {item?.vin?.length > 12 ? item?.vin?.slice(0, 8) + "..." : item?.vin}
                    </Tooltip>
                )
            // item?.vin ?? '-';
            case 7:
                return (
                    <Tooltip
                        title={item?.veh_make?.name ?? '-'}
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
                        {item?.veh_make?.name?.length > 12 ? item?.veh_make?.name?.slice(0, 8) + "..." : item?.veh_make?.name}
                    </Tooltip>
                )
            // item?.veh_make?.name ?? '-';
            case 8:
                return (
                    <Tooltip
                        title={item?.veh_model?.name ?? '-'}
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
                        {item?.veh_model?.name?.length > 12 ? item?.veh_model?.name?.slice(0, 8) + "..." : item?.veh_model?.name}
                    </Tooltip>
                )
            // item?.veh_model?.name ?? '-';
            case 9:
                return parseFloat(item?.value).toFixed(2) ?? '-';
            case 10:
                return parseFloat(item?.other_charges).toFixed(2) ?? '-';
            case 11:
                return item?.assigned?.name ?? '-';
            case 12:
                return <Box sx={{ gap: '16px !important' }}>
                    {true &&
                        <Box onClick={() => navigate(`/vehicle-booking-detail/${item.id}`)}>
                            <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                                <EyeIcon />
                            </IconButton>
                            <Typography variant="body2">
                                Detail View
                            </Typography>
                        </Box>
                    }

                    {true &&
                        <Box onClick={() => {
                            setcustomerDialog(true)
                            setSelectedCustomer(item?.assigned)
                            setBookingId(item?.id)
                        }}>
                            <IconButton sx={{ bgcolor: Colors.blackShade, '&:hover': { bgcolor: Colors.blackShade } }}>
                                <PersonIcon sx={{ color: Colors.white, height: '16px !important' }} />
                            </IconButton>
                            <Typography variant="body2">
                                Select Customer
                            </Typography>
                        </Box>
                    }
             

                </Box>;




            default:
                return "-";
        }
    };

    useEffect(() => {
        getVehicleBookings()
        getBookingCustomers()
        getMakes()
        getSubCustomerList()

    }, []);

    return (
        <Box sx={{ m: 4, mb: 2 }}>
            <SimpleDialog open={customerDialog} onClose={() => setcustomerDialog(false)} title={'Select Customer'}>
                <Box component="form" onSubmit={handleSubmit3(SelectCustomer)} >
                    <Grid container spacing={2}>

                        <Grid item xs={12} sm={12}>
                            <SelectField
                                label={"Customer"}
                                size={'small'}
                                custom={{ color: '#323B4B' }}
                                options={customerList}
                                selected={selectedCustomer}
                                onSelect={(value) => setSelectedCustomer(value)}
                                error={errors3?.customer?.message}
                                register={register3("customer")}
                            />
                        </Grid>


                        <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'center' }}>
                            <PrimaryButton
                                fullWidth={true}
                                title="Submit"
                                type='submit'
                                loading={customerLoading}

                            />
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>
            <SimpleDialog open={permissionDialog} onClose={() => setPermissionDialog(false)} title={'Permissions'}>
                <Box component="form" onSubmit={handleSubmit4(ApplyPermissions)} >
                    <Grid container spacing={2}>

                        <Grid item xs={12} sm={12}>
                            <Box>
                                <Checkbox

                                    checked={
                                        vcc
                                    }
                                    onChange={()=> setVcc(!vcc)}

                                />
                                Do you want to show the &nbsp;&nbsp;
                                Vehicle Invoice?
                            </Box>
                            <Box>
                                <Checkbox

                                    checked={
                                        vehicleInvoice
                                    }
                                    onChange={()=> setVehicleInvoice(!vehicleInvoice)}

                                />
                                Do you want to show the &nbsp;&nbsp;
                                Shipping Invoice?
                            </Box>
                            <Box>
                                <Checkbox

                                    checked={
                                        shippingInvoice
                                    }

                                    onChange={()=> setShippingInvoice(!shippingInvoice)}
                                />
                                Do you want to show the &nbsp;&nbsp;
                                Receive Exit Paper?
                            </Box>


                        </Grid>

                        <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'center' }}>
                            <PrimaryButton
                                fullWidth={true}
                                title="Submit"
                                type='submit'
                                loading={customerLoading}

                            />
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>
            <Dialog
                open={updateFieldDialog}
                sx={{ '& .MuiDialog-paper': { width: '40%', height: "auto", borderRadius: 2, py: { xs: 2, md: 4 }, px: { xs: 3, md: 6 } } }}
            >
                <IconButton onClick={() => setUpdateFieldDialog(false)} sx={{ position: 'absolute', right: 13, top: 13 }}>
                    <CancelOutlined />
                </IconButton>
                <Box>
                    <Typography variant="h5" sx={{ textAlign: 'center', color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mt: 1, mb: 1.5 }}>
                        Updates Missing Fields
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit(updateMissingFieldVehicleBooking)} sx={{ mt: 4 }}>
                        <Grid container spacing={1}>
                            {missingFields?.map((item, index) => (
                                <Grid item xs={12} sm={6}>
                                    {item?.split('_')?.includes('date') ? (
                                        <DatePicker
                                            size='small'
                                            label={item?.split('_').join(' ')}
                                            onChange={(date) => setValue(item, getYearMonthDateFormate(date))}
                                        />
                                    ) : (
                                        <InputField
                                            size={'small'}
                                            label={item?.split('_').join(' ').replace('id', '')}
                                            placeholder={item?.split('_').join(' ').replace('id', '')}
                                            register={register(item)}
                                        />
                                    )}
                                </Grid>
                            ))}
                            {missingFields.length === 0 &&
                                <Grid item xs={12} sm={12}>
                                    <Typography variant="body1" sx={{ textAlign: 'center', color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mt: 1, mb: 1.5 }}>
                                        No Fields to Update
                                    </Typography>
                                </Grid>
                            }
                            {missingFields.length > 0 &&
                                <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
                                    <PrimaryButton
                                        title="Submit"
                                        type='submit'
                                        loading={loading}
                                    />
                                </Grid>
                            }
                        </Grid>
                    </Box>
                </Box>
            </Dialog>

            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
                Booked Vehicles
            </Typography>

            {/* Filters */}
            <Grid container spacing={1} columns={15}>

                <Grid item xs={12} sm={3}>
                    <InputField
                        size={'small'}
                        label={'VIN'}
                        placeholder={'VIN'}
                        register={register2('vin', {
                            onChange: (e) => handleFilter({ vins: e.target.value })
                        })}
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <InputField
                        size={'small'}
                        label={'Lot'}
                        placeholder={'Lot'}
                        register={register2('lot', {
                            onChange: (e) => handleFilter({ lots: e.target.value })
                        })}
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <SelectField
                        size={'small'}
                        onSearch={(v) => getMakes(v)}
                        label={'Make'}
                        options={makes}
                        selected={selectedMake}
                        onSelect={(value) => { setSelectedMake(value); getModels(value?.id); setSelectedModel(null); handleFilter({ makes: value?.id, model: '' }) }}
                        register={register2("make")}
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <SelectField
                        disabled={selectedMake ? false : true}
                        size={'small'}
                        onSearch={(v) => getModels(selectedMake, v)}
                        label={'Model'}
                        options={models}
                        selected={selectedModel}
                        onSelect={(value) => { setSelectedModel(value); handleFilter({ models: value?.id }) }}
                        register={register2("model")}
                    />
                </Grid>
            </Grid>


            <Grid item md={11}>
                {vehicleBookings && <Box>

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


                                        if (column !== 'Actions' && column !== 'Status') {
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
                        vehicleBookings && (
                            <Fragment>
                                <TableContainer
                                    component={Paper}
                                    sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }}
                                >
                                    <Table stickyHeader sx={{ minWidth: 500 }}>
                                        {/* Table Header */}
                                        <TableHead>
                                            <TableRow>
                                                {visibleColumns.map((index) => (
                                                    <Cell
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
                                                vehicleBookings?.length > 0 ? (
                                                    <Fragment>
                                                        {vehicleBookings?.map((item, rowIndex) => {

                                                            const isActive = true;
                                                            return (
                                                                <Row
                                                                    key={rowIndex}
                                                                    sx={{ bgcolor: rowIndex % 2 !== 0 && "#EFF8E7" }}
                                                                >
                                                                    {visibleColumns.map((colIndex) => (
                                                                        <Cell key={colIndex}>
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
                                <Pagination
                                    currentPage={currentPage}
                                    pageSize={pageLimit}
                                    onPageSizeChange={(size) => getVehicleBookings(1, size.target.value)}
                                    tableCount={vehicleBookings?.length}
                                    totalCount={totalCount}
                                    onPageChange={(page) => getVehicleBookings(page, "")}
                                />

                            </Fragment>
                        )
                    )}


                    {loader && <CircleLoading />}

                </Box>}





            </Grid>

        </Box >
    );
}

export default MyVehicles;