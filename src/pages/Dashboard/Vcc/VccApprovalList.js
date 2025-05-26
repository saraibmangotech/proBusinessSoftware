import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  Grid,
  IconButton,
  ImageListItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  tableCellClasses,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  ListItemText,
  Checkbox,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import styled from "@emotion/styled";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import { CheckIcon, EyeIcon, FontFamily, PendingIcon, SearchIcon } from "assets";
import Colors from "assets/Style/Colors";
import VehicleBookingServices from "services/VehicleBooking";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { CircleLoading } from "components/Loaders";
import { CancelOutlined, Edit } from "@mui/icons-material";
import Pagination from "components/Pagination";
import { PrimaryButton } from "components/Buttons";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import moment from "moment";
import DatePicker from "components/DatePicker";
import { Debounce, handleExportWithComponent } from "utils";
import VccServices from "services/Vcc";
import VccPurpose from 'data/Vcc_Purpose';
import ApprovalStatusDialog from "components/Dialog/ApprovalStatusDialog";
import SimpleDialog from "components/Dialog/SimpleDialog";
import SelectField from "components/Select";
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
  anchorLink: {
    textDecoration: 'underline',
    color: Colors.twitter,
    cursor: 'pointer'
  }
});

function VccApprovalList() {
  const navigate = useNavigate();
  const classes = useStyles();
  const contentRef = useRef(null);

  const tableHead = [
    "VCC Serial Number",
    "Customer",
    "Make",
    "Modal",
    "LOT",
    "VIN",
    "Color",
    "Nationality",
    "VCC Declaration Number",
    "VCC Receiving Date",
    "VCC Expiry Date",
    "Time Left",
    "Purpose",
    "Comments",
    "Reasons",
    "Status",
  ];

  const [visibleColumns, setVisibleColumns] = useState([
    ...Array(tableHead?.length).keys(),
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const { register: register2, handleSubmit: handleSubmit2, formState: { errors2 }, reset: reset2, setValue: setValue2 } = useForm();

  // *For Vcc Purpose
  const [selectedVccPurpose, setSelectedVccPurpose] = useState(null);

  const [loader, setLoader] = useState(false);

  // *For Vcc List
  const [vccList, setVccList] = useState();
  const [vccId, setVccId] = useState();

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Dialog Box
  const [approvalStatusDialog, setApprovalStatusDialog] = useState(false);
  const [reasonDialog, setReasonDialog] = useState(false);

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

  const [purposeDialog, setPurposeDialog] = useState(false);

  // *For Approval Status
  const [approvalStatus, setApprovalStatus] = useState("");

  // *For Get Vcc List
  const getVccList = async (page, limit, filter) => {
    setLoader(true);
    try {
      const Page = page ? page : currentPage;
      const Limit = limit ? limit : pageLimit;
      const Filter = { ...filters, ...filter };
      setCurrentPage(Page);
      setPageLimit(Limit);
      let params = {
        page: Page,
        limit: Limit,
      };
      params = { ...params, ...Filter };
      const { data } = await VccServices.getVccList(params);
      setVccList(data?.vehicles?.rows);
      setTotalCount(data?.vehicles?.count);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false);
    }
  };

  // *For Update Approval Status
  const updateApprovalStatus = async (data) => {
    try {
      let obj = {
        vcc_id: vccId,
        is_approved: data?.comment ? false : true,
        reason: data?.comment,
      };
      const { message } = await VccServices.approveVcc(obj);
      reset();
      SuccessToaster(message);
      setApprovalStatusDialog(false);
      setReasonDialog(false);
      getVccList();
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Update Purpose
  const updatePurpose = async () => {
    console.log(selectedVccPurpose, 'selectedVccPurpose');
    try {
      let obj = {
        vcc_id: vccId,
        vcc_purpose: selectedVccPurpose?.id,

      };
      console.log(obj);
      const { message } = await VccServices.purposeVcc(obj);

      SuccessToaster(message);
      setPurposeDialog(false)
      getVccList();
      reset2();
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const handleClick = (item) => {
    if (item?.is_approved === null) {
      setApprovalStatusDialog(true);

      setVccId(item?.id);
      setApprovalStatus(item?.is_approved);
    }
  };
  const handleClick2 = (item) => {

    if (item?.is_approved === null) {
      setPurposeDialog(true);
      if (item?.vcc_purpose) {
        setSelectedVccPurpose({ id: item?.vcc_purpose, name: item?.vcc_purpose })
        setValue2('vccPurpose', { id: item?.vcc_purpose, name: item?.vcc_purpose })
      }

      setVccId(item?.id);
    }
  };

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getVccList(1, "", data));
  };

  const handleColumnChange = (event) => {
    const selectedColumns = event.target.value;
    // Sort the selected columns to maintain the correct order
    const sortedColumns = selectedColumns.sort((a, b) => a - b);
    setVisibleColumns(sortedColumns);
  };

  const renderCellContent = (colIndex, item, isActive) => {
    const date = moment(item?.vcc_expiry_date).format("MM-DD-YYYY");
    const targetDate = moment(date, "MM-DD-YYYY");
    let daysRemaining = targetDate.diff(moment(), "days");
    if (daysRemaining < 0) {
      daysRemaining = 0;
    }
    switch (colIndex) {
      case 0:
        return item?.id ?? "-";
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
      // item?.booking?.customer?.name ?? "-";
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
      // item?.booking?.veh_make?.name ?? "-";
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
            <Box>

            </Box>
          </Box>
        )
      // item?.booking?.veh_model?.name ?? "-";
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
      // item?.booking?.lot_number ?? "-";
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
      // item?.booking?.vin ?? "-";
      case 6:
        return item?.booking?.color ?? "-";
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
        );
      // item?.booking?.customer?.customerProfile?.nationality?.name ?? "-"
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
        return item?.vcc_date
          ? moment(item?.vcc_date).format("MM-DD-YYYY")
          : "-";
      case 10:
        return item?.vcc_expiry_date
          ? moment(item?.vcc_expiry_date).format("MM-DD-YYYY")
          : "-";
      case 11:
        return item?.vcc_expiry_date ? `${daysRemaining} days` : "-";
      case 12:
        return (

          <Typography variant="body2">{item?.vcc_purpose ?? "-"}</Typography>

        );
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
      // item?.comments ?? "-";
      case 14:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.reason ?? "-"}
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
                item?.reason?.length > 12
                  ? item?.reason?.slice(0, 8) + "..." : item?.reason
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.reason ?? "-"}
            </Box>
          </Box>
        )
      // item?.reason ?? "-";
      case 15:
        return (
          <Box
            onClick={() => handleClick(item)}
            sx={{
              cursor: "pointer",
              'path': { fill: item?.is_approved ? Colors.primary : Colors.danger },
            }}
          >
            <span className='pdf-hide'> {item?.is_approved === null ? <PendingIcon /> : <CheckIcon />}</span>
            <Typography variant="body2">
              {item?.is_approved === null
                ? "Pending"
                : item?.is_approved
                  ? "Approved"
                  : "Rejected"}
            </Typography>
          </Box>
        );

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
        item?.reason ?? "-",
        item?.is_approved === null ? "Pending" : item?.is_approved ? "Approved" : "Rejected"
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
    getVccList();
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>
      {/* ========== Approval Status Dialog ========== */}
      <ApprovalStatusDialog
        open={approvalStatusDialog}
        onClose={() => setApprovalStatusDialog(false)}
        status={approvalStatus}
        updateStatus={(data) =>
          data ? updateApprovalStatus(data) : setReasonDialog(true)
        }
      />
      {/* ========== Rejected Reason ========== */}
      <SimpleDialog
        open={purposeDialog}
        onClose={() => setPurposeDialog(false)}
        title={"Select Purpose"}
      >
        <Box component="form" onSubmit={handleSubmit2(updatePurpose)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <SelectField
                label={'Select VCC Purpose'}
                options={VccPurpose}
                selected={selectedVccPurpose}
                onSelect={(value) => setSelectedVccPurpose(value)}
                error={errors2?.vccPurpose?.message}
                register={register2("vccPurpose", {
                  required: 'Please select vcc purpose.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
              <PrimaryButton title="Submit" type="submit" />
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
      {/* ========== Rejected Reason ========== */}
      <SimpleDialog
        open={reasonDialog}
        onClose={() => setReasonDialog(false)}
        title={"Reason to Reject"}
      >
        <Box component="form" onSubmit={handleSubmit(updateApprovalStatus)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <InputField
                label={"Comments"}
                placeholder={"Comments"}
                multiline={true}
                rows={4}
                error={errors?.comment?.message}
                register={register("comment", {
                  required: "Please enter comment.",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
              <PrimaryButton title="Submit" type="submit" />
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
        <Typography
          variant="h5"
          sx={{
            color: Colors.charcoalGrey,
            fontFamily: FontFamily.NunitoRegular,
          }}
        >
          VCC Approval List
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
          <Grid item xs={12} sm={3}>
            <InputField
              size={"small"}
              inputStyle={{ backgroundColor: '#f5f5f5' }}
              label={'Search'}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
              placeholder={"Search"}
              register={register("search", {
                onChange: (e) => handleFilter({ search: e.target.value }),
              })}
            />
          </Grid>
        </Grid>


        <Grid item md={11}>
          {vccList && (
            <Box>
              <Grid container mb={2}>
                <Grid item xs={5}>
                  <FormControl>
                    <InputLabel>Columns</InputLabel>
                    <Select
                      size={"small"}
                      multiple
                      value={visibleColumns}
                      label={"Columns"}
                      onChange={handleColumnChange}
                      renderValue={() => "Show/Hide"}
                    >
                      {tableHead.map((column, index) => {
                        if (column !== "Action" && column !== "Status") {
                          return (
                            <MenuItem key={index} value={index}>
                              <Checkbox
                                checked={visibleColumns.includes(index)}
                              />
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

              {vccList && (
                <Fragment>
                  <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName="VCC Approval List" >
                    <Box className='pdf-show' sx={{ display: 'none' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                          VCC Approval List
                        </Typography>
                        <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                      </Box>
                    </Box>
                    <TableContainer
                      component={Paper}
                      sx={{
                        boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                        borderRadius: 2,
                        maxHeight: "calc(100vh - 330px)",
                      }}
                      className="table-box"
                    >
                      <Table stickyHeader sx={{ minWidth: 500 }}>
                        {/* Table Header */}
                        <TableHead>
                          <TableRow>
                            {visibleColumns.map((index) => (
                              <Cell className='pdf-table' key={index}>{tableHead[index]}</Cell>
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
                                      sx={{
                                        bgcolor: rowIndex % 2 !== 0 && "#EFF8E7",
                                      }}
                                    >
                                      {visibleColumns.map((colIndex) => (
                                        <Cell className='pdf-table' key={colIndex}>
                                          {renderCellContent(
                                            colIndex,
                                            item,
                                            isActive
                                          )}
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
                    onPageChange={(page) => getVccList(page, "")}
                  />
                </Fragment>
              )}

              {loader && <CircleLoading />}
            </Box>
          )}
        </Grid>
      </Box>
    </Box>
  );
}

export default VccApprovalList;
