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
import ExportServices from "services/Export";
import { CommaSeparator } from "utils";

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

function ExportVendorFundsApply() {
  const classes = useStyles();
  const navigate = useNavigate();
  const { state } = useLocation();

  console.log(state);
  let remainingFcyAmount = state?.fcy_amount;
  console.log(state, "state");

  const tableHead = [
    "Select",
    "Receive Date",
    "Model",
    "Make",
    "Vin/Lot",
    "Color",
    "Total Amount",
    "Applied Status",
    "Applied Amount",
    "Balance",
  ];

  const [selectedClientBooking, setSelectedClientBooking] = useState([]);
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
  const [totalBalance, setTotalBalance] = useState(0);


  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Vendor Dropdown
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  let prev_balance = state?.fcy_amount;
  let lastBalance = state?.fcy_amount;
  // *For Filters
  const [filters, setFilters] = useState({});

  const [fcyammount, setFcyammount] = useState(0);

  // *For Set Vendor FCY Amount
  const [vendorFcyAmount, setVendorFcyAmount] = useState();

  const [visibleColumns, setVisibleColumns] = useState([
    ...Array(tableHead?.length).keys(),
  ]);

  // *For Vendor
  const getVendorDropdown = async () => {
    try {
      const { data } = await ExportServices.getVendorDropdown();
      setVendors([...data?.agents, ...data?.brokers]);
      let list = [...data?.agents, ...data?.brokers]
      let selected = list.find(item => item?.id == state?.vendor?.id)
      setSelectedVendor(selected?.customerProfile?.broker_type_id)
      if (state) {
        let data = {
          vendor_id: state?.vendor?.id,
          type: state?.vendor?.type,
          broker_type_id: selected?.customerProfile?.broker_type_id
        };
        setValue("vendor", state?.vendor?.name);
        getVendorCosting(1, "", data, selected?.customerProfile?.broker_type_id);


        setVendorFcyAmount(state?.fcy_amount);

      }
      console.log(selected, 'selectedselectedselected');
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Vendor Costing
  const getVendorCosting = async (page, limit, filter, broker_type_id) => {
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
      const { data } = await ExportServices.getVendorPayments(params);
      setTotalCount(data?.vehicles?.count);
      setVendorCosting(data?.vehicles?.rows);
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
      let totalT
      let paidAmount
      let balance
      data?.vehicles?.rows.forEach((e) => {

        if (broker_type_id == 1) {
          console.log(e?.payment, 'upar');
          total +=
            e?.payment?.agent_charges;

          totalT =
            e?.payment?.agent_charges;
          paidAmount =
            e?.payment?.agent_charged_paid;
          balance = parseFloat(e?.payment?.agent_charges) - parseFloat(e?.payment?.agent_charged_paid);

          totalBal += balance;

        }
        else {
          console.log(e?.payment, 'neechay');
          total +=
            e?.payment?.broker_charges;

          totalT =
            e?.payment?.broker_charges;
          paidAmount =
            e?.payment?.broker_charged_paid;
          balance = parseFloat(e?.payment?.broker_charges) - parseFloat(e?.payment?.broker_charged_paid);
          totalBal += balance;
        }


        let obj = {
          id: e?.id,
          ev_payment_id: e?.payment?.id,
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
      console.log(calcTotal, 'calcTotalcalcTotal');
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
        broker_type_id: selectedVendor
      };
      getVendorCosting(1, "", data,);
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
      let leftFcyAmount = state?.fcy_amount
        ? parseFloat(state?.fcy_amount) - parseFloat(state?.paid_amount)
        : parseFloat(state?.vendor_amount) + parseFloat(state?.damage_gws);
      shallowCopy.forEach((e) => {
        leftFcyAmount -= parseFloat(e?.applied);
      });
      setVendorFcyAmount(leftFcyAmount);
      setCalcAmount(shallowCopy);
      const sumOfApplied = shallowCopy.reduce((total, item) => total + item.applied, 0);
      console.log(sumOfApplied);
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

      calcAmount.forEach((e) => {
        if (e?.applied > 0) {
          let applyObj = {
            ev_id: e?.id,
            ev_payment_id: e.ev_payment_id,
            applied_amount: e?.applied,
          };
          details.push(applyObj);
        }
      });
      let sum = 0;
      console.log(details, 'details');
      if (details.length > 0) {

        sum = details?.reduce((total, item) => total + parseFloat(item?.applied_amount), 0);

        console.log("Sum of applied_amount:", sum);
      }


      let obj = {
        vendor_id: state?.vendor?.id,
        vendor_name: state?.vendor?.name,
        ex_rate: state?.ex_rate,
        tt_id: state?.client_amount ? null : state?.id,
        damage_id: state?.client_amount ? state?.id : null,
        external_ref_no: state?.external_no,
        paid_amount: parseFloat(sum).toFixed(2),
        currency: "usd",
        broker_type_id: selectedVendor,
        details: details,
      };
      const { message } = await ExportServices.applyFund(obj);
      SuccessToaster(message);
      navigate("/export-vendor-applied-funds");
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
    console.log(total, 'total');
    switch (colIndex) {
      case 0:
        return (
          <Checkbox
            checked={isActive}
            onChange={() => handleSelectClientBooking(fcyammount, item?.id)}
          />
        );
      case 1:
        return item?.created_at
          ? moment(item?.created_at).format("DD-MMM-YYYY")
          : "-";
      case 2:
        return item?.model?.name ?? "-";
      case 3:
        return item?.make?.name ?? "-";
      case 4:
        return item?.vin ?? "-";
      case 5:
        return item?.color ?? "-";


      case 6:
        return CommaSeparator(parseFloat(total).toFixed(2));
      case 7:
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
      case 8:
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
      case 9:
        return CommaSeparator(parseFloat(rowBalance).toFixed(2));

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
    getVendorDropdown()


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
        Export Vendor Funds Apply
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
                              const total = selectedVendor == 1 ? item?.payment?.agent_charges : item?.payment?.broker_charges;

                              const paidAmount = selectedVendor == 1 ? item?.payment?.agent_charged_paid : item?.payment?.broker_charged_paid;

                              const balance = parseFloat(total) - parseFloat(paidAmount);
                              
                              const status =
                                balance === 0
                                  ? "Paid"
                                  : parseFloat(balance) === parseFloat(total)
                                    ? "UnPaid"
                                    : "Partial Paid";
                              console.log(item?.id, 'calcAmountcalcAmountcalcAmount');
                              console.log(calcAmount, 'calcAmountcalcAmountcalcAmount');
                              const calcAmountRow = calcAmount.find((e) => e.id === item.id);
                              const rowBalance = calcAmountRow?.balance;
                         console.log(totalApplied);
                              // Check if the row is active (checked)
                              const isActive = selectedClientBooking.indexOf(item?.id) !== -1;

                              // Set fcyammount to 0 if the row is not active
                              let fcyammount
                              if (state?.fcy_amount) {

                                fcyammount = !isActive
                                  ? Math.min(parseFloat(rowBalance), parseFloat(state?.fcy_amount) - parseFloat(state?.paid_amount))
                                  : 0;

                              }
                              else {
                                fcyammount = !isActive
                                  ? Math.min(parseFloat(rowBalance), parseFloat(state?.client_amount))
                                  : 0;

                              }


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
                  FCY Amount
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
                    {state?.fcy_amount ?
                      CommaSeparator(parseFloat(parseFloat(state?.fcy_amount) - parseFloat(state?.paid_amount)).toFixed(2))
                      : '-'}
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
                    {state?.fcy_amount && parseFloat(totalApplied) && parseFloat(state?.paid_amount)
                      ? (
                        CommaSeparator( parseFloat(state?.fcy_amount) -
                        (parseFloat(totalApplied) + parseFloat(state?.paid_amount))
                      ).toFixed(2))
                      : CommaSeparator(parseFloat(
                        parseFloat(state?.vendor_amount) +
                        parseFloat(state?.damage_gws) -
                        parseFloat(totalApplied)
                      ).toFixed(2))}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <PrimaryButton
            disabled={totalApplied > 0 ? false : true }
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

export default ExportVendorFundsApply;
