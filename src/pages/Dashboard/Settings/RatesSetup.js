import styled from '@emotion/styled';
import { Box, Grid, InputAdornment, TextField, Typography } from '@mui/material'
import Colors from 'assets/Style/Colors';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input'
import CustomTextField from 'components/Input/CustomInput';
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { showPromiseToast } from 'components/NewToaster';
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

const RateSetup = () => {
    const [loading, setLoading] = useState(false)
    const dispatch=useDispatch()
    const [permissions, setPermissions] = useState([])
    const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm();
    const getData = async (formData) => {
        setLoading(true)
        console.log(formData);
        try {
            let params = {
                charges_type: 'rate'

            }

            const { data } = await SystemServices.getRates(params);
            console.log(data);
            let details = data?.charges
            setValue('1yearInsideRate', details?.one_year_inside )
            setValue('1yearOutsideRate', details?.one_year_outside)
            setValue('1yearRenewalRates', details?.one_year_renewal)
            setValue('2yearInsideRate', details?.two_year_inside)
            setValue('2yearOutsideRate', details?.two_year_outside)
            setValue('2yearRenewalRates', details?.two_year_renewal)
            setValue('monthlyVisaServiceCharges', details?.monthly_visa_service_below)
            setValue('monthlyVisaServiceChargesabove', details?.monthly_visa_service_above)
            setValue('vipMedical', details?.medical_extra)
            setValue('cancellationRates', details?.cancellation)
            setValue('rejectionCost', details?.rejection)
            setValue('extraTyping', details?.typing_fee)
            setValue('overstayCost', details?.overstay)
            setValue('absconderFee', details?.absconder_fee)
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
    const UpdateRate = async (formData) => {
        setLoading(true)
        console.log(formData);
        try {
            let obj = {
                charges_type: "rate",
                one_year_inside: Number(formData?.['1yearInsideRate']),
                one_year_outside: Number(formData?.['1yearOutsideRate']),
                one_year_renewal: Number(formData?.['1yearRenewalRates']),
                two_year_inside: Number(formData?.['2yearInsideRate']),
                two_year_outside: Number(formData?.['2yearOutsideRate']),
                two_year_renewal: Number(formData?.['2yearRenewalRates']),
                monthly_visa_service_below: Number(formData?.['monthlyVisaServiceCharges']),
                monthly_visa_service_above: Number(formData?.['monthlyVisaServiceChargesabove']),
                overstay: Number(formData?.['overstayCost']),
                medical_extra: Number(formData?.['vipMedical']),
                typing_fee: Number(formData?.['extraTyping']),
                cancellation: Number(formData?.['cancellationRates']),
                rejection: Number(formData?.['rejectionCost']),
                absconder_fee: Number(formData?.['absconderFee'])


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
                <Box component={'form'} onSubmit={handleSubmit(UpdateRate)}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
                    <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >RATE MANAGEMENT</Typography>
                    <Box sx={{ display: 'flex', gap: '10px' }}>
                        {permissions?.save && <PrimaryButton
                           bgcolor={'#001f3f'}
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

                        <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mb: 2, mt: 3 }}>Extra Costing : </Typography>

                        <Grid container sx={{ gap: '20px 25px' }}>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Monthly Visa Service Charges Below 2000 : '}  max={2000} StartLabel={'AED'} register={register("monthlyVisaServiceCharges", { required: "Enter Monthly Visa Service Charges" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Monthly Visa Service Charges Above 2000 : '} StartLabel={'AED'} register={register("monthlyVisaServiceChargesabove", { required: "Enter Monthly Visa Service Charges" })} />
                            </Grid>
                            <Grid item xs={5} >
                            <LabelCustomInput label={'VIP Medical  Charges : '} StartLabel={'AED'} register={register("vipMedical", { required: "Enter medical extra charges" })} />
                            </Grid>
                            
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Cancellation Rates : '} StartLabel={'AED'} register={register("cancellationRates", { required: "Enter cancellation rate" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Overstay Cost : '} StartLabel={'AED'} register={register("overstayCost", { required: "Enter year overstay rate" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Rejection Cost : '} StartLabel={'AED'} register={register("rejectionCost", { required: "Enter rejection cost" })} />
                            </Grid>
                            <Grid item xs={5} >
                                <LabelCustomInput label={'Absconder Fee : '} StartLabel={'AED'} register={register("absconderFee", { required: "Enter absconder fee" })} />
                            </Grid>


                        </Grid>
                    </Box>
                </Box>

            </Box>
        </div>
    )
}

export default RateSetup
