import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Grid } from '@mui/material';
import styled from '@emotion/styled';
import { FontFamily, Images } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster } from 'components/Toaster';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Debounce, handleExportWithComponent } from 'utils';
import SelectField from 'components/Select';
import FinanceServices from 'services/Finance';
import { PrimaryButton } from 'components/Buttons';
import CustomerServices from 'services/Customer';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    border: 0,
    padding: '15px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    background: Colors.primary,
    color: Colors.white
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    textAlign: 'center',
    textWrap: 'nowrap',
    padding: '5px !important',

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
      height: '24px'
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
    display: 'flex',
    height: 100,
    '& svg': {
      width: '40px !important',
      height: '40px !important'
    }
  }
})

function CustomerAccountList() {

  const classes = useStyles();
  const navigate = useNavigate();
  const contentRef = useRef()

  const { register, handleSubmit, formState: { errors } } = useForm();

  const tableHead = ['COA Code', 'COA Name', 'Unit', 'Nature', 'Major Category', 'Sub Category', 'Currency', 'FCY Balance', 'LCY Balance', 'Action']

  const [loader, setLoader] = useState(false);

  // *For Customer Drop Down
  const [customerDropDown, setCustomerDropDown] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // *For Accounts List
  const [accounts, setAccounts] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Get Customer Dropdown
  const getCustomerDropDown = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        name: search
      }
      const { data } = await CustomerServices.getCustomerDropDown(params)
      setCustomerDropDown(data?.customers?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const sortData = (e, type, item) => {
    e.preventDefault();



    if (type === "ascending" && item == "COA Code") {
      const sortedData = [...accounts].sort((a, b) => {
        // Use the localeCompare method for string comparison

        return a.account_code.localeCompare(b.account_code);
      });

      setAccounts(sortedData);
    }


    if (type === "descending" && item == "COA Code") {
      const sortedData = [...accounts].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.account_code.localeCompare(a.account_code);
      });

      setAccounts(sortedData);
    }

    if (type === "ascending" && item == "COA Name") {
      const sortedData = [...accounts].sort((a, b) => {
        // Use the localeCompare method for string comparison

        return a.name.localeCompare(b.name);
      });

      setAccounts(sortedData);
    }

    if (type === "descending" && item == "COA Name") {
      const sortedData = [...accounts].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.name.localeCompare(a.name);
      });

      setAccounts(sortedData);
    }

    if (type === "ascending" && item == "Unit") {
      const sortedData = [...accounts].sort((a, b) => {
        // Use the localeCompare method for string comparison

        return a.unit.localeCompare(b.unit);
      });

      setAccounts(sortedData);
    }

    if (type === "descending" && item == "Unit") {
      const sortedData = [...accounts].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.unit.localeCompare(a.unit);
      });

      setAccounts(sortedData);
    }

    if (type === "ascending" && item == "Major Category") {
      const sortedData = [...accounts].sort((a, b) => {
        // Use the localeCompare method for string comparison

        return a.cat?.name.localeCompare(b.cat?.name);
      });

      setAccounts(sortedData);
    }

    if (type === "descending" && item == "Major Category") {
      const sortedData = [...accounts].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.cat?.name.localeCompare(a.cat?.name);
      });

      setAccounts(sortedData);
    }

    if (type === "ascending" && item == "Sub Category") {
      const sortedData = [...accounts].sort((a, b) => {
        // Use the localeCompare method for string comparison

        return a.sub_cat?.name.localeCompare(b.sub_cat?.name);
      });

      setAccounts(sortedData);
    }


    if (type === "descending" && item == "Sub Category") {
      const sortedData = [...accounts].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.sub_cat?.name.localeCompare(a.sub_cat?.name);
      });

      setAccounts(sortedData);
    }

    if (type === "ascending" && item == "Currency") {
      const sortedData = [...accounts].sort((a, b) => {
        // Use the localeCompare method for string comparison

        return a.currency.localeCompare(b.currency);
      });

      setAccounts(sortedData);
    }

    if (type === "descending" && item == "Currency") {
      const sortedData = [...accounts].sort((a, b) => {
        // Use the localeCompare method for string comparison
        return b.currency.localeCompare(a.currency);
      });

      setAccounts(sortedData);
    }


  };


  // *For Get Account
  const getAccounts = async (page, limit, filter) => {
    setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = { ...filters, ...filter }
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      let params = {
        page: Page,
        limit: Limit
      }
      params = { ...params, ...Filter }
      const { data } = await FinanceServices.getAccounts(params)
      setAccounts(data?.accounts?.rows)
      setTotalCount(data?.accounts?.count)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Handle Filter
  const handleFilter = () => {
    let filter = {
      user_id: selectedCustomer?.id
    }
    Debounce(() => getAccounts(1, '', filter));
  }

  const downloadExcel = () => {
    // Define headers and data separately
    const headers = tableHead.filter((item) => item !== "Action");
    const data = accounts;
    // Extract values from objects and create an array for each row
    const rows = data.map((item, index) => {
      const FCYAmount = item?.total_credit_cur ? item?.nature === 'credit'
        ? (parseFloat(item?.total_credit_cur) - parseFloat(item?.total_debit_cur))
        : (parseFloat(item?.total_debit_cur) - parseFloat(item?.total_credit_cur)) : 0
      const LCYAmount = item?.total_credit ? item?.nature === 'credit'
        ? (parseFloat(item?.total_credit) - parseFloat(item?.total_debit))
        : (parseFloat(item?.total_debit) - parseFloat(item?.total_credit)) : 0
      return [
        item?.account_code ?? '-',
        item?.name ?? '-',
        item?.unit ?? '-',
        item?.primary_account_id ? 'Sub Account' : 'Primary',
        item?.cat?.name ?? '-',
        item?.sub_cat?.name ?? '-',
        item?.currency ?? '-',
        parseFloat(FCYAmount).toFixed(2),
        parseFloat(LCYAmount).toFixed(2)
      ]
    });

    // Create a workbook with a worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
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
    getCustomerDropDown()
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
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
          Customerwise Account
        </Typography>
        {accounts?.length > 0 && (
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
      <Box component={'form'} onSubmit={handleSubmit(handleFilter)}>
        <Grid container spacing={1} alignItems="center" columns={15}>
          <Grid item xs={12} sm={4}>
            <SelectField
              size={'small'}
              onSearch={(v) => getCustomerDropDown(v)}
              label={'Customer'}
              options={customerDropDown}
              selected={selectedCustomer}
              onSelect={(value) => setSelectedCustomer(value)}
              error={errors?.customer?.message}
              register={register("customer", {
                required: 'Please select customer.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3} sx={{ mt: 1 }}>
            <PrimaryButton
              title="Search"
              type='submit'
              loading={loader}
            />
          </Grid>
        </Grid>
      </Box>

      {accounts &&
        <Fragment>
          <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
            fileName="Customerwise Account"
          >
            <Box className='pdf-show' sx={{ display: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                  Customerwise Account
                </Typography>
                <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
              </Box>
            </Box>
            {/* ========== Table ========== */}
            <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }} className='table-box'>
              <Table stickyHeader sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow>
                    {tableHead.map((item, index) => (
                      <Cell className="pdf-table" key={index}>{item} {tableHead[index] == "FCY Balance" || tableHead[index] == "LCY Balance" || tableHead[index] == "Nature" || tableHead[index] == "Action" ? '' : <> <span className='pdf-hide'> <ArrowUpwardIcon sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "ascending", tableHead[index])} /></span> <span className='pdf-hide'> <ArrowDownwardIcon sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "descending", tableHead[index])} /> </span> </>}</Cell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loader ? (
                    accounts?.length > 0 ? (
                      <Fragment>
                        {accounts.map((item, index) => {
                          const FCYAmount = item?.total_credit_cur ? item?.nature === 'credit' ? (parseFloat(item?.total_credit_cur) - parseFloat(item?.total_debit_cur)) : (parseFloat(item?.total_debit_cur) - parseFloat(item?.total_credit_cur)) : 0
                          const LCYAmount = item?.total_credit ? item?.nature === 'credit' ? (parseFloat(item?.total_credit) - parseFloat(item?.total_debit)) : (parseFloat(item?.total_debit) - parseFloat(item?.total_credit)) : 0
                          return (
                            <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                              <Cell className="pdf-table" >
                                {item?.account_code ?? '-'}
                              </Cell>
                              <Cell className="pdf-table" >
                                {item?.name ?? '-'}
                              </Cell>
                              <Cell className="pdf-table" >
                                {item?.unit ?? '-'}
                              </Cell>
                              <Cell className="pdf-table" >
                                {item?.primary_account_id ? 'Sub Account' : 'Primary'}
                              </Cell>
                              <Cell className="pdf-table" >
                                {item?.cat?.name ?? '-'}
                              </Cell>
                              <Cell className="pdf-table" >
                                {item?.sub_cat?.name ?? '-'}
                              </Cell>
                              <Cell className="pdf-table" >
                                {item?.currency ?? '-'}
                              </Cell>
                              <Cell className="pdf-table" >
                                {parseFloat(FCYAmount).toFixed(2)}
                              </Cell>
                              <Cell className="pdf-table" >
                                {parseFloat(LCYAmount).toFixed(2)}
                              </Cell>
                              <Cell>
                                <Box component={'div'} className='pdf-hide' sx={{ gap: '16px !important' }}>
                                  <Box onClick={() => navigate(`/customer-account-ledger/${item?.id}`, { state: item })}>
                                    <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                                      <Box component={'img'} src={Images.ledgerIcon} sx={{ height: '16px', objectFit: 'contain' }} />
                                    </IconButton>
                                    <Typography variant="body2">
                                      View
                                    </Typography>
                                  </Box>
                                </Box>
                              </Cell>
                            </Row>
                          )
                        })}
                      </Fragment>
                    ) : (
                      <Row>
                        <Cell colSpan={tableHead.length + 1} align="center" sx={{ fontWeight: 600 }}>
                          No Data Found
                        </Cell>
                      </Row>
                    )) : (
                    <Row>
                      <Cell colSpan={tableHead.length + 2} align="center" sx={{ fontWeight: 600 }}>
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
            onPageSizeChange={(size) => getAccounts(1, size.target.value)}
            tableCount={accounts?.length}
            totalCount={totalCount}
            onPageChange={(page) => getAccounts(page, '')}
          />

        </Fragment>
      }

      {loader && <CircleLoading />}

    </Box>
  );
}

export default CustomerAccountList;