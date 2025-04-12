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
  Tooltip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { EyeIcon, FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import { CircleLoading } from "components/Loaders";
import Pagination from "components/Pagination";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";
import ClientServices from "services/Client";
import DatePicker from "components/DatePicker";
import AuctionHouseServices from "services/AuctionHouse";
import { Debounce, handleExportWithComponent } from "utils";
import { Delete } from "@mui/icons-material";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
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

function VehicleTTList() {
  const classes = useStyles();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const tableHead = [
    "Date",
    "External Ref No",
    "Via",
    "FCY Currency",
    "FCY Amount",
    "LCY Amount (AED)",
    "TT Charges (AED)",
    "VAT Charges (AED)",
    "Total Amount (AED)",
    "Note",
    "User",
    "Action",
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loader, setLoader] = useState(false);

  // *For TT List
  const [clientTT, setClientTT] = useState();

  // *For Auction House
  const [auctionHouses, setAuctionHouses] = useState([]);
  const [selectedAuctionHouses, setSelectedAuctionHouses] = useState(null);


  // *For Dialog Box
  const [confirmationDialog, setConfirmationDialog] = useState(false);


  const [ttId, setTtId] = useState()

  // *For Client Dropdown
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Handle Date
  const handleFromDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setFromDate("invalid");
        return;
      }
      setFromDate(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const handleToDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setToDate("invalid");
        return;
      }
      setToDate(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Apply Filters
  const applyFilter = async () => {
    try {
      let data = {
        to_date: moment(toDate).format("MM-DD-YYYY"),
        from_date: moment(fromDate).format("MM-DD-YYYY"),
      };

      getTT(1, "", data);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Auction Houses
  const getAuctionHouses = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search,
      };
      const { data } = await AuctionHouseServices.getAuctionHouses(params);
      setAuctionHouses(data?.auction_houses.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Clients
  const getClientDropdown = async () => {
    try {
      const { data } = await ClientServices.getClientDropdown();

      setClients(data?.customers?.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Delete Buyer ID
  const deleteTT = async () => {
    try {
      let params = { tt_id: ttId };
      const { message } = await ClientServices.deleteTT(params);
      SuccessToaster(message);
      setConfirmationDialog(false);
      getTT()

    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For TT List
  const getTT = async (page, limit, filter) => {
    try {
      const Page = page ? page : currentPage;
      const Limit = limit ? limit : pageLimit;
      const Filter = { ...filters, ...filter };
      setCurrentPage(Page);
      setPageLimit(Limit);
      setFilters(Filter);
      let params = {
        page: Page,
        limit: Limit,
      };
      params = { ...params, ...Filter };
      const { data } = await ClientServices.getTT(params);
      setTotalCount(data?.tt?.count);
      setClientTT(data?.tt?.rows);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false);
    }
  };

  // // *For Apply Filters
  // const applyFilter = async () => {
  // 	try {
  // 		let data = {
  // 			filter: selectedClient?.id,
  // 		};

  // 		getTT(1, "", data);
  // 	} catch (error) {
  // 		ErrorToaster(error);
  // 	}
  // };

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Action");
    const rows = clientTT?.map((item) => [
      moment(item?.createdAt).format("MM-DD-YYYY"),
      item?.external_ref_no,
      item?.via ?? "-",
      item?.currency ?? "-",
      item?.total_fcy_amount ?? "-",
      item?.total_lcy_amount ?? "-",
      item?.tt_charges ?? "-",
      item?.vat_charges ?? "-",
      item?.total_paid_aed ?? "-",
      item?.notes ?? '-',
      item?.creator?.name ?? '-',
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
    getTT();
    getClientDropdown();
    getAuctionHouses();
  }, []);

  return (
    <Box sx={{ m: 4, mb: 5 }}>
      {/* ========== Confirmation Dialog ========== */}
      <ConfirmationDialog
        open={confirmationDialog}
        onClose={() => setConfirmationDialog(false)}
        message={"Are you sure you want to delete this?"}
        action={() => deleteTT()}
      />
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
          variant="h5"
          sx={{
            color: Colors.charcoalGrey,
            fontFamily: FontFamily.NunitoRegular,
          }}
        >
          Vehicle TT List
        </Typography>
        {clientTT?.length > 0 && (
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

      <Box
        component={"form"}
        onSubmit={handleSubmit(applyFilter)}
        sx={{
          m: "20px 0 20px 5px",
          p: "20px",
          bgcolor: Colors.feta,
          border: `1px solid ${Colors.iron}`,
          borderRadius: "9px",
        }}
      >
        <Grid container spacing={2} alignItems={"center"} columns={10}>
          <Grid item xs={12} sm={3}>
            <DatePicker
              disableFuture={true}
              size="small"
              label={"From Date"}
              value={fromDate}
              onChange={(date) => handleFromDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <DatePicker
              disabled={fromDate ? false : true}
              disableFuture={true}
              size="small"
              minDate={fromDate}
              label={"To Date"}
              value={toDate}
              onChange={(date) => handleToDate(date)}
            />
          </Grid>

          <Grid item xs={12} md={2} sx={{ height: "55px" }}>
            <Box
              sx={{
                mt: "11px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <PrimaryButton type="submit" title={"Search"} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {false ? (
        <CircleLoading />
      ) : (
        clientTT && (
          <Fragment>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName="Vehicle TT List">
              <Box className='pdf-show' sx={{ display: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    Vehicle TT List
                  </Typography>
                  <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                </Box>
              </Box>
              {/* ========== Table ========== */}
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                  borderRadius: 2,
                  maxHeight: "calc(100vh - 330px)",
                  mt: 2,
                }}
                className="table-box"
              >
                <Table stickyHeader sx={{ minWidth: 500 }}>
                  <TableHead>
                    <TableRow>
                      {tableHead.map((item, index) => (
                        <Cell className={`pdf-table ${item == "Action" && "pdf-hide"}`} key={index}>{item}</Cell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {true ? (
                      clientTT?.length > 0 ? (
                        <Fragment>
                          {clientTT.map((item, index) => (
                            <Row
                              key={index}
                              sx={{
                                bgcolor: index % 2 !== 0 && "#EFF8E7",
                              }}
                            >
                              <Cell className='pdf-table'>
                                {moment(item?.createdAt).format("MM-DD-YYYY")}
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.external_ref_no}
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
                                  {item?.external_ref_no.length > 20
                                    ? item?.external_ref_no?.slice(0, 8) + "..."
                                    : item?.external_ref_no}{" "}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.external_ref_no}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.via}
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
                                  {item?.via?.length > 15
                                    ? item?.via?.slice(0, 12) + "..."
                                    : item?.via}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.via ?? "-"}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>{item?.currency ?? "-"}</Cell>
                              <Cell className='pdf-table'>{item?.total_fcy_amount ?? "-"}</Cell>
                              <Cell className='pdf-table'>{item?.total_lcy_amount ?? "-"}</Cell>
                              <Cell className='pdf-table'>{item?.tt_charges ?? "-"}</Cell>
                              <Cell className='pdf-table'>{item?.vat_charges ?? "-"}</Cell>
                              <Cell className='pdf-table'>{item?.total_paid_aed ?? "-"}</Cell>
                              <Cell className='pdf-table-long'>
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.notes ?? '-'}
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
                                  {item?.notes?.length > 20 ? item?.notes?.slice(0, 15) + "..." : item?.notes}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show pdf-text-wrap'
                                  sx={{ display: "none !important", whiteSpace: 'pre-wrap !important' }}
                                >
                                  {item?.notes ?? '-'}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.creator?.name ?? '-'}
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
                                  {item?.creator?.name?.length > 8 ? item?.creator?.name?.slice(0, 5) + "..." : item?.creator?.name}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.creator?.name ?? '-'}
                                </Box>
                              </Cell>
                              <Cell className="pdf-hide" sx={{ display: 'flex', gap: 2 }}>
                                <Box component={'div'} sx={{ gap: "16px !important" }}>
                                  <Box
                                    onClick={() =>
                                      navigate(`/vehicle-tt-detail/${item?.id}`)
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
                                </Box>
                                <Box
                                  component={'div'} className="pdf-hide"
                                  onClick={() => {
                                    setConfirmationDialog(true);
                                    setTtId(item?.id)


                                  }}
                                >
                                  <IconButton
                                    sx={{
                                      bgcolor: Colors.danger,
                                      "&:hover": {
                                        bgcolor: Colors.danger,
                                      },
                                    }}
                                  >
                                    <Delete
                                      sx={{
                                        color: Colors.white,
                                        height: "16px !important",
                                      }}
                                    />
                                  </IconButton>
                                  <Typography variant="body2">
                                    Delete
                                  </Typography>
                                </Box>
                              </Cell>
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
            {/* ========== Pagination ========== */}
            <Pagination
              currentPage={currentPage}
              pageSize={pageLimit}
              onPageSizeChange={(size) => getTT(1, size.target.value)}
              tableCount={clientTT?.length}
              totalCount={totalCount}
              onPageChange={(page) => getTT(page, "")}
            />
          </Fragment>
        )
      )}
    </Box>
  );
}

export default VehicleTTList;
