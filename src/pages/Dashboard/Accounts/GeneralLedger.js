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
  Tooltip,
} from "@mui/material";
import styled from "@emotion/styled";
import { EyeIcon, FontFamily } from "assets";
import Colors from "assets/Style/Colors";
import { CircleLoading } from "components/Loaders";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { Delete, Edit } from "@mui/icons-material";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import BuyerServices from "services/Buyer";
import { makeStyles } from "@mui/styles";
import Pagination from "components/Pagination";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import { Debounce, LedgerLinking, handleExportWithComponent } from "utils";
import SelectField from "components/Select";
import AuctionHouseServices from "services/AuctionHouse";
import DatePicker from "components/DatePicker";
import { PrimaryButton } from "components/Buttons";
import moment from "moment";
import FinanceServices from "services/Finance";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from "@progress/kendo-react-pdf";
import { showErrorToast } from "components/NewToaster";
import { logDOM } from "@testing-library/react";

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,

}));

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
      fontSize: 14,
      fontFamily: 'Public Sans',
      border: '1px solid #EEEEEE',
      padding: '15px',
      textAlign: 'left',
      whiteSpace: 'nowrap',
      color: '#434343',
      paddingRight: '50px',
      background: 'transparent',
      fontWeight: 'bold'

  },
  [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      fontFamily: 'Public Sans',

      textWrap: 'nowrap',
      padding: '5px !important',
      paddingLeft: '15px !important',

      '.MuiBox-root': {
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          justifyContent: 'center',
          '.MuiBox-root': {
              cursor: 'pointer'
          }
      },
      'svg': {
          width: 'auto',
          height: '24px',
      },
      '.MuiTypography-root': {
          textTransform: 'capitalize',
          fontFamily: FontFamily.NunitoRegular,
          textWrap: 'nowrap',
      },
      '.MuiButtonBase-root': {
          padding: '8px',
          width: '28px',
          height: '28px',
      }
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

function GeneralLedger() {
  const classes = useStyles();
  const navigate = useNavigate();
  const contentRef = useRef()

  const { register, handleSubmit, setValue } = useForm();

  const tableHead = [
    "Date",
    "JV#",
    "Particular#",
    "Type",
    "Description",
    "Comments",
    "Debit (AED)",
    "Credit (AED)",
    "Balance (AED)",
   
  ];

  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  // *For Account Ledger
  const [accountLedgers, setAccountLedgers] = useState();

  // *For Accounts
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [TotalBalance, setTotalBalance] = useState();

  let Balance = TotalBalance;

  // *For Accounts
  const [childAccounts, setChildAccounts] = useState([]);
  const [selectedChildAccount, setSelectedChildAccount] = useState(null);

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();

  // *For Handle Date
  const handleFromDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setFromDate("invalid");
        return;
      }
      setFromDate(new Date(newDate));
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
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Account
  const getAccountsDropDown = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        name: search
      };
      const { data } = await FinanceServices.getAccountsDropDown(params);

      setAccounts(data?.accounts?.rows);
    } catch (error) {
      showErrorToast(error);
    }
  };

  // *For Get Account
  const getAccounts = async (accountId) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        primary_account_id: accountId ?? selectedAccount?.id,
      };
      const { data } = await FinanceServices.getAccounts(params);
      setChildAccounts(data?.accounts?.rows);
    } catch (error) {
      showErrorToast(error);
    }
  };
  // *For Get Account Ledger
  const getAccountLedgers = async (page, limit, filter) => {
    setLoading(true);
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
      const { data } = await FinanceServices.getAccountLedgers(params);
      setAccountLedgers(data?.statement?.rows);
      setTotalCount(data?.statement?.count);
      setTotalBalance(data?.statement?.opening_balance_aed);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  // *For Handle Filter
  const handleFilter = () => {
    let data = {
      account_id: selectedChildAccount?.id
        ? selectedChildAccount?.id
        : selectedAccount?.id,
      from_date: fromDate
        ? moment(new Date(fromDate)).format("MM-DD-YYYY")
        : "",
      to_date: toDate ? moment(new Date(toDate)).format("MM-DD-YYYY") : "",
    };
    getAccountLedgers(1, "", data);
  };
  const handleFilterSearch = (data) => {
    Debounce(() => getAccountLedgers(1, "", data));
  };

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Action");
    const data = accountLedgers;
  
    let totalDebit = 0;
    let totalCredit = 0;
    let runningBalance = 0;
  
    const accountNature = data[0]?.account?.nature || "debit"; // default to debit if undefined
  
    const rows = data.map((item) => {
      const debit = parseFloat(item?.debit || 0);
      const credit = parseFloat(item?.credit || 0);
  
      totalDebit += debit;
      totalCredit += credit;
  
      // Update running balance according to account nature
      if (accountNature === "debit") {
        runningBalance += debit - credit;
      } else {
        runningBalance += credit - debit;
      }
  
      return [
        item?.created_at ? moment(item?.created_at).format("MM-DD-YYYY") : "-",
        item?.journal_id ? item?.series_id + item?.journal_id : "-",
        item?.entry?.reference_no ?? "-",
        item?.type?.type_name ?? "-",
        item?.description ?? "-",
        item?.comment ?? "-",
        debit.toFixed(2),
        credit.toFixed(2),
        runningBalance.toFixed(2)
      ];
    });
  
    // Append totals row
    const totalRow = [
      "Total", "", "", "", "", "", 
      totalDebit.toFixed(2),
      totalCredit.toFixed(2),
      
    ];
    rows.push(totalRow);
  
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
    const buf = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  
    saveAs(new Blob([buf]), "General_Ledger.xlsx");
  };
  
  

  useEffect(() => {
    getAccountsDropDown();
  }, []);

  return (
    <Box sx={{ p:3 }}>
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
          General Ledger
        </Typography>
        {accountLedgers?.length > 0 && (
          <Box sx={{
            textAlign: "right", p: 4, display: "flex", gap: 2

          }}>
          
            <PrimaryButton
              title={"Download Excel"}
              onClick={() => downloadExcel()}
            />
          </Box>
        )}
      </Box>

      {/* Filters */}
      <Box >
        <Box component={"form"} onSubmit={handleSubmit(handleFilter)}>
          <Grid container spacing={1} columns={14}>
            <Grid item xs={12} sm={2}>
              <SelectField
                size={"small"}
                onSearch={(v) => getAccountsDropDown(v)}
                label={"Account"}
                options={accounts}
                selected={selectedAccount}
                onSelect={(value) => {
                  setSelectedAccount(value);
                  getAccounts(value?.id);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <SelectField
                disabled={selectedAccount ? false : true}
                size={"small"}
                label={"Child Account"}
                options={childAccounts}
                selected={selectedChildAccount}
                onSelect={(value) => {
                  setSelectedChildAccount(value);
                }}
                register={register("account")}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <InputField
                size={"small"}
                label={"Search"}
                placeholder={"Search"}
                register={register("search", {
                  onChange: (e) => handleFilterSearch({ search: e.target.value }),
                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                disableFuture={true}
                size="small"
                label={"From Date"}
                value={fromDate}
                onChange={(date) => handleFromDate(date)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                disableFuture={true}
                size="small"
                minDate={fromDate}
                label={"To Date"}
                value={toDate}
                onChange={(date) => handleToDate(date)}
              />
            </Grid>
            <Grid item xs={12} sm={1} sx={{ mt: 3.5 }}>
              <PrimaryButton title="Search" type="submit" loading={loading} />
            </Grid>
          </Grid>
        </Box>

        {accountLedgers && (
          <Fragment>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
              fileName="General Ledger"
            >
              <Box className='pdf-show' sx={{ display: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    Vehicle Sales Agreement Reversals
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
                      accountLedgers?.length > 0 ? (
                        <Fragment>
                          {accountLedgers.map((item, index) => {
                            let page = LedgerLinking(item?.entry?.reference_module)
                            const balance =
                              selectedAccount?.nature === "debit"
                                ? (
                                  parseFloat(item?.debit) -
                                  parseFloat(item?.credit)
                                ).toFixed(2)
                                : (
                                  parseFloat(item?.credit) -
                                  parseFloat(item?.debit)
                                ).toFixed(2);
                            Balance += parseFloat(balance);
                            return (
                              <Row
                                key={index}
                                sx={{
                                  bgcolor: index % 2 !== 0 && "#EFF8E7",
                                }}
                              >
                                <Cell className="pdf-table">
                                  {item?.created_at
                                    ? moment(item?.created_at).format("MM-DD-YYYY")
                                    : "-"}
                                </Cell>
                                <Cell className="pdf-table">
                                  {item?.journal_id
                                    ? item?.series_id + item?.journal_id
                                    : "-"}
                                </Cell>
                                <Cell className="pdf-table">{item?.entry?.reference_no ?? "-"}</Cell>
                                <Cell className="pdf-table">{item?.type?.type_name ?? "-"}</Cell>
                                <Cell className="pdf-table">
                                  <Tooltip
                                    className="pdf-hide"
                                    title={item?.description ?? '-'}
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
                                    {item?.description?.length > 24 ? item?.description?.slice(0, 18) : item?.description}
                                  </Tooltip>
                                  <Box
                                    component={"div"}
                                    className='pdf-show'
                                    sx={{ display: "none !important" }}
                                  >
                                    {item?.description ?? '-'}
                                  </Box>
                                </Cell>
                                <Cell className="pdf-table">{item?.comment ?? "-"}</Cell>
                                <Cell className="pdf-table">{parseFloat(item?.debit).toFixed(2)}</Cell>
                                <Cell className="pdf-table">{parseFloat(item?.credit).toFixed(2)}</Cell>
                                <Cell className="pdf-table">{Balance?.toFixed(2)}</Cell>
                                {/* <Cell><Box className="pdf-hide"
                                  onClick={page ? () =>
                                    navigate(`/${page}/${item?.journal_id}`)
                                    : () => {
                                      navigate(`/general-journal-ledger`, { state: item?.series_id + item?.journal_id })
                                    }}
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
                                    <EyeIcon />
                                  </IconButton>

                                </Box></Cell> */}
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
            </PDFExport>
            {/* ========== Pagination ========== */}
            <Pagination
              currentPage={currentPage}
              pageSize={pageLimit}
              onPageSizeChange={(size) => getAccountLedgers(1, size.target.value)}
              tableCount={accountLedgers?.length}
              totalCount={totalCount}
              onPageChange={(page) => getAccountLedgers(page, "")}
            />
          </Fragment>
        )}

        {loader && <CircleLoading />}
      </Box>
    </Box>
  );
}

export default GeneralLedger;
