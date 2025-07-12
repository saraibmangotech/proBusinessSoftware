"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Chip, InputAdornment } from "@mui/material"
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material"
import { useForm } from "react-hook-form"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import moment from "moment"
import DataTable from "components/DataTable"
import { PrimaryButton } from "components/Buttons"
import InputField from "components/Input"


// Dummy data for Document Expiry Report
const documentExpiryData = [
  {
    id: 1,
    employee_id: "EMP001",
    employee_name: "Ahmed Hassan",
    department: "Engineering",
    designation: "Senior Developer",
    document_type: "Passport",
    document_number: "A1234567",
    issue_date: "2019-05-15",
    expiry_date: "2025-05-15",
    days_until_expiry: 153,
    status: "Active",
    nationality: "UAE",
  },
  {
    id: 2,
    employee_id: "EMP001",
    employee_name: "Ahmed Hassan",
    department: "Engineering",
    designation: "Senior Developer",
    document_type: "Visa",
    document_number: "V7891234",
    issue_date: "2024-01-10",
    expiry_date: "2025-01-10",
    days_until_expiry: 13,
    status: "Expiring Soon",
    nationality: "UAE",
  },
  {
    id: 3,
    employee_id: "EMP002",
    employee_name: "Sarah Johnson",
    department: "Marketing",
    designation: "Marketing Manager",
    document_type: "Emirates ID",
    document_number: "784-1985-1234567-8",
    issue_date: "2020-03-20",
    expiry_date: "2024-12-15",
    days_until_expiry: -13,
    status: "Expired",
    nationality: "USA",
  },
  {
    id: 4,
    employee_id: "EMP002",
    employee_name: "Sarah Johnson",
    department: "Marketing",
    designation: "Marketing Manager",
    document_type: "Driving License",
    document_number: "DL789456123",
    issue_date: "2022-06-10",
    expiry_date: "2025-06-10",
    days_until_expiry: 183,
    status: "Active",
    nationality: "USA",
  },
  {
    id: 5,
    employee_id: "EMP003",
    employee_name: "Mohammed Ali",
    department: "Finance",
    designation: "Finance Executive",
    document_type: "Passport",
    document_number: "B9876543",
    issue_date: "2020-08-12",
    expiry_date: "2025-08-12",
    days_until_expiry: 237,
    status: "Active",
    nationality: "Egypt",
  },
  {
    id: 6,
    employee_id: "EMP003",
    employee_name: "Mohammed Ali",
    department: "Finance",
    designation: "Finance Executive",
    document_type: "Work Permit",
    document_number: "WP456789123",
    issue_date: "2023-11-01",
    expiry_date: "2025-01-15",
    days_until_expiry: 18,
    status: "Expiring Soon",
    nationality: "Egypt",
  },
  {
    id: 7,
    employee_id: "EMP004",
    employee_name: "Lisa Chen",
    department: "HR",
    designation: "HR Specialist",
    document_type: "Visa",
    document_number: "V1122334",
    issue_date: "2023-09-05",
    expiry_date: "2024-12-20",
    days_until_expiry: -8,
    status: "Expired",
    nationality: "China",
  },
  {
    id: 8,
    employee_id: "EMP004",
    employee_name: "Lisa Chen",
    department: "HR",
    designation: "HR Specialist",
    document_type: "Emirates ID",
    document_number: "784-1990-9876543-2",
    issue_date: "2021-04-15",
    expiry_date: "2025-04-15",
    days_until_expiry: 138,
    status: "Active",
    nationality: "China",
  },
  {
    id: 9,
    employee_id: "EMP005",
    employee_name: "Omar Abdullah",
    department: "Operations",
    designation: "Operations Manager",
    document_type: "Passport",
    document_number: "C5544332",
    issue_date: "2019-12-01",
    expiry_date: "2025-12-01",
    days_until_expiry: 348,
    status: "Active",
    nationality: "Jordan",
  },
  {
    id: 10,
    employee_id: "EMP005",
    employee_name: "Omar Abdullah",
    department: "Operations",
    designation: "Operations Manager",
    document_type: "Medical Certificate",
    document_number: "MC789123456",
    issue_date: "2024-06-15",
    expiry_date: "2025-01-05",
    days_until_expiry: 8,
    status: "Expiring Soon",
    nationality: "Jordan",
  },
  {
    id: 11,
    employee_id: "EMP006",
    employee_name: "Jennifer Smith",
    department: "Sales",
    designation: "Sales Executive",
    document_type: "Driving License",
    document_number: "DL456123789",
    issue_date: "2021-02-14",
    expiry_date: "2024-11-30",
    days_until_expiry: -28,
    status: "Expired",
    nationality: "UK",
  },
  {
    id: 12,
    employee_id: "EMP007",
    employee_name: "Rajesh Kumar",
    department: "IT",
    designation: "System Administrator",
    document_type: "Visa",
    document_number: "V9988776",
    issue_date: "2024-08-12",
    expiry_date: "2025-02-12",
    days_until_expiry: 56,
    status: "Active",
    nationality: "India",
  },
  {
    id: 13,
    employee_id: "EMP008",
    employee_name: "Fatima Al-Zahra",
    department: "Legal",
    designation: "Legal Advisor",
    document_type: "Professional License",
    document_number: "PL123456789",
    issue_date: "2023-11-30",
    expiry_date: "2025-01-20",
    days_until_expiry: 23,
    status: "Expiring Soon",
    nationality: "Lebanon",
  },
]

