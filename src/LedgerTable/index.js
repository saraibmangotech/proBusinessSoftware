"use client"

import { useEffect, useRef, useState } from "react"
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
    IconButton,
    Dialog,
    Tooltip,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Skeleton,
} from "@mui/material"
import styled from "@emotion/styled"
import { Close } from "@mui/icons-material"

// Color constants
const Colors = {
    primary: "#1976d2",
    charcoalGrey: "#333333",
    bluishCyan: "#00bcd4",
    cloudyGrey: "#9e9e9e",
}

// Font family constant
const FontFamily = {
    NunitoRegular: "'Nunito', sans-serif",
}

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
    border: 0,
}))

const Cell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        fontSize: 14,
        fontFamily: "Public Sans",
        border: "1px solid #EEEEEE",
        padding: "15px",
        textAlign: "left",
        whiteSpace: "nowrap",
        color: "#434343",
        paddingRight: "50px",
        background: "transparent",
        fontWeight: "bold",
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontFamily: "Public Sans",
        textWrap: "nowrap",
        padding: "5px !important",
        paddingLeft: "15px !important",
        ".MuiBox-root": {
            display: "flex",
            gap: "6px",
            alignItems: "center",
            justifyContent: "center",
            ".MuiBox-root": {
                cursor: "pointer",
            },
        },
        svg: {
            width: "auto",
            height: "24px",
        },
        ".MuiTypography-root": {
            textTransform: "capitalize",
            fontFamily: FontFamily.NunitoRegular,
            textWrap: "nowrap",
        },
        ".MuiButtonBase-root": {
            padding: "8px",
            width: "28px",
            height: "28px",
        },
    },
}))

// Custom Primary Button component
const PrimaryButton = ({ title, onClick, buttonStyle = {}, startIcon, ...props }) => (
    <Button
        variant="contained"
        onClick={onClick}
        startIcon={startIcon}
        sx={{
            backgroundColor: Colors.primary,
            "&:hover": {
                backgroundColor: Colors.primary,
                opacity: 0.9,
            },
            ...buttonStyle,
        }}
        {...props}
    >
        {title}
    </Button>
)

// Loading Skeleton Row Component
const LoadingSkeletonRow = ({ visibleColumns }) => (
    <Row>
        {visibleColumns.map((colIndex) => (
            <Cell key={colIndex}>
                <Skeleton variant="text" width="100%" height={20} />
            </Cell>
        ))}
    </Row>
)

// Loading Overlay Component
const LoadingOverlay = () => (
    <Box
        sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            zIndex: 1000,
        }}
    >
        <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={40} sx={{ color: Colors.primary }} />
            <Typography
                variant="body2"
                sx={{
                    mt: 2,
                    color: Colors.charcoalGrey,
                    fontFamily: FontFamily.NunitoRegular,
                }}
            >
                Loading journal entries...
            </Typography>
        </Box>
    </Box>
)

