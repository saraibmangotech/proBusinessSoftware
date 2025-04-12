import React, { Fragment, useEffect, useState } from "react";
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
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { CheckIcon, EyeIcon, FontFamily, PendingIcon } from "assets";
import VendorServices from "services/Vendor";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import { CircleLoading } from "components/Loaders";
import Pagination from "components/Pagination";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import moment from "moment/moment";
import { useNavigate, useParams } from "react-router-dom";
import { CancelOutlined } from "@mui/icons-material";
import InputField from "components/Input";
import { Debounce } from "utils";

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
  },
  text: {
    color: Colors.smokeyGrey,
    fontWeight: 300,
    fontFamily: FontFamily.NunitoRegular
  },
})

function VendorFundDetail() {

  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();

  const tableHead = [
    "Purchase Date",
    "Model",
    "Make",
    "LOT#",
    "VIN#",
    "Color",
    "Loading Location",
    "Container#",
    "Arrived Date",
    "Shipping Charges",
    "Towing",
    "Clearance",
    "Late Fee",
    "Storage",
    "Category A",
    "Broker Fee",
    "Title Fee",
    "Inspection",
    "Other Charges",
    "Custom Duty",
    "Total Amount",
    "Applied Status",
    "Applied Amount",
  ];

  const [loader, setLoader] = useState(false);

  // *For Vendor Fund Approval
  const [vendorFundApprovalDetail, setVendorFundApprovalDetail] = useState();

  // *For Get Vendor Fund Approval
  const getVendorAppliedFundsDetail = async () => {
    setLoader(true)
    try {
      let params = {
        application_id: id,
      }
      const { data } = await VendorServices.getVendorAppliedFundsDetail(params)
      setVendorFundApprovalDetail(data?.details)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    if (id) {
      getVendorAppliedFundsDetail()
    }
  }, [id]);

  return (
    <Box sx={{ m: 4, mb: 2 }}>

      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        Vendor Fund Detail
      </Typography>

      {loader ? (
        <CircleLoading />
      ) : (
        vendorFundApprovalDetail && (
          <Fragment>

            <Grid container spacing={1}>
              <Grid item md={6}>
                <Typography variant="subtitle1" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                  TT Information
                </Typography>
                <Box>
                  <Grid container spacing={1}>
                    <Grid item xs={3} sm={3} md={3}>
                      <Typography variant="body1">
                        External No:
                      </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9}>
                      <Typography variant="body1" className={classes.text}>
                        {vendorFundApprovalDetail?.tt_details?.external_no ?? "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} sm={3} md={3}>
                      <Typography variant="body1">
                        Exchange Rate:
                      </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9}>
                      <Typography variant="body1" className={classes.text}>
                        {vendorFundApprovalDetail?.tt_details?.ex_rate ?? "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} sm={3} md={3}>
                      <Typography variant="body1">
                        FCY Amount:
                      </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9}>
                      <Typography variant="body1" className={classes.text}>
                        {vendorFundApprovalDetail?.tt_details?.fcy_amount ?? "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} sm={3} md={3}>
                      <Typography variant="body1">
                        LCY Amount:
                      </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9}>
                      <Typography variant="body1" className={classes.text}>
                        {vendorFundApprovalDetail?.tt_details?.lcy_amount ?? "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} sm={3} md={3}>
                      <Typography variant="body1">
                        TT Charges:
                      </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9}>
                      <Typography variant="body1" className={classes.text}>
                        {vendorFundApprovalDetail?.tt_details?.tt_charges ?? "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} sm={3} md={3}>
                      <Typography variant="body1">
                        VAT Charges:
                      </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9}>
                      <Typography variant="body1" className={classes.text}>
                        {vendorFundApprovalDetail?.tt_details?.vat_charges ?? "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} sm={3} md={3}>
                      <Typography variant="body1">
                        Total Amount:
                      </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9}>
                      <Typography variant="body1" className={classes.text}>
                        {vendorFundApprovalDetail?.tt_details?.total_amount ?? "-"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              <Grid item md={6}>
                <Typography variant="subtitle1" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                  Vendor Information
                </Typography>
                <Box>
                  <Grid container spacing={1}>
                    <Grid item xs={3} sm={3} md={3}>
                      <Typography variant="body1">
                        Name:
                      </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9}>
                      <Typography variant="body1" className={classes.text}>
                        {vendorFundApprovalDetail?.vendor?.name ?? "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} sm={3} md={3}>
                      <Typography variant="body1">
                        Type:
                      </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9}>
                      <Typography variant="body1" className={classes.text}>
                        {vendorFundApprovalDetail?.vendor?.type ?? "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} sm={3} md={3}>
                      <Typography variant="body1">
                        Currency:
                      </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9}>
                      <Typography variant="body1" className={classes.text}>
                        {vendorFundApprovalDetail?.vendor?.currency.toUpperCase() ?? "-"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>

            {/* ========== Table ========== */}
            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }}>
              <Table stickyHeader sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow>
                    {tableHead.map((item, index) => (
                      <Cell key={index}>{item}</Cell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendorFundApprovalDetail?.details?.length > 0 ? (
                    <Fragment>
                      {vendorFundApprovalDetail?.details.map((item, index) => {
                        const total = vendorFundApprovalDetail?.vendor?.type === 'shipping' ? item?.costing?.shipping_vendor_total : vendorFundApprovalDetail?.vendor?.type === 'towing' ? item?.costing?.towing_vendor_total : item?.costing?.clearance_vendor_total
                        const paidAmount = vendorFundApprovalDetail?.vendor?.type === 'shipping' ? item?.costing?.shipping_vendor_paid : vendorFundApprovalDetail?.vendor?.type === 'towing' ? item?.costing?.towing_vendor_paid : item?.costing?.clearance_vendor_paid
                        const balance = parseFloat(total) - parseFloat(paidAmount)
                        const status = balance === 0 ? 'Paid' : parseFloat(balance) === parseFloat(total) ? 'UnPaid' : 'Partial Paid'
                        return (
                          <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                            <Cell>
                              {item?.costing?.booking?.purchase_date ? moment(item?.costing?.booking?.purchase_date).format('DD-MMM-YYYY') : '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.booking?.veh_model?.name ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.booking?.veh_make?.name ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.booking?.vin ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.booking?.lot_number ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.booking?.color ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.shipping?.loading_port?.name ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.shipping?.container_no ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.vehicle?.arrived_galaxy_date ? moment(item?.costing?.vehicle?.arrived_galaxy_date).format('DD-MMM-YYYY') : '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.shipping_charges ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.towing_charges ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.clearance_charges ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.late_fee ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.storage ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.category_a ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.broker_fee ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.title_fee ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.inspection ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.other_charges ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.costing?.custom_duty ?? '-'}
                            </Cell>
                            <Cell>
                              {total}
                            </Cell>
                            <Cell>
                              <Box sx={{ 'path': { fill: status === 'Partial Paid' && Colors.bluishCyan } }}>
                                {status === 'Paid' ? <CheckIcon /> : status === 'UnPaid' ? <PendingIcon /> : <CheckIcon />}
                                <Typography variant="body2">
                                  {status}
                                </Typography>
                              </Box>
                            </Cell>
                            <Cell>
                              {item?.applied_amount ?? '-'}
                            </Cell>
                          </Row>
                        )
                      })}
                    </Fragment>
                  ) : (
                    <Row>
                      <Cell colSpan={tableHead.length + 1} align="center" sx={{ fontWeight: 600 }}>
                        No Data Found
                      </Cell>
                    </Row>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

          </Fragment>
        )
      )}

    </Box>
  );
}

export default VendorFundDetail;
