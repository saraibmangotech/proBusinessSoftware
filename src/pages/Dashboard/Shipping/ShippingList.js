import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  Typography,
  tableCellClasses,
  FormControl,
  InputLabel,
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
import { EyeIcon, FontFamily, SearchIcon } from "assets";
import Colors from "assets/Style/Colors";
import { ErrorToaster } from "components/Toaster";
import { CircleLoading } from "components/Loaders";
import { Edit } from "@mui/icons-material";
import Pagination from "components/Pagination";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import moment from "moment";
import { Debounce, formatPermissionData, handleExportWithComponent } from "utils";
import SystemServices from "services/System";
import ShippingServices from "services/Shipping";
import SelectField from "components/Select";
import { addPermission } from "redux/slices/navigationDataSlice";
import { useDispatch } from "react-redux";
import { CancelOutlined } from "@mui/icons-material";
import { PrimaryButton } from "components/Buttons";
import VehicleBookingServices from "services/VehicleBooking";
import { SuccessToaster } from "components/Toaster";
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
    textDecoration: "underline",
    color: Colors.twitter,
    cursor: "pointer",
  },
  myClass: {
    textDecoration: "underline",
    color: "#0c6135 !important",
    cursor: "pointer",
  },
  myClass2: {
    textDecoration: "underline",
    color: "#FFBF00 !important",
    cursor: "pointer",
  },
});

