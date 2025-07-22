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
import { showErrorToast } from "components/NewToaster"
import SystemServices from "services/System"
import CustomerServices from "services/Customer"
import SelectField from "components/Select"
import ExcelJS from "exceljs";
import { useAuth } from "context/UseContext"

// Dummy data for Document Expiry Report
const documentExpiryData = [
   
]

function DocumentExpiryReport() {
    const [loader, setLoader] = useState(false)
    const [filteredData, setFilteredData] = useState(documentExpiryData)
    const { user } = useAuth();
    const [filters, setFilters] = useState({
        department: "",
        document_type: "",
        status: "",
        search: "",
    })

    const [data, setData] = useState([])
    const [statsData, setStatsData] = useState(null)
    const [employees, setEmployees] = useState([])
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const getData = async (id) => {
        // setLoader(true)
        try {
            let params = {
                employee_id: id ? id : selectedEmployee?.user_id ,
            }

            const { data } = await SystemServices.getDocExpiryReport(params);
            console.log(data);

            setData(data?.documents);

            setStatsData(data)
            setFilteredData(data?.documents)
        } catch (error) {
            showErrorToast(error);
        } finally {
            // setLoader(false)
        }
    };
    const getEmployees = async (page, limit, filter) => {
        setLoader(true)

        try {

            let params = {
                page: 1,
                limit: 999999,


            }

            const { data } = await CustomerServices.getEmployees(params)
            const formattedData = data?.employees?.rows?.map((item, index) => ({
                ...item,
                id: item?.id,
                name: item?.user?.name,
            }));

            if (user?.role_id != 6) {
                console.log(formattedData);
                console.log(user?.id);


                const findElement = formattedData?.find((item) => item?.user_id == user?.id);
                console.log('Found Element:', findElement);


                setSelectedEmployee(findElement)


            }
            setEmployees(formattedData);

        } catch (error) {
            showErrorToast(error)
        } finally {
            setLoader(false)
        }
    }
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
    // Handle Excel Export - matching table columns exactly
    const handleExcelExport = async () => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Document Expiry Report")

        // Set professional header and footer
        worksheet.headerFooter.oddHeader =
            '&C&"Arial,Bold"&18DOCUMENT EXPIRY REPORT\n' +
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
        const titleRow = worksheet.addRow(["DOCUMENT EXPIRY REPORT"])
        titleRow.getCell(1).font = {
            name: "Arial",
            size: 16,
            bold: true,
            color: { argb: "2F4F4F" },
        }
        titleRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A1:H1")

        // Dynamic company name based on environment
        const name =
            process.env.NEXT_PUBLIC_TYPE === "TASHEEL"
                ? "PREMIUM BUSINESSMEN SERVICES"
                : "PREMIUM PROFESSIONAL GOVERNMENT SERVICES LLC"

        const companyRow = worksheet.addRow([name])
        companyRow.getCell(1).font = {
            name: "Arial",
            size: 14,
            bold: true,
            color: { argb: "4472C4" },
        }
        companyRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A2:H2")

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
        worksheet.mergeCells("A3:H3")

        // Add empty row for spacing
        worksheet.addRow([])

        // Headers matching the table columns exactly
        const headers = [
            "Employee ID",
            "Employee Name",
            "Department",
            "Document Type",
            "Document Number",
            "Issue Date",
            "Expiry Date",
            "Days Until Expiry",
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

        // Add all documents with data matching table columns
        filteredData?.forEach((doc) => {
            const daysUntilExpiry = Math.floor((new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))

            const row = worksheet.addRow([
                doc.employee?.employee_code,
                doc.employee?.first_name,
                doc.employee?.department,
                doc.name,
                doc.reference_id,
                new Date(doc.updatedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }),
                new Date(doc.expiry_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }),
                daysUntilExpiry < 0 ? `${Math.abs(daysUntilExpiry)} days ago` : `${daysUntilExpiry} days`,
            ])

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

            // Color code expiry date based on days until expiry
            const expiryDateCell = row.getCell(7)
            const daysCell = row.getCell(8)

            if (daysUntilExpiry < 0) {
                // Expired - Red
                expiryDateCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "F44336" },
                }
                expiryDateCell.font = { color: { argb: "FFFFFF" }, bold: true }
                daysCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "F44336" },
                }
                daysCell.font = { color: { argb: "FFFFFF" }, bold: true }
            } else if (daysUntilExpiry <= 30) {
                // Expiring Soon - Orange
                expiryDateCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF9800" },
                }
                expiryDateCell.font = { color: { argb: "FFFFFF" }, bold: true }
                daysCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF9800" },
                }
                daysCell.font = { color: { argb: "FFFFFF" }, bold: true }
            } else {
                // Active - Green
                daysCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "4CAF50" },
                }
                daysCell.font = { color: { argb: "FFFFFF" }, bold: true }
            }
        })

        // Set column widths
        worksheet.columns = [
            { width: 12 }, // Employee ID
            { width: 25 }, // Employee Name
            { width: 15 }, // Department
            { width: 20 }, // Document Type
            { width: 20 }, // Document Number
            { width: 15 }, // Issue Date
            { width: 15 }, // Expiry Date
            { width: 18 }, // Days Until Expiry
        ]

        // Add empty rows for spacing before footer
        worksheet.addRow([])
        worksheet.addRow([])

        // Add the electronic generated report text with black border
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
        worksheet.mergeCells(`A${reportRow.number}:H${reportRow.number}`)

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
        worksheet.mergeCells(`A${system2.number}:H${system2.number}`)

        // Add empty row for spacing
        worksheet.addRow([])

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        saveAs(
            blob,
            `Document_Expiry_Report_${new Date()
                .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })
                .replace(/\//g, "-")}.xlsx`,
        )
    }



    // Get status chip color and icon
    const getStatusColor = (status, daysUntilExpiry) => {
        switch (status?.toLowerCase()) {
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
        switch (status?.toLowerCase()) {
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
            cell: ({ row }) => <Box >{row.original.employee?.employee_code}</Box>,
        },
        {
            header: "Employee Name",
            accessorKey: "employee_name",
            cell: ({ row }) => <Box >{row.original.employee?.first_name}</Box>,
        },
        {
            header: "Department",
            accessorKey: "department",
            cell: ({ row }) => <Box >{row.original.employee?.department}</Box>,
        },
        {
            header: "Document Type",
            accessorKey: "name",
            cell: ({ row }) => <Box sx={{ fontWeight: "bold", color: "#1976d2" }}  >{row.original.name}</Box>,
        },
        {
            header: "Document Number",
            accessorKey: "reference_id",
            cell: ({ row }) => <Box sx={{ fontFamily: "monospace", fontSize: "12px" }}>{row.original.reference_id}</Box>,
        },

        {
            header: "Issue Date",
            accessorKey: "updatedAt",
            cell: ({ row }) => <Box>{moment(row.original.updatedAt).format("DD/MM/YYYY")}</Box>,
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
                    {row.original.expiry_date ? moment(row.original.expiry_date).format("DD/MM/YYYY") : '-'}
                </Box>
            ),
        },
        {
            header: "Days Until Expiry",
            accessorKey: "expiry_date", // optional if used only in cell
            cell: ({ row }) => {
                const days = moment(row.original.expiry_date).startOf('day').diff(moment().startOf('day'), 'days');
                return (
                    <Box
                        sx={{
                            color: days < 0 ? "#f44336" : days <= 30 ? "#ff9800" : "#4caf50",
                            fontWeight: "bold",
                            textAlign: "center",
                        }}
                    >
                        {row.original.expiry_date ? days < 0 ? `${Math.abs(days)} days ago` : `${days} days` : '-'}
                    </Box>
                );
            },
        },


    ]

    // Calculate statistics
    const totalDocuments = filteredData?.length
    const expiredDocuments = filteredData?.filter((doc) => doc.status === "Expired").length
    const expiringSoonDocuments = filteredData?.filter((doc) => doc.status === "Expiring Soon").length
    const activeDocuments = filteredData?.filter((doc) => doc.status === "Active").length

    useEffect(() => {
        handleFilter()
    }, [filters])

    useEffect(() => {
        getEmployees()
        if (user?.role_id != 6) {
           getData(user?.id)
        }
        else{
             getData()
        }

    }, [])


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
                        <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#0d47a1" }}>{totalDocuments || 0}</Typography>
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
                        <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#b71c1c" }}>{statsData?.expiredDocuments || 0}</Typography>
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
                            {statsData?.expiringSoon || 0}
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
                        <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#1b5e20" }}>{statsData?.activeDocuments || 0}</Typography>
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
            {user?.role_id == 6 && <Box
                sx={{
                    p: 2,
                    bgcolor: "#f8f9fa",
                    borderRadius: 2,
                    border: "1px solid #e9ecef",
                    mb: 3,
                }}
            >
                <Typography sx={{ fontSize: "16px", fontWeight: "bold", mb: 2 }}>Filters</Typography>
                <Grid container spacing={2} display={'flex'} >
                    <Grid item xs={12} sm={6} md={3} >
                        <SelectField size="small"
                            label="Select Employee "
                            options={employees}
                            disabled={user?.role_id != 6}
                            selected={selectedEmployee}
                            onSelect={(value) => {
                                console.log(value);
                                getData(value?.user_id)
                                setSelectedEmployee(value)
                            }}

                        />
                    </Grid>

                </Grid>
            </Box>}

            {/* Data Table */}
            <Box>
                <DataTable loading={loader} data={filteredData} columns={columns} />
            </Box>
        </Box>
    )
}

export default DocumentExpiryReport
