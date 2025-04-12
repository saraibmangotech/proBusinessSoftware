import React, { Fragment, useEffect, useState, useRef } from "react";
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
    CircularProgress,
    Grid,
    Checkbox,
    InputLabel,
    FormControl,
    Select,
    MenuItem,
    ListItemText,
} from "@mui/material";
import styled from "@emotion/styled";
import { FontFamily } from "assets";
import Colors from "assets/Style/Colors";
import { CircleLoading } from "components/Loaders";
import { ErrorToaster } from "components/Toaster";
import { makeStyles } from "@mui/styles";
import Pagination from "components/Pagination";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Debounce, handleExportWithComponent } from "utils";
import SelectField from "components/Select";
import { useDispatch } from "react-redux";
import VehiclePaymentServices from "services/VehiclePayment";
import CustomerServices from "services/Customer";
import { PrimaryButton } from "components/Buttons";
import moment from "moment";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FinanceServices from "services/Finance";
import { PDFExport } from "@progress/kendo-react-pdf";
import StatementHeader from "./Components/StatementHeader";

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
    border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        fontSize: 14,
        fontFamily: FontFamily.NunitoRegular,
        border: 0,
        padding: "15px",
        textAlign: "center",
        whiteSpace: "nowrap",
        background: Colors.primary,
        color: Colors.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontFamily: FontFamily.NunitoRegular,
        textAlign: "center",
        textWrap: "nowrap",
        padding: '5px !important',

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
}));

const useStyles = makeStyles({
    loaderWrap: {
        display: "flex",
        height: 100,
        "& svg": {
            width: "40px !important",
            height: "40px !important",
        },
    },
});

function UnPaidVehicleSOAList() {
    const tableRef = useRef(null);
    const contentRef = useRef(null);
    const classes = useStyles();
    let Url = window.location.href

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const tableHead = [
        "S.No",
        "Buyer ID",
        "Buy Date",
        "Model",
        "Make",
        "LOT",
        "VIN",
        "Color",
        "Vehicle Amount",
        "Other Charges",
        "Paid",
        "Balance",
        "Past Due Days",
    ];

    const [visibleColumns, setVisibleColumns] = useState([
        ...Array(tableHead?.length).keys(),
    ]);

    const [loader, setLoader] = useState(false);
    const [auth, setAuth] = useState()

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [statementData, setStatementData] = useState()

    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Customer Booking
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [shippingVault, setShippingVault] = useState()
    const [vehicleVault, setVehicleVault] = useState()

    const [totalVehicleAmount, setTotalVehicleAmount] = useState();

    const [otherCharges, setOtherCharges] = useState();

    const [totalPaid, setTotalPaid] = useState();
    const [totalBalance, setTotalBalance] = useState();

    // *For Vehicle SOA
    const [vehicleSoa, setVehicleSoa] = useState();

    // *For Total Amounts
    // let TotalVehicleAmount = 0
    let TotalOtherCharges = 0;
    let TotalPaidAmount = 0;
    let TotalBalance = 0;



    // *For Get Vehicle SOA
    const getVehicleSOA = async (page, limit, filter) => {
        setLoader(true);
        const params = new URLSearchParams(window.location.search);

        // Extract the value of the 'auth' parameter
        const authToken = params.get('auth');
        try {
            const Page = page ? page : currentPage;
            const Limit = limit ? limit : pageLimit;
            const Filter = { ...filters, ...filter };
            setCurrentPage(Page);
            setPageLimit(Limit);
            setFilters(Filter);
            let params = {
                page: Page,
                limit: Limit,
                unpaid: true,
                auth: authToken
            };
            params = { ...params, ...Filter };
            const {
                data
            } = await VehiclePaymentServices.getInvoiceListStatement(params);
            setVehicleSoa(data?.approvals?.rows);
            console.log(data, 'approvals')
            setStatementData(data)
            console.log(data?.rows);
            const TotalValue = data?.approvals?.rows.reduce(
                (total, invoice) => total + parseFloat(invoice.booking?.value),
                0
            );
            const TotalOtherCharges = data?.approvals?.rows.reduce(
                (total, invoice) => total + parseFloat(invoice.booking?.other_charges),
                0
            );
            const TotalPaid = data?.approvals?.rows.reduce(
                (total, invoice) => total + parseFloat(invoice?.paid),
                0
            );
            const TotalBalance = data?.approvals?.rows.reduce(
                (total, invoice) => total + parseFloat(invoice?.balance),
                0
            );
            setTotalBalance(TotalBalance);
            setOtherCharges(TotalOtherCharges);
            setTotalVehicleAmount(TotalValue);
            setTotalPaid(TotalPaid);
            setTotalCount(data?.count);
        } catch (error) {
            ErrorToaster("Link Is Expired");
        } finally {
            setLoader(false);
        }
    };

    // *For Handle Filter
    const handleFilter = () => {
        Debounce(() => {
            getVehicleSOA();
            getVaultDashboard();
        });
    };

    // *For Get Vault Dashboard
    const getVaultDashboard = async (page, limit, filter) => {
        setLoader(true);
        const params = new URLSearchParams(window.location.search);

        // Extract the value of the 'auth' parameter
        const authToken = params.get('auth');
        try {
            const Page = page ? page : currentPage;
            const Limit = limit ? limit : pageLimit;
            const Filter = { ...filters, ...filter };
            setCurrentPage(Page);
            setPageLimit(Limit);
            setFilters(Filter);
            let params = {
                page: Page,
                limit: Limit,
                auth: authToken
            };
            params = { ...params, ...Filter };
            const {
                data: { detail },
            } = await FinanceServices.getVehicleSumLedgerStatement(params);
            console.log(detail);
            setShippingVault(detail?.rows[0].accounts?.find(account => account.type_code === 'L2' && account.primary_series === 50005))
            setVehicleVault(detail?.rows[0].accounts?.find(account => account.type_code === 'L2' && account.primary_series === 50004))
            setTotalCount(detail?.count);
        } catch (error) {
            ErrorToaster("Link Is Expired");
        } finally {
            setLoader(false);
        }
    };

    const downloadExcel = () => {
        // Define headers and data separately
        const headers = tableHead;
        const data = vehicleSoa;

        // Extract values from objects and create an array for each row
        const rows = data.map((item, index) => [
            index + 1,
            item?.booking?.buyer?.name || "", // Handle optional chaining for potential undefined values
            moment(item?.created_at).format("MM-DD-YYYY") || "",
            item?.booking?.veh_model?.name || "",
            item?.booking?.veh_make?.name || "",
            item?.booking?.lot_number || "",
            item?.booking?.vin || "",
            item?.booking?.color || "",
            parseFloat(item?.booking?.value).toFixed(2) || "",
            parseFloat(item?.booking?.other_charges).toFixed(2) || "",
            parseFloat(item?.paid).toFixed(2) || "",
            parseFloat(item?.balance).toFixed(2) || "",
            moment().diff(item?.created_at, "days") || "",
        ]);
        const totalRow = [
            "",
            "",
            "",
            "Total",
            "",
            "",
            "",
            "",
            parseFloat(totalVehicleAmount).toFixed(2),
            parseFloat(otherCharges).toFixed(2),
            parseFloat(totalPaid).toFixed(2),
            parseFloat(totalBalance).toFixed(2),
            "",
        ];

        // Create a workbook with a worksheet
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRow]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Convert the workbook to an array buffer
        const buf = XLSX.write(wb, {
            bookType: "xlsx",
            type: "array",
            mimeType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Save the file using FileSaver.js
        saveAs(new Blob([buf]), "data.xlsx");
    };

    const downloadPDF = async () => {
        const input = tableRef.current;

        if (!input) {
            console.error("Table ref not found");
            return;
        }

        try {
            const canvas = await html2canvas(input);
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            // Adjust the position and size of the table in the PDF
            pdf.addImage(imgData, "PNG", 10, 10, 190, 0);

            // Manually set styles after adding the image
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");

            // Save the PDF
            pdf.save("data.pdf");
        } catch (error) {
            console.error("Error converting table to PDF:", error);
        }
    };
    const sortData = (e, type, item) => {
        e.preventDefault();
        console.log("Original array:", vehicleSoa);
        console.log(type);
        console.log(item, "item");

        if (type === "ascending" && item == "Buyer ID") {
            const sortedData = [...vehicleSoa].sort((a, b) => {
                // Use the localeCompare method for string comparison
                console.log(a, b);
                return a.booking?.buyer?.name.localeCompare(b.booking?.buyer?.name);
            });

            setVehicleSoa(sortedData);
        }

        if (type === "descending" && item == "Buyer ID") {
            const sortedData = [...vehicleSoa].sort((a, b) => {
                // Use the localeCompare method for string comparison
                return b.booking?.buyer?.name.localeCompare(a.booking?.buyer?.name);
            });

            setVehicleSoa(sortedData);
        }

        if (type === "ascending" && item == "Model") {
            const sortedData = [...vehicleSoa].sort((a, b) => {
                // Use the localeCompare method for string comparison
                console.log(a, b);
                return a.booking?.veh_model?.name.localeCompare(
                    b.booking?.veh_model?.name
                );
            });

            setVehicleSoa(sortedData);
        }

        if (type === "descending" && item == "Model") {
            console.log("deefgghe");
            const sortedData = [...vehicleSoa].sort((a, b) => {
                // Use the localeCompare method for string comparison
                return b.booking?.veh_model?.name.localeCompare(
                    a.booking?.veh_model?.name
                );
            });

            setVehicleSoa(sortedData);
        }
        if (type === "ascending" && item == "Make") {
            const sortedData = [...vehicleSoa].sort((a, b) => {
                // Use the localeCompare method for string comparison
                console.log(a, b);
                return a.booking?.veh_make?.name.localeCompare(
                    b.booking?.veh_make?.name
                );
            });

            setVehicleSoa(sortedData);
        }
        if (type === "descending" && item == "Make") {
            console.log("deefgghe");
            const sortedData = [...vehicleSoa].sort((a, b) => {
                // Use the localeCompare method for string comparison
                return b.booking?.veh_make?.name.localeCompare(
                    a.booking?.veh_make?.name
                );
            });

            setVehicleSoa(sortedData);
        }

        if (type === "ascending" && item === "LOT") {
            const sortedData = [...vehicleSoa].sort((a, b) => {
                const costA = parseFloat(a.booking?.lot_number) || 0;
                const costB = parseFloat(b.booking?.lot_number) || 0;
                console.log(costA, costB); // Add this line for debugging
                return costA - costB;
            });

            setVehicleSoa(sortedData);
        }
        if (type === "descending" && item === "LOT") {
            const sortedData = [...vehicleSoa].sort((a, b) => {
                const costA = parseFloat(a.booking?.lot_number) || 0;
                const costB = parseFloat(b.booking?.lot_number) || 0;
                console.log(costA, costB); // Add this line for debugging
                return costB - costA;
            });

            setVehicleSoa(sortedData);
        }

        if (type === "ascending" && item == "VIN") {
            const sortedData = [...vehicleSoa].sort((a, b) => {
                // Use the localeCompare method for string comparison
                console.log(a, b);
                return a.booking?.vin.localeCompare(b.booking?.vin);
            });

            setVehicleSoa(sortedData);
        }

        if (type === "descending" && item == "VIN") {
            console.log("deefgghe");
            const sortedData = [...vehicleSoa].sort((a, b) => {
                // Use the localeCompare method for string comparison
                return b.booking?.vin.localeCompare(a.booking?.vin);
            });

            setVehicleSoa(sortedData);
        }

        if (type === "ascending" && item == "Color") {
            const sortedData = [...vehicleSoa].sort((a, b) => {
                // Use the localeCompare method for string comparison
                console.log(a, b);
                return a.booking?.color.localeCompare(b.booking?.color);
            });

            setVehicleSoa(sortedData);
        }

        if (type === "descending" && item == "Color") {
            console.log("buhsdaguysda");
            const sortedData = [...vehicleSoa].sort((a, b) => {
                // Use the localeCompare method for string comparison
                return b.booking?.color.localeCompare(a.booking?.color);
            });

            setVehicleSoa(sortedData);
        }
    };

    const handleColumnChange = (event) => {
        const selectedColumns = event.target.value;
        // Sort the selected columns to maintain the correct order
        const sortedColumns = selectedColumns.sort((a, b) => a - b);
        setVisibleColumns(sortedColumns);
    };

    const renderCellContent = (colIndex, item, isActive, index) => {
        TotalOtherCharges += parseFloat(item?.booking?.other_charges);
        TotalPaidAmount += parseFloat(item?.paid);
        TotalBalance += parseFloat(item?.balance);
        switch (colIndex) {
            case 0:
                return index + 1;
            case 1:
                return item?.booking?.buyer?.name ?? "-";
            case 2:
                return moment(item?.purchase_date).format("MM-DD-YYYY");
            case 3:
                return item?.booking?.veh_model?.name ?? "-";
            case 4:
                return item?.booking?.veh_make?.name ?? "-";
            case 5:
                return item?.booking?.lot_number ?? "-";
            case 6:
                return item?.booking?.vin ?? "-";
            case 7:
                return item?.booking?.color ?? "-";
            case 8:
                return <b>USD {parseFloat(item?.booking?.value).toFixed(2)} </b>;
            case 9:
                return <b> USD{parseFloat(item?.booking?.other_charges).toFixed(2)}</b>;
            case 10:
                return <b> USD {parseFloat(item?.paid).toFixed(2)}</b>;
            case 11:
                return <b>USD {parseFloat(item?.balance).toFixed(2)}</b>;
            case 12:
                return moment().diff(item?.created_at, "days") + "Days";

            default:
                return "-";
        }
    };

    useEffect(() => {

        handleFilter()
    }, []);


    return (
        <>
            <Box sx={{
                textAlign: "right", p: 4, height: "100vh",
                display: 'flex',
                justifyContent: "center", alignItems: "center"
            }}>
                <PrimaryButton
                    title="Download Statement"
                    type="button"
                    style={{ backgroundColor: Colors.bluishCyan }}
                    onClick={() => handleExportWithComponent(contentRef)}
                />
            </Box>
            <Box className={"blur-wrapper"} sx={{ height: '100vh', backgroundColor: '#fff', width: '100%', zIndex: '1111' }} >
                <PDFExport ref={contentRef} landscape={true} paperSize="A4"
                    fileName="Unpaid Vehicle SOA"
                >
                    <StatementHeader data={statementData} />
                    <Box sx={{ m: 4, my: 1 }}>

                        <Box display={"flex"} justifyContent={"center"}>
                            <Typography
                                variant="h5"
                                sx={{
                                    color: Colors.charcoalGrey,
                                    fontFamily: FontFamily.NunitoRegular,
                                    mb: 4,
                                    fontSize: '20px', textAlign: 'center'
                                }}
                            >
                                UnPaid Vehicle SOA
                            </Typography>
                            {/* {vehicleSoa?.length > 0 && <Box display={"flex"} justifyContent={"flex-end"} gap={5}><PrimaryButton size={"small"} title={"Download Excel"} onClick={downloadExcel}> </PrimaryButton>
          <PrimaryButton style={{ backgroundColor: Colors.bluishCyan }} title={"Download PDF"} onClick={downloadPDF}> </PrimaryButton></Box>} */}
                        </Box>
                        {/* Filters */}
                        {/* <Box
        component={"form"}
        onSubmit={handleSubmit(handleFilter)}
        sx={{
          m: "20px 0 20px 5px",
          p: "20px",
          bgcolor: Colors.feta,
          border: `1px solid ${Colors.iron}`,
          borderRadius: "9px",
        }}
      >
        <Grid container spacing={2} alignItems={"center"} columns={10}>
          <Grid item xs={12} md={4}>
            <SelectField
              size={"small"}
              onSearch={(v) => getCustomerBooking(v)}
              label={"Select Customer"}
              options={customers}
              selected={selectedCustomer}
              onSelect={(value) => {
                setSelectedCustomer(value);
              }}
              register={register("customer")}
            />
          </Grid>
          <Grid item xs={12} md={2} sx={{ height: "55px" }}>
            <Box
              sx={{
                mt: "2px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <PrimaryButton
                loading={loader}
                type={"submit"}
                title={"Search"}
              />
            </Box>
          </Grid>
        </Grid>
      </Box> */}

                        {loader && <CircleLoading />}
                        <Grid item md={11}>
                            {vehicleSoa?.length > 0 ? (
                                <Box>
                                    {/* <Grid container mb={2}>
                                    <Grid item xs={5}>
                                        <FormControl>
                                            <InputLabel>Columns</InputLabel>
                                            <Select
                                                size={"small"}
                                                multiple
                                                value={visibleColumns}
                                                label={"Columns"}
                                                onChange={handleColumnChange}
                                                renderValue={() => "Show/Hide"}
                                            >
                                                {tableHead.map((column, index) => {
                                                    if (
                                                        column !== "Vehicle Amount" &&
                                                        column !== "Other Charges" &&
                                                        column !== "Paid" &&
                                                        column !== "Balance" &&
                                                        column !== "Past Due Days" &&
                                                        column !== "S.No"
                                                    ) {
                                                        return (
                                                            <MenuItem key={index} value={index}>
                                                                <Checkbox
                                                                    checked={visibleColumns.includes(index)}
                                                                />
                                                                <ListItemText primary={column} />
                                                            </MenuItem>
                                                        );
                                                    } else {
                                                        return null;
                                                    }
                                                })}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid> */}

                                    {vehicleSoa && (
                                        <Fragment>
                                            <TableContainer
                                                component={Paper}
                                                sx={{
                                                    boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                                    borderRadius: 2,
                                                    maxHeight: "100vh",
                                                }}
                                                ref={tableRef}
                                            >
                                                <Table stickyHeader sx={{ minWidth: 500 }}>
                                                    {/* Table Header */}
                                                    <TableHead>
                                                        <TableRow sx={{ lineHeight: '0 !important', padding: '2px !important' }}>
                                                            {visibleColumns.map((index) => (
                                                                <Cell key={index} sx={{ fontSize: '5px !important', lineHeight: '0 !important' }}>
                                                                    {tableHead[index]}
                                                                    {tableHead[index] == "S.No" ||
                                                                        tableHead[index] == "Past Due Days" ||
                                                                        tableHead[index] == "Buy Date" ||
                                                                        tableHead[index] == "Other Charges" ||
                                                                        tableHead[index] == "Paid" ||
                                                                        tableHead[index] == "Balance" ||
                                                                        tableHead[index] == "Vehicle Amount" ? (
                                                                        ""
                                                                    ) : (
                                                                        <>


                                                                        </>
                                                                    )}
                                                                </Cell>
                                                            ))}
                                                        </TableRow>
                                                    </TableHead>

                                                    {/* Table Body */}
                                                    <TableBody>
                                                        {!loader ? (
                                                            vehicleSoa?.length > 0 ? (
                                                                <Fragment>
                                                                    {vehicleSoa.map((item, rowIndex) => {
                                                                        const isActive = true;
                                                                        return (
                                                                            <Row
                                                                                key={rowIndex}
                                                                                sx={{
                                                                                    bgcolor: rowIndex % 2 !== 0 && "#EFF8E7",
                                                                                }}
                                                                            >
                                                                                {visibleColumns.map((colIndex) => (
                                                                                    <Cell key={colIndex} sx={{ fontSize: '5px !important', lineHeight: '0 !important' }}>
                                                                                        {renderCellContent(
                                                                                            colIndex,
                                                                                            item,
                                                                                            isActive,
                                                                                            rowIndex
                                                                                        )}
                                                                                    </Cell>
                                                                                ))}
                                                                            </Row>
                                                                        );
                                                                    })}
                                                                    <Row>
                                                                        <Cell colSpan={visibleColumns?.length - 5}>
                                                                            <Typography
                                                                                variant="body1"
                                                                                sx={{ fontWeight: 700, fontSize: '5px' }}
                                                                            >
                                                                                Total
                                                                            </Typography>
                                                                        </Cell>
                                                                        <Cell>
                                                                            <Typography
                                                                                variant="body1"
                                                                                sx={{ fontWeight: 700, fontSize: '5px' }}
                                                                            >
                                                                                USD{" "}
                                                                                {parseFloat(totalVehicleAmount).toFixed(2)}
                                                                            </Typography>
                                                                        </Cell>
                                                                        <Cell>
                                                                            <Typography
                                                                                variant="body1"
                                                                                sx={{ fontWeight: 700, fontSize: '5px' }}
                                                                            >
                                                                                USD {parseFloat(otherCharges).toFixed(2)}
                                                                            </Typography>
                                                                        </Cell>
                                                                        <Cell>
                                                                            <Typography
                                                                                variant="body1"
                                                                                sx={{ fontWeight: 700, fontSize: '5px' }}
                                                                            >
                                                                                USD {parseFloat(totalPaid).toFixed(2)}
                                                                            </Typography>
                                                                        </Cell>
                                                                        <Cell>
                                                                            <Typography
                                                                                variant="body1"
                                                                                sx={{ fontWeight: 700, fontSize: '5px' }}
                                                                            >
                                                                                USD {parseFloat(totalBalance).toFixed(2)}
                                                                            </Typography>
                                                                        </Cell>
                                                                        <Cell></Cell>
                                                                    </Row>
                                                                    <Row>
                                                                        <Cell colSpan={visibleColumns?.length - 5}>
                                                                            <Typography
                                                                                variant="body1"
                                                                                sx={{ fontWeight: 700, fontSize: '5px' }}
                                                                            >
                                                                                Net Due Total
                                                                            </Typography>
                                                                        </Cell>


                                                                        <Cell colSpan={4}>
                                                                            <Typography
                                                                                variant="body1"
                                                                                sx={{ fontWeight: 700, fontSize: '5px' }}
                                                                            >
                                                                                USD  {parseFloat(parseFloat(TotalBalance) - parseFloat(vehicleVault?.nature === 'credit' ? isNaN((parseFloat(vehicleVault?.total_credit) - parseFloat(vehicleVault?.total_debit))) ? parseFloat(0).toFixed(2) : parseFloat((parseFloat(vehicleVault?.total_credit) - parseFloat(vehicleVault?.total_debit))).toFixed(2) : isNaN((parseFloat(vehicleVault?.total_debit) - parseFloat(vehicleVault?.total_credit))) ? parseFloat(0).toFixed(2) : parseFloat((parseFloat(vehicleVault?.total_debit) - parseFloat(vehicleVault?.total_credit))))).toFixed(2)}
                                                                            </Typography>
                                                                        </Cell>
                                                                        <Cell></Cell>
                                                                    </Row>
                                                                </Fragment>
                                                            ) : (
                                                                <Row>
                                                                    <Cell
                                                                        colSpan={tableHead.length + 1}
                                                                        align="center"
                                                                        sx={{ fontWeight: 600, fontSize: '5px' }}
                                                                    >
                                                                        No Data Found
                                                                    </Cell>
                                                                </Row>
                                                            )
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell
                                                                    colSpan={visibleColumns?.length + 2}
                                                                    align="center"
                                                                    sx={{ fontWeight: 600 }}
                                                                >
                                                                    <Box className={classes.loaderWrap}>
                                                                        <CircularProgress />
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>

                                        </Fragment>
                                    )}

                                    {loader && <CircleLoading />}
                                </Box>
                            ) : <Box > <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, textAlign: 'center', mt: 15 }}>
                                No Data Found
                            </Typography> </Box>}
                        </Grid>
                    </Box>
                </PDFExport>
            </Box>
        </>
    );
}

export default UnPaidVehicleSOAList;
