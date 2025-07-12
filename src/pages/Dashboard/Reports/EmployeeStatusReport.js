"use client"

import { useState } from "react"
import { Box, Typography, Grid, Chip } from "@mui/material"
import {
  Download as DownloadIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
} from "@mui/icons-material"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import moment from "moment"
import DataTable from "components/DataTable"
import { PrimaryButton } from "components/Buttons"


// Dummy data for Active/Inactive Employee Report
const employeeStatusData = [
  {
    id: 1,
    employee_id: "EMP001",
    employee_name: "Ahmed Hassan",
    department: "Engineering",
    designation: "Senior Developer",
    month: "2024-01",
    month_name: "January 2024",
    status: "Active",
    action: "Continued",
    joining_date: "2020-01-15",
    leaving_date: null,
    employment_duration: "4 years 0 months",
    reason: null,
    salary: 8500,
    nationality: "UAE",
  },
  {
    id: 2,
    employee_id: "EMP009",
    employee_name: "Michael Brown",
    department: "Engineering",
    designation: "Junior Developer",
    month: "2024-01",
    month_name: "January 2024",
    status: "Active",
    action: "Joined",
    joining_date: "2024-01-08",
    leaving_date: null,
    employment_duration: "0 years 0 months",
    reason: null,
    salary: 5500,
    nationality: "Canada",
  },
  {
    id: 3,
    employee_id: "EMP002",
    employee_name: "Sarah Johnson",
    department: "Marketing",
    designation: "Marketing Manager",
    month: "2024-01",
    month_name: "January 2024",
    status: "Inactive",
    action: "Left",
    joining_date: "2019-03-20",
    leaving_date: "2024-01-25",
    employment_duration: "4 years 10 months",
    reason: "Resignation",
    salary: 7200,
    nationality: "USA",
  },
  {
    id: 4,
    employee_id: "EMP003",
    employee_name: "Mohammed Ali",
    department: "Finance",
    designation: "Finance Executive",
    month: "2024-01",
    month_name: "January 2024",
    status: "Active",
    action: "Continued",
    joining_date: "2021-06-10",
    leaving_date: null,
    employment_duration: "2 years 7 months",
    reason: null,
    salary: 6800,
    nationality: "Egypt",
  },
  {
    id: 5,
    employee_id: "EMP010",
    employee_name: "Anna Rodriguez",
    department: "HR",
    designation: "HR Assistant",
    month: "2024-02",
    month_name: "February 2024",
    status: "Active",
    action: "Joined",
    joining_date: "2024-02-12",
    leaving_date: null,
    employment_duration: "0 years 0 months",
    reason: null,
    salary: 4800,
    nationality: "Spain",
  },
  {
    id: 6,
    employee_id: "EMP004",
    employee_name: "Lisa Chen",
    department: "HR",
    designation: "HR Specialist",
    month: "2024-02",
    month_name: "February 2024",
    status: "Active",
    action: "Continued",
    joining_date: "2018-09-05",
    leaving_date: null,
    employment_duration: "5 years 5 months",
    reason: null,
    salary: 7500,
    nationality: "China",
  },
  {
    id: 7,
    employee_id: "EMP005",
    employee_name: "Omar Abdullah",
    department: "Operations",
    designation: "Operations Manager",
    month: "2024-02",
    month_name: "February 2024",
    status: "Inactive",
    action: "Left",
    joining_date: "2017-12-01",
    leaving_date: "2024-02-28",
    employment_duration: "6 years 3 months",
    reason: "Better Opportunity",
    salary: 9200,
    nationality: "Jordan",
  },
  {
    id: 8,
    employee_id: "EMP011",
    employee_name: "David Kim",
    department: "IT",
    designation: "Network Engineer",
    month: "2024-02",
    month_name: "February 2024",
    status: "Active",
    action: "Joined",
    joining_date: "2024-02-20",
    leaving_date: null,
    employment_duration: "0 years 0 months",
    reason: null,
    salary: 7000,
    nationality: "South Korea",
  },
  {
    id: 9,
    employee_id: "EMP006",
    employee_name: "Jennifer Smith",
    department: "Sales",
    designation: "Sales Executive",
    month: "2024-03",
    month_name: "March 2024",
    status: "Active",
    action: "Continued",
    joining_date: "2022-02-14",
    leaving_date: null,
    employment_duration: "2 years 1 month",
    reason: null,
    salary: 5800,
    nationality: "UK",
  },
  {
    id: 10,
    employee_id: "EMP012",
    employee_name: "Carlos Martinez",
    department: "Sales",
    designation: "Sales Manager",
    month: "2024-03",
    month_name: "March 2024",
    status: "Active",
    action: "Joined",
    joining_date: "2024-03-05",
    leaving_date: null,
    employment_duration: "0 years 0 months",
    reason: null,
    salary: 8200,
    nationality: "Mexico",
  },
  {
    id: 11,
    employee_id: "EMP007",
    employee_name: "Rajesh Kumar",
    department: "IT",
    designation: "System Administrator",
    month: "2024-03",
    month_name: "March 2024",
    status: "Inactive",
    action: "Left",
    joining_date: "2019-08-12",
    leaving_date: "2024-03-15",
    employment_duration: "4 years 7 months",
    reason: "Family Relocation",
    salary: 7800,
    nationality: "India",
  },
  {
    id: 12,
    employee_id: "EMP008",
    employee_name: "Fatima Al-Zahra",
    department: "Legal",
    designation: "Legal Advisor",
    month: "2024-03",
    month_name: "March 2024",
    status: "Active",
    action: "Continued",
    joining_date: "2020-11-30",
    leaving_date: null,
    employment_duration: "3 years 4 months",
    reason: null,
    salary: 8800,
    nationality: "Lebanon",
  },
  {
    id: 13,
    employee_id: "EMP013",
    employee_name: "Sophie Wilson",
    department: "Marketing",
    designation: "Digital Marketing Specialist",
    month: "2024-04",
    month_name: "April 2024",
    status: "Active",
    action: "Joined",
    joining_date: "2024-04-10",
    leaving_date: null,
    employment_duration: "0 years 0 months",
    reason: null,
    salary: 6200,
    nationality: "Australia",
  },
  {
    id: 14,
    employee_id: "EMP014",
    employee_name: "Hassan Al-Mahmoud",
    department: "Finance",
    designation: "Senior Accountant",
    month: "2024-04",
    month_name: "April 2024",
    status: "Active",
    action: "Joined",
    joining_date: "2024-04-22",
    leaving_date: null,
    employment_duration: "0 years 0 months",
    reason: null,
    salary: 7300,
    nationality: "Kuwait",
  },
  {
    id: 15,
    employee_id: "EMP015",
    employee_name: "Elena Petrov",
    department: "Operations",
    designation: "Operations Coordinator",
    month: "2024-04",
    month_name: "April 2024",
    status: "Active",
    action: "Joined",
    joining_date: "2024-04-28",
    leaving_date: null,
    employment_duration: "0 years 0 months",
    reason: null,
    salary: 5900,
    nationality: "Russia",
  },
]

