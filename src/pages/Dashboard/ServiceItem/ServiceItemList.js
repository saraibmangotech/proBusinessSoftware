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
import { Debounce, encryptData, formatPermissionData, handleExportWithComponent } from 'utils';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { addPermission } from 'redux/slices/navigationDataSlice';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import { PrimaryButton, SwitchButton } from 'components/Buttons';
import SelectField from 'components/Select';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import DataTable from 'components/DataTable';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';
import FinanceServices from 'services/Finance';

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

function CategoryList() {

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

  const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Name ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]


  const [loader, setLoader] = useState(false);

  const [confirmationDialog, setConfirmationDialog] = useState(false)

  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([]);
  const [data, setData] = useState([])


  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);



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
        page: 1,
        limit: 999999,
        all: true


      }
      params = { ...params, ...Filter }
      const { data } = await CustomerServices.getServiceItem(params)
      setData(data?.rows);


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

  // *For Update Account Status
  const updateServiceStatus = async (id, status) => {
    const shallowCopy = [...data];
    let accountIndex = shallowCopy.findIndex(item => item.id == id);

    if (accountIndex != -1) {
      shallowCopy[accountIndex].is_deleted = status;
    }

    setData(shallowCopy)


    try {
      let obj = {
        id: id,
        is_deleted: status
      }


      const promise = CustomerServices.UpdateServiceItem(obj);

      showPromiseToast(
        promise,
        'Saving...',
        'Added Successfully',
        'Something Went Wrong'
      );


      // getAccounts()
    } catch (error) {
      showErrorToast(error)
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
      let params = { service_id: selectedData?.id }


      const { message } = await CustomerServices.DeleteServiceItem(params)

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
      header: "ID",
      accessorKey: "id",


    },
    {
      header: "Item Code",
      accessorKey: "item_code",


    },
    {
      header: "Name",
      accessorKey: "name",


    },
    {
      header: "Name Ar",
      accessorKey: "name_ar",


    },
    {
      header: "Category",
      accessorKey: "category",
      accessorFn: (row) => row?.category?.name,


    },
    {
      header: "Center Fee",
      accessorKey: "center_fee",


    },
    {
      header: "Govt Fee",
      accessorKey: "government_fee",


    },
    {
      header: "Bank Service Charges",
      accessorKey: "bank_service_charge",


    },
    {
      header: "Item Tax Type",
      accessorKey: "item_tax_type",


    },
    {
      header: "Is Active",
      accessorKey: "is_deleted",
      cell: ({ row }) => (


        <SwitchButton
          sx={{
            '& .MuiSwitch-thumb': {
              width: '27px !important',
              height: '27px !important'
            }
          }}
          isChecked={!row?.original?.is_deleted}
          setIsChecked={() => updateServiceStatus(row?.original?.id, !row?.original?.is_deleted)}
        />


      ),
    },

    {
      header: "Actions",
      cell: ({ row }) => (

        <Box sx={{ display: 'flex', gap: 1 }}>
          {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/service-item-detail/${row?.original?.id}`); localStorage.setItem("currentUrl", '/service-item-detail'); }} src={Images.detailIcon} width={'35px'}></Box>}
          {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/update-service/${row?.original?.id}`); localStorage.setItem("currentUrl", '/update-service') }} src={Images.editIcon} width={'35px'}></Box>}
          <Box>
            {true && <Box sx={{ cursor: 'pointer' }} component={'img'} src={Images.deleteIcon} onClick={() => { setSelectedData(row?.original); setConfirmationDialog(true) }} width={'35px'}></Box>}

            {/* <Box component={'img'} src={Images.deleteIcon} width={'35px'}></Box>  */}
          </Box>

        </Box>
      ),
    },

  ]

  const columns2 = [
    {
      header: "ID",
      accessorKey: "id",


    },
    {
      header: "Item Code",
      accessorKey: "item_code",


    },
    {
      header: "Name",
      accessorKey: "name",


    },
    {
      header: "Name Ar",
      accessorKey: "name_ar",


    },
    {
      header: "Category",
      accessorKey: "category",
      accessorFn: (row) => row?.category?.name,


    },
    {
      header: "Center Fee",
      accessorKey: "center_fee",


    },
    {
      header: "Govt Fee",
      accessorKey: "government_fee",


    },
    {
      header: "Bank Service Charges",
      accessorKey: "bank_service_charge",


    },
    {
      header: "Other Charges",
      accessorKey: "other_charge",


    },
    {
      header: "Local Commission",
      accessorKey: "local_commission",


    },
    {
      header: "Non Local Commission",
      accessorKey: "non_local_commission",


    },
    {
      header: "Vat Bank Charge",
      accessorKey: "vat_bank_charge",


    },
    {
      header: "Govt Bank Account",
      accessorKey: "vat_bank_charge",


    },
    {
      header: "Editable Description",
      accessorKey: "editable_description",
      cell: ({ row }) => (


        <Box>
          {row?.original?.editable_description ? 'Yes' : 'No'}
        </Box>


      ),


    },
    {
      header: "Commission Applicable",
      accessorKey: "commission_applicable",
      cell: ({ row }) => (


        <Box>
          {row?.original?.commission_applicable ? 'Yes' : 'No'}
        </Box>


      ),


    },
    {
      header: "Item Tax Type",
      accessorKey: "item_tax_type",


    },
    {
      header: "Is Active",
      accessorKey: "is_deleted",
      cell: ({ row }) => (


        <SwitchButton
          sx={{
            '& .MuiSwitch-thumb': {
              width: '27px !important',
              height: '27px !important'
            }
          }}
          isChecked={!row?.original?.is_deleted}
          setIsChecked={() => updateServiceStatus(row?.original?.id, !row?.original?.is_deleted)}
        />


      ),
    },

    {
      header: "Actions",
      cell: ({ row }) => (

        <Box sx={{ display: 'flex', gap: 1 }}>
          {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/service-item-detail/${row?.original?.id}`); localStorage.setItem("currentUrl", '/service-item-detail'); }} src={Images.detailIcon} width={'35px'}></Box>}
          {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/update-service/${row?.original?.id}`); localStorage.setItem("currentUrl", '/update-service') }} src={Images.editIcon} width={'35px'}></Box>}
          <Box>
            {true && <Box sx={{ cursor: 'pointer' }} component={'img'} src={Images.deleteIcon} onClick={() => { setSelectedData(row?.original); setConfirmationDialog(true) }} width={'35px'}></Box>}

            {/* <Box component={'img'} src={Images.deleteIcon} width={'35px'}></Box>  */}
          </Box>

        </Box>
      ),
    },

  ]


  const downloadServiceItemsExcel = () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Service Items")

    // Set professional header
    worksheet.headerFooter.oddHeader =
      '&C&"Arial,Bold"&18SERVICE ITEMS REPORT\n' +
      '&C&"Arial,Regular"&12Your Company Name\n' +
      '&C&"Arial,Regular"&10Period: &D - &T\n' +
      '&L&"Arial,Regular"&8Generated on: ' +
      new Date().toLocaleDateString() +
      "\n" +
      '&R&"Arial,Regular"&8Page &P of &N'

    // Set custom footer as requested
    worksheet.headerFooter.oddFooter =
      '&C&"Arial,Regular"&10\n' + // One line gap
      '&C&"Arial,Bold"&12This is electronically generated report\n' +
      '&C&"Arial,Regular"&10Powered by MangotechDevs.ae'

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
        footer: 0.5,
      },
    }

    // Add title section at the top of the worksheet
    const titleRow = worksheet.addRow(["SERVICE ITEMS REPORT"])
    titleRow.getCell(1).font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "2F4F4F" },
    }
    titleRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A1:P1")

    const companyRow = worksheet.addRow(["PREMIUM BUSINESSMEN SERVICES"])
    companyRow.getCell(1).font = {
      name: "Arial",
      size: 14,
      bold: true,
      color: { argb: "4472C4" },
    }
    companyRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A2:P2")

    const dateRow = worksheet.addRow([
      `Report Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    ])
    dateRow.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    dateRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A3:P3")



    // Add empty row for spacing
    worksheet.addRow([])

    // Define headers based on your service items columns
    const headers = [
      "ID",
      "Item Code",
      "Name",
      "Name Ar",
      "Category",
      "Center Fee",
      "Govt Fee",
      "Bank Service Charges",
      "Other Charges",
      "Local Commission",
      "Non Local Commission",
      "Vat Bank Charge",
      "Govt Bank Account",
      "Editable Description",
      "Commission Applicable",
      "Item Tax Type",
      "Is Active",
    ]

    // Add headers with professional styling
    const headerRow = worksheet.addRow(headers)
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2F4F4F" }, // Dark slate gray
      }
      cell.font = {
        name: "Arial",
        bold: true,
        color: { argb: "FFFFFF" },
        size: 11,
      }
      cell.alignment = { horizontal: "center", vertical: "middle" }
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      }
    })

    // Add data rows
    data?.forEach((item) => {
      const dataRow = worksheet.addRow([
        item.id || "",
        item.item_code || "",
        item.name || "",
        item.name_ar || "",
        item?.category?.name || "",
        Number.parseFloat(item.center_fee || "0").toFixed(2),
        Number.parseFloat(item.government_fee || "0").toFixed(2),
        Number.parseFloat(item.bank_service_charge || "0").toFixed(2),
        Number.parseFloat(item.other_charge || "0").toFixed(2),
        Number.parseFloat(item.local_commission || "0").toFixed(2),
        Number.parseFloat(item.non_local_commission || "0").toFixed(2),
        Number.parseFloat(item.vat_bank_charge || "0").toFixed(2),
        Number.parseFloat(item.vat_bank_charge || "0").toFixed(2), // Govt Bank Account (same as vat_bank_charge based on your columns)
        item.editable_description ? "Yes" : "No",
        item.commission_applicable ? "Yes" : "No",
        item.item_tax_type || "",
        item.is_deleted ? "No" : "Yes", // Active when not deleted
      ])

      // Style data rows
      dataRow.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 10 }
        cell.alignment = {
          horizontal: [6, 7, 8, 9, 10, 11, 12, 13].includes(colNumber) ? "right" : "left", // Amount columns right-aligned
          vertical: "middle",
        }
        cell.border = {
          top: { style: "hair", color: { argb: "CCCCCC" } },
          left: { style: "hair", color: { argb: "CCCCCC" } },
          bottom: { style: "hair", color: { argb: "CCCCCC" } },
          right: { style: "hair", color: { argb: "CCCCCC" } },
        }

        // Format amount columns
        if ([6, 7, 8, 9, 10, 11, 12, 13].includes(colNumber)) {
          cell.numFmt = "#,##0.00"
        }

        // Color coding for Yes/No columns
        if ([14, 15, 17].includes(colNumber)) {
          if (cell.value === "Yes") {
            cell.font = { name: "Arial", size: 10, color: { argb: "008000" }, bold: true } // Green
          } else if (cell.value === "No") {
            cell.font = { name: "Arial", size: 10, color: { argb: "FF0000" }, bold: true } // Red
          }
        }
      })
    })

    // Calculate totals for amount columns
    if (data?.length > 0) {
      const totalCenterFee = data.reduce((sum, item) => sum + Number.parseFloat(item.center_fee || "0"), 0)
      const totalGovtFee = data.reduce((sum, item) => sum + Number.parseFloat(item.government_fee || "0"), 0)
      const totalBankCharge = data.reduce((sum, item) => sum + Number.parseFloat(item.bank_service_charge || "0"), 0)
      const totalOtherCharge = data.reduce((sum, item) => sum + Number.parseFloat(item.other_charge || "0"), 0)
      const totalLocalCommission = data.reduce((sum, item) => sum + Number.parseFloat(item.local_commission || "0"), 0)
      const totalNonLocalCommission = data.reduce(
        (sum, item) => sum + Number.parseFloat(item.non_local_commission || "0"),
        0,
      )
      const totalVatBankCharge = data.reduce((sum, item) => sum + Number.parseFloat(item.vat_bank_charge || "0"), 0)

      // Add empty row before totals
      worksheet.addRow([])

      // Add totals row
      const totalRow = worksheet.addRow([
        "",
        "",
        "",
        "",
        "TOTALS",
        totalCenterFee.toFixed(2),
        totalGovtFee.toFixed(2),
        totalBankCharge.toFixed(2),
        totalOtherCharge.toFixed(2),
        totalLocalCommission.toFixed(2),
        totalNonLocalCommission.toFixed(2),
        totalVatBankCharge.toFixed(2),
        totalVatBankCharge.toFixed(2),
        "",
        "",
        "",
        "",
      ])

      // Style totals row
      totalRow.eachCell((cell, colNumber) => {
        if ([5, 6, 7, 8, 9, 10, 11, 12, 13].includes(colNumber)) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "000000" }, // Black
          }
          cell.font = {
            name: "Arial",
            bold: true,
            color: { argb: "FFFFFF" },
            size: 11,
          }
          cell.border = {
            top: { style: "medium", color: { argb: "000000" } },
            left: { style: "medium", color: { argb: "000000" } },
            bottom: { style: "medium", color: { argb: "000000" } },
            right: { style: "medium", color: { argb: "000000" } },
          }

          if (colNumber === 5) {
            cell.alignment = { horizontal: "center", vertical: "middle" }
          } else {
            cell.alignment = { horizontal: "right", vertical: "middle" }
            cell.numFmt = "#,##0.00"
          }
        }
      })
    }

    // Add empty rows for spacing before footer
    worksheet.addRow([])
    worksheet.addRow([])

    // Add the electronic generated report text with black border as requested
    const reportRow = worksheet.addRow(["This is electronically generated report"])
    reportRow.getCell(1).font = {
      name: "Arial",
      size: 12,
      bold: true,
      color: { argb: "000000" },
    }
    reportRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" }
    reportRow.getCell(1).border = {
      top: { style: "medium", color: { argb: "000000" } },
      left: { style: "medium", color: { argb: "000000" } },
      bottom: { style: "medium", color: { argb: "000000" } },
      right: { style: "medium", color: { argb: "000000" } },
    }
    worksheet.mergeCells(`A${reportRow.number}:P${reportRow.number}`)

    // Add powered by line
    const poweredByRow = worksheet.addRow(["Powered by MangotechDevs.ae"])
    poweredByRow.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    poweredByRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`A${poweredByRow.number}:P${poweredByRow.number}`)

    // Set column widths
    worksheet.columns = [
      { width: 8 }, // ID
      { width: 12 }, // Item Code
      { width: 20 }, // Name
      { width: 20 }, // Name Ar
      { width: 15 }, // Category
      { width: 12 }, // Center Fee
      { width: 12 }, // Govt Fee
      { width: 15 }, // Bank Service Charges
      { width: 12 }, // Other Charges
      { width: 15 }, // Local Commission
      { width: 18 }, // Non Local Commission
      { width: 15 }, // Vat Bank Charge
      { width: 18 }, // Govt Bank Account
      { width: 18 }, // Editable Description
      { width: 18 }, // Commission Applicable
      { width: 15 }, // Item Tax Type
      { width: 10 }, // Is Active
    ]

    // Add workbook properties
    workbook.creator = "Finance Department"
    workbook.lastModifiedBy = "Finance System"
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.lastPrinted = new Date()

    // Set workbook properties
    workbook.properties = {
      title: "Service Items Report",
      subject: "Service Items Report",
      keywords: "service items, fees, charges, commission",
      category: "Service Reports",
      description: "Service items report generated from system",
      company: "PREMIUM BUSINESSMEN SERVICES",
    }

    const download = async () => {
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      saveAs(blob, "Service_Items_Report.xlsx")
    }

    download()
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
        <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Service Item List</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 ,gap:2}}>
          {data?.length > 0 &&
            <Button
              onClick={() => downloadServiceItemsExcel()}


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
          <PrimaryButton
            bgcolor={'#001f3f'}
            title="Create"
            onClick={() => { navigate('/create-service-item'); localStorage.setItem("currentUrl", '/create-customer') }}
            loading={loading}
          />
        </Box>
       


      </Box>

      {/* Filters */}
      <Box >


        {<DataTable loading={loader} data={data} columns={columns} />}
      </Box>

    </Box>
  );
}

export default CategoryList;