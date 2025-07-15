"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Chip, InputAdornment } from "@mui/material"
import { Search as SearchIcon, Download as DownloadIcon } from "@mui/icons-material"
import { useForm } from "react-hook-form"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import moment from "moment"
import DataTable from "components/DataTable"
import InputField from "components/Input"
import { PrimaryButton } from "components/Buttons"
import SystemServices from "services/System"
import { showErrorToast } from "components/NewToaster"
import ExcelJS from "exceljs";
import { agencyType } from "utils"

// Dummy data for EOS Report
const eosReportData = [
  {
    id: 1,
    employee_id: "EMP001",
    employee_name: "Ahmed Hassan",
    department: "Engineering",
    designation: "Senior Developer",
    joining_date: "2020-01-15",
    leaving_date: "2024-12-31",
    years_of_service: 4.95,
    months_of_service: 59,
    last_basic_salary: 8500,
    total_salary: 10200,
    gratuity_amount: 16915.38,
    status: "Approved",
    nationality: "UAE",
    passport_number: "A1234567",
  },
  {
    id: 2,
    employee_id: "EMP002",
    employee_name: "Sarah Johnson",
    department: "Marketing",
    designation: "Marketing Manager",
    joining_date: "2019-03-20",
    leaving_date: "2024-11-30",
    years_of_service: 5.69,
    months_of_service: 68,
    last_basic_salary: 7200,
    total_salary: 8640,
    gratuity_amount: 13824.0,
    status: "Pending",
    nationality: "USA",
    passport_number: "B2345678",
  },
  {
    id: 3,
    employee_id: "EMP003",
    employee_name: "Mohammed Ali",
    department: "Finance",
    designation: "Finance Executive",
    joining_date: "2021-06-10",
    leaving_date: "2024-12-15",
    years_of_service: 3.52,
    months_of_service: 42,
    last_basic_salary: 6800,
    total_salary: 8160,
    gratuity_amount: 9964.8,
    status: "Approved",
    nationality: "Egypt",
    passport_number: "C3456789",
  },
  {
    id: 4,
    employee_id: "EMP004",
    employee_name: "Lisa Chen",
    department: "HR",
    designation: "HR Specialist",
    joining_date: "2018-09-05",
    leaving_date: "2024-10-31",
    years_of_service: 6.15,
    months_of_service: 74,
    last_basic_salary: 7500,
    total_salary: 9000,
    gratuity_amount: 18675.0,
    status: "Approved",
    nationality: "China",
    passport_number: "D4567890",
  },
  {
    id: 5,
    employee_id: "EMP005",
    employee_name: "Omar Abdullah",
    department: "Operations",
    designation: "Operations Manager",
    joining_date: "2017-12-01",
    leaving_date: "2024-11-15",
    years_of_service: 6.96,
    months_of_service: 83,
    last_basic_salary: 9200,
    total_salary: 11040,
    gratuity_amount: 21619.2,
    status: "Processing",
    nationality: "Jordan",
    passport_number: "E5678901",
  },
  {
    id: 6,
    employee_id: "EMP006",
    employee_name: "Jennifer Smith",
    department: "Sales",
    designation: "Sales Executive",
    joining_date: "2022-02-14",
    leaving_date: "2024-12-20",
    years_of_service: 2.85,
    months_of_service: 34,
    last_basic_salary: 5800,
    total_salary: 6960,
    gratuity_amount: 5568.0,
    status: "Pending",
    nationality: "UK",
    passport_number: "F6789012",
  },
  {
    id: 7,
    employee_id: "EMP007",
    employee_name: "Rajesh Kumar",
    department: "IT",
    designation: "System Administrator",
    joining_date: "2019-08-12",
    leaving_date: "2024-12-05",
    years_of_service: 5.31,
    months_of_service: 64,
    last_basic_salary: 7800,
    total_salary: 9360,
    gratuity_amount: 16761.6,
    status: "Approved",
    nationality: "India",
    passport_number: "G7890123",
  },
  {
    id: 8,
    employee_id: "EMP008",
    employee_name: "Fatima Al-Zahra",
    department: "Legal",
    designation: "Legal Advisor",
    joining_date: "2020-11-30",
    leaving_date: "2024-11-25",
    years_of_service: 3.99,
    months_of_service: 48,
    last_basic_salary: 8800,
    total_salary: 10560,
    gratuity_amount: 14169.6,
    status: "Approved",
    nationality: "Lebanon",
    passport_number: "H8901234",
  },
]

