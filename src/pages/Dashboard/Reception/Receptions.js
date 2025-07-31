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
import { useAuth } from 'context/UseContext';
import DatePicker from 'components/DatePicker';
import ExcelJS from 'exceljs';
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

function ReceptionList() {

  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [status, setStatus] = useState(null)
  const [statusDialog, setStatusDialog] = useState(false)
  const [selectedData, setSelectedData] = useState(null)
  const [tableLoader, setTableLoader] = useState(false)
  const { user } = useAuth()
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



  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);



  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState('desc')

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  // *For Handle Date
  const handleFromDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setFromDate('invalid')
        return
      }
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

  // *For Get Customer Queue
useEffect(() => {
  getCustomerQueue()
}, [fromDate,toDate])



  const getCustomerQueue = async (page, limit, filter) => {
    setLoader(true)

    try {

      let params = {
        page: 1,
        limit: 999999,
        from_date: fromDate ? moment(fromDate).format("MM-DD-YYYY") : "",
        to_date: toDate ? moment(toDate).format("MM-DD-YYYY") : "",


      }

      const { data } = await CustomerServices.getReceptionsList(params)
      setCustomerQueue(data?.rows)

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
      header: "Token Number.",
      accessorKey: "token_number",


    },
    {
      header: "Customer",
      accessorKey: "customer_name",


    },
    {
      header: "Mobile",
      accessorKey: "mobile",


    },
    // {
    //   header: "Type",
    //   accessorKey: "cost_center",
    //   cell: ({ row }) => (
    //     <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
    //       {row?.original?.is_company ? 'Company' : "Individual"}
    //     </Box>
    //   ),

    // },
    {
      id: "created_at",
      header: "Registration Date",
      // Remove accessorKey and fix accessorFn to use row directly
      accessorFn: (row) => moment(row.created_at).format("DD/MM/YYYY"),
      cell: ({ row }) => (
        <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {moment(row.original.created_at).format("DD/MM/YYYY")}
        </Box>
      ),
    },


    {
      header: "Actions",
      cell: ({ row }) => (

        <Box sx={{ display: 'flex', gap: 1 }}>
          {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/reception-detail/${row?.original?.id}`); localStorage.setItem("currentUrl", '/customer-detail'); }} src={Images.detailIcon} width={'35px'}></Box>}
          {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/update-reception/${row?.original?.id}`); localStorage.setItem("currentUrl", '/update-customer') }} src={Images.editIcon} width={'35px'}></Box>}
          <Box>
            {true && <Box sx={{ cursor: 'pointer' }} component={'img'} src={Images.deleteIcon} onClick={() => { setSelectedData(row?.original); setConfirmationDialog(true) }} width={'35px'}></Box>}

            {/* <Box component={'img'} src={Images.deleteIcon} width={'35px'}></Box>  */}
          </Box>

        </Box>
      ),
    },

  ]


  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Reception List")

    // Define the number of columns for merging (based on dataColumns)
    const numDataColumns = columns.length
    const mergeRange = `A1:${String.fromCharCode(64 + numDataColumns)}` // e.g., A1:F1 for 6 columns

    // Set professional header and footer
    worksheet.headerFooter.oddHeader =
      '&C&"Arial,Bold"&18RECEPTION LIST REPORT\n' +
      '&C&"Arial,Regular"&12Your Company Name\n' +
      '&C&"Arial,Regular"&10Period: &D - &T\n' +
      '&L&"Arial,Regular"&8Generated on: ' +
      new Date().toLocaleDateString() +
      "\n" +
      '&R&"Arial,Regular"&8Page &P of &N'
    worksheet.headerFooter.oddFooter =
      '&L&"Arial,Regular"&8Confidential - Internal Use Only' +
      '&C&"Arial,Regular"&8This report contains reception data as of ' +
      new Date().toLocaleDateString() +
      '&R&"Arial,Regular"&8Generated by: Reception Department\n' +
      '&C&"Arial,Regular"&8Powered by Premium Business Solutions'
    worksheet.headerFooter.evenFooter = worksheet.headerFooter.oddFooter

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
        footer: 0.3,
      },
    }

    // Add title section at the top of the worksheet
    const titleRow = worksheet.addRow(["RECEPTION LIST REPORT"])
    titleRow.getCell(1).font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "2F4F4F" },
    }
    titleRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`${mergeRange.charAt(0)}1:${mergeRange.slice(-1)}1`) // A1:F1

    const companyName =
      agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL"
        ? "PREMIUM BUSINESSMEN SERVICES"
        : "PREMIUM PROFESSIONAL GOVERNMENT SERVICES LLC"
    const companyRow = worksheet.addRow([companyName])
    companyRow.getCell(1).font = {
      name: "Arial",
      size: 14,
      bold: true,
      color: { argb: "4472C4" },
    }
    companyRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`${mergeRange.charAt(0)}2:${mergeRange.slice(-1)}2`) // A2:F2

    const reportGeneratedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    const reportGeneratedTime = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    const dateRow = worksheet.addRow([`Report Generated: ${reportGeneratedDate} at ${reportGeneratedTime}`])
    dateRow.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    dateRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`${mergeRange.charAt(0)}3:${mergeRange.slice(-1)}3`) // A3:F3

    const periodText =
      toDate && fromDate
        ? `Period: ${
            fromDate
              ? new Date(fromDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "-"
          } To ${
            toDate
              ? new Date(toDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "Present"
          }`
        : `Period: All `
    const dateRow2 = worksheet.addRow([periodText])
    dateRow2.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    dateRow2.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`${mergeRange.charAt(0)}4:${mergeRange.slice(-1)}4`) // A4:F4

   

    const systemName = agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" ? "TASHEEL" : "Al-ADHEED"
    const systemRow = worksheet.addRow([`System: ${systemName}`])
    systemRow.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    systemRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`${mergeRange.charAt(0)}5:${mergeRange.slice(-1)}5`) // A6:F6

    // Add empty row for spacing
    worksheet.addRow([])

    // Add headers for the data table
    const headers = columns.map((col) => col.header)
    const headerRow = worksheet.addRow(headers)
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "808080" }, // Gray
      }
      cell.font = { bold: true, color: { argb: "FFFFFF" } } // White bold
      cell.alignment = { horizontal: "center", vertical: "middle" }
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      }
    })

    // Add data rows
    customerQueue.forEach((item) => {
      const rowData = columns.map((col) => {
        if (col.accessorKey) {
          return item[col.accessorKey] ?? "-"
        } else if (col.accessorFn) {
          return col.accessorFn(item)
        }
        return "-" // Fallback
      })
      const dataRow = worksheet.addRow(rowData)

      // Apply cell borders to data rows
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "E0E0E0" } }, // Lighter border
          left: { style: "thin", color: { argb: "E0E0E0" } },
          bottom: { style: "thin", color: { argb: "E0E0E0" } },
          right: { style: "thin", color: { argb: "E0E0E0" } },
        }
        cell.alignment = { horizontal: "left", vertical: "middle" }
      })
    })

    // Set column widths
    worksheet.columns = columns.map((col) => {
      let width = 18 // Default width
      if (col.header === "SR No.") width = 8
      if (col.header === "Token Number.") width = 15
      if (col.header === "Customer") width = 25
      if (col.header === "Mobile") width = 18
      if (col.header === "Type") width = 12
      if (col.header === "Registration Date") width = 18
      return { header: col.header, key: col.accessorKey || col.id, width: width }
    })

    // Add empty rows for spacing before footer
    worksheet.addRow([])
    worksheet.addRow([])

    // Add the electronic generated report text with black border as requested
    const reportRow = worksheet.addRow(["This is electronically generated report"])
    reportRow.getCell(1).font = {
      name: "Arial",
      size: 12,
      bold: false,
      color: { argb: "000000" },
    }
    reportRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" }
    reportRow.getCell(1).border = {
      top: { style: "medium", color: { argb: "000000" } },
      left: { style: "medium", color: { argb: "000000" } },
      bottom: { style: "medium", color: { argb: "000000" } },
      right: { style: "medium", color: { argb: "000000" } },
    }
    worksheet.mergeCells(`${mergeRange.charAt(0)}${reportRow.number}:${mergeRange.slice(-1)}${reportRow.number}`)

    // Add empty row for spacing
    worksheet.addRow([])

    const system2 = worksheet.addRow([`Powered By: MangotechDevs.ae`])
    system2.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    system2.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`${mergeRange.charAt(0)}${system2.number}:${mergeRange.slice(-1)}${system2.number}`)

    // Add empty row for spacing
    worksheet.addRow([])

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    // Determine file name based on date range
    const fileName =
      toDate && fromDate
        ? `Reception List_${new Date(fromDate)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "-")}_To_${new Date(toDate)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "-")}.xlsx`
        : `Reception List_Present.xlsx`

    saveAs(blob, fileName)
  }


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
        <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Reception List</Typography>
        <Box sx={{display:'flex',gap:2}}>
        <PrimaryButton
          title={"Download Excel"}
          onClick={() => downloadExcel()}
        />
        {user?.role_id != 1003 && <PrimaryButton
          bgcolor={'#001f3f'}
          title="Create "
          onClick={() => { navigate('/create-reception'); localStorage.setItem("currentUrl", '/create-customer') }}
          loading={loading}
        />}
</Box>

      </Box>

      {/* Filters */}
      <Box >

        <Grid container spacing={2}>

          <Grid item xs={12} sm={3}>
            <DatePicker
              label={'From Date'}
              disableFuture={true}
              size="small"
              value={fromDate}
              onChange={(date) => handleFromDate(date)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <DatePicker
              label={'To Date'}
              disableFuture={true}
              size="small"
              minDate={fromDate}
              value={toDate}
              onChange={(date) => handleToDate(date)}
            />
          </Grid>
        </Grid>
        {<DataTable loading={loader} data={customerQueue} columns={columns} />}
      </Box>

    </Box>
  );
}

export default ReceptionList;