import React, { useRef } from "react";
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
import { FontFamily, VccIcon } from "assets";
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
import PersonIcon from '@mui/icons-material/Person';
import moment from "moment";
import { useNavigate } from "react-router-dom";
import SystemServices from "services/System";
import SimpleDialog from "components/Dialog/SimpleDialog";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { handleExportWithComponent } from "utils";
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

function FinalDestination() {
    const [selectedManifest, setselectedManifest] = useState(null);
    const [manifestOptions, setmanifestOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const classes = useStyles();

    const contentRef = useRef();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm();

    const tableHead = [
        "Sr.",
        "Name",
        "Country Name",


    ];

    const [loader, setLoader] = useState(false);

    // *For Dialog Box
    const [confirmationDialog, setConfirmationDialog] = useState(false);

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    const [createDialog, setCreateDialog] = useState(false)
    const [countryID, setCountryID] = useState()

    // *For Filters
    const [filters, setFilters] = useState({});
    const [selectedValue, setSelectedValue] = useState("option1"); // State to manage the selected radio button value

    const handleRadioChange = (value) => {
        setSelectedValue(value);
    };
    // *For Auction House
    const [auctionHouses, setAuctionHouses] = useState();
    const [selectedAuctionHouses, setSelectedAuctionHouses] = useState("");

    const [countries, setCountries] = useState([])
    const [selectedCountry, setSelectedCountry] = useState(null)

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [ExportDatas, setExportDatas] = useState();
    const [destinationLoading, setDestinationLoading] = useState(false)

    // *For Issue Vcc
    const createFinalDestination = async (formData) => {

        setDestinationLoading(true)
        try {
            let obj = {
                name: getValues('name'),
                country_id: selectedCountry?.id

            }

            const { message } = await SystemServices.createFinalDestination(obj)
            SuccessToaster(message)
            getFinalDestinations()
            setCreateDialog(false)
            // window.location.reload()
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setDestinationLoading(false)

        }
    }
    // *For Clients
    const getCountryDropdown = async () => {
        try {
            const { data } = await ExportServices.getCountryDropdown();

            setCountries(data?.countries)
        } catch (error) {
            ErrorToaster(error);
        }
    };
    const generatePDF = async () => {
        const doc = new jsPDF({
            format: 'a4',
            unit: 'px',
        });
        doc.html(contentRef.current, {
            async callback(doc) {
                await doc.save('document');
            },
        });
    };

    // *For Export Vechicles
    const getFinalDestinations = async (page, limit, filter) => {
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
            const { data } = await SystemServices.getFinalDestinations(params);
            setExportDatas(data?.destinations);

        } catch (error) {
            ErrorToaster(error);
        }
    };

    const getManifest = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 15,
                search: search,
            };
            const { data } = await ExportServices.getManifest(params);

            //Custom Filter

            if (!search) {
                const resultArray = data?.filter?.vins.map((item) => {
                    return { id: item, name: item };
                });
                setmanifestOptions(resultArray);
            } else {
                const filteredResults = data?.filter?.vins.filter((item) => item.includes(search));

                const resultArray = filteredResults.map((item) => {
                    return { id: item, name: item };
                });

                setmanifestOptions(resultArray);
            }

        } catch (error) {
            ErrorToaster(error);
        }
    };
    // *For Handle Filter
    const handleFilter = (data) => {
        getFinalDestinations(1, "", data);
    };

    const UpdateDamage = async (formData) => {
        setLoading(true);
        try {
            let obj = {};
            const { message } = await ExportServices.UpdateManifest(obj);
            SuccessToaster(message);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoading(false);
        }
    };

    const downloadExcel = () => {
        const headers = tableHead;
        const rows = ExportDatas?.map((item) => [
            item?.id ?? "-",
            item?.name ?? "-",
            item?.country?.name ?? "-"
        ])

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const buf = XLSX.write(wb, {
            bookType: "xlsx",
            type: "array",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(new Blob([buf]), "data.xlsx");
    };

    useEffect(() => {
        setPermissions(true);
        getManifest();
        getFinalDestinations()
        getCountryDropdown()
    }, []);

    return (
        <Box component={"form"} >

            <SimpleDialog open={createDialog} onClose={() => setCreateDialog(false)} title={'Create Destination'}>
                <Box component="form" onSubmit={handleSubmit(createFinalDestination)} >
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>

                            <InputField
                                size={'small'}
                                label={'Name'}
                                placeholder={'Name'}
                                error={errors?.name?.message}
                                register={register('name', {
                                    required: 'Please Enter Name'
                                })}
                            />

                        </Grid>
                        <Grid item xs={12} sm={12}>

                            <SelectField
                                size="small"
                                label={"Country"}
                                options={countries}
                                selected={selectedCountry}
                                onSelect={(value) => setSelectedCountry(value)}
                                error={errors?.country?.message}
                                register={register("country", {
                                    required: "Please select Country.",
                                })}
                            />

                        </Grid>


                        <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'center' }}>
                            <PrimaryButton
                                title="Submit"
                                type='submit'
                                loading={destinationLoading}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>

            <Grid container sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, alignItems: "center" }} ref={contentRef}>
                <Grid item xs={3}>
                    <Typography
                        variant="h5"
                        sx={{
                            color: Colors.charcoalGrey,
                            fontFamily: FontFamily.NunitoRegular,
                            textAlign: "center",
                            mr: 2
                        }}
                    >
                        Final Destination
                    </Typography>
                </Grid>
                <Grid item xs={9}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "20px",
                            mr: 8,
                        }}
                    >

                        {ExportDatas?.length > 0 && (
                            <Box sx={{
                                textAlign: "right", p: 4, display: "flex", gap: 2

                            }}>
                                <PrimaryButton
                                    title="Download PDF"
                                    type="button"
                                    style={{ backgroundColor: Colors.bluishCyan }}
                                    onClick={() => handleExportWithComponent(contentRef)}
                                />
                                <PrimaryButton
                                    title={"Download Excel"}
                                    onClick={() => downloadExcel()}
                                />
                            </Box>
                        )}
                        <PrimaryButton
                            title="Add"
                            type="button"
                            buttonStyle={{
                                justifyContent: "space-evenly",
                                path: { fill: Colors.white },
                            }}
                            startIcon={<VccIcon />}
                            onClick={() => setCreateDialog(true)}
                        />
                    </Box>
                </Grid>
            </Grid>

            {/* <Grid
				container
				xs={10}
				sx={{

					borderRadius: "5px",


					m: 2,
					mt: 0
				}}
				spacing={2}
			>
				<Grid item xs={12} md={3}>
					<InputField
						size={'small'}
						label={'Search'}
						placeholder={'Search'}
						register={register('search', {
							onChange: (e) => handleFilter({ search: e.target.value })
						})}
					/>
				</Grid>
				<Grid sm={12} md={3} item>
					{" "}
					<SelectField
						size={'small'}
						searchable={true}
						label={"VIN"}
						options={manifestOptions}
						selected={selectedManifest}
						onSelect={(value) => {
							setselectedManifest(value);
							console.log(value);
							handleFilter({ filter: value?.id });
						}}
						onSearch={(v) => getManifest(v)}
						// error={errors?.auctionHouses?.message}
						error={errors?.VIN?.message}
						register={register("VIN", {
							required: "Please select VIN.",
						})}
					/>
				</Grid>
			</Grid> */}

            <Box sx={{ m: 4, mb: 2 }}>
                {/* ========== Confirmation Dialog ========== */}
                <ConfirmationDialog
                    open={confirmationDialog}
                    onClose={() => setConfirmationDialog(false)}
                    message={"Are you sure you want to delete this?"}
                // action={() => deleteBuyerId()}
                />

                {ExportDatas ? (
                    <Fragment>
                        <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                            fileName="Final Destination"
                        >
                            <Box className='pdf-show' sx={{ display: 'none' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                        Final Destination

                                    </Typography>
                                    <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                                </Box>
                            </Box>
                            {/* ========== Table ========== */}
                            <TableContainer
                                component={Paper}
                                sx={{
                                    boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                    borderRadius: 2,
                                    maxHeight: "calc(100vh - 330px)",
                                }}
                                className="table-box"
                            >
                                <Table stickyHeader sx={{ minWidth: 500 }}>
                                    <TableHead>
                                        <TableRow>
                                            {tableHead.map((item, index) => (
                                                <Cell className="pdf-table" key={index}>{item}</Cell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {!loader ? (
                                            ExportDatas?.length > 0 ? (
                                                <Fragment>
                                                    {ExportDatas.map((item, index) => (
                                                        <Row
                                                            key={index}
                                                            sx={{
                                                                bgcolor: index % 2 !== 0 && "#EFF8E7",
                                                            }}
                                                        >
                                                            <Cell className="pdf-table">{item?.id ?? "-"}</Cell>
                                                            <Cell className="pdf-table">

                                                                {item?.name ?? "-"}
                                                            </Cell>
                                                            <Cell className="pdf-table">

                                                                {item?.country?.name ?? "-"}
                                                            </Cell>


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
                        </PDFExport>

                        {/* ========== Pagination ========== */}
                        {/* <Pagination
							currentPage={currentPage}
							pageSize={pageLimit}
							onPageSizeChange={(size) => getFinalDestinations(1, size.target.value)}
							tableCount={ExportDatas?.length}
							totalCount={totalCount}
							onPageChange={(page) => getFinalDestinations(page, "")}
						/> */}
                    </Fragment>
                ) : (
                    ""
                )}
            </Box>
        </Box>
    );
}
export default FinalDestination;
