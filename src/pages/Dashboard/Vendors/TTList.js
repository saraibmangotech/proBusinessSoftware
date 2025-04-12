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
  Tooltip,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { CheckIcon, EyeIcon, FontFamily, PendingIcon } from "assets";
import VendorServices from "services/Vendor";
import { ErrorToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import { CircleLoading } from "components/Loaders";
import Pagination from "components/Pagination";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";
import { Edit } from "@mui/icons-material"; import * as XLSX from "xlsx";
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

function TTList() {

  const classes = useStyles();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const tableHead = [
    "Date",
    "External Ref No",
    "Vendor",
    "Via",
    "FCY Currency",
    "FCY Amount",
    "LCY Amount",
    "TT Charges",
    "VAT Charges",
    "Total Amount",
    "Paid Amount",
    "Balance",
    "Status",
    "Note",
    "User",
    "Action",
  ];

  const { register, handleSubmit, formState: { errors } } = useForm();

  const [loader, setLoader] = useState(false);

  // *For Vendor Dropdown
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // *For Paid Status
  const [selectedStatus, setSelectedStatus] = useState(null);

  // *For TT List
  const [vendorTT, setVendorTT] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Vendor
  const getVendorDropdown = async () => {
    try {
      const { data } = await VendorServices.getVendorDropdown()
      setVendors(data?.vendors)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For TT List
  const getTT = async (page, limit, filter) => {
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
      const { data } = await VendorServices.getTT(params)
      setTotalCount(data?.tt?.count)
      setVendorTT(data?.tt?.rows)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Apply Filters
  const applyFilter = async () => {
    try {
      let data = {
        vendor_id: selectedVendor?.id,
      }
      if (selectedStatus) {
        data.is_paid = selectedStatus?.id === 'paid' ? true : false
      }
      getTT(1, '', data)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Action");
    const rows = vendorTT?.map((item) => [
      moment(item?.created_at).format('MM-DD-YYYY'),
      item?.external_no ?? '-',
      item?.vendor?.name ?? '-',
      item?.via ?? '-',
      item?.fcy_currency ?? '-',
      item?.fcy_amount ?? '-',
      item?.lcy_amount ?? '-',
      item?.tt_charges ?? '-',
      item?.vat_charges ?? '-',
      item?.total_amount ?? '-',
      item?.paid_amount ?? '-',
      parseFloat(parseFloat(item?.total_amount) - parseFloat(item?.paid_amount)).toFixed(2) ?? '-',
      item?.is_paid ? 'Applied' : 'Un Applied',
      item?.notes ?? "-",
      item?.creator?.name ?? "-",
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
    getVendorDropdown()
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
          Vendor TT’s
        </Typography>
        {vendorTT?.length > 0 && (
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
      <Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px', mt: 3 }}>
        <Box
          component={'form'}
          onSubmit={handleSubmit(applyFilter)}
          sx={{
            m: "20px 0 20px 5px",

          }}
        >
          <Grid
            container
            spacing={1}
            alignItems={"center"}
            columns={10}
          >
            <Grid item md={2}>
              <SelectField
                size="small"
                label={"Vendor"}
                options={vendors}
                selected={selectedVendor}
                onSelect={(value) => setSelectedVendor(value)}
                error={errors?.vendor?.message}
                register={register("vendor", {
                  required: 'Please select vendor.',
                })}
              />
            </Grid>
            <Grid item md={2}>
              <SelectField
                size="small"
                label={"Status"}
                options={[{ id: 'unpaid', name: 'Un Applied' }, { id: 'paid', name: 'Applied' }]}
                selected={selectedStatus}
                onSelect={(value) => setSelectedStatus(value)}
                error={errors?.status?.message}
                register={register("status")}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Box
                sx={{
                  mt: "11px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <PrimaryButton
                  title={"Search"}
                  type={'submit'}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>

        {loader ? (
          <CircleLoading />
        ) : (
          vendorTT && (
            <Fragment>
              <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                fileName="Vendor TT’s"
              >
                <Box className='pdf-show' sx={{ display: 'none' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                      Vendor TT’s
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
                        vendorTT?.length > 0 ? (
                          <Fragment>
                            {vendorTT.map((item, index) => (
                              <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                                <Cell className="pdf-table" >
                                  {moment(item?.created_at).format('MM-DD-YYYY')}
                                </Cell>
                                <Cell className="pdf-table" >
                                  {item?.external_no ?? '-'}
                                </Cell>
                                <Cell className="pdf-table" >
                                  {item?.vendor?.name ?? '-'}
                                </Cell>
                                <Cell className="pdf-table" >
                                  {item?.via ?? '-'}
                                </Cell>
                                <Cell className="pdf-table" >
                                  {item?.fcy_currency ?? '-'}
                                </Cell>
                                <Cell className="pdf-table" >
                                  {item?.fcy_amount ?? '-'}
                                </Cell>
                                <Cell className="pdf-table" >
                                  {item?.lcy_amount ?? '-'}
                                </Cell>
                                <Cell className="pdf-table" >
                                  {item?.tt_charges ?? '-'}
                                </Cell>
                                <Cell className="pdf-table" >
                                  {item?.vat_charges ?? '-'}
                                </Cell>
                                <Cell className="pdf-table" >
                                  {item?.total_amount ?? '-'}
                                </Cell>
                                <Cell className="pdf-table" >
                                  {item?.paid_amount ?? '-'}
                                </Cell>
                                <Cell className="pdf-table" >
                                  {parseFloat(parseFloat(item?.total_amount) - parseFloat(item?.paid_amount)).toFixed(2) ?? '-'}
                                </Cell>
                                <Cell className="pdf-table" >
                                  {item?.is_paid ?? '-'}
                                  <Box>
                                    <span className="pdf-hide">	 {item?.is_paid ? <CheckIcon /> : <PendingIcon />}</span>
                                    <Typography variant="body2">
                                      {item?.is_paid ? 'Applied' : 'Un Applied'}
                                    </Typography>
                                  </Box>
                                </Cell>
                                <Cell className="pdf-table" >
                                  <Tooltip
                                    className='pdf-hide'
                                    title={item?.notes ?? "-"}
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
                                      item?.notes?.length > 12
                                        ? item?.notes?.slice(0, 8) + "..." : item?.notes
                                    }
                                  </Tooltip>
                                  <Box
                                    component={"div"}
                                    className='pdf-show'
                                    sx={{ display: "none !important" }}
                                  >
                                    {item?.notes ?? "-"}
                                  </Box>
                                </Cell>
                                <Cell className="pdf-table" >
                                  <Tooltip
                                    className='pdf-hide'
                                    title={item?.creator?.name ?? "-"}
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
                                      item?.creator?.name?.length > 12
                                        ? item?.creator?.name?.slice(0, 8) + "..." : item?.creator?.name
                                    }
                                  </Tooltip>
                                  <Box
                                    component={"div"}
                                    className='pdf-show'
                                    sx={{ display: "none !important" }}
                                  >
                                    {item?.creator?.name ?? "-"}
                                  </Box>
                                </Cell>
                                <Cell sx={{ display: 'flex', gap: 2 }}>
                                  <Box component={'div'} className="pdf-hide" sx={{ gap: '16px !important' }}>
                                    <Box onClick={() => navigate(`/tt-detail/${item?.id}`)}>
                                      <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                                        <EyeIcon />
                                      </IconButton>
                                      <Typography variant="body2">
                                        View
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box onClick={() => navigate(`/update-tt/${item.id}`)}>
                                    <IconButton sx={{ bgcolor: Colors.bluishCyan, '&:hover': { bgcolor: Colors.bluishCyan } }}>
                                      <Edit sx={{ color: Colors.white, height: '16px !important' }} />
                                    </IconButton>
                                    <Typography variant="body2">
                                      Edit
                                    </Typography>
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
                onPageSizeChange={(size) => getTT(1, size.target.value)}
                tableCount={vendorTT?.length}
                totalCount={totalCount}
                onPageChange={(page) => getTT(page, '')}
              />

            </Fragment>
          )
        )}
      </Box>
    </Box>
  );
}

export default TTList;
