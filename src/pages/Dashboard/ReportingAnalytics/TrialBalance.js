import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  IconButton,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  tableCellClasses,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import styled from "@emotion/styled";
import { FontFamily, Images } from "assets";
import Colors from "assets/Style/Colors";
import { CircleLoading } from "components/Loaders";
import { ErrorToaster } from "components/Toaster";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import FinanceServices from "services/Finance";
import Highlighter from "react-highlight-words";
import InputField from "components/Input";
import { PrimaryButton } from "components/Buttons";
import ExportFinanceServices from "services/ExportFinance";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CommaSeparator, handleExportWithComponent } from "utils";
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

function TrialBalance() {
  const classes = useStyles();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const { register } = useForm();



  const tableHead = [
    "Code",
    "Name",
    "Major Category",
    "Sub Category",
    "Debit (AED)",
    "Credit (AED)",
    "Action",
  ];

  const [loader, setLoader] = useState(false);

  // *For Balance Sheet
  const [balanceSheet, setBalanceSheet] = useState([]);
  const [filteredBalanceSheet, setFilteredBalanceSheet] = useState([]);

  const [textValue, setTextValue] = useState("");

  // *For Filters
  const [filters, setFilters] = useState("all");
  const [filterData, setFilterData] = useState();
  const [childTabs, setChildTabs] = useState([]);

  const [allDebit, setAllDebit] = useState(0)
  const [allCredit, setAllCredit] = useState(0)

  // *For Collapse
  const [expand, setExpand] = useState([]);

  let TotalEquity = 0;

  // *For Get Balance Sheet
  const getBalanceSheet = async (filter) => {
    try {
      const { data } = await FinanceServices.getAccountReports();
      setBalanceSheet(data?.detail);
      setFilteredBalanceSheet(data?.detail);
      console.log(data?.detail, "data?.detail");
      const fil = [];
      data?.detail.forEach((e) => {
        let obj = {
          id: e.id,
          name: e.name,
          sub_accounts: e.sub,
        };
        fil.push(obj);
      });
      setFilterData(fil);
      const calculateTotalForAllCategories = (data) => {
        let totalDebit = 0;
        let totalCredit = 0;

        const processAccounts = (accounts) => {
          accounts.forEach((account) => {
            const credit = parseFloat(account.total_credit) || 0;
            const debit = parseFloat(account.total_debit) || 0;

            if (account.nature === 'debit' || !account.nature) {
              totalDebit += debit - credit;

            } else {
              totalCredit += credit - debit;
            }

            console.log(debit, 'Debit', account.nature);
            console.log(credit, 'credit', account.nature);
            console.log(totalDebit, 'totalDebit', account.nature);
            console.log(totalCredit, 'totalCredit', account.nature);
            if (account.childAccounts && Array.isArray(account.childAccounts)) {
              processAccounts(account.childAccounts);
            }
          });
        };

        data.forEach((category) => {
          if (category.sub && Array.isArray(category.sub)) {
            category.sub.forEach((subItem) => {
              if (subItem.accounts && Array.isArray(subItem.accounts)) {
                processAccounts(subItem.accounts);
              }
            });
          }
        });

        return {
          totalDebit: totalDebit.toFixed(2),
          totalCredit: totalCredit.toFixed(2),
        };
      };

      // Example usage
      const myData = [
        // ... (your array of objects)
      ];

      const totalForAllCategories = calculateTotalForAllCategories(data?.detail);
      setAllDebit(totalForAllCategories.totalDebit)
      setAllCredit(totalForAllCategories.totalCredit)
      console.log('Total Debit for All Categories:', totalForAllCategories.totalDebit);
      console.log('Total Credit for All Categories:', totalForAllCategories.totalCredit);




    } catch (error) {
      ErrorToaster(error);
    }
  };

  function scrollToHighlightedElement() {
    // Find the element with the class 'highlighted'
    const highlightedElement = document.querySelector('.highlighted');

    // Log the highlighted element to the console (for debugging purposes)
    console.log(highlightedElement);

    if (highlightedElement) {
      // Find the child element you want to scroll to (replace 'childClassName' with the actual class name of the child element)
      const childElement = highlightedElement.querySelector('span');
      console.log(childElement);
      console.log(childElement.querySelector('.highlighted'));
      if (childElement) {
        // Scroll the child element into view with smooth behavior and centered alignment
        childElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  // *For Handle Filter
  const handleFilter = (event, newValue, child) => {
    if (child) {
      console.log(newValue, "newValue");
      console.log(balanceSheet);
      console.log(
        balanceSheet?.map((item) =>
          item?.sub?.filter((subItem) => subItem?.id == newValue)
        ),
        "sdasadsda"
      );
      const arrayOfArrays = balanceSheet?.map((item) =>
        item?.sub?.filter((subItem) => subItem?.id == newValue)
      );
      const nonEmptyArrays = arrayOfArrays.filter((arr) => arr.length > 0);

      // Log the result to the console
      console.log(nonEmptyArrays.flat());
      setFilteredBalanceSheet(nonEmptyArrays.flat());

      setFilters(newValue);
    } else {
      setFilters(newValue);
      if (newValue === "all") {
        setFilteredBalanceSheet(balanceSheet);
        setChildTabs(balanceSheet.find((item) => item?.id == newValue)?.sub);
      } else {
        const filterData = balanceSheet.filter((e) => e.id === newValue);
        setChildTabs(balanceSheet.find((item) => item?.id == newValue)?.sub);
        setFilteredBalanceSheet(filterData);
      }
    }
  };

  // *For Handle Expand
  const handleExpand = (id) => {
    try {
      const currentIndex = expand.indexOf(id);
      const newExpand = [...expand];

      if (currentIndex === -1) {
        newExpand.push(id);
      } else {
        newExpand.splice(currentIndex, 1);
      }

      setExpand(newExpand);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const Search = () => {
    let textToSearch = document.getElementById("text-to-search").value;
    setTextValue(textToSearch);

    scrollToHighlightedElement();
  };

  // *For Filter Chart of Account By Search
  const filterBySearch = (search) => {
    const result = [];

    for (const item of balanceSheet) {
      if (item?.sub.length > 0) {
        for (const sub of item?.sub) {
          if (sub?.accounts?.length > 0) {
            for (const acc of sub?.accounts) {
              if (
                acc.account_name
                  ?.toLowerCase()
                  .includes(search?.toLowerCase()) ||
                acc.account_code?.toLowerCase().includes(search?.toLowerCase())
              ) {
                result.push(item);
              } else {
                if (acc?.childAccounts?.length > 0) {
                  for (const subAcc of acc?.childAccounts) {
                    if (
                      subAcc.account_name
                        ?.toLowerCase()
                        .includes(search?.toLowerCase()) ||
                      subAcc.account_code
                        ?.toLowerCase()
                        .includes(search?.toLowerCase())
                    ) {
                      result.push(item);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    setFilteredBalanceSheet(result);
  };

  const downloadExcel = () => {
    const headers = tableHead.filter(item => item !== "Action");
    const rows = [];
    let TotalEquity = 0; // Initialize TotalEquity here

    filteredBalanceSheet?.forEach((item, index) => {
      let GrandTotal = 0;
      let GrandTotal2 = 0;
      item?.sub?.forEach(subItem => {
        let Total = 0;
        let Total2 = 0;

        subItem?.accounts?.forEach(account => {
          let childFinalTotal = 0;
          let childTotal = 0; // Initialize childTotal here
          let childTotal2 = 0; // Initialize childTotal here

          if (account?.childAccounts?.length > 0) {
            const initialValue = { credit: 0, debit: 0 };
            const result = account?.childAccounts?.reduce((accumulator, transaction) => {
              const credit = isNaN(transaction?.total_credit) ? 0 : parseFloat(transaction?.total_credit);
              const debit = isNaN(transaction?.total_debit) ? 0 : parseFloat(transaction?.total_debit);
              return {
                credit: accumulator.credit + credit,
                debit: accumulator.debit + debit,
              };
            }, initialValue);
            childTotal = account?.nature === "debit"
              ? parseFloat(result?.debit) - parseFloat(result?.credit)
              : parseFloat(result?.credit) - parseFloat(result?.debit);
            childTotal2 = account?.nature === "debit" || account?.nature === null
              ? parseFloat(result?.debit) - parseFloat(result?.credit)
              : parseFloat(0); // Remove .toFixed(2)
          } else {
            childTotal = account?.nature === "debit"
              ? parseFloat(account?.total_debit) - parseFloat(account?.total_credit)
              : parseFloat(account?.total_credit) - parseFloat(account?.total_debit);
            childTotal2 = account?.nature === "debit" || account?.nature === null
              ? parseFloat(account?.total_debit) - parseFloat(account?.total_credit)
              : parseFloat(account?.total_credit) - parseFloat(account?.total_debit); // Remove .toFixed(2)
          }

          Total += childTotal;
          Total2 += childTotal2;
          GrandTotal += childTotal;
          GrandTotal2 += childTotal2;
          if (index !== 0) {
            TotalEquity += childTotal;
          }

          rows.push([
            account?.account_code ?? '-',
            account?.account_name ?? '-',
            account?.account_category ?? '-',
            account?.account_subcategory ?? '-',
            parseFloat(childTotal2.toFixed(2)), // Convert to number before calling .toFixed
            parseFloat(childTotal.toFixed(2)), // Convert to number before calling .toFixed
          ]);

          account?.childAccounts?.forEach(child => {
            const credit = isNaN(child?.total_credit) ? 0 : child?.total_credit;
            const debit = isNaN(child?.total_debit) ? 0 : child?.total_debit;
            let subTotal = child?.nature === "debit"
              ? (parseFloat(debit) - parseFloat(credit)).toFixed(2)
              : (parseFloat(credit) - parseFloat(debit)).toFixed(2);
            childFinalTotal += parseFloat(subTotal);
            rows.push([
              child?.account_code ?? '-',
              child?.account_name ?? '-',
              child?.account_category ?? '-',
              child?.account_subcategory ?? '-',
              parseFloat(subTotal) // Convert to number before calling .toFixed
            ]);
          });
        });

        if (subItem?.accounts?.length > 0) {
          rows.push([
            `Total of ${subItem?.accounts[0]?.type_code}`,
            "", `Total ${subItem.name}`, "",
            parseFloat(Total2.toFixed(2)),
            parseFloat(Total.toFixed(2)),
          ]);
        }
      });

    });

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
    getBalanceSheet();
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <div class="container">
            <div class="wrapper">
              <InputField
                size={"small"}
                type="text"
                id="text-to-search"
                placeholder="Search"
                register={register("search", {
                  onChange: (e) => Search(),
                })}
              />
            </div>
          </div>
        </Grid>
      </Grid>
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
          Trial Balance
        </Typography>
        {balanceSheet?.length > 0 && (
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
      {/* <Grid container spacing={1}>
        <Grid item xs={12} sm={3}>
          <InputField
            size={'small'}
            label={'Search'}
            placeholder={'Search'}
            register={register('search', {
              onChange: (e) => filterBySearch(e.target.value)
            })}
          />
        </Grid>
      </Grid> */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={12}>
          <Tabs
            value={filters}
            onChange={(event, newValue) => handleFilter(event, newValue, false)}
          >
            <Tab value="all" label="All" />
            {filterData?.map((item, index) => (
              <Tab key={index} value={item?.id} label={item?.name} />
            ))}
          </Tabs>
          <Tabs
            value={filters}
            onChange={(event, newValue) => handleFilter(event, newValue, true)}
          >
            {childTabs?.map((item, index) => (
              <Tab key={index} value={item?.id} label={item?.name} />
            ))}
          </Tabs>
        </Grid>
      </Grid>

      {balanceSheet ? (
        <Fragment>
          <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
            fileName="Trial Balance"
          >
            <Box className='pdf-show' sx={{ display: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                  Trial Balance
                </Typography>
                <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
              </Box>
            </Box>
            {/* ========== Table ========== */}
            <TableContainer
              id="paragraph"
              component={Paper}
              sx={{
                boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                borderRadius: 2,

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
                    filteredBalanceSheet?.length > 0 ? (
                      <>
                        <Fragment>
                          {filteredBalanceSheet?.map((item, index) => {
                            let GrandTotal = 0;
                            let GrandTotal2 = 0;
                            return (
                              <Fragment key={index}>
                                <Row>
                                  <Cell className="pdf-table" colSpan={tableHead?.length}>
                                    <Typography className="pdf-table"
                                      variant="subtitle1"
                                      sx={{ textAlign: "left" }}
                                    >
                                      {console.log(expand)}
                                      {expand.indexOf(item.id) === -1 ? (
                                        <ExpandMore className="pdf-hide"
                                          sx={{
                                            verticalAlign: "sub",
                                            cursor: "pointer",
                                            opacity:
                                              item?.sub?.length > 0 ? 1 : 0,
                                          }}
                                          onClick={() => handleExpand(item.id)}
                                        />
                                      ) : (
                                        <ExpandLess className="pdf-hide"
                                          sx={{
                                            verticalAlign: "sub",
                                            cursor: "pointer",
                                            transform: "rotate(90deg)",
                                            opacity:
                                              item?.sub?.length > 0 ? 1 : 0,
                                          }}
                                          onClick={() => handleExpand(item.id)}
                                        />
                                      )}
                                      {item?.name}
                                    </Typography>
                                  </Cell>
                                </Row>
                                {expand.indexOf(item.id) === -1 && (
                                  <Fragment>
                                    {item?.sub?.map((subItem, i) => {
                                      let Total = 0;
                                      let Total2 = 0;
                                      return (
                                        <Fragment key={i}>
                                          <Row>
                                            <Cell className="pdf-table" colSpan={tableHead?.length}>
                                              <Typography
                                                variant="body1"
                                                sx={{
                                                  fontWeight: 700,
                                                  textAlign: "left",
                                                  ml: 1.5,
                                                }}
                                              >
                                                {expand.indexOf(subItem.id) ===
                                                  -1 ? (
                                                  <ExpandMore className="pdf-hide"
                                                    sx={{
                                                      verticalAlign: "sub",
                                                      cursor: "pointer",
                                                      opacity:
                                                        subItem?.accounts
                                                          ?.length > 0
                                                          ? 1
                                                          : 0,
                                                    }}
                                                    onClick={() =>
                                                      handleExpand(subItem.id)
                                                    }
                                                  />
                                                ) : (
                                                  <ExpandLess className="pdf-hide"
                                                    sx={{
                                                      verticalAlign: "sub",
                                                      cursor: "pointer",
                                                      transform: "rotate(90deg)",
                                                      opacity:
                                                        subItem?.accounts
                                                          ?.length > 0
                                                          ? 1
                                                          : 0,
                                                    }}
                                                    onClick={() =>
                                                      handleExpand(subItem.id)
                                                    }
                                                  />
                                                )}
                                                {subItem?.name}
                                              </Typography>
                                            </Cell>
                                          </Row>
                                          {expand.indexOf(subItem.id) === -1 && (
                                            <Fragment>
                                              {subItem?.accounts?.map(
                                                (account, j) => {
                                                  let childFinalTotal = 0;
                                                  let childTotal = 0;
                                                  let childTotal2 = 0;
                                                  if (
                                                    account?.childAccounts
                                                      ?.length > 0
                                                  ) {
                                                    const initialValue = {
                                                      credit: 0,
                                                      debit: 0,
                                                    };

                                                    const result =
                                                      account?.childAccounts?.reduce(
                                                        (
                                                          accumulator,
                                                          transaction
                                                        ) => {
                                                          const credit = isNaN(
                                                            transaction?.total_credit
                                                          )
                                                            ? 0
                                                            : transaction?.total_credit;
                                                          const debit = isNaN(
                                                            transaction?.total_debit
                                                          )
                                                            ? 0
                                                            : transaction?.total_debit;
                                                          return {
                                                            credit:
                                                              parseFloat(
                                                                accumulator.credit
                                                              ) +
                                                              parseFloat(credit),
                                                            debit:
                                                              parseFloat(
                                                                accumulator.debit
                                                              ) +
                                                              parseFloat(debit),
                                                          };
                                                        },
                                                        initialValue
                                                      );

                                                    childTotal =
                                                      account?.nature === "debit"
                                                        ? parseFloat(
                                                          result?.debit
                                                        ) -
                                                        parseFloat(
                                                          result?.credit
                                                        )
                                                        : parseFloat(
                                                          result?.credit
                                                        ) -
                                                        parseFloat(
                                                          result?.debit
                                                        );
                                                    childTotal2 =
                                                      account?.nature ===
                                                        "debit" ||
                                                        account?.nature === null
                                                        ? parseFloat(
                                                          result?.debit
                                                        ) -
                                                        parseFloat(
                                                          result?.credit
                                                        )
                                                        : parseFloat(0).toFixed(
                                                          2
                                                        );
                                                  } else {
                                                    childTotal =
                                                      account?.nature === "debit"
                                                        ? parseFloat(
                                                          account?.total_debit
                                                        ) -
                                                        parseFloat(
                                                          account?.total_credit
                                                        )
                                                        : parseFloat(
                                                          account?.total_credit
                                                        ) - parseFloat(
                                                          account?.total_debit
                                                        )

                                                    childTotal2 =
                                                      account?.nature ===
                                                        "debit" ||
                                                        account?.nature === null
                                                        ? parseFloat(
                                                          account?.total_debit
                                                        ) -
                                                        parseFloat(
                                                          account?.total_credit
                                                        )
                                                        : parseFloat(
                                                          account?.total_credit
                                                        ) - parseFloat(
                                                          account?.total_debit
                                                        )

                                                  }
                                                  Total += parseFloat(childTotal);
                                                  Total2 +=
                                                    parseFloat(childTotal2);
                                                  GrandTotal +=
                                                    parseFloat(childTotal);
                                                  GrandTotal2 +=
                                                    parseFloat(childTotal2);
                                                  if (index !== 0) {
                                                    TotalEquity +=
                                                      parseFloat(childTotal);
                                                  }
                                                  return (
                                                    <Fragment key={j}>
                                                      <Row>
                                                        <Cell
                                                          className={
                                                            account?.childAccounts
                                                              ? classes.anchorLink
                                                              : ""
                                                          }
                                                          onClick={() =>
                                                            handleExpand(
                                                              account?.id
                                                            )
                                                          }
                                                        >
                                                          <Typography
                                                            variant="body1"
                                                            sx={{ ml: 3 }}
                                                            className={account?.account_code + " " + 'highlighted' ??
                                                              "-"}
                                                          >
                                                            <Highlighter
                                                              highlightClassName={
                                                                account?.account_code + " " + 'highlighted' ??
                                                                "-"
                                                              }
                                                              searchWords={[
                                                                textValue,
                                                              ]}
                                                              autoEscape={true}
                                                              textToHighlight={
                                                                account?.account_code ??
                                                                "-"
                                                              }
                                                            />
                                                          </Typography>
                                                        </Cell>
                                                        <Cell
                                                          className={
                                                            account?.childAccounts
                                                              ? classes.anchorLink + " " + 'pdf-table'
                                                              : "pdf-table"
                                                          }
                                                          onClick={() =>
                                                            handleExpand(
                                                              account?.id
                                                            )
                                                          }
                                                        >
                                                          <Highlighter
                                                            highlightClassName={
                                                              account?.account_name ??
                                                              "-"
                                                            }
                                                            searchWords={[
                                                              textValue,
                                                            ]}
                                                            autoEscape={true}
                                                            textToHighlight={
                                                              account?.account_name ??
                                                              "-"
                                                            }
                                                          />
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                          <Highlighter
                                                            highlightClassName={
                                                              account?.account_category ??
                                                              "-"
                                                            }
                                                            searchWords={[
                                                              textValue,
                                                            ]}
                                                            autoEscape={true}
                                                            textToHighlight={
                                                              account?.account_category ??
                                                              "-"
                                                            }
                                                          />
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                          <Highlighter
                                                            highlightClassName={
                                                              account?.account_subcategory ??
                                                              "-"
                                                            }
                                                            searchWords={[
                                                              textValue,
                                                            ]}
                                                            autoEscape={true}
                                                            textToHighlight={
                                                              account?.account_subcategory ??
                                                              "-"
                                                            }
                                                          />
                                                        </Cell>

                                                        <Cell className="pdf-table">
                                                          <Highlighter
                                                            highlightClassName={
                                                              account?.account_subcategory ??
                                                              "-"
                                                            }
                                                            searchWords={[
                                                              textValue,
                                                            ]}
                                                            autoEscape={true}
                                                            textToHighlight={
                                                              account.nature ==
                                                                "debit" ||
                                                                account?.nature ===
                                                                null ||
                                                                account?.nature ===
                                                                "combine"
                                                                ? CommaSeparator(parseFloat(
                                                                  childTotal2
                                                                ).toFixed(2))
                                                                : parseFloat(
                                                                  0
                                                                ).toFixed(2)
                                                            }
                                                          />
                                                        </Cell>
                                                        <Cell className="pdf-table">

                                                          <Highlighter
                                                            highlightClassName={
                                                              account?.account_subcategory ??
                                                              "-"
                                                            }
                                                            searchWords={[
                                                              textValue,
                                                            ]}
                                                            autoEscape={true}
                                                            textToHighlight={
                                                              account.nature ==
                                                                "credit" ||
                                                                account?.nature ===
                                                                "combine"
                                                                ? CommaSeparator(parseFloat(
                                                                  childTotal
                                                                ).toFixed(2))
                                                                : parseFloat(
                                                                  0
                                                                ).toFixed(2)
                                                            }
                                                          />
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                          {!account?.childAccounts && (
                                                            <Box
                                                              sx={{
                                                                gap: "16px !important",
                                                              }}
                                                            >
                                                              <Box
                                                                component={'div'}
                                                                className="pdf-hide"
                                                                onClick={() =>
                                                                  navigate(
                                                                    `/account-ledger/${account?.id}`,
                                                                    {
                                                                      state: {
                                                                        accountName:
                                                                          account?.account_name,
                                                                        nature:
                                                                          account?.nature,
                                                                      },
                                                                    }
                                                                  )
                                                                }
                                                              >
                                                                <IconButton
                                                                  sx={{
                                                                    bgcolor:
                                                                      Colors.primary,
                                                                    "&:hover": {
                                                                      bgcolor:
                                                                        Colors.primary,
                                                                    },
                                                                  }}
                                                                >
                                                                  <Box
                                                                    component={
                                                                      "img"
                                                                    }
                                                                    src={
                                                                      Images.ledgerIcon
                                                                    }
                                                                    sx={{
                                                                      height:
                                                                        "16px",
                                                                      objectFit:
                                                                        "contain",
                                                                    }}
                                                                  />
                                                                </IconButton>
                                                                <Typography variant="body2">
                                                                  View
                                                                </Typography>
                                                              </Box>
                                                            </Box>
                                                          )}
                                                        </Cell>
                                                      </Row>
                                                      {expand.indexOf(
                                                        account.id
                                                      ) !== -1 && (
                                                          <Fragment>
                                                            {account?.childAccounts?.map(
                                                              (child, j) => {
                                                                console.log(child, 'child');
                                                                let credit =
                                                                  isNaN(
                                                                    child?.total_credit
                                                                  )
                                                                    ? 0
                                                                    : child?.total_credit;
                                                                const debit = isNaN(
                                                                  child?.total_debit
                                                                )
                                                                  ? 0
                                                                  : child?.total_debit;
                                                                let subTotal =
                                                                  child?.nature ===
                                                                    "debit"
                                                                    ? (
                                                                      parseFloat(
                                                                        debit
                                                                      ) -
                                                                      parseFloat(
                                                                        credit
                                                                      )
                                                                    ).toFixed(2)
                                                                    : (
                                                                      parseFloat(
                                                                        credit
                                                                      ) -
                                                                      parseFloat(
                                                                        debit
                                                                      )
                                                                    ).toFixed(2);
                                                                childFinalTotal +=
                                                                  parseFloat(
                                                                    subTotal
                                                                  );
                                                                console.log(subTotal, 'subTotal');
                                                                return (
                                                                  <Fragment key={j}>
                                                                    <Row
                                                                      sx={{
                                                                        bgcolor:
                                                                          "#EEFBEE",
                                                                      }}
                                                                    >
                                                                      <Cell className="pdf-table">
                                                                        <Typography
                                                                          variant="body1"
                                                                          sx={{
                                                                            ml: 4.5,
                                                                          }}
                                                                        >
                                                                          {child?.account_code ??
                                                                            "-"}
                                                                        </Typography>
                                                                      </Cell>
                                                                      <Cell className="pdf-table">
                                                                        {child?.account_name ??
                                                                          "-"}
                                                                      </Cell>
                                                                      <Cell className="pdf-table">
                                                                        {child?.account_category ??
                                                                          "-"}
                                                                      </Cell>
                                                                      <Cell className="pdf-table">
                                                                        {child?.account_subcategory ??
                                                                          "-"}
                                                                      </Cell>
                                                                      <Cell className="pdf-table">
                                                                        {account.nature ==
                                                                          "debit" ||
                                                                          account?.nature ===
                                                                          null
                                                                          ? CommaSeparator(parseFloat(
                                                                            subTotal
                                                                          ).toFixed(
                                                                            2
                                                                          ))
                                                                          : parseFloat(
                                                                            0
                                                                          ).toFixed(
                                                                            2
                                                                          )}
                                                                      </Cell>
                                                                      <Cell className="pdf-table">
                                                                        {account.nature ==
                                                                          "credit"
                                                                          ?CommaSeparator(parseFloat(
                                                                            subTotal
                                                                          ).toFixed(
                                                                            2
                                                                          ))
                                                                          : parseFloat(
                                                                            0
                                                                          ).toFixed(
                                                                            2
                                                                          )}
                                                                      </Cell>
                                                                      <Cell>
                                                                        <Box component={'div'}
                                                                          className="pdf-hide"
                                                                          sx={{
                                                                            gap: "16px !important",
                                                                          }}
                                                                        >
                                                                          <Box
                                                                            onClick={() =>
                                                                              navigate(
                                                                                `/account-ledger/${child?.id}`,
                                                                                {
                                                                                  state:
                                                                                  {
                                                                                    accountName:
                                                                                      child?.account_name,
                                                                                    nature:
                                                                                      child?.nature,
                                                                                  },
                                                                                }
                                                                              )
                                                                            }
                                                                          >
                                                                            <IconButton
                                                                              sx={{
                                                                                bgcolor:
                                                                                  Colors.primary,
                                                                                "&:hover":
                                                                                {
                                                                                  bgcolor:
                                                                                    Colors.primary,
                                                                                },
                                                                              }}
                                                                            >
                                                                              <Box
                                                                                component={
                                                                                  "img"
                                                                                }
                                                                                src={
                                                                                  Images.ledgerIcon
                                                                                }
                                                                                sx={{
                                                                                  height:
                                                                                    "16px",
                                                                                  objectFit:
                                                                                    "contain",
                                                                                }}
                                                                              />
                                                                            </IconButton>
                                                                            <Typography variant="body2">
                                                                              View
                                                                            </Typography>
                                                                          </Box>
                                                                        </Box>
                                                                      </Cell>
                                                                    </Row>
                                                                  </Fragment>
                                                                );
                                                              }
                                                            )}
                                                          </Fragment>
                                                        )}
                                                    </Fragment>
                                                  );
                                                }
                                              )}
                                              {subItem?.accounts?.length > 0 && (
                                                <Row>
                                                  <Cell>
                                                    <Typography
                                                      variant="body1"
                                                      sx={{
                                                        fontWeight: 700,
                                                        ml: 4.5,
                                                      }}
                                                    >
                                                      Total of{" "}
                                                      {
                                                        subItem?.accounts[0]
                                                          ?.type_code
                                                      }
                                                    </Typography>
                                                  </Cell>
                                                  <Cell colSpan={3}>
                                                    <Typography
                                                      variant="body1"
                                                      sx={{ fontWeight: 700 }}
                                                    >
                                                      Total {subItem?.name}
                                                    </Typography>
                                                  </Cell>
                                                  <Cell>
                                                    <Typography
                                                      variant="body1"
                                                      sx={{ fontWeight: 700 }}
                                                    >
                                                      {CommaSeparator(parseFloat(Total2).toFixed(
                                                        2
                                                      ))}
                                                    </Typography>
                                                  </Cell>
                                                  <Cell>
                                                    <Typography
                                                      variant="body1"
                                                      sx={{ fontWeight: 700 }}
                                                    >
                                                      {CommaSeparator(parseFloat(Total).toFixed(
                                                        2
                                                      ))}
                                                    </Typography>
                                                  </Cell>
                                                </Row>
                                              )}
                                            </Fragment>
                                          )}
                                        </Fragment>
                                      );
                                    })}
                                    {item?.sub?.length > 0 &&
                                      <Fragment>
                                        <Row sx={{ bgcolor: Colors.bluishCyan }}>
                                          <Cell>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white, ml: 4.5 }}>
                                              Total
                                            </Typography>
                                          </Cell>
                                          <Cell colSpan={3}>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                              Total {item?.name}
                                            </Typography>
                                          </Cell>

                                          <Cell>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                              {CommaSeparator(parseFloat(GrandTotal2).toFixed(2))}
                                            </Typography>
                                          </Cell>
                                          <Cell>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                              {CommaSeparator(parseFloat(GrandTotal).toFixed(2))}
                                            </Typography>
                                          </Cell>
                                        </Row>
                                      </Fragment>
                                    }
                                  </Fragment>
                                )}
                              </Fragment>
                            );
                          })}
                        </Fragment>
                        <Fragment>

                          {filteredBalanceSheet?.map((item, index) => (
                            <Fragment key={index}>
                              {true && (
                                <Fragment>
                                  {item?.accounts?.map((account, j) => {
                                    let Balance = 0;
                                    let Total = 0;
                                    if (account?.childAccounts?.length > 0) {
                                      const initialValue = {
                                        credit: 0,
                                        debit: 0,
                                      };

                                      const result =
                                        account?.childAccounts?.reduce(
                                          (accumulator, transaction) => {
                                            const credit = isNaN(
                                              transaction?.total_credit
                                            )
                                              ? 0
                                              : transaction?.total_credit;
                                            const debit = isNaN(
                                              transaction?.total_debit
                                            )
                                              ? 0
                                              : transaction?.total_debit;
                                            return {
                                              credit:
                                                parseFloat(accumulator.credit) +
                                                parseFloat(credit),
                                              debit:
                                                parseFloat(accumulator.debit) +
                                                parseFloat(debit),
                                            };
                                          },
                                          initialValue
                                        );
                                      Balance =
                                        account?.nature === "credit"
                                          ? parseFloat(result?.credit) -
                                          parseFloat(result?.debit)
                                          : parseFloat(result?.debit) -
                                          parseFloat(result?.credit);
                                    } else {
                                      Total =
                                        account?.nature === "credit"
                                          ? parseFloat(account?.total_credit) -
                                          parseFloat(account?.total_debit)
                                          : parseFloat(account?.total_debit) -
                                          parseFloat(account?.total_credit);
                                    }
                                    return (
                                      <Fragment key={j}>
                                        <Row>
                                          <Cell
                                            className={
                                              account?.childAccounts
                                                ? classes.anchorLink
                                                : ""
                                            }
                                            onClick={() =>
                                              handleExpand(account?.id)
                                            }
                                          >
                                            <Typography
                                              variant="body1"
                                              sx={{ ml: 3 }}
                                            >
                                              {account?.account_code ?? "-"}
                                            </Typography>
                                          </Cell>
                                          <Cell
                                            className={
                                              account?.childAccounts
                                                ? classes.anchorLink
                                                : ""
                                            }
                                            onClick={() =>
                                              handleExpand(account?.id)
                                            }
                                          >
                                            {account?.account_name ?? "-"}
                                          </Cell>
                                          <Cell>{account?.unit ?? "-"}</Cell>
                                          <Cell>
                                            {account?.account_category ?? "-"}
                                          </Cell>
                                          <Cell>
                                            {account?.account_subcategory ?? "-"}
                                          </Cell>
                                          <Cell>
                                            {account?.childAccounts
                                              ? CommaSeparator(Balance.toFixed(2))
                                              : CommaSeparator(Total.toFixed(2))}
                                          </Cell>
                                          <Cell>
                                            {!account?.childAccounts && (
                                              <Box
                                                sx={{ gap: "16px !important" }}
                                              >
                                                <Box
                                                  onClick={() =>
                                                    navigate(
                                                      `/account-ledger/${account?.id}`,
                                                      {
                                                        state: {
                                                          accountName:
                                                            account?.account_name,
                                                          nature: account?.nature,
                                                        },
                                                      }
                                                    )
                                                  }
                                                >
                                                  <IconButton
                                                    sx={{
                                                      bgcolor: Colors.primary,
                                                      "&:hover": {
                                                        bgcolor: Colors.primary,
                                                      },
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
                                                  <Typography variant="body2">
                                                    View
                                                  </Typography>
                                                </Box>
                                              </Box>
                                            )}
                                          </Cell>
                                        </Row>
                                        {expand.indexOf(account.id) !== -1 && (
                                          <Fragment>
                                            {account?.childAccounts?.map(
                                              (child, j) => {
                                                let ChildBalance = 0;
                                                ChildBalance =
                                                  child?.nature === "credit"
                                                    ? parseFloat(
                                                      child?.total_credit
                                                    ) -
                                                    parseFloat(
                                                      child?.total_debit
                                                    )
                                                    : parseFloat(
                                                      child?.total_debit
                                                    ) -
                                                    parseFloat(
                                                      child?.total_credit
                                                    );
                                                return (
                                                  <Fragment key={j}>
                                                    <Row
                                                      sx={{ bgcolor: "#EEFBEE" }}
                                                    >
                                                      <Cell>
                                                        <Typography
                                                          variant="body1"
                                                          sx={{ ml: 4.5 }}
                                                        >
                                                          {child?.account_code ??
                                                            "-"}
                                                        </Typography>
                                                      </Cell>
                                                      <Cell>
                                                        {child?.account_name ??
                                                          "-"}
                                                      </Cell>
                                                      <Cell>
                                                        {child?.unit ?? "-"}
                                                      </Cell>
                                                      <Cell>
                                                        {child?.account_category ??
                                                          "-"}
                                                      </Cell>
                                                      <Cell>
                                                        {child?.account_subcategory ??
                                                          "-"}
                                                      </Cell>
                                                      <Cell>
                                                        {CommaSeparator(ChildBalance.toFixed(2))}
                                                      </Cell>
                                                      <Cell>
                                                        <Box
                                                          sx={{
                                                            gap: "16px !important",
                                                          }}
                                                        >
                                                          <Box
                                                            onClick={() =>
                                                              navigate(
                                                                `/account-ledger/${child?.id}`,
                                                                {
                                                                  state: {
                                                                    accountName:
                                                                      child?.account_name,
                                                                    nature:
                                                                      child?.nature,
                                                                  },
                                                                }
                                                              )
                                                            }
                                                          >
                                                            <IconButton
                                                              sx={{
                                                                bgcolor:
                                                                  Colors.primary,
                                                                "&:hover": {
                                                                  bgcolor:
                                                                    Colors.primary,
                                                                },
                                                              }}
                                                            >
                                                              <Box
                                                                component={"img"}
                                                                src={
                                                                  Images.ledgerIcon
                                                                }
                                                                sx={{
                                                                  height: "16px",
                                                                  objectFit:
                                                                    "contain",
                                                                }}
                                                              />
                                                            </IconButton>
                                                            <Typography variant="body2">
                                                              View
                                                            </Typography>
                                                          </Box>
                                                        </Box>
                                                      </Cell>
                                                    </Row>
                                                  </Fragment>
                                                );
                                              }
                                            )}
                                          </Fragment>
                                        )}
                                      </Fragment>
                                    );
                                  })}
                                </Fragment>
                              )}

                            </Fragment>
                          ))}

                        </Fragment>

                      </>
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


                  <Fragment>
                    {filters == 'all' && <Row sx={{ bgcolor: Colors.primary }}>



                      <Cell colSpan={4}>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                          Total
                        </Typography>
                      </Cell>
                      <Cell>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                          {CommaSeparator(parseFloat(allDebit).toFixed(2))}
                        </Typography>
                      </Cell>
                      <Cell>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                          {CommaSeparator(parseFloat(allCredit).toFixed(2))}
                        </Typography>
                      </Cell>
                    </Row>}
                  </Fragment>
                </TableBody>
              </Table>
            </TableContainer>
          </PDFExport>
        </Fragment>
      ) : (
        <CircleLoading />
      )}
    </Box>
  );
}

export default TrialBalance;
