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
import { useAuth } from "context/UseContext";
import ExportServices from "services/Export";
import { NumberInput } from "@mui/base/Unstable_NumberInput/NumberInput";

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
        padding: '5px !important',
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
    anchorLink: {
        textDecoration: "underline",
        color: Colors.twitter,
        cursor: "pointer",
    },
});

function ExportCosting() {
    const classes = useStyles();
    const navigate = useNavigate();
    const { user } = useAuth();

    // *For Cashier Account
    const [cashierAccounts, setCashierAccounts] = useState([]);
    const [selectedCashierAccount, setSelectedCashierAccount] = useState(null);
    const [totalVehicles, setTotalVehicles] = useState(0)
    const [manifestNum, setManifestNum] = useState()

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors },
    } = useForm();
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        getValues: getValues2,
        setValue: setValue2,
        formState: { errors: errors2 },
    } = useForm();

    const tableHead = [

        "Country",
        "Exp.date",
        "Ref No.",
        "Cost Head",
        "Per Unit Cost",
        "Quantity",
        "AED"


    ];

    const [shipping_id, setShipping_id] = useState()
    const [loading, setLoading] = useState(false);

    const [totalAed, setTotalAed] = useState(0)
    const [dummyData, setDummyData] = useState([]);

    // *For Update Vendor Costing
    const updateCosting = async (formData) => {

        const allCostings = dummyData.countries.flatMap((country) =>
            country?.costings?.map((costing) => ({ id: costing.id, per_unit: costing?.unit_cost, aed: costing?.cost_aed, country_costing_id: country?.id, country_id: country?.country_id, vehicle_qty: country?.vehicle_qty, qty: costing?.qty }))
        );

        const countryTotals = allCostings.reduce((totals, item) => {
            const { country_costing_id, aed, vehicle_qty, country_id, qty } = item;

            if (!totals[country_costing_id]) {
                totals[country_costing_id] = {
                    id: country_costing_id,
                    country_id: country_id,
                    vehicle_qty: vehicle_qty,
                    qty: qty,
                    total: 0,
                    total_usd: 0
                };
            }

            totals[country_costing_id].total += parseFloat(aed);
            totals[country_costing_id].total_usd += (parseFloat(aed) / exchangeRateUsd);

            return totals;
        }, {});

        const countryTotalsArray = Object.values(countryTotals);

        // Calculate the total of all aed values
        const total_gws_aed = allCostings.reduce((sum, costing) => parseFloat(sum) + parseFloat(costing.aed), 0);
        setTotalAed(total_gws_aed)


        let obj = {
            shipping_costing_id: shipping_id,
            ex_rate: exchangeRateUsd,
            manifest_no: manifestNum,
            total_vehicles: totalVehicles,
            type: 'country',
            cashier_account_id: selectedCashierAccount?.id,
            total_gws_aed: total_gws_aed,
            total_gws_usd: parseFloat(parseFloat(total_gws_aed) / parseFloat(exchangeRateUsd)).toFixed(2),
            costing: allCostings,
            countries: countryTotalsArray
        }
        setLoading(true);

        try {


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
                    const updatedCostings = country.costings.map((costing) => {
                        if (costing.id === costId) {
                            // Update the unit_cost for the matching costing
                            const newCostAed = getValues(`${costId}-cost`) * getValues(`${costId}-qty`);
                            return { ...costing, unit_cost: newUnitCost, cost_aed: newCostAed, qty: getValues(`${costId}-qty`) };
                        }

                        return costing;
                    });

                    // Update the costings array for the current country
                    return { ...country, costings: updatedCostings };
                }

                return country;
            });

            // Update the state with the modified countries array
            return { ...prevDummyData, countries: updatedCountries };

        });



    };
    const handleUnitQtyChange = (newUnitCost, costIndex, costId, countryId) => {
        setDummyData((prevDummyData) => {
            const updatedCountries = prevDummyData.countries.map((country) => {
                if (country.country_id === countryId) {
                    const updatedCostings = country.costings.map((costing) => {
                        if (costing.id === costId) {
                            // Update the unit_cost for the matching costing
                            const newCostAed = getValues(`${costId}-qty`) * getValues(`${costId}-cost`);
                            return { ...costing, cost_aed: newCostAed, qty: getValues(`${costId}-qty`) };
                        }

                        return costing;
                    });

                    // Update the costings array for the current country
                    return { ...country, costings: updatedCostings };
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
    const [buttonDisabled, setbuttonDisabled] = useState(false)

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

    // *For Get Payment Accounts
    const getPaymentAccounts = async () => {
        try {
            let params = {
                page: 1,
                limit: 1000
            }
            const { data } = await ExportServices.getPaymentAccounts(params)
            // *Filter only vehicle account
            const vehicleAcc = data?.cashierAccounts?.rows?.filter(e => e.unit === 'Shipping')
            // *1003 is the cashier role ID if the login user is a cashier then show only their account
            if (user?.role_id === 1004) {
                const userId = user?.ref_id.split('-')[1]
                const filterCashier = vehicleAcc.filter(e => e.user_id == userId)
                setCashierAccounts(filterCashier)
            } else {
                setCashierAccounts(vehicleAcc)
            }
        } catch (error) {
            ErrorToaster(error)
        }
    }

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
                manifest_no: getValues2('search')
            };
            params = { ...params, ...Filter };
            const {
                data
            } = await ExportFinanceServices.getExportCosting(params);
            setShipping_id(data?.costing?.id)

            setManifestNum(data?.costing?.manifest_no)
            setDummyData(data?.costing)
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
                country?.costings?.map((costing) => ({ id: costing.id, per_unit: costing?.unit_cost, aed: costing?.cost_aed, country_costing_id: country?.id, country_id: country?.country_id, vehicle_qty: country?.vehicle_qty }))
            );



            const countryTotals = allCostings?.reduce((totals, item) => {
                const { country_costing_id, aed, vehicle_qty, country_id } = item;

                if (!totals[country_costing_id]) {
                    totals[country_costing_id] = {
                        id: country_costing_id,
                        country_id: country_id,
                        vehicle_qty: vehicle_qty,
                        total: 0,
                        total_usd: 0
                    };
                }

                totals[country_costing_id].total += parseFloat(aed);
                totals[country_costing_id].total_usd += parseFloat(aed) / exchangeRateUsd;

                return totals;
            }, {});

            const countryTotalsArray = Object.values(countryTotals);


            // Calculate the total of all aed values
            const total_gws_aed = allCostings.reduce((sum, costing) => parseFloat(sum) + parseFloat(costing.aed), 0);
            setTotalAed(total_gws_aed);

        }
    }, [dummyData]);

    useEffect(() => {
        getCustomerBooking();
        getPaymentAccounts()
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
                Export Costing
            </Typography>

            {/* Filters */}
            <Box
                component={"form"}
                onSubmit={handleSubmit2(handleFilter)}

            >
                <Grid container spacing={2} alignItems={"center"} columns={10}>
                    <Grid item xs={12} sm={2.5}>
                        <InputField
                            size={'small'}

                            label={'Manifest Number'}
                            placeholder={'Manifest Number'}
                            register={register2('search')}
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
                <Box>
                    <Grid container xs={3} spacing={2} m={1} >
                        <Typography
                            variant="body1"
                            sx={{
                                color: Colors.charcoalGrey,
                                fontFamily: FontFamily.NunitoRegular,
                                mb: 4,
                                fontWeight: 'bold'
                            }}
                        >
                            Total Vehicle Quantity :
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: Colors.charcoalGrey,
                                fontFamily: FontFamily.NunitoRegular,
                                mb: 4,
                                fontWeight: 'bold'
                            }}
                        >
                            {totalVehicles ? totalVehicles : 0}
                        </Typography>
                    </Grid>
                </Box>
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
                                                            <Cell sx={{ bgcolor: "#EEFBEE", fontWeight: 'bold !important', fontSize: '17px !important' }} >{item?.country?.name + " " + `(${item?.vehicle_qty})` + " " + "Veh" ?? "-"}</Cell>

                                                        </Row>

                                                        {/* Displaying costings for the current country vertically */}
                                                        {item?.costings?.map((costing, costIndex) => (
                                                            <Row key={costIndex}>
                                                                <Cell></Cell>
                                                                <Cell>{costing.exp_date ?? "-"}</Cell>
                                                                <Cell>{costing.ref_no ?? "-"}</Cell>
                                                                <Cell>{costing.head?.name ?? "-"}</Cell>

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
                                                                <Cell>
                                                                    <InputField
                                                                        size={"small"}
                                                                        type={"number"}
                                                                        defaultValue={costing.qty}


                                                                        InputProps={{
                                                                            inputProps: {
                                                                                min: 0,
                                                                            },
                                                                        }}

                                                                        register={register(`${costing?.id}-qty`, {
                                                                            onChange: (e) => {
                                                                                if (e.target.value <= 0) {
                                                                                    setValue(`${costing?.id}-qty`, 1)
                                                                                }
                                                                                if (e.target.value > costing.qty) {
                                                                                    setValue(`${costing?.id}-qty`, item?.vehicle_qty)
                                                                                }
                                                                                handleUnitQtyChange(parseFloat(e.target.value) || 0, costIndex, costing?.id, costing?.country_id)
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
                                                                <Cell> {costing.cost_aed}</Cell>
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
                                            {parseFloat(totalAed).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                    {dummyData?.countries?.length > 0 && <>
                        <Grid container justifyContent={'space-between'}>
                            <Grid item xs={3}>
                                <SelectField
                                    size={'small'}
                                    label={'Cashier Account'}
                                    options={cashierAccounts.filter(item => item?.currency == "usd")}
                                    selected={selectedCashierAccount}
                                    onSelect={(value) => setSelectedCashierAccount(value)}
                                    error={errors?.account?.message}
                                    register={register("account", {
                                        required: 'Please select  account.',
                                    })}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <Box
                                    sx={{
                                        mt: "30px",
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <PrimaryButton

                                        loading={loading}
                                        disabled={!selectedCashierAccount || buttonDisabled}
                                        title={"Update"}
                                        onClick={updateCosting}
                                    />
                                </Box> </Grid> </Grid> </>}

                </Fragment>
            )}


            {loader && <CircleLoading />}
        </Box>
    );
}

export default ExportCosting;
