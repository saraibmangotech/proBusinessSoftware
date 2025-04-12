import React, { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses } from "@mui/material";
import { useParams } from "react-router-dom";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster } from "components/Toaster";
import styled from "@emotion/styled";
import VendorServices from "services/Vendor";
import { GeneratePDF, handleExportWithComponent } from "utils";
import moment from "moment";
import { QRCodeCanvas } from "qrcode.react";
import { Debounce } from "utils";
import { useReactToPrint } from 'react-to-print';
import ExportServices from "services/Export";
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

function ExportTTPreview() {

  const { id } = useParams();
  const contentRef = useRef(null);

  const [loader, setLoader] = useState(false);

  // *For Vendor TT
  const [ttDetail, setTtDetail] = useState();

  // *For Get TT Detail
  const getTTDetail = async () => {
    setLoader(true)
    try {
      let params = {
        tt_id: atob(id).split('-')[1]
      }
      const { data } = await ExportServices.getTTPreview(params)
      setTtDetail(data?.vendor)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }
  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: 'Shipping-Remittance',
  });

  useEffect(() => {
    if (id) {
      getTTDetail()
    }
  }, [id]);

  useEffect(() => {
    if (!loader) {
      let Url = window.location.href

      if (Url.includes('mobile')) {
        handleExportWithComponent(contentRef)
      }
    }

  }, [loader])



  return (
    <Container>

      {!loader &&
        <Box sx={{ textAlign: 'right', p: 4 }}>
          <PrimaryButton
            title="Download Invoice"
            type='button'
            style={{ backgroundColor: Colors.bluishCyan }}
            onClick={() => handleExportWithComponent(contentRef)}
          />
        </Box>
      }
      <PDFExport ref={contentRef} fileName="Shipping Remittance JV" >
        <Box sx={{ width: '1000px', mx: 4, my: 2, bgcolor: Colors.white, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>
          {!loader ? (

            <Box sx={{ p: 5 }} >
              <Grid container spacing={2} alignItems='flex-start'>
                <Grid item xs={12} sm={12}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    Shipping Remittance JV
                  </Typography>
                </Grid>
                <Grid container item xs={12} sm={12} alignItems={'center'} justifyContent={'space-between'}>
                  <Grid item sm={3.2}>
                    <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <Typography variant="body1">
                        Date:
                      </Typography>
                      <Typography variant="body1">
                        {moment(ttDetail?.created_at).format('MM-DD-YYYY')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item sm={3}>
                    <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1" sx={{ width: '150px' }}>
                        VUAF No:
                      </Typography>
                      <Typography variant="body1">
                        VUAF-{ttDetail?.id}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1" sx={{ width: '150px' }}>
                        External Ref No:
                      </Typography>
                      <Typography variant="body1">
                        {ttDetail?.external_no}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Grid item sm={12}>
                  <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <Cell>Sr</Cell>
                          <Cell>Vendor</Cell>
                          <Cell>FCY Amount</Cell>
                          <Cell>LCY Amount</Cell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <Row>
                          <Cell>
                            1
                          </Cell>
                          <Cell>
                            <Box sx={{ width: '300px' }}>
                              <Typography variant="body1">
                                {ttDetail?.vendor?.name}
                              </Typography>
                            </Box>
                          </Cell>
                          <Cell sx={{ width: '180px' }}>
                            {parseFloat(ttDetail?.fcy_amount).toFixed(2)}
                          </Cell>
                          <Cell sx={{ width: '130px' }}>
                            {parseFloat(ttDetail?.lcy_amount).toFixed(2)}
                          </Cell>
                        </Row>
                        <Row>
                          <Cell colspan={2}>
                            <b>Total</b>
                          </Cell>
                          <Cell sx={{ width: '180px' }}>
                            {parseFloat(ttDetail?.fcy_amount).toFixed(2)}
                          </Cell>
                          <Cell sx={{ width: '130px' }}>
                            {parseFloat(ttDetail?.lcy_amount).toFixed(2)}
                          </Cell>
                        </Row>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid container item xs={12} sm={12} justifyContent={'space-between'}>
                  <Grid item sm={5}>
                    <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ width: '180px' }}>
                        TT Rate :
                      </Typography>
                      <Typography variant="body1">
                        {ttDetail?.ex_rate}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item sm={4}>
                    <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1" sx={{ width: '170px' }}>
                        TT and Bank Charges
                      </Typography>
                      <Typography variant="body1">
                        {parseFloat(ttDetail?.tt_charges).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1" sx={{ width: '170px' }}>
                        VAT on Bank Charges
                      </Typography>
                      <Typography variant="body1">
                        {parseFloat(ttDetail?.tt_charges).toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Grid container item xs={12} sm={12} alignItems={'center'} justifyContent={'space-between'}>
                  <Grid item sm={5}>
                    <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ width: '180px' }}>
                        TT Fund form Account:
                      </Typography>
                      <Typography variant="body1">
                        {ttDetail?.account?.name}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item sm={4}>
                    <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1" sx={{ width: '170px' }}>
                        Total Amount Paid :
                      </Typography>
                      <Typography variant="body1" sx={{ textAlign: 'right' }}>
                        {parseFloat(ttDetail?.total_amount).toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6} >
                  <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ width: '180px' }}>
                      Accountant Notes :
                    </Typography>
                    <Typography variant="body1">
                      {ttDetail?.notes}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mr: 4 }}>
                    <QRCodeCanvas value={window.location.origin + `/tt-preview/${id}`} />
                  </Box>
                </Grid>
              </Grid>
            </Box>

          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </PDFExport>

    </Container>
  );
}

export default ExportTTPreview;