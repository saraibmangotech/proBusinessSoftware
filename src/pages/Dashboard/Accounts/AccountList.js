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
import { agencyType, Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
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
import ExcelJS from "exceljs";
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

  const tableHead = ['COA Code','Reference Code', 'COA Name',  'Nature', 'Major Category', 'Sub Category', 'Status', 'Actions']

  const [loader, setLoader] = useState(false);

  // *For Accounts List
  const [accounts, setAccounts] = useState();
  const [accounts2, setAccounts2] = useState();

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
  const getAccounts2 = async (page, limit, filter) => {
    // setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = { ...filters, ...filter }
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      let params = {
        page: 1,
        limit: 999999
      }
      params = { ...params, ...Filter }
      const { data } = await FinanceServices.getAccounts(params)
      setAccounts2(data?.accounts?.rows)
    
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }
  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => {getAccounts(1, '', data); getAccounts2(1, '', data)});
    
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
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Account List");

    // Set professional header and footer
    worksheet.headerFooter.oddHeader =
        '&C&"Arial,Bold"&18ACCOUNT LIST\n' +
        '&C&"Arial,Regular"&12Your Company Name\n' +
        '&C&"Arial,Regular"&10Period: &D - &T\n' +
        '&L&"Arial,Regular"&8Generated on: ' +
        new Date().toLocaleDateString() +
        "\n" +
        '&R&"Arial,Regular"&8Page &P of &N';

    worksheet.headerFooter.oddFooter =
        '&L&"Arial,Regular"&8Confidential - Internal Use Only' +
        '&C&"Arial,Regular"&8This report contains financial data as of ' +
        new Date().toLocaleDateString() +
        '&R&"Arial,Regular"&8Generated by: Finance Department\n' +
        '&C&"Arial,Regular"&8Powered by Premium Business Solutions';

    worksheet.headerFooter.evenFooter = worksheet.headerFooter.oddFooter;

    // Set page setup for professional printing
    worksheet.pageSetup = {
        paperSize: 9, // A4
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
            left: 0.7,
            right: 0.7,
            top: 1.0,
            bottom: 1.0,
            header: 0.3,
            footer: 0.5,
        },
    };

    // Add title section at the top of the worksheet
    const titleRow = worksheet.addRow(["ACCOUNT LIST"]);
    titleRow.getCell(1).font = {
        name: "Arial",
        size: 16,
        bold: true,
        color: { argb: "2F4F4F" },
    };
    titleRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A1:G1");

    const companyRow = worksheet.addRow([agencyType[process.env.REACT_APP_TYPE]?.name]);
    companyRow.getCell(1).font = {
        name: "Arial",
        size: 14,
        bold: true,
        color: { argb: "4472C4" },
    };
    companyRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A2:G2");

    const dateRow = worksheet.addRow([
        `Report Generated: ${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})} at ${new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}`,
    ]);
    dateRow.getCell(1).font = {
        name: "Arial",
        size: 10,
        italic: true,
        color: { argb: "666666" },
    };
    dateRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A3:G3");

    // Add empty row for spacing
    worksheet.addRow([]);

    // Define headers and data separately
    const headers = tableHead.filter((item) => item !== "Status" && item !== "Actions");
    const data = accounts2;

    // Add headers with professional styling
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "2F4F4F" }, // Dark slate gray
        };
        cell.font = {
            name: "Arial",
            bold: true,
            color: { argb: "FFFFFF" },
            size: 11,
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
            top: { style: "thin", color: { argb: "000000" } },
            left: { style: "thin", color: { argb: "000000" } },
            bottom: { style: "thin", color: { argb: "000000" } },
            right: { style: "thin", color: { argb: "000000" } },
        };
    });

    // Add data rows
    data.forEach((item, index) => {
        const dataRow = worksheet.addRow([
            item?.account_code ?? '-',
            item?.ref_id ?? '-',
            item?.name ?? '-',
        
            item?.primary_account_id ? 'Sub Account' : 'Primary',
            item?.cat?.name ?? '-',
            item?.sub_cat?.name ?? '-'
        ]);

        // Style data rows
        dataRow.eachCell((cell, colNumber) => {
            cell.font = { name: "Arial", size: 10 };
            cell.alignment = {
                horizontal: "left",
                vertical: "middle",
            };
            cell.border = {
                top: { style: "hair", color: { argb: "CCCCCC" } },
                left: { style: "hair", color: { argb: "CCCCCC" } },
                bottom: { style: "hair", color: { argb: "CCCCCC" } },
                right: { style: "hair", color: { argb: "CCCCCC" } },
            };

            // Highlight account type column with different colors
            if (colNumber === 5) { // Account Type column
                if (cell.value === 'Primary') {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "E8F5E8" }, // Light green for Primary
                    };
                } else if (cell.value === 'Sub Account') {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFF2E8" }, // Light orange for Sub Account
                    };
                }
            }
        });
    });

    // Add summary information
    if (data.length > 0) {
        // Count primary and sub accounts
        const primaryCount = data.filter(item => !item?.primary_account_id).length;
        const subAccountCount = data.filter(item => item?.primary_account_id).length;

        // Add empty row before summary
        worksheet.addRow([]);

        // Add summary rows
        const summaryRow1 = worksheet.addRow([
            "Summary:",
            "",
            "",
            "",
            `Total Accounts: ${data.length}`,
            "",
            ""
        ]);

        const summaryRow2 = worksheet.addRow([
            "",
            "",
            "",
            "",
            `Primary Accounts: ${primaryCount}`,
            "",
            ""
        ]);

        const summaryRow3 = worksheet.addRow([
            "",
            "",
            "",
            "",
            `Sub Accounts: ${subAccountCount}`,
            "",
            ""
        ]);

        // Style summary rows
        [summaryRow1, summaryRow2, summaryRow3].forEach(row => {
            row.eachCell((cell, colNumber) => {
                if (colNumber === 1 || colNumber === 5) {
                    cell.font = {
                        name: "Arial",
                        bold: colNumber === 1,
                        size: 10,
                        color: { argb: "2F4F4F" },
                    };
                }
            });
        });
    }

    // Set column widths
    worksheet.columns = [
        { width: 15 }, // Account Code
        { width: 12 }, // Ref ID
        { width: 25 }, // Name
        { width: 12 }, // Unit
        { width: 15 }, // Account Type
        { width: 20 }, // Category
        { width: 20 }, // Sub Category
    ];

    // Add workbook properties
    workbook.creator = "Finance Department";
    workbook.lastModifiedBy = "Finance System";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    // Set workbook properties
    workbook.properties = {
        title: "Account List",
        subject: "Financial Report",
        keywords: "account list, chart of accounts, financial, accounting",
        category: "Financial Reports",
        description: "Account list report generated from accounting system",
        company: "Your Company Name",
    };

    // Add empty rows for spacing before footer
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Add the electronically generated report text with black border
    const reportRow = worksheet.addRow(["This is electronically generated report"]);
    reportRow.getCell(1).font = {
        name: "Arial",
        size: 12,
        bold: false,
        color: { argb: "000000" },
    };
    reportRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    reportRow.getCell(1).border = {
        top: { style: "medium", color: { argb: "000000" } },
        left: { style: "medium", color: { argb: "000000" } },
        bottom: { style: "medium", color: { argb: "000000" } },
        right: { style: "medium", color: { argb: "000000" } },
    };
    worksheet.mergeCells(`A${reportRow.number}:G${reportRow.number}`);

    // Add powered by line
    const poweredByRow = worksheet.addRow(["Powered by : MangotechDevs.ae"]);
    poweredByRow.getCell(1).font = {
        name: "Arial",
        size: 10,
        italic: true,
        color: { argb: "666666" },
    };
    poweredByRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells(`A${poweredByRow.number}:G${poweredByRow.number}`);

    // Add empty row for spacing
    worksheet.addRow([]);

    const download = async () => {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
        });
        saveAs(blob, `Account_List_${moment().format("MM-DD-YYYY")}.xlsx`);
    };
    download();
};

  useEffect(() => {
    getAccounts()
    getAccounts2()
    getMajorCategories()
    getSubCategories()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Account List</Typography>
                <Box sx={{ display: 'flex', gap: '5px' }} >

                    {permissions?.create && <PrimaryButton
                       bgcolor={'#001f3f'}
                        title="Create Account"
                        onClick={() => navigate('/create-account')}
                     
                    />}
                    

                </Box>

            </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mr: 4,
          my: 4,
        }}
      >
       
        {accounts?.length > 0 && (
          <Box sx={{
            p: 4, display: "flex", gap: 2,
            justifyContent:'flex-end'

          }}>
        
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
                              {item?.ref_id ?? '-'}
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
                                {true &&
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