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
  Grid,
  Tooltip,
} from "@mui/material";
import styled from "@emotion/styled";
import { FontFamily, Images } from "assets";
import Colors from "assets/Style/Colors";
import { CircleLoading } from "components/Loaders";
import { ErrorToaster } from "components/Toaster";
import { makeStyles } from "@mui/styles";
import Pagination from "components/Pagination";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CommaSeparator, Debounce, handleExportWithComponent } from "utils";
import SelectField from "components/Select";
import { useDispatch } from "react-redux";
import CustomerServices from "services/Customer";
import { PrimaryButton } from "components/Buttons";
import FinanceServices from "services/Finance";
import SystemServices from "services/System";
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
    textDecoration: "underline",
    color: Colors.twitter,
    cursor: "pointer",
  },
});

function VaultDashboard() {
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
    "Vault ID",
    "Vehicle Vault Balance (AED)",
    "Vehicle Vault Balance (USD)",
    "Shipping Vault Balance (AED)",
    "Shipping Vault Balance (USD)",
    "Action",
  ];

  const [loader, setLoader] = useState(false);

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [exchangeRateUsd, setExchangeRateUsd] = useState();

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Customer Booking
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // *For Vault Dashboard
  const [vaultDashboard, setVaultDashboard] = useState();

  const [copied, setCopied] = useState(false);

  const copyContent = (text) => {
    const contentToCopy = text;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 300);
  }

  // *For Total Amounts
  let TotalVaultBalance = 0;
  // *For Total Amounts
  let TotalVaultBalance2 = 0;
  let TotalVaultBalance3 = 0;
  let TotalVaultBalance4 = 0;

  // *For Get Customer Booking
  const getCustomerBooking = async (search) => {
    try {
      let params = {
        name: search ?? "",
      };
      const { data } = await CustomerServices.getCustomerBooking(params);
      setCustomers(data?.customers);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Currencies
  const getCurrencies = async () => {
    try {
      let params = {
        detailed: true,
      };
      const { data } = await SystemServices.getCurrencies(params);


      setExchangeRateUsd(
        parseFloat(
          data?.currencies.find((e) => e.currency === "usd")?.conversion_rate
        )
      );
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
      setVaultDashboard(detail?.rows);
      setTotalCount(detail?.count);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false);
    }
  };

  // *For Handle Filter
  const handleFilter = () => {
    Debounce(() =>
      getVaultDashboard(1, "", { customer_id: selectedCustomer?.id })
    );
  };

  const downloadExcel = () => {
    // Define headers and data separately
    const headers = tableHead.filter((item) => item !== "Action");
    const data = vaultDashboard;
    let TotalVaultBalanceXL = 0;
    let TotalVaultBalance2XL = 0;
    let TotalVaultBalance3XL = 0;
    let TotalVaultBalance4XL = 0;

    // Extract values from objects and create an array for each row
    const rows = data.map((item, index) => {
      let subTotal = 0;
      let subTotal2 = 0;
      let subTotal3 = 0;
      let subTotal4 = 0;
      // *For Accounts Id
      let vehicleAccountId = "";
      let shippingAccountId = "";
      let vehicleAccountNature = "";
      let shippingAccountNature = "";
      let GVV;
      let GVV2;
      let GSV;
      let GSV2;
      let GVVNature = item?.accounts.find(
        (account) =>
          account.type_code === "L2" &&
          account.primary_series === 50004
      );
      let GSVNature = item?.accounts.find(
        (account) =>
          account.type_code === "L2" &&
          account.primary_series === 50005
      );

      GVV = GVVNature.total_credit - GVVNature.total_debit;
      GSV = GSVNature.total_credit - GSVNature.total_debit;
      GVV2 = GVVNature.total_credit_cur - GVVNature.total_debit_cur;
      GSV2 = GSVNature.total_credit_cur - GSVNature.total_debit_cur;
      vehicleAccountId = GVVNature?.id;
      shippingAccountId = GSVNature?.id;
      vehicleAccountNature = GVVNature?.nature;
      shippingAccountNature = GSVNature?.nature;



      for (let i = 0; i < item?.accounts.length; i++) {
        const element = item?.accounts[i];
        const credit = isNaN(element?.total_credit)
          ? 0
          : element?.total_credit ?? 0;
        const debit = isNaN(element?.total_debit)
          ? 0
          : element?.total_debit ?? 0;
        const credit2 = isNaN(element?.total_credit_cur)
          ? 0
          : element?.total_credit_cur ?? 0;
        const debit2 = isNaN(element?.total_debit_cur)
          ? 0
          : element?.total_debit_cur ?? 0;
        if (
          element?.type_code === "L2" &&
          element?.primary_series === 50004
        ) {
          if (element?.currency === "usd") {
            subTotal =
              element?.nature === "credit"
                ? (
                  parseFloat(credit) - parseFloat(debit)
                ).toFixed(2)
                : parseFloat(0).toFixed(2);
            subTotal2 =
              element?.nature === "debit"
                ? (
                  parseFloat(debit) - parseFloat(credit)
                ).toFixed(2)
                : parseFloat(0).toFixed(2);

            TotalVaultBalanceXL += parseFloat(subTotal);
            //sdasda
            subTotal3 =
              element?.nature === "credit"
                ? (
                  parseFloat(credit2) - parseFloat(debit2)
                ).toFixed(2)
                : parseFloat(0).toFixed(2);
            subTotal4 =
              element?.nature === "debit"
                ? (
                  parseFloat(debit2) - parseFloat(credit2)
                ).toFixed(2)
                : parseFloat(0).toFixed(2);

            TotalVaultBalance3XL += parseFloat(subTotal3);


          }
        }
        if (
          element?.type_code === "L2" &&
          element?.primary_series === 50005
        ) {
          if (element?.currency === "usd") {
            subTotal =
              element?.nature === "credit"
                ? (
                  parseFloat(credit) - parseFloat(debit)
                ).toFixed(2)
                : parseFloat(0).toFixed(2);
            subTotal2 =
              element?.nature === "debit"
                ? (
                  parseFloat(debit) - parseFloat(credit)
                ).toFixed(2)
                : parseFloat(0).toFixed(2);

            TotalVaultBalance2XL += parseFloat(subTotal);

            //asdsda
            subTotal3 =
              element?.nature === "credit"
                ? (
                  parseFloat(credit2) - parseFloat(debit2)
                ).toFixed(2)
                : parseFloat(0).toFixed(2);
            subTotal4 =
              element?.nature === "debit"
                ? (
                  parseFloat(debit2) - parseFloat(credit2)
                ).toFixed(2)
                : parseFloat(0).toFixed(2);

            TotalVaultBalance4XL += parseFloat(subTotal3);
          }
        }
      }

      return [
        index + 1,
        item?.ref_id ?? "-",
        item?.name ?? "-",
        `Vault-${item?.id ?? "-"}`,
        GVV,
        parseFloat(GVV2).toFixed(2),
        GSV,
        parseFloat(GSV2).toFixed(2),
      ]
    });
    const totalRow = [
      "",
      "",
      "",
      "Total",
      parseFloat(TotalVaultBalanceXL).toFixed(2),
      parseFloat(TotalVaultBalance3XL).toFixed(2),
      parseFloat(TotalVaultBalance2XL).toFixed(2),
      parseFloat(TotalVaultBalance4XL).toFixed(2),
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
    getCustomerBooking();
    getVaultDashboard();
    getCurrencies();
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
          Vault Dashboard
        </Typography>
        {vaultDashboard?.length > 0 && (
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
              size={"small"}
              onSearch={(v) => getCustomerBooking(v)}
              label={"Select Customer"}
              options={customers}
              selected={selectedCustomer}
              onSelect={(value) => {
                setSelectedCustomer(value);
              }}
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
              <PrimaryButton
                loading={loader}
                type={"submit"}
                title={"Search"}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {vaultDashboard && (
        <Fragment>
          <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
            fileName="Vault Dashboard"
          >
            <Box className='pdf-show' sx={{ display: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                  Vault Dashboard
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
                    vaultDashboard?.length > 0 ? (
                      <Fragment>
                        {vaultDashboard.map((item, index) => {

                          let subTotal = 0;
                          let subTotal2 = 0;
                          let subTotal3 = 0;
                          let subTotal4 = 0;
                          // *For Accounts Id
                          let vehicleAccountId = "";
                          let shippingAccountId = "";
                          let vehicleAccountNature = "";
                          let shippingAccountNature = "";
                          let GVV;
                          let GVV2;
                          let GSV;
                          let GSV2;
                          let GVVNature = item?.accounts.find(
                            (account) =>
                              account.type_code === "L2" &&
                              account.primary_series === 50004
                          );
                          let GSVNature = item?.accounts.find(
                            (account) =>
                              account.type_code === "L2" &&
                              account.primary_series === 50005
                          );

                          GVV = GVVNature.total_credit - GVVNature.total_debit;
                          GSV = GSVNature.total_credit - GSVNature.total_debit;
                          GVV2 = GVVNature.total_credit_cur - GVVNature.total_debit_cur;
                          GSV2 = GSVNature.total_credit_cur - GSVNature.total_debit_cur;
                          vehicleAccountId = GVVNature?.id;
                          shippingAccountId = GSVNature?.id;
                          vehicleAccountNature = GVVNature?.nature;
                          shippingAccountNature = GSVNature?.nature;



                          for (let i = 0; i < item?.accounts.length; i++) {
                            const element = item?.accounts[i];
                            const credit = isNaN(element?.total_credit)
                              ? 0
                              : element?.total_credit ?? 0;
                            const debit = isNaN(element?.total_debit)
                              ? 0
                              : element?.total_debit ?? 0;
                            const credit2 = isNaN(element?.total_credit_cur)
                              ? 0
                              : element?.total_credit_cur ?? 0;
                            const debit2 = isNaN(element?.total_debit_cur)
                              ? 0
                              : element?.total_debit_cur ?? 0;
                            if (
                              element?.type_code === "L2" &&
                              element?.primary_series === 50004
                            ) {
                              if (element?.currency === "usd") {
                                subTotal =
                                  element?.nature === "credit"
                                    ? (
                                      parseFloat(credit) - parseFloat(debit)
                                    ).toFixed(2)
                                    : parseFloat(0).toFixed(2);
                                subTotal2 =
                                  element?.nature === "debit"
                                    ? (
                                      parseFloat(debit) - parseFloat(credit)
                                    ).toFixed(2)
                                    : parseFloat(0).toFixed(2);

                                TotalVaultBalance += parseFloat(subTotal);
                                //sdasda
                                subTotal3 =
                                  element?.nature === "credit"
                                    ? (
                                      parseFloat(credit2) - parseFloat(debit2)
                                    ).toFixed(2)
                                    : parseFloat(0).toFixed(2);
                                subTotal4 =
                                  element?.nature === "debit"
                                    ? (
                                      parseFloat(debit2) - parseFloat(credit2)
                                    ).toFixed(2)
                                    : parseFloat(0).toFixed(2);

                                TotalVaultBalance3 += parseFloat(subTotal3);


                              }
                            }
                            if (
                              element?.type_code === "L2" &&
                              element?.primary_series === 50005
                            ) {
                              if (element?.currency === "usd") {
                                subTotal =
                                  element?.nature === "credit"
                                    ? (
                                      parseFloat(credit) - parseFloat(debit)
                                    ).toFixed(2)
                                    : parseFloat(0).toFixed(2);
                                subTotal2 =
                                  element?.nature === "debit"
                                    ? (
                                      parseFloat(debit) - parseFloat(credit)
                                    ).toFixed(2)
                                    : parseFloat(0).toFixed(2);

                                TotalVaultBalance2 += parseFloat(subTotal);

                                //asdsda
                                subTotal3 =
                                  element?.nature === "credit"
                                    ? (
                                      parseFloat(credit2) - parseFloat(debit2)
                                    ).toFixed(2)
                                    : parseFloat(0).toFixed(2);
                                subTotal4 =
                                  element?.nature === "debit"
                                    ? (
                                      parseFloat(debit2) - parseFloat(credit2)
                                    ).toFixed(2)
                                    : parseFloat(0).toFixed(2);

                                TotalVaultBalance4 += parseFloat(subTotal3);
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
                                {/* {item?.name ?? "-"} */}
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
                                    : item?.name}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className="pdf-show"
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.name ?? "-"}
                                </Box>
                              </Cell>
                              <Cell className="pdf-table">Vault-{item?.id ?? "-"}</Cell>
                              <Cell
                                className={classes.anchorLink + ' ' + 'pdf-table'}
                                onClick={() =>
                                  navigate(
                                    `/account-ledger/${vehicleAccountId}`,
                                    {
                                      state: {
                                        accountName: item?.name,
                                        nature: vehicleAccountNature,
                                      },
                                    }
                                  )
                                }
                              >
                                {GVV}
                              </Cell>
                              <Cell
                                className={classes.anchorLink + ' ' + 'pdf-table'}
                                onClick={() =>
                                  navigate(
                                    `/account-ledger/${vehicleAccountId}`,
                                    {
                                      state: {
                                        accountName: item?.name,
                                        nature: vehicleAccountNature,
                                      },
                                    }
                                  )
                                }
                              >
                                {CommaSeparator(parseFloat(GVV2).toFixed(2))}
                              </Cell>
                              <Cell
                                className={classes.anchorLink + ' ' + 'pdf-table'}
                                onClick={() =>
                                  navigate(
                                    `/account-ledger/${shippingAccountId}`,
                                    {
                                      state: {
                                        accountName: item?.name,
                                        nature: vehicleAccountNature,
                                      },
                                    }
                                  )
                                }
                              >
                                {CommaSeparator(GSV)}
                              </Cell>
                              <Cell
                                className={classes.anchorLink + ' ' + 'pdf-table'}
                                onClick={() =>
                                  navigate(
                                    `/account-ledger/${shippingAccountId}`,
                                    {
                                      state: {
                                        accountName: item?.name,
                                        nature: vehicleAccountNature,
                                      },
                                    }
                                  )
                                }
                              >
                                {CommaSeparator(parseFloat(GSV2).toFixed(2))}
                              </Cell>

                              <Cell>
                                <Box component={'div'} className="pdf-hide" sx={{ gap: "16px !important" }}>
                                  <Box
                                    onClick={() =>
                                      navigate(
                                        `/account-ledger/${vehicleAccountId}`,
                                        {
                                          state: {
                                            accountName: item?.name,
                                            nature: vehicleAccountNature,
                                          },
                                        }
                                      )
                                    }
                                  >
                                    <IconButton
                                      sx={{
                                        bgcolor: Colors.primary,
                                        "&:hover": { bgcolor: Colors.primary },
                                      }}
                                    >
                                      <Box
                                        component={"img"}
                                        src={Images.ledgerIcon}
                                        sx={{
                                          height: "16px",
                                          objectFit: "contain",
                                        }}
                                      />
                                    </IconButton>
                                    <Typography variant="body2">View</Typography>
                                  </Box>
                                </Box>
                              </Cell>
                            </Row>
                          );
                        })}
                        <Row>
                          <Cell colSpan={4}>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              Total
                            </Typography>
                          </Cell>
                          <Cell>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              {CommaSeparator(parseFloat(TotalVaultBalance).toFixed(2))}
                            </Typography>
                          </Cell>
                          <Cell>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              {CommaSeparator(parseFloat((TotalVaultBalance3)).toFixed(2))}
                            </Typography>
                          </Cell>
                          <Cell>
                            {" "}
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              {CommaSeparator(parseFloat(TotalVaultBalance2).toFixed(2))}
                            </Typography>
                          </Cell>
                          <Cell>
                            {" "}
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              {CommaSeparator(parseFloat((TotalVaultBalance4)).toFixed(2))}
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
            onPageSizeChange={(size) => getVaultDashboard(1, size.target.value)}
            tableCount={vaultDashboard?.length}
            totalCount={totalCount}
            onPageChange={(page) => getVaultDashboard(page, "")}
          />
        </Fragment>
      )}

      {loader && <CircleLoading />}
    </Box>
  );
}

export default VaultDashboard;
