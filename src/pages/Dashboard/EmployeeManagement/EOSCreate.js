"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
    IconButton,
    ListSubheader,
    InputAdornment,
    Checkbox,
} from "@mui/material"

import styled from "@emotion/styled"
import { useNavigate } from "react-router-dom"
import { makeStyles } from "@mui/styles"
import { useForm } from "react-hook-form"
import DeleteIcon from "@mui/icons-material/Delete"
import SearchIcon from "@mui/icons-material/Search"
import { showErrorToast, showPromiseToast } from "components/NewToaster"
import CustomerServices from "services/Customer"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs from "dayjs"
import moment from "moment"
import { PrimaryButton } from "components/Buttons"
import UserServices from "services/User"

// *For Table Style
const Cell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        fontSize: 11,
        fontFamily: "Public Sans",
        padding: "6px",
        textAlign: "center",
        whiteSpace: "nowrap",
        color: "#ffffff",
        backgroundColor: "#1e3a8a",
        fontWeight: "bold",
        minWidth: "70px",
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 11,
        fontFamily: "Public Sans",
        textWrap: "nowrap",
        padding: "3px !important",
        textAlign: "center",
        border: "1px solid #EEEEEE",
        backgroundColor: "#ffffff",
    },
}))

const useStyles = makeStyles({
    autoColumn: {
        backgroundColor: "#e3f2fd !important",
    },
    manualColumn: {
        backgroundColor: "#fff3e0 !important",
    },
    gpssaColumn: {
        backgroundColor: "#ffff00 !important",
    },
})

