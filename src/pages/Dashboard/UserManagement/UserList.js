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
import VpnKeyIcon from '@mui/icons-material/VpnKey';
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
import { PrimaryButton, SwitchButton } from 'components/Buttons';
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
import FinanceServices from 'services/Finance';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';


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
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
    setValue: setValue2,
    getValues: getValues2,
    reset: reset2,
    watch: watch2
  } = useForm();
  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [statusDialog, setStatusDialog] = useState(false)
  const [statusDialog2, setStatusDialog2] = useState(false)
  const [selectedData, setSelectedData] = useState(null)
  const [tableLoader, setTableLoader] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [inputError, setInputError] = useState(false)
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const tableHead = [{ name: 'Create Date', key: '' }, { name: 'User Name ', key: 'name' }, { name: 'Employee ID', key: 'employee_id' }, { name: 'User Role', key: '' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]





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
  const password = watch2("password")
  const [loading, setLoading] = useState(false)
  const [selectedID, setSelectedID] = useState()
  const UpdateStatus2 = async () => {
    try {
      let obj = {
        user_id: selectedData?.id,
        password: getValues2('password'),

      };

      const promise = CustomerServices.updateEmployeePassword(obj);
      console.log(promise);

      showPromiseToast(
        promise,
        "Saving...",
        "Added Successfully",
        "Something Went Wrong"
      );

      // Await the promise and then check its response
      const response = await promise;
      if (response?.responseCode === 200) {
        setStatusDialog2(false);

        getUserRole();
        reset2()
      }
    } catch (error) {
      console.log(error);
    }
  };
  // *For Get Customer Queue
  const getUserRole = async (page, limit, filter) => {
    setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = filter ? { ...filters, ...filter } : null;
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

  const handleDelete = async (item) => {
    try {
      let params = { user_id: selectedData?.id }
      const { message } = await CustomerServices.deleteUser(params)
      SuccessToaster(message);
      getUserRole()
    } catch (error) {
      showErrorToast(error)
    } finally {
      // setLoader(false)
    }
  }


  // *For Create Role
  const handleStatus = async (status) => {
    setLoading(true)

    try {
      let obj = {
        id: selectedID,
        is_active: status
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





  // *For Update Account Status
  const updateAccountStatus = async (id, status) => {
    const shallowCopy = [...UserList];
    let accountIndex = shallowCopy.findIndex(item => item.id == id);

    if (accountIndex != -1) {
      shallowCopy[accountIndex].is_active = status;
    }

    setUserList(shallowCopy)


    try {
      let obj = {
        id: id,
        is_active: status
      }


      const promise = UserServices.updateUser(obj);

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
      <ConfirmationDialog
        open={confirmationDialog}
        onClose={() => setConfirmationDialog(false)}
        message={"Are You Sure?"}
        action={() => {
          setConfirmationDialog(false);
          handleDelete()
        }}
      />
      <SimpleDialog open={statusDialog2} onClose={() => setStatusDialog2(false)} title={"Change Password?"}>
        <Box component="form" onSubmit={handleSubmit2(UpdateStatus2)}>
          <Grid container spacing={2}>

            <Grid item xs={12} sm={12}>
              <InputField
                size="small"
                label="Password :*"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <Visibility color="primary" /> : <VisibilityOff color="primary" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={errors2.password?.message || (inputError && "You have entered an invalid email or password.")}
                register={register2("password", {
                  required: "Please enter the password.",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <InputField
                size="small"
                label="Confirm Password :*"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter Your Confirm Password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <Visibility color="primary" /> : <VisibilityOff color="primary" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={
                  errors2.confirmpassword?.message || (inputError && "You have entered an invalid email or password.")
                }
                register={register2("confirmpassword", {
                  required: "Please enter the confirm password.",
                  validate: (value) => value === password || "Passwords do not match.",
                })}
              />
            </Grid>
            <Grid container sx={{ justifyContent: "center" }}>
              <Grid
                item
                xs={6}
                sm={6}
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "25px",
                }}
              >
                <PrimaryButton bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                <PrimaryButton onClick={() => setStatusDialog2(false)} bgcolor={"#FF1F25"} title="No,Cancel" />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
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
              onClick={() => { setValue('search', ''); getUserRole(1, '', null); }}
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
                                  <SwitchButton

                                    isChecked={item?.is_active}
                                    setIsChecked={() => updateAccountStatus(item.id, !item?.is_active)}
                                  />


                                </Cell>
                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                  <Box sx={{ display: 'flex !important', justifyContent: 'flex-start !important' }}>
                                    <Tooltip title="Update Password" arrow>
                                      <IconButton
                                        onClick={() => {
                                          setSelectedData(item);
                                          setStatusDialog2(true);
                                        }}
                                      >
                                        <VpnKeyIcon sx={{ color: 'black', fontSize: '14px' }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Box sx={{ display: 'flex !important', justifyContent: 'flex-start !important' }}>
                                      {true && <Box component={'div'} onClick={() => {
                                        if (item?.name != 'Staff' || item?.name != 'Customer' || item?.name != "Agent") {
                                          navigate(`/user-permission/${item?.id}`, {
                                            state: { roleId: item?.role_id }
                                          });
                                        }
                                      }}>
                                        <LockIcon />
                                      </Box>}
                                    </Box>
                                    {true && <Box component={'img'} src={Images.editIcon} onClick={() => navigate(
                                      `/update-user`,
                                      { state: item }
                                    )} width={'35px'}></Box>}

                                    {true && <Box component={'img'} src={Images.deleteIcon} onClick={() => {
                                      setSelectedData(item)
                                      setConfirmationDialog(true)
                                    }

                                    } width={'35px'}></Box>}
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