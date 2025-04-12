import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  IconButton,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Backdrop,
  InputAdornment,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { ArrowForwardIos } from "@mui/icons-material";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import VendorServices from "services/Vendor";
import { useForm } from "react-hook-form";
import SystemServices from "services/System";
import moment from "moment";
import { CircleLoading } from "components/Loaders";
import InputField from "components/Input";
import SimpleDialog from "components/Dialog/SimpleDialog";
import DatePicker from "components/DatePicker";
import { CSVLink } from "react-csv";
import { subMonths } from "date-fns";

function VendorRateShipping() {
  const csvLink = useRef();
  const csvCompareLink = useRef();
  const inputRef = useRef();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { register: register2, handleSubmit: handleSubmit2 } = useForm();

  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvUploadLoading, setCsvUploadLoading] = useState(false);

  // *For Open Dialog
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [openDateRangeDialog, setOpenDateRangeDialog] = useState(false);

  // *For Vendor Dropdown
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // *For Destination
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // *For Shipping Line
  const [shippingLines, setShippingLines] = useState([]);
  const [selectedShippingLine, setSelectedShippingLine] = useState(null);

  // *For Shipping Rates
  const [shippingRates, setShippingRates] = useState();
  const [csvShippingRate, setCsvShippingRate] = useState();

  // *For Shipping Ports
  const [shippingPorts, setShippingPorts] = useState();

  // *For Handle Date
  const [historyMonth, setHistoryMonth] = useState();
  const [fromMonth, setFromMonth] = useState();
  const [toMonth, setToMonth] = useState();

  // *For Filter
  const [filters, setFilters] = useState();

  // *For Export CSV Table
  const [csvData, setCsvData] = useState([]);
  const [comparisonCsvData, setComparisonCsvData] = useState([]);

  // *For Handle Date
  const handleHistoryMonth = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setHistoryMonth("invalid");
        return;
      }
      setHistoryMonth(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Handle From Date
  const handleFromMonth = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setFromMonth("invalid");
        return;
      }
      setFromMonth(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Handle To Date
  const handleToMonth = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setToMonth("invalid");
        return;
      }
      setToMonth(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Vendor
  const getVendorDropdown = async () => {
    try {
      let params = {
        type: "shipping",
      };
      const { data } = await VendorServices.getVendorDropdown(params);
      setVendors(data?.vendors);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Destination
  const getDestinations = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search,
      };
      const { data } = await SystemServices.getDestinations(params);
      setDestinations(data?.destinations?.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Shipping Line
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

  // *For Vendor Shipping Rates
  const getShippingRates = async (filter) => {
    setLoader(true);
    try {
      const Filter = { ...filters, ...filter };
      setFilters(Filter);
      const { data } = await VendorServices.getShippingRates(Filter);
      setShippingPorts(data?.ports);
      const sortedData = data?.rates.slice().sort((a, b) => a.id - b.id);
      setCsvShippingRate(sortedData);
      const rates = [];
      let cellId =
        sortedData[0]?.container_size_id + sortedData[0]?.vehicle_count;
      let cellObj = {};
      sortedData.forEach((e) => {
        if (e?.container_size_id) {
          if (cellId === e?.container_size_id + e?.vehicle_count) {
            cellObj[e?.port?.name + "_id"] = e?.id;
            cellObj[e?.port?.name + "_cost"] = e?.cost;
            cellObj["name"] =
              (e?.container?.name ? e?.container?.name + " / " : "") +
              e?.vehicle_count +
              " " +
              e?.vehicle_type;
          } else {
            rates.push(cellObj);
            cellId = e?.container_size_id + e?.vehicle_count;
            cellObj = {
              [e?.port?.name + "_id"]: e?.id,
              [e?.port?.name + "_cost"]: e?.cost,
              name:
                (e?.container?.name ? e?.container?.name + " / " : "") +
                e?.vehicle_count +
                " " +
                e?.vehicle_type,
            };
          }
        } else {
          if (cellId === e?.vehicle_count + e?.vehicle_type) {
            cellObj[e?.port?.name + "_id"] = e?.id;
            cellObj[e?.port?.name + "_cost"] = e?.cost;
            cellObj["name"] = e?.vehicle_type;
          } else {
            rates.push(cellObj);
            cellId = e?.vehicle_count + e?.vehicle_type;
            cellObj = {
              [e?.port?.name + "_id"]: e?.id,
              [e?.port?.name + "_cost"]: e?.cost,
              name: e?.vehicle_type,
            };
          }
        }
      });
      rates.push(cellObj);
      setShippingRates(rates);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false);
    }
  };

  // *For Vendor Shipping Rates Comparison
  const getShippingRatesComparison = async () => {
    setLoading2(true);
    try {
      const startDate = moment(fromMonth, "MM-DD-YYYY");
      const endDate = moment(toMonth, "MM-DD-YYYY");
      const dates = [];

      // *Iterate over the months in the range
      while (
        startDate.isBefore(endDate) ||
        startDate.isSame(endDate, "month")
      ) {
        const monthYear = startDate.format("MMMM YYYY");
        dates.push(moment(monthYear).add(1, "day").format("MM-DD-YYYY"));
        startDate.add(1, "month");
      }

      let params = {
        currency: selectedVendor?.currency,
        destination: selectedDestination?.id,
        vendor_id: selectedVendor?.id,
        country_id: selectedVendor?.country_id,
        shipping_line: selectedShippingLine?.id,
        dates: dates.join(","),
      };
      const { data } = await VendorServices.getShippingRatesComparison(params);

      const csvFormatData = [];
      const head = [
        "Sr",
        "Vendor",
        "Destination",
        "Shipping Line",
        "Container size/amount of vehicle",
        "Loading Port",
      ];
      data?.rates?.forEach((e) => {
        const month = moment(e?.month, "MM-YYYY").format("MMM");
        head.push(`${month}-Cost`);
      });
      csvFormatData.push(head);
      const initialData = data?.rates[0];
      for (let j = 0; j < initialData?.rates?.length; j++) {
        let costingArray = [j];
        let totalMonths = data?.rates?.length;
        let containerName;
        if (initialData.rates[j]?.container_size_id) {
          containerName =
            initialData.rates[j]["container.name"] +
            " / " +
            initialData.rates[j]?.vehicle_count +
            " " +
            initialData.rates[j]?.vehicle_type;
        } else {
          containerName = initialData.rates[j]?.vehicle_type;
        }
        const portName = initialData.rates[j]["port.name"];
        costingArray.push(selectedVendor?.name);
        costingArray.push(selectedDestination?.name);
        costingArray.push(selectedShippingLine?.name);
        costingArray.push(containerName);
        costingArray.push(portName);
        for (let i = 0; i < totalMonths; i++) {
          const month = i;
          let monthIndex = head.length - totalMonths + month;
          costingArray[monthIndex] = data?.rates[month].rates[j].cost;
        }
        csvFormatData.push(costingArray);
      }
      setComparisonCsvData(csvFormatData);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setOpenDateRangeDialog(false);
      setLoading2(false);
    }
  };

  // *For Apply Filters
  const applyFilter = async () => {
    try {
      let obj = {
        currency: selectedVendor?.currency,
        destination: selectedDestination?.id,
        vendor_id: selectedVendor?.id,
        country_id: selectedVendor?.country_id,
        shipping_line: selectedShippingLine?.id,
        date: moment().format("MM-DD-YYYY"),
      };
      getShippingRates(obj);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Update Shipping Rate
  const updateShippingRate = async (formData) => {
    setLoading(true);
    try {
      const rates = [];
      for (let key in formData) {
        let rate = {
          id: key,
          cost: formData[key],
        };
        rates.push(rate);
      }
      let obj = {
        rates: rates,
      };
      const { message } = await VendorServices.updateShippingRate(obj);
      SuccessToaster(message);
      getShippingRates();
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoading(false);
    }
  };

  // *For History Filter
  const historyFilter = () => {
    try {
      let obj = {
        ...filters,
        date: moment(historyMonth).format("MM-DD-YYYY"),
      };
      getShippingRates(obj);
      setOpenDateDialog(false);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Download CSV File
  const downloadCsv = () => {
    setCsvLoading(true);
    try {
      const title = ['sep=,'];
      const head = [
        "Sr",
        "Vendor",
        "Destination",
        "Shipping Line",
        "Container Size",
        "Number of Vehicles",
        "Vehicle Type",
        "Loading Port",
        "Cost",
        "Month Year",
      ];
      const data = [];
      data.push(title);
      data.push(head);
      for (let index = 0; index < csvShippingRate.length; index++) {
        const rate = csvShippingRate[index];
        const monthYear = moment(rate?.month_year).format("MMM-YY");
        let newRow = [
          index + 1,
          selectedVendor?.name,
          selectedDestination?.name,
          selectedShippingLine?.name,
          rate?.container?.name,
          rate?.vehicle_count,
          rate?.vehicle_type,
          rate?.port?.name,
          rate?.cost,
          monthYear,
        ];
        data.push(newRow);
      }
      setCsvData(data);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setCsvLoading(false);
    }
  };

  // *For Upload CsV File
  const uploadCsv = async (e) => {
    setCsvUploadLoading(true);
    try {
      e.preventDefault();
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("rates", file);
      // *For Check Image Format
      if (file.type === "text/csv") {
        const { message } = await VendorServices.uploadShippingRate(formData);
        SuccessToaster(message);
      } else {
        ErrorToaster(`Only CSV formats is supported`);
      }
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setCsvUploadLoading(false);
    }
  };

  useEffect(() => {
    getVendorDropdown();
    getDestinations();
    getShippingLines();
  }, []);

  useEffect(() => {
    if (csvData.length > 0) {
      csvLink?.current.link.click();
    }
    if (comparisonCsvData.length > 0) {
      csvCompareLink?.current.link.click();
    }
  }, [csvData, comparisonCsvData]);

  return (
    <Box sx={{ m: 4, mb: 2 }}>
      {/* ========== Export CSV File ========== */}
      {shippingRates && (
        <CSVLink
          ref={csvLink}
          data={csvData}
          filename={`shipping-rate ${moment().format(
            "DD-MMM-YYYY h:mm A"
          )}.csv`}
          target="_blank"
        />
      )}

      {/* ========== Export Compare CSV File ========== */}
      {shippingRates && (
        <CSVLink
          ref={csvCompareLink}
          data={comparisonCsvData}
          filename={`shipping-compare-rate ${moment().format(
            "DD-MMM-YYYY h:mm A"
          )}.csv`}
          target="_blank"
        />
      )}

      <SimpleDialog
        open={openDateDialog}
        onClose={() => {
          setOpenDateDialog(false);
          setHistoryMonth();
        }}
        title={"Select Month"}
      >
        <Box component="form">
          <Grid container spacing={0}>
            <Grid item xs={12} sm={12}>
              <DatePicker
                label={"Select Month"}
                views={['month', 'year']}
                disableFuture={true}
                minDate={new Date('2023-11-01')}
                value={historyMonth}
                onChange={(date) => handleHistoryMonth(date)}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
              <PrimaryButton title="Save" onClick={() => historyFilter()} />
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>

      <SimpleDialog
        open={openDateRangeDialog}
        onClose={() => setOpenDateRangeDialog(false)}
        title={"Select Months"}
      >
        <Box component="form">
          <Grid container spacing={0}>
            <Grid item xs={12} sm={12}>
              <DatePicker
                label={"From Month"}
                openTo="month"
                views={["month"]}
                disableFuture={true}
                value={fromMonth}
                onChange={(date) => handleFromMonth(date)}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <DatePicker
                label={"To Month"}
                openTo="month"
                views={["month"]}
                disableFuture={true}
                value={toMonth}
                onChange={(date) => handleToMonth(date)}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
              <PrimaryButton
                title="Download"
                loading={loading2}
                onClick={() => getShippingRatesComparison()}
              />
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>

      <Grid container spacing={1} alignItems={"center"}>
        <Grid item md={6}>
          <Typography
            variant="h5"
            sx={{
              color: Colors.charcoalGrey,
              fontFamily: FontFamily.NunitoRegular,
            }}
          >
            Shipping Rates
          </Typography>
        </Grid>
        <Grid item md={6} sx={{ textAlign: "right" }}>
          <PrimaryButton
            disabled={shippingRates?.length > 0 ? false : true}
            title="Compare Rate"
            style={{ backgroundColor: Colors.bluishCyan, marginRight: "10px" }}
            onClick={() => setOpenDateRangeDialog(true)}
          />
          <PrimaryButton
            disabled={shippingRates?.length > 0 ? false : true}
            title="Download Excel"
            style={{ backgroundColor: Colors.bluishCyan, marginRight: "10px" }}
            onClick={() => downloadCsv()}
            loading={csvLoading}
          />
          <input
            ref={inputRef}
            accept=".csv"
            type="file"
            onChange={(e) => uploadCsv(e)}
            style={{ display: "none" }}
          />
          <PrimaryButton
            title="Upload Excel"
            onClick={(e) => inputRef?.current.click()}
            loading={csvUploadLoading}
          />
        </Grid>
      </Grid>
      <Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px', mt: 3 }}>
        <Box
          component={"form"}
          onSubmit={handleSubmit(applyFilter)}
          sx={{
            m: "20px 0 20px 5px",

          }}
        >
          <Grid
            container
            spacing={1}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Grid item md={9}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
                  <SelectField
                    size="small"
                    label={"Vendor"}
                    options={vendors}
                    selected={selectedVendor}
                    onSelect={(value) => setSelectedVendor(value)}
                    error={errors?.vendor?.message}
                    register={register("vendor", {
                      required: "Please select vendor.",
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <SelectField
                    size="small"
                    label={"Destination Port"}
                    options={destinations}
                    selected={selectedDestination}
                    onSelect={(value) => setSelectedDestination(value)}
                    error={errors?.destination?.message}
                    register={register("destination", {
                      required: "Please select destination.",
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <SelectField
                    size="small"
                    label={"Shipping Line"}
                    options={shippingLines}
                    selected={selectedShippingLine}
                    onSelect={(value) => setSelectedShippingLine(value)}
                    error={errors?.shippingLine?.message}
                    register={register("shippingLine", {
                      required: "Please select shipping line.",
                    })}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={3}>
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

        {shippingRates && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "10px",
                color: Colors.primary,
                cursor: "pointer",
              }}
              onClick={() => setOpenDateDialog(true)}
            >
              <Typography variant="subtitle2">View Historical Data</Typography>
              <IconButton sx={{ color: Colors.primary }}>
                <ArrowForwardIos />
              </IconButton>
            </Box>
          </Box>
        )}

        {loader ? (
          <CircleLoading />
        ) : (
          shippingRates && (
            <Fragment>
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                  borderRadius: 2,
                  maxWidth: "calc(100vw - 330px)",
                  display: "flex",
                }}
              >
                <Table stickyHeader sx={{ minWidth: 800, padding: "40px" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell
                        colSpan={7}
                        sx={{
                          bgcolor: Colors.primary,
                          color: Colors.white,
                          textAlign: "center",
                          borderRadius: "12px 12px 0 0",
                        }}
                      >
                        {historyMonth
                          ? moment(historyMonth).format("MMMM YYYY")
                          : moment().format("MMMM YYYY")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: `1px solid ${Colors.iron}` }}>
                        Container size/amount of vehicle
                      </TableCell>
                      <TableCell
                        colSpan={7}
                        sx={{
                          borderRight: `1px solid ${Colors.iron}`,
                          textAlign: "center",
                        }}
                      >
                        Prices by loading port & Shipping Line
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ border: `1px solid ${Colors.iron}` }}>
                      <TableCell
                        sx={{
                          border: `1px solid ${Colors.iron}`,
                          borderRight: `1px solid ${Colors.iron}`,
                        }}
                      ></TableCell>
                      {shippingPorts?.map((item, index) => (
                        <TableCell
                          key={index}
                          sx={{ borderRight: `1px solid ${Colors.iron}` }}
                        >
                          {item?.name}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shippingRates?.length > 0 ? (
                      <Fragment>
                        {shippingRates.map((item, index) => (
                          <TableRow
                            key={index}
                            sx={{ border: `1px solid ${Colors.iron}` }}
                          >
                            <TableCell
                              sx={{ border: `1px solid ${Colors.iron}` }}
                            >
                              {item?.name}
                            </TableCell>
                            {shippingPorts?.map((port, i) => (
                              <TableCell
                                key={i}
                                sx={{ borderRight: `1px solid ${Colors.iron}` }}
                              >
                                {true ? (
                                  <InputField
                                    size={"small"}
                                    type={"number"}
                                    defaultValue={`${item[`${port?.name}_cost`]}`}

                                    register={register2(
                                      `${item[`${port?.name}_id`]}`
                                    )}
                                    InputProps={{
                                      startAdornment: <InputAdornment position="start">USD</InputAdornment>
                                      , inputProps: { min: 0 }
                                    }}
                                    inputStyle={{ width: "130px" }}
                                  />
                                ) : (
                                  `${item[`${port?.name}_cost`]}`
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </Fragment>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          align="center"
                          sx={{ fontWeight: 600 }}
                        >
                          No Data Found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {true && (
                <Box
                  sx={{
                    mt: "11px",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <PrimaryButton
                    loading={loading}
                    title={"Update"}
                    onClick={handleSubmit2(updateShippingRate)}
                  />
                </Box>
              )}
            </Fragment>
          )
        )}
      </Box>
    </Box>
  );
}

export default VendorRateShipping;
