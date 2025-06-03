import { TableRow, TableCell } from "@mui/material";
import { CommaSeparator } from "utils";

const TableTotalRow = ({ table, columns }) => {
  const rows = table.getRowModel().rows;

  if (rows.length === 0) return null;

  const totals = columns.map((col) => {
    // If the column has total explicitly set to false, return null
    if (col.total === false) return null;

    let total = 0;
    rows.forEach((row) => {
      let value;

      if (col.accessorFn) {
        value = col.accessorFn(row.original);
        if (typeof value === "string") {
          value = parseFloat(value);
        }
      } else if (col.accessorKey) {
        value = row.original[col.accessorKey];
      }

      if (!isNaN(value)) {
        total += parseFloat(value);
      }
    });

    return total;
  });

  return (
    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
      {columns.map((col, index) => (
        <TableCell key={col.accessorKey || index} sx={{ fontWeight: "bold" }}>
          {index === 0
            ? "Total"
            : col.total === false || totals[index] === null
            ? ""
            : CommaSeparator(totals[index]?.toFixed(2))}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default TableTotalRow;
