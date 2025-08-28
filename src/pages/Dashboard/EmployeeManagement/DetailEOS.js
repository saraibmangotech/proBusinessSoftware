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
import { useNavigate, useParams } from "react-router-dom"
import { makeStyles } from "@mui/styles"
import { useForm } from "react-hook-form"
import DeleteIcon from "@mui/icons-material/Delete"
import SearchIcon from "@mui/icons-material/Search"
import { showErrorToast, showPromiseToast } from "components/NewToaster"
import CustomerServices from "services/Customer"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs from "dayjs"
import moment from "moment"
import { PrimaryButton } from "components/Buttons"
import UserServices from "services/User"
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { agencyType } from "utils"
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

function DetailEOSList() {
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
    const [selectedMonth, setSelectedMonth] = useState(dayjs());


    const getCustomerQueue = async (page, limit, filter) => {


        try {

            let params = {
                page: 1,
                limit: 999999,


            }

            const { data } = await CustomerServices.getEmployees(params)
            setEmployess(data?.employees?.rows)

        } catch (error) {
            showErrorToast(error)
        }
    }


    // Updated column configuration with action column
    const columnConfig = [
        { key: "employeeName", header: "Employee Name", type: "auto" },
        { key: "joinDate", header: "Join Date", type: "auto" },
        { key: "division", header: "Division", type: "auto" },

        { key: "workingDays", header: "Working Days", type: "auto" },
        { key: "local", header: "Local/Non Local ", type: "auto" },

        { key: "employeeId", header: "Employee ID", type: "auto" },
        { key: "salaryPaid", header: "Salary Basic", type: "auto" },
        { key: "housing_allowance", header: "Housing Allowance", type: "auto" },
        { key: "transport_allowance", header: "Transport Allowance", type: "auto" },
        { key: "other_allowance", header: "Others", type: "auto" },
        { key: "salaryPackage", header: "Salary Package", type: "auto" },
        { key: "commission", header: "Commission", type: "auto" },
        { key: "otherAdd", header: "Other Add", type: "auto" },
        { key: "al", header: "AL/SL", type: "auto" },

        { key: "arrear", header: "Airfare", type: "auto" },
        { key: "eos", header: "Gratuity", type: "auto" },
        { key: "leaves_encashment", header: "Leaves Encash", type: "auto" },
        { key: "gpssaEmp", header: "GPSSA", type: "auto", isGpssa: true },

        { key: "staffAdvance", header: "Staff Advance", type: "auto" },
        { key: "lateComm", header: "Late Coming", type: "auto" },
        { key: "additional", header: "Additional", type: "auto" },
        { key: "salaryDeduction", header: "Salary Deduction", type: "auto" },
        { key: "unpaidLeave", header: "Unpaid Deduction", type: "auto" },
        { key: "totalPay", header: "Total pay", type: "auto" },
        { key: "commissionFinal", header: "Commission Return", type: "auto" },
        { key: "netSalary", header: "Net Salary", type: "auto" },
        // New administrative columns - all auto
        { key: "routingCode", header: "ROUTING CODE", type: "auto" },
        { key: "salaryIban", header: "SALARY IBAN", type: "auto" },
        { key: "workPermit", header: "WORK PERMIT", type: "auto" },
        { key: "visa", header: "Visa", type: "auto" },
        { key: "branch", header: "BRANCH", type: "auto" },
        { key: "remark", header: "Remarks", type: "auto" },
        { key: "minutesLate", header: "Minutes Late", type: "auto" },
        { key: "alDay", header: "AL Day", type: "auto" },
        // { key: "actions", header: "Actions", type: "action" },
    ]

    // Start with empty table
    const [data, setData] = useState([])

    // Filter employees based on search text
    const filteredEmployees = employess.filter((employee) => {
        const searchLower = searchText?.toLowerCase()
        return (
            employee?.user?.name?.toLowerCase().includes(searchLower)

        )
    })

    // Generate default employee data
    const generateDefaultEmployeeData = (employee, salary) => {
        console.log(salary, 'employeeemployee')
        return {
            user_id: employee?.user_id,
            id: employee.id,
            employeeName: employee.first_name + employee.last_name,

            joinDate: moment(salary?.employee?.date_of_joining).format("DD-MM-YYYY"),
            workingDays: salary?.workingDays,
            local: salary?.employee?.is_local ? "Local" : "Non Local",
            employeeId: salary.employee?.employee_code,
            salaryPaid: parseFloat(salary.basicSalary) || 0,
            commission: parseFloat(salary?.commission),
            otherAdd: 0,
            al: 0,
            sl: 0,
            arrear: parseFloat(salary?.airfareAmount),
            gpssaEmp: parseFloat(salary?.pension || 0),

            staffAdvance: 0,
            lateComm: parseFloat(salary?.lateDeduction),
            additional: 0,
            salaryDeduction: 0,
            unpaidLeave: parseFloat(salary?.absentDeduction || 0),
            totalPay: parseFloat(salary?.netSalary) || 0,
            commissionFinal: 0,
            netSalary: parseFloat(salary.netSalary) || 0,
            // Default administrative data
            routingCode: salary?.employee?.routing,
            salaryIban: salary?.employee?.iban,
            workPermit: salary?.employee?.work_permit,
            visa: salary?.employee?.visa,
            branch: salary?.employee?.branch,
            remark: "New Employee",
            minutesLate: parseFloat(salary?.totalShortMinutes || 0),
            alDay: parseFloat(salary?.approvedLeaveDays || 0),
        }
    }

    // Handle employee selection change
    // const handleEmployeeSelectionChange = (event) => {
    //   const selectedIds = event.target.value
    //   console.log(selectedIds,'selectedIds');

    //   setSelectedEmployeeIds(selectedIds)

    //   // Add new employees to table
    //   const currentEmployeeIds = new Set(data.map((row) => row.id))
    //   const newEmployeeIds = selectedIds.filter((id) => !currentEmployeeIds.has(id))

    //   if (newEmployeeIds.length > 0) {
    //     const newEmployees = newEmployeeIds.map((id) => {
    //       const employee = employess.find((emp) => emp.id === id)
    //       return generateDefaultEmployeeData(employee)
    //     })
    //     setData((prevData) => [...prevData, ...newEmployees])
    //   }

    //   // Remove employees that are no longer selected
    //   const removedEmployeeIds = Array.from(currentEmployeeIds).filter((id) => !selectedIds.includes(id))
    //   if (removedEmployeeIds.length > 0) {
    //     setData((prevData) => prevData.filter((row) => !removedEmployeeIds.includes(row.id)))
    //   }
    // }
    const handleEmployeeSelectionChange2 = async (event) => {
        const selectedIds = event.target.value;
        setSelectedEmployeeIds(selectedIds);

        const currentEmployeeIds = new Set(data.map((row) => row.id));
        const newEmployeeIds = selectedIds.filter((id) => !currentEmployeeIds.has(id));

        if (newEmployeeIds.length > 0) {
            const newEmployees = await Promise.all(
                newEmployeeIds.map(async (id) => {
                    const employee = employess.find((emp) => emp.id === id);
                    let salary = 0;

                    try {
                        const { data } = await CustomerServices.employeeSalaryDetail({ user_id: employee.user_id, month: moment(selectedMonth).month() + 1, year: moment(selectedMonth).year() });
                        salary = data?.results[0] || 0;
                        console.log(data);

                    } catch (error) {
                        console.error(`Failed to fetch salary for ${employee.user_id}`, error);
                    }

                    return generateDefaultEmployeeData(employee, salary);
                })
            );
            console.log(newEmployees, 'newEmployees');


            setData((prevData) => [...prevData, ...newEmployees]);
        }

        const removedEmployeeIds = Array.from(currentEmployeeIds).filter((id) => !selectedIds.includes(id));
        if (removedEmployeeIds.length > 0) {
            setData((prevData) => prevData.filter((row) => !removedEmployeeIds.includes(row.id)));
        }
    };

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
            }));

            console.log(transformedData);

            console.log(data);


            const obj = {
                id: id,

                salaries: transformedData
            };

            const promise = UserServices.UpdateSalary(obj);

            showPromiseToast(
                promise,
                'Saving ...',
                'Success',
                'Something Went Wrong'
            );

            const response = await promise;

            if (response?.responseCode === 200) {
                navigate('/salary-list');
            }
        } catch (error) {

            console.log(error);

        }
    };

    // You will need to import these libraries:


    const downloadExcel = async () => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("EOS Details Report")

        // Header & Footer
        worksheet.headerFooter.oddHeader =
            '&C&"Arial,Bold"&18SALARY DETAILS REPORT\n' +
            '&C&"Arial,Regular"&12Your Company Name\n' +
            `&C&"Arial,Regular"&10Period: ${new Date().toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
            })}\n` +
            '&L&"Arial,Regular"&8Generated on: ' +
            new Date().toLocaleDateString() +
            "\n" +
            '&R&"Arial,Regular"&8Page &P of &N'

        worksheet.headerFooter.oddFooter =
            '&L&"Arial,Regular"&8Confidential - Internal Use Only' +
            '&C&"Arial,Regular"&8This report contains employee salary data as of ' +
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
            margins: { left: 0.7, right: 0.7, top: 1, bottom: 1, header: 0.3, footer: 0.3 },
        }

        // Title Row
        const titleRow = worksheet.addRow([
            "EOS DETAILS REPORT - EMPLOYEE WISE EOS CALCULATION",
        ])
        titleRow.getCell(1).font = { name: "Arial", size: 16, bold: true, color: { argb: "2F4F4F" } }
        titleRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A1:AD1")

        // Company Name
        const companyName = agencyType[process.env.REACT_APP_TYPE]?.name
        const companyRow = worksheet.addRow([companyName])
        companyRow.getCell(1).font = { name: "Arial", size: 14, bold: true, color: { argb: "4472C4" } }
        companyRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A2:AD2")

        // 🔹 Salary Month Row (NEW)
        const salaryMonthRow = worksheet.addRow([
            `Salary Month: ${moment(data[0]?.employee_salary_month, "M").format("MMMM")}`,
        ])
        salaryMonthRow.getCell(1).font = { name: "Arial", size: 12, bold: true, color: { argb: "FF0000" } }
        salaryMonthRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells(`A${salaryMonthRow.number}:AD${salaryMonthRow.number}`)

        // Report Generated Row
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
        dateRow.getCell(1).font = { name: "Arial", size: 10, italic: true, color: { argb: "666666" } }
        dateRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A4:AD4")

        worksheet.addRow([]) // spacing

        // ===== HEADERS =====
        const headers = [
            "Employee Name", "Join Date", "Division", "Working Days", "Local/Non Local", "Employee ID",
            "Salary Basic", "Housing Allowance", "Transport Allowance", "Others", "Salary Package",
            "Commission", "Other Add", "AL/SL", "Airfare", "Gratuity","Leave Encash","GPSSA", "Staff Advance", "Late Coming",
            "Additional", "Salary Deduction", "Unpaid Deduction", "Total pay", "Commission Return",
            "Net Salary", "ROUTING CODE", "SALARY IBAN", "WORK PERMIT", "Visa", "BRANCH",
            "Remarks", "Minutes Late", "AL Day",
        ]

        const headerRow = worksheet.addRow(headers)
        headerRow.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "808080" } }
            cell.font = { bold: true, color: { argb: "FFFFFF" } }
            cell.alignment = { horizontal: "center", vertical: "middle" }
            cell.border = {
                top: { style: "thin", color: { argb: "000000" } },
                left: { style: "thin", color: { argb: "000000" } },
                bottom: { style: "thin", color: { argb: "000000" } },
                right: { style: "thin", color: { argb: "000000" } },
            }
        })

        // ===== DATA ROWS + TOTALS =====
        let grandTotalBasicSalary = 0, grandTotalHousingAllowance = 0, grandTotalTransportAllowance = 0,
            grandTotalOtherAllowance = 0, grandTotalSalaryPackage = 0, grandTotalCommission = 0,
            grandTotalOtherAdd = 0, grandTotalAl = 0, grandTotalArrear = 0, grandTotalGpssaEmp = 0,
            grandTotalStaffAdvance = 0, grandTotalLateComm = 0, grandTotalAdditional = 0,
            grandTotalSalaryDeduction = 0, grandTotalUnpaidLeave = 0, grandTotalTotalPay = 0,
            grandTotalCommissionFinal = 0, grandTotalNetSalary = 0

        data?.forEach((row) => {
            const rowData = [
                row.employeeName, row.joinDate, row.division, row.workingDays,
                row.local, row.employeeId, row.salaryPaid, row.housing_allowance || 0,
                row.transport_allowance || 0, row.other_allowance || 0, row.salaryPackage || 0,
                row.commission, row.otherAdd, row.al, row.arrear,row.eos,row.leaves_encashment, row.gpssaEmp,
                row.staffAdvance, row.lateComm, row.additional, row.salaryDeduction,
                row.unpaidLeave, row.totalPay, row.commissionFinal, row.netSalary,
                row.routingCode, row.salaryIban, row.workPermit, row.visa, row.branch,
                row.remark, row.minutesLate, row.alDay,
            ]
            const excelRow = worksheet.addRow(rowData)

            for (let i = 6; i <= 23; i++) excelRow.getCell(i + 1).numFmt = "#,##0.00"

            excelRow.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin", color: { argb: "000000" } },
                    left: { style: "thin", color: { argb: "000000" } },
                    bottom: { style: "thin", color: { argb: "000000" } },
                    right: { style: "thin", color: { argb: "000000" } },
                }
                cell.alignment = { horizontal: "center", vertical: "middle" }
            })

            grandTotalBasicSalary += Number(row.salaryPaid) || 0
            grandTotalHousingAllowance += Number(row.housing_allowance) || 0
            grandTotalTransportAllowance += Number(row.transport_allowance) || 0
            grandTotalOtherAllowance += Number(row.other_allowance) || 0
            grandTotalSalaryPackage += Number(row.salaryPackage) || 0
            grandTotalCommission += Number(row.commission) || 0
            grandTotalOtherAdd += Number(row.otherAdd) || 0
            grandTotalAl += Number(row.al) || 0
            grandTotalArrear += Number(row.arrear) || 0
            grandTotalGpssaEmp += Number(row.gpssaEmp) || 0
            grandTotalStaffAdvance += Number(row.staffAdvance) || 0
            grandTotalLateComm += Number(row.lateComm) || 0
            grandTotalAdditional += Number(row.additional) || 0
            grandTotalSalaryDeduction += Number(row.salaryDeduction) || 0
            grandTotalUnpaidLeave += Number(row.unpaidLeave) || 0
            grandTotalTotalPay += Number(row.totalPay) || 0
            grandTotalCommissionFinal += Number(row.commissionFinal) || 0
            grandTotalNetSalary += Number(row.netSalary) || 0
        })

        const grandTotalRow = worksheet.addRow([
            "GRAND TOTAL", "", "", "", "", `${data?.length} Total Employees`,
            grandTotalBasicSalary, grandTotalHousingAllowance, grandTotalTransportAllowance,
            grandTotalOtherAllowance, grandTotalSalaryPackage, grandTotalCommission, grandTotalOtherAdd,
            grandTotalAl, grandTotalArrear, grandTotalGpssaEmp, grandTotalStaffAdvance, grandTotalLateComm,
            grandTotalAdditional, grandTotalSalaryDeduction, grandTotalUnpaidLeave, grandTotalTotalPay,
            grandTotalCommissionFinal, grandTotalNetSalary, "", "", "", "", "", "", "", "",
        ])

        grandTotalRow.eachCell((cell, colNumber) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } }
            cell.font = { bold: true, color: { argb: "FFFFFF" } }
            cell.alignment = { horizontal: "center", vertical: "middle" }
            cell.border = {
                top: { style: "thick", color: { argb: "000000" } },
                left: { style: "thick", color: { argb: "000000" } },
                bottom: { style: "thick", color: { argb: "000000" } },
                right: { style: "thick", color: { argb: "000000" } },
            }
            if (colNumber >= 7 && colNumber <= 24) cell.numFmt = "#,##0.00"
        })

        worksheet.columns = [
            { width: 25 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 18 }, { width: 15 },
            { width: 15 }, { width: 18 }, { width: 18 }, { width: 12 }, { width: 18 }, { width: 15 },
            { width: 12 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 15 }, { width: 15 },
            { width: 12 }, { width: 18 }, { width: 18 }, { width: 15 }, { width: 18 }, { width: 15 },
            { width: 18 }, { width: 18 }, { width: 18 }, { width: 10 }, { width: 12 }, { width: 15 },
            { width: 15 }, { width: 10 },
        ]

        worksheet.addRow([])
        worksheet.addRow([])

        const reportRow = worksheet.addRow(["This is electronically generated report"])
        reportRow.getCell(1).font = { name: "Arial", size: 12, color: { argb: "000000" } }
        reportRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" }
        reportRow.getCell(1).border = {
            top: { style: "medium", color: { argb: "000000" } },
            left: { style: "medium", color: { argb: "000000" } },
            bottom: { style: "medium", color: { argb: "000000" } },
            right: { style: "medium", color: { argb: "000000" } },
        }
        worksheet.mergeCells(`A${reportRow.number}:AD${reportRow.number}`)

        worksheet.addRow([])

        const system2 = worksheet.addRow(["Powered By: MangotechDevs.ae"])
        system2.getCell(1).font = { name: "Arial", size: 10, italic: true, color: { argb: "666666" } }
        system2.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells(`A${system2.number}:AD${system2.number}`)

        worksheet.addRow([])

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        saveAs(
            blob,
            `EOS_Details_Report_${new Date()
                .toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                .replace(/\//g, "-")}.xlsx`,
        )
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
    let params = { group_id: id };
    const { data } = await CustomerServices.getEOSDetail(params);
    console.log(data);

    // ✅ convert object to array first
    const rowsArray = [data?.details];

    const transformedData = rowsArray.map((salary) => {
      const employee = salary?.user?.employee || {};
      const rawJoinDate = employee?.date_of_joining;

      return {
        user_id: salary?.user_id,
        id: salary?.id,
        employeeName: employee?.first_name,
        employee_salary_month: salary?.employee_salary?.month,
        division: employee?.cost_center ? employee?.cost_center : "-",
        workingDays: parseFloat(salary?.working_days || 0),
        employeeId: employee?.employee_code,
        joinDate: rawJoinDate ? moment(rawJoinDate).format("DD-MM-YYYY") : "-",
        rawJoinDate: rawJoinDate ? new Date(rawJoinDate) : null,

        local: salary?.employee?.is_local ? "Local" : "Non Local",
        remark: salary?.remark,
        salaryPaid: parseFloat(employee?.basic_salary) || 0,
        commission: parseFloat(salary?.commission) || 0,
        other_allowance: parseFloat(salary?.other_allowance) || 0,
        housing_allowance: parseFloat(salary?.housing_allowance) || 0,
        transport_allowance: parseFloat(salary?.transport_allowance) || 0,
        salaryPackage: parseFloat(salary?.salary_package) || 0,
        otherAdd: parseFloat(salary?.other_add) || 0,
        al: parseFloat(salary?.al) || 0,
        sl: parseFloat(salary?.sl) || 0,
        arrear: parseFloat(salary?.arrear) || 0,
        eos: parseFloat(salary?.eos) || 0,
        leaves_encashment: parseFloat(salary?.leaves_encashment) || 0,
        gpssaEmp: parseFloat(salary?.gpssa_emp) || 0,

        staffAdvance: parseFloat(salary?.staff_advance) || 0,
        lateComm: parseFloat(salary?.late_comm) || 0,
        additional: parseFloat(salary?.additional) || 0,
        salaryDeduction: parseFloat(salary?.salary_deduction) || 0,
        unpaidLeave: parseFloat(salary?.unpaid_leave) || 0,
        totalPay: parseFloat(salary?.total_pay) || 0,
        commissionFinal: parseFloat(salary?.commission_final) || 0,
        netSalary: parseFloat(salary?.net_salary) || 0,

        routingCode: employee?.routing || salary?.routing_code || "",
        salaryIban: employee?.iban || salary?.salary_iban || "",
        workPermit: employee?.work_permit || salary?.work_permit || "",
        visa: employee?.visa || salary?.visa || "",
        branch: employee?.branch || salary?.branch || "",
        remark: salary?.remark || "",
        minutesLate: parseFloat(salary?.minutes_late) || 0,
        alDay: parseFloat(salary?.al_day) || 0,
      };
    });

    // ✅ Sort by join date
    const sortedData = transformedData.sort((a, b) => {
      if (!a.rawJoinDate) return 1;
      if (!b.rawJoinDate) return -1;
      return a.rawJoinDate - b.rawJoinDate;
    });

    console.log(sortedData, "sortedData");
    setData(sortedData);
  } catch (error) {
    console.error("Error fetching employee data:", error);
  }
};


    useEffect(() => {
        getData()
        getCustomerQueue()
    }, [])


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
                        updatedRow.arrear


                    // Calculate net salary (total pay minus deductions)
                    const deductions =
                        updatedRow.staffAdvance +
                        updatedRow.lateComm +

                        updatedRow.additional +
                        updatedRow.salaryDeduction +
                        updatedRow.unpaidLeave +
                        updatedRow.commissionFinal +
                        updatedRow.gpssaEmp

                    updatedRow.totalPay = (totalPay - deductions) + (updatedRow.commissionFinal)
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
                {typeof value === "number" ? (value === 0 ? "-" : value?.toLocaleString()) : value || "-"}
            </Typography>
        )
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
                <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}> Final Statement Details</Typography>

                <PrimaryButton
                    title={"Download Excel"}
                    onClick={() => downloadExcel()}
                />
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
            {/* <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <PrimaryButton
                    bgcolor={'#001f3f'}
                    title="Update"
                    onClick={() => UpdateSalary()}

                    disabled={data?.length == 0}

                />

            </Box> */}
        </Box>
    )
}

export default DetailEOSList
