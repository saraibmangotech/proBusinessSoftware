import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid, InputLabel,
    FormControl,
    Select,
    MenuItem,
    ListItemText,
    Tooltip,
    Checkbox,
    InputAdornment,
    TextField,
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
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import DataTable from 'components/DataTable';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';
import { useAuth } from 'context/UseContext';

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

function SalaryList() {

    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [status, setStatus] = useState(null)
    const [statusDialog, setStatusDialog] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const [tableLoader, setTableLoader] = useState(false)
    const { user } = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        reset,
    } = useForm();

    const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Token Number.', key: '' }, { name: 'Customer ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]


    const [loader, setLoader] = useState(false);

    const [confirmationDialog, setConfirmationDialog] = useState(false)

    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);



    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);



    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [sort, setSort] = useState('desc')

    // *For Get Customer Queue







    const getCustomerQueue = async (page, limit, filter) => {
        setLoader(true)

        try {

            let params = {
                page: 1,
                limit: 999999,


            }

            const { data } = await CustomerServices.getReceptionsList(params)
            setCustomerQueue(data?.rows)

        } catch (error) {
            showErrorToast(error)
        } finally {
            setLoader(false)
        }
    }






    const handleSort = (key) => {
        let data = {
            sort_by: key,
            sort_order: sort
        }
        Debounce(() => getCustomerQueue(1, '', data));
    }



    // *For Handle Filter

    const handleFilter = () => {
        let data = {
            search: getValues('search')
        }
        Debounce(() => getCustomerQueue(1, '', data));
    }
    const handleDelete = async (item) => {


        try {
            let params = { reception_id: selectedData?.id }


            const { message } = await CustomerServices.deleteReception(params)

            SuccessToaster(message);
            getCustomerQueue()
        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }
    const UpdateStatus = async () => {
        try {
            let obj = {
                customer_id: selectedData?.id,
                is_active: status?.id,
            };

            const promise = CustomerServices.CustomerStatus(obj);
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
                setStatusDialog(false);
                setStatus(null)
                getCustomerQueue();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const initialData = [
        {
            id: "1",
            masId: "EMP001",
            desg: "Manager",
            cnic: "12345-1234567-1",
            name: "John Doe",
            days: 30,
            bsSal: 50000,
            lve: 2,
            abs: 1,
            salPerDay: 1667,
            absAmt: 1667,
            ot: 5,
            otRate: 200,
            otAmt: 1000,
            night: 0,
            aa: 2000,
            fuel: 1500,
            arr: 0,
            ded: 0,
            loan: 0,
            tax: 5000,
            grSal: 52500,
            adv: 0,
            netSal: 47500,
        },
        {
            id: "2",
            masId: "EMP002",
            desg: "Developer",
            cnic: "12345-1234567-2",
            name: "Jane Smith",
            days: 30,
            bsSal: 45000,
            lve: 1,
            abs: 0,
            salPerDay: 1500,
            absAmt: 0,
            ot: 8,
            otRate: 180,
            otAmt: 1440,
            night: 2,
            aa: 1800,
            fuel: 1200,
            arr: 0,
            ded: 0,
            loan: 0,
            tax: 4500,
            grSal: 48240,
            adv: 0,
            netSal: 43740,
        },
    ]
    const [data, setData] = useState(initialData)
    const [loading] = useState(false)
    const [selectedRows, setSelectedRows] = useState(new Set())

    // Memoize the handleInputChange function to prevent unnecessary re-renders
    const handleInputChange = useCallback((id, field, value) => {
        const numericValue = Number.parseFloat(value) || 0
    
        setData((prevData) =>
          prevData.map((row) => {
            if (row.id === id) {
              // Update the changed field
              const updatedRow = { ...row, [field]: numericValue }
    
              // Recalculate net salary if any of the calculation fields changed
              if (["arr", "ded", "loan", "tax"].includes(field)) {
                // NetSal = GrSal + Arr - Ded - Loan - Tax
                const newNetSal = updatedRow.grSal + updatedRow.arr - updatedRow.ded - updatedRow.loan - updatedRow.tax
                updatedRow.netSal = newNetSal
              }
    
              return updatedRow
            }
            return row
          }),
        )
      }, [])
    

    // Handle individual row selection
    const handleRowSelect = useCallback((rowId, checked) => {
        setSelectedRows((prev) => {
            const newSet = new Set(prev)
            if (checked) {
                newSet.add(rowId)
            } else {
                newSet.delete(rowId)
            }
            return newSet
        })
    }, [])

    // Handle select all functionality
    const handleSelectAll = useCallback(
        (checked) => {
            if (checked) {
                setSelectedRows(new Set(data.map((row) => row.id)))
            } else {
                setSelectedRows(new Set())
            }
        },
        [data],
    )

    // Bulk actions for selected rows
    const handleDeleteSelected = useCallback(() => {
        setData((prevData) => prevData.filter((row) => !selectedRows.has(row.id)))
        setSelectedRows(new Set())
    }, [selectedRows])

    const handleDuplicateSelected = useCallback(() => {
        const selectedData = data.filter((row) => selectedRows.has(row.id))
        const duplicatedRows = selectedData.map((row) => ({
            ...row,
            id: `${row.id}_copy_${Date.now()}`,
            masId: `${row.masId}_COPY`,
        }))
        setData((prevData) => [...prevData, ...duplicatedRows])
        setSelectedRows(new Set())
    }, [data, selectedRows])

    // Memoize the columns array to prevent table re-rendering
    const columns = useMemo(
        () => [
            // Selection column
            {
                header: "Select",
                accessorKey: "select",
                isSelection: true,
            },
            { header: "Mas.ID", accessorKey: "masId" },
            { header: "Desg.", accessorKey: "desg" },
            { header: "CNIC", accessorKey: "cnic" },
            { header: "Name", accessorKey: "name" },
            { header: "Days", accessorKey: "days" },
            { header: "Bs Sal", accessorKey: "bsSal" },
            { header: "Lve", accessorKey: "lve" },
            { header: "Abs", accessorKey: "abs" },
            { header: "Sal/Day", accessorKey: "salPerDay" },
            { header: "AbsAmt", accessorKey: "absAmt" },
            { header: "OT", accessorKey: "ot" },
            { header: "OT Rt", accessorKey: "otRate" },
            { header: "OT Am", accessorKey: "otAmt" },
            { header: "Nght", accessorKey: "night" },
            { header: "AA", accessorKey: "aa" },
            { header: "Fuel", accessorKey: "fuel" },

            // Editable input columns
            {
                header: "Arr.",
                accessorKey: "arr",
                isEditable: true,
            },
            {
                header: "Ded.",
                accessorKey: "ded",
                isEditable: true,
            },
            {
                header: "Loan",
                accessorKey: "loan",
                isEditable: true,
            },
            {
                header: "Tax",
                accessorKey: "tax",
                isEditable: true,
            },

            { header: "GrSal", accessorKey: "grSal" },
            { header: "Adv", accessorKey: "adv" },
            { header: "NetSal", accessorKey: "netSal" },
        ],
        [],
    )

    useEffect(() => {
        getCustomerQueue()
    }, []);

    if (loading) {
        return <div className="flex justify-center p-4">Loading...</div>
    }





    return (
        <Box sx={{ p: 3 }}>
            <SimpleDialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
                title={"Change Status?"}
            >
                <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={"small"}
                                label={"Select Status :"}
                                options={[
                                    { id: "Pending", name: "Pending" },
                                    { id: "In Progress", name: "In Progress" },

                                    { id: "Completed", name: "Completed" },


                                ]}
                                selected={status}
                                onSelect={(value) => {
                                    setStatus(value);
                                }}
                                error={errors?.status?.message}
                                register={register("status", {
                                    required: "Please select status.",
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
                                <PrimaryButton
                                    bgcolor={Colors.primary}
                                    title="Yes,Confirm"
                                    type="submit"
                                />
                                <PrimaryButton
                                    onClick={() => setStatusDialog(false)}
                                    bgcolor={"#FF1F25"}
                                    title="No,Cancel"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>
            <ConfirmationDialog
                open={confirmationDialog}
                onClose={() => setConfirmationDialog(false)}
                message={"Are You Sure?"}
                action={() => {
                    setConfirmationDialog(false);
                    handleDelete()

                }}
            />
            <SimpleDialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
                title={"Change Status?"}
            >
                <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={"small"}
                                label={"Select Status :"}
                                options={

                                    [
                                        { id: false, name: "Disabled" },
                                        { id: true, name: "Enabled" },

                                    ]}
                                selected={status}
                                onSelect={(value) => {
                                    setStatus(value);
                                }}
                                error={errors?.status?.message}
                                register={register("status", {
                                    required: "Please select status.",
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
                                <PrimaryButton
                                    bgcolor={Colors.primary}
                                    title="Yes,Confirm"
                                    type="submit"
                                />
                                <PrimaryButton
                                    onClick={() => setStatusDialog(false)}
                                    bgcolor={"#FF1F25"}
                                    title="No,Cancel"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>


            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Salary List</Typography>



            </Box>

            {/* Filters */}
            <Box >


            <Box sx={{ width: "100%" }}>
   

      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="employee data table" size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.header}
                  align="left"
                  sx={{
                    minWidth: column.isSelection ? 70 : 100,
                    backgroundColor: "#f5f5f5",
                    fontWeight: "bold",
                  }}
                >
                  {column.isSelection ? (
                    <Checkbox
                      color="primary"
                      checked={selectedRows.size === data.length && data.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      inputProps={{ "aria-label": "select all rows" }}
                    />
                  ) : (
                    column.header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                hover
                selected={selectedRows.has(row.id)}
                sx={{ "&.Mui-selected": { backgroundColor: "rgba(25, 118, 210, 0.08)" } }}
              >
                {columns.map((column) => (
                  <TableCell key={`${row.id}-${column.header}`} padding="normal">
                    {column.isSelection ? (
                      <Checkbox
                        color="primary"
                        checked={selectedRows.has(row.id)}
                        onChange={(e) => handleRowSelect(row.id, e.target.checked)}
                        inputProps={{ "aria-labelledby": row.id }}
                      />
                    ) : column.isEditable ? (
                      <TextField
                        type="number"
                        variant="standard"
                        value={row[column.accessorKey] || 0}
                        onChange={(e) => handleInputChange(row.id, column.accessorKey, e.target.value)}
                        InputProps={{ disableUnderline: false }}
                        sx={{ width: "100%" }}
                        inputProps={{ step: "0.01" }}
                      />
                    ) : (
                      <Typography variant="body2">
                        {typeof row[column.accessorKey] === "number"
                          ? row[column.accessorKey].toLocaleString()
                          : row[column.accessorKey]}
                      </Typography>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
            </Box>

        </Box>
    );
}

export default SalaryList;