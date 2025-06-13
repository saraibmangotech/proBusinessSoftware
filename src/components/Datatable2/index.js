"use client"

import { useState, useEffect } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Box,
  CircularProgress,
  ButtonGroup,
  Button,
} from "@mui/material"
import { FileDownload } from "@mui/icons-material"
import TableTotalRow from "components/TotalRow/TableTotalRow"

const DataTable2 = ({
  data,
  columns,
  enableCheckbox = false,
  onSelectionChange,
  loading,
  nameColumnId = "name",
  alphabets,
  csv = false,
  csvName = "",
  total,
  // Server-side pagination props
  totalCount,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  onSortChange,
}) => {
  const [globalFilter, setGlobalFilter] = useState("")
  const [activeAlphabet, setActiveAlphabet] = useState("")
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})

  // Notify parent component when selection changes
  useEffect(() => {
    if (enableCheckbox && onSelectionChange) {
      const selectedRows = Object.keys(rowSelection).map((index) => data[Number(index)])
      onSelectionChange(selectedRows)
    }
  }, [rowSelection, data, enableCheckbox, onSelectionChange])

  // Handle sorting change
  const handleSortingChange = (updatedSorting) => {
    setSorting(updatedSorting)
    if (updatedSorting.length > 0) {
      const { id, desc } = updatedSorting[0]
      onSortChange && onSortChange(id, desc ? "desc" : "asc")
    } else {
      onSortChange && onSortChange(null, null)
    }
  }

  // Checkbox column
  const checkboxColumn = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
      />
    ),
    size: 40,
  }

  const tableColumns = enableCheckbox ? [checkboxColumn, ...columns] : columns

  // Global filter function for all visible columns
  const globalFilterFn = (row, columnId, filterValue) => {
    return row
      .getVisibleCells()
      .some((cell) => String(cell.getValue()).toLowerCase().includes(filterValue.toLowerCase()))
  }

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      globalFilter,
      sorting,
      pagination: {
        pageIndex: page - 1, // Convert 1-based to 0-based
        pageSize,
      },
      rowSelection,
    },
    enableRowSelection: enableCheckbox,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: handleSortingChange,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Don't use getPaginationRowModel as we're handling pagination on the server
    manualPagination: true, // Tell the table we're handling pagination externally
    manualSorting: true, // Tell the table we're handling sorting externally
    pageCount: Math.ceil(totalCount / pageSize), // Calculate page count based on total count
  })

  const filterByAlphabet = (letter) => {
    if (letter === activeAlphabet) {
      setActiveAlphabet("")
    } else {
      setActiveAlphabet(letter)
    }
  }

  const exportToExcel = () => {
    // Filter out selection/checkbox column
    const exportColumns = columns.filter((col) => !col.id || col.id !== "select")

    // Create CSV headers
    const headers = exportColumns.map((col) => col.header || col.accessorKey || col.id).join(",")

    // Generate a row from a data object
    const generateRow = (row) => {
      return exportColumns
        .map((col) => {
          let cellValue

          // Extract value from row using accessor
          if (col.accessorFn) {
            cellValue = col.accessorFn(row)
          } else if (col.accessorKey) {
            cellValue = row[col.accessorKey]
          } else if (col.id && col.id !== "select") {
            cellValue = row[col.id]
          } else {
            cellValue = ""
          }

          // Handle null/undefined
          if (cellValue === null || cellValue === undefined) {
            return ""
          }

          // Handle objects
          if (typeof cellValue === "object" && cellValue !== null) {
            if (cellValue instanceof Date) {
              cellValue = cellValue.toISOString()
            } else if (Array.isArray(cellValue)) {
              cellValue = cellValue.join(", ")
            } else {
              const displayProps = ["name", "title", "label", "value", "id", "key", "text", "description"]
              const foundProp = displayProps.find((prop) => cellValue[prop] !== undefined)

              if (foundProp) {
                cellValue = cellValue[foundProp]
              } else if (col.cell) {
                try {
                  const rendered = col.cell({ row: { original: row } })
                  if (rendered && typeof rendered !== "object") {
                    cellValue = rendered
                  } else {
                    cellValue = JSON.stringify(cellValue)
                  }
                } catch (e) {
                  cellValue = JSON.stringify(cellValue)
                }
              } else {
                cellValue = JSON.stringify(cellValue)
              }
            }
          }

          // Convert value to string and escape if needed
          cellValue = String(cellValue)
          if (cellValue.includes(",") || cellValue.includes('"') || cellValue.includes("\n")) {
            return `"${cellValue.replace(/"/g, '""')}"`
          }

          return cellValue
        })
        .join(",")
    }

    // Generate data rows
    const dataRows = data.map(generateRow)

    // Generate total row
    const totalRowObj = {}
    exportColumns.forEach((col, idx) => {
      const key = col.accessorKey || col.id
      const shouldTotal = col.total !== false

      if (idx === 0) {
        totalRowObj[key] = "Total"
      } else if (shouldTotal) {
        let total = 0
        data.forEach((row) => {
          let value
          if (col.accessorFn) {
            value = col.accessorFn(row)
          } else if (col.accessorKey) {
            value = row[col.accessorKey]
          }
          if (!isNaN(value) && value !== "" && value !== null && value !== undefined) {
            total += Number.parseFloat(value)
          }
        })
        totalRowObj[key] = total ? total.toFixed(2) : ""
      } else {
        totalRowObj[key] = ""
      }
    })

    const totalRowString = generateRow(totalRowObj)

    // Combine all parts into CSV content
    const csvContent = `${headers}\n${dataRows.join("\n")}\n${totalRowString}`
    const csvWithBOM = "\uFEFF" + csvContent // Excel needs BOM for UTF-8

    // Trigger download
    const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", csvName + ".csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <Paper sx={{ boxShadow: "none", backgroundColor: "transparent" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <TextField
            value={globalFilter ?? ""}
            size="small"
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            variant="outlined"
            sx={{
              borderRadius: "12px",
              mt: 2,
              mb: 2,
              ".MuiOutlinedInput-root": {
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                "& fieldset": { border: "none" },
                "&:hover": {
                  border: "2px solid #0076bf",
                },
                "&.Mui-focused": {
                  border: "2px solid #0076bf",
                  "& fieldset": { border: "none" },
                },
              },
            }}
          />
          {csv && (
            <Button
              startIcon={<FileDownload />}
              onClick={exportToExcel}
              variant="contained"
              color="primary"
              sx={{
                padding: "10px",
                textTransform: "capitalize !important",
                backgroundColor: "#001f3f !important",
                fontSize: "12px",
                ":hover": {
                  backgroundColor: "#001f3f !important",
                },
              }}
            >
              Export to Excel
            </Button>
          )}
        </Box>
        {alphabets && (
          <Box
            sx={{
              mb: 2,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 1,
              justifyContent: "space-between",
            }}
          >
            <ButtonGroup variant="outlined" size="small" sx={{ flexWrap: "wrap" }}>
              {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((letter) => (
                <Button
                  key={letter}
                  onClick={() => filterByAlphabet(letter)}
                  sx={{
                    minWidth: "30px",
                    px: 1,
                    backgroundColor: activeAlphabet === letter ? "#0076bf" : "transparent",
                    color: activeAlphabet === letter ? "white" : "inherit",
                    "&:hover": {
                      backgroundColor: activeAlphabet === letter ? "#0076bf" : "rgba(0, 118, 191, 0.1)",
                    },
                  }}
                >
                  {letter}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        )}

        <TableContainer sx={{ maxHeight: 440, overflowX: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <TableCell
                      key={header.id}
                      align="left"
                      sortDirection={header.column.getIsSorted() || false}
                      sx={{
                        minWidth: header.column.columnDef.id === "select" ? "60px" : "150px",
                        whiteSpace: "nowrap",
                        fontWeight: "bold",
                      }}
                    >
                      {header.isPlaceholder ? null : header.column.columnDef.id === "select" ? (
                        flexRender(header.column.columnDef.header, header.getContext())
                      ) : (
                        <TableSortLabel
                          active={!!header.column.getIsSorted()}
                          direction={header.column.getIsSorted() || "asc"}
                          onClick={header.column.getToggleSortingHandler()}
                          sx={{
                            color: header.column.getIsSorted() ? "#6092d5 !important" : "white !important",
                            "& .MuiTableSortLabel-icon": {
                              color: header.column.getIsSorted() ? "#6092d5 !important" : "white !important",
                            },
                            "&:hover": {
                              color: "#6092d5 !important",
                              "& .MuiTableSortLabel-icon": {
                                color: "#6092d5 !important",
                              },
                            },
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableSortLabel>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length}>
                    <Box py={3} textAlign="center">
                      <CircularProgress sx={{ color: "#001f3f" }} size={50} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                <>
                  {data.map((row, index) => {
                    const rowObj = table.getRowModel().rows[index]
                    return rowObj ? (
                      <TableRow
                        key={index}
                        hover={enableCheckbox}
                        onClick={enableCheckbox ? () => rowObj.toggleSelected() : undefined}
                        selected={rowObj.getIsSelected()}
                      >
                        {rowObj.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            sx={{
                              minWidth: cell.column.columnDef.id === "select" ? "60px" : "150px",
                              wordBreak: "break-word",
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ) : null
                  })}

                  {/* Total Row after mapping rows */}
                  {total && <TableTotalRow table={table} columns={columns} />}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length}>
                    <Box py={3} textAlign="center">
                      <strong style={{ fontSize: "18px" }}>No Data Found</strong>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {data.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={pageSize}
            page={page - 1} // Convert 1-based to 0-based for MUI
            onPageChange={(_, newPage) => {
              onPageChange(newPage + 1) // Convert 0-based to 1-based for API
            }}
            onRowsPerPageChange={(e) => {
              const size = e.target.value ? Number(e.target.value) : 10
              onPageSizeChange(size)
            }}
          />
        )}
      </Paper>
    </div>
  )
}

export default DataTable2
