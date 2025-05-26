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
  Chip,
  Grid,
} from "@mui/material";
import styled from "@emotion/styled";
import { FontFamily } from "assets";
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
import SystemServices from "services/System";
import { PrimaryButton } from "components/Buttons";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
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

function BusinessCountriesList() {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const contentRef = useRef(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const tableHead = ["Country", "State", "Port", "City Name", "Action"];

  const [loader, setLoader] = useState(false);

  // *For Buyer ID
  const [businessCountries, setBusinessCountries] = useState([]);
  const [buyerId, setBuyerId] = useState(null);

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

  // *For Countries
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const [stateDisabled, setstateDisabled] = useState(true);

  // *For States
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);

  const [countryCode, setCountryCode] = useState();
  const [filterLoader, setFilterLoader] = useState(false);

  // *For Cities
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  // *For Select Type
  const [selectedType, setSelectedType] = useState(null);

  // *For Loading Port
  const [loadingPort, setLoadingPort] = useState([]);
  const [selectedLoadingPort, setSelectedLoadingPort] = useState(null);

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

  // *For Get States
  const getStates = async (countryId) => {
    console.log(countryId, "countryId");
    try {
      const { data } = await SystemServices.getBusinessLocation(countryId);

      setCountryCode(data?.locations[0]?.country_code);
      // Create an object to store unique items based on state_code
      const uniqueItems = {};

      // Filter out duplicates based on state_code
      const result = data?.locations.filter((item) => {
        if (!uniqueItems[item.state_code]) {
          uniqueItems[item.state_code] = true;
          return true;
        }
        return false;
      });

      setStates(
        result?.map((item) => {
          return {
            id: item.id,
            name: item?.state_code,
            country_code: item?.country_code,
          };
        })
      );
    } catch (error) {
      ErrorToaster(error);
    }
  };
  const sortData = (e, type, item) => {
    e.preventDefault();
    console.log("Original array:", businessCountries);
    console.log(type);
    console.log(item, "item");

    if (type === "ascending" && item == "Country") {
      const sortedData = [...businessCountries].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return a.country_name.localeCompare(b.country_name);
      });

      setBusinessCountries(sortedData);
    }

    if (type === "descending" && item == "Country") {
      const sortedData = [...businessCountries].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.country_name?.localeCompare(a.country_name);
      });

      setBusinessCountries(sortedData);
    }
    if (type === "ascending" && item == "State") {
      const sortedData = [...businessCountries].sort((a, b) => {
        // Use the localeCompare method for string comparison
        console.log(a, "a");
        console.log(a, "b");
        return a.state_code.localeCompare(b.state_code);
      });

      setBusinessCountries(sortedData);
    }
    if (type === "descending" && item == "State") {
      const sortedData = [...businessCountries].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.state_code.localeCompare(a.state_code);
      });

      setBusinessCountries(sortedData);
    }
    if (type === "ascending" && item == "Port") {
      const sortedData = [...businessCountries].sort((a, b) => {
        // Use the localeCompare method for string comparison
        console.log(a, "a");
        console.log(a, "b");
        return a.port?.name.localeCompare(b?.port?.name);
      });

      setBusinessCountries(sortedData);
    }
    if (type === "descending" && item == "Port") {
      const sortedData = [...businessCountries].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.port?.name.localeCompare(a.port?.name);
      });

      setBusinessCountries(sortedData);
    }
    if (type === "ascending" && item == "City Name") {
      const sortedData = [...businessCountries].sort((a, b) => {
        // Use the localeCompare method for string comparison
        console.log(a, "a");
        console.log(a, "b");
        return a.city_name.localeCompare(b?.city_name);
      });

      setBusinessCountries(sortedData);
    }
    if (type === "descending" && item == "City Name") {
      const sortedData = [...businessCountries].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.city_name.localeCompare(a.city_name);
      });

      setBusinessCountries(sortedData);
    }
  };

  // *For Get Cities
  const getCities = async (stateId) => {
    try {
      const { data } = await SystemServices.getCities(stateId);
      setCities(data?.cities.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };
  // *For Get Loading Port
  const getLoadingPorts = async (id) => {
    try {
      const { data } = await SystemServices.getLoadingPorts();

      setLoadingPort(data?.ports?.filter((item) => item?.country_id == id));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Countries
  const getCountries = async () => {
    try {
      const { data } = await SystemServices.getBusinessCountries();
      setCountries(data?.countries);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Buyer IDs
  const getBusinessCountries = async (filter) => {
    setLoader(true);

    try {
      const Filter = { ...filters, ...filter };
      setFilters(Filter);
      let params = {
        page: 1,
        limit: 999999,
      };
      params = { ...params, ...Filter };

      const { data } = await SystemServices.getBusinessLocationList(params);
      console.log(data, "data");
      setBusinessCountries(data?.locations);
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
      setLoader(false);
    }
  };

  // *For Apply Filters
  const applyFilter = async () => {
    setFilterLoader(true);
    try {
      let data = {
        country_name: selectedCountry?.name,
        country_code: countryCode,
        country_id: selectedCountry?.id,
        city_name: getValues("city"),
        state_code: selectedState ? selectedState?.name : null,
        port_id: selectedLoadingPort?.id,
      };
      console.log(data);
      getBusinessCountries(data);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Action");
    const rows = businessCountries?.map((item) => [
      item?.country_name ?? "-",
      item?.state_code ?? "-",
      item?.port?.name ?? "-",
      item?.city_name ?? "-"
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
    getCountries();
    getAuctionHouses();
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
          Location List
        </Typography>
        {businessCountries?.length > 0 && (
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
      <Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px', mt: 3 }}>
        <Grid
          container
          spacing={2}
          component={"form"}
          onSubmit={handleSubmit(applyFilter)}
          display={"flex"}
          alignItems={"center"}
        >
          <Grid item xs={12} sm={2}>
            <SelectField
              label={"Country"}
              size={"small"}
              options={countries}
              selected={selectedCountry}
              onSelect={(value) => {
                setSelectedCountry(value);
                getStates(value?.id);
                setSelectedState(null);
                setSelectedCity(null);
                getLoadingPorts(value?.id);
                console.log(value);
                if (value?.id == 39) {
                  setstateDisabled(false);
                } else {
                  setstateDisabled(true);
                }
              }}
              error={errors?.country?.message}
              register={register("country", {
                required: "Please select country.",
              })}
            />
          </Grid>
          {stateDisabled && (
            <Grid item xs={12} sm={2}>
              <SelectField
                disabled={stateDisabled ? false : true}
                label={"States"}
                size={"small"}
                options={states}
                selected={selectedState}
                error={errors?.state?.message}
                onSelect={(value) => {
                  setSelectedState(value);
                  setSelectedLoadingPort(null);
                }}
                register={register("state")}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={2}>
            <SelectField
              disabled={selectedCountry ? false : true}
              label={"Ports"}
              size={"small"}
              options={loadingPort}
              selected={selectedLoadingPort}
              error={errors?.port?.message}
              onSelect={(value) => setSelectedLoadingPort(value)}
              register={register("port")}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <InputField
              label={"City Name"}
              size={"small"}
              placeholder={"City Name"}
              error={errors?.buyerId?.message}
              register={register("city")}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Box
              sx={{
                mt: "5%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <PrimaryButton title={"Search"} type={"submit"} />
            </Box>
          </Grid>
        </Grid>

        {filterLoader || businessCountries.length > 0 ? (
          <Fragment>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
              fileName="Location List"
            >
              <Box className='pdf-show' sx={{ display: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    Location List
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
                className="table-box"
              >
                <Table stickyHeader sx={{ minWidth: 500 }}>
                  <TableHead>
                    <TableRow>
                      {tableHead.map((item, index) => (
                        <Cell className="pdf-table" key={index}>
                          {item}{" "}
                          {item == "Sr" || item == "Month Year" ? (
                            ""
                          ) : (
                            <>
                              {" "}
                              <span className="pdf-hide">
                                <ArrowUpwardIcon
                                  sx={{
                                    color: "white",
                                    fontSize: "15px",
                                    cursor: "pointer",
                                  }}
                                  onClick={(e) => sortData(e, "ascending", item)}
                                />{" "} </span>
                              <span className="pdf-hide">
                                <ArrowDownwardIcon
                                  sx={{
                                    color: "white",
                                    fontSize: "15px",
                                    cursor: "pointer",
                                  }}
                                  onClick={(e) => sortData(e, "descending", item)}
                                />{" "}</span>
                            </>
                          )}
                        </Cell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!loader ? (
                      businessCountries?.length > 0 ? (
                        <Fragment>
                          {businessCountries.map((item, index) => (
                            <Row
                              key={index}
                              sx={{ bgcolor: index % 2 !== 0 && "#EFF8E7" }}
                            >
                              <Cell className="pdf-table" >{item?.country_name ?? "-"}</Cell>
                              <Cell className="pdf-table" >{item?.state_code ?? "-"}</Cell>
                              <Cell className="pdf-table" >{item?.port?.name ?? "-"}</Cell>
                              <Cell className="pdf-table" >{item?.city_name ?? "-"}</Cell>
                              <Cell>
                                {" "}
                                <Box component={'div'} className="pdf-hide"
                                  sx={{ cursor: "pointer" }}
                                  onClick={() => {
                                    navigate(`/update-business-location`, { state: item })
                                  }}
                                >
                                  <IconButton
                                    sx={{
                                      bgcolor: Colors.blackShade,
                                      "&:hover": { bgcolor: Colors.blackShade },
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
                                    Update
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
            {/* 
                    
                    <Pagination
                        currentPage={currentPage}
                        pageSize={pageLimit}
                        onPageSizeChange={(size) => getBusinessCountries(1, size.target.value)}
                        tableCount={businessCountries?.length}
                        totalCount={totalCount}
                        onPageChange={(page) => getBusinessCountries(page, "")}
                    /> */}
          </Fragment>
        ) : (
          ""
        )}
      </Box>
    </Box>
  );
}

export default BusinessCountriesList;
