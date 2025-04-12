import React, { Fragment, useEffect, useState } from "react";
import { Paper, Box, Grid, TableCell, TableContainer, TableHead, TableRow, TableBody, Table, tableCellClasses, Typography, IconButton } from "@mui/material";
import styled from '@emotion/styled';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import FinanceServices from "services/Finance";
import { Delete } from "@mui/icons-material";
import { useSelector } from "react-redux";
import DatePicker from "components/DatePicker";
import { getYearMonthDateFormate } from "utils";
// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    border: 0,
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

function CreateJournalVoucher() {

  const navigate = useNavigate();
  const { usdExchangeRate, cadExchangeRate } = useSelector((state) => state.navigationReducer);

  const { register, handleSubmit, formState: { errors }, setValue, reset, getValues } = useForm();
  const [loading, setLoading] = useState(false);

  const tableHead = ['Sr.No', 'COA Code', 'COA Name', 'Debit (AED)', 'Credit (AED)', 'Description', 'Action']

  // *For Major Categories
  const [majorCategories, setMajorCategories] = useState([]);
  const [selectedMajorCategory, setSelectedMajorCategory] = useState(null);

  // *For Sub Categories
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

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

  // *For Total of Credit & Debit
  let TotalDebit = 0
  let TotalCredit = 0

  // *For Get Major Categories
  const getMajorCategories = async () => {
    try {
      const { data } = await FinanceServices.getMajorCategories()
      setMajorCategories(data?.categories)
    } catch (error) {
      ErrorToaster(error)
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
      setValue('Journal', data?.vouchers?.rows.length > 0 ? "JV-" + (parseFloat(data?.vouchers?.rows[0].id) + 1) : "JV-" + 1)
    } catch (error) {
      ErrorToaster(error);
    }
  };

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

  // *For Get Account By SubCategory
  const getAccountBySubCategory = async (id) => {
    try {
      let params = {
        sub_category: id,
      }
      const { data } = await FinanceServices.getAccountBySubCategory(params)
      setParentAccounts(data?.accounts?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Account
  const getAccounts = async (search, accountId) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        name: search,
        primary_account_id: accountId ?? selectedParentAccount?.id,
      }
      const { data } = await FinanceServices.getAccounts(params)
      setAccounts(data?.accounts?.rows)
    } catch (error) {
      ErrorToaster(error)
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
      ErrorToaster(error)
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
      ErrorToaster(error)
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
      ErrorToaster(error)
    }
  }
  // *For Create Journal Voucher
  const createJournalVoucher = async (formData) => {
    setLoading(true)
    try {
      const entries = journalVoucherList.map((item) => {
        const debit_cur = item.currency === 'aed' ? '' : item.currency === 'usd' ? item.debit * usdExchangeRate : item.debit * cadExchangeRate
        const credit_cur = item.currency === 'aed' ? '' : item.currency === 'usd' ? item.credit * usdExchangeRate : item.credit * cadExchangeRate
        return {
          account_id: item.account_id,
          debit: item.debit,
          debit_cur: debit_cur ? debit_cur : 0,
          credit: item.credit,
          credit_cur: credit_cur ? credit_cur : 0,
          currency: item.currency,
          description: item.description,

        }
      })
      let obj = {
        total: TotalDebit,
        notes: getValues('note'),
        entries: entries,
        created_at: getYearMonthDateFormate(fromDate)
      }
      const { message } = await FinanceServices.createJournalVoucher(obj)
      SuccessToaster(message)
      navigate('/journal-voucher-list')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getMajorCategories()
    getSubCategories()
    setFromDate(new Date())
    getJournalVouchers()
  }, []);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        Create Journal Voucher
      </Typography>

      <Box component="form" onSubmit={handleSubmit(addVoucher)} >
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
              register={register("Journal")}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} >

          <Grid item xs={12} sm={3}>
            <SelectField
              size={'small'}
              label={'Major Category'}
              options={majorCategories}
              selected={selectedMajorCategory}
              onSelect={(value) => { setSelectedMajorCategory(value); getSubCategories(value?.id); setSelectedSubCategory(null) }}
              register={register("majorCategory")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <SelectField
              size={'small'}
              label={'Sub Category'}
              options={subCategories}
              selected={selectedSubCategory}
              onSelect={(value) => { setSelectedSubCategory(value); getAccountBySubCategory(value?.id) }}
              error={errors?.subCategory?.message}
              register={register("subCategory", {
                required: 'Please select sub category.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <SelectField
              disabled={selectedSubCategory ? false : true}
              size={'small'}
              label={'Account'}
              options={parentAccounts}
              selected={selectedParentAccount}
              onSelect={(value) => { setSelectedParentAccount(value); getAccounts('', value?.id); setValue('accountCode', value?.account_code) }}
              error={errors?.parentAccount?.message}
              register={register("parentAccount", {
                required: 'Please select parent account.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            {accounts?.length > 0 &&
              <SelectField
                disabled={selectedParentAccount ? false : true}
                size={'small'}
                label={'Child Account'}
                onSearch={(v) => getAccounts(v)}
                options={accounts}
                selected={selectedAccount}
                onSelect={(value) => { setSelectedAccount(value); setValue('accountCode', value?.account_code) }}
                error={errors?.description?.message}
                register={register("account", {
                  required: accounts?.length > 0 ? 'Please select a account' : false,
                })}
              />
            }
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              size={'small'}
              label={'Account Code'}
              placeholder={'Account Code'}
              register={register("accountCode")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              size={'small'}
              label={'Debit  (AED)'}
              placeholder={'Debit'}

              register={register("debit", {
                onChange: (e) => {
                  setValue('credit', 0)
                  if (getValues('debit') < 0) {
                    setValue('debit', 0)
                  }
                },
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              size={'small'}
              label={'Credit  (AED)'}
              placeholder={'Credit'}

              register={register("credit", {
                onChange: (e) => {
                  setValue('debit', 0)
                  if (getValues('credit') < 0) {
                    setValue('credit', 0)
                  }
                },
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              size={'small'}
              label={'Description'}
              placeholder={'Description'}
              register={register("description")}
            />
          </Grid>
          <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
            <PrimaryButton
              title="Add"
              type='submit'
              bgcolor={Colors.bluishCyan}
            />
          </Grid>
        </Grid>
      </Box>

      {/* ========== Table ========== */}
      {journalVoucherList.length > 0 &&
        <Fragment>
          <TableContainer component={Paper} sx={{ mt: 2, boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }}>
            <Table stickyHeader sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow>
                  {tableHead.map((item, index) => (
                    <Cell key={index}>{item}</Cell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {journalVoucherList.map((item, index) => {
                  TotalDebit += parseFloat(item.debit)
                  TotalCredit += parseFloat(item.credit)
                  return (
                    <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                      <Cell>
                        {index + 1}
                      </Cell>
                      <Cell>
                        {item?.coa_code ?? '-'}
                      </Cell>
                      <Cell>
                        {item?.coa_name ?? '-'}
                      </Cell>
                      <Cell>
                        {item?.debit ?? '-'}
                      </Cell>
                      <Cell>
                        {item?.credit ?? '-'}
                      </Cell>
                      <Cell>
                        {item?.description ?? '-'}
                      </Cell>
                      <Cell>
                        <Box sx={{ gap: '16px !important' }}>
                          <Box onClick={() => deleteJournalVoucher(index)}>
                            <IconButton sx={{
                              bgcolor: Colors.danger,
                              "&:hover": {
                                bgcolor: Colors.danger,
                              },
                            }}
                            >
                              <Delete sx={{ color: Colors.white, height: "16px !important" }} />
                            </IconButton>
                            <Typography variant="body2">
                              Delete
                            </Typography>
                          </Box>
                        </Box>
                      </Cell>
                    </Row>
                  )
                })}
                <Row sx={{ bgcolor: '#EEFBEE' }}>
                  <Cell colSpan={3}>
                    <Typography variant="body1" sx={{ fontWeight: 700, }}>
                      Total
                    </Typography>
                  </Cell>
                  <Cell>
                    <Typography variant="body1" sx={{ fontWeight: 700, }}>
                      {parseFloat(TotalDebit).toFixed(2)}
                    </Typography>
                  </Cell>
                  <Cell>
                    <Typography variant="body1" sx={{ fontWeight: 700, }}>
                      {parseFloat(TotalCredit).toFixed(2)}
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
              {TotalCredit !== TotalDebit &&
                <Typography color="error" sx={{ fontSize: 12, textAlign: "left" }}>
                  Debit and Credit is not equal.
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
              disabled={TotalCredit !== TotalDebit}
              title="Submit"
              loading={loading}
              onClick={() => createJournalVoucher()}
            />
          </Box>
        </Fragment>
      }

    </Box>
  );
}

export default CreateJournalVoucher;