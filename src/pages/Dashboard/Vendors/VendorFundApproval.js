import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  tableCellClasses,
  CircularProgress,
  IconButton,
  Dialog,
  InputAdornment,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { CheckIcon, EyeIcon, FontFamily, PendingIcon, SearchIcon } from "assets";
import VendorServices from "services/Vendor";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import { CircleLoading } from "components/Loaders";
import Pagination from "components/Pagination";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";
import { CancelOutlined } from "@mui/icons-material";
import InputField from "components/Input";
import { Debounce, handleExportWithComponent } from "utils";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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
    padding: '15px',
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

function VendorFundApproval() {

  const classes = useStyles();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const tableHead = [
    "Date",
    "VFA No",
    "Vendor ID",
    "Vendor Name",
    "Applied Amount (AED)",
    "Status",
    "Applied By",
    "Action",
  ];

  const { register } = useForm();

  const [loader, setLoader] = useState(false);

  // *For Approval Dialog
  const [approvalDialog, setApprovalDialog] = useState(false);

  // *For Vendor Fund Approval
  const [vendorFundApproval, setVendorFundApproval] = useState();
  const [fundId, setFundId] = useState();
  const [applicationId, setApplicationId] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Get Vendor Fund Approval
  const getVendorFundApproval = async (page, limit, filter) => {
    // setLoader(true)
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
      const { data } = await VendorServices.getVendorFundApproval(params)
      setVendorFundApproval(data?.approvals?.rows)
      setTotalCount(data?.approvals?.count)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }

  // *For Handle Dialog
  const handleDialog = (data) => {
    console.log(data);
    try {
      if (data?.is_approved === null) {

        setFundId(data?.id)
        setApplicationId(data?.application_id)
        setApprovalDialog(true)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Approve Reject Status
  const approveRejectStatus = async (status) => {

    try {
      let obj = {
        id: fundId,
        application_id: applicationId,
        is_approved: status
      }
      const { message } = await VendorServices.approveRejectStatus(obj)
      SuccessToaster(message)
      getVendorFundApproval()
      setApprovalDialog(false)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getVendorFundApproval(1, '', data));
  }

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Action");
    const rows = vendorFundApproval?.map((item) => [
      moment(item?.created_at).format('MM-DD-YYYY'),
      `${item?.funds?.vfa_no}-${item?.funds?.id}`,
      item?.vendor_id ?? '-',
      item?.vendor?.name ?? '-',
      item?.paid_amount ?? '-',
      item?.is_approved === null ? 'Pending' : item?.is_approved ? 'Approved' : 'Rejected',
      item?.funds?.creator?.name ?? '-',
    ])

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
    getVendorFundApproval()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>

      <Dialog
        open={approvalDialog}
        sx={{ '& .MuiDialog-paper': { width: '30%', height: "auto", borderRadius: 2, py: { xs: 2, md: 4 }, px: { xs: 3, md: 6 } } }}
      >
        <IconButton onClick={() => setApprovalDialog(false)} sx={{ position: 'absolute', right: 13, top: 13 }}>
          <CancelOutlined />
        </IconButton>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mt: 1, mb: 1.5 }}>
            Status
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-evenly', '.MuiSvgIcon-root': { fontSize: '32px !important' } }}>
            <PrimaryButton
              title={"Reject"}
              onClick={() => approveRejectStatus(false)}
              style={{ backgroundColor: Colors.iron }}
            />
            <PrimaryButton
              title={"Approve"}
              onClick={() => approveRejectStatus(true)}
              style={{ backgroundColor: Colors.primary }}
            />
          </Box>
        </Box>
      </Dialog>
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
          Vendor Fund Approval
        </Typography>
        {vendorFundApproval?.length > 0 && (
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
      <Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px', mt: 3 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={3}>
            <InputField
              size={'small'}

              inputStyle={{ backgroundColor: '#f5f5f5' }}
              label={'Search '}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
              placeholder={'Search'}
              register={register('search', {
                onChange: (e) => handleFilter({ search: e.target.value })
              })}
            />
          </Grid>
        </Grid>

        {loader ? (
          <CircleLoading />
        ) : (
          vendorFundApproval && (
            <Fragment>
              <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                fileName="Vendor Fund Approval"
              >
                <Box className='pdf-show' sx={{ display: 'none' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                      Rcvd-Applied Shipping
                    </Typography>
                    <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                  </Box>
                </Box>
                {/* ========== Table ========== */}
                <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }} className="table-box">
                  <Table stickyHeader sx={{ minWidth: 500 }}>
                    <TableHead>
                      <TableRow>
                        {tableHead.map((item, index) => (
                          <Cell className="pdf-table" key={index}>{item}</Cell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!loader ? (
                        vendorFundApproval?.length > 0 ? (
                          <Fragment>
                            {vendorFundApproval.map((item, index) => (
                              <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                                <Cell className="pdf-table">
                                  {moment(item?.created_at).format('MM-DD-YYYY')}
                                </Cell>
                                <Cell className="pdf-table">
                                  {`${item?.funds?.vfa_no}-${item?.funds?.id}`}
                                </Cell>
                                <Cell className="pdf-table">
                                  {item?.vendor_id ?? '-'}
                                </Cell>
                                <Cell className="pdf-table">
                                  {item?.vendor?.name ?? '-'}
                                </Cell>
                                <Cell className="pdf-table">
                                  {item?.paid_amount ?? '-'}
                                </Cell>
                                <Cell>
                                  <Box sx={{ cursor: item?.is_approved === null && 'pointer' }} onClick={() => handleDialog(item)} >
                                    <span className="pdf-hide">	 {item?.is_approved ? <CheckIcon /> : <PendingIcon />}</span>
                                    <Typography variant="body2">
                                      {item?.is_approved === null ? 'Pending' : item?.is_approved ? 'Approved' : 'Rejected'}
                                    </Typography>
                                  </Box>
                                </Cell>
                                <Cell className="pdf-table">
                                  {item?.funds?.creator?.name ?? '-'}
                                </Cell>
                                <Cell>
                                  <Box component={'div'}
                                    className="pdf-hide" sx={{ gap: '16px !important' }}>
                                    <Box onClick={() => navigate(`/vendor-fund-detail/${item.application_id}`)}>
                                      <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                                        <EyeIcon />
                                      </IconButton>
                                      <Typography variant="body2">
                                        Detail View
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Cell>
                              </Row>
                            ))}
                          </Fragment>
                        ) : (
                          <Row>
                            <Cell colSpan={tableHead.length + 1} align="center" sx={{ fontWeight: 600 }}>
                              No Data Found
                            </Cell>
                          </Row>
                        )) : (
                        <Row>
                          <Cell colSpan={tableHead.length + 2} align="center" sx={{ fontWeight: 600 }}>
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
              {/* ========== Pagination ========== */}
              <Pagination
                currentPage={currentPage}
                pageSize={pageLimit}
                onPageSizeChange={(size) => getVendorFundApproval(1, size.target.value)}
                tableCount={vendorFundApproval?.length}
                totalCount={totalCount}
                onPageChange={(page) => getVendorFundApproval(page, '')}
              />

            </Fragment>
          )
        )}
      </Box>
    </Box>
  );
}

export default VendorFundApproval;
