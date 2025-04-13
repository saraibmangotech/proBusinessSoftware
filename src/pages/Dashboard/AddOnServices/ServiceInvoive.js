import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid, InputLabel,
    FormControl,
    Select,
    MenuItem,
    ListItemText,
    Tooltip,
    Checkbox,
    InputAdornment,
} from '@mui/material';
import { AllocateIcon, CheckIcon, EyeIcon, FontFamily, Images, MessageIcon, PendingIcon, RequestBuyerIdIcon } from 'assets';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import FinanceStatusDialog from 'components/Dialog/FinanceStatusDialog';
import AllocateStatusDialog from 'components/Dialog/AllocateStatusDialog';
import AllocateDialog from 'components/Dialog/AllocateDialog';
import CustomerServices from 'services/Customer';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { Debounce, encryptData, formatPermissionData, handleExportWithComponent } from 'utils';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { addPermission } from 'redux/slices/navigationDataSlice';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import { PrimaryButton } from 'components/Buttons';
import SelectField from 'components/Select';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';
import CommissionServices from 'services/Commission';
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import { adjustSectionValue } from '@mui/x-date-pickers/internals/hooks/useField/useField.utils';
import DatePicker from 'components/DatePicker';
import VisaServices from 'services/Visa';
import { useAuth } from 'context/UseContext';

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

