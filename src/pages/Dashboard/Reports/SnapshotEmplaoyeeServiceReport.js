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
import { agencyType, Debounce, encryptData, formatPermissionData, handleExportWithComponent } from 'utils';
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
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import DataTable from 'components/DataTable';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';
import DatePicker from 'components/DatePicker';
import UserServices from 'services/User';

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

function SnapshotEmployeeServiceReport() {

  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [status, setStatus] = useState(null)
  const [statusDialog, setStatusDialog] = useState(false)
  const [selectedData, setSelectedData] = useState(null)
  const [tableLoader, setTableLoader] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
  } = useForm();

  const tableHead = [{ name: 'SR No.', key: '' },{ name: 'Token Number.', key: '' }, { name: 'Customer ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]


  const [loader, setLoader] = useState(false);

  const [confirmationDialog, setConfirmationDialog] = useState(false)

  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([]);



  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState(null)
  const [users, setUsers] = useState([])


  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState('desc')

  // *For Get Customer Queue
  const getCustomerQueue = async (page, limit, filter) => {
    if(selectedUser?.id){
        setLoader(true)

        try {
       
          let params = {
            page: 1,
            limit: 1000,
            from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
            to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',
            created_by:selectedUser?.id
         
          }
         
          const { data } = await CustomerServices.getServiceReport(params)
          setCustomerQueue(data?.rows)
         
        } catch (error) {
          showErrorToast(error)
        } finally {
          setLoader(false)
        }
    }
    else{
        showErrorToast('Select User')
    }
   
  }




  const getUsers = async (page, limit, filter) => {
    // setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = filter ?  { ...filters, ...filter } : null;
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      let params = {
        page: 1,
        limit: 1000,
      }
      params = { ...params, ...Filter }

      const { data } = await UserServices.getUsers(params)
      setUsers(data?.users?.rows)
      
     
    
    } catch (error) {
      showErrorToast(error)
    } finally {
      // setLoader(false)
    }
  }


  const handleSort = (key) => {
    let data = {
      sort_by: key,
      sort_order: sort
    }
    Debounce(() => getCustomerQueue(1, '', data));
  }



  // *For Handle Filter

  const handleFilter = () => {
    let data = {
      search: getValues('search')
    }
    Debounce(() => getCustomerQueue(1, '', data));
  }

    const handleFromDate = (newDate) => {
      try {
        // eslint-disable-next-line eqeqeq
        if (newDate == 'Invalid Date') {
          setFromDate('invalid')
          return
        }
        console.log(newDate, "newDate")
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


  const handleDelete = async (item) => {
 

    try {
        let params = { reception_id: selectedData?.id }


        const { message } = await CustomerServices.deleteReception(params)

        SuccessToaster(message);
        getCustomerQueue()
    } catch (error) {
        showErrorToast(error)
    } finally {
        // setLoader(false)
    }
}
  const UpdateStatus = async () => {
    try {
      let obj = {
        customer_id: selectedData?.id,
        is_active: status?.id,
      };

      const promise = CustomerServices.CustomerStatus(obj);
      console.log(promise);

      showPromiseToast(
        promise,
        "Saving...",
        "Added Successfully",
        "Something Went Wrong"
      );

      // Await the promise and then check its response
      const response = await promise;
      if (response?.responseCode === 200) {
        setStatusDialog(false);
        setStatus(null)
        getCustomerQueue();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      header: "SR No.",
      accessorKey: "id",
    },
    {
        header: "Employee ID",
        accessorKey: "employee_id",
        accessorFn: (row) => row?.receipt?.creator?.employee_id,
        cell: ({ row }) => (
          <Box
            variant="contained"
            color="primary"
            sx={{ cursor: "pointer", display: "flex", gap: 2 }}
          >
            {row?.original?.receipt?.creator?.employee_id}
          </Box>
        ),
      },
      {
        header: "Employee Name",
        accessorKey: "employee_name",
        accessorFn: (row) => row?.receipt?.creator?.name,
        cell: ({ row }) => (
          <Box
            variant="contained"
            color="primary"
            sx={{ cursor: "pointer", display: "flex", gap: 2 }}
          >
            {row?.original?.receipt?.creator?.name}
          </Box>
        ),
      },
    {
      header: "Inv No.",
      accessorKey: "invoice_number",
      accessorFn: (row) => row?.receipt?.invoice_number,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.receipt?.invoice_number}
        </Box>
      ),
    },
    {
      header: "Inv Date",
      accessorKey: "invoice_date",
      accessorFn: (row) => moment(row?.receipt?.invoice_date).format("DD/MM/YYYY"),
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {moment(row?.original?.receipt?.invoice_date).format("DD/MM/YYYY")}
        </Box>
      ),
    },
    {
      header: "Department",
      accessorKey: "department",
      accessorFn: (row) =>  'Al-Adheed',
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {agencyType[process.env.REACT_APP_TYPE].category}
        </Box>
      ),
    },
    {
      header: "Stock ID",
      accessorKey: "stock_id",
      accessorFn: (row) => row?.service?.item_code,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.service?.item_code}
        </Box>
      ),
    },
    {
      header: "Service Name",
      accessorKey: "service_name",
      accessorFn: (row) => row?.service?.name,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.service?.name}
        </Box>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      accessorFn: (row) => row?.service.category?.name,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.service?.category?.name}
        </Box>
      ),
    },
    {
      header: "Customer Ref",
      accessorFn: (row) => 'Walk-In Customer',
  
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          Walk-In Customer
        </Box>
      ),
    },
    {
      header: "Display Customer",
      accessorKey: "customer_name",
      accessorFn: (row) => row?.receipt?.customer_name,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.receipt?.customer_name}
        </Box>
      ),
    },
    {
      header: "Customer Mobile",
      accessorKey: "customer_mobile",
      accessorFn: (row) => row?.receipt?.customer_mobile,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.receipt?.customer_mobile}
        </Box>
      ),
    },
    {
      header: "Customer Email",
      accessorKey: "customer_email",
      accessorFn: (row) => row?.receipt?.customer_email,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.receipt?.customer_email}
        </Box>
      ),
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
    },
    {
      header: "Service Charge",
      accessorKey: "center_fee",
    },
    {
      header: "Total Service Charge",
      accessorKey: "total_service_charge",
      accessorFn: (row) => (parseFloat(row?.center_fee) * parseFloat(row?.quantity)).toFixed(2),
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {(parseFloat(row?.original?.center_fee) * parseFloat(row?.original?.quantity)).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Total VAT",
      accessorKey: "total_vat",
      accessorFn: (row) => (parseFloat(row?.center_fee) * parseFloat(row?.quantity)) * 0.05,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {(parseFloat(row?.original?.center_fee) * parseFloat(row?.original?.quantity)) * 0.05}
        </Box>
      ),
    },
    {
      header: "Govt. Fee",
      accessorKey: "govt_fee",
    },
   
    {
      header: "Bank Service Charge",
      accessorKey: "bank_charge",
    },
    {
      header: "Other Charge",
      accessorKey: "other_charge",
      accessorFn: (row) => 0,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          0
        </Box>
      ),
    },
    {
      header: "Total Govt. Fee",
      accessorKey: "govt_fee",
    },
    {
      header: "Transaction ID",
      accessorKey: "transaction_id",
    },
    {
      header: "Application/Case ID",
      accessorKey: "application_id",
    },
    {
      header: "Ref Name",
      accessorKey: "ref_no",
    },
    {
      header: "Payment Status",
      accessorKey: "payment_status",
      accessorFn: (row) => row?.receipt?.payment_status,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.receipt?.is_paid ? "Paid" : "UnPaid" }
        </Box>
      ),
    },
    
    {
      header: "Line Total",
      accessorKey: "total",
      accessorFn: (row) => parseFloat(row?.total) + ((parseFloat(row?.center_fee) * parseFloat(row?.quantity)) * 0.05),
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {parseFloat(row?.original?.total) + ((parseFloat(row?.original?.center_fee) * parseFloat(row?.original?.quantity)) * 0.05)}
        </Box>
      ),
    },
    {
      header: "Invoice Total",
      accessorKey: "inv_total",
      accessorFn: (row) => row?.receipt?.total_amount,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {parseFloat(row?.original?.receipt?.total_amount) }
        </Box>
      ),
    },
  ];


  useEffect(() => {
    getUsers()
    setFromDate(new Date())
    setToDate(new Date())

  }, []);

  return (
    <Box sx={{ p: 3 }}>

      <ConfirmationDialog
        open={confirmationDialog}
        onClose={() => setConfirmationDialog(false)}
        message={"Are You Sure?"}
        action={() => {
          setConfirmationDialog(false);
          handleDelete()

        }}
      />
      <SimpleDialog
        open={statusDialog}
        onClose={() => setStatusDialog(false)}
        title={"Change Status?"}
      >
        <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <SelectField
                size={"small"}
                label={"Select Status :"}
                options={

                  [
                    { id: false, name: "Disabled" },
                    { id: true, name: "Enabled" },

                  ]}
                selected={status}
                onSelect={(value) => {
                  setStatus(value);
                }}
                error={errors?.status?.message}
                register={register("status", {
                  required: "Please select status.",
                })}
              />
            </Grid>
            <Grid container sx={{ justifyContent: "center" }}>
              <Grid
                item
                xs={6}
                sm={6}
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "25px",
                }}
              >
                <PrimaryButton
                  bgcolor={Colors.primary}
                  title="Yes,Confirm"
                  type="submit"
                />
                <PrimaryButton
                  onClick={() => setStatusDialog(false)}
                  bgcolor={"#FF1F25"}
                  title="No,Cancel"
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>


      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Snapshot Employee Service Report</Typography>
      


      </Box>

      {/* Filters */}


                <Grid container spacing={1} justifyContent={"space-between"} alignItems={"center"}>
                        <Grid item xs={12}>
                          <Grid container spacing={1}>
                              <Grid item xs={3}>
                                        <SelectField
                                          size={"small"}
                                          label={"Select User "}
                                          options={users}
                                          selected={selectedUser}
                                          onSelect={(value) => {
                                            setSelectedUser(value);
                                           
                                          }}
                                          error={errors?.user?.message}
                                          register={register("user", {
                                            required: "Please select user account.",
                                          })}
                                        />
                                      </Grid>
                            <Grid item xs={3}>
                              <DatePicker
                                label={"From Date"}
                                disableFuture={true}
                                size="small"
                                value={fromDate}
                                onChange={(date) => handleFromDate(date)}
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <DatePicker
                                label={"To Date"}
                
                                disableFuture={true}
                                size="small"
                                value={toDate}
                                onChange={(date) => handleToDate(date)}
                              />
                            </Grid>
                
                            <Grid item xs={1} sx={{ marginTop: "30px" }}>
                              <PrimaryButton
                                bgcolor={"#bd9b4a"}
                                icon={<SearchIcon />}
                                title="Search"
                                sx={{ marginTop: "30px" }}
                                onClick={() => getCustomerQueue(null, null, null)}
                                loading={loading}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={4} display={'flex'} mt={2.7} justifyContent={'flex-end'}>
                        
                        </Grid>
                      </Grid>


      <Box >


        {<DataTable loading={loader} csv={true} csvName={'service_report'} data={customerQueue} columns={columns} />}
      </Box>

    </Box>
  );
}

export default SnapshotEmployeeServiceReport;