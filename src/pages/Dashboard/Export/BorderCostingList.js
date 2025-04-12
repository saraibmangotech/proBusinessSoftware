

import React, { Fragment, useState, useEffect, useRef } from "react";
import {
    Grid,
    Box,
    Typography,
    TableContainer,
    Table,
    TableHead,
    tableCellClasses,
    TableBody,
    IconButton,
    TableRow,
    TableCell,
    Paper,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import SelectField from "components/Select";
import { EyeIcon } from "assets";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import InputField from "components/Input";
import { Check, Close, Edit, Inventory, Visibility } from "@mui/icons-material";
import ClientServices from "services/Client";
import { ErrorToaster } from "components/Toaster";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import { useForm } from "react-hook-form";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import ExportServices from "services/Export";
import { Debounce, handleExportWithComponent } from "utils";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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

function BorderCostingList() {
    const navigate = useNavigate()
    const classes = useStyles();
    const contentRef = useRef(null);
    const tableHead = [
        "DATE",
        "Agent",
        "Cost (USD)",
        "Cost (AED)",
        "Action",

    ];

    // *For Client Dropdown
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    //* ForLoader
    const [loader, setLoader] = useState(false);

    // *For Filters
    const [filters, setFilters] = useState({});

    const [funds, setFunds] = useState();
    const [costings, setCostings] = useState([])

    // *For Vendor Costing
    const getBorderCostingVehicles = async (page, limit, filter) => {
        setLoader(true);
        const Filter = { ...filters, ...filter };
        try {
            let params = {
                page: 1,
                limit: 15,
            };
            params = { ...params, ...Filter };
            const { data } = await ExportServices.getBorderCostingVehicles(params);
            console.log(data);
            setCostings(data?.costings?.rows)

        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false);
        }
    };

    // *For Apply Filters
    const applyFilter = async (data) => {
        try {
            Debounce(() => getBorderCostingVehicles(1, "", data));

        } catch (error) {
            ErrorToaster(error);
        }
    };

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm();

    // *For Clients
    const getClientDropdown = async () => {
        try {
            const { data } = await ClientServices.getClientDropdown();

            setClients(data?.customers?.rows);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const downloadExcel = () => {
        const headers = tableHead.filter(item => item !== "Action");
        const rows = costings?.map((item) => [
            item?.created_at ? moment(item?.created_at).format("MM-DD-YYYY") : "N/A",
            item?.agent?.name ?? "-",
            item?.cost_usd ?? "-",
            item?.cost_aed ?? "-"
        ])

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
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
        getBorderCostingVehicles();
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
                            my: 4,
                            mr: 4,
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                color: Colors.charcoalGrey,
                                fontFamily: FontFamily.NunitoRegular,
                            }}
                        >
                            Border Costing List
                        </Typography>
                        {costings?.length > 0 && (
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
                <Grid item md={11} component={"form"} onSubmit={handleSubmit(applyFilter)}>
                    <Box
                        sx={{
                            m: "20px 0 20px 0",
                            p: "20px",
                            bgcolor: Colors.feta,
                            border: `1px solid ${Colors.iron}`,
                            borderRadius: "9px",
                        }}
                    >
                        <Grid
                            container
                            spacing={1}
                            alignItems={"center"}

                        >
                            <Grid item xs={12} md={3}>
                                <InputField
                                    size={'small'}
                                    label={'Search'}
                                    placeholder={'Search'}
                                    register={register('search', {
                                        onChange: (e) => applyFilter({ search: e.target.value })
                                    })}
                                />
                            </Grid>



                        </Grid>
                    </Box>
                </Grid>

                <Grid item md={11}>
                    <Box>
                        <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                            fileName="Border Costing List"
                        >
                            <Box className='pdf-show' sx={{ display: 'none' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                        Border Costing List
                                    </Typography>
                                    <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                                </Box>
                            </Box>
                            <TableContainer
                                component={Paper}
                                sx={{
                                    boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                    borderRadius: 2,
                                    maxWidth: "100%",
                                    height: '300px'

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
                                                    {cell}
                                                </Cell>
                                            ))}
                                        </Row>
                                    </TableHead>
                                    <TableBody>
                                        {!loader ? (
                                            costings?.length > 0 ? (
                                                <Fragment>
                                                    {costings?.map((item, index) => (
                                                        <Row
                                                            key={index}
                                                            sx={{
                                                                bgcolor: index % 2 !== 0 && "#EFF8E7",
                                                            }}
                                                        >
                                                            <Cell className="pdf-table">
                                                                {item?.created_at
                                                                    ? moment(item?.created_at).format(
                                                                        "MM-DD-YYYY"
                                                                    )
                                                                    : "N/A"}
                                                            </Cell>
                                                            <Cell className="pdf-table">
                                                                <Tooltip
                                                                    className='pdf-hide'
                                                                    title={item?.agent?.name ?? "-"}
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
                                                                        item?.agent?.name?.length > 12
                                                                            ? item?.agent?.name?.slice(0, 8) + "..."
                                                                            : item?.agent?.name
                                                                    }
                                                                </Tooltip>
                                                                <Box
                                                                    component={"div"}
                                                                    className='pdf-show'
                                                                    sx={{ display: "none !important" }}
                                                                >
                                                                    {item?.agent?.name ?? "-"}
                                                                </Box>
                                                                {/* {item?.agent?.name ?? "-"} */}
                                                            </Cell>
                                                            <Cell className="pdf-table">{item?.cost_usd ?? "-"}</Cell>


                                                            <Cell className="pdf-table">
                                                                {item?.cost_aed ?? "-"}
                                                            </Cell>
                                                            <Cell><Box component={'div'}
                                                                className="pdf-hide"
                                                                sx={{ gap: "16px !important" }}
                                                            >
                                                                {true && (
                                                                    <Box
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/border-costing-detail/${item?.border_costing_id}`,
                                                                                {
                                                                                    state: {
                                                                                        shipping: true,
                                                                                    },
                                                                                }
                                                                            )
                                                                        }
                                                                    >
                                                                        <IconButton
                                                                            sx={{
                                                                                bgcolor:
                                                                                    Colors.primary,
                                                                                "&:hover": {
                                                                                    bgcolor:
                                                                                        Colors.primary,
                                                                                },
                                                                            }}
                                                                        >
                                                                            <EyeIcon />
                                                                        </IconButton>
                                                                        <Typography variant="body2">
                                                                            View Detail
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                                <Box
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/update-border-costing/${item?.border_costing_id}`,
                                                                            {
                                                                                state: {
                                                                                    shipping: true,
                                                                                },
                                                                            }
                                                                        )
                                                                    }
                                                                >
                                                                    <IconButton
                                                                        sx={{
                                                                            bgcolor: Colors.blackShade,
                                                                            "&:hover": { bgcolor: Colors.blackShade },
                                                                        }}
                                                                    >
                                                                        <Edit
                                                                            sx={{ color: Colors.white, height: "16px !important" }}
                                                                        />
                                                                    </IconButton>
                                                                    <Typography variant="body2">Update </Typography>
                                                                </Box>
                                                            </Box></Cell>
                                                        </Row>
                                                    ))}
                                                </Fragment>
                                            ) : (
                                                <Row>
                                                    <Cell
                                                        colSpan={tableHead.length + 1}
                                                        align="center"
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        No Data Found
                                                    </Cell>
                                                </Row>
                                            )
                                        ) : (
                                            <Row>
                                                <Cell
                                                    colSpan={tableHead.length + 2}
                                                    align="center"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    <Box className={classes.loaderWrap}>
                                                        <CircularProgress />
                                                    </Box>
                                                </Cell>
                                            </Row>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </PDFExport>
                    </Box>
                </Grid>
            </Grid>
        </Fragment>
    );
}

export default BorderCostingList;
