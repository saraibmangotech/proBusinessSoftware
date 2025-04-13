import styled from '@emotion/styled';
import { Box, Grid, InputAdornment, Paper, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { FontFamily, Images } from 'assets';
import Colors from 'assets/Style/Colors';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input'
import CustomTextField from 'components/Input/CustomInput';
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { addPermission } from 'redux/slices/navigationDataSlice';
import SystemServices from 'services/System';
import { formatPermissionData } from 'utils';
const StyledInputAdornment = styled(InputAdornment)(({ theme }) => ({
    backgroundColor: '#000', // Adjust the color to match your image
    color: '#fff', // Text color
    padding: '0 10px', // Adjust padding as needed
    borderRadius: '4px 0 0 4px', // Match the rounded corners from the image
}));
// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
    border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        fontSize: 14,
        fontFamily: "Public Sans",
        border: "1px solid #EEEEEE",
        padding: "15px",
        textAlign: "left",
        whiteSpace: "nowrap",
        color: "#434343",
        paddingRight: "50px",
        background: "transparent",
        fontWeight: "bold",
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontFamily: "Public Sans",

        textWrap: "nowrap",
        padding: "5px !important",

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

const CostSetup = () => {
    const [loading, setLoading] = useState(false)
    const [charges, setCharges] = useState({})
    const [statuses, setStatuses] = useState([])
    const [statuses2, setStatuses2] = useState([])
    const dispatch = useDispatch()
    const handleRejectionChange = (e, index, item) => {
        console.log(e.target.value);
        console.log(item);
        // Find the item in the `statuses` array and update its `rejection` property

        const updatedStatuses = statuses.map((status) =>
            status.id === item.id
                ? { ...status, rejection: e.target.value }
                : status
        );
        setStatuses(updatedStatuses)

    }
    const handleTypingChange = (e, index, item) => {
        console.log(e.target.value);
        console.log(item);
        // Find the item in the `statuses` array and update its `rejection` property
        const updatedStatuses = statuses.map((status) =>
            status.id === item.id
                ? { ...status, typing: e.target.value }
                : status
        );
        setStatuses(updatedStatuses)
    }

    const handleRejectionChange2 = (e, index, item) => {
        console.log(e.target.value);
        console.log(item);
        // Find the item in the `statuses` array and update its `rejection` property

        const updatedStatuses = statuses2.map((status) =>
            status.id === item.id
                ? { ...status, rejection: e.target.value }
                : status
        );
        setStatuses2(updatedStatuses)

    }
    const handleTypingChange2 = (e, index, item) => {
        console.log(e.target.value);
        console.log(item);
        // Find the item in the `statuses` array and update its `rejection` property
        const updatedStatuses = statuses2.map((status) =>
            status.id === item.id
                ? { ...status, typing: e.target.value }
                : status
        );
        setStatuses2(updatedStatuses)
    }
    const tableHead1 = [
        { name: "Stage", key: "" },

        { name: "Rejection Cost", key: "visa_eligibility" },
        { name: "Typing Fee", key: "deposit_total" },

    ];
    const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm();
    const [permissions, setPermissions] = useState([])
    const getData = async (formData) => {
        setLoading(true)
        console.log(formData);
        try {
            let params = {
                charges_type: 'cost'

            }

            const { data } = await SystemServices.getRates(params);
            console.log(data);
            let details = data?.charges
            setCharges(details)
            setValue('1yearInsideRate', details?.one_year_inside)
            setValue('1yearOutsideRate', details?.one_year_outside)
            setValue('1yearRenewalRates', details?.one_year_renewal)
            setValue('2yearInsideRate', details?.two_year_inside)
            setValue('2yearOutsideRate', details?.two_year_outside)
            setValue('2yearRenewalRates', details?.two_year_renewal)
            setValue('oneyear', details?.one_year_commission)
            setValue('twoyear', details?.two_year_commission)
            setValue('oneyearoutside', details?.one_year_commission_out)
            setValue('twoyearoutside', details?.two_year_commission_out)
            setValue('monthlyVisaServiceCharges', details?.monthly_visa_service_below)
            setValue('monthlyVisaServiceChargesabove', details?.monthly_visa_service_above)
            setValue('vipMedical', details?.medical_extra)
            setValue('insideCancellationRates', details?.cancellation)
            setValue('outsideCancellationRates', details?.outside_cancellation)
            setValue('cancellationInprogress', details?.cancellation_cost_inprogress)
            setValue('rejectionCost', details?.rejection)
            setValue('extraTyping', details?.typing_fee)
            setValue('overstayCost', details?.overstay)
            setValue('absconderFee', details?.absconder_fee)
            setStatuses(
                [
                    { id: "In Progress", name: "In Progress", rejection: details?.rejection_inprogress, typing: details?.typing_inprogress },


                    { id: "Change Status", name: "Change Status", rejection: details?.rejection_changestatus, typing: details?.typing_changestatus },
                    { id: "Medical", name: "Medical", rejection: details?.rejection_medical, typing: details?.typing_medical },
                    { id: "Emirates Id", name: "Emirates Id", rejection: details?.rejection_emirateid, typing: details?.typing_emirateid },

                ]
            )
            setStatuses2(
                [
                    { id: "In Progress", name: "In Progress", rejection: details?.rejection_inprogress_out, typing: details?.typing_inprogress_out },
                    { id: "Entry Permit", name: "Entry Permit", rejection: details?.rejection_entrypermit_out, typing: details?.typing_entrypermit_out },


                    { id: "Medical", name: "Medical", rejection: details?.rejection_medical_out, typing: details?.typing_medical_out },
                    { id: "Emirates Id", name: "Emirates Id", rejection: details?.rejection_emirateid_out, typing: details?.typing_emirateid_out },

                ]
            )
            console.log(formatPermissionData(data?.permissions))
            setPermissions(formatPermissionData(data?.permissions))
            data?.permissions.forEach(e => {
                if (e?.route && e?.identifier && e?.permitted) {
                    dispatch(addPermission(e?.route));
                }
            })

        } catch (error) {

        } finally {
            setLoading(false);
        }
    }
    const UpdateCost = async (formData) => {
        setLoading(true)
        console.log(formData);
        try {
            let obj = {
                charges_type: "cost",
                one_year_inside: Number(formData?.['1yearInsideRate']),
                one_year_outside: Number(formData?.['1yearOutsideRate']),
                one_year_renewal: Number(formData?.['1yearRenewalRates']),
                two_year_inside: Number(formData?.['2yearInsideRate']),
                two_year_outside: Number(formData?.['2yearOutsideRate']),
                two_year_renewal: Number(formData?.['2yearRenewalRates']),
                one_year_commission: Number(formData?.['oneyear']),
                two_year_commission: Number(formData?.['twoyear']),
                one_year_commission_out: Number(formData?.['oneyearoutside']),
                two_year_commission_out: Number(formData?.['twoyearoutside']),
 
                monthly_visa_service_below: Number(formData?.['monthlyVisaServiceCharges']),
                monthly_visa_service_above: Number(formData?.['monthlyVisaServiceChargesabove']),
                overstay: Number(formData?.['overstayCost']),
                medical_extra: Number(formData?.['vipMedical']),
                typing_fee: Number(formData?.['extraTyping']),
                cancellation: Number(formData?.['insideCancellationRates']),
                outside_cancellation: Number(formData?.['outsideCancellationRates']),
                cancellation_cost_inprogress: Number(formData?.['cancellationInprogress']),
                rejection: Number(formData?.['rejectionCost']),
                absconder_fee: Number(formData?.['absconderFee']),
                rejection_changestatus: "10.00",
                rejection_emirateid: "10.00",
                rejection_entrypermit: "10.00",
                rejection_inprogress: "10.00",
                rejection_medical: "10.00",
                typing_changestatus: "10.00",
                typing_emirateid: "10.00",
                typing_entrypermit: "10.00",
               
                typing_inprogress: "10.00",
                typing_medical: "10.00",



            }

            for (let i = 0; i < statuses.length; i++) {
                const status = statuses[i];

                if (status.id == "In Progress") {
                    obj.rejection_inprogress = status.rejection;
                    obj.typing_inprogress = status.typing
                }
                else if (status.id == "Entry Permit") {
                    obj.rejection_entrypermit = status.rejection;
                    obj.typing_entrypermit = status.typing
                }
                else if (status.id == "Change Status") {
                    obj.rejection_changestatus = status.rejection;
                    obj.typing_changestatus = status.typing
                }
                else if (status.id == "Medical") {
                    obj.rejection_medical = status.rejection;
                    obj.typing_medical = status.typing
                }
                else if (status.id == "Emirates Id") {
                    obj.rejection_emirateid = status.rejection;
                    obj.typing_emirateid = status.typing
                }
            }
            for (let i = 0; i < statuses2.length; i++) {
                const status = statuses2[i];

                if (status.id == "In Progress") {
                    obj.rejection_inprogress_out = status.rejection;
                    obj.typing_inprogress_out = status.typing
                }
                else if (status.id == "Entry Permit") {
                    obj.rejection_entrypermit_out = status.rejection;
                    obj.typing_entrypermit_out = status.typing
                }
                else if (status.id == "Change Status") {
                    obj.rejection_changestatus_out = status.rejection;
                    obj.typing_changestatus_out = status.typing
                }
                else if (status.id == "Medical") {
                    obj.rejection_medical_out = status.rejection;
                    obj.typing_medical_out = status.typing
                }
                else if (status.id == "Emirates Id") {
                    obj.rejection_emirateid_out = status.rejection;
                    obj.typing_emirateid_out = status.typing
                }
            }
            console.log(obj);
            const promise = SystemServices.UpdateCost(obj);

            showPromiseToast(
                promise,
                'Saving ...',
                'Success',
                'Something Went Wrong'
            );

            const result = await promise




        } catch (error) {

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <div>
            <Box sx={{ p: 3 }}>
                <Box component={'form'} onSubmit={handleSubmit(UpdateCost)}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
                        <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >COST MANAGEMENT</Typography>
                        <Box sx={{ display: 'flex', gap: '10px' }}>
                            {permissions?.save && <PrimaryButton
                               bgcolor={'#bd9b4a'}
                                title="Save"
                                type={'submit'}


                            />}

                        </Box>
                    </Box>

                    <Box sx={{ p: 3 }}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mb: 2, mt: 2 }}>Visa Rates : </Typography>
                        <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mb: 2 }}>1 Year Rates : </Typography>

                        <Grid container sx={{ gap: '20px 25px' }}>

                            <Grid item xs={5} >
                                <LabelCustomInput label={'Year Inside Rates : '} StartLabel={'AED'} register={register("1yearInsideRate", { required: "Enter year inside rate" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Year Outside Rates : '} StartLabel={'AED'} register={register("1yearOutsideRate", { required: "Enter year outside rate" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Renewal Rates : '} StartLabel={'AED'} register={register("1yearRenewalRates", { required: "Enter renewal rate" })} />
                            </Grid>



                        </Grid>
                        <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mb: 2, mt: 3 }}>2 Year Rates : </Typography>

                        <Grid container sx={{ gap: '20px 25px' }}>

                            <Grid item xs={5} >
                                <LabelCustomInput label={'Year Inside Rates : '} StartLabel={'AED'} register={register("2yearInsideRate", { required: "Enter year inside rate" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Year Outside Rates : '} StartLabel={'AED'} register={register("2yearOutsideRate", { required: "Enter year outside rate" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Renewal Rates : '} StartLabel={'AED'} register={register("2yearRenewalRates", { required: "Enter renewal rate" })} />
                            </Grid>



                        </Grid>
                        <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mb: 2, mt: 3 }}>Visa Commission : </Typography>

                        <Grid container sx={{ gap: '20px 25px' }}>
                          
                            <Grid item xs={5} >
                                <LabelCustomInput label={'1 Year Inside : '} StartLabel={'AED'} register={register("oneyear", { required: "enter 1 year inside Charges" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'2 Years Inside : '} StartLabel={'AED'} register={register("twoyear", { required: "enter 2 year inside Charges" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'1 Year Outside :  '} StartLabel={'AED'} register={register("oneyearoutside", { required: "enter 1 year outside Charges" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'2 Years Outside : '} StartLabel={'AED'} register={register("twoyearoutside", { required: "enter 2 year outside Charges" })} />
                            </Grid>
                            




                        </Grid>
                        <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mb: 2, mt: 3 }}>Extra Costing : </Typography>

                        <Grid container sx={{ gap: '20px 25px' }}>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Monthly Visa Service Charges Below 2000 : '} max={2000} StartLabel={'AED'} register={register("monthlyVisaServiceCharges", { required: "Enter Monthly Visa Service Charges" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Monthly Visa Service Charges Above 2000 : '} StartLabel={'AED'} register={register("monthlyVisaServiceChargesabove", { required: "Enter Monthly Visa Service Charges" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'VIP Medical  Charges : '} StartLabel={'AED'} register={register("vipMedical", { required: "Enter medical extra charges" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Overstay Cost : '} StartLabel={'AED'} register={register("overstayCost", { required: "Enter year overstay rate" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Inside Cancellation Rates : '} StartLabel={'AED'} register={register("insideCancellationRates", { required: "Enter cancellation rate" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Outside Cancellation Rates : '} StartLabel={'AED'} register={register("outsideCancellationRates", { required: "Enter cancellation rate" })} />
                            </Grid>
                           

                            <Grid item xs={5} >
                                <LabelCustomInput label={'Absconder Fee : '} StartLabel={'AED'} register={register("absconderFee", { required: "Enter absconder fee" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Typing Fee : '} StartLabel={'AED'} register={register("extraTyping", { required: "Enter typing fee" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={' Cancellation Cost In Progress : '} StartLabel={'AED'} register={register("cancellationInprogress", { required: "Enter cancellation rate" })} />
                            </Grid>
                            <Grid item xs={12} >
                                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mb: 2, mt: 3 }}>Rejection Costings (In) : </Typography>
                            </Grid>
                            <TableContainer
                                component={Paper}
                                sx={{
                                    maxHeight: "calc(100vh - 200px)",
                                    backgroundColor: "transparent",
                                    boxShadow: "none !important",
                                    borderRadius: "0px !important",
                                }}
                            >
                                <Table stickyHeader sx={{ minWidth: 500 }}>
                                    <TableHead>
                                        <Row>
                                            {tableHead1.map((cell, index) => (
                                                <Cell
                                                    style={{
                                                        textAlign:
                                                            cell?.name == "SR No."
                                                                ? "center"
                                                                : "left",
                                                        paddingRight:
                                                            cell?.name == "SR No." ? "15px" : "50px",
                                                    }}
                                                    className="pdf-table"
                                                    key={index}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "flex-end",
                                                        }}
                                                    >
                                                        {cell?.name}
                                                    </Box>
                                                </Cell>
                                            ))}
                                        </Row>
                                    </TableHead>
                                    <TableBody>
                                        {statuses?.map((item, index) => {
                                            console.log(item?.statuses);
                                            let sorteddata = item?.statuses?.sort(
                                                (a, b) => a.id - b.id
                                            );
                                            console.log(sorteddata);

                                            return (
                                                <Row
                                                    key={index}
                                                    sx={{
                                                        border: "1px solid #EEEEEE !important",
                                                    }}
                                                >
                                                    <Cell
                                                        style={{ textAlign: "left" }}
                                                        className="pdf-table"
                                                    >
                                                        {item?.name}
                                                    </Cell>
                                                    <Cell style={{ textAlign: "left" }} className="pdf-table">
                                                        <TextField
                                                            size='small'
                                                            defaultValue={item?.rejection || ""}
                                                            onChange={(e) => handleRejectionChange(e, index, item)}
                                                        />
                                                    </Cell>
                                                    <Cell style={{ textAlign: "left" }} className="pdf-table">
                                                        <TextField
                                                            size='small'
                                                            defaultValue={item?.typing || ""}
                                                            onChange={(e) => handleTypingChange(e, index, item)}
                                                        />
                                                    </Cell>



                                                </Row>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Grid item xs={12} >
                                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mb: 2, mt: 3 }}>Rejection Costings (Out) : </Typography>
                            </Grid>
                            <TableContainer
                                component={Paper}
                                sx={{
                                    maxHeight: "calc(100vh - 200px)",
                                    backgroundColor: "transparent",
                                    boxShadow: "none !important",
                                    borderRadius: "0px !important",
                                }}
                            >
                                <Table stickyHeader sx={{ minWidth: 500 }}>
                                    <TableHead>
                                        <Row>
                                            {tableHead1.map((cell, index) => (
                                                <Cell
                                                    style={{
                                                        textAlign:
                                                            cell?.name == "SR No."
                                                                ? "center"
                                                                : "left",
                                                        paddingRight:
                                                            cell?.name == "SR No." ? "15px" : "50px",
                                                    }}
                                                    className="pdf-table"
                                                    key={index}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "flex-end",
                                                        }}
                                                    >
                                                        {cell?.name}
                                                    </Box>
                                                </Cell>
                                            ))}
                                        </Row>
                                    </TableHead>
                                    <TableBody>
                                        {statuses2?.map((item, index) => {
                                            console.log(item?.statuses);
                                            let sorteddata = item?.statuses?.sort(
                                                (a, b) => a.id - b.id
                                            );
                                            console.log(sorteddata);

                                            return (
                                                <Row
                                                    key={index}
                                                    sx={{
                                                        border: "1px solid #EEEEEE !important",
                                                    }}
                                                >
                                                    <Cell
                                                        style={{ textAlign: "left" }}
                                                        className="pdf-table"
                                                    >
                                                        {item?.name}
                                                    </Cell>
                                                    <Cell style={{ textAlign: "left" }} className="pdf-table">
                                                        <TextField
                                                            size='small'
                                                            defaultValue={item?.rejection || ""}
                                                            onChange={(e) => handleRejectionChange2(e, index, item)}
                                                        />
                                                    </Cell>
                                                    <Cell style={{ textAlign: "left" }} className="pdf-table">
                                                        <TextField
                                                            size='small'
                                                            defaultValue={item?.typing || ""}
                                                            onChange={(e) => handleTypingChange2(e, index, item)}
                                                        />
                                                    </Cell>



                                                </Row>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                    </Box>
                </Box>

            </Box>
        </div>
    )
}

export default CostSetup
