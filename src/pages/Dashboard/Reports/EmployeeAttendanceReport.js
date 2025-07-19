"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Grid, Chip } from "@mui/material"
import { Download as DownloadIcon } from "@mui/icons-material"
import { useForm } from "react-hook-form"
import { saveAs } from "file-saver"
import moment from "moment"
import DataTable from "components/DataTable"
import { PrimaryButton } from "components/Buttons"
import { showErrorToast } from "components/NewToaster"
import SelectField from "components/Select"
import ExcelJS from "exceljs"
import SystemServices from "services/System"
import CustomerServices from "services/Customer"
import DatePicker from "components/DatePicker"
import { useAuth } from "context/UseContext"

// Mock data based on your API structure
const mockData = {
    employee: {
        id: 128,
        name: "saraib aqeel",
        department: "Development",
        designation: "Frontend Developer",
        deduction_type: "Time",
        minimum_required_hours: 8,
    },
    period: {
        start: "2025-06-26",
        end: "2025-07-25",
    },
    stats: {
        totalDays: 30,
        workableDays: 26,
        totalHolidays: 0,
        weekendCount: 4,
        totalAbsents: 26,
        totalPresents: 4,
        approvedLeaveDays: 2,
        shouldHaveWorkedHours: 208,
        shouldHaveWorkedMinutes: 12480,
        totalWorkingHours: 32,
        totalWorkingMinutes: 1920,
        totalShortHours: 2,
        totalShortMinutes: 120,
        totalExcessHours: 1,
        totalExcessMinutes: 60,
        totalAbsentHours: 208,
        totalLeaveHours: 16,
    },
    daily: [
        {
            date: "2025-06-26",
            isWeekend: false,
            isHoliday: false,
            present: false,
            absent: true,
            onLeave: false,
            check_in: null,
            check_out: null,
            worked_minutes: 0,
            worked_hours: 0,
            worked_time: "",
            short_minutes: 0,
            short_hours: 0,
            excess_minutes: 0,
            excess_hours: 0,
            deduction_type: "Time",
        },
        {
            date: "2025-06-27",
            isWeekend: false,
            isHoliday: false,
            present: true,
            absent: false,
            onLeave: false,
            check_in: "09:00",
            check_out: "17:30",
            worked_minutes: 510,
            worked_hours: 8.5,
            worked_time: "8h 30m",
            short_minutes: 0,
            short_hours: 0,
            excess_minutes: 30,
            excess_hours: 0.5,
            deduction_type: "Time",
        },
        {
            date: "2025-06-28",
            isWeekend: false,
            isHoliday: false,
            present: false,
            absent: false,
            onLeave: true,
            check_in: null,
            check_out: null,
            worked_minutes: 0,
            worked_hours: 0,
            worked_time: "",
            short_minutes: 0,
            short_hours: 0,
            excess_minutes: 0,
            excess_hours: 0,
            deduction_type: "Time",
        },
        {
            date: "2025-06-29",
            isWeekend: true,
            isHoliday: false,
            present: false,
            absent: false,
            onLeave: false,
            check_in: null,
            check_out: null,
            worked_minutes: 0,
            worked_hours: 0,
            worked_time: "",
            short_minutes: 0,
            short_hours: 0,
            excess_minutes: 0,
            excess_hours: 0,
            deduction_type: "Time",
        },
        {
            date: "2025-06-30",
            isWeekend: false,
            isHoliday: false,
            present: true,
            absent: false,
            onLeave: false,
            check_in: "09:15",
            check_out: "16:45",
            worked_minutes: 450,
            worked_hours: 7.5,
            worked_time: "7h 30m",
            short_minutes: 30,
            short_hours: 0.5,
            excess_minutes: 0,
            excess_hours: 0,
            deduction_type: "Time",
        },
    ],
}

const mockEmployees = [
    { id: 128, name: "saraib aqeel", user: { name: "saraib aqeel" } },
    { id: 129, name: "John Doe", user: { name: "John Doe" } },
    { id: 130, name: "Jane Smith", user: { name: "Jane Smith" } },
]

function EmployeeAttendanceReport() {
    const [loader, setLoader] = useState(false)
    const [data, setData] = useState(null)
    const [employees, setEmployees] = useState([])
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const { user } = useAuth();
    const getData = async (id) => {
        try {
            const params = {
                user_id: id ? id : selectedEmployee?.user_id,
                from_date: fromDate ? moment(fromDate).format("MM-DD-YYYY") : "",
                to_date: toDate ? moment(toDate).format("MM-DD-YYYY") : "",
            }
            const { data } = await SystemServices.getEmployeeAttendance(params);
            console.log(data);
            setData(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getEmployees = async (page, limit, filter) => {
        setLoader(true)
        try {
            const params = {
                page: 1,
                limit: 999999,
            }
            const { data } = await CustomerServices.getEmployees(params)
            const formattedData = data?.employees?.rows?.map((item, index) => ({
                ...item,
                id: item?.id,
                name: item?.user?.name,
            }))
            setEmployees(formattedData)
            if (user?.role_id === 4) {

                const findElement = formattedData?.find((item) => item?.user_id == user?.id);
                console.log('Found Element:', findElement);


                setSelectedEmployee(findElement)


            }
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

    // Handle Excel Export with professional formatting
    const handleExcelExport = async () => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Employee Attendance Report")

        // Set professional header and footer
        worksheet.headerFooter.oddHeader =
            '&C&"Arial,Bold"&18EMPLOYEE ATTENDANCE REPORT\n' +
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
        const titleRow = worksheet.addRow(["EMPLOYEE ATTENDANCE REPORT"])
        titleRow.getCell(1).font = {
            name: "Arial",
            size: 16,
            bold: true,
            color: { argb: "2F4F4F" },
        }
        titleRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A1:J1")

        // Dynamic company name based on environment
        const name =
            process.env.REACT_APP_TYPE === "TASHEEL"
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
        worksheet.mergeCells("A2:J2")

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
        worksheet.mergeCells("A3:J3")

        // Add employee info
        const empInfoRow = worksheet.addRow([
            `Employee: ${data?.employee?.name} | Department: ${data?.employee?.department} | Period: ${moment(data?.period?.start).format("DD/MM/YYYY")} to ${moment(data?.period?.end).format("DD/MM/YYYY")}`,
        ])
        empInfoRow.getCell(1).font = {
            name: "Arial",
            size: 12,
            bold: true,
            color: { argb: "1976d2" },
        }
        empInfoRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A4:J4")

        // Add empty row for spacing
        worksheet.addRow([])

        // Headers matching the table columns exactly
        const headers = [
            "Date",
            "Day",
            "Day Type",
            "Status",
            "Check In",
            "Check Out",
            "Worked Hours",
            "Short Hours",
            "Excess Hours",
            "Worked Time",
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

        // Add all daily attendance records
        data?.daily?.forEach((day) => {
            const dayType = day.isWeekend ? "Weekend" : day.isHoliday ? "Holiday" : "Workday"
            const status = day.present ? "Present" : day.absent ? "Absent" : day.onLeave ? "On Leave" : "N/A"

            const row = worksheet.addRow([
                moment(day.date).format("DD/MM/YYYY"),
                moment(day.date).format("ddd"),
                dayType,
                status,
                day.check_in || "N/A",
                day.check_out || "N/A",
                day.worked_hours || 0,
                day.short_hours || 0,
                day.excess_hours || 0,
                day.worked_time || "N/A",
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

            // Color code status
            const statusCell = row.getCell(4)
            switch (status.toLowerCase()) {
                case "present":
                    statusCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "4CAF50" },
                    }
                    statusCell.font = { color: { argb: "FFFFFF" }, bold: true }
                    break
                case "absent":
                    statusCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "F44336" },
                    }
                    statusCell.font = { color: { argb: "FFFFFF" }, bold: true }
                    break
                case "on leave":
                    statusCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FF9800" },
                    }
                    statusCell.font = { color: { argb: "FFFFFF" }, bold: true }
                    break
            }

            // Color code day type
            const dayTypeCell = row.getCell(3)
            if (dayType === "Weekend") {
                dayTypeCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "9E9E9E" },
                }
                dayTypeCell.font = { color: { argb: "FFFFFF" }, bold: true }
            } else if (dayType === "Holiday") {
                dayTypeCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "2196F3" },
                }
                dayTypeCell.font = { color: { argb: "FFFFFF" }, bold: true }
            }
        })

        // Set column widths
        worksheet.columns = [
            { width: 12 }, // Date
            { width: 12 }, // Day
            { width: 12 }, // Day Type
            { width: 12 }, // Status
            { width: 12 }, // Check In
            { width: 12 }, // Check Out
            { width: 15 }, // Worked Hours
            { width: 12 }, // Short Hours
            { width: 12 }, // Excess Hours
            { width: 15 }, // Worked Time
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
        worksheet.mergeCells(`A${reportRow.number}:J${reportRow.number}`)

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
        worksheet.mergeCells(`A${system2.number}:J${system2.number}`)

        // Add empty row for spacing
        worksheet.addRow([])

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        saveAs(
            blob,
            `Employee_Attendance_Report_${new Date()
                .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })
                .replace(/\//g, "-")}.xlsx`,
        )
    }

    // Get status chip color and icon
    const getStatusColor = (day) => {
        if (day.present) return "#4caf50"
        if (day.absent) return "#f44336"
        if (day.onLeave) return "#ff9800"
        return "#9e9e9e"
    }

    const getDayTypeColor = (day) => {
        if (day.isWeekend) return "#9e9e9e"
        if (day.isHoliday) return "#2196f3"
        return "#4caf50"
    }

    // DataTable columns configuration
    const columns = [
        {
            header: "Date",
            accessorKey: "date",
            cell: ({ row }) => <Box>{moment(row.original.date).format("DD/MM/YYYY")}</Box>,
        },
        {
            header: "Day",
            accessorKey: "date",
            cell: ({ row }) => (
                <Box sx={{ fontWeight: "bold", color: "#1976d2" }}>{moment(row.original.date).format("ddd")}</Box>
            ),
        },
        {
            header: "Day Type",
            accessorKey: "dayType",
            cell: ({ row }) => {
                const dayType = row.original.isWeekend ? "Weekend" : row.original.isHoliday ? "Holiday" : "Workday"
                return (
                    <Chip
                        label={dayType}
                        size="small"
                        sx={{
                            backgroundColor: getDayTypeColor(row.original),
                            color: "white",
                            fontWeight: "bold",
                        }}
                    />
                )
            },
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => {
                const status = row.original.present
                    ? "Present"
                    : row.original.absent
                        ? "Absent"
                        : row.original.onLeave
                            ? "On Leave"
                            : "N/A"
                return (
                    <Chip
                        label={status}
                        size="small"
                        sx={{
                            backgroundColor: getStatusColor(row.original),
                            color: "white",
                            fontWeight: "bold",
                        }}
                    />
                )
            },
        },
        {
            header: "Check In",
            accessorKey: "check_in",
            cell: ({ row }) => <Box sx={{ fontFamily: "monospace", fontSize: "12px" }}>{row.original.check_in || "N/A"}</Box>,
        },
        {
            header: "Check Out",
            accessorKey: "check_out",
            cell: ({ row }) => (
                <Box sx={{ fontFamily: "monospace", fontSize: "12px" }}>{row.original.check_out || "N/A"}</Box>
            ),
        },
        {
            header: "Worked Hours",
            accessorKey: "worked_hours",
            cell: ({ row }) => <Box sx={{ fontWeight: "bold", color: "#1976d2" }}>{row.original.worked_hours || 0}h</Box>,
        },
        {
            header: "Short Hours",
            accessorKey: "short_hours",
            cell: ({ row }) => (
                <Box sx={{ fontWeight: "bold", color: row.original.short_hours > 0 ? "#f44336" : "#666" }}>
                    {row.original.short_hours || 0}h
                </Box>
            ),
        },
        {
            header: "Excess Hours",
            accessorKey: "excess_hours",
            cell: ({ row }) => (
                <Box sx={{ fontWeight: "bold", color: row.original.excess_hours > 0 ? "#4caf50" : "#666" }}>
                    {row.original.excess_hours || 0}h
                </Box>
            ),
        },
        {
            header: "Worked Time",
            accessorKey: "worked_time",
            cell: ({ row }) => <Box sx={{ fontWeight: "bold", color: "#1976d2" }}>{row.original.worked_time || "N/A"}</Box>,
        },
    ]

    useEffect(() => {
        getEmployees()

    }, [])
  useEffect(() => {
    if (selectedEmployee && fromDate && toDate) {
        getData();
    } else {
        if (!selectedEmployee) {
            showErrorToast('Please select an employee');
        }
        if (!fromDate) {
            showErrorToast('Please select a "From" date');
        }
        if (!toDate) {
            showErrorToast('Please select a "To" date');
        }
    }
}, [fromDate, toDate]);



    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                    <Typography sx={{ fontSize: "28px", fontWeight: "bold", color: "#1976d2", mb: 1 }}>
                        Employee Attendance Report
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "#666" }}>
                        Daily attendance tracking and working hours analysis
                    </Typography>
                </Box>
                <PrimaryButton
                    bgcolor={"#1976d2"}
                    title="Export to Excel"
                    onClick={handleExcelExport}
                    startIcon={<DownloadIcon />}
                />
            </Box>
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
                <Grid container spacing={2} display={"flex"}>
                    <Grid item xs={12} sm={6} md={3}>
                        <SelectField
                            size="small"
                            label="Select Employee "
                            options={employees}
                            selected={selectedEmployee}
                            onSelect={(value) => {
                                console.log(value)
                                if (value) {
                                    getData(value?.user_id)
                                }

                                setSelectedEmployee(value)
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <DatePicker

                            size="small"
                            label={"From Date"}
                            value={fromDate}
                            onChange={(date) => setFromDate(new Date(date))}
                        />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                        <DatePicker

                            size="small"
                            minDate={fromDate}
                            label={"To Date"}
                            value={toDate}
                            onChange={(date) => setToDate(new Date(date))}
                        />
                    </Grid>
                </Grid>
            </Box>
            {/* Employee Info Card */}
            {data?.employee && (
                <Box
                    sx={{
                        p: 2,
                        bgcolor: "#e3f2fd",
                        borderRadius: 2,
                        border: "1px solid #bbdefb",
                        mb: 3,
                    }}
                >
                    <Typography sx={{ fontSize: "16px", fontWeight: "bold", mb: 2, color: "#1976d2" }}>
                        Employee Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography sx={{ fontSize: "14px", color: "#666" }}>
                                <strong>Employee:</strong> {data.employee.name}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography sx={{ fontSize: "14px", color: "#666" }}>
                                <strong>Department:</strong> {data.employee.department}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography sx={{ fontSize: "14px", color: "#666" }}>
                                <strong>Designation:</strong> {data.employee.designation}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography sx={{ fontSize: "14px", color: "#666" }}>
                                <strong>Period:</strong> {moment(data.period.start).format("DD/MM/YYYY")} -{" "}
                                {moment(data.period.end).format("DD/MM/YYYY")}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            )}

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
                        <Typography sx={{ fontSize: "14px", color: "#1565c0", fontWeight: "bold" }}>Total Days</Typography>
                        <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#0d47a1" }}>
                            {data?.stats?.totalDays || 0}
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
                        <Typography sx={{ fontSize: "14px", color: "#2e7d32", fontWeight: "bold" }}>Present Days</Typography>
                        <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#1b5e20" }}>
                            {data?.stats?.totalPresents || 0}
                        </Typography>
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
                        <Typography sx={{ fontSize: "14px", color: "#c62828", fontWeight: "bold" }}>Absent Days</Typography>
                        <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#b71c1c" }}>
                            {data?.stats?.totalAbsents || 0}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: "#f3e5f5",
                            borderRadius: 2,
                            border: "1px solid #e1bee7",
                        }}
                    >
                        <Typography sx={{ fontSize: "14px", color: "#7b1fa2", fontWeight: "bold" }}>Working Hours</Typography>
                        <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#4a148c" }}>
                            {data?.stats?.totalWorkingHours || 0}h
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Additional Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: "#f8f9fa",
                            borderRadius: 2,
                            border: "1px solid #e9ecef",
                        }}
                    >
                        <Typography sx={{ fontSize: "14px", color: "#666", fontWeight: "bold" }}>Workable Days</Typography>
                        <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
                            {data?.stats?.workableDays || 0}
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
                        <Typography sx={{ fontSize: "14px", color: "#ef6c00", fontWeight: "bold" }}>Leave Days</Typography>
                        <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#e65100" }}>
                            {data?.stats?.approvedLeaveDays || 0}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: "#fff8e1",
                            borderRadius: 2,
                            border: "1px solid #ffecb3",
                        }}
                    >
                        <Typography sx={{ fontSize: "14px", color: "#f57f17", fontWeight: "bold" }}>Short Hours</Typography>
                        <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#f57f17" }}>
                            {data?.stats?.totalShortHours || 0}h
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: "#e8eaf6",
                            borderRadius: 2,
                            border: "1px solid #c5cae9",
                        }}
                    >
                        <Typography sx={{ fontSize: "14px", color: "#3f51b5", fontWeight: "bold" }}>Excess Hours</Typography>
                        <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#3f51b5" }}>
                            {data?.stats?.totalExcessHours || 0}h
                        </Typography>
                    </Box>
                </Grid>
            </Grid>



            {/* Data Table */}
            <Box>
                <DataTable loading={loader} data={data?.daily || []} columns={columns} />
            </Box>
        </Box>
    )
}

export default EmployeeAttendanceReport