function EmployeeStatusReport() {
  const [loader, setLoader] = useState(false)

  // Handle Excel Export
  const handleExcelExport = () => {
    const exportData = employeeStatusData.map((record) => ({
      "Employee ID": record.employee_id,
      "Employee Name": record.employee_name,
      Department: record.department,
      Designation: record.designation,
      Nationality: record.nationality,
      Month: record.month_name,
      Status: record.status,
      Action: record.action,
      "Joining Date": moment(record.joining_date).format("DD/MM/YYYY"),
      "Leaving Date": record.leaving_date ? moment(record.leaving_date).format("DD/MM/YYYY") : "N/A",
      "Employment Duration": record.employment_duration,
      "Reason for Leaving": record.reason || "N/A",
      "Salary (AED)": record.salary.toLocaleString(),
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Status Report")

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }))
    worksheet["!cols"] = colWidths

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    saveAs(data, `Employee_Status_Report_${moment().format("YYYY-MM-DD")}.xlsx`)
  }

  // Get action chip color and icon
  const getActionColor = (action) => {
    switch (action.toLowerCase()) {
      case "joined":
        return "#4caf50"
      case "left":
        return "#f44336"
      case "continued":
        return "#2196f3"
      default:
        return "#9e9e9e"
    }
  }

  const getActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case "joined":
        return <PersonAddIcon sx={{ fontSize: 16 }} />
      case "left":
        return <PersonRemoveIcon sx={{ fontSize: 16 }} />
      default:
        return null
    }
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
      header: "Designation",
      accessorKey: "designation",
    },
    {
      header: "Month",
      accessorKey: "month_name",
      cell: ({ row }) => <Box sx={{ fontWeight: "bold", color: "#1976d2" }}>{row.original.month_name}</Box>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Chip
          label={row.original.status}
          size="small"
          sx={{
            backgroundColor: row.original.status === "Active" ? "#4caf50" : "#f44336",
            color: "white",
            fontWeight: "bold",
          }}
        />
      ),
    },
    {
      header: "Action",
      accessorKey: "action",
      cell: ({ row }) => (
        <Chip
          label={row.original.action}
          size="small"
          icon={getActionIcon(row.original.action)}
          sx={{
            backgroundColor: getActionColor(row.original.action),
            color: "white",
            fontWeight: "bold",
            "& .MuiChip-icon": {
              color: "white",
            },
          }}
        />
      ),
    },
    {
      header: "Joining Date",
      accessorKey: "joining_date",
      cell: ({ row }) => <Box>{moment(row.original.joining_date).format("DD/MM/YYYY")}</Box>,
    },
    {
      header: "Leaving Date",
      accessorKey: "leaving_date",
      cell: ({ row }) => (
        <Box sx={{ color: row.original.leaving_date ? "#d32f2f" : "#666" }}>
          {row.original.leaving_date ? moment(row.original.leaving_date).format("DD/MM/YYYY") : "N/A"}
        </Box>
      ),
    },
    {
      header: "Employment Duration",
      accessorKey: "employment_duration",
      cell: ({ row }) => <Box sx={{ fontWeight: "bold", color: "#1976d2" }}>{row.original.employment_duration}</Box>,
    },
    {
      header: "Reason for Leaving",
      accessorKey: "reason",
      cell: ({ row }) => (
        <Box sx={{ color: row.original.reason ? "#d32f2f" : "#666" }}>{row.original.reason || "N/A"}</Box>
      ),
    },
    {
      header: "Salary",
      accessorKey: "salary",
      cell: ({ row }) => <Box>AED {row.original.salary.toLocaleString()}</Box>,
    },
    {
      header: "Nationality",
      accessorKey: "nationality",
    },
  ]

  // Calculate statistics
  const totalEmployees = employeeStatusData.length
  const activeEmployees = employeeStatusData.filter((emp) => emp.status === "Active").length
  const inactiveEmployees = employeeStatusData.filter((emp) => emp.status === "Inactive").length
  const joinedEmployees = employeeStatusData.filter((emp) => emp.action === "Joined").length
  const leftEmployees = employeeStatusData.filter((emp) => emp.action === "Left").length

  // Monthly breakdown
  const monthlyStats = employeeStatusData.reduce((acc, emp) => {
    if (!acc[emp.month_name]) {
      acc[emp.month_name] = { joined: 0, left: 0, continued: 0 }
    }
    if (emp.action === "Joined") acc[emp.month_name].joined++
    if (emp.action === "Left") acc[emp.month_name].left++
    if (emp.action === "Continued") acc[emp.month_name].continued++
    return acc
  }, {})

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: "28px", fontWeight: "bold", color: "#1976d2", mb: 1 }}>
            Active / Inactive Employee Report
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#666" }}>
            Month wise joining & departing employees report
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
              bgcolor: "#e3f2fd",
              borderRadius: 2,
              border: "1px solid #bbdefb",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#1565c0", fontWeight: "bold" }}>Total Records</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#0d47a1" }}>{totalEmployees}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box
            sx={{
              p: 2,
              bgcolor: "#e8f5e8",
              borderRadius: 2,
              border: "1px solid #c8e6c9",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#2e7d32", fontWeight: "bold" }}>Active Employees</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#1b5e20" }}>{activeEmployees}</Typography>
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
            <Typography sx={{ fontSize: "14px", color: "#c62828", fontWeight: "bold" }}>Inactive Employees</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#b71c1c" }}>{inactiveEmployees}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box
            sx={{
              p: 2,
              bgcolor: "#e8f5e8",
              borderRadius: 2,
              border: "1px solid #c8e6c9",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#2e7d32", fontWeight: "bold" }}>New Joinings</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#1b5e20" }}>{joinedEmployees}</Typography>
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
            <Typography sx={{ fontSize: "14px", color: "#ef6c00", fontWeight: "bold" }}>Departures</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#e65100" }}>{leftEmployees}</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Monthly Breakdown */}
      <Box
        sx={{
          p: 2,
          bgcolor: "#f8f9fa",
          borderRadius: 2,
          border: "1px solid #e9ecef",
          mb: 3,
        }}
      >
        <Typography sx={{ fontSize: "16px", fontWeight: "bold", mb: 2, color: "#333" }}>Monthly Breakdown</Typography>
        <Grid container spacing={2}>
          {Object.entries(monthlyStats).map(([month, stats]) => (
            <Grid item xs={12} sm={6} md={3} key={month}>
              <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1, border: "1px solid #ddd" }}>
                <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#1976d2", mb: 1 }}>{month}</Typography>
                <Typography sx={{ fontSize: "12px", color: "#4caf50" }}>Joined: {stats.joined}</Typography>
                <Typography sx={{ fontSize: "12px", color: "#f44336" }}>Left: {stats.left}</Typography>
                <Typography sx={{ fontSize: "12px", color: "#2196f3" }}>Continued: {stats.continued}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

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
              <strong>Report Period:</strong> January - April 2024
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ fontSize: "14px", color: "#666" }}>
              <strong>Departments Covered:</strong> 7
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ fontSize: "14px", color: "#666" }}>
              <strong>Net Change:</strong> +{joinedEmployees - leftEmployees} employees
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
        <DataTable loading={loader} data={employeeStatusData} columns={columns} />
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
          • <strong>Active:</strong> Currently employed and working
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "#666", mb: 1 }}>
          • <strong>Inactive:</strong> No longer employed with the company
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "#666", mb: 1 }}>
          • <strong>Joined:</strong> New employee who started during the month
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "#666", mb: 1 }}>
          • <strong>Left:</strong> Employee who departed during the month
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "#666" }}>
          • <strong>Continued:</strong> Existing employee who remained active during the month
        </Typography>
      </Box>
    </Box>
  )
}

export default EmployeeStatusReport
