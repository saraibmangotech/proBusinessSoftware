import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid, InputLabel,
  FormControl,
  Select,
  MenuItem,
  ListItemText,
  Tooltip,
  Checkbox,
  InputAdornment,
} from '@mui/material';
import { AllocateIcon, CheckIcon, EyeIcon, FontFamily, Images, MessageIcon, PendingIcon, RequestBuyerIdIcon } from 'assets';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import FinanceStatusDialog from 'components/Dialog/FinanceStatusDialog';
import AllocateStatusDialog from 'components/Dialog/AllocateStatusDialog';
import AllocateDialog from 'components/Dialog/AllocateDialog';
import CustomerServices from 'services/Customer';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { Debounce, encryptData, formatPermissionData, handleExportWithComponent } from 'utils';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { addPermission } from 'redux/slices/navigationDataSlice';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import { PrimaryButton } from 'components/Buttons';
import SelectField from 'components/Select';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';
import CommissionServices from 'services/Commission';
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import { adjustSectionValue } from '@mui/x-date-pickers/internals/hooks/useField/useField.utils';
import SystemServices from 'services/System';
import LockIcon from '@mui/icons-material/Lock';
import UserServices from 'services/User';

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

function UserList() {
  const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const contentRef = useRef(null);


  const tableHead = [{ name: 'Create Date', key: '' }, { name: 'User Name ', key: 'name' },{ name: 'Employee ID', key: 'employee_id' }, { name: 'User Role', key: '' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]





  const [loader, setLoader] = useState(false);

  const [sort, setSort] = useState('asc')


  // *For Customer Queue
  const [UserList, setUserList] = useState([]);



  // *For setPermissions
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState(false)

  const [itemAmount, setItemAmount] = useState()

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false)
  const [selectedID, setSelectedID] = useState()

  // *For Get Customer Queue
  const getUserRole = async (page, limit, filter) => {
    setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = filter ?  { ...filters, ...filter } : null;
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      let params = {
        page: Page,
        limit: Limit,
      }
      params = { ...params, ...Filter }

      const { data } = await UserServices.getUsers(params)
      setUserList(data?.users?.rows)
      setTotalCount(data?.users?.count)
      console.log(formatPermissionData(data?.permissions)) 
      setPermissions(formatPermissionData(data?.permissions))
      data?.permissions.forEach(e => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      })

    } catch (error) {
      showErrorToast(error)
    } finally {
    setLoader(false)
    }
  }


  // *For Create Role
  const handleStatus = async (status) => {
    setLoading(true)

    try {
      let obj = {
        id: selectedID,
        is_active:status
      }


      console.log(obj);
      const promise = UserServices.updateUser(obj);

      showPromiseToast(
        promise,
        'Saving ...',
        'Success',
        'Something Went Wrong'
      );
      const response = await promise;
      if (response?.responseCode === 200) {
        getUserRole()
        setDeleteDialog(false)
      }


    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoading(false)
    }
  }









  // *For Handle Filter
  const handleFilter = () => {
    let data = {
      search: getValues('search')
    }
    Debounce(() => getUserRole(1, '', data));
  }

  const handleSort = (key) => {
    let data = {
      sort_by: key,
      sort_order: sort
    }
    Debounce(() => getUserRole(1, '', data));
  }




  useEffect(() => {
    getUserRole()
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <SimpleDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        title={'Are You Sure?'}
      >

        <Grid container spacing={2}>


          <Grid container sx={{ justifyContent: 'center' }}>
            <Grid item xs={6} sm={6} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', gap: '25px' }}>
              <PrimaryButton bgcolor={Colors.primary} title="Activate" onClick={() => handleStatus(true)} />
              <PrimaryButton onClick={() => handleStatus(false)} bgcolor={'#FF1F25'} title="Deactivate" />
            </Grid>
          </Grid>

        </Grid>

      </SimpleDialog>



      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>User Management</Typography>
        {true && <PrimaryButton
         bgcolor={'#001f3f'}
          title="Create User"
          onClick={() => navigate('/create-user')}
          loading={loading}
        />}


      </Box>

      {/* Filters */}
      <Box >
        <Grid container spacing={2}>
          <Grid item xs={6} >
            <LabelCustomInput type={'text'} bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'Search'} placeholder={'Search'} register={register("search")} />
          </Grid>
          {/* <Grid item xs={3} >
                        <LabelCustomInput type={'text'} bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'By Customers'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid>
                    <Grid item xs={3} >
                        <LabelCustomInput bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'By Commission'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid>
                    <Grid item xs={3} >
                        <LabelCustomInput bgcolor={'#FAFAFA'} color={Colors.primary} border={'2px solid #FAFAFA'} StartLabel={'By Date'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid> */}
          <Grid item xs={6} display={'flex'} justifyContent={'flex-end'} gap={2} >
            <PrimaryButton
             bgcolor={"#0076bf"}
             textcolor={Colors.white}
              // border={`1px solid ${Colors.primary}`}
              title="Reset"
              onClick={() => {setValue('search', ''); getUserRole(1,'',null);  }}
              loading={loading}
            />
            <PrimaryButton
             bgcolor={'#001f3f'}
              title="Search"
              onClick={() => handleFilter()}
              loading={loading}
            />
          </Grid>
        </Grid>

        <Grid item md={11}>
          {UserList && <Box>

            <Grid container mb={2} >

            </Grid>



            {(
               (
                <Fragment>
                  <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName='Import Customers' >

                    <TableContainer
                      component={Paper}
                      sx={{
                        maxHeight: 'calc(100vh - 200px)', mt: 5, backgroundColor: 'transparent', boxShadow: 'none !important', borderRadius: '0px !important'

                      }}

                    >
                      <Table stickyHeader sx={{ minWidth: 500 }}>
                        <TableHead>

                          <Row>
                            {tableHead.map((cell, index) => (
                              <Cell style={{ textAlign: 'left !important' }} className="pdf-table"
                                key={index}

                              >
                                <Box >
                                  {cell?.name}
                                </Box>
                              </Cell>
                            ))}
                          </Row>
                        </TableHead>
                        <TableBody>
                          {UserList.map((item, index) => {

                            return (
                              <Row
                                key={index}
                                sx={{
                                  border: '1px solid #EEEEEE !important',
                                }}
                              >

                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                  {moment(item?.created_at).format('MM-DD-YYYY')}
                                </Cell>
                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                  {item?.name}
                                </Cell>

                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                  {item?.employee_id}
                                </Cell>

                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                  {item?.role?.name}


                                </Cell>
                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                  <Box component={'div'} onClick={() => { 
                                    if(permissions?.status_update){
                                      setDeleteDialog(true); setSelectedID(item?.id)
                                    }
                                     }} sx={{ cursor: 'pointer', display: 'flex !important', justifyContent: 'flex-start !important' }}>
                                    <Box component={'img'} src={item?.is_active ? Images.successIcon : Images.errorIcon} width={'13px'}></Box>
                                    {item?.is_active ? "Activated" : 'Deactivated'}
                                  </Box>


                                </Cell>
                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                  <Box sx={{ display: 'flex !important', justifyContent: 'flex-start !important' }}>

                                    {true && <Box component={'img'} src={Images.editIcon} onClick={() => navigate(
                                      `/update-user`,
                                      { state: item }
                                    )} width={'35px'}></Box>}


                                  </Box>
                                </Cell>




                              </Row>

                            );
                          })}

                        </TableBody>
                      </Table>
                    </TableContainer>
                  </PDFExport>
                  {/* ========== Pagination ========== */}
                  <Pagination
                    currentPage={currentPage}
                    pageSize={pageLimit}
                    onPageSizeChange={(size) => getUserRole(1, size.target.value)}
                    tableCount={UserList?.length}
                    totalCount={totalCount}
                    onPageChange={(page) => getUserRole(page, "")}
                  />

                </Fragment>
              )
            )}


            {loader && <CircleLoading />}


          </Box>}





        </Grid>
      </Box>

    </Box>
  );
}

export default UserList;