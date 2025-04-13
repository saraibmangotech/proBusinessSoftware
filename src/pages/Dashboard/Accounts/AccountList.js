import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Grid, InputAdornment } from '@mui/material';
import styled from '@emotion/styled';
import { FontFamily, SearchIcon } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { Edit } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { useNavigate } from 'react-router-dom';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
import SelectField from 'components/Select';
import FinanceServices from 'services/Finance';
import { PrimaryButton, SwitchButton } from 'components/Buttons';
import { addPermission } from 'redux/slices/navigationDataSlice';
import { useDispatch } from "react-redux";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';
import toast from 'react-hot-toast';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';

// *For Table Style
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
    display: 'flex',
    height: 100,
    '& svg': {
      width: '40px !important',
      height: '40px !important'
    }
  }
})

function AccountList() {

  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const contentRef = useRef()

  const { register } = useForm();

  const tableHead = ['COA Code', 'COA Name',  'Nature', 'Major Category', 'Sub Category', 'Status', 'Actions']

  const [loader, setLoader] = useState(false);

  // *For Accounts List
  const [accounts, setAccounts] = useState();

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

  // *For Get Major Categories
  const getMajorCategories = async () => {
    try {
      const { data } = await FinanceServices.getMajorCategories()
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
      const { data } = await FinanceServices.getSubCategories(params)
      setSubCategories(data?.categories)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Account
  const getAccounts = async (page, limit, filter) => {
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
      const { data } = await FinanceServices.getAccounts(params)
      setAccounts(data?.accounts?.rows)
      setTotalCount(data?.accounts?.count)
      console.log(formatPermissionData(data?.permissions));
      
      setPermissions(formatPermissionData(data?.permissions))
      data?.permissions.forEach((e) => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      });
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getAccounts(1, '', data));
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


  // *For Update Account Status
  const updateAccountStatus = async (id, status) => {
    const shallowCopy = [...accounts];
    let accountIndex = shallowCopy.findIndex(item => item.id == id);

    if (accountIndex != -1) {
      shallowCopy[accountIndex].is_active = status;
    }

    setAccounts(shallowCopy)


    try {
      let obj = {
        id: id,
        is_active: status
      }
      const { message } = await FinanceServices.updateAccount(obj)
    
      const promise = FinanceServices.updateAccount(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );


      // getAccounts()
    } catch (error) {
      showErrorToast(error)
    }
  }

  const downloadExcel = () => {
    // Define headers and data separately
    const headers = tableHead.filter((item) => item !== "Status" && item !== "Actions");
    const data = accounts;
    // Extract values from objects and create an array for each row
    const rows = data.map((item, index) => [
      item?.account_code ?? '-',
      item?.name ?? '-',
      item?.unit ?? '-',
      item?.primary_account_id ? 'Sub Account' : 'Primary',
      item?.cat?.name ?? '-',
      item?.sub_cat?.name ?? '-'
    ]);

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
    getAccounts()
    getMajorCategories()
    getSubCategories()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Account List</Typography>
                <Box sx={{ display: 'flex', gap: '5px' }} >

                    {permissions?.create && <PrimaryButton
                       bgcolor={'#bd9b4a'}
                        title="Create Account"
                        onClick={() => navigate('/create-account')}
                     
                    />}
                    

                </Box>

            </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mr: 4,
          my: 4,
        }}
      >
       
        {/* {accounts?.length > 0 && (
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
        )} */}
      </Box>

      {/* Filters */}
      <Grid container spacing={1}>
        <Grid item xs={12} sm={3}>
          <InputField
            size={'small'}
           
            label={'Code'}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
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
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
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
            fileName="Chart Of Accounts Status"
          >
            <Box className='pdf-show' sx={{ display: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                  Chart Of Accounts Status
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
                      <Cell className='pdf-table' key={index}>{item} {tableHead[index] == "Status" || tableHead[index] == "Actions" || tableHead[index] == "Nature" ? '' : <> <span className='pdf-hide'><ArrowUpwardIcon sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "ascending", tableHead[index])} /> </span>  <span className='pdf-hide'><ArrowDownwardIcon sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "descending", tableHead[index])} /> </span> </>}</Cell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loader ? (
                    accounts?.length > 0 ? (
                      <Fragment>
                        {accounts.map((item, index) => (
                          <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                            <Cell className='pdf-table'>
                              {item?.account_code ?? '-'}
                            </Cell>
                            <Cell className='pdf-table'>
                              {item?.name ?? '-'}
                            </Cell>
                           
                            <Cell className='pdf-table'>
                              {item?.primary_account_id ? 'Sub Account' : 'Primary'}
                            </Cell>
                            <Cell className='pdf-table'>
                              {item?.cat?.name ?? '-'}
                            </Cell>
                            <Cell className='pdf-table'>
                              {item?.sub_cat?.name ?? '-'}
                            </Cell>
                            <Cell className='pdf-table'>
                              <Box component={'div'} className='pdf-hide'>
                                <SwitchButton

                                  isChecked={item?.is_active}
                                  setIsChecked={() =>  updateAccountStatus(item.id, !item?.is_active)}
                                />

                              </Box>
                              <Box component={'div'} className='pdf-show' sx={{ display: 'none !important' }} >
                                {item?.is_active ? 'Enable' : "Disabled"}
                              </Box>
                            </Cell>
                            <Cell>
                              <Box component={'div'} className='pdf-hide' sx={{ gap: '16px !important' }}>
                                {permissions?.update &&
                                  <Box onClick={() => navigate('/update-account', { state: item })}>
                                    <IconButton sx={{ bgcolor: Colors.bluishCyan, '&:hover': { bgcolor: Colors.bluishCyan } }}>
                                      <Edit sx={{ color: Colors.white, height: '16px !important' }} />
                                    </IconButton>
                                    <Typography variant="body2">
                                      Edit
                                    </Typography>
                                  </Box>
                                }
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
            onPageSizeChange={(size) => getAccounts(1, size.target.value)}
            tableCount={accounts?.length}
            totalCount={totalCount}
            onPageChange={(page) => getAccounts(page, '')}
          />

        </Fragment>
      ) : (
        <CircleLoading />
      )}

    </Box>
  );
}

export default AccountList;