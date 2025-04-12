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
import ExportFinanceServices from "services/ExportFinance";
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

function ExportShippingRAAging() {


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
        "VAULT BALANCE",
        "Net Shipping Balance",
        "Veh. On The Way",
        "Veh. In Galaxy Yard/Hand",
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

        // console.log(type);
        // console.log(item, 'item');


        // if (type === "ascending" && item == "NATIONALITY") {
        //     const sortedData = [...ShippingRAAging].sort((a, b) => {
        //         // Use the localeCompare method for string comparison
        //         console.log(a, b);
        //         return a.nationality_country.localeCompare(b.nationality_country);
        //     });

        //     setShippingRAAging(sortedData);
        // }


        // if (type === "descending" && item == "NATIONALITY") {
        //     const sortedData = [...ShippingRAAging].sort((a, b) => {
        //         // Use the localeCompare method for string comparison
        //         return b.nationality_country.localeCompare(a.nationality_country);
        //     });

        //     setShippingRAAging(sortedData);
        // }

        // if (type === "ascending" && item == "CUSTOMERS") {
        //     const sortedData = [...ShippingRAAging].sort((a, b) => {
        //         // Use the localeCompare method for string comparison
        //         console.log(a, b);
        //         return a.name.localeCompare(b.name);
        //     });

        //     setShippingRAAging(sortedData);
        // }

        // if (type === "descending" && item == "CUSTOMERS") {
        //     const sortedData = [...ShippingRAAging].sort((a, b) => {
        //         // Use the localeCompare method for string comparison
        //         return b.name.localeCompare(a.name);
        //     });

        //     setShippingRAAging(sortedData);
        // }



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

            setShippingRAAging(result)

        }
        else {
            setShippingRAAging(originalShipping)
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
            const { data } = await ExportFinanceServices.getShippingAging(params);
            console.log(data?.agings[0]);

            let days15Total = 0;
            let days16Total = 0;
            let days30Total = 0;


            data?.agings?.forEach((item) => {

                days15Total += parseFloat(item?.under_15);
                days16Total += parseFloat(item?.to_30);
                days30Total += parseFloat(item?.plus_30);

            });

            seTotal15Days(days15Total)
            setTotal16Days(days16Total)
            setTotal30Days(days30Total)
            setReceivableTotal(parseFloat(days15Total) + parseFloat(days16Total) + parseFloat(days30Total))
            setOriginalShipping(data?.agings)
            reset();
            setShippingRAAging(data?.agings);


        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false);
        }
    };

    const downloadExcel = () => {
        const headers1 = [
            "", "", "", "", "", "", "", "", "", "", "",
            "Vehicle On the Way", "", "Vehicle In Galaxy Yard", "",
        ];
        const headers = [
            "SL. NO",
            "CUSTOMER CODE",
            "NATIONALITY",
            "CUSTOMERS",
            "NO. Of Vehicle Shipping Unpaid",
            "Below 15 Days",
            "16-30 Days",
            "Over 30 Days",
            "TOTAL SHIPPING RECEIVABLE",
            "VAULT BALANCE",
            "Net Shipping Balance",
            "No.",
            "Value",
            "No",
            "Value"
        ];

        //[
        //     "SL. NO",
        //     "CUSTOMER CODE",
        //     "NATIONALITY",
        //     "CUSTOMERS",
        //     "NO. Of Vehicle Shipping Unpaid",
        //     "TOTAL SHIPPING RECEIVABLE",
        //     "SHIPPING VAULT BALANCE",
        //     "NET RECEIVABLE",
        //     "No.",
        //     "VALUE",
        //     "No.",
        //     "VALUE",
        //     "Ship. R/A BY VEHICLE VALUES",
        //     "# of Ship. R/A BY OTWAY",
        //     "% BY VAULT ACCOUNT BALANCE",

        // ];
        const rows = ShippingRAAging?.map((item, index) => [
            index + 1,
            item?.customer_id,
            item?.nationality ?? "-",
            item?.customer_name ?? "-",
            parseFloat(item?.total_vehicle).toFixed(2) ?? "-",
            `$ ${parseFloat(item?.under_15).toFixed(2) ?? "-"}`,
            `$ ${parseFloat(item?.to_30).toFixed(2) ?? "-"}`,
            `$ ${parseFloat(item?.plus_30).toFixed(2) ?? "-"}`,
            `$ ${parseFloat(parseFloat(item?.under_15) + parseFloat(item?.to_30) + parseFloat(item?.plus_30)).toFixed(2) ?? "-"
            }`,
            item?.vault_balance ?? "-",
            `$ ${parseFloat(parseFloat(item?.under_15) + parseFloat(item?.to_30) + parseFloat(item?.plus_30)).toFixed(2) ?? "-"} `,
            item?.otw_count ?? "-",
            `$ ${item?.otw_amount ?? "-"} `,
            item?.handed_count ?? "-",
            `$ ${item?.handed_amount ?? "-"} `,
        ])

        const totalRows = [
            "",
            "",
            "",
            "",
            "Total Due",
            `$ ${parseFloat(total15Days).toFixed(2)} `,
            `$ ${parseFloat(total16Days).toFixed(2)} `,
            `$ ${parseFloat(total30Days).toFixed(2)} `,
            `$ ${parseFloat(receivableTotal).toFixed(2)} `,
            "",
            "",
            "",
            "",
        ]


        const ws = XLSX.utils.aoa_to_sheet([headers1, headers, ...rows, totalRows]);
        ws["!merges"] = [
            // { s: { r: 0, c: 8 }, e: { r: 0, c: 9 } },
            { s: { r: 0, c: 11 }, e: { r: 0, c: 12 } },
            { s: { r: 0, c: 13 }, e: { r: 0, c: 14 } },
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const buf = XLSX.write(wb, {
            bookType: "xlsx",
            type: "array",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

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
                                ml: "5px",
                            }}
                        >
                            Export SHIPPING RA AGING
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
                                fileName="Export SHIPPING RA AGING"
                            >
                                <Box className='pdf-show' sx={{ display: 'none' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                            Shipping RA Aging
                                        </Typography>
                                        <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                                    </Box>
                                </Box>
                                <TableContainer
                                    component={Paper}
                                    sx={{
                                        boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: '100% !important', mt: 5

                                    }}
                                    className="table-box"
                                >
                                    <Table stickyHeader sx={{ minWidth: 500 }}>
                                        <TableHead>

                                            <Row>
                                                {tableHead.map((cell, index) => (
                                                    <>
                                                        <Cell className="pdf-table" colSpan={tableHead[index] == "Veh. On The Way" || tableHead[index] == "Veh. In Galaxy Yard/Hand" ? 2 : ''}
                                                            key={index}

                                                        >

                                                            {cell} {tableHead[index] == "NATIONALITY" || tableHead[index] == "CUSTOMERS" ? <> <ArrowUpwardIcon className="pdf-hide" sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "ascending", tableHead[index])} /> <ArrowDownwardIcon className="pdf-hide" sx={{ color: 'white', fontSize: '15px', cursor: 'pointer' }} onClick={(e) => sortData(e, "descending", tableHead[index])} /> </> : ''}

                                                            {tableHead[index] == "Veh. On The Way" && <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                                                                <Box>No.</Box>
                                                                <Box>Value</Box>
                                                            </Box>}
                                                            {tableHead[index] == "Veh. In Galaxy Yard/Hand" && <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
                                                                <Box>No.</Box>
                                                                <Box>Value</Box>
                                                            </Box>}
                                                        </Cell>

                                                    </>
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
                                                            {item?.customer_id}
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            {item?.nationality ?? "-"}
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            <Tooltip
                                                                className="pdf-hide"
                                                                title={item?.customer_name ?? "-"}
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
                                                                {item?.customer_name?.length > 15
                                                                    ? item?.customer_name?.slice(0, 10) +
                                                                    "..."
                                                                    : item?.customer_name}{" "}
                                                            </Tooltip>
                                                            <Box
                                                                component={"div"}
                                                                className="pdf-show"
                                                                sx={{ display: "none !important" }}
                                                            >
                                                                {item?.customer_name ?? "-"}
                                                            </Box>
                                                            {/* {item?.customer_name ?? "-"} */}
                                                        </Cell>
                                                        <Cell className="pdf-table">{CommaSeparator(parseFloat(item?.total_vehicle).toFixed(2)) ?? "-"}</Cell>
                                                        <Cell className="pdf-table" >$ {CommaSeparator(parseFloat(item?.under_15).toFixed(2)) ?? "-"}</Cell>
                                                        <Cell className="pdf-table" sx={{ backgroundColor: parseFloat(item?.to_30) > 0 ? '#f3f33a' : '' }}>$ {CommaSeparator(parseFloat(item?.to_30).toFixed(2)) ?? "-"}</Cell>
                                                        <Cell className="pdf-table" sx={{ backgroundColor: parseFloat(item?.plus_30) > 0 ? '#ee2d2d' : '' }}>
                                                            $ {CommaSeparator(parseFloat(item?.plus_30).toFixed(2)) ?? "-"}
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            <b> $ {CommaSeparator(parseFloat(parseFloat(item?.under_15) + parseFloat(item?.to_30) + parseFloat(item?.plus_30)).toFixed(2)) ?? "-"}</b>
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            <b>  {item?.vault_balance ?? "-"}</b>
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            <b> $ {CommaSeparator(parseFloat(parseFloat(item?.under_15) + parseFloat(item?.to_30) + parseFloat(item?.plus_30)).toFixed(2)) ?? "-"}</b>
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            <b> {item?.otw_count ?? "-"}</b>
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            <b> ${item?.otw_amount ?? "-"}</b>
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            <b>  {item?.handed_count ?? "-"}</b>
                                                        </Cell>
                                                        <Cell className="pdf-table">
                                                            <b> $ {item?.handed_amount ?? "-"}</b>
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

export default ExportShippingRAAging;
