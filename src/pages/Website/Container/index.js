import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, CardMedia, CircularProgress, Container, Grid, Typography } from '@mui/material';
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
import ExportServices from 'services/Export';
import CurrencyServices from 'services/Currency';
import { useReactToPrint } from 'react-to-print';
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

function ExportPaymentReceiptPreview() {

    const { id } = useParams();
    const contentRef = useRef(null);
    const classes = useStyle();

    const [loader, setLoader] = useState(true);

    // *For Payment Receipt Detail
    const [paymentReceiptDetail, setPaymentReceiptDetail] = useState();
    // *For Currencies
    const [currencyExchangeRate, setCurrencyExchangeRate] = useState();


    // *For Get Payment Receipt Detail
    const getPaymentDetails = async () => {
        setLoader(true)
        try {
            let params = {
                payment_id: atob(id).split('-')[1]
            }
            const { data } = await ExportServices.getExportContainerPaymentPreview(params)
            console.log(data?.payment?.details);
            setPaymentReceiptDetail(data?.payment)
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setLoader(false)
        }
    }

    const handlePrint = useReactToPrint({

        content: () => contentRef.current,
        documentTitle: 'receipt',
    });


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

    useEffect(() => {
        if (id) {

            getPaymentDetails()
        }
        getCurrencies()
    }, [id]);


    useEffect(() => {
        if (!loader) {
            let Url = window.location.href
            console.log(Url);
            if (Url.includes('mobile')) {
                handlePrint()
            }
        }

    }, [loader])

    return (
        <Container>
            {!loader && (
                <Box sx={{ textAlign: "right", p: 4 }}>
                    <PrimaryButton
                        title="Download Receipt"
                        type="button"
                        style={{ backgroundColor: Colors.bluishCyan }}
                        onClick={() => handleExportWithComponent(contentRef)}
                    />
                </Box>
            )}

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
                    <PDFExport
                        ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName="Payment Voucher"
                    >
                        <Box>
                            <Grid container spacing={0}>
                                <Grid item md={3.5}>
                                    <Box
                                        component={"img"}
                                        src={Images.logo}
                                        sx={{ height: "140px", m: 2, my: 3 }}
                                    />
                                </Grid>
                                <Grid item md={8.5}>
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
                                        <Grid item md={4}>
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
                                        <Grid item md={6}>
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
                                        <Grid item md={4}>
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
                                        <Grid item md={6}>
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
                                    RECEIPT
                                </Typography>
                            </Box>

                            <Grid container spacing={0} justifyContent={"space-between"}>
                                <Grid item md={12}>
                                    <Box className={classes.headingBg} sx={{ bgcolor: Colors.primary }}>
                                        <Typography variant="h4" className={classes.heading}>
                                            PAYMENT
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mr: 3, mx: 2 }}>
                                        {paymentReceiptDetail?.details?.length > 0 ? (

                                            <Grid
                                                container
                                                spacing={0}
                                                columns={12}
                                                justifyContent={"flex-end"}
                                            >

                                                <Grid item md={2}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{ fontFamily: FontFamily.NunitoRegular }}
                                                    >
                                                        Booking ID
                                                    </Typography>
                                                </Grid>


                                                <Grid item md={2}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{ fontFamily: FontFamily.NunitoRegular }}
                                                    >
                                                        No of Containers
                                                    </Typography>
                                                </Grid>       <Grid item md={2}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{ fontFamily: FontFamily.NunitoRegular }}
                                                    >
                                                        Pickup from
                                                    </Typography>
                                                </Grid>

                                                <Grid item md={2}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{ fontFamily: FontFamily.NunitoRegular }}
                                                    >
                                                        Paid on
                                                    </Typography>
                                                </Grid>

                                                <Grid item md={2}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            textAlign: "center",
                                                            fontFamily: FontFamily.NunitoRegular,
                                                        }}
                                                    >
                                                        USD
                                                    </Typography>
                                                </Grid>
                                                <Grid item md={2}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            textAlign: "center",
                                                            fontFamily: FontFamily.NunitoRegular,
                                                        }}
                                                    >
                                                        AED
                                                    </Typography>
                                                </Grid>
                                                {paymentReceiptDetail?.details?.map((item, index) => (
                                                    <Fragment key={index}>
                                                        <Grid item md={2} className={classes.tableCell}>
                                                            <Typography
                                                                variant="body2"
                                                                className={classes.text}
                                                            >
                                                                EV-{item?.id ?? "-"}
                                                            </Typography>
                                                        </Grid>





                                                        <Grid item md={2} className={classes.tableCell}>
                                                            <Typography
                                                                variant="body2"
                                                                className={classes.text}
                                                            >
                                                                {paymentReceiptDetail?.details?.length}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item md={2} className={classes.tableCell}>
                                                            <Typography
                                                                variant="body2"
                                                                className={classes.text}
                                                            >
                                                                {item?.container?.pickup_from}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item md={2} className={classes.tableCell}>
                                                            <Typography
                                                                variant="body2"
                                                                className={classes.text}
                                                            >
                                                                {paymentReceiptDetail?.created_at
                                                                    ? moment(
                                                                        paymentReceiptDetail?.created_at
                                                                    ).format("DD-MMM-YY")
                                                                    : "-"}
                                                            </Typography>
                                                        </Grid>

                                                        <Grid item md={2} className={classes.tableCell} sx={{ textAlign: 'center' }}>
                                                            <Typography
                                                                variant="body2"
                                                                className={classes.text}
                                                            >
                                                                {parseFloat(item?.amount)?.toFixed(2)}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item md={2} className={classes.tableCell} sx={{ textAlign: 'center' }}>
                                                            <Typography
                                                                variant="body2"
                                                                className={classes.text}
                                                            >
                                                                {parseFloat(parseFloat(item?.amount) * currencyExchangeRate).toFixed(
                                                                    2
                                                                )}
                                                            </Typography>
                                                        </Grid>
                                                    </Fragment>
                                                ))}
                                                <Grid item md={2} className={classes.tableCell} sx={{ textAlign: 'center' }}>
                                                    <Typography
                                                        variant="body1"
                                                        className={classes.text}
                                                        sx={{ fontWeight: 'bold !important' }}
                                                    >
                                                        {parseFloat(paymentReceiptDetail?.shipping_due)?.toFixed(
                                                            2
                                                        )}
                                                    </Typography>
                                                </Grid>
                                                <Grid item md={2} className={classes.tableCell} sx={{ textAlign: 'center' }} >
                                                    <Typography
                                                        variant="body1"
                                                        className={classes.text}
                                                        sx={{ fontWeight: 'bold !important' }}
                                                    >
                                                        {parseFloat(parseFloat(paymentReceiptDetail?.shipping_due) * currencyExchangeRate)?.toFixed(
                                                            2
                                                        )}
                                                    </Typography>
                                                </Grid>

                                            </Grid>
                                        ) : (
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    textAlign: "center",
                                                    fontFamily: FontFamily.NunitoRegular,
                                                }}
                                            >
                                                No Payment History
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item md={5.5}>
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
                                            <b>Processed by</b> : {paymentReceiptDetail?.user?.name}{" "}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Grid container spacing={0} justifyContent={"space-between"}>
                                <Grid item md={9.5}>
                                    <Box sx={{ pl: 4, pr: 3, mb: 3, mt: 4 }}>
                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            PLEASE READ CAREFULLY BELOW TERM & CONDITION:
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            className={classes.text}
                                            sx={{ mb: 1 }}
                                        >
                                            1 - I've clearly informed and the make the understand all
                                            the vehicle information, amount, charges and rates.
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            className={classes.text}
                                            sx={{ mb: 1 }}
                                        >
                                            2 - Kindly pay the due amount within 3 business days from
                                            the purchase date to avoid the Late Payment and Storages
                                            that will be charged once vehicle arrived to final
                                            destination (Further, If there are some special
                                            annousment/memo ignore this and follow that)
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            className={classes.text}
                                            sx={{ mb: 1 }}
                                        >
                                            3 - If vehicle got relisted, the relist charges customer has
                                            to pay within 3 days otherwise 15% Penalty will applied
                                            after 3 days as issued memo on 9/Jun/2022.
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            className={classes.text}
                                            sx={{ mb: 1 }}
                                        >
                                            4 - Galaxy Customer care department will inform you about
                                            the latest updates about rates and charges through WhatsApp
                                            and emails.
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item md={2}>
                                    <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
                                        <QRCodeCanvas
                                            value={
                                                window.location.origin +
                                                `/container-receipt-preview/${btoa(
                                                    "paymentreceipt-" + id
                                                )}`
                                            }
                                        />
                                    </Box>
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
                    </PDFExport>
                ) : (
                    <Box sx={{ textAlign: "center", py: 3 }}>
                        <CircularProgress />
                    </Box>
                )}
            </Box>
        </Container>
    );
}

export default ExportPaymentReceiptPreview;