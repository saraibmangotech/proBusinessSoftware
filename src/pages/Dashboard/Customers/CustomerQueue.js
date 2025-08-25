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
import ExcelJS from "exceljs";
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

function CustomerQueue() {

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

  const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Customer ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]


  const [loader, setLoader] = useState(false);

  const [confirmationDialog, setConfirmationDialog] = useState(false)

  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([]);



  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const downloadCustomerListExcel = (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Customer List");

    // Set professional header and footer
    worksheet.headerFooter.oddHeader =
      '&C&"Arial,Bold"&18CUSTOMER LIST\n' +
      '&C&"Arial,Regular"&12Your Company Name\n' +
      '&C&"Arial,Regular"&10Period: &D - &T\n' +
      '&L&"Arial,Regular"&8Generated on: ' +
      new Date().toLocaleDateString() +
      "\n" +
      '&R&"Arial,Regular"&8Page &P of &N';

    worksheet.headerFooter.oddFooter =
      '&L&"Arial,Regular"&8Confidential - Internal Use Only' +
      '&C&"Arial,Regular"&8This report contains customer data as of ' +
      new Date().toLocaleDateString() +
      '&R&"Arial,Regular"&8Generated by: Finance Department\n' +
      '&C&"Arial,Regular"&8Powered by Premium Business Solutions';

    worksheet.headerFooter.evenFooter = worksheet.headerFooter.oddFooter;

    // Set page setup for professional printing
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.7,
        right: 0.7,
        top: 1.0,
        bottom: 1.0,
        header: 0.3,
        footer: 0.5,
      },
    };

    // Add title section at the top of the worksheet
    const titleRow = worksheet.addRow(["CUSTOMER LIST"]);
    titleRow.getCell(1).font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "2F4F4F" },
    };
    titleRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A1:G1");

    const companyRow = worksheet.addRow([agencyType[process.env.REACT_APP_TYPE]?.name]);
    companyRow.getCell(1).font = {
      name: "Arial",
      size: 14,
      bold: true,
      color: { argb: "4472C4" },
    };
    companyRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A2:G2");

    const dateRow = worksheet.addRow([
      `Report Generated: ${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})} at ${new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}`,
    ]);
    dateRow.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    };
    dateRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A3:G3");

    // Add empty row for spacing
    worksheet.addRow([]);

    // Define headers (excluding Actions)
    const headers = [
      "SR No.",
      "Customer",
      "Mobile",
      "Email",
      "Cost Center",
      "Registration Date",
      "Status"
    ];

    // Add headers with professional styling
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2F4F4F" }, // Dark slate gray
      };
      cell.font = {
        name: "Arial",
        bold: true,
        color: { argb: "FFFFFF" },
        size: 11,
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    });

    // Add data rows
    data?.forEach((customer, index) => {
      const dataRow = worksheet.addRow([
        customer?.id || (index + 1),
        customer?.name || '-',
        customer?.mobile || '-',
        customer?.email || '-',
        customer?.cost_center || '-',
        customer?.created_at ? new Date(customer.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '-',
        customer?.is_active ? 'Enabled' : 'Disabled'
      ]);

      // Style data rows
      dataRow.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 10 };
        cell.alignment = {
          horizontal: "left",
          vertical: "middle",
        };
        cell.border = {
          top: { style: "hair", color: { argb: "CCCCCC" } },
          left: { style: "hair", color: { argb: "CCCCCC" } },
          bottom: { style: "hair", color: { argb: "CCCCCC" } },
          right: { style: "hair", color: { argb: "CCCCCC" } },
        };

        // Style status column with colors
        if (colNumber === 7) { // Status column
          if (cell.value === 'Enabled') {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "E8F5E8" }, // Light green
            };
            cell.font = { name: "Arial", size: 10, color: { argb: "2E7D32" }, bold: true };
          } else if (cell.value === 'Disabled') {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFEBEE" }, // Light red
            };
            cell.font = { name: "Arial", size: 10, color: { argb: "C62828" }, bold: true };
          }
        }
      });
    });

    // Add summary information
    if (data?.length > 0) {
      const enabledCount = data.filter(customer => customer?.is_active).length;
      const disabledCount = data.filter(customer => !customer?.is_active).length;

      // Add empty row before summary
      worksheet.addRow([]);

      // Add summary rows
      const summaryRow1 = worksheet.addRow([
        "Summary:",
        "",
        "",
        "",
        "",
        `Total Customers: ${data.length}`,
        ""
      ]);

      const summaryRow2 = worksheet.addRow([
        "",
        "",
        "",
        "",
        "",
        `Enabled: ${enabledCount}`,
        ""
      ]);

      const summaryRow3 = worksheet.addRow([
        "",
        "",
        "",
        "",
        "",
        `Disabled: ${disabledCount}`,
        ""
      ]);

      // Style summary rows
      [summaryRow1, summaryRow2, summaryRow3].forEach(row => {
        row.eachCell((cell, colNumber) => {
          if (colNumber === 1 || colNumber === 6) {
            cell.font = {
              name: "Arial",
              bold: colNumber === 1,
              size: 10,
              color: { argb: "2F4F4F" },
            };
          }
        });
      });
    }

    // Set column widths
    worksheet.columns = [
      { width: 10 }, // SR No.
      { width: 25 }, // Customer
      { width: 15 }, // Mobile
      { width: 30 }, // Email
      { width: 15 }, // Cost Center
      { width: 18 }, // Registration Date
      { width: 12 }, // Status
    ];

    // Add workbook properties
    workbook.creator = "Finance Department";
    workbook.lastModifiedBy = "Finance System";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    // Set workbook properties
    workbook.properties = {
      title: "Customer List",
      subject: "Customer Report",
      keywords: "customer list, contacts, database",
      category: "Customer Reports",
      description: "Customer list report generated from system",
      company: "Your Company Name",
    };

    // Add empty rows for spacing before footer
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Add the electronically generated report text with black border
    const reportRow = worksheet.addRow(["This is electronically generated report"]);
    reportRow.getCell(1).font = {
      name: "Arial",
      size: 12,
      bold: false,
      color: { argb: "000000" },
    };
    reportRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    reportRow.getCell(1).border = {
      top: { style: "medium", color: { argb: "000000" } },
      left: { style: "medium", color: { argb: "000000" } },
      bottom: { style: "medium", color: { argb: "000000" } },
      right: { style: "medium", color: { argb: "000000" } },
    };
    worksheet.mergeCells(`A${reportRow.number}:G${reportRow.number}`);

    // Add powered by line
    const poweredByRow = worksheet.addRow(["Powered by : MangotechDevs.ae"]);
    poweredByRow.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    };
    poweredByRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells(`A${poweredByRow.number}:G${poweredByRow.number}`);

    // Add empty row for spacing
    worksheet.addRow([]);

    const download = async () => {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      saveAs(blob, `Customer_List_${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-')}.xlsx`);
    };
    download();
  };

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
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = filter ? { ...filters, ...filter } : null;
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      let params = {
        page: Page,
        limit: Limit + 500,
        sort_order: sort,

      }
      params = { ...params, ...Filter }
      const { data } = await CustomerServices.getCustomerQueue(params)
      setCustomerQueue(data?.rows)
      setTotalCount(data?.count)
      setPermissions(formatPermissionData(data?.permissions))
      console.log(formatPermissionData(data?.permissions));

      setPermissions(formatPermissionData(data?.permissions))
      data?.permissions.forEach(e => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      })
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
  const handleDelete = async (item) => {


    try {
      let params = { customer_id: selectedData?.id }


      const { message } = await CustomerServices.handleDeleteCustomer(params)

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
      header: "Customer",
      accessorKey: "name",


    },
    {
      header: "Mobile",
      accessorKey: "mobile",


    },
    {
      header: "Email",
      accessorKey: "email",


    },
    {
      header: "Cost Center",
      accessorKey: "cost_center",


    },
    {
      id: "created_at",
      header: "Registration Date",
      // Remove accessorKey and fix accessorFn to use row directly
      accessorFn: (row) => moment(row.created_at).format("MM-DD-YYYY"),
      cell: ({ row }) => (
        <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {moment(row.original.created_at).format("MM-DD-YYYY")}
        </Box>
      ),
    },

    {
      header: "Status",
      cell: ({ row }) => (

        <Box component={'div'} sx={{ cursor: 'pointer' }} onClick={() => {
          if (permissions?.status_update) {
            setStatusDialog(true)
          }
        }}>
          <Chip sx={{ backgroundColor: row?.original?.is_active ? '#05c105' : '#a13605', color: 'white' }} label={row?.original?.is_active ? 'Enabled' : 'Disabled'} />

        </Box>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (

        <Box sx={{ display: 'flex', gap: 1 }}>
          {row?.original?.name != "Walk-In Customer" && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/customer-detail/${row?.original?.id}`); localStorage.setItem("currentUrl", '/customer-detail'); }} src={Images.detailIcon} width={'35px'}></Box>}
          {row?.original?.name != "Walk-In Customer" && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/update-customer/${row?.original?.id}`); localStorage.setItem("currentUrl", '/update-customer') }} src={Images.editIcon} width={'35px'}></Box>}
          <Box>
            {row?.original?.name != "Walk-In Customer" && <Box sx={{ cursor: 'pointer' }} component={'img'} src={Images.deleteIcon} onClick={() => { setSelectedData(row?.original); setConfirmationDialog(true) }} width={'35px'}></Box>}

            {/* <Box component={'img'} src={Images.deleteIcon} width={'35px'}></Box>  */}
          </Box>

        </Box>
      ),
    },

  ]



  useEffect(() => {
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
        <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Customer List</Typography>
        <Box sx={{display:'flex',gap:2}}>
          {customerQueue?.length > 0 &&
            <Button
              onClick={() => downloadCustomerListExcel(customerQueue)}


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
            </Button>}
          {true && <PrimaryButton
            bgcolor={'#001f3f'}
            title="Create Customer"
            onClick={() => { navigate('/create-customer'); localStorage.setItem("currentUrl", '/create-customer') }}
            loading={loading}
          />}

        </Box>
      </Box>

      {/* Filters */}
      <Box >


        {<DataTable loading={loader} data={customerQueue} columns={columns} />}
      </Box>

    </Box>
  );
}

export default CustomerQueue;