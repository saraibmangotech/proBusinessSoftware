import React, { Fragment, useEffect, useState } from "react";
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
    IconButton,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { EyeIcon, FontFamily } from "assets";
import VendorServices from "services/Vendor";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import { CircleLoading } from "components/Loaders";
import Pagination from "components/Pagination";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";
import { addPermission } from "redux/slices/navigationDataSlice";
import { useDispatch } from "react-redux";
import { Debounce, formatPermissionData } from "utils";
import { Check, Close, Delete, Inventory, Visibility } from "@mui/icons-material";
import ExportServices from "services/Export";
import InputField from "components/Input";
import ExchangeRate from "../Finance/ExchangeRate";
import CurrencyServices from "services/Currency";

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

function BroderCosting() {
    const classes = useStyles();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const tableHead = ["Vin", "Agent", "USD", "AED", "Action"];

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const {
        register: register2,
        handleSubmit: handleSubmit2,
        setValue: setValue2,
        getValues: getValues2,
        formState: { errors: errors2 },
    } = useForm();

    const [loader, setLoader] = useState(false);

    // *For Vendor Dropdown
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false);

    // *For TT List
    const [vendorTT, setVendorTT] = useState();
    const [vinOptions, setVinOptions] = useState([]);
    const [selectedVin, setSelectedVin] = useState(null);
    const [vehicles, setVehicles] = useState([])
    const [sendVehicles, setSendVehicles] = useState([])

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [demoData , setDemoData] = useState([])

    // *For Filters
    const [filters, setFilters] = useState({});
    const [vehicleValues , setVehicleValues] = useState({})

    // *For Currencies
    const [currencyExchangeRate, setCurrencyExchangeRate] = useState();

    const [buttonDisabled, setButtonDisabled] = useState(false)

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

    //*For Manifest Options

    const getManifest = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 15,
                search: search,
            };
            const { data } = await ExportServices.getBorderVins(params);

            const resultArray = data?.vehicles?.map((item) => {
                return { id: item.vin, name: item.vin };
            });


            setVinOptions(resultArray.filter(item => item?.border_costing == null))

        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Vendor
    const getVendorDropdown = async () => {
        try {
            const { data } = await ExportServices.getVendorDropdown();
            setVendors([...data?.agents, ...data?.brokers]);
        } catch (error) {
            ErrorToaster(error);
        }
    };
    const handleChange = (id,val) => {
        let vehValues = {...vehicleValues};
        if (!vehValues[id]) {
            vehValues[id]= {usdValue : 0};
        }
        vehValues[id].usdValue = val;
        setVehicleValues(vehValues);
       console.log(vehValues);

    }

    const handleCalc = (item, id, val) => {


        const updatedVehicles = sendVehicles.map(item => {
            if (item?.ev_id === id) {

                return {
                    ...item,
                    cost_usd: val,
                    cost_aed: val * currencyExchangeRate
                };
            }
            return item;
        });
        console.log(updatedVehicles, 'updatedVehicles');

        setSendVehicles(updatedVehicles)


    };


    // *For TT List
    const getExportVehicles = async (page, limit, filter) => {
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
            };
            params = { ...params, ...Filter };
            const { data } = await ExportServices.getExportVehicles(params);
            console.log(data);
            addItem(data?.vehicles?.rows)
            console.log([...vehicles, ...data?.vehicles?.rows]);

        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false);
        }
    };
    const addItem = (data) => {
        let allData = [...vehicles, ...data]
        const uniqueArray = Array.from(new Set(allData.map(item => item.id))).map(id => {
            return allData.find(item => item.id === id);
        });

        console.log(uniqueArray);

        setVehicles(uniqueArray)
        let sendetails = uniqueArray.map(item => ({
            ev_id: item?.id,
            vin: item?.vin,
            manifest: item?.manifest_number,
            agent_id: item?.agent?.id,
            agent_name: item?.agent?.name,
            cost_aed: 0,
            cost_usd: 0
        }));

        setDemoData(uniqueArray)
        setSendVehicles(sendetails)
    }

    const handleRemoveItem = (id) => {

        let UpdatedData = vehicles.filter(item => item?.id !== id)
        let UpdatedData2 = sendVehicles.filter(item => item?.ev_id !== id)

        setSendVehicles(UpdatedData2)
        setVehicles(UpdatedData)
    }


    // *For Update Shipping
    const updateBorderCosting = async (formData) => {
        setLoading(true)
        sendVehicles.filter(item => item?.cost_usd != 0)
        

        let newVehicles = [...sendVehicles];
        let finalArray = [];
        for (let i = 0; i < newVehicles.length; i++) {
            const element = newVehicles[i];
            let id = element?.ev_id;
            console.log(id,'id');
            let usdValue = vehicleValues[id]?.usdValue;
            let aedValue = usdValue * currencyExchangeRate;
            element.cost_usd = usdValue;
            element.cost_aed = aedValue;
            finalArray.push(element)
    
        }

        let emptyData = finalArray.filter(item => item?.cost_usd == 0)

        if (emptyData.length > 0) {
            ErrorToaster('Please Fill All Fields')
            setLoading(false)
        }

        else {
            try {
                let obj = {
                    vehicle_qty: finalArray?.length,
                    vehicles: finalArray
                }
                console.log(obj, 'objjjjj');
                const { message } = await ExportServices.updateBorderCosting(obj)
                SuccessToaster(message)
                setButtonDisabled(true)

            } catch (error) {
                ErrorToaster(error)
            } finally {
                setLoading(false)
            }
        }
    }

    // *For Apply Filters
    const applyFilter = async (data) => {
        try {

            getExportVehicles(1, "", data);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    useEffect(() => {
        getCurrencies()
        getVendorDropdown();
        getManifest()
    }, []);

    return (
        <Box sx={{ m: 4, mb: 2 }}>
            <Typography
                variant="h5"
                sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}
            >
                Border Costing
            </Typography>

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
                    <Grid sm={12} md={3} item>
                        {" "}
                        <SelectField
                            size={'small'}
                            label={"Vin"}
                            options={vinOptions}
                            selected={selectedVin}
                            onSelect={(value) => {
                                setSelectedVin(value);
                                applyFilter({ filter: value?.id });
                            }}
                            onSearch={(v) => getManifest(v)}
                            // error={errors?.auctionHouses?.message}
                            error={errors?.VIN?.message}
                            register={register("VIN")}
                        />
                    </Grid>

                </Grid>
            </Box>

            {loader ? (
                <CircleLoading />
            ) : (
                vehicles?.length > 0  && (
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
                                        vehicles?.length > 0 ? (
                                            <Fragment>
                                                {demoData.map((item, index) => (
                                                    <Row
                                                        key={index}
                                                        sx={{
                                                            bgcolor: index % 2 !== 0 && "#EFF8E7",
                                                        }}
                                                    >
                                                        <Cell>
                                                            {item?.vin
                                                                ?? '-'}
                                                        </Cell>
                                                        <Cell>{item?.agent?.name ?? "-"}</Cell>
                                                        <Cell sx={{ width: '200px' }}>
                                                            <InputField
                                                                defautlValue={0}
                                                                size="small"
                                                                sx={{ width: '200px', height: "10px" }}
                                                                register={register2(
                                                                    item?.id + "cost",
                                                                    {
                                                                        required: 'Please enter cost',

                                                                        onChange: (e) => {
                                                                            handleChange(item?.id,e.target.value)
                                                                            setValue2(`${item?.id}cost`, e.target.value)
                                                                            setValue2(`${item?.id}costaed`, parseFloat(e.target.value * currencyExchangeRate).toFixed(2))
                                                                            handleCalc(item, item?.id, e.target.value)
                                                                        },
                                                                    }
                                                                )}
                                                                error={
                                                                    errors2?.cost?.message
                                                                }
                                                            />
                                                        </Cell>
                                                        <Cell sx={{ width: '200px' }}> <InputField

                                                            size="small"
                                                            disabled={true}
                                                            sx={{ width: '200px', height: "10px" }}
                                                            register={register2(
                                                                item?.id + "costaed",
                                                                {
                                                                    required: true,

                                                                    onChange: (e) => {


                                                                        console.log(e.target.value);
                                                                    },
                                                                }
                                                            )}
                                                            error={
                                                                errors2?.costaed?.message
                                                            }
                                                        /></Cell>

                                                        <Cell>
                                                            <Box
                                                                sx={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    handleRemoveItem(item?.id)


                                                                }}
                                                            >
                                                                <IconButton
                                                                    sx={{
                                                                        bgcolor: Colors.danger,
                                                                        "&:hover": {
                                                                            bgcolor: Colors.danger,
                                                                        },
                                                                    }}
                                                                >
                                                                    <Delete
                                                                        sx={{
                                                                            color: Colors.white,
                                                                            height: "16px !important",
                                                                        }}
                                                                    />
                                                                </IconButton>
                                                                <Typography variant="body2">
                                                                    Delete
                                                                </Typography>
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
                        {vehicles.length > 0 && <Grid container justifyContent={"flex-end"} mt={2}>
                            <PrimaryButton
                                sx={{ textAlign: 'right' }}
                                loading={loading}
                                disabled={buttonDisabled}
                                title="Update"
                                onClick={handleSubmit2(updateBorderCosting)}

                            />
                        </Grid>}
                    </Fragment>
                )
            )}
        </Box>
    );
}

export default BroderCosting;
