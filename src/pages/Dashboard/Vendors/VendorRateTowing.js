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
  Pagination,
  PaginationItem,
  InputAdornment,
} from "@mui/material";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import VendorServices from "services/Vendor";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import moment from "moment";
import { ArrowForwardIos } from "@mui/icons-material";
import SimpleDialog from "components/Dialog/SimpleDialog";
import DatePicker from "components/DatePicker";
import { CircleLoading } from "components/Loaders";
import InputField from "components/Input";
import { CSVLink } from "react-csv";
import { Debounce } from "utils";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

function VendorRateTowing() {
  const csvLink = useRef();
  const csvCompareLink = useRef();
  const inputRef = useRef();

  const tableHead = ["SL#", "Country", "State/City", "Port Name"];

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


  const [items, setItems] = useState([]); // Your array of items
  const [page, setPage] = useState(1);
  const itemsPerPage = 100; // Change this to the number of items you want per page

  let pageCount = Math.ceil(items.length / itemsPerPage);

  const handleChangePage = (event, value) => {

    setPage(value);
    PaginationFunc(null, value)
  };

  let startIndex
  let endIndex
  let displayedItems

  const PaginationFunc = (data, pg = 1) => {
    if (!data) {
      data = items
    }
    startIndex = (pg - 1) * itemsPerPage;
    endIndex = startIndex + itemsPerPage;
    console.log(startIndex,endIndex);
    console.log(data,'asas');
    displayedItems = data.slice(startIndex, endIndex);
    console.log(displayedItems,'displayedItemsdisplayedItems');
    const sortedData = displayedItems.slice().sort((a, b) => a.id - b.id);
    setTowingRates(sortedData);
    setSearchedTowingRates(sortedData);
    setLoading(false)
    setSearchedTowingRates(sortedData)
    setLoader(false)
    pageCount = Math.ceil(1/ itemsPerPage);

  }

  // *For Open Dialog
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [openDateRangeDialog, setOpenDateRangeDialog] = useState(false);

  // *For Vendor Dropdown
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // *For Towing Rates
  const [towingRates, setTowingRates] = useState();
  const [searchedTowingRates, setSearchedTowingRates] = useState();

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
        type: "towing",
      };
      const { data } = await VendorServices.getVendorDropdown(params);
      setVendors(data?.vendors);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Vendor Towing Rates
  const getTowingRates = async (filter) => {
    setLoading(true)
    setLoader(true);
    try {
      setFilters(filter);
      const { data } = await VendorServices.getTowingRates(filter);
      setItems(data?.rates)

      PaginationFunc(data?.rates)

      setItems(data?.rates)

    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false);
      setLoading(false)
    }
  };

  // *For Vendor Towing Rates Comparison
  const getTowingRatesComparison = async () => {
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
        country_id: selectedVendor?.country_id,
        vendor_id: selectedVendor?.id,
        dates: dates.join(","),
      };
      const { data } = await VendorServices.getTowingRatesComparison(params);

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
              country: rate["location.country_name"],
              stateCode: rate["location.state_code"],
              city: rate["location.city_name"],
              [month + "_cost"]: rate?.cost,
            };
            sortedData.push(obj);
          } else {
            sortedData[dataIndex][month + "_cost"] = rate?.cost;
          }
        }
      }

      const head = ["Sr", "Vendor", "Country", "State/City"];
      data?.rates?.forEach((e) => {
        const month = moment(e?.month, "MM-YYYY").format("MMM");
        head.push(`${month}-Cost`);
      });
      const csvFormatData = [];
      csvFormatData.push(head);
      for (let index = 0; index < sortedData.length; index++) {
        const rate = sortedData[index];
        const newRow = [
          index + 1,
          selectedVendor?.name,
          rate?.country,
          rate?.stateCode + "-" + rate?.city,
        ];
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

  // *For Search Towing Rate
  const searchTowingRates = (value) => {
   
    if (value) {
      let val = value?.toLowerCase();
      const filteredData = items.filter(
        (e) =>
          e?.location?.country_name?.toLowerCase().includes(val) ||
          e?.location?.state_code?.toLowerCase().includes(val) ||
          e?.location?.city_name?.toLowerCase().includes(val)
      );

      setSearchedTowingRates(filteredData);
      
      pageCount = Math.ceil(filteredData.length / itemsPerPage);
      PaginationFunc(filteredData, pageCount)
      
      console.log(pageCount,'pageCountpageCount');

    } else {
      setSearchedTowingRates(items);
      pageCount = Math.ceil(items.length / itemsPerPage);

    }
  };
  // *For Search Towing Rate
  const searchTowingRatesPort = (value) => {
    if (value) {
      let val = value?.toLowerCase();
      const filteredData = items.filter(
        (e) =>
          e?.location?.port?.name?.toLowerCase().includes(val)

      );
      setSearchedTowingRates(filteredData);
      pageCount = Math.ceil(filteredData.length / itemsPerPage);
    } else {
      setSearchedTowingRates(items);
      pageCount = Math.ceil(items.length / itemsPerPage);
    }
  };

  // *For Apply Filters
  const applyFilter = async () => {
    try {
      let obj = {
        currency: selectedVendor?.currency,
        country_id: selectedVendor?.country_id,
        vendor_id: selectedVendor?.id,
        date: moment().format("MM-DD-YYYY"),
      };
      getTowingRates(obj);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Update Towing Rate
  const updateTowingRate = async (formData) => {
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
      const { message } = await VendorServices.updateTowingRate(obj);
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
      getTowingRates(obj);
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
        "Country",
        "State/City",
        "City",
        "Port Name",
        "Cost",
        "Month Year",
      ];
      const data = [];
      data.push(title);
      data.push(head);
      for (let index = 0; index < items?.length; index++) {
        const rate = items[index];
        const monthYear = moment(rate?.month_year).format("MMM-YY");
        let newRow = [
          index + 1,
          selectedVendor?.name,
          rate?.location?.country_name,
          rate?.location?.state_code,
          rate?.location?.city_name,
          rate?.location?.port?.name,
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
        const { message } = await VendorServices.uploadTowingRate(formData);
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
    Debounce(() => searchTowingRates(data));
  };

  const sortData = (e, type, item) => {
    e.preventDefault();

    if (type === "ascending" && item == "Country") {
      const sortedData = [...searchedTowingRates].sort((a, b) => {
        // Use the localeCompare method for string comparison

        return a.location?.country_name.localeCompare(b.location?.country_name);
      });

      setSearchedTowingRates(sortedData);
    }

    if (type === "descending" && item == "Country") {
      const sortedData = [...searchedTowingRates].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.location?.country_name.localeCompare(a.location?.country_name);
      });


      setSearchedTowingRates(sortedData);
    }

    if (type === "ascending" && item == "State/City") {
      const sortedData = [...searchedTowingRates].sort((a, b) => {
        // Use the localeCompare method for string comparison

        return a.location?.state_code.localeCompare(b.location?.state_code);
      });

      setSearchedTowingRates(sortedData);
    }

    if (type === "descending" && item == "State/City") {
      const sortedData = [...searchedTowingRates].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.location?.state_code.localeCompare(a.location?.state_code);
      });


      setSearchedTowingRates(sortedData);
    }

    if (type === "ascending" && item == "Port Name") {
      const sortedData = [...searchedTowingRates].sort((a, b) => {
        // Use the localeCompare method for string comparison

        return a.location?.port?.name.localeCompare(b.location?.port?.name);
      });

      setSearchedTowingRates(sortedData);
    }

    if (type === "descending" && item == "Port Name") {
      const sortedData = [...searchedTowingRates].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.location?.port?.name.localeCompare(a.location?.port?.name);
      });


      setSearchedTowingRates(sortedData);
    }

    if (type === "ascending" && item === "rate") {
      const sortedData = [...searchedTowingRates].sort((a, b) => {
        const costA = parseFloat(a.cost) || 0;
        const costB = parseFloat(b.cost) || 0;

        return costA - costB;
      });

      setSearchedTowingRates(sortedData);
    }

    if (type === "descending" && item === "rate") {
      const sortedData = [...searchedTowingRates].sort((a, b) => {
        const costA = parseFloat(a.cost) || 0;
        const costB = parseFloat(b.cost) || 0;

        return costB - costA;
      });

      setSearchedTowingRates(sortedData);
    }
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
      {towingRates && (
        <CSVLink
          ref={csvLink}
          data={csvData}
          filename={`towing-rate ${moment().format("DD-MMM-YYYY h:mm A")}.csv`}
          target="_blank"
        />
      )}

      {/* ========== Export Compare CSV File ========== */}
      {towingRates && (
        <CSVLink
          ref={csvCompareLink}
          data={comparisonCsvData}
          filename={`towing-compare-rate ${moment().format(
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
                onClick={() => getTowingRatesComparison()}
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
            Towing Rates
          </Typography>
        </Grid>
        <Grid item md={6} sx={{ textAlign: "right" }}>
          <PrimaryButton
            disabled={towingRates?.length > 0 ? false : true}
            title="Compare Rate"
            style={{ backgroundColor: Colors.bluishCyan, marginRight: "10px" }}
            onClick={() => setOpenDateRangeDialog(true)}
          />
          <PrimaryButton
            disabled={towingRates?.length > 0 ? false : true}
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
              <PrimaryButton title={"Search"} loading={loading} type={"submit"} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {towingRates && (
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
      {searchedTowingRates && (
        <Grid container spacing={1} columns={15}>
          <Grid item xs={12} sm={4}>
            <InputField
              size={"small"}
              label={"City/State"}
              placeholder={"Seacrh"}
              register={register("search", {
                onChange: (e) => handleFilter(e.target.value),
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              size={"small"}
              label={"Port"}
              placeholder={"Search"}
              register={register("port", {
                onChange: (e) => searchTowingRatesPort(e.target.value),
              })}
            />
          </Grid>
        </Grid>
      )}

      {loader ? (
        <CircleLoading />
      ) : (
        searchedTowingRates && (
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
              <Table stickyHeader sx={{ minWidth: 800, padding: "20px" }}>
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
                              : index === 6
                                ? "0 12px 0 0"
                                : "0",
                        }}
                      >
                        {cell}{" "}
                        {tableHead[index] == "SL#" ? (
                          ""
                        ) : (
                          <>
                            {" "}
                            <ArrowUpwardIcon
                              sx={{
                                color: "white",
                                fontSize: "15px",
                                cursor: "pointer",
                              }}
                              onClick={(e) =>
                                sortData(e, "ascending", tableHead[index])
                              }
                            />{" "}
                            <ArrowDownwardIcon
                              sx={{
                                color: "white",
                                fontSize: "15px",
                                cursor: "pointer",
                              }}
                              onClick={(e) =>
                                sortData(e, "descending", tableHead[index])
                              }
                            />{" "}
                          </>
                        )}
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
                      {false ? (
                        ""
                      ) : (
                        <>
                          <ArrowUpwardIcon
                            sx={{
                              color: "white",
                              fontSize: "15px",
                              cursor: "pointer",
                            }}
                            onClick={(e) =>
                              sortData(e, "ascending", "rate")
                            }
                          />
                          <ArrowDownwardIcon
                            sx={{
                              color: "white",
                              fontSize: "15px",
                              cursor: "pointer",
                            }}
                            onClick={(e) =>
                              sortData(e, "descending", "rate")
                            }
                          />
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchedTowingRates.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          borderRight: `1px solid ${Colors.iron}`,
                          borderLeft: `1px solid ${Colors.iron}`,
                        }}
                      >
                        {item?.location?.id ?? "-"}
                      </TableCell>
                      <TableCell
                        sx={{ borderRight: `1px solid ${Colors.iron}` }}
                      >
                        {item?.location?.country_name ?? "-"}
                      </TableCell>
                      <TableCell
                        sx={{ borderRight: `1px solid ${Colors.iron}` }}
                      >
                        {item?.location?.state_code +
                          "-" +
                          item?.location?.city_name ?? "-"}
                      </TableCell>

                      <TableCell
                        sx={{ borderRight: `1px solid ${Colors.iron}` }}
                      >
                        {item?.location?.port?.name ?? "-"}
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
            {searchedTowingRates.length > 0 && <Grid container justifyContent={'flex-end'} mt={5}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={handleChangePage}
                renderItem={(item) => (
                  <PaginationItem
                    component="div"
                    {...item}
                  />
                )}
              />
            </Grid>}

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
                  onClick={handleSubmit2(updateTowingRate)}
                />
              </Box>
            )}
          </Fragment>
        )
      )}
    </Box>
  );
}

export default VendorRateTowing;
