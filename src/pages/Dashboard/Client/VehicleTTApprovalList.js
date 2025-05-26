import React, { Fragment, useState, useEffect, useRef } from "react";
import {
  Grid,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  tableCellClasses,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { EyeIcon, FontFamily, CheckIcon, PendingIcon, SearchIcon } from "assets";
import InputField from "components/Input";
import { Check, Close, Inventory, Visibility } from "@mui/icons-material";
import ClientServices from "services/Client";
import { ErrorToaster } from "components/Toaster";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import { useForm } from "react-hook-form";
import moment from "moment";
import VehicleTTStatus from "components/Dialog/VehicleTTStatus";
import { useNavigate } from "react-router-dom";
import { SuccessToaster } from "components/Toaster";
import SimpleDialog from "components/Dialog/SimpleDialog";
import DatePicker from "components/DatePicker";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { handleExportWithComponent } from "utils";
import { PDFExport } from "@progress/kendo-react-pdf";

// *For Table Style

const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    border: 0,
    padding: "15px",
    textAlign: "center",
    whiteSpace: "nowrap",
    background: Colors.primary,
    color: Colors.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    textAlign: "center",
    textWrap: "nowrap",
    padding: '5px !important',

    padding: '5px !important',
    ".MuiBox-root": {
      display: "flex",
      gap: "6px",
      alignItems: "center",
      justifyContent: "center",
      ".MuiBox-root": {
        cursor: "pointer",
      },
    },
    svg: {
      width: "auto",
      height: "24px",
    },
    ".MuiTypography-root": {
      textTransform: "capitalize",
      fontFamily: FontFamily.NunitoRegular,
      textWrap: "nowrap",
    },
    ".MuiButtonBase-root": {
      padding: "8px",
      width: "28px",
      height: "28px",
    },
  },
}));

const useStyles = makeStyles({
  loaderWrap: {
    display: "flex",
    height: 100,
    "& svg": {
      width: "40px !important",
      height: "40px !important",
    },
  },
});

