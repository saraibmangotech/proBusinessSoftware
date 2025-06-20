"use client"

import { useCallback, useRef, useState } from "react"
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
} from "@mui/material"

import styled from "@emotion/styled"
import { useNavigate } from "react-router-dom"
import { makeStyles } from "@mui/styles"
import { useForm } from "react-hook-form"
import DeleteIcon from "@mui/icons-material/Delete"
import SearchIcon from "@mui/icons-material/Search"

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

function SalaryList() {
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

  // Available employees list (this would typically come from an API)
  const availableEmployees = [
    {
      id: "1",
      employeeName: "John Doe",
      employeeId: "EMP001",
      department: "Sales",
      position: "Sales Manager",
      basicSalary: 5500,
    },
    {
      id: "2",
      employeeName: "Jane Smith",
      employeeId: "EMP002",
      department: "Marketing",
      position: "Marketing Executive",
      basicSalary: 8000,
    },
    {
      id: "3",
      employeeName: "Mike Johnson",
      employeeId: "EMP003",
      department: "IT",
      position: "Software Developer",
      basicSalary: 2500,
    },
    {
      id: "4",
      employeeName: "Sarah Wilson",
      employeeId: "EMP004",
      department: "HR",
      position: "HR Manager",
      basicSalary: 2500,
    },
    {
      id: "5",
      employeeName: "David Brown",
      employeeId: "EMP005",
      department: "Finance",
      position: "Accountant",
      basicSalary: 5000,
    },
    {
      id: "6",
      employeeName: "Alice Johnson",
      employeeId: "EMP006",
      department: "HR",
      position: "HR Assistant",
      basicSalary: 4500,
    },
    {
      id: "7",
      employeeName: "Bob Wilson",
      employeeId: "EMP007",
      department: "IT",
      position: "System Administrator",
      basicSalary: 6000,
    },
    {
      id: "8",
      employeeName: "Carol Davis",
      employeeId: "EMP008",
      department: "Finance",
      position: "Financial Analyst",
      basicSalary: 3500,
    },
    {
      id: "9",
      employeeName: "Daniel Brown",
      employeeId: "EMP009",
      department: "Marketing",
      position: "Marketing Manager",
      basicSalary: 4000,
    },
    {
      id: "10",
      employeeName: "Eva Martinez",
      employeeId: "EMP010",
      department: "Operations",
      position: "Operations Manager",
      basicSalary: 5500,
    },
    {
      id: "11",
      employeeName: "Frank Taylor",
      employeeId: "EMP011",
      department: "Sales",
      position: "Sales Representative",
      basicSalary: 3200,
    },
    {
      id: "12",
      employeeName: "Grace Lee",
      employeeId: "EMP012",
      department: "IT",
      position: "Frontend Developer",
      basicSalary: 4800,
    },
    {
      id: "13",
      employeeName: "Henry Clark",
      employeeId: "EMP013",
      department: "Finance",
      position: "Senior Accountant",
      basicSalary: 4200,
    },
    {
      id: "14",
      employeeName: "Ivy Rodriguez",
      employeeId: "EMP014",
      department: "Marketing",
      position: "Content Writer",
      basicSalary: 3800,
    },
    {
      id: "15",
      employeeName: "Jack Thompson",
      employeeId: "EMP015",
      department: "Operations",
      position: "Logistics Coordinator",
      basicSalary: 3600,
    },
  ]

  // Updated column configuration with action column
  const columnConfig = [
    { key: "employeeName", header: "Employee Name", type: "auto" },
    { key: "employeeId", header: "Employee ID", type: "auto" },
    { key: "salaryPaid", header: "Salary Paid", type: "auto" },
    { key: "commission", header: "Commission", type: "auto" },
    { key: "otherAdd", header: "Other Add", type: "manual" },
    { key: "al", header: "AL", type: "manual" },
    { key: "sl", header: "SL", type: "manual" },
    { key: "arrear", header: "Arrear", type: "auto" },
    { key: "gpssaEmp", header: "GPSSA", type: "auto", isGpssa: true },
    { key: "gpssaEmr", header: "GPSSA", type: "auto", isGpssa: true },
    { key: "staffAdvance", header: "Staff Advance", type: "manual" },
    { key: "lateComm", header: "Late Comm", type: "auto" },
    { key: "additional", header: "Additional", type: "manual" },
    { key: "salaryDeduction", header: "Salary Deduction", type: "manual" },
    { key: "unpaidLeave", header: "Unpaid Leave", type: "auto" },
    { key: "totalPay", header: "Total pay", type: "auto" },
    { key: "commissionFinal", header: "Commission", type: "manual" },
    { key: "netSalary", header: "Net Salary", type: "auto" },
    // New administrative columns - all auto
    { key: "routingCode", header: "ROUTING CODE", type: "auto" },
    { key: "salaryIban", header: "SALARY IBAN", type: "auto" },
    { key: "workPermit", header: "WORK PERMIT", type: "auto" },
    { key: "visa", header: "Visa", type: "auto" },
    { key: "branch", header: "BRANCH", type: "auto" },
    { key: "remark", header: "Remark", type: "auto" },
    { key: "minutesLate", header: "Minutes Late", type: "auto" },
    { key: "alDay", header: "AL Day", type: "auto" },
    { key: "actions", header: "Actions", type: "action" },
  ]

  // Start with empty table
  const [data, setData] = useState([])

  // Filter employees based on search text
  const filteredEmployees = availableEmployees.filter((employee) => {
    const searchLower = searchText.toLowerCase()
    return (
      employee.employeeName.toLowerCase().includes(searchLower) ||
      employee.employeeId.toLowerCase().includes(searchLower) ||
      employee.department.toLowerCase().includes(searchLower) ||
      employee.position.toLowerCase().includes(searchLower)
    )
  })

  // Generate default employee data
  const generateDefaultEmployeeData = (employee) => {
    return {
      id: employee.id,
      employeeName: employee.employeeName,
      employeeId: employee.employeeId,
      salaryPaid: employee.basicSalary || 0,
      commission: 0,
      otherAdd: 0,
      al: 0,
      sl: 0,
      arrear: 0,
      gpssaEmp: 0,
      gpssaEmr: Math.round(employee.basicSalary * 0.03) || 0, // 3% of basic salary
      staffAdvance: 0,
      lateComm: 0,
      additional: 0,
      salaryDeduction: 0,
      unpaidLeave: 0,
      totalPay: employee.basicSalary || 0,
      commissionFinal: 0,
      netSalary: employee.basicSalary || 0,
      // Default administrative data
      routingCode: "000000000",
      salaryIban: "AE000000000000000000000",
      workPermit: "",
      visa: "PBMS",
      branch: "Main Branch",
      remark: "New Employee",
      minutesLate: 0,
      alDay: 0,
    }
  }

  // Handle employee selection change
  const handleEmployeeSelectionChange = (event) => {
    const selectedIds = event.target.value
    setSelectedEmployeeIds(selectedIds)

    // Add new employees to table
    const currentEmployeeIds = new Set(data.map((row) => row.id))
    const newEmployeeIds = selectedIds.filter((id) => !currentEmployeeIds.has(id))

    if (newEmployeeIds.length > 0) {
      const newEmployees = newEmployeeIds.map((id) => {
        const employee = availableEmployees.find((emp) => emp.id === id)
        return generateDefaultEmployeeData(employee)
      })
      setData((prevData) => [...prevData, ...newEmployees])
    }

    // Remove employees that are no longer selected
    const removedEmployeeIds = Array.from(currentEmployeeIds).filter((id) => !selectedIds.includes(id))
    if (removedEmployeeIds.length > 0) {
      setData((prevData) => prevData.filter((row) => !removedEmployeeIds.includes(row.id)))
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

  // Handle input changes for manual fields
  const handleInputChange = useCallback((id, field, value) => {
    const numericValue = Number.parseFloat(value) || 0

    setData((prevData) =>
      prevData.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: numericValue }

          // Calculate total pay (sum of relevant fields)
          const totalPay =
            updatedRow.salaryPaid +
            updatedRow.commission +
            updatedRow.otherAdd +
            updatedRow.al +
            updatedRow.sl +
            updatedRow.arrear +
            updatedRow.gpssaEmr

          // Calculate net salary (total pay minus deductions)
          const deductions =
            updatedRow.staffAdvance +
            updatedRow.lateComm +
            updatedRow.additional +
            updatedRow.salaryDeduction +
            updatedRow.unpaidLeave +
            updatedRow.commissionFinal

          updatedRow.totalPay = totalPay
          updatedRow.netSalary = totalPay - deductions

          return updatedRow
        }
        return row
      }),
    )
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
        {typeof value === "number" ? (value === 0 ? "-" : value.toLocaleString()) : value || "-"}
      </Typography>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>Salary Calculation</Typography>
      </Box>

      {/* Employee Multi-Select Dropdown with Search */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="employee-select-label">Select Employees</InputLabel>
          <Select
            labelId="employee-select-label"
            multiple
            value={selectedEmployeeIds}
            onChange={handleEmployeeSelectionChange}
            input={<OutlinedInput label="Select Employees" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => {
                  const employee = availableEmployees.find((emp) => emp.id === value)
                  return <Chip key={value} label={`${employee?.employeeName} (${employee?.employeeId})`} size="small" />
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
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {employee.employeeName} ({employee.employeeId})
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {employee.department} - {employee.position} - Salary: {employee.basicSalary.toLocaleString()}
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
                Total Basic Salary: {data.reduce((sum, row) => sum + row.salaryPaid, 0).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2">
                Total Net Salary: {data.reduce((sum, row) => sum + row.netSalary, 0).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2">
                Total Pay: {data.reduce((sum, row) => sum + row.totalPay, 0).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}

export default SalaryList
