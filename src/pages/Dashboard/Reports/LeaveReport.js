"use client"

import { useState } from "react"
import { Box, Typography, Grid, Chip } from "@mui/material"
import { Download as DownloadIcon } from "@mui/icons-material"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import moment from "moment"
import DataTable from "components/DataTable"
import { PrimaryButton } from "components/Buttons"


// Dummy data for Annual Leave / Sick Leave Report
const leaveReportData = [
  {
    id: 1,
    employee_id: "EMP001",
    employee_name: "Ahmed Hassan",
    department: "Engineering",
    designation: "Senior Developer",
    month: "2024-01",
    month_name: "January 2024",
    annual_leave_taken: 3,
    sick_leave_taken: 1,
    total_leave_days: 4,
    annual_leave_balance: 18,
    sick_leave_balance: 14,
    basic_salary: 8500,
    daily_rate: 283.33,
    leave_deduction: 1133.32,
    net_payable: 7366.68,
    leave_status: "Approved",
  },
  {
    id: 2,
    employee_id: "EMP001",
    employee_name: "Ahmed Hassan",
    department: "Engineering",
    designation: "Senior Developer",
    month: "2024-02",
    month_name: "February 2024",
    annual_leave_taken: 2,
    sick_leave_taken: 0,
    total_leave_days: 2,
    annual_leave_balance: 16,
    sick_leave_balance: 14,
    basic_salary: 8500,
    daily_rate: 283.33,
    leave_deduction: 566.66,
    net_payable: 7933.34,
    leave_status: "Approved",
  },
  {
    id: 3,
    employee_id: "EMP002",
    employee_name: "Sarah Johnson",
    department: "Marketing",
    designation: "Marketing Manager",
    month: "2024-01",
    month_name: "January 2024",
    annual_leave_taken: 5,
    sick_leave_taken: 2,
    total_leave_days: 7,
    annual_leave_balance: 16,
    sick_leave_balance: 13,
    basic_salary: 7200,
    daily_rate: 240.0,
    leave_deduction: 1680.0,
    net_payable: 5520.0,
    leave_status: "Approved",
  },
  {
    id: 4,
    employee_id: "EMP002",
    employee_name: "Sarah Johnson",
    department: "Marketing",
    designation: "Marketing Manager",
    month: "2024-02",
    month_name: "February 2024",
    annual_leave_taken: 1,
    sick_leave_taken: 3,
    total_leave_days: 4,
    annual_leave_balance: 15,
    sick_leave_balance: 10,
    basic_salary: 7200,
    daily_rate: 240.0,
    leave_deduction: 960.0,
    net_payable: 6240.0,
    leave_status: "Approved",
  },
  {
    id: 5,
    employee_id: "EMP003",
    employee_name: "Mohammed Ali",
    department: "Finance",
    designation: "Finance Executive",
    month: "2024-01",
    month_name: "January 2024",
    annual_leave_taken: 0,
    sick_leave_taken: 1,
    total_leave_days: 1,
    annual_leave_balance: 21,
    sick_leave_balance: 14,
    basic_salary: 6800,
    daily_rate: 226.67,
    leave_deduction: 226.67,
    net_payable: 6573.33,
    leave_status: "Approved",
  },
  {
    id: 6,
    employee_id: "EMP003",
    employee_name: "Mohammed Ali",
    department: "Finance",
    designation: "Finance Executive",
    month: "2024-02",
    month_name: "February 2024",
    annual_leave_taken: 4,
    sick_leave_taken: 0,
    total_leave_days: 4,
    annual_leave_balance: 17,
    sick_leave_balance: 14,
    basic_salary: 6800,
    daily_rate: 226.67,
    leave_deduction: 906.68,
    net_payable: 5893.32,
    leave_status: "Approved",
  },
  {
    id: 7,
    employee_id: "EMP004",
    employee_name: "Lisa Chen",
    department: "HR",
    designation: "HR Specialist",
    month: "2024-01",
    month_name: "January 2024",
    annual_leave_taken: 2,
    sick_leave_taken: 0,
    total_leave_days: 2,
    annual_leave_balance: 19,
    sick_leave_balance: 15,
    basic_salary: 7500,
    daily_rate: 250.0,
    leave_deduction: 500.0,
    net_payable: 7000.0,
    leave_status: "Approved",
  },
  {
    id: 8,
    employee_id: "EMP004",
    employee_name: "Lisa Chen",
    department: "HR",
    designation: "HR Specialist",
    month: "2024-02",
    month_name: "February 2024",
    annual_leave_taken: 3,
    sick_leave_taken: 2,
    total_leave_days: 5,
    annual_leave_balance: 16,
    sick_leave_balance: 13,
    basic_salary: 7500,
    daily_rate: 250.0,
    leave_deduction: 1250.0,
    net_payable: 6250.0,
    leave_status: "Approved",
  },
  {
    id: 9,
    employee_id: "EMP005",
    employee_name: "Omar Abdullah",
    department: "Operations",
    designation: "Operations Manager",
    month: "2024-01",
    month_name: "January 2024",
    annual_leave_taken: 6,
    sick_leave_taken: 0,
    total_leave_days: 6,
    annual_leave_balance: 15,
    sick_leave_balance: 15,
    basic_salary: 9200,
    daily_rate: 306.67,
    leave_deduction: 1840.02,
    net_payable: 7359.98,
    leave_status: "Approved",
  },
  {
    id: 10,
    employee_id: "EMP005",
    employee_name: "Omar Abdullah",
    department: "Operations",
    designation: "Operations Manager",
    month: "2024-02",
    month_name: "February 2024",
    annual_leave_taken: 1,
    sick_leave_taken: 1,
    total_leave_days: 2,
    annual_leave_balance: 14,
    sick_leave_balance: 14,
    basic_salary: 9200,
    daily_rate: 306.67,
    leave_deduction: 613.34,
    net_payable: 8586.66,
    leave_status: "Approved",
  },
  {
    id: 11,
    employee_id: "EMP006",
    employee_name: "Jennifer Smith",
    department: "Sales",
    designation: "Sales Executive",
    month: "2024-01",
    month_name: "January 2024",
    annual_leave_taken: 4,
    sick_leave_taken: 3,
    total_leave_days: 7,
    annual_leave_balance: 17,
    sick_leave_balance: 12,
    basic_salary: 5800,
    daily_rate: 193.33,
    leave_deduction: 1353.31,
    net_payable: 4446.69,
    leave_status: "Approved",
  },
  {
    id: 12,
    employee_id: "EMP006",
    employee_name: "Jennifer Smith",
    department: "Sales",
    designation: "Sales Executive",
    month: "2024-02",
    month_name: "February 2024",
    annual_leave_taken: 0,
    sick_leave_taken: 2,
    total_leave_days: 2,
    annual_leave_balance: 17,
    sick_leave_balance: 10,
    basic_salary: 5800,
    daily_rate: 193.33,
    leave_deduction: 386.66,
    net_payable: 5413.34,
    leave_status: "Approved",
  },
  {
    id: 13,
    employee_id: "EMP007",
    employee_name: "Rajesh Kumar",
    department: "IT",
    designation: "System Administrator",
    month: "2024-01",
    month_name: "January 2024",
    annual_leave_taken: 1,
    sick_leave_taken: 0,
    total_leave_days: 1,
    annual_leave_balance: 20,
    sick_leave_balance: 15,
    basic_salary: 7800,
    daily_rate: 260.0,
    leave_deduction: 260.0,
    net_payable: 7540.0,
    leave_status: "Approved",
  },
  {
    id: 14,
    employee_id: "EMP007",
    employee_name: "Rajesh Kumar",
    department: "IT",
    designation: "System Administrator",
    month: "2024-02",
    month_name: "February 2024",
    annual_leave_taken: 3,
    sick_leave_taken: 1,
    total_leave_days: 4,
    annual_leave_balance: 17,
    sick_leave_balance: 14,
    basic_salary: 7800,
    daily_rate: 260.0,
    leave_deduction: 1040.0,
    net_payable: 6760.0,
    leave_status: "Approved",
  },
  {
    id: 15,
    employee_id: "EMP008",
    employee_name: "Fatima Al-Zahra",
    department: "Legal",
    designation: "Legal Advisor",
    month: "2024-01",
    month_name: "January 2024",
    annual_leave_taken: 2,
    sick_leave_taken: 1,
    total_leave_days: 3,
    annual_leave_balance: 19,
    sick_leave_balance: 14,
    basic_salary: 8800,
    daily_rate: 293.33,
    leave_deduction: 879.99,
    net_payable: 7920.01,
    leave_status: "Approved",
  },
  {
    id: 16,
    employee_id: "EMP008",
    employee_name: "Fatima Al-Zahra",
    department: "Legal",
    designation: "Legal Advisor",
    month: "2024-02",
    month_name: "February 2024",
    annual_leave_taken: 5,
    sick_leave_taken: 0,
    total_leave_days: 5,
    annual_leave_balance: 14,
    sick_leave_balance: 14,
    basic_salary: 8800,
    daily_rate: 293.33,
    leave_deduction: 1466.65,
    net_payable: 7333.35,
    leave_status: "Approved",
  },
]