function DocumentExpiryReport() {
  const [loader, setLoader] = useState(false)
  const [filteredData, setFilteredData] = useState(documentExpiryData)
  const [filters, setFilters] = useState({
    department: "",
    document_type: "",
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
  const departments = [...new Set(documentExpiryData.map((doc) => doc.department))]
  const documentTypes = [...new Set(documentExpiryData.map((doc) => doc.document_type))]
  const statuses = [...new Set(documentExpiryData.map((doc) => doc.status))]

  // Handle filtering
  const handleFilter = () => {
    let filtered = documentExpiryData

    if (filters.search) {
      filtered = filtered.filter(
        (doc) =>
          doc.employee_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          doc.employee_id.toLowerCase().includes(filters.search.toLowerCase()) ||
          doc.document_number.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    if (filters.department) {
      filtered = filtered.filter((doc) => doc.department === filters.department)
    }

    if (filters.document_type) {
      filtered = filtered.filter((doc) => doc.document_type === filters.document_type)
    }

    if (filters.status) {
      filtered = filtered.filter((doc) => doc.status === filters.status)
    }

    setFilteredData(filtered)
  }

  // Handle Excel Export
  const handleExcelExport = () => {
    const exportData = filteredData.map((doc) => ({
      "Employee ID": doc.employee_id,
      "Employee Name": doc.employee_name,
      Department: doc.department,
      Designation: doc.designation,
      Nationality: doc.nationality,
      "Document Type": doc.document_type,
      "Document Number": doc.document_number,
      "Issue Date": moment(doc.issue_date).format("DD/MM/YYYY"),
      "Expiry Date": moment(doc.expiry_date).format("DD/MM/YYYY"),
      "Days Until Expiry": doc.days_until_expiry,
      Status: doc.status,
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Document Expiry Report")

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }))
    worksheet["!cols"] = colWidths

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    saveAs(data, `Document_Expiry_Report_${moment().format("YYYY-MM-DD")}.xlsx`)
  }

  // Get status chip color and icon
  const getStatusColor = (status, daysUntilExpiry) => {
    switch (status.toLowerCase()) {
      case "expired":
        return "#f44336"
      case "expiring soon":
        return "#ff9800"
      case "active":
        return daysUntilExpiry <= 30 ? "#ff9800" : "#4caf50"
      default:
        return "#9e9e9e"
    }
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "expired":
        return <ErrorIcon sx={{ fontSize: 16 }} />
      case "expiring soon":
        return <WarningIcon sx={{ fontSize: 16 }} />
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
      header: "Document Type",
      accessorKey: "document_type",
      cell: ({ row }) => <Box sx={{ fontWeight: "bold", color: "#1976d2" }}>{row.original.document_type}</Box>,
    },
    {
      header: "Document Number",
      accessorKey: "document_number",
      cell: ({ row }) => <Box sx={{ fontFamily: "monospace", fontSize: "12px" }}>{row.original.document_number}</Box>,
    },
    {
      header: "Issue Date",
      accessorKey: "issue_date",
      cell: ({ row }) => <Box>{moment(row.original.issue_date).format("DD/MM/YYYY")}</Box>,
    },
    {
      header: "Expiry Date",
      accessorKey: "expiry_date",
      cell: ({ row }) => (
        <Box
          sx={{
            color:
              row.original.days_until_expiry < 0
                ? "#f44336"
                : row.original.days_until_expiry <= 30
                  ? "#ff9800"
                  : "#333",
            fontWeight: row.original.days_until_expiry <= 30 ? "bold" : "normal",
          }}
        >
          {moment(row.original.expiry_date).format("DD/MM/YYYY")}
        </Box>
      ),
    },
    {
      header: "Days Until Expiry",
      accessorKey: "days_until_expiry",
      cell: ({ row }) => (
        <Box
          sx={{
            color:
              row.original.days_until_expiry < 0
                ? "#f44336"
                : row.original.days_until_expiry <= 30
                  ? "#ff9800"
                  : "#4caf50",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {row.original.days_until_expiry < 0
            ? `${Math.abs(row.original.days_until_expiry)} days ago`
            : `${row.original.days_until_expiry} days`}
        </Box>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Chip
          label={row.original.status}
          size="small"
          icon={getStatusIcon(row.original.status)}
          sx={{
            backgroundColor: getStatusColor(row.original.status, row.original.days_until_expiry),
            color: "white",
            fontWeight: "bold",
            "& .MuiChip-icon": {
              color: "white",
            },
          }}
        />
      ),
    },
  ]

  // Calculate statistics
  const totalDocuments = filteredData.length
  const expiredDocuments = filteredData.filter((doc) => doc.status === "Expired").length
  const expiringSoonDocuments = filteredData.filter((doc) => doc.status === "Expiring Soon").length
  const activeDocuments = filteredData.filter((doc) => doc.status === "Active").length

  useEffect(() => {
    handleFilter()
  }, [filters])

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: "28px", fontWeight: "bold", color: "#1976d2", mb: 1 }}>
            Document Expiry Report
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#666" }}>
            Employee wise report tracking expiry of documents uploaded
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
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 2,
              bgcolor: "#e3f2fd",
              borderRadius: 2,
              border: "1px solid #bbdefb",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#1565c0", fontWeight: "bold" }}>Total Documents</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#0d47a1" }}>{totalDocuments}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 2,
              bgcolor: "#ffebee",
              borderRadius: 2,
              border: "1px solid #ffcdd2",
            }}
          >
            <Typography sx={{ fontSize: "14px", color: "#c62828", fontWeight: "bold" }}>Expired Documents</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#b71c1c" }}>{expiredDocuments}</Typography>
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
            <Typography sx={{ fontSize: "14px", color: "#ef6c00", fontWeight: "bold" }}>Expiring Soon</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#e65100" }}>
              {expiringSoonDocuments}
            </Typography>
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
            <Typography sx={{ fontSize: "14px", color: "#2e7d32", fontWeight: "bold" }}>Active Documents</Typography>
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#1b5e20" }}>{activeDocuments}</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Alert Section */}
      {(expiredDocuments > 0 || expiringSoonDocuments > 0) && (
        <Box
          sx={{
            p: 2,
            bgcolor: "#fff3cd",
            borderRadius: 2,
            border: "1px solid #ffeaa7",
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <WarningIcon sx={{ color: "#856404" }} />
          <Box>
            <Typography sx={{ fontSize: "16px", fontWeight: "bold", color: "#856404" }}>
              Document Expiry Alert
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#856404" }}>
              {expiredDocuments > 0 && `${expiredDocuments} document(s) have expired. `}
              {expiringSoonDocuments > 0 && `${expiringSoonDocuments} document(s) are expiring soon.`}
              Please take immediate action to renew these documents.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Filters */}
      <Box
        sx={{
          p: 2,
          bgcolor: "#f8f9fa",
          borderRadius: 2,
          border: "1px solid #e9ecef",
          mb: 3,
        }}
      >
        <Typography sx={{ fontSize: "16px", fontWeight: "bold", mb: 2 }}>Filters</Typography>
        <Grid container spacing={2} display={'flex'} justifyContent={'center'}>
          <Grid item xs={12} sm={6} md={3} >
            <InputField
              size="small"
              
              placeholder="Search by name, ID, or document..."
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
          <Grid item xs={12} sm={6} md={3} mt={1}>
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
          <Grid item xs={12} sm={6} md={3} mt={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Document Type</InputLabel>
              <Select
                value={filters.document_type}
                label="Document Type"
                onChange={(e) => setFilters({ ...filters, document_type: e.target.value })}
              >
                <MenuItem value="">All Document Types</MenuItem>
                {documentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3} mt={1}>
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
      </Box>

      {/* Data Table */}
      <Box>
        <DataTable loading={loader} data={filteredData} columns={columns} />
      </Box>
    </Box>
  )
}

export default DocumentExpiryReport
