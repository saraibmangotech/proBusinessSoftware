import React, { Fragment, useState, useEffect, useRef } from "react";
import {
    Grid,
    Box,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    Checkbox,
    tableCellClasses,
    InputLabel,
    FormControl,
    FormControlLabel,
    Paper,
    Radio,
    RadioGroup,
    TableCell,
    Tooltip,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import { ErrorToaster } from "components/Toaster";
import moment from "moment";
import ClientServices from "services/Client";
import { Check, Close } from "@mui/icons-material";
import { useAuth } from "context/UseContext";
import FinanceServices from "services/Finance";
import { SuccessToaster } from "components/Toaster";
import { useNavigate } from "react-router-dom";
import CurrencyServices from "services/Currency";
import { useSelector } from "react-redux";
import Pagination from "components/Pagination";
import { CircleLoading } from "components/Loaders";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
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

function ShippingRA() {


    const [allSums, setAllSums] = useState();
    const contentRef = useRef(null);
    // *For Client Dropdown
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [ShippingRA, setShippingRA] = useState([]);

    const [originalShipping, setOriginalShipping] = useState([])


    // *For Filters
    const [filters, setFilters] = useState({});


    // *For Currencies
    const [currencyExchangeRate, setCurrencyExchangeRate] = useState();

    const [balances, setBalances] = useState({});

    const classes = useStyles();

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm();

    const {
        register: register2,
        handleSubmit: handleSubmit2,
        setValue,
        getValues: getValues2,
        formState: { errors: errors2 },
        reset,
    } = useForm();

    const tableHead = [
        "SL. NO",
        "CUSTOMER CODE",
        "NATIONALITY",
        "CUSTOMERS",
        "NO. Of Vehicle Shipping Unpaid",
        "TOTAL SHIPPING RECEIVABLE",
        "SHIPPING VAULT BALANCE",
        "NET RECEIVABLE",
        "No.",
        "VALUE",
        "No.",
        "VALUE",
        "Ship. R/A BY VEHICLE VALUES",
        "# of Ship. R/A BY OTWAY",
        "% BY VAULT ACCOUNT BALANCE",

    ];

    // *For Clients
    const getClientDropdown = async () => {
        try {
            const { data } = await ClientServices.getClientDropdown();
            setClients(data?.customers?.rows);
        } catch (error) {
            ErrorToaster(error);
        }
    };
    const sortData = (e, type, item) => {
        e.preventDefault();



        if (type === "ascending" && item == "NATIONALITY") {
            const sortedData = [...ShippingRA].sort((a, b) => {
                // Use the localeCompare method for string comparison

                return a.nationality.localeCompare(b.nationality);
            });

            setShippingRA(sortedData);
        }


        if (type === "descending" && item == "NATIONALITY") {
            const sortedData = [...ShippingRA].sort((a, b) => {
                // Use the localeCompare method for string comparison
                return b.nationality.localeCompare(a.nationality);
            });

            setShippingRA(sortedData);
        }

        if (type === "ascending" && item == "CUSTOMERS") {
            const sortedData = [...ShippingRA].sort((a, b) => {
                // Use the localeCompare method for string comparison

                return a.name.localeCompare(b.name);
            });

            setShippingRA(sortedData);
        }

        if (type === "descending" && item == "CUSTOMERS") {
            const sortedData = [...ShippingRA].sort((a, b) => {
                // Use the localeCompare method for string comparison
                return b.name.localeCompare(a.name);
            });

            setShippingRA(sortedData);
        }








    };



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


    // *For Client Costing
    const getShippingRA = async (page, limit, filter) => {
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

            };
            params = { ...params, ...Filter };
            const { data } = await FinanceServices.getShippingReceiving(params);

            setShippingRA(data?.detail?.rows);
            setOriginalShipping(data?.detail?.rows)
            setTotalCount(data?.detail?.count);

        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false);
        }
    };

    // *For Handle Filter
    const handleFilter = (value) => {


        if (value) {
            const result = originalShipping.filter(item => {
                const idMatches = item?.id && item.id.toString().includes(value);
                const nameMatches = item?.name && item.name.toLowerCase().includes(value.toLowerCase());
                const nationalityMatches = item?.nationality && item.nationality.toLowerCase().includes(value.toLowerCase());


                return nameMatches || idMatches || nationalityMatches;
            });

            setShippingRA(result)

        }
        else {
            setShippingRA(originalShipping)
        }

    }

    const downloadExcel = () => {
        // Define headers and data separately
        const headers1 = [
            "", "", "", "", "", "", "", "",
            "Vehicle On the Way", "", "Vehicle In Galaxy Yard", "", "Client Fisibility", "", ""
        ];
        const headers = tableHead;
        const data = ShippingRA;

        // Extract values from objects and create an array for each row
        const rows = data.map((item, index) => [
            index + 1,
            item?.ref_id,
            item?.nationality ?? "-",
            item.name,
            parseFloat(item?.unpaidBooking).toFixed(2) ?? "-",
            parseFloat(item?.totalReceivable).toFixed(2) ?? "-",
            parseFloat(item?.shippingVault).toFixed(2) ?? "-",
            parseFloat(item?.netReceivable).toFixed(2) ?? "-",
            parseFloat(item?.otw).toFixed(2) ?? "-",
            parseFloat(item?.otwValue).toFixed(2) ?? "-",
            parseFloat(item?.yard).toFixed(2) ?? "-",
            parseFloat(item?.yardValue).toFixed(2) ?? "-",
            item?.netReceivable == 0 ? parseFloat(0).toFixed(2) : parseFloat((parseFloat(item?.otwValue) + parseFloat(item?.yardValue)) / parseFloat(item?.netReceivable)).toFixed(2) ?? "-",
            item?.unpaidBooking == 0 ? parseFloat(0).toFixed(2) : parseFloat((parseFloat(item?.otw) + parseFloat(item?.yard)) / parseFloat(item?.unpaidBooking)).toFixed(2) ?? "-",
            item?.netReceivable == 0 ? parseFloat(0).toFixed(2) : parseFloat((parseFloat(item?.shippingVault).toFixed(2) / parseFloat(item?.totalReceivable).toFixed(2)) * 100).toFixed(2) ?? "-"
        ]);

        // Create a workbook with a worksheet
        const ws = XLSX.utils.aoa_to_sheet([headers1, headers, ...rows]);

        // Merge cells for colspan effect
        ws["!merges"] = [
            { s: { r: 0, c: 8 }, e: { r: 0, c: 9 } },
            { s: { r: 0, c: 10 }, e: { r: 0, c: 11 } },
            { s: { r: 0, c: 12 }, e: { r: 0, c: 14 } },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Convert the workbook to an array buffer
        const buf = XLSX.write(wb, {
            bookType: "xlsx",
            type: "array",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Save the file using FileSaver.js
        saveAs(new Blob([buf]), "data.xlsx");
    };



    useEffect(() => {
        getClientDropdown();
        getCurrencies()
        getShippingRA()
    }, []);

    return (
        <Fragment>
            <Grid container spacing={1} alignItems={"center"} justifyContent={"center"}>
                <Grid item xs={12} sm={12} md={11}>
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
                            variant="h4"
                            sx={{
                                color: Colors.charcoalGrey,
                                fontFamily: FontFamily.NunitoRegular,
                                ml: "5px",
                            }}
                        >
                            SHIPPING RA
                        </Typography>
                        {ShippingRA?.length > 0 && (
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
                </Grid>


                <Grid item xs={12} md={12} sm={3} >
                    <Grid container sx={{ pl: '50px !important' }}>

                        <Grid item xs={12} md={3} sm={3} >
                            <InputField
                                size={'small'}
                                label={'Search'}
                                placeholder={'Search'}
                                register={register('search', {
                                    onChange: (e) => handleFilter(e.target.value)
                                })}
                            />
                        </Grid>

                    </Grid>

                </Grid>



                <Grid item md={11}>
                    <Box>
                        {ShippingRA ? (
                            <Fragment>
                                <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                                    fileName="SHIPPING RA"
                                >
                                    <Box className='pdf-show' sx={{ display: 'none' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                                SHIPPING RA
                                            </Typography>
                                            <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                                        </Box>
                                    </Box>
                                    <TableContainer
                                        component={Paper}
                                        sx={{
                                            boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: '300px'

                                        }}
                                        className="table-box"
                                    >
                                        <Table stickyHeader sx={{ minWidth: 500 }}>
                                            <TableHead>
                                                <Row>

                                                    <Cell className="pdf-table" sx={{ backgroundColor: 'white !important' }} colSpan={8}


                                                    >

                                                    </Cell>
                                                    <Cell className="pdf-table" sx={{ borderTopLeftRadius: '10px !important', borderTopRightRadius: '10px !important', borderLeft: '1px solid white !important' }} colSpan={2}


                                                    >
                                                        <b>  Vehicle On the Way</b>
                                                    </Cell>
                                                    <Cell className="pdf-table" sx={{ borderTopLeftRadius: '10px !important', borderTopRightRadius: '10px !important', borderLeft: '1px solid white !important' }} colSpan={2}


                                                    >
                                                        <b>  Vehicle In Galaxy Yard</b>
                                                    </Cell>
                                                    <Cell className="pdf-table" sx={{ borderTopLeftRadius: '10px !important', borderTopRightRadius: '10px !important', borderLeft: '1px solid white !important' }} colSpan={3}


                                                    >
                                                        <b>  CLIENT FISIBILITY </b>
                                                    </Cell>

                                                </Row>
                                                <Row >
                                                    {tableHead.map((cell, index) => (
                                                        <Cell className="pdf-table"
                                                            key={index}

                                                        >
                                                            {cell} {tableHead[index] == "NATIONALITY" || tableHead[index] == "CUSTOMERS" ? <> <span className="pdf-hide">  <ArrowUpwardIcon sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "ascending", tableHead[index])} /> </span>  <span className="pdf-hide"><ArrowDownwardIcon sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "descending", tableHead[index])} /> </span> </> : ''}
                                                        </Cell>
                                                    ))}
                                                </Row>
                                            </TableHead>
                                            <TableBody>
                                                {ShippingRA.map((item, index) => {

                                                    return (
                                                        <Row
                                                            key={index}
                                                            sx={{
                                                                bgcolor: index % 2 !== 0 && "#EFF8E7",
                                                            }}
                                                        >

                                                            <Cell className="pdf-table">
                                                                {index + 1}
                                                            </Cell>
                                                            <Cell className="pdf-table">
                                                                {item?.ref_id}
                                                            </Cell>
                                                            <Cell className="pdf-table">
                                                                {item?.nationality ?? "-"}
                                                            </Cell>
                                                            <Cell className="pdf-table">
                                                                <Tooltip
                                                                    className="pdf-hide"
                                                                    title={item.name}
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
                                                                >{item.name?.length > 12 ? item.name?.slice(0, 12) + "..." : item.name}
                                                                </Tooltip>
                                                                <Box
                                                                    component={"div"}
                                                                    className="pdf-show"
                                                                    sx={{ display: "none !important" }}
                                                                >
                                                                    {item.name}
                                                                </Box>
                                                            </Cell>
                                                            <Cell className="pdf-table">{CommaSeparator(parseFloat(item?.unpaidBooking).toFixed(2)) ?? "-"}</Cell>
                                                            <Cell className="pdf-table">$ {CommaSeparator(parseFloat(item?.totalReceivable).toFixed(2)) ?? "-"}</Cell>
                                                            <Cell className="pdf-table">$ {CommaSeparator(parseFloat(item?.shippingVault).toFixed(2)) ?? "-"}</Cell>
                                                            <Cell className="pdf-table">
                                                                $ {CommaSeparator(parseFloat(item?.netReceivable).toFixed(2)) ?? "-"}
                                                            </Cell>
                                                            <Cell className="pdf-table">{CommaSeparator(parseFloat(item?.otw).toFixed(2)) ?? "-"}</Cell>
                                                            <Cell className="pdf-table">$ {CommaSeparator(parseFloat(item?.otwValue).toFixed(2)) ?? "-"}</Cell>
                                                            <Cell className="pdf-table">{CommaSeparator(parseFloat(item?.yard).toFixed(2)) ?? "-"}</Cell>
                                                            <Cell className="pdf-table">$ {CommaSeparator(parseFloat(item?.yardValue).toFixed(2)) ?? "-"}</Cell>

                                                            <Cell className="pdf-table"> {item?.netReceivable == 0 ? parseFloat(0).toFixed(2) : CommaSeparator(parseFloat((parseFloat(item?.otwValue) + parseFloat(item?.yardValue)) / parseFloat(item?.netReceivable)).toFixed(2)) ?? "-"}</Cell>
                                                            <Cell className="pdf-table">{item?.unpaidBooking == 0 ? parseFloat(0).toFixed(2) : CommaSeparator(parseFloat((parseFloat(item?.otw) + parseFloat(item?.yard)) / parseFloat(item?.unpaidBooking)).toFixed(2)) ?? "-"}</Cell>
                                                            <Cell className="pdf-table">{item?.netReceivable == 0 ? parseFloat(0).toFixed(2) : CommaSeparator(parseFloat((parseFloat(item?.shippingVault).toFixed(2) / parseFloat(item?.totalReceivable).toFixed(2)) * 100).toFixed(2)) ?? "-"} %</Cell>


                                                        </Row>
                                                    );
                                                })}

                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </PDFExport>
                                {/* ========== Pagination ========== */}
                                {/* <Pagination
                                    currentPage={currentPage}
                                    pageSize={pageLimit}
                                    onPageSizeChange={(size) => getShippingRA(1, size.target.value)}
                                    tableCount={ShippingRA?.length}
                                    totalCount={totalCount}
                                    onPageChange={(page) => getShippingRA(page, "")}
                                /> */}
                            </Fragment>
                        ) : (
                            <CircleLoading />
                        )}
                    </Box>
                </Grid>

            </Grid>
        </Fragment>
    );
}

export default ShippingRA;
