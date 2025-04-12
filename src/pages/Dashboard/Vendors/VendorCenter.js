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
  tableCellClasses,
  Paper,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tooltip
} from "@mui/material";
import Colors from "assets/Style/Colors";
import { FontFamily, EyeIcon } from "assets";
import { CircleLoading } from "components/Loaders";
import styled from "@emotion/styled";
import { ErrorToaster } from "components/Toaster";
import VendorServices from "services/Vendor";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { PrimaryButton } from "components/Buttons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CommaSeparator, handleExportWithComponent } from "utils";
import { PDFExport } from "@progress/kendo-react-pdf";
import moment from "moment";

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

function VendorCenter() {

  const navigate = useNavigate();
  const classes = useStyles();

  const contentRef = useRef(null);


  const tableHead = [
    "Vendor Code",
    "Vendor Name",
    "Currency",
    "Applied Amount",
    "FCY - Due Amt",
    "LCY - Due Amt",
    "Action",
  ];

  const [loader, setLoader] = useState(false);

  // *For Vendor Center
  const [vendorCenter, setVendorCenter] = useState();

  // *For Total Due
  const [totalFcyDue, setTotalFcyDue] = useState(0);
  const [totalLcyDue, setTotalLcyDue] = useState(0);

  // *For Get Vendor Center
  const getVendorCenter = async () => {
    setLoader(true)
    try {
      const { data } = await VendorServices.getVendorCenter()
      setVendorCenter(data?.vendors)
      let TotalFcyBalance = 0
      let TotalLcyBalance = 0
      data?.vendors.forEach(e => {
        let FcyBalance = 0
        let LcyBalance = 0
        if (e?.account && e?.total_cr) {
          FcyBalance = e?.account?.nature === 'credit' ? parseFloat(e?.total_cr_cur) - parseFloat(e?.total_dr_cur) : parseFloat(e?.total_dr_cur) - parseFloat(e?.total_cr_cur)
          LcyBalance = e?.account?.nature === 'credit' ? parseFloat(e?.total_cr) - parseFloat(e?.total_dr) : parseFloat(e?.total_dr) - parseFloat(e?.total_cr)
        }
        console.log(FcyBalance, 'FcyBalance');
        console.log(LcyBalance, 'LcyBalance');
        TotalFcyBalance += FcyBalance
        TotalLcyBalance += LcyBalance
      })
      setTotalFcyDue(TotalFcyBalance)
      setTotalLcyDue(TotalLcyBalance)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Action");
    const rows = vendorCenter?.map((item) => {
      let FcyBalance = 0;
      let LcyBalance = 0;
      if (item?.account && item?.total_cr) {
        FcyBalance = item?.account?.nature === 'credit'
          ? parseFloat(item?.total_cr_cur) - parseFloat(item?.total_dr_cur)
          : parseFloat(item?.total_dr_cur) - parseFloat(item?.total_cr_cur)
        LcyBalance = item?.account?.nature === 'credit'
          ? parseFloat(item?.total_cr) - parseFloat(item?.total_dr)
          : parseFloat(item?.total_dr) - parseFloat(item?.total_cr)
      }
      return [
        `GV-${item?.id ?? '-'}`,
        item?.name ?? '-',
        item?.currency ?? '-',
        item?.applied_amount ?? '-',
        `${FcyBalance.toFixed(2)} $`,
        `${LcyBalance.toFixed(2)} AED`
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
    getVendorCenter()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>
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
          Vendor Center
        </Typography>
        {vendorCenter?.length > 0 && (
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
      <Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px' }}>
        {vendorCenter ? (
          <Fragment>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
              fileName="Vendor Center"
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
                        <Cell className='pdf-table' key={index}>{item}</Cell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!loader ? (
                      vendorCenter?.length > 0 ? (
                        <Fragment>
                          {vendorCenter.map((item, index) => {
                            let FcyBalance = 0
                            let LcyBalance = 0
                            if (item?.account && item?.total_cr) {
                              FcyBalance = item?.account?.nature === 'credit' ? parseFloat(item?.total_cr_cur) - parseFloat(item?.total_dr_cur) : parseFloat(item?.total_dr_cur) - parseFloat(item?.total_cr_cur)
                              LcyBalance = item?.account?.nature === 'credit' ? parseFloat(item?.total_cr) - parseFloat(item?.total_dr) : parseFloat(item?.total_dr) - parseFloat(item?.total_cr)
                            }
                            return (
                              <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                                <Cell className='pdf-table'>
                                  GV-{item?.id ?? '-'}
                                </Cell>
                                <Cell className='pdf-table'>
                                  <Tooltip
                                    className='pdf-hide'
                                    title={item?.name ?? "-"}
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
                                      item?.name?.length > 12
                                        ? item?.name?.slice(0, 8) + "..."
                                        : item?.name
                                    }
                                  </Tooltip>
                                  <Box
                                    component={"div"}
                                    className='pdf-show'
                                    sx={{ display: "none !important" }}
                                  >
                                    {item?.name ?? "-"}
                                  </Box>
                                  {/* {item?.name ?? '-'} */}
                                </Cell>
                                <Cell className='pdf-table'>
                                  {item?.currency ?? '-'}
                                </Cell>
                                <Cell className='pdf-table'>
                                  {item?.applied_amount ?? '-'}
                                </Cell>
                                <Cell className='pdf-table'>
                                  {CommaSeparator(FcyBalance.toFixed(2))} $
                                </Cell>
                                <Cell className='pdf-table'>
                                  {CommaSeparator(LcyBalance.toFixed(2))} AED
                                </Cell>
                                <Cell className='pdf-table'>

                                  <Box component={'div'} className="pdf-hide" sx={{ gap: "16px !important" }}>
                                    <Box
                                      onClick={() => navigate(`/vendor-ledger/${item?.account_id}`, { state: { accountName: item?.name, nature: item?.account?.nature, currency: item?.currency } })}
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
                                  </Box>
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

              <Box sx={{ my: 4, py: 2, bgcolor: Colors.whiteSmoke }}>
                <Grid container spacing={1} justifyContent={'flex-end'}>
                  <Grid item xs={4} sm={4}>
                    <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>
                        Total Due LCY
                      </Typography>
                      <Box sx={{ textAlign: 'center', p: 1, width: '130px', bgcolor: Colors.flashWhite, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                        <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                          {totalFcyDue.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={4} sm={4}>
                    <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>
                        Total Due in $
                      </Typography>
                      <Box sx={{ textAlign: 'center', p: 1, width: '130px', bgcolor: Colors.flashWhite, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                        <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                          {totalLcyDue.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </PDFExport>

          </Fragment>
        ) : (
          <CircleLoading />
        )}
      </Box>

    </Box>
  );
}

export default VendorCenter;
