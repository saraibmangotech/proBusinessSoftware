import React from "react";
import {
    Grid,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    tableCellClasses,
    IconButton,
    CircularProgress,
    InputLabel,
    Paper,
    Chip,
    InputAdornment,
} from "@mui/material";
import RowRadioButtonsGroup from "components/Input/RadioGroup";
import Pagination from "components/Pagination";
import { Delete, Edit } from "@mui/icons-material";
import Colors from "assets/Style/Colors";
import DatePicker from "components/DatePicker";
import SelectField from "components/Select";
import { makeStyles } from "@mui/styles";
import { FontFamily } from "assets";
import { PrimaryButton } from "components/Buttons";
import { useState, Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import styled from "@emotion/styled";
import { CircleLoading } from "components/Loaders";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import InputField from "components/Input";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import ExportServices from "services/Export";
import { getYearMonthDateFormate, numberRegex } from "utils";
import moment from "moment";
import CurrencyServices from "services/Currency";
import ExchangeRate from "../Finance/ExchangeRate";

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

function ContainerCosting() {
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm();

    const tableHead = [
        "Container Number",
        "Customer Name",
        "Pickup from",
        "UAE Location",
        "Origin Country",
        "Final Destination",
        "Price (AED)",
        "Container Size ",
        "BOL Number",
        "BOL Create Date",
        "Status Date ",
        "Status ",
        "Agent Name",
    ];

    const [loader, setLoader] = useState(false);

    // *For Dialog Box
    const [confirmationDialog, setConfirmationDialog] = useState(false);

    // *For Pagination
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Options
    const [containerOptions, setContainerOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);

    const [errorMsg, setErrorMsg] = useState(false)

    //*For Selected Option
    const [selectedContainer, setSelectedContainer] = useState("");
    const [ContainerId, setContainerId] = useState();
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [purchaseDate, setPurchaseDate] = useState();
    const [date, setDate] = useState();

    // *For Currencies
    const [currencyExchangeRate, setCurrencyExchangeRate] = useState(3.675);

    //*For Date
    const [containerDate, setContainerDate] = useState();

    // *For Permissions
    const [permissions, setPermissions] = useState();

    // *ForContainers Date
    const [ContainersData, setContainersData] = useState();

    const [loading, setLoading] = useState(false);

    const classes = useStyles();

    // const navigate = useNavigate();

    //*Date Change Functions
    const handleDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == "Invalid Date") {
                setDate("invalid");
                return;
            }
            setDate(new Date(newDate));
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const handleContainerDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == "Invalid Date") {
                setContainerDate("invalid");
                return;
            }
            setContainerDate(new Date(newDate));
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Export Vehicles
    const getExportContainers = async (page, limit, filter) => {
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
            };
            params = { ...params, ...Filter };
            console.log(params);
            const { data } = await ExportServices.getExportContainersDetails(params);

            setContainersData(data?.container);
            const tableData = data?.container
            setValue('containerNumber', tableData?.container_number)
            setValue('customer', tableData?.customer?.name)
            setValue('destination', tableData?.destination?.name)
            setValue('receivingDate', moment(tableData?.created_at).format('MM-DD-YYYY'))
            console.log(tableData?.pickup_from);
            setValue('departure', tableData?.pickup_from)
            setValue('DepartureDate', moment(tableData?.status_date).format('MM-DD-YYYY'))
            setContainerId(data?.container.id);
            setValue('con_freight_aed', tableData?.costing ? parseFloat(tableData?.costing?.con_freight_aed).toFixed(2) : parseFloat(0).toFixed(2))
            setValue('con_freight_usd', tableData?.costing ? parseFloat(tableData?.costing?.con_freight_usd).toFixed(2) : parseFloat(0).toFixed(2))
            setValue('con_loading_aed', tableData?.costing ? parseFloat(tableData?.costing?.con_loading_aed).toFixed(2) : parseFloat(0).toFixed(2))
            setValue('con_loading_usd', tableData?.costing ? parseFloat(tableData?.costing?.con_loading_usd).toFixed(2) : parseFloat(0).toFixed(2))
            setValue('total_cost_aed', tableData?.costing ? parseFloat(tableData?.costing?.total_cost_aed).toFixed(2) : parseFloat(0).toFixed(2))
            setValue('total_cost_usd', tableData?.costing ? parseFloat(tableData?.costing?.total_cost_usd).toFixed(2) : parseFloat(0).toFixed(2))
            console.log(parseFloat(parseFloat(tableData?.price) * currencyExchangeRate).toFixed(2));
            setValue('sale_price_aed', tableData ? parseFloat(parseFloat(tableData?.price) * currencyExchangeRate).toFixed(2) : parseFloat(0).toFixed(2))
            setValue('sale_price_usd', tableData ? parseFloat(tableData?.price).toFixed(2) : parseFloat(0).toFixed(2))
            let ProfitAed = tableData?.costing ? parseFloat(tableData?.costing?.profit_aed).toFixed(2) : parseFloat(0).toFixed(2)
            let ProfitUsd = tableData?.costing ? parseFloat(tableData?.costing?.profit_usd).toFixed(2) : parseFloat(0).toFixed(2)

            setValue('profit_aed', ProfitAed)
            setValue('profit_usd', ProfitUsd)
            if (ProfitAed < 0 || ProfitUsd < 0) {
                setErrorMsg(true)
            }
            else {
                setErrorMsg(false)
            }
        } catch (error) {
            ErrorToaster(error);
        }
    };

    //For Container Options
    const getExportContainerOptions = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 1000,
            };

            const { data } = await ExportServices.getExportContainers(params);

            const result = data.containers.rows.map((item) => ({
                id: item.id,
                name: item.container_number,
            }));
            setContainerOptions(result);



        } catch (error) {
            ErrorToaster(error);
        }
    };
    ///For Status Options
    const handleCalc = () => {
        console.log(getValues('con_freight_aed'));
        console.log(getValues('con_loading_aed'));
        console.log(getValues('con_loading_aed'));
        let TotalCostAed = parseFloat(getValues('con_freight_aed')) + parseFloat(getValues('con_loading_aed'))
        setValue('total_cost_aed', TotalCostAed)
        setValue('total_cost_usd', parseFloat(TotalCostAed / currencyExchangeRate).toFixed(2))
        console.log(getValues('sale_price_aed'), 'sadsaddsa');
        console.log(TotalCostAed, 'TotalCostAedm');
        let ProfitAed = parseFloat(getValues('sale_price_aed') - TotalCostAed).toFixed(2)
        let ProfitUsd = parseFloat((getValues('sale_price_usd') - parseFloat(TotalCostAed / currencyExchangeRate))).toFixed(2)

        setValue('profit_aed', ProfitAed)
        setValue('profit_usd', ProfitUsd)
        if (ProfitAed < 0 || ProfitUsd < 0) {
            setErrorMsg(true)
        }
        else {
            setErrorMsg(false)
        }
        setValue('profit_aed', ProfitAed)

        setValue('profit_usd', ProfitUsd)
    }
    ///For Status Options
    const getStatus = async () => {
        try {
            const { data } = await ExportServices.getStatus();
            setStatusOptions(data?.statuses);
        } catch (error) {
            ErrorToaster(error);
        }
    };
    // *For Get Currencies
    const getCurrencies = async (currency) => {
        try {
            let params = {
                detailed: true
            }
            const { data } = await CurrencyServices.getCurrencies(params)
            const rate = data?.currencies.find(e => e.currency === 'usd')?.conversion_rate
            console.log(rate);
            setCurrencyExchangeRate(rate)
        } catch (error) {
            ErrorToaster(error)
        }
    }
    //*Update  Container
    const UpdateContainer = async (formData) => {

        setLoading(true);

        try {
            let obj = {

                container_id: ContainerId,
                container_number: ContainersData?.container_number,
                country_id: ContainersData?.country_id,
                agent_id: ContainersData?.agent_id,
                con_freight_aed: getValues('con_freight_aed'),
                con_freight_usd: getValues('con_freight_usd'),
                con_loading_aed: getValues('con_loading_aed'),
                con_loading_usd: getValues('con_loading_usd'),
                total_cost_aed: getValues('total_cost_aed'),
                total_cost_usd: getValues('total_cost_usd'),
                sale_price_aed: getValues('sale_price_aed'),
                sale_price_usd: getValues('sale_price_usd'),
                profit_aed: getValues('profit_aed'),
                profit_usd: getValues('profit_usd'),
                ex_rate: currencyExchangeRate

            };
            console.log(obj);
            const { message } = await ExportServices.UpdateContainerCosting(obj);
            SuccessToaster(message);
            window.location.reload()
            handleFilter({ container_id: selectedContainer.id });
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoading(false);
        }
    };

    // *For Handle Filter
    const handleFilter = (data) => {
        getExportContainers(1, "", data);
    };

    useEffect(() => {
        getStatus();
        getCurrencies()
        getExportContainerOptions();
    }, []);

    return (
        <Box component={"form"} onSubmit={handleSubmit(UpdateContainer)}>
            <Box sx={{ width: '50%' }}>
                <Grid
                    container
                    sx={{

                        borderRadius: "5px",

                        p: 0,
                        pb: 1,
                        m: 4,
                        mb: 0
                    }}
                    display={"flex"}


                >
                    <Typography
                        variant="h5"
                        sx={{
                            color: Colors.charcoalGrey,
                            fontFamily: FontFamily.NunitoRegular,

                            textAlign: "left",

                        }}
                    >
                        Update Container Costing
                    </Typography>
                </Grid>
            </Box>
            <Grid
                container
                sx={{

                    borderRadius: "5px",

                    m: 4,
                    pb: 1,
                    mt: 0,
                    mb: 0

                }}
                xs={10}
            >
                <Grid sm={11} md={3} justifyContent={"center"} item>
                    {" "}
                    <SelectField
                        size={"small"}
                        label={"Container"}
                        options={containerOptions}
                        selected={selectedContainer}
                        onSelect={(value) => {
                            setSelectedContainer(value);
                            handleFilter({ container_id: value?.id });
                        }}
                        error={errors?.Container?.message}
                        register={register("Container", {
                            required: "Please select container.",
                        })}
                    />
                </Grid>
            </Grid>
            <Box sx={{ m: 4, mb: 0, mt: 0 }}>
                {/* ========== Confirmation Dialog ========== */}
                <ConfirmationDialog
                    open={confirmationDialog}
                    onClose={() => setConfirmationDialog(false)}
                    message={"Are you sure you want to delete this?"}
                // action={() => deleteBuyerId()}
                />
                <Grid container spacing={1}>
                    <Grid item sm={12} md={3}>
                        <InputField
                            disabled={true}
                            size={"small"}
                            placeholder={"Cont. Receiving Date"}
                            label={"Cont. Receiving Date"}
                            register={register("receivingDate")}
                        />
                    </Grid>
                    <Grid item sm={12} md={3}>
                        <InputField
                            disabled={true}
                            size={"small"}
                            placeholder={"Container Number"}
                            label={"Container Number"}

                            register={register("containerNumber")}
                        />
                    </Grid>
                    <Grid item sm={12} md={3}>
                        <InputField
                            disabled={true}
                            size={"small"}
                            placeholder={"Customer"}
                            label={"Customer"}
                            register={register("customer")}
                        />
                    </Grid>
                    <Grid item sm={12} md={3}>
                        <InputField
                            disabled={true}
                            size={"small"}
                            placeholder={"Departure Location"}

                            label={"Departure Location"}

                            register={register("departure")}
                        />
                    </Grid>
                    <Grid item sm={12} md={3}>
                        <InputField
                            disabled={true}
                            size={"small"}
                            placeholder={"Departure Date"}

                            label={"Departure Date"}

                            register={register("DepartureDate")}
                        />
                    </Grid>
                    <Grid item sm={12} md={3}>
                        <InputField
                            disabled={true}
                            size={"small"}
                            placeholder={"Destination "}
                            label={"Destination"}
                            register={register("destination")}
                        />
                    </Grid>
                    {/* <Grid item sm={12} md={3}>
                        <InputField
                            disabled={true}
                            size={"small"}
                            placeholder={"Dest. Arrival Date"}
                            type={"number"}
                            label={"Dest. Arrival Date"}

                            register={register("DestArrival")}
                        />
                    </Grid> */}
                </Grid>

            </Box>
            {true && <>
                <Box
                    sx={{
                        m: 4,
                        p: 2,
                        bgcolor: Colors.white,
                        borderRadius: 3,
                        boxShadow: "0px 8px 18px 0px #9B9B9B1A",

                    }}
                >
                    <Grid container spacing={5}>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ p: 1, width: '200px' }}>

                                </Box>
                                <Box sx={{ display: 'flex' }}>
                                    <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.feta, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                                        <Typography variant="body2">AED </Typography>
                                    </Box>

                                    <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.aliceBlue, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                                        <Typography variant="body2">USD</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ p: 1, width: '200px' }}>
                                    <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>Container Freight</Typography>
                                </Box>
                                <Box sx={{ display: 'flex' }}>
                                    <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.feta, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                                        <InputField

                                            size={"small"}
                                            defaultValue={ContainersData?.costing ? parseFloat(ContainersData?.costing?.con_freight_aed).toFixed(2) : parseFloat(0).toFixed(2)}
                                            type={"number"}

                                            style={{ m: 0 }}

                                            register={register("con_freight_aed", {
                                                pattern: numberRegex,
                                                onChange: (e) => {
                                                    handleCalc()
                                                    setValue('con_freight_usd', parseFloat(e.target.value / currencyExchangeRate).toFixed(2))
                                                },
                                            })}
                                        />
                                    </Box>

                                    <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.aliceBlue, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                                        <InputField
                                            disabled={true}
                                            size={"small"}
                                            defaultValue={ContainersData?.costing ? parseFloat(ContainersData?.costing?.con_freight_usd).toFixed(2) : parseFloat(0).toFixed(2)}
                                            type={"number"}

                                            style={{ m: 0 }}
                                            register={register("con_freight_usd")}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ p: 1, width: '200px' }}>
                                    <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>Container Loading</Typography>
                                </Box>
                                <Box sx={{ display: 'flex' }}>
                                    <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.feta, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                                        <InputField
                                            defaultValue={ContainersData?.costing ? parseFloat(ContainersData?.costing?.con_loading_aed).toFixed(2) : parseFloat(0).toFixed(2)}
                                            size={"small"}

                                            type={"number"}

                                            style={{ m: 0 }}
                                            register={register("con_loading_aed", {
                                                pattern: numberRegex,
                                                onChange: (e) => {
                                                    handleCalc()
                                                    setValue('con_loading_usd', parseFloat(e.target.value / currencyExchangeRate).toFixed(2))
                                                },
                                            })}
                                        />
                                    </Box>

                                    <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.aliceBlue, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                                        <InputField
                                            disabled={true}
                                            size={"small"}
                                            defaultValue={ContainersData?.costing ? parseFloat(ContainersData?.costing?.con_loading_usd).toFixed(2) : parseFloat(0).toFixed(2)}
                                            type={"number"}

                                            style={{ m: 0 }}
                                            register={register("con_loading_usd")}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ p: 1, width: '200px' }}>
                                    <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>Total Cost</Typography>
                                </Box>
                                <Box sx={{ display: 'flex' }}>
                                    <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.feta, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                                        <InputField
                                            value={ContainersData?.costing ? parseFloat(ContainersData?.costing?.con_loading_aed) + parseFloat(ContainersData?.costing?.con_freight_aed) : parseFloat(0).toFixed(2)}
                                            size={"small"}
                                            disabled={true}
                                            type={"number"}

                                            style={{ m: 0 }}
                                            register={register("total_cost_aed", {
                                                pattern: numberRegex,
                                                onChange: (e) => {

                                                    setValue('total_cost_usd', parseFloat(e.target.value / currencyExchangeRate).toFixed(2))
                                                },
                                            })}
                                        />
                                    </Box>

                                    <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.aliceBlue, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                                        <InputField
                                            disabled={true}
                                            size={"small"}
                                            value={ContainersData?.costing ? parseFloat(parseFloat(parseFloat(ContainersData?.costing?.con_loading_aed) + parseFloat(ContainersData?.costing?.con_freight_aed)) / currencyExchangeRate).toFixed(2) : parseFloat(0).toFixed(2)}
                                            type={"number"}

                                            style={{ m: 0 }}
                                            register={register("total_cost_usd")}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ p: 1, width: '200px' }}>
                                    <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>Sale Price</Typography>
                                </Box>
                                <Box sx={{ display: 'flex' }}>
                                    <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.feta, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                                        <InputField
                                            value={ContainersData ? parseFloat(parseFloat(ContainersData?.price) * currencyExchangeRate).toFixed(2) : parseFloat(0).toFixed(2)}
                                            size={"small"}
                                            disabled={true}

                                            type={"number"}

                                            style={{ m: 0 }}
                                            register={register("sale_price_aed", {
                                                pattern: numberRegex,
                                                onChange: (e) => {

                                                    setValue('sale_price_usd', parseFloat(e.target.value / currencyExchangeRate).toFixed(2))
                                                },
                                            })}
                                        />
                                    </Box>

                                    <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.aliceBlue, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                                        <InputField
                                            disabled={true}
                                            size={"small"}
                                            value={ContainersData ? parseFloat(ContainersData?.price).toFixed(2) : parseFloat(0).toFixed(2)}
                                            type={"number"}

                                            style={{ m: 0 }}
                                            register={register("sale_price_usd")}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ p: 1, width: '200px' }}>
                                    <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>Profit</Typography>
                                </Box>
                                <Box sx={{ display: 'flex' }}>
                                    <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.feta, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                                        <InputField
                                            defaultValue={ContainersData?.costing ? ContainersData?.costing?.profit_aed : parseFloat(0).toFixed(2)}
                                            size={"small"}
                                            disabled={true}


                                            type={"number"}

                                            style={{ m: 0 }}
                                            register={register("profit_aed", {

                                                onChange: (e) => {

                                                    setValue('profit_usd', parseFloat(e.target.value / currencyExchangeRate).toFixed(2))
                                                },
                                            })}
                                        />
                                    </Box>

                                    <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.aliceBlue, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                                        <InputField
                                            disabled={true}
                                            size={"small"}
                                            defaultValue={ContainersData?.costing ? ContainersData?.costing?.profit_usd : parseFloat(0).toFixed(2)}
                                            type={"number"}

                                            style={{ m: 0 }}
                                            register={register("profit_usd")}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={3} mt={15} >
                            <InputField
                                size={'small'}
                                label={"Currency ExChange Rate"}
                                disabled={true}
                                value={currencyExchangeRate}
                                placeholder={"Currency ExChange Rate"}

                            />


                        </Grid>

                    </Grid>
                    <Grid container justifyContent={'flex-end'} >

                        <Grid item xs={12} sm={12} mt={3.5} display={'flex'} justifyContent={'flex-end'} >
                            <Box>
                                <Box>
                                    <PrimaryButton title="Update" type="submit" loading={loading} />
                                </Box>

                            </Box>
                        </Grid>
                    </Grid>
                </Box>

            </>
            }
        </Box>
    );
}
export default ContainerCosting;
