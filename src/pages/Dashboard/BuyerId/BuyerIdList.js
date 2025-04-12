import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  tableCellClasses,
  IconButton,
  CircularProgress,
  Tooltip,
  Chip,
  Grid,
  InputAdornment,
} from "@mui/material";
import styled from "@emotion/styled";
import { FontFamily, SearchIcon } from "assets";
import Colors from "assets/Style/Colors";
import { CircleLoading } from "components/Loaders";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { Delete, Edit } from "@mui/icons-material";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import BuyerServices from "services/Buyer";
import { makeStyles } from "@mui/styles";
import Pagination from "components/Pagination";
import { useNavigate } from "react-router-dom";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import { Debounce, formatPermissionData, handleExportWithComponent } from "utils";
import SelectField from "components/Select";
import AuctionHouseServices from "services/AuctionHouse";
import { addPermission } from "redux/slices/navigationDataSlice";
import { useDispatch } from "react-redux";
import { PrimaryButton } from "components/Buttons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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

function BuyerIdList() {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const contentRef = useRef(null);

  const { register } = useForm();

  const tableHead = [
    "Buyer ID",
    "Category",
    "Email",
    "Auction House",
    "Customers",
    "Status",
    "Active",
    "Actions",
  ];

  const [loader, setLoader] = useState(false);

  // *For Buyer ID
  const [buyerIds, setBuyerIds] = useState();
  const [buyerId, setBuyerId] = useState("");

  // *For Dialog Box
  const [confirmationDialog, setConfirmationDialog] = useState(false);

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Auction House
  const [auctionHouses, setAuctionHouses] = useState([]);
  const [selectedAuctionHouses, setSelectedAuctionHouses] = useState(null);

  // *For Permissions
  const [permissions, setPermissions] = useState();

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

  // *For Get Buyer IDs
  const getBuyerIds = async (page, limit, filter) => {
    // setLoader(true)
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
      const { data } = await BuyerServices.getBuyerIds(params);
      setBuyerIds(data?.buyer_ids?.rows);
      setTotalCount(data?.buyer_ids?.count);
      setPermissions(formatPermissionData(data?.permissions));
      data?.permissions.forEach((e) => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      });
    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };

  // *For Delete Buyer ID
  const deleteBuyerId = async () => {
    try {
      let params = { buyer_id: buyerId };
      const { message } = await BuyerServices.deleteBuyerId(params);
      SuccessToaster(message);
      setConfirmationDialog(false);
      getBuyerIds();
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getBuyerIds(1, "", data));
  };

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Actions");
    const rows = buyerIds?.map((item) => {
      const issuedNames = item?.issued.map((q) => q.user?.name).join(", ");
      return [
        item?.name ?? "-",
        item?.type ?? "-",
        item?.email ?? "-",
        issuedNames,
        item?.auction?.name ?? "-",
        item?.issued.length === 4 ? "Full" : item?.issued.length === 0 ? "Not Assigned" : "Partial",
        item?.is_active ? "Active" : "In Active",
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
    getBuyerIds();
    getAuctionHouses();
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>
      {/* ========== Confirmation Dialog ========== */}
      <ConfirmationDialog
        open={confirmationDialog}
        onClose={() => setConfirmationDialog(false)}
        message={"Are you sure you want to delete this?"}
        action={() => deleteBuyerId()}
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
          Buyer ID List
        </Typography>
        {buyerIds?.length > 0 && (
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
          <Grid item xs={12} sm={3}>
            <InputField
              size={"small"}
              label={"Search"}
              placeholder={"Search Buyer ID"}
              inputStyle={{ backgroundColor: '#f5f5f5' }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
              register={register("buyerId", {
                onChange: (e) => handleFilter({ search: e.target.value }),
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <SelectField
              size={"small"}
              onSearch={(v) => getAuctionHouses(v)}
              label={"Auctions Houses"}
              options={auctionHouses}
              selected={selectedAuctionHouses}
              onSelect={(value) => {
                setSelectedAuctionHouses(value);
                handleFilter({ auctions: value?.id });
              }}
              register={register("auctionHouses")}
            />
          </Grid>
        </Grid>

        {buyerIds ? (
          <Fragment>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName='Buyer ID List' >
              <Box className='pdf-show' sx={{ display: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    Buyer Id List
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
                }}
                className='table-box'
              >
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
                      buyerIds?.length > 0 ? (
                        <Fragment>
                          {buyerIds.map((item, index) => {
                            // Extracting names from the "issued" array
                            const issuedNames = item?.issued
                              .map((q) => q.user?.name)
                              .join(", ");



                            return (
                              <Row
                                key={index}
                                sx={{ bgcolor: index % 2 !== 0 && "#EFF8E7" }}
                              >
                                <Cell className='pdf-table'>{item?.name ?? "-"}</Cell>
                                <Cell className='pdf-table'>{item?.type ?? "-"}</Cell>
                                <Cell className='pdf-table'>
                                  <Tooltip
                                    className="pdf-hide"
                                    title={item?.email ?? "-"}
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
                                    {item?.email.length > 20 ? item?.email.slice(0, 20) + "..." : item?.email}
                                  </Tooltip>
                                  <Box component={"div"} sx={{ display: "none !important" }} className="pdf-show">
                                    {item?.email ?? "-"}
                                  </Box>
                                </Cell>
                                <Cell className='pdf-table'>{item?.auction?.name ?? "-"}</Cell>
                                <Cell className='pdf-table-long'>
                                  <Tooltip
                                    className="pdf-hide"
                                    title={issuedNames}
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
                                    {issuedNames.length > 17 ? issuedNames?.slice(0, 8) + "..." : issuedNames}
                                  </Tooltip>
                                  <Box component={"div"} sx={{ display: "none !important", whiteSpace: 'pre-wrap !important' }}
                                    className="pdf-show pdf-text-wrap"
                                  >
                                    {issuedNames}
                                  </Box>
                                </Cell>
                                <Cell className='pdf-table'>
                                  {item?.issued.length === 4
                                    ? "Full"
                                    : item?.issued.length === 0
                                      ? "Not Assigned"
                                      : "Partial"}
                                </Cell>
                                <Cell className='pdf-table'>
                                  <Box
                                    component={"div"}
                                    className="pdf-hide"
                                    sx={{
                                      bgcolor: item?.is_active
                                        ? Colors.success + 26
                                        : Colors.danger + 26,
                                      color: item?.is_active
                                        ? Colors.success
                                        : Colors.danger,
                                      height: '30px',
                                      width: '70px',
                                      borderRadius: '20px'
                                      ,

                                      textTransform: "capitalize",
                                      fontFamily: FontFamily.NunitoRegular,

                                    }}>
                                    {item?.is_active ? 'Active' : 'In Active'}
                                  </Box>
                                  <Box
                                    component={"div"}
                                    className="pdf-show"
                                    sx={{ display: "none !important" }}
                                  >
                                    {item?.is_active ? 'Active' : 'In Active'}
                                  </Box>
                                </Cell>
                                <Cell className='pdf-table'>
                                  <Box component={'div'} className="pdf-hide" sx={{ gap: "16px !important" }}>
                                    {permissions?.update && (
                                      <Box
                                        onClick={() =>
                                          navigate("/update-buyer-id", {
                                            state: item,
                                          })
                                        }
                                      >
                                        <IconButton
                                          sx={{
                                            bgcolor: Colors.bluishCyan,
                                            "&:hover": {
                                              bgcolor: Colors.bluishCyan,
                                            },
                                          }}
                                        >
                                          <Edit
                                            sx={{
                                              color: Colors.white,
                                              height: "16px !important",
                                            }}
                                          />
                                        </IconButton>
                                        <Typography variant="body2">
                                          Edit
                                        </Typography>
                                      </Box>
                                    )}
                                    {permissions?.delete && (
                                      <Box
                                        onClick={() => {
                                          setConfirmationDialog(true);
                                          setBuyerId(item.id);
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
                                    )}
                                  </Box>
                                </Cell>
                              </Row>
                            );
                          })}
                        </Fragment>
                      ) : (
                        <Row>
                          <Cell
                            className='pdf-table'
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
              onPageSizeChange={(size) => getBuyerIds(1, size.target.value)}
              tableCount={buyerIds?.length}
              totalCount={totalCount}
              onPageChange={(page) => getBuyerIds(page, "")}
            />
          </Fragment>
        ) : (
          <CircleLoading />
        )}
      </Box>
    </Box>
  );
}

export default BuyerIdList;
