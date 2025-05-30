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
  Button,
  Input,
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
import { FileDownload } from "@mui/icons-material"
import moment from 'moment';
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import DataTable from 'components/DataTable';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';
import DatePicker from 'components/DatePicker';
import { CSVLink } from 'react-csv';

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

function ServiceReport() {

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

  const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Token Number.', key: '' }, { name: 'Customer ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]


  const [loader, setLoader] = useState(false);

  const [confirmationDialog, setConfirmationDialog] = useState(false)

  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([]);
  const [Totals, setTotals] = useState(null)



  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());




  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState('desc')
const [invoiceTotal, setInvoiceTotal] = useState(0)
  // *For Get Customer Queue
  const getCustomerQueue = async (page, limit, filter) => {
    setLoader(true)

    try {

      let params = {
        page: 1,
        limit: 999999,
        from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
        to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',

      }

      const { data } = await CustomerServices.getServiceReport(params)
      setCustomerQueue(data?.rows)
      const uniqueData = data?.rows?.filter(
        (item, index, self) =>
          index === self.findIndex(
            (t) => t.receipt?.invoice_number === item.receipt?.invoice_number
          )
      );
      
      const totalSum = uniqueData?.reduce((acc, item) => {
        const amount = parseFloat(item?.receipt?.total_amount) || 0;
        const vat = parseFloat(item?.receipt?.total_vat) || 0;
        return acc + amount + vat;
      }, 0);
      
      console.log("Total:", totalSum);
     
      setInvoiceTotal(totalSum)
      const result = data?.rows?.reduce((acc, item) => {
        acc.totalQuantity += item.quantity;
        acc.totalServiceCharges += (item.center_fee * item.quantity);
        acc.totalVat += (item.center_fee * item.quantity) * 0.05;
        acc.totalGovtFee += ((parseFloat(item.govt_fee) + parseFloat(item?.bank_charge)) * item.quantity);
        acc.invoiceTotal += (parseFloat(item?.receipt?.total_amount) + parseFloat(item?.receipt?.total_vat));
        return acc;
      }, {
        totalQuantity: 0,
        totalServiceCharges: 0,
        totalVat: 0,
        totalGovtFee: 0,
        invoiceTotal: 0
      });

      console.log(result, 'result');
      setTotals(result)

    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoader(false)
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
      header: "Inv No.",
      accessorKey: "invoice_number",
      total: false,
      accessorFn: (row) => row?.receipt?.invoice_number,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.invoice_number}
        </Box>
      ),
    },
    {
      header: "Inv Date",
      accessorFn: (row) => row?.receipt?.invoice_date ? moment(row?.receipt?.invoice_date).format("DD/MM/YYYY") : '',
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.invoice_date ? moment(row?.original?.receipt?.invoice_date).format("DD/MM/YYYY") : ''}
        </Box>
      ),
      total: false,
    },
    {
      header: "Department",
      accessorKey: "department",
      accessorFn: () => agencyType[process.env.REACT_APP_TYPE].category == 'AL-AHDEED' ? 'AL-ADHEED' : agencyType[process.env.REACT_APP_TYPE].category,
      cell: () => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {agencyType[process.env.REACT_APP_TYPE].category == 'AL-AHDEED' ? 'AL-ADHEED' : agencyType[process.env.REACT_APP_TYPE].category}
        </Box>
      ),
    },
    {
      header: "Stock ID",
      accessorKey: "stock_id",
      total: false,
      accessorFn: (row) => row?.service?.item_code,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.service?.item_code}
        </Box>
      ),
    },
    {
      header: "Service Name",
      accessorKey: "service_name",
      total: false,
      accessorFn: (row) => row?.service?.name,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.service?.name}
        </Box>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      total: false,
      accessorFn: (row) => row?.service?.category?.name,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.service?.category?.name}
        </Box>
      ),
    },
    {
      header: "Customer Ref",
      total: false,
      accessorFn: (row) => row?.receipt?.customer?.name,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.customer?.name}
        </Box>
      ),
    },
    {
      header: "Display Customer",
      accessorKey: "customer_name",
      total: false,
      accessorFn: (row) => row?.receipt?.customer_name,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.customer_name}
        </Box>
      ),
    },
    {
      header: "Customer Mobile",
      accessorKey: "customer_mobile",
      total: false,
      accessorFn: (row) => row?.receipt?.customer_mobile,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.customer_mobile}
        </Box>
      ),
    },
    {
      header: "Customer Email",
      accessorKey: "customer_email",
      total: false,
      accessorFn: (row) => row?.receipt?.customer_email,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
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
      accessorFn: (row) => (parseFloat(row?.center_fee || 0)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.center_fee || 0)).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Total Service Charge",
      accessorKey: "total_service_charge",
      accessorFn: (row) => (parseFloat(row?.center_fee || 0) * parseFloat(row?.quantity || 1)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.center_fee || 0) * parseFloat(row?.original?.quantity || 1)).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Total VAT",
      accessorKey: "total_vat",
      accessorFn: (row) => ((parseFloat(row?.center_fee || 0) * parseFloat(row?.quantity || 1)) * 0.05).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {((parseFloat(row?.original?.center_fee || 0) * parseFloat(row?.original?.quantity || 1)) * 0.05).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Govt. Fee",
      accessorKey: "govt_fee",
      accessorFn: (row) => (parseFloat(row?.govt_fee || 0) * parseFloat(row?.quantity || 1)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.govt_fee || 0) * parseFloat(row?.original?.quantity || 1)).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Bank Service Charge",
      accessorKey: "bank_charge",
      accessorFn: (row) => (parseFloat(row?.bank_charge || 0) * parseFloat(row?.quantity || 1)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.bank_charge || 0) * parseFloat(row?.original?.quantity || 1)).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Other Charge",
      accessorKey: "other_charge",
      accessorFn: () => "0.00",
      cell: () => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          0.00
        </Box>
      ),
    },
    {
      header: "Total Govt. Fee",
      accessorKey: "total_govt_fee",
      accessorFn: (row) => {
        const govtFee = parseFloat(row?.govt_fee || 0);
        const bankCharge = parseFloat(row?.bank_charge || 0);
        const quantity = parseFloat(row?.quantity || 1); // Default to 1 if quantity is missing
        return ((govtFee + bankCharge) * quantity).toFixed(2);
      },
      cell: ({ row }) => {
        const govtFee = parseFloat(row?.original?.govt_fee || 0);
        const bankCharge = parseFloat(row?.original?.bank_charge || 0);
        const quantity = parseFloat(row?.original?.quantity || 1);
        const total = (govtFee + bankCharge) * quantity;
        return (
          <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
            {total.toFixed(2)}
          </Box>
        );
      },
    },

    {
      header: "Transaction ID",
      accessorKey: "transaction_id",
      total: false,
    },
    {
      header: "Application/Case ID",
      accessorKey: "application_id",
      total: false,
    },
    {
      header: "Ref Name",
      accessorKey: "ref_no",
      total: false,
    },
    {
      header: "Payment Status",
      accessorKey: "payment_status",
      total: false,
      accessorFn: (row) => row?.receipt?.payment_status,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.is_paid ? "Paid" : "UnPaid"}
        </Box>
      ),
    },
    {
      header: "Employee ID",
      accessorKey: "employee_id",
      total: false,
      accessorFn: (row) => row?.receipt?.creator?.employee_id,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.creator?.employee_id}
        </Box>
      ),
    },
    {
      header: "Employee Name",
      accessorKey: "employee_name",
      total: false,
      accessorFn: (row) => row?.receipt?.creator?.name,
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.receipt?.creator?.name}
        </Box>
      ),
    },
    {
      header: "Line Total",
      accessorFn: (row) => (parseFloat(row?.total || 0) + ((parseFloat(row?.center_fee || 0) * parseFloat(row?.quantity || 1)) * 0.05)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.total || 0) + ((parseFloat(row?.original?.center_fee || 0) * parseFloat(row?.original?.quantity || 1)) * 0.05)).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Invoice Total",
      accessorKey: "total_amount",
      accessorFn: (row) => (parseFloat(row?.receipt?.total_amount || 0) + parseFloat(row?.receipt?.total_vat || 0)).toFixed(2),
      cell: ({ row }) => (
        <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {(parseFloat(row?.original?.receipt?.total_amount || 0) + parseFloat(row?.original?.receipt?.total_vat || 0)).toFixed(2)}
        </Box>
      ),
    },
  ];

  const headers = [
    "SR No.",
    "Inv No.",
    "Inv Date",
    "Department",
    "Stock ID",
    "Service Name",
    "Category",
    "Customer Ref",
    "Display Customer",
    "Customer Mobile",
    "Customer Email",
    "Quantity",
    "Service Charge",
    "Total Service Charge",
    "Total VAT",
    "Govt. Fee",
    "Bank Service Charge",
    "Other Charge",
    "Total Govt. Fee",
    "Transaction ID",
    "Application/Case ID",
    "Ref Name",
    "Payment Status",
    "Employee ID",
    "Employee Name",
    "Line Total",
    "Invoice Total"
  ];

  const prepareCSVData = (data) => {


    // Map each entry into the desired CSV format based on your provided columns
    const csvRows = data.map((item) => {
      const quantity = parseFloat(item?.quantity) || 0;
      const centerFee = parseFloat(item?.center_fee) || 0;
      const govtFee = parseFloat(item?.govt_fee) || 0;
      const bankCharge = parseFloat(item?.bank_charge) || 0;
      const totalServiceCharge = centerFee * quantity;
      const totalVAT = totalServiceCharge * 0.05;
      const totalGovtFee = (govtFee + bankCharge) * quantity;

      return {
        "SR No.": item.id || "",
        "Inv No.": item?.receipt?.invoice_number || "",
        "Inv Date": item?.receipt?.invoice_date ? moment(item?.receipt?.invoice_date).format("DD/MM/YYYY") : '',
        "Department": agencyType[process.env.REACT_APP_TYPE]?.category || "",
        "Stock ID": item?.service?.item_code || "",
        "Service Name": item?.service?.name || "",
        "Category": item?.service?.category?.name || "",
        "Customer Ref": item?.receipt?.customer?.name || "",
        "Display Customer": item?.receipt?.customer_name || "",
        "Customer Mobile": item?.receipt?.customer_mobile || "",
        "Customer Email": item?.receipt?.customer_email || "",
        "Quantity": quantity,
        "Service Charge": centerFee.toFixed(2),
        "Total Service Charge": totalServiceCharge.toFixed(2),
        "Total VAT": totalVAT.toFixed(2),
        "Govt. Fee": govtFee.toFixed(2),
        "Bank Service Charge": bankCharge.toFixed(2),
        "Other Charge": "0", // Static
        "Total Govt. Fee": totalGovtFee.toFixed(2),
        "Transaction ID": item.transaction_id || "",
        "Application/Case ID": item.application_id || "",
        "Ref Name": item.ref_no || "",
        "Payment Status": item?.receipt?.is_paid ? "Paid" : "UnPaid",
        "Employee ID": item?.receipt?.creator?.employee_id || "",
        "Employee Name": item?.receipt?.creator?.name || "",
        "Line Total": (parseFloat(item?.total) + totalVAT).toFixed(2),
        "Invoice Total": (parseFloat(item?.receipt?.total_amount) + parseFloat(item?.receipt?.total_vat)).toFixed(2),
      };
    });


    // Calculate totals for Debit and Credit
    const totalServiceCharge = data.reduce((sum, item) => sum + (parseFloat(item?.center_fee) * parseFloat(item?.quantity)), 0);
    const totalVat = data.reduce((sum, item) => sum + ((parseFloat(item?.center_fee) * parseFloat(item?.quantity)) * 0.05), 0);
    const totalGovtFee = data.reduce((sum, item) => {
      const govtFee = parseFloat(item?.govt_fee) || 0;
      const bankCharge = parseFloat(item?.bank_charge) || 0;
      const quantity = parseFloat(item?.quantity) || 0;
      return sum + ((govtFee + bankCharge) * quantity);
    }, 0);

    const totalLineTotal = data.reduce((sum, item) => sum + (parseFloat(item?.total) + ((parseFloat(item?.center_fee) * parseFloat(item?.quantity)) * 0.05)), 0);
    const totalInvoiceTotal = data.reduce((sum, item) => sum + (parseFloat(item?.receipt?.total_amount) + parseFloat(item?.receipt?.total_vat)), 0);

    // Append totals row
    csvRows.push({
      "SR No.": "",
      "Inv No.": "",
      "Inv Date": "",
      "Department": "",
      "Stock ID": "",
      "Service Name": "",
      "Category": "",
      "Customer Ref": "",
      "Display Customer": "",
      "Customer Mobile": "",
      "Customer Email": "",
      "Quantity": "",
      "Service Charge": "",
      "Total Service Charge": totalServiceCharge.toFixed(2),
      "Total VAT": totalVat.toFixed(2),
      "Govt. Fee": "",
      "Bank Service Charge": "",
      "Other Charge": "0",
      "Total Govt. Fee": totalGovtFee.toFixed(2),
      "Transaction ID": "",
      "Application/Case ID": "",
      "Ref Name": "",
      "Payment Status": "",
      "Employee ID": "",
      "Employee Name": "",
      "Line Total": totalLineTotal.toFixed(2),
      "Invoice Total": totalInvoiceTotal.toFixed(2),
    });

    // Ensure data is formatted properly as an array of objects
    const finalData = [...csvRows.map(row => Object.values(row))];

    return finalData;
  };



  useEffect(() => {
    setFromDate(new Date())
    setToDate(new Date())
    getCustomerQueue()
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
        <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Service Report</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          {customerQueue?.length > 0 && <CSVLink
            data={prepareCSVData(customerQueue)}
            headers={headers}
            filename="service_report.csv"
          >
            <Button

              startIcon={<FileDownload />}

              variant="contained"
              color="primary"
              sx={{
                padding: '10px',
                textTransform: 'capitalize !important',
                backgroundColor: "#001f3f !important",
                fontSize: "12px",
                ":hover": {
                  backgroundColor: "#001f3f !important",
                },
              }}
            >
              Export to Excel
            </Button>
          </CSVLink>}
        </Box>


      </Box>

      {/* Filters */}


      <Grid container spacing={1} justifyContent={"space-between"} alignItems={"center"}>
        <Grid item xs={8}>
          <Grid container spacing={1}>
            <Grid item xs={5}>
              <DatePicker
                label={"From Date"}
                disableFuture={true}
                size="small"
                value={fromDate}
                onChange={(date) => handleFromDate(date)}
              />
            </Grid>
            <Grid item xs={5}>
              <DatePicker
                label={"To Date"}

                disableFuture={true}
                size="small"
                value={toDate}
                onChange={(date) => handleToDate(date)}
              />
            </Grid>

            <Grid item xs={2} sx={{ marginTop: "30px" }}>
              <PrimaryButton
                bgcolor={"#001f3f"}
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


        {<DataTable loading={loader} csvName={'service_report'} data={customerQueue} columns={columns} />}

        <Grid container spacing={2} mt={1}>
          <Grid item xs={4}>
            <Input
              sx={{
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: "Black !important"

                }
              }}
              fullWidth
              disabled
              value={`Total Quantity: ${parseFloat(Totals?.totalQuantity).toFixed(2)}`}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              sx={{
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: "Black !important"

                }
              }}
              fullWidth
              disabled
              value={`Total Govt Fee: ${parseFloat(Totals?.totalGovtFee).toFixed(2)}`}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              sx={{
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: "Black !important"

                }
              }}
              fullWidth
              disabled
              value={`Total Service Charges: ${parseFloat(Totals?.totalServiceCharges).toFixed(2)}`}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              sx={{
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: "Black !important"

                }
              }}
              fullWidth
              disabled
              value={`Total Vat: ${parseFloat(Totals?.totalVat).toFixed(2)}`}
            />
          </Grid>
          <Grid item xs={4}>
            <Input
              sx={{
                "& .MuiInputBase-input": {
                  WebkitTextFillColor: "Black !important"

                }
              }}
              fullWidth
              disabled
              value={`Total Invoice Amount: ${parseFloat(invoiceTotal).toFixed(2)}`}
            />
          </Grid>

        </Grid>
      </Box>

    </Box>
  );
}

export default ServiceReport;