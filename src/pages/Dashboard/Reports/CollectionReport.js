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
  Input, Drawer,
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

function CollectionReport() {

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
  const [customTotals, setCustomTotals] = useState({});
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());


  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState(null)



  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState('desc')

  // *For Get Customer Queue
  const getCustomerQueue = async (page, limit, filter) => {
    setLoader(true)

    try {

      let params = {
        page: 1,
        limit: 1000,
        from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
        to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',

      }

      const { data } = await CustomerServices.getCollectionReport(params)
      setCustomerQueue(data?.rows)
      setData(data?.totals)
      

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



  // *For Handle Filter

  const handleFilter = () => {
    let data = {
      search: getValues('search')
    }
    Debounce(() => getCustomerQueue(1, '', data));
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
      header: "Category",
      accessorKey: "category",
      total: false,
      accessorFn: (row) => agencyType[process.env.REACT_APP_TYPE]?.category,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {agencyType[process.env.REACT_APP_TYPE]?.category}
        </Box>
      ),
    },
    {
      header: "Receipt Date",
      accessorKey: "invoice_date",
      total: false,
      accessorFn: (row) => row?.created_at ? moment(row?.created_at).format("DD/MM/YYYY") : '',
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.created_at ? moment(row?.original?.created_at).format("DD/MM/YYYY") : ""}
        </Box>
      ),
    },
    {
      header: "Receipt Time",
      accessorKey: "invoice_date",
      total: false,
      accessorFn: (row) => row?.created_at ? moment(row?.created_at).format("hh:mm A") : '',
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.created_at ? moment(row?.original?.created_at).format("hh:mm A") : ''}
        </Box>
      ),
    },
    {
      header: "Receipt No.",
      accessorKey: "id",
      total: false,
      accessorFn: (row) => "RC" + row?.id,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {"RC" + row?.original?.id}
        </Box>
      ),
    },
    {
      header: "Inv No.",
      accessorKey: "invoice_number",
      total: false,
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
      header: "Customer Name",
      accessorKey: "customer_name",
      total: false,
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
      header: "Card No.",
      accessorKey: "remarks",
      total: false,
      accessorFn: (row) => row?.remarks,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.remarks ?? "-"}
        </Box>
      ),
    },
    {
      header: "Cashier",
      accessorKey: "cashier",
      total: false,
      accessorFn: (row) => row?.payment_creator?.name,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.payment_creator?.name}
        </Box>
      ),
    },
    {
      header: "Pay. Method",
      accessorKey: "pay_method",
      total: false,
      accessorFn: (row) => row?.payment_mode,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.payment_mode}
        </Box>
      ),
    },
    {
      header: "Gross",
      accessorFn: (row) => row?.receipt?.total_amount,
      accessorKey: "total_amount",

      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {parseFloat(row?.original?.receipt?.total_amount).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "VAT",
      accessorFn: (row) => row?.receipt?.total_vat,
      accessorKey: "vat",

      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.receipt?.total_vat}
        </Box>
      ),
    },
    {
      header: "Discount",
      accessorKey: "discount",
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
      header: "Chg",
      accessorKey: "chg",
      accessorFn: (row) => row?.receipt?.additional_charges_value || 0,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.receipt?.additional_charges_value || 0}
        </Box>
      ),
    },

    {
      header: "RndOf",
      accessorKey: "",
      accessorFn: (row) => 0,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {0}
        </Box>
      ),
    },

    {
      header: "Total",
      accessorKey: "total",
      accessorFn: (row) => (parseFloat(row?.paid_amount) + parseFloat(row?.receipt?.total_vat)).toFixed(2),
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {(parseFloat(row?.original?.paid_amount) + parseFloat(row?.original?.receipt?.total_vat)).toFixed(2)}

        </Box>
      ),
    },

  ];


  useEffect(() => {
    setFromDate(new Date())
    setToDate(new Date())
    getCustomerQueue()
  }, []);


  const handleCSVDownload = () => {
    let rows=  customerQueue;
    if (!rows || rows.length === 0) return;
  
    const headers = columns.map(col => col.header);
    const csvRows = [headers];
    const totals = {};
  
    rows.forEach((row, index) => {
      const csvRow = columns.map((col, colIndex) => {
        if (col.header === "SR No.") return index + 1;
    
        let value = col.accessorFn ? col.accessorFn(row) : row[col.accessorKey];
        const isNumeric = typeof value === 'number' || !isNaN(parseFloat(value));
    
        if (col.accessorKey === "pay_method") {
          value = value?.split(",").join(" & ");
        }
    
        // Skip totals for specific headers
        const excludeFromTotal = [
          "Receipt Date",
          "Receipt Time",
          "Card No.",
          "Category",
          "Cashier",
          "Customer Name",
          "Inv No.",
          "Receipt No."
        ];
    
        if (isNumeric && col.header !== "SR No." && !excludeFromTotal.includes(col.header)) {
          totals[col.header] = (totals[col.header] || 0) + parseFloat(value || 0);
        }
    
        return value ?? '';
      });
      csvRows.push(csvRow);
    });
    
    // Create TOTAL row
    const totalRow = columns.map((col, i) => {
      if (i === 0) return 'TOTAL';
      const val = totals[col.header];
      return val != null ? val.toFixed(2) : '';
    });
  
    csvRows.push(totalRow);

    const customTotalRow = [];

    Object.entries(data).forEach(([key, value]) => {
      customTotalRow.push([
        key.replace(/total/, 'Total '), // Label
        value.toFixed(2)                // Value
      ]);
    });

    // Push each [key, value] as a new CSV row
    customTotalRow.forEach(row => {
      const paddedRow = Array(columns.length).fill(''); // Fill rest of the columns with empty
      paddedRow[0] = row[0]; // First column: label
      paddedRow[1] = row[1]; // Second column: value
      csvRows.push(paddedRow);
    });
  
    const csvString = csvRows.map(row => row.join(',')).join('\n');
    const csvWithBOM = "\uFEFF" + csvString; // Excel needs BOM for UTF-8

    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_receipts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  

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
        <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Collection Report</Typography>



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
        <Grid item>
              <PrimaryButton
                bgcolor={"#001f3f"}
                title="Download Excel"
                sx={{ marginTop: "30px" }}
                onClick={() => handleCSVDownload()}
                loading={loading}
              />
            </Grid>
        </Grid>
      </Grid>
      <Box >


        {<DataTable loading={loader} total={true} csv={false} data={customerQueue} columns={columns} />}
        <Grid container spacing={2} mt={1}>
      <Grid item xs={4}>
        <Input
        sx={{
          "& .MuiInputBase-input":{
            WebkitTextFillColor: "Black !important"

          }
        }}
          fullWidth
          disabled
          value={`Total Cash: ${parseFloat(data?.totalCash).toFixed(2)}`}
        />
      </Grid>
      <Grid item xs={4}>
        <Input
        sx={{
          "& .MuiInputBase-input":{
            WebkitTextFillColor: "Black !important"

          }
        }}
          fullWidth
          disabled
          value={`Total Network: ${parseFloat(data?.totalNetwork).toFixed(2)}`}
        />
      </Grid>
      <Grid item xs={4}>
        <Input
        sx={{
          "& .MuiInputBase-input":{
            WebkitTextFillColor: "Black !important"

          }
        }}
          fullWidth
          disabled
          value={`Total Bank: ${parseFloat(data?.totalBank).toFixed(2)}`}
        />
      </Grid>
      <Grid item xs={4}>
        <Input
        sx={{
          "& .MuiInputBase-input":{
            WebkitTextFillColor: "Black !important"

          }
        }}
          fullWidth
          disabled
          value={`Total Card: ${parseFloat(data?.totalCard).toFixed(2)}`}
        />
      </Grid>
      <Grid item xs={4}>
        <Input
        sx={{
          "& .MuiInputBase-input":{
            WebkitTextFillColor: "Black !important"

          }
        }}
          fullWidth
          disabled
          value={`Total Amount: ${parseFloat(data?.totalAmount).toFixed(2)}`}
        />
      </Grid>
    </Grid>
      </Box>

    </Box>
  );
}

export default CollectionReport;