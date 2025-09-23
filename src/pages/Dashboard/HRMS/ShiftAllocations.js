"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
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

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs from "dayjs"
import moment from "moment"
import { PrimaryButton } from "components/Buttons"
import UserServices from "services/User"
import { ErrorToaster } from "components/Toaster"
import DatePicker from "components/DatePicker"
import SelectField from "components/Select"

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

function ShiftAllocations() {
    const navigate = useNavigate()
    const classes = useStyles()
    const contentRef = useRef(null)

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
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [selectedCostCenter, setSelectedCostCenter] = useState(null)
    const [costCenters, setCostCenters] = useState([])
    const [filtertedCostCenters, setFiltertedCostCenters] = useState([])
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [fromDate2, setFromDate2] = useState();
    const [toDate2, setToDate2] = useState();
    const [selectedShift, setSelectedShift] = useState(null)

    const handleToDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == 'Invalid Date') {
                setToDate('invalid')
                return
            }
            setToDate(new Date(newDate))
        } catch (error) {
            ErrorToaster(error)
        }
    }
    const handleFromDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == 'Invalid Date') {
                setFromDate('invalid')
                return
            }
            console.log(newDate, "newDate")
            setFromDate(new Date(newDate))
        } catch (error) {
            ErrorToaster(error)
        }
    }
    const getCustomerQueue = async (page, limit, filter) => {


        try {

            let params = {
                page: 1,
                limit: 999999,
                is_active :true


            }

            const { data } = await CustomerServices.getEmployees(params)
            setEmployess(data?.employees?.rows)

        } catch (error) {
            showErrorToast(error)
        }
    }

    const getShifts = async (page, limit, filter) => {
        console.log(selectedEmployeeIds, 'selectedEmployeeIds');


        try {

            let params = {
                page: 1,
                limit: 999999,
                user_ids: selectedEmployeeIds?.join(','),
                from_date: fromDate ? moment(fromDate).format("YYYY-MM-DD") : "",
                to_date: toDate ? moment(toDate).format("YYYY-MM-DD") : "",


            }

            const { data } = await CustomerServices.getRoutedShifts(params)
            console.log(data);
            setData(data?.allocations)


        } catch (error) {
            showErrorToast(error)
        }
    }
    // Updated column configuration with action column
    const columnConfig = [
        { key: "employeeName", header: "Employee Name", type: "auto" },
        { key: "employeeId", header: "Employee ID", type: "auto" },
        { key: "salaryPaid", header: "Salary Basic", type: "auto" },
        { key: "housing_allowance", header: "Housing Allowance", type: "auto" },
        { key: "transport_allowance", header: "Transport Allowance", type: "auto" },
        { key: "other_allowance", header: "Others", type: "auto" },
        { key: "salaryPackage", header: "Salary Package", type: "auto" },
        { key: "commission", header: "Commission", type: "manual" },
        { key: "otherAdd", header: "Other Add", type: "manual" },
        { key: "al", header: "AL/SL", type: "manual" },

        { key: "arrear", header: "Airfare", type: "manual" },
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

        { key: "minutesLate", header: "Minutes Late", type: "auto" },
        { key: "alDay", header: "AL Day", type: "auto" },
        { key: "actions", header: "Actions", type: "action" },
    ]

    // Start with empty table
    const [data, setData] = useState([])

    // Filter employees based on search text
    const filteredEmployees = employess.filter((employee) => {
        const searchLower = searchText?.toLowerCase()
        return (
            employee?.user?.name?.toLowerCase().includes(searchLower)

        )
    })

    // Generate default employee data
    const generateDefaultEmployeeData = (employee, salary) => {
        console.log(salary, 'employeeemployee')
        return {
            user_id: employee?.user_id,
            id: employee.id,
            employeeName: employee.first_name + employee.last_name,
            employeeId: salary.employee?.employee_code,
            salaryPaid: parseFloat(salary.basicSalary) || 0,
            commission: parseFloat(salary?.commission),
            otherAdd: 0,
            al: 0,
            sl: 0,
            arrear: 0,
            gpssaEmp: parseFloat(salary?.pension || 0),

            staffAdvance: 0,
            lateComm: parseFloat(salary?.lateDeduction),
            additional: 0,
            salaryDeduction: 0,
            unpaidLeave: parseFloat(salary?.absentDeduction || 0),
            totalPay: parseFloat(salary?.netSalary) || 0,
            commissionFinal: 0,
            netSalary: parseFloat(salary.netSalary) || 0,
            // Default administrative data
            routingCode: salary?.employee?.routing,
            salaryIban: salary?.employee?.iban,
            workPermit: salary?.employee?.work_permit,
            visa: salary?.employee?.visa,
            branch: salary?.employee?.branch,
            remark: "New Employee",
            minutesLate: parseFloat(salary?.totalShortMinutes || 0),
            alDay: parseFloat(salary?.approvedLeaveDays || 0),
        }
    }
    const generateDefaultEmployeeData2 = (salary) => {
        console.log(salary, 'employeeemployee');
        const toFixed3 = (val) => parseFloat((parseFloat(val || 0)).toFixed(3));

        return {
            user_id: salary?.employee?.user_id,
            id: salary?.employee?.id,
            employeeName: salary?.employee?.first_name + salary?.employee?.last_name,
            employeeId: salary.employee?.employee_code,
            salaryPaid: toFixed3(salary.basicSalary),
            commission: toFixed3(salary?.commission),
            housing_allowance: toFixed3(salary?.employee?.housing_allowance),
            transport_allowance: toFixed3(salary?.employee?.transport_allowance),
            other_allowance: toFixed3(salary?.employee?.other_allowance),
            salaryPackage: toFixed3(salary?.salaryPackage),
            otherAdd: 0,
            al: 0,
            sl: 0,
            arrear: 0,
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
            remark: "New Employee",
            minutesLate: toFixed3(salary?.totalShortMinutes),
            alDay: toFixed3(salary?.approvedLeaveDays),
        };
    };


    // Handle employee selection change
    // const handleEmployeeSelectionChange = (event) => {
    //   const selectedIds = event.target.value
    //   console.log(selectedIds,'selectedIds');

    //   setSelectedEmployeeIds(selectedIds)

    //   // Add new employees to table
    //   const currentEmployeeIds = new Set(data.map((row) => row.id))
    //   const newEmployeeIds = selectedIds.filter((id) => !currentEmployeeIds.has(id))

    //   if (newEmployeeIds.length > 0) {
    //     const newEmployees = newEmployeeIds.map((id) => {
    //       const employee = employess.find((emp) => emp.id === id)
    //       return generateDefaultEmployeeData(employee)
    //     })
    //     setData((prevData) => [...prevData, ...newEmployees])
    //   }

    //   // Remove employees that are no longer selected
    //   const removedEmployeeIds = Array.from(currentEmployeeIds).filter((id) => !selectedIds.includes(id))
    //   if (removedEmployeeIds.length > 0) {
    //     setData((prevData) => prevData.filter((row) => !removedEmployeeIds.includes(row.id)))
    //   }
    // }
    const handleEmployeeSelectionChange2 = async (event) => {
        const selectedIds = event.target.value; // contains user_ids
        setSelectedEmployeeIds(selectedIds); // keep state name

        const currentEmployeeIds = new Set(data.map((row) => row.user_id)); // compare with user_id
        const newEmployeeIds = selectedIds.filter((id) => !currentEmployeeIds.has(id));

        if (newEmployeeIds.length > 0) {
            await Promise.all(
                newEmployeeIds.map(async (user_id) => {
                    const employee = employess.find((emp) => emp.user_id === user_id);
                    let salary = 0;

                    try {
                        const { data } = await CustomerServices.employeeSalaryDetail({
                            user_id,
                            month: moment(selectedMonth).month() + 1,
                            year: moment(selectedMonth).year(),
                        });

                        const salaries = data?.results;
                        const newEmployeeDataArray = salaries.map((salary) =>
                            generateDefaultEmployeeData2(salary)
                        );



                    } catch (error) {
                        console.error(`Failed to fetch salary for ${user_id}`, error);
                    }

                    return generateDefaultEmployeeData2(salary);
                })
            );
        }

        const removedEmployeeIds = Array.from(currentEmployeeIds).filter(
            (id) => !selectedIds.includes(id)
        );


    };


    const AllocateShifts = async (formData) => {
        try {
            const transformedData = data.map((item) => ({
                user_id: item.user_id,

                shift_id: item?.shift_id,
                date: item?.log_date,
                start_time: item?.shift?.start_time,
                end_time: item?.shift?.end_time

            }));

            console.log(transformedData);

            console.log(data);


            const obj = {


                shifts: transformedData,
                user_ids: selectedEmployeeIds,
                from_date: moment(fromDate).format('YYYY-MM-DD'),
                to_date: moment(toDate).format('YYYY-MM-DD')
            };

            const promise = CustomerServices.AllocateNewShift(obj);

            showPromiseToast(
                promise,
                'Saving ...',
                'Success',
                'Something Went Wrong'
            );

            // const response = await promise;

            // if (response?.responseCode === 200) {
            //     navigate('/salary-list');
            // }
        } catch (error) {

            console.log(error);

        }
    };


    // Handle remove employee
    const handleRemoveEmployee = (employeeId) => {

        setSelectedEmployeeIds((prevIds) => prevIds.filter((id) => id !== employeeId))
    }

    // Handle search input change
    const handleSearchChange = (event) => {
        event.stopPropagation() // Prevent event bubbling
        setSearchText(event.target.value)
    }
    const getCostCenters = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await CustomerServices.getCostCenters(params);
            setCostCenters(data?.cost_centers);
            setFiltertedCostCenters(data?.cost_centers)
            setSelectedCostCenter(null)

        } catch (error) {
            showErrorToast(error);
        }
    };
    useEffect(() => {
        getCostCenters()
        getCustomerQueue()
    }, [])


    // Handle input changes for manual fields
    const handleInputChange = useCallback((id, field, value) => {
        const numericValue = Number.parseFloat(value) || 0



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
            column.key === "remark"
        ) {
            if (column.type === "manual") {
                return (
                    <TextField
                        variant="standard"
                        value={value || ""}
                        onChange={(e) => handleInputChange(row.id, column.key, e.target.value)}
                        InputProps={{
                            disableUnderline: false,
                            style: { fontSize: "11px" },
                        }}
                        sx={{ width: "100%" }}
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
    const [shiftData, setShiftData] = useState(data) // original data passed in
    const shiftOptions = [
        { id: 1, name: "Morning Patrol" },
        { id: 2, name: "Evening Patrol" },
        { id: 3, name: "Night Patrol" },
    ]
    const groupedData = {};
    data.forEach(item => {
        const userId = item.user_id;

        if (!groupedData[userId]) {
            groupedData[userId] = {
                user: item.user,
                shiftsByDate: {}
            };
        }

        groupedData[userId].shiftsByDate[item.log_date] = item;
    });


    // Get all unique dates
    const uniqueDates = [...new Set(data.map(item => item.log_date))].sort((a, b) => new Date(a) - new Date(b));
    const [shifts, setShifts] = useState([])
    const getShiftsList = async () => {
        setFromDate2(null)
        setToDate2(null)
        setSelectedShift(null)
        setSelectedRows([])
        setSelectedUserIds([])
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await CustomerServices.getShifts(params);
            setShifts(data?.shifts?.rows);

        } catch (error) {
            showErrorToast(error);
        }
    };
    // Get all unique users
    const uniqueUsers = [...new Map(data.map(item => [item.user.id, item.user])).values()];

    const updateShiftForUser = async (recordId, shiftId) => {
        try {

            console.log("Shift updated:", recordId)
        } catch (error) {
            console.error("Failed to update shift", error)
        }
    }

    const getShiftNameById = (id) => {
        return shiftOptions.find((shift) => shift.id === id)?.name || "Unknown Shift"
    }
    const handleShiftChange = (userId, date, newShiftId, newShiftObj) => {
        if (!userId || !date) return;

        setData((prev) =>
            prev.map((item) =>
                item.user_id === userId && item.log_date === date
                    ? { ...item, shift_id: newShiftId, shift: newShiftObj }
                    : item
            )
        );
    };
    const bulkAllocate = () => {

        const stripTime = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const from = stripTime(new Date(fromDate2));
        const to = stripTime(new Date(toDate2));

        const updatedData = data.map(item => {
            // Convert item.log_date safely to Date and strip time
            const itemDate = stripTime(new Date(item.log_date));

            // Check if this item is in selected rows
            const isSelected = selectedRows.some(row => row.id === item.id);

            // Check if this item's date is within range
            const isInRange = isSelected && itemDate >= from && itemDate <= to;

            // Debug log
            console.log({
                isSelected,
                itemDate: itemDate.toISOString().split("T")[0],
                from: from.toISOString().split("T")[0],
                to: to.toISOString().split("T")[0],
                isInRange,
            });

            // Update only if selected and in date range
            if (isInRange) {
                return {
                    ...item,
                    shift_id: selectedShift.id,
                    shift: { ...selectedShift },
                    start_time: String(selectedShift.start_time),
                    end_time: String(selectedShift.end_time),
                };
            }

            // Return item unchanged if not matching
            return item;
        });
        setData(updatedData)
        console.log(updatedData, 'updated full data with selected rows updated');
        return updatedData;
    };


    const [selectedRows, setSelectedRows] = useState([])
    console.log(data, 'asdasd');
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    const handleRowSelect = (userId) => {
        setSelectedUserIds((prev) => {
            const newSelected = prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId];

            // Filter data based on updated selected user IDs
            const selectedRowsNew = data.filter(item => newSelected.includes(item.user_id));
            setSelectedRows(selectedRowsNew); // <-- Update state with correct filtered data

            return newSelected; // <-- Set the updated selected user IDs
        });
    };



    const employees = {};
    data.forEach(item => {
        if (!employees[item.user_id]) {
            employees[item.user_id] = {
                user: item.user,
                shiftsByDate: {},
            };
        }
        employees[item.user_id].shiftsByDate[item.log_date] = item;
    });

    useEffect(() => {
        getShiftsList()
    }, [])


    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
                <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>Shift Allocations</Typography>
            </Box>

            {/* Employee Multi-Select Dropdown with Search */}
            <Grid container xs={12} spacing={2}>
                <Grid item xs={3}>
                    <Box sx={{ mb: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel id="employee-select-label">Select Employees</InputLabel>
                            <Select
                                labelId="employee-select-label"
                                multiple

                                value={selectedEmployeeIds}
                                onChange={handleEmployeeSelectionChange2}
                                input={<OutlinedInput label="Select Employees" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                        {selected.map((userId) => {
                                            const employee = employess.find((emp) => emp.user_id === userId);
                                            return (
                                                <Box
                                                    key={userId}
                                                    onMouseDown={(e) => e.stopPropagation()} // ✅ This prevents the Select from opening
                                                >
                                                    <Chip
                                                        label={employee?.user?.name}
                                                        size="small"
                                                        onDelete={() => {
                                                            const updated = selectedEmployeeIds.filter(id => id !== userId);
                                                            handleEmployeeSelectionChange2({ target: { value: updated } });
                                                        }}
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}



                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 400,
                                        },
                                    },
                                    // Prevent menu from closing when clicking on search input
                                    autoFocus: false,
                                }}
                                onClose={() => setSearchText("")} // Clear search when dropdown closes
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
                                        onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
                                        onKeyDown={(e) => {
                                            // Prevent dropdown from closing on any key except Escape
                                            if (e.key !== "Escape") {
                                                e.stopPropagation()
                                            }
                                            // Clear search on Escape
                                            if (e.key === "Escape") {
                                                setSearchText("")
                                            }
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                "& fieldset": {
                                                    borderColor: "#e0e0e0",
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: "#1976d2",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#1976d2",
                                                },
                                            },
                                        }}
                                    />
                                </ListSubheader>

                                {/* Employee Options */}
                                {filteredEmployees.map((employee) => (
                                    <MenuItem
                                        key={employee.user_id}
                                        value={employee.user_id} // using user_id instead of id
                                        sx={{
                                            whiteSpace: "normal",
                                            wordWrap: "break-word",
                                            minHeight: "auto",
                                            py: 1,
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                                    {employee?.user?.name}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Salary: {parseFloat(employee?.basic_salary || 0) +
                                                        parseFloat(employee?.housing_allowance || 0) +
                                                        parseFloat(employee?.other_allowance || 0) +
                                                        parseFloat(employee?.transport_allowance || 0)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                ))}

                            </Select>
                        </FormControl>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={3}>
                    <DatePicker
                        disableFuture={true}
                        size="small"
                        label={"From Date"}
                        value={fromDate}
                        onChange={(date) => handleFromDate(date)}
                    />
                </Grid>
                <Grid item xs={12} sm={3} >
                    <DatePicker

                        size="small"
                        minDate={fromDate}
                        label={"To Date"}
                        value={toDate}
                        onChange={(date) => handleToDate(date)}
                    />
                </Grid>
                <Grid item xs={12} sm={3} mt={4}>
                    <PrimaryButton
                        title={"Get Shifts"}
                        onClick={() =>
                            getShifts()}
                    />
                </Grid>

            </Grid>
            <Box sx={{ width: "100%" }}>
                <Grid container mt={2} mb={2} spacing={2}>
                    <Grid item xs={3}>
                        <SelectField
                            size={"small"}
                            label={"Select Shift "}
                            options={shifts}

                            selected={selectedShift}
                            onSelect={(value) => {
                                setSelectedShift(value);

                            }}

                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <DatePicker
                            disableFuture={true}
                            size="small"
                            label={"From Date"}
                            value={fromDate2}
                            onChange={(date) => setFromDate2(date)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3} >
                        <DatePicker

                            size="small"
                            minDate={fromDate}
                            label={"To Date"}
                            value={toDate2}
                            onChange={(date) => setToDate2(date)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3} mt={4}>
                        <PrimaryButton
                            title={"Bulk Allocate"}
                            onClick={() =>
                                bulkAllocate()}
                        />
                    </Grid>

                </Grid>
                <TableContainer component={Paper} sx={{ maxHeight: 600, overflowX: "auto" }}>
                    <Table stickyHeader size="small" >
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell sx={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
                                    Employee Name
                                </TableCell>
                                {uniqueDates.map(date => {
                                    const d = new Date(date);
                                    const isFriday = d.getDay() === 5; // 0=Sunday, 5=Friday

                                    return (
                                        <TableCell
                                            key={date}
                                            sx={{
                                                color: isFriday ? "#03ff03 !important" : "white !important", // 👈 change text color
                                                fontWeight: isFriday ? "bold" : "normal", // optional
                                            }}
                                        >
                                            {d.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "2-digit",
                                                weekday: "short",
                                            })}
                                        </TableCell>
                                    );
                                })}

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {uniqueUsers.map(user => (
                                <TableRow key={user.id} hover selected={selectedUserIds.includes(user.id)}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedUserIds.includes(user.id)}
                                            onChange={() => handleRowSelect(user.id)}
                                        />
                                    </TableCell>
                                    <TableCell>{user.name}-{user?.employee_id}</TableCell>
                                    {uniqueDates.map(date => {
                                        const row = data.find(item => item.user_id === user.id && item.log_date === date);
                                        const currentShiftId = row?.shift_id || "";

                                        return (
                                            <TableCell key={`${user.id}-${date}`}>
                                                <Select
                                                    size="small"
                                                    value={currentShiftId}

                                                    onChange={(e) => {
                                                        const newShiftId = e.target.value;
                                                        const newShift = shifts.find((shift) => shift.id === newShiftId);
                                                        handleShiftChange(user.id, date, newShiftId, newShift);
                                                    }}
                                                    fullWidth
                                                >
                                                    {shifts.map((shift) => (
                                                        <MenuItem key={shift.id} value={shift.id}>
                                                            {shift.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>


            <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', mt: 2 }}>
                <PrimaryButton
                    bgcolor={'#001f3f'}
                    title="Save"
                    onClick={() => AllocateShifts()}

                    disabled={data?.length == 0}

                />

            </Box>
        </Box>
    )
}

export default ShiftAllocations
