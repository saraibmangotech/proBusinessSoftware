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
  Checkbox,
  TextField,
} from "@mui/material"

import styled from "@emotion/styled"
import { useNavigate } from "react-router-dom"
import { makeStyles } from "@mui/styles"
import { useForm } from "react-hook-form"

// *For Table Style
const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 11,
    fontFamily: "Public Sans",
    border: "1px solid #EEEEEE",
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

  const [selectedRows, setSelectedRows] = useState(new Set())

  // Exact column configuration from the image
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
  ]

  // Initial salary data with employee names and IDs
  const initialData = [
    {
      id: "1",
      employeeName: "John Doe",
      employeeId: "EMP001",
      salaryPaid: 5500,
      commission: 3765,
      otherAdd: 0,
      al: 0,
      sl: 0,
      arrear: 0,
      gpssaEmp: 0,
      gpssaEmr: 1000,
      staffAdvance: 59,
      lateComm: 0,
      additional: 0,
      salaryDeduction: 8000,
      unpaidLeave: 0,
      totalPay: 9212,
      commissionFinal: 0,
      netSalary: 9212,
    },
    {
      id: "2",
      employeeName: "Jane Smith",
      employeeId: "EMP002",
      salaryPaid: 8000,
      commission: 30055,
      otherAdd: 1200,
      al: 0,
      sl: 0,
      arrear: 880,
      gpssaEmp: 0,
      gpssaEmr: 1000,
      staffAdvance: 163,
      lateComm: 0,
      additional: 0,
      salaryDeduction: 8000,
      unpaidLeave: 0,
      totalPay: 30212,
      commissionFinal: 7791,
      netSalary: 22421,
    },
    {
      id: "3",
      employeeName: "Mike Johnson",
      employeeId: "EMP003",
      salaryPaid: 2500,
      commission: 0,
      otherAdd: 0,
      al: 0,
      sl: 0,
      arrear: 0,
      gpssaEmp: 0,
      gpssaEmr: 0,
      staffAdvance: 0,
      lateComm: 0,
      additional: 0,
      salaryDeduction: 0,
      unpaidLeave: 0,
      totalPay: 2500,
      commissionFinal: 0,
      netSalary: 2500,
    },
    {
      id: "4",
      employeeName: "Sarah Wilson",
      employeeId: "EMP004",
      salaryPaid: 2500,
      commission: 0,
      otherAdd: 0,
      al: 0,
      sl: 0,
      arrear: 0,
      gpssaEmp: 0,
      gpssaEmr: 0,
      staffAdvance: 0,
      lateComm: 0,
      additional: 0,
      salaryDeduction: 0,
      unpaidLeave: 0,
      totalPay: 2500,
      commissionFinal: 0,
      netSalary: 2500,
    },
    {
      id: "5",
      employeeName: "David Brown",
      employeeId: "EMP005",
      salaryPaid: 5000,
      commission: 6305,
      otherAdd: 0,
      al: 0,
      sl: 0,
      arrear: 0,
      gpssaEmp: 0,
      gpssaEmr: 0,
      staffAdvance: 0,
      lateComm: 0,
      additional: 0,
      salaryDeduction: 0,
      unpaidLeave: 0,
      totalPay: 11305,
      commissionFinal: 0,
      netSalary: 11305,
    },
  ]

  const [data, setData] = useState(initialData)

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

  // Handle row selection
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

  // Handle select all
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

  const renderCell = (row, column) => {
    const value = row[column.key]

    // Handle text fields (name and ID)
    if (column.key === "employeeName" || column.key === "employeeId") {
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
        <Typography variant="body2" sx={{ fontSize: "11px" }}>
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

  const getCellClass = (column) => {
    if (column.isGpssa) return classes.gpssaColumn
    return column.type === "auto" ? classes.autoColumn : classes.manualColumn
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>Salary Calculation</Typography>
      </Box>

      <Box sx={{ width: "100%" }}>
        <TableContainer component={Paper} sx={{ maxHeight: 600, overflowX: "auto" }}>
          <Table stickyHeader aria-label="salary calculation table" size="small">
            <TableHead>
              {/* Type Row (Auto/Manual) */}
              {/*<TableRow>*/}
              {/*  <Cell sx={{ minWidth: 70 }}>Select</Cell>*/}
              {/*  {columnConfig.map((column, index) => (*/}
              {/*    <Cell key={`type-${index}`} className={getCellClass(column)}>*/}
              {/*      {column.type === "auto" ? "Auto" : "Manual"}*/}
              {/*    </Cell>*/}
              {/*  ))}*/}
              {/*</TableRow>*/}

              {/* Header Row */}
              <TableRow>
                <Cell sx={{ minWidth: 70 }}>Select</Cell>
                {columnConfig.map((column, index) => (
                  <Cell key={`header-${index}`}>{column.header}</Cell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} hover selected={selectedRows.has(row.id)}>
                  <Cell>
                    <Checkbox
                      color="primary"
                      size="small"
                      checked={selectedRows.has(row.id)}
                      onChange={(e) => handleRowSelect(row.id, e.target.checked)}
                    />
                  </Cell>
                  {columnConfig.map((column, index) => (
                    <Cell key={`${row.id}-${index}`}>{renderCell(row, column)}</Cell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Summary */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="body2">Selected Rows: {selectedRows.size}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2">Total Employees: {data.length}</Typography>
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
    </Box>
  )
}

export default SalaryList
