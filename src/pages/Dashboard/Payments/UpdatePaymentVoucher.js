import React, { Fragment, useEffect, useState } from "react";
import { Paper, Box, Grid, TableCell, TableContainer, TableHead, TableRow, TableBody, Table, tableCellClasses, Typography, IconButton, Button } from "@mui/material";
import styled from '@emotion/styled';
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
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
import DeleteIcon from '@mui/icons-material/Delete';
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


function UpdatePaymentVoucher() {
    const { id } = useParams()
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

    // *For Parent Account
    const [parentAccounts, setParentAccounts] = useState([]);
    const [selectedParentAccount, setSelectedParentAccount] = useState(null);

    // *For Accounts
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [childAccounts, setChildAccounts] = useState([]);

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
    const [total, setTotal] = useState(0)
    const [selectedMode, setSelectedMode] = useState(null)
    const [cards, setCards] = useState([])
    const [selectedCard, setSelectedCard] = useState(null)
    const [banks, setBanks] = useState([])
    const [selectedBank, setSelectedBank] = useState(null)
    const [costCenters, setCostCenters] = useState([])
    const [selectedCostCenter, setSelectedCostCenter] = useState(null)
    const [editState, setEditState] = useState(false)

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
                sub_category: 4,
            }
            const { data } = await FinanceServices.getAccountBySubCategory(params)
            const updatedAccounts = data?.accounts?.rows?.map(account => ({
                ...account,
                name: ` ${account.account_code} ${account.name}`
            }));
            console.log(updatedAccounts, 'updatedAccountsupdatedAccounts');
            setParentAccounts(updatedAccounts)
        } catch (error) {
            showErrorToast(error)
        }
    }
    const getChildAccounts = async (accountId) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                primary_account_id: accountId,
            };
            const { data } = await FinanceServices.getAccounts(params);
            if (data?.accounts?.rows?.length > 0) {
                setSelectedAccount(null)
                showErrorToast('Cannot use this account because it has child accounts.')
            }
            setChildAccounts(data?.accounts?.rows);
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
                is_disabled: false

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
    const UpdatePaymentVoucher = async (formData) => {
        console.log(formData);
        const paymentModesString = rows.map((item) => item.payment_mode).join(", ");

        setLoading(true)
        try {

            let obj = {
                id: id,
                date: moment(fromDate).format('MM-DD-YYYY'),
                type: "payment_voucher",    // or "receipt_voucher"

                amount: total,

                account_id: selectedParentAccount?.id,
                description: getValues('note'),
                authorization_code: formData?.remarks,
                entries: rows,
                payment_method: selectedParentAccount?.name,
                cost_center: selectedCostCenter?.name
            }

            console.log(obj, 'objobj');

            const promise = FinanceServices.UpdatePaymentVoucher(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );

            const response = await promise;
            if (response?.responseCode === 200) {
                navigate('/payment-voucher-list')
            }


        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }
    const getTokenNumber = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
                type: 'payment_voucher'
            };

            const { data } = await CustomerServices.getVoucherToken(params);
            console.log(data);
            setValue1('Voucher', data?.voucherNumber)

        } catch (error) {
            showErrorToast(error);
        }
    };

    const getData = async () => {
        try {
            let params = {
                id: id
            };

            const { data } = await CustomerServices.getPaymentVoucherDetail(params);
            let detail = data?.voucher

            setValue1('Voucher', 'PV-' + detail?.voucher_number)
            setValue('note', detail?.description)
            setFromDate(new Date(detail?.date))
            const updatedAccounts = detail?.entries?.map(account => ({
                ...account,
                id:account?.account?.id,
                name: ` ${account?.account?.account_code} ${account?.account?.name}`,
                amount: parseFloat(account?.debit) ? parseFloat(account?.debit) : parseFloat(account?.credit)
            }));
            setValue1("parentAccount", updatedAccounts[0]);
            setSelectedParentAccount(updatedAccounts[0])
            updatedAccounts.shift();

            setRows(updatedAccounts);
            // setValue1("costcenter", { id: detail?.cost_center, name: detail?.cost_center });
            // setSelectedCostCenter({ id: detail?.cost_center, name: detail?.cost_center })


        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };
    useEffect(() => {
        getData()
        // getTokenNumber()
        getAccountBySubCategory()
        getCostCenters()
    }, []);
    useEffect(() => {
        const AllTotal = rows.reduce(
            (sum, row) => sum + parseFloat(row.amount || 0),
            0
        );
        setTotal(AllTotal)

    }, [rows])

   const addItem = (description, amount) => {
          // Basic Validations
          if (!selectedAccount || !selectedAccount.id) {
              showErrorToast("Please select an account first");
              return;
          }
          if (!selectedCostCenter ) {
              showErrorToast("Please select cost center");
              return;
          }
          // if (!description || description.trim() === "") {
          //     showErrorToast("Description is required");
          //     return;
          // }
  
          if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
              showErrorToast("Valid amount is required");
              return;
          }
  
          let data = { description: description.trim(), amount: parseFloat(amount), debit: parseFloat(amount), credit: 0 };
  
          const newRow = {
              ...data,
              account_id: selectedAccount?.id,
              name: selectedAccount?.name,
              payment_mode: selectedAccount?.name,
              selectedAccount: selectedAccount,
              cost_center:selectedCostCenter?.name
          };
  
          let findElement = rows?.find((item) => item?.account_id === newRow?.account_id);
          if (findElement) {
              showErrorToast("Account Already Added");
          } else {
              setRows((prevRows) => {
                  const updatedRows = [...prevRows, newRow];
  
                  const newTotalCredit = updatedRows.reduce(
                      (sum, row) => sum + parseFloat(row.credit || 0),
                      0
                  );
                  const newTotalDebit = updatedRows.reduce(
                      (sum, row) => sum + parseFloat(row.debit || 0),
                      0
                  );
                  const GrandTotal = updatedRows.reduce(
                      (sum, row) => sum + parseFloat(row.amount || 0),
                      0
                  );
  
                  setTotalCredit(newTotalCredit);
                  setTotalDebit(newTotalDebit);
                  setTotal(GrandTotal);
  
                  console.log(updatedRows);
  
                  setIsCreditDisabled(false);
                  setIsDebitDisabled(false);
  
                  return updatedRows;
              });
  
              setSelectedAccount(null);
              setSelectedCostCenter(null)
              setValue('description', '')
              setValue('amount', '')
          }
      };
      const updateItem = (description, amount) => {
          // Basic Validations
          if (!selectedAccount || !selectedAccount.id) {
              showErrorToast("Please select an account first");
              return;
          }
          if (!selectedCostCenter ) {
              showErrorToast("Please select cost center");
              return;
          }
  
          // if (!description || description.trim() === "") {
          //     showErrorToast("Description is required");
          //     return;
          // }
  
          if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
              showErrorToast("Valid amount is required");
              return;
          }
  
          if (!selectedAccount?.id) {
              showErrorToast("No valid ID found for update.");
              return;
          }
          console.log(selectedAccount?.id, 'selectedAccountselectedAccount');
  
          // Prepare updated row data
          const updatedItem = {
              id: selectedAccount.id, // Maintain ID for match
              description: description.trim(),
              amount: parseFloat(amount),
              debit: parseFloat(amount),
              credit: 0,
              account_id: selectedAccount?.id,
              name: selectedAccount?.name,
              payment_mode: selectedAccount?.name,
              selectedAccount: selectedAccount,
              cost_center:selectedCostCenter?.name
          };
          console.log(updateItem, 'updateItemupdateItem');
  
          setRows((prevRows) => {
              const updatedRows = prevRows.map((item) => {
                  console.log(item.account_id === selectedAccount.id);
                  return item.account_id === selectedAccount.id ? updatedItem : item;
              });
  
              console.log(updatedRows, 'updatedRows');
  
              // Recalculate totals
              const newTotalCredit = updatedRows.reduce(
                  (sum, row) => sum + parseFloat(row.credit || 0),
                  0
              );
              const newTotalDebit = updatedRows.reduce(
                  (sum, row) => sum + parseFloat(row.debit || 0),
                  0
              );
              const grandTotal = updatedRows.reduce(
                  (sum, row) => sum + parseFloat(row.amount || 0),
                  0
              );
  
              setTotalCredit(newTotalCredit);
              setTotalDebit(newTotalDebit);
              setTotal(grandTotal);
  
              setIsCreditDisabled(false);
              setIsDebitDisabled(false);
  
              return updatedRows;
          });
  
  
          // Reset state
          setValue("amount", "");
          setValue("description", "");
          setSelectedAccount(null);
          setSelectedAccount(null);
          setSelectedCostCenter(null)
          setEditState(false);
      };
  

    // *For Get Customer Queue
    const getBanks = async (page, limit, filter) => {



        try {
            const params = {
                page: 1,
                limit: 999999,
            }

            const { data } = await CustomerServices.getBanks(params)
            setBanks(data?.banks)
        } catch (error) {
            showErrorToast(error)
        }
    }
    // *For Get Customer Queue
    const getCards = async (page, limit, filter) => {


        try {
            const params = {
                page: 1,
                limit: 999999,
            }

            const { data } = await CustomerServices.getCards(params)
            let cardsData = data?.cards?.map((card) => ({
                ...card,
                name: card.account_name,
            }));
            setCards(
                data?.cards?.map((card) => ({
                    ...card,
                    name: card.account_name,
                })),

            )

            setSelectedCard({ id: cardsData[0]?.id, name: cardsData[0]?.name, account_id: cardsData[0]?.account_id })
            setValue1("card", { id: cardsData[0]?.id, name: cardsData[0]?.name, account_id: cardsData[0]?.account_id })


        } catch (error) {
            showErrorToast(error)
        }
    }

    useEffect(() => {
        getBanks()
        getCards()
        getAccounts()
        getMajorCategories()
        getSubCategories()
        // setFromDate(new Date())
        getJournalVouchers()
    }, []);

    return (
        <Box sx={{ p: 3, borderRadius: 3 }} component={'form'} onSubmit={handleSubmit1(UpdatePaymentVoucher)}>

            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
                Update Payment Voucher
            </Typography>

            <Box  >
                <Grid container spacing={2} >
                    <Grid item xs={12} sm={3}>
                        <DatePicker
                            disableFuture={true}
                            size='small'
                            label={' Date'}
                            value={fromDate}
                            onChange={(date) => handleFromDate(date)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <InputField

                            size={'small'}
                            disabled={true}
                            label={' Voucher No.'}
                            placeholder={'Voucher No.'}
                            register={register1("Voucher")}
                        />
                    </Grid>
                

                </Grid>




            </Box>



            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>

                            <TableCell sx={{ width: "400px" }}>Accounts</TableCell>

                            <TableCell sx={{ width: "400px" }}>Cost Center</TableCell>
                            <TableCell sx={{ width: "150px" }}>Description</TableCell>
                            <TableCell sx={{ width: "150px" }}>Amount</TableCell>
                            <TableCell sx={{ width: "150px" }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {<TableRow>

                            <TableCell>
                                <SelectField
                                    size="small"
                                    options={accounts}

                                    selected={selectedAccount}
                                    onSelect={(value) => {
                                        setSelectedAccount(value)
                                        console.log(value);
                                        setValue('AccountCode', value?.account_code)
                                        getChildAccounts(value?.id)

                                    }}
                                    //  error={errors?.service?.message}
                                    register={register("service", {
                                        required: "Please select a service.",
                                    })}
                                />
                                {errors.service && <span style={{ color: "red" }}>{errors.service.message}</span>}
                            </TableCell>
                            <TableCell>
                            <SelectField
                            size="small"
                           
                            
                            options={costCenters}
                            selected={selectedCostCenter}
                            onSelect={(value) => {
                                setSelectedCostCenter(value)

                            }}
                            register={register1("costcenter", { required: "costcenter is required" })}
                            error={errors1?.costcenter?.message}
                        />
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
                                <InputField
                                    size="small"
                                    placeholder="Amount"
                                    type="number"
                                    step='any'

                                    register={register("amount", {
                                        required: false,
                                        onChange: (e) => {
                                            const value = parseFloat(e.target.value);

                                        }
                                    })}
                                />
                                {errors.credit && <span style={{ color: "red" }}>{errors.credit.message}</span>}
                            </TableCell>


                            <TableCell>

                                {!editState && <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => addItem(getValues('description'), getValues('amount'))}
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
                                {editState && (
                                    <>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                type="submit"
                                                onClick={() => updateItem(getValues('description'), getValues('amount'))}
                                                sx={{
                                                    textTransform: "capitalize",
                                                    backgroundColor: "#001f3f",
                                                    fontSize: "12px",
                                                    ":hover": {
                                                        backgroundColor: "#001f3f",
                                                    },
                                                }}
                                            >
                                                Update
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => {
                                                    setEditState(false);
                                                    setValue("id", "");
                                                    setValue("amount", "");
                                                    setValue("description", "");
                                                    setSelectedAccount(null);
                                                    setValue("quantity", "");
                                                }}
                                                sx={{

                                                    textTransform: "capitalize",
                                                    backgroundColor: "#001f3f",
                                                    fontSize: "12px",
                                                    ":hover": {
                                                        backgroundColor: "#001f3f",
                                                    },
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    </>
                                )}
                            </TableCell>
                        </TableRow>}

                        {rows?.length > 0 && rows?.map((item, index) => (
                            <TableRow key={index}>


                                <TableCell>{item?.name}</TableCell>
                                <TableCell>{item?.cost_center}</TableCell>
                                <TableCell>{item?.description}</TableCell>
                                <TableCell>{item?.amount}</TableCell>

                                <TableCell><Box sx={{ display: 'flex', gap: 1 }}>


                                    <Box display={'flex'} gap={2}>
                                        {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => {
                                            setSelectedRow(item); setEditState(true)
                                            console.log(item);

                                            setValue("id", item?.id);
                                            setSelectedAccount(item?.account)
                                            setValue("description", item?.description);
                                            setValue("amount", item?.amount);
                                            console.log(item?.service)

                                        }} src={Images.editIcon} width={'35px'}></Box>}
                                        {true && <Box sx={{ cursor: 'pointer' }} component={'img'} src={Images.deleteIcon} onClick={() => {

                                            let selectedID = item?.id
                                            console.log(item?.id);

                                            setRows(rows?.filter(item2 => item2?.account_id != item?.account_id))
                                            let filteredData = rows?.filter(item2 => item2?.account_id != item?.account_id)

                                            const newTotalCredit = filteredData.reduce((sum, row) => sum + parseFloat(row.credit || 0), 0);
                                            const newTotalDebit = filteredData.reduce((sum, row) => sum + parseFloat(row.debit || 0), 0);
                                            const GrandTotal = filteredData.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);
                                            setTotalCredit(newTotalCredit)
                                            setTotalDebit(newTotalDebit)
                                            setTotal(GrandTotal)
                                            setTotalCredit(newTotalCredit)
                                            setTotalDebit(newTotalDebit)


                                        }} width={'35px'}></Box>}


                                    </Box>

                                </Box></TableCell>
                            </TableRow>
                        ))}
                        <TableRow sx={{ bgcolor: '#EEFBEE' }}>
                            <Cell colSpan={1}>
                                <Typography variant="body1" sx={{ fontWeight: 700, }}>
                                    Total
                                </Typography>
                            </Cell>
                            <Cell>
                            </Cell>
                            <Cell>
                                <Typography variant="body1" sx={{ fontWeight: 700, }}>
                                    {parseFloat(total).toFixed(2)}
                                </Typography>
                            </Cell>
                            <Cell>
                            </Cell>

                        </TableRow>



                    </TableBody>
                </Table>
            </TableContainer>
            <Grid container mt={2} p={2}>
                <Grid item xs={4}>
                    <SelectField
                        size="small"
                        label={'Payment Method'}
                        options={parentAccounts}

                        selected={selectedParentAccount}
                        onSelect={(value) => {
                            setSelectedParentAccount(value)
                            console.log(value);
                            setValue1('parentAccount', value)

                        }}
                        //  error={errors?.service?.message}
                        register={register1("parentAccount", {
                            required: "Please select a parentAccount.",
                        })}
                        error={errors1?.parentAccount?.message}
                    />
                </Grid>
            </Grid>
            {/* <Grid container mt={2} spacing={2}>
                <Grid item md={3} sm={12} xs={12}>
                    <SelectField
                        label="Payment Mode"
                        size="small"
                        options={[
                            { id: "Cash", name: "Cash" },
                            { id: "Bank", name: "Bank" },
                            { id: "Card", name: "Card" },
                            { id: "Payment Link", name: "Payment Link" },
                        ]}
                        selected={watch1("payment")}
                        onSelect={(value) => {
                            setValue1("payment", value)
                            setSelectedMode(value)
                        }}
                        register={register1("payment", {
                            required: "Please select payment mode",
                        })}
                        error={errors1?.payment?.message}
                    />
                </Grid>
                {selectedMode?.id == "Bank" && (
                    <Grid item md={3} sm={12} xs={12}>
                        <SelectField
                            label="Banks"
                            size="small"
                            options={banks}
                            selected={selectedBank}
                            onSelect={(value) => {
                                setSelectedBank(value)
                            }}
                            register={register1("bank", {
                                required: "Please select a bank",
                            })}
                            error={errors1?.bank?.message}
                        />
                    </Grid>
                )}
                {selectedMode?.id == "Card" && (
                    <Grid item md={3} sm={12} xs={12}>
                        <SelectField
                            label="Card"
                            size="small"
                            options={cards}
                            selected={selectedCard}
                            onSelect={(value) => {
                                setSelectedCard(value)
                            }}
                            register={register1("card", {
                                required: "Please select a card",
                            })}
                            error={errors1?.card?.message}
                        />
                    </Grid>
                )}
                {selectedMode?.id == "Card" && <Grid item md={3} sm={12} xs={12}>
                    <InputField
                        label="Authorization Code"
                        size="small"
                        placeholder="Authorization Code"
                        register={register1("remarks", {
                            required: "Please enter code",
                        })}
                        error={errors1?.remarks?.message}
                    />
                </Grid>}
            </Grid> */}
            <Grid container spacing={2} mt={2} p={2} >

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
                    disabled={rows?.length == 0}
                    title="Update"
                    type={'submit'}
                    loading={loading}

                />
            </Box>

        </Box>
    );
}

export default UpdatePaymentVoucher;