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
  Tooltip,
  Typography,
  tableCellClasses,
  CircularProgress,
  Grid,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import styled from "@emotion/styled";
import { FontFamily } from "assets";
import Colors from "assets/Style/Colors";
import { CircleLoading } from "components/Loaders";
import { ErrorToaster } from "components/Toaster";
import { makeStyles } from "@mui/styles";
import { useForm } from "react-hook-form";
import { CommaSeparator, Debounce, handleExportWithComponent } from "utils";
import moment from "moment";
import FinanceServices from "services/Finance";
import DatePicker from "components/DatePicker";
import SelectField from "components/Select";
import { useAuth } from "context/UseContext";
import InputField from "components/Input";
import SystemServices from "services/System";
import html2pdf from 'html2pdf.js';
import { PrimaryButton } from "components/Buttons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExportFinanceServices from "services/ExportFinance";
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

function CashierActivity() {



  const classes = useStyles();
  const { user } = useAuth();
  const contentRef = useRef(null);
  const { register, getValues, setValue } = useForm();
  const [currency, setCurrency] = useState("aed");

  // *For Cashier Account
  const [cashierAccounts, setCashierAccounts] = useState([]);
  const [selectedCashierAccount, setSelectedCashierAccount] = useState(null);
  const [totalCreditState, settotalCreditState] = useState(0)
  const [totalDebitState, settotalDebitState] = useState(0)

  const tableHead = [
    "JV#",
    "Date",
    "Particular#",
    "Type",
    "COA Code",
    "COA Name",
    `Debit${getValues('Account')?.currency == "usd" ? "(USD)" : "(AED)"}`,
    `Credit${getValues('Account')?.currency == "usd" ? "(USD)" : "(AED)"}`,
    `Balance${getValues('Account')?.currency == "usd" ? "(USD)" : "(AED)"}`,
    "Description",
  ];

  // *For Closing Balance
  let TotalDebit = 0;
  let TotalCredit = 0;
  let ClosingBalance = 0;
  let TotalClosingBalance = 0;

  const [loader, setLoader] = useState(false);

  // *For Cashier Activity
  const [cashierActivity, setCashierActivity] = useState();

  // *For Selected Nature
  const [selectedNature, setSelectedNature] = useState({
    id: "vehicle",
    name: "Vehicle",
  });

  // *For Filters
  const [filters, setFilters] = useState();
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [totalClosing, setTotalClosing] = useState(0)
  const [openingBalance, setOpeningBalance] = useState(0)

  const [exchangeRateUsd, setExchangeRateUsd] = useState();


  // *For Handle Date
  const handleFromDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setFromDate("invalid");
        return;
      }
      setFromDate(new Date(newDate));
      handleFilter({
        from_date: moment(new Date(newDate)).format("MM-DD-YYYY"),
      });
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const handleToDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setToDate("invalid");
        return;
      }
      setToDate(new Date(newDate));
      handleFilter({ to_date: moment(new Date(newDate)).format("MM-DD-YYYY") });
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

      // setExchangeRateAed(parseFloat(data?.currencies.find(e => e.currency === 'aed')?.conversion_rate))
      setExchangeRateUsd(
        parseFloat(
          data?.currencies.find((e) => e.currency === "usd")?.conversion_rate
        )
      );
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Cashier Activity
  const getCashierActivity = async (filter) => {
    // setLoader(true)
    try {
      const Filter = { ...filters, ...filter };
      setFilters(Filter);
      let params = {
        ...Filter,
      };
      const { data } = await ExportFinanceServices.getCashierActivity(params);
      let Total = 0
      let totalDebit = 0
      let totalCredit = 0

      if (getValues('Account')?.currency == 'usd') {
        console.log('usd');
        setOpeningBalance(parseFloat(data?.opening_balance?.totalDebitCur) - parseFloat(data?.opening_balance?.totalCreditCur))
        Total = data?.statement?.rows?.reduce((total, item) => {
          const debit = isNaN(item?.debit_cur) ? 0 : parseFloat(item?.debit_cur);
          const credit = isNaN(item?.credit_cur) ? 0 : parseFloat(item?.credit_cur);
          const balance = debit - credit; // Do not apply toFixed(2) here
          return total + balance;
        }, 0);
        const { totalDebit, totalCredit } = data?.statement?.rows?.reduce(
          (totals, transaction) => {
            // Parse debit and credit values to numbers
            const debit = parseFloat(transaction.debit_cur);
            const credit = parseFloat(transaction.credit_cur);

            // Add debit and credit to the running totals
            totals.totalDebit += debit;
            totals.totalCredit += credit;

            return totals;
          },
          { totalDebit: 0, totalCredit: 0 } // Initial values for totals
        );


        settotalCreditState(totalCredit)
        settotalDebitState(totalDebit)
      }
      else {
        console.log('aed');
        setOpeningBalance(parseFloat(data?.opening_balance?.totalDebit) - parseFloat(data?.opening_balance?.totalCredit))
        Total = data?.statement?.rows?.reduce((total, item) => {
          const debit = isNaN(item?.debit) ? 0 : parseFloat(item?.debit);
          const credit = isNaN(item?.credit) ? 0 : parseFloat(item?.credit);
          const balance = debit - credit; // Do not apply toFixed(2) here
          return total + balance;
        }, 0);

        const { totalDebit, totalCredit } = data?.statement?.rows?.reduce(
          (totals, transaction) => {
            // Parse debit and credit values to numbers
            const debit = parseFloat(transaction.debit);
            const credit = parseFloat(transaction.credit);

            // Add debit and credit to the running totals
            console.log(totals.totalDebit)
            totals.totalDebit += debit;
            totals.totalCredit += credit;

            return totals;
          },
          { totalDebit: parseFloat(data?.opening_balance?.totalDebit), totalCredit: parseFloat(data?.opening_balance?.totalCredit) } // Initial values for totals
        );

        console.log(totalCredit)
        console.log(totalDebit, "totalDebit")
        settotalCreditState(totalCredit)
        settotalDebitState(totalDebit)
      }

      TotalClosingBalance = parseFloat(Total.toFixed(2))

      setTotalClosing((parseFloat(data?.opening_balance?.totalDebit) - parseFloat(data?.opening_balance?.totalCredit)) + parseFloat(Total))

      // if(getValues('Account')?.currency=='usd'){
      //   console.log(Total,'Total');
      //   TotalClosingBalance =  parseFloat(Total)/exchangeRateUsd

      //   console.log(TotalClosingBalance);
      // }else{
      //   TotalClosingBalance=parseFloat(Total)
      //   console.log(TotalClosingBalance);
      //   setTotalClosing(TotalClosingBalance)  

      // }
      let tt = parseFloat(totalClosing);

      const cashierActivityCopy = data?.statement?.rows.map((item, index) => {

        let rowEntries = data?.statement?.rows;

        TotalDebit += parseFloat(item?.debit);
        TotalCredit += parseFloat(item?.credit);

        let debit = isNaN(item?.debit) ? 0 : item?.debit;
        let credit = isNaN(item?.credit) ? 0 : item?.credit;

        if (getValues('Account')?.currency == 'usd') {
          debit = isNaN(item?.debit_cur) ? 0 : item?.debit_cur;
          credit = isNaN(item?.credit_cur) ? 0 : item?.credit_cur;
          TotalDebit += parseFloat(item?.debit_cur);
          TotalCredit += parseFloat(item?.credit_cur);
        }


        let balance = (
          parseFloat(debit) - parseFloat(credit)
        ).toFixed(2);


        if (index > 0) {
          console.log('sdadsasdasda');
          if (getValues('Account')?.currency == 'usd') {

            balance = (
              parseFloat(rowEntries[index - 1].debit_cur) - parseFloat(rowEntries[index - 1].credit_cur)
            ).toFixed(2);
            console.log(balance, 'balancebalance');
          }
          else {
            balance = (
              parseFloat(rowEntries[index - 1].debit) - parseFloat(rowEntries[index - 1].credit)
            ).toFixed(2);
            console.log(balance, 'balancebalance');
          }

        }


        tt += parseFloat(balance)
        // if(getValues('Account')?.currency=='usd'){
        //   balance=  (parseFloat(balance)/exchangeRateUsd).toFixed(2)
        // }
        // else{
        //   balance=  parseFloat(balance).toFixed(2)
        // }
        ClosingBalance += parseFloat(balance);
        if (index == 0) {
          TotalClosingBalance = parseFloat(TotalClosingBalance.toFixed(2))
        }
        else {
          TotalClosingBalance = parseFloat(TotalClosingBalance.toFixed(2)) - parseFloat(balance)

        }

        let item_return = { ...item, ClosingBalance, TotalClosingBalance };

        return item_return;
      })

      let opening_balance = parseFloat(data?.opening_balance?.totalDebit) - parseFloat(data?.opening_balance?.totalCredit);

      let seedhiArray = data?.statement?.rows.reverse();
      let totalBalance = opening_balance;
      for (let i = 0; i < seedhiArray.length; i++) {
        if (getValues('Account')?.currency == 'usd') {
          const element = seedhiArray[i];
          let balance = parseFloat(element.debit_cur) - parseFloat(element.credit_cur);
          totalBalance += parseFloat(balance)
          let index = i + 1;
          let totalLenght = cashierActivityCopy.length;
          cashierActivityCopy[totalLenght - index].TotalClosingBalance = totalBalance;
        }
        else {
          const element = seedhiArray[i];
          let balance = parseFloat(element.debit) - parseFloat(element.credit);
          totalBalance += parseFloat(balance)
          let index = i + 1;
          let totalLenght = cashierActivityCopy.length;
          cashierActivityCopy[totalLenght - index].TotalClosingBalance = totalBalance;
        }


      }


      setCashierActivity(cashierActivityCopy);

    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };

  // *For Handle Filter
  const handleFilter = (data) => {

    Debounce(() => getCashierActivity(data));
  };

  // *For Get Payment Accounts
  const getPaymentAccounts = async (value) => {
    try {
      let params = {
        page: 1,
        limit: 999999,
      };
      const { data } = await ExportFinanceServices.getPaymentAccounts(params);
      // *Filter account By Nature



      setCashierAccounts(data?.cashierAccounts?.rows);

    } catch (error) {
      ErrorToaster(error);


    }
  };
  const data = [
    { id: 1, name: 'John Doe', age: 25, city: 'New York' },
    { id: 2, name: 'Jane Smith', age: 30, city: 'Los Angeles' },
    { id: 3, name: 'Bob Johnson', age: 22, city: 'Chicago' },
  ];

  const downloadExcel = () => {
    // Define headers and data separately
    const headers = tableHead;
    const data = cashierActivity;

    // Extract values from objects and create an array for each row
    const rows = data.map((item, index) => [
      item?.journal_id ? item?.series_id + item?.journal_id : "-",
      moment(item?.created_at).format("MM-DD-YYYY") ?? "-",
      item.entry?.reference_no,
      item?.type?.type_name ?? "-",
      item?.account?.account_code ?? "-",
      item?.account?.name ?? "-",
      getValues('Account')?.currency == "usd" ? parseFloat(parseFloat(item?.debit_cur)).toFixed(2) ?? "0.00" : parseFloat(item?.debit).toFixed(2) ?? "0.00",
      getValues('Account')?.currency == "usd" ? parseFloat(parseFloat(item?.credit_cur)).toFixed(2) ?? "0.00" : parseFloat(item?.credit).toFixed(2) ?? "0.00",
      getValues('Account')?.currency == "usd" ? parseFloat(parseFloat(item?.TotalClosingBalance)).toFixed(2) : parseFloat(item?.TotalClosingBalance).toFixed(2),
      item?.description ?? "-",
    ]);
    const totalRow = [
      "",
      "Opening Balance",
      "",
      "Total Debit",
      "",
      "Total Credit",
      "",
      "Closing Balance",
      "",
      "",
    ];

    const totalRow2 = [
      "",
      parseFloat(openingBalance).toFixed(2),
      "",
      getValues('Account')?.currency == "usd"
        ? parseFloat(
          parseFloat(totalDebitState)
        ).toFixed(2)
        : parseFloat(totalDebitState).toFixed(2),
      "",
      getValues('Account')?.currency == "usd"
        ? parseFloat(
          parseFloat(totalCreditState)
        ).toFixed(2)
        : parseFloat(totalCreditState).toFixed(2),
      "",
      getValues('Account')?.currency == "usd"
        ? parseFloat(
          parseFloat(totalClosing)
        ).toFixed(2)
        : parseFloat(totalClosing).toFixed(2),
      "",
      "",
    ];

    // Create a workbook with a worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRow, totalRow2]);
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

  const downloadPDF = () => {
    // Create an HTML table with the dummy data
    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>City</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `<tr><td>${row.id}</td><td>${row.name}</td><td>${row.age}</td><td>${row.city}</td></tr>`).join('')}
        </tbody>
      </table>
    `;

    // Create a new html2pdf instance
    const pdf = new html2pdf();

    // Convert the HTML table to PDF
    pdf.from(tableHtml).save('downloaded_table.pdf');
  };
  const myHtml = `
  <div>
    <h1>Example page</h1>
    <div className="element-to-print">
      <p>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste quia dicta
        itaque sunt fuga, illo ad eaque ea commodi temporibus perferendis
        provident doloribus non iusto asperiores excepturi autem facere qui!
      </p>
    </div>
    <button
      onClick={() => pdfFromReact(".element-to-print", "Cashier Activity", "p", true, false)}
    >Download</button>
  </div>
`;

  useEffect(() => {
    // getCashierActivity();
    setValue('Nature', { id: 'vehicle', name: 'Vehicle' })
    getPaymentAccounts();
    getCurrencies();

  }, []);
  let mydata = false
  return (
    <Box sx={{ m: 4, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mr: 4,
          mb: 4,
        }}
      >
        {/*      
      <button
        onClick={() =>
          pdfFromReact('.element-to-print1', "Cashier Activity", "l", true, false)
        }
      >Download</button> */}
        {/* <button onClick={downloadPDF}>
      Download PDF
    </button> */}
        <Typography
          variant="h5"
          sx={{
            color: Colors.charcoalGrey,
            fontFamily: FontFamily.NunitoRegular,
          }}
        >
          Cashier Activity Report
        </Typography>
        {cashierActivity?.length > 0 && (
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
      <Grid
        container
        spacing={1}
        alignItems="center"
        justifyContent={"space-between"}
      >
        <Grid item xs={12} sm={3} mt={1}>
          <InputField
            size={"small"}
            label={"Search"}
            placeholder={"Search"}
            register={register("search", {
              onChange: (e) => {
                if (e.target.value) {
                  handleFilter({ search: e.target.value })
                }
              },
            })}
          />
        </Grid>

        <Grid item xs={12} sm={3} mt={1}>
          <SelectField
            size={"small"}
            label={"Account"}
            options={cashierAccounts}
            selected={selectedCashierAccount}

            register={register("Account")}
            onSelect={(value) => {
              setSelectedCashierAccount(value);

              setValue('Account', value)
              if (value) {
                handleFilter({ account_id: value?.id });

              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <DatePicker
            disableFuture={true}
            size="small"
            label={"From Date"}
            value={fromDate}
            onChange={(date) => {
              handleFromDate(date)
              setValue('Account', selectedCashierAccount)
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <DatePicker
            disabled={fromDate ? false : true}
            disableFuture={true}
            size="small"
            minDate={fromDate}
            label={"To Date"}
            value={toDate}
            onChange={(date) => {
              handleToDate(date)
              setValue('Account', selectedCashierAccount)
            }}
          />
        </Grid>
      </Grid>

      {cashierActivity ? (
        <Fragment>
          <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
            fileName="Cashier Activity Report"
          >
            <Box className='pdf-show' sx={{ display: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                  Cashier Activity
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
                      <Cell className='pdf-table' key={index}>{item}</Cell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loader ? (
                    cashierActivity?.length > 0 ? (
                      <Fragment>
                        {cashierActivity.map((item, index) => {



                          return (
                            <Row
                              key={index}
                              sx={{ bgcolor: index % 2 !== 0 && "#EFF8E7" }}
                            >
                              <Cell className='pdf-table'>
                                {item?.journal_id
                                  ? item?.series_id + item?.journal_id
                                  : "-"}
                              </Cell>
                              <Cell className='pdf-table'>
                                {moment(item?.created_at).format("MM-DD-YYYY") ??
                                  "-"}
                              </Cell>
                              <Cell className='pdf-table'>
                                {" "}
                                <Tooltip
                                  className="pdf-hide"
                                  title={item.entry?.reference_no}
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
                                  {item.entry?.reference_no?.length > 20
                                    ? item.entry?.reference_no?.slice(0, 7) +
                                    "..."
                                    : item.entry?.reference_no}{" "}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className="pdf-show"
                                  sx={{ display: "none !important" }}
                                >
                                  {item.entry?.reference_no}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>{item?.type?.type_name ?? "-"}</Cell>
                              <Cell className='pdf-table'>{item?.account?.account_code ?? "-"}</Cell>
                              <Cell className='pdf-table'>{item?.account?.name ?? "-"}</Cell>
                              <Cell className='pdf-table'>
                                {getValues('Account')?.currency == "usd"
                                  ? CommaSeparator(parseFloat(
                                    parseFloat(item?.debit_cur)
                                  ).toFixed(2)) ?? "0.00"
                                  : CommaSeparator(parseFloat(item?.debit).toFixed(2)) ?? "0.00"}
                              </Cell>
                              <Cell className='pdf-table'>
                                {getValues('Account')?.currency == "usd"
                                  ? CommaSeparator(parseFloat(
                                    parseFloat(item?.credit_cur)
                                  ).toFixed(2)) ?? "0.00"
                                  : CommaSeparator(parseFloat(item?.credit).toFixed(2)) ?? "0.00"}
                              </Cell>

                              <Cell className='pdf-table'>

                                {getValues('Account')?.currency == "usd"
                                  ? CommaSeparator(parseFloat(
                                    parseFloat(item?.TotalClosingBalance)
                                  ).toFixed(2))
                                  : CommaSeparator(parseFloat(item?.TotalClosingBalance).toFixed(2))}
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.description ?? "-"}
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
                                    item?.description?.length > 24
                                      ? item?.description?.slice(0, 18) + "..."
                                      : item?.description
                                  }
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className="pdf-hide"
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.description ?? "-"}
                                </Box>
                              </Cell>
                            </Row>
                          );
                        })}
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

            <Box sx={{ py: 1, bgcolor: Colors.whiteSmoke }}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={3}>
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
                      sx={{
                        fontWeight: 700,
                        fontFamily: FontFamily.NunitoRegular,
                      }}
                    >
                      Opening Balance
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
                        sx={{ color: Colors.smokeyGrey }}
                      >
                        {CommaSeparator(parseFloat(openingBalance).toFixed(2))}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={3}>
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
                      sx={{
                        fontWeight: 700,
                        fontFamily: FontFamily.NunitoRegular,
                      }}
                    >
                      Total Debit
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
                        sx={{ color: Colors.smokeyGrey }}
                      >
                        {getValues('Account')?.currency == "usd"
                          ? CommaSeparator(parseFloat(
                            parseFloat(totalDebitState)
                          ).toFixed(2))
                          : CommaSeparator(parseFloat(totalDebitState).toFixed(2))}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
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
                      sx={{
                        fontWeight: 700,
                        fontFamily: FontFamily.NunitoRegular,
                      }}
                    >
                      Total Credit
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
                        sx={{ color: Colors.smokeyGrey }}
                      >
                        {getValues('Account')?.currency == "usd"
                          ? CommaSeparator(parseFloat(
                            parseFloat(totalCreditState)
                          ).toFixed(2))
                          : CommaSeparator(parseFloat(totalCreditState).toFixed(2))}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
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
                      sx={{
                        fontWeight: 700,
                        fontFamily: FontFamily.NunitoRegular,
                      }}
                    >
                      Closing Balance
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
                        sx={{ color: Colors.smokeyGrey }}
                      >
                        {getValues('Account')?.currency == "usd"
                          ? CommaSeparator(parseFloat(
                            parseFloat(totalClosing)
                          ).toFixed(2))
                          : CommaSeparator(parseFloat(totalClosing).toFixed(2))}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </PDFExport>
        </Fragment>
      ) : (
        ''
      )}
    </Box>
  );
}

export default CashierActivity;
