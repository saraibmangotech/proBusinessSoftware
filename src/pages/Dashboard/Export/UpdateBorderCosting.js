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
import { useNavigate, useParams } from "react-router-dom";
import { addPermission } from "redux/slices/navigationDataSlice";
import { useDispatch } from "react-redux";
import { Debounce, formatPermissionData, numberRegex } from "utils";
import { Check, Close, Delete, Inventory, Visibility } from "@mui/icons-material";
import ExportServices from "services/Export";
import InputField from "components/Input";
import ExchangeRate from "../Finance/ExchangeRate";
import CurrencyServices from "services/Currency";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";

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

function UpdateBorderCosting() {
    const classes = useStyles();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();
    const tableHead = ["Agent", "USD", "AED", "Action"];

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
    const [oldData, setOldData] = useState([])

    const [confirmationDialog, setConfirmationDialog] = useState(false)

    const [selectedId, setSelectedId] = useState()

    // *For Filters
    const [filters, setFilters] = useState({});

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


    const handleCalc = (item, id, val) => {
        console.log(id);



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
        console.log(updatedVehicles, 'updatedVehiclesupdatedVehicles');

        setSendVehicles(updatedVehicles)


    };


    // *For TT List
    const getBorderCostingDetails = async (page, limit, filter) => {
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
                costing_id: id
            };
            params = { ...params, ...Filter };
            const { data } = await ExportServices.getBorderCostingDetail(params);

            console.log(data);

            setVehicles(data?.costing?.vehicles)


            let oldsendetails = data?.costing?.vehicles.map(item => ({
                ev_id: item?.ev_id,
                vin: item?.vehicle?.vin,
                manifest: item?.vehicle?.manifest_number,
                agent_id: item?.agent?.id,
                agent_name: item?.agent?.name,
                cost_aed: item?.cost_aed,
                cost_usd: item?.cost_usd
            }));
            setOldData(oldsendetails)

            let sendetails = data?.costing?.vehicles.map(item => ({
                ev_id: item?.ev_id,
                vin: item?.vehicle?.vin,
                manifest: item?.vehicle?.manifest_number,
                agent_id: item?.agent?.id,
                agent_name: item?.agent?.name,
                cost_aed: item?.cost_aed,
                cost_usd: item?.cost_usd
            }));



            setSendVehicles(sendetails)
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false);
        }
    };
    const handleRemoveItem = () => {

        let UpdatedData = vehicles.filter(item => item?.id !== selectedId)
        let UpdatedData2 = sendVehicles.filter(item => item?.ev_id !== selectedId)

        setSendVehicles(UpdatedData2)
        setVehicles(UpdatedData)
    }


    // *For Update Shipping
    const editBorderCosting = async (formData) => {
        setLoading(true)
        console.log(oldData);
        let updatedObj = {
            border_costing_id: id,
            vehicle_qty: sendVehicles?.length,
            vehicles: sendVehicles,
        }
        sendVehicles.filter(item => item?.cost_usd != 0)
        let emptyData = sendVehicles.filter(item => item?.cost_usd == 0)
        if (emptyData.length > 0) {
            ErrorToaster('Please Fill All Fields')
            setLoading(false)
        }
        else {
            try {
                let obj = {
                    border_costing_id: id,
                    updated_data: updatedObj,
                    old_data: oldData,
                    new_data: sendVehicles
                }
                console.log(obj, 'objjjjj');
                const { message } = await ExportServices.editBorderCosting(obj)
                SuccessToaster(message)
                setButtonDisabled(true)
                navigate('/border-costing-approval')

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

            getBorderCostingDetails(1, "", data);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    useEffect(() => {
        getCurrencies()
        getVendorDropdown();
        getManifest()
        getBorderCostingDetails()
    }, []);

    return (
        <Box sx={{ m: 4, mb: 2 }}>
            {/* ========== Confirmation Dialog ========== */}
            <ConfirmationDialog
                open={confirmationDialog}
                onClose={() => setConfirmationDialog(false)}
                message={"Are you sure you want to delete?"}
                action={() => {
                    setConfirmationDialog(false);
                    handleRemoveItem()

                }}
            />
            <Typography
                variant="h5"
                sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}
            >
                Update Border Costing
            </Typography>

            {/* <Box
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
            </Box> */}

            {loader ? (
                <CircleLoading />
            ) : (
                vehicles && (
                    <Fragment>
                        {/* ========== Table ========== */}
                        <TableContainer
                            component={Paper}
                            sx={{
                                boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                borderRadius: 2,
                                maxHeight: "calc(100vh - 330px)",
                                mt: 5
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
                                                {vehicles.map((item, index) => (
                                                    <Row
                                                        key={index}
                                                        sx={{
                                                            bgcolor: index % 2 !== 0 && "#EFF8E7",
                                                        }}
                                                    >

                                                        <Cell>{item?.agent?.name ?? "-"}</Cell>
                                                        <Cell sx={{ width: '200px' }}>
                                                            <InputField
                                                                defaultValue={parseFloat(item?.cost_usd).toFixed(2)}
                                                                size="small"
                                                                sx={{ width: '200px', height: "10px" }}
                                                                InputProps={{
                                                                    inputProps: {
                                                                        min: 0,
                                                                    },
                                                                }}
                                                                register={register2(
                                                                    item?.id + "cost",
                                                                    {
                                                                        pattern: numberRegex,


                                                                        onChange: (e) => {
                                                                            if (e.target.value == '') {
                                                                                setValue2(`${item?.id}cost`, parseFloat(0))
                                                                                setValue2(`${item?.id}costaed`, parseFloat(0 * currencyExchangeRate).toFixed(2))
                                                                                handleCalc(item, item?.ev_id, 0)
                                                                            }
                                                                            else {

                                                                                setValue2(`${item?.id}cost`, parseFloat(e.target.value))
                                                                                setValue2(`${item?.id}costaed`, parseFloat(e.target.value * currencyExchangeRate).toFixed(2))
                                                                                handleCalc(item, item?.ev_id, e.target.value)
                                                                            }
                                                                        },
                                                                    }
                                                                )}
                                                                error={
                                                                    errors2?.cost?.message
                                                                }
                                                            />
                                                        </Cell>
                                                        <Cell sx={{ width: '200px' }}>
                                                            <InputField
                                                                defaultValue={parseFloat(item?.cost_aed).toFixed(2)}
                                                                size="small"
                                                                disabled={true}
                                                                sx={{ width: '200px', height: "10px" }}
                                                                register={register2(
                                                                    item?.id + "costaed",
                                                                    {


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
                                                                    setSelectedId(item?.id)
                                                                    setConfirmationDialog(true)

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
                                onClick={handleSubmit2(editBorderCosting)}

                            />
                        </Grid>}
                    </Fragment>
                )
            )}
        </Box>
    );
}

export default UpdateBorderCosting;
