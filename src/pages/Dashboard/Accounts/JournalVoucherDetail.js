import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Grid, Paper, CardMedia, Typography, Container, TableCell, TableContainer, TableHead, TableRow, TableBody, Table, tableCellClasses } from '@mui/material';
import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';
import Colors from 'assets/Style/Colors';
import { ErrorToaster } from 'components/Toaster';
import { PrimaryButton } from 'components/Buttons';
import { GeneratePDF, handleExportWithComponent } from 'utils';
import { FontFamily, Images, InvoiceGlobal, InvoiceLocation, InvoiceMail, InvoicePhone } from 'assets';
import { makeStyles } from '@mui/styles';
import { QRCodeCanvas } from 'qrcode.react';
import FinanceServices from 'services/Finance';
import { useReactToPrint } from 'react-to-print';
import { PDFExport } from '@progress/kendo-react-pdf';

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

const useStyle = makeStyles({
  headingBg: {
    margin: '32px 0px',
    padding: '12px 0px',
    textAlign: 'center',
  },
  heading: {
    color: Colors.white,
    textTransform: 'uppercase',
    fontWeight: 300,
    fontFamily: FontFamily.NunitoRegular
  },
  text: {
    color: Colors.smokeyGrey,
    fontWeight: 300,
    fontFamily: FontFamily.NunitoRegular
  },
  tableCell: {
    backgroundColor: Colors.aliceBlue,
    border: '0.25px solid #D9D9D9',
    '& .MuiTypography-root': {
      padding: '4px 12px'
    }
  }
})

function JournalVoucherDetail() {

  const { id } = useParams();
  const contentRef = useRef(null);
  const classes = useStyle();

  const tableHead = ['Sr.No', 'COA Code', 'COA Name', 'Debit (AED)', 'Credit (AED)', 'Description']

  const [loader, setLoader] = useState(true);

  // *For Journal Voucher Detail
  const [voucherDetail, setVoucherDetail] = useState();

  // *For Get Journal Voucher Detail
  const getJournalVoucherDetail = async () => {
    setLoader(true)
    try {
      let params = {
        voucher_id: id
      }
      const { data } = await FinanceServices.getJournalVoucherDetail(params)
      setVoucherDetail(data.voucher)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }



  useEffect(() => {
    if (id) {
      getJournalVoucherDetail()
    }
  }, [id]);

  return (
    <Container>
      {/* {!loader && (
        <Box sx={{ textAlign: "right", p: 3 }}>
          <PrimaryButton
            title="Download PDF"
            type="button"
           
            onClick={() => handleExportWithComponent(contentRef)}
          />
        </Box>
      )} */}
      <PDFExport ref={contentRef}
        fileName="Journal Voucher"
        landscape={true} paperSize="A4" margin={5}
      >
        <Box
          sx={{
            width: "100%",
            p:3,
          
          }}
        >
          {!loader ? (
            <Box >
             
              <Box sx={{ mx: 1 }}>
                <Grid container spacing={0} justifyContent={"space-between"}>
                  <Grid item xs={12} sm={11} md={12}>
                    <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
                      <Table stickyHeader sx={{ minWidth: 500 }}>
                        <TableHead>
                          <TableRow>
                            {tableHead.map((item, index) => (
                              <Cell key={index}>{item}</Cell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {voucherDetail?.entries.map((item, index) => {
                            return (
                              <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                                <Cell>
                                  {index + 1}
                                </Cell>
                                <Cell>
                                  {item?.account?.account_code ?? '-'}
                                </Cell>
                                <Cell>
                                  {item?.account?.name ?? '-'}
                                </Cell>
                                <Cell>
                                  {item?.debit ?? '-'}
                                </Cell>
                                <Cell>
                                  {item?.credit ?? '-'}
                                </Cell>
                                <Cell>
                                  {item?.description ?? '-'}
                                </Cell>
                              </Row>
                            )
                          })}
                          <Row sx={{ bgcolor: '#EEFBEE' }}>
                            <Cell colSpan={3}>
                              <Typography variant="body1" sx={{ fontWeight: 700, }}>
                                Total
                              </Typography>
                            </Cell>
                            <Cell>
                              <Typography variant="body1" sx={{ fontWeight: 700, }}>
                                {parseFloat(voucherDetail?.total_amount).toFixed(2)}
                              </Typography>
                            </Cell>
                            <Cell>
                              <Typography variant="body1" sx={{ fontWeight: 700, }}>
                                {parseFloat(voucherDetail?.total_amount).toFixed(2)}
                              </Typography>
                            </Cell>
                            <Cell>
                            </Cell>
                          </Row>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                
                </Grid>
              </Box>
              
             
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </PDFExport>
    </Container>
  );
}

export default JournalVoucherDetail;