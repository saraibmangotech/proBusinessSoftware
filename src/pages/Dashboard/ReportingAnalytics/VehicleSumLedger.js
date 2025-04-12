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
  CircularProgress,
  Grid,
  Tooltip,
} from "@mui/material";
import styled from "@emotion/styled";
import { FontFamily } from "assets";
import Colors from "assets/Style/Colors";
import { CircleLoading } from "components/Loaders";
import { ErrorToaster } from "components/Toaster";
import { makeStyles } from "@mui/styles";
import Pagination from "components/Pagination";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CommaSeparator, Debounce, handleExportWithComponent } from "utils";
import SelectField from "components/Select";
import CustomerServices from "services/Customer";
import { PrimaryButton } from "components/Buttons";
import FinanceServices from "services/Finance";
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
  anchorLink: {
    textDecoration: 'underline',
    color: Colors.twitter,
    cursor: 'pointer'
  }
});

function VehicleSumLedger() {

  const classes = useStyles();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const tableHead = [
    "S.No",
    "Customer Ident No",
    "Customer Name",
    "Vehicle Vault Balance (USD)",
    "Shipping Vault Balance (USD)",
    "Vehicle Ledger Balance (USD)",
    "Shipping Ledger Balance (USD)",
    "VCC Deposit Balance (USD)",
    "Gate Pass (Parking & Recovery) (USD)",
  ];

  const [loader, setLoader] = useState(false);

  // *For Total Amounts
  let TotalVehicleBalance = 0
  // *For Total Amounts
  let TotalShippingBalance = 0

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Customer Booking
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // *For Vehicle SOA
  const [vehicleSoa, setVehicleSoa] = useState();

  const copyContent = (text) => {
    const contentToCopy = text;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 300);
  }

  const [copied, setCopied] = useState(false);

  // *For Total Amounts
  let TotalVehicleLedgerAmount = 0
  let TotalVehicleVaultAmount = 0
  let TotalShippingVaultAmount = 0
  let TotalShippingLedgerAmount = 0
  let TotalVccDepositAmount = 0
  let TotalGatePassAmount = 0

  // *For Get Customer Booking
  const getCustomerBooking = async (search) => {
    try {
      let params = {
        name: search ?? ''
      }
      const { data } = await CustomerServices.getCustomerBooking(params)
      setCustomers(data?.customers)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Vehicle Sum & Ledger
  const getVehicleSumLedger = async (page, limit, filter) => {
    setLoader(true)
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
      params = { ...params, ...Filter }
      const { data: { detail } } = await FinanceServices.getVehicleSumLedger(params)
      setVehicleSoa(detail?.rows)
      setTotalCount(detail?.count)
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false)
    }
  };

  // *For Handle Filter
  const handleFilter = () => {
    Debounce(() => getVehicleSumLedger(1, "", { customer_id: selectedCustomer?.id }));
  };

  const downloadExcel = () => {
    // Define headers and data separately
    const headers = tableHead;
    const data = vehicleSoa;
    let TotalVehicleLedgerAmountXL = 0
    let TotalVehicleVaultAmountXL = 0
    let TotalShippingVaultAmountXL = 0
    let TotalShippingLedgerAmountXL = 0
    let TotalVccDepositAmountXL = 0
    let TotalGatePassAmountXL = 0
    let TotalVehicleBalanceXL = 0
    let TotalShippingBalanceXL = 0

    // Extract values from objects and create an array for each row
    const rows = data.map((item, index) => {
      let vehicleLedgerAmount = 0
      let vehicleVaultAmount = 0
      let shippingLedgerAmount = 0
      let shippingVaultAmount = 0
      let vccDepositAmount = 0
      let gatePassAmount = 0

      // *For Accounts Id
      let vehicleAccountId = ''
      let vehicleVaultAccountId = ''
      let shippingVaultAccountId = ''
      let vehicleAccountNature = ''
      let vehicleVaultAccountNature = ''
      let shippingVaultAccountNature = ''
      let shippingAccountId = ''
      let shippingAccountNature = ''
      let vccAccountId = ''
      let vccAccountNature = ''
      let gatePassAccountId = ''
      let gatePassAccountNature = ''

      let GVV
      let GSV
      let GVVNature = item?.accounts.find(account => account.type_code === 'L2' && account.primary_series === 50004)
      let GSVNature = item?.accounts.find(account => account.type_code === 'L2' && account.primary_series === 50005)

      GVV = GVVNature.total_credit - GVVNature.total_debit
      GSV = GSVNature.total_credit - GSVNature.total_debit

      for (let i = 0; i < item?.accounts.length; i++) {
        const element = item?.accounts[i];
        const credit = isNaN(element?.total_credit) ? 0 : element?.total_credit ?? 0
        const debit = isNaN(element?.total_debit) ? 0 : element?.total_debit ?? 0
        let subTotal = element?.nature === 'credit' ? (parseFloat(credit) - parseFloat(debit)).toFixed(2) : (parseFloat(debit) - parseFloat(credit)).toFixed(2)
        if (element?.primary_account_id == 11100005) {
          vehicleAccountNature = element?.nature
          vehicleLedgerAmount += parseFloat(subTotal)
          TotalVehicleLedgerAmountXL += parseFloat(subTotal)
          if (element?.currency === 'usd') {
            vehicleAccountId = element?.id
          }
        }
        if (element?.primary_account_id == 11100024) {
          vehicleVaultAccountNature = element?.nature
          vehicleVaultAmount += parseFloat(subTotal)
          TotalVehicleVaultAmountXL += parseFloat(subTotal)
          if (element?.currency === 'usd') {
            vehicleVaultAccountId = element?.id
          }
        }
        if (element?.primary_account_id == 11100025) {
          shippingVaultAccountNature = element?.nature
          shippingVaultAmount += parseFloat(subTotal)
          TotalShippingVaultAmountXL += parseFloat(subTotal)
          if (element?.currency === 'usd') {
            shippingVaultAccountId = element?.id
          }
        }
        if (element?.primary_account_id == 11100006) {
          shippingAccountId = element?.id
          shippingAccountNature = element?.nature
          console.log(shippingAccountNature, 'shippingAccountNature');
          shippingLedgerAmount += parseFloat(subTotal)
          TotalShippingLedgerAmountXL += parseFloat(subTotal)
        }
        if (element?.primary?.name.includes('VCC')) {
          vccAccountId = element?.id
          vccAccountNature = element?.nature
          vccDepositAmount += parseFloat(subTotal)
          TotalVccDepositAmountXL += parseFloat(subTotal)
        }
        if (element?.primary?.name.includes('Gate Pass')) {
          gatePassAccountId = element?.id
          gatePassAccountNature = element?.nature
          gatePassAmount += parseFloat(subTotal)
          TotalGatePassAmountXL += parseFloat(subTotal)
        }
        if (element?.type_code === 'L2' && element?.primary_series === 50004) {
          if (element?.currency === 'usd') {
            subTotal = element?.nature === 'credit' ? (parseFloat(credit) - parseFloat(debit)).toFixed(2) : parseFloat(0).toFixed(2)
            TotalVehicleBalanceXL += parseFloat(subTotal)
          }
        }
        if (element?.type_code === 'L2' && element?.primary_series === 50005) {
          if (element?.currency === 'usd') {
            subTotal = element?.nature === 'credit' ? (parseFloat(credit) - parseFloat(debit)).toFixed(2) : parseFloat(0).toFixed(2)
            TotalShippingBalanceXL += parseFloat(subTotal)
          }
        }
      }

      return [
        index + 1,
        item?.ref_id ?? "-",
        item?.name ?? "-",
        parseFloat(GVV).toFixed(2),
        parseFloat(GSV).toFixed(2),
        parseFloat(vehicleLedgerAmount).toFixed(2),
        parseFloat(shippingLedgerAmount).toFixed(2),
        parseFloat(vccDepositAmount).toFixed(2),
        parseFloat(gatePassAmount).toFixed(2)
      ]
    });
    const totalRow = [
      "",
      "",
      "Total",
      `$ ${parseFloat(TotalVehicleBalanceXL).toFixed(2)}`,
      `$ ${parseFloat(TotalShippingBalanceXL).toFixed(2)}`,
      `$ ${parseFloat(TotalVehicleLedgerAmountXL).toFixed(2)}`,
      `$ ${parseFloat(TotalVehicleLedgerAmountXL).toFixed(2)}`,
      `$ ${parseFloat(TotalVccDepositAmountXL).toFixed(2)}`,
      `$ ${parseFloat(TotalGatePassAmountXL).toFixed(2)}`,
    ];

    // Create a workbook with a worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Convert the workbook to an array buffer
    const buf = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save the file using FileSaver.js
    saveAs(new Blob([buf]), "data.xlsx");
  };

  useEffect(() => {
    getVehicleSumLedger();
    getCustomerBooking();
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
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, }}>
          Client Ledgers Dashboard
        </Typography>
        {vehicleSoa?.length > 0 && (
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
      <Box
        component={"form"}
        onSubmit={handleSubmit(handleFilter)}
        sx={{
          m: "20px 0 20px 5px",
          p: "20px",
          bgcolor: Colors.feta,
          border: `1px solid ${Colors.iron}`,
          borderRadius: "9px",
        }}
      >
        <Grid container spacing={2} alignItems={"center"} columns={10}>
          <Grid item xs={12} md={4}>
            <SelectField
              size={'small'}
              onSearch={(v) => getCustomerBooking(v)}
              label={'Select Customer'}
              options={customers}
              selected={selectedCustomer}
              onSelect={(value) => { setSelectedCustomer(value) }}
              register={register("customer")}
            />
          </Grid>
          <Grid item xs={12} md={2} sx={{ height: "55px" }}>
            <Box
              sx={{
                mt: "11px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <PrimaryButton loading={loader} type={"submit"} title={"Search"} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {vehicleSoa ? (
        <Fragment>
          <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
            fileName="Client Ledgers Dashboard"
          >
            <Box className='pdf-show' sx={{ display: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                  Client Ledgers Dashboard
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
                      <Cell className="pdf-table" key={index}>{item}</Cell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loader ? (
                    vehicleSoa?.length > 0 ? (
                      <Fragment>
                        {vehicleSoa.map((item, index) => {
                          let vehicleLedgerAmount = 0
                          let vehicleVaultAmount = 0
                          let shippingLedgerAmount = 0
                          let shippingVaultAmount = 0
                          let vccDepositAmount = 0
                          let gatePassAmount = 0

                          // *For Accounts Id
                          let vehicleAccountId = ''
                          let vehicleVaultAccountId = ''
                          let shippingVaultAccountId = ''
                          let vehicleAccountNature = ''
                          let vehicleVaultAccountNature = ''
                          let shippingVaultAccountNature = ''
                          let shippingAccountId = ''
                          let shippingAccountNature = ''
                          let vccAccountId = ''
                          let vccAccountNature = ''
                          let gatePassAccountId = ''
                          let gatePassAccountNature = ''

                          let GVV
                          let GSV
                          let GVVNature = item?.accounts.find(account => account.type_code === 'L2' && account.primary_series === 50004)
                          let GSVNature = item?.accounts.find(account => account.type_code === 'L2' && account.primary_series === 50005)

                          GVV = GVVNature.total_credit - GVVNature.total_debit
                          GSV = GSVNature.total_credit - GSVNature.total_debit

                          for (let i = 0; i < item?.accounts.length; i++) {
                            const element = item?.accounts[i];
                            const credit = isNaN(element?.total_credit) ? 0 : element?.total_credit ?? 0
                            const debit = isNaN(element?.total_debit) ? 0 : element?.total_debit ?? 0
                            let subTotal = element?.nature === 'credit' ? (parseFloat(credit) - parseFloat(debit)).toFixed(2) : (parseFloat(debit) - parseFloat(credit)).toFixed(2)
                            if (element?.primary_account_id == 11100005) {
                              vehicleAccountNature = element?.nature
                              vehicleLedgerAmount += parseFloat(subTotal)
                              TotalVehicleLedgerAmount += parseFloat(subTotal)
                              if (element?.currency === 'usd') {
                                vehicleAccountId = element?.id
                              }
                            }
                            if (element?.primary_account_id == 11100024) {
                              vehicleVaultAccountNature = element?.nature
                              vehicleVaultAmount += parseFloat(subTotal)
                              TotalVehicleVaultAmount += parseFloat(subTotal)
                              if (element?.currency === 'usd') {
                                vehicleVaultAccountId = element?.id
                              }
                            }
                            if (element?.primary_account_id == 11100025) {
                              shippingVaultAccountNature = element?.nature
                              shippingVaultAmount += parseFloat(subTotal)
                              TotalShippingVaultAmount += parseFloat(subTotal)
                              if (element?.currency === 'usd') {
                                shippingVaultAccountId = element?.id
                              }
                            }
                            if (element?.primary_account_id == 11100006) {
                              shippingAccountId = element?.id
                              shippingAccountNature = element?.nature
                              console.log(shippingAccountNature, 'shippingAccountNature');
                              shippingLedgerAmount += parseFloat(subTotal)
                              TotalShippingLedgerAmount += parseFloat(subTotal)
                            }
                            if (element?.primary?.name.includes('VCC')) {
                              vccAccountId = element?.id
                              vccAccountNature = element?.nature
                              vccDepositAmount += parseFloat(subTotal)
                              TotalVccDepositAmount += parseFloat(subTotal)
                            }
                            if (element?.primary?.name.includes('Gate Pass')) {
                              gatePassAccountId = element?.id
                              gatePassAccountNature = element?.nature
                              gatePassAmount += parseFloat(subTotal)
                              TotalGatePassAmount += parseFloat(subTotal)
                            }
                            if (element?.type_code === 'L2' && element?.primary_series === 50004) {
                              if (element?.currency === 'usd') {
                                subTotal = element?.nature === 'credit' ? (parseFloat(credit) - parseFloat(debit)).toFixed(2) : parseFloat(0).toFixed(2)



                                TotalVehicleBalance += parseFloat(subTotal)
                              }
                            }
                            if (element?.type_code === 'L2' && element?.primary_series === 50005) {
                              if (element?.currency === 'usd') {
                                subTotal = element?.nature === 'credit' ? (parseFloat(credit) - parseFloat(debit)).toFixed(2) : parseFloat(0).toFixed(2)


                                TotalShippingBalance += parseFloat(subTotal)
                              }
                            }
                          }

                          return (
                            <Row
                              key={index}
                              sx={{ bgcolor: index % 2 !== 0 && "#EFF8E7" }}
                            >
                              <Cell className="pdf-table">{index + 1}</Cell>
                              <Cell className="pdf-table">{item?.ref_id ?? "-"}</Cell>
                              <Cell className="pdf-table">
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.name ?? "-"}
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
                                  {item?.name?.length > 15
                                    ? item?.name?.slice(0, 10) +
                                    "..."
                                    : item?.name}{" "}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className="pdf-show"
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.name ?? "-"}
                                </Box>
                              </Cell>
                              <Cell className={classes.anchorLink + ' ' + 'pdf-table'} onClick={() => navigate(`/account-ledger/${vehicleVaultAccountId}`, { state: { accountName: item?.name, nature: vehicleVaultAccountNature } })}>{CommaSeparator(parseFloat(GVV).toFixed(2))}</Cell>
                              <Cell className={classes.anchorLink + ' ' + 'pdf-table'} onClick={() => navigate(`/account-ledger/${shippingVaultAccountId}`, { state: { accountName: item?.name, nature: shippingVaultAccountNature } })}>{CommaSeparator(parseFloat(GSV).toFixed(2))}</Cell>
                              <Cell className={classes.anchorLink + ' ' + 'pdf-table'} onClick={() => navigate(`/account-ledger/${vehicleAccountId}`, { state: { accountName: item?.name, nature: vehicleAccountNature } })}>{CommaSeparator(parseFloat(vehicleLedgerAmount).toFixed(2))}</Cell>
                              <Cell className={classes.anchorLink + ' ' + 'pdf-table'} onClick={() => navigate(`/account-ledger/${shippingAccountId}`, { state: { accountName: item?.name, nature: shippingAccountNature } })}>{CommaSeparator(parseFloat(shippingLedgerAmount).toFixed(2))}</Cell>
                              <Cell className={classes.anchorLink + ' ' + 'pdf-table'} onClick={() => navigate(`/account-ledger/${vccAccountId}`, { state: { accountName: item?.name, nature: vccAccountNature } })}>{CommaSeparator(parseFloat(vccDepositAmount).toFixed(2))}</Cell>
                              <Cell className={classes.anchorLink + ' ' + 'pdf-table'} onClick={() => navigate(`/account-ledger/${gatePassAccountId}`, { state: { accountName: item?.name, nature: gatePassAccountNature } })}>{CommaSeparator(parseFloat(gatePassAmount).toFixed(2))}</Cell>
                            </Row>
                          )
                        })}
                        <Row>
                          <Cell colSpan={3}>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              Total
                            </Typography>
                          </Cell>
                          <Cell>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              $ {CommaSeparator(parseFloat(TotalVehicleBalance).toFixed(2))}
                            </Typography>
                          </Cell>
                          <Cell>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              $ {CommaSeparator(parseFloat(TotalShippingBalance).toFixed(2))}
                            </Typography>
                          </Cell>
                          <Cell>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              $  {CommaSeparator(parseFloat(TotalVehicleLedgerAmount).toFixed(2))}
                            </Typography>
                          </Cell>
                          <Cell>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              $ {CommaSeparator(parseFloat(TotalVehicleLedgerAmount).toFixed(2))}
                            </Typography>
                          </Cell>

                          <Cell>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              $ {CommaSeparator(parseFloat(TotalVccDepositAmount).toFixed(2))}
                            </Typography>
                          </Cell>
                          <Cell>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              $ {CommaSeparator(parseFloat(TotalGatePassAmount).toFixed(2))}
                            </Typography>
                          </Cell>
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
            onPageSizeChange={(size) => getVehicleSumLedger(1, size.target.value)}
            tableCount={vehicleSoa?.length}
            totalCount={totalCount}
            onPageChange={(page) => getVehicleSumLedger(page, "")}
          />

        </Fragment>
      ) : (
        <CircleLoading />
      )}

    </Box>
  );
}

export default VehicleSumLedger;
