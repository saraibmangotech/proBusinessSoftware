import React, { Fragment, useEffect, useState } from "react";
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
    CircularProgress,
    Grid,
} from "@mui/material";
import styled from "@emotion/styled";
import { FontFamily, Images } from "assets";
import Colors from "assets/Style/Colors";
import { CircleLoading } from "components/Loaders";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { makeStyles } from "@mui/styles";
import Pagination from "components/Pagination";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Debounce } from "utils";
import SelectField from "components/Select";
import { useDispatch } from "react-redux";
import CustomerServices from "services/Customer";
import { PrimaryButton } from "components/Buttons";
import FinanceServices from "services/Finance";
import SystemServices from "services/System";
import InputField from "components/Input";
import ExportFinanceServices from "services/ExportFinance";

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
    anchorLink: {
        textDecoration: "underline",
        color: Colors.twitter,
        cursor: "pointer",
    },
});

function AgentCosting() {
    const classes = useStyles();
    const navigate = useNavigate();
    const [manifestNum, setManifestNum] = useState()

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm();

    const tableHead = [

        "Country",
        "Exp.date",
        "Ref No.",
        "Cost Head",
        "Per Unit Cost",
        "Quantity",
        "USD"


    ];

    const [shipping_id, setShipping_id] = useState()
    const [loading, setLoading] = useState(false);
    const [totalVehicles, setTotalVehicles] = useState(0)

    const [totalAed, setTotalAed] = useState(0)
    const [dummyData, setDummyData] = useState([]);
    const [buttonDisabled, setbuttonDisabled] = useState(false)
    // *For Update Vendor Costing
    const updateCosting = async (formData) => {

        const allCostings = dummyData.countries.flatMap((country) =>
            country?.agent_costings?.map((costing) => ({ id: costing.id, per_unit: costing?.unit_cost, aed: parseFloat(costing?.cost_usd) * exchangeRateUsd, cost_usd: costing?.cost_usd, country_costing_id: country?.id, country_id: country?.country_id, vehicle_qty: country?.vehicle_qty, agent_id: costing?.agent_id }))
        );

        const countryTotals = allCostings.reduce((totals, item) => {
            const { country_costing_id, aed, cost_usd, vehicle_qty, country_id, agent_id } = item;

            if (!totals[country_costing_id]) {
                totals[country_costing_id] = {
                    id: country_costing_id,
                    agent_id: agent_id,
                    country_id: country_id,
                    vehicle_qty: vehicle_qty,
                    total_agent_aed: 0,
                    total_agent_usd: 0
                };
            }


            totals[country_costing_id].total_agent_aed += parseFloat(aed);
            totals[country_costing_id].total_agent_usd += parseFloat(aed) / exchangeRateUsd;

            return totals;
        }, {});

        const countryTotalsArray = Object.values(countryTotals);

        // Calculate the total of all aed values
        const total_gws_aed = allCostings.reduce((sum, costing) => parseFloat(sum) + parseFloat(costing.cost_usd), 0);
        console.log(total_gws_aed, 'total_gws_aedtotal_gws_aed');
        setTotalAed(total_gws_aed)


        let obj = {
            shipping_costing_id: shipping_id,
            total_vehicles: totalVehicles,
            manifest_no: manifestNum,
            type: 'agent',
            ex_rate: exchangeRateUsd,
            total_agent_aed: parseFloat(parseFloat(total_gws_aed) * parseFloat(exchangeRateUsd)).toFixed(2),
            total_agent_usd: total_gws_aed,
            agents: allCostings,
            countries: countryTotalsArray
        }
        setLoading(true);

        try {
            console.log(obj, 'obj');

            const { message } = await ExportFinanceServices.updateCosting(obj);
            SuccessToaster(message);
            setbuttonDisabled(true)

        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoading(false);
        }
    };


    const handleUnitCostChange = (newUnitCost, costIndex, costId, countryId) => {

        setDummyData((prevDummyData) => {
            const updatedCountries = prevDummyData.countries.map((country) => {
                if (country.country_id === countryId) {
                    const updatedCostings = country?.agent_costings?.map((costing) => {

                        if (costing.id === costId) {
                            // Update the unit_cost for the matching costing
                            const newCostAed = newUnitCost * costing.qty;
                            return { ...costing, unit_cost: newUnitCost, cost_usd: newCostAed };
                        }

                        return costing;
                    });
                    console.log(updatedCostings, 'updatedCostings');
                    // Update the costings array for the current country
                    return { ...country, agent_costings: updatedCostings };
                }

                return country;
            });

            // Update the state with the modified countries array
            return { ...prevDummyData, countries: updatedCountries };

        });



    };
    const [loader, setLoader] = useState(false);

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    const [exchangeRateUsd, setExchangeRateUsd] = useState();

    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Customer Booking
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // *For Vault Dashboard
    const [vaultDashboard, setVaultDashboard] = useState();



    // *For Get Customer Booking
    const getCustomerBooking = async (search) => {
        try {
            let params = {
                name: search ?? "",
            };
            const { data } = await CustomerServices.getCustomerBooking(params);
            setCustomers(data?.customers);
        } catch (error) {
            ErrorToaster(error);
        }
    };


    // *For Get Currencies
    const getCurrencies = async () => {
        try {
            let params = {
                detailed: true,
            };
            const { data } = await SystemServices.getCurrencies(params);


            setExchangeRateUsd(
                parseFloat(
                    data?.currencies.find((e) => e.currency === "usd")?.conversion_rate
                )
            );
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Get Vault Dashboard
    const getVaultDashboard = async (page, limit, filter) => {
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
                limit: Limit,
                manifest_no: getValues('search')
            };
            params = { ...params, ...Filter };
            const {
                data
            } = await ExportFinanceServices.getExportCosting(params);
            setDummyData(data?.costing)
            setShipping_id(data?.costing?.id)
            setManifestNum(data?.costing?.manifest_no)
            setTotalVehicles(data?.costing?.total_vehicles)
            setbuttonDisabled(false)


        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false);
        }
    };

    // *For Handle Filter
    const handleFilter = () => {

        Debounce(() =>
            getVaultDashboard(1, "", { customer_id: selectedCustomer?.id })
        );
    };
    useEffect(() => {

        if (dummyData?.countries?.length > 0) {
            const allCostings = dummyData?.countries?.flatMap((country) =>

                country?.agent_costings?.map((costing) => ({ id: costing.id, per_unit: costing?.unit_cost, aed: parseFloat(costing?.cost_usd) * exchangeRateUsd, cost_usd: costing?.cost_usd, country_costing_id: country?.id, country_id: country?.country_id, vehicle_qty: country?.vehicle_qty, agent_id: costing?.agent_id }))
            );



            const countryTotals = allCostings?.reduce((totals, item) => {
                const { country_costing_id, aed, vehicle_qty, country_id, agent_id } = item;

                if (!totals[country_costing_id]) {
                    totals[country_costing_id] = {
                        id: country_costing_id,
                        agent_id: agent_id,
                        country_id: country_id,
                        vehicle_qty: vehicle_qty,
                        total_agent_aed: 0,
                        total_agent_usd: 0
                    };
                }


                totals[country_costing_id].total_agent_aed += parseFloat(aed);
                totals[country_costing_id].total_agent_usd += parseFloat(aed) / exchangeRateUsd;

                return totals;
            }, {});

            const countryTotalsArray = Object.values(countryTotals);


            // Calculate the total of all aed values
            const total_gws_aed = allCostings.reduce((sum, costing) => parseFloat(sum) + parseFloat(costing.cost_usd), 0);
            console.log(total_gws_aed, 'total_gws_aedtotal_gws_aed');
            setTotalAed(total_gws_aed);

        }
    }, [dummyData]);

    useEffect(() => {
        getCustomerBooking();

        getCurrencies();
    }, []);

    return (
        <Box sx={{ m: 4, mb: 2 }}>
            <Typography
                variant="h5"
                sx={{
                    color: Colors.charcoalGrey,
                    fontFamily: FontFamily.NunitoRegular,
                    mb: 4,
                }}
            >
                Agent Costing
            </Typography>

            {/* Filters */}
            <Box
                component={"form"}
                onSubmit={handleSubmit(handleFilter)}

            >
                <Grid container spacing={2} alignItems={"center"} columns={10}>
                    <Grid item xs={12} sm={2.5}>
                        <InputField
                            size={'small'}

                            label={'Manifest Number'}
                            placeholder={'Manifest Number'}
                            register={register('search')}
                        />
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ height: "55px" }}>
                        <Box
                            sx={{
                                mt: "5px",
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
            </Box>

            {dummyData && (
                <Fragment>
                    {/* ========== Table ========== */}
                    <TableContainer
                        component={Paper}
                        sx={{
                            boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                            borderRadius: 2,
                            maxHeight: "calc(100vh - 330px)",
                        }}
                    >
                        <Table stickyHeader sx={{ minWidth: 500 }}>
                            <TableHead>
                                <TableRow>
                                    {tableHead.map((item, index) => (
                                        <Cell key={index}>{item}</Cell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {!loader ? (
                                    dummyData?.countries?.length > 0 ? (
                                        <Fragment>
                                            {dummyData?.countries?.map((item, index) => {

                                                const numCostingsRows = item?.costings?.length || 1;

                                                return (
                                                    <Fragment key={index}>
                                                        <Row >
                                                            <Cell sx={{ bgcolor: "#EEFBEE", fontWeight: 'bold !important', fontSize: '17px !important' }} >{item?.country?.name ?? "-"}</Cell>

                                                        </Row>

                                                        {/* Displaying costings for the current country vertically */}
                                                        {item?.agent_costings?.map((costing, costIndex) => (
                                                            <Row key={costIndex}>
                                                                <Cell></Cell>
                                                                <Cell>{costing.exp_date ?? "-"}</Cell>
                                                                <Cell>{costing.ref_no ?? "-"}</Cell>
                                                                <Cell>{costing.agent?.name ?? "-"}</Cell>

                                                                <Cell sx={{ padding: '0 !important', m: "0 !important", ml: '23% !importantt' }}>

                                                                    <InputField
                                                                        size={"small"}
                                                                        type={"number"}
                                                                        defaultValue={costing?.unit_cost}


                                                                        InputProps={{
                                                                            inputProps: {
                                                                                min: 0,
                                                                            },
                                                                        }}

                                                                        register={register(`${costing?.id}-cost`, {
                                                                            onChange: (e) => {
                                                                                handleUnitCostChange(parseFloat(e.target.value) || 0, costIndex, costing?.id, costing?.country_id)
                                                                            },

                                                                        })}
                                                                        inputStyle={{
                                                                            width: "100px",
                                                                            ml: "23%",
                                                                            height: '0px',
                                                                            mb: "18%"



                                                                        }}
                                                                    />

                                                                </Cell>
                                                                <Cell>{costing.qty ?? "-"}</Cell>
                                                                <Cell> {costing.cost_usd}</Cell>
                                                            </Row>
                                                        ))}
                                                    </Fragment>
                                                );
                                            })}
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
                    <Box sx={{ py: 1, bgcolor: Colors.whiteSmoke }}>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={3}></Grid>
                            <Grid item xs={12} sm={3}></Grid>
                            <Grid item xs={12} sm={3}>
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
                                        sx={{
                                            fontWeight: 700,
                                            fontFamily: FontFamily.NunitoRegular,
                                        }}
                                    >
                                        Total Aed
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
                                        <Typography
                                            variant="body2"
                                            sx={{ color: Colors.smokeyGrey }}
                                        >
                                            {parseFloat(parseFloat(totalAed) * exchangeRateUsd).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={3}>
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
                                        sx={{
                                            fontWeight: 700,
                                            fontFamily: FontFamily.NunitoRegular,
                                        }}
                                    >
                                        Total Usd
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
                                        <Typography
                                            variant="body2"
                                            sx={{ color: Colors.smokeyGrey }}
                                        >
                                            {parseFloat(totalAed).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                    {dummyData?.countries?.length > 0 && <Box
                        sx={{
                            mt: "11px",
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                    >
                        <PrimaryButton
                            loading={loading}
                            title={"Update"}
                            disabled={buttonDisabled}
                            onClick={updateCosting}
                        />
                    </Box>}

                </Fragment>
            )}

            {loader && <CircleLoading />}
        </Box>
    );
}

export default AgentCosting;
