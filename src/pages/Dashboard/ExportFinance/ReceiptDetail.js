import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Grid, CardMedia, Typography, Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import Colors from 'assets/Style/Colors';
import { ErrorToaster } from 'components/Toaster';
import { PrimaryButton } from 'components/Buttons';
import { GeneratePDF, handleExportWithComponent } from 'utils';
import VehiclePaymentServices from 'services/VehiclePayment';
import { FontFamily, Images, InvoiceGlobal, InvoiceLocation, InvoiceMail, InvoicePhone } from 'assets';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import { QRCodeCanvas } from 'qrcode.react';
import CurrencyServices from 'services/Currency';
import ExportFinanceServices from 'services/ExportFinance';
import { PDFExport } from '@progress/kendo-react-pdf';

const useStyle = makeStyles({
    headingBg: {
        margin: '32px 0px',
        padding: '12px 0px',
        textAlign: 'center',
    },
    heading: {
        color: Colors.white,
        textTransform: 'uppercase',
        fontWeight: 300,
        fontFamily: FontFamily.NunitoRegular
    },
    text: {
        color: Colors.smokeyGrey,
        fontWeight: 300,
        fontFamily: FontFamily.NunitoRegular
    },
    tableCell: {
        backgroundColor: Colors.aliceBlue,
        border: '0.25px solid #D9D9D9',
        '& .MuiTypography-root': {
            padding: '4px 12px'
        }
    }
})

