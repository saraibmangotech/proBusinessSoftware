import React, { Fragment, useEffect, useState } from "react";
import { Paper, Box, Grid, TableCell, TableContainer, TableHead, TableRow, TableBody, Table, tableCellClasses, Typography, IconButton, Button } from "@mui/material";
import styled from '@emotion/styled';
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily, Images } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
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
import HierarchicalSelectField from "components/Select2";
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


function UpadateJournalVoucher() {
  const { id } = useParams()
  const [handleBlockedNavigation] =
    useCallbackPrompt(false)
  const navigate = useNavigate();
  const [isDebitDisabled, setIsDebitDisabled] = useState(false);
  const [isCreditDisabled, setIsCreditDisabled] = useState(false);
  const [editState, setEditState] = useState(false)


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
  const [errorDisplay, setErrorDisplay] = useState(false)
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
  const [rows, setRows] = useState([])
  const [subTotal, setSubTotal] = useState()
  const [selectedRow, setSelectedRow] = useState(null)
  const [totalCredit, setTotalCredit] = useState(0)
  const [totalDebit, setTotalDebit] = useState(0)
  const [voucherDetail, setVoucherDetail] = useState(null)
  const [costCenters, setCostCenters] = useState([])
  const [selectedCostCenter, setSelectedCostCenter] = useState(null)
  const [childAccounts, setChildAccounts] = useState([]);
  const [selectedChildAccount, setSelectedChildAccount] = useState(null);

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
  // *For Get Journal Voucher Detail
  const getJournalVoucherDetail = async () => {

    try {
      let params = {
        voucher_id: id
      }
      const { data } = await FinanceServices.getJournalVoucherDetail(params)
      setVoucherDetail(data.voucher)
      // if (data?.voucher?.cost_center) {
      //   setSelectedCostCenter({ id: data?.voucher?.cost_center, name: data?.voucher?.cost_center })
      // }

      const updatedAccounts = data?.voucher?.entries?.map(account => ({
        ...account,
      
        name: ` ${account?.account?.account_code} ${account?.account?.name}`,
        selectedAccount: { id: account?.account?.id, account_name: ` ${account?.account?.name}` ,account_code:account?.account?.account_code},

        unique_id: Date.now() + Math.random(), // Ensure unique key

      }));

      console.log(updatedAccounts, 'updatedAccountsupdatedAccounts');

      setRows(updatedAccounts)
      setFromDate(new Date(data?.voucher?.created_at))
      setValue1('Journal', `JV-${data?.voucher?.entries[0]?.jv_id}`)
      setValue1('note', data?.voucher?.notes)
      const newTotalCredit = data?.voucher?.entries?.reduce((sum, row) => sum + parseFloat(row.credit || 0), 0);
      const newTotalDebit = data?.voucher?.entries?.reduce((sum, row) => sum + parseFloat(row.debit || 0), 0);

      setTotalCredit(newTotalCredit);
      setTotalDebit(newTotalDebit);
    } catch (error) {
      ErrorToaster(error)
    }
  }



  useEffect(() => {
    if (id) {
      getJournalVoucherDetail()
    }
  }, [id]);

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

  // *For Get Account
  const getAccounts = async (search, accountId) => {
    try {
      let params = {
        page: 1,
        limit: 10000,
        name: search,

      }
      const { data } = await FinanceServices.getChartOfAccount(params)
      const updatedAccounts = data?.accounts?.rows?.map(account => ({
        ...account,
        name: ` ${account.account_code} ${account.name}`
      }));
      console.log(updatedAccounts, 'updatedAccountsupdatedAccounts');

      setAccounts(data?.COA)
    } catch (error) {
      showErrorToast(error)
    }
  }
  const getCostCenters = async () => {
    try {
      let params = {
        page: 1,
        limit: 999999,
      };

      const { data } = await CustomerServices.getCostCenters(params);
      setCostCenters(data?.cost_centers);
    } catch (error) {
      showErrorToast(error);
    }
  };

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
  const UpadateJournalVoucher = async (formData) => {
    const uniqueCostCenters = [...new Set(rows.map(item => item.cost_center))].join(', ');

    console.log(uniqueCostCenters);

    setLoading(true);
    try {
      const obj = {
        id: id,
        total: totalDebit,
        notes: getValues1('note'),
        entries: rows,
        created_at: getYearMonthDateFormate(fromDate),
        cost_center: uniqueCostCenters
      };

      const promise = FinanceServices.UpdateJournalVoucher(obj);

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
    if (childAccounts?.length > 0) {
      showErrorToast("Cannot use this account because it has child accounts.");
      return
    }

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
        name: selectedAccount?.account_code + ' ' + selectedAccount?.account_name,
        selectedAccount: selectedAccount,
        cost_center: selectedCostCenter?.name
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
    setSelectedChildAccount(null);
    setChildAccounts([])
    setSelectedCostCenter(null)
    setValue('description', '')
    setValue('debit', '')
    setValue('credit', '')
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
            selectedAccount:selectedAccount,
            account_id: selectedAccount?.id,
            name: selectedAccount?.account_code + ' ' + selectedAccount?.account_name,
            cost_center: selectedCostCenter?.name
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
    setEditState(false)
    setValue('description', '')
    setValue('debit', '')
    setValue('credit', '')
  };

  const [error, setError] = useState("")

  const handleAccountSelect = (account) => {
    console.log(account);

    setSelectedAccount(account)
    setError("")
    console.log("Selected Account:", account)
  }
  // *For Get Account
  const getChildAccounts = async (accountId) => {
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
  useEffect(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    rows.forEach((row) => {
      const debit = parseFloat(row.debit || 0);
      const credit = parseFloat(row.credit || 0);

      totalDebit += debit;
      totalCredit += credit;
    });

    if (totalDebit !== totalCredit) {
      setErrorDisplay(`Total debit and credit must be equal. Got Debit: ${totalDebit}, Credit: ${totalCredit}`);
      console.log(`Total debit and credit must be equal. Got Debit: ${totalDebit}, Credit: ${totalCredit}`);
    } else {
      setErrorDisplay(false);
    }
  }, [rows]);

  // useEffect(() => {
  //   const costCenterTotals = {};

  //   rows.forEach((row) => {
  //     const center = row.cost_center || row.costcenter; // handle both spellings
  //     const debit = parseFloat(row.debit || 0);
  //     const credit = parseFloat(row.credit || 0);

  //     if (!costCenterTotals[center]) {
  //       costCenterTotals[center] = { debit: 0, credit: 0 };
  //     }

  //     costCenterTotals[center].debit += debit;
  //     costCenterTotals[center].credit += credit;
  //   });

  //   for (let i = 0; i < Object.entries(costCenterTotals).length; i++) {
  //     const obj = Object.entries(costCenterTotals)[i];
  //     let center = obj[0];
  //     let totals = obj[1];
  //     if (totals.debit !== totals.credit) {
  //       setErrorDisplay(`${center} should have equal debit and credit. Got Debit: ${totals.debit}, Credit: ${totals.credit}`)
  //       console.log(
  //         `${center} should have equal debit and credit. Got Debit: ${totals.debit}, Credit: ${totals.credit}`
  //       );
  //       break;
  //     }
  //     else{
  //       setErrorDisplay(false)
  //     }
  //   }


  // }, [rows]);

  useEffect(() => {
    getAccounts()
    getMajorCategories()
    getSubCategories()
    //setFromDate(new Date())
    getJournalVouchers()
    getCostCenters()
  }, []);

  return (
    <Box sx={{ p: 3, borderRadius: 3 }}>

      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        Update Journal Voucher
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
                <TableCell sx={{ width: "250px" }}>Description</TableCell>
                <TableCell sx={{ width: "250px" }}>Cost Center</TableCell>
                <TableCell sx={{ width: "150px" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {<TableRow>

                <TableCell>
                  <HierarchicalSelectField

                    selected={selectedAccount}
                    onSelect={handleAccountSelect}
                    data={accounts}
                    error={error}
                    placeholder="Select Account"
                  />
                </TableCell>
                {/* <TableCell>
                  <SelectField
                    size="small"
                    options={childAccounts}
                    disabled={editState}
                    selected={selectedChildAccount}
                    onSelect={(value) => {
                      setSelectedChildAccount(value)
                      console.log(value);
                      setValue('childAccount', value?.account_code)

                    }}
                    //  error={errors?.service?.message}
                    register={register("childAccount", {
                      required: childAccounts?.length >  0 ? "Please select a childAccount." :false,
                    })}
                  />
                  {errors.childAccount && <span style={{ color: "red" }}>{errors.childAccount.message}</span>}
                </TableCell> */}
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
                  <SelectField
                    size="small"

                    options={costCenters}
                    selected={selectedCostCenter}
                    onSelect={(value) => {
                      setSelectedCostCenter(value)

                    }}
                    register={register("costcenter", { required: " required" })}


                  />
                  {errors.costcenter && <span style={{ color: "red" }}>{errors.costcenter.message}</span>}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {!editState && <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      sx={{
                        textTransform: 'capitalize',
                        backgroundColor: "#001f3f",
                        fontSize: "12px",
                        ":hover": {
                          backgroundColor: "#001f3f",
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
                        backgroundColor: "#001f3f",
                        fontSize: "12px",
                        ":hover": {
                          backgroundColor: "#001f3f",
                        },
                      }}
                    >
                      Update
                    </Button>}
                    {editState && <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setSelectedAccount(null)
                        setValue('debit', '')
                        setValue('credit', '')
                        setValue('description', '')
                        setEditState(false)
                      }}
                      sx={{
                        textTransform: 'capitalize',
                        backgroundColor: "#001f3f",
                        fontSize: "12px",
                        ":hover": {
                          backgroundColor: "#001f3f",
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
                  <TableCell>{item?.cost_center}</TableCell>
                  <TableCell><Box sx={{ display: 'flex', gap: 1 }}>


                    <Box>
                      {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => {
                        setSelectedRow(item?.unique_id)
                        console.log(item?.selectedAccount);

                        setEditState(true)
                        console.log(item);
                        setValue('costcenter', { id: item?.cost_center, name: item?.cost_center })
                        setSelectedCostCenter({ id: item?.cost_center, name: item?.cost_center })
                        setSelectedAccount(item?.selectedAccount)
                        // setValue('service', item?.selectedAccount?.name)
                        setValue('debit', item?.debit)
                        setValue('credit', item?.credit)
                        setValue('description', item?.description)
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
            {(rows?.length > 0 && errorDisplay) &&
              <Typography color="error" sx={{ fontSize: 12, textAlign: "left" }}>
                {errorDisplay}
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
            title="Update"
            loading={loading}
            onClick={() => UpadateJournalVoucher()}
          />
        </Box>
      </form>
    </Box>
  );
}

export default UpadateJournalVoucher;