function ServiceInvoice() {
    const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm();
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        setValue: setValue2,
        getValues: getValues2,
        formState: { errors: errors2 },

    } = useForm();
      const { user, userLogout } = useAuth();
    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [statusDialog, setStatusDialog] = useState(false)
    const [paymentDialog, setPaymentDialog] = useState(false)
    const [status, setStatus] = useState(null)
    const [payment, setPayment] = useState(null)
    const [selectedVisa, setSelectedVisa] = useState()


    const tableHead = [{ name: 'Invoice#', key: '' }, { name: 'Date', key: '' }, { name: 'Customer', key: 'name' }, { name: 'Service Rate', key: 'created_at' }, { name: 'VAT', key: 'created_at' }, { name: 'Service Status', key: 'commission_visa' }, { name: 'Payment Status', key: 'commission_monthly' }, { name: 'Actions', key: '' }]





    const [loader, setLoader] = useState(false);

    const [sort, setSort] = useState('asc')


    // *For Customer Queue
    const [invoices, setInvoices] = useState([]);



    // *For setPermissions
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    const [itemAmount, setItemAmount] = useState()
    const [date, setDate] = useState(null)

    // *For Filters
    const [filters, setFilters] = useState({});
    const [paymentType, setPaymentType] = useState(null)

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false)


    const handleDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == "Invalid Date") {
                setDate("invalid");
                return;
            }
            setDate(new Date(newDate));
        } catch (error) {
            ErrorToaster(error);
        }
    };


    const UpdateStatus = async () => {
        try {
            let obj = {
                id: selectedVisa?.id,
                status: status.id,

            };

            const promise = CustomerServices.UpdateAddOnservice(obj);
            console.log(promise);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );

            // Await the promise and then check its response
            const response = await promise;
            if (response?.responseCode === 200) {
                setStatusDialog(false);
                getInvoices();
            }
        }
        catch (error) {
            console.log(error);
        }
    };


    const UpdatePaymentStatus = async (formData) => {

        if (moment(date).isAfter(moment().startOf('day'))) {
            showErrorToast('Invalid Date');
          }
          else{

              try {
                  let obj = {
                      id: selectedVisa?.id,
                      payment_status: 'paid',
                      payment_date: date,
                      payment_type: paymentType?.name,
                      amount: formData?.amount,
                      reference: 'addon_service',
                      description: formData?.description,
      
                  };
      
                  const promise = CustomerServices.UpdateAddOnservice(obj);
                  console.log(promise);
      
                  showPromiseToast(
                      promise,
                      'Saving...',
                      'Added Successfully',
                      'Something Went Wrong'
                  );
      
                  // Await the promise and then check its response
                  const response = await promise;
                  if (response?.responseCode === 200) {
                      setDate(null)
                      setPaymentType(null)
                      setValue2('description', '')
                      setPaymentDialog(false);
                      getInvoices();
                  }
              }
              catch (error) {
                  console.log(error);
              }
          }
    };

    // *For Get Customer Queue
    const getInvoices = async (page, limit, filter) => {
        // setLoader(true)
        try {
            const Page = page ? page : currentPage
            const Limit = limit ? limit : pageLimit
            const Filter = filter ?  { ...filters, ...filter } : null
            setCurrentPage(Page)
            setPageLimit(Limit)
            setFilters(Filter)
            let params = {
                page: Page,
                limit: Limit,
                customer_id:user?.customer_id
            }
            params = { ...params, ...Filter }

            const { data } = await CustomerServices.getInvoices(params)
            setInvoices(data?.rows)
            console.log(formatPermissionData(data?.permissions))
            setPermissions(formatPermissionData(data?.permissions))
            data?.permissions.forEach(e => {
                if (e?.route && e?.identifier && e?.permitted) {
                    dispatch(addPermission(e?.route));
                }
            })

            setTotalCount(data?.count)

        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }












    // *For Handle Filter
    const handleFilter = () => {
        let data = {
            search: getValues('search')
        }
        Debounce(() => getInvoices(1, '', data));
    }

    const handleSort = (key) => {
        let data = {
            sort_by: key,
            sort_order: sort
        }
        Debounce(() => getInvoices(1, '', data));
    }




    useEffect(() => {
        getInvoices()
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <SimpleDialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
                title={'Change Status?'}
            >
                <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={'small'}
                                label={'Select Status :'}

                                options={[{ id: 'pending', name: 'Pending' }, { id: 'inprogress', name: 'InProgress' }, { id: 'completed', name: 'Completed' }]}
                                selected={status}
                                onSelect={(value) => {
                                    setStatus(value)


                                }}
                                error={errors?.status?.message}
                                register={register("status", {
                                    required: 'Please select status.',
                                })}
                            />
                        </Grid>
                        <Grid container sx={{ justifyContent: 'center' }}>
                            <Grid item xs={6} sm={6} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', gap: '25px' }}>
                                <PrimaryButton bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => setStatusDialog(false)} bgcolor={'#FF1F25'} title="No,Cancel" />
                            </Grid>
                        </Grid>

                    </Grid>
                </Box>
            </SimpleDialog>
            <SimpleDialog
                open={paymentDialog}
                onClose={() => setPaymentDialog(false)}
                title={'Change Payment Status?'}
            >
                <Box component="form" onSubmit={handleSubmit2(UpdatePaymentStatus)}>
                    <Grid container >
                        <Grid item xs={12} sm={12}>
                            <DatePicker
                                label={"Payment Date :"}
                                value={date}
                                disableFuture={true}
                                size={'small'}
                                error={errors2?.date?.message}
                                register={register2("date", {
                                    required:

                                        "Please enter  date."

                                })}
                                onChange={(date) => {
                                    handleDate(date)
                                    setValue2('date', date)


                                }

                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={'small'}
                                label={'Payment Type :'}

                                options={[{ id: 'cash', name: 'Cash' }, { id: 'bank', name: 'Bank' }]}
                                selected={paymentType}
                                onSelect={(value) => {
                                    setPaymentType(value)


                                }}
                                error={errors2?.status?.message}
                                register={register2("status", {
                                    required: 'Please select status.',
                                })}
                            />
                        </Grid>
                        {/* {paymentType?.id == 'bank' && <Grid item xs={12} sm={12}>
                            <SelectField
                                size={'small'}
                                label={'Bank :'}

                                options={banks}
                                selected={selectedBank}
                                onSelect={(value) => {
                                    setSelectedBank(value)


                                }}
                                error={errors2?.banks?.message}
                                register={register2("bank", {
                                    required: 'Please select bank.',
                                })}
                            />
                        </Grid>} */}
                        <Grid item xs={12} sm={12}>
                            <LabelCustomInput label={'Amount : '} StartLabel={'AED'} disabled={true} register={register2("amount", { required: "Enter year inside rate" })} />
                        </Grid>
                        <Grid item xs={12} sm={12} mt={2}>
                            <InputField
                                label={"Description :"}
                                size={'small'}
                                rows={5}
                                multiline={true}
                                placeholder={"Description"}
                                error={errors2?.description?.message}
                                register={register2("description", {
                                    required:
                                        false

                                })}
                            />
                        </Grid>
                        <Grid container sx={{ justifyContent: 'center' }}>
                            <Grid item xs={6} sm={6} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', gap: '25px' }}>
                                <PrimaryButton bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => { setPaymentDialog(false) }} bgcolor={'#FF1F25'} title="No,Cancel" />
                            </Grid>
                        </Grid>

                    </Grid>
                </Box>
            </SimpleDialog>



            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Service Invoice</Typography>



            </Box>

            {/* Filters */}
            <Box >
                <Grid container spacing={2}>
                    <Grid item xs={6} >
                        <LabelCustomInput type={'text'} bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'Search'} placeholder={'Search'} register={register("search")} />
                    </Grid>
                    {/* <Grid item xs={3} >
                        <LabelCustomInput type={'text'} bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'By Customers'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid>
                    <Grid item xs={3} >
                        <LabelCustomInput bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'By Commission'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid>
                    <Grid item xs={3} >
                        <LabelCustomInput bgcolor={'#FAFAFA'} color={Colors.primary} border={'2px solid #FAFAFA'} StartLabel={'By Date'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid> */}
                    <Grid item xs={6} display={'flex'} justifyContent={'flex-end'} gap={2} >
                        <PrimaryButton
                           bgcolor={"#0076bf"}
                           textcolor={Colors.white}
                            // border={`1px solid ${Colors.primary}`}
                            title="Reset"
                            onClick={() => {setValue('search', ''); getInvoices(1,'',null);  }}
                            loading={loading}
                        />
                        <PrimaryButton
                           bgcolor={'#bd9b4a'}
                            title="Search"
                            onClick={() => handleFilter()}
                            loading={loading}
                        />
                    </Grid>
                </Grid>

                <Grid item md={11}>
                    {invoices && <Box>

                        <Grid container mb={2} >

                        </Grid>



                        {(
                            invoices && (
                                <Fragment>
                                    <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName='Import Customers' >

                                        <TableContainer
                                            component={Paper}
                                            sx={{
                                                maxHeight: 'calc(100vh - 200px)', mt: 5, backgroundColor: 'transparent', boxShadow: 'none !important', borderRadius: '0px !important'

                                            }}

                                        >
                                            <Table stickyHeader sx={{ minWidth: 500 }}>
                                                <TableHead>

                                                    <Row>
                                                        {tableHead.map((cell, index) => (
                                                            <Cell style={{ textAlign: cell?.name == 'Invoice#' ? 'center' : 'left', paddingRight: cell?.name == 'Invoice#' ? '15px' : '50px' }} className="pdf-table"
                                                                key={index}

                                                            >
                                                                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                                                    {cell?.name} {cell?.name == 'Date' && <>&nbsp;<span style={{ height: '20px', cursor: 'pointer' }}><Box component={'img'} onClick={() => { setSort(sort == 'asc' ? 'desc' : 'asc'); handleSort(cell?.key) }} src={Images.sortIcon} width={'18px'}></Box></span></>}
                                                                </Box>
                                                            </Cell>
                                                        ))}
                                                    </Row>
                                                </TableHead>
                                                <TableBody>
                                                    {invoices.map((item, index) => {

                                                        return (
                                                            <Row
                                                                key={index}
                                                                sx={{
                                                                    border: '1px solid #EEEEEE !important',
                                                                }}
                                                            >

                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.id}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.date ? moment(item?.date).format('DD-MM-YYYY') : '-'}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.customer?.name}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.service_cost}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {parseFloat(parseFloat(item?.service_cost) * 0.05).toFixed(2)}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    <Box component={'div'} sx={{ cursor: 'pointer', display: 'flex !important', justifyContent: 'flex-start  !important' }} onClick={() => {
                                                                        if (permissions?.service_status) {
                                                                            setStatusDialog(true); setSelectedVisa(item)

                                                                        }
                                                                    }}>
                                                                        <Box component={'img'} src={item?.status == 'completed' ? Images.successIcon : item?.status == 'inprogress' ? Images?.pendingIcon : Images.errorIcon} width={'13px'}></Box>
                                                                        {item?.status == 'completed' ? 'Completed' : item?.status == 'inprogress' ? "InProgress" : 'Pending'}
                                                                    </Box>
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    <Box component={'div'} sx={{ cursor: 'pointer', display: 'flex  !important', justifyContent: 'flex-start  !important' }} onClick={() => {
                                                                        if (permissions?.payment_status && item?.payment_status?.toLowerCase() == 'unpaid') {
                                                                            setValue2('amount', parseFloat(parseFloat(item?.service_cost) + parseFloat(item?.service_cost) * 0.05).toFixed(2))
                                                                            setPaymentDialog(true); setSelectedVisa(item)
                                                                        }
                                                                    }}>
                                                                        <Box component={'img'} src={item?.payment_status == 'paid' ? Images.successIcon : Images.errorIcon} width={'13px'}></Box>
                                                                        {item?.payment_status == 'paid' ? 'Paid' : 'Unpaid'}
                                                                    </Box>
                                                                </Cell>


                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    <Box>
                                                                        {permissions?.details && <Box component={'img'} src={Images.detailIcon} onClick={() => navigate(`/service-detail/${item?.id}`)} width={'35px'}></Box>}
                                                                        {item?.payment_status == 'unpaid' && permissions?.edit && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => navigate(`/update-service-invoice/${item?.id}`)} src={Images.editIcon} width={'35px'}></Box>}
                                                                        {/* <Box component={'img'} src={Images.deleteIcon} width={'35px'}></Box> */}
                                                                    </Box>
                                                                </Cell>



                                                            </Row>

                                                        );
                                                    })}

                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </PDFExport>
                                    {/* ========== Pagination ========== */}
                                    <Pagination
                                        currentPage={currentPage}
                                        pageSize={pageLimit}
                                        onPageSizeChange={(size) => getInvoices(1, size.target.value)}
                                        tableCount={invoices?.length}
                                        totalCount={totalCount}
                                        onPageChange={(page) => getInvoices(page, "")}
                                    />

                                </Fragment>
                            )
                        )}


                        {loader && <CircleLoading />}


                    </Box>}





                </Grid>
            </Box>

        </Box>
    );
}

export default ServiceInvoice;