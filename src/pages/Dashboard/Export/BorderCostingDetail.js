import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    CircularProgress,
    Container,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    tableCellClasses,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster } from "components/Toaster";
import styled from "@emotion/styled";
import { GeneratePDF, handleExportWithComponent } from "utils";
import moment from "moment";
import { QRCodeCanvas } from "qrcode.react";
import ClientServices from "services/Client";
import { useReactToPrint } from 'react-to-print';
import ExportServices from "services/Export";
import { PDFExport } from "@progress/kendo-react-pdf";

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
    border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        fontSize: 14,
        fontFamily: FontFamily.NunitoRegular,
        border: 0,
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

function BorderCostingDetail() {
    const { id } = useParams();
    const contentRef = useRef(null);

    const [loader, setLoader] = useState(false);

    // *For Vehicle TT
    const [ttDetail, setTtDetail] = useState();
    const [otherDetails, setOtherDetails] = useState()
    const [costingDetail, setCostingDetail] = useState([])
    const [totalCost, setTotalCost] = useState(0)
    const [totalCostAed, setTotalCostAed] = useState(0)

    const handlePrint = useReactToPrint({
        content: () => contentRef.current,
        documentTitle: 'Shipping-Remittance',
    });

    // *For Get TT Detail
    const getBorderCostingDetail = async () => {
        setLoader(true);
        try {
            let params = {
                costing_id: id,
            };
            const { data } = await ExportServices.getBorderCostingDetail(params);
            console.log(data.costing?.vehicles);
            setCostingDetail(data?.costing?.vehicles)
            const totalCostUSD = data?.costing?.vehicles.reduce((total, item) => {
                const costUSD = parseFloat(item?.cost_usd);
                return !isNaN(costUSD) ? total + costUSD : total;
            }, 0);
            const totalCostAed = data?.costing?.vehicles.reduce((total, item) => {
                const costAed = parseFloat(item?.cost_aed);
                return !isNaN(costAed) ? total + costAed : total;
            }, 0);
            setTotalCostAed(totalCostAed)

            console.log(totalCostUSD);
            setTotalCost(totalCostUSD)


        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        if (id) {
            getBorderCostingDetail();
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
                    <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName="Border Costing Detail">
                        <Box sx={{ p: 5 }}>
                            <Grid container spacing={2} alignItems="flex-start">
                                <Grid item xs={12} sm={12}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: Colors.charcoalGrey,
                                            fontFamily: FontFamily.NunitoRegular,
                                            mb: 2,
                                        }}
                                    >
                                        Border Costing Detail
                                    </Typography>
                                </Grid>
                                <Grid
                                    container
                                    item
                                    xs={12}
                                    sm={12}
                                    alignItems={"center"}
                                    justifyContent={"space-between"}
                                >
                                    <Grid item sm={3.2}>
                                        <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
                                            <Typography variant="body1">Date:</Typography>
                                            <Typography variant="body1">
                                                {moment(ttDetail?.created_at).format("MM-DD-YYYY")}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item sm={5}>


                                    </Grid>
                                </Grid>
                                <Grid item sm={12}>
                                    <TableContainer
                                        component={Paper}
                                        sx={{
                                            boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <Cell>Date</Cell>
                                                    <Cell>Vin</Cell>
                                                    <Cell>Agent </Cell>
                                                    <Cell>Cost (USD)</Cell>
                                                    <Cell>Cost (AED)</Cell>

                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {console.log(costingDetail)}
                                                {costingDetail?.length > 0 && costingDetail?.map((item, index) => (
                                                    <Row >
                                                        <Cell >
                                                            {moment(item?.created_at).format("MM-DD-YYYY")}
                                                        </Cell>
                                                        <Cell >
                                                            {item?.vehicle?.vin ?? '-'}

                                                        </Cell>
                                                        <Cell >
                                                            {item?.agent?.name ?? '-'}
                                                        </Cell>
                                                        <Cell >
                                                            {parseFloat(item?.cost_usd).toFixed(2) ?? '-'}
                                                        </Cell>
                                                        <Cell >
                                                            {parseFloat(item?.cost_aed).toFixed(2) ?? '-'}
                                                        </Cell>



                                                    </Row>
                                                ))}


                                                <Row>
                                                    <Cell colspan={3}>
                                                        <b>Total</b>
                                                    </Cell>
                                                    <Cell sx={{ width: "180px" }}>
                                                        {parseFloat(totalCost).toFixed(
                                                            2
                                                        )}
                                                    </Cell>
                                                    <Cell sx={{ width: "130px" }}>
                                                        {parseFloat(totalCostAed).toFixed(
                                                            2
                                                        )}
                                                    </Cell>
                                                </Row>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>


                                <Grid item xs={12} sm={6}>

                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box
                                        sx={{
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "flex-end",
                                            mr: 0,
                                        }}
                                    >
                                        <QRCodeCanvas
                                            value={
                                                window.location.origin +
                                                `/vehicle-tt-preview/${btoa("tt-" + id)}`
                                            }
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
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

export default BorderCostingDetail;
