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
import Colors from "assets/Style/Colors" // Assuming this is not a standard import in Next.js
import { CircleLoading } from "components/Loaders" // Assuming this is not a standard import in Next.js
import { SuccessToaster } from "components/Toaster" // Assuming this is not a standard import in Next.js
import CustomerServices from "services/Customer" // Assuming this is a placeholder for an actual service
import { makeStyles } from "@mui/styles"

import { useForm } from "react-hook-form"

import { PrimaryButton } from "components/Buttons" // Assuming this is not a standard import in Next.js
import SelectField from "components/Select" // Assuming this is not a standard import in Next.js
import { showErrorToast, showPromiseToast } from "components/NewToaster" // Assuming this is not a standard import in Next.js
import ConfirmationDialog from "components/Dialog/ConfirmationDialog" // Assuming this is not a standard import in Next.js
import { useAuth } from "context/UseContext"
import { Debounce } from "utils"
import SystemServices from "services/System"
import SimpleDialog from "components/Dialog/SimpleDialog"








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
    const navigate = () => { } // Mock useNavigate
    const classes = useStyles()

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
    const [originalData, setOriginalData] = useState([])

    // *For Get Employee Leaves
    const getEmployeeLeaves = async (page, limit, filter) => {
        setLoader(true)
        try {
            const params = {
                page: page || 1,
                limit: limit || 999999,
                ...filter, // Spread the filter object here
            }
            const { data } = await CustomerServices.getEmployeeLeaves(params)
            console.log(data?.leaves?.rows, "data")
            setOriginalData(data?.leaves?.rows)
            setEmployeeLeaves(data?.leaves?.rows)
        } catch (error) {
            showErrorToast(error)
        } finally {
            setLoader(false)
        }
    }
    console.log(employeeLeaves, 'employeeLeaves');

    const handleSort = (key) => {
        const data = {
            sort_by: key,
            sort_order: sort,
        }
        Debounce(() => getEmployeeLeaves(1, "", data))
    }
    // *For Handle Filter
    const handleFilter = () => {
        const searchTerm = getValues("search")?.toLowerCase() || "";
        if (searchTerm) {

            const filteredData = originalData.filter((item) => {
                const nameMatch = item?.user?.name?.toLowerCase().includes(searchTerm);
                const idMatch = item?.user?.employee_id?.toLowerCase().includes(searchTerm);
                return nameMatch || idMatch;
            });

            console.log("Filtered Data:", filteredData);
            setEmployeeLeaves(filteredData)
        }
        else {
            setEmployeeLeaves(originalData)
        }
    };

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
        if (isMaternityDisabled) {
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
                                <PrimaryButton bgcolor={"#1976d2"} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => setStatusDialog(false)} bgcolor={"#FF1F25"} title="No,Cancel" />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>Employee Leaves Management</Typography>
            </Box>
            {/* Search Filter */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        {...register("search")}
                        label="Search by Name or Employee ID"
                        variant="outlined"
                        size="small"
                        fullWidth

                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Button variant="contained" onClick={() => handleFilter()}>
                        Search
                    </Button>
                </Grid>
            </Grid>
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
