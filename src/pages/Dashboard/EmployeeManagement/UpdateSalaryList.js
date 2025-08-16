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
    IconButton,
} from "@mui/material"

import styled from "@emotion/styled"
import { useNavigate, useParams } from "react-router-dom"
import { makeStyles } from "@mui/styles"
import { useForm } from "react-hook-form"
import DeleteIcon from "@mui/icons-material/Delete"
import { showErrorToast, showPromiseToast } from "components/NewToaster"
import CustomerServices from "services/Customer"
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

function UpdateSalaryList() {
    const { id } = useParams()
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
    const [selectedMonth, setSelectedMonth] = useState(dayjs())

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

    const columnConfig = [
        { key: "employeeName", header: "Employee Name", type: "auto" },
        { key: "joinDate", header: "Join Date", type: "auto" },
        { key: "division", header: "Division", type: "auto" },

        { key: "workingDays", header: "Working Days", type: "auto" },
        { key: "local", header: "Local/Non Local", type: "auto" },
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
        { key: "routingCode", header: "ROUTING CODE", type: "auto" },
        { key: "salaryIban", header: "SALARY IBAN", type: "auto" },
        { key: "workPermit", header: "WORK PERMIT", type: "auto" },
        { key: "visa", header: "Visa", type: "auto" },
        { key: "branch", header: "BRANCH", type: "auto" },
        { key: "remark", header: "Remarks", type: "manual" },
        { key: "minutesLate", header: "Minutes Late", type: "auto" },
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

        const toFixed3 = (val) => Number.parseFloat(Number.parseFloat(val || 0).toFixed(3))

        return {
            user_id: employee?.user_id,
            id: employee.id,
            employeeName: employee.first_name,
            joinDate: moment(employee?.date_of_joining).format("DD-MM-YYYY"),
            workingDays: toFixed3(salary?.workingDays || 30),
            local: employee?.is_local ? "Local" : "Non Local",
            employeeId: salary.employee?.employee_code,
            salaryPaid: toFixed3(salary.basicSalary),
            commission: toFixed3(salary?.commission),
            otherAdd: 0,
            al: 0,
            sl: 0,
            arrear: toFixed3(salary?.airfareAmount),
            gpssaEmp: toFixed3(salary?.pension),
            staffAdvance: 0,
            lateComm: toFixed3(salary?.lateDeduction),
            additional: 0,
            salaryDeduction: 0,
            unpaidLeave: toFixed3(salary?.absentDeduction),
            totalPay: toFixed3(salary?.netSalary),
            commissionFinal: 0,
            netSalary: toFixed3(salary.netSalary),
            housing_allowance: toFixed3(salary?.employee?.housing_allowance),
            transport_allowance: toFixed3(salary?.employee?.transport_allowance),
            other_allowance: toFixed3(salary?.employee?.other_allowance),
            salaryPackage: toFixed3(
                (salary?.employee?.housing_allowance || 0) +
                (salary?.employee?.transport_allowance || 0) +
                (salary?.employee?.other_allowance || 0) +
                (salary?.basicSalary || 0),
            ),
            routingCode: salary?.employee?.routing,
            salaryIban: salary?.employee?.iban,
            workPermit: salary?.employee?.work_permit,
            visa: salary?.employee?.visa,
            branch: salary?.employee?.branch,
            remark: "New Employee",
            minutesLate: toFixed3(salary?.totalShortMinutes),
            alDay: toFixed3(salary?.approvedLeaveDays),
        }
    }

    const handleEmployeeSelectionChange2 = async (event) => {
        const selectedIds = event.target.value
        setSelectedEmployeeIds(selectedIds)

        const currentEmployeeIds = new Set(data.map((row) => row.id))
        const newEmployeeIds = selectedIds.filter((id) => !currentEmployeeIds.has(id))

        if (newEmployeeIds.length > 0) {
            const newEmployees = await Promise.all(
                newEmployeeIds.map(async (id) => {
                    const employee = employess.find((emp) => emp.id === id)
                    let salary = 0

                    try {
                        const { data } = await CustomerServices.employeeSalaryDetail({
                            user_id: employee.user_id,
                            month: moment(selectedMonth).month() + 1,
                            year: moment(selectedMonth).year(),
                        })
                        salary = data?.results[0] || 0
                        console.log(data)
                    } catch (error) {
                        console.error(`Failed to fetch salary for ${employee.user_id}`, error)
                    }

                    return generateDefaultEmployeeData(employee, salary)
                }),
            )
            console.log(newEmployees, "newEmployees")

            setData((prevData) => [...prevData, ...newEmployees])
        }

        const removedEmployeeIds = Array.from(currentEmployeeIds).filter((id) => !selectedIds.includes(id))
        if (removedEmployeeIds.length > 0) {
            setData((prevData) => prevData.filter((row) => !removedEmployeeIds.includes(row.id)))
        }
    }

    const UpdateSalary = async (formData) => {
        try {
            const transformedData = data.map((item) => ({
                user_id: item.user_id,
                salary_paid: item.salaryPaid,
                commission: item.commission,
                other_add: item.otherAdd,
                al: item.al,
                sl: item.sl,
                arrear: item.arrear,
                gpssa_emp: item.gpssaEmp,
                housing_allowance: item?.housing_allowance,
                transport_allowance: item?.transport_allowance,
                other_allowance: item?.other_allowance,
                salary_package: item?.salaryPackage,
                staff_advance: item.staffAdvance,
                late_comm: item.lateComm,
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
                remark: item.remark,
                minutes_late: item.minutesLate,
                al_day: item.alDay,
            }))

            console.log(transformedData)
            console.log(data)

            const obj = {
                id: id,
                salaries: transformedData,
            }

            const promise = UserServices.UpdateSalary(obj)

            showPromiseToast(promise, "Saving ...", "Success", "Something Went Wrong")

            const response = await promise

            if (response?.responseCode === 200) {
                navigate("/salary-list")
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

const getData = async () => {
  try {
    const params = { group_id: id }
    const { data } = await CustomerServices.getSalaryDetail(params)
    console.log(data)

    const transformedData = data?.details?.rows?.map((salary) => {
      const employee = salary?.user?.employee || {}
      const rawJoinDate = employee?.date_of_joining ? new Date(employee?.date_of_joining) : null

      return {
        user_id: salary?.user_id,
        id: salary?.id,
        employeeName: employee?.first_name,
        division: employee?.cost_center ? employee?.cost_center : '-',
        workingDays: parseFloat(salary?.working_days || 0),

        joinDate: rawJoinDate ? moment(rawJoinDate).format("DD-MM-YYYY") : "-", // formatted for UI
        rawJoinDate, // ✅ keep actual date for sorting

        local: employee?.is_local ? "Local" : "Non Local",
        employeeId: employee?.employee_code,
        salaryPaid: Number.parseFloat(employee?.basic_salary) || 0,
        commission: Number.parseFloat(salary?.commission) || 0,
        otherAdd: Number.parseFloat(salary?.other_add) || 0,
        al: Number.parseFloat(salary?.al) || 0,
        sl: Number.parseFloat(salary?.sl) || 0,
        arrear: Number.parseFloat(salary?.arrear) || 0,
        gpssaEmp: Number.parseFloat(salary?.gpssa_emp) || 0,
        staffAdvance: Number.parseFloat(salary?.staff_advance) || 0,
        lateComm: Number.parseFloat(salary?.late_comm) || 0,
        additional: Number.parseFloat(salary?.additional) || 0,
        salaryDeduction: Number.parseFloat(salary?.salary_deduction) || 0,
        unpaidLeave: Number.parseFloat(salary?.unpaid_leave) || 0,
        totalPay: Number.parseFloat(salary?.total_pay) || 0,
        commissionFinal: Number.parseFloat(salary?.commission_final) || 0,
        netSalary: Number.parseFloat(salary?.net_salary) || 0,
        housing_allowance: Number.parseFloat(salary?.housing_allowance || 0),
        transport_allowance: Number.parseFloat(salary?.transport_allowance || 0),
        other_allowance: Number.parseFloat(salary?.other_allowance || 0),
        salaryPackage: Number.parseFloat(
          (salary?.housing_allowance || 0) +
          (salary?.transport_allowance || 0) +
          (salary?.other_allowance || 0) +
          (employee?.basic_salary || 0),
        ),
        routingCode: employee?.routing || salary?.routing_code || "",
        salaryIban: employee?.iban || salary?.salary_iban || "",
        workPermit: employee?.work_permit || salary?.work_permit || "",
        visa: employee?.visa || salary?.visa || "",
        branch: employee?.branch || salary?.branch || "",
        remark: salary?.remark || "",
        minutesLate: Number.parseFloat(salary?.minutes_late) || 0,
        alDay: Number.parseFloat(salary?.al_day) || 0,
      }
    })

    // ✅ sort employees by join date
    const sortedData = transformedData?.sort((a, b) => {
      if (!a.rawJoinDate) return 1
      if (!b.rawJoinDate) return -1
      return a.rawJoinDate - b.rawJoinDate // ascending (oldest → newest)
    })

    setData(sortedData)
  } catch (error) {
    console.error("Error fetching employee data:", error)
  }
}


    useEffect(() => {
        getData()
        getCustomerQueue()
    }, [])

    const handleInputChange = useCallback((id, field, value) => {
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
                    const updatedRow = { ...row }

                    // Handle both numeric and text fields
                    if (
                        field === "remark" ||
                        field === "routingCode" ||
                        field === "salaryIban" ||
                        field === "workPermit" ||
                        field === "visa" ||
                        field === "branch"
                    ) {
                        updatedRow[field] = value
                    } else {
                        updatedRow[field] = Number.parseFloat(value) || 0
                    }

                    // Calculate salary package
                    updatedRow.salaryPackage =
                        (updatedRow.housing_allowance || 0) +
                        (updatedRow.transport_allowance || 0) +
                        (updatedRow.other_allowance || 0) +
                        (updatedRow.salaryPaid || 0)

                    // Calculate total pay
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
            column.key === "joinDate" ||
            column.key === "local" ||
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
                    {value || "-"}
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
                <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>Update Payroll</Typography>
            </Box>

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
                                            No Data
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
                <PrimaryButton bgcolor={"#001f3f"} title="Update" onClick={() => UpdateSalary()} disabled={data?.length == 0} />
            </Box>
        </Box>
    )
}

export default UpdateSalaryList
