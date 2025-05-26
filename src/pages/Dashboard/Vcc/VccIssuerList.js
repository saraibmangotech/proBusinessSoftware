import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  Box, CircularProgress, Dialog, Grid, IconButton, ImageListItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, FormControl,
  Select,
  MenuItem,
  ListItemText,
  Checkbox,
  InputLabel,
  Tooltip,
  InputAdornment
} from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, EyeIcon, FontFamily, PendingIcon, SearchIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import VehicleBookingServices from 'services/VehicleBooking';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import { CancelOutlined, Edit } from '@mui/icons-material';
import Pagination from 'components/Pagination';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import DatePicker from 'components/DatePicker';
import { CleanTypes, Debounce, getFileSize, handleExportWithComponent } from 'utils';
import instance from 'config/axios';
import VccServices from 'services/Vcc';
import ApprovalStatusDialog from 'components/Dialog/ApprovalStatusDialog';
import VccStatusDialog from 'components/Dialog/VccStatusDialog';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import InputPhone from 'components/InputPhone';
import routes from 'services/System/routes';
import UploadFile from 'components/UploadFile';
import Uploading from 'components/Uploading';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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

function VccIssuerList() {

  const classes = useStyles();
  const contentRef = useRef(null);

  const tableHead = ['VCC Serial Number', 'Customer', 'Make', 'Model', 'LOT', 'VIN', 'Color', 'Nationality', 'VCC Declaration Number', 'VCC Receiving Date', 'VCC Expiry Date', 'Time Left', 'Purpose', 'Comments', 'Receiver Name', 'Receiver Phone', 'Status']

  const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);
  const { register, handleSubmit, formState: { errors }, setValue, control, reset } = useForm();
  const { register: register2 } = useForm();

  const [loader, setLoader] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);

  // *For Upload File types
  const allowFilesType = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf']

  // *For Vcc List
  const [vccList, setVccList] = useState();

  // *For Vcc Id
  const [vccId, setVccId] = useState();

  // *For Booking Id
  const [bookingId, setBookingId] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();

  // *For Dialog Box
  const [vccStatusDialog, setVccStatusDialog] = useState(false);
  const [issueVccDialog, setIssueVccDialog] = useState(false);

  // For customer ID
  const [customerId, setCustomerId] = useState()
  // For customer Phone
  const [customerPhone, setCustomerPhone] = useState()


  // *For Vcc Status
  const [vccStatus, setVccStatus] = useState('');

  // *For Uploaded Documents
  const [progress, setProgress] = useState(0);
  const [uploadedSize, setUploadedSize] = useState(0);
  const [documentDetail, setDocumentDetail] = useState([]);
  const [documentLink, setDocumentLink] = useState('');

  const [vccDeposit, setVccDeposit] = useState();

  // *For Tooltip
  const [copied, setCopied] = useState(false);

  const copyContent = (text) => {
    const contentToCopy = text;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 999999);
  }

  // *For Handle Date
  const handleFromDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setFromDate('invalid')
        return
      }
      setFromDate(new Date(newDate))
      handleFilter({ fromDate: moment(new Date(newDate)).format('MM-DD-YYYY') })
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
      handleFilter({ toDate: moment(new Date(newDate)).format('MM-DD-YYYY') })
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Vcc List
  const getVccList = async (page, limit, filter) => {
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
        limit: Limit
      }
      params = { ...params, ...Filter }
      const { data } = await VccServices.getVccList(params)
      setVccList(data?.vehicles?.rows)
      setTotalCount(data?.vehicles?.count)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Upload Document
  const handleUploadDocument = async (e) => {
    try {
      e.preventDefault();
      const file = e.target.files[0]
      let arr = [{
        name: file?.name,
        file: '',
        type: file?.type?.split('/')[1],
        size: getFileSize(file.size),
        isUpload: false
      }]
      if (allowFilesType.includes(file.type)) {
        setDocumentDetail(arr)
        handleUpload(file, arr)
      } else {
        ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleUpload = async (file, docs) => {
    setProgress(0)
    try {
      const formData = new FormData();
      formData.append('document', file);
      const { data } = await instance.post(routes.uploadDocuments, formData, {
        onUploadProgress: (progressEvent) => {
          const uploadedBytes = progressEvent.loaded;
          const percentCompleted = Math.round((uploadedBytes * 100) / progressEvent.total);

          setProgress(percentCompleted);
          setUploadedSize(getFileSize(uploadedBytes))
        },
      });
      if (data) {
        docs[0].isUpload = true
        docs[0].file = data?.data?.nations
        setDocumentDetail(docs)
        setDocumentLink(data?.data?.nations)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Remove Uploaded Document
  const removeDoc = () => {
    try {
      setDocumentDetail([])
      setDocumentLink('')
      setValue('scanned', '')
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Issue Vcc
  const issueVcc = async (formData) => {
    setIssueLoading(true)
    try {
      let obj = {
        vcc_id: vccId,
        booking_id: bookingId,
        scanned_copy: documentLink,
        receiver_phone: formData?.contactNumber,
        vcc_received_by: formData?.receivedBy,
        comments: formData?.comment,
        deposit_paid: vccDeposit,
        customer_id: customerId,
        customer_phone: customerPhone


      }
      const { message } = await VccServices.issueVcc(obj)
      SuccessToaster(message)
      setVccStatusDialog(false)
      setIssueVccDialog(false)
      getVccList()
      reset()
      setDocumentDetail([])
      setDocumentLink('')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setIssueLoading(false)
    }
  }

  // *For HandleDialog
  const handleDialog = (data) => {
    try {

      setVccStatusDialog(true)
      setVccId(data?.id)
      setBookingId(data?.booking_id)
      setVccStatus(data?.vcc_status)
      setVccDeposit(data?.deposit_paid ? true : false)
      setCustomerId(data?.booking?.customer?.id)
      setCustomerPhone(data?.booking?.customer?.uae_phone)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getVccList(1, '', data));
  }

  const handleColumnChange = (event) => {
    const selectedColumns = event.target.value;
    // Sort the selected columns to maintain the correct order
    const sortedColumns = selectedColumns.sort((a, b) => a - b);
    setVisibleColumns(sortedColumns);
  };

  const renderCellContent = (colIndex, item, isActive,) => {
    const date = moment(item?.vcc_expiry_date).format('MM-DD-YYYY');
    const targetDate = moment(date, 'MM-DD-YYYY');
    let daysRemaining = targetDate.diff(moment(), 'days');
    if (daysRemaining < 0) {
      daysRemaining = 0
    }
    switch (colIndex) {
      case 0:
        return item?.id ?? '-';
      case 1:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.booking?.customer?.name ?? "-"}
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
                item?.booking?.customer?.name?.length > 12
                  ? item?.booking?.customer?.name?.slice(0, 8) + "..." : item?.booking?.customer?.name
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.customer?.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.customer?.name ?? '-';
      case 2:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.booking?.veh_make?.name ?? "-"}
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
                item?.booking?.veh_make?.name?.length > 12
                  ? item?.booking?.veh_make?.name?.slice(0, 8) + "..." : item?.booking?.veh_make?.name
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.veh_make?.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.veh_make?.name ?? '-';
      case 3:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.booking?.veh_model?.name ?? "-"}
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
                item?.booking?.veh_model?.name?.length > 12
                  ? item?.booking?.veh_model?.name?.slice(0, 8) + "..." : item?.booking?.veh_model?.name
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.veh_model?.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.veh_model?.name ?? '-';
      case 4:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={copied ? "copied" : (item?.booking?.lot_number ?? "-")}
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
              onClick={() => copyContent(item?.booking?.lot_number ?? "-")}
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
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={copied ? "copied" : (item?.booking?.vin ?? "-")}
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
              onClick={() => copyContent(item?.booking?.vin ?? "-")}
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
      case 6:
        return item?.booking?.color ?? '-';
      case 7:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.booking?.customer?.customerProfile?.nationality?.name ?? "-"}
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
                item?.booking?.customer?.customerProfile?.nationality?.name?.length > 12
                  ? item?.booking?.customer?.customerProfile?.nationality?.name?.slice(0, 8) + "..." : item?.booking?.customer?.customerProfile?.nationality?.name
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.customer?.customerProfile?.nationality?.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.customer?.customerProfile?.nationality?.name ?? '-';
      case 8:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.vcc_declaration ?? "-"}
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
                item?.vcc_declaration?.length > 12
                  ? item?.vcc_declaration?.slice(0, 8) + "..." : item?.vcc_declaration
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.vcc_declaration ?? "-"}
            </Box>
          </Box>
        )
      // item?.vcc_declaration ?? "-";
      case 9:
        return item?.vcc_date ? moment(item?.vcc_date).format('MM-DD-YYYY') : '-';
      case 10:
        return item?.vcc_expiry_date ? moment(item?.vcc_expiry_date).format('MM-DD-YYYY') : '-';
      case 11:
        return item?.vcc_expiry_date ? `${daysRemaining} days` : '-';
      case 12:
        return item?.vcc_purpose ?? '-';
      case 13:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.comments ?? "-"}
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
                item?.comments?.length > 12
                  ? item?.comments?.slice(0, 8) + "..." : item?.comments
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.comments ?? "-"}
            </Box>
          </Box>
        )
      // item?.comments ?? '-';
      case 14:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.vcc_received_by ?? "-"}
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
                item?.vcc_received_by?.length > 12
                  ? item?.vcc_received_by?.slice(0, 8) + "..." : item?.vcc_received_by
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.vcc_received_by ?? "-"}
            </Box>
          </Box>
        )
      // item?.vcc_received_by ?? '-';
      case 15:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.receiver_phone ?? "-"}
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
                item?.receiver_phone?.length > 12
                  ? item?.receiver_phone?.slice(0, 8) + "..." : item?.receiver_phone
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.receiver_phone ?? "-"}
            </Box>
          </Box>
        )
      // item?.receiver_phone ?? '-';
      case 16:
        return <Box onClick={() => item?.vcc_status !== 'issued' && handleDialog(item)} sx={{ cursor: 'pointer', 'path': { fill: item?.vcc_status === 'amount_paid' && Colors.bluishCyan } }}>
          <span className='pdf-hide'>  {item?.vcc_status === 'pending' ? <PendingIcon /> : <CheckIcon />}</span>
          <Typography variant="body2">
            {item?.vcc_status?.split('_').join(' ')}
          </Typography>
        </Box>;
      default:
        return "-";
    }
  };

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Action");
    const rows = vccList?.map((item) => {
      const date = moment(item?.vcc_expiry_date).format("MM-DD-YYYY");
      const targetDate = moment(date, "MM-DD-YYYY");
      let daysRemaining = targetDate.diff(moment(), "days");
      if (daysRemaining < 0) {
        daysRemaining = 0;
      }
      return [
        item?.id ?? "-",
        item?.booking?.customer?.name ?? "-",
        item?.booking?.veh_make?.name ?? "-",
        item?.booking?.veh_model?.name ?? "-",
        item?.booking?.lot_number ?? "-",
        item?.booking?.vin ?? "-",
        item?.booking?.color ?? "-",
        item?.booking?.customer?.customerProfile?.nationality?.name ?? "-",
        item?.vcc_declaration ?? "-",
        item?.vcc_date ? moment(item?.vcc_date).format("MM-DD-YYYY") : "-",
        item?.vcc_expiry_date ? moment(item?.vcc_expiry_date).format("MM-DD-YYYY") : "-",
        item?.vcc_expiry_date ? `${daysRemaining} days` : "-",
        item?.vcc_purpose ?? "-",
        item?.comments ?? "-",
        item?.vcc_received_by ?? "-",
        item?.receiver_phone ?? "-",
        item?.vcc_status?.split('_').join(' ')
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
    getVccList()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>

      {/* ========== Vcc Status Dialog ========== */}
      <VccStatusDialog open={vccStatusDialog} onClose={() => setVccStatusDialog(false)} status={vccStatus} updateStatus={() => setIssueVccDialog(true)} />

      {/* ========== Issue Vcc ========== */}
      <SimpleDialog open={issueVccDialog} onClose={() => { setIssueVccDialog(false); reset() }} title={'VCC Issued'}>
        <Box component="form" onSubmit={handleSubmit(issueVcc)} >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <InputField
                label={'Received By'}
                placeholder={'Received By'}
                error={errors?.receivedBy?.message}
                register={register("receivedBy", {
                  required: 'Please enter received by.'
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <InputPhone
                label={'Contact Number'}
                name={'contactNumber'}
                control={control}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1 }}>
                Upload Scanned Copy
              </Typography>
              <UploadFile
                accept={allowFilesType}
                register={register("scanned", {
                  onChange: (e) => handleUploadDocument(e)
                })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              {documentDetail?.length > 0 &&
                <Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1 }}>
                  Uploaded Files
                </Typography>
              }
              <Box sx={{ maxHeight: 300, overflow: 'auto', pr: 1 }}>
                {documentDetail?.map((item, index) => (
                  <Uploading key={index} data={item} uploadedSize={uploadedSize} progress={progress} removeDoc={() => removeDoc()} />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={12}>
              <InputField
                label={'Comments'}
                placeholder={'Comments'}
                multiline={true}
                rows={4}
                register={register("comment")}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
              <PrimaryButton
                title="Submit"
                type='submit'
                loading={issueLoading}
              />
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
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
          VCC Issuer List
        </Typography>
        {vccList?.length > 0 && (
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


        <Grid container spacing={1}>
          <Grid item xs={12} sm={2}>
            <InputField
              size={'small'}
              inputStyle={{ backgroundColor: '#f5f5f5' }}
              label={'Search'}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
              placeholder={'Search'}
              register={register2('search', {
                onChange: (e) => handleFilter({ search: e.target.value })
              })}
            />
          </Grid>

          <Grid item xs={12} sm={2.5}>
            <DatePicker
              size='small'
              disableFuture={true}
              label={'From Date'}
              maxDate={toDate}
              value={fromDate}
              onChange={(date) => handleFromDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={2.5}>
            <DatePicker
              size='small'
              disableFuture={true}
              minDate={fromDate}
              label={'To Date'}
              value={toDate}
              onChange={(date) => handleToDate(date)}
            />
          </Grid>
        </Grid>


        <Grid item md={11}>
          {vccList && <Box>

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


                      if (column !== 'VCC Serial Number' && column !== 'Status') {
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
              vccList && (
                <Fragment>
                  <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName="VCC Issuer List">
                    <Box className='pdf-show' sx={{ display: 'none' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                          Booked Container
                        </Typography>
                        <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                      </Box>
                    </Box>
                    <TableContainer
                      component={Paper}
                      sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }}
                      className="table-box"
                    >
                      <Table stickyHeader sx={{ minWidth: 500 }}>
                        {/* Table Header */}
                        <TableHead>
                          <TableRow>
                            {visibleColumns.map((index) => (
                              <Cell
                                key={index}
                                className='pdf-table'

                              >
                                {tableHead[index]}
                              </Cell>
                            ))}
                          </TableRow>
                        </TableHead>

                        {/* Table Body */}
                        <TableBody>
                          {!loader ? (
                            vccList?.length > 0 ? (
                              <Fragment>
                                {vccList.map((item, rowIndex) => {

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
                    onPageSizeChange={(size) => getVccList(1, size.target.value)}
                    tableCount={vccList?.length}
                    totalCount={totalCount}
                    onPageChange={(page) => getVccList(page, '')}
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

export default VccIssuerList;