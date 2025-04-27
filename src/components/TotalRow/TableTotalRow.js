import { TableRow, TableCell } from "@mui/material";

const TableTotalRow = ({ table, columns }) => {
  const rows = table.getRowModel().rows;

  if (rows.length === 0) return null;
console.log(columns);

  const totals = columns.map((col) => {
    let total = 0;


    rows.forEach((row) => {
      let value;

      if (col.accessorFn) {
        value = col.accessorFn(row.original);

        // Force value to be number if accessorFn returns string (because of .toFixed or other issues)
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
  console.log(totals,'totals');
  return (
    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
      {columns.map((col, index) => (
        <TableCell key={col.accessorKey || index} sx={{ fontWeight: "bold" }}>
          {index === 0 ? "Total" : totals[index]?.toFixed(2)}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default TableTotalRow;
