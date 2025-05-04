import React, { Fragment, useEffect, useRef, useState } from "react";
import {
    Grid,
    Box,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    tableCellClasses,
    CircularProgress,
    Drawer,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ListItemText,
    Checkbox,
    Tooltip,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { CheckIcon, FontFamily, PendingIcon } from "assets";
import VendorServices from "services/Vendor";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import { CircleLoading } from "components/Loaders";
import Pagination from "components/Pagination";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import moment from "moment/moment";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import InputField from "components/Input";
import CurrencyServices from "services/Currency";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CommaSeparator, handleExportWithComponent } from "utils";
import { PDFExport } from "@progress/kendo-react-pdf";

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
        backgroundColor: Colors.primary,
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

function VendorPayableList() {
    const classes = useStyles();
    const navigate = useNavigate();
    const { state } = useLocation();
    const contentRef = useRef(null);

    console.log(state, "state");

    const tableHead = [

        "Purchase Date",
        "Model",
        "Make",
        "LOT#",
        "VIN#",
        "Color",
        "Loading Location",
        "Container#",
        "Arrived Date",
        "Total Amount",
        "Paid Amount",
        "Balance",
    ];

    const [selectedClientBooking, setSelectedClientBooking] = useState([]);
    // *For Currencies
    const [currencyExchangeRate, setCurrencyExchangeRate] = useState();
    // *For Select and DeSelect client
    const handleSelectClientBooking = (fcyammount, id) => {
        try {
            handleCalc(fcyammount, id);
            const shallowCopy = [...selectedClientBooking];
            const currentIndex = selectedClientBooking.indexOf(id);
            if (currentIndex === -1) {
                shallowCopy.push(id);
            } else {
                shallowCopy.splice(currentIndex, 1);
            }
            setSelectedClientBooking(shallowCopy);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm();
    const { register: register2, setValue: setValue2, getValues } = useForm();

    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);

    // *For Vendor Costing
    const [vendorCosting, setVendorCosting] = useState();
    const [totalAmount, setTotalAmount] = useState();
    const [calcAmount, setCalcAmount] = useState({});
    const [totalApplied, setTotalApplied] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);

    // *For Vendor Dropdown
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);


    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    // *For Filters
    const [filters, setFilters] = useState({});

    const [fcyammount, setFcyammount] = useState(0);

    // *For Set Vendor FCY Amount
    const [vendorFcyAmount, setVendorFcyAmount] = useState();

    const [visibleColumns, setVisibleColumns] = useState([
        ...Array(tableHead?.length).keys(),
    ]);

    // *For Tooltip
    const [copied, setCopied] = useState(false);

    const copyContent = (text) => {
        const contentToCopy = text;
        navigator.clipboard.writeText(contentToCopy);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 300);
    }

    // *For Get Currencies
    const getCurrencies = async (currency) => {
        try {
            let params = {
                detailed: true,
            };
            const { data } = await CurrencyServices.getCurrencies(params);

            setCurrencyExchangeRate(data.currencies[2].conversion_rate);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Vendor
    const getVendorDropdown = async () => {
        try {
            const { data } = await VendorServices.getVendorDropdown();
            setVendors(data?.vendors);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Vendor Costing
    const getVendorCosting = async (page, limit, filter) => {
        setLoader(true);
        try {
            const Page = page ? page : currentPage;
            const Limit = limit ? limit : pageLimit;
            const Filter = { ...filters, ...filter };
            setCurrentPage(Page);
            setPageLimit(Limit);
            setFilters(Filter);
            let params = {
                page: Page,
                limit: 100,
                payable: true,
            };
            params = { ...params, ...Filter };
            const { data } = await VendorServices.getVendorCosting(params);
            setTotalCount(data?.costings?.count);
            setVendorCosting(data?.costings?.rows);
            const calcTotal = [];
            let totalBal = 0;
            let shipping_charges = 0,
                towing_charges = 0,
                clearance_charges = 0,
                late_fee = 0,
                storage = 0,
                category_a = 0,
                broker_fee = 0,
                title_fee = 0,
                inspection = 0,
                other_charges = 0,
                custom_duty = 0,
                total = 0;
            data?.costings?.rows.forEach((e) => {
                shipping_charges += parseFloat(e?.shipping_charges);
                towing_charges += parseFloat(e?.towing_charges);
                clearance_charges += parseFloat(e?.clearance_charges);
                late_fee += parseFloat(e?.late_fee);
                storage += parseFloat(e?.storage);
                category_a += parseFloat(e?.category_a);
                broker_fee += parseFloat(e?.broker_fee);
                title_fee += parseFloat(e?.title_fee);
                inspection += parseFloat(e?.inspection);
                other_charges += parseFloat(e?.other_charges);
                custom_duty += parseFloat(e?.custom_duty);
                total +=
                    selectedVendor?.type === "shipping"
                        ? parseFloat(e?.shipping_vendor_total)
                        : selectedVendor?.type === "towing"
                            ? parseFloat(e?.towing_vendor_total)
                            : parseFloat(e?.clearance_vendor_total);

                const totalT =
                    selectedVendor?.type === "shipping"
                        ? e?.shipping_vendor_total
                        : selectedVendor?.type === "towing"
                            ? e?.towing_vendor_total
                            : e?.clearance_vendor_total;
                const paidAmount =
                    selectedVendor?.type === "shipping"
                        ? e?.shipping_vendor_paid
                        : selectedVendor?.type === "towing"
                            ? e?.towing_vendor_paid
                            : e?.clearance_vendor_paid;
                const balance = parseFloat(totalT) - parseFloat(paidAmount);
                totalBal += balance;
                let obj = {
                    id: e?.id,
                    applied: 0,
                    balance: balance,
                    paidAmount: paidAmount,
                    total: totalT,
                };
                calcTotal.push(obj);
            });
            let obj = {
                shipping_charges: shipping_charges,
                towing_charges: towing_charges,
                clearance_charges: clearance_charges,
                late_fee: late_fee,
                storage: storage,
                category_a: category_a,
                broker_fee: broker_fee,
                title_fee: title_fee,
                inspection: inspection,
                other_charges: other_charges,
                custom_duty: custom_duty,
                total: total,
            };
            setTotalAmount(obj);
            setCalcAmount(calcTotal);
            console.log(totalBal, 'totalBaltotalBaltotalBaltotalBal');
            setTotalBalance(totalBal);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false);
        }
    };

    // *For Apply Filters
    const applyFilter = async () => {
        try {
            let data = {
                vendor_id: selectedVendor?.id,
                country_id: selectedVendor.country_id,
                type: selectedVendor.type,
            };
            getVendorCosting(1, "", data);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Handle Calculate
    const handleCalc = (val, id) => {
        try {
            const value = val ? val : 0;
            const shallowCopy = [...calcAmount];
            const index = calcAmount.findIndex((e) => e.id === id);
            const balance =
                parseFloat(shallowCopy[index].total) -
                parseFloat(shallowCopy[index].paidAmount);
            const fcyRemainingAmount =
                parseFloat(vendorFcyAmount) + parseFloat(shallowCopy[index].applied);
            if (parseFloat(balance) > parseFloat(fcyRemainingAmount)) {
                if (parseFloat(value) > parseFloat(fcyRemainingAmount)) {
                    setValue2(`applied-${id}`, parseFloat(fcyRemainingAmount));
                    shallowCopy[index].applied = parseFloat(fcyRemainingAmount);
                    shallowCopy[index].balance =
                        parseFloat(balance) - parseFloat(fcyRemainingAmount);
                } else {
                    setValue2(`applied-${id}`, value);
                    shallowCopy[index].applied = parseFloat(value);
                    shallowCopy[index].balance = parseFloat(balance) - parseFloat(value);
                }
            } else {
                if (parseFloat(value) > parseFloat(balance)) {
                    setValue2(`applied-${id}`, balance);
                    shallowCopy[index].applied = parseFloat(balance);
                    shallowCopy[index].balance = parseFloat(0);
                } else {
                    setValue2(`applied-${id}`, value);
                    shallowCopy[index].applied = parseFloat(value);
                    shallowCopy[index].balance = parseFloat(balance) - parseFloat(value);
                }
            }
            let leftFcyAmount = selectedVendor?.currency == 'aed' ? selectedVendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.fcy_amount / currencyExchangeRate : selectedVendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.fcy_amount
                ? parseFloat(selectedVendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.fcy_amount) - parseFloat(state?.paid_amount)
                : parseFloat(state?.vendor_amount) + parseFloat(state?.damage_gws);
            shallowCopy.forEach((e) => {
                leftFcyAmount -= parseFloat(e?.applied);
            });
            console.log(leftFcyAmount, 'leftFcyAmountleftFcyAmountleftFcyAmount');
            setVendorFcyAmount(leftFcyAmount);
            console.log(shallowCopy, 'shallowCopyshallowCopy');
            setCalcAmount(shallowCopy);
            let totalApp = 0;
            let totalBal = 0;
            shallowCopy.forEach((e) => {
                totalApp += parseFloat(e?.applied);
                totalBal += parseFloat(e?.balance);
            });
            setTotalApplied(totalApp);
            setTotalBalance(totalBal);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Apply Fund
    const applyFund = async () => {
        setLoading(true);
        try {
            const details = [];
            calcAmount.forEach((e) => {
                if (e?.applied > 0) {
                    let applyObj = {
                        costing_id: e?.id,
                        applied_amount: e?.applied,
                    };
                    details.push(applyObj);
                }
            });
            let sum = 0;
            if (state?.vendor_amount) {
                sum = parseFloat(state?.vendor_amount) + parseFloat(state?.damage_gws);
            }
            let obj = {
                vendor_id: selectedVendor?.id,
                tt_id: state?.client_amount ? null : state?.id,
                damage_id: state?.client_amount ? state?.id : null,
                external_ref_no: state?.external_no,
                paid_amount: selectedVendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.fcy_amount
                    ? selectedVendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.fcy_amount
                    : parseFloat(sum).toFixed(2),
                currency: "usd",
                details: details,
            };
            const { message } = await VendorServices.applyFund(obj);
            SuccessToaster(message);
            navigate("/vendor-funds-approval");
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoading(false);
        }
    };

    const renderCellContent = (
        colIndex,
        item,
        total,
        paidAmount,
        balance

    ) => {
        switch (colIndex) {

            case 0:
                return item?.booking?.purchase_date
                    ? moment(item?.booking?.purchase_date).format("DD-MMM-YYYY")
                    : "-";
            case 1:
                return (
                    <Box>
                        <Tooltip
                            className="pdf-hide"
                            title={item?.booking?.veh_model?.name ?? "-"}
                            arrow
                            placement="top"
                            slotProps={{
                                popper: {
                                    modifiers: [
                                        {
                                            name: "offset",
                                            options: {
                                                offset: [10, -2],
                                            },
                                        },
                                    ],
                                },
                            }}
                        >
                            {item?.booking?.veh_model?.name?.length > 12
                                ? item?.booking?.veh_model?.name?.slice(0, 12) + "..."
                                : item?.booking?.veh_model?.name
                            }
                        </Tooltip>
                        <Box
                            component={"div"}
                            className="pdf-show"
                            sx={{ display: "none !important" }}
                        >
                            {item?.booking?.veh_model?.name ?? '-'}
                        </Box>
                    </Box>
                )
            // item?.booking?.veh_model?.name ?? "-";
            case 2:
                return (
                    <Box>
                        <Tooltip
                            className="pdf-hide"
                            title={item?.booking?.veh_make?.name ?? "-"}
                            arrow
                            placement="top"
                            slotProps={{
                                popper: {
                                    modifiers: [
                                        {
                                            name: "offset",
                                            options: {
                                                offset: [10, -2],
                                            },
                                        },
                                    ],
                                },
                            }}
                        >
                            {item?.booking?.veh_make?.name?.length > 12
                                ? item?.booking?.veh_make?.name?.slice(0, 12) + "..."
                                : item?.booking?.veh_make?.name
                            }
                        </Tooltip>
                        <Box
                            component={"div"}
                            className="pdf-show"
                            sx={{ display: "none !important" }}
                        >
                            {item?.booking?.veh_make?.name ?? '-'}
                        </Box>
                    </Box>
                )
            // item?.booking?.veh_make?.name ?? "-";
            case 3:
                return (
                    <Box>
                        <Tooltip
                            className="pdf-hide"
                            title={copied ? "copied" : item?.booking?.vin ?? "-"}
                            arrow
                            placement="top"
                            slotProps={{
                                popper: {
                                    modifiers: [
                                        {
                                            name: "offset",
                                            options: {
                                                offset: [10, -2],
                                            },
                                        },
                                    ],
                                },
                            }}
                            onClick={() => copyContent(item?.booking?.vin)}
                        >
                            {item?.booking?.vin?.length > 12
                                ? item?.booking?.vin?.slice(0, 12) + "..."
                                : item?.booking?.vin
                            }
                        </Tooltip>
                        <Box
                            component={"div"}
                            className="pdf-show"
                            sx={{ display: "none !important" }}
                        >
                            {item?.booking?.vin ?? '-'}
                        </Box>
                    </Box>
                )
            // item?.booking?.vin ?? "-";
            case 4:
                return (
                    <Box>
                        <Tooltip
                            className="pdf-hide"
                            title={copied ? "copied" : item?.booking?.lot_number ?? "-"}
                            arrow
                            placement="top"
                            slotProps={{
                                popper: {
                                    modifiers: [
                                        {
                                            name: "offset",
                                            options: {
                                                offset: [10, -2],
                                            },
                                        },
                                    ],
                                },
                            }}
                            onClick={() => copyContent(item?.booking?.lot_number)}
                        >
                            {item?.booking?.lot_number?.length > 12
                                ? item?.booking?.lot_number?.slice(0, 12) + "..."
                                : item?.booking?.lot_number
                            }
                        </Tooltip>
                        <Box
                            component={"div"}
                            className="pdf-show"
                            sx={{ display: "none !important" }}
                        >
                            {item?.booking?.lot_number ?? '-'}
                        </Box>
                    </Box>
                )
            // item?.booking?.lot_number ?? "-";
            case 5:
                return item?.booking?.color ?? "-";

            case 6:
                return item?.shipping?.loading_port?.name ?? "-";
            case 7:
                return item?.shipping?.container_no ?? "-";
            case 8:
                return item?.vehicle?.arrived_galaxy_date
                    ? moment(item?.vehicle?.arrived_galaxy_date).format("DD-MMM-YYYY")
                    : "-";

            case 9:
                return CommaSeparator(total);

            case 10:
                return CommaSeparator(paidAmount);
            case 11:
                return CommaSeparator(balance);

            default:
                return "-";
        }
    };

    const handleColumnChange = (event) => {
        const selectedColumns = event.target.value;
        // Sort the selected columns to maintain the correct order
        const sortedColumns = selectedColumns.sort((a, b) => a - b);
        setVisibleColumns(sortedColumns);
    };
    useEffect(() => {
        getCurrencies()
        if (state) {
            let data = {
                vendor_id: selectedVendor?.id,
                type: selectedVendor?.type,
            };
            setValue("vendor", selectedVendor?.name);
            getVendorCosting(1, "", data);
            let sum = 0;
            if (state?.vendor_amount) {
                sum = parseFloat(state?.vendor_amount) + parseFloat(state?.damage_gws);
                console.log(sum, 'sumsumsumsum');
                setVendorFcyAmount(sum);
            } else {
                console.log(parseFloat(state?.fcy_amount), ' state?.fcy_amount /currencyExchangeRate');
                setVendorFcyAmount(selectedVendor?.currency == 'aed' ? state?.fcy_amount / currencyExchangeRate : state?.fcy_amount);
            }
        }
        getVendorDropdown()
    }, []);

    const downloadExcel = () => {
        // Define headers and data separately
        const headers = tableHead.filter((item) => item !== "Action");
        const data = vendorCosting;
        let TotalVaultBalanceXL = 0;
        let TotalVaultBalance2XL = 0;
        let TotalVaultBalance3XL = 0;
        let TotalVaultBalance4XL = 0;

        // Extract values from objects and create an array for each row
        const rows = data.map((item, index) => {
            const total =
                selectedVendor?.type === "shipping"
                    ? item?.shipping_vendor_total
                    : selectedVendor?.type === "towing"
                        ? item?.towing_vendor_total
                        : item?.clearance_vendor_total;

            const paidAmount =
                selectedVendor?.type === "shipping"
                    ? item?.shipping_vendor_paid
                    : selectedVendor?.type === "towing"
                        ? item?.towing_vendor_paid
                        : item?.clearance_vendor_paid;

            const balance = parseFloat(total) - parseFloat(paidAmount);

            const status =
                balance === 0
                    ? "Paid"
                    : parseFloat(balance) === parseFloat(total)
                        ? "UnPaid"
                        : "Partial Paid";
            return [
                item?.booking?.purchase_date ? moment(item?.booking?.purchase_date).format("DD-MMM-YYYY") : "-",
                item?.booking?.veh_model?.name ?? "-",
                item?.booking?.veh_make?.name ?? "-",
                item?.booking?.vin ?? "-",
                item?.booking?.lot_number ?? "-",
                item?.booking?.color ?? "-",
                item?.shipping?.loading_port?.name ?? "-",
                item?.shipping?.container_no ?? "-",
                item?.vehicle?.arrived_galaxy_date ? moment(item?.vehicle?.arrived_galaxy_date).format("DD-MMM-YYYY") : "-",
                total,
                paidAmount,
                balance
            ]
        });

        // Create a workbook with a worksheet
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
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

    return (
        <Box sx={{ m: 4, mb: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mr: 4,
                    my: 4,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        color: Colors.charcoalGrey,
                        fontFamily: FontFamily.NunitoRegular,
                    }}
                >
                    Vendor Payable Due Report
                </Typography>
                {vendorCosting?.length > 0 && (
                    <Box sx={{
                        textAlign: "right", p: 4, display: "flex", gap: 2

                    }}>
                        <PrimaryButton
                            title="Download PDF"
                            type="button"
                            style={{ backgroundColor: Colors.bluishCyan }}
                            onClick={() => handleExportWithComponent(contentRef)}
                        />
                        <PrimaryButton
                            title={"Download Excel"}
                            onClick={() => downloadExcel()}
                        />
                    </Box>
                )}
            </Box>

            <Box
                component={"form"}
                onSubmit={handleSubmit(applyFilter)}
                sx={{
                    m: "20px 0 20px 5px",
                    p: "20px",
                    bgcolor: Colors.feta,
                    border: `1px solid ${Colors.iron}`,
                    borderRadius: "9px",
                }}
            >
                <Grid container spacing={1} alignItems={"center"} columns={10}>
                    <Grid item md={2}>
                        <SelectField
                            size="small"
                            label={"Vendor"}
                            options={vendors}
                            selected={selectedVendor}
                            onSelect={(value) => setSelectedVendor(value)}
                            error={errors?.vendor?.message}
                            register={register("vendor", {
                                required: "Please select vendor.",
                            })}
                        />
                    </Grid>
                    <Grid item md={2}>
                        <InputField
                            size={"small"}
                            label={"Vin"}
                            placeholder={"Vin"}
                            error={errors?.vin?.message}
                            register={register("vin")}
                        />
                    </Grid>
                    <Grid item md={2}>
                        <InputField
                            size={"small"}
                            label={"Lot"}
                            placeholder={"Lot"}
                            register={register("lot")}
                        />
                    </Grid>
                    <Grid item md={2}>
                        <InputField
                            size={"small"}
                            label={"Container"}
                            placeholder={"Container"}
                            register={register("container")}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Box
                            sx={{
                                mt: "11px",
                                display: "flex",
                                justifyContent: "flex-end",
                            }}
                        >
                            <PrimaryButton title={"Search"} type={"submit"} />
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <Grid item md={11}>
                {vendorCosting?.length > 0 && (
                    <Box>
                        <Grid container mb={2}>
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
                                            if (column !== "Applied Amount") {
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
                        </Grid>

                        {loader ? (
                            <CircularProgress />
                        ) : (
                            vendorCosting?.length > 0 && (
                                <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                                    fileName="Vendor Payable Due Report"
                                >
                                    <Box className='pdf-show' sx={{ display: 'none' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                                Vendor Payable Due Report
                                            </Typography>
                                            <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('DD/MM/YYYY')}</Box>
                                        </Box>
                                    </Box>
                                    <TableContainer
                                        component={Paper}
                                        sx={{
                                            boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                            borderRadius: 2,
                                            maxHeight: "400px",
                                        }}
                                        className="table-box"
                                    >
                                        <Table stickyHeader sx={{ minWidth: 500 }}>
                                            {/* Table Header */}
                                            <TableHead>
                                                <TableRow>
                                                    {visibleColumns.map((index) => (
                                                        <Cell className="pdf-table" key={index}>{tableHead[index]}</Cell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>

                                            {/* Table Body */}
                                            <TableBody>
                                                {!loader ? (
                                                    vendorCosting?.length > 0 ? (
                                                        <Fragment>
                                                            {vendorCosting.map((item, rowIndex) => {
                                                                const total =
                                                                    selectedVendor?.type === "shipping"
                                                                        ? item?.shipping_vendor_total
                                                                        : selectedVendor?.type === "towing"
                                                                            ? item?.towing_vendor_total
                                                                            : item?.clearance_vendor_total;

                                                                const paidAmount =
                                                                    selectedVendor?.type === "shipping"
                                                                        ? item?.shipping_vendor_paid
                                                                        : selectedVendor?.type === "towing"
                                                                            ? item?.towing_vendor_paid
                                                                            : item?.clearance_vendor_paid;

                                                                const balance = parseFloat(total) - parseFloat(paidAmount);

                                                                const status =
                                                                    balance === 0
                                                                        ? "Paid"
                                                                        : parseFloat(balance) === parseFloat(total)
                                                                            ? "UnPaid"
                                                                            : "Partial Paid";


                                                                // Use fcyammount in your application logic as needed
                                                                console.log("Payment amount for the current row:", fcyammount);



                                                                return (
                                                                    <Row
                                                                        key={rowIndex}
                                                                        sx={{
                                                                            bgcolor: rowIndex % 2 !== 0 && "#EFF8E7",
                                                                        }}
                                                                    >
                                                                        {visibleColumns.map((colIndex) => (
                                                                            <Cell className="pdf-table" key={colIndex}>
                                                                                {renderCellContent(
                                                                                    colIndex,
                                                                                    item,
                                                                                    total,
                                                                                    paidAmount,
                                                                                    balance

                                                                                )}
                                                                            </Cell>
                                                                        ))}
                                                                    </Row>
                                                                );
                                                            })}
                                                        </Fragment>
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={visibleColumns?.length + 1}
                                                                align="center"
                                                                sx={{ fontWeight: 600 }}
                                                            >
                                                                No Data Found
                                                            </TableCell>
                                                        </TableRow>
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
                                </PDFExport>
                            )
                        )}


                    </Box>
                )}
                <Box sx={{ my: 4, py: 2, bgcolor: Colors.whiteSmoke }}>
                    <Grid container spacing={1} columns={10} justifyContent={"flex-end"}>




                        <Grid item xs={12} sm={2}>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: FontFamily.NunitoRegular }}
                                >
                                    Balance
                                </Typography>
                                <Box
                                    sx={{
                                        textAlign: "center",
                                        p: 1,
                                        width: "130px",
                                        bgcolor: Colors.flashWhite,
                                        border: "1px solid #B2B5BA",
                                        borderRadius: "4px",
                                    }}
                                >
                                    <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                                        {CommaSeparator(parseFloat(totalBalance).toFixed(2))}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>


            </Grid>
        </Box>
    );
}

export default VendorPayableList;