function LedgerModal({ open, onClose, generalJournalAccounts = [], title = " Journal Entries", loading = false }) {
    const contentRef = useRef()
    const [totalDebit, setTotalDebit] = useState(0)
    const [totalCredit, setTotalCredit] = useState(0)
    const tableHead = [
        "JV#",
        "Date",
        "Cost Center",
        "Particular#",
        "Type",
        "COA Code",
        "COA Name",
        "Debit (AED)",
        "Credit (AED)",
        "Description",
        "Comments",
    ]

    const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()])

    const handleColumnChange = (event) => {
        const selectedColumns = event.target.value
        // Sort the selected columns to maintain the correct order
        const sortedColumns = selectedColumns.sort((a, b) => a - b)
        setVisibleColumns(sortedColumns)
    }

    // Format date helper
    const formatDate = (date) => {
        if (!date) return "-"
        const d = new Date(date)
        return d.toLocaleDateString("en-GB") // DD/MM/YYYY format
    }

    const renderCellContent = (colIndex, item) => {
        switch (colIndex) {
            case 0:
                return item?.journal_id ? item?.series_id + item?.journal_id : "-"
            case 1:
                return formatDate(item?.created_at)
            case 2:
                return item?.cost_center ?? "-"
            case 3:
                return (
                    <Box>
                        <Tooltip className="pdf-hide" title={item.entry?.reference_no} arrow placement="top">
                            <span>
                                {item.entry?.reference_no?.length > 24
                                    ? item.entry?.reference_no?.slice(0, 8) + "..."
                                    : item.entry?.reference_no}
                            </span>
                        </Tooltip>
                        <Box component="div" sx={{ display: "none !important" }} className="pdf-show">
                            {item.entry?.reference_no}
                        </Box>
                    </Box>
                )
            case 4:
                return item?.type?.type_name ?? "-"
            case 5:
                return item?.account?.account_code ?? "-"
            case 6:
                return item?.account?.name ?? "-"
            case 7:
                return Number.parseFloat(item?.debit || 0).toFixed(2)
            case 8:
                return Number.parseFloat(item?.credit || 0).toFixed(2)
            case 9:
                return item?.description ?? "-"
            case 10:
                return (
                    <Box>
                        <Tooltip className="pdf-hide" title={item?.comment ?? "-"} arrow placement="top">
                            <span>{item?.comment?.length > 24 ? item?.comment?.slice(0, 18) + "..." : item?.comment}</span>
                        </Tooltip>
                        <Box component={"div"} className="pdf-show" sx={{ display: "none !important" }}>
                            {item?.comment ?? "-"}
                        </Box>
                    </Box>
                )
            default:
                return "-"
        }
    }

    // Simple CSV export function as alternative to Excel
    const downloadCSV = () => {
        if (loading) return // Prevent export while loading

        const headers = tableHead.filter((item) => item !== "Actions")
        const data = generalJournalAccounts

        let totalDebit = 0
        let totalCredit = 0

        // Create CSV content
        let csvContent = headers.join(",") + "\n"

        data.forEach((item) => {
            const debit = Number.parseFloat(item?.debit || 0)
            const credit = Number.parseFloat(item?.credit || 0)
            totalDebit += debit
            totalCredit += credit

            const row = [
                item?.journal_id ? `"${item?.series_id + item?.journal_id}"` : '"-"',
                `"${formatDate(item?.created_at)}"`,
                `"${item?.cost_center ?? "-"}"`,
                `"${item.entry?.reference_no ?? "-"}"`,
                `"${item?.type?.type_name ?? "-"}"`,
                `"${item?.account?.account_code ?? "-"}"`,
                `"${item?.account?.name ?? "-"}"`,
                debit.toFixed(2),
                credit.toFixed(2),
                `"${item?.description ?? "-"}"`,
                `"${item?.comment ?? "-"}"`,
            ]
            csvContent += row.join(",") + "\n"
        })

        // Add totals row
        const totalRow = [
            '"Total"',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            totalDebit.toFixed(2),
            totalCredit.toFixed(2),
            '""',
            '""',
        ]
        csvContent += totalRow.join(",") + "\n"

        // Create and download file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", "general-journal-entries.csv")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Alternative Excel export using native browser functionality
    const downloadExcel = () => {
        if (loading) return // Prevent export while loading

        const headers = tableHead.filter((item) => item !== "Actions")
        const data = generalJournalAccounts

        let totalDebit = 0
        let totalCredit = 0

        // Create HTML table for Excel export
        let htmlContent = `
      <table border="1">
        <thead>
          <tr>
            ${headers.map((header) => `<th>${header}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
    `

        data.forEach((item) => {
            const debit = Number.parseFloat(item?.debit || 0)
            const credit = Number.parseFloat(item?.credit || 0)
            totalDebit += debit
            totalCredit += credit

            htmlContent += `
        <tr>
          <td>${item?.journal_id ? item?.series_id + item?.journal_id : "-"}</td>
          <td>${formatDate(item?.created_at)}</td>
          <td>${item?.cost_center ?? "-"}</td>
          <td>${item.entry?.reference_no ?? "-"}</td>
          <td>${item?.type?.type_name ?? "-"}</td>
          <td>${item?.account?.account_code ?? "-"}</td>
          <td>${item?.account?.name ?? "-"}</td>
          <td>${debit.toFixed(2)}</td>
          <td>${credit.toFixed(2)}</td>
          <td>${item?.description ?? "-"}</td>
          <td>${item?.comment ?? "-"}</td>
        </tr>
      `
        })

        // Add totals row
        htmlContent += `
        <tr style="font-weight: bold;">
          <td>Total</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td>${totalDebit.toFixed(2)}</td>
          <td>${totalCredit.toFixed(2)}</td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
    `

        // Create and download file
        const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", "general-journal-entries.xls")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handlePrint = () => {
        if (loading) return // Prevent print while loading
        window.print()
    }
    useEffect(() => {

        const totalCredit = generalJournalAccounts.reduce(
            (sum, item) => sum + (parseFloat(item.credit) || 0),
            0
        );
        setTotalCredit(totalCredit)
        const totalDebit = generalJournalAccounts.reduce(
            (sum, item) => sum + (parseFloat(item.debit) || 0),
            0
        );
        setTotalDebit(totalDebit)
        setTotalCredit(totalCredit)
    }, [generalJournalAccounts])


    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    width: "95%",
                    height: "90%",
                    maxHeight: "90vh",
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pb: 1,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        color: Colors.charcoalGrey,
                        fontFamily: FontFamily.NunitoRegular,
                    }}
                >
                    {title}
                </Typography>
                <IconButton onClick={onClose} disabled={loading}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 1, position: "relative" }}>
                {/* Loading Overlay */}
                {loading && <LoadingOverlay />}

                <TableContainer
                    component={Paper}
                    sx={{
                        boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                        borderRadius: 2,
                        maxHeight: "calc(70vh - 200px)",
                        overflow: "auto",
                        opacity: loading ? 0.5 : 1,
                        transition: "opacity 0.3s ease",
                    }}
                    className="table-box"
                >
                    <Table stickyHeader sx={{ minWidth: 500 }}>
                        <TableHead>
                            <TableRow>
                                {visibleColumns.map((index) => (
                                    <Cell key={index}>{tableHead[index]}</Cell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                // Show skeleton rows while loading
                                Array.from({ length: 5 }).map((_, index) => (
                                    <LoadingSkeletonRow key={index} visibleColumns={visibleColumns} />
                                ))
                            ) : generalJournalAccounts?.length > 0 ? (
                                <>
                                    {generalJournalAccounts.map((item, rowIndex) => (
                                        <Row key={rowIndex} sx={{ bgcolor: rowIndex % 2 !== 0 ? "#EFF8E7" : "transparent" }}>
                                            {visibleColumns.map((colIndex) => (
                                                <Cell key={colIndex}>{renderCellContent(colIndex, item)}</Cell>
                                            ))}
                                        </Row>
                                    ))}

                                </>
                            ) : (
                                <Row>
                                    <Cell colSpan={tableHead.length} align="center" sx={{ fontWeight: 600 }}>
                                        No Data Found
                                    </Cell>
                                </Row>
                            )}
                        </TableBody>

                    </Table>
                </TableContainer>
                <Box display={'flex'} justifyContent={'space-between'} mt={2}>
                    <Box display={'flex'} justifyContent={'space-between'}>
                        Total Debit : {parseFloat(totalDebit).toFixed(2)}

                    </Box>
                    <Box display={'flex'} justifyContent={'space-between'}>
                        Total Credit : {parseFloat(totalCredit).toFixed(2)}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="outlined" disabled={loading}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default LedgerModal
