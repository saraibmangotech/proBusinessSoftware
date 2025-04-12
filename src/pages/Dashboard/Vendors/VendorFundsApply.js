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
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  Checkbox,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { CheckIcon, FontFamily, PendingIcon } from "assets";
import VendorServices from "services/Vendor";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import { CircleLoading } from "components/Loaders";
import Pagination from "components/Pagination";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import moment from "moment/moment";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import InputField from "components/Input";
import CurrencyServices from "services/Currency";

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

function VendorFundsApply() {
  const classes = useStyles();
  const navigate = useNavigate();
  const { state } = useLocation();

  console.log(state, "state");

  const tableHead = [
    "Select",
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
    "Balance",
  ];

  const [selectedClientBooking, setSelectedClientBooking] = useState([]);
  // *For Currencies
  const [currencyExchangeRate, setCurrencyExchangeRate] = useState();
  // *For Select and DeSelect client
  const handleSelectClientBooking = (fcyammount, id) => {
    try {
      handleCalc(fcyammount, id);
      const shallowCopy = [...selectedClientBooking];
      const currentIndex = selectedClientBooking.indexOf(id);
      if (currentIndex === -1) {
        shallowCopy.push(id);
      } else {
        shallowCopy.splice(currentIndex, 1);
      }
      setSelectedClientBooking(shallowCopy);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const { register: register2, setValue: setValue2, getValues } = useForm();

  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  // *For Vendor Costing
  const [vendorCosting, setVendorCosting] = useState();
  const [totalAmount, setTotalAmount] = useState();
  const [calcAmount, setCalcAmount] = useState({});
  const [totalApplied, setTotalApplied] = useState(0);
  const [aedRate, setAedRate] = useState()
  const [totalBalance, setTotalBalance] = useState(0);

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});

  const [fcyammount, setFcyammount] = useState(0);

  // *For Set Vendor FCY Amount
  const [vendorFcyAmount, setVendorFcyAmount] = useState();

  const [visibleColumns, setVisibleColumns] = useState([
    ...Array(tableHead?.length).keys(),
  ]);

  // *For Get Currencies
  const getCurrencies = async (currency) => {
    try {
      let params = {
        detailed: true,
      };
      const { data } = await CurrencyServices.getCurrencies(params);
      console.log(state?.vendor?.currency, 'state?.vendor?.currencystate?.vendor?.currencystate?.vendor?.currency');
      setAedRate(data.currencies[2].conversion_rate)
      if (state?.vendor?.currency == 'aed') {
        setCurrencyExchangeRate(data.currencies[2].conversion_rate);
      }
      else {
        setCurrencyExchangeRate(data.currencies[1].conversion_rate);
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Vendor Costing
  const getVendorCosting = async (page, limit, filter) => {
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
        payable: true,
      };
      params = { ...params, ...Filter };
      const { data } = await VendorServices.getVendorCosting(params);
      setTotalCount(data?.costings?.count);
      setVendorCosting(data?.costings?.rows);
      const calcTotal = [];
      let totalBal = 0;
      let shipping_charges = 0,
        towing_charges = 0,
        clearance_charges = 0,
        late_fee = 0,
        storage = 0,
        category_a = 0,
        broker_fee = 0,
        title_fee = 0,
        inspection = 0,
        other_charges = 0,
        custom_duty = 0,
        total = 0;
      data?.costings?.rows.forEach((e) => {
        shipping_charges += parseFloat(e?.shipping_charges);
        towing_charges += parseFloat(e?.towing_charges);
        clearance_charges += parseFloat(e?.clearance_charges);
        late_fee += parseFloat(e?.late_fee);
        storage += parseFloat(e?.storage);
        category_a += parseFloat(e?.category_a);
        broker_fee += parseFloat(e?.broker_fee);
        title_fee += parseFloat(e?.title_fee);
        inspection += parseFloat(e?.inspection);
        other_charges += parseFloat(e?.other_charges);
        custom_duty += parseFloat(e?.custom_duty);
        total +=
          state?.vendor?.type === "shipping"
            ? parseFloat(e?.shipping_vendor_total)
            : state?.vendor?.type === "towing"
              ? parseFloat(e?.towing_vendor_total)
              : parseFloat(e?.clearance_vendor_total);

        const totalT =
          state?.vendor?.type === "shipping"
            ? e?.shipping_vendor_total
            : state?.vendor?.type === "towing"
              ? e?.towing_vendor_total
              : e?.clearance_vendor_total;
        const paidAmount =
          state?.vendor?.type === "shipping"
            ? e?.shipping_vendor_paid
            : state?.vendor?.type === "towing"
              ? e?.towing_vendor_paid
              : e?.clearance_vendor_paid;
        const balance = parseFloat(totalT) - parseFloat(paidAmount);
        totalBal += balance;
        let obj = {
          id: e?.id,
          applied: 0,
          balance: balance,
          paidAmount: paidAmount,
          total: totalT,
        };
        calcTotal.push(obj);
      });
      let obj = {
        shipping_charges: shipping_charges,
        towing_charges: towing_charges,
        clearance_charges: clearance_charges,
        late_fee: late_fee,
        storage: storage,
        category_a: category_a,
        broker_fee: broker_fee,
        title_fee: title_fee,
        inspection: inspection,
        other_charges: other_charges,
        custom_duty: custom_duty,
        total: total,
      };
      setTotalAmount(obj);
      setCalcAmount(calcTotal);
      setTotalBalance(totalBal);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false);
    }
  };

  // *For Apply Filters
  const applyFilter = async () => {
    try {
      let data = {
        vendor_id: state?.vendor?.id,
        country_id: state?.vendor?.country_id,
        type: state?.vendor?.type,
      };
      getVendorCosting(1, "", data);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Handle Calculate
  const handleCalc = (val, id) => {
    try {
      const value = val ? val : 0;
      const shallowCopy = [...calcAmount];
      const index = calcAmount.findIndex((e) => e.id === id);
      const balance =
        parseFloat(shallowCopy[index].total) -
        parseFloat(shallowCopy[index].paidAmount);
      const fcyRemainingAmount =
        parseFloat(vendorFcyAmount) + parseFloat(shallowCopy[index].applied);
      if (parseFloat(balance) > parseFloat(fcyRemainingAmount)) {
        if (parseFloat(value) > parseFloat(fcyRemainingAmount)) {
          setValue2(`applied-${id}`, parseFloat(fcyRemainingAmount));
          shallowCopy[index].applied = parseFloat(fcyRemainingAmount);
          shallowCopy[index].balance =
            parseFloat(balance) - parseFloat(fcyRemainingAmount);
        } else {
          setValue2(`applied-${id}`, value);
          shallowCopy[index].applied = parseFloat(value);
          shallowCopy[index].balance = parseFloat(balance) - parseFloat(value);
        }
      } else {
        if (parseFloat(value) > parseFloat(balance)) {
          setValue2(`applied-${id}`, balance);
          shallowCopy[index].applied = parseFloat(balance);
          shallowCopy[index].balance = parseFloat(0);
        } else {
          setValue2(`applied-${id}`, value);
          shallowCopy[index].applied = parseFloat(value);
          shallowCopy[index].balance = parseFloat(balance) - parseFloat(value);
        }
      }
      let leftFcyAmount = state?.vendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.vendor?.currency == 'cad' ? parseFloat(parseFloat(state?.fcy_amount * currencyExchangeRate) / parseFloat(aedRate)).toFixed(2) : state?.fcy_amount
        ? parseFloat(state?.vendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.vendor?.currency == 'cad' ? parseFloat(parseFloat(state?.fcy_amount * currencyExchangeRate) / parseFloat(aedRate)).toFixed(2) : state?.fcy_amount) - parseFloat(state?.paid_amount)
        : parseFloat(state?.vendor_amount) + parseFloat(state?.damage_gws);
      shallowCopy.forEach((e) => {
        leftFcyAmount -= parseFloat(e?.applied);
      });
      console.log(leftFcyAmount, 'leftFcyAmountleftFcyAmountleftFcyAmount');
      setVendorFcyAmount(leftFcyAmount);
      console.log(shallowCopy, 'shallowCopyshallowCopy');
      setCalcAmount(shallowCopy);
      let totalApp = 0;
      let totalBal = 0;
      shallowCopy.forEach((e) => {
        totalApp += parseFloat(e?.applied);
        totalBal += parseFloat(e?.balance);
      });
      setTotalApplied(totalApp);
      setTotalBalance(totalBal);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Apply Fund
  const applyFund = async () => {
    setLoading(true);
    try {
      const details = [];
      console.log(calcAmount, 'calcAmountcalcAmount');
      calcAmount.forEach((e) => {
        if (e?.applied > 0) {
          let applyObj = {
            costing_id: e?.id,
            applied_amount: e?.applied,
          };
          details.push(applyObj);
        }
      });
      const sumOfApplied = calcAmount.reduce((accumulator, currentValue) => accumulator + currentValue.applied, 0);


      let sum = 0;
      if (state?.vendor_amount) {
        sum = parseFloat(state?.vendor_amount) + parseFloat(state?.damage_gws);
      }
      let obj = {
        vendor_id: state?.vendor?.id,
        tt_id: state?.client_amount ? null : state?.id,
        damage_id: state?.client_amount ? state?.id : null,
        external_ref_no: state?.external_no,
        paid_amount: parseFloat(sumOfApplied).toFixed(2),
        currency: state?.vendor?.currency,
        details: details,
      };
      console.log(obj, 'opbjsadsda');
      const { message } = await VendorServices.applyFund(obj);
      SuccessToaster(message);
      navigate("/vendor-funds-approval");
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoading(false);
    }
  };

  const renderCellContent = (
    colIndex,
    item,
    isActive,
    total,
    status,
    rowBalance,
    fcyammount
  ) => {
    switch (colIndex) {
      case 0:
        return (
          <Checkbox
            checked={isActive}
            onChange={() => handleSelectClientBooking(fcyammount, item?.id)}
          />
        );
      case 1:
        return item?.booking?.purchase_date
          ? moment(item?.booking?.purchase_date).format("DD-MMM-YYYY")
          : "-";
      case 2:
        return item?.booking?.veh_model?.name ?? "-";
      case 3:
        return item?.booking?.veh_make?.name ?? "-";
      case 4:
        return item?.booking?.vin ?? "-";
      case 5:
        return item?.booking?.lot_number ?? "-";
      case 6:
        return item?.booking?.color ?? "-";

      case 7:
        return item?.shipping?.loading_port?.name ?? "-";
      case 8:
        return item?.shipping?.container_no ?? "-";
      case 9:
        return item?.vehicle?.arrived_galaxy_date
          ? moment(item?.vehicle?.arrived_galaxy_date).format("DD-MMM-YYYY")
          : "-";
      case 10:
        return item?.shipping_charges ?? "-";
      case 11:
        return item?.towing_charges ?? "-";
      case 12:
        return item?.clearance_charges ?? "-";
      case 13:
        return item?.late_fee ?? "-";
      case 14:
        return item?.storage ?? "-";
      case 15:
        return item?.category_a ?? "-";
      case 16:
        return item?.broker_fee ?? "-";
      case 17:
        return item?.title_fee ?? "-";
      case 18:
        return item?.inspection ?? "-";
      case 19:
        return item?.other_charges ?? "-";
      case 20:
        return item?.custom_duty ?? "-";
      case 21:
        return total;
      case 22:
        return (
          <Box
            sx={{
              path: { fill: status === "Partial Paid" && Colors.bluishCyan },
            }}
          >
            {status === "Paid" ? (
              <CheckIcon />
            ) : status === "UnPaid" ? (
              <PendingIcon />
            ) : (
              <CheckIcon />
            )}
            <Typography variant="body2">{status}</Typography>
          </Box>
        );
      case 23:
        return (
          status !== "Paid" && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Box>
                {isActive ? (
                  <InputField
                    size={"small"}
                    type={"number"}
                    InputProps={{ inputProps: { min: 0 } }}
                    inputStyle={{ width: "100px" }}
                    readOnly={false} // Ensure this is set to false
                    register={register2(`applied-${item?.id}`, {
                      onChange: (e) => handleCalc(e.target.value, item?.id),
                      value: fcyammount,
                    })}
                  />
                ) : (
                  <InputField
                    size={"small"}
                    disabled={true}
                    type={"number"}
                    InputProps={{ inputProps: { min: 0 } }}
                    inputStyle={{ width: "100px" }}
                  />
                )}
              </Box>
            </Box>
          )
        );
      case 24:
        return rowBalance.toFixed(2);

      default:
        return "-";
    }
  };

  const handleColumnChange = (event) => {
    const selectedColumns = event.target.value;
    // Sort the selected columns to maintain the correct order
    const sortedColumns = selectedColumns.sort((a, b) => a - b);
    setVisibleColumns(sortedColumns);
  };
  useEffect(() => {
    getCurrencies()
    if (state) {
      let data = {
        vendor_id: state?.vendor?.id,
        type: state?.vendor?.type,
      };
      setValue("vendor", state?.vendor?.name);
      getVendorCosting(1, "", data);
      let sum = 0;
      if (state?.vendor_amount) {
        sum = parseFloat(state?.vendor_amount) + parseFloat(state?.damage_gws);
        console.log(sum, 'sumsumsumsum');
        setVendorFcyAmount(sum);
      } else {
        console.log(parseFloat(state?.fcy_amount), ' state?.fcy_amount /currencyExchangeRate');
        setVendorFcyAmount(state?.vendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.vendor?.currency == 'cad' ? parseFloat(parseFloat(state?.fcy_amount * currencyExchangeRate) / parseFloat(aedRate)).toFixed(2) : state?.fcy_amount);
      }
    }

  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>
      <Typography
        variant="h5"
        sx={{
          color: Colors.charcoalGrey,
          fontFamily: FontFamily.NunitoRegular,
        }}
      >
        UnApplied V-Funds
      </Typography>

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
        <Grid container spacing={1} alignItems={"center"} columns={10}>
          <Grid item md={2}>
            <InputField
              size={"small"}
              disabled={true}
              label={"Vendor"}
              placeholder={"Vendor"}
              register={register("vendor")}
            />
          </Grid>
          <Grid item md={2}>
            <InputField
              size={"small"}
              label={"Vin"}
              placeholder={"Vin"}
              error={errors?.vin?.message}
              register={register("vin")}
            />
          </Grid>
          <Grid item md={2}>
            <InputField
              size={"small"}
              label={"Lot"}
              placeholder={"Lot"}
              register={register("lot")}
            />
          </Grid>
          <Grid item md={2}>
            <InputField
              size={"small"}
              label={"Container"}
              placeholder={"Container"}
              register={register("container")}
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
              <PrimaryButton title={"Search"} type={"submit"} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid item md={11}>
        {vendorCosting?.length > 0 && (
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
                      if (column !== "Applied Amount") {
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
              vendorCosting?.length > 0 && (
                <TableContainer
                  component={Paper}
                  sx={{
                    boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                    borderRadius: 2,
                    maxHeight: "calc(100vh - 330px)",
                  }}
                >
                  <Table stickyHeader sx={{ minWidth: 500 }}>
                    {/* Table Header */}
                    <TableHead>
                      <TableRow>
                        {visibleColumns.map((index) => (
                          <Cell key={index}>{tableHead[index]}</Cell>
                        ))}
                      </TableRow>
                    </TableHead>

                    {/* Table Body */}
                    <TableBody>
                      {!loader ? (
                        vendorCosting?.length > 0 ? (
                          <Fragment>
                            {vendorCosting.map((item, rowIndex) => {
                              const total =
                                state?.vendor?.type === "shipping"
                                  ? item?.shipping_vendor_total
                                  : state?.vendor?.type === "towing"
                                    ? item?.towing_vendor_total
                                    : item?.clearance_vendor_total;

                              const paidAmount =
                                state?.vendor?.type === "shipping"
                                  ? item?.shipping_vendor_paid
                                  : state?.vendor?.type === "towing"
                                    ? item?.towing_vendor_paid
                                    : item?.clearance_vendor_paid;

                              const balance = parseFloat(total) - parseFloat(paidAmount);

                              const status =
                                balance === 0
                                  ? "Paid"
                                  : parseFloat(balance) === parseFloat(total)
                                    ? "UnPaid"
                                    : "Partial Paid";

                              const calcAmountRow = calcAmount.find((e) => e.id === item.id);
                              const rowBalance = calcAmountRow?.balance;
                              console.log(rowBalance);
                              // Check if the row is active (checked)
                              const isActive = selectedClientBooking.indexOf(item?.id) !== -1;

                              // Set fcyammount to 0 if the row is not active
                              let fcyammount
                              if (state?.vendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.vendor?.currency == 'cad' ? parseFloat(parseFloat(state?.fcy_amount * currencyExchangeRate) / parseFloat(aedRate)).toFixed(2) : state?.fcy_amount) {

                                fcyammount = !isActive
                                  ? Math.min(parseFloat(rowBalance), parseFloat(state?.vendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.vendor?.currency == 'cad' ? parseFloat(parseFloat(state?.fcy_amount * currencyExchangeRate) / parseFloat(aedRate)).toFixed(2) : state?.fcy_amount) - parseFloat(state?.paid_amount))
                                  : 0;

                              }
                              else {
                                fcyammount = !isActive
                                  ? Math.min(parseFloat(rowBalance), parseFloat(state?.client_amount))
                                  : 0;

                              }
                              // Use fcyammount in your application logic as needed
                              console.log("Payment amount for the current row:", fcyammount);



                              return (
                                <Row
                                  key={rowIndex}
                                  sx={{
                                    bgcolor: rowIndex % 2 !== 0 && "#EFF8E7",
                                  }}
                                >
                                  {visibleColumns.map((colIndex) => (
                                    <Cell key={colIndex}>
                                      {renderCellContent(
                                        colIndex,
                                        item,
                                        isActive,
                                        total,
                                        status,
                                        rowBalance,
                                        fcyammount
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
              )
            )}

            {/* Pagination */}
            {vendorCosting?.length > 0 && (
              <Pagination
                currentPage={currentPage}
                pageSize={pageLimit}
                onPageSizeChange={(size) =>
                  getVendorCosting(1, size.target.value)
                }
                tableCount={vendorCosting?.length}
                totalCount={totalCount}
                onPageChange={(page) => getVendorCosting(page, "")}
              />
            )}
          </Box>
        )}
        <Box sx={{ my: 4, py: 2, bgcolor: Colors.whiteSmoke }}>
          <Grid container spacing={1} columns={10}>
            <Grid item xs={12} sm={2}>
              <Box
                sx={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontFamily: FontFamily.NunitoRegular }}
                >
                  Date
                </Typography>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 1,
                    width: "130px",
                    bgcolor: Colors.flashWhite,
                    border: "1px solid #B2B5BA",
                    borderRadius: "4px",
                  }}
                >
                  <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                    {moment(state?.created_at).format("DD MMM")}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Box
                sx={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontFamily: FontFamily.NunitoRegular }}
                >
                  VUAF No
                </Typography>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 1,
                    width: "130px",
                    bgcolor: Colors.flashWhite,
                    border: "1px solid #B2B5BA",
                    borderRadius: "4px",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ cursor: "pointer", color: Colors.smokeyGrey }}
                  >
                    VUAF-{state?.id}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Box
                sx={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontFamily: FontFamily.NunitoRegular }}
                >
                  External Ref No
                </Typography>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 1,
                    width: "130px",
                    bgcolor: Colors.flashWhite,
                    border: "1px solid #B2B5BA",
                    borderRadius: "4px",
                  }}
                >
                  <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                    {state?.external_no ? state?.external_no : '-'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Box
                sx={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontFamily: FontFamily.NunitoRegular }}
                >
                  Paid Amount
                </Typography>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 1,
                    width: "130px",
                    bgcolor: Colors.flashWhite,
                    border: "1px solid #B2B5BA",
                    borderRadius: "4px",
                  }}
                >
                  <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                    {state?.fcy_amount
                      ? parseFloat(parseFloat(state?.vendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.vendor?.currency == 'cad' ? parseFloat(parseFloat(state?.fcy_amount * currencyExchangeRate) / parseFloat(aedRate)).toFixed(2) : state?.fcy_amount) - parseFloat(state?.paid_amount)).toFixed(2)
                      : parseFloat(state?.vendor_amount) +
                      parseFloat(state?.damage_gws)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Box
                sx={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontFamily: FontFamily.NunitoRegular }}
                >
                  Balance
                </Typography>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 1,
                    width: "130px",
                    bgcolor: Colors.flashWhite,
                    border: "1px solid #B2B5BA",
                    borderRadius: "4px",
                  }}
                >
                  <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                    {state?.fcy_amount
                      ? (
                        parseFloat(state?.vendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.vendor?.currency == 'cad' ? parseFloat(parseFloat(state?.fcy_amount * currencyExchangeRate) / parseFloat(aedRate)).toFixed(2) : state?.fcy_amount) -
                        (parseFloat(totalApplied) + parseFloat(state?.paid_amount))
                      ).toFixed(2)
                      : parseFloat(
                        parseFloat(state?.vendor_amount) +
                        parseFloat(state?.damage_gws) -
                        parseFloat(totalApplied)
                      ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <PrimaryButton
            disabled={
              state?.fcy_amount
                ? parseFloat(state?.vendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.vendor?.currency == 'cad' ? parseFloat(parseFloat(state?.fcy_amount * currencyExchangeRate) / parseFloat(aedRate)).toFixed(2) : state?.fcy_amount)
                  ? false
                  : true
                : parseFloat(state?.vendor_amount) +
                  parseFloat(state?.damage_gws) ===
                  parseFloat(totalApplied)
                  ? false
                  : true
            }
            title="Update"
            type="submit"
            loading={loading}
            onClick={() => applyFund()}
          />
        </Box>
      </Grid>
    </Box>
  );
}

export default VendorFundsApply;
