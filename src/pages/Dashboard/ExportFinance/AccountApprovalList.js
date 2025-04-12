import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid } from '@mui/material';
import styled from '@emotion/styled';
import { CheckIcon, FontFamily, PendingIcon } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { Delete, Edit } from '@mui/icons-material';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { useNavigate } from 'react-router-dom';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
import SelectField from 'components/Select';
import ExportFinanceServices from 'services/ExportFinance';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { PrimaryButton } from "components/Buttons";
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

function AccountApprovalList() {

  const classes = useStyles();
  const contentRef = useRef(null);
  const { register } = useForm();

  const tableHead = ['COA Code', 'COA Name', 'Unit', 'Nature', 'Major Category', 'Sub Category', 'Status']

  const [loader, setLoader] = useState(false);

  // *For Dialog Box
  const [approvalRequestDialog, setApprovalRequestDialog] = useState(false);

  // *For Accounts List
  const [accounts, setAccounts] = useState();
  const [accountId, setAccountId] = useState('');

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Permissions
  const [permissions, setPermissions] = useState();

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Major Categories
  const [majorCategories, setMajorCategories] = useState([]);
  const [selectedMajorCategory, setSelectedMajorCategory] = useState(null);

  // *For Sub Categories
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  // *For Accounts
  const [accountBalance, setAccountBalance] = useState();
  const [balanceDate, setBalanceDate] = useState();

  // *For Get Major Categories
  const getMajorCategories = async () => {
    try {
      const { data } = await ExportFinanceServices.getMajorCategories()
      setMajorCategories(data?.categories)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Sub Categories
  const getSubCategories = async (id) => {
    try {
      let params = {
        category_id: id ?? ''
      }
      const { data } = await ExportFinanceServices.getSubCategories(params)
      setSubCategories(data?.categories)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Account Approval
  const getAccountsApprovals = async (page, limit, filter) => {
    // setLoader(true)
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
      const { data } = await ExportFinanceServices.getAccountsApprovals(params)
      setAccounts(data?.accounts?.rows)
      setTotalCount(data?.accounts?.count)
      setPermissions(formatPermissionData(data?.permissions))
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getAccountsApprovals(1, '', data));
  }

  // *For Handle Status Action
  const handleStatusAction = (data) => {
    if (true && data?.is_approved === false) {
      setApprovalRequestDialog(true);
      setAccountId(data?.id)
      setAccountBalance(data?.opening_balance)
      setBalanceDate(data?.balance_date)
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

  };

  // *For Approve Account
  const approveAccount = async () => {
    console.log('sdasdasdasasda');
    try {
      let obj = {
        id: accountId,
        opening_balance: accountBalance,
        balance_date: balanceDate
      }
      const { message } = await ExportFinanceServices.approveAccount(obj)
      SuccessToaster(message)
      setApprovalRequestDialog(false)
      getAccountsApprovals()
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Status" && item !== "Actions");
    const rows = accounts?.map((item) => [
      item?.account_code ?? '-',
      item?.name ?? '-',
      item?.unit ?? '-',
      item?.primary_account_id ? 'Sub Account' : 'Primary',
      item?.cat?.name ?? '-',
      item?.sub_cat?.name ?? '-'
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
    getAccountsApprovals()
    getMajorCategories()
    getSubCategories()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>

      {/* ========== Confirmation Dialog ========== */}
      <ConfirmationDialog open={approvalRequestDialog} onClose={() => setApprovalRequestDialog(false)} message={'Are you sure you want to approve this account?'} action={() => approveAccount()} />
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
          Account Approval List
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
      <Grid container spacing={1}>
        <Grid item xs={12} sm={3}>
          <InputField
            size={'small'}
            label={'Code'}
            placeholder={'Search Code'}
            register={register('code', {
              onChange: (e) => handleFilter({ code: e.target.value })
            })}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <InputField
            size={'small'}
            label={'Name'}
            placeholder={'Search Name'}
            register={register('name', {
              onChange: (e) => handleFilter({ name: e.target.value })
            })}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SelectField
            size={'small'}
            label={'Major Category'}
            options={majorCategories}
            selected={selectedMajorCategory}
            onSelect={(value) => { setSelectedMajorCategory(value); handleFilter({ category: value?.id, sub_category: '' }); getSubCategories(value?.id); setSelectedSubCategory(null) }}
            register={register("majorCategory")}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SelectField
            size={'small'}
            label={'Sub Category'}
            options={subCategories}
            selected={selectedSubCategory}
            onSelect={(value) => { setSelectedSubCategory(value); handleFilter({ sub_category: value?.id }) }}
            register={register("subCategory")}
          />
        </Grid>
      </Grid>

      {accounts ? (
        <Fragment>

          <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
            fileName="Account Approval List"
          >
            <Box className='pdf-show' sx={{ display: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                  Account Approval List
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
                      <Cell className="pdf-table" key={index}>{item} {tableHead[index] == "Status" || tableHead[index] == "Actions" || tableHead[index] == "Nature" ? '' : <> <span className='pdf-hide'><ArrowUpwardIcon sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "ascending", tableHead[index])} /> </span> <span className='pdf-hide'> <ArrowDownwardIcon sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "descending", tableHead[index])} /> </span> </>}</Cell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loader ? (
                    accounts?.length > 0 ? (
                      <Fragment>
                        {accounts.map((item, index) => (
                          <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                            <Cell className="pdf-table">
                              {item?.account_code ?? '-'}
                            </Cell>
                            <Cell className="pdf-table">
                              {item?.name ?? '-'}
                            </Cell>
                            <Cell className="pdf-table">
                              {item?.unit ?? '-'}
                            </Cell>
                            <Cell className="pdf-table">
                              {item?.primary_account_id ? 'Sub Account' : 'Primary'}
                            </Cell>
                            <Cell className="pdf-table">
                              {item?.cat?.name ?? '-'}
                            </Cell>
                            <Cell className="pdf-table">
                              {item?.sub_cat?.name ?? '-'}
                            </Cell>
                            <Cell className="pdf-table">
                              <Box sx={{ cursor: item?.is_approved === false && 'pointer', 'path': { fill: item?.is_approved ? Colors.success : Colors.danger } }}
                                onClick={() => handleStatusAction(item)}
                              >
                                <span className='pdf-hide'>  {item?.is_approved ? <CheckIcon /> : <PendingIcon />}</span>
                                <Typography variant="body2">
                                  {item?.is_approved ? 'Approved' : 'Pending'}
                                </Typography>
                              </Box>
                            </Cell>
                          </Row>
                        ))}
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
            onPageSizeChange={(size) => getAccountsApprovals(1, size.target.value)}
            tableCount={accounts?.length}
            totalCount={totalCount}
            onPageChange={(page) => getAccountsApprovals(page, '')}
          />

        </Fragment>
      ) : (
        <CircleLoading />
      )}

    </Box>
  );
}

export default AccountApprovalList;