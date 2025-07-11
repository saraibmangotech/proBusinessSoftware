"use client"

import { useEffect, useRef, useState } from "react"
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    tableCellClasses,
    Grid,
    TextField,
    Button,
} from "@mui/material"
import styled from "@emotion/styled"
import { useNavigate } from "react-router-dom"
import Colors from "assets/Style/Colors"
import { CircleLoading } from "components/Loaders"
import { SuccessToaster } from "components/Toaster"
import CustomerServices from "services/Customer"
import { makeStyles } from "@mui/styles"
import { Debounce } from "utils"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import SimpleDialog from "components/Dialog/SimpleDialog"
import { PrimaryButton } from "components/Buttons"
import SelectField from "components/Select"
import { showErrorToast, showPromiseToast } from "components/NewToaster"
import ConfirmationDialog from "components/Dialog/ConfirmationDialog"
import { useAuth } from "context/UseContext"
import SystemServices from "services/System"

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
    border: 0,
}))

const Cell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        fontSize: 12,
        fontFamily: "Public Sans",
        border: "1px solid #EEEEEE",
        padding: "8px",
        textAlign: "center",
        whiteSpace: "nowrap",
        color: "#434343",
        background: "transparent",
        fontWeight: "bold",
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 12,
        fontFamily: "Public Sans",
        textWrap: "nowrap",
        padding: "8px !important",
        textAlign: "center",
        ".MuiBox-root": {
            display: "flex",
            gap: "6px",
            alignItems: "center",
            justifyContent: "center",
            ".MuiBox-root": {
                cursor: "pointer",
            },
        },
        svg: {
            width: "auto",
            height: "24px",
        },
        ".MuiTypography-root": {
            textTransform: "capitalize",
            fontFamily: "Public Sans",
            textWrap: "nowrap",
        },
        ".MuiButtonBase-root": {
            padding: "8px",
            width: "28px",
            height: "28px",
        },
    },
}))

const useStyles = makeStyles({
    loaderWrap: {
        display: "flex",
        height: 100,
        "& svg": {
            width: "40px !important",
            height: "40px !important",
        },
    },
})

function EmployeeLeaves() {
    const navigate = useNavigate()
    const classes = useStyles()
    const dispatch = useDispatch()
    const contentRef = useRef(null)
    const [status, setStatus] = useState(null)
    const [statusDialog, setStatusDialog] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const [tableLoader, setTableLoader] = useState(false)
    const { user } = useAuth()
    const [editingRow, setEditingRow] = useState(null)
    const [editedData, setEditedData] = useState({})

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        reset,
    } = useForm()

    const [loader, setLoader] = useState(false)
    const [confirmationDialog, setConfirmationDialog] = useState(false)

    // *For Employee Leaves
    const [employeeLeaves, setEmployeeLeaves] = useState([])
    const [totalCount, setTotalCount] = useState(0)
    const [pageLimit, setPageLimit] = useState(50)
    const [currentPage, setCurrentPage] = useState(1)

    // *For Filters
    const [filters, setFilters] = useState({})

    // *For Permissions
    const [permissions, setPermissions] = useState()
    const [loading, setLoading] = useState(false)
    const [sort, setSort] = useState("desc")

    // Sample data with gender and annual fees
    const sampleData = [
        {
            id: 65,
            user_id: 30002,
            annual_fees: 5000,
            sick_leave_full: 15,
            sick_leave_full_balance: 15,
            sick_leave_half: 30,
            sick_leave_half_balance: 30,
            sick_leave_unpaid: 45,
            sick_leave_unpaid_balance: 45,
            maternity_leave_full: 0,
            maternity_leave_full_balance: 0,
            maternity_leave_half: 0,
            maternity_leave_half_balance: 0,
            maternity_leave_unpaid: 0,
            maternity_leave_unpaid_balance: 0,
            bereavement_leave_spouse: 5,
            bereavement_leave_other: 3,
            parental_leave: 5,
            annual_leave: 24,
            annual_leave_balance: "0.0",
            created_at: "2025-07-08T06:46:28.266Z",
            updated_at: "2025-07-08T06:46:28.266Z",
            user: {
                id: 30002,
                name: "Staff",
                ref_id: "S-30002",
                phone: "132456780",
                email: "staff@pro.com",
                employee_id: null,
                role_id: 1001,
                is_active: true,
                gender: "male", // Added gender field
            },
        },
        {
            id: 64,
            user_id: 105,
            annual_fees: 4500,
            sick_leave_full: 15,
            sick_leave_full_balance: 15,
            sick_leave_half: 30,
            sick_leave_half_balance: 30,
            sick_leave_unpaid: 45,
            sick_leave_unpaid_balance: 45,
            maternity_leave_full: 90,
            maternity_leave_full_balance: 90,
            maternity_leave_half: 60,
            maternity_leave_half_balance: 60,
            maternity_leave_unpaid: 30,
            maternity_leave_unpaid_balance: 30,
            bereavement_leave_spouse: 5,
            bereavement_leave_other: 3,
            parental_leave: 5,
            annual_leave: 24,
            annual_leave_balance: "0.0",
            created_at: "2025-07-08T06:46:27.977Z",
            updated_at: "2025-07-08T06:46:27.977Z",
            user: {
                id: 105,
                name: "Aaisha Ahmed Mohammed Albalushi",
                ref_id: "S-105",
                phone: "0540144024",
                email: "aaisha@gmail.com",
                employee_id: "4014",
                role_id: 4,
                is_active: true,
                gender: "female", // Added gender field
            },
        },
        {
            id: 63,
            user_id: 107,
            annual_fees: 5500,
            sick_leave_full: 15,
            sick_leave_full_balance: 15,
            sick_leave_half: 30,
            sick_leave_half_balance: 30,
            sick_leave_unpaid: 45,
            sick_leave_unpaid_balance: 45,
            maternity_leave_full: 0,
            maternity_leave_full_balance: 0,
            maternity_leave_half: 0,
            maternity_leave_half_balance: 0,
            maternity_leave_unpaid: 0,
            maternity_leave_unpaid_balance: 0,
            bereavement_leave_spouse: 5,
            bereavement_leave_other: 3,
            parental_leave: 5,
            annual_leave: 24,
            annual_leave_balance: "0.0",
            created_at: "2025-07-08T06:46:27.687Z",
            updated_at: "2025-07-08T06:46:27.687Z",
            user: {
                id: 107,
                name: "Jassem Mohammad Aziz Nasab",
                ref_id: "S-107",
                phone: "0540164016",
                email: "jassem@gmail.com",
                employee_id: "4016",
                role_id: 4,
                is_active: true,
                gender: "male", // Added gender field
            },
        },
    ]

    // *For Get Employee Leaves
    const getEmployeeLeaves = async (page, limit, filter) => {
        setLoader(true)
        try {
            const params = {
                page: 1,
                limit: 999999,
            }

            // Replace with actual API call
            const { data } = await CustomerServices.getEmployeeLeaves(params);
            console.log(data?.leaves?.rows, 'data');
            setEmployeeLeaves(data?.leaves?.rows);

            //   // Using sample data for now
            //   setEmployeeLeaves(sampleData)
        } catch (error) {
            showErrorToast(error)
        } finally {
            setLoader(false)
        }
    }

    const handleSort = (key) => {
        const data = {
            sort_by: key,
            sort_order: sort,
        }
        Debounce(() => getEmployeeLeaves(1, "", data))
    }

    // *For Handle Filter
    const handleFilter = () => {
        const data = {
            search: getValues("search"),
        }
        Debounce(() => getEmployeeLeaves(1, "", data))
    }

    const handleDelete = async (item) => {
        try {
            const params = { reception_id: selectedData?.id }
            const { message } = await CustomerServices.deleteReception(params)
            SuccessToaster(message)
            getEmployeeLeaves()
        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }

    const UpdateStatus = async () => {
        try {
            const obj = {
                customer_id: selectedData?.id,
                is_active: status?.id,
            }
            const promise = CustomerServices.CustomerStatus(obj)
            console.log(promise)
            showPromiseToast(promise, "Saving...", "Added Successfully", "Something Went Wrong")
            // Await the promise and then check its response
            const response = await promise
            if (response?.responseCode === 200) {
                setStatusDialog(false)
                setStatus(null)
                getEmployeeLeaves()
            }
        } catch (error) {
            console.log(error)
        }
    }

    // Check if field is a balance field (should be locked)
    const isBalanceField = (fieldName) => {
        return fieldName.includes("balance")
    }

    // Check if field is maternity related and user is male
    const isMaternityFieldDisabledForMale = (row, fieldName) => {
        return fieldName.includes("maternity") && row.user?.gender === "male"
    }

    // Handle edit mode
    const handleEdit = (row) => {
        setEditingRow(row.id)
        setEditedData({ ...row })
    }

    // Handle field change
    const handleFieldChange = (fieldName, value) => {
        setEditedData((prev) => ({
            ...prev,
            [fieldName]: value,
        }))
    }

    // Handle update
    const handleUpdate = async (row) => {
        console.log("Updated row data:", editedData)
        // Update the employeeLeaves state with edited data
        setEmployeeLeaves((prev) => prev.map((item) => (item.id === editedData.id ? editedData : item)))

        setEditingRow(null)
        setEditedData({})
        const promise = SystemServices.updateEmployeeLeaves(editedData)
        const response = await promise
        showPromiseToast(promise, "Saving...", "Added Successfully", "Something Went Wrong")
        if (response?.responseCode === 200) {
            getEmployeeLeaves()
        }



        // Here you would typically make an API call to update the data
        // await CustomerServices.updateEmployeeLeave(editedData);
    }

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingRow(null)
        setEditedData({})
    }

    // Render editable field
    const renderEditableField = (row, fieldName, value) => {
        const isEditing = editingRow === row.id
        const isLocked = isBalanceField(fieldName)
        const isMaternityDisabled = isMaternityFieldDisabledForMale(row, fieldName)

        if (isLocked || isMaternityDisabled) {
            return (
                <TextField
                    value={value || 0}
                    size="small"
                    disabled
                    sx={{
                        width: "70px",
                        "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: isMaternityDisabled ? "#ff6b6b" : "#666",
                            backgroundColor: isMaternityDisabled ? "#ffe6e6" : "#f5f5f5",
                        },
                    }}
                />
            )
        }

        if (isEditing) {
            return (
                <TextField
                    value={editedData[fieldName] || value || 0}
                    onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                    size="small"
                    type="number"
                    sx={{ width: "70px" }}
                />
            )
        }

        return <Typography variant="body2">{value || 0}</Typography>
    }

    useEffect(() => {
        getEmployeeLeaves()
    }, [])

    return (
        <Box sx={{ p: 3 }}>
            <ConfirmationDialog
                open={confirmationDialog}
                onClose={() => setConfirmationDialog(false)}
                message={"Are You Sure?"}
                action={() => {
                    setConfirmationDialog(false)
                    handleDelete()
                }}
            />

            <SimpleDialog open={statusDialog} onClose={() => setStatusDialog(false)} title={"Change Status?"}>
                <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={"small"}
                                label={"Select Status :"}
                                options={[
                                    { id: false, name: "Disabled" },
                                    { id: true, name: "Enabled" },
                                ]}
                                selected={status}
                                onSelect={(value) => {
                                    setStatus(value)
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
                                <PrimaryButton bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => setStatusDialog(false)} bgcolor={"#FF1F25"} title="No,Cancel" />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>Employee Leaves Management</Typography>
            </Box>

            {/* Employee Leaves Table */}
            <TableContainer component={Paper} sx={{ mt: 2, maxHeight: "80vh", overflow: "auto" }}>
                <Table stickyHeader>
                    <TableHead>
                        <Row>

                            <Cell sx={{ minWidth: 150, position: "sticky", left: 0, backgroundColor: "white", zIndex: 10 }}>
                                Employee Info
                            </Cell>
                            <Cell sx={{ minWidth: 80 }}>Annual Leave</Cell>
                            <Cell sx={{ minWidth: 80 }}>Annual Leave Balance</Cell>
                            <Cell sx={{ minWidth: 80 }}>Sick Leave Full</Cell>
                            <Cell sx={{ minWidth: 80 }}>Sick Leave Full Balance</Cell>
                            <Cell sx={{ minWidth: 80 }}>Sick Leave Half</Cell>
                            <Cell sx={{ minWidth: 80 }}>Sick Leave Half Balance</Cell>
                            <Cell sx={{ minWidth: 80 }}>Sick Leave Unpaid</Cell>
                            <Cell sx={{ minWidth: 80 }}>Sick Leave Unpaid Balance</Cell>
                            <Cell sx={{ minWidth: 80 }}>Maternity Leave Full</Cell>
                            <Cell sx={{ minWidth: 80 }}>Maternity Leave Full Balance</Cell>
                            <Cell sx={{ minWidth: 80 }}>Maternity Leave Half</Cell>
                            <Cell sx={{ minWidth: 80 }}>Maternity Leave Half Balance</Cell>
                            <Cell sx={{ minWidth: 80 }}>Maternity Leave Unpaid</Cell>
                            <Cell sx={{ minWidth: 80 }}>Maternity Leave Unpaid Balance</Cell>
                            <Cell sx={{ minWidth: 80 }}>Bereavement Leave Spouse</Cell>
                            <Cell sx={{ minWidth: 80 }}>Bereavement Leave Other</Cell>
                            <Cell sx={{ minWidth: 80 }}>Parental Leave</Cell>

                            <Cell sx={{ minWidth: 120 }}>Actions</Cell>
                        </Row>
                    </TableHead>
                    <TableBody>
                        {loader ? (
                            <Row>
                                <Cell colSpan={20}>
                                    <Box className={classes.loaderWrap} justifyContent="center" alignItems="center">
                                        <CircleLoading />
                                    </Box>
                                </Cell>
                            </Row>
                        ) : employeeLeaves.length > 0 ? (
                            employeeLeaves.map((row) => (
                                <Row key={row.id}>

                                    <Cell sx={{ position: "sticky", left: 0, backgroundColor: "white", zIndex: 5 }}>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                                {row.user?.name}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {row.user?.employee_id}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                display="block"
                                                color={row.user?.gender === "male" ? "primary" : "secondary"}
                                                fontWeight="bold"
                                            >
                                                {row.user?.gender?.toUpperCase()}
                                            </Typography>
                                        </Box>
                                    </Cell>
                                    <Cell>{renderEditableField(row, "annual_leave", row.annual_leave)}</Cell>
                                    <Cell>{renderEditableField(row, "annual_leave_balance", row.annual_leave_balance)}</Cell>
                                    <Cell>{renderEditableField(row, "sick_leave_full", row.sick_leave_full)}</Cell>
                                    <Cell>{renderEditableField(row, "sick_leave_full_balance", row.sick_leave_full_balance)}</Cell>
                                    <Cell>{renderEditableField(row, "sick_leave_half", row.sick_leave_half)}</Cell>
                                    <Cell>{renderEditableField(row, "sick_leave_half_balance", row.sick_leave_half_balance)}</Cell>
                                    <Cell>{renderEditableField(row, "sick_leave_unpaid", row.sick_leave_unpaid)}</Cell>
                                    <Cell>{renderEditableField(row, "sick_leave_unpaid_balance", row.sick_leave_unpaid_balance)}</Cell>
                                    <Cell>{renderEditableField(row, "maternity_leave_full", row.maternity_leave_full)}</Cell>
                                    <Cell>
                                        {renderEditableField(row, "maternity_leave_full_balance", row.maternity_leave_full_balance)}
                                    </Cell>
                                    <Cell>{renderEditableField(row, "maternity_leave_half", row.maternity_leave_half)}</Cell>
                                    <Cell>
                                        {renderEditableField(row, "maternity_leave_half_balance", row.maternity_leave_half_balance)}
                                    </Cell>
                                    <Cell>{renderEditableField(row, "maternity_leave_unpaid", row.maternity_leave_unpaid)}</Cell>
                                    <Cell>
                                        {renderEditableField(row, "maternity_leave_unpaid_balance", row.maternity_leave_unpaid_balance)}
                                    </Cell>
                                    <Cell>{renderEditableField(row, "bereavement_leave_spouse", row.bereavement_leave_spouse)}</Cell>
                                    <Cell>{renderEditableField(row, "bereavement_leave_other", row.bereavement_leave_other)}</Cell>
                                    <Cell>{renderEditableField(row, "parental_leave", row.parental_leave)}</Cell>

                                    <Cell>
                                        <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
                                            {editingRow === row.id ? (
                                                <>
                                                    <Button size="small" variant="contained" color="primary" onClick={() => handleUpdate(row)}>
                                                        Save
                                                    </Button>
                                                    <Button size="small" variant="outlined" onClick={handleCancelEdit}>
                                                        Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button size="small" variant="contained" color="primary" onClick={() => handleEdit(row)}>
                                                    Edit
                                                </Button>
                                            )}
                                        </Box>
                                    </Cell>
                                </Row>
                            ))
                        ) : (
                            <Row>
                                <Cell colSpan={20}>
                                    <Typography textAlign="center" color="textSecondary">
                                        No employee leaves data found
                                    </Typography>
                                </Cell>
                            </Row>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>


        </Box>
    )
}

export default EmployeeLeaves
