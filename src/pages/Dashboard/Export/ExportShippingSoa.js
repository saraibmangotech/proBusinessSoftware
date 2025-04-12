import React, { Fragment, useState, useEffect, useRef } from "react";
import {
  Grid,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  Checkbox,
  tableCellClasses,
  InputLabel,
  FormControl,
  TableCell,
  Paper,
  Select,
  MenuItem,
  ListItemText,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import { ErrorToaster } from "components/Toaster";
import moment from "moment";
import ClientServices from "services/Client";
import { Check, Close } from "@mui/icons-material";
import { useAuth } from "context/UseContext";
import FinanceServices from "services/Finance";
import { SuccessToaster } from "components/Toaster";
import { useNavigate } from "react-router-dom";
import CurrencyServices from "services/Currency";
import { useSelector } from "react-redux";
import { CircleLoading } from "components/Loaders";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ExportServices from "services/Export";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CommaSeparator, handleExportWithComponent } from "utils";
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

function ExportShippingSOA() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const { usdExchangeRate, cadExchangeRate } = useSelector(
    (state) => state.navigationReducer
  );
  let TotalBalance = 0
  // *For Total Amount
  const [totalAmount, setTotalAmount] = useState([]);

  const [allSums, setAllSums] = useState();

  // *For Client Dropdown
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  // *for Payment Type

  const [paymentType, setPaymentType] = useState("aed");

  const [totalVCC, settotalVCC] = useState();

  // *For Paid Status
  const [selectedStatus, setSelectedStatus] = useState(null);

  // *For Cashier Account
  const [cashierAccounts, setCashierAccounts] = useState([]);
  const [selectedCashierAccount, setSelectedCashierAccount] = useState(null);

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [shippingSOA, setShippingSOA] = useState();

  const [shippingVault, setShippingVault] = useState();
  const [vehicleVault, setVehicleVault] = useState();

  // *Cashier Details
  const [cashierDetails, setCashierDetails] = useState(false);

  // *For Vin and Lot
  const [vin, setVin] = useState();
  const [selectedVin, setSelectedVin] = useState();
  const [lot, setLot] = useState();
  const [selectedLot, setSelectedLot] = useState();

  // *For Filters
  const [filters, setFilters] = useState({});

  const [showTotal, setShowTotal] = useState(false);

  const [walletBalance, setWalletBalance] = useState();

  const [totalPayment, setTotalPayment] = useState();

  // *wallet Id
  const [walletId, setWalletId] = useState();

  const [totalBalance, setTotalBalance] = useState(0)

  // *For Currencies
  const [currencyExchangeRate, setCurrencyExchangeRate] = useState();

  // *for button Disable
  const [buttonState, setButtonState] = useState(false);

  const [showTable, setShowTable] = useState(false);

  // loss
  const [loss, setLoss] = useState(0);
  const [items, setItems] = useState([]);
  const [balances, setBalances] = useState({});
  // *for details
  const [sendDetails, setSendDetails] = useState();

  // *For Tooltip
  const [copied, setCopied] = useState(false);

  const copyContent = (text) => {
    const contentToCopy = text;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 300);
  }

  const classes = useStyles();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const {
    register: register2,
    handleSubmit: handleSubmit2,
    setValue,
    getValues: getValues2,
    formState: { errors: errors2 },
    reset,
  } = useForm();

  const tableHead = [
    "SL. No",
    "Received Date",
    "Model",
    "Make",
    "Vin/Container.#",
    "COLOR",
    "SHIPPING CHARGE",
    "Discount",
    "Paid",
    "Balance",

  ];

  const [visibleColumns, setVisibleColumns] = useState([
    ...Array(tableHead?.length).keys(),
  ]);
  let NoOfVCC = 0;

  // *For Clients
  const getClientDropdown = async () => {
    try {
      const { data } = await ExportServices.getVendorDropdown();
      setClients([...data?.agents, ...data?.brokers]);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Currencies
  const getCurrencies = async (currency) => {
    try {
      let params = {
        detailed: true,
      };
      const { data } = await CurrencyServices.getCurrencies(params);

      setCurrencyExchangeRate(data.currencies[2].conversion_rate);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Client Costing
  const getClientCosting = async (page, limit, filter) => {
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
        invoice: true,
      };
      params = { ...params, ...Filter };
      const { data } = await ExportServices.getExportVehicles(params);
      settotalVCC(0);
      let totalShippingCharges = 0;
      let totalLateFee = 0;
      let totalStorage = 0;
      let totalCategoryA = 0;
      let totalBrokerFee = 0;
      let totalTitleFee = 0;
      let totalOtherCharges = 0;
      let totalCustomDuty = 0;
      let totalVAT5Percent = 0;
      let totalReceivingAmount = 0;
      let subtotal = 0;
      let total = 0;
      let balance = 0;

      // Iterate through the array and accumulate the shipping charges

      data?.vehicles?.rows.forEach((item) => {
        if (item?.vehicle?.vcc) {
          NoOfVCC++;
        }
        console.log(NoOfVCC);
        settotalVCC(NoOfVCC);
        totalShippingCharges += parseFloat(item?.shipping_charges);
        totalLateFee += parseFloat(item?.late_fee);
        totalStorage += parseFloat(item?.storage);
        totalCategoryA += parseFloat(item?.category_a);
        totalBrokerFee += parseFloat(item?.broker_fee);
        totalTitleFee += parseFloat(item?.title_fee);
        totalOtherCharges += parseFloat(item?.other_charge);
        totalCustomDuty += parseFloat(
          item?.custom_duty);
        totalVAT5Percent += parseFloat(
          item?.vat);
        totalReceivingAmount += parseFloat(item?.receiving_amount);
        subtotal += parseFloat(item?.subtotal);
        balance += parseFloat(item?.final_price) - parseFloat(item?.vendor_paid);
        total += parseFloat(item?.total);
      });
      console.log(balance, 'balancebalancebalance');
      setTotalBalance(balance)
      setAllSums(balance);

      setShippingSOA(data?.vehicles?.rows);
      console.log(data?.vehicles?.rows);

      setTotalCount(data?.vehicles?.count);
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
        vendor_id: selectedClient?.id,
        status: selectedStatus?.id,
        vin: selectedVin?.id,
        lot: selectedLot?.id,
        container: getValues("container"),
      };

      getClientCosting(1, "", data);
      getVaultDashboard(1, "", { vendor_id: selectedClient?.id });
    } catch (error) {
      ErrorToaster(error);
    }
  };
  // *For Get Vault Dashboard
  const getVaultDashboard = async (page, limit, filter) => {
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
      const {
        data: { detail },
      } = await FinanceServices.getVehicleSumLedger(params);
      console.log(detail);
      setShippingVault(
        detail?.rows[0].accounts?.find(
          (account) =>
            account.type_code === "L2" && account.primary_series === 50005
        )
      );
      setVehicleVault(
        detail?.rows[0].accounts?.find(
          (account) =>
            account.type_code === "L2" && account.primary_series === 50004
        )
      );
      setTotalCount(detail?.count);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false);
    }
  };

  const sortData = (e, type, item) => {
    e.preventDefault();
    console.log("Original array:", shippingSOA);
    console.log(type);
    console.log(item, "item");

    if (type === "ascending" && item == "Buyer ID") {
      const sortedData = [...shippingSOA].sort((a, b) => {
        // Use the localeCompare method for string comparison
        console.log(a, b);
        return a.booking?.buyer?.name.localeCompare(b.booking?.buyer?.name);
      });

      setShippingSOA(sortedData);
    }

    if (type === "descending" && item == "Buyer ID") {
      const sortedData = [...shippingSOA].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.booking?.buyer?.name.localeCompare(a.booking?.buyer?.name);
      });

      setShippingSOA(sortedData);
    }

    if (type === "ascending" && item == "Model") {
      const sortedData = [...shippingSOA].sort((a, b) => {
        // Use the localeCompare method for string comparison
        console.log(a, b);
        return a.booking?.veh_model?.name.localeCompare(
          b.booking?.veh_model?.name
        );
      });

      setShippingSOA(sortedData);
    }

    if (type === "descending" && item == "Model") {
      console.log("deefgghe");
      const sortedData = [...shippingSOA].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.booking?.veh_model?.name.localeCompare(
          a.booking?.veh_model?.name
        );
      });

      setShippingSOA(sortedData);
    }
    if (type === "ascending" && item == "Make") {
      const sortedData = [...shippingSOA].sort((a, b) => {
        // Use the localeCompare method for string comparison
        console.log(a, b);
        return a.booking?.veh_make?.name.localeCompare(
          b.booking?.veh_make?.name
        );
      });

      setShippingSOA(sortedData);
    }
    if (type === "descending" && item == "Make") {
      console.log("deefgghe");
      const sortedData = [...shippingSOA].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.booking?.veh_make?.name.localeCompare(
          a.booking?.veh_make?.name
        );
      });

      setShippingSOA(sortedData);
    }

    if (type === "ascending" && item === "LOT") {
      const sortedData = [...shippingSOA].sort((a, b) => {
        const costA = parseFloat(a.booking?.lot_number) || 0;
        const costB = parseFloat(b.booking?.lot_number) || 0;
        console.log(costA, costB); // Add this line for debugging
        return costA - costB;
      });

      setShippingSOA(sortedData);
    }
    if (type === "descending" && item === "LOT") {
      const sortedData = [...shippingSOA].sort((a, b) => {
        const costA = parseFloat(a.booking?.lot_number) || 0;
        const costB = parseFloat(b.booking?.lot_number) || 0;
        console.log(costA, costB); // Add this line for debugging
        return costB - costA;
      });

      setShippingSOA(sortedData);
    }

    if (type === "ascending" && item == "VIN") {
      const sortedData = [...shippingSOA].sort((a, b) => {
        // Use the localeCompare method for string comparison
        console.log(a, b);
        return a.booking?.vin.localeCompare(b.booking?.vin);
      });

      setShippingSOA(sortedData);
    }

    if (type === "descending" && item == "VIN") {
      console.log("deefgghe");
      const sortedData = [...shippingSOA].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.booking?.vin.localeCompare(a.booking?.vin);
      });

      setShippingSOA(sortedData);
    }

    if (type === "ascending" && item == "Color") {
      const sortedData = [...shippingSOA].sort((a, b) => {
        // Use the localeCompare method for string comparison
        console.log(a, b);
        return a.booking?.color.localeCompare(b.booking?.color);
      });

      setShippingSOA(sortedData);
    }

    if (type === "descending" && item == "Color") {
      const sortedData = [...shippingSOA].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.booking?.color.localeCompare(a.booking?.color);
      });

      setShippingSOA(sortedData);
    }
  };

  const handleColumnChange = (event) => {
    const selectedColumns = event.target.value;
    // Sort the selected columns to maintain the correct order
    const sortedColumns = selectedColumns.sort((a, b) => a - b);
    setVisibleColumns(sortedColumns);
  };

  const renderCellContent = (colIndex, item, isActive) => {
    TotalBalance += parseFloat(item?.final_price) - parseFloat(item?.vendor_paid)
    console.log(TotalBalance, 'TotalBalance');
    switch (colIndex) {
      case 0:
        return colIndex + 1;
      case 1:
        return item?.created_at
          ? moment(item?.created_at).format("DD-MMM-YYYY")
          : "-";
      case 2:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.model?.name ?? "-"}
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
              {item?.model?.name?.length > 14 ? item?.model?.name?.slice(0, 14) + "..." : item?.model?.name}
            </Tooltip>
            <Box
              component={"div"}
              className="pdf-show"
              sx={{ display: "none !important" }}
            >
              {item?.model?.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.model?.name ?? "-";
      case 3:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.make.name ?? "-"}
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
              {item?.make.name?.length > 14 ? item?.make.name?.slice(0, 14) + "..." : item?.make.name}
            </Tooltip>
            <Box
              component={"div"}
              className="pdf-show"
              sx={{ display: "none !important" }}
            >
              {item?.make.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.make.name ?? "-";
      case 4:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={copied ? "copied" : (item?.vin ?? "-")}
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
              onClick={() => copyContent(item?.vin ?? "-")}
            >
              {item?.vin?.length > 14 ? item?.vin?.slice(0, 14) + "..." : item?.vin}
            </Tooltip>
            <Box
              component={"div"}
              className="pdf-show"
              sx={{ display: "none !important" }}
            >
              {item?.vin ?? "-"}
            </Box>
          </Box>
        )
      // item?.vin ?? "-";
      case 5:
        return item?.color ?? "-";
      case 6:
        return CommaSeparator(parseFloat(item?.price).toFixed(2)) ?? "-";
      case 7:
        return CommaSeparator(parseFloat(item?.discount).toFixed(2)) ?? "-";
      case 8:
        return <b>USD {CommaSeparator(parseFloat(item?.vendor_paid).toFixed(2))}</b>;
      case 9:
        return <b>USD {CommaSeparator(parseFloat(parseFloat(item?.final_price) - parseFloat(item?.vendor_paid)).toFixed(2))}</b>;
      default:
        return "-";
    }
  };

  const downloadExcel = () => {
    const headers = tableHead;
    const rows = shippingSOA?.map((item, colIndex) => {
      TotalBalance += parseFloat(item?.final_price) - parseFloat(item?.vendor_paid)
      return [
        colIndex + 1,
        item?.created_at ? moment(item?.created_at).format("DD-MMM-YYYY") : "-",
        item?.model?.name ?? "-",
        item?.make.name ?? "-",
        item?.vin ?? "-",
        item?.color ?? "-",
        parseFloat(item?.price).toFixed(2) ?? "-",
        parseFloat(item?.discount).toFixed(2) ?? "-",
        `USD ${parseFloat(item?.vendor_paid).toFixed(2)}`,
        `USD ${parseFloat(parseFloat(item?.final_price) - parseFloat(item?.vendor_paid)).toFixed(2)}`
      ]
    })

    const totalRows = [
      "",
      "",
      "",
      "",
      "",
      "Total Due",
      "",
      "",
      "",
      `USD ${parseFloat(allSums).toFixed(2)}`,
    ]

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRows]);
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
    if (paymentType) {
      const cashierDetail = cashierAccounts.find(
        (e) => e.currency === paymentType
      );
      setValue("cash", cashierDetail?.name);
      setSelectedCashierAccount(cashierDetail);
    }
  }, [paymentType]);

  useEffect(() => {
    getClientDropdown();
    getCurrencies();
  }, []);

  return (
    <Fragment>
      <Grid
        container
        spacing={1}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Grid item xs={12} sm={12} md={11}>
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
              variant="h4"
              sx={{
                color: Colors.charcoalGrey,
                fontFamily: FontFamily.NunitoRegular,
                ml: "5px",
              }}
            >
              Export Shipping SOA
            </Typography>
            {shippingSOA?.length > 0 && (
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
        </Grid>

        <Grid item md={11}>
          <Box
            sx={{
              m: "20px 0 20px 0",
              p: "20px",
              bgcolor: Colors.feta,
              border: `1px solid ${Colors.iron}`,
              borderRadius: "9px",
            }}
          >
            <Grid
              container
              spacing={1}
              alignItems={"center"}
              gap={4}
              component={"form"}
              onSubmit={handleSubmit(applyFilter)}
            >
              <Grid item xs={12} md={4}>
                <SelectField
                  size="small"
                  label={"Select Customer"}
                  options={clients}
                  selected={selectedClient}
                  onSelect={(value) => {
                    setSelectedClient(value);
                    setShowTable(true);
                  }}
                  error={errors?.client?.message}
                  register={register("client", {
                    required: "Please select client.",
                  })}
                />
              </Grid>
              {/* <Grid item md={4}>
                <SelectField
                  size="small"
                  label={"Status"}
                  options={[
                    { id: true, name: "Paid" },
                    { id: false, name: "Unpaid" },
                  ]}
                  selected={selectedStatus}
                  onSelect={(value) => setSelectedStatus(value)}
                  error={errors?.status?.message}
                  register={register("status")}
                />
              </Grid> */}

              <Grid item xs={12} md={2}>
                <Box
                  sx={{
                    mt: "12px",
                  }}
                >
                  <PrimaryButton type="submit" title="Search" />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>


        <Grid item md={11}>
          {shippingSOA && (
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
                        if (
                          column !== "Balance" &&
                          column !== "Past Due Days" &&
                          column !== "Paid"
                        ) {
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

              {shippingSOA && (
                <Box>
                  <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                    fileName="Export Shipping SOA"
                  >
                    <Box className='pdf-show' sx={{ display: 'none' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                          Shipping SOA
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
                              <Cell className="pdf-table" key={index}>
                                {tableHead[index]}{" "}
                                {tableHead[index] == "S.No" ||
                                  tableHead[index] == "Past Due Days" ||
                                  tableHead[index] == "Buy Date" ||
                                  tableHead[index] == "Other Charges" ||
                                  tableHead[index] == "Paid" ||
                                  tableHead[index] == "Balance" ||
                                  tableHead[index] == "SHIPPING CHARGE" ||
                                  tableHead[index] == "LATE FEE" ||
                                  tableHead[index] == "STORAGE" ||
                                  tableHead[index] == "CATEGORY A" ||
                                  tableHead[index] == "BROKER FEE" ||
                                  tableHead[index] == "TITLE FEE" ||
                                  tableHead[index] == "OTHER CHARGE" ||
                                  tableHead[index] == "CUSTOM DUTY" ||
                                  tableHead[index] == "VAT" ||
                                  tableHead[index] == "TOTAL" ||
                                  tableHead[index] == "Discount" ||
                                  tableHead[index] == "Net Due" ||
                                  tableHead[index] == "BUY DATE" ||
                                  tableHead[index] == "Arrived Date" ||
                                  tableHead[index] == "SL. No" ||
                                  tableHead[index] == "VCC" ? (
                                  ""
                                ) : (
                                  <>
                                    {" "}
                                    <ArrowUpwardIcon className="pdf-hide"
                                      sx={{
                                        color: "white",
                                        fontSize: "15px",
                                        cursor: "pointer",
                                      }}
                                      onClick={(e) =>
                                        sortData(e, "ascending", tableHead[index])
                                      }
                                    />{" "}
                                    <ArrowDownwardIcon className="pdf-hide"
                                      sx={{
                                        color: "white",
                                        fontSize: "15px",
                                        cursor: "pointer",
                                      }}
                                      onClick={(e) =>
                                        sortData(
                                          e,
                                          "descending",
                                          tableHead[index]
                                        )
                                      }
                                    />{" "}
                                  </>
                                )}
                              </Cell>
                            ))}
                          </TableRow>
                        </TableHead>

                        {/* Table Body */}
                        <TableBody>
                          {!loader ? (
                            shippingSOA?.length > 0 ? (
                              <Fragment>
                                {shippingSOA.map((item, rowIndex) => {
                                  const isActive = true;
                                  return (
                                    <Row
                                      key={rowIndex}
                                      sx={{
                                        bgcolor: rowIndex % 2 !== 0 && "#EFF8E7",
                                      }}
                                    >
                                      {visibleColumns.map((colIndex) => (
                                        <Cell className="pdf-table" key={colIndex}>
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
                                <Row>
                                  <Cell colSpan={visibleColumns?.length - 1}>
                                    <Typography className="pdf-table"
                                      variant="body1"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      Total Due
                                    </Typography>
                                  </Cell>
                                  <Cell>
                                    <Typography className="pdf-table"
                                      variant="body1"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      USD {CommaSeparator(parseFloat(allSums).toFixed(2))}
                                    </Typography>
                                  </Cell>
                                </Row>
                                <Row>
                                  <Cell colSpan={visibleColumns?.length - 5}>
                                    <Typography className="pdf-table"
                                      variant="body1"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      Net Due Total
                                    </Typography>
                                  </Cell>


                                  <Cell colSpan={3}>
                                    <Typography className="pdf-table"
                                      variant="body1"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      USD  {parseFloat(parseFloat(totalBalance) - parseFloat(shippingVault?.nature === "credit"
                                        ? isNaN(
                                          parseFloat(shippingVault?.total_credit) -
                                          parseFloat(shippingVault?.total_debit)
                                        )
                                          ? parseFloat(0).toFixed(2)
                                          : parseFloat(
                                            parseFloat(shippingVault?.total_credit) -
                                            parseFloat(shippingVault?.total_debit)
                                          ).toFixed(2)
                                        : isNaN(
                                          parseFloat(shippingVault?.total_debit) -
                                          parseFloat(shippingVault?.total_credit)
                                        )
                                          ? parseFloat(0).toFixed(2)
                                          : parseFloat(
                                            parseFloat(shippingVault?.total_debit) -
                                            parseFloat(shippingVault?.total_credit)
                                          ).toFixed(2))).toFixed(2)}
                                    </Typography>
                                  </Cell>
                                  <Cell></Cell>
                                </Row>
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
                </Box>
              )}

              {loader && <CircleLoading />}
            </Box>
          )}
        </Grid>
      </Grid>
    </Fragment >
  );
}

export default ExportShippingSOA;