function ShippingList() {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const contentRef = useRef(null);

  const tableHead = [
    "Container No",
    "Container Size",
    "Booking No",
    "Vin",
    "Lot",
    "Shipping Line",
    "Warehouse",
    "Service Provider",
    "Country",
    "Location",
    "Destination",
    "Loading Port",
    "Galaxy Yard",
    "Towed By",
    "Clearer",
    "Loading",
    "ETA",
    "Export",
    "Arr. Port",
    "Arr. Galaxy",
    "User",
    "Action",
  ];

  const { register } = useForm();

  const [loader, setLoader] = useState(false);

  // *For Shipping List
  const [shippingList, setShippingList] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalButton, setModalButton] = useState(false)

  // *For Filters
  const [filters, setFilters] = useState({});

  const [selectedItem, setSelectedItem] = useState();

  // *For Shipping Lines
  const [shippingLines, setShippingLines] = useState([]);
  const [selectedShippingLines, setSelectedShippingLines] = useState(null);

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [updatedArray, setUpdatedArray] = useState([]);

  const [open, setOpen] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState([
    ...Array(tableHead?.length).keys(),
  ]);

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

  const handleClickOpen = async (item) => {
    setSelectedItem(item);
    console.log(item, "item");
    try {
      let params = {
        vin: item?.booking?.vin,
        container: item?.container_no,
      };
      let changeArray = [];
      const { data } = await ShippingServices.getShippingInfo(params);
      console.log(item, "item");
      if (!item?.loading_date && data?.container?.data?.loadingDate) {
        changeArray.push({
          key: "loading_date",
          label: "Loading Date",
          name: data?.container?.data?.loadingDate,
        });
      }
      if (!item?.eta && data?.container?.data?.expectedArrivalDate) {
        changeArray.push({
          key: "eta",
          label: "ETA Date",
          name: data?.container?.data?.expectedArrivalDate,
        });
      }
      if (!item?.arrived_port_date && data?.container?.data?.arrivalDate) {
        changeArray.push({
          key: "arrived_port_date",
          label: "Arrived At Port Date",
          name: data?.container?.data?.arrivalDate,
        });
      }
      if (!item?.bl && data?.container?.data?.blCopy) {
        changeArray.push({
          key: "bl",
          label: "Bl",
          name: data?.container?.data?.blCopy,
        });
      }

      setUpdatedArray(changeArray);
      setOpen(true);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Update Vehicle Booking
  const updateDialogData = async (formData) => {
    setModalButton(true)
    console.log(selectedItem, "updatedArraysadsasadd");
    try {
      let obj = {
        vehicle_id: selectedItem?.id,
        shipping_id: selectedItem?.shipping_id,
        customer_id: selectedItem?.booking?.customer?.id,
        vin: selectedItem?.booking?.vin,
        export_date: selectedItem?.export_date,
      };

      for (let i = 0; i < updatedArray.length; i++) {
        const element = updatedArray[i];
        obj[element.key] = element.name;
      }
      console.log(obj);
      const { message } = await ShippingServices.updateShippingVehicle(obj);
      SuccessToaster(message);
      handleClose()
      getShippingList()
    } catch (error) {
      console.log(error);
      ErrorToaster(error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };
  // *For Get Shipping Lines
  const getShippingLines = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search,
      };
      const { data } = await SystemServices.getShippingLines(params);
      setShippingLines(data?.lines?.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Shipping List
  const getShippingList = async (page, limit, filter) => {
    setLoader(true);
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
      const { data } = await ShippingServices.getShipping(params);
      setShippingList(data?.shippings?.rows);

      setTotalCount(data?.shippings?.count);
      setPermissions(formatPermissionData(data?.permissions));
      data?.permissions.forEach((e) => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      });
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false);
    }
  };

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getShippingList(1, "", data));
  };

  const handleColumnChange = (event) => {
    const selectedColumns = event.target.value;
    // Sort the selected columns to maintain the correct order
    const sortedColumns = selectedColumns.sort((a, b) => a - b);
    setVisibleColumns(sortedColumns);
  };

  const renderCellContent = (colIndex, item, isActive) => {
    switch (colIndex) {
      case 0:
        return (
          <Tooltip
            title={item?.shipping?.container_no ?? "-"}
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
              item?.shipping?.container_no?.length > 20
                ? item?.shipping?.container_no?.slice(0, 15) + "..." : item?.shipping?.container_no
            }
          </Tooltip>
        )
      // item?.shipping?.container_no ?? "-";
      case 1:
        return item?.shipping?.container?.name ?? "-";
      case 2:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.shipping?.booking_no ?? "-"}
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
                item?.shipping?.booking_no?.length > 15
                  ? item?.shipping?.booking_no?.slice(0, 15) + "..." : item?.shipping?.booking_no
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.shipping?.booking_no ?? "-"}
            </Box>
          </Box>
        )
      // item?.shipping?.booking_no ?? "-";
      case 3:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.booking?.vin ?? "-"}
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
                item?.booking?.vin?.length > 15
                  ? item?.booking?.vin?.slice(0, 15) + "..." : item?.booking?.vin
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
      case 4:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.booking?.lot_number ?? "-"}
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
                item?.booking?.lot_number?.length > 15
                  ? item?.booking?.lot_number?.slice(0, 15) + "..." : item?.booking?.lot_number
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
      // item?.booking?.lot_number ?? "-"
      case 5:
        return item?.shipping?.ship_line?.name ?? "-";
      case 6:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.booking?.warehouse?.name ?? "-"}
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
                item?.booking?.warehouse?.name > 20
                  ? item?.booking?.warehouse?.name?.slice(0, 15) + "..." : item?.booking?.warehouse?.name
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.warehouse?.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.shipping?.vendor_yard ?? "-";
      case 7:
        return (
          <Box
            className={
              item?.shipping?.ship_vendor?.id === 6001 && (item?.picked_auction_date || item?.booking?.title_status || item?.boooking?.delivery_date) ? classes.myClass2 : item?.shipping?.ship_vendor?.id === 6001 && (item?.picked_auction_date && item?.booking?.title_status && item?.boooking?.delivery_date && item?.bl && item?.loading_date) ? classes.myClass : item?.shipping?.ship_vendor?.id === 6001 && classes.anchorLink
            }
            onClick={() =>
              item?.shipping?.ship_vendor?.id === 6001
                ? handleClickOpen(item)
                : () => { }
            }

          >
            {item?.shipping?.ship_vendor?.name ?? "-"}
          </Box>
        );

      case 8:
        return item?.shipping?.location?.country_name ?? "-";
      case 9:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={
                item?.shipping?.location?.state_code
                  ? `${item?.shipping?.location?.state_code}-${item?.shipping?.location?.city_name}`
                  : "-"
              }
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
              {item?.shipping?.location?.state_code ?
                (`${item?.shipping?.location?.state_code} - ${item?.shipping?.location?.city_name?.length > 20 ? item?.shipping?.location?.city_name?.slice(0, 15) + "..." : item?.shipping?.location?.city_name}`)
                : "-"}
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.shipping?.location?.state_code
                ? `${item?.shipping?.location?.state_code}-${item?.shipping?.location?.city_name}`
                : "-"}
            </Box>
          </Box>
        )
      // item?.shipping?.location?.state_code
      //   ? `${item?.shipping?.location?.state_code}-${item?.shipping?.location?.city_name}`
      //   : "-";
      case 10:
        return item?.shipping?.dest?.name ?? "-";
      case 11:
        return item?.shipping?.loading_port?.name ?? "-";
      case 12:
        return item?.g_yard?.name ?? "-";
      case 13:
        return item?.booking?.tower?.name ?? "-";
      case 14:
        return item?.shipping?.clearer?.name ?? "-";
      case 15:
        return item?.loading_date
          ? moment(item?.loading_date).format("MM-DD-YYYY")
          : "N/A";
      case 16:
        return item?.eta ? moment(item?.eta).format("MM-DD-YYYY") : "N/A";
      case 17:
        return item?.export_date
          ? moment(item?.export_date).format("MM-DD-YYYY")
          : "N/A";
      case 18:
        return item?.arrived_port_date
          ? moment(item?.arrived_port_date).format("MM-DD-YYYY")
          : "N/A";
      case 19:
        return item?.arrived_galaxy_date
          ? moment(item?.arrived_galaxy_date).format("MM-DD-YYYY")
          : "N/A";
      case 20:
        return item?.shipping?.user?.name ?? "-";
      case 21:
        return (
          <Box component={'div'} className="pdf-hide" sx={{ gap: "16px !important" }}>
            {permissions?.detail_view && (
              <Box
                onClick={() =>
                  navigate(`/vehicle-booking-detail/${item?.booking?.id}`, {
                    state: { shipping: true },
                  })
                }
              >
                <IconButton
                  sx={{
                    bgcolor: Colors.primary,
                    "&:hover": { bgcolor: Colors.primary },
                  }}
                >
                  <EyeIcon />
                </IconButton>
                <Typography variant="body2">View Detail</Typography>
              </Box>
            )}
            {permissions?.update_vehicle && (
              <Box
                onClick={() =>
                  navigate(`/update-shipping-vehicle`, { state: item })
                }
              >
                <IconButton
                  sx={{
                    bgcolor: Colors.bluishCyan,
                    "&:hover": { bgcolor: Colors.bluishCyan },
                  }}
                >
                  <Edit
                    sx={{ color: Colors.white, height: "16px !important" }}
                  />
                </IconButton>
                <Typography variant="body2">Update Container</Typography>
              </Box>
            )}
            {permissions?.update_shipping && (
              <Box
                onClick={() => navigate(`/update-shipping`, { state: item })}
              >
                <IconButton
                  sx={{
                    bgcolor: Colors.blackShade,
                    "&:hover": { bgcolor: Colors.blackShade },
                  }}
                >
                  <Edit
                    sx={{ color: Colors.white, height: "16px !important" }}
                  />
                </IconButton>
                <Typography variant="body2">Update Shipping</Typography>
              </Box>
            )}
          </Box>
        );

      default:
        return "-";
    }
  };

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Action");
    const rows = shippingList?.map((item) => [
      item?.shipping?.container_no ?? "-",
      item?.shipping?.container?.name ?? "-",
      item?.shipping?.booking_no ?? "-",
      item?.booking?.vin ?? "-",
      item?.booking?.lot_number ?? "-",
      item?.shipping?.ship_line?.name ?? "-",
      item?.booking?.warehouse?.name ?? "-",
      item?.shipping?.ship_vendor?.name ?? "-",
      item?.shipping?.location?.country_name ?? "-",
      item?.shipping?.location?.state_code ? `${item?.shipping?.location?.state_code}-${item?.shipping?.location?.city_name}` : "-",
      item?.shipping?.dest?.name ?? "-",
      item?.shipping?.loading_port?.name ?? "-",
      item?.g_yard?.name ?? "-",
      item?.booking?.tower?.name ?? "-",
      item?.shipping?.clearer?.name ?? "-",
      item?.loading_date ? moment(item?.loading_date).format("MM-DD-YYYY") : "N/A",
      item?.eta ? moment(item?.eta).format("MM-DD-YYYY") : "N/A",
      item?.export_date ? moment(item?.export_date).format("MM-DD-YYYY") : "N/A",
      item?.arrived_port_date ? moment(item?.arrived_port_date).format("MM-DD-YYYY") : "N/A",
      item?.arrived_galaxy_date ? moment(item?.arrived_galaxy_date).format("MM-DD-YYYY") : "N/A",
      item?.shipping?.user?.name ?? "-"
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
    getShippingLines();
    getShippingList();
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
        <Typography
          variant="h5"
          sx={{
            color: Colors.charcoalGrey,
            fontFamily: FontFamily.NunitoRegular,
          }}
        >
          Booked Container
        </Typography>
        {shippingList?.length > 0 && (
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

      {/* Dialog */}
      <Dialog
        open={open}
        sx={{
          "& .MuiDialog-paper": {
            width: "40%",
            height: "auto",
            borderRadius: 2,
            py: { xs: 2, md: 4 },
            px: { xs: 3, md: 6 },
          },
        }}
      >
        <IconButton
          onClick={() => handleClose()}
          sx={{ position: "absolute", right: 13, top: 13 }}
        >
          <CancelOutlined />
        </IconButton>
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            color: Colors.charcoalGrey,
            fontFamily: FontFamily.NunitoRegular,
            mt: 1,
            mb: 2.5,
          }}
        >
          Data From W8
        </Typography>
        {updatedArray?.length > 0 &&
          updatedArray.map((item) => (
            <Box>
              <InputField
                label={item?.label}
                disabled={true}
                size={"small"}
                value={item?.name}
              />
            </Box>
          ))}
        {updatedArray?.length == 0 && (
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              color: Colors.charcoalGrey,
              fontFamily: FontFamily.NunitoRegular,
              mt: 1,
              mb: 2.5,
            }}
          >
            No Data To Update
          </Typography>
        )}
        {updatedArray?.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <PrimaryButton
              disabled={modalButton}
              onClick={updateDialogData}
              title={"Update"}
            ></PrimaryButton>
          </Box>
        )}
      </Dialog>
      <Grid container spacing={1} columns={15}>
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
        <Grid item xs={12} sm={3}>
          <InputField
            size={"small"}
            label={"VIN"}
            placeholder={"VIN"}
            register={register("vin", {
              onChange: (e) => handleFilter({ vin: e.target.value }),
            })}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <InputField
            size={"small"}
            label={"LOT"}
            placeholder={"LOT"}
            register={register("lot", {
              onChange: (e) => handleFilter({ lot: e.target.value }),
            })}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <InputField
            size={"small"}
            label={"Container"}
            placeholder={"Container"}
            register={register("container", {
              onChange: (e) => handleFilter({ container: e.target.value }),
            })}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SelectField
            size={"small"}
            onSearch={(search) => getShippingLines(search)}
            label={"Shipping Lines"}
            options={shippingLines}
            selected={selectedShippingLines}
            onSelect={(value) => {
              setSelectedShippingLines(value);
              handleFilter({ shipping_lines: value?.id });
            }}
          />
        </Grid>
      </Grid>

      <Grid item md={11}>
        {shippingList?.length > 0 && (
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
                      if (column !== "Action") {
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

            {loader ? (
              <CircularProgress />
            ) : (
              shippingList?.length > 0 && (
                <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName="Booked Container" >
                  <Box className='pdf-show' sx={{ display: 'none' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                        Booked Container
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
                      <TableHead className='pdf-table'>
                        <TableRow>
                          {visibleColumns.map((index) => (
                            <Cell className='pdf-table2' key={index}>{tableHead[index]}</Cell>
                          ))}
                        </TableRow>
                      </TableHead>

                      {/* Table Body */}
                      <TableBody>
                        {!loader ? (
                          shippingList?.length > 0 ? (
                            <Fragment>
                              {shippingList.map((item, rowIndex) => {
                                const isActive = true;
                                return (
                                  <Row
                                    key={rowIndex}
                                    sx={{
                                      bgcolor: rowIndex % 2 !== 0 && "#EFF8E7",
                                    }}
                                  >
                                    {visibleColumns.map((colIndex) => (
                                      <Cell className='pdf-table2' key={colIndex}>
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
                            <TableRow>
                              <TableCell
                                colSpan={visibleColumns?.length + 1}
                                align="center"
                                sx={{ fontWeight: 600 }}
                              >
                                No Data Found
                              </TableCell>
                            </TableRow>
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
              )
            )}

            {/* Pagination */}
            {shippingList?.length > 0 && (
              <Pagination
                currentPage={currentPage}
                pageSize={pageLimit}
                onPageSizeChange={(size) =>
                  getShippingList(1, size.target.value)
                }
                tableCount={shippingList?.length}
                totalCount={totalCount}
                onPageChange={(page) => getShippingList(page, "")}
              />
            )}
          </Box>
        )}
      </Grid>
    </Box>
  );
}

export default ShippingList;