function EOSReport() {
  const [loader, setLoader] = useState(false)
  const [filteredData, setFilteredData] = useState([])
  const [data, setData] = useState([])
  const [statsData, setStatsData] = useState(null)
  const [filters, setFilters] = useState({
    department: "",
    status: "",
    search: "",
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
  } = useForm()

  // Filter options
  const departments = [...new Set(eosReportData.map((emp) => emp.department))]
  const statuses = [...new Set(eosReportData.map((emp) => emp.status))]

  // Handle filtering
  const handleFilter = () => {
    let filtered = eosReportData

    if (filters.search) {
      filtered = filtered.filter(
        (emp) =>
          emp.employee_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          emp.employee_id.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    if (filters.department) {
      filtered = filtered.filter((emp) => emp.department === filters.department)
    }

    if (filters.status) {
      filtered = filtered.filter((emp) => emp.status === filters.status)
    }

    setFilteredData(filtered)
  }

   const getData = async (page, limit, filter) => {
      // setLoader(true)
      try {
       
  
        const { data } = await SystemServices.getEOSReport();
  console.log(data);
  
        setData(data?.table);
        setFilteredData(data?.table)
        setStatsData(data?.stats)
      } catch (error) {
        showErrorToast(error);
      } finally {
        // setLoader(false)
      }
    };

  // Handle Excel Export
const downloadExcel = async () => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("EOS Report")

  // Set professional header and footer
  worksheet.headerFooter.oddHeader =
    '&C&"Arial,Bold"&18EOS REPORT\n' +
    '&C&"Arial,Regular"&12Your Company Name\n' +
    '&C&"Arial,Regular"&10Period: &D - &T\n' +
    '&L&"Arial,Regular"&8Generated on: ' +
    new Date().toLocaleDateString() +
    "\n" +
    '&R&"Arial,Regular"&8Page &P of &N'

  worksheet.headerFooter.oddFooter =
    '&L&"Arial,Regular"&8Confidential - Internal Use Only' +
    '&C&"Arial,Regular"&8This report contains employee data as of ' +
    new Date().toLocaleDateString() +
    '&R&"Arial,Regular"&8Generated by: HR Department\n' +
    '&C&"Arial,Regular"&8Powered by Premium Business Solutions'

  // Alternative simpler footer format
  worksheet.headerFooter.evenFooter = worksheet.headerFooter.oddFooter

  // Set page setup for professional printing
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.7,
      right: 0.7,
      top: 1.0,
      bottom: 1.0,
      header: 0.3,
      footer: 0.3,
    },
  }

  // Add title section at the top of the worksheet
  const titleRow = worksheet.addRow(["EOS REPORT - EMPLOYEE WISE GRATUITY CALCULATION"])
  titleRow.getCell(1).font = {
    name: "Arial",
    size: 16,
    bold: true,
    color: { argb: "2F4F4F" },
  }
  titleRow.getCell(1).alignment = { horizontal: "center" }
  worksheet.mergeCells("A1:N1")
 const name =
    agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL"
      ? "PREMIUM BUSINESSMEN SERVICES"
      : "PREMIUM PROFESSIONAL GOVERNMENT SERVICES LLC";
  const companyRow = worksheet.addRow([name])
  companyRow.getCell(1).font = {
    name: "Arial",
    size: 14,
    bold: true,
    color: { argb: "4472C4" },
  }
  companyRow.getCell(1).alignment = { horizontal: "center" }
  worksheet.mergeCells("A2:N2")

  const dateRow = worksheet.addRow([
    `Report Generated: ${new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })} at ${new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })}`,
  ])
  dateRow.getCell(1).font = {
    name: "Arial",
    size: 10,
    italic: true,
    color: { argb: "666666" },
  }
  dateRow.getCell(1).alignment = { horizontal: "center" }
  worksheet.mergeCells("A3:N3")




  // Add empty row for spacing
  worksheet.addRow([])

  const headers = [
    "Employee ID",
    "Employee Name",
    "Department",
    "Designation",
    "Nationality",
  
    "Joining Date",
    "Leaving Date",
    "Years of Service",

    "Last Basic Salary (AED)",
    "Total Salary (AED)",
    "Gratuity Amount (AED)",
    "Status",
  ]

  const headerRow = worksheet.addRow(headers)
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" }, // Gray
    }
    cell.font = { bold: true, color: { argb: "FFFFFF" } } // White bold
    cell.alignment = { horizontal: "center", vertical: "middle" }
    cell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    }
  })

  // Grand totals initialization
  let grandTotalGratuity = 0
  let grandTotalBasicSalary = 0
  let grandTotalSalary = 0

  // Add all employees directly without grouping
  filteredData?.forEach((employee) => {
    const row = worksheet.addRow([
      employee.employee_id,
      employee.name || employee.employee_name,
      employee.department,
      employee.designation,
      employee.nationality,
 
      new Date(employee.joining_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      new Date(employee.leaving_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      employee.years_of_service,
   
      employee.last_basic_salary,
      employee.total_salary,
      employee.gratuity_amount,
      employee.status,
    ])

    // Format numerical columns
    for (let i = 9; i <= 13; i++) {
      if (i === 9 || i === 10) {
        // Years and months - no decimal formatting
        row.getCell(i).numFmt = "#,##0"
      } else {
        // Currency columns
        row.getCell(i).numFmt = "#,##0.00"
      }
    }

    // Add borders to all cells
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      }
      cell.alignment = { horizontal: "center", vertical: "middle" }
    })

    // Color code status
    const statusCell = row.getCell(14)
    switch (employee.status.toLowerCase()) {
      case "approved":
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4CAF50" },
        }
        statusCell.font = { color: { argb: "FFFFFF" }, bold: true }
        break
      case "pending":
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF9800" },
        }
        statusCell.font = { color: { argb: "FFFFFF" }, bold: true }
        break
      case "processing":
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "2196F3" },
        }
        statusCell.font = { color: { argb: "FFFFFF" }, bold: true }
        break
      case "rejected":
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F44336" },
        }
        statusCell.font = { color: { argb: "FFFFFF" }, bold: true }
        break
    }

    // Update grand totals
    grandTotalGratuity += Number.parseFloat(employee.gratuity_amount) || 0
    grandTotalBasicSalary += Number.parseFloat(employee.last_basic_salary) || 0
    grandTotalSalary += Number.parseFloat(employee.total_salary) || 0
  })

  // Add Grand Total row at the end
  const grandTotalRow = worksheet.addRow([
    "GRAND TOTAL",
    `${filteredData?.length} Total Employees`,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    grandTotalBasicSalary,
    grandTotalSalary,
    grandTotalGratuity,
    "",
  ])

  // Format grand total row
  grandTotalRow.eachCell((cell, colNumber) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "000000" }, // Black
    }
    cell.font = { bold: true, color: { argb: "FFFFFF" } } // White bold
    cell.alignment = { horizontal: "center", vertical: "middle" }
    cell.border = {
      top: { style: "thick", color: { argb: "000000" } },
      left: { style: "thick", color: { argb: "000000" } },
      bottom: { style: "thick", color: { argb: "000000" } },
      right: { style: "thick", color: { argb: "000000" } },
    }

    // Format numerical columns
    if (colNumber >= 11 && colNumber <= 13) {
      cell.numFmt = "#,##0.00"
    }
  })

  // Set column widths
  worksheet.columns = [
    { width: 12 }, // Employee ID
    { width: 25 }, // Employee Name
    { width: 15 }, // Department
    { width: 20 }, // Designation
    { width: 12 }, // Nationality
    { width: 15 }, // Passport Number
    { width: 12 }, // Joining Date
    { width: 12 }, // Leaving Date
    { width: 12 }, // Years of Service
    { width: 12 }, // Months of Service
    { width: 18 }, // Last Basic Salary
    { width: 18 }, // Total Salary
    { width: 20 }, // Gratuity Amount
    { width: 12 }, // Status
  ]

  // Add empty rows for spacing before footer
  worksheet.addRow([])
  worksheet.addRow([])

  // Add the electronic generated report text with black border as requested
  const reportRow = worksheet.addRow(["This is electronically generated report"])
  reportRow.getCell(1).font = {
    name: "Arial",
    size: 12,
    bold: false,
    color: { argb: "000000" },
  }
  reportRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" }
  reportRow.getCell(1).border = {
    top: { style: "medium", color: { argb: "000000" } },
    left: { style: "medium", color: { argb: "000000" } },
    bottom: { style: "medium", color: { argb: "000000" } },
    right: { style: "medium", color: { argb: "000000" } },
  }
  worksheet.mergeCells(`A${reportRow.number}:N${reportRow.number}`)

  // Add empty row for spacing
  worksheet.addRow([])

  const system2 = worksheet.addRow(["Powered By: MangotechDevs.ae"])
  system2.getCell(1).font = {
    name: "Arial",
    size: 10,
    italic: true,
    color: { argb: "666666" },
  }
  system2.getCell(1).alignment = { horizontal: "center" }
  worksheet.mergeCells(`A${system2.number}:N${system2.number}`)

  // Add empty row for spacing
  worksheet.addRow([])

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  saveAs(
    blob,
    `EOS_Report_${new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-")}.xlsx`,
  )
}


  // Get status chip color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "#4caf50"
      case "pending":
        return "#ff9800"
      case "processing":
        return "#2196f3"
      case "rejected":
        return "#f44336"
      default:
        return "#9e9e9e"
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
      accessorKey: "name",
    
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
      header: "Nationality",
      accessorKey: "nationality",
    },
    {
      header: "Joining Date",
      accessorKey: "joining_date",
      cell: ({ row }) => <Box>{moment(row.original.joining_date).format("DD/MM/YYYY")}</Box>,
    },
    {
      header: "Leaving Date",
      accessorKey: "leaving_date",
      cell: ({ row }) => <Box>{moment(row.original.leaving_date).format("DD/MM/YYYY")}</Box>,
    },
    {
      header: "Years of Service",
      accessorKey: "years_of_service",
      cell: ({ row }) => <Box>{row.original.years_of_service} years</Box>,
    },
    {
      header: "Last Basic Salary",
      accessorKey: "last_basic_salary",
      cell: ({ row }) => <Box> {row.original.last_basic_salary.toLocaleString()}</Box>,
    },
    {
      header: "Total Salary",
      accessorKey: "total_salary",
      cell: ({ row }) => <Box> {row.original.total_salary.toLocaleString()}</Box>,
    },
    {
      header: "Gratuity Amount",
      accessorKey: "gratuity_amount",
      cell: ({ row }) => (
        <Box sx={{ fontWeight: "bold", color: "#2e7d32" }}>AED {row.original.gratuity_amount.toLocaleString()}</Box>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Chip
          label={row.original.status}
          size="small"
          sx={{
            backgroundColor: getStatusColor(row.original.status),
            color: "white",
            fontWeight: "bold",
          }}
        />
      ),
    },
  ]

  // Calculate totals
  const totalGratuity = filteredData?.reduce((sum, emp) => sum + emp.gratuity_amount, 0)
  const totalEmployees = filteredData?.length

  useEffect(() => {
    handleFilter()
  }, [filters])


  useEffect(() => {
    getData()
  }, [])
  

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: "28px", fontWeight: "bold", color: "#1976d2", mb: 1 }}>
            EOS Report: Employee Wise Gratuity Calculation
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#666" }}>
            End of Service gratuity calculations for all employees
          </Typography>
        </Box>
        <PrimaryButton
          bgcolor={"#1976d2"}
          title="Export to Excel"
          onClick={()=>downloadExcel()}
          startIcon={<DownloadIcon />}
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 2,
              bgcolor: "#e3f2fd",
              borderRadius: 2,
              border: "1px solid #bbdefb",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#1565c0", fontWeight: "bold" }}>Total Employees</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#0d47a1" }}>{statsData?.totalEmployees}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 2,
              bgcolor: "#e8f5e8",
              borderRadius: 2,
              border: "1px solid #c8e6c9",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#2e7d32", fontWeight: "bold" }}>
              Total Gratuity Amount
            </Typography>
            <Typography sx={{ fontSize: "20px", fontWeight: "bold", color: "#1b5e20" }}>
              AED {statsData?.totalGratuity}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 2,
              bgcolor: "#fff3e0",
              borderRadius: 2,
              border: "1px solid #ffcc02",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#ef6c00", fontWeight: "bold" }}>Average Gratuity</Typography>
            <Typography sx={{ fontSize: "20px", fontWeight: "bold", color: "#e65100" }}>
               {statsData?.averageGratuity}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 2,
              bgcolor: "#fce4ec",
              borderRadius: 2,
              border: "1px solid #f8bbd9",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#c2185b", fontWeight: "bold" }}>Pending Approvals</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#ad1457" }}>
              {statsData?.pendingApprovals}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Filters */}
      {/* <Box
        sx={{
          p: 2,
          bgcolor: "#f8f9fa",
          borderRadius: 2,
          border: "1px solid #e9ecef",
          mb: 3,
        }}
      >
        <Typography sx={{ fontSize: "16px", fontWeight: "bold", mb: 2 }}>Filters</Typography>
        <Grid container spacing={2} display={'flex'} alignItems={'center'}>
          <Grid item xs={12} sm={6} md={4} mt={1}>
            <InputField
              size="small"
        
              placeholder="Search by name or ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department}
                label="Department"
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box> */}

      {/* Data Table */}
      <Box>
        <DataTable loading={loader} data={filteredData} columns={columns} />
      </Box>
    </Box>
  )
}

export default EOSReport
