"use client"
import { useState, useMemo, useEffect, useCallback, memo } from "react"
import moment from "moment"
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Box,
    Chip,
    InputAdornment,
    Grid,
    Card,
    CardContent,
    Avatar,
    Tooltip,
    useTheme,
    alpha,
    FormControl,
    InputLabel,
    Button,
    TablePagination, // Import TablePagination
} from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { v4 as uuidv4 } from "uuid" // For generating unique IDs
import {
    Search as SearchIcon,
    CalendarToday as CalendarIcon,
    Group as Users,
    AccessTime as Clock,
    CheckCircle as CheckCircleIcon,
    Cancel as XCircleIcon,
    FilterAlt as Filter,
} from "@mui/icons-material"
import { saveAs } from "file-saver"
import SystemServices from "services/System"
import { PrimaryButton } from "components/Buttons"
import ExcelJS from "exceljs"
import Colors from "assets/Style/Colors"
import { Controller, useForm } from "react-hook-form"
import SimpleDialog from "components/Dialog/SimpleDialog"
import CustomerServices from "services/Customer"
import { showErrorToast, showPromiseToast } from "components/NewToaster"
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs from "dayjs"
import { agencyType } from "utils"
import { useAuth } from "context/UseContext"
import InputField from "components/Input"
const formatTime = (timeString) => {
    return timeString ? moment(timeString, "HH:mm").format("hh:mm A") : "--:--"
}
// Memoized function to get all days of a month - moved outside component
const getDaysInMonth = (year, month) => {
    const daysInMonth = moment([year, month]).daysInMonth()
    const days = []
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(moment([year, month, i]))
    }
    return days
}
const formatMinutesToTime = (minutesStr) => {
    const totalMinutes = parseInt(parseFloat(minutesStr), 10);
    return moment().startOf("day").add(totalMinutes, "minutes").format("hh:mm A");
};

const getStatusStyles = (status) => {
    switch (status) {
        case "Present":
            return {
                bg: "#e8f5e9",
                border: "1px solid #66bb6a",
                color: "#2e7d32",
            };
        case "Absent":
            return {
                bg: "#e3f2fd",
                border: "1px solid #ef5350",
                color: "#c62828",
            };
        case "Pending":
            return {
                bg: "#fffde7",               // Light yellow background
                border: "1px solid #ffeb3b", // Bright yellow border
                color: "#fbc02d",            // Darker yellow text for better contrast
            };

        default: {
            return {
                bg: "rgba(158, 126, 255, 0.15)", // light purple background
                border: "1px solid #7e57c2",     // medium purple border
                color: "#5e35b1",                // deep purple text
            };
        }

    }
};

