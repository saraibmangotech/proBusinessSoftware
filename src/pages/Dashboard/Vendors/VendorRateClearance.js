import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import moment from "moment";
import { CircleLoading } from "components/Loaders";
import { ArrowForwardIos } from "@mui/icons-material";
import DatePicker from "components/DatePicker";
import SimpleDialog from "components/Dialog/SimpleDialog";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import VendorServices from "services/Vendor";
import { useForm } from "react-hook-form";
import InputField from "components/Input";
import { CSVLink } from "react-csv";
import { Debounce } from "utils";

function VendorRateClearance() {
  const csvLink = useRef();
  const csvCompareLink = useRef();
  const inputRef = useRef();

  const tableHead = ["Clearance Port"];

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

  // *For Clearance Rates
  const [clearanceRates, setClearanceRates] = useState();
  const [searchedClearanceRates, setSearchedClearanceRates] = useState();

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
        type: "clearance",
      };
      const { data } = await VendorServices.getVendorDropdown(params);
      setVendors(data?.vendors);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Vendor Clearance Rates
  const getClearanceRates = async (filter) => {
    setLoader(true);
    try {
      setFilters(filter);
      const { data } = await VendorServices.getClearanceRates(filter);
      const sortedData = data?.rates.slice().sort((a, b) => a.id - b.id);
      setClearanceRates(sortedData);
      setSearchedClearanceRates(sortedData);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false);
    }
  };

  // *For Vendor Clearance Rates Comparison
  const getClearanceRatesComparison = async () => {
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
        vendor_id: selectedVendor?.id,
        dates: dates.join(","),
      };
      const { data } = await VendorServices.getClearanceRatesComparison(params);

      var sortedData = [];
      for (let index = 0; index < data?.rates.length; index++) {
        const month = moment(data?.rates[index]?.month, "MM-YYYY").format(
          "MMM"
        );
        const rates = data?.rates[index]?.rates;
        for (let i = 0; i < rates?.length; i++) {
          const rate = rates[i];
          const dataIndex = sortedData.findIndex((e) => e?.id === rate?.id);
          if (dataIndex === -1) {
            let obj = {
              id: rate?.id,
              port: rate["destination.name"],
              [month + "_cost"]: rate?.cost,
            };
            sortedData.push(obj);
          } else {
            sortedData[dataIndex][month + "_cost"] = rate?.cost;
          }
        }
      }

      const head = ["Sr", "Vendor", "Clearance Port"];
      data?.rates?.forEach((e) => {
        const month = moment(e?.month, "MM-YYYY").format("MMM");
        head.push(`${month}-Cost`);
      });
      const csvFormatData = [];
      csvFormatData.push(head);
      for (let index = 0; index < sortedData.length; index++) {
        const rate = sortedData[index];
        const newRow = [index + 1, selectedVendor?.name, rate?.port];
        for (const [key, value] of Object.entries(rate)) {
          if (key.includes("cost")) {
            newRow.push(value);
          }
        }
        csvFormatData.push(newRow);
      }
      setComparisonCsvData(csvFormatData);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setOpenDateRangeDialog(false);
      setLoading2(false);
    }
  };

  // *For Search Clearance Rate
  const searchClearanceRates = (value) => {
    if (value) {
      let val = value?.toLowerCase();
      const filteredData = clearanceRates.filter((e) =>
        e?.destination?.name?.toLowerCase().includes(val)
      );
      setSearchedClearanceRates(filteredData);
    } else {
      setSearchedClearanceRates(clearanceRates);
    }
  };

  // *For Apply Filters
  const applyFilter = async () => {
    try {
      let obj = {
        currency: selectedVendor?.currency,
        vendor_id: selectedVendor?.id,
        date: moment().format("MM-DD-YYYY"),
      };
      getClearanceRates(obj);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Update Clearance Rate
  const updateClearanceRate = async (formData) => {
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
      const { message } = await VendorServices.updateClearanceRate(obj);
      SuccessToaster(message);
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
      getClearanceRates(obj);
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
      const head = ["Sr", "Vendor", "Clearance Port", "Cost", "Month Year"];
      const data = [];
      data.push(title);
      data.push(head);
      for (let index = 0; index < clearanceRates?.length; index++) {
        const rate = clearanceRates[index];
        const monthYear = moment(rate?.month_year).format("MMM-YY");
        let newRow = [
          index + 1,
          selectedVendor?.name,
          rate?.destination?.name,
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
        const { message } = await VendorServices.uploadClearanceRate(formData);
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

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => searchClearanceRates(data));
  };

  useEffect(() => {
    getVendorDropdown();
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
      {clearanceRates && (
        <CSVLink
          ref={csvLink}
          data={csvData}
          filename={`clearance-rate ${moment().format(
            "DD-MMM-YYYY h:mm A"
          )}.csv`}
          target="_blank"
        />
      )}

      {/* ========== Export Compare CSV File ========== */}
      {clearanceRates && (
        <CSVLink
          ref={csvCompareLink}
          data={comparisonCsvData}
          filename={`clearance-compare-rate ${moment().format(
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
                views={["month", "year"]}
                disableFuture={true}
                minDate={new Date("2023-11-01")}
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
                onClick={() => getClearanceRatesComparison()}
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
            Clearance Rates
          </Typography>
        </Grid>
        <Grid item md={6} sx={{ textAlign: "right" }}>
          <PrimaryButton
            disabled={clearanceRates?.length > 0 ? false : true}
            title="Compare Rate"
            style={{ backgroundColor: Colors.bluishCyan, marginRight: "10px" }}
            onClick={() => setOpenDateRangeDialog(true)}
          />
          <PrimaryButton
            disabled={clearanceRates?.length > 0 ? false : true}
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
          <Grid container spacing={1} alignItems={"center"}>
            <Grid item md={3}>
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
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  mt: "11px",
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <PrimaryButton title={"Search"} type={"submit"} />
              </Box>
            </Grid>
          </Grid>
        </Box>

        {clearanceRates && (
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

        {/* Filters */}
        {searchedClearanceRates && (
          <Grid container spacing={1} columns={15}>
            <Grid item xs={12} sm={4}>
              <InputField
                size={"small"}
                label={"Search"}
                placeholder={"Search"}
                register={register("search", {
                  onChange: (e) => handleFilter(e.target.value),
                })}
              />
            </Grid>
          </Grid>
        )}

        {loader ? (
          <CircleLoading />
        ) : (
          searchedClearanceRates && (
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
                      {tableHead.map((cell, index) => (
                        <TableCell
                          key={index}
                          sx={{
                            bgcolor: Colors.primary,
                            color: Colors.white,
                            borderRadius:
                              index === 0
                                ? "12px 0 0 0"
                                : index === 3
                                  ? "0 12px 0 0"
                                  : "0",
                          }}
                        >
                          {cell}
                        </TableCell>
                      ))}
                      <TableCell
                        sx={{
                          bgcolor: Colors.primary,
                          color: Colors.white,
                          borderRadius: "0 12px 0 0",
                        }}
                      >
                        {historyMonth
                          ? moment(historyMonth).format("MMM YYYY")
                          : moment().format("MMM YYYY")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchedClearanceRates.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell
                          sx={{
                            borderRight: `1px solid ${Colors.iron}`,
                            borderLeft: `1px solid ${Colors.iron}`,
                          }}
                        >
                          {item?.destination?.name}
                        </TableCell>
                        <TableCell
                          sx={{ borderRight: `1px solid ${Colors.iron}` }}
                        >
                          {true ? (
                            <InputField
                              size={"small"}
                              type={"number"}
                              defaultValue={item?.cost}
                              register={register2(`${item?.id}`)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">USD</InputAdornment>
                                , inputProps: { min: 0 }
                              }}
                              inputStyle={{ width: "130px" }}
                            />
                          ) : (
                            item?.cost
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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
                    onClick={handleSubmit2(updateClearanceRate)}
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

export default VendorRateClearance;
