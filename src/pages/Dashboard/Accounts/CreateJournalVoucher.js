import React, { Fragment, useEffect, useState } from "react";
import { Paper, Box, Grid, TableCell, TableContainer, TableHead, TableRow, TableBody, Table, tableCellClasses, Typography, IconButton, Button } from "@mui/material";
import styled from '@emotion/styled';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily, Images } from "assets";
import { SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import FinanceServices from "services/Finance";
import { Delete } from "@mui/icons-material";
import { useSelector } from "react-redux";
import DatePicker from "components/DatePicker";
import { getYearMonthDateFormate } from "utils";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import { useCallbackPrompt } from "hooks/useCallBackPrompt";
import AddIcon from "@mui/icons-material/Add";
import CustomerServices from "services/Customer";
import moment from "moment";
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


function CreateJournalVoucher() {
  const [handleBlockedNavigation] =
    useCallbackPrompt(false)
  const navigate = useNavigate();
  const [isDebitDisabled, setIsDebitDisabled] = useState(false);
  const [isCreditDisabled, setIsCreditDisabled] = useState(false);

  const { usdExchangeRate, cadExchangeRate } = useSelector((state) => state.navigationReducer);

  const { register, handleSubmit, formState: { errors }, setValue, reset, getValues } = useForm();
  const {
    register: register1,
    handleSubmit: handleSubmit1,
    setValue: setValue1,
    getValues: getValues1,
    control,
    watch: watch1,
    formState: { errors: errors1 },
  } = useForm();
  const [loading, setLoading] = useState(false);

  const tableHead = ['Sr.No', 'COA Code', 'COA Name', 'Debit (AED)', 'Credit (AED)', 'Description', 'Action']

  // *For Major Categories
  const [majorCategories, setMajorCategories] = useState([]);
  const [selectedMajorCategory, setSelectedMajorCategory] = useState(null);

  // *For Sub Categories
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [editState, setEditState] = useState(false)
  // *For Parent Account
  const [parentAccounts, setParentAccounts] = useState([]);
  const [selectedParentAccount, setSelectedParentAccount] = useState(null);

  // *For Accounts
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // *For Journal Voucher List
  const [journalVoucherList, setJournalVoucherList] = useState([]);

  const [JournalData, setJournalData] = useState()

  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [journalNo, setJournalNo] = useState()
  const [rows, setRows] = useState([])
  const [subTotal, setSubTotal] = useState()
  const [selectedRow, setSelectedRow] = useState(null)
  const [totalCredit, setTotalCredit] = useState(0)
  const [totalDebit, setTotalDebit] = useState(0)

  const [costCenters, setCostCenters] = useState([])
  const [selectedCostCenter, setSelectedCostCenter] = useState(null)

  // *For Total of Credit & Debit
  let TotalDebit = 0
  let TotalCredit = 0

  // *For Get Major Categories
  const getMajorCategories = async () => {
    try {
      const { data } = await FinanceServices.getMajorCategories()
      setMajorCategories(data?.categories)
    } catch (error) {
      showErrorToast(error)
    }
  }

  // *For Get Journal Vouchers List
  const getJournalVouchers = async () => {
    try {

      let params = {
        page: 1,
        limit: 1,
      };

      const { data } = await FinanceServices.getJournalVouchers(params);
      console.log(data);
      setJournalData(data)
      setValue1('Journal', data?.vouchers?.rows.length > 0 ? "JV-" + (parseFloat(data?.vouchers?.rows[0].id) + 1) : "JV-" + 1)
    } catch (error) {
      showErrorToast(error);
    }
  };

  // *For Get Sub Categories
  const getSubCategories = async (id) => {
    try {
      let params = {
        category_id: id ?? ''
      }
      const { data } = await FinanceServices.getSubCategories(params)
      if (id) {

        setSubCategories(data?.categories)
      }
      else {
        setSubCategories([])
      }
    } catch (error) {
      showErrorToast(error)
    }
  }

  // *For Get Account By SubCategory
  const getAccountBySubCategory = async (id) => {
    try {
      let params = {
        sub_category: id,
      }
      const { data } = await FinanceServices.getAccountBySubCategory(params)
      setParentAccounts(data?.accounts?.rows)
    } catch (error) {
      showErrorToast(error)
    }
  }
  const getCostCenters = async () => {
    try {
      let params = {
        page: 1,
        limit: 1000,
      };

      const { data } = await CustomerServices.getCostCenters(params);
      setCostCenters(data?.cost_centers);
    } catch (error) {
      showErrorToast(error);
    }
  };
  // *For Get Account
  const getAccounts = async (search, accountId) => {
    try {
      let params = {
        page: 1,
        limit: 10000,
        name: search,
        is_disabled:false

      }
      const { data } = await FinanceServices.getAccountsDropDown(params)
      const updatedAccounts = data?.accounts?.rows?.map(account => ({
        ...account,
        name: ` ${account.account_code} ${account.name}`
      }));
      console.log(updatedAccounts, 'updatedAccountsupdatedAccounts');

      setAccounts(updatedAccounts)
    } catch (error) {
      showErrorToast(error)
    }
  }

  // *For Add Single Journal Voucher
  const addVoucher = async (formData) => {
    try {
      const voucherCopy = [...journalVoucherList]
      let obj = {
        account_id: accounts.length > 0 ? selectedAccount?.id : selectedParentAccount?.id,
        coa_code: formData?.accountCode,
        coa_name: accounts.length > 0 ? formData?.account : formData?.parentAccount,
        debit: formData?.debit ? formData?.debit : 0,
        credit: formData?.credit ? formData?.credit : 0,
        description: formData?.description,
        currency: selectedAccount?.currency,
        cost_center: selectedCostCenter?.name

      }
      voucherCopy.push(obj)
      setJournalVoucherList(voucherCopy)
      reset()
      setSelectedMajorCategory(null)
      setSelectedSubCategory(null)
      setSelectedParentAccount(null)
      setSelectedAccount(null)
      setAccounts()
      setValue('Journal', JournalData?.vouchers?.rows.length > 0 ? "JV-" + (parseFloat(JournalData?.vouchers?.rows[0].id) + 1) : "JV-" + 1)
    } catch (error) {
      showErrorToast(error)
    }
  }

  // *For Delete Journal Voucher
  const deleteJournalVoucher = async (index) => {
    setLoading(true)
    try {
      const voucherCopy = [...journalVoucherList]
      voucherCopy.splice(index, 1)
      setJournalVoucherList(voucherCopy)
    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoading(false)
    }
  }


  // *For Handle Date
  const handleFromDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setFromDate('invalid')
        return
      }
      setFromDate(new Date(newDate))
    } catch (error) {
      showErrorToast(error)
    }
  }
  // *For Create Journal Voucher
  const createJournalVoucher = async (formData) => {
    if (!selectedCostCenter || !selectedCostCenter.name) {
      showErrorToast("Cost center is required.");
      return;
    }
  
    setLoading(true);
    try {
      let obj = {
        total: totalDebit,
        notes: getValues('note'),
        entries: rows,
        created_at: moment(fromDate).format('MM-DD-YYYY'),
        cost_center: selectedCostCenter.name,
      };
  
      const promise = FinanceServices.createJournalVoucher(obj);
  
      showPromiseToast(
        promise,
        'Saving...',
        'Added Successfully',
        'Something Went Wrong'
      );
  
      const response = await promise;
      if (response?.responseCode === 200) {
        navigate('/journal-voucher-list');
      }
  
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };
  

  const addItem = (data) => {
    console.log(data);
    const debit = parseFloat(data?.debit || 0);
    const credit = parseFloat(data?.credit || 0);

    // Check if both debit and credit are 0
    if (debit === 0 && credit === 0) {
      showErrorToast('Either Debit or Credit must be greater than 0');
      return;
    }

    setRows((prevRows) => {
      const newRow = {
        ...data,
        unique_id: Date.now() + Math.random(), // Ensure unique key
        account_id: selectedAccount?.id,
        name: selectedAccount?.name,
        selectedAccount: selectedAccount
      };

      const updatedRows = [...prevRows, newRow];

      const newTotalCredit = updatedRows.reduce((sum, row) => sum + parseFloat(row.credit || 0), 0);
      const newTotalDebit = updatedRows.reduce((sum, row) => sum + parseFloat(row.debit || 0), 0);

      setTotalCredit(newTotalCredit);
      setTotalDebit(newTotalDebit);
      setIsCreditDisabled(false);
      setIsDebitDisabled(false);

      return updatedRows;
    });

    setSelectedAccount(null);
    reset();
  };

  const updateItem = (data) => {
    if (!selectedRow) {
      showErrorToast('No row selected to update');
      return;
    }

    const debit = parseFloat(data?.debit || 0);
    const credit = parseFloat(data?.credit || 0);

    if (debit === 0 && credit === 0) {
      showErrorToast('Either Debit or Credit must be greater than 0');
      return;
    }

    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) =>
        row.unique_id === selectedRow
          ? {
            ...row,
            ...data,
            account_id: selectedAccount?.id,
            name: selectedAccount?.name,
          }
          : row
      );

      const newTotalCredit = updatedRows.reduce((sum, row) => sum + parseFloat(row.credit || 0), 0);
      const newTotalDebit = updatedRows.reduce((sum, row) => sum + parseFloat(row.debit || 0), 0);

      setTotalCredit(newTotalCredit);
      setTotalDebit(newTotalDebit);
      setIsCreditDisabled(false);
      setIsDebitDisabled(false);

      return updatedRows;
    });

    setSelectedAccount(null);
    setSelectedRow(null);
    reset();
  };



  useEffect(() => {
    getAccounts()
    getMajorCategories()
    getSubCategories()
    setFromDate(new Date())
    getJournalVouchers()
    getCostCenters()
  }, []);

  return (
    <Box sx={{ p: 3, borderRadius: 3 }}>

      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        Create Journal Voucher
      </Typography>

      <Box component="form" onSubmit={handleSubmit1(addVoucher)} >
        <Grid container spacing={2} >
          <Grid item xs={12} sm={3}>
            <DatePicker
              disableFuture={true}
              size='small'
              label={'Journal Date'}
              value={fromDate}
              onChange={(date) => handleFromDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField

              size={'small'}
              disabled={true}
              label={' Journal No.'}
              placeholder={'Journal No.'}
              register={register1("Journal")}
            />
          </Grid>
          <Grid item xs={3}>
            <SelectField
              size="small"
              label="Select Cost Center"
              options={costCenters}
              selected={selectedCostCenter}
              onSelect={(value) => {
                setSelectedCostCenter(value)

              }}
              register={register1("costcenter", { required: "costcenter is required" })}
              error={errors1?.costcenter?.message}
            />
          </Grid>
        </Grid>




      </Box>


      <form onSubmit={handleSubmit(editState ? updateItem : addItem)}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>

                <TableCell sx={{ width: "400px" }}>Accounts</TableCell>
                <TableCell sx={{ width: "150px" }}>Debit</TableCell>
                <TableCell sx={{ width: "150px" }}>Credit</TableCell>
                <TableCell sx={{ width: "150px" }}>Description</TableCell>

                <TableCell sx={{ width: "150px" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {<TableRow>

                <TableCell>
                  <SelectField
                    size="small"
                    options={accounts}
                    disabled={editState}
                    selected={selectedAccount}
                    onSelect={(value) => {
                      setSelectedAccount(value)
                      console.log(value);
                      setValue('AccountCode', value?.account_code)

                    }}
                    //  error={errors?.service?.message}
                    register={register("service", {
                      required: "Please select a service.",
                    })}
                  />
                  {errors.service && <span style={{ color: "red" }}>{errors.service.message}</span>}
                </TableCell>
                <TableCell>
                  <InputField
                    size="small"
                    placeholder="Debit"
                    type="number"
                    step='any'
                    disabled={isDebitDisabled}
                    register={register("debit", {
                      required: "Debit is required",
                      onChange: (e) => {
                        const value = parseFloat(e.target.value);
                        if (value > 0) {
                          setValue("credit", 0);
                          setIsCreditDisabled(true);
                        } else {
                          setIsCreditDisabled(false);
                        }
                      }
                    })}
                  />
                  {errors.debit && <span style={{ color: "red" }}>{errors.debit.message}</span>}
                </TableCell>

                <TableCell>
                  <InputField
                    size="small"
                    placeholder="Credit"
                    type="number"
                    step='any'
                    disabled={isCreditDisabled}
                    register={register("credit", {
                      required: "Credit is required",
                      onChange: (e) => {
                        const value = parseFloat(e.target.value);
                        if (value > 0) {
                          setValue("debit", 0);
                          setIsDebitDisabled(true);
                        } else {
                          setIsDebitDisabled(false);
                        }
                      }
                    })}
                  />
                  {errors.credit && <span style={{ color: "red" }}>{errors.credit.message}</span>}
                </TableCell>
                <TableCell>
                  <InputField
                    size="small"

                    placeholder="Description"


                    register={register("description", { required: false })}
                  />
                  {errors.desc && <span style={{ color: "red" }}>{errors.desc.message}</span>}
                </TableCell>

                <TableCell>
                  <Box sx={{display:'flex',gap:2}}>
                  {!editState && <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    sx={{
                      textTransform: 'capitalize',
                      backgroundColor: "rgb(189 155 74)",
                      fontSize: "12px",
                      ":hover": {
                        backgroundColor: "rgb(189 155 74)",
                      },
                    }}
                  >
                    <AddIcon />
                  </Button>}
                  {editState && <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    sx={{
                      textTransform: 'capitalize',
                      backgroundColor: "rgb(189 155 74)",
                      fontSize: "12px",
                      ":hover": {
                        backgroundColor: "rgb(189 155 74)",
                      },
                    }}
                  >
                    Update
                  </Button>}
                  {editState && <Button
                    variant="contained"
                    color="primary"
                  onClick={()=> {
                    setSelectedAccount(null)
                    setValue('debit','')
                    setValue('credit','')
                    setValue('description','')
                    setEditState(false)}}
                    sx={{
                      textTransform: 'capitalize',
                      backgroundColor: "rgb(189 155 74)",
                      fontSize: "12px",
                      ":hover": {
                        backgroundColor: "rgb(189 155 74)",
                      },
                    }}
                  >
                    Cancel
                  </Button>}
                  </Box>
                </TableCell>
              </TableRow>}

              {rows?.length > 0 && rows?.map((item, index) => (
                <TableRow key={index}>


                  <TableCell>{item?.name}</TableCell>
                  <TableCell>{item?.debit}</TableCell>
                  <TableCell>{item?.credit}</TableCell>
                  <TableCell>{item?.description}</TableCell>
                  <TableCell><Box sx={{ display: 'flex', gap: 1 }}>


                    <Box>
                      {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => {
                        setSelectedRow(item?.unique_id)
                        setEditState(true)
                        console.log(item);
                        setSelectedAccount(item?.selectedAccount)
                        setValue('service',item?.selectedAccount?.name)
                        setValue('debit',item?.debit)
                        setValue('credit',item?.credit)
                        setValue('description',item?.description)
                      }} src={Images.editIcon} width={'35px'}></Box>}
                      {true && <Box sx={{ cursor: 'pointer' }} component={'img'} src={Images.deleteIcon} onClick={() => {

                        let selectedID = item?.id
                        console.log(item?.id);

                        setRows(rows?.filter(item2 => item2?.unique_id !== item?.unique_id))

                        let filteredData = rows?.filter(item2 => item2?.unique_id !== item?.unique_id)

                        const newTotalCredit = filteredData.reduce((sum, row) => sum + parseFloat(row.credit || 0), 0);
                        const newTotalDebit = filteredData.reduce((sum, row) => sum + parseFloat(row.debit || 0), 0);

                        setTotalCredit(newTotalCredit)
                        setTotalDebit(newTotalDebit)


                      }} width={'35px'}></Box>}


                    </Box>

                  </Box></TableCell>
                </TableRow>
              ))}
              <Row sx={{ bgcolor: '#EEFBEE' }}>
                <Cell colSpan={1}>
                  <Typography variant="body1" sx={{ fontWeight: 700, }}>
                    Total
                  </Typography>
                </Cell>
                <Cell>
                  <Typography variant="body1" sx={{ fontWeight: 700, }}>
                    {parseFloat(totalDebit).toFixed(2)}
                  </Typography>
                </Cell>
                <Cell>
                  <Typography variant="body1" sx={{ fontWeight: 700, }}>
                    {parseFloat(totalCredit).toFixed(2)}
                  </Typography>
                </Cell>
                <Cell>
                </Cell>
                <Cell>
                </Cell>
              </Row>



            </TableBody>
          </Table>
        </TableContainer>
        <Grid container spacing={2} >
          <Grid item xs={12} sm={12}>
            {parseFloat(totalCredit).toFixed(2) != parseFloat(totalDebit).toFixed(2) &&
              <Typography color="error" sx={{ fontSize: 12, textAlign: "left" }}>
                Debit and Credit are not equal.
              </Typography>
            }
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              label={'Note'}
              placeholder={'Note'}
              register={register("note")}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <PrimaryButton
            disabled={parseFloat(totalCredit).toFixed(2) != parseFloat(totalDebit).toFixed(2)}
            title="Submit"
            loading={loading}
            onClick={() => createJournalVoucher()}
          />
        </Box>
      </form>
    </Box>
  );
}

export default CreateJournalVoucher;