// Memoized employee row component
const EmployeeRow = memo(({ employee, daysInMonth, onCellClick }) => {
    const theme = useTheme()
    console.log(employee, 'employee');

    return (
        <TableRow
            hover
            sx={{
                transition: "background-color 0.3s ease",
                "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
            }}
        >
            {/* Employee Name Cell */}
            <TableCell
                sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 1,
                    bgcolor: theme.palette.background.paper,
                    minWidth: 200,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar src={process.env.REACT_APP_IMAGE_BASE_URL_NEW + employee.avatar} alt={employee.name} sx={{ width: 40, height: 40 }} />
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {employee.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            ID: {employee.employee_id}
                        </Typography>
                    </Box>
                </Box>
            </TableCell>

            {/* Attendance Days */}
            {daysInMonth.map((day) => {
                const dateStr = day.format("YYYY-MM-DD");
                const isSunday = day.day() === 0;

                const dayAttendance = employee.attendance.find((att) => att.date === dateStr);
                const status = dayAttendance?.status || "A";
                const duration = dayAttendance?.duration || "0h 0m";
                const remarks = dayAttendance?.logs?.[0]?.remarks;
                const logs = dayAttendance?.logs?.[0] || {};
                const shift = dayAttendance?.shift_time;

                const { bg, border, color } =
                    logs.check_in && !logs.check_out
                        ? getStatusStyles("Pending")
                        : getStatusStyles(status);

                return (
                    <TableCell
                        key={`${employee.id}-${dateStr}`}
                        align="center"
                        onClick={() => onCellClick(employee, dateStr, dayAttendance?.logs)}
                        sx={{
                            cursor: "pointer",
                            p: 1,
                        }}
                    >
                        <Tooltip title={`Duration: ${duration}`} arrow placement="top">
                            <Box
                                sx={{
                                    width: 150,
                                    height: 150,
                                    py: 1,
                                    px: 1.5,
                                    borderRadius: "5px",
                                    backgroundColor: bg,
                                    border: border,
                                    color: color,
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    textAlign: "center",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 0.5,
                                    transition: "all 0.2s",
                                    "&:hover": {
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                        transform: "scale(1.02)",
                                    },
                                }}
                            >
                                <Box sx={{ fontWeight: 600 }}>{status}</Box>
                                <Box sx={{ fontWeight: 600 }}>{duration}</Box>

                                {status === "Present" && (
                                    <>
                                        <Box sx={{ fontSize: "0.7rem" }}>
                                            In: {logs.check_in ? formatMinutesToTime(logs.check_in) : "--:--"}
                                        </Box>
                                        <Box sx={{ fontSize: "0.7rem" }}>
                                            Out: {logs.check_out ? formatMinutesToTime(logs.check_out) : "--:--"}
                                        </Box>
                                    </>
                                )}

                                {status === "Present" && (
                                    <Box sx={{ fontSize: "0.7rem" }}>Shift: {shift}</Box>
                                )}

                                {/* Remarks Info Icon */}
                                {remarks && (
                                    <Tooltip title={remarks} arrow placement="bottom">
                                        <InfoOutlinedIcon
                                            sx={{
                                                fontSize: "1rem",
                                                color: "#1976d2",
                                                cursor: "pointer",
                                                mt: 0.5,
                                                mb: 0.5,
                                            }}
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                        </Tooltip>
                    </TableCell>
                );
            })}

        </TableRow>
    )
})
EmployeeRow.displayName = "EmployeeRow"

export default function AttendanceTable() {
    const { user } = useAuth();
    const theme = useTheme()
    const [nameFilter, setNameFilter] = useState("")
    const [selectedDate, setSelectedDate] = useState(moment())
    const [attendanceData, setAttendanceData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [dialog, setDialog] = useState(false)
    const [tableDate, setTableDate] = useState(null)
    const [selectedData, setSelectedData] = useState(null)
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        control,
        reset,
    } = useForm()
    const [startDate, setStartDate] = useState(moment().startOf("month").format("YYYY-MM-DD"))
    const [endDate, setEndDate] = useState(moment().endOf("month").format("YYYY-MM-DD"))
    const [originalData, setOriginalData] = useState([])
    // Pagination state
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const downloadExcel = async () => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Attendance Report")
        worksheet.headerFooter.oddHeader =
            '&C&"Arial,Bold"&18ATTENDANCE REPORT\n' +
            '&C&"Arial,Regular"&12Your Company Name\n' +
            '&C&"Arial,Regular"&10Period: &D - &T\n' +
            '&L&"Arial,Regular"&8Generated on: ' +
            new Date().toLocaleDateString() +
            "\n" +
            '&R&"Arial,Regular"&8Page &P of &N'
        worksheet.headerFooter.oddFooter =
            '&L&"Arial,Regular"&8Confidential - Internal Use Only' +
            '&C&"Arial,Regular"&8This report contains attendance data as of ' +
            new Date().toLocaleDateString() +
            '&R&"Arial,Regular"&8Generated by: HR Department\n' +
            '&C&"Arial,Regular"&8Powered by Premium Business Solutions'
        worksheet.headerFooter.evenFooter = worksheet.headerFooter.oddFooter
        worksheet.pageSetup = {
            paperSize: 9,
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
        // Title
        const titleRow = worksheet.addRow([])
        titleRow.getCell(5).value = "TRIAL BALANCE REPORT"
        titleRow.getCell(5).font = { name: "Arial", size: 16, bold: true, color: { argb: "2F4F4F" } }
        titleRow.getCell(5).alignment = { horizontal: "center" }
        worksheet.mergeCells("E1:L1")
        // Company Name

        const name =
            agencyType[process.env.REACT_APP_TYPE]?.name
        const companyRow = worksheet.addRow([])
        companyRow.getCell(5).value = name
        companyRow.getCell(5).font = { name: "Arial", size: 14, bold: true, color: { argb: "4472C4" } }
        companyRow.getCell(5).alignment = { horizontal: "center" }
        worksheet.mergeCells("E2:L2")
        // Report Date
        const dateRow = worksheet.addRow([])
        dateRow.getCell(5).value =
            `Report Generated: ${new Date().toLocaleDateString("en-GB")} at ${new Date().toLocaleTimeString("en-GB", { hour12: false })}`
        dateRow.getCell(5).font = { name: "Arial", size: 10, italic: true, color: { argb: "666666" } }
        dateRow.getCell(5).alignment = { horizontal: "center" }
        worksheet.mergeCells("E3:L3")
        // Period
        const dateRow2 = worksheet.addRow([])
        dateRow2.getCell(5).value =
            endDate && startDate
                ? `Period: ${new Date(startDate).toLocaleDateString("en-GB")} To ${new Date(endDate).toLocaleDateString("en-GB")}`
                : `Period: All`
        dateRow2.getCell(5).font = { name: "Arial", size: 10, italic: true, color: { argb: "666666" } }
        dateRow2.getCell(5).alignment = { horizontal: "center" }
        worksheet.mergeCells("E4:L4")
        // Total Employees
        const totalEmployeesRow = worksheet.addRow([])
        totalEmployeesRow.getCell(5).value = `Total Employees: ${filteredData.length}`
        totalEmployeesRow.getCell(5).font = { name: "Arial", size: 10, italic: true, color: { argb: "666666" } }
        totalEmployeesRow.getCell(5).alignment = { horizontal: "center", vertical: "middle" }
        worksheet.mergeCells("E5:L5")
        worksheet.addRow([]) // spacing
        const headers = ["Employee Name", "Employee ID"]
        daysInMonth.forEach((day) => {
            headers.push(`${day.format("DD/MM")} (${day.format("ddd")})`)
        })
        const headerRow = worksheet.addRow(headers)
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "001f3f" },
            }
            cell.font = {
                bold: true,
                color: { argb: "FFFFFF" },
                size: 10,
            }
            cell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
            }
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            }
        })
        worksheet.views = [
            {
                state: "frozen",
                ySplit: headerRow.number,
                xSplit: 2,
                topLeftCell: "C" + (headerRow.number + 1),
                activeCell: "A1",
            },
        ]
        let totalPresentDays = 0
        let totalAbsentDays = 0
        let totalWorkingDays = 0
        transformedData?.forEach((employee, index) => {
            const rowData = [employee.name, employee.id]
            daysInMonth.forEach((day) => {
                const dateStr = day.format("YYYY-MM-DD")
                const att = employee.attendance.find((a) => a.date === dateStr)
                if (att) {
                    if (att.status === "Present") {
                        console.log(att, 'att');

                        const checkIn = att?.logs[0]?.check_in ? formatMinutesToTime(att?.logs[0]?.check_in) : "N/A";
                        const checkOut = att?.logs[att?.logs?.length - 1]?.check_out ? formatMinutesToTime(att?.logs[att?.logs?.length - 1]?.check_out) : "N/A";

                        const shiftTime = (att?.shift_time);



                        rowData.push(`✔ ${att.duration || "Present"} | In: ${checkIn} | Out: ${checkOut} | Shift: ${shiftTime}`);
                        totalPresentDays++;
                    } else {
                        rowData.push(att.status); // e.g., "Absent", "Leave"
                        totalAbsentDays++;
                    }
                }
                else {
                    rowData.push("A")
                    totalAbsentDays++
                }
                totalWorkingDays++
            })
            const row = worksheet.addRow(rowData)
            row.getCell(1).font = { bold: true, size: 10 }
            row.getCell(2).font = { size: 9, color: { argb: "666666" } }
            for (let i = 3; i <= headers.length; i++) {
                const cell = row.getCell(i)
                const value = cell.value
                if (value === "A" || value === "Absent") {
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "fee6e4" } }
                    cell.font = { bold: true, color: { argb: "d32f2f" } }
                } else {
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "daffd3" } }
                    cell.font = { bold: true, color: { argb: "2e7d32" } }
                }
                cell.alignment = { horizontal: "center" }
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                }
            }
            if (index % 2 === 0) {
                row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "f8f9fa" } }
                row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "f8f9fa" } }
            }
        })
        worksheet.addRow([])
        const summaryHeader = worksheet.addRow([])
        summaryHeader.getCell(5).value = "ATTENDANCE SUMMARY"
        summaryHeader.getCell(5).font = { name: "Arial", size: 14, bold: true, color: { argb: "001f3f" } }
        summaryHeader.getCell(5).alignment = { horizontal: "center" }
        worksheet.mergeCells(`E${summaryHeader.number}:J${summaryHeader.number}`)
        const summaryData = [
            ["Total Employees:", filteredData.length],
            ["Total Working Days:", daysInMonth.length],
            ["Total Present Days:", totalPresentDays],
            ["Total Absent Days:", totalAbsentDays],
            [
                "Overall Attendance Rate:",
                `${totalWorkingDays > 0 ? ((totalPresentDays / totalWorkingDays) * 100).toFixed(2) : 0}%`,
            ],
        ]
        summaryData.forEach((row) => {
            const r = worksheet.addRow(row)
            r.getCell(1).font = { bold: true, size: 11 }
            r.getCell(2).font = { bold: true, size: 11, color: { argb: "001f3f" } }
            r.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "e3f2fd" } }
            r.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "e3f2fd" } }
        })
        worksheet.addRow([])
        worksheet.addRow([])
        const footerRow = worksheet.addRow([])
        footerRow.getCell(5).value = "This is electronically generated report"
        footerRow.getCell(5).font = { name: "Arial", size: 12, color: { argb: "000000" } }
        footerRow.getCell(5).alignment = { horizontal: "center" }
        footerRow.getCell(5).border = {
            top: { style: "medium", color: { argb: "000000" } },
            left: { style: "medium", color: { argb: "000000" } },
            bottom: { style: "medium", color: { argb: "000000" } },
            right: { style: "medium", color: { argb: "000000" } },
        }
        worksheet.mergeCells(`E${footerRow.number}:L${footerRow.number}`)
        const poweredByRow = worksheet.addRow([])
        poweredByRow.getCell(5).value = "Powered By: MangotechDevs.ae"
        poweredByRow.getCell(5).font = { name: "Arial", size: 10, italic: true, color: { argb: "666666" } }
        poweredByRow.getCell(5).alignment = { horizontal: "center" }
        worksheet.mergeCells(`E${poweredByRow.number}:L${poweredByRow.number}`)
        const columnWidths = [{ width: 25 }, { width: 15 }, ...Array(daysInMonth.length).fill({ width: 12 })]
        worksheet.columns = columnWidths
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        const fileName = `Attendance Report - ${startDate ? new Date(startDate).toLocaleDateString("en-GB") : "Start"} to ${endDate ? new Date(endDate).toLocaleDateString("en-GB") : "End"
            }.xlsx`
        saveAs(blob, fileName)
    }

    const handleStartDateChange = (e) => {
        console.log(e.target.value)
        setStartDate(e.target.value)
    }

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value)
    }

    const [transformedData, setTransformedData] = useState([])

    useEffect(() => {
        const transformAttendanceData = async () => {
            if (!attendanceData?.attendance) {
                setTransformedData([])
                return
            }
            const mappedData = attendanceData.attendance.map((employee) => ({
                id: employee.user_id,
                employee_id: employee?.employee_id,
                name: employee.user_name,
                avatar: `/placeholder.svg?height=40&width=40&text=${employee.user_name.charAt(0)}`,
                attendance:
                    employee.attendance?.map((day) => ({
                        date: day.date,
                        status: day.logs ? "Present" : day.status,
                        logs: day?.logs,
                        shift_time: day.shift_time,
                        duration: day.totalDuration,
                    })) || [],
            }))
            console.log(mappedData, "mappedDatamappedData")
            setTransformedData(mappedData)
        }
        transformAttendanceData()
    }, [attendanceData])

    // Memoize filtered data
    const filteredData = useMemo(() => {
        if (!transformedData.length) return []
        return transformedData.filter((employee) => employee.name.toLowerCase().includes(nameFilter.toLowerCase()))
    }, [transformedData, nameFilter])

    const daysInMonth = useMemo(() => {
        if (!startDate || !endDate) return [];

        const start = moment(startDate);
        const end = moment(endDate);
        const days = [];

        const current = start.clone();
        while (current.isSameOrBefore(end, "day")) {
            days.push(current.clone()); // Push a clone to avoid mutation
            current.add(1, "day");
        }

        return days;
    }, [startDate, endDate]);

    console.log(daysInMonth.map(day => day.format("YYYY-MM-DD")), "daysInMonth");

    // Memoize summary statistics
    const summaryStats = useMemo(() => {
        if (!transformedData.length) {
            return {
                presentCount: 0,
                absentCount: 0,
                totalDays: 0,
                attendanceRate: 0,
            }
        }
        const presentCount = transformedData.reduce((total, employee) => {
            return total + employee.attendance.filter((day) => day.status === "Present").length
        }, 0)
        const absentCount = transformedData.reduce((total, employee) => {
            return total + employee.attendance.filter((day) => day.status === "A").length
        }, 0)
        const totalDays = transformedData.reduce((total, employee) => {
            return total + employee.attendance.length
        }, 0)
        const attendanceRate = totalDays > 0 ? (presentCount / totalDays) * 100 : 0
        return {
            presentCount,
            absentCount,
            totalDays,
            attendanceRate,
        }
    }, [transformedData])

    // Memoize format date function
    const formattedDate = useMemo(() => {
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }
        return new Date().toLocaleDateString("en-US", options)
    }, [])

    // Optimize API call with useCallback
    const getAttendance = async (month, year) => {
        try {
            setLoading(true)
            const params = {
                start_date: startDate,
                end_date: endDate,
            }
            console.log(params, "params")
            const { data } = await SystemServices.getAttendance(params)
            console.log(data, "datadata")
            setOriginalData(data)
            setAttendanceData(data)
        } catch (error) {
            console.error("Error fetching attendance:", error)
        } finally {
            setLoading(false)
        }
    }

    const [shifts, setShifts] = useState([])

    const addShift = (formData) => {
        console.log(formData?.shiftStartTime)
        const lastShift = shifts[shifts.length - 1]
        if (lastShift && !lastShift.check_out) {
            showErrorToast("Please complete the previous shift's end time before adding a new one.")
            return
        }
        const newShift = {
            id: uuidv4(), // Unique ID
            shift: shifts.length + 1, // Sequential number
            check_in: moment(formData?.shiftStartTime.toDate()).format("HH:mm"),
            check_out: formData?.shiftEndTime ? moment(formData?.shiftEndTime.toDate()).format("HH:mm") : null,
        }
        setShifts((prevShifts) => [...prevShifts, newShift])
        setValue("shiftStartTime", null)
        setValue("shiftEndTime", null)
        reset({
            shiftStartTime: null,
            shiftEndTime: null,
        })
        reset()
        console.log("Shift added:", newShift)
    }

    const [editShiftId, setEditShiftId] = useState(null)
    const [editEndTime, setEditEndTime] = useState(null)

    const handleEditShiftEnd = (shiftId, currentEndTime) => {
        setEditShiftId(shiftId)
        setEditEndTime(currentEndTime)
    }

    const handleSaveEditedEndTime = () => {
        if (!editEndTime) {
            showErrorToast("End time cannot be empty.")
            return
        }
        const updatedShifts = shifts.map((shift) =>
            shift.id === editShiftId
                ? { ...shift, check_out: dayjs(editEndTime).hour() * 60 + dayjs(editEndTime).minute() }
                : shift,
        )
        setShifts(updatedShifts)
        setEditShiftId(null)
        setEditEndTime(null)
    }

    const handleRemoveShift = (id) => {
        const updatedShifts = shifts.filter((shift) => shift.id !== id)
        setShifts(updatedShifts)
    }

    const convertMinutesToTime = (totalMinutes) => {
        return moment().startOf("day").add(totalMinutes, "minutes").format("HH:mm")
    }

    const UpdateHours = async () => {
        console.log(shifts)
        const convertedShifts = shifts.map((shift) => ({
            ...shift,
            check_in: moment(shift.check_in, "HH:mm").hours() * 60 + moment(shift.check_in, "HH:mm").minutes(),
            check_out: shift?.check_out
                ? moment(shift.check_out, "HH:mm").hours() * 60 + moment(shift.check_out, "HH:mm").minutes()
                : null,
        }))
        console.log(convertedShifts)
        try {
            const obj = {
                user_id: selectedData?.id,
                date: tableDate,
                shifts: convertedShifts,
                remarks: getValues('remarks')
            }
            const promise = CustomerServices.markAttendance(obj)
            showPromiseToast(promise, "Saving...", "Added Successfully", "Something Went Wrong")
            const response = await promise
            if (response?.responseCode === 200) {
                setDialog(false)
                setShifts([])
                getAttendance(moment(selectedDate).format("MMMM"), moment().format("YYYY"))
            }
        } catch (error) {
            console.log(error)
        }
    }
    const MarkAsHoliday = async () => {
        console.log(shifts)
        const convertedShifts = shifts.map((shift) => ({
            ...shift,
            check_in: moment(shift.check_in, "HH:mm").hours() * 60 + moment(shift.check_in, "HH:mm").minutes(),
            check_out: shift?.check_out
                ? moment(shift.check_out, "HH:mm").hours() * 60 + moment(shift.check_out, "HH:mm").minutes()
                : null,
        }))
        console.log(convertedShifts)
        try {
            const obj = {
                is_holiday: true,
                user_id: selectedData?.id,
                date: tableDate,
                shifts: [],
                remarks: getValues('remarks')
            }
            const promise = CustomerServices.markAttendance(obj)
            showPromiseToast(promise, "Saving...", "Added Successfully", "Something Went Wrong")
            const response = await promise
            if (response?.responseCode === 200) {
                setDialog(false)
                setShifts([])
                getAttendance(moment(selectedDate).format("MMMM"), moment().format("YYYY"))
            }
        } catch (error) {
            console.log(error)
        }
    }
    const handleTimeChange = (shiftId, field, newValue) => {
        console.log(newValue, "newValue")
        const updatedShifts = shifts.map((shift) => {
            if (shift.id === shiftId) {
                return {
                    ...shift,
                    [field]: moment(newValue.toDate()).format("HH:mm"),
                }
            }
            return shift
        })
        console.log(updatedShifts, "updatedShifts")
        setShifts(updatedShifts)
    }

    const handleCellClick = useCallback((employee, dateStr, logs) => {
        if (logs?.length > 0) {
            const convertedShifts = logs?.map((shift) => {
                const checkInMinutes = Number.parseFloat(shift.check_in)
                const checkOutMinutes = shift.check_out ? Number.parseFloat(shift.check_out) : null
                return {
                    ...shift,
                    check_in: moment.utc().startOf("day").add(checkInMinutes, "minutes").format("HH:mm"),
                    check_out:
                        checkOutMinutes !== null
                            ? moment.utc().startOf("day").add(checkOutMinutes, "minutes").format("HH:mm")
                            : null,
                }
            })
            setShifts(convertedShifts)
        } else {
            setShifts([])
        }
        console.log(employee, "employeeemployeeemployee")
        setTableDate(dateStr)
        setSelectedData(employee)
        if (user?.role_id == 6) {
            setDialog(true)
        }

    }, [])

    useEffect(() => {
        getAttendance()
    }, [startDate, endDate])

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(Number.parseInt(event.target.value, 10))
        setPage(0)
    }

    return (
        <Box
            sx={{
                margin: "0 auto",
                p: { xs: 2, md: 4 },
                background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.background.default, 0)})`,
                minHeight: "100vh",
            }}
        >
            <SimpleDialog open={dialog} width={"70%"} onClose={() => setDialog(false)} title={"Update Shift?"}>
                <Box component="form" sx={{ width: "100%" }} onSubmit={handleSubmit(addShift)}>
                    <Grid container sx={{ justifyContent: "center", alignItems: "center" }} spacing={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Grid item xs={12} sm={5}>
                                <InputLabel
                                    error={!!errors.shiftStartTime}
                                    sx={{ textTransform: "capitalize", textAlign: "left", fontWeight: 700, color: Colors.gray }}
                                >
                                    Check in:*
                                </InputLabel>
                                <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                                    <Controller
                                        name="shiftStartTime"
                                        control={control}
                                        rules={{ required: "Shift Start Time is required" }}
                                        render={({ field: { onChange, value } }) => (
                                            <TimePicker
                                                slotProps={{
                                                    textField: {
                                                        sx: {
                                                            borderRadius: "10px !important",
                                                            border: "2px solid black !important",
                                                        },
                                                    },
                                                }}
                                                value={value}
                                                onChange={(newValue) => {
                                                    if (newValue && newValue.isValid && newValue.isValid()) {
                                                        console.log("Selected Time (24-hour):", moment(newValue.toDate()).format("HH:mm"))
                                                    } else {
                                                        console.log("Invalid time selected")
                                                    }
                                                    onChange(newValue)
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        size="small"
                                                        error={!!errors.shiftStartTime}
                                                        helperText={errors.shiftStartTime?.message}
                                                        sx={{
                                                            borderRadius: "10px !important",
                                                            "&.MuiTextField-root": {
                                                                borderRadius: "10px !important",
                                                                border: "1px solid black !important",
                                                                "& fieldset": { border: "1px solid black !important" },
                                                                "&.Mui-focused svg path": {
                                                                    fill: "#0076bf",
                                                                },
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        )}
                                    />
                                    <Typography color="error" sx={{ fontSize: 12, textAlign: "left" }}>
                                        {errors.shiftStartTime?.message}
                                    </Typography>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <InputLabel
                                    error={!!errors.shiftEndTime}
                                    sx={{ textTransform: "capitalize", textAlign: "left", fontWeight: 700, color: Colors.gray }}
                                >
                                    Check out:*
                                </InputLabel>
                                <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                                    <Controller
                                        name="shiftEndTime"
                                        control={control}
                                        rules={{ required: false }}
                                        render={({ field: { onChange, value } }) => (
                                            <TimePicker
                                                value={value}
                                                slotProps={{
                                                    textField: {
                                                        sx: {
                                                            borderRadius: "10px !important",
                                                            border: "2px solid black !important",
                                                        },
                                                    },
                                                }}
                                                onChange={(newValue) => {
                                                    if (newValue && newValue.isValid && newValue.isValid()) {
                                                        console.log("Selected Time (24-hour):", moment(newValue?.toDate()).format("HH:mm"))
                                                    } else {
                                                        console.log("Invalid time selected")
                                                    }
                                                    onChange(newValue)
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        size="small"
                                                        error={!!errors.shiftEndTime}
                                                        helperText={errors.shiftEndTime?.message}
                                                        sx={{
                                                            borderRadius: "10px !important",
                                                            ".MuiOutlinedInput-root": {
                                                                borderRadius: "10px !important",
                                                                "& fieldset": { border: "none !important" },
                                                                "&.Mui-focused svg path": {
                                                                    fill: "#0076bf",
                                                                },
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        )}
                                    />
                                    <Typography color="error" sx={{ fontSize: 12, textAlign: "left" }}>
                                        {errors.shiftEndTime?.message}
                                    </Typography>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={2} mt={2}>
                                <PrimaryButton bgcolor={Colors.primary} title="Add" type="submit" />
                            </Grid>
                            {shifts.map((shift, index) => (
                                <Grid item xs={12} key={shift.id}>
                                    <Box
                                        sx={{
                                            padding: 2,
                                            border: "1px solid #ccc",
                                            borderRadius: "8px",
                                            backgroundColor: "#f9f9f9",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 2,
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography sx={{ minWidth: 70 }}>
                                            <strong>Shift {shift.shift || index + 1}:</strong>
                                        </Typography>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <TimePicker
                                                label="Start Time"
                                                value={shift.check_in ? dayjs(shift.check_in, "HH:mm") : null}
                                                onChange={(newValue) => handleTimeChange(shift.id, "check_in", newValue)}
                                                slotProps={{ textField: { size: "small" } }}
                                            />
                                            <TimePicker
                                                label="End Time"
                                                value={shift.check_out ? dayjs(shift.check_out, "HH:mm") : null}
                                                onChange={(newValue) => handleTimeChange(shift.id, "check_out", newValue)}
                                                slotProps={{ textField: { size: "small" } }}
                                            />
                                        </LocalizationProvider>
                                        <Button variant="outlined" color="error" size="small" onClick={() => handleRemoveShift(shift.id)}>
                                            Remove
                                        </Button>
                                    </Box>
                                </Grid>
                            ))}
                            <Grid item xs={12} sm={12}>
                                <InputField
                                    label={"Remarks"}
                                    multiline
                                    rows={5}
                                    placeholder={"Remarks"}
                                    error={errors?.remarks?.message}
                                    register={register("remarks", {
                                        required:
                                            false
                                    })}
                                />
                            </Grid>
                        </LocalizationProvider>
                        <Grid
                            item
                            xs={12}
                            sm={12}
                            sx={{
                                mt: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: 'center',
                                gap: "25px",
                            }}
                        >
                            <PrimaryButton bgcolor={Colors.primary} onClick={() => MarkAsHoliday()} title="Mark As Holiday" />
                            <PrimaryButton bgcolor={Colors.primary} onClick={() => UpdateHours()} title="Yes,Confirm" />
                            <PrimaryButton onClick={() => setDialog(false)} bgcolor={"#FF1F25"} title="No,Cancel" />
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.primary.main,
                            mb: 0.5,
                        }}
                    >
                        Attendance Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarIcon fontSize="small" />
                        {formattedDate}
                    </Typography>
                </Box>
                <PrimaryButton title={"Download Report"} onClick={() => downloadExcel()} />
            </Box>
            {/* Filters */}
            <Card
                elevation={0}
                sx={{
                    mb: 4,
                    borderRadius: 2,
                    border: `1px solid #001f3f`,
                }}
            >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <Filter fontSize="small" color={theme.palette.primary.main} />
                        <Typography variant="h6" component="h2" sx={{ ml: 1, fontWeight: 600 }}>
                            Filter Attendance Records
                        </Typography>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Search by Name"
                                variant="outlined"
                                size="small"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" color={theme.palette.text.secondary} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Start Date"
                                type="date"
                                variant="outlined"
                                size="small"
                                value={startDate}
                                onChange={handleStartDateChange}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="End Date"
                                type="date"
                                variant="outlined"
                                size="small"
                                value={endDate}
                                onChange={handleEndDateChange}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            {/* Summary Cards */}
            {/* <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            height: "100%",
                            backgroundColor: "#001f3f",
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: theme.shadows[4],
                            },
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: "white" }}>
                                    Total Employees
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "white" }}>
                                    <Users fontSize="small" sx={{ color: "white" }} />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1, color: "white" }}>
                                {transformedData?.length || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            height: "100%",
                            border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: theme.shadows[4],
                            },
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Present Days
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                                    <CheckCircleIcon fontSize="small" />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                                {summaryStats.presentCount}
                            </Typography>
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                                {Math.round((summaryStats.presentCount / summaryStats.totalDays) * 100) || 0}% of total days
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            height: "100%",
                            border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                            backgroundColor: "#001f3f",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: theme.shadows[4],
                            },
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: "white" }}>
                                    Absent Days
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: "white" }}>
                                    <XCircleIcon fontSize="small" />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1, color: "white" }}>
                                {summaryStats.absentCount}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: "white" }}>
                                {Math.round((summaryStats.absentCount / summaryStats.totalDays) * 100) || 0}% of total days
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            height: "100%",
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: theme.shadows[4],
                            },
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Total Work Hours
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                                    <Clock fontSize="small" />
                                </Avatar>
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                                4h 43m
                            </Typography>
                            <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500 }}>
                                For {selectedDate.format("MMMM YYYY")}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid> */}
            {/* Attendance Progress */}
            {/* <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="subtitle2">Overall Attendance Rate</Typography>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {Math.round(summaryStats.attendanceRate) || 0}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={summaryStats.attendanceRate}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            background: `linear-gradient(90deg, '#001f3f', ${theme.palette.primary.light})`,
                        },
                    }}
                />
            </Box> */}
            {/* Table */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}
            >
                <TableContainer sx={{ maxHeight: 500, overflow: "auto" }}>
                    <Table aria-label="attendance table">
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        color: theme.palette.primary.main,
                                        position: "sticky",
                                        left: 0,
                                        top: 0, // 👈 Make it sticky on scroll
                                        zIndex: 3, // 👈 Ensure it's above other cells
                                        minWidth: 200,
                                        background: "rgb(243 248 253)",
                                    }}
                                >
                                    Employee
                                </TableCell>
                                {daysInMonth.map((day) => (
                                    <TableCell
                                        key={day.format("YYYY-MM-DD")} X
                                        align="center"
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                            color: theme.palette.primary.main,
                                            minWidth: 100,
                                            padding: "8px 4px",
                                            fontSize: "0.75rem",
                                            lineHeight: 2,
                                            position: "sticky",
                                            top: 0,
                                            zIndex: 2,
                                            background: "rgb(243 248 253)",
                                        }}
                                    >
                                        {/* Optional: Debugging */}
                                        {/* console.log(day.toISOString()) */}
                                        {day.format("D")} <br />
                                        {day.format("ddd")}
                                    </TableCell>
                                ))}

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {console.log(filteredData, 'filteredDatafilteredData')}
                            {filteredData?.length > 0 ? (
                                filteredData
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Apply pagination slice
                                    .map((employee) => (
                                        <EmployeeRow
                                            key={employee.id}
                                            employee={employee}
                                            daysInMonth={daysInMonth}
                                            onCellClick={handleCellClick}
                                        />
                                    ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={daysInMonth.length + 1} align="center" sx={{ py: 6 }}>
                                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                            <Filter fontSize="large" color={alpha(theme.palette.text.primary, 0.2)} />
                                            <Typography variant="h6" color="text.secondary">
                                                No matching records found
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Try adjusting your filters to find what you're looking for
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                <Box
                    sx={{
                        p: 2,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Showing {filteredData?.length || 0} of {transformedData?.length || 0} employees
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Last updated: {new Date().toLocaleTimeString()}
                    </Typography>
                </Box>
            </Card>
        </Box>
    )
}
