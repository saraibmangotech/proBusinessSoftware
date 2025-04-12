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
    Radio,
    RadioGroup,
    TableCell,
    Paper,
    Tooltip
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

function ShippingRAAging() {

    const contentRef = useRef(null);
    const [allSums, setAllSums] = useState();

    // *For Client Dropdown
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [ShippingRAAging, setShippingRAAging] = useState([]);

    // For Totals
    const [total15Days, seTotal15Days] = useState()
    const [total16Days, setTotal16Days] = useState()
    const [total30Days, setTotal30Days] = useState()
    const [receivableTotal, setReceivableTotal] = useState()


    // *For Filters
    const [filters, setFilters] = useState({});


    const [originalShipping, setOriginalShipping] = useState([])


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
        "Below 15 Days",
        "16-30 Days",
        "Over 30 Days",
        "TOTAL SHIPPING RECEIVABLE",
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

        console.log(type);
        console.log(item, 'item');


        if (type === "ascending" && item == "NATIONALITY") {
            const sortedData = [...ShippingRAAging].sort((a, b) => {
                // Use the localeCompare method for string comparison
                console.log(a, b);
                return a.nationality_country.localeCompare(b.nationality_country);
            });

            setShippingRAAging(sortedData);
        }


        if (type === "descending" && item == "NATIONALITY") {
            const sortedData = [...ShippingRAAging].sort((a, b) => {
                // Use the localeCompare method for string comparison
                return b.nationality_country.localeCompare(a.nationality_country);
            });

            setShippingRAAging(sortedData);
        }

        if (type === "ascending" && item == "CUSTOMERS") {
            const sortedData = [...ShippingRAAging].sort((a, b) => {
                // Use the localeCompare method for string comparison
                console.log(a, b);
                return a.name.localeCompare(b.name);
            });

            setShippingRAAging(sortedData);
        }

        if (type === "descending" && item == "CUSTOMERS") {
            const sortedData = [...ShippingRAAging].sort((a, b) => {
                // Use the localeCompare method for string comparison
                return b.name.localeCompare(a.name);
            });

            setShippingRAAging(sortedData);
        }



    };

    // *For Handle Filter
    const handleFilter = (value) => {


        if (value) {
            const result = originalShipping.filter(item => {
                const idMatches = item?.id && item.id.toString().includes(value);
                const nameMatches = item?.name && item.name.toLowerCase().includes(value.toLowerCase());
                const nationalityMatches = item?.nationality_country && item.nationality_country.toLowerCase().includes(value.toLowerCase());


                return nameMatches || idMatches || nationalityMatches;
            });
            let days15Total = 0;
            let days16Total = 0;
            let days30Total = 0;


            result?.forEach((item) => {

                days15Total += parseFloat(item?.sum_15);
                days16Total += parseFloat(item?.sum_16_30);
                days30Total += parseFloat(item?.sum_30);

            });

            seTotal15Days(days15Total)
            setTotal16Days(days16Total)
            setTotal30Days(days30Total)
            setReceivableTotal(parseFloat(days15Total) + parseFloat(days16Total) + parseFloat(days30Total))
            setShippingRAAging(result)

        }
        else {
            setShippingRAAging(originalShipping)
            let days15Total = 0;
            let days16Total = 0;
            let days30Total = 0;


            originalShipping?.forEach((item) => {

                days15Total += parseFloat(item?.sum_15);
                days16Total += parseFloat(item?.sum_16_30);
                days30Total += parseFloat(item?.sum_30);

            });

            seTotal15Days(days15Total)
            setTotal16Days(days16Total)
            setTotal30Days(days30Total)
            setReceivableTotal(parseFloat(days15Total) + parseFloat(days16Total) + parseFloat(days30Total))
        }

    }



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
                limit: 50,

            };
            params = { ...params, ...Filter };
            const { data } = await FinanceServices.getShippingAging(params);
            console.log(data?.detail[0]);

            let days15Total = 0;
            let days16Total = 0;
            let days30Total = 0;


            data?.detail?.forEach((item) => {

                days15Total += parseFloat(item?.sum_15);
                days16Total += parseFloat(item?.sum_16_30);
                days30Total += parseFloat(item?.sum_30);

            });

            seTotal15Days(days15Total)
            setTotal16Days(days16Total)
            setTotal30Days(days30Total)
            setReceivableTotal(parseFloat(days15Total) + parseFloat(days16Total) + parseFloat(days30Total))
            setOriginalShipping(data?.detail)
            reset();
            setShippingRAAging(data?.detail);


        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false);
        }
    };

    const downloadExcel = () => {
        // Define headers and data separately
        const headers = tableHead;
        const data = ShippingRAAging;

        // Extract values from objects and create an array for each row
        const rows = data.map((item, index) => [
            index + 1,
            item?.ref_id,
            item?.nationality_country ?? "-",
            item?.name ?? "-",
            parseFloat(item?.total_count).toFixed(2) ?? "-",
            `$ ${parseFloat(item?.sum_15).toFixed(2) ?? "-"}`,
            `$ ${parseFloat(item?.sum_16_30).toFixed(2) ?? "-"}`,
            `$ ${parseFloat(item?.sum_30).toFixed(2) ?? "-"}`,
            `$ ${parseFloat(parseFloat(item?.sum_15) + parseFloat(item?.sum_16_30) + parseFloat(item?.sum_30)).toFixed(2) ?? "-"}`,
        ]);

        const totalRows = [
            "",
            "",
            "",
            "",
            "Total",
            `$ ${parseFloat(total15Days).toFixed(2)}`,
            `$ ${parseFloat(total16Days).toFixed(2)}`,
            `$ ${parseFloat(total30Days).toFixed(2)}`,
            `$ ${parseFloat(receivableTotal).toFixed(2)}`,
        ]

        // Create a workbook with a worksheet
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRows]);

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
                                mt: 4,
                                ml: "5px",
                            }}
                        >
                            SHIPPING RA AGING
                        </Typography>
                        {ShippingRAAging?.length > 0 && (
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
                        {ShippingRAAging.length > 0 &&
                            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                                fileName="SHIPPING RA AGING"
                            >
                                <Box className='pdf-show' sx={{ display: 'none' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                            SHIPPING RA AGING
                                        </Typography>
                                        <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                                    </Box>
                                </Box>
                                <TableContainer
                                    component={Paper}
                                    sx={{
                                        boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)', mt: 5

                                    }}
                                    className="table-box"
                                >
                                    <Table stickyHeader sx={{ minWidth: 500 }}>
                                        <TableHead>

                                            <Row>
                                                {tableHead.map((cell, index) => (
                                                    <Cell className="pdf-table"
                                                        key={index}

                                                    >
                                                        {cell} {tableHead[index] == "NATIONALITY" || tableHead[index] == "CUSTOMERS" ? <> <span className="pdf-hide"> <ArrowUpwardIcon sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "ascending", tableHead[index])} /> </span> <span className="pdf-hide"><ArrowDownwardIcon sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "descending", tableHead[index])} /></span> </> : ''}
                                                    </Cell>
                                                ))}
                                            </Row>
                                        </TableHead>
                                        <TableBody>
                                            {ShippingRAAging.map((item, index) => {

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
                                                            {item?.nationality_country ?? "-"}
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            <Tooltip
                                                                className='pdf-hide'
                                                                title={item?.name ?? "-"}
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
                                                                {
                                                                    item?.name?.length > 12
                                                                        ? item?.name?.slice(0, 8) + "..."
                                                                        : item?.name
                                                                }
                                                            </Tooltip>
                                                            <Box
                                                                component={"div"}
                                                                className='pdf-show'
                                                                sx={{ display: "none !important" }}
                                                            >
                                                                {item?.name ?? "-"}
                                                            </Box>
                                                            {/* {item?.name ?? "-"} */}
                                                        </Cell>
                                                        <Cell className="pdf-table">{CommaSeparator(parseFloat(item?.total_count).toFixed(2)) ?? "-"}</Cell>
                                                        <Cell className="pdf-table">$ {CommaSeparator(parseFloat(item?.sum_15).toFixed(2)) ?? "-"}</Cell>
                                                        <Cell className="pdf-table" sx={{ backgroundColor: parseFloat(item?.sum_16_30) > 0 ? '#f3f33a' : '' }}>$ {CommaSeparator(parseFloat(item?.sum_16_30).toFixed(2)) ?? "-"}</Cell>
                                                        <Cell className="pdf-table" sx={{ backgroundColor: parseFloat(item?.sum_30) > 0 ? '#ee2d2d' : '' }}>
                                                            $ {CommaSeparator(parseFloat(item?.sum_30).toFixed(2)) ?? "-"}
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            <b> $ {CommaSeparator(parseFloat(parseFloat(item?.sum_15) + parseFloat(item?.sum_16_30) + parseFloat(item?.sum_30)).toFixed(2)) ?? "-"}</b>
                                                        </Cell>



                                                    </Row>

                                                );
                                            })}
                                            <Row >

                                                <Cell colSpan={5} >

                                                    <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700 }}>
                                                        Total Due
                                                    </Typography>

                                                </Cell>
                                                <Cell  >

                                                    <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700 }}>
                                                        $  {CommaSeparator(parseFloat(total15Days).toFixed(2))}
                                                    </Typography>

                                                </Cell>
                                                <Cell  >

                                                    <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700 }}>
                                                        $   {CommaSeparator(parseFloat(total16Days).toFixed(2))}
                                                    </Typography>

                                                </Cell>
                                                <Cell  >

                                                    <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700 }}>
                                                        $ {CommaSeparator(parseFloat(total30Days).toFixed(2))}
                                                    </Typography>

                                                </Cell>
                                                <Cell  >

                                                    <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700 }}>
                                                        $ {CommaSeparator(parseFloat(receivableTotal).toFixed(2))}
                                                    </Typography>

                                                </Cell>


                                            </Row>
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                            </PDFExport>
                        }
                    </Box>
                </Grid>

            </Grid>
        </Fragment>
    );
}

export default ShippingRAAging;
