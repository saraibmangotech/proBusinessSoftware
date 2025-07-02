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
import { useNavigate } from "react-router-dom"
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
  const [employess, setEmployess] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [selectedCostCenter, setSelectedCostCenter] = useState(null)
  const [costCenters, setCostCenters] = useState([])
  const [filtertedCostCenters, setFiltertedCostCenters] = useState([])

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
    { key: "employeeId", header: "Employee ID", type: "auto" },
    { key: "salaryPaid", header: "Salary Paid", type: "auto" },
    { key: "commission", header: "Commission", type: "auto" },
    { key: "otherAdd", header: "Other Add", type: "manual" },
    { key: "al", header: "AL/SL", type: "manual" },

    { key: "arrear", header: "Arrear", type: "auto" },
    { key: "gpssaEmp", header: "GPSSA", type: "auto", isGpssa: true },

    { key: "staffAdvance", header: "Staff Advance", type: "manual" },
    { key: "lateComm", header: "Late Coming", type: "auto" },
    { key: "additional", header: "Additional", type: "manual" },
    { key: "salaryDeduction", header: "Salary Deduction", type: "manual" },
    { key: "unpaidLeave", header: "Unpaid Detection", type: "auto" },
    { key: "totalPay", header: "Total pay", type: "auto" },
    { key: "commissionFinal", header: "Commission Return", type: "manual" },
    { key: "netSalary", header: "Net Salary", type: "auto" },
    // New administrative columns - all auto
    { key: "routingCode", header: "ROUTING CODE", type: "auto" },
    { key: "salaryIban", header: "SALARY IBAN", type: "auto" },
    { key: "workPermit", header: "WORK PERMIT", type: "auto" },
    { key: "visa", header: "Visa", type: "auto" },
    { key: "branch", header: "BRANCH", type: "auto" },

    { key: "minutesLate", header: "Minutes Late", type: "auto" },
    { key: "alDay", header: "AL Day", type: "auto" },
    { key: "actions", header: "Actions", type: "action" },
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
      employeeId: salary.employee?.employee_code,
      salaryPaid: parseFloat(salary.basicSalary) || 0,
      commission: parseFloat(salary?.commission),
      otherAdd: 0,
      al: 0,
      sl: 0,
      arrear: 0,
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
  const generateDefaultEmployeeData2 = (salary) => {
    console.log(salary, 'employeeemployee')
    return {
      user_id: salary?.employee?.user_id,
      id: salary?.employee?.id,
      employeeName: salary?.employee?.first_name + salary?.employee?.last_name,
      employeeId: salary.employee?.employee_code,
      salaryPaid: parseFloat(salary.basicSalary) || 0,
      commission: parseFloat(salary?.commission),
      otherAdd: 0,
      al: 0,
      sl: 0,
      arrear: 0,
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
            let salaries = data?.results;

            const newEmployeeDataArray = salaries.map((salary) =>
              generateDefaultEmployeeData2(salary)
            );
            console.log(newEmployeeDataArray, 'newEmployeeDataArray');

            setData((prevData) => [...prevData, ...newEmployeeDataArray]);

          } catch (error) {
            console.error(`Failed to fetch salary for ${employee.user_id}`, error);
          }

          return generateDefaultEmployeeData2(salary);
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

  const CreateSalary = async (formData) => {
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
        status: 'Pending',
        month: moment(selectedMonth).month() + 1,
        year: moment(selectedMonth).year(),
        salaries: transformedData
      };

      const promise = UserServices.CreateSalary(obj);

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
  const getCostCenters = async () => {
    try {
      let params = {
        page: 1,
        limit: 999999,
      };

      const { data } = await CustomerServices.getCostCenters(params);
      setCostCenters(data?.cost_centers);
      setFiltertedCostCenters(data?.cost_centers)
      setSelectedCostCenter(null)

    } catch (error) {
      showErrorToast(error);
    }
  };
  useEffect(() => {
    getCostCenters()
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
            updatedRow.arrear +
            updatedRow.gpssaEmp

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
          {value}
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
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>Create Payroll</Typography>
      </Box>

      {/* Employee Multi-Select Dropdown with Search */}
      <Grid container xs={12} spacing={2}>
        <Grid item xs={3}>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="employee-select-label">Select Employees</InputLabel>
              <Select
                labelId="employee-select-label"
                multiple
                value={selectedEmployeeIds}
                onChange={handleEmployeeSelectionChange2}
                input={<OutlinedInput label="Select Employees" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const employee = employess.find((emp) => emp.id === value)
                      return <Chip key={value} label={`${employee?.user?.name} `} size="small" />
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
                            {employee?.user?.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Salary: {employee.basic_salary?.toLocaleString()}
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
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="cost-center-select-label">Select Cost Center</InputLabel>
              <Select
                labelId="cost-center-select-label"
                value={selectedCostCenter}
                onChange={async (e) => {
                  const selectedId = e.target.value;
                  setSelectedCostCenter(selectedId);

                  const selectedCenter = costCenters.find(center => center.id === selectedId);

                  try {
                    const { data } = await CustomerServices.employeeSalaryDetail({

                      cost_center: selectedCenter?.name || '',
                      month: moment(selectedMonth).month() + 1,
                      year: moment(selectedMonth).year(),
                    });

                    const salaries = data?.results || [];

                    const newEmployeeDataArray = salaries.map((salary) =>
                      generateDefaultEmployeeData2(salary)
                    );
                    console.log(newEmployeeDataArray, 'newEmployeeDataArray');

                    setData((prevData) => [...prevData, ...newEmployeeDataArray]);

                    // Do something with `newEmployeeDataArray`, like:
                    // setData(newEmployeeDataArray); or merge with existing data

                  } catch (error) {
                    console.error('Error fetching salary details:', error);
                  }
                }}

                input={<OutlinedInput label="Select Cost Center" />}
                renderValue={(selected) => {
                  const center = costCenters.find((c) => c.id === selected);
                  return center ? center.name : '';
                }}
                MenuProps={{
                  PaperProps: { style: { maxHeight: 400 } },
                  autoFocus: false,
                }}
                onClose={() => setSearchText('')}
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
                    placeholder="Search cost centers..."
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
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key !== 'Escape') e.stopPropagation();
                      if (e.key === 'Escape') setSearchText('');
                    }}
                  />
                </ListSubheader>

                {/* Cost Center Options */}
                {filtertedCostCenters.length > 0 ? (
                  filtertedCostCenters.map((center) => (
                    <MenuItem key={center.id} value={center.id}>
                      {center.name}
                    </MenuItem>
                  ))
                ) : searchText ? (
                  <MenuItem disabled>
                    <Typography variant="body2" color="textSecondary">
                      No cost centers found matching "{searchText}"
                    </Typography>
                  </MenuItem>
                ) : null}
              </Select>
            </FormControl>
          </Box>


        </Grid>

        <Grid item xs={6}>
          <Box sx={{ mb: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                views={['year', 'month']}
                disabled={data?.length > 0}
                label="Select Month & Year"
                minDate={dayjs('2000-01-01')}
                maxDate={dayjs('2100-12-31')}
                value={selectedMonth}
                onChange={(newValue) => {
                  setSelectedMonth(new Date(newValue)); console.log(newValue, 'newValuenewValue');
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Box>
        </Grid>

      </Grid>
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
                Total Basic Salary: {data.reduce((sum, row) => sum + row.salaryPaid, 0)?.toLocaleString()}
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
      <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <PrimaryButton
          bgcolor={'#001f3f'}
          title="Create"
          onClick={() => CreateSalary()}

          disabled={data?.length == 0}

        />

      </Box>
    </Box>
  )
}

export default SalaryList
