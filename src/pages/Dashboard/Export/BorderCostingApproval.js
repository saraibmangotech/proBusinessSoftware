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
    Paper,
    Chip,
} from "@mui/material";
import RowRadioButtonsGroup from "components/Input/RadioGroup";
import Pagination from "components/Pagination";
import { Delete, Edit } from "@mui/icons-material";
import Colors from "assets/Style/Colors";
import DatePicker from "components/DatePicker";
import SelectField from "components/Select";
import { makeStyles } from "@mui/styles";
import { CheckIcon, FontFamily, PendingIcon } from "assets";
import { PrimaryButton } from "components/Buttons";
import { useState, Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import styled from "@emotion/styled";
import { CircleLoading } from "components/Loaders";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import ExportServices from "services/Export";
import InputField from "components/Input";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { EyeIcon } from "assets";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import SimpleDialog from "components/Dialog/SimpleDialog";

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
        background: Colors.primary,
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

function BorderCostingApproval() {
    const [selectedManifest, setselectedManifest] = useState(null);
    const [manifestOptions, setmanifestOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [approvalDialog, setApprovalDialog] = useState(false)

    const [oldDataArray, setOldDataArray] = useState([])
    const [newDataArray, setnewDataArray] = useState([])
    const [approvalId, setApprovalId] = useState()
    const [costingId, setCostingId] = useState()

    const classes = useStyles();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        formState: { errors: errors2 },
    } = useForm();

    const tableHead = [
        "Date",
        "Edited By",
        "Status",

    ];

    const [loader, setLoader] = useState(false);

    // *For Dialog Box
    const [confirmationDialog, setConfirmationDialog] = useState(false);

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [borderCostings, setBorderCostings] = useState([])
    const [updatedData, setUpdatedData] = useState([])

    // *For Filters
    const [filters, setFilters] = useState({});



    // *For Permissions
    const [permissions, setPermissions] = useState();


    // *For Export Vechicles
    const getBorderCostingApproval = async (page, limit, filter) => {
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
            const { data } = await ExportServices.getBorderCostingApproval(params);
            setBorderCostings(data?.approvals?.rows);
            setTotalCount(data?.approvals?.count);
        } catch (error) {
            ErrorToaster(error);
        }
    };


    const handleDialog = (oldData, newData, latestData) => {
        setUpdatedData(latestData)
        console.log(oldData, 'oldData');
        console.log(newData, 'newData');

        const oldValues = [];
        const newValues = [];

        oldData.forEach((oldItem) => {
            const newItem = newData.find((newItem) => newItem.ev_id === oldItem.ev_id);

            if (newItem && newItem.cost_usd !== oldItem.cost_usd) {
                oldValues.push(oldItem);
                newValues.push(newItem);
            }
        });
        setOldDataArray(oldValues)
        setnewDataArray(newValues)

        setApprovalDialog(true)
    }
    const BorderCostingApproval = async (formData) => {
        setLoading(true);
        try {
            let obj = {
                approval_id: approvalId,
                is_approved: true,
                border_costing_id: costingId,
                updated_data: updatedData

            };
            console.log(obj);
            const { message } = await ExportServices.BorderCostingApproval(obj);
            SuccessToaster(message);
            setApprovalDialog(false)
            getBorderCostingApproval()
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {



        getBorderCostingApproval()
    }, []);

    return (
        <Box component={"form"} >
            {/* approval Modal */}
            <SimpleDialog
                open={approvalDialog}
                onClose={() => setApprovalDialog(false)}
                title={"Data Changes"}
                width={'200%'}
            >
                <Box component="form" onSubmit={handleSubmit2(BorderCostingApproval)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
                            Old Data
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
                            New Data
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
                            {oldDataArray.map((item, index) => (

                                <Grid container key={index} gap={1}>
                                    <Grid item xs={12} sx={{ textAlign: 'left' }}>Vin : {item?.vin}</Grid>
                                    <Grid item xs={12} sx={{ textAlign: 'left' }}>  Agent : {item?.agent_name}</Grid>
                                    <Grid item xs={12}>

                                        <InputField
                                            size={'small'}
                                            disabled={true}
                                            value={parseFloat(item?.cost_usd).toFixed(2)}

                                        />
                                    </Grid>



                                </Grid>
                            ))}
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
                            {newDataArray.map((item, index) => (

                                <Grid container key={index} gap={1}>
                                    <Grid item xs={12} sx={{ textAlign: 'left' }}> Vin : {item?.vin}</Grid>
                                    <Grid item xs={12} sx={{ textAlign: 'left' }}>  Agent : {item?.agent_name}</Grid>
                                    <Grid item xs={12}>
                                        <InputField
                                            size={'small'}
                                            disabled={true}
                                            value={parseFloat(item?.cost_usd).toFixed(2)}

                                        />
                                    </Grid>

                                </Grid>
                            ))}
                        </Grid>

                        <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "center" }}>
                            <PrimaryButton title="Approve" type="submit" />
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>
            <Box sx={{ width: '50%' }}>
                <Grid container m={4}>
                    <Typography
                        variant="h5"
                        sx={{
                            color: Colors.charcoalGrey,
                            fontFamily: FontFamily.NunitoRegular,

                            textAlign: "left",
                        }}
                    >
                        Border Costing Approval
                    </Typography>
                </Grid>
            </Box>


            <Box sx={{ m: 4, mb: 2 }}>
                {/* ========== Confirmation Dialog ========== */}
                <ConfirmationDialog
                    open={confirmationDialog}
                    onClose={() => setConfirmationDialog(false)}
                    message={"Are you sure you want to delete this?"}
                // action={() => deleteBuyerId()}
                />

                {borderCostings ? (
                    <Fragment>
                        {/* ========== Table ========== */}
                        <TableContainer
                            component={Paper}
                            sx={{
                                boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                borderRadius: 2,
                                maxHeight: "calc(100vh - 200px)",
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
                                        borderCostings?.length > 0 ? (
                                            <Fragment>
                                                {borderCostings.map((item, index) => (
                                                    <Row
                                                        key={index}
                                                        sx={{
                                                            bgcolor: index % 2 !== 0 && "#EFF8E7",
                                                        }}
                                                    >
                                                        <Cell>	{item?.edited_at
                                                            ? moment(item?.edited_at).format(
                                                                "MM-DD-YYYY"
                                                            )
                                                            : "N/A"}</Cell>
                                                        <Cell>

                                                            {item?.editor ? item?.editor?.name : "-"}
                                                        </Cell>


                                                        <Cell>		<Box onClick={() => {
                                                            if (!item?.is_approved) {

                                                                handleDialog(item?.old_data, item?.new_data, item?.updated_data)
                                                                setApprovalId(item?.id)
                                                                setCostingId(item?.border_costing_id)
                                                            }
                                                        }} sx={{ cursor: 'pointer', 'path': { fill: item?.is_approved ? Colors.primary : item?.is_approved === false ? Colors.bluishCyan : '' } }}>
                                                            {item?.is_approved ? <CheckIcon /> : <PendingIcon />}
                                                            <Typography variant="body2">
                                                                {item?.is_approved ? 'Approved' : 'Pending'}
                                                            </Typography>
                                                        </Box></Cell>
                                                    </Row>
                                                ))}
                                            </Fragment>
                                        ) : (
                                            <Row>
                                                <Cell
                                                    colSpan={tableHead?.length + 1}
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
                                                colSpan={tableHead?.length + 2}
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

                        {/* ========== Pagination ========== */}
                        {/* <Pagination
							currentPage={currentPage}
							pageSize={pageLimit}
							onPageSizeChange={(size) => getBorderCostingApproval(1, size.target.value)}
							tableCount={borderCostings?.length}
							totalCount={totalCount}
							onPageChange={(page) => getBorderCostingApproval(page, "")}
						/> */}
                    </Fragment>
                ) : (
                    ""
                )}
            </Box>
        </Box>
    );
}
export default BorderCostingApproval;