function LeaveReport() {
  const [loader, setLoader] = useState(false)

  // Handle Excel Export
  const handleExcelExport = () => {
    const exportData = leaveReportData.map((record) => ({
      "Employee ID": record.employee_id,
      "Employee Name": record.employee_name,
      Department: record.department,
      Designation: record.designation,
      Month: record.month_name,
      "Annual Leave Taken": record.annual_leave_taken,
      "Sick Leave Taken": record.sick_leave_taken,
      "Total Leave Days": record.total_leave_days,
      "Annual Leave Balance": record.annual_leave_balance,
      "Sick Leave Balance": record.sick_leave_balance,
      "Basic Salary (AED)": record.basic_salary.toLocaleString(),
      "Daily Rate (AED)": record.daily_rate.toFixed(2),
      "Leave Deduction (AED)": record.leave_deduction.toFixed(2),
      "Net Payable (AED)": record.net_payable.toFixed(2),
      Status: record.leave_status,
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Report")

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }))
    worksheet["!cols"] = colWidths

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    saveAs(data, `Leave_Report_${moment().format("YYYY-MM-DD")}.xlsx`)
  }

  // DataTable columns configuration
  const columns = [
    {
      header: "Employee ID",
      accessorKey: "employee_id",
    },
    {
      header: "Employee Name",
      accessorKey: "employee_name",
    },
    {
      header: "Department",
      accessorKey: "department",
    },
    {
      header: "Month",
      accessorKey: "month_name",
      cell: ({ row }) => <Box sx={{ fontWeight: "bold", color: "#1976d2" }}>{row.original.month_name}</Box>,
    },
    {
      header: "Annual Leave Taken",
      accessorKey: "annual_leave_taken",
      cell: ({ row }) => (
        <Box sx={{ textAlign: "center", fontWeight: "bold", color: "#2e7d32" }}>
          {row.original.annual_leave_taken} days
        </Box>
      ),
    },
    {
      header: "Sick Leave Taken",
      accessorKey: "sick_leave_taken",
      cell: ({ row }) => (
        <Box sx={{ textAlign: "center", fontWeight: "bold", color: "#d32f2f" }}>
          {row.original.sick_leave_taken} days
        </Box>
      ),
    },
    {
      header: "Total Leave Days",
      accessorKey: "total_leave_days",
      cell: ({ row }) => (
        <Box sx={{ textAlign: "center", fontWeight: "bold", color: "#1976d2" }}>
          {row.original.total_leave_days} days
        </Box>
      ),
    },
    {
      header: "Annual Leave Balance",
      accessorKey: "annual_leave_balance",
      cell: ({ row }) => (
        <Box sx={{ textAlign: "center", color: "#666" }}>{row.original.annual_leave_balance} days</Box>
      ),
    },
    {
      header: "Sick Leave Balance",
      accessorKey: "sick_leave_balance",
      cell: ({ row }) => <Box sx={{ textAlign: "center", color: "#666" }}>{row.original.sick_leave_balance} days</Box>,
    },
    {
      header: "Basic Salary",
      accessorKey: "basic_salary",
      cell: ({ row }) => <Box>AED {row.original.basic_salary.toLocaleString()}</Box>,
    },
    {
      header: "Daily Rate",
      accessorKey: "daily_rate",
      cell: ({ row }) => <Box>AED {row.original.daily_rate.toFixed(2)}</Box>,
    },
    {
      header: "Leave Deduction",
      accessorKey: "leave_deduction",
      cell: ({ row }) => (
        <Box sx={{ fontWeight: "bold", color: "#d32f2f" }}>AED {row.original.leave_deduction.toFixed(2)}</Box>
      ),
    },
    {
      header: "Net Payable",
      accessorKey: "net_payable",
      cell: ({ row }) => (
        <Box sx={{ fontWeight: "bold", color: "#2e7d32" }}>AED {row.original.net_payable.toFixed(2)}</Box>
      ),
    },
    {
      header: "Status",
      accessorKey: "leave_status",
      cell: ({ row }) => (
        <Chip
          label={row.original.leave_status}
          size="small"
          sx={{
            backgroundColor: "#4caf50",
            color: "white",
            fontWeight: "bold",
          }}
        />
      ),
    },
  ]

  // Calculate totals
  const totalAnnualLeave = leaveReportData.reduce((sum, record) => sum + record.annual_leave_taken, 0)
  const totalSickLeave = leaveReportData.reduce((sum, record) => sum + record.sick_leave_taken, 0)
  const totalLeaveDays = leaveReportData.reduce((sum, record) => sum + record.total_leave_days, 0)
  const totalDeductions = leaveReportData.reduce((sum, record) => sum + record.leave_deduction, 0)
  const totalNetPayable = leaveReportData.reduce((sum, record) => sum + record.net_payable, 0)

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: "28px", fontWeight: "bold", color: "#1976d2", mb: 1 }}>
            Annual Leave / Sick Leave Report
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#666" }}>
            Month wise consolidated report for payroll processed
          </Typography>
        </Box>
        <PrimaryButton
          bgcolor={"#1976d2"}
          title="Export to Excel"
          onClick={handleExcelExport}
          startIcon={<DownloadIcon />}
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box
            sx={{
              p: 2,
              bgcolor: "#e8f5e8",
              borderRadius: 2,
              border: "1px solid #c8e6c9",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#2e7d32", fontWeight: "bold" }}>Total Annual Leave</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#1b5e20" }}>
              {totalAnnualLeave} days
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box
            sx={{
              p: 2,
              bgcolor: "#ffebee",
              borderRadius: 2,
              border: "1px solid #ffcdd2",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#c62828", fontWeight: "bold" }}>Total Sick Leave</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#b71c1c" }}>
              {totalSickLeave} days
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box
            sx={{
              p: 2,
              bgcolor: "#e3f2fd",
              borderRadius: 2,
              border: "1px solid #bbdefb",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#1565c0", fontWeight: "bold" }}>Total Leave Days</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#0d47a1" }}>
              {totalLeaveDays} days
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box
            sx={{
              p: 2,
              bgcolor: "#fff3e0",
              borderRadius: 2,
              border: "1px solid #ffcc02",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#ef6c00", fontWeight: "bold" }}>Total Deductions</Typography>
            <Typography sx={{ fontSize: "20px", fontWeight: "bold", color: "#e65100" }}>
              AED {totalDeductions.toLocaleString()}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box
            sx={{
              p: 2,
              bgcolor: "#f3e5f5",
              borderRadius: 2,
              border: "1px solid #e1bee7",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#7b1fa2", fontWeight: "bold" }}>Total Net Payable</Typography>
            <Typography sx={{ fontSize: "18px", fontWeight: "bold", color: "#4a148c" }}>
              AED {totalNetPayable.toLocaleString()}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Report Information */}
      <Box
        sx={{
          p: 2,
          bgcolor: "#f8f9fa",
          borderRadius: 2,
          border: "1px solid #e9ecef",
          mb: 3,
        }}
      >
        <Typography sx={{ fontSize: "16px", fontWeight: "bold", mb: 1, color: "#333" }}>Report Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ fontSize: "14px", color: "#666" }}>
              <strong>Report Period:</strong> January - February 2024
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ fontSize: "14px", color: "#666" }}>
              <strong>Total Records:</strong> {leaveReportData.length}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ fontSize: "14px", color: "#666" }}>
              <strong>Employees Covered:</strong> 8
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ fontSize: "14px", color: "#666" }}>
              <strong>Generated On:</strong> {moment().format("DD/MM/YYYY")}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Data Table */}
      <Box>
        <DataTable loading={loader} data={leaveReportData} columns={columns} />
      </Box>

      {/* Footer Notes */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: "#f8f9fa",
          borderRadius: 2,
          border: "1px solid #e9ecef",
        }}
      >
        <Typography sx={{ fontSize: "14px", fontWeight: "bold", mb: 1, color: "#333" }}>Notes:</Typography>
        <Typography sx={{ fontSize: "12px", color: "#666", mb: 1 }}>
          • Daily rate is calculated as Basic Salary ÷ 30 days
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "#666", mb: 1 }}>
          • Leave deduction = Total Leave Days × Daily Rate
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "#666", mb: 1 }}>
          • Net Payable = Basic Salary - Leave Deduction
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "#666" }}>
          • Annual leave entitlement: 21 days per year | Sick leave entitlement: 15 days per year
        </Typography>
      </Box>
    </Box>
  )
}

export default LeaveReport