function EOSCreate() {
    const navigate = useNavigate()
    const classes = useStyles()
    const contentRef = useRef(null)
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [selectAll, setSelectAll] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        reset,
    } = useForm()

    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([])
    const [searchText, setSearchText] = useState("")
    const [employess, setEmployess] = useState([])
    const [selectedMonth, setSelectedMonth] = useState(dayjs())
    const [selectedCostCenter, setSelectedCostCenter] = useState(null)
    const [costCenters, setCostCenters] = useState([])
    const [filtertedCostCenters, setFiltertedCostCenters] = useState([])
    console.log(selectedEmployeeIds, 'selectedEmployeeIds222')

    const getCustomerQueue = async (page, limit, filter) => {
        try {
            const params = {
                page: 1,
                limit: 999999,
            }

            const { data } = await CustomerServices.getEmployees(params)
            setEmployess(data?.employees?.rows)
        } catch (error) {
            showErrorToast(error)
        }
    }

    // Updated column configuration with action column
    const columnConfig = [
        { key: "employeeName", header: "Employee Name", type: "auto" },
        { key: "joinDate", header: "Join Date", type: "auto" },
        { key: "division", header: "Division", type: "auto" },
        { key: "working_days", header: "Working Days", type: "manual" },
        { key: "employeeId", header: "Employee ID", type: "auto" },
        { key: "local", header: "Local/Non Local ", type: "auto" },
        { key: "salaryPaid", header: "Salary Basic", type: "auto" },
        { key: "housing_allowance", header: "Housing Allowance", type: "auto" },
        { key: "transport_allowance", header: "Transport Allowance", type: "auto" },
        { key: "other_allowance", header: "Others", type: "auto" },
        { key: "salaryPackage", header: "Salary Package", type: "auto" },
        { key: "commission", header: "Commission", type: "manual" },
        { key: "otherAdd", header: "Other Add", type: "manual" },
        { key: "al", header: "AL/SL", type: "manual" },
        { key: "arrear", header: "Airfare", type: "manual" },
        { key: "eos", header: "Gratuity", type: "manual" },
        { key: "leaves_encashment", header: "Leave Encash", type: "manual" },
        { key: "gpssaEmp", header: "GPSSA", type: "manual", isGpssa: true },
        { key: "staffAdvance", header: "Staff Advance", type: "manual" },
        { key: "lateComm", header: "Late Coming", type: "manual" },
        { key: "additional", header: "Additional", type: "manual" },
        { key: "salaryDeduction", header: "Salary Deduction", type: "manual" },
        { key: "unpaidLeave", header: "Unpaid Deduction", type: "manual" },
        { key: "totalPay", header: "Total pay", type: "auto" },
        { key: "commissionFinal", header: "Commission Return", type: "manual" },
        { key: "netSalary", header: "Net Salary", type: "auto" },
        // New administrative columns - all auto
        { key: "routingCode", header: "ROUTING CODE", type: "auto" },
        { key: "salaryIban", header: "SALARY IBAN", type: "auto" },
        { key: "workPermit", header: "WORK PERMIT", type: "auto" },
        { key: "visa", header: "Visa", type: "auto" },
        { key: "branch", header: "BRANCH", type: "auto" },
        { key: "remarks", header: "Remarks", type: "text" },
        { key: "minutesLate", header: "Minutes Late", type: "manual" },
        { key: "alDay", header: "AL Day", type: "auto" },
        { key: "actions", header: "Actions", type: "action" },
    ]

    // Start with empty table
    const [data, setData] = useState([])

    // Filter employees based on search text
    const filteredEmployees = employess.filter((employee) => {
        const searchLower = searchText?.toLowerCase()
        return employee?.user?.name?.toLowerCase().includes(searchLower)
    })

    // Generate default employee data
    const generateDefaultEmployeeData = (employee, salary) => {
        console.log(salary, "employeeemployee")
        return {
            user_id: employee?.user_id,
            id: employee.id,
            employeeName: employee.first_name + employee.last_name,
            employeeId: salary.employee?.employee_code,
            salaryPaid: Number.parseFloat(salary.basicSalary) || 0,
            commission: Number.parseFloat(salary?.commission),
            otherAdd: 0,
            al: 0,
            sl: 0,
            arrear: 0,
            eos: Number.parseFloat(salary?.eos || 0),
            leaves_encashment: Number.parseFloat(salary?.leaves_encashment || 0),
            gpssaEmp: Number.parseFloat(salary?.pension || 0),
            staffAdvance: 0,
            lateComm: Number.parseFloat(salary?.lateDeduction),
            additional: 0,
            salaryDeduction: 0,
            unpaidLeave: Number.parseFloat(salary?.absentDeduction || 0),
            totalPay: Number.parseFloat(salary?.netSalary) || 0,
            commissionFinal: 0,
            netSalary: Number.parseFloat(salary.netSalary) || 0,
            // Default administrative data
            routingCode: salary?.employee?.routing,
            salaryIban: salary?.employee?.iban,
            workPermit: salary?.employee?.work_permit,
            visa: salary?.employee?.visa,
            branch: salary?.employee?.branch,
            remarks: "New Employee",
            minutesLate: Number.parseFloat(salary?.totalShortMinutes || 0),
            alDay: Number.parseFloat(salary?.approvedLeaveDays || 0),
        }
    }

    const generateDefaultEmployeeData2 = (salary) => {
        console.log(salary, "employeeemployee")
        const toFixed3 = (val) => Number.parseFloat(Number.parseFloat(val || 0).toFixed(3))

        return {
            user_id: salary?.employee?.user_id,
            id: salary?.employee?.id,
            division: salary?.employee?.cost_center ? salary?.employee?.cost_center : '-',
            employeeName: salary?.employee?.first_name,
            joinDate: moment(salary?.employee?.date_of_joining).format("DD-MM-YYYY"),
            working_days: parseFloat(salary?.workingDays),
            local: salary?.employee?.is_local ? "Local" : "Non Local",
            employeeId: salary.employee?.employee_code,
            remarks: salary.employee?.employee_code,
            salaryPaid: toFixed3(salary.basicSalary),
            commission: toFixed3(salary?.commission),
            housing_allowance: toFixed3(salary?.employee?.housing_allowance),
            transport_allowance: toFixed3(salary?.employee?.transport_allowance),
            other_allowance: toFixed3(salary?.employee?.other_allowance),
            salaryPackage: toFixed3(salary?.salaryPackage),
            otherAdd: 0,
            al: 0,
            sl: 0,
            arrear: toFixed3(salary?.airfareAmount),
            eos: Number.parseFloat(salary?.eos || 0),
            leaves_encashment: Number.parseFloat(salary?.leaves_encashment || 0),
            gpssaEmp: toFixed3(salary?.pension),
            staffAdvance: 0,
            lateComm: toFixed3(salary?.lateDeduction),
            additional: 0,
            salaryDeduction: 0,
            unpaidLeave: toFixed3(salary?.absentDeduction),
            totalPay: toFixed3(salary?.netSalary),
            commissionFinal: 0,
            netSalary: toFixed3(salary?.netSalary),
            routingCode: salary?.employee?.routing,
            salaryIban: salary?.employee?.iban,
            workPermit: salary?.employee?.work_permit,
            visa: salary?.employee?.visa,
            branch: salary?.employee?.branch,

            minutesLate: toFixed3(salary?.totalShortMinutes),
            alDay: toFixed3(salary?.approvedLeaveDays),
        }
    }

    const handleEmployeeSelectionChange2 = async (event) => {
        const selectedId = event.target.value; // ✅ only one ID now
        setSelectedEmployeeId(selectedId);

        console.log("Selected Employee ID:", selectedId);

        try {
            // Find selected employee
            const selectedEmployee = employess.find((emp) => emp.id === selectedId);

            if (!selectedEmployee) return;

            // Call API with the selected employee's user_id
            const { data: salaryResponse } = await CustomerServices.employeeEOSDetail({
                user_id: selectedEmployee.user_id, // ✅ just one user_id now
                month: moment(selectedMonth).month() + 1,
                year: moment(selectedMonth).year(),
            });

            const salaries = salaryResponse?.results || [];
            const newEmployeeDataArray = salaries.map((salary) =>
                generateDefaultEmployeeData2(salary)
            );

            console.log(newEmployeeDataArray, "newEmployeeDataArray");

            // ✅ Replace instead of append
            setData(newEmployeeDataArray);
        } catch (error) {
            console.error("Failed to fetch salaries", error);
        }
    };


    useEffect(() => {
        if (selectAll) {
            const userIds = filteredEmployees.map(emp => emp.id);

            setSelectedEmployeeIds(userIds)
        }
        else {
            setSelectedEmployeeIds([])
        }
    }, [selectAll])

    const handleSelectAll = () => {
        const filteredIds = filteredEmployees.map((emp) => emp.id)

        // Check if all filtered employees are currently selected
        const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedEmployeeIds.includes(id))

        let newSelection

        if (allFilteredSelected) {
            // ✅ Unselect all filtered employees
            newSelection = selectedEmployeeIds.filter((id) => !filteredIds.includes(id))
            console.log("Unselecting all filtered employees")
        } else {
            // ✅ Select all filtered employees (merge with existing, ensure uniqueness)
            newSelection = [...new Set([...selectedEmployeeIds, ...filteredIds])]
            console.log("Selecting all filtered employees")
        }
        // console.log(newSelection, 'newSelectionnewSelection');

        // setSelectedEmployeeIds(newSelection)

        // Call selection handler with the new selection
        handleEmployeeSelectionChange2({ target: { value: newSelection } })
    }

    const handleChipDelete = (employeeIdToRemove) => {
        // Remove from selected IDs
        const updatedSelection = selectedEmployeeIds.filter((id) => id !== employeeIdToRemove)
        setSelectedEmployeeIds(updatedSelection)

        // Remove from data table (no API call needed)
        setData((prevData) => prevData.filter((row) => row.id !== employeeIdToRemove))
    }

    const CreateSalary = async (formData) => {
        try {
            const transformedData = data.map((item) => ({
                user_id: item.user_id,
                salary_paid: item.salaryPaid,
                commission: item.commission,
                working_days: item.working_days,
                other_add: item.otherAdd,
                al: item.al,
                sl: item.sl,
                arrear: item.arrear,
                eos: item?.eos,
                leaves_encashment: item?.leaves_encashment,
                gpssa_emp: item.gpssaEmp,
                housing_allowance: item?.housing_allowance,
                transport_allowance: item?.transport_allowance,
                other_allowance: item?.other_allowance,
                salary_package: item?.salaryPackage,
                staff_advance: item?.staffAdvance,
                late_comm: item?.lateComm,
                additional: item.additional,
                salary_deduction: item.salaryDeduction,
                unpaid_leave: item.unpaidLeave,
                total_pay: item.totalPay,
                commission_final: item.commissionFinal,
                net_salary: item.netSalary,
                routing_code: item.routingCode,
                salary_iban: item.salaryIban,
                work_permit: item.workPermit,
                visa: item.visa,
                branch: item.branch,
                remark: item.remarks,
                minutes_late: item.minutesLate,
                al_day: item.alDay,
            }))

            console.log(transformedData[0])
            console.log(data)

            const obj = {
                status: "Pending",
                month: moment(selectedMonth).month() + 1,
                year: moment(selectedMonth).year(),
                ...transformedData[0],
            }
            console.log(obj);
            

            const promise = UserServices.CreateEos(obj)

            showPromiseToast(promise, "Saving ...", "Success", "Something Went Wrong")

            const response = await promise

            if (response?.responseCode === 200) {
                navigate("/eos-list")
            }
        } catch (error) {
            console.log(error)
        }
    }

    // Handle remove employee
    const handleRemoveEmployee = (employeeId) => {
        setData((prevData) => prevData.filter((row) => row.id !== employeeId))
        setSelectedEmployeeIds((prevIds) => prevIds.filter((id) => id !== employeeId))
    }

    // Handle search input change
    const handleSearchChange = (event) => {
        event.stopPropagation() // Prevent event bubbling
        setSearchText(event.target.value)
    }

    const getCostCenters = async () => {
        try {
            const params = {
                page: 1,
                limit: 999999,
            }

            const { data } = await CustomerServices.getCostCenters(params)
            setCostCenters(data?.cost_centers)
            setFiltertedCostCenters(data?.cost_centers)
            setSelectedCostCenter(null)
        } catch (error) {
            showErrorToast(error)
        }
    }

    useEffect(() => {
        if (data?.length > 0) {
            const sorted = [...data].sort((a, b) => {
                if (!a.rawJoinDate) return 1
                if (!b.rawJoinDate) return -1
                return a.rawJoinDate - b.rawJoinDate // ascending (oldest → newest)
            })
            console.log("Sorted by Join Date:", sorted)
        }
    }, [data]) // ✅ runs whenever data is updated

    useEffect(() => {
        getCostCenters()
        getCustomerQueue()
    }, [])

    // Handle input changes for manual fields
    const handleInputChange = useCallback((id, field, value) => {
        const numericValue = Number.parseFloat(value) || 0

        setData((prevData) => {
            // Remove duplicate user_ids, keeping the first occurrence
            const seenUserIds = new Set()
            const uniqueData = prevData.filter((row) => {
                if (seenUserIds.has(row.user_id)) return false
                seenUserIds.add(row.user_id)
                return true
            })

            // Now update the matching row
            return uniqueData.map((row) => {
                if (row.id === id) {
                    const updatedRow = { ...row, [field]: field === "remarks" ? value : numericValue }

                    const totalPay =
                        (updatedRow.housing_allowance || 0) +
                        (updatedRow.transport_allowance || 0) +
                        (updatedRow.other_allowance || 0) +
                        (updatedRow.salaryPaid || 0) +
                        (updatedRow.commission || 0) +
                        (updatedRow.otherAdd || 0) +
                        (updatedRow.al || 0) +
                        (updatedRow.arrear || 0)

                    const deductions =
                        (updatedRow.staffAdvance || 0) +
                        (updatedRow.gpssaEmp || 0) +
                        (updatedRow.lateComm || 0) +
                        (updatedRow.additional || 0) +
                        (updatedRow.salaryDeduction || 0) +
                        (updatedRow.unpaidLeave || 0) +
                        (updatedRow.commissionFinal || 0)

                    updatedRow.totalPay = totalPay - deductions + (updatedRow.commissionFinal || 0)
                    updatedRow.netSalary = totalPay - deductions

                    return updatedRow
                }
                return row
            })
        })
    }, [])

    const renderCell = (row, column) => {
        const value = row[column.key]

        // Handle action column
        if (column.key === "actions") {
            return (
                <IconButton
                    size="small"
                    onClick={() => handleRemoveEmployee(row.id)}
                    sx={{ color: "#ff1744" }}
                    title="Remove Employee"
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            )
        }

        // Handle text fields (name, ID, and administrative text fields)
        if (
            column.key === "employeeName" ||
            column.key === "employeeId" ||
            column.key === "routingCode" ||
            column.key === "salaryIban" ||
            column.key === "workPermit" ||
            column.key === "visa" ||
            column.key === "branch" ||
            column.key === "remarks"
        ) {
            if (column.type === "text") {
                return (
                    <TextField
                        variant="standard"
                        value={value || ""}
                        onChange={(e) => handleInputChange(row.id, column.key, e.target.value)}
                        InputProps={{
                            disableUnderline: false,
                            style: { fontSize: "11px" },
                        }}
                        sx={{ width: column.key === "remarks" ? "200px" : "100%" }}
                        inputProps={{ style: { textAlign: "center" } }}
                    />
                )
            }

            return (
                <Typography
                    variant="body2"
                    sx={{ fontSize: "11px", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                    {value}
                </Typography>
            )
        }

        // Handle numeric fields
        if (column.type === "manual") {
            return (
                <TextField
                    type="number"
                    variant="standard"
                    value={value || 0}
                    onChange={(e) => handleInputChange(row.id, column.key, e.target.value)}
                    InputProps={{
                        disableUnderline: false,
                        style: { fontSize: "11px" },
                    }}
                    sx={{ width: "100%" }}
                    inputProps={{ step: "0.01", style: { textAlign: "center" } }}
                />
            )
        }

        return (
            <Typography variant="body2" sx={{ fontSize: "11px" }}>
                {typeof value === "number" ? (value === 0 ? "-" : value?.toLocaleString()) : value || "-"}
            </Typography>
        )
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
                <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>Create Final Statement</Typography>
            </Box>

            {/* Employee Multi-Select Dropdown with Search */}
            <Grid container xs={12} spacing={2}>
                <Grid item xs={3}>
                    <Box sx={{ mb: 3 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                sx={{ width: '100%' }}
                                views={["year", "month"]}
                                disabled={data?.length > 0}
                                label="Select Month & Year"
                                minDate={dayjs("2000-01-01")}
                                maxDate={dayjs("2100-12-31")}
                                value={selectedMonth}
                                onChange={(newValue) => {
                                    setSelectedMonth(new Date(newValue))
                                    console.log(newValue, "newValuenewValue")
                                }}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Box>
                </Grid>
                <Grid item xs={3}>
                    <Box sx={{ mb: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel id="employee-select-label">Select Employee</InputLabel>
                            <Select
                                labelId="employee-select-label"
                                value={selectedEmployeeId || ""}   // ✅ single value instead of array
                                onChange={handleEmployeeSelectionChange2}
                                input={<OutlinedInput label="Select Employee" />}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 400,
                                        },
                                    },
                                    autoFocus: false,
                                }}
                                onClose={() => setSearchText("")}
                            >
                                {/* Search Input */}
                                <ListSubheader
                                    sx={{
                                        backgroundColor: "white",
                                        zIndex: 1,
                                        position: "sticky",
                                        top: 0,
                                    }}
                                >
                                    <TextField
                                        size="small"
                                        placeholder="Search employees..."
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        value={searchText}
                                        onChange={handleSearchChange}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                            if (e.key !== "Escape") {
                                                e.stopPropagation()
                                            }
                                            if (e.key === "Escape") {
                                                setSearchText("")
                                            }
                                        }}
                                    />
                                </ListSubheader>

                                {/* Employee Options */}
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((employee) => (
                                        <MenuItem
                                            key={employee.id}
                                            value={employee.id}
                                            sx={{
                                                whiteSpace: "normal",
                                                wordWrap: "break-word",
                                                minHeight: "auto",
                                                py: 1,
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                                                <Box sx={{ display: "flex", alignItems: 'flex-end', gap: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                                        {employee?.user?.name}
                                                    </Typography>
                                                    <Typography variant="caption" mt={0.5} color="textSecondary">
                                                        Salary:{" "}
                                                        {Number.parseFloat(employee?.basic_salary || 0) +
                                                            Number.parseFloat(employee?.housing_allowance || 0) +
                                                            Number.parseFloat(employee?.other_allowance || 0) +
                                                            Number.parseFloat(employee?.transport_allowance || 0)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))
                                ) : searchText ? (
                                    <MenuItem disabled>
                                        <Typography variant="body2" color="textSecondary">
                                            No employees found matching "{searchText}"
                                        </Typography>
                                    </MenuItem>
                                ) : null}
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>




            </Grid>
            <Box sx={{ width: "100%" }}>
                <TableContainer component={Paper} sx={{ maxHeight: 600, overflowX: "auto" }}>
                    <Table stickyHeader aria-label="salary calculation table" size="small">
                        <TableHead>
                            <TableRow>
                                {columnConfig.map((column, index) => (
                                    <Cell key={`header-${index}`}>{column.header}</Cell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <Cell colSpan={columnConfig.length} sx={{ textAlign: "center", py: 4 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            No employees selected. Please select employees from the dropdown above.
                                        </Typography>
                                    </Cell>
                                </TableRow>
                            ) : (
                                data.map((row) => (
                                    <TableRow key={row.id} hover>
                                        {columnConfig.map((column, index) => (
                                            <Cell key={`${row.id}-${index}`}>{renderCell(row, column)}</Cell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Summary */}
            {data.length > 0 && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <Typography variant="body2">Total Employees: {data.length}</Typography>
                        </Grid>
                        <Grid item xs={3}>


                            <Typography variant="body2">
                                Total  Salary Package: {data.reduce((sum, row) => sum + row.salaryPackage, 0)?.toLocaleString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="body2">
                                Total Net Salary: {data.reduce((sum, row) => sum + row.netSalary, 0)?.toLocaleString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="body2">
                                Total Pay: {data.reduce((sum, row) => sum + row.totalPay, 0)?.toLocaleString()}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            )}
            <Box sx={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <PrimaryButton bgcolor={"#001f3f"} title="Create" onClick={() => CreateSalary()} disabled={data?.length == 0} />
            </Box>
        </Box>
    )
}

export default EOSCreate