function VehicleTTApprovalList() {
  const classes = useStyles();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const tableHead = [
    "Date",
    "Client",
    "Model",
    "Make",
    "LOT#",
    "VIN#",
    "COLOR",
    "Due Amount (USD)",
    "Payment Status",
    "Status",
    "Action",
  ];

  // *For Client Dropdown
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [total, setTotal] = useState(0)

  // *For Dialog Box
  const [approvalStatusDialog, setApprovalStatusDialog] = useState(false);
  const [reasonDialog, setReasonDialog] = useState(false);

  // *For Approval Status
  const [approvalStatus, setApprovalStatus] = useState('');
  const [selectedStatus, setSelectedStatus] = useState()

  //* ForLoader
  const [loader, setLoader] = useState(false);

  // *For Dialog Box
  const [approvalRequestDialog, setApprovalRequestDialog] = useState(false);

  const [approvalId, setApprovalId] = useState()


  // *For Filters
  const [filters, setFilters] = useState({});

  const [invoices, setInvoices] = useState();

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

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


  // *For Vendor Costing
  const getApprovalList = async (page, limit, filter) => {
    setLoader(true);
    const Filter = { ...filters, ...filter };
    try {
      let params = {
        page: 1,
        limit: 15,
      };
      params = { ...params, ...Filter };
      const { data } = await ClientServices.getApprovalList(params);

      setTotal(data?.approvals?.total)
      setInvoices(data?.approvals?.rows);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false);
    }
  };

  const handleClick = (item) => {

    if (item?.is_approved === null) {
      setApprovalStatusDialog(true);
      setApprovalId(item?.id)

      setApprovalStatus(item?.is_approved)
    }
  }

  // *For Update Approval Status
  const updateApprovalStatus = async (data) => {

    try {
      let obj = {
        approval_id: approvalId,
        is_approved: data?.comment ? false : true,
        reason: data?.comment
      }
      const { message } = await ClientServices.approveTTStatus(obj)

      SuccessToaster(message)
      setApprovalStatusDialog(false)
      setReasonDialog(false)
      getApprovalList()
    } catch (error) {
      ErrorToaster(error)
    }
  }


  // *For Handle Status Action
  const handleStatusAction = (data) => {

    setApprovalId(data?.id)
    setApprovalRequestDialog(true);


  }

  // *For Approve Account
  const approveAccount = async () => {
    try {
      let obj = {
        approval_id: approvalId,
        is_approved: true

      }
      const { message } = await ClientServices.approveTTStatus(obj)
      SuccessToaster(message)
      setApprovalRequestDialog(false)
      getApprovalList()
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Apply Filters
  const applyFilter = async () => {
    try {

      let data = {
        to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : null,
        from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : null,
        search: getValues2("search"),
        status: selectedStatus?.id

      };

      getApprovalList(1, "", data);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    getValues: getValues2,
    formState: { errors: errors2 },
  } = useForm();
  // *For Clients
  const getClientDropdown = async () => {
    try {
      const { data } = await ClientServices.getClientDropdown();

      setClients(data?.customers?.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Action");
    const rows = invoices?.map((item) => [
      moment(item?.created_at).format("MM-DD-YYYY"),
      item?.booking?.customer?.name ?? '-',
      item?.booking?.veh_model?.name ?? '-',
      item?.booking?.veh_make?.name ?? '-',
      item?.booking?.lot_number ?? '-',
      item?.booking?.vin ?? '-',
      item?.booking?.color ?? "-",
      item?.booking?.invoice?.balance ?? "-",
      item?.booking?.invoice?.paid === item?.booking?.invoice?.amount ? 'Paid' : item?.booking?.invoice?.paid === '0.000' ? 'UnPaid' : 'Partial Paid',
      item?.is_approved === null ? 'Pending' : item?.is_approved ? 'Approved' : 'Rejected'
    ])

    const totalRow = [
      "",
      "",
      "",
      "",
      "",
      "",
      "Total Due Amount",
      `$ ${parseFloat(total).toFixed(2)}`,
      "",
      "",
    ]

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRow]);
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
    getClientDropdown();
    getApprovalList();
  }, []);

  return (
    <Fragment>
      <Grid container spacing={1} alignItems={"center"} justifyContent={"center"}>


        {/* ========== Approval Status Dialog ========== */}
        <VehicleTTStatus open={approvalStatusDialog} onClose={() => setApprovalStatusDialog(false)} status={approvalStatus} updateStatus={(data) => data ? updateApprovalStatus(data) : setReasonDialog(true)} />


        {/* ========== Rejected Reason ========== */}
        <SimpleDialog open={reasonDialog} onClose={() => setReasonDialog(false)} title={'Reason to Reject'}>
          <Box component="form" onSubmit={handleSubmit(updateApprovalStatus)} >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <InputField
                  label={'Comments'}
                  placeholder={'Comments'}
                  multiline={true}
                  rows={4}
                  error={errors?.comment?.message}
                  register={register("comment", {
                    required: 'Please enter comment.'
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
                <PrimaryButton
                  title="Submit"
                  type='submit'
                />
              </Grid>
            </Grid>
          </Box>
        </SimpleDialog>

        <Grid item xs={12} sm={12} md={11}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mr: 4,
              my: 4,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: Colors.charcoalGrey,
                fontFamily: FontFamily.NunitoRegular,
                ml: "5px",
              }}
            >
              Vehicle TT Approval List
            </Typography>
            {invoices?.length > 0 && (
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
        </Grid>
        <Grid item md={11} component={"form"} onSubmit={handleSubmit2(applyFilter)}>
          <Box
            sx={{
              m: "20px 0 20px 0",
              p: "20px",
              bgcolor: Colors.feta,
              border: `1px solid ${Colors.iron}`,
              borderRadius: "9px",
            }}
          >
            <Grid
              container
              spacing={4}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Grid item xs={12} md={2} mt={1.5}>
                <InputField
                  size={"small"}
                  inputStyle={{ backgroundColor: '#f5f5f5' }}
                  label={'Search'}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  }}
                  placeholder={"Search"}
                  register={register2("search")}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <DatePicker
                  disableFuture={true}
                  size='small'
                  label={'From Date'}
                  value={fromDate}
                  onChange={(date) => handleFromDate(date)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <DatePicker
                  disabled={fromDate ? false : true}
                  disableFuture={true}
                  size='small'
                  minDate={fromDate}
                  label={'To Date'}
                  value={toDate}
                  onChange={(date) => handleToDate(date)}
                />

              </Grid>
              <Grid item xs={12} sm={2} mt={1.5} >
                <SelectField
                  size={'small'}
                  label={'Payment Status'}
                  options={[{ id: 'paid', name: 'Paid' }, { id: 'partial', name: 'Partial' }, { id: 'unpaid', name: 'UnPaid' }]}
                  selected={selectedStatus}
                  onSelect={(value) => setSelectedStatus(value)}
                  error={errors?.status?.message}
                  register={register("status", {
                    required: 'Please select  account.',
                  })}
                />

              </Grid>




              <Grid item xs={12} md={2} mt={1.5}>
                <Box
                  sx={{
                    mt: "12px",
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <PrimaryButton type="submit" title="Search" />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid item md={11}>
          <Box>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName="Vehicle TT Approval List" >
              <Box className='pdf-show' sx={{ display: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    Vehicle TT Approval List
                  </Typography>
                  <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                </Box>
              </Box>
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                  borderRadius: 2,
                  maxWidth: "calc(100vw - 330px)",
                  maxHeight: "calc(100vh - 330px)",

                }}
                className="table-box"
              >
                <Table stickyHeader sx={{ minWidth: 500 }}>
                  <TableHead>
                    <Row>
                      {tableHead.map((cell, index) => (
                        <Cell
                          key={index}
                          className='pdf-table'
                        >
                          {cell}
                        </Cell>
                      ))}
                    </Row>
                  </TableHead>
                  <TableBody>
                    {!loader ? (
                      invoices?.length > 0 ? (
                        <Fragment>
                          {invoices?.map((item, index) => (
                            <Row
                              key={index}
                              sx={{
                                bgcolor: index % 2 !== 0 && "#EFF8E7",
                              }}
                            >
                              <Cell className='pdf-table'>
                                {moment(item?.created_at).format(
                                  "MM-DD-YYYY"
                                )}
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.booking?.customer?.name ?? '-'}
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
                                  {item?.booking?.customer?.name?.length > 12 ? item?.booking?.customer?.name?.slice(0, 8) + "..." : item?.booking?.customer?.name}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.booking?.customer?.name ?? '-'}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.booking?.veh_model?.name ?? '-'}
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
                                  {item?.booking?.veh_model?.name?.length > 12 ? item?.booking?.veh_model?.name?.slice(0, 8) + "..." : item?.booking?.veh_model?.name}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.booking?.veh_model?.name ?? '-'}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.booking?.veh_make?.name ?? '-'}
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
                                  {item?.booking?.veh_make?.name?.length > 12 ? item?.booking?.veh_make?.name?.slice(0, 8) + "..." : item?.booking?.veh_make?.name}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.booking?.veh_make?.name ?? '-'}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className="pdf-hide"
                                  title={copied ? "copied" : (item?.booking?.lot_number ?? '-')}
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
                                  onClick={() => copyContent(item?.booking?.lot_number ?? '-')}
                                >
                                  {item?.booking?.lot_number?.length > 12 ? item?.booking?.lot_number?.slice(0, 8) + "..." : item?.booking?.lot_number}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.booking?.lot_number ?? '-'}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className="pdf-hide"
                                  title={copied ? "copied" : (item?.booking?.vin ?? '-')}
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
                                  onClick={() => copyContent(item?.booking?.vin ?? '-')}
                                >
                                  {item?.booking?.vin?.length > 12 ? item?.booking?.vin?.slice(0, 8) + "..." : item?.booking?.vin}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.booking?.vin ?? '-'}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>{item?.booking?.color ?? "-"}</Cell>
                              <Cell className='pdf-table'>{item?.booking?.invoice?.balance ?? "-"}</Cell>
                              <Cell className='pdf-table'>   <Box sx={{ 'path': { fill: item?.booking?.invoice?.paid !== item?.booking?.invoice?.amount && item?.booking?.invoice?.paid !== '0.000' ? Colors.bluishCyan : item?.booking?.invoice?.paid === '0.000' ? Colors.danger : Colors.primary } }}>
                                <span className="pdf-hide">   {item?.booking?.invoice?.paid === item?.booking?.invoice?.amount ? <CheckIcon /> : item?.booking?.invoice?.paid === '0.000' ? <PendingIcon /> : <CheckIcon />}</span>
                                <Typography variant="body2">
                                  {item?.booking?.invoice?.paid === item?.booking?.invoice?.amount ? 'Paid' : item?.booking?.invoice?.paid === '0.000' ? 'UnPaid' : 'Partial Paid'}
                                </Typography>
                              </Box></Cell>

                              <Cell className='pdf-table'>
                                <Box onClick={() => handleClick(item)} sx={{ cursor: 'pointer', 'path': { fill: item?.is_approved ? '' : Colors.danger } }}>
                                  <span className="pdf-hide"> {item?.is_approved === null ? <PendingIcon /> : <CheckIcon />}</span>
                                  <Typography variant="body2">
                                    {item?.is_approved === null ? 'Pending' : item?.is_approved ? 'Approved' : 'Rejected'}
                                  </Typography>
                                </Box>
                              </Cell>
                              <Cell> <Box component={'div'} className="pdf-hide" sx={{ gap: "16px !important" }}>
                                <Box
                                  onClick={() =>
                                    navigate(`/vehicle-booking-detail/${item?.booking?.id}`)
                                  }
                                >
                                  <IconButton
                                    sx={{
                                      bgcolor: Colors.primary,
                                      "&:hover": {
                                        bgcolor: Colors.primary,
                                      },
                                    }}
                                  >
                                    <EyeIcon />
                                  </IconButton>
                                  <Typography variant="body2">View</Typography>
                                </Box>
                              </Box></Cell>

                            </Row>
                          ))}
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
                      <Row>
                        <Cell
                          colSpan={tableHead.length + 2}
                          align="center"
                          sx={{ fontWeight: 600 }}
                        >
                          <Box className={classes.loaderWrap}>
                            <CircularProgress />
                          </Box>
                        </Cell>
                      </Row>
                    )}

                  </TableBody>
                </Table>
              </TableContainer>
            </PDFExport>
            <Box sx={{ py: 1, bgcolor: Colors.whiteSmoke }}>
              <Grid container spacing={1} justifyContent={'flex-end'}>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontFamily: FontFamily.NunitoRegular,
                      }}
                    >
                      Total  Due Amount
                    </Typography>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 1,
                        width: "130px",
                        bgcolor: Colors.flashWhite,
                        border: "1px solid #B2B5BA",
                        borderRadius: "4px",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: Colors.smokeyGrey }}
                      >
                        $ {parseFloat(total).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>




              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>

    </Fragment>
  );
}

export default VehicleTTApprovalList;