function ReceiptDetail() {

    const { id } = useParams();
    const contentRef = useRef(null);
    const classes = useStyle();

    const [loader, setLoader] = useState(true);

    // *For Invoice Detail
    const [receiptDetail, setReceiptDetail] = useState();



    // *For Get Invoice Detail
    const getReceiptDetail = async () => {

        setLoader(true)
        try {
            let params = {
                voucher_id: id
            }
            const { data } = await ExportFinanceServices.getReceiptDetail(params)
            setReceiptDetail(data.voucher)

        } catch (error) {
            ErrorToaster(error)
        } finally {
            setLoader(false)
        }
    }



    useEffect(() => {
        if (id) {

            getReceiptDetail()
        }
    }, [id]);

    return (
        <Container>
            {!loader && (
                <Box sx={{ textAlign: "right", p: 4 }}>
                    <PrimaryButton
                        title="Download PDF"
                        type="button"
                        style={{ backgroundColor: Colors.bluishCyan }}
                        onClick={() => handleExportWithComponent(contentRef)}
                    />
                </Box>
            )}
            <PDFExport ref={contentRef}
                fileName="Receipt Voucher"
            >
                <Box
                    sx={{
                        width: "1000px",
                        mx: 4,
                        my: 2,
                        bgcolor: Colors.white,
                        boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                    }}
                >
                    {!loader ? (
                        <Box >
                            <Grid container spacing={0}>
                                <Grid item xs={3.5} sm={3.5} md={3.5}>
                                    <Box
                                        component={"img"}
                                        src={Images.logo}
                                        sx={{ height: "120px", m: 2, my: 3 }}
                                    />
                                </Grid>
                                <Grid item xs={8.5} sm={8.5} md={8.5}>
                                    <CardMedia image={Images.invoiceHeader} sx={{ mb: 2 }}>
                                        <Typography
                                            variant="h3"
                                            sx={{ py: 3, textAlign: "center", color: Colors.white }}
                                        >
                                            Galaxy World Wide Shipping
                                        </Typography>
                                    </CardMedia>
                                    <Grid
                                        container
                                        spacing={1.5}
                                        alignItems={"center"}
                                        justifyContent={"space-evenly"}
                                    >
                                        <Grid item xs={4} sm={4} md={4}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: "5px",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <InvoicePhone />
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: Colors.smokeyGrey,
                                                        fontFamily: FontFamily.NunitoRegular,
                                                    }}
                                                >
                                                    +971 6 510 2000
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={6}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: "5px",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <InvoiceMail />
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: Colors.smokeyGrey,
                                                        fontFamily: FontFamily.NunitoRegular,
                                                    }}
                                                >
                                                    info@galaxyshipping.com
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4} sm={4} md={4}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: "5px",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <InvoiceGlobal />
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: Colors.smokeyGrey,
                                                        fontFamily: FontFamily.NunitoRegular,
                                                    }}
                                                >
                                                    https://galaxyshipping.com
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={6}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: "5px",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <InvoiceLocation />
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: Colors.smokeyGrey,
                                                        fontFamily: FontFamily.NunitoRegular,
                                                    }}
                                                >
                                                    Ind Area#4 P.O Box 83126, Sharjah , UAE
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Box
                                sx={{
                                    my: 5,
                                    position: "relative",
                                    bgcolor: Colors.bluishCyan,
                                    width: 1,
                                    height: "12px",
                                }}
                            >
                                <Typography
                                    component={"span"}
                                    variant="h2"
                                    sx={{
                                        color: Colors.charcoalGrey,
                                        bgcolor: Colors.white,
                                        p: 2,
                                        letterSpacing: "3px",
                                        position: "absolute",
                                        right: "90px",
                                        top: "-40px",
                                    }}
                                >
                                    RECEIPT VOUCHER
                                </Typography>
                            </Box>
                            <Grid container spacing={0} justifyContent={"space-between"}>
                                <Grid item xs={5.5} sm={5.5} md={5.5}>

                                    <Box className={classes.headingBg} sx={{ bgcolor: Colors.primary }}>
                                        <Typography variant="h4" className={classes.heading}>
                                            Received Currency Details
                                        </Typography>
                                    </Box>
                                    <Box sx={{ ml: 3, mb: 8 }}>
                                        <Grid container spacing={0} justifyContent={"flex-end"}>



                                            <Grid
                                                item
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className={classes.tableCell}
                                            >
                                                <Typography variant="body1" className={classes.text} sx={{ textAlign: "right", fontWeight: 'bold !important' }}>
                                                    Currency
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className={classes.tableCell}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right", fontWeight: 'bold !important' }}
                                                >
                                                    FCY
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className={classes.tableCell}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right", fontWeight: 'bold !important' }}
                                                >
                                                    Ex.rate
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className={classes.tableCell}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right", fontWeight: 'bold !important' }}
                                                >
                                                    LCY
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className={classes.tableCell}
                                                sx={{ backgroundColor: 'white !important' }}
                                            >
                                                <Typography variant="body1" className={classes.text} sx={{ textAlign: "center" }}>
                                                    AED
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className={classes.tableCell}
                                                sx={{ backgroundColor: 'white !important' }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right" }}
                                                >
                                                    {isNaN(parseFloat(
                                                        receiptDetail?.aed_amount_fcy
                                                    )?.toFixed(2)) ? '0.00' : parseFloat(
                                                        receiptDetail?.aed_amount_fcy
                                                    )?.toFixed(2)}
                                                </Typography>
                                            </Grid>

                                            <Grid
                                                item
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className={classes.tableCell}
                                                sx={{ backgroundColor: 'white !important' }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right" }}
                                                >
                                                    {parseFloat(
                                                        1
                                                    )?.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className={classes.tableCell}
                                                sx={{ backgroundColor: 'white !important' }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right" }}
                                                >
                                                    {isNaN(parseFloat(
                                                        receiptDetail?.aed_amount_lcy
                                                    )?.toFixed(2)) ? '0.00' : parseFloat(
                                                        receiptDetail?.aed_amount_lcy
                                                    )?.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className={classes.tableCell}
                                                sx={{ backgroundColor: 'white !important' }}
                                            >
                                                <Typography variant="body1" className={classes.text} sx={{ textAlign: "center" }}>
                                                    USD
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className={classes.tableCell}
                                                sx={{ backgroundColor: 'white !important' }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right" }}
                                                >
                                                    {isNaN(parseFloat(
                                                        receiptDetail?.usd_amount_fcy
                                                    )?.toFixed(2)) ? '0.00' : parseFloat(
                                                        receiptDetail?.usd_amount_fcy
                                                    )?.toFixed(2)}
                                                </Typography>
                                            </Grid>

                                            <Grid
                                                item
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className={classes.tableCell}
                                                sx={{ backgroundColor: 'white !important' }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right" }}
                                                >
                                                    {parseFloat(

                                                        receiptDetail?.usd_amount_exrate

                                                    )?.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className={classes.tableCell}
                                                sx={{ backgroundColor: 'white !important' }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right" }}
                                                >
                                                    {parseFloat(
                                                        receiptDetail?.usd_amount_lcy
                                                    )?.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                                sm={6}
                                                md={6}
                                                className={classes.tableCell}
                                                sx={{ backgroundColor: 'white !important' }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "left", fontWeight: 'bold !important' }}
                                                >
                                                    Total in AED
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                                sm={6}
                                                md={6}
                                                className={classes.tableCell}
                                                sx={{ backgroundColor: 'white !important' }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right" }}
                                                >
                                                    {parseFloat(
                                                        receiptDetail?.aed_total
                                                    )?.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>


                                    <Box
                                        className={classes.headingBg}
                                        sx={{ bgcolor: Colors.bluishCyan }}
                                    >
                                        <Typography variant="h4" className={classes.heading}>
                                            Remarks
                                        </Typography>
                                    </Box>
                                    <Box sx={{ ml: 4, mr: 2 }}>
                                        <Typography variant="body1" className={classes.text}>
                                            {receiptDetail?.remarks
                                            }
                                        </Typography>
                                    </Box>
                                    <Box
                                        className={classes.headingBg}
                                        sx={{ pl: "32px !important", bgcolor: Colors.aliceBlue }}
                                    >
                                        <Typography
                                            variant="body1"
                                            className={classes.heading}
                                            sx={{
                                                textAlign: "left",
                                                color: `${Colors.charcoalGrey} !important`,
                                            }}
                                        >
                                            <b>Received by :</b>
                                            <Typography
                                                component={"span"}
                                                variant="body2"
                                                sx={{ textTransform: "none" }}
                                            >
                                                &nbsp; {receiptDetail?.creator?.name}
                                            </Typography>
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={5.5} sm={5.5} md={5.5}>
                                    <Box sx={{ mr: 3, mt: 0 }}>
                                        <Grid container spacing={0} justifyContent={"flex-end"}>
                                            <Grid
                                                item
                                                xs={6}
                                                sm={6}
                                                md={6}
                                                className={classes.tableCell}
                                            >
                                                <Typography variant="body1" className={classes.text}>
                                                    Payment Voucher #:
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                                sm={6}
                                                md={6}
                                                className={classes.tableCell}
                                            >
                                                <Typography variant="body1" className={classes.text}>
                                                    GRV-{receiptDetail?.id}
                                                </Typography>
                                            </Grid>



                                            <Grid
                                                item
                                                xs={6}
                                                sm={6}
                                                md={6}
                                                className={classes.tableCell}
                                            >
                                                <Typography variant="body1" className={classes.text}>
                                                    Creation on:
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                                sm={6}
                                                md={6}
                                                className={classes.tableCell}
                                            >
                                                <Typography variant="body1" className={classes.text}>
                                                    {moment(
                                                        receiptDetail?.invoice?.booking?.created_at
                                                    ).format("DD-MMM-YYYY hh:mm")}
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                                sm={6}
                                                md={6}
                                                className={classes.tableCell}
                                            >
                                                <Typography variant="body1" className={classes.text}>
                                                    Last Updated on:
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={6}
                                                sm={6}
                                                md={6}
                                                className={classes.tableCell}
                                            >
                                                <Typography variant="body1" className={classes.text}>
                                                    {moment(receiptDetail?.updated_at).format(
                                                        "DD-MMM-YYYY hh:mm"
                                                    )}
                                                </Typography>
                                            </Grid>



                                        </Grid>
                                    </Box>
                                    <Box className={classes.headingBg} sx={{ bgcolor: Colors.primary }}>
                                        <Typography variant="h4" className={classes.heading}>
                                            Amount Received
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mr: 3, mb: 8 }}>
                                        <Grid container spacing={0} justifyContent={"flex-end"}>



                                            <Grid
                                                item
                                                xs={4}
                                                sm={4}
                                                md={4}
                                                className={classes.tableCell}
                                            >
                                                <Typography variant="body1" className={classes.text} sx={{ textAlign: "right", fontWeight: 'bold !important' }}>
                                                    AED
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={4}
                                                sm={4}
                                                md={4}
                                                className={classes.tableCell}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right", fontWeight: 'bold !important' }}
                                                >
                                                    Rate
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={4}
                                                sm={4}
                                                md={4}
                                                className={classes.tableCell}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right", fontWeight: 'bold !important' }}
                                                >
                                                    USD
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={4}
                                                sm={4}
                                                md={4}
                                                className={classes.tableCell}
                                                sx={{ backgroundColor: 'white !important' }}
                                            >
                                                <Typography variant="body1" className={classes.text} sx={{ textAlign: "right" }}>
                                                    {parseFloat(
                                                        receiptDetail?.aed_total
                                                    )?.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={4}
                                                sm={4}
                                                md={4}
                                                className={classes.tableCell}
                                                sx={{ backgroundColor: 'white !important' }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right" }}
                                                >
                                                    {parseFloat(
                                                        receiptDetail?.usd_amount_exrate
                                                    )?.toFixed(2)}
                                                </Typography>
                                            </Grid>



                                            <Grid
                                                item
                                                xs={4}
                                                sm={4}
                                                md={4}
                                                className={classes.tableCell}
                                                sx={{ backgroundColor: 'white !important' }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    className={classes.text}
                                                    sx={{ textAlign: "right" }}
                                                >
                                                    {parseFloat(
                                                        receiptDetail?.usd_total
                                                    )?.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                    <Box sx={{ mr: 3, mb: 8 }}>
                                        <Grid container spacing={0} justifyContent={"flex-end"}>



                                            {receiptDetail?.bank && <>
                                                <Grid
                                                    item
                                                    xs={3}
                                                    sm={3}
                                                    md={3}
                                                    className={classes.tableCell}
                                                    sx={{ backgroundColor: 'white !important' }}
                                                >
                                                    <Typography variant="body1" className={classes.text} sx={{ textAlign: "right", fontWeight: 'bold !important' }}>
                                                        Bank Account
                                                    </Typography>
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={6}
                                                    sm={6}
                                                    md={6}
                                                    className={classes.tableCell}
                                                    sx={{ backgroundColor: 'white !important' }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        className={classes.text}
                                                        sx={{ textAlign: "right" }}
                                                    >
                                                        {
                                                            receiptDetail?.bank?.name
                                                        }
                                                    </Typography>
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={3}
                                                    sm={3}
                                                    md={3}
                                                    className={classes.tableCell}
                                                    sx={{ backgroundColor: 'white !important' }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        className={classes.text}
                                                        sx={{ textAlign: "right" }}
                                                    >
                                                        {receiptDetail?.usd_amount_fcy > 0 ? parseFloat(
                                                            receiptDetail?.usd_amount_fcy
                                                        )?.toFixed(2) : parseFloat(
                                                            receiptDetail?.aed_amount_fcy
                                                        )?.toFixed(2)}
                                                    </Typography>
                                                </Grid></>}

                                            {!receiptDetail?.bank && <>
                                                <Grid
                                                    item
                                                    xs={2.5}
                                                    sm={2.5}
                                                    md={2.5}
                                                    className={classes.tableCell}
                                                    sx={{ backgroundColor: 'white !important' }}
                                                >
                                                    <Typography variant="body1" className={classes.text} sx={{ textAlign: "right", fontWeight: 'bold !important' }}>
                                                        Cashier
                                                    </Typography>
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={7}
                                                    sm={7}
                                                    md={7}
                                                    className={classes.tableCell}
                                                    sx={{ backgroundColor: 'white !important' }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        className={classes.text}
                                                        sx={{ textAlign: "right" }}
                                                    >
                                                        {
                                                            receiptDetail?.cashier_aed?.name
                                                        }
                                                    </Typography>
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={2.5}
                                                    sm={2.5}
                                                    md={2.5}
                                                    className={classes.tableCell}
                                                    sx={{ backgroundColor: 'white !important' }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        className={classes.text}
                                                        sx={{ textAlign: "right" }}
                                                    >
                                                        {receiptDetail?.cashier_aed ? parseFloat(
                                                            receiptDetail?.aed_amount_lcy
                                                        )?.toFixed(2) : ''}
                                                    </Typography>
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={2.5}
                                                    sm={2.5}
                                                    md={2.5}
                                                    className={classes.tableCell}
                                                    sx={{ backgroundColor: 'white !important' }}
                                                >
                                                    <Typography variant="body1" className={classes.text} sx={{ textAlign: "right", fontWeight: 'bold !important' }}>
                                                        Accounts
                                                    </Typography>
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={7}
                                                    sm={7}
                                                    md={7}
                                                    className={classes.tableCell}
                                                    sx={{ backgroundColor: 'white !important' }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        className={classes.text}
                                                        sx={{ textAlign: "right" }}
                                                    >
                                                        {
                                                            receiptDetail?.cashier_usd?.name
                                                        }
                                                    </Typography>
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={2.5}
                                                    sm={2.5}
                                                    md={2.5}
                                                    className={classes.tableCell}
                                                    sx={{ backgroundColor: 'white !important' }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        className={classes.text}
                                                        sx={{ textAlign: "right" }}
                                                    >
                                                        {receiptDetail?.cashier_usd ? parseFloat(
                                                            receiptDetail?.usd_amount_fcy
                                                        )?.toFixed(2) : ''}
                                                    </Typography>
                                                </Grid>
                                            </>}
                                        </Grid>
                                    </Box>

                                    <Grid container spacing={0} justifyContent={"flex-end"}>


                                        <Box sx={{ height: "100%", display: "flex", alignItems: "center", m: 4 }} >
                                            <QRCodeCanvas
                                                value={
                                                    window.location.origin +
                                                    `/export-receipt-preview/${btoa("receipt-" + id)}`
                                                }
                                            />
                                        </Box>

                                    </Grid>
                                </Grid>
                            </Grid>

                            <Box sx={{ pl: 4, pr: 3, py: 1, bgcolor: Colors.primary }}>
                                <Typography
                                    variant="caption"
                                    sx={{ color: Colors.white, fontFamily: FontFamily.NunitoRegular }}
                                >
                                    Customer care Contact: Mohammed husni - +971523195682 (Arabic &
                                    English ) Ardamehr Shoev - +971545836028 (English ,Arabic, Tajik &
                                    Farsi)
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ color: Colors.white, fontFamily: FontFamily.NunitoRegular }}
                                >
                                    Ravin abdul kareem - +971528293801 (Kurdish , Arabic & English)
                                    Magsat Gylyjov - +97158666403 (Turken , Russian & English)
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: "center", py: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </Box>
            </PDFExport>
        </Container>
    );
}

export default ReceiptDetail;