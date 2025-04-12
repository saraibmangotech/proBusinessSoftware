import React from 'react'
import {
    Box, CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, InputLabel,
    FormControl,
    Checkbox,
    Select,
    MenuItem,
    ListItemText,
    Tooltip,
    CardMedia
} from '@mui/material';
import { Images } from 'assets';
import InputField from 'components/Input';
import Colors from 'assets/Style/Colors';
import { useForm } from 'react-hook-form';
import moment from 'moment';

const StatementHeader = ({ data }) => {

    const { register } = useForm();
    console.log(data, 'asasas');
    return (
        <div>
            <Grid container spacing={0} justifyContent={"space-between"}>
                <Grid item xs={3} sm={3} md={3}>
                    <Box
                        component={"img"}
                        src={Images.whiteLogo}
                        sx={{ height: "45px", m: 1 }}
                    />
                </Grid>
                <Grid item xs={8.5} sm={8.5} md={8.5} >
                    <CardMedia image={Images.invoiceHeader} sx={{ height: '60px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography
                            variant="h3"
                            sx={{ py: 3, textAlign: "center", color: Colors.white, fontSize: '20px' }}
                        >
                            Galaxy Used Cars Tr. LLC
                        </Typography>
                    </CardMedia>
                    <Grid
                        container
                        spacing={1.5}
                        alignItems={"center"}
                        justifyContent={"space-evenly"}
                    >

                    </Grid>
                </Grid>
            </Grid>
            <Box sx={{ m: 4, mb: 2, }}>
                <Grid container spacing={2}>
                    <Grid item xs={2} sm={2} sx={{ display: 'flex', justifyContent: 'space-around', fontSize: '7px' }} >
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>Customer Name</Box>
                        <Box sx={{ width: '50%', borderBottom: "1px solid black", textAlign: 'center' }}>{data?.customer_name}</Box>
                    </Grid>
                    <Grid item xs={2} sm={2} sx={{ display: 'flex', justifyContent: 'space-around', fontSize: '7px' }} >
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>Customer ID</Box>
                        <Box sx={{ width: '50%', borderBottom: "1px solid black", textAlign: 'center' }}>{data?.customer_id}</Box>
                    </Grid>
                    <Grid item xs={2} sm={2} sx={{ display: 'flex', justifyContent: 'space-around', fontSize: '7px' }} >
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>From</Box>
                        <Box sx={{ width: '50%', borderBottom: "1px solid black", textAlign: 'center' }}>{data?.from_date
                            ? moment(data?.from_date).format(
                                "MM-DD-YYYY"
                            )
                            : "-"}</Box>
                    </Grid>
                    <Grid item xs={2} sm={2} sx={{ display: 'flex', justifyContent: 'space-around', fontSize: '7px' }} >
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>To</Box>
                        <Box sx={{ width: '50%', borderBottom: "1px solid black", textAlign: 'center' }}>{data?.to_date
                            ? moment(data?.to_date).format(
                                "MM-DD-YYYY"
                            )
                            : "-"}</Box>
                    </Grid>
                    <Grid item xs={2} sm={2} sx={{ display: 'flex', justifyContent: 'space-around', fontSize: '7px' }} >
                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>Date & Time</Box>
                        <Box sx={{ width: '50%', borderBottom: "1px solid black", textAlign: 'center' }}>{data?.current_date
                            ? moment(data?.current_date).format(
                                "MM-DD-YYYY"
                            )
                            : "-"}</Box>
                    </Grid>

                </Grid>
            </Box>
        </div>
    )
}

export default StatementHeader
