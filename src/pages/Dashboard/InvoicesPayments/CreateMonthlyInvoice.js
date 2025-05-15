
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid, InputLabel,
    FormControl,
    Select,
    MenuItem,
    ListItemText,
    Tooltip,
    Checkbox,
    InputAdornment,
    Button,
    styled,
    PaginationItem,
    Pagination,
} from '@mui/material';
import { PDFExport } from '@progress/kendo-react-pdf'
import { FontFamily, Images } from 'assets'
import Colors from 'assets/Style/Colors'
import { PrimaryButton } from 'components/Buttons'
import InputField from 'components/Input';
import { CircleLoading } from 'components/Loaders'
import { showErrorToast, showPromiseToast } from 'components/NewToaster'

import SelectField from 'components/Select'
import { useAuth } from 'context/UseContext'
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import moment from 'moment';

import React, { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom';
import CustomerServices from 'services/Customer'
import InvoiceServices from 'services/Invoicing'
import SystemServices from 'services/System';
import { Debounce } from 'utils';
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

const CreateMonthlyInvoice = () => {
    const navigate = useNavigate()
    // const [handleBlockedNavigation] =
    //     useCallbackPrompt(true)
    const { register, handleSubmit, getValues, setValue, control, formState: { errors }, reset } = useForm();
    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);
    const { user, userLogout } = useAuth();
    // *For Filters
    const [filters, setFilters] = useState({});
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(2);
    const [currentPage, setCurrentPage] = useState(1);
    const [candidates, setCandidates] = useState([])
    const [sort, setSort] = useState('asc')
    const [charges, setCharges] = useState(0)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const tableHead = [{ name: 'Select', key: 'created_at' }, { name: 'Candidate Name', key: 'name' }, { name: 'Customer', key: 'commission_visa' }, { name: 'Total Service Charges', key: 'commission_monthly' }, { name: 'Applicable Service Charges', key: 'commission_monthly' }, { name: 'Overstay Charges', key: 'commission_monthly' }]
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false)
    const [deselectedArray, setDeselectedArray] = useState([])
    const [totalData, setTotalData] = useState([])
    const [originalArray, setOriginalArray] = useState([])
    const [searchVal, setSearchVal] = useState('')

    const [items, setItems] = useState([]); // Your array of items
    const [page, setPage] = useState(1);
    const itemsPerPage = 50; // Change this to the number of items you want per page

    const pageCount = Math.ceil(candidates?.length / itemsPerPage);

    const handleChangePage = (event, value) => {

        setPage(value);
        PaginationFunc(null, value)
    };

    let startIndex
    let endIndex
    let displayedItems

    const PaginationFunc = (data, pg = 1) => {
        if (!data) {
            data = totalData
        }
        startIndex = (pg - 1) * itemsPerPage;
        endIndex = startIndex + itemsPerPage;
        console.log(startIndex, 'displayedItems');
        console.log(endIndex, 'displayedItems');
        console.log(data, 'displayedItems');

        displayedItems = data?.slice(startIndex, endIndex);
        console.log(displayedItems,'displayedItems2');
        
        setCandidates(displayedItems)
        setOriginalArray(displayedItems)
        if (selectAll) {
            console.log(deselectedArray, 'deselectedArray');

            const filteredItems = totalData.filter(
                (item) => !deselectedArray.some((deselected) => deselected.id === item.id)
            );
            setSelectedRows(filteredItems.filter(item => item.applicableVisaCharges > 0));

        }
        if(searchVal){

            handleSearchChange(displayedItems,searchVal)
        }
        console.log(displayedItems, 'displayedItems3');
    }

    const handleCheckboxChange = (item, isChecked) => {
        if (isChecked) {

            setSelectedRows([...selectedRows, item]);
            setDeselectedArray(deselectedArray.filter(item2 => item2?.id != item?.id))
        } else {
            // Remove the item from the selectedRows state
            setSelectedRows(selectedRows.filter(row => row?.id !== item?.id));
            let deselectedElement = candidates.find(item2 => item2?.id == item?.id)
            console.log(deselectedElement);

            console.log([...deselectedArray, deselectedElement], 'deselectedArray');

            setDeselectedArray([...deselectedArray, deselectedElement])
        }
    };
    const handleCheckboxChange2 = (isChecked) => {
        console.log(isChecked, 'isChecked');

        setSelectAll(isChecked)
        if (isChecked) {
            console.log(candidates.filter(item => item.applicableVisaCharges > 0));

            setSelectedRows(candidates.filter(item => item.applicableVisaCharges > 0));

        } else {
            setSelectedRows([]);
        }
    };

    const getData = async (formData) => {

        console.log(formData);
        try {
            let params = {
                charges_type: 'rate'

            }

            const { data } = await SystemServices.getRates(params);

            let details = data?.charges
            setCharges(details)



        } catch (error) {

        } finally {

        }
    }

    const CreateMonthlyInvoice = async (formData) => {

        console.log(selectedRows, 'selectedRows');
        const transformedData = selectedRows.map(item => ({
            candidate_id: item.id,
            total_amount: parseFloat(item.applicableVisaCharges).toFixed(2),
            service_charges: parseFloat(item.applicableVisaCharges).toFixed(2),
            overstay_charges: item.overstayDays ? parseFloat(parseFloat(item.overstayDays) * parseFloat(charges?.overstay)).toFixed(2) : 0,
            overstay_days: item.overstayDays ? item.overstayDays : 0,
        }));

        console.log(transformedData, 'transformedDatatransformedData');
        const total = selectedRows.reduce((total, item) => {
            const overstayCharges = item.overstayDays ? item.overstayDays * charges?.overstay : 0;
            return total + item.applicableVisaCharges + overstayCharges || 0;
        }, 0);

        if (transformedData.some(item => item.total_amount === 0)) {
            showErrorToast('candidate has a total amount of 0');
        }
        else {

            try {

                let obj = {
                    customer_id: selectedCustomer?.id,
                    total_amount: total,
                    due_date: null,
                    tax: parseFloat(total) * 0.05,

                    candidates: transformedData
                };

                console.log(selectedRows, 'obj');

                const promise = InvoiceServices.CreateMonthlyInvoice(obj);

                showPromiseToast(
                    promise,
                    'Saving...',
                    'Added Successfully',
                    'Something Went Wrong'
                );

                const response = await promise;
                if (response?.responseCode === 200) {
                    navigate("/monthly-invoices");
                    getCandidateList()
                }


            } catch (error) {
                console.log(error);
            }
        }
    };
    // *For Get Customer Queue

    const getCustomerQueue = async (page, limit, filter) => {
        // setLoader(true)
        try {

            let params = {
                page: 1,
                limit: 1000,
            }
            params = { ...params }
            const { data } = await CustomerServices.getCustomerQueue(params)
            console.log(user);

            if (user?.user_type == 'C') {
                console.log(customerQueue);
                let currentUser = data?.rows?.find(item => item?.id == user?.customer_id)
                console.log(currentUser);
                setSelectedCustomer(currentUser)
                setValue('customer', currentUser)

            }


            setCustomerQueue(data?.rows)

        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }
    const getCandidateList = async (page, limit, filter, id) => {
        try {
            const Page = page || currentPage;
            const Limit = 999;
            const Filter = { ...filters, ...filter };
            setCurrentPage(Page);
            setPageLimit(Limit);
            setFilters(Filter);

            let params = {
                page: Page,
                limit: Limit,
                customer_id: id ? id : selectedCustomer?.id
            };
            params = { ...params, ...Filter };

            const { data } = await InvoiceServices.getCanidateList(params);

            const candidatesWithCharges = data?.rows?.map(item => {
                let additionalDays = 0;
                const customer = item?.customer;
                let overstayDays = 0


                if (item?.visa_expiry) {
                    console.log("yaha agia", item)


                    let visaExpiry = moment(item?.visa_expiry);
                    let lastMonthEndDate = moment().subtract(1, "month").endOf("month").endOf("day");
                    let expiryAfterGrace = visaExpiry.startOf("day").add(30, "days");
                    let newOverstayDays = moment().startOf("day").diff(expiryAfterGrace, "days");

                    if (newOverstayDays > 0) {
                        overstayDays = newOverstayDays
                    }
                    let differenceInMonths = parseInt(moment().subtract(1, "month").format("MM")) - parseInt(expiryAfterGrace.format("MM"))
                    console.log(differenceInMonths, 'differenceInMonths');
                    if (moment(visaExpiry).isAfter(moment())) {
                        differenceInMonths = -1;
                    }
                    if (differenceInMonths > 0) {
                        overstayDays = lastMonthEndDate.format("DD")
                    }
                    else if (differenceInMonths == 0) {

                        if (parseInt(lastMonthEndDate.format("DD")) == parseInt(expiryAfterGrace.format("DD"))) {
                            overstayDays = (parseInt(lastMonthEndDate.format("DD")) - parseInt(expiryAfterGrace.format("DD")))
                        }
                        else {
                            overstayDays = (parseInt(lastMonthEndDate.format("DD")) - parseInt(expiryAfterGrace.format("DD"))) + 1
                        }

                        if (parseInt(expiryAfterGrace.format("YYYY")) < parseInt(moment().format("YYYY"))) {
                            overstayDays = lastMonthEndDate.format("DD")

                        }

                    }
                    else {
                        overstayDays = 0

                    }
                    console.log(overstayDays, "overstay check")
                    let sortedData = item.processings;
                    if (sortedData.length > 0) {

                        sortedData = item.processings.sort((a, b) => b.id - a.id);
                    }

                    if (sortedData.length > 0) {

                        let renewed = {}
                        if (item?.last_status) {

                            renewed = sortedData.find(item => item?.last_status?.toLowerCase() === "renewed" && item?.type?.toLowerCase() === "renew");
                        }
                        if (renewed) {
                            console.log(renewed, "yaha agia")
                            const sortedStatuses = renewed?.statuses?.sort((a, b) => b.id - a.id);

                            const renewedDate = sortedStatuses?.find(item => item.status == "Renewed");

                            if (renewedDate) {
                                console.log("ab yaha agia")

                                let oldExpiryDate = visaExpiry;

                                if (item?.visa_tenure.includes("2")) {
                                    oldExpiryDate = moment(item?.visa_expiry).subtract(2, "year");
                                }
                                else {
                                    oldExpiryDate = moment(item?.visa_expiry).subtract(1, "year");

                                }

                                console.log(oldExpiryDate, "ab yaha agia")


                                expiryAfterGrace = oldExpiryDate.startOf("day").add(30, "days");

                                differenceInMonths = parseInt(moment().subtract(1, "month").format("MM")) - parseInt(expiryAfterGrace.format("MM"))


                                if (moment(oldExpiryDate).format("YYYY") != moment().format("YYYY")) {
                                    differenceInMonths = -99999;

                                }


                                console.log(differenceInMonths, 'differenceInMonthsYahaWala');

                                if (differenceInMonths > 0) {
                                    overstayDays = lastMonthEndDate.format("DD")
                                }
                                else if (differenceInMonths == 0 && moment(oldExpiryDate).format("YYYY") == moment().format("YYYY")) {
                                    let renewDate = moment(renewedDate.date)

                                    if (parseInt(renewDate.format("DD")) == parseInt(expiryAfterGrace.format("DD"))) {
                                        overstayDays = (parseInt(renewDate.format("DD")) - parseInt(expiryAfterGrace.format("DD")))
                                    }
                                    else {
                                        overstayDays = (parseInt(renewDate.format("DD")) - parseInt(expiryAfterGrace.format("DD"))) + 1
                                    }
                                    console.log(parseInt(expiryAfterGrace.format("YYYY")) < parseInt(moment().format("YYYY")), 'testttt');

                                    if (parseInt(expiryAfterGrace.format("YYYY")) < parseInt(moment().format("YYYY")) && parseInt(renewDate.format("YYYY")) != parseInt(moment().format("YYYY"))) {
                                        overstayDays = lastMonthEndDate.format("DD")
                                    }
                                }
                                else if (differenceInMonths == -99999 && moment(renewedDate.date) <= lastMonthEndDate) {
                                    let renewDate = moment(renewedDate.date)
                                    console.log("testt", renewDate)
                                    overstayDays = (parseInt(renewDate.format("DD")))

                                }
                                else {
                                    overstayDays = 0
                                }


                            }



                        }


                        // Find the first object with last_status = "Canceled" and type = "Cancel"
                        let cancelled = {};
                        if (item?.last_status) {

                            cancelled = sortedData.find(item => (item?.last_status?.toLowerCase() === "canceled" || item?.last_status?.toLowerCase() === "canceled-exited" || item?.last_status?.toLowerCase() === "canceled-status changed") && (item?.type?.toLowerCase() === "cancel"));
                        }

                        if (cancelled) {
                            console.log(cancelled);
                            console.log(cancelled?.statuses);

                            const cancelStartDate = cancelled?.statuses?.find(item => item.status == "Canceled");


                            //et cancelStartDate = moment();
                            //console.log(cancelStartDate, "cancel")
                            let newDays = moment(cancelStartDate?.date).startOf('day').add(cancelled?.grace_period, 'days')
                            let newDaysMonth = parseInt(newDays.format("MM"));
                            let lastMonthDays = parseInt(lastMonthEndDate.format("MM"));
                            newOverstayDays = lastMonthEndDate.diff(newDays, "days");

                            if (newOverstayDays > 0) {
                                overstayDays = newOverstayDays
                            }

                            if (lastMonthDays - newDaysMonth > 0) {
                                const cancelEndDateObj = cancelled?.statuses?.find(item => item.status.toLowerCase() === "canceled-exited" || item.status.toLowerCase() === "canceled-status changed");
                                if (cancelEndDateObj) {
                                    let cancelEndDate = moment(cancelEndDateObj.date)

                                    let differenceInEndDate = parseInt(lastMonthEndDate.format("MM")) - parseInt(moment(cancelEndDateObj.date).format("MM"))
                                    overstayDays = lastMonthEndDate.format("DD")
                                    if (differenceInEndDate == 0) {
                                        console.log("idhr hon")
                                        overstayDays = parseInt(cancelEndDate.startOf("day").format("DD"))
                                    }
                                }
                                else {
                                    overstayDays = parseInt(lastMonthEndDate.startOf("day").format("DD"))

                                }

                            }
                            else if (lastMonthDays - newDaysMonth == 0) {
                                const cancelEndDateObj = cancelled?.statuses?.find(item => item.status.toLowerCase() === "canceled-exited" || item.status.toLowerCase() === "canceled-status changed");
                                if (cancelEndDateObj) {
                                    let cancelEndDate = moment(cancelEndDateObj.date)
                                    if (parseInt(cancelEndDate.startOf("day").format("DD")) == parseInt(moment(newDays).format("DD"))) {
                                        overstayDays = (parseInt(cancelEndDate.startOf("day").format("DD")) - parseInt(moment(newDays).format("DD")))
                                    }
                                    else {

                                        overstayDays = (parseInt(cancelEndDate.startOf("day").format("DD")) - parseInt(moment(newDays).format("DD"))) + 1
                                    }


                                }
                                else {
                                    if (parseInt(lastMonthEndDate.startOf("day").format("DD")) == parseInt(moment(newDays).format("DD"))) {
                                        overstayDays = (parseInt(lastMonthEndDate.startOf("day").format("DD")) - parseInt(moment(newDays).format("DD")))
                                    }
                                    else {
                                        overstayDays = (parseInt(lastMonthEndDate.startOf("day").format("DD")) - parseInt(moment(newDays).format("DD"))) + 1
                                    }


                                }

                            }
                            else {
                                overstayDays = 0
                            }

                        }
                    }


                }


                console.log(overstayDays, "Overstay Days")

                if (customer.due_date_policy?.includes("7")) {
                    additionalDays = 7;
                } else if (customer.due_date_policy?.includes("15")) {
                    additionalDays = 15;
                }
                else if (customer.due_date_policy?.includes("20")) {
                    additionalDays = 20;
                }
                else if (customer.due_date_policy?.includes("25")) {
                    additionalDays = 25;
                }
                else if (customer.due_date_policy?.includes("30")) {
                    additionalDays = 30;
                }
                else if (customer.due_date_policy?.includes("60")) {
                    additionalDays = 60;
                }


                else if (customer.due_date_policy?.includes("90")) {
                    additionalDays = 90;
                }


                // Find target status and calculate target date
                let targetStatus = item?.statuses?.find(status => status?.status === 'Entry Permit' || status?.status === 'Change Status');
                let targetDate = moment(item?.change_status_date).add(additionalDays, "d");

                let previousMonth = moment().startOf("month").startOf("day").subtract(1, "month");

                let previousMonthNumber = previousMonth.format("MM");
                let targetDateNumber = targetDate.format("MM");

                let differenceMonth = parseInt(previousMonthNumber) - parseInt(targetDateNumber)
                let monthDifference = differenceMonth;
                // let monthDifference = previousMonth.diff(targetDate, "months");
                console.log(monthDifference, 'monthDifference');

                let remainingDays = 0;
                let totalDaysInPrevMonth = previousMonth.endOf("month").format("DD");

                if (monthDifference === 0) {
                    let totalDaysInTarget = targetDate.format("DD");
                    console.log(totalDaysInPrevMonth, 'sss');
                    console.log(totalDaysInTarget, 'sss');
                    remainingDays = parseInt(totalDaysInPrevMonth) - parseInt(totalDaysInTarget) + 1;
                    if (parseInt(targetDate.format("YYYY")) < parseInt(moment().format("YYYY"))) {
                        remainingDays = totalDaysInPrevMonth
                    }
                } else if (monthDifference > 0) {
                    remainingDays = parseInt(totalDaysInPrevMonth);
                } else {
                    console.log(targetDate.format("YYYY"), "awaz")
                    if (parseInt(targetDate.format("YYYY")) < parseInt(moment().format("YYYY"))) {
                        remainingDays = totalDaysInPrevMonth
                    }
                }
                console.log(remainingDays, 'rem');

                // Calculate applicable visa charges
                let totalVisaCharges
                if (parseFloat(item?.salary_total) > 2000) {
                    totalVisaCharges = parseFloat(item?.customer?.monthly_visa_service_above);
                }
                else {
                    totalVisaCharges = parseFloat(item?.customer?.monthly_visa_service_below);
                }
                console.log(totalVisaCharges, 'rem2');
                console.log(totalDaysInPrevMonth, 'rem2');

                let perDayVisaCharges = totalVisaCharges / parseInt(totalDaysInPrevMonth);
                // let applicableVisaCharges = 30 * perDayVisaCharges;
                let applicableVisaCharges = (remainingDays) * perDayVisaCharges;
                console.log(remainingDays, perDayVisaCharges, 'rem');




                // Add applicable charges to the item
                return {
                    ...item,
                    applicableVisaCharges,
                    overstayDays
                };
            });
            if (selectAll) {
                setSelectedRows(candidatesWithCharges.filter(item => item.applicableVisaCharges > 0));
            }

            setTotalData(candidatesWithCharges)
            console.log(candidatesWithCharges);

            setCandidates(candidatesWithCharges);
            setOriginalArray(candidatesWithCharges)
            PaginationFunc(candidatesWithCharges, 1)
            setTotalCount(Math.ceil(candidatesWithCharges?.length / itemsPerPage));


        } catch (error) {
            showErrorToast(error);
        } finally {
            // setLoader(false)
        }
    };
    const handleSearchChange = (items,value) => {
        
        setSearchVal(value)
        const value1 = value.toLowerCase();
        console.log(value1);
        let array = Array.isArray(items) ? items : originalArray
        console.log(items,'array');
        console.log(array,'array');
        
    if(value1){

        const updatedData = array.filter((item) =>
            Object.values(item).some((field) =>
              typeof field === 'string' || typeof field === 'number'
                ? field.toString().toLowerCase().includes(value1.toLowerCase())
                : false
            )
          );
          
        setCandidates(updatedData);
        
    }
    else{
        setCandidates(originalArray);
    }
    
    
        
      };

    // *For Handle Filter
    const handleFilter = () => {
        let data = {
            search: getValues('search')
        }
        Debounce(() => getCandidateList(1, '', data));
    }

    const handleSort = (key) => {
        let data = {
            sort_by: key,
            sort_order: sort
        }
        Debounce(() => getCandidateList(1, '', data));
    }

    useEffect(() => {
        getCustomerQueue()
        getData()
    }, [])

    return (
        <Box sx={{ p: 3 }} component={'form'} onSubmit={handleSubmit(CreateMonthlyInvoice)}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
                <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >
                    Create Monthly Service Invoice</Typography>
                {selectedRows.length > 0 && <Box sx={{ display: 'flex', gap: '10px' }}>
                    <PrimaryButton
                       bgcolor={'#001f3f'}
                        title="Create Invoice"
                        type='submit'

                    // onClick={ ()=> navigate(`/update-customer/${id}`)}


                    />

                </Box>}
            </Box>
            <Grid container mt={5}>
                <Grid item xs={5} >
                    <SelectField
                        size={'small'}
                        label={'Select Customer :'}
                        disabled={user?.user_type == 'C' ? true : false}
                        options={customerQueue}
                        selected={selectedCustomer}
                        onSelect={(value) => {
                            setSelectedCustomer(value)
                            setSelectedRows([])
                            setTotalData([])
                            setSelectAll(false)
                            getCandidateList(null, null, null, value?.id)
                            setValue('customer', value)

                        }}
                        error={errors?.customer?.message}
                        register={register("customer", {
                            required: 'Please select customer account.',
                        })}
                    />
                </Grid>

            </Grid>
            <Grid container mt={2}>
                <Grid item xs={2}>
                    <InputField
                        label={"Search :"}
                        size={'small'}
                        fullWidth={true}
                        placeholder={"Search"}
                        error={errors?.search?.message}
                        register={register('code', {
                            onChange: (e) => handleSearchChange(false, e.target.value )
                          })}
                    />
                </Grid>
            </Grid>
            <Grid item md={11}>
                {<Box>

                    <Grid container mb={2} >

                    </Grid>



                    {(
                        (
                            <Fragment>
                                <PDFExport landscape={true} paperSize="A4" margin={5} fileName='Import Customers' >

                                    <TableContainer
                                        component={Paper}
                                        sx={{
                                            maxHeight: 'calc(100vh - 200px)', mt: 1, backgroundColor: 'transparent', boxShadow: 'none !important', borderRadius: '0px !important'

                                        }}

                                    >
                                        <Table stickyHeader sx={{ minWidth: 500 }}>
                                            <TableHead>

                                                <Row>
                                                    {tableHead.map((cell, index) => (
                                                        <Cell style={{ textAlign: cell?.name == 'Select' ? 'center' : 'left', paddingRight: cell?.name == 'Select' ? '15px' : '20px' }} className="pdf-table"
                                                            key={index}

                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                {cell.name == 'Select' && <Checkbox
                                                                    checked={selectedRows.length == 0 ? false : selectAll}
                                                                    disabled={false}
                                                                    onChange={(e) => handleCheckboxChange2(e.target.checked)}
                                                                />}    {cell?.name} {cell?.name == 'Date' && <>&nbsp;<span style={{ height: '20px', cursor: 'pointer' }}><Box component={'img'} onClick={() => { setSort(sort == 'asc' ? 'desc' : 'asc'); handleSort(cell?.key) }} src={Images.sortIcon} width={'18px'}></Box></span></>}
                                                            </Box>
                                                        </Cell>
                                                    ))}
                                                </Row>
                                            </TableHead>
                                            <TableBody>
                                                {candidates?.length > 0 ? (
                                                    candidates.map((item, index) => (
                                                        <Row
                                                            key={index}
                                                            sx={{
                                                                border: '1px solid #EEEEEE !important',
                                                            }}
                                                        >
                                                            <Cell style={{ textAlign: 'center', paddingLeft: '0px !important' }} className="pdf-table">
                                                                <Checkbox
                                                                    checked={selectedRows.includes(item)}
                                                                    disabled={item?.applicableVisaCharges <= 0}
                                                                    onChange={(e) => handleCheckboxChange(item, e.target.checked)}
                                                                />
                                                            </Cell>
                                                            <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                {item?.name}
                                                            </Cell>
                                                            <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                {item?.customer?.name}
                                                            </Cell>
                                                            <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                {parseFloat(item?.salary_total) > 2000 ? item?.customer?.monthly_visa_service_above : item?.customer?.monthly_visa_service_below}
                                                            </Cell>
                                                            <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                {parseFloat(item?.applicableVisaCharges).toFixed(2)}
                                                            </Cell>
                                                            <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                {parseFloat(parseFloat(item?.overstayDays) * parseFloat(charges?.overstay)).toFixed(2)}
                                                            </Cell>
                                                        </Row>
                                                    ))
                                                ) : (
                                                    <Row>
                                                        <Cell colSpan={tableHead.length + 1} align="center" sx={{ fontWeight: 600 }}>
                                                            No Data Found
                                                        </Cell>
                                                    </Row>
                                                )}
                                            </TableBody>

                                        </Table>
                                    </TableContainer>
                                </PDFExport>
                                {/* ========== Pagination ========== */}
                                <Grid container justifyContent={'flex-end'} mt={5}>
                                    <Pagination
                                        count={totalCount}
                                        page={page}
                                        onChange={handleChangePage}
                                        renderItem={(item) => (
                                            <PaginationItem
                                                component="div"
                                                {...item}
                                            />
                                        )}
                                    />
                                </Grid>

                            </Fragment>
                        )
                    )}





                </Box>}





            </Grid>
        </Box>
    )
}

export default CreateMonthlyInvoice
