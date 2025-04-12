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
    CircularProgress,
    Paper,
    Checkbox,
} from "@mui/material";
import RowRadioButtonsGroup from "components/Input/RadioGroup";
import Colors from "assets/Style/Colors";
import DatePicker from "components/DatePicker";
import SelectField from "components/Select";
import { makeStyles } from "@mui/styles";
import { FontFamily } from "assets";
import { PrimaryButton } from "components/Buttons";
import { useForm } from "react-hook-form";
import styled from "@emotion/styled";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import InputField from "components/Input";
import { useState, useEffect, Fragment } from "react";
import ExportServices from "services/Export";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { Debounce, getYearMonthDateFormate } from "utils";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import moment from "moment";
import DeleteIcon from '@mui/icons-material/Delete';

// import  useNavigate  from "react-router-dom";

// *For Table Style

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

function UpdateCMR() {
    const classes = useStyles();

    //*Handle Submit

    const {
        register,
        handleSubmit,
        setValue,
        getValues: getValues1,
        formState: { errors },
    } = useForm();

    //*Table Heading
    const tableHead = [
        "Select",
        "VIN",
        "Year",
        "Make",
        "Model",
        "Color",
        "Agent Name",
        "Customer Name",
        "Manifest Number",
        "Manifest Date",
        "CMR Number",
        "CMR Date",
        "Vehicle On the way",
        "Offload Destination",
        "Offload Date",
        "Broker Name",
        "Action",
    ];

    //*On the Way Options
    const OntheWayOptions = [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
    ];

    //*Dropdown State
    const [age, setAge] = React.useState("");
    const [ev_id, setEv_id] = useState();

    // *For Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageLimit, setPageLimit] = useState(50);
    const [totalCount, setTotalCount] = useState(0);

    // *For Dropdown Options
    const [brokerOptions, setBrokerOptions] = useState();
    const [manifestOptions, setManifestOptions] = useState([]);
    const [vinOptions, setVinOptions] = useState([]);
    const [offloadDestOptions, setOffloadDestOptions] = useState([]);

    // *For Selected Values
    const [selectedManifest, setSelectedManifest] = useState(null);
    const [selectedVin, setSelectedVin] = useState(null);
    const [selectedOffLoadDest, setSelectedOffLoadDest] = useState(null);

    const [originalData, setOriginalData] = useState([])

    const [manifestNum, setManifestNum] = useState('')
    const [cmrNum, setCmrNum] = useState('')

    // *for Id
    const [vehicleId, setVehicleId] = useState();

    // * for Dates
    const [CMRDate, setCMRDate] = useState();
    const [manifestDate, setManifestDate] = useState();
    const [OffloadDate, setOffloadDate] = useState();
    const [selectedVehicles, setSelectedVehicles] = useState([]);

    //*RadioChange
    const [radioValue, setRadioValue] = useState(false);

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [disabled, setDisabled] = useState(false)

    // *Loader
    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);

    // *For Dialog Box
    const [confirmationDialog, setConfirmationDialog] = useState(false);

    // *For Filters
    const [filters, setFilters] = useState({});

    //*Export Data
    const [ExportData, setExportData] = useState([]);
    const [uniqueIdentifiers, setUniqueIdentifiers] = useState([]);

    // *For Export Vehicles

    const getExportVehicles = async (page, limit, filter) => {
        try {
            const Page = page ? page : currentPage;
            const Limit = limit ? limit : pageLimit;
            const Filter = { ...filters, ...filter };
            setCurrentPage(Page);
            setPageLimit(Limit);
            setFilters(Filter);
            let params = {
                page: Page,
                limit: 15,
            };
            params = { ...params, ...Filter };
            const { data } = await ExportServices.getExportVehicles(params);

            console.log(data?.vehicles?.rows);
            // Check for duplicates and show alert
            if (data?.vehicles?.rows[0]?.agent && data?.vehicles?.rows[0]?.broker) {

                const newRows = data?.vehicles?.rows;
                const duplicates = newRows.filter((item) => {
                    return ExportData.some((existingItem) => existingItem.id === item.id);
                });

                if (duplicates.length > 0) {
                    // Show alert for duplicates
                    ErrorToaster("Vehicle Already Added");
                } else {
                    // Update state if no duplicates

                    setExportData((prevExportData) => [...prevExportData, ...newRows]);
                    setOriginalData((prevExportData) => [...prevExportData, ...newRows])
                    console.log("Setting Export Data:", [...ExportData, ...newRows]); // Added console.log
                    let list = [...ExportData, ...newRows]
                    setRadioValue(list[0]?.offload_vehicle_onway.toString())
                    if (list[0]?.offload_date) {
                        console.log('aaasas');
                        handleOffloadDate(list[0]?.offload_date)
                    }
                    else {
                        setOffloadDate(new Date());
                        console.log(new Date());
                    }
                    if (list[0]?.offloading_destination) {
                        setSelectedOffLoadDest(list[0]?.offloading_destination)
                        setValue('OffloadDestination', list[0]?.offloading_destination)
                        console.log(list[0]?.offload_date, 'sdsdadusahasuidhqwui');

                    }
                    else {
                        setSelectedOffLoadDest({
                            id: 2,
                            name: "In Transit to Bander Linge"
                        })
                        setValue('OffloadDestination', {
                            id: 2,
                            name: "In Transit to Bander Linge"
                        })
                    }
                    setValue('CMRNumber', list[0]?.cmr_number)
                    let manifestNumbers = [...ExportData, ...newRows].map(item => item?.manifest_number);
                    let newManifests = []

                    let isNewVehicle = false;

                    for (let i = 0; i < manifestNumbers.length; i++) {
                        const element = manifestNumbers[i];
                        if (element) {
                            newManifests.push(element)
                        }
                        if (manifestNumbers.length > 1 && !element) {
                            isNewVehicle = true
                            console.log(isNewVehicle, "tearsads")
                        }
                    }
                    const isSameManifestNumber = new Set(newManifests).size === 1;

                    let disableCondition = isSameManifestNumber;
                    if (isNewVehicle) {
                        disableCondition = false
                    }

                    console.log(disableCondition, 'isSameManifestNumber');
                    setDisabled(disableCondition)
                    if (!disableCondition && newManifests.length > 0) {
                        setValue('ManifestNumber', newManifests[0])
                        setManifestDate(new Date())
                        setDisabled(true)
                    }
                    setTotalCount(data?.vehicles?.count);
                }


                setTotalCount(data?.vehicles?.count);
            }
            else {
                ErrorToaster('No Agent And Broker In this Vehicle')
            }





        } catch (error) {
            ErrorToaster(error);
        }
    };

    const getOffloadDestination = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 1000,
                search: search,
            };
            const { data } = await ExportServices.getOffloadDestination(params);
            setOffloadDestOptions(data?.destinations);
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
            const { data } = await ExportServices.getManifest(params);

            const resultArray = data?.filter?.vins.map((item) => {
                return { id: item, name: item };
            });
            const resultArray2 = data?.filter?.manifestNumbers.map((item) => {
                return { id: item, name: item };
            });

            setVinOptions(resultArray)
            setManifestOptions(resultArray2);
        } catch (error) {
            ErrorToaster(error);
        }
    };



    //*For Broker Options

    const getBroker = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 100,
                broker_type: "2",
            };
            const { data } = await ExportServices.getExportCustomers(params);
            setBrokerOptions(data?.customers?.rows);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const handleRadioChange = (event) => {
        setRadioValue(event.target.value.toString());
        if (event.target.value == "false") {
            setSelectedOffLoadDest(null);
            setOffloadDate(null);
        }
    };

    //* Manifest Date
    const handleManifestDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == "Invalid Date") {
                setManifestDate("invalid");
                return;
            }
            setManifestDate(new Date(newDate));
        } catch (error) {
            ErrorToaster(error);
        }
    };


    // *For Handle Filter
    const handleFilterCustom = (value) => {


        if (value) {
            const result = originalData.filter(item => {
                const vin = item?.vin && item?.vin.toString().includes(value);
                const year = item?.year && item?.year.toString().includes(value.toLowerCase());
                const make = item?.make && item?.make?.name.toString().includes(value);
                const model = item?.model && item?.model?.name.toString().includes(value);
                const color = item?.color && item?.color.toString().includes(value);
                const agent = item?.agent && item?.agent?.name.toString().includes(value);
                const customer = item?.customer && item?.customer?.name.toString().includes(value);
                const manifest = item?.manifest_number && item?.manifest_number.toString().includes(value);
                const cmr = item?.cmr_number && item?.cmr_number.toString().includes(value);


                return vin || year || make || model || color || agent || customer || manifest || cmr;
            });

            setExportData(result)

        }
        else {
            setExportData(originalData)
        }


    }

    //* CMR Date
    const handleCMRDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == "Invalid Date") {
                setCMRDate("invalid");
                return;
            }
            setCMRDate(new Date(newDate));
        } catch (error) {
            ErrorToaster(error);
        }
    };

    //* OffLoad Date
    const handleOffloadDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == "Invalid Date") {
                setOffloadDate("invalid");
                return;
            }
            setOffloadDate(new Date(newDate));
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Update Manifest
    const UpdateManifest = async (formData, e) => {
        e.preventDefault(); // Add this line to prevent default form submission behavior

        setLoading(true);

        const idsArray = ExportData.map((item) => ({ id: item.id, agent_id: item?.agent?.id, broker_id: item?.broker?.id, country_id: item?.country_id }));
        console.log(idsArray);
        let obj
        try {
            if (selectedManifest && formData?.CMRNumber) {
                obj = {

                    manifest_date: getYearMonthDateFormate(manifestDate),
                    cmr_number: formData?.CMRNumber ? formData?.CMRNumber : null,
                    cmr_date: getYearMonthDateFormate(CMRDate),
                    offload_destination_id: selectedOffLoadDest?.id,
                    offload_date: getYearMonthDateFormate(OffloadDate),
                    offload_vehicle_onway: radioValue,
                    vehicles: selectedVehicles,
                };
            }
            else {
                obj = {
                    manifest_number: formData?.ManifestNumber ? formData?.ManifestNumber : null,
                    manifest_date: getYearMonthDateFormate(manifestDate),
                    cmr_number: formData?.CMRNumber ? formData?.CMRNumber : null,
                    cmr_date: getYearMonthDateFormate(CMRDate),
                    offload_destination_id: selectedOffLoadDest?.id,
                    offload_date: getYearMonthDateFormate(OffloadDate),
                    offload_vehicle_onway: radioValue,
                    vehicles: selectedVehicles,
                };
            }

            console.log(obj, 'objobj');
            const { message } = await ExportServices.UpdateManifest(obj);
            SuccessToaster(message);
            handleFilter({ filter: getValues1("ManifestNumber") });
            window.location.reload();

        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoading(false);
        }
    };


    // *Update Broker
    const handleDelete = (e, item) => {
        e.preventDefault();

        const newArray = ExportData.filter(obj => obj.id !== item?.id);

        setExportData(newArray)

    }
    const handleCheck = (data) => {
        console.log(data, 'data');
        const idsArray = ExportData.map((item) => ({ id: item.id, agent_id: item?.agent?.id, broker_id: item?.broker?.id, country_id: item?.country_id }));
        try {
            const shallowCopy = [...selectedVehicles];
            const currentIndex = selectedVehicles.findIndex(
                (e) => e?.id === data?.id
            );
            if (currentIndex === -1) {
                let obj = {

                    id: data.id,
                    agent_id: data?.agent?.id,
                    broker_id: data?.broker?.id,
                    country_id: data?.country_id
                };
                shallowCopy.push(obj);
            } else {
                shallowCopy.splice(currentIndex, 1);
            }
            console.log(shallowCopy);
            setSelectedVehicles(shallowCopy);
        } catch (error) {
            ErrorToaster(error);
        }
    };
    // *Update Broker
    const handleChange = (event) => {
        let broker_id = event.target.value;

        const Update = async (formData) => {
            setLoading(true);
            try {
                let obj = {
                    ev_id: ev_id,
                    broker_id: broker_id,
                };

                const { message } = await ExportServices.VehicleBrokerUpdate(obj);
                SuccessToaster(message);
                getExportVehicles();
            } catch (error) {
                ErrorToaster(error);
            } finally {
                setLoading(false);
            }
        };

        Update();
    };

    // *For Handle Filter
    const handleFilter = (data) => {
        Debounce(() => getExportVehicles(1, "", data));

    };

    useEffect(() => {
        setPermissions(true);
        getManifest();
        getOffloadDestination();
        getBroker();
    }, []);

    return (
        <Box>
            <Grid container spacing={1} alignItems={"center"} justifyContent={"center"}>

            </Grid>
            <Box sx={{ m: 1, mb: 1, mt: 5, }}>
                <Typography
                    variant="h5"
                    sx={{
                        color: Colors.charcoalGrey,
                        fontFamily: FontFamily.NunitoRegular,

                        ml: "30px",
                    }}
                >
                    Update CMR
                </Typography>
                <Grid
                    container
                    sx={{

                        borderRadius: "5px",

                        p: 4,
                        pb: 1,
                        gap: 2
                    }}
                >

                    <Grid sm={12} md={3} item>
                        {" "}
                        <SelectField
                            label={"Manifest"}
                            size={'small'}
                            options={manifestOptions}
                            selected={selectedManifest}
                            onSelect={(value) => {
                                setSelectedManifest(value);
                                handleFilter({ filter: value?.id });
                            }}
                            onSearch={(v) => getManifest(v)}
                            // error={errors?.auctionHouses?.message}
                            error={errors?.VIN?.message}
                            register={register("VIN")}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <InputField
                            size={'small'}
                            disabled={selectedManifest ? false : true}
                            label={'Search'}
                            placeholder={'Search'}
                            register={register('search', {
                                onChange: (e) => handleFilterCustom(e.target.value)
                            })}
                        />
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ width: "70%", margin: "0 auto", marginTop: "5%" }}>



            </Box>
            <Box sx={{ m: 4, mb: 2 }}>
                {/* ========== Confirmation Dialog ========== */}
                <ConfirmationDialog
                    open={confirmationDialog}
                    onClose={() => setConfirmationDialog(false)}
                    message={"Are you sure you want to delete this?"}
                // action={() => deleteBuyerId()}
                />

                {ExportData?.length > 0 ? (
                    <Fragment>
                        {/* ========== Table ========== */}
                        <TableContainer
                            component={Paper}
                            sx={{
                                boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                borderRadius: 2,
                                maxHeight: "calc(400px)",
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
                                        ExportData?.length > 0 ? (
                                            <Fragment>
                                                {ExportData.map((item, index) => (
                                                    <Row
                                                        key={index}
                                                        sx={{
                                                            bgcolor: index % 2 !== 0 && "#EFF8E7",
                                                        }}
                                                    >
                                                        <Cell>

                                                            <Checkbox

                                                                checked={
                                                                    selectedVehicles.findIndex((e) => e.id === item?.id) !== -1
                                                                }
                                                                onChange={() => handleCheck(item)}
                                                            />
                                                        </Cell>
                                                        <Cell>{item?.vin ?? "-"}</Cell>
                                                        <Cell>{item?.year ?? "-"}</Cell>
                                                        <Cell>{item?.make?.name ?? "-"}</Cell>
                                                        <Cell>{item?.model?.name ?? "-"}</Cell>
                                                        <Cell>{item?.color ?? "-"}</Cell>
                                                        <Cell>{item?.agent?.name ?? "-"}</Cell>
                                                        <Cell>{item?.customer?.name ?? "-"}</Cell>
                                                        <Cell>{item?.manifest_number ?? "-"}</Cell>
                                                        <Cell>
                                                            {item?.manifest_date
                                                                ? moment(
                                                                    item?.manifest_date
                                                                ).format("MM-DD-YYYY")
                                                                : "-"}
                                                        </Cell>
                                                        <Cell>{item?.cmr_number ?? "-"}</Cell>
                                                        <Cell>
                                                            {item?.cmr_date
                                                                ? moment(item?.cmr_date).format(
                                                                    "MM-DD-YYYY"
                                                                )
                                                                : "-"}
                                                        </Cell>
                                                        <Cell>
                                                            {item?.offload_vehicle_onway
                                                                ? "Yes"
                                                                : "No" ?? "-"}
                                                        </Cell>
                                                        <Cell>
                                                            {item?.offloading_destination?.name ??
                                                                "-"}
                                                        </Cell>
                                                        <Cell>
                                                            {" "}
                                                            {item?.offload_date
                                                                ? moment(item?.offload_date).format(
                                                                    "MM-DD-YYYY"
                                                                )
                                                                : "-"}
                                                        </Cell>

                                                        <Cell>
                                                            <Box
                                                                display={"flex"}
                                                                alignItems={"center"}
                                                                justifyContent={"space-between"}
                                                            >
                                                                {item?.broker?.name ?? "-"}
                                                                <FormControl
                                                                    sx={{ m: 1, minWidth: 120 }}
                                                                    size="small"
                                                                    className="custom-select-svg"
                                                                >
                                                                    <Select
                                                                        labelId="demo-select-small-label"
                                                                        id="demo-select-small"
                                                                        value={age}
                                                                        onChange={handleChange}
                                                                        onOpen={() => {
                                                                            setEv_id(item?.id);
                                                                        }}
                                                                        displayEmpty
                                                                        renderValue={() => null} // hide selected value
                                                                        sx={{
                                                                            "&:focus": {
                                                                                backgroundColor:
                                                                                    "transparent", // hide focus background
                                                                            },
                                                                            "& .MuiOutlinedInput-notchedOutline":
                                                                            {
                                                                                border: "none", // hide border for selected value
                                                                            },
                                                                        }}
                                                                    >
                                                                        <MenuItem
                                                                            disabled
                                                                            value=""
                                                                            hidden
                                                                        >
                                                                            {/* Placeholder */}
                                                                        </MenuItem>
                                                                        {brokerOptions &&
                                                                            brokerOptions.map(
                                                                                (option) => (
                                                                                    <MenuItem
                                                                                        key={
                                                                                            option.id
                                                                                        }
                                                                                        value={
                                                                                            option.id
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            option.name
                                                                                        }
                                                                                    </MenuItem>
                                                                                )
                                                                            )}
                                                                    </Select>
                                                                </FormControl>
                                                            </Box>
                                                        </Cell>
                                                        <Cell><button style={{ border: 'none', backgroundColor: 'transparent', color: 'red', cursor: "pointer" }} onClick={(e) => handleDelete(e, item)} ><DeleteIcon /></button></Cell>
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
                    </Fragment>
                ) : (
                    ""
                )}
            </Box>
            {ExportData.length > 0 && <Box
                sx={{
                    m: 4,
                    p: 5,
                    bgcolor: Colors.white,
                    borderRadius: 3,
                    boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                }}
                component={"form"} onSubmit={handleSubmit(UpdateManifest)}
            >
                <Grid container >


                    <Grid item xs={12} sm={12} md={12} lg={6}>
                        <Grid container>
                            <Grid
                                item
                                sm={6}
                                display={"flex"}
                                justifyContent={"flex-start"}
                                alignItems={"center"}
                            >
                                Offload vehicle on the way
                            </Grid>
                            <Grid item sm={6}>
                                {" "}
                                <RowRadioButtonsGroup
                                    options={OntheWayOptions}
                                    value={radioValue}
                                    onChange={handleRadioChange}
                                />
                            </Grid>
                        </Grid>


                    </Grid>

                    <Grid container spacing={5}>
                        {radioValue == 'true' ?
                            <Grid item xs={12} sm={12} md={12} lg={6}>
                                <Grid container>
                                    <Grid
                                        item
                                        sm={6}
                                        display={"flex"}
                                        justifyContent={"flex-start"}
                                        alignItems={"center"}
                                    >
                                        Off Load Destination
                                    </Grid>
                                    <Grid item sm={6}>
                                        <SelectField
                                            size={"small"}
                                            placeholder={"Off Loading destination"}
                                            searchable={true}
                                            options={offloadDestOptions}
                                            selected={selectedOffLoadDest}
                                            onSelect={(value) => {
                                                setSelectedOffLoadDest(value);
                                                setOffloadDate(new Date());
                                            }}
                                            onSearch={(v) => getOffloadDestination(v)}
                                            error={errors?.OffloadDestination?.message}
                                            register={register("OffloadDestination", {
                                                required: "Please enter offload destination .",
                                            })}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Repeat similar structure for Off Loading destination and Offload Date */}
                            </Grid>
                            : ''}

                        {radioValue == 'true' ?
                            <Grid item xs={12} sm={12} md={12} lg={6}>
                                <Grid container>
                                    <Grid
                                        item
                                        sm={6}
                                        display={"flex"}
                                        justifyContent={"flex-start"}
                                        alignItems={"center"}
                                    >
                                        Off Load Date
                                    </Grid>
                                    <Grid item sm={6}>
                                        <DatePicker
                                            size={"small"}
                                            value={OffloadDate}
                                            onChange={(date) => handleOffloadDate(date)}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Repeat similar structure for Off Loading destination and Offload Date */}
                            </Grid>
                            : ''}
                    </Grid>
                    <Grid container spacing={5}>
                        <Grid item xs={12} sm={12} md={12} lg={6}>
                            <Grid container>
                                <Grid
                                    item
                                    sm={6}
                                    display={"flex"}
                                    justifyContent={"flex-start"}
                                    alignItems={"center"}
                                >
                                    CMR Number
                                </Grid>
                                <Grid item sm={6}>
                                    <InputField
                                        size={"small"}

                                        placeholder={"CMR Number"} error={errors?.CMRNumber?.message}
                                        register={register("CMRNumber", {

                                            onChange: (e) => {
                                                setCmrNum(e.target.value)
                                                setCMRDate(new Date())
                                                setRadioValue('true')
                                                setManifestDate(null)

                                            },
                                        })}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>


                        <Grid item xs={12} sm={12} md={12} lg={6}>
                            <Grid container>
                                <Grid
                                    item
                                    sm={6}
                                    display={"flex"}
                                    justifyContent={"flex-start"}
                                    alignItems={"center"}
                                >
                                    CMR Date
                                </Grid>
                                <Grid item sm={6}>
                                    {" "}
                                    <DatePicker
                                        size={"small"}
                                        value={CMRDate}
                                        onChange={(date) => handleCMRDate(date)}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} sm={12} sx={{ mt: 4, textAlign: "right", width: "98%" }}>
                <PrimaryButton disabled={selectedVehicles?.length > 0 ? false : true} type="submit" title="Save & Update" loading={loading} />
                </Grid>

            </Box>}

        </Box>
    );
}

export default UpdateCMR